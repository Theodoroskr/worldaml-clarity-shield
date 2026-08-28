import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getProvider } from "../_shared/screening/index.ts";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const DECISIONS = [
  "confirm_match",
  "keep_possible",
  "false_positive",
  "escalate",
  "add_to_monitoring",
  "reopen",
] as const;
type Decision = typeof DECISIONS[number];

const MATCH_STATUS: Record<Decision, string | null> = {
  confirm_match: "confirmed",
  keep_possible: "possible",
  false_positive: "false_positive",
  escalate: "escalated",
  add_to_monitoring: null,
  reopen: "review_required",
};

const PROVIDER_STATUS: Record<string, string> = {
  confirmed: "true_positive",
  possible: "potential_match",
  false_positive: "false_positive",
  escalated: "true_positive",
  review_required: "no_match",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return json({ error: "Unauthorized" }, 401);

  const userClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } },
  );
  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data: { user } } = await userClient.auth.getUser();
  if (!user) return json({ error: "Unauthorized" }, 401);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid request" }, 400);
  }

  const matchId = String(body.match_id ?? "");
  const decision = String(body.decision ?? "") as Decision;
  const rationale = String(body.rationale ?? "").trim();

  if (!matchId || !DECISIONS.includes(decision)) return json({ error: "Invalid request" }, 400);
  if (rationale.length < 10) {
    return json({ error: "A rationale of at least 10 characters is required" }, 400);
  }
  if (rationale.length > 4000) return json({ error: "Rationale is too long" }, 400);

  // Authorisation: the caller must be able to read the match under RLS.
  const { data: visible } = await userClient
    .from("screening_matches")
    .select("id, case_id, organisation_id, matched_name, status")
    .eq("id", matchId)
    .maybeSingle();
  if (!visible) return json({ error: "Not found" }, 404);

  // Four-eyes escalation is a paid add-on module.
  const { data: moduleActive } = await admin.rpc("screening_module_active", {
    _organisation_id: visible.organisation_id,
    _module: "four_eyes",
  });
  const fourEyes = moduleActive === true;

  // Senior role of the caller inside the organisation (used by the add-on).
  const { data: membership } = await admin
    .from("suite_org_members")
    .select("role")
    .eq("organization_id", visible.organisation_id)
    .eq("user_id", user.id)
    .maybeSingle();
  const isSenior = ["mlro", "compliance_officer", "admin"].includes(String(membership?.role ?? ""));

  let escalationAssignee: string | null = null;

  if (decision === "escalate") {
    if (!fourEyes) {
      return json({
        error:
          "Escalation & Four-Eyes Review is an optional add-on module. Activate it for your organisation to route matches to your MLRO.",
        code: "module_required",
        module: "four_eyes",
      }, 402);
    }
    const { data: reviewers } = await admin
      .from("suite_org_members")
      .select("user_id, role")
      .eq("organization_id", visible.organisation_id)
      .in("role", ["mlro", "compliance_officer", "admin"]);
    const requested = body.assign_to ? String(body.assign_to) : null;
    const list = reviewers ?? [];
    const rank = (r: string) => (r === "mlro" ? 1 : r === "compliance_officer" ? 2 : 3);
    const sorted = [...list].sort((a, b) => rank(String(a.role)) - rank(String(b.role)));
    escalationAssignee = requested && list.some((r) => r.user_id === requested)
      ? requested
      : (sorted[0]?.user_id ?? null);
  }

  // With the add-on active, only senior reviewers may close an escalated match.
  if (
    fourEyes && visible.status === "escalated" && decision !== "escalate" && !isSenior
  ) {
    return json({
      error: "Only an MLRO, compliance officer or organisation admin can resolve an escalated match.",
      code: "senior_review_required",
    }, 403);
  }

  const newStatus = MATCH_STATUS[decision];
  if (newStatus) {
    await admin
      .from("screening_matches")
      .update({ status: newStatus })
      .eq("id", matchId);
  }


  await admin.from("analyst_decisions").insert({
    organisation_id: visible.organisation_id,
    case_id: visible.case_id,
    match_id: matchId,
    decision,
    reason_code: String(body.reason_code ?? decision),
    reason_label: String(body.reason_label ?? decision.replace(/_/g, " ")),
    comment: rationale,
    decided_by: user.id,
  });


  await admin.from("screening_audit_events").insert({
    organisation_id: visible.organisation_id,
    case_id: visible.case_id,
    match_id: matchId,
    event_type: "analyst_decision",
    description: `${decision.replace(/_/g, " ")} recorded for ${visible.matched_name}`,
    metadata: { rationale_length: rationale.length },
    actor_id: user.id,
  });

  // Recompute case status from remaining matches.
  const { data: matches } = await admin
    .from("screening_matches")
    .select("status")
    .eq("case_id", visible.case_id);
  const statuses = (matches ?? []).map((m) => m.status as string);
  let caseStatus = "potential_matches_require_review";
  if (statuses.some((s) => s === "escalated")) caseStatus = "escalated";
  else if (statuses.some((s) => s === "confirmed")) caseStatus = "match_confirmed";
  else if (statuses.length && statuses.every((s) => s === "false_positive")) caseStatus = "false_positives_resolved";
  else if (statuses.some((s) => s === "review_in_progress" || s === "possible")) caseStatus = "review_in_progress";
  else if (!statuses.length) caseStatus = "no_potential_matches";

  const caseUpdate: Record<string, unknown> = { status: caseStatus };
  if (decision === "escalate") {
    caseUpdate.escalated_to = escalationAssignee;
    caseUpdate.escalated_by = user.id;
    caseUpdate.escalated_at = new Date().toISOString();
    caseUpdate.escalation_note = rationale;
    if (escalationAssignee) caseUpdate.assigned_to = escalationAssignee;
  } else if (caseStatus !== "escalated") {
    caseUpdate.escalated_to = null;
  }
  await admin.from("screening_cases").update(caseUpdate).eq("id", visible.case_id);


  // Best-effort provider feedback loop (never surfaced to the customer).
  if (newStatus) {
    try {
      const { data: searchRef } = await admin
        .from("screening_cases")
        .select("search_id")
        .eq("id", visible.case_id)
        .maybeSingle();
      const { data: providerSearch } = await admin
        .from("provider_references")
        .select("provider_id")
        .eq("entity_kind", "search")
        .eq("entity_id", searchRef?.search_id)
        .maybeSingle();
      const { data: providerMatch } = await admin
        .from("provider_references")
        .select("provider_id")
        .eq("entity_kind", "match")
        .eq("entity_id", matchId)
        .maybeSingle();
      if (providerSearch?.provider_id && providerMatch?.provider_id) {
        await getProvider().updateMatchDecision(
          providerSearch.provider_id,
          providerMatch.provider_id,
          PROVIDER_STATUS[newStatus] ?? "potential_match",
        );
      }
    } catch (_) {
      // provider sync is non-blocking
    }
  }

  return json({ ok: true, case_status: caseStatus, match_status: newStatus });
});
