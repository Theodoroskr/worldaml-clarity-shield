import { Resend } from "npm:resend";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const NOTIFY_EMAIL = "info@worldaml.com";
const COMPLIANCE_EMAIL = "compliance@infocreditgroup.com";
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

  try {
    // --- Auth: require authenticated user or service role key ---
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;

    // Allow service role key for internal/cron invocations
    const isServiceRole = serviceKey && token === serviceKey;

    if (!isServiceRole) {
      // Otherwise require a valid user JWT
      if (!token) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const supabaseAuth = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data, error: authError } = await supabaseAuth.auth.getUser();
      if (authError || !data?.user) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const { full_name, company_name, email, signed_up_at, auto_approved } = await req.json();

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
    const displayName = escapeHtml(full_name || "there");
    const displayCompany = escapeHtml(company_name || "—");
    const safeEmail = escapeHtml(email);
    const signupTime = signed_up_at
      ? new Date(signed_up_at).toLocaleString("en-GB", { timeZone: "UTC", dateStyle: "long", timeStyle: "short" }) + " UTC"
      : new Date().toLocaleString("en-GB", { timeZone: "UTC", dateStyle: "long", timeStyle: "short" }) + " UTC";

    const adminUrl = `https://worldaml.com/admin`;

    const statusMessage = auto_approved
      ? `has registered and was <strong style="color:#059669;">automatically approved</strong> (trusted domain).`
      : `has registered and is <strong style="color:#d97706;">awaiting your approval</strong>.`;

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;background:#fff;">
        <div style="background:#1e3a5f;padding:28px 32px;">
          <h1 style="color:#fff;margin:0;font-size:20px;font-weight:700;letter-spacing:0.5px;">
            WorldAML — New Account Registration
          </h1>
        </div>
        <div style="padding:28px 32px;">
          <p style="color:#374151;font-size:15px;margin:0 0 20px;">
            A new user ${statusMessage}
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
          ${!auto_approved ? `
          <a href="${adminUrl}"
             style="display:inline-block;background:#0d9488;color:#fff;text-decoration:none;padding:12px 24px;border-radius:6px;font-weight:600;font-size:14px;">
            Review &amp; Approve in Admin Panel →
          </a>` : `
          <p style="color:#059669;font-size:14px;font-weight:600;margin:0;">
            ✓ No action needed — user was auto-approved via trusted domain list.
          </p>`}
        </div>
        <div style="padding:16px 32px;border-top:1px solid #e5e7eb;">
          <p style="color:#9ca3af;font-size:12px;margin:0;">
            This is an automated notification from WorldAML.${!auto_approved ? " The user will not be able to access the platform until you approve their account." : ""}
          </p>
        </div>
      </div>
    `;

    const subjectPrefix = auto_approved ? "Auto-Approved" : "Action Required";

    // 1. Welcome email to the new user
    const welcomeHtml = `
      <div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;background:#fff;">
        <div style="background:#1e3a5f;padding:28px 32px;">
          <h1 style="color:#fff;margin:0;font-size:22px;font-weight:700;letter-spacing:0.5px;">Welcome to WorldAML</h1>
        </div>
        <div style="padding:28px 32px;">
          <p style="color:#374151;font-size:15px;margin:0 0 20px;">Hi ${displayName},</p>
          <p style="color:#374151;font-size:15px;margin:0 0 20px;">Thank you for creating your WorldAML account. Here's what you can do right away:</p>

          <div style="background:#f0fdfa;border-left:4px solid #0d9488;padding:16px 20px;margin:0 0 16px;border-radius:0 6px 6px 0;">
            <h3 style="color:#1e3a5f;font-size:15px;margin:0 0 6px;font-weight:700;">🔍 AML &amp; Sanctions Screening</h3>
            <p style="color:#374151;font-size:13px;margin:0;line-height:1.5;">Screen individuals and companies against global sanctions lists, PEP databases, and adverse media sources — all in seconds.</p>
          </div>
          <div style="background:#f0fdfa;border-left:4px solid #0d9488;padding:16px 20px;margin:0 0 16px;border-radius:0 6px 6px 0;">
            <h3 style="color:#1e3a5f;font-size:15px;margin:0 0 6px;font-weight:700;">📋 KYC &amp; KYB Onboarding</h3>
            <p style="color:#374151;font-size:13px;margin:0;line-height:1.5;">Onboard individuals and businesses with built-in identity verification, document checks, and risk scoring.</p>
          </div>
          <div style="background:#f0fdfa;border-left:4px solid #0d9488;padding:16px 20px;margin:0 0 16px;border-radius:0 6px 6px 0;">
            <h3 style="color:#1e3a5f;font-size:15px;margin:0 0 6px;font-weight:700;">💳 Transaction Monitoring</h3>
            <p style="color:#374151;font-size:13px;margin:0;line-height:1.5;">Monitor transactions in real time with customisable alert rules to detect suspicious activity automatically.</p>
          </div>
          <div style="background:#f0fdfa;border-left:4px solid #0d9488;padding:16px 20px;margin:0 0 16px;border-radius:0 6px 6px 0;">
            <h3 style="color:#1e3a5f;font-size:15px;margin:0 0 6px;font-weight:700;">📊 Risk Assessment</h3>
            <p style="color:#374151;font-size:13px;margin:0;line-height:1.5;">Automated, multi-factor risk scoring covering geography, PEP status, customer type, screening history, and transaction behaviour.</p>
          </div>
          <div style="background:#f0fdfa;border-left:4px solid #0d9488;padding:16px 20px;margin:0 0 16px;border-radius:0 6px 6px 0;">
            <h3 style="color:#1e3a5f;font-size:15px;margin:0 0 6px;font-weight:700;">🎓 WorldAML Academy</h3>
            <p style="color:#374151;font-size:13px;margin:0;line-height:1.5;">Free compliance courses with quizzes and shareable certificates. Build your AML expertise today.</p>
          </div>

          <div style="text-align:center;margin:28px 0 8px;">
            <a href="https://worldaml.com/dashboard" style="display:inline-block;background:#0d9488;color:#fff;text-decoration:none;padding:14px 32px;border-radius:6px;font-weight:700;font-size:15px;">Go to Your Dashboard →</a>
          </div>
          <p style="color:#6b7280;font-size:13px;margin:24px 0 0;text-align:center;">
            Need help? Visit our <a href="https://worldaml.com/support" style="color:#0d9488;text-decoration:none;font-weight:600;">Support Centre</a> or reply to this email.
          </p>
        </div>
        <div style="padding:16px 32px;border-top:1px solid #e5e7eb;">
          <p style="color:#9ca3af;font-size:12px;margin:0;text-align:center;">© ${new Date().getFullYear()} WorldAML · AML, KYC &amp; KYB Software for Regulated Businesses</p>
        </div>
      </div>
    `;

    await sendEmailWithRetry(resend, {
      from: FROM_EMAIL,
      to: [email],
      subject: `Welcome to WorldAML — Your Compliance Toolkit is Ready`,
      html: welcomeHtml,
    });
    console.log(`✅ Welcome email sent to: ${safeEmail}`);

    // 2. Admin notification + CC compliance
    await sendEmailWithRetry(resend, {
      from: FROM_EMAIL,
      to: [NOTIFY_EMAIL],
      cc: [COMPLIANCE_EMAIL],
      subject: `New Registration: ${displayName} (${displayCompany}) — ${subjectPrefix}`,
      html,
    });
    console.log(`✅ Admin notification sent for: ${safeEmail} (cc: ${COMPLIANCE_EMAIL})`);

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
