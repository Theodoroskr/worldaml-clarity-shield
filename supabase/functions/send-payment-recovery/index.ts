// One-off recovery email sender. Admin-only. POST { to, name, courseTitle, amount, paymentUrl }
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Resend } from "npm:resend";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const FROM_EMAIL = "WorldAML Academy <info@worldaml.com>";

function esc(v: unknown): string {
  return String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function safeUrl(v: unknown): string | null {
  try {
    const u = new URL(String(v));
    if (u.protocol !== "https:") return null;
    return u.toString();
  } catch {
    return null;
  }
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "").trim();
    if (!token) return json({ error: "Unauthorized" }, 401);

    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const isServiceRole = serviceKey.length > 0 && token === serviceKey;

    if (!isServiceRole) {
      // Require a valid admin JWT
      const authed = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_ANON_KEY")!,
        { global: { headers: { Authorization: `Bearer ${token}` } } },
      );
      const { data: userData, error: userErr } = await authed.auth.getUser();
      if (userErr || !userData?.user) return json({ error: "Unauthorized" }, 401);

      const { data: isAdmin, error: roleErr } = await authed.rpc("has_role", {
        _user_id: userData.user.id,
        _role: "admin",
      });
      if (roleErr || isAdmin !== true) return json({ error: "Forbidden" }, 403);
    }

    const { to, name, courseTitle, amount, paymentUrl } = await req.json();
    const url = safeUrl(paymentUrl);
    if (!to || typeof to !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to) || !url || !courseTitle) {
      return json({ error: "missing or invalid fields" }, 400);
    }

    const apiKey = Deno.env.get("RESEND_API_KEY");
    if (!apiKey) throw new Error("RESEND_API_KEY not set");
    const resend = new Resend(apiKey);

    const greeting = name ? `Hi ${esc(String(name).split(" ")[0])},` : "Hi there,";
    const safeUrlHtml = esc(url);
    const html = `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#0f172a;background:#ffffff;">
        <h2 style="margin:0 0 12px;color:#0f172a;">Your WorldAML Academy checkout is ready to complete</h2>
        <p style="margin:0 0 14px;line-height:1.55;">${greeting}</p>
        <p style="margin:0 0 14px;line-height:1.55;">
          Thank you for choosing the <strong>${esc(courseTitle)}</strong> course at WorldAML Academy.
          Your previous Stripe checkout session expired before payment was completed, so no charge was made on your card.
        </p>
        <p style="margin:0 0 20px;line-height:1.55;">
          We've issued you a fresh, secure payment link${amount ? ` for <strong>${esc(amount)}</strong>` : ""}.
          Click the button below to complete your purchase — access to the course is unlocked automatically the moment payment is confirmed.
        </p>
        <p style="margin:0 0 28px;">
          <a href="${safeUrlHtml}"
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
          <li>Sign in with the email on file (${esc(to)}) to start the course and download your certificate when finished.</li>
        </ol>
        <p style="margin:0 0 8px;font-size:13px;color:#475569;line-height:1.55;">
          If the button doesn't work, copy and paste this link into your browser:<br/>
          <a href="${safeUrlHtml}" style="color:#0d9488;word-break:break-all;">${safeUrlHtml}</a>
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

    return json({ ok: true, result }, 200);
  } catch (err) {
    console.error("send-payment-recovery error", err);
    return json({ error: "Internal error" }, 500);
  }
});
