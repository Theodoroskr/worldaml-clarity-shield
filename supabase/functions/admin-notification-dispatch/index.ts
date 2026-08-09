import { Resend } from "npm:resend";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const FROM_EMAIL = "WorldAML Admin <forms@worldaml.com>";
const SITE_URL = "https://worldaml.com";

/** Mirrors src/lib/adminNotifications.ts */
const EVENT_META: Record<string, { label: string; category: string; email: boolean }> = {
  partner_application_pending: { label: "New Partner Application", category: "Partners", email: true },
  partner_deal_pending: { label: "New Deal Registration", category: "Partners", email: true },
  partner_access_issue: { label: "Partner Portal Access Issue", category: "Partners", email: false },
  purchase_failed: { label: "Failed Payment", category: "Finance", email: true },
  purchase_stale_pending: { label: "Pending Payment Issue", category: "Finance", email: true },
  purchase_reconciliation: { label: "Reconciliation Issue", category: "Finance", email: true },
  new_lead: { label: "New Lead", category: "Marketing", email: true },
  demo_request: { label: "Demo Request", category: "Marketing", email: true },
  business_enquiry: { label: "New Business Enquiry", category: "Business", email: true },
  report_failed: { label: "Scheduled Report Failed", category: "Reports", email: true },
  security_issue: { label: "Security Issue", category: "Security", email: true },
};

const ROLE_CATEGORIES: Record<string, string[]> = {
  marketing: ["Marketing", "Business", "Partners"],
  sales: ["Marketing", "Business", "Partners"],
  finance: ["Finance", "Reports"],
  partner_management: ["Partners"],
  management: ["Partners", "Finance", "Reports", "Security", "Business"],
  super_admin: ["Partners", "Finance", "Marketing", "Business", "Reports", "Security"],
};

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  try {
    // Keep derived notifications in sync (creates new ones, auto-resolves completed ones).
    await supabase.rpc("admin_notifications_sync");

    // Only email recent events — prevents a flood when historic items are backfilled.
    const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { data: notifs } = await supabase
      .from("admin_notifications")
      .select("*")
      .eq("status", "open")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(40);

    if (!notifs?.length) {
      return new Response(JSON.stringify({ sent: 0, reason: "nothing open" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: alreadyLogged } = await supabase
      .from("admin_notification_email_log")
      .select("notification_id, recipient")
      .in("notification_id", notifs.map((n: any) => n.id));
    const loggedKey = new Set((alreadyLogged ?? []).map((l: any) => `${l.notification_id}|${l.recipient}`));

    // Admin recipients
    const { data: roles } = await supabase.from("user_roles").select("user_id").eq("role", "admin");
    const adminIds = (roles ?? []).map((r: any) => r.user_id);
    if (!adminIds.length) {
      return new Response(JSON.stringify({ sent: 0, reason: "no admins" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, email, full_name, department")
      .in("id", adminIds);
    const { data: prefRows } = await supabase
      .from("admin_notification_prefs")
      .select("user_id, event_type, email")
      .in("user_id", adminIds);
    const prefMap = new Map<string, boolean>();
    (prefRows ?? []).forEach((p: any) => prefMap.set(`${p.user_id}|${p.event_type}`, p.email));

    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
    let sent = 0;

    for (const n of notifs as any[]) {
      const meta = EVENT_META[n.event_type];
      if (!meta) continue;
      for (const p of (profiles ?? []) as any[]) {
        if (!p.email) continue;
        const explicit = prefMap.get(`${p.id}|${n.event_type}`);
        const roleCats = p.department ? ROLE_CATEGORIES[p.department] : null;
        const byDefault = roleCats ? roleCats.includes(meta.category) && meta.email : meta.email;
        const wants = explicit ?? byDefault;
        if (!wants) continue;
        const key = `${n.id}|${p.email}`;
        if (loggedKey.has(key)) continue;

        const html = `
          <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#0f172a">
            <div style="border-bottom:2px solid #0d9488;padding-bottom:12px;margin-bottom:16px">
              <strong style="font-size:18px;color:#0f172a">WorldAML Admin</strong>
            </div>
            <p style="font-size:12px;text-transform:uppercase;letter-spacing:.06em;color:#64748b;margin:0 0 4px">${esc(meta.category)} · ${esc(meta.label)}</p>
            <h2 style="margin:0 0 8px;font-size:18px">${esc(n.title)}</h2>
            <p style="margin:0 0 16px;color:#334155">${esc(n.message ?? "")}</p>
            <a href="${SITE_URL}${esc(n.action_url ?? "/admin/notifications")}"
               style="display:inline-block;background:#0d9488;color:#fff;text-decoration:none;padding:10px 18px;border-radius:6px;font-weight:600">Open in Admin Portal</a>
            <p style="margin-top:24px;font-size:12px;color:#94a3b8">
              You receive this because of your admin notification preferences.
              Manage them at ${SITE_URL}/admin/notification-settings
            </p>
          </div>`;

        try {
          const { error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: [p.email],
            subject: `[WorldAML Admin] ${n.title}`,
            html,
          });
          await supabase.from("admin_notification_email_log").insert({
            notification_id: n.id,
            recipient: p.email,
            status: error ? "failed" : "sent",
            error: error ? String((error as any).message ?? error) : null,
          });
          if (!error) sent++;
        } catch (err: any) {
          await supabase.from("admin_notification_email_log").insert({
            notification_id: n.id,
            recipient: p.email,
            status: "failed",
            error: String(err?.message ?? err),
          });
        }
        loggedKey.add(key);
      }
    }

    return new Response(JSON.stringify({ sent }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("admin-notification-dispatch error", err?.message ?? err);
    return new Response(JSON.stringify({ error: "dispatch failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
