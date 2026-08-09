import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Resend } from "npm:resend";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const FROM_EMAIL = "WorldAML Partners <partners@worldaml.com>";
const SUPPORT_EMAIL = "info@worldaml.com";
const PORTAL_LOGIN = "https://worldaml.com/partner/login";
const PORTAL_HOME = "https://worldaml.com/partner/dashboard";
const LOGO_URL =
  "https://worldaml.com/__l5e/assets-v1/6959ec13-8bb4-4a84-8492-accb88799d7f/worldaml-logo.png";

function esc(s: unknown): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function shell(title: string, body: string): string {
  return `
  <div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;background:#fff;">
    <div style="background:#1e3a5f;padding:24px 32px;">
      <img src="${LOGO_URL}" alt="WorldAML" width="150"
           style="display:block;height:auto;max-width:150px;margin:0 0 14px;" />
      <h1 style="color:#fff;margin:0;font-size:20px;font-weight:700;">${esc(title)}</h1>
    </div>
    <div style="padding:26px 32px;color:#374151;font-size:15px;line-height:1.6;">${body}</div>
    <div style="padding:16px 32px;border-top:1px solid #e5e7eb;">
      <p style="color:#9ca3af;font-size:12px;margin:0;text-align:center;">
        © ${new Date().getFullYear()} WorldAML · ${SUPPORT_EMAIL}
      </p>
    </div>
  </div>`;
}

