// One-off: send AML toolkit access email to a specific recipient.
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

    const to = "sarwar_0901@yahoo.com";
    const toolkitUrl = "https://academy.worldaml.com/templates";
    const coursesUrl = "https://academy.worldaml.com";

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;background:#fff;">
        <div style="background:#1e3a5f;padding:28px 32px;">
          <h1 style="color:#fff;margin:0;font-size:20px;font-weight:700;letter-spacing:0.5px;">WorldAML Academy</h1>
        </div>
        <div style="padding:28px 32px;color:#374151;font-size:15px;line-height:1.6;">
          <p>Hi Shahbaz,</p>
          <p>Thank you for subscribing to the <strong>WorldAML Academy Annual Pass</strong>. Your subscription includes full access to the <strong>MLRO Pro Toolkit</strong> — a library of regulator-ready Word and Excel templates (board reports, enterprise risk assessments, SAR logs, and more) aligned with FATF, 6AMLD, FCA, and MOKAS guidance.</p>
          <p>You can access the toolkit here:</p>
          <p style="margin:24px 0;">
            <a href="${toolkitUrl}" style="display:inline-block;background:#0d9488;color:#fff;text-decoration:none;padding:12px 28px;border-radius:6px;font-weight:600;font-size:14px;">
              Open MLRO Toolkit →
            </a>
          </p>
          <p>Please make sure you are signed in with the same email address you used at checkout so the toolkit unlocks automatically.</p>
          <p>You can also browse all your Academy courses here: <a href="${coursesUrl}" style="color:#0d9488;">${coursesUrl}</a></p>
          <p>If you have any questions or trouble accessing the templates, just reply to this email.</p>
          <p style="margin-top:28px;">Best regards,<br/>The WorldAML Team</p>
        </div>
        <div style="padding:16px 32px;border-top:1px solid #e5e7eb;">
          <p style="color:#9ca3af;font-size:12px;margin:0;">WorldAML · info@worldaml.com</p>
        </div>
      </div>
    `;

    const { data, error } = await resend.emails.send({
      from: "WorldAML Academy <academy@worldaml.com>",
      to: [to],
      subject: "Your MLRO Pro Toolkit — included with your Annual Pass",
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
