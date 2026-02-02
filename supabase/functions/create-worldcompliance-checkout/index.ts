import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");

    const { userCount, currency, region } = await req.json();
    
    if (!userCount || userCount < 1 || userCount > 10) {
      throw new Error("Invalid user count");
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { 
      apiVersion: "2025-08-27.basil" 
    });

    // Check for existing customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    // Calculate total based on progressive pricing
    const basePrices: Record<string, number> = {
      'EUR': 3000,
      'GBP': 2700,
      'USD': 4900,
    };
    
    const basePrice = basePrices[currency] || basePrices['EUR'];
    let totalPrice = 0;
    for (let i = 1; i <= userCount; i++) {
      let userPrice = basePrice;
      for (let j = 2; j <= i; j++) {
        userPrice = userPrice * 0.9;
      }
      totalPrice += Math.round(userPrice);
    }

    // Create checkout session with calculated price
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: `WorldCompliance® Online - ${userCount} User${userCount > 1 ? 's' : ''} License`,
              description: `Annual subscription for ${userCount} user${userCount > 1 ? 's' : ''} - ${region}`,
            },
            unit_amount: totalPrice * 100, // Convert to cents
            recurring: {
              interval: 'year',
            },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${req.headers.get("origin")}/dashboard?subscription=success`,
      cancel_url: `${req.headers.get("origin")}/data-sources/worldcompliance/pricing?canceled=true`,
      metadata: {
        user_count: userCount.toString(),
        region: region,
        currency: currency,
      },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Checkout error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
