import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const VALID_CURRENCIES = ["EUR", "GBP", "USD"] as const;
type ValidCurrency = typeof VALID_CURRENCIES[number];

const REGION_PATTERN = /^[A-Za-z\s\-]{2,50}$/;

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
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return errorResponse("Authentication required", 401);
    }
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) {
      return errorResponse("Authentication required", 401);
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return errorResponse("Invalid request body");
    }

    const { userCount, currency, region } = body as Record<string, unknown>;

    // Strict input validation
    const userCountNum = Number(userCount);
    if (!Number.isInteger(userCountNum) || userCountNum < 1 || userCountNum > 10) {
      return errorResponse("Invalid request");
    }

    const currencyUpper = typeof currency === "string" ? currency.toUpperCase() : "";
    if (!VALID_CURRENCIES.includes(currencyUpper as ValidCurrency)) {
      return errorResponse("Invalid request");
    }

    if (typeof region !== "string" || !REGION_PATTERN.test(region)) {
      return errorResponse("Invalid request");
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    const basePrices: Record<ValidCurrency, number> = {
      EUR: 3000,
      GBP: 2700,
      USD: 4900,
    };

    const basePrice = basePrices[currencyUpper as ValidCurrency];
    let totalPrice = 0;
    for (let i = 1; i <= userCountNum; i++) {
      let userPrice = basePrice;
      for (let j = 2; j <= i; j++) {
        userPrice = userPrice * 0.9;
      }
      totalPrice += Math.round(userPrice);
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: currencyUpper.toLowerCase(),
            product_data: {
              name: `WorldCompliance® Online - ${userCountNum} User${userCountNum > 1 ? "s" : ""} License`,
              description: `Annual subscription for ${userCountNum} user${userCountNum > 1 ? "s" : ""} - ${region}`,
            },
            unit_amount: totalPrice * 100,
            recurring: { interval: "year" },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${req.headers.get("origin")}/dashboard?subscription=success`,
      cancel_url: `${req.headers.get("origin")}/data-sources/worldcompliance/pricing?canceled=true`,
      metadata: {
        user_count: userCountNum.toString(),
        region,
        currency: currencyUpper,
      },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("[create-worldcompliance-checkout] Error:", error);
    return errorResponse("Service unavailable. Please try again later.", 500);
  }
});
