// One-off recovery email sender. POST { to, name, courseTitle, amount, paymentUrl, adminToken }
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const FROM_EMAIL = "WorldAML Academy <info@worldaml.com>";
const ADMIN_TOKEN = "wa-recovery-2026"; // simple shared token, function is single-use

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { to, name, courseTitle, amount, paymentUrl, adminToken } = await req.json();
    if (adminToken !== ADMIN_TOKEN) {
      return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: corsHeaders });
    }
    if (!to || !paymentUrl || !courseTitle) {
      return new Response(JSON.stringify({ error: "missing fields" }), { status: 400, headers: corsHeaders });
    }

    const apiKey = Deno.env.get("RESEND_API_KEY");
    if (!apiKey) throw new Error("RESEND_API_KEY not set");
    const resend = new Resend(apiKey);

    const greeting = name ? `Hi ${name.split(" ")[0]},` : "Hi there,";
    const html = `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#0f172a;background:#ffffff;">
        <h2 style="margin:0 0 12px;color:#0f172a;">Your WorldAML Academy checkout is ready to complete</h2>
        <p style="margin:0 0 14px;line-height:1.55;">${greeting}</p>
        <p style="margin:0 0 14px;line-height:1.55;">
          Thank you for choosing the <strong>${courseTitle}</strong> course at WorldAML Academy.
          Your previous Stripe checkout session expired before payment was completed, so no charge was made on your card.
        </p>
        <p style="margin:0 0 20px;line-height:1.55;">
          We've issued you a fresh, secure payment link${amount ? ` for <strong>${amount}</strong>` : ""}.
          Click the button below to complete your purchase — access to the course is unlocked automatically the moment payment is confirmed.
        </p>
        <p style="margin:0 0 28px;">
          <a href="${paymentUrl}"
             style="display:inline-block;background:#0d9488;color:#ffffff;text-decoration:none;font-weight:600;padding:14px 26px;border-radius:6px;font-size:15px;">
            Complete your payment
          </a>
        </p>
        <p style="margin:0 0 8px;font-size:13px;color:#475569;line-height:1.55;">
          <strong>What to expect:</strong>
        </p>
        <ol style="margin:0 0 16px 20px;padding:0;font-size:13px;color:#475569;line-height:1.7;">
          <li>Click the button above — it opens Stripe's secure checkout.</li>
          <li>Enter your card details and confirm the payment.</li>
          <li>You'll be redirected back to worldaml.com/academy with immediate access.</li>
          <li>Sign in with the email on file (${to}) to start the course and download your certificate when finished.</li>
        </ol>
        <p style="margin:0 0 8px;font-size:13px;color:#475569;line-height:1.55;">
          If the button doesn't work, copy and paste this link into your browser:<br/>
          <a href="${paymentUrl}" style="color:#0d9488;word-break:break-all;">${paymentUrl}</a>
        </p>
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;" />
        <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.5;">
          Questions? Reply to this email or write to info@worldaml.com and our team will assist you.
        </p>
      </div>`;

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: "Complete your WorldAML Academy purchase — fresh payment link inside",
      html,
      reply_to: "info@worldaml.com",
    });

    return new Response(JSON.stringify({ ok: true, result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
