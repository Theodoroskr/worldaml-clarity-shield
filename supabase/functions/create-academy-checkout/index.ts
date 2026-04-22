// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// FX rates — keep in sync with src/lib/academyFx.ts
const RATES: Record<string, number> = { eur: 1, usd: 1.08, gbp: 0.86 };

// Pricing — keep in sync with src/data/academyPricing.ts
// stripeProductId is required for a course to be purchasable.
const PRICING: Record<string, { eurCents: number; stripeProductId: string }> = {
  "crypto-aml-essentials": { eurCents: 4900, stripeProductId: "" },
  "aml-compliance-eu": { eurCents: 2900, stripeProductId: "" },
  "aml-compliance-uk": { eurCents: 2900, stripeProductId: "" },
  "aml-compliance-cyprus": { eurCents: 2900, stripeProductId: "" },
  "aml-compliance-canada": { eurCents: 2900, stripeProductId: "" },
  "aml-compliance-caribbean": { eurCents: 2900, stripeProductId: "" },
  "aml-compliance-united-states": { eurCents: 2900, stripeProductId: "" },
  "sanctions-compliance": { eurCents: 2900, stripeProductId: "" },
  "pep-screening-adverse-media": { eurCents: 2900, stripeProductId: "" },
  "transaction-monitoring-fundamentals": { eurCents: 2900, stripeProductId: "" },
  "suspicious-activity-reporting": { eurCents: 2900, stripeProductId: "" },
  "risk-based-approach": { eurCents: 2900, stripeProductId: "" },
  "beneficial-ownership-ubo": { eurCents: 2900, stripeProductId: "" },
  "compliance-officer-essentials": { eurCents: 2900, stripeProductId: "" },
  "regulatory-reporting-essentials": { eurCents: 2900, stripeProductId: "" },
  "travel-rule-wire-transfers": { eurCents: 2900, stripeProductId: "" },
};

const FREE_COURSES = new Set(["aml-fundamentals", "sanctions-screening-essentials"]);

