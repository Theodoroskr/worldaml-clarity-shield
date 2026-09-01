// Shared provisioning for Business entitlements.
// Every path that grants product access (quote activation, demo claim,
// self-serve checkout, webhook renewal, admin manual grant) goes through
// provisionEntitlement so access is created one way only.
import type { SupabaseClient } from "npm:@supabase/supabase-js@2.57.2";

export type ProvisionOptions = {
  userId: string; // owner to attach as product_members admin
  businessAccountId?: string | null;
  organisationId: string;
  product: "screening" | "suite" | "academy";
  planCode: string;
  seats?: number;
  source?: "self_serve" | "quote" | "manual";
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  stripePriceId?: string | null;
  amountCents?: number | null;
  currency?: string;
  interval?: "month" | "year" | "one_time";
  status?: "trialing" | "active" | "past_due" | "canceled" | "paused" | "incomplete";
  currentPeriodStart?: string | null;
  currentPeriodEnd?: string | null;
  metadata?: Record<string, unknown>;
  // screening-specific quotas (omit to leave existing values untouched)
  screeningQuotas?: { searchQuotaAnnual?: number; monitorQuota?: number };
};

const log = (step: string, details?: unknown) =>
  console.log(`[provision] ${step}${details ? ` - ${JSON.stringify(details)}` : ""}`);

export async function provisionEntitlement(
  admin: SupabaseClient,
  opts: ProvisionOptions,
): Promise<{ subscriptionId: string | null }> {
  const seats = Math.max(1, opts.seats ?? 1);
  const now = new Date().toISOString();
  const status = opts.status ?? "active";

  // 1. business_subscriptions — the commercial record.
  let subId: string | null = null;
  if (opts.stripeSubscriptionId) {
    const { data } = await admin
      .from("business_subscriptions")
      .select("id")
      .eq("stripe_subscription_id", opts.stripeSubscriptionId)
      .maybeSingle();
    subId = data?.id ?? null;
  }
  if (!subId) {
    const { data } = await admin
      .from("business_subscriptions")
      .select("id")
      .eq("organisation_id", opts.organisationId)
      .eq("product", opts.product)
      .in("status", ["trialing", "active", "past_due", "paused"])
      .limit(1)
      .maybeSingle();
    subId = data?.id ?? null;
  }

  const subRow = {
    organisation_id: opts.organisationId,
    product: opts.product,
    plan_code: opts.planCode,
    seats,
    status,
    current_period_start: opts.currentPeriodStart ?? now,
    current_period_end: opts.currentPeriodEnd ?? null,
    source: opts.source ?? "self_serve",
    metadata: opts.metadata ?? {},
    updated_at: now,
    ...(opts.stripeCustomerId ? { stripe_customer_id: opts.stripeCustomerId } : {}),
    ...(opts.stripeSubscriptionId ? { stripe_subscription_id: opts.stripeSubscriptionId } : {}),
    ...(opts.stripePriceId ? { stripe_price_id: opts.stripePriceId } : {}),
    ...(opts.amountCents != null ? { amount_cents: opts.amountCents } : {}),
    ...(opts.currency ? { currency: opts.currency } : {}),
    ...(opts.interval ? { interval: opts.interval } : {}),
  };

  if (subId) {
    const { error } = await admin.from("business_subscriptions").update(subRow).eq("id", subId);
    if (error) throw error;
  } else {
    // Resolve the business account from the organisation when the caller
    // didn't pass one (e.g. webhook-triggered renewals). When the org has
    // no business account at all (e.g. direct demo claims), skip the
    // commercial row — product_access below still grants the access.
    let accountId = opts.businessAccountId ?? null;
    if (!accountId) {
      const { data } = await admin
        .from("business_accounts")
        .select("id")
        .eq("organisation_id", opts.organisationId)
        .limit(1)
        .maybeSingle();
      accountId = data?.id ?? null;
    }
    if (accountId) {
      const { data, error } = await admin
        .from("business_subscriptions")
        .insert({ ...subRow, business_account_id: accountId })
        .select("id")
        .single();
      if (error) throw error;
      subId = data.id as string;
    } else {
      log("No business account for org — skipping commercial row", { org: opts.organisationId });
    }
  }

  // 2. product_access — the access registry every portal guard reads.
  const { data: existingAccess } = await admin
    .from("product_access")
    .select("id")
    .eq("organisation_id", opts.organisationId)
    .eq("product", opts.product)
    .maybeSingle();

  const accessRow = {
    organisation_id: opts.organisationId,
    product: opts.product,
    plan: opts.planCode,
    status: status === "trialing" ? "trial" : status === "past_due" ? "active" : status === "paused" ? "suspended" : status === "canceled" ? "cancelled" : "active",
    seats,
    current_period_start: opts.currentPeriodStart ?? now,
    current_period_end: opts.currentPeriodEnd ?? null,
    started_at: now,
    metadata: { source: opts.source ?? "self_serve", ...(opts.metadata ?? {}) },
    updated_at: now,
  };
  if (existingAccess) {
    const { error } = await admin.from("product_access").update(accessRow).eq("id", existingAccess.id);
    if (error) throw error;
  } else {
    const { error } = await admin.from("product_access").insert({ ...accessRow, seats_used: 1 });
    if (error) throw error;
  }

  // 3. product_members — owner seat.
  const { error: memberError } = await admin.from("product_members").upsert(
    {
      organisation_id: opts.organisationId,
      product: opts.product,
      user_id: opts.userId,
      role: "admin",
      created_by: opts.userId,
    },
    { onConflict: "organisation_id,product,user_id" },
  );
  if (memberError) throw memberError;

  // 4. screening_subscriptions — screening quota record.
  if (opts.product === "screening") {
    const { data: existingSub } = await admin
      .from("screening_subscriptions")
      .select("id")
      .eq("organisation_id", opts.organisationId)
      .maybeSingle();
    const screeningRow: Record<string, unknown> = {
      organisation_id: opts.organisationId,
      plan: opts.planCode,
      status: status === "trialing" ? "active" : status === "canceled" ? "cancelled" : status,
      seat_quota: seats,
      current_period_end: opts.currentPeriodEnd ?? null,
      updated_at: now,
    };
    if (opts.stripeSubscriptionId) screeningRow.stripe_subscription_id = opts.stripeSubscriptionId;
    if (opts.stripeCustomerId) screeningRow.stripe_customer_id = opts.stripeCustomerId;
    if (opts.screeningQuotas?.searchQuotaAnnual != null) screeningRow.search_quota_annual = opts.screeningQuotas.searchQuotaAnnual;
    if (opts.screeningQuotas?.monitorQuota != null) {
      screeningRow.monitor_quota = opts.screeningQuotas.monitorQuota;
      screeningRow.monitored_entity_quota = opts.screeningQuotas.monitorQuota;
    }
    if (existingSub) {
      const { error } = await admin.from("screening_subscriptions").update(screeningRow).eq("id", existingSub.id);
      if (error) throw error;
    } else {
      const { error } = await admin.from("screening_subscriptions").insert({ ...screeningRow, user_id: opts.userId });
      if (error) throw error;
    }
  }

  log("Entitlement provisioned", { org: opts.organisationId, product: opts.product, plan: opts.planCode, subId });
  return { subscriptionId: subId };
}
