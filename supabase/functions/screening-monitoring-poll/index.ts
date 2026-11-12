import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getProvider, ProviderError, providerErrorResponse, type MonitoringChange } from "../_shared/screening/index.ts";
import { evaluateRiskAlerts, type MatchCounts } from "../_shared/screening/riskAlerts.ts";


const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  // Service-role (manual run) or shared cron secret (scheduled pg_cron job).
  const auth = req.headers.get("Authorization") ?? "";
  const token = auth.replace("Bearer ", "").trim();
  const cronSecret = req.headers.get("x-cron-secret") ?? "";
  const expectedCronSecret = Deno.env.get("SCREENING_CRON_SECRET") ?? "";
  const serviceOk = !!token && token === Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const cronOk = !!expectedCronSecret && !!cronSecret && cronSecret === expectedCronSecret;
  if (!serviceOk && !cronOk) {
    return json({ error: "Unauthorized" }, 401);
  }

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // The provider has no account-wide change feed: ask for yesterday's
  // differences on each of our own active monitored searches.
  const date = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const monitors = await loadActiveMonitors(admin);

  let provider;
  try {
    provider = getProvider();
  } catch (err) {
    const detail = err instanceof ProviderError ? err.detail : String(err);
    await notifyOperators(admin, date, monitors.length, monitors.length, [detail]);
    return providerErrorResponse(err, corsHeaders);
  }

  const changes: MonitoringChange[] = [];
  const checkedSubjectIds: string[] = [];
  const failures: string[] = [];
  const CONCURRENCY = 5;
  for (let i = 0; i < monitors.length; i += CONCURRENCY) {
    await Promise.all(
      monitors.slice(i, i + CONCURRENCY).map(async (m) => {
        try {
          const change = await provider.retrieveMonitorDifferences(m.provider_id, date);
          if (change) changes.push(change);
          checkedSubjectIds.push(m.subject_id);
        } catch (err) {
          const detail = err instanceof ProviderError ? err.detail : String(err);
          failures.push(detail);
          console.error("[screening] monitor check failed", m.provider_id, "|", detail);
        }
      }),
    );
  }

  if (failures.length) {
    await notifyOperators(admin, date, monitors.length, failures.length, failures);
  } else {
    await resolveOperatorNotice(admin);
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

      // Refresh match counts from the provider so stored risk levels and
      // threshold alerts reflect the new data (the poll itself only delivers
      // change notifications, not updated results).
      try {
        const latest = await provider.retrieveScreening(change.provider_monitor_id);
        const counts: MatchCounts = { sanctions: 0, pep_rca: 0, warnings: 0, adverse_media: 0 };
        for (const m of latest.matches) {
          for (const c of m.categories) counts[c] = (counts[c] ?? 0) + 1;
        }
        await admin
          .from("screening_cases")
          .update({
            sanctions_matches: counts.sanctions,
            pep_matches: counts.pep_rca,
            warning_matches: counts.warnings,
            adverse_media_matches: counts.adverse_media,
          })
          .eq("id", subject.case_id);

        let entityName = "Monitored entity";
        const { data: subjRow } = await admin
          .from("monitoring_subjects")
          .select("subject:screening_subjects(full_name)")
          .eq("id", subject.id)
          .maybeSingle();
        const subjName = (subjRow as { subject?: { full_name?: string } | null } | null)?.subject?.full_name;
        if (subjName) entityName = subjName;

        await evaluateRiskAlerts(admin, {
          organisationId: ref.organisation_id,
          monitoringSubjectId: subject.id,
          caseId: subject.case_id,
          entityName,
          counts,
        });
      } catch (err) {
        console.warn("Risk re-evaluation failed for monitor", change.provider_monitor_id, err);
      }
    }
  }


  for (let i = 0; i < checkedSubjectIds.length; i += 200) {
    await admin
      .from("monitoring_subjects")
      .update({ last_checked_at: new Date().toISOString() })
      .in("id", checkedSubjectIds.slice(i, i + 200));
  }

  const summary = { date, monitors: monitors.length, failed: failures.length, changes: changes.length, alerts };
  // Every check failed: report the run as failed so the scheduler records it.
  if (monitors.length > 0 && failures.length === monitors.length) {
    return json({ ok: false, error: "Monitoring check failed", ...summary }, 502);
  }
  return json({ ok: true, ...summary });
});

type Admin = ReturnType<typeof createClient>;

/** Active monitored entities with their provider search id. */
async function loadActiveMonitors(admin: Admin): Promise<Array<{ subject_id: string; provider_id: string }>> {
  const out: Array<{ subject_id: string; provider_id: string }> = [];
  const PAGE = 1000;
  for (let from = 0; ; from += PAGE) {
    const { data: subjects, error } = await admin
      .from("monitoring_subjects")
      .select("id")
      .eq("status", "active")
      .order("id")
      .range(from, from + PAGE - 1);
    if (error) throw error;
    const ids = (subjects ?? []).map((s: { id: string }) => s.id);
    if (ids.length) {
      const { data: refs, error: refErr } = await admin
        .from("provider_references")
        .select("entity_id, provider_id")
        .eq("entity_kind", "monitor")
        .in("entity_id", ids);
      if (refErr) throw refErr;
      for (const r of (refs ?? []) as Array<{ entity_id: string; provider_id: string }>) {
        if (r.provider_id) out.push({ subject_id: r.entity_id, provider_id: r.provider_id });
      }
    }
    if (ids.length < PAGE) break;
  }
  return out;
}

// One standing admin notification for the daily check (fixed id → deduped).
const NOTICE_EVENT = "screening_monitoring_failed";
const NOTICE_ENTITY_ID = "5c2ee7e0-0000-4000-8000-000000000001";

async function notifyOperators(admin: Admin, date: string, total: number, failed: number, details: string[]) {
  const reason = details.some((d) => d.startsWith("HTTP 403"))
    ? "The screening data provider account is not entitled to ongoing monitoring."
    : details.some((d) => d.startsWith("HTTP 404"))
      ? "The screening data provider could not find one or more monitored searches."
      : "The screening data provider returned errors.";
  try {
    await admin.rpc("admin_notify_upsert", {
      _category: "security",
      _event_type: NOTICE_EVENT,
      _entity_type: "scheduled_job",
      _entity_id: NOTICE_ENTITY_ID,
      _title: "Daily screening monitoring check failed",
      _message: `${failed} of ${total} monitored entities could not be checked for ${date}. ${reason}`,
      _priority: "critical",
      _nav_path: "/admin/screening-product",
      _action_url: "/admin/screening-product",
      _metadata: { date, total, failed, sample: details.slice(0, 3) },
    });
    await admin
      .from("admin_notifications")
      .update({ status: "open", resolved_at: null, resolution_note: null, created_at: new Date().toISOString() })
      .eq("event_type", NOTICE_EVENT)
      .eq("entity_id", NOTICE_ENTITY_ID);
  } catch (err) {
    console.error("[screening] could not raise admin notification", err);
  }
}

async function resolveOperatorNotice(admin: Admin) {
  await admin
    .from("admin_notifications")
    .update({ status: "resolved", resolved_at: new Date().toISOString(), resolution_note: "Next daily check succeeded" })
    .eq("event_type", NOTICE_EVENT)
    .eq("status", "open");
}
