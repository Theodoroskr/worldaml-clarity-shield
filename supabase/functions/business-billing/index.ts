import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const money = (amount: number | null | undefined, currency: string) =>
  amount == null ? "—" : new Intl.NumberFormat("en-GB", { style: "currency", currency: currency.toUpperCase() }).format(amount / 100);

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    );
    const { data: userData, error: userError } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );
    const { data: account } = await admin
      .from("business_accounts")
      .select("id, stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();

    const { customerId } = await resolveStripeCustomer({
      storedCustomerId: (account?.stripe_customer_id as string | null) ?? null,
      verifyCustomer: async (id) => {
        const c = await stripe.customers.retrieve(id);
        return !(c as any).deleted;
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

    if (!customerId) {
      return new Response(JSON.stringify({ subscriptions: [], invoices: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }


    const [subs, invoices] = await Promise.all([
      stripe.subscriptions.list({ customer: customerId, status: "all", limit: 20 }),
      stripe.invoices.list({ customer: customerId, limit: 20 }),
    ]);

    // Resolve product names separately (Stripe allows max 4 expand levels)
    const productIds = new Set<string>();
    for (const s of subs.data) {
      const p = s.items.data[0]?.price?.product;
      if (typeof p === "string") productIds.add(p);
    }
    const productNames = new Map<string, string>();
    await Promise.all(
      [...productIds].map(async (id) => {
        try {
          const prod = await stripe.products.retrieve(id);
          if (!(prod as any).deleted && (prod as any).name) productNames.set(id, (prod as any).name);
        } catch (_) { /* ignore */ }
      }),
    );

    const subscriptions = subs.data
      .filter((s) => ["active", "trialing", "past_due", "unpaid"].includes(s.status))
      .map((s) => {
        const item = s.items.data[0];
        const price = item?.price;
        const productRef = price?.product;
        const product =
          typeof productRef === "string"
            ? productNames.get(productRef)
            : (productRef as any)?.name;

        return {
          id: s.id,
          product: product || "WorldAML plan",
          status: s.status,
          amount: money(price?.unit_amount ?? null, price?.currency ?? "eur"),
          interval: price?.recurring?.interval ?? null,
          current_period_end: (item as any)?.current_period_end
            ? new Date((item as any).current_period_end * 1000).toISOString()
            : (s as any).current_period_end
              ? new Date((s as any).current_period_end * 1000).toISOString()
              : null,
          cancel_at_period_end: !!s.cancel_at_period_end,
        };
      });

    const invoiceRows = invoices.data.map((i) => ({
      id: i.id,
      number: i.number ?? null,
      status: i.status ?? "unknown",
      amount: money(i.amount_paid || i.amount_due, i.currency),
      created: new Date(i.created * 1000).toISOString(),
      pdf: i.invoice_pdf ?? null,
    }));

    return new Response(JSON.stringify({ subscriptions, invoices: invoiceRows }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[BUSINESS-BILLING] error", message);
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
