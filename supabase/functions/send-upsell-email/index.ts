import { Resend } from "npm:resend";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const FROM_EMAIL = "WorldAML <info@worldaml.com>";
const CC = ["compliance@infocreditgroup.com"];

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/* ── Email templates ── */

type TemplateId = "suite-upsell" | "screening-upsell";

interface TemplateConfig {
  subject: string;
  buildHtml: (firstName: string) => string;
  buildText: (firstName: string) => string;
}

const TEMPLATES: Record<TemplateId, TemplateConfig> = {
  "suite-upsell": {
    subject: "Upgrade to WorldAML Suite — Your Compliance Operations, Simplified",
    buildHtml: (firstName: string) => `
<!DOCTYPE html>
<html><head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:-apple-system,Segoe UI,Arial,sans-serif;color:#0f1b3d;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.06);">
        <tr><td style="background:linear-gradient(135deg,#1e3a5f 0%,#0d2137 100%);padding:28px 32px;text-align:center;">
          <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700;letter-spacing:0.3px;">WorldAML Suite</h1>
          <p style="margin:6px 0 0;color:#5eead4;font-size:13px;">Complete Compliance Platform</p>
        </td></tr>
        <tr><td style="padding:32px;">
          <p style="margin:0 0 14px;font-size:15px;color:#374151;">Hi ${firstName || "there"},</p>
          <h2 style="margin:0 0 16px;font-size:20px;color:#1e3a5f;line-height:1.35;">Take your compliance operations to the next level</h2>
          <p style="margin:0 0 18px;font-size:15px;line-height:1.65;color:#374151;">
            WorldAML Suite brings everything under one roof — <strong>KYC/KYB onboarding</strong>, <strong>AML screening</strong>, <strong>transaction monitoring</strong>, <strong>risk scoring</strong>, and <strong>regulatory reporting</strong> (SAR/STR/CTR) — so your team can focus on what matters.
          </p>
          <ul style="margin:0 0 24px;padding-left:20px;font-size:14px;line-height:1.8;color:#374151;">
            <li><strong>Unified Dashboard</strong> — Cases, alerts, screenings, and customers in one place</li>
            <li><strong>1,900+ Global Watchlists</strong> — Sanctions, PEP, and adverse media screening</li>
            <li><strong>Automated Risk Scoring</strong> — Composite scores across 5 weighted dimensions</li>
            <li><strong>One-Click Regulatory Exports</strong> — FinCEN SAR, FINTRAC STR, and MOKAS reports</li>
            <li><strong>Real-Time Monitoring</strong> — 46+ rule templates with AI-assisted suggestions</li>
          </ul>
          <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:8px 0 4px;">
            <a href="https://worldaml.com/contact-sales?product=suite&utm_source=email&utm_medium=upsell&utm_campaign=suite-upgrade"
               style="display:inline-block;background:linear-gradient(135deg,#0d9488,#0f766e);color:#fff;font-weight:600;font-size:15px;padding:14px 36px;border-radius:8px;text-decoration:none;letter-spacing:0.3px;">
              Request a Demo →
            </a>
          </td></tr></table>
          <p style="margin:24px 0 0;font-size:13px;color:#6b7280;text-align:center;">
            Or explore the <a href="https://worldaml.com/platform/suite" style="color:#0d9488;text-decoration:underline;">Suite overview</a> to see all features.
          </p>
        </td></tr>
        <tr><td style="padding:20px 32px;background:#f9fafb;border-top:1px solid #e5e7eb;">
          <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;">
            WorldAML by Infocredit Group · <a href="https://worldaml.com" style="color:#9ca3af;">worldaml.com</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`,
    buildText: (firstName: string) =>
      `Hi ${firstName || "there"},\n\nTake your compliance operations to the next level with WorldAML Suite.\n\nFeatures include unified KYC/KYB onboarding, AML screening against 1,900+ watchlists, automated risk scoring, one-click regulatory exports, and real-time monitoring.\n\nRequest a demo: https://worldaml.com/contact-sales?product=suite\n\nBest regards,\nThe WorldAML Team`,
  },

  "screening-upsell": {
    subject: "AML Screening — Screen Against 1,900+ Global Watchlists",
    buildHtml: (firstName: string) => `
<!DOCTYPE html>
<html><head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:-apple-system,Segoe UI,Arial,sans-serif;color:#0f1b3d;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.06);">
        <tr><td style="background:linear-gradient(135deg,#0d9488 0%,#0f766e 100%);padding:28px 32px;text-align:center;">
          <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700;letter-spacing:0.3px;">AML Screening</h1>
          <p style="margin:6px 0 0;color:#ccfbf1;font-size:13px;">1,900+ Global Watchlists</p>
        </td></tr>
        <tr><td style="padding:32px;">
          <p style="margin:0 0 14px;font-size:15px;color:#374151;">Hi ${firstName || "there"},</p>
          <h2 style="margin:0 0 16px;font-size:20px;color:#1e3a5f;line-height:1.35;">Stay ahead of sanctions and PEP risks</h2>
          <p style="margin:0 0 18px;font-size:15px;line-height:1.65;color:#374151;">
            WorldAML's AML Screening checks your customers against <strong>1,900+ global sanctions lists, PEP databases, and adverse media sources</strong> — with results in seconds.
          </p>
          <ul style="margin:0 0 24px;padding-left:20px;font-size:14px;line-height:1.8;color:#374151;">
            <li><strong>Instant Screening</strong> — OFAC, EU, UN, HMT, Interpol, and more</li>
            <li><strong>PEP & Adverse Media</strong> — Comprehensive coverage across all tiers</li>
            <li><strong>Confidence Scoring</strong> — Prioritise high-risk matches automatically</li>
            <li><strong>Audit Trail</strong> — Every screening logged for regulatory compliance</li>
            <li><strong>API Access</strong> — Integrate screening into your own workflows</li>
          </ul>
          <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:8px 0 4px;">
            <a href="https://worldaml.com/contact-sales?product=screening&utm_source=email&utm_medium=upsell&utm_campaign=screening-upgrade"
               style="display:inline-block;background:linear-gradient(135deg,#1e3a5f,#0d2137);color:#fff;font-weight:600;font-size:15px;padding:14px 36px;border-radius:8px;text-decoration:none;letter-spacing:0.3px;">
              Try AML Screening →
            </a>
          </td></tr></table>
          <p style="margin:24px 0 0;font-size:13px;color:#6b7280;text-align:center;">
            See our <a href="https://worldaml.com/platform/aml-screening" style="color:#0d9488;text-decoration:underline;">AML Screening page</a> for a full feature walkthrough.
          </p>
        </td></tr>
        <tr><td style="padding:20px 32px;background:#f9fafb;border-top:1px solid #e5e7eb;">
          <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;">
            WorldAML by Infocredit Group · <a href="https://worldaml.com" style="color:#9ca3af;">worldaml.com</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`,
    buildText: (firstName: string) =>
      `Hi ${firstName || "there"},\n\nStay ahead of sanctions and PEP risks with WorldAML AML Screening.\n\nScreen against 1,900+ global watchlists including OFAC, EU, UN, HMT, Interpol, PEP databases, and adverse media sources.\n\nTry it: https://worldaml.com/contact-sales?product=screening\n\nBest regards,\nThe WorldAML Team`,
  },
};

