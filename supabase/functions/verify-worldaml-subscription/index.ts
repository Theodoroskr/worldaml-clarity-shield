import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  });

// Annual plan quotas. Enterprise is negotiated; null means unlimited.
const PLAN_QUOTA: Record<string, { search: number | null; monitor: number | null; seats: number | null }> = {
  demo: { search: 5, monitor: 0, seats: 1 },
  essentials: { search: 500, monitor: 100, seats: 1 },
  starter: { search: 1000, monitor: 200, seats: 3 },
  professional: { search: 2000, monitor: 500, seats: 5 },
  compliance: { search: 5000, monitor: 1000, seats: 10 },
  enterprise: { search: null, monitor: null, seats: null },
  api_starter: { search: 1000, monitor: 200, seats: 3 },
  api_professional: { search: 2000, monitor: 500, seats: 5 },
  api_compliance: { search: 5000, monitor: 1000, seats: 10 },
  // Legacy monthly mapping retained for compatibility.
  starter_legacy: { search: 2000, monitor: 2000, seats: 3 },
  compliance_legacy: { search: 10000, monitor: 10000, seats: 10 },
  essentials_legacy: { search: 500, monitor: 100, seats: 1 },
  professional_legacy: { search: 2000, monitor: 500, seats: 5 },
  starter_legacy_annual: { search: 1000, monitor: 200, seats: 3 },
  compliance_legacy_annual: { search: 5000, monitor: 1000, seats: 10 },
};

// Human-readable plan names shown on the confirmation page and in the email.
const PLAN_LABEL: Record<string, string> = {
  demo: "Free Demo",
  essentials: "Essentials",
  starter: "Starter",
  professional: "Professional",
  compliance: "Compliance",
  enterprise: "Enterprise",
  api_starter: "API Starter",
  api_professional: "API Professional",
  api_compliance: "API Compliance",
  essentials_legacy: "Essentials (legacy)",
  starter_legacy: "Starter (legacy)",
  starter_legacy_annual: "Starter (legacy annual)",
  professional_legacy: "Professional (legacy)",
  compliance_legacy: "Compliance (legacy)",
  compliance_legacy_annual: "Compliance (legacy annual)",
};

const formatMoney = (cents: number | null | undefined, currency: string | null | undefined) => {
  if (cents == null) return null;
  try {
    return new Intl.NumberFormat("en-IE", {
      style: "currency",
      currency: (currency ?? "eur").toUpperCase(),
    }).format(cents / 100);
  } catch {
    return `${(cents / 100).toFixed(2)} ${(currency ?? "EUR").toUpperCase()}`;
  }
};

const formatDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" }) : null;

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");


serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const admin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } },
  );

  try {
    // Ownership is derived from the bearer token — never from the request body.
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) return json({ error: "Authentication required" }, 401);
    const { data: userData } = await admin.auth.getUser(authHeader.replace("Bearer ", ""));
    const user = userData?.user;
    if (!user) return json({ error: "Authentication required" }, 401);

    let body: Record<string, unknown>;
    try {
      body = (await req.json()) as Record<string, unknown>;
    } catch {
      return json({ error: "Invalid request" }, 400);
    }

    const sessionId = body.session_id;
    if (typeof sessionId !== "string" || sessionId.length < 10 || sessionId.length > 300) {
      return json({ error: "Invalid request" }, 400);
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== "paid" && session.status !== "complete") {
      return json({ status: "pending" }, 202);
    }
    if ((session.metadata?.product ?? "") !== "worldaml") {
      return json({ error: "Invalid request" }, 400);
    }

    const plan = (session.metadata?.plan ?? "starter").toLowerCase();
    const quota = PLAN_QUOTA[plan] ?? PLAN_QUOTA.starter;

    // Resolve or create the buyer's organisation.
    const { data: membership } = await admin
      .from("suite_org_members")
      .select("organization_id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    let orgId = membership?.organization_id as string | undefined;

    if (!orgId) {
      const orgName =
        (user.user_metadata?.company_name as string | undefined)?.trim() ||
        (user.email ? user.email.split("@")[1] : "") ||
        "My Organisation";
      const { data: org, error: orgErr } = await admin
        .from("suite_organizations")
        .insert({ name: orgName, status: "active", subscription_tier: "screening", created_by: user.id })
        .select("id")
        .single();
      if (orgErr || !org) throw orgErr ?? new Error("Could not create organisation");
      orgId = org.id as string;
      await admin.from("suite_org_members").insert({ organization_id: orgId, user_id: user.id, role: "admin" });
    }

    const subscriptionId = typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id ?? null;
    const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id ?? null;

    let periodEnd: string | null = null;
    let periodStart: string | null = null;
    let receiptUrl: string | null = null;
    let interval: string | null = null;
    if (subscriptionId) {
      try {
        const sub = await stripe.subscriptions.retrieve(subscriptionId);
        const s = sub as unknown as {
          current_period_end?: number;
          current_period_start?: number;
          latest_invoice?: string | { hosted_invoice_url?: string | null };
          items?: { data?: Array<{ price?: { recurring?: { interval?: string } | null } }> };
        };
        if (s.current_period_end) periodEnd = new Date(s.current_period_end * 1000).toISOString();
        if (s.current_period_start) periodStart = new Date(s.current_period_start * 1000).toISOString();
        interval = s.items?.data?.[0]?.price?.recurring?.interval ?? null;
        const latest = s.latest_invoice;
        if (typeof latest === "string") {
          try {
            const inv = await stripe.invoices.retrieve(latest);
            receiptUrl = inv.hosted_invoice_url ?? null;
          } catch (_) { /* non-fatal */ }
        } else if (latest?.hosted_invoice_url) {
          receiptUrl = latest.hosted_invoice_url;
        }
      } catch (_) { /* non-fatal */ }
    }


    // Idempotent: one row per Stripe subscription.
    const { data: existing } = await admin
      .from("screening_subscriptions")
      .select("id")
      .eq("stripe_subscription_id", subscriptionId ?? "")
      .maybeSingle();

    const subscriptionPayload = {
      organisation_id: orgId,
      user_id: user.id,
      plan,
      status: "active",
      monitored_entity_quota: quota.monitor,
      search_quota_annual: quota.search,
      monitor_quota: quota.monitor,
      seat_quota: quota.seats,
      current_period_end: periodEnd,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      stripe_session_id: session.id,
      updated_at: new Date().toISOString(),
    };

    if (existing) {
      await admin.from("screening_subscriptions").update(subscriptionPayload).eq("id", existing.id);
    } else {
      await admin.from("screening_subscriptions").insert(subscriptionPayload);
    }

    // Keep the product_access registry in sync (source of truth for portal guards).
    const { data: existingAccess } = await admin
      .from("product_access")
      .select("id")
      .eq("organisation_id", orgId)
      .eq("product", "screening")
      .maybeSingle();

    const seatsUsed = (
      await admin
        .from("product_members")
        .select("id", { count: "exact", head: true })
        .eq("organisation_id", orgId)
        .eq("product", "screening")
    ).count ?? 0;

    const accessPayload = {
      organisation_id: orgId,
      product: "screening",
      plan,
      status: "active",
      seats: quota.seats,
      seats_used: seatsUsed,
      current_period_start: periodStart,
      current_period_end: periodEnd,
      started_at: periodStart,
      metadata: {
        search_quota_annual: quota.search,
        monitor_quota: quota.monitor,
        stripe_subscription_id: subscriptionId,
      },
      updated_at: new Date().toISOString(),
    };

    if (existingAccess) {
      await admin.from("product_access").update(accessPayload).eq("id", existingAccess.id);
    } else {
      await admin.from("product_access").insert(accessPayload);
    }

    // Ensure the buyer is a product admin.
    await admin.from("product_members").upsert({
      organisation_id: orgId,
      product: "screening",
      user_id: user.id,
      role: "admin",
      created_by: user.id,
    }, { onConflict: "organisation_id,product,user_id" });

    try {
      await admin.rpc("ensure_default_screening_policy", { _org: orgId });
    } catch (_) { /* non-fatal */ }

    // Internal purchase notification (best effort).
    try {
      await admin.from("product_purchase_notifications").insert({
        product: "WorldAML Screening & Monitoring",
        plan,
        customer_email: user.email,
        amount_cents: session.amount_total ?? null,
        currency: session.currency ?? null,
        stripe_session_id: session.id,
        mode: "subscription",
      });
    } catch (_) { /* non-fatal */ }

    return json({
      status: "active",
      plan,
      search_quota_annual: quota.search,
      monitor_quota: quota.monitor,
      monitored_entity_quota: quota.monitor,
      seat_quota: quota.seats,
      current_period_end: periodEnd,
      organisation_id: orgId,
    });
  } catch (error) {
    console.error("[verify-worldaml-subscription]", error);
    return json({ error: "Service unavailable. Please try again." }, 500);
  }
});
