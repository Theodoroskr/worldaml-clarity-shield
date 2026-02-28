import { Resend } from "npm:resend";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const NOTIFY_EMAIL = "info@worldaml.com";
const FROM_EMAIL = "WorldAML <forms@worldaml.com>";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
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

    const displayName = full_name || "—";
    const displayCompany = company_name || "—";
    const signupTime = signed_up_at
      ? new Date(signed_up_at).toLocaleString("en-GB", { timeZone: "UTC", dateStyle: "long", timeStyle: "short" }) + " UTC"
      : new Date().toLocaleString("en-GB", { timeZone: "UTC", dateStyle: "long", timeStyle: "short" }) + " UTC";

    const projectId = Deno.env.get("SUPABASE_URL")?.split("//")[1]?.split(".")[0] || "";
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
              <td style="padding:10px 14px;color:#111827;"><a href="mailto:${email}" style="color:#0d9488;">${email}</a></td>
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

    const { error: emailError } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [NOTIFY_EMAIL],
      subject: `New Registration: ${displayName} (${displayCompany}) — Action Required`,
      html,
    });

    if (emailError) {
      console.error("Resend error:", emailError);
      return new Response(JSON.stringify({ error: "Email send failed", details: emailError }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`✅ Admin notification sent for new signup: ${email}`);
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