const computeDiscountPct = (count: number) => (count >= 3 ? 10 : count === 2 ? 5 : 0);
const convert = (eurCents: number, currency: string) =>
  Math.round(eurCents * (RATES[currency] ?? 1));

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // ----- Auth -----
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return json({ error: "Unauthorized" }, 401);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: claimsErr } = await supabase.auth.getClaims(token);
    if (claimsErr || !claims?.claims) return json({ error: "Unauthorized" }, 401);

    const userId = claims.claims.sub as string;
    const userEmail = (claims.claims.email as string) ?? undefined;

    // ----- Input -----
    const body = await req.json().catch(() => ({}));
    const courseSlugs: string[] = Array.isArray(body?.courseSlugs) ? body.courseSlugs : [];
    const currency: string = (body?.currency ?? "eur").toLowerCase();

    if (courseSlugs.length === 0) return json({ error: "No courses provided" }, 400);
    if (!RATES[currency]) return json({ error: "Unsupported currency" }, 400);

    // Dedupe
    const unique = Array.from(new Set(courseSlugs));
    for (const slug of unique) {
      if (FREE_COURSES.has(slug)) {
        return json({ error: `${slug} is a free course and cannot be purchased.` }, 400);
      }
    }

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Load DB-managed course pricing (overrides hardcoded PRICING when present)
    const { data: dbCourses } = await serviceClient
      .from("academy_courses")
      .select("slug, price_eur_cents, stripe_product_id, stripe_price_id, is_published")
      .in("slug", unique);

    const dbBySlug = new Map<string, any>((dbCourses ?? []).map((c: any) => [c.slug, c]));

    // Resolve pricing per slug (DB first, then hardcoded fallback)
    const resolved: Record<string, { eurCents: number; stripeProductId: string; stripePriceId?: string }> = {};
    for (const slug of unique) {
      const db = dbBySlug.get(slug);
      if (db && db.is_published === false) {
        return json({ error: `${slug} is not currently available.` }, 400);
      }
      if (db?.stripe_product_id && db?.price_eur_cents > 0) {
        resolved[slug] = {
          eurCents: db.price_eur_cents,
          stripeProductId: db.stripe_product_id,
          stripePriceId: db.stripe_price_id ?? undefined,
        };
        continue;
      }
      const fallback = PRICING[slug];
      if (!fallback) return json({ error: `Unknown course: ${slug}` }, 400);
      if (!fallback.stripeProductId) {
        return json({ error: `${slug} is not yet available for purchase.` }, 400);
      }
      resolved[slug] = { eurCents: fallback.eurCents, stripeProductId: fallback.stripeProductId };
    }
    const { data: existing } = await serviceClient
      .from("academy_course_purchases")
      .select("course_slug, expires_at")
      .eq("user_id", userId)
      .eq("status", "paid")
      .in("course_slug", unique);

    const now = Date.now();
    const activeSlugs = new Set(
      (existing ?? [])
        .filter((r: any) => !r.expires_at || new Date(r.expires_at).getTime() > now)
        .map((r: any) => r.course_slug as string),
    );
    const slugsToBuy = unique.filter((s) => !activeSlugs.has(s));
    if (slugsToBuy.length === 0) {
      return json({ error: "You already have active access to all selected courses." }, 400);
    }

    // ----- Stripe -----
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
      apiVersion: "2024-06-20",
    });

    // Find or create a Stripe customer for this user
    let customerId: string | undefined;
    if (userEmail) {
      const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
      customerId = customers.data[0]?.id;
    }

    // Build line items
    const lineItems = slugsToBuy.map((slug) => {
      const { eurCents, stripeProductId } = PRICING[slug];
      const unitAmount = convert(eurCents, currency);
      return {
        quantity: 1,
        price_data: {
          currency,
          unit_amount: unitAmount,
          product: stripeProductId,
        },
      };
    });

    // Bundle discount (single coupon for the whole basket)
    const discountPct = computeDiscountPct(slugsToBuy.length);
    let discounts: { coupon: string }[] | undefined;
    if (discountPct > 0) {
      const coupon = await stripe.coupons.create({
        percent_off: discountPct,
        duration: "once",
        name: `${discountPct}% bundle discount`,
        max_redemptions: 1,
      });
      discounts = [{ coupon: coupon.id }];
    }

    const origin = req.headers.get("origin") ?? "https://www.worldaml.com";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer: customerId,
      customer_email: customerId ? undefined : userEmail,
      line_items: lineItems,
      discounts,
      success_url: `${origin}/academy?purchase=success`,
      cancel_url: `${origin}/academy?purchase=cancelled`,
      metadata: {
        user_id: userId,
        course_slugs: slugsToBuy.join(","),
        discount_pct: String(discountPct),
      },
    });

    // Insert pending rows (one per course) sharing the session id
    const subtotalCents = slugsToBuy.reduce(
      (sum, slug) => sum + convert(PRICING[slug].eurCents, currency),
      0,
    );
    const totalAfterDiscount = Math.round(subtotalCents * (1 - discountPct / 100));

    // Distribute discount proportionally; absorb any rounding remainder on the last row
    let allocated = 0;
    const rows = slugsToBuy.map((slug, idx) => {
      const lineCents = convert(PRICING[slug].eurCents, currency);
      let chargeable: number;
      if (idx === slugsToBuy.length - 1) {
        chargeable = totalAfterDiscount - allocated;
      } else {
        chargeable = Math.round(lineCents * (totalAfterDiscount / subtotalCents));
        allocated += chargeable;
      }
      return {
        user_id: userId,
        course_slug: slug,
        amount_cents: chargeable,
        currency,
        status: "pending",
        stripe_session_id: session.id,
      };
    });

    const { error: insertErr } = await serviceClient
      .from("academy_course_purchases")
      .insert(rows);
    if (insertErr) {
      console.error("Failed to insert pending rows:", insertErr);
      // Don't block — webhook will reconcile via session.id, but log loudly
    }

    return json({ url: session.url });
  } catch (err: any) {
    console.error("create-academy-checkout error:", err);
    return json({ error: err?.message ?? "Internal error" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
