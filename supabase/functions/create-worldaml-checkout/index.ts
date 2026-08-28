import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Legacy prices preserved for existing customers — never reused for new pricing.
const LEGACY_PRICES: Record<string, string> = {
  essentials_legacy: "price_1U9NUCLz1lUQpGdDcU0HY0k2",
  starter_legacy_annual: "price_1U9NUDLz1lUQpGdDw8qxmjng",
  professional_legacy: "price_1U9NUELz1lUQpGdDKpRJEy9I",
  compliance_legacy_annual: "price_1U9NUELz1lUQpGdD44gsuBzO",
  starter_legacy: "price_1SzfOKLz1lUQpGdDOeGRsgdn",
  compliance_legacy: "price_1SzfPqLz1lUQpGdDDtgsGVbp",
};

// New annual pricing. Each plan resolves to a Stripe price configured as a secret.
// Checkout stays disabled until the correct annual price is explicitly mapped.
const PRICE_ENV_BY_PLAN: Record<string, string> = {
  essentials: "STRIPE_PRICE_SCREENING_ESSENTIALS",
  starter: "STRIPE_PRICE_SCREENING_STARTER",
  professional: "STRIPE_PRICE_SCREENING_PROFESSIONAL",
  compliance: "STRIPE_PRICE_SCREENING_COMPLIANCE",
  api_starter: "STRIPE_PRICE_SCREENING_API_STARTER",
  api_professional: "STRIPE_PRICE_SCREENING_API_PROFESSIONAL",
  api_compliance: "STRIPE_PRICE_SCREENING_API_COMPLIANCE",
};

const resolvePrice = (plan: string): string | undefined => {
  const envKey = PRICE_ENV_BY_PLAN[plan];
  if (envKey) {
    const value = Deno.env.get(envKey);
    return value && value.startsWith("price_") ? value : undefined;
  }
  return LEGACY_PRICES[plan];
};

const VALID_PLANS = [...Object.keys(PRICE_ENV_BY_PLAN), ...Object.keys(LEGACY_PRICES)];

const errorResponse = (message: string, status = 400) =>
  new Response(JSON.stringify({ error: message }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  });

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    // Guest checkout: auth optional. Stripe collects email when no session.
    let userEmail: string | undefined;
    const authHeader = req.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "");
      const { data } = await supabaseClient.auth.getUser(token);
      if (data.user?.email) userEmail = data.user.email;
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return errorResponse("Invalid request body");
    }

    const { plan } = body as Record<string, unknown>;

    // Strict whitelist validation
    if (typeof plan !== "string" || !VALID_PLANS.includes(plan.toLowerCase())) {
      return errorResponse("Invalid request");
    }

    const normalizedPlan = plan.toLowerCase();
    const priceId = resolvePrice(normalizedPlan);
    if (!priceId) {
      console.error("[create-worldaml-checkout] No Stripe price mapped for plan", normalizedPlan);
      return errorResponse(
        "Online checkout for this plan is not available yet. Please contact sales.",
        409
      );
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    let customerId: string | undefined;
    if (userEmail) {
      const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
      if (customers.data.length > 0) customerId = customers.data[0].id;
    }

    const origin = req.headers.get("origin") ?? "https://www.worldaml.com";
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: !customerId && userEmail ? userEmail : undefined,
      // NOTE: `customer_creation` is only valid in `payment` mode. In subscription
      // mode Stripe always creates/attaches a Customer automatically.
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      success_url: `${origin}/screening/activate?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/platform/aml-screening?canceled=true#packages`,
      metadata: { plan: normalizedPlan, product: "worldaml", guest: userEmail ? "0" : "1" },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("[create-worldaml-checkout] Error:", error);
    return errorResponse("Service unavailable. Please try again later.", 500);
  }
});
