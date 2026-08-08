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

/** Schedule check: honours frequency plus optional day-of-week / day-of-month / send hour (UTC). */
function isDue(r: any): boolean {
  const frequency = r.frequency;
  if (!frequency || frequency === "none") return false;

  const now = new Date();
  const sendHour = Number.isFinite(Number(r.send_hour_utc)) ? Number(r.send_hour_utc) : 7;
  if (now.getUTCHours() < sendHour) return false;

  if (frequency === "weekly" && r.day_of_week !== null && r.day_of_week !== undefined) {
    if (now.getUTCDay() !== Number(r.day_of_week)) return false;
  }
  if (frequency === "monthly" && r.day_of_month !== null && r.day_of_month !== undefined) {
    if (now.getUTCDate() !== Number(r.day_of_month)) return false;
  }

  if (!r.last_run_at) return true;
  const elapsed = Date.now() - new Date(r.last_run_at).getTime();
  const day = 86_400_000;
  if (frequency === "daily") return elapsed >= 0.9 * day;
  if (frequency === "weekly") return elapsed >= 6.5 * day;
  if (frequency === "monthly") return elapsed >= 27.5 * day;
  return false;
}

interface Row { label: string; value: string; delta?: string; up?: boolean }
interface Section { title: string; note?: string; rows: Row[] }

const r = (label: string, value: string, delta?: string, up?: boolean): Row => ({ label, value, delta, up });

function pctDelta(current: unknown, previous: unknown): { delta?: string; up?: boolean } {
  const c = Number(current ?? 0);
  const p = Number(previous ?? NaN);
  if (!Number.isFinite(p)) return {};
  if (p === 0) return c > 0 ? { delta: "new", up: true } : {};
  const change = ((c - p) / Math.abs(p)) * 100;
  if (!Number.isFinite(change)) return {};
  return { delta: `${change >= 0 ? "+" : ""}${change.toFixed(0)}%`, up: change >= 0 };
}

function buildSections(a: any, reportType: string): Section[] {
  const prev = a.previous ?? null;
  const cmp = (key: string) => (prev ? pctDelta(a.current?.[key], prev?.[key]) : {});

  const mk = (label: string, key: string, fmt: (v: unknown) => string = num): Row => {
    const d = cmp(key);
    return r(label, fmt(a.current?.[key]), d.delta, d.up);
  };

  const executive: Section = {
    title: "Headline",
    note: prev ? "Change shown against the previous equivalent period." : undefined,
    rows: [
      mk("New users", "new_users"),
      mk("Active users", "active_users"),
      mk("New leads", "new_leads"),
      mk("Paid orders", "paid_orders"),
      mk("Revenue", "revenue_cents", (v) => eur(Number(v))),
      r("Total users (lifetime)", num(a.lifetime?.total_users)),
      r("Lifetime revenue", eur(a.lifetime?.revenue_cents)),
    ],
  };

  const finance: Section = {
    title: "Finance",
    rows: [
      mk("Revenue in period", "revenue_cents", (v) => eur(Number(v))),
      mk("Paid orders", "paid_orders"),
      r("Average order value", (() => {
        const orders = Number(a.current?.paid_orders ?? 0);
        return orders ? eur(Number(a.current?.revenue_cents ?? 0) / orders) : "—";
      })()),
      r("Lifetime revenue", eur(a.lifetime?.revenue_cents)),
      r("Partner commission earned", eur(a.partners?.commission_earned_cents)),
      r("Partner pipeline", `€${num(a.partners?.pipeline_eur)}`),
      r("Partner won", `€${num(a.partners?.won_eur)}`),
    ],
  };

  const sales: Section = {
    title: "Sales pipeline",
    rows: [
      mk("New leads", "new_leads"),
      mk("New business accounts", "new_business_accounts"),
      mk("New deals registered", "new_deals"),
      r("Checkouts started", num(a.business?.funnel?.checkout_started)),
      r("Purchases", num(a.business?.funnel?.purchased)),
      r("Lead → order conversion", (() => {
        const leads = Number(a.current?.new_leads ?? 0);
        const orders = Number(a.current?.paid_orders ?? 0);
        return leads ? `${((orders / leads) * 100).toFixed(1)}%` : "—";
      })()),
      ...(a.marketing?.by_form_type ?? []).slice(0, 5).map((x: any) => r(`Enquiries · ${x.label}`, num(x.n))),
    ],
  };

  const academy: Section = {
    title: "Academy",
    rows: [
      mk("Courses started", "courses_started"),
      mk("Courses completed", "courses_completed"),
      mk("Certificates issued", "certificates"),
      r("Completion rate", `${a.academy?.completion_rate ?? 0}%`),
      r("Paying learners", num(a.academy?.paying_users)),
      ...(a.academy?.top_courses ?? []).slice(0, 5).map((c: any) => r(`Top course · ${c.title}`, `${c.enrolments} enrolments`)),
    ],
  };

  const business: Section = {
    title: "Business",
    rows: [
      mk("New business accounts", "new_business_accounts"),
      r("Total accounts", num(a.business?.total)),
      r("Active product entitlements", num(a.business?.active_entitlements)),
      r("Checkouts started", num(a.business?.funnel?.checkout_started)),
      r("Purchases", num(a.business?.funnel?.purchased)),
    ],
  };

  const partners: Section = {
    title: "Partners",
    rows: [
      r("Active partners", num(a.partners?.active)),
      mk("New deals registered", "new_deals"),
      r("Pipeline", `€${num(a.partners?.pipeline_eur)}`),
      r("Won", `€${num(a.partners?.won_eur)}`),
      r("Commission earned", eur(a.partners?.commission_earned_cents)),
      ...(a.partners?.top_partners ?? []).slice(0, 5).map((p: any) => r(`Top partner · ${p.name}`, `${p.deals} deals`)),
    ],
  };

  const marketing: Section = {
    title: "Marketing",
    rows: [
      mk("New leads", "new_leads"),
      ...(a.marketing?.by_form_type ?? []).slice(0, 6).map((x: any) => r(`Form · ${x.label}`, num(x.n))),
      ...(a.marketing?.by_referrer ?? []).slice(0, 5).map((x: any) => r(`Source · ${x.label}`, num(x.n))),
    ],
  };

  const actions: Section = {
    title: "Requires attention",
    note: "Items waiting on the team.",
    rows: Object.entries(a.actions ?? {})
      .filter(([, v]) => Number(v) > 0)
      .map(([k, v]) => r(k.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase()), num(v))),
  };

  switch (reportType) {
    case "academy": return [academy, actions];
    case "business": return [business, actions];
    case "partners": return [partners, actions];
    case "marketing": return [marketing, actions];
    case "finance": return [finance, actions];
    case "sales": return [sales, actions];
    case "full": return [executive, finance, sales, academy, business, partners, marketing, actions];
    default: return [executive, academy, business, partners, actions];
  }
}

