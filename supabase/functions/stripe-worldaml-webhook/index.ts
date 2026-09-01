import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

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

// Map onto business_subscriptions' status set.
function mapBusinessStatus(stripeStatus: string): string {
  switch (stripeStatus) {
    case "active":
      return "active";
    case "trialing":
      return "trialing";
    case "past_due":
    case "unpaid":
      return "past_due";
    case "paused":
      return "paused";
    case "incomplete":
      return "incomplete";
    default:
      return "canceled";
  }
}

function periodEndOf(sub: Stripe.Subscription): string | null {
  // Basil API: current_period_end lives on the subscription item.
  const ts =
    sub.items?.data?.[0]?.current_period_end ??
    (sub as unknown as { current_period_end?: number }).current_period_end;
  return ts ? new Date(ts * 1000).toISOString() : null;
}

function periodStartOf(sub: Stripe.Subscription): string | null {
  const ts =
    sub.items?.data?.[0]?.current_period_start ??
    (sub as unknown as { current_period_start?: number }).current_period_start;
  return ts ? new Date(ts * 1000).toISOString() : null;
}

function invoiceSubscriptionId(invoice: Stripe.Invoice): string | null {
  const ref = (invoice as unknown as { subscription?: string | { id: string } | null }).subscription;
  return typeof ref === "string" ? ref : ref?.id ?? null;
}

const tsToIso = (ts?: number | null) => (ts ? new Date(ts * 1000).toISOString() : null);

/** Sync one Stripe subscription into the business commercial layer + access registry. */
async function syncBusinessSubscription(admin: SupabaseClient, sub: Stripe.Subscription) {
  const periodEnd = periodEndOf(sub);
  const periodStart = periodStartOf(sub);
  const status = mapBusinessStatus(sub.status);
  const now = new Date().toISOString();
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer?.id ?? null;

  const { data: bizSub, error } = await admin
    .from("business_subscriptions")
    .update({
      status,
      current_period_start: periodStart,
      current_period_end: periodEnd,
      cancel_at_period_end: sub.cancel_at_period_end ?? false,
      canceled_at: tsToIso((sub as unknown as { canceled_at?: number | null }).canceled_at),
      trial_end: tsToIso(sub.trial_end),
      updated_at: now,
    })
    .eq("stripe_subscription_id", sub.id)
    .select("id, organisation_id, product")
    .maybeSingle();
  if (error) throw error;
  if (!bizSub) {
    log("No business subscription matched", { subscription: sub.id });
    return;
  }

  // Roll the access registry forward/back in lockstep.
  const accessStatus =
    status === "trialing" ? "trial" :
    status === "active" || status === "past_due" || status === "incomplete" ? "active" :
    status === "paused" ? "suspended" : "cancelled";
  const { error: accessErr } = await admin
    .from("product_access")
    .update({
      status: accessStatus,
      current_period_start: periodStart,
      current_period_end: periodEnd,
      updated_at: now,
    })
    .eq("organisation_id", bizSub.organisation_id)
    .eq("product", bizSub.product);
  if (accessErr) throw accessErr;

  if (bizSub.product === "screening") {
    const { error: screenErr } = await admin
      .from("screening_subscriptions")
      .update({
        status: status === "canceled" ? "cancelled" : status === "trialing" ? "active" : status,
        current_period_end: periodEnd,
        stripe_customer_id: customerId ?? undefined,
        updated_at: now,
      })
      .eq("organisation_id", bizSub.organisation_id);
    if (screenErr) throw screenErr;
  }

  log("Business subscription synced", { subscription: sub.id, status, org: bizSub.organisation_id });
}