/* ── Handler ── */

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Auth: admin-only
    const authHeader = req.headers.get("Authorization") ?? "";
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check admin role
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { recipientEmail: rawEmail, recipientName, templateId } = body as {
      recipientEmail: string;
      recipientName?: string;
      templateId: TemplateId;
    };

    const recipientEmail = typeof rawEmail === "string" ? rawEmail.trim() : "";
    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!recipientEmail || !EMAIL_RE.test(recipientEmail)) {
      return new Response(JSON.stringify({ error: "A valid recipientEmail is required", received: recipientEmail }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!templateId) {
      return new Response(JSON.stringify({ error: "templateId is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!TEMPLATES[templateId]) {
      return new Response(JSON.stringify({ error: `Unknown template: ${templateId}` }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      return new Response(JSON.stringify({ error: "RESEND_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resend = new Resend(resendApiKey);
    const template = TEMPLATES[templateId];
    const safeName = escapeHtml(recipientName || "");

    console.log("Sending upsell email to:", recipientEmail, "template:", templateId);

    const { error: sendError } = await resend.emails.send({
      from: FROM_EMAIL,
      to: recipientEmail,
      cc: CC,
      subject: template.subject,
      html: template.buildHtml(safeName),
      text: template.buildText(safeName),
    });

    if (sendError) {
      console.error("Resend error:", sendError);
      return new Response(JSON.stringify({ error: "Failed to send email", details: sendError }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Audit log
    await supabase.from("suite_audit_log").insert({
      user_id: user.id,
      action: `Sent upsell email (${templateId}) to ${recipientEmail}`,
    }).then(() => {});

    return new Response(JSON.stringify({ success: true, to: recipientEmail, template: templateId }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("send-upsell-email error:", err);
    return new Response(JSON.stringify({ error: err.message ?? "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
