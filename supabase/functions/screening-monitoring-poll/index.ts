import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getProvider, providerErrorResponse } from "../_shared/screening/index.ts";
import { evaluateRiskAlerts, type MatchCounts } from "../_shared/screening/riskAlerts.ts";


const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  // Service-role only (scheduled job).
  const auth = req.headers.get("Authorization") ?? "";
  const token = auth.replace("Bearer ", "").trim();
  if (!token || token !== Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")) {
    return json({ error: "Unauthorized" }, 401);
  }

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const since = new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString().slice(0, 10);
  let changes;
  try {
    changes = await getProvider().retrieveMonitoringChanges(since);
  } catch (err) {
    return providerErrorResponse(err, corsHeaders);
  }

  let alerts = 0;
  for (const change of changes) {
    if (!change.provider_monitor_id) continue;
    const { data: ref } = await admin
      .from("provider_references")
      .select("entity_id, organisation_id")
      .eq("entity_kind", "monitor")
      .eq("provider_id", change.provider_monitor_id)
      .maybeSingle();
    if (!ref) continue;

    const { data: subject } = await admin
      .from("monitoring_subjects")
      .select("id, case_id, status")
      .eq("id", ref.entity_id)
      .maybeSingle();
    if (!subject || subject.status !== "active") continue;

    await admin.from("monitoring_alerts").insert({
      organisation_id: ref.organisation_id,
      monitoring_subject_id: subject.id,
      case_id: subject.case_id,
      change_type: change.change_type,
      change_description: change.change_description,
      details: change.details,
      status: "new",
      detected_at: change.detected_at,
    });
    alerts++;

    await admin
      .from("monitoring_subjects")
      .update({ last_checked_at: new Date().toISOString(), last_change_at: change.detected_at })
      .eq("id", subject.id);

    if (subject.case_id) {
      await admin
        .from("screening_cases")
        .update({ status: "monitoring_update_requires_review" })
        .eq("id", subject.case_id);
      await admin.from("screening_audit_events").insert({
        organisation_id: ref.organisation_id,
        case_id: subject.case_id,
        event_type: "monitoring_update",
        description: change.change_description,
        metadata: { change_type: change.change_type },
      });
    }
  }

  await admin
    .from("monitoring_subjects")
    .update({ last_checked_at: new Date().toISOString() })
    .eq("status", "active")
    .is("last_checked_at", null);

  return json({ ok: true, changes: changes.length, alerts });
});
