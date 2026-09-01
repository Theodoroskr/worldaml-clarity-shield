import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient, SupabaseClient } from "npm:@supabase/supabase-js@2.57.2";
import { provisionEntitlement } from "../_shared/business/provision.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  });

const log = (step: string, details?: unknown) =>
  console.log(`[business-quote-activate] ${step}${details ? ` - ${JSON.stringify(details)}` : ""}`);

const VALID_PRODUCTS = ["screening", "suite", "academy"];

/** Finds (or creates) the organisation that owns the buyer's entitlements. */
async function resolveOrganisation(
  admin: SupabaseClient,
  userId: string,
  account: { id?: string; organisation_id?: string | null; company_name?: string | null } | null,
  contactEmail: string,
): Promise<string> {
  if (account?.organisation_id) return account.organisation_id;

  const { data: member } = await admin
    .from("product_members")
    .select("organisation_id")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();
  if (member?.organisation_id) {
    if (account?.id) {
      await admin.from("business_accounts").update({ organisation_id: member.organisation_id }).eq("id", account.id);
    }
    return member.organisation_id as string;
  }

  const { data: org, error } = await admin
    .from("suite_organizations")
    .insert({
      name: account?.company_name || contactEmail,
      primary_contact_email: contactEmail,
      created_by: userId,
      status: "active",
    })
    .select("id")
    .single();
  if (error) throw error;

  if (account?.id) {
    await admin.from("business_accounts").update({ organisation_id: org.id }).eq("id", account.id);
  }
  await admin.from("suite_org_members").upsert(
    { organization_id: org.id, user_id: userId, role: "admin" },
    { onConflict: "organization_id,user_id", ignoreDuplicates: true },
  );
  return org.id as string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Not authenticated" }, 401);

    const anon = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_ANON_KEY") ?? "");
    const { data: userData } = await anon.auth.getUser(authHeader.replace("Bearer ", ""));
    const user = userData?.user;
    if (!user?.email) return json({ error: "Not authenticated" }, 401);

    const body = await req.json().catch(() => ({}));
    const sessionId = typeof body.session_id === "string" ? body.session_id : null;
    if (!sessionId) return json({ error: "session_id is required" }, 400);

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) return json({ error: "Payments are not configured" }, 500);
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const quoteId = session.metadata?.quote_id;
    if (!quoteId) return json({ error: "This payment is not linked to a quote." }, 400);
    if (session.payment_status !== "paid" && session.status !== "complete") {
      return json({ status: "pending" });
    }

    const { data: quote, error: quoteError } = await admin
      .from("business_quote_requests")
      .select("*")
      .eq("id", quoteId)
      .eq("user_id", user.id)
      .maybeSingle();
    if (quoteError) throw quoteError;
    if (!quote) return json({ error: "Quote not found" }, 404);
    if (quote.status === "won") return json({ status: "already_active", product: quote.quoted_product_key });

    const { data: account } = await admin
      .from("business_accounts")
      .select("id, organisation_id, company_name, stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();

    const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id ?? null;
    if (customerId && account?.id && account.stripe_customer_id !== customerId) {
      await admin.from("business_accounts").update({ stripe_customer_id: customerId }).eq("id", account.id);
    }

    const product = String(quote.quoted_product_key ?? "");
    const subscriptionId = typeof session.subscription === "string" ? session.subscription : session.subscription?.id ?? null;
    let periodEnd: string | null = null;
    if (subscriptionId) {
      const sub = await stripe.subscriptions.retrieve(subscriptionId);
      const ts = sub.items?.data?.[0]?.current_period_end ??
        (sub as unknown as { current_period_end?: number }).current_period_end;
      periodEnd = ts ? new Date(ts * 1000).toISOString() : null;
    } else {
      const months = quote.quoted_interval === "month" ? 1 : 12;
      periodEnd = new Date(Date.now() + months * 30 * 864e5).toISOString();
    }

    if (VALID_PRODUCTS.includes(product)) {
      const orgId = await resolveOrganisation(admin, user.id, account, user.email);
      const seats = Math.max(1, Number(quote.seats) || 1);

      await provisionEntitlement(admin, {
        userId: user.id,
        businessAccountId: account?.id ?? null,
        organisationId: orgId,
        product: product as "screening" | "suite" | "academy",
        planCode: quote.plan ?? "enterprise",
        seats,
        source: "quote",
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscriptionId,
        interval: quote.quoted_interval === "month" ? "month" : "year",
        currentPeriodEnd: periodEnd,
        metadata: { quote_id: quote.id, stripe_session_id: session.id },
      });
      log("Entitlement provisioned", { org: orgId, product, quote: quote.id });
    } else {
      log("Quote has no provisionable product key", { quote: quote.id, product });
    }

    await admin
      .from("business_quote_requests")
      .update({ status: "won", stripe_subscription_id: subscriptionId })
      .eq("id", quote.id);

    return json({ status: "active", product });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log("Error", message);
    return json({ error: message }, 500);
  }
});
