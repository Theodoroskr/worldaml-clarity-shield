// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const sessionId: string | undefined = body?.session_id;
    if (!sessionId || !sessionId.startsWith("cs_")) {
      return json({ error: "Missing or invalid session_id" }, 400);
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
      apiVersion: "2024-06-20",
    });

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent", "payment_intent.latest_charge", "invoice"],
    });

    const pi: any = session.payment_intent;
    const charge: any = pi?.latest_charge ?? null;
    const invoice: any = session.invoice ?? null;

    return json({
      session_id: session.id,
      payment_status: session.payment_status,
      amount_total: session.amount_total,
      currency: session.currency,
      created: session.created,
      payment_intent_id: typeof pi === "string" ? pi : pi?.id ?? null,
      charge_id: charge?.id ?? null,
      receipt_url: charge?.receipt_url ?? null,
      receipt_number: charge?.receipt_number ?? null,
      invoice_id: typeof invoice === "string" ? invoice : invoice?.id ?? null,
      invoice_number: invoice?.number ?? null,
      invoice_hosted_url: invoice?.hosted_invoice_url ?? null,
      invoice_pdf: invoice?.invoice_pdf ?? null,
      customer_email: session.customer_details?.email ?? null,
    });
  } catch (err: any) {
    console.error("get-academy-annual-receipt error:", err);
    return json({ error: err?.message ?? "Internal error" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
