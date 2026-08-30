import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getProvider, ProviderError, providerErrorResponse } from "../_shared/screening/index.ts";
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

  const since = new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString().slice(0, 10);
  let changes;
  try {
    changes = await getProvider().retrieveMonitoringChanges(since);
  } catch (err) {
    // A 403 here means the provider key is not entitled to the monitoring
    // updates feed. Log it loudly but report success so the daily cron job
    // doesn't record a permanent failure while the account is sorted out.
    if (err instanceof ProviderError && err.httpStatus === 403) {
      console.error("[screening] monitoring updates feed not enabled on provider account (HTTP 403)");
      return json({ ok: true, changes: 0, alerts: 0, warning: "provider_monitoring_unavailable" });
    }
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

      // Refresh match counts from the provider so stored risk levels and
      // threshold alerts reflect the new data (the poll itself only delivers
      // change notifications, not updated results).
      try {
        const latest = await getProvider().retrieveScreening(change.provider_monitor_id);
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


  await admin
    .from("monitoring_subjects")
    .update({ last_checked_at: new Date().toISOString() })
    .eq("status", "active")
    .is("last_checked_at", null);

  return json({ ok: true, changes: changes.length, alerts });
});
