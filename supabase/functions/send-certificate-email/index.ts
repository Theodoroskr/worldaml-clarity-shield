import { Resend } from "npm:resend";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const FROM_EMAIL = "WorldAML Academy <forms@worldaml.com>";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { holder_name, email, course_title, score, certificate_url, certificate_id } = await req.json();

    if (!email || !course_title || !certificate_url) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
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
