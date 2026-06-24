// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Sentinel slug used in academy_course_purchases to represent the annual all-access pass.
// useAcademyPurchases / useCourseGate treat an active row with this slug as access to every paid course.
export const ANNUAL_PASS_SLUG = "__annual_pass__";

// EUR base price (€199). Keep in sync with the Academy page copy.
const ANNUAL_EUR_CENTS = 19900;

// FX — mirror create-academy-checkout / src/lib/academyFx.ts
const RATES: Record<string, number> = { eur: 1, usd: 1.08, gbp: 0.86, inr: 90 };

// INR PPP override for the annual pass — keeps it accessible.
const INR_PPP_ANNUAL_CENTS = 699900; // ₹6,999

const convert = (eurCents: number, currency: string) => {
  if (currency === "inr") return INR_PPP_ANNUAL_CENTS;
  return Math.round(eurCents * (RATES[currency] ?? 1));
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    );
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const body = await req.json().catch(() => ({}));
    const currency: string = (body?.currency ?? "eur").toLowerCase();
    const guestEmailRaw: string | undefined =
      typeof body?.guestEmail === "string" ? body.guestEmail.trim().toLowerCase() : undefined;

    if (!RATES[currency]) return json({ error: "Unsupported currency" }, 400);

    // Resolve user: authenticated or guest (mirrors create-academy-checkout)
    let userId: string | undefined;
    let userEmail: string | undefined;
    let isGuest = false;

    const authHeader = req.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "");
      const { data: userData } = await supabase.auth.getUser(token);
      if (userData?.user) {
        userId = userData.user.id;
        userEmail = userData.user.email ?? undefined;
      }
    }

    if (!userId) {
      if (!guestEmailRaw || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmailRaw)) {
        return json({ error: "A valid email is required to check out." }, 400);
      }
      isGuest = true;
      userEmail = guestEmailRaw;

      const findByEmail = async (email: string) => {
        for (let page = 1; page <= 50; page++) {
          const { data, error } = await serviceClient.auth.admin.listUsers({ page, perPage: 100 });
          if (error || !data?.users?.length) return null;
          const hit = data.users.find((u) => u.email?.toLowerCase() === email);
          if (hit) return hit;
          if (data.users.length < 100) return null;
        }
        return null;
      };

      let user = await findByEmail(guestEmailRaw);
      if (!user) {
        const created = await serviceClient.auth.admin.createUser({
          email: guestEmailRaw,
          email_confirm: false,
          user_metadata: { source: "academy_annual_guest_checkout" },
        });
        if (created.error) {
          user = await findByEmail(guestEmailRaw);
          if (!user) {
            console.error("createUser failed:", created.error);
            return json({ error: "Could not start checkout. Please try signing in instead." }, 500);
          }
        } else {
          user = created.data.user!;
        }
      }
      userId = user.id;
    }

    // Already has an active annual pass? Block duplicate purchase.
    const { data: existing } = await serviceClient
      .from("academy_course_purchases")
      .select("expires_at")
      .eq("user_id", userId)
      .eq("course_slug", ANNUAL_PASS_SLUG)
      .eq("status", "paid");

    const now = Date.now();
    const hasActive = (existing ?? []).some(
      (r: any) => !r.expires_at || new Date(r.expires_at).getTime() > now,
    );
    if (hasActive) {
      return json({ error: "You already have an active annual pass." }, 400);
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
      apiVersion: "2024-06-20",
    });

    let customerId: string | undefined;
    if (userEmail) {
      const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
      customerId = customers.data[0]?.id;
    }

    const unitAmount = convert(ANNUAL_EUR_CENTS, currency);
    const origin = req.headers.get("origin") ?? "https://www.worldaml.com";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer: customerId,
      customer_email: customerId ? undefined : userEmail,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency,
            unit_amount: unitAmount,
            product_data: {
              name: "WorldAML Academy — Annual All-Access Pass",
              description: "12 months unlimited access to every Academy course. Certificates never expire.",
            },
          },
        },
      ],
      success_url: `${origin}/academy?purchase=success&pass=annual`,
      cancel_url: `${origin}/academy?purchase=cancelled`,
      metadata: {
        user_id: userId,
        kind: "annual_pass",
        course_slugs: ANNUAL_PASS_SLUG,
        is_guest: isGuest ? "1" : "0",
      },
    });

    const { error: insertErr } = await serviceClient
      .from("academy_course_purchases")
      .insert([{
        user_id: userId,
        course_slug: ANNUAL_PASS_SLUG,
        amount_cents: unitAmount,
        currency,
        status: "pending",
        stripe_session_id: session.id,
      }]);
    if (insertErr) {
      console.error("Failed to insert pending annual-pass row:", insertErr);
    }

    return json({ url: session.url });
  } catch (err: any) {
    console.error("create-academy-annual-checkout error:", err);
    return json({ error: err?.message ?? "Internal error" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