/** Persist a Stripe invoice into business_invoices. */
async function upsertBusinessInvoice(admin: SupabaseClient, invoice: Stripe.Invoice) {
  const subId = invoiceSubscriptionId(invoice);
  const { data: bizSub } = subId
    ? await admin
        .from("business_subscriptions")
        .select("id, business_account_id, organisation_id")
        .eq("stripe_subscription_id", subId)
        .maybeSingle()
    : { data: null };

  let accountId = bizSub?.business_account_id ?? null;
  const customerId = typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id ?? null;
  if (!accountId && customerId) {
    const { data: account } = await admin
      .from("business_accounts")
      .select("id")
      .eq("stripe_customer_id", customerId)
      .maybeSingle();
    accountId = account?.id ?? null;
  }
  if (!accountId) {
    log("Invoice has no matching business account", { invoice: invoice.id });
    return;
  }

  const row = {
    business_account_id: accountId,
    organisation_id: bizSub?.organisation_id ?? null,
    business_subscription_id: bizSub?.id ?? null,
    stripe_invoice_id: invoice.id,
    number: invoice.number ?? null,
    status: invoice.status ?? "open",
    amount_due_cents: invoice.amount_due ?? 0,
    amount_paid_cents: invoice.amount_paid ?? 0,
    currency: (invoice.currency ?? "eur").toUpperCase(),
    hosted_invoice_url: invoice.hosted_invoice_url ?? null,
    invoice_pdf_url: invoice.invoice_pdf ?? null,
    period_start: tsToIso(invoice.period_start),
    period_end: tsToIso(invoice.period_end),
    paid_at: invoice.status === "paid" ? now() : null,
    due_at: tsToIso(invoice.due_date),
    updated_at: now(),
  };
  const { error } = await admin
    .from("business_invoices")
    .upsert(row, { onConflict: "stripe_invoice_id" });
  if (error) throw error;
  log("Invoice upserted", { invoice: invoice.id, status: invoice.status });
}

const now = () => new Date().toISOString();

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

  // Idempotency: skip events we've already processed (Stripe retries on 5xx).
  const { data: seen } = await admin
    .from("stripe_webhook_events")
    .select("id")
    .eq("stripe_event_id", event.id)
    .maybeSingle();
  if (seen) {
    log("Duplicate event skipped", { id: event.id });
    return json({ received: true, duplicate: true });
  }

  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        // Legacy sync for screening_subscriptions (keep existing behaviour).
        const update = {
          status: mapStatus(sub.status),
          current_period_end: periodEndOf(sub),
          updated_at: now(),
        };
        const { error, count } = await admin
          .from("screening_subscriptions")
          .update(update)
          .eq("stripe_subscription_id", sub.id)
          .select("id", { count: "exact", head: true });
        if (error) throw error;
        log("Subscription synced", { subscription: sub.id, status: update.status, rows: count });

        await syncBusinessSubscription(admin, sub);
        break;
      }

      case "invoice.paid":
      case "invoice.finalized": {
        const invoice = event.data.object as Stripe.Invoice;
        await upsertBusinessInvoice(admin, invoice);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subId = invoiceSubscriptionId(invoice);
        if (subId) {
          const { error } = await admin
            .from("screening_subscriptions")
            .update({ status: "past_due", updated_at: now() })
            .eq("stripe_subscription_id", subId);
          if (error) throw error;
          const { error: bizErr } = await admin
            .from("business_subscriptions")
            .update({ status: "past_due", updated_at: now() })
            .eq("stripe_subscription_id", subId);
          if (bizErr) throw bizErr;
          log("Marked past_due", { subscription: subId });
        }
        await upsertBusinessInvoice(admin, invoice);
        break;
      }

      case "checkout.session.completed": {
        // Belt-and-braces: confirm the entitlement even if the user closed the
        // success tab before the activation function ran.
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
              updated_at: now(),
            })
            .eq("stripe_subscription_id", subId);
          if (error) throw error;
          await syncBusinessSubscription(admin, sub);
          log("Checkout confirmed", { subscription: subId, status: sub.status });
        }
        break;
      }

      default:
        log("Event ignored", { type: event.type });
    }

    // Record the event only after its handlers succeed, so a failed handler
    // is retried by Stripe rather than swallowed.
    await admin.from("stripe_webhook_events").insert({
      stripe_event_id: event.id,
      event_type: event.type,
      payload: event.data.object as unknown as Record<string, unknown>,
    });
  } catch (err) {
    log("Handler error", err instanceof Error ? err.message : String(err));
    return json({ error: "Handler failed" }, 500);
  }

  return json({ received: true });
});
