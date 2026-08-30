import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const log = (step: string, details?: unknown) =>
  console.log(`[stripe-worldaml-webhook] ${step}${details ? ` - ${JSON.stringify(details)}` : ""}`);

// Map Stripe subscription statuses onto the statuses used by
// current_user_screening_entitlement / the screening console.
function mapStatus(stripeStatus: string): string {
  switch (stripeStatus) {
    case "active":
    case "trialing":
      return "active";
    case "past_due":
    case "unpaid":
      return "past_due";
    case "canceled":
    case "incomplete_expired":
      return "cancelled";
    case "incomplete":
      return "incomplete";
    case "paused":
      return "paused";
    default:
      return stripeStatus;
  }
}

function periodEndOf(sub: Stripe.Subscription): string | null {
  // Basil API: current_period_end lives on the subscription item.
  const ts =
    sub.items?.data?.[0]?.current_period_end ??
    (sub as unknown as { current_period_end?: number }).current_period_end;
  return ts ? new Date(ts * 1000).toISOString() : null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WORLDAML_WEBHOOK_SECRET");
  if (!stripeKey || !webhookSecret) {
    log("Missing configuration", { stripeKey: !!stripeKey, webhookSecret: !!webhookSecret });
    return json({ error: "Webhook not configured" }, 500);
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) return json({ error: "Missing signature" }, 400);

  const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );

  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
  } catch (err) {
    log("Signature verification failed", err instanceof Error ? err.message : String(err));
    return json({ error: "Invalid signature" }, 400);
  }

  log("Event received", { type: event.type, id: event.id });

  try {
    switch (event.type) {
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const update = {
          status: mapStatus(sub.status),
          current_period_end: periodEndOf(sub),
          updated_at: new Date().toISOString(),
        };
        const { error, count } = await admin
          .from("screening_subscriptions")
          .update(update)
          .eq("stripe_subscription_id", sub.id)
          .select("id", { count: "exact", head: true });
        if (error) throw error;
        log("Subscription synced", { subscription: sub.id, status: update.status, rows: count });
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subRef = (invoice as unknown as { subscription?: string | { id: string } | null }).subscription;
        const subId = typeof subRef === "string" ? subRef : subRef?.id ?? null;
        if (subId) {
          const { error } = await admin
            .from("screening_subscriptions")
            .update({ status: "past_due", updated_at: new Date().toISOString() })
            .eq("stripe_subscription_id", subId);
          if (error) throw error;
          log("Marked past_due", { subscription: subId });
        }
        break;
      }

      case "checkout.session.completed": {
        // Belt-and-braces: confirm the entitlement even if the user closed the
        // success tab before verify-worldaml-subscription ran.
        const session = event.data.object as Stripe.Checkout.Session;
        const subRef = session.subscription;
        const subId = typeof subRef === "string" ? subRef : subRef?.id ?? null;
        if (session.mode === "subscription" && subId) {
          const sub = await stripe.subscriptions.retrieve(subId);
          const { error } = await admin
            .from("screening_subscriptions")
            .update({
              status: mapStatus(sub.status),
              current_period_end: periodEndOf(sub),
              updated_at: new Date().toISOString(),
            })
            .eq("stripe_subscription_id", subId);
          if (error) throw error;
          log("Checkout confirmed", { subscription: subId, status: sub.status });
        }
        break;
      }

      default:
        log("Event ignored", { type: event.type });
    }
  } catch (err) {
    log("Handler error", err instanceof Error ? err.message : String(err));
    return json({ error: "Handler failed" }, 500);
  }

  return json({ received: true });
});
