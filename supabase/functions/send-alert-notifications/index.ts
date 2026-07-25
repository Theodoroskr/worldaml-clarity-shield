// Sends MLRO/Admin email notifications about Suite alerts.
// Modes:
//   { mode: "instant", alert_id }     -> one high/critical alert email (triggered by DB trigger via pg_net)
//   { mode: "weekly", organisation_id? } -> weekly digest per org (cron)
//
// Auth: requires header  x-alert-secret == ALERT_NOTIFICATIONS_SECRET

import { Resend } from "npm:resend";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-alert-secret",
};

const FROM_EMAIL = "WorldAML Suite <alerts@worldaml.com>";
const APP_URL = "https://worldaml.com/suite/alerts";

function esc(s: string): string {
  return String(s ?? "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
}

const sevColor: Record<string,string> = {
  critical: "#dc2626", high: "#ea580c", medium: "#d97706", low: "#64748b",
};

async function recipientsFor(admin: any, organisation_id: string): Promise<{ email: string; name?: string }[]> {
  const { data: members } = await admin
    .from("suite_org_members")
    .select("user_id, role")
    .eq("organization_id", organisation_id)
    .in("role", ["admin","mlro","compliance_officer"]);
  if (!members?.length) return [];
  const userIds = members.map((m: any) => m.user_id);
  const { data: profiles } = await admin
    .from("profiles").select("user_id, email, full_name").in("user_id", userIds);
  const out: { email: string; name?: string }[] = [];
  for (const p of profiles ?? []) {
    if (p.email) out.push({ email: p.email, name: p.full_name });
  }
  return out;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const expected = Deno.env.get("ALERT_NOTIFICATIONS_SECRET");
    const provided = req.headers.get("x-alert-secret") ?? "";
    if (!expected || provided !== expected) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) {
      return new Response(JSON.stringify({ skipped: true, reason: "no RESEND_API_KEY" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const resend = new Resend(resendKey);

    const body = await req.json().catch(() => ({}));
    const mode = body?.mode;

    // ---------------- INSTANT ----------------
    if (mode === "instant") {
      const alertId: string = body.alert_id;
      if (!alertId) return new Response(JSON.stringify({ error: "alert_id required" }), { status: 400, headers: corsHeaders });

      const { data: alert } = await admin.from("suite_alerts").select("*").eq("id", alertId).maybeSingle();
      if (!alert) return new Response(JSON.stringify({ error: "alert not found" }), { status: 404, headers: corsHeaders });

      // Dedup
      const { data: existing } = await admin.from("suite_notification_log")
        .select("id").eq("organisation_id", alert.organisation_id).eq("kind","instant").eq("reference_id", alertId).maybeSingle();
      if (existing) return new Response(JSON.stringify({ deduped: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

      const recipients = await recipientsFor(admin, alert.organisation_id);
      if (!recipients.length) return new Response(JSON.stringify({ skipped: true, reason: "no recipients" }), { headers: corsHeaders });

      let customerName = "";
      if (alert.customer_id) {
        const { data: c } = await admin.from("suite_customers").select("full_name").eq("id", alert.customer_id).maybeSingle();
        customerName = c?.full_name ?? "";
      }

      const html = `
        <div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;background:#fff;">
          <div style="background:#0f172a;padding:20px 28px;">
            <h1 style="color:#fff;margin:0;font-size:18px;">WorldAML Suite — New ${esc(alert.severity)} alert</h1>
          </div>
          <div style="padding:24px 28px;">
            <p style="margin:0 0 10px;color:#0f172a;font-size:15px;">
              <span style="display:inline-block;padding:3px 10px;border-radius:4px;background:${sevColor[alert.severity] ?? "#64748b"};color:#fff;font-size:11px;font-weight:700;text-transform:uppercase;">${esc(alert.severity)}</span>
              &nbsp;<span style="color:#64748b;font-size:12px;">${esc(alert.alert_type)}</span>
            </p>
            <h2 style="margin:6px 0 12px;color:#0f172a;font-size:17px;">${esc(alert.title)}</h2>
            ${alert.description ? `<p style="color:#334155;font-size:14px;line-height:1.55;margin:0 0 14px;">${esc(alert.description)}</p>` : ""}
            ${customerName ? `<p style="color:#475569;font-size:13px;margin:0 0 16px;"><strong>Customer:</strong> ${esc(customerName)}</p>` : ""}
            <a href="${APP_URL}" style="display:inline-block;background:#0d9488;color:#fff;text-decoration:none;padding:11px 22px;border-radius:6px;font-weight:600;font-size:14px;">Open alert →</a>
          </div>
          <div style="padding:14px 28px;border-top:1px solid #e5e7eb;color:#94a3b8;font-size:12px;">
            You receive this because you are an admin, MLRO, or compliance officer on this organisation.
          </div>
        </div>`;

      try {
        await resend.emails.send({
          from: FROM_EMAIL,
          to: recipients.map(r => r.email),
          subject: `[${alert.severity.toUpperCase()}] ${alert.title}`,
          html,
        });
      } catch (e) { console.error("resend send failed", e); }

      await admin.from("suite_notification_log").insert({
        organisation_id: alert.organisation_id,
        kind: "instant",
        reference_id: alertId,
        recipients: recipients.map(r => r.email),
        alert_ids: [alertId],
      });
      return new Response(JSON.stringify({ sent: recipients.length }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ---------------- WEEKLY ----------------
    if (mode === "weekly") {
      const since = new Date(Date.now() - 7 * 86400_000).toISOString();
      const weekKey = new Date().toISOString().slice(0,10);

      // organisations to process
      let orgIds: string[] = [];
      if (body.organisation_id) {
        orgIds = [body.organisation_id];
      } else {
        const { data: orgs } = await admin.from("suite_organizations").select("id");
        orgIds = (orgs ?? []).map((o: any) => o.id);
      }

      let sent = 0, skipped = 0;
      for (const orgId of orgIds) {
        const { data: dedup } = await admin.from("suite_notification_log")
          .select("id").eq("organisation_id", orgId).eq("kind","weekly").eq("reference_id", weekKey).maybeSingle();
        if (dedup) { skipped++; continue; }

        const { data: alerts } = await admin.from("suite_alerts")
          .select("id,severity,status,title,created_at").eq("organisation_id", orgId).gte("created_at", since)
          .order("created_at", { ascending: false });
        if (!alerts?.length) { skipped++; continue; }

        const recipients = await recipientsFor(admin, orgId);
        if (!recipients.length) { skipped++; continue; }

        const counts = { critical:0, high:0, medium:0, low:0, open:0, closed:0 };
        for (const a of alerts) {
          counts[a.severity as keyof typeof counts] = (counts[a.severity as keyof typeof counts] ?? 0) + 1;
          if (a.status === "closed") counts.closed++; else counts.open++;
        }

        const rows = alerts.slice(0, 25).map((a: any) => `
          <tr>
            <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;font-size:12px;color:#334155;">${esc(new Date(a.created_at).toLocaleDateString("en-GB"))}</td>
            <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;font-size:12px;"><span style="padding:2px 8px;border-radius:4px;background:${sevColor[a.severity] ?? "#64748b"};color:#fff;font-size:10px;font-weight:700;text-transform:uppercase;">${esc(a.severity)}</span></td>
            <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;font-size:12px;color:#0f172a;">${esc(a.title)}</td>
            <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;font-size:12px;color:#64748b;text-transform:capitalize;">${esc(a.status)}</td>
          </tr>`).join("");

        const html = `
          <div style="font-family:Arial,sans-serif;max-width:680px;margin:0 auto;background:#fff;">
            <div style="background:#0f172a;padding:20px 28px;">
              <h1 style="color:#fff;margin:0;font-size:18px;">WorldAML Suite — Weekly alert digest</h1>
              <p style="color:#94a3b8;margin:4px 0 0;font-size:12px;">Last 7 days · ${esc(new Date(since).toLocaleDateString("en-GB"))} → today</p>
            </div>
            <div style="padding:20px 28px;">
              <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
                <tr>
                  ${[["Critical",counts.critical,"#dc2626"],["High",counts.high,"#ea580c"],["Medium",counts.medium,"#d97706"],["Open",counts.open,"#0d9488"]]
                    .map(([l,v,c]) => `<td style="padding:10px;background:#f8fafc;border:1px solid #e5e7eb;border-radius:6px;text-align:center;width:25%;">
                      <div style="font-size:22px;font-weight:700;color:${c};">${v}</div>
                      <div style="font-size:11px;color:#64748b;text-transform:uppercase;margin-top:2px;">${l}</div></td>`).join("")}
                </tr>
              </table>
              <table style="width:100%;border-collapse:collapse;border:1px solid #e5e7eb;border-radius:6px;">
                <thead><tr style="background:#f1f5f9;">
                  <th style="padding:8px 10px;text-align:left;font-size:11px;color:#64748b;text-transform:uppercase;">Date</th>
                  <th style="padding:8px 10px;text-align:left;font-size:11px;color:#64748b;text-transform:uppercase;">Severity</th>
                  <th style="padding:8px 10px;text-align:left;font-size:11px;color:#64748b;text-transform:uppercase;">Title</th>
                  <th style="padding:8px 10px;text-align:left;font-size:11px;color:#64748b;text-transform:uppercase;">Status</th>
                </tr></thead>
                <tbody>${rows}</tbody>
              </table>
              ${alerts.length > 25 ? `<p style="color:#64748b;font-size:12px;margin:10px 0 0;">+${alerts.length - 25} more alerts this week.</p>` : ""}
              <p style="margin-top:20px;"><a href="${APP_URL}" style="display:inline-block;background:#0d9488;color:#fff;text-decoration:none;padding:11px 22px;border-radius:6px;font-weight:600;font-size:14px;">Review alerts →</a></p>
            </div>
            <div style="padding:14px 28px;border-top:1px solid #e5e7eb;color:#94a3b8;font-size:12px;">
              Digest sent to admins, MLROs, and compliance officers on this organisation.
            </div>
          </div>`;

        try {
          await resend.emails.send({
            from: FROM_EMAIL,
            to: recipients.map(r => r.email),
            subject: `WorldAML Weekly Digest — ${alerts.length} alerts (${counts.critical} critical, ${counts.high} high)`,
            html,
          });
          sent++;
        } catch (e) { console.error("weekly send failed", orgId, e); continue; }

        await admin.from("suite_notification_log").insert({
          organisation_id: orgId,
          kind: "weekly",
          reference_id: weekKey,
          recipients: recipients.map(r => r.email),
          alert_ids: alerts.map((a: any) => a.id),
        });
      }
      return new Response(JSON.stringify({ sent, skipped, total_orgs: orgIds.length }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "unknown mode" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    console.error("send-alert-notifications error", err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : String(err) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
