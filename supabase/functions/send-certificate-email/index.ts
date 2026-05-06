import { Resend } from "npm:resend";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const FROM_EMAIL = "WorldAML Academy <forms@worldaml.com>";
const SALES_NOTIFY_TO = "compliance@infocreditgroup.com";
const ALLOWED_CERT_PREFIX = "https://worldaml.com/academy/certificate/";

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!)
  );
}

// Insert a warm lead into form_submissions and notify sales/compliance.
// Best-effort — never blocks the certificate email.
async function tagWarmLeadAndNotify(opts: {
  email: string;
  holder_name: string;
  course_title: string;
  score: number;
  certificate_url: string;
  resend: any;
}) {
  const { email, holder_name, course_title, score, certificate_url, resend } = opts;
  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (SUPABASE_URL && SERVICE_KEY) {
      const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
      const [first, ...rest] = (holder_name || "").trim().split(/\s+/);
      await supabase.from("form_submissions").insert({
        form_type: "academy_certified",
        first_name: first || "Academy",
        last_name: rest.join(" ") || "Learner",
        email,
        lead_status: "academy_certified",
        message: `Earned certificate: ${course_title} (${score}%)`,
        metadata: {
          source: "academy_certificate",
          course_title,
          score,
          certificate_url,
          issued_at: new Date().toISOString(),
        },
      });
      console.log(`✅ Warm lead tagged: ${email} (${course_title})`);
    }
  } catch (e) {
    console.error("⚠️ Warm lead insert failed (non-fatal):", (e as Error).message);
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: [SALES_NOTIFY_TO],
      subject: `🎓 Academy lead: ${holder_name} certified in ${course_title}`,
      html: `
        <div style="font-family:Arial,sans-serif;font-size:14px;color:#1e3a5f;line-height:1.6;">
          <p>A new warm lead from WorldAML Academy:</p>
          <table cellpadding="6" style="border-collapse:collapse;font-size:14px;">
            <tr><td><strong>Name</strong></td><td>${holder_name || "—"}</td></tr>
            <tr><td><strong>Email</strong></td><td><a href="mailto:${email}">${email}</a></td></tr>
            <tr><td><strong>Course</strong></td><td>${course_title}</td></tr>
            <tr><td><strong>Score</strong></td><td>${score}%</td></tr>
            <tr><td><strong>Certificate</strong></td><td><a href="${certificate_url}">View</a></td></tr>
          </table>
          <p style="margin-top:16px;color:#6b7280;font-size:13px;">Tagged in form_submissions as <code>academy_certified</code>. Recommended action: outreach within 48h.</p>
        </div>
      `,
    });
  } catch (e) {
    console.error("⚠️ Sales notification email failed (non-fatal):", (e as Error).message);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // --- Auth: require authenticated user ---
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "");
    if (!token) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data, error: claimsErr } = await supabaseAuth.auth.getUser();
    if (claimsErr || !data?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const callerUserId = data.user.id;

    const { holder_name, email, course_title, score, certificate_url, certificate_id } = await req.json();

    if (!email || !course_title || !certificate_url) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify the caller can only send certificate emails for their own certificates
    if (email !== data.user.email) {
      return new Response(JSON.stringify({ error: "You can only send certificate emails to your own address" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const resend = new Resend(resendApiKey);

    const linkedInShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(certificate_url)}`;

    const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background-color:#f4f6f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f9;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#1e3a5f 0%,#0d2137 100%);padding:32px 40px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:0.5px;">WorldAML Academy</h1>
            <p style="margin:8px 0 0;color:#5eead4;font-size:14px;font-weight:500;">Compliance Education & Certification</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:40px;">
            <h2 style="margin:0 0 8px;color:#1e3a5f;font-size:22px;font-weight:700;">🎉 Congratulations, ${holder_name || "Learner"}!</h2>
            <p style="margin:0 0 24px;color:#374151;font-size:16px;line-height:1.6;">
              You have successfully completed <strong>${course_title}</strong> with a score of <strong>${score}%</strong>.
            </p>

            <!-- Score Badge -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
              <tr><td align="center">
                <table cellpadding="0" cellspacing="0" style="background:#ecfdf5;border:2px solid #5eead4;border-radius:12px;padding:20px 40px;">
                  <tr><td align="center">
                    <p style="margin:0;color:#0d9488;font-size:36px;font-weight:800;">${score}%</p>
                    <p style="margin:4px 0 0;color:#374151;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Final Score</p>
                  </td></tr>
                </table>
              </td></tr>
            </table>

            <!-- CTA Button -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px;">
              <tr><td align="center">
                <a href="${certificate_url}" style="display:inline-block;background:#1e3a5f;color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:8px;font-size:16px;font-weight:600;">
                  View Your Certificate
                </a>
              </td></tr>
            </table>

            <!-- LinkedIn Share -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
              <tr><td align="center">
                <a href="${linkedInShareUrl}" style="display:inline-block;background:#0077b5;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:600;">
                  🔗 Share on LinkedIn
                </a>
              </td></tr>
            </table>

            <hr style="border:none;border-top:1px solid #e5e7eb;margin:0 0 24px;" />
            <p style="margin:0;color:#6b7280;font-size:13px;line-height:1.5;">
              This certificate verifies your completion of the course and can be shared with employers or regulatory bodies.
              Visit <a href="https://worldaml.com/academy" style="color:#0d9488;">WorldAML Academy</a> to explore more courses.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb;">
            <p style="margin:0;color:#9ca3af;font-size:12px;">
              This is an automated certificate notification from WorldAML Academy.<br/>
              © ${new Date().getFullYear()} WorldAML. All rights reserved.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

    const headers: Record<string, string> = {};
    if (certificate_id) {
      headers["X-Entity-Ref-ID"] = certificate_id;
    }

    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [email],
      subject: `Your WorldAML Certificate — ${course_title}`,
      html,
      headers,
    });

    if (error) {
      const isRateLimit = (error as any)?.statusCode === 429 || (error as any)?.name === "rate_limit_exceeded";
      if (isRateLimit) {
        console.warn("Resend rate limit — skipping certificate email");
        return new Response(JSON.stringify({ success: true, skipped: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      console.error("Certificate email error:", error);
      return new Response(JSON.stringify({ error: "Failed to send email" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fire-and-forget warm-lead tagging + sales notification
    await tagWarmLeadAndNotify({
      email, holder_name, course_title, score, certificate_url, resend,
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Certificate email error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
