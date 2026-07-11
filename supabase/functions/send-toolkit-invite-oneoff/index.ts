// One-off: send a checkout-recovery help email to a specific recipient.
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

    const to = "shahbaz@arabianca.com";
    const cc = "info@worldaml.com";
    const checkoutUrl = "https://academy.worldaml.com";

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;background:#fff;">
        <div style="background:#1e3a5f;padding:28px 32px;">
          <h1 style="color:#fff;margin:0;font-size:20px;font-weight:700;letter-spacing:0.5px;">WorldAML Academy</h1>
        </div>
        <div style="padding:28px 32px;color:#374151;font-size:15px;line-height:1.6;">
          <p>Hi Shahbaz,</p>
          <p>We noticed that your recent checkout for the <strong>WorldAML Academy Annual Pass</strong> (€199) did not complete — the Stripe checkout session expired before payment was confirmed.</p>
          <p>No charge was made, and no action is needed on your side unless you'd still like to subscribe. If you were having trouble completing the payment, we're happy to help.</p>
          <p style="margin:24px 0;">
            <a href="${checkoutUrl}" style="display:inline-block;background:#0d9488;color:#fff;text-decoration:none;padding:12px 28px;border-radius:6px;font-weight:600;font-size:14px;">
              Retry Checkout →
            </a>
          </p>
          <p><strong>Need help?</strong> Just reply to this email (our team at <a href="mailto:info@worldaml.com" style="color:#0d9488;">info@worldaml.com</a> is on copy) and let us know what happened — for example:</p>
          <ul style="padding-left:20px;margin:8px 0 16px;">
            <li>Card declined or 3DS verification failed</li>
            <li>Prefer a different payment method (bank transfer, invoice)</li>
            <li>Need a VAT-compliant invoice or want to pay in a different currency</li>
            <li>Interested in a team / multi-seat plan</li>
          </ul>
          <p>We'll get you sorted quickly so you can access the courses, certificates, and the MLRO Pro Toolkit included with the Annual Pass.</p>
          <p style="margin-top:28px;">Best regards,<br/>The WorldAML Team</p>
          <p style="color:#9ca3af;font-size:12px;margin-top:24px;">
            Reference: checkout session cs_live_a10HlG… · 2026-07-10 22:33 UTC
          </p>
        </div>
        <div style="padding:16px 32px;border-top:1px solid #e5e7eb;">
          <p style="color:#9ca3af;font-size:12px;margin:0;">WorldAML · info@worldaml.com</p>
        </div>
      </div>
    `;

    const { data, error } = await resend.emails.send({
      from: "WorldAML Academy <academy@worldaml.com>",
      to: [to],
      cc: [cc],
      subject: "Trouble completing your Academy Annual Pass checkout? We can help",
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
