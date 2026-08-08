import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const FROM_EMAIL = "WorldAML <info@worldaml.com>";
const SALES_EMAIL = "compliance@infocreditgroup.com";
const SUPPORT_EMAIL = "WORLDAMLINFOCREDIT@infocreditgroup.com";

const escapeHtml = (s: unknown) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

interface PurchasePayload {
  customer_email: string;
  customer_name?: string;
  company?: string;
  country?: string;
  product: string;
  plan?: string;
  amount_label?: string;
  billing?: string;
  order_ref?: string;
  stripe_customer?: string;
  stripe_session?: string;
  purchased_at?: string;
  attribution?: string;
  admin_url?: string;
  /** Override recipients (used for internal test sends) */
  test_to?: string;
}

const row = (label: string, value: unknown) => `
  <tr>
    <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#6b7280;font-size:13px;width:180px;">${escapeHtml(label)}</td>
    <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#111827;font-size:13px;font-weight:600;">${escapeHtml(value || "—")}</td>
  </tr>`;

const customerHtml = (p: PurchasePayload) => `
<div style="font-family:Arial,Helvetica,sans-serif;max-width:620px;margin:0 auto;background:#ffffff;">
  <div style="background:#1e3a5f;padding:28px 32px;">
    <h1 style="color:#ffffff;margin:0;font-size:20px;font-weight:700;letter-spacing:.5px;">WorldAML</h1>
  </div>
  <div style="padding:32px;">
    <h2 style="color:#111827;font-size:22px;margin:0 0 16px;">Thank you for your purchase</h2>
    <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 16px;">
      Hi ${escapeHtml(p.customer_name || "there")},
    </p>
    <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 24px;">
      We've received your order and your payment was successful. Thank you for choosing WorldAML.
    </p>
    <table style="width:100%;border-collapse:collapse;border:1px solid #e5e7eb;border-radius:6px;margin-bottom:24px;">
      ${row("Product", p.product)}
      ${row("Plan", p.plan)}
      ${row("Billing", p.billing || p.amount_label)}
      ${row("Order reference", p.order_ref)}
      ${row("Date", p.purchased_at)}
    </table>
    <div style="background:#f0fdfa;border-left:4px solid #0d9488;padding:16px 20px;margin-bottom:24px;">
      <p style="color:#134e4a;font-size:15px;line-height:1.6;margin:0;">
        <strong>What happens next</strong><br/>
        Our compliance team will contact you and activate your account
        <strong>within 2 business days</strong>. You'll receive your access credentials,
        API keys and onboarding details by email once activation is complete.
      </p>
    </div>
    <p style="color:#374151;font-size:14px;line-height:1.6;margin:0 0 24px;">
      If you need anything in the meantime, reply to this email or contact us at
      <a href="mailto:${SUPPORT_EMAIL}" style="color:#0d9488;">${SUPPORT_EMAIL}</a>.
    </p>
    <p style="color:#374151;font-size:14px;line-height:1.6;margin:0;">
      Kind regards,<br/>The WorldAML Team
    </p>
  </div>
  <div style="padding:16px 32px;border-top:1px solid #e5e7eb;">
    <p style="color:#9ca3af;font-size:12px;margin:0;">worldaml.com — Infocredit Group</p>
  </div>
</div>`;

const salesHtml = (p: PurchasePayload) => `
<div style="font-family:Arial,Helvetica,sans-serif;max-width:660px;margin:0 auto;background:#ffffff;">
  <div style="background:#1e3a5f;padding:24px 32px;">
    <h1 style="color:#ffffff;margin:0;font-size:18px;font-weight:700;">New purchase — activation required</h1>
  </div>
  <div style="padding:28px 32px;">
    <p style="color:#b91c1c;font-size:14px;font-weight:700;margin:0 0 20px;">
      ACTION REQUIRED — activate within 2 business days
    </p>

    <h3 style="color:#111827;font-size:15px;margin:0 0 8px;">Customer</h3>
    <table style="width:100%;border-collapse:collapse;border:1px solid #e5e7eb;margin-bottom:24px;">
      ${row("Name", p.customer_name)}
      ${row("Email", p.customer_email)}
      ${row("Company", p.company)}
      ${row("Country", p.country)}
    </table>

    <h3 style="color:#111827;font-size:15px;margin:0 0 8px;">Purchase</h3>
    <table style="width:100%;border-collapse:collapse;border:1px solid #e5e7eb;margin-bottom:24px;">
      ${row("Product", p.product)}
      ${row("Plan", p.plan)}
      ${row("Billing", p.billing || p.amount_label)}
      ${row("Payment status", "Paid")}
      ${row("Stripe customer", p.stripe_customer)}
      ${row("Stripe session", p.stripe_session)}
      ${row("Purchased at", p.purchased_at)}
    </table>

    ${p.attribution ? `<p style="color:#6b7280;font-size:13px;margin:0 0 24px;"><strong>Attribution:</strong> ${escapeHtml(p.attribution)}</p>` : ""}

    <div style="background:#fffbeb;border:1px solid #fcd34d;padding:18px 20px;border-radius:6px;">
      <p style="color:#92400e;font-size:14px;font-weight:700;margin:0 0 10px;">☑ Open task: Activate product</p>
      <ol style="color:#92400e;font-size:13px;line-height:1.7;margin:0;padding-left:18px;">
        <li>Provision the account / API keys for the purchased plan</li>
        <li>Contact the customer to confirm activation and schedule onboarding</li>
        <li>Mark the task complete in Admin → Purchases</li>
      </ol>
    </div>

    ${p.admin_url ? `<p style="margin:24px 0 0;"><a href="${escapeHtml(p.admin_url)}" style="display:inline-block;background:#0d9488;color:#fff;text-decoration:none;padding:12px 24px;border-radius:6px;font-weight:600;font-size:14px;">Open activation task in Admin →</a></p>` : ""}
  </div>
</div>`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const hookSecret = Deno.env.get("PURCHASE_EMAIL_HOOK_SECRET") ?? "";
    const auth = req.headers.get("Authorization")?.replace("Bearer ", "") ?? "";
    const authorized =
      (!!serviceRole && auth === serviceRole) || (!!hookSecret && auth === hookSecret);
    if (!authorized) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const p = (await req.json()) as PurchasePayload;
    if (!p?.customer_email || !p?.product) {
      return new Response(
        JSON.stringify({ error: "customer_email and product are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      return new Response(JSON.stringify({ error: "RESEND_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const resend = new Resend(resendApiKey);

    const customerTo = p.test_to || p.customer_email;
    const salesTo = p.test_to || SALES_EMAIL;

    const planLabel = p.plan ? `${p.product} (${p.plan})` : p.product;

    const customerRes = await resend.emails.send({
      from: FROM_EMAIL,
      to: [customerTo],
      reply_to: SUPPORT_EMAIL,
      subject: `Thank you for your purchase — ${planLabel}`,
      html: customerHtml(p),
    });

    const salesRes = await resend.emails.send({
      from: FROM_EMAIL,
      to: [salesTo],
      reply_to: p.customer_email,
      subject: `🔔 ACTION REQUIRED — New purchase: ${planLabel} — ${p.customer_name || p.customer_email}`,
      html: salesHtml(p),
    });

    console.log("purchase emails sent", { customerRes, salesRes });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("send-purchase-emails error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
