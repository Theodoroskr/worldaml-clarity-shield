import { Resend } from "npm:resend";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const FROM_EMAIL = "WorldAML <info@worldaml.com>";
const CC = ["compliance@infocreditgroup.com"];
const EMAIL_RE = /^[A-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?(?:\.[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?)+$/i;

function normalizeEmail(value: unknown): string {
  if (typeof value !== "string") return "";

  const trimmed = value
    .trim()
    .replace(/^mailto:/i, "")
    .replace(/[\u200B-\u200D\uFEFF]/g, "");
  const displayMatch = trimmed.match(/<([^<>]+)>$/);
  const email = (displayMatch?.[1] ?? trimmed).trim().toLowerCase();

  if (!email || /[\s,;<>]/.test(email) || !EMAIL_RE.test(email)) return "";
  return email;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttribute(str: string): string {
  return escapeHtml(str).replace(/`/g, "&#96;");
}

/* ── Email templates ── */

type TemplateId =
  | "suite-upsell"
  | "screening-upsell"
  | "password-reset-academy"
  | "aml-signal-outreach"
  | "seminar-discount-suite"
  | "academy-paid-discount";

interface TemplateData {
  promoCode?: string;
  courseTitle?: string;
}

interface TemplateConfig {
  subject: string;
  buildHtml: (firstName: string, resetLink?: string, data?: TemplateData) => string;
  buildText: (firstName: string, resetLink?: string, data?: TemplateData) => string;
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

  "password-reset-academy": {
    subject: "Reset Your Password — Access Your Free WorldAML Academy",
    buildHtml: (firstName: string, resetLink = "https://www.worldaml.com/forgot-password") => {
      const safeResetLink = escapeAttribute(resetLink);
      return `
<!DOCTYPE html>
<html><head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:-apple-system,Segoe UI,Arial,sans-serif;color:#0f1b3d;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.06);">
        <tr><td style="background:linear-gradient(135deg,#1e3a5f 0%,#0d2137 100%);padding:28px 32px;text-align:center;">
          <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700;letter-spacing:0.3px;">WorldAML Academy</h1>
          <p style="margin:6px 0 0;color:#5eead4;font-size:13px;">Your Free Account Awaits</p>
        </td></tr>
        <tr><td style="padding:32px;">
          <p style="margin:0 0 14px;font-size:15px;color:#374151;">Hi ${firstName || "there"},</p>
          <h2 style="margin:0 0 16px;font-size:20px;color:#1e3a5f;line-height:1.35;">Reset your password to get started</h2>
          <p style="margin:0 0 18px;font-size:15px;line-height:1.65;color:#374151;">
            We noticed you recently registered for WorldAML. To access your <strong>free Academy courses</strong>, please reset your password using the link below.
          </p>
          <p style="margin:0 0 18px;font-size:15px;line-height:1.65;color:#374151;">
            As a registered user, you have <strong>free access</strong> to our AML compliance training courses covering:
          </p>
          <ul style="margin:0 0 24px;padding-left:20px;font-size:14px;line-height:1.8;color:#374151;">
            <li><strong>AML Fundamentals</strong> — Core anti-money laundering concepts</li>
            <li><strong>KYC & Customer Due Diligence</strong> — Best practices for onboarding</li>
            <li><strong>Sanctions Screening</strong> — Understanding global watchlists</li>
            <li><strong>CPD-Accredited Certificates</strong> — Shareable credentials upon completion</li>
          </ul>
          <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:8px 0 4px;">
            <a href="${safeResetLink}"
               style="display:inline-block;background:linear-gradient(135deg,#0d9488,#0f766e);color:#fff;font-weight:600;font-size:15px;padding:14px 36px;border-radius:8px;text-decoration:none;letter-spacing:0.3px;">
              Reset Password & Log In →
            </a>
          </td></tr></table>
          <p style="margin:18px 0 0;font-size:13px;line-height:1.6;color:#6b7280;text-align:center;">
            If the button is not clickable, copy and paste this secure reset link into your browser:<br/>
            <a href="${safeResetLink}" style="color:#0d9488;text-decoration:underline;word-break:break-all;">${safeResetLink}</a>
          </p>
          <p style="margin:24px 0 0;font-size:13px;color:#6b7280;text-align:center;">
            Once logged in, visit the <a href="https://worldaml.com/academy" style="color:#0d9488;text-decoration:underline;">Academy</a> to start learning.
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
</body></html>`;
    },
    buildText: (firstName: string, resetLink = "https://www.worldaml.com/forgot-password") =>
      `Hi ${firstName || "there"},\n\nWe noticed you recently registered for WorldAML. To access your free Academy courses, please reset your password.\n\nReset your password here: ${resetLink}\n\nAs a registered user, you have free access to AML compliance training courses including AML Fundamentals, KYC & Customer Due Diligence, Sanctions Screening, and CPD-Accredited Certificates.\n\nOnce logged in, visit https://worldaml.com/academy to start learning.\n\nBest regards,\nThe WorldAML Team`,
  },

  "aml-signal-outreach": {
    subject: "Ready to automate your AML screening?",
    buildHtml: (firstName: string) => `
<!DOCTYPE html><html><head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:-apple-system,Segoe UI,Arial,sans-serif;color:#0f1b3d;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:32px 16px;"><tr><td align="center">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.06);">
      <tr><td style="background:linear-gradient(135deg,#1e3a5f 0%,#0d2137 100%);padding:28px 32px;text-align:center;">
        <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700;">WorldAML Screening</h1>
        <p style="margin:6px 0 0;color:#5eead4;font-size:13px;">1,900+ Global Watchlists · Continuous Monitoring</p>
      </td></tr>
      <tr><td style="padding:32px;">
        <p style="margin:0 0 14px;font-size:15px;color:#374151;">Hi ${firstName || "there"},</p>
        <p style="margin:0 0 16px;font-size:15px;line-height:1.65;color:#374151;">
          We noticed you've been exploring AML screening on WorldAML. If you're evaluating how to automate sanctions, PEP and adverse-media checks at scale, we'd love to show you how our production customers cut screening review time by 60–80%.
        </p>
        <ul style="margin:0 0 24px;padding-left:20px;font-size:14px;line-height:1.8;color:#374151;">
          <li><strong>1,900+ watchlists</strong>, refreshed hourly</li>
          <li><strong>Ongoing monitoring</strong> alerts when a customer's status changes</li>
          <li><strong>API + UI</strong> — bulk import your book of business in minutes</li>
          <li><strong>Audit-ready evidence</strong> for every screening decision</li>
        </ul>
        <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:8px 0 4px;">
          <a href="https://worldaml.com/contact-sales?product=aml-screening&utm_source=email&utm_medium=triggered&utm_campaign=aml-signal"
             style="display:inline-block;background:linear-gradient(135deg,#0d9488,#0f766e);color:#fff;font-weight:600;font-size:15px;padding:14px 36px;border-radius:8px;text-decoration:none;">
            Book a 15-min walkthrough →
          </a>
        </td></tr></table>
        <p style="margin:24px 0 0;font-size:13px;color:#6b7280;">
          Or reply to this email with your use case — happy to answer any question directly.
        </p>
      </td></tr>
      <tr><td style="padding:20px 32px;background:#f9fafb;border-top:1px solid #e5e7eb;">
        <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;">
          WorldAML by Infocredit Group · <a href="https://worldaml.com" style="color:#9ca3af;">worldaml.com</a>
        </p>
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`,
    buildText: (firstName: string) =>
      `Hi ${firstName || "there"},\n\nWe noticed you've been exploring AML screening on WorldAML. Happy to show you how customers cut screening review time by 60–80%.\n\n• 1,900+ watchlists refreshed hourly\n• Ongoing monitoring alerts on status change\n• Bulk API + UI import\n• Audit-ready evidence per decision\n\nBook a 15-min walkthrough: https://worldaml.com/contact-sales?product=aml-screening\n\nOr reply directly.\n\nThe WorldAML Team`,
  },

  "seminar-discount-suite": {
    subject: "Congrats on completing your WorldAML seminar — here's 20% off the Suite",
    buildHtml: (firstName: string, _resetLink?: string, data?: TemplateData) => {
      const code = escapeHtml(data?.promoCode || "SEMINAR20");
      return `
<!DOCTYPE html><html><head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:-apple-system,Segoe UI,Arial,sans-serif;color:#0f1b3d;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:32px 16px;"><tr><td align="center">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.06);">
      <tr><td style="background:linear-gradient(135deg,#0d9488 0%,#0f766e 100%);padding:28px 32px;text-align:center;">
        <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700;">Well done, ${firstName || "learner"} 🎓</h1>
        <p style="margin:6px 0 0;color:#ccfbf1;font-size:13px;">You've completed a WorldAML seminar</p>
      </td></tr>
      <tr><td style="padding:32px;">
        <p style="margin:0 0 14px;font-size:15px;color:#374151;">Hi ${firstName || "there"},</p>
        <p style="margin:0 0 16px;font-size:15px;line-height:1.65;color:#374151;">
          As a thank-you for completing your seminar, here's <strong>20% off WorldAML Suite</strong> — the same platform your instructors use for real-world compliance operations.
        </p>
        <div style="margin:20px 0;padding:18px;border:2px dashed #0d9488;border-radius:10px;text-align:center;background:#f0fdfa;">
          <p style="margin:0 0 6px;font-size:12px;color:#0f766e;text-transform:uppercase;letter-spacing:1px;">Your discount code</p>
          <p style="margin:0;font-size:26px;font-weight:700;color:#0d9488;letter-spacing:2px;">${code}</p>
          <p style="margin:8px 0 0;font-size:12px;color:#6b7280;">Valid for 30 days · single use · applies to WorldAML Suite</p>
        </div>
        <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:8px 0 4px;">
          <a href="https://worldaml.com/contact-sales?product=suite&promo=${code}&utm_source=email&utm_medium=triggered&utm_campaign=seminar-discount"
             style="display:inline-block;background:linear-gradient(135deg,#0d9488,#0f766e);color:#fff;font-weight:600;font-size:15px;padding:14px 36px;border-radius:8px;text-decoration:none;">
            Redeem 20% off →
          </a>
        </td></tr></table>
      </td></tr>
      <tr><td style="padding:20px 32px;background:#f9fafb;border-top:1px solid #e5e7eb;">
        <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;">
          WorldAML by Infocredit Group · <a href="https://worldaml.com" style="color:#9ca3af;">worldaml.com</a>
        </p>
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`;
    },
    buildText: (firstName: string, _resetLink?: string, data?: TemplateData) =>
      `Hi ${firstName || "there"},\n\nCongrats on completing your WorldAML seminar! As a thank-you, here's 20% off WorldAML Suite:\n\n  Code: ${data?.promoCode || "SEMINAR20"}\n  Valid 30 days, single use.\n\nRedeem: https://worldaml.com/contact-sales?product=suite&promo=${data?.promoCode || "SEMINAR20"}\n\nThe WorldAML Team`,
  },
};

/* ── Handler ── */

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse body first so we can decide which paths need admin auth
    const body = await req.json();
    const {
      recipientEmail: rawEmail,
      recipientName,
      templateId,
      setPassword,
      templateData,
    } = body as {
      recipientEmail: string;
      recipientName?: string;
      templateId: TemplateId;
      setPassword?: string;
      templateData?: TemplateData;
    };

    // Public path: anyone can request a password reset email for their own account.
    const isPublicPasswordReset =
      templateId === "password-reset-academy" && !setPassword;

    // Internal call from another edge function (queue worker) — uses shared secret
    const internalSecret = req.headers.get("x-internal-secret");
    const isInternalCall =
      !!internalSecret && internalSecret === supabaseServiceKey;

    // Audit user for non-public, non-internal paths (admin-only)
    let user: { id: string } | null = null;

    if (!isPublicPasswordReset && !isInternalCall) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user: authedUser }, error: authError } =
        await supabase.auth.getUser(token);
      if (authError || !authedUser) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      user = authedUser;

      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", authedUser.id)
        .eq("role", "admin")
        .maybeSingle();

      if (!roleData) {
        return new Response(JSON.stringify({ error: "Admin access required" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }


    // If setPassword is provided, update the user's password directly
    if (setPassword && rawEmail) {
      const email = normalizeEmail(rawEmail);
      if (!email) {
        return new Response(JSON.stringify({ error: "Invalid email" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const { data: { users } } = await supabase.auth.admin.listUsers();
      const user = users?.find((u: any) => u.email === email);
      if (!user) {
        return new Response(JSON.stringify({ error: `User not found: ${email}` }), {
          status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const { error: pwErr } = await supabase.auth.admin.updateUserById(user.id, {
        password: setPassword,
      });
      if (pwErr) {
        console.error("[setPassword] Failed:", pwErr.message);
        return new Response(JSON.stringify({ error: pwErr.message }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      console.log("[setPassword] Password updated for", email);
      // If no templateId, just return success without sending email
      if (!templateId) {
        return new Response(JSON.stringify({ success: true, action: "password_set", email }), {
          status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const recipientEmail = normalizeEmail(rawEmail);

    if (!recipientEmail) {
      return new Response(JSON.stringify({ error: "A valid recipient email is required" }), {
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
    let passwordResetLink: string | undefined;

    console.log("Sending upsell email", { recipientEmail, templateId });

    // Consent / eligibility gate for sales-outreach templates
    const isSalesOutreach =
      templateId === "suite-upsell" ||
      templateId === "screening-upsell" ||
      templateId === "aml-signal-outreach" ||
      templateId === "seminar-discount-suite";

    if (isSalesOutreach) {
      const { data: recipientProfile } = await supabase
        .from("profiles")
        .select("user_id")
        .eq("email", recipientEmail)
        .maybeSingle();

      if (!recipientProfile?.user_id) {
        return new Response(JSON.stringify({
          error: "Recipient is not a registered user — one-to-one sales outreach is only permitted to registered users.",
          reason: "user_not_registered",
        }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      const { data: eligibility, error: elErr } = await supabase.rpc(
        "is_eligible_for_sales_outreach",
        { _user_id: recipientProfile.user_id },
      );

      if (elErr) {
        console.error("Eligibility check failed:", elErr);
        return new Response(JSON.stringify({ error: "Failed to verify recipient eligibility" }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (!eligibility?.eligible) {
        console.log("Blocked upsell send", { recipientEmail, eligibility });
        return new Response(JSON.stringify({
          error: "This user is not eligible for sales outreach.",
          reason: eligibility?.reason ?? "not_eligible",
          eligibility,
        }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    }


    if (templateId === "password-reset-academy") {
      console.log("[password-reset] Generating recovery link via admin.generateLink", {
        email: recipientEmail,
        redirectTo: "https://www.worldaml.com/reset-password",
      });

      const { data: resetData, error: resetError } = await supabase.auth.admin.generateLink({
        type: "recovery",
        email: recipientEmail,
        options: {
          redirectTo: "https://www.worldaml.com/reset-password",
        },
      });

      if (resetError) {
        console.error("[password-reset] generateLink FAILED:", {
          message: resetError.message,
          status: (resetError as any).status,
        });
        return new Response(JSON.stringify({ error: "Failed to generate password reset link" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } else {
        passwordResetLink = resetData?.properties?.action_link;
        if (!passwordResetLink) {
          console.error("[password-reset] generateLink returned no action_link", { email: recipientEmail });
          return new Response(JSON.stringify({ error: "Password reset link was not generated" }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const linkUrl = passwordResetLink ? new URL(passwordResetLink) : null;
        console.log("[password-reset] generateLink SUCCESS", {
          email: recipientEmail,
          linkHost: linkUrl?.host,
          linkPath: linkUrl?.pathname,
          hasToken: !!linkUrl?.searchParams.get("token"),
          hasType: !!linkUrl?.searchParams.get("type"),
          redirectTo: linkUrl?.searchParams.get("redirect_to"),
        });
      }
    }

    const { error: sendError } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [recipientEmail],
      cc: CC,
      subject: template.subject,
      html: template.buildHtml(safeName, passwordResetLink, templateData),
      text: template.buildText(safeName, passwordResetLink, templateData),
    });

    if (sendError) {
      console.error("Resend error:", sendError);
      return new Response(JSON.stringify({ error: "Failed to send email", details: sendError }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Audit log — actor is admin user, or null when triggered internally by queue worker
    await supabase.from("suite_audit_log").insert({
      user_id: user?.id ?? null,
      action: `Sent ${templateId} email to ${recipientEmail}${isInternalCall ? " (auto/queue)" : ""}`,
    }).then(() => {});

    // Per-user upsell email history (visible on admin user profile)
    if (templateId !== "password-reset-academy") {
      const { data: recipientProfile } = await supabase
        .from("profiles")
        .select("user_id")
        .eq("email", recipientEmail)
        .maybeSingle();

      await supabase.from("admin_upsell_email_log").insert({
        recipient_user_id: recipientProfile?.user_id ?? null,
        recipient_email: recipientEmail,
        template_id: templateId,
        sent_by: user?.id ?? null,
      }).then(() => {});
    }


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
