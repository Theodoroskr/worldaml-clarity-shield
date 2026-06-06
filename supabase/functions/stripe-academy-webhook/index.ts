// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Resend } from "npm:resend";

// Public webhook — no CORS needed for Stripe callbacks, but include for browser debugging
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "stripe-signature, content-type",
};

const ADMIN_ALERT_EMAIL = "theodoros@infocreditgroup.com";
const FROM_EMAIL = "WorldAML <info@worldaml.com>";

async function notifyAdminPaymentIssue(params: {
  eventType: string;
  sessionId?: string | null;
  paymentIntentId?: string | null;
  customerEmail?: string | null;
  amount?: number | null;
  currency?: string | null;
  reason?: string | null;
  courseSlug?: string | null;
}) {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) {
    console.warn("RESEND_API_KEY not set — skipping admin alert");
    return;
  }
  try {
    const resend = new Resend(apiKey);
    const amountFmt =
      params.amount != null
        ? `${(params.amount / 100).toFixed(2)} ${(params.currency ?? "eur").toUpperCase()}`
        : "—";
    const rows = [
      ["Event", params.eventType],
      ["Course", params.courseSlug ?? "—"],
      ["Customer", params.customerEmail ?? "—"],
      ["Amount", amountFmt],
      ["Reason", params.reason ?? "—"],
      ["Checkout Session", params.sessionId ?? "—"],
      ["Payment Intent", params.paymentIntentId ?? "—"],
      ["Time (UTC)", new Date().toISOString()],
    ];
    const html = `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#0f172a;">
        <h2 style="margin:0 0 16px;color:#b91c1c;">Academy payment ${params.eventType}</h2>
        <p style="margin:0 0 16px;">A Stripe payment did not complete successfully. Details below:</p>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          ${rows
            .map(
              ([k, v]) =>
                `<tr><td style="padding:6px 8px;border:1px solid #e2e8f0;background:#f8fafc;font-weight:600;width:160px;">${k}</td><td style="padding:6px 8px;border:1px solid #e2e8f0;word-break:break-all;">${v}</td></tr>`,
            )
            .join("")}
        </table>
        <p style="margin:16px 0 0;font-size:12px;color:#64748b;">Review in Admin → Purchase Status, or in the Stripe Dashboard.</p>
      </div>`;
    await resend.emails.send({
      from: FROM_EMAIL,
      to: [ADMIN_ALERT_EMAIL],
      subject: `[WorldAML] Payment ${params.eventType}${params.customerEmail ? ` — ${params.customerEmail}` : ""}`,
      html,
    });
  } catch (err) {
    console.error("Failed to send admin alert email:", err);
  }
}

async function sendCustomerRecoveryEmail(params: {
  supabase: ReturnType<typeof createClient>;
  sessionId: string | null;
  paymentIntentId?: string | null;
  toEmail: string | null;
  courseSlug: string | null;
  amountCents: number | null;
  currency: string | null;
  failureReason: string | null;
}) {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) {
    console.warn("RESEND_API_KEY not set — skipping customer recovery email");
    return;
  }
  if (!params.toEmail) {
    console.warn("No customer email available — skipping recovery email");
    return;
  }
  if (!params.sessionId && !params.paymentIntentId) {
    console.warn("No session/PI id — cannot dedupe recovery email, skipping");
    return;
  }

  // Dedupe + load course title in one go
  const query = params.sessionId
    ? params.supabase.from("academy_course_purchases").select("id,course_slug,recovery_email_sent_at").eq("stripe_session_id", params.sessionId).maybeSingle()
    : params.supabase.from("academy_course_purchases").select("id,course_slug,recovery_email_sent_at").eq("stripe_payment_intent_id", params.paymentIntentId!).maybeSingle();
  const { data: row } = await query;
  if (!row) {
    console.warn("No purchase row found for recovery email");
    return;
  }
  if (row.recovery_email_sent_at) {
    console.log("Recovery email already sent for purchase", row.id);
    return;
  }

  const slug = params.courseSlug ?? row.course_slug ?? null;

  // Fetch course title (best-effort)
  let courseTitle = slug ?? "your WorldAML Academy course";
  if (slug) {
    const { data: course } = await params.supabase
      .from("academy_courses")
      .select("title")
      .eq("slug", slug)
      .maybeSingle();
    if (course?.title) courseTitle = course.title;
  }

  const retryUrl = slug
    ? `https://worldaml.com/academy/${slug}`
    : "https://worldaml.com/academy";
  const amountFmt =
    params.amountCents != null
      ? `${(params.amountCents / 100).toFixed(2)} ${(params.currency ?? "eur").toUpperCase()}`
      : null;

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#0f172a;background:#ffffff;">
      <h2 style="margin:0 0 12px;color:#0f172a;">Your payment didn't go through</h2>
      <p style="margin:0 0 16px;line-height:1.55;">
        Hi there,
      </p>
      <p style="margin:0 0 16px;line-height:1.55;">
        We weren't able to complete your purchase of
        <strong>${courseTitle}</strong>${amountFmt ? ` (${amountFmt})` : ""}.
        ${params.failureReason ? `Stripe reported: <em>${params.failureReason}</em>.` : "This sometimes happens when a card is declined, a 3-D Secure prompt times out, or the checkout window is closed."}
      </p>
      <p style="margin:0 0 24px;line-height:1.55;">
        Your spot is still available — you can try again with the same card or a different payment method:
      </p>
      <p style="margin:0 0 24px;">
        <a href="${retryUrl}"
           style="display:inline-block;background:#0d9488;color:#ffffff;text-decoration:none;font-weight:600;padding:12px 22px;border-radius:6px;">
          Retry your purchase
        </a>
      </p>
      <p style="margin:0 0 8px;font-size:13px;color:#475569;line-height:1.55;">
        If you keep seeing an error, just reply to this email and our team will help you get sorted.
      </p>
      <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;" />
      <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.5;">
        You're receiving this because a checkout was started on worldaml.com with this email address. This is a one-time transactional message — no further emails will be sent about this attempt.
      </p>
    </div>`;

  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: FROM_EMAIL,
      to: [params.toEmail],
      subject: `Your WorldAML Academy payment didn't go through — try again`,
      html,
    });
    await params.supabase
      .from("academy_course_purchases")
      .update({ recovery_email_sent_at: new Date().toISOString() })
      .eq("id", row.id);
  } catch (err) {
    console.error("Failed to send customer recovery email:", err);
  }
}


serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
    apiVersion: "2024-06-20",
  });

  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET not set");
    return new Response(JSON.stringify({ error: "Webhook secret not configured" }), {
      status: 500, headers: corsHeaders,
    });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return new Response(JSON.stringify({ error: "Missing signature" }), {
      status: 400, headers: corsHeaders,
    });
  }

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(rawBody, signature, webhookSecret);
  } catch (err: any) {
    console.error("Signature verification failed:", err.message);
    return new Response(JSON.stringify({ error: "Invalid signature" }), {
      status: 400, headers: corsHeaders,
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const sessionId = session.id;
      const paymentIntentId =
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent?.id;

      const now = new Date();
      const expiresAt = new Date(now);
      expiresAt.setMonth(expiresAt.getMonth() + 1);

      const { error } = await supabase
        .from("academy_course_purchases")
        .update({
          status: "paid",
          stripe_payment_intent_id: paymentIntentId ?? null,
          paid_at: now.toISOString(),
          expires_at: expiresAt.toISOString(),
        })
        .eq("stripe_session_id", sessionId);

      if (error) {
        console.error("Failed to mark purchases paid:", error);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500, headers: corsHeaders,
        });
      }
    }

    if (event.type === "charge.refunded") {
      const charge = event.data.object as Stripe.Charge;
      const paymentIntentId =
        typeof charge.payment_intent === "string"
          ? charge.payment_intent
          : charge.payment_intent?.id;
      if (paymentIntentId) {
        const { error } = await supabase
          .from("academy_course_purchases")
          .update({ status: "refunded", expires_at: null })
          .eq("stripe_payment_intent_id", paymentIntentId);
        if (error) console.error("Failed to mark refunded:", error);
      }
    }

    if (
      event.type === "checkout.session.expired" ||
      event.type === "checkout.session.async_payment_failed"
    ) {
      const session = event.data.object as Stripe.Checkout.Session;
      const sessionId = session.id;

      // Fetch existing purchase row for context
      const { data: purchase } = await supabase
        .from("academy_course_purchases")
        .select("course_slug,user_id,amount_cents,currency,status")
        .eq("stripe_session_id", sessionId)
        .maybeSingle();

      // Only flag rows that aren't already paid
      if (!purchase || purchase.status !== "paid") {
        const { error } = await supabase
          .from("academy_course_purchases")
          .update({ status: "failed" })
          .eq("stripe_session_id", sessionId)
          .neq("status", "paid");
        if (error) console.error("Failed to mark purchase failed:", error);
      }

      const customerEmail =
        session.customer_details?.email ?? session.customer_email ?? null;

      await notifyAdminPaymentIssue({
        eventType: event.type,
        sessionId,
        paymentIntentId:
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : session.payment_intent?.id ?? null,
        customerEmail,
        amount: session.amount_total ?? purchase?.amount_cents ?? null,
        currency: session.currency ?? purchase?.currency ?? null,
        courseSlug: purchase?.course_slug ?? null,
        reason:
          event.type === "checkout.session.expired"
            ? "Checkout session expired before payment completed"
            : "Asynchronous payment failed",
      });

      await sendCustomerRecoveryEmail({
        supabase,
        sessionId,
        paymentIntentId:
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : session.payment_intent?.id ?? null,
        toEmail: customerEmail,
        courseSlug: purchase?.course_slug ?? null,
        amountCents: session.amount_total ?? purchase?.amount_cents ?? null,
        currency: session.currency ?? purchase?.currency ?? null,
        failureReason:
          event.type === "checkout.session.expired"
            ? "the checkout session expired before payment completed"
            : "the asynchronous payment failed",
      });
    }

    if (event.type === "payment_intent.payment_failed") {
      const pi = event.data.object as Stripe.PaymentIntent;
      const paymentIntentId = pi.id;

      const { data: purchase } = await supabase
        .from("academy_course_purchases")
        .select("course_slug,stripe_session_id,amount_cents,currency,status")
        .eq("stripe_payment_intent_id", paymentIntentId)
        .maybeSingle();

      if (purchase && purchase.status !== "paid") {
        const { error } = await supabase
          .from("academy_course_purchases")
          .update({ status: "failed" })
          .eq("stripe_payment_intent_id", paymentIntentId)
          .neq("status", "paid");
        if (error) console.error("Failed to mark PI failed:", error);
      }

      await notifyAdminPaymentIssue({
        eventType: event.type,
        sessionId: purchase?.stripe_session_id ?? null,
        paymentIntentId,
        customerEmail: pi.receipt_email ?? null,
        amount: pi.amount ?? purchase?.amount_cents ?? null,
        currency: pi.currency ?? purchase?.currency ?? null,
        courseSlug: purchase?.course_slug ?? null,
        reason:
          pi.last_payment_error?.message ??
          pi.last_payment_error?.code ??
          "Payment intent failed",
      });
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("Webhook handler error:", err);
    return new Response(JSON.stringify({ error: err?.message ?? "Internal error" }), {
      status: 500, headers: corsHeaders,
    });
  }
});

