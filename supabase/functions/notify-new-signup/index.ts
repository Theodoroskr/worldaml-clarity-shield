import { Resend } from "npm:resend";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version, x-internal-secret",
};

const NOTIFY_EMAIL = "info@worldaml.com";
const FROM_EMAIL = "WorldAML <forms@worldaml.com>";

/** Escape special HTML characters to prevent HTML injection */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function sendEmailWithRetry(resend: any, params: any, retries = 1): Promise<void> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const { error } = await resend.emails.send(params);
      if (error) {
        const code = (error as any)?.name || (error as any)?.code || "";
        if (code === "rate_limit_exceeded" || (error as any)?.statusCode === 429) {
          console.warn("⚠️ Resend rate limit exceeded — skipping admin notification.");
          return;
        }
        throw error;
      }
      return;
    } catch (err: any) {
      const isRateLimit = err?.statusCode === 429 || err?.name === "rate_limit_exceeded";
      if (isRateLimit) {
        console.warn("⚠️ Resend rate limit exceeded — skipping admin notification.");
        return;
      }
      if (attempt < retries) {
        console.warn(`Email send attempt ${attempt + 1} failed, retrying in 1s…`, err?.message);
        await new Promise((r) => setTimeout(r, 1000));
      } else {
        console.error("Email send failed (non-blocking):", err?.message ?? err);
      }
    }
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Shared-secret authentication — only internal callers may invoke this function
  const internalSecret = Deno.env.get("INTERNAL_WEBHOOK_SECRET");
  const providedSecret = req.headers.get("x-internal-secret");

  if (!internalSecret || !providedSecret || providedSecret !== internalSecret) {
    console.warn("notify-new-signup: rejected unauthenticated request");
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { full_name, company_name, email, signed_up_at } = await req.json();

    if (!email) {
      return new Response(JSON.stringify({ error: "Missing email" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.warn("RESEND_API_KEY not set — skipping admin notification");
      return new Response(JSON.stringify({ success: true, message: "Skipped (no API key)" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resend = new Resend(resendApiKey);

    // HTML-escape all user-supplied values before interpolation
    const displayName = escapeHtml(full_name || "—");
    const displayCompany = escapeHtml(company_name || "—");
    const safeEmail = escapeHtml(email);
    const signupTime = signed_up_at
      ? new Date(signed_up_at).toLocaleString("en-GB", { timeZone: "UTC", dateStyle: "long", timeStyle: "short" }) + " UTC"
      : new Date().toLocaleString("en-GB", { timeZone: "UTC", dateStyle: "long", timeStyle: "short" }) + " UTC";

    const adminUrl = `https://worldaml-clarity-shield.lovable.app/admin`;

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;background:#fff;">
        <div style="background:#1e3a5f;padding:28px 32px;">
          <h1 style="color:#fff;margin:0;font-size:20px;font-weight:700;letter-spacing:0.5px;">
            WorldAML — New Account Registration
          </h1>
        </div>
        <div style="padding:28px 32px;">
          <p style="color:#374151;font-size:15px;margin:0 0 20px;">
            A new user has registered and is <strong style="color:#d97706;">awaiting your approval</strong>.
          </p>
          <table style="border-collapse:collapse;width:100%;font-size:14px;margin-bottom:24px;">
            <tr style="background:#f3f4f6;">
              <td style="padding:10px 14px;font-weight:600;color:#374151;width:140px;">Full Name</td>
              <td style="padding:10px 14px;color:#111827;">${displayName}</td>
            </tr>
            <tr>
              <td style="padding:10px 14px;font-weight:600;color:#374151;">Email</td>
              <td style="padding:10px 14px;color:#111827;"><a href="mailto:${safeEmail}" style="color:#0d9488;">${safeEmail}</a></td>
            </tr>
            <tr style="background:#f3f4f6;">
              <td style="padding:10px 14px;font-weight:600;color:#374151;">Company</td>
              <td style="padding:10px 14px;color:#111827;">${displayCompany}</td>
            </tr>
            <tr>
              <td style="padding:10px 14px;font-weight:600;color:#374151;">Registered At</td>
              <td style="padding:10px 14px;color:#111827;">${signupTime}</td>
            </tr>
          </table>
          <a href="${adminUrl}"
             style="display:inline-block;background:#0d9488;color:#fff;text-decoration:none;padding:12px 24px;border-radius:6px;font-weight:600;font-size:14px;">
            Review &amp; Approve in Admin Panel →
          </a>
        </div>
        <div style="padding:16px 32px;border-top:1px solid #e5e7eb;">
          <p style="color:#9ca3af;font-size:12px;margin:0;">
            This is an automated notification from WorldAML. The user will not be able to access the platform until you approve their account.
          </p>
        </div>
      </div>
    `;

    await sendEmailWithRetry(resend, {
      from: FROM_EMAIL,
      to: [NOTIFY_EMAIL],
      subject: `New Registration: ${displayName} (${displayCompany}) — Action Required`,
      html,
    });

    console.log(`✅ Admin notification sent for new signup: ${safeEmail}`);
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("notify-new-signup error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
