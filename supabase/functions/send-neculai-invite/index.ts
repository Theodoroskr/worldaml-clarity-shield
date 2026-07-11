// One-off: personal invite for info@neculailegal.com — complimentary full Academy access.
import { Resend } from "npm:resend";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      return new Response(JSON.stringify({ error: "RESEND_API_KEY missing" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const resend = new Resend(resendApiKey);

    const to = "info@neculailegal.com";
    const cc = "info@worldaml.com";
    const signupUrl = "https://academy.worldaml.com/signup";

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;background:#fff;">
        <div style="background:#1e3a5f;padding:28px 32px;">
          <h1 style="color:#fff;margin:0;font-size:20px;font-weight:700;letter-spacing:0.5px;">WorldAML Academy</h1>
        </div>
        <div style="padding:28px 32px;color:#374151;font-size:15px;line-height:1.6;">
          <p>Hello,</p>
          <p>We'd like to invite you to <strong>WorldAML Academy</strong> — our CPD-accredited AML, KYC and sanctions training platform used by compliance teams across the EU, UK, US and MENA.</p>
          <p>As a personal invitation, we've reserved a <strong>complimentary Annual All-Access pass</strong> (normally €199/year) for the email address <strong>info@neculailegal.com</strong>. It unlocks:</p>
          <ul style="padding-left:20px;margin:8px 0 16px;">
            <li>All 16+ regional &amp; specialist courses</li>
            <li>CPD-accredited digital certificates (LinkedIn-ready)</li>
            <li>Full MLRO Toolkit — editable policies, SAR/STR narratives, risk assessment forms</li>
            <li>Any new courses added during the year</li>
          </ul>
          <p style="margin:24px 0;">
            <a href="${signupUrl}" style="display:inline-block;background:#0d9488;color:#fff;text-decoration:none;padding:12px 28px;border-radius:6px;font-weight:600;font-size:14px;">
              Create your free account →
            </a>
          </p>
          <p><strong>How it works:</strong> register with <em>info@neculailegal.com</em> at the link above — your Annual All-Access pass is applied to the account automatically the moment you sign up. No payment step, no code to enter.</p>
          <p>If you have any questions, just reply to this email (our team at <a href="mailto:info@worldaml.com" style="color:#0d9488;">info@worldaml.com</a> is on copy).</p>
          <p style="margin-top:28px;">Warm regards,<br/>The WorldAML Team</p>
        </div>
        <div style="padding:16px 32px;border-top:1px solid #e5e7eb;">
          <p style="color:#9ca3af;font-size:12px;margin:0;">WorldAML · info@worldaml.com · academy.worldaml.com</p>
        </div>
      </div>
    `;

    const { data, error } = await resend.emails.send({
      from: "WorldAML Academy <academy@worldaml.com>",
      to: [to],
      cc: [cc],
      subject: "Your complimentary WorldAML Academy Annual All-Access pass",
      html,
      reply_to: "info@worldaml.com",
    });

    if (error) {
      return new Response(JSON.stringify({ error }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ success: true, id: data?.id }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