function renderHtml(name: string, periodLabel: string, sections: Section[], opts: { isTest?: boolean; description?: string } = {}): string {
  const body = sections
    .filter((s) => s.rows.length)
    .map(
      (s) => `
      <h2 style="font-size:13px;text-transform:uppercase;letter-spacing:.06em;color:#64748b;margin:26px 0 4px;">${esc(s.title)}</h2>
      ${s.note ? `<p style="margin:0 0 8px;font-size:12px;color:#94a3b8;">${esc(s.note)}</p>` : ""}
      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:14px;">
        ${s.rows
          .map(
            (row) => `<tr>
              <td style="padding:7px 0;border-bottom:1px solid #eef2f7;color:#334155;">${esc(row.label)}</td>
              <td align="right" style="padding:7px 0;border-bottom:1px solid #eef2f7;color:#0f172a;font-weight:600;">
                ${esc(row.value)}${row.delta ? `<span style="margin-left:8px;font-weight:600;font-size:12px;color:${row.up ? "#0d9488" : "#dc2626"};">${esc(row.delta)}</span>` : ""}
              </td>
            </tr>`,
          )
          .join("")}
      </table>`,
    )
    .join("");

  return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:640px;margin:0 auto;background:#fff;">
    ${opts.isTest ? `<div style="background:#fef3c7;color:#92400e;padding:10px 32px;font-size:13px;font-weight:600;">TEST SEND — this is a preview of a scheduled WorldAML report.</div>` : ""}
    <div style="background:#1e3a5f;padding:26px 32px;">
      <h1 style="color:#fff;margin:0;font-size:19px;font-weight:700;">WorldAML — ${esc(name)}</h1>
      <p style="color:#a5b4c6;margin:6px 0 0;font-size:13px;">${esc(periodLabel)}</p>
      ${opts.description ? `<p style="color:#a5b4c6;margin:6px 0 0;font-size:12px;">${esc(opts.description)}</p>` : ""}
    </div>
    <div style="padding:8px 32px 28px;">
      ${body || `<p style="font-size:14px;color:#64748b;">No activity recorded for this period.</p>`}
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

    let actorEmail: string | null = null;
    if (!isCron) {
      if (!token) return json({ error: "Unauthorized" }, 401);
      const { data: { user }, error } = await admin.auth.getUser(token);
      if (error || !user) return json({ error: "Unauthorized" }, 401);
      const { data: role } = await admin
        .from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle();
      if (!role) return json({ error: "Admin access required" }, 403);
      actorEmail = user.email ?? null;
    }

    const payload = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const reportId: string | undefined = payload?.report_id;
    const mode: "send" | "preview" | "test" = payload?.mode === "preview" || payload?.mode === "test" ? payload.mode : "send";

    if ((mode === "preview" || mode === "test") && isCron) {
      return json({ error: "Preview and test sends require an admin session" }, 403);
    }

    let reports: any[] = [];
    if (reportId) {
      const { data } = await admin.from("admin_reports").select("*").eq("id", reportId).maybeSingle();
      if (!data) return json({ error: "Report not found" }, 404);
      reports = [data];
    } else {
      const { data } = await admin.from("admin_reports").select("*").eq("is_active", true).neq("frequency", "none");
      reports = (data ?? []).filter((row) => isDue(row));
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const resend = resendApiKey ? new Resend(resendApiKey) : null;
    const results: { report: string; status: string; error?: string }[] = [];

    for (const rep of reports) {
      const startedAt = Date.now();
      const { from, to } = resolveRange(rep.range_key);
      let status = "sent";
      let errorMessage: string | null = null;
      let summary: unknown = null;
      const periodLabel = `${from.toISOString().slice(0, 10)} → ${new Date(to.getTime() - 1).toISOString().slice(0, 10)}`;

      try {
        const { data: analytics, error: rpcError } = await admin.rpc("admin_analytics", {
          _from: from.toISOString(),
          _to: to.toISOString(),
        });
        if (rpcError) throw new Error(rpcError.message);

        const sections = buildSections(analytics, rep.report_type);
        summary = { headline: (sections[0]?.rows ?? []).map((x) => [x.label, x.value]) };

        // Preview: return the rendered HTML without sending or logging.
        if (mode === "preview") {
          return json({
            success: true,
            preview: true,
            report: rep.name,
            period: periodLabel,
            html: renderHtml(rep.name, periodLabel, sections, { description: rep.description ?? undefined }),
          });
        }

        const recipients: string[] =
          mode === "test"
            ? [String(payload?.test_email || actorEmail || "")].filter((e) => /.+@.+\..+/.test(e))
            : (rep.recipients ?? []).filter((e: string) => /.+@.+\..+/.test(e));

        if (!recipients.length) {
          throw new Error(mode === "test" ? "No test recipient available" : "No valid recipients configured");
        }
        if (!resend) throw new Error("Email sending is not configured");

        const { error: sendError } = await resend.emails.send({
          from: FROM_EMAIL,
          to: recipients,
          subject: `${mode === "test" ? "[TEST] " : ""}${rep.name} — ${periodLabel}`,
          html: renderHtml(rep.name, periodLabel, sections, {
            isTest: mode === "test",
            description: rep.description ?? undefined,
          }),
        });
        if (sendError) throw new Error((sendError as any)?.message ?? "Email delivery failed");

        if (mode === "send") {
          await admin.from("admin_reports").update({ last_run_at: new Date().toISOString() }).eq("id", rep.id);
        } else {
          await admin.from("admin_reports").update({ last_test_at: new Date().toISOString() }).eq("id", rep.id);
        }
      } catch (err) {
        status = "failed";
        errorMessage = err instanceof Error ? err.message : String(err);
      }

      await admin.from("admin_report_runs").insert({
        report_id: rep.id,
        report_name: rep.name,
        report_type: rep.report_type,
        period_start: from.toISOString(),
        period_end: to.toISOString(),
        recipients: mode === "test" ? [payload?.test_email || actorEmail].filter(Boolean) : (rep.recipients ?? []),
        status,
        error_message: errorMessage,
        summary,
        trigger_type: mode === "test" ? "test" : isCron ? "scheduled" : "manual",
        duration_ms: Date.now() - startedAt,
      });

      results.push({ report: rep.name, status, error: errorMessage ?? undefined });
    }

    return json({ success: true, processed: results.length, results });
  } catch (err) {
    console.error("send-admin-report error:", err);
    return json({ error: "Internal server error" }, 500);
  }
});
