import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const VALID_PLANS = ["starter", "compliance"] as const;
type ValidPlan = typeof VALID_PLANS[number];

const WORLDAML_PRICES: Record<ValidPlan, string> = {
  starter: "price_1SzfOKLz1lUQpGdDOeGRsgdn",
  compliance: "price_1SzfPqLz1lUQpGdDDtgsGVbp",
};

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
    if (typeof plan !== "string" || !VALID_PLANS.includes(plan.toLowerCase() as ValidPlan)) {
      return errorResponse("Invalid request");
    }

    const normalizedPlan = plan.toLowerCase() as ValidPlan;
    const priceId = WORLDAML_PRICES[normalizedPlan];

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
      customer_creation: customerId ? undefined : "always",
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      success_url: `${origin}/dashboard?subscription=success&product=worldaml&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing?canceled=true`,
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
