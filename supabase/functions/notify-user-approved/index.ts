import { Resend } from "npm:resend";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const FROM_EMAIL = "WorldAML <forms@worldaml.com>";
const LOGIN_URL = "https://worldaml.com/login";

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
          console.warn("⚠️ Resend rate limit exceeded — skipping.");
          return;
        }
        throw error;
      }
      return;
    } catch (err: any) {
      const isRateLimit = err?.statusCode === 429 || err?.name === "rate_limit_exceeded";
      if (isRateLimit) { console.warn("⚠️ Rate limit — skipping."); return; }
      if (attempt < retries) {
        console.warn(`Attempt ${attempt + 1} failed, retrying…`, err?.message);
        await new Promise((r) => setTimeout(r, 1000));
      } else {
        console.error("Email send failed:", err?.message ?? err);
      }
    }
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, full_name } = await req.json();

    if (!email) {
      return new Response(JSON.stringify({ error: "Missing email" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.warn("RESEND_API_KEY not set — skipping approval email");
      return new Response(JSON.stringify({ success: true, message: "Skipped (no API key)" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resend = new Resend(resendApiKey);
    const displayName = escapeHtml(full_name || "there");
    const safeEmail = escapeHtml(email);

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;background:#fff;">
        <div style="background:#1e3a5f;padding:28px 32px;">
          <h1 style="color:#fff;margin:0;font-size:20px;font-weight:700;letter-spacing:0.5px;">
            WorldAML
          </h1>
        </div>
        <div style="padding:28px 32px;">
          <h2 style="color:#111827;font-size:18px;font-weight:700;margin:0 0 16px;">
            Your Account Has Been Approved 🎉
          </h2>
          <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 20px;">
            Hi ${displayName},
          </p>
          <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 20px;">
            Great news! Your WorldAML account (<strong>${safeEmail}</strong>) has been reviewed and approved. You now have full access to the platform.
          </p>
          <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 24px;">
            Click the button below to log in and get started.
          </p>
          <a href="${LOGIN_URL}"
             style="display:inline-block;background:#0d9488;color:#fff;text-decoration:none;padding:12px 28px;border-radius:6px;font-weight:600;font-size:14px;">
            Log In to WorldAML →
          </a>
        </div>
        <div style="padding:16px 32px;border-top:1px solid #e5e7eb;">
          <p style="color:#9ca3af;font-size:12px;margin:0;">
            This is an automated message from WorldAML. If you did not create an account, you can ignore this email.
          </p>
        </div>
      </div>
    `;

    await sendEmailWithRetry(resend, {
      from: FROM_EMAIL,
      to: [email],
      subject: "Your WorldAML Account Has Been Approved",
      html,
    });

    console.log(`✅ Approval email sent to ${safeEmail}`);
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("notify-user-approved error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
