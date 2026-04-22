// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);

    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: claimsErr } = await userClient.auth.getClaims(token);
    if (claimsErr || !claims?.claims) return json({ error: "Unauthorized" }, 401);
    const userId = claims.claims.sub as string;

    const service = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Verify admin
    const { data: isAdmin } = await service.rpc("has_role", { _user_id: userId, _role: "admin" });
    if (!isAdmin) return json({ error: "Forbidden — admin only" }, 403);

    const { courseId } = await req.json().catch(() => ({}));
    if (!courseId) return json({ error: "courseId required" }, 400);

    const { data: course, error: courseErr } = await service
      .from("academy_courses")
      .select("id, slug, title, description, price_eur_cents, stripe_product_id, stripe_price_id")
      .eq("id", courseId)
      .single();
    if (courseErr || !course) return json({ error: "Course not found" }, 404);

    if (!course.price_eur_cents || course.price_eur_cents <= 0) {
      return json({ error: "Set a price (in EUR cents) before syncing to Stripe." }, 400);
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
      apiVersion: "2024-06-20",
    });

    // 1) Product: reuse if set, else create
    let productId = course.stripe_product_id ?? "";
    if (productId) {
      try {
        await stripe.products.update(productId, {
          name: course.title,
          description: course.description?.slice(0, 500) || undefined,
          metadata: { course_slug: course.slug, course_id: course.id },
        });
      } catch (e) {
        console.warn("Failed to update existing product, creating new:", e);
        productId = "";
      }
    }
    if (!productId) {
      const product = await stripe.products.create({
        name: course.title,
        description: course.description?.slice(0, 500) || undefined,
        metadata: { course_slug: course.slug, course_id: course.id },
      });
      productId = product.id;
    }

    // 2) Price: create new if amount changed or missing (Stripe prices are immutable)
    let priceId = course.stripe_price_id ?? "";
    let needNewPrice = !priceId;
    if (priceId) {
      try {
        const existing = await stripe.prices.retrieve(priceId);
        if (
          existing.product !== productId ||
          existing.unit_amount !== course.price_eur_cents ||
          existing.currency !== "eur"
        ) {
          needNewPrice = true;
          // Deactivate stale price
          try { await stripe.prices.update(priceId, { active: false }); } catch (_) { /* ignore */ }
        }
      } catch {
        needNewPrice = true;
      }
    }
    if (needNewPrice) {
      const price = await stripe.prices.create({
        product: productId,
        currency: "eur",
        unit_amount: course.price_eur_cents,
        metadata: { course_slug: course.slug },
      });
      priceId = price.id;
    }

    // 3) Persist back
    const { error: updErr } = await service
      .from("academy_courses")
      .update({ stripe_product_id: productId, stripe_price_id: priceId })
      .eq("id", course.id);
    if (updErr) return json({ error: updErr.message }, 500);

    return json({
      ok: true,
      stripe_product_id: productId,
      stripe_price_id: priceId,
      price_eur_cents: course.price_eur_cents,
    });
  } catch (err: any) {
    console.error("admin-sync-course-stripe error:", err);
    return json({ error: err?.message ?? "Internal error" }, 500);
  }
});
