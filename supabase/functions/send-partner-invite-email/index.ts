import { Resend } from "npm:resend";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SUPPORT_EMAIL = "info@worldaml.com";
const FROM_EMAIL = "WorldAML Partners <partners@worldaml.com>";
const PARTNER_URL = "https://worldaml.com/partners";
const APPLY_URL = "https://worldaml.com/partners/apply";

function escapeHtml(str: string): string {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function buildHtml(name: string, context: string): string {
  const displayName = escapeHtml(name || "there");
  const contextLine = context
    ? `<p style="color:#374151;font-size:15px;margin:0 0 20px;">${escapeHtml(context)}</p>`
    : "";

  return `
  <div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;background:#fff;">
    <div style="background:#1e3a5f;padding:28px 32px;">
      <h1 style="color:#fff;margin:0;font-size:22px;font-weight:700;letter-spacing:0.3px;">
        Grow with WorldAML — Partner Program
      </h1>
    </div>
    <div style="padding:28px 32px;">
      <p style="color:#374151;font-size:15px;margin:0 0 16px;">Hi ${displayName},</p>
      ${contextLine}
      <p style="color:#374151;font-size:15px;margin:0 0 20px;line-height:1.6;">
        Thank you for your interest in partnering with WorldAML. Our Partner Program is designed for
        consultancies, technology firms, and resellers who want to add regulated AML, KYC, and KYB
        capabilities to their offering and earn recurring commission.
      </p>

      <table style="border-collapse:collapse;width:100%;margin:0 0 24px;">
        <tr>
          <td style="width:33%;padding:14px;background:#f0fdfa;border-radius:6px 0 0 6px;text-align:center;">
            <div style="font-size:22px;font-weight:700;color:#0d9488;">5%</div>
            <div style="font-size:12px;color:#374151;font-weight:600;margin-top:4px;">Referral</div>
          </td>
          <td style="width:2%;"></td>
          <td style="width:33%;padding:14px;background:#0d9488;text-align:center;">
            <div style="font-size:22px;font-weight:700;color:#fff;">10%</div>
            <div style="font-size:12px;color:#fff;font-weight:600;margin-top:4px;">Affiliate</div>
          </td>
          <td style="width:2%;"></td>
          <td style="width:33%;padding:14px;background:#f0fdfa;border-radius:0 6px 6px 0;text-align:center;">
            <div style="font-size:22px;font-weight:700;color:#0d9488;">15%</div>
            <div style="font-size:12px;color:#374151;font-weight:600;margin-top:4px;">Reseller</div>
          </td>
        </tr>
      </table>

      <div style="background:#f9fafb;border-left:4px solid #0d9488;padding:14px 18px;margin:0 0 24px;border-radius:0 6px 6px 0;">
        <p style="color:#374151;font-size:13px;margin:0;line-height:1.6;">
          <strong style="color:#1e3a5f;">Included:</strong> real-time referral tracking, co-branded
          collateral, dedicated partner manager, monthly commission payouts, and access to our
          ISO 27001-certified compliance platform.
        </p>
      </div>

      <div style="text-align:center;margin:28px 0 12px;">
        <a href="${APPLY_URL}"
           style="display:inline-block;background:#0d9488;color:#fff;text-decoration:none;padding:14px 32px;border-radius:6px;font-weight:700;font-size:15px;">
          Apply to the Partner Program →
        </a>
      </div>
      <p style="text-align:center;margin:0 0 20px;">
        <a href="${PARTNER_URL}" style="color:#0d9488;font-size:13px;text-decoration:none;">
          Learn more about tiers &amp; benefits
        </a>
      </p>

      <p style="color:#6b7280;font-size:13px;margin:24px 0 0;line-height:1.6;">
        Have questions about the programme, commercials, or co-selling? Just reply to this email —
        our partnerships team (${SUPPORT_EMAIL}) will get back to you within one business day.
      </p>
    </div>
    <div style="padding:16px 32px;border-top:1px solid #e5e7eb;">
      <p style="color:#9ca3af;font-size:12px;margin:0;text-align:center;">
        © ${new Date().getFullYear()} WorldAML · ${SUPPORT_EMAIL}
      </p>
    </div>
  </div>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, name, context, source } = await req.json();

    if (!to || typeof to !== "string" || !isValidEmail(to)) {
      return new Response(JSON.stringify({ error: "Valid recipient email required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.warn("RESEND_API_KEY not set — skipping partner invite");
      return new Response(JSON.stringify({ success: true, message: "Skipped (no API key)" }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resend = new Resend(resendApiKey);
    const html = buildHtml(String(name ?? "").slice(0, 120), String(context ?? "").slice(0, 400));

    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      cc: [SUPPORT_EMAIL],
      reply_to: SUPPORT_EMAIL,
      subject: "Partner with WorldAML — Earn recurring commission",
      html,
    });

    if (error) {
      console.error("Partner invite send error:", error);
      return new Response(JSON.stringify({ error: "Send failed", details: error }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`✅ Partner invite sent to ${to} (source: ${source ?? "unknown"})`);
    return new Response(JSON.stringify({ success: true }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("send-partner-invite-email error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
