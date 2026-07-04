import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const COUPON_ID = "seminar-suite-20";
const ACADEMY_COUPON_ID = "academy-paid-30";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Fetch all scheduled items that are due
    const nowIso = new Date().toISOString();
    const { data: due, error: dueErr } = await supabase
      .from("outreach_queue")
      .select("*")
      .eq("status", "scheduled")
      .lte("scheduled_at", nowIso)
      .limit(50);

    if (dueErr) throw dueErr;

    const processed: any[] = [];

    for (const item of due ?? []) {
      // Re-verify eligibility at send time
      const { data: eligibility } = await supabase.rpc(
        "is_eligible_for_sales_outreach",
        { _user_id: item.user_id },
      );
      if (!eligibility?.eligible) {
        await supabase.from("outreach_queue").update({
          status: "skipped",
          skip_reason: eligibility?.reason ?? "not_eligible",
        }).eq("id", item.id);
        processed.push({ id: item.id, action: "skipped", reason: eligibility?.reason });
        continue;
      }

      // Load recipient name
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("user_id", item.user_id)
        .maybeSingle();

      let promoCode: string | null = item.promo_code ?? null;
      const templateData: Record<string, unknown> = {};

      // Generate a unique per-user Stripe promotion code for the seminar discount
      if (item.template_id === "seminar-discount-suite" && !promoCode) {
        try {
          const code = `SEMINAR-${item.user_id.split("-")[0].toUpperCase()}-${
            Math.random().toString(36).slice(2, 6).toUpperCase()
          }`;
          const expires = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60;
          const promo = await stripe.promotionCodes.create({
            coupon: COUPON_ID,
            code,
            max_redemptions: 1,
            expires_at: expires,
            metadata: {
              user_id: item.user_id,
              queue_id: item.id,
              trigger: "seminar_completion",
            },
          });
          promoCode = promo.code;
        } catch (e) {
          console.error("Stripe promo code creation failed", e);
          await supabase.from("outreach_queue").update({
            status: "failed",
            skip_reason: `stripe_promo_failed: ${(e as Error).message}`,
          }).eq("id", item.id);
          processed.push({ id: item.id, action: "failed", reason: "stripe_promo_failed" });
          continue;
        }
      }
      if (promoCode) templateData.promoCode = promoCode;

      // Send via send-upsell-email with internal secret
      const sendRes = await fetch(`${supabaseUrl}/functions/v1/send-upsell-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-internal-secret": serviceKey,
          "apikey": serviceKey,
        },
        body: JSON.stringify({
          recipientEmail: profile?.email ?? item.recipient_email,
          recipientName: profile?.full_name ?? "",
          templateId: item.template_id,
          templateData,
        }),
      });

      const sendJson = await sendRes.json().catch(() => ({}));

      if (!sendRes.ok || sendJson?.error) {
        await supabase.from("outreach_queue").update({
          status: "failed",
          skip_reason: sendJson?.error ?? `http_${sendRes.status}`,
          promo_code: promoCode,
        }).eq("id", item.id);
        processed.push({ id: item.id, action: "failed", reason: sendJson?.error });
        continue;
      }

      await supabase.from("outreach_queue").update({
        status: "sent",
        sent_at: new Date().toISOString(),
        promo_code: promoCode,
      }).eq("id", item.id);
      processed.push({ id: item.id, action: "sent" });
    }

    return new Response(JSON.stringify({ success: true, processed }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("process-outreach-queue error:", err);
    return new Response(JSON.stringify({ error: (err as Error).message ?? "Internal error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
