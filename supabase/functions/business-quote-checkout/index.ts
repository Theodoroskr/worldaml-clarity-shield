import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import { resolveStripeCustomer } from "../business-billing/customer.ts";

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
  console.log(`[business-quote-checkout] ${step}${details ? ` - ${JSON.stringify(details)}` : ""}`);

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Not authenticated" }, 401);

    const anon = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_ANON_KEY") ?? "");
    const { data: userData, error: userError } = await anon.auth.getUser(authHeader.replace("Bearer ", ""));
    if (userError || !userData.user?.email) return json({ error: "Not authenticated" }, 401);
    const user = userData.user;

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return json({ error: "Invalid request body" }, 400);
    }
    const quoteId = typeof body.quote_id === "string" ? body.quote_id : null;
    if (!quoteId) return json({ error: "quote_id is required" }, 400);

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) return json({ error: "Payments are not configured" }, 500);
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    // The quote must belong to the caller and carry a published offer.
    const { data: quote, error: quoteError } = await admin
      .from("business_quote_requests")
      .select("*")
      .eq("id", quoteId)
      .eq("user_id", user.id)
      .maybeSingle();
    if (quoteError) throw quoteError;
    if (!quote) return json({ error: "Quote not found" }, 404);
    if (!quote.quoted_amount_cents && !quote.quoted_price_id) {
      return json({ error: "This quote does not have a price yet." }, 409);
    }
    if (["won", "closed"].includes(quote.status)) {
      return json({ error: "This quote is no longer open." }, 409);
    }
    if (quote.quote_valid_until && new Date(quote.quote_valid_until).getTime() < Date.now()) {
      return json({ error: "This quote has expired. Please ask for a new one." }, 409);
    }

    const { data: account } = await admin
      .from("business_accounts")
      .select("id, stripe_customer_id, company_name")
      .eq("user_id", user.id)
      .maybeSingle();

    const { customerId: existingCustomer } = await resolveStripeCustomer({
      storedCustomerId: (account?.stripe_customer_id as string | null) ?? null,
      verifyCustomer: async (id) => {
        const c = await stripe.customers.retrieve(id);
        return !(c as { deleted?: boolean }).deleted;
      },
      findCustomerByEmail: async () => {
        const list = await stripe.customers.list({ email: user.email!, limit: 1 });
        return list.data[0]?.id ?? null;
      },
      persistCustomerId: async (id) => {
        if (!account?.id) return;
        await admin.from("business_accounts").update({ stripe_customer_id: id }).eq("id", account.id);
      },
    });

    const interval = (quote.quoted_interval as string) ?? "year";
    const recurring = interval === "month" || interval === "year";
    const quantity = Math.max(1, Number(quote.seats) || 1);

    const lineItem = quote.quoted_price_id
      ? { price: quote.quoted_price_id as string, quantity }
      : {
          quantity,
          price_data: {
            currency: ((quote.quoted_currency as string) || "eur").toLowerCase(),
            unit_amount: Math.round(Number(quote.quoted_amount_cents) / quantity),
            ...(recurring ? { recurring: { interval: interval as "month" | "year" } } : {}),
            product_data: {
              name: `${quote.product}${quote.plan ? ` — ${quote.plan}` : ""} (quote ${String(quote.id).slice(0, 8)})`,
            },
          },
        };

    const origin = req.headers.get("origin") ?? "https://www.worldaml.com";
    const session = await stripe.checkout.sessions.create({
      customer: existingCustomer ?? undefined,
      customer_email: existingCustomer ? undefined : user.email,
      line_items: [lineItem],
      mode: recurring ? "subscription" : "payment",
      billing_address_collection: "auto",
      success_url: `${origin}/business/quotes?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/business/quotes?canceled=1`,
      metadata: {
        quote_id: String(quote.id),
        product_key: String(quote.quoted_product_key ?? ""),
        user_id: user.id,
      },
    });

    await admin
      .from("business_quote_requests")
      .update({
        status: "accepted",
        accepted_at: new Date().toISOString(),
        stripe_checkout_session_id: session.id,
      })
      .eq("id", quote.id);

    log("Checkout created", { quote: quote.id, session: session.id, mode: session.mode });
    return json({ url: session.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log("Error", message);
    return json({ error: message }, 500);
  }
});
