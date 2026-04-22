// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// Public webhook — no CORS needed for Stripe callbacks, but include for browser debugging
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "stripe-signature, content-type",
};

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
