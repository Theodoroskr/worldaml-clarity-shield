import { Resend } from "npm:resend";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const FROM_EMAIL = "WorldAML <info@worldaml.com>";
const SITE = "https://worldaml.com";
const LOGO = `${SITE}/email-logo.png`;
const NAVY = "#0f172a";
const TEAL = "#0d9488";
const MUTED = "#64748b";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildHtml(companyName: string, contactName: string | null) {
  const greeting = contactName ? `Hi ${escapeHtml(contactName)},` : "Hi there,";
  const company = escapeHtml(companyName);
  const row = (title: string, body: string) => `
    <tr><td style="padding:0 24px 14px;">
      <div style="font-size:14px;color:${NAVY};font-weight:bold;">${title}</div>
      <div style="font-size:14px;color:${MUTED};line-height:1.6;">${body}</div>
    </td></tr>`;

  return `<!doctype html><html><body style="margin:0;padding:24px;background:#f1f5f9;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;font-family:Arial,Helvetica,sans-serif;">
        <tr><td style="background:${NAVY};padding:20px 24px;">
          <img src="${LOGO}" alt="WorldAML" width="148" style="display:block;border:0;height:auto;" />
        </td></tr>
        <tr><td style="padding:26px 24px 8px;">
          <div style="font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:${TEAL};font-weight:bold;">WorldAML Business</div>
          <h1 style="margin:6px 0 12px;font-size:22px;color:${NAVY};">Your business account is ready</h1>
          <p style="margin:0 0 8px;font-size:15px;color:${MUTED};line-height:1.6;">${greeting}</p>
          <p style="margin:0 0 18px;font-size:15px;color:${MUTED};line-height:1.6;">
            Thanks for creating a WorldAML business account for <strong style="color:${NAVY};">${company}</strong>.
            You can now explore our compliance solutions, request quotes and manage your team from one place.
          </p>
        </td></tr>
        ${row("Explore solutions", "AML screening, WorldID KYC/KYB, transaction monitoring, regulatory reporting and LexisNexis data.")}
        ${row("Buy or request a quote", "Self-serve checkout for standard plans, or request tailored enterprise pricing.")}
        ${row("Add your team", "Invite colleagues, assign product access and Academy training seats.")}
        <tr><td style="padding:10px 24px 26px;">
          <a href="${SITE}/business/dashboard" style="display:inline-block;background:${TEAL};color:#ffffff;text-decoration:none;font-weight:bold;font-size:15px;padding:12px 22px;border-radius:8px;">Open your business dashboard</a>
        </td></tr>
        <tr><td style="background:#f8fafc;padding:16px 24px;border-top:1px solid #e2e8f0;">
          <div style="font-size:12px;color:${MUTED};line-height:1.6;">
            Questions? Reply to this email or contact <a href="mailto:info@worldaml.com" style="color:${TEAL};">info@worldaml.com</a>.<br/>
            WorldAML &middot; <a href="${SITE}" style="color:${TEAL};">worldaml.com</a>
          </div>
        </td></tr>
      </table>
    </td></tr>
  </table></body></html>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Authenticated callers only — prevents this endpoint being used as an open relay.
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "").trim();
    if (!token) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: `Bearer ${token}` } } },
    );
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user?.email) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const companyName = String(body?.company_name ?? "").slice(0, 120) || "your company";
    const contactName = body?.contact_name ? String(body.contact_name).slice(0, 120) : null;

    const apiKey = Deno.env.get("RESEND_API_KEY");
    if (!apiKey) {
      console.error("RESEND_API_KEY missing");
      return new Response(JSON.stringify({ error: "Email not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resend = new Resend(apiKey);
    // Always send to the authenticated user's own address.
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [user.email],
      subject: "Welcome to WorldAML — your business account is ready",
      html: buildHtml(companyName, contactName),
    });
    if (error) throw error;

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("send-business-welcome failed:", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
