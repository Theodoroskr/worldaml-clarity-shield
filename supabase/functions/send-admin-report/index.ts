import { Resend } from "npm:resend";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const FROM_EMAIL = "WorldAML <forms@worldaml.com>";
const ADMIN_URL = "https://worldaml.com/admin/dashboard";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const eur = (c: number) => `€${Math.round((Number(c) || 0) / 100).toLocaleString()}`;
const num = (v: unknown) => Number(v ?? 0).toLocaleString();

/** Mirrors src/lib/adminAnalytics.ts resolveRange (UTC-based, server side). */
function resolveRange(key: string): { from: Date; to: Date } {
  const now = new Date();
  const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const endOfToday = new Date(todayStart.getTime() + 86_400_000);
  const day = 86_400_000;
  switch (key) {
    case "today": return { from: todayStart, to: endOfToday };
    case "last_7_days": return { from: new Date(todayStart.getTime() - 6 * day), to: endOfToday };
    case "this_month": return { from: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)), to: endOfToday };
    case "last_month": return {
      from: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1)),
      to: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)),
    };
    case "this_quarter": {
      const q = Math.floor(now.getUTCMonth() / 3) * 3;
      return { from: new Date(Date.UTC(now.getUTCFullYear(), q, 1)), to: endOfToday };
    }
    case "this_year": return { from: new Date(Date.UTC(now.getUTCFullYear(), 0, 1)), to: endOfToday };
    default: return { from: new Date(todayStart.getTime() - 29 * day), to: endOfToday };
  }
}

function isDue(frequency: string, lastRunAt: string | null): boolean {
  if (frequency === "none") return false;
  if (!lastRunAt) return true;
  const elapsed = Date.now() - new Date(lastRunAt).getTime();
  const day = 86_400_000;
  if (frequency === "daily") return elapsed >= 0.9 * day;
  if (frequency === "weekly") return elapsed >= 6.9 * day;
  if (frequency === "monthly") return elapsed >= 27.9 * day;
  return false;
}

interface Section { title: string; rows: [string, string][] }

function buildSections(a: any, reportType: string): Section[] {
  const executive: Section = {
    title: "Headline",
    rows: [
      ["New users", num(a.current.new_users)],
      ["Active users", num(a.current.active_users)],
      ["New leads", num(a.current.new_leads)],
      ["Paid orders", num(a.current.paid_orders)],
      ["Revenue", eur(a.current.revenue_cents)],
      ["Total users (lifetime)", num(a.lifetime.total_users)],
      ["Lifetime revenue", eur(a.lifetime.revenue_cents)],
    ],
  };
  const academy: Section = {
    title: "Academy",
    rows: [
      ["Courses started", num(a.current.courses_started)],
      ["Courses completed", num(a.current.courses_completed)],
      ["Certificates issued", num(a.current.certificates)],
      ["Completion rate", `${a.academy.completion_rate}%`],
      ["Paying learners", num(a.academy.paying_users)],
      ...a.academy.top_courses.slice(0, 5).map((c: any) => [`Top course · ${c.title}`, `${c.enrolments} enrolments`] as [string, string]),
    ],
  };
  const business: Section = {
    title: "Business",
    rows: [
      ["New business accounts", num(a.current.new_business_accounts)],
      ["Total accounts", num(a.business.total)],
      ["Active product entitlements", num(a.business.active_entitlements)],
      ["Checkouts started", num(a.business.funnel.checkout_started)],
      ["Purchases", num(a.business.funnel.purchased)],
    ],
  };
  const partners: Section = {
    title: "Partners",
    rows: [
      ["Active partners", num(a.partners.active)],
      ["New deals registered", num(a.current.new_deals)],
      ["Pipeline", `€${num(a.partners.pipeline_eur)}`],
      ["Won", `€${num(a.partners.won_eur)}`],
      ["Commission earned", eur(a.partners.commission_earned_cents)],
      ...a.partners.top_partners.slice(0, 5).map((p: any) => [`Top partner · ${p.name}`, `${p.deals} deals`] as [string, string]),
    ],
  };
  const marketing: Section = {
    title: "Marketing",
    rows: [
      ["New leads", num(a.current.new_leads)],
      ...a.marketing.by_form_type.slice(0, 6).map((r: any) => [`Form · ${r.label}`, num(r.n)] as [string, string]),
      ...a.marketing.by_referrer.slice(0, 5).map((r: any) => [`Source · ${r.label}`, num(r.n)] as [string, string]),
    ],
  };
  const actions: Section = {
    title: "Requires attention",
    rows: Object.entries(a.actions)
      .filter(([, v]) => Number(v) > 0)
      .map(([k, v]) => [k.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase()), num(v)] as [string, string]),
  };

  switch (reportType) {
    case "academy": return [academy, actions];
    case "business": return [business, actions];
    case "partners": return [partners, actions];
    case "marketing": return [marketing, actions];
    case "full": return [executive, academy, business, partners, marketing, actions];
    default: return [executive, academy, business, partners, marketing, actions].slice(0, 4).concat([actions]);
  }
}

