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

const PLAN_QUOTA: Record<string, number> = { starter: 2000, compliance: 10000 };

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
    const quota = PLAN_QUOTA[plan] ?? 2000;

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
    if (subscriptionId) {
      try {
        const sub = await stripe.subscriptions.retrieve(subscriptionId);
        const end = (sub as unknown as { current_period_end?: number }).current_period_end;
        if (end) periodEnd = new Date(end * 1000).toISOString();
      } catch (_) { /* non-fatal */ }
    }

    // Idempotent: one row per Stripe subscription.
    const { data: existing } = await admin
      .from("screening_subscriptions")
      .select("id")
      .eq("stripe_subscription_id", subscriptionId ?? "")
      .maybeSingle();

    if (existing) {
      await admin
        .from("screening_subscriptions")
        .update({
          plan,
          status: "active",
          monitored_entity_quota: quota,
          current_period_end: periodEnd,
          stripe_customer_id: customerId,
          stripe_session_id: session.id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);
    } else {
      await admin.from("screening_subscriptions").insert({
        organisation_id: orgId,
        user_id: user.id,
        plan,
        status: "active",
        monitored_entity_quota: quota,
        current_period_end: periodEnd,
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
        stripe_session_id: session.id,
      });
    }

    await admin.rpc("ensure_default_screening_policy", { _org: orgId }).catch?.(() => {});

    // Internal purchase notification (best effort).
    try {
      await admin.from("product_purchase_notifications").insert({
        product: "WorldAML Screening & Monitoring",
        plan,
        user_id: user.id,
        email: user.email,
        amount_total: session.amount_total ?? null,
        currency: session.currency ?? null,
        stripe_session_id: session.id,
        status: "paid",
      });
    } catch (_) { /* non-fatal */ }

    return json({
      status: "active",
      plan,
      monitored_entity_quota: quota,
      current_period_end: periodEnd,
      organisation_id: orgId,
    });
  } catch (error) {
    console.error("[verify-worldaml-subscription]", error);
    return json({ error: "Service unavailable. Please try again." }, 500);
  }
});