function cta(href: string, label: string): string {
  return `<div style="text-align:center;margin:26px 0;">
    <a href="${href}" style="display:inline-block;background:#0d9488;color:#fff;text-decoration:none;padding:13px 30px;border-radius:6px;font-weight:700;font-size:15px;">${esc(label)}</a>
  </div>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const authHeader = req.headers.get("Authorization") ?? "";

    // Admin-only endpoint — validate the caller's JWT and role in code.
    const asUser = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: authData } = await asUser.auth.getUser();
    if (!authData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(supabaseUrl, serviceKey);
    const { data: isAdmin } = await admin.rpc("has_role", {
      _user_id: authData.user.id, _role: "admin",
    });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { application_id, type, message } = await req.json();
    if (!application_id || !["approved", "rejected", "more_info"].includes(type)) {
      return new Response(JSON.stringify({ error: "application_id and valid type required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: app } = await admin
      .from("partner_applications")
      .select("id,user_id,company_name,contact_name,contact_email,partner_type,approved_partner_type")
      .eq("id", application_id)
      .maybeSingle();
    if (!app) {
      return new Response(JSON.stringify({ error: "Application not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let to = app.contact_email as string | null;
    if (!to && app.user_id) {
      const { data: profile } = await admin
        .from("profiles").select("email").eq("user_id", app.user_id).maybeSingle();
      to = profile?.email ?? null;
    }
    if (!to) {
      return new Response(JSON.stringify({ error: "No recipient email on this application" }), {
        status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      return new Response(JSON.stringify({ error: "Email provider not configured" }), {
        status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Partner record + manager details enrich the approval confirmation.
    const { data: partnerRow } = app.user_id
      ? await admin
          .from("partners")
          .select("referral_code,partner_type,commission_rate,commission_lifetime_months,academy_seats_granted,portal_access,partner_manager_id,display_name")
          .eq("user_id", app.user_id)
          .maybeSingle()
      : { data: null as any };

    let manager: { name?: string; email?: string } | null = null;
    if (partnerRow?.partner_manager_id) {
      const { data: m } = await admin
        .from("partner_managers")
        .select("name,email")
        .eq("id", partnerRow.partner_manager_id)
        .maybeSingle();
      manager = (m as any) ?? null;
    }

    const firstName = String(app.contact_name ?? "").split(" ")[0] || "there";
    const partnerType = String(app.approved_partner_type ?? app.partner_type ?? "").replace(/^\w/, (c) => c.toUpperCase());

    let subject = "";
    let html = "";

    if (type === "approved") {
      const rate = partnerRow?.commission_rate != null
        ? `${(Number(partnerRow.commission_rate) * 100).toFixed(0)}%`
        : null;
      const rows: Array<[string, string]> = [
        ["Company", String(app.company_name ?? "—")],
        ["Partner type", partnerType || "Partner"],
        ...(rate ? [["Commission rate", `${rate} on referred revenue`] as [string, string]] : []),
        ...(partnerRow?.commission_lifetime_months
          ? [["Commission lifetime", `${partnerRow.commission_lifetime_months} months per customer`] as [string, string]]
          : []),
        ...(partnerRow?.referral_code
          ? [["Your referral code", String(partnerRow.referral_code)] as [string, string]]
          : []),
        ...(partnerRow?.academy_seats_granted
          ? [["Academy seats", `${partnerRow.academy_seats_granted} free seats included`] as [string, string]]
          : []),
        ["Portal sign-in", PORTAL_LOGIN],
        ["Account email", String(to)],
      ];
      const detailTable = `
        <table style="width:100%;border-collapse:collapse;margin:18px 0;font-size:14px;">
          ${rows.map(([k, v], i) => `
            <tr style="background:${i % 2 ? "#ffffff" : "#f9fafb"};">
              <td style="padding:9px 12px;color:#6b7280;width:42%;border-bottom:1px solid #e5e7eb;">${esc(k)}</td>
              <td style="padding:9px 12px;color:#111827;font-weight:600;border-bottom:1px solid #e5e7eb;">${esc(v)}</td>
            </tr>`).join("")}
        </table>`;

      const managerBlock = manager?.email
        ? `<div style="background:#f0fdfa;border-left:4px solid #0d9488;padding:12px 16px;margin:18px 0;">
             <p style="margin:0;font-size:14px;">
               <strong style="color:#1e3a5f;">Your partner manager:</strong> ${esc(manager.name ?? manager.email)} ·
               <a href="mailto:${esc(manager.email)}" style="color:#0d9488;">${esc(manager.email)}</a>
             </p>
           </div>`
        : "";

      subject = "Your WorldAML Partner Portal access is active";
      html = shell("Welcome to the WorldAML Partner Programme", `
        <p>Hi ${esc(firstName)},</p>
        <p>Your WorldAML Partner Programme application for <strong>${esc(app.company_name)}</strong> has been approved and your Partner Portal access is now active.</p>
        ${detailTable}
        ${managerBlock}
        <p>Sign in to the WorldAML Partner Portal to:</p>
        <ul style="padding-left:18px;">
          <li>register opportunities</li>
          <li>track deal protection</li>
          <li>access partner resources</li>
          <li>view commissions where applicable</li>
          <li>complete partner training</li>
        </ul>
        ${cta(PORTAL_LOGIN, "Sign in to the Partner Portal")}
        <p style="font-size:13px;color:#6b7280;">
          Sign in with your existing WorldAML account (${esc(to)}) — no new account is needed. If you have not set a
          password yet, use “Forgot password” on the sign-in page to set one securely. After signing in you land on
          your dashboard at <a href="${PORTAL_HOME}" style="color:#0d9488;">${PORTAL_HOME}</a>.
        </p>
        <p style="font-size:13px;color:#6b7280;">
          Questions about commercials, co-selling or collateral? Reply to this email and our partnerships team
          (${SUPPORT_EMAIL}) will respond within one business day.
        </p>
      `);
    } else if (type === "more_info") {
      subject = `More information needed — WorldAML Partner application (${app.company_name})`;
      html = shell("We need a little more information", `
        <p>Hi ${esc(firstName)},</p>
        <p>Thank you for applying to the WorldAML Partner Programme for <strong>${esc(app.company_name)}</strong>. Before we can complete our review, we need some additional information:</p>
        <div style="background:#f9fafb;border-left:4px solid #0d9488;padding:12px 16px;margin:16px 0;">${esc(message ?? "").replace(/\n/g, "<br/>")}</div>
        <p>Simply reply to this email with the details and we will continue the review.</p>
      `);
    } else {
      subject = `WorldAML Partner Programme application — update (${app.company_name})`;
      html = shell("Partner Programme application update", `
        <p>Hi ${esc(firstName)},</p>
        <p>Thank you for your interest in the WorldAML Partner Programme. After review, we are unable to progress the application for <strong>${esc(app.company_name)}</strong> at this time.</p>
        <p>You are welcome to reapply in the future, and your WorldAML account and any Academy or Business access remain unchanged.</p>
        <p style="font-size:13px;color:#6b7280;">If you would like to discuss this, reply to this email and our partnerships team will respond.</p>
      `);
    }

    const resend = new Resend(resendApiKey);
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      reply_to: SUPPORT_EMAIL,
      subject,
      html,
    });

    if (error) {
      console.error("partner-lifecycle-email send failed:", error);
      return new Response(JSON.stringify({ error: "Send failed", details: error }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`✅ partner-lifecycle-email (${type}) sent to ${to}`);
    return new Response(JSON.stringify({ success: true }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("partner-lifecycle-email error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