function renderHtml(name: string, periodLabel: string, sections: Section[]): string {
  const body = sections
    .filter((s) => s.rows.length)
    .map(
      (s) => `
      <h2 style="font-size:13px;text-transform:uppercase;letter-spacing:.06em;color:#64748b;margin:26px 0 8px;">${esc(s.title)}</h2>
      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:14px;">
        ${s.rows
          .map(
            ([l, v]) => `<tr>
              <td style="padding:7px 0;border-bottom:1px solid #eef2f7;color:#334155;">${esc(l)}</td>
              <td align="right" style="padding:7px 0;border-bottom:1px solid #eef2f7;color:#0f172a;font-weight:600;">${esc(v)}</td>
            </tr>`,
          )
          .join("")}
      </table>`,
    )
    .join("");

  return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:640px;margin:0 auto;background:#fff;">
    <div style="background:#1e3a5f;padding:26px 32px;">
      <h1 style="color:#fff;margin:0;font-size:19px;font-weight:700;">WorldAML — ${esc(name)}</h1>
      <p style="color:#a5b4c6;margin:6px 0 0;font-size:13px;">${esc(periodLabel)}</p>
    </div>
    <div style="padding:8px 32px 28px;">
      ${body}
      <a href="${ADMIN_URL}" style="display:inline-block;margin-top:26px;background:#0d9488;color:#fff;text-decoration:none;padding:11px 24px;border-radius:6px;font-weight:600;font-size:14px;">Open admin dashboard →</a>
    </div>
    <div style="padding:16px 32px;border-top:1px solid #e5e7eb;">
      <p style="color:#9ca3af;font-size:12px;margin:0;">
        Internal WorldAML report. Aggregated figures only — no customer personal data is included.
      </p>
    </div>
  </div>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceKey);

    const token = (req.headers.get("Authorization") ?? "").replace("Bearer ", "").trim();

    // Scheduled invocations present the shared scheduler secret; humans an admin JWT.
    const cronSecret = Deno.env.get("ADMIN_REPORT_CRON_SECRET");
    const isCron =
      (!!cronSecret && req.headers.get("x-cron-secret") === cronSecret) || (!!token && token === serviceKey);

    if (!isCron) {
      if (!token) return json({ error: "Unauthorized" }, 401);
      const { data: { user }, error } = await admin.auth.getUser(token);
      if (error || !user) return json({ error: "Unauthorized" }, 401);
      const { data: role } = await admin
        .from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle();
      if (!role) return json({ error: "Admin access required" }, 403);
    }

    const payload = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const reportId: string | undefined = payload?.report_id;

    let reports: any[] = [];
    if (reportId) {
      const { data } = await admin.from("admin_reports").select("*").eq("id", reportId).maybeSingle();
      if (!data) return json({ error: "Report not found" }, 404);
      reports = [data];
    } else {
      const { data } = await admin.from("admin_reports").select("*").eq("is_active", true).neq("frequency", "none");
      reports = (data ?? []).filter((r) => isDue(r.frequency, r.last_run_at));
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const resend = resendApiKey ? new Resend(resendApiKey) : null;
    const results: { report: string; status: string; error?: string }[] = [];

    for (const r of reports) {
      const { from, to } = resolveRange(r.range_key);
      let status = "sent";
      let errorMessage: string | null = null;
      let summary: unknown = null;

      try {
        const { data: analytics, error: rpcError } = await admin.rpc("admin_analytics", {
          _from: from.toISOString(),
          _to: to.toISOString(),
        });
        if (rpcError) throw new Error(rpcError.message);

        const sections = buildSections(analytics, r.report_type);
        summary = { headline: sections[0]?.rows ?? [] };
        const periodLabel = `${from.toISOString().slice(0, 10)} → ${new Date(to.getTime() - 1).toISOString().slice(0, 10)}`;

        const recipients: string[] = (r.recipients ?? []).filter((e: string) => /.+@.+\..+/.test(e));
        if (!recipients.length) throw new Error("No valid recipients configured");
        if (!resend) throw new Error("Email sending is not configured");

        const { error: sendError } = await resend.emails.send({
          from: FROM_EMAIL,
          to: recipients,
          subject: `${r.name} — ${periodLabel}`,
          html: renderHtml(r.name, periodLabel, sections),
        });
        if (sendError) throw new Error((sendError as any)?.message ?? "Email delivery failed");

        await admin.from("admin_reports").update({ last_run_at: new Date().toISOString() }).eq("id", r.id);
      } catch (err) {
        status = "failed";
        errorMessage = err instanceof Error ? err.message : String(err);
      }

      await admin.from("admin_report_runs").insert({
        report_id: r.id,
        report_name: r.name,
        report_type: r.report_type,
        period_start: from.toISOString(),
        period_end: to.toISOString(),
        recipients: r.recipients ?? [],
        status,
        error_message: errorMessage,
        summary,
      });

      results.push({ report: r.name, status, error: errorMessage ?? undefined });
    }

    return json({ success: true, processed: results.length, results });
  } catch (err) {
    console.error("send-admin-report error:", err);
    return json({ error: "Internal server error" }, 500);
  }
});
