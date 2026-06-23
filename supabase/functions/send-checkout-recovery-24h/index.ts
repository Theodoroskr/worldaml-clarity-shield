// deno-lint-ignore-file no-explicit-any
// 24-hour academy checkout recovery email. Runs hourly via pg_cron.
//
// Behaviour per abandoned basket (grouped by stripe_session_id):
//   1. Look up the original Stripe Checkout Session.
//   2. If the session is still `open` -> reuse its url.
//   3. If the session is `expired` (or unfetchable) -> re-mint a fresh
//      Checkout Session with the same line items + bundle discount, and
//      update the pending rows so the webhook can still match.
//   4. Send a single recovery email with that url.
//   5. Mark `recovery_email_24h_sent_at` so we never re-send.
//
// Window: pending purchases created between 22 hours and 7 days ago that
// have no 24h recovery email yet. The earlier 30-min nudge is handled by
// `send-checkout-recovery-nudge` and uses a separate column.

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Resend } from "npm:resend";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const FROM_EMAIL = "WorldAML <info@worldaml.com>";
const RETRY_BASE = "https://worldaml.com/academy";

const MIN_AGE_HOURS = 22;
const MAX_AGE_DAYS = 7;

// Keep in sync with create-academy-checkout / src/data/academyPricing.ts
const PRICING: Record<string, { eurCents: number; stripeProductId: string }> = {
  "kyc-customer-due-diligence": { eurCents: 2900, stripeProductId: "prod_UNtNyYF6HC7Osp" },
  "aml-europe": { eurCents: 2900, stripeProductId: "prod_UNtOIK9w7fRxZy" },
  "aml-gcc-mena": { eurCents: 2900, stripeProductId: "prod_UNtPKlfpEfKIP6" },
  "aml-asia-pacific": { eurCents: 2900, stripeProductId: "prod_UNtWobcmrPAJU3" },
  "aml-americas": { eurCents: 2900, stripeProductId: "prod_URCbOPZTOUEZGi" },
  "aml-africa": { eurCents: 2900, stripeProductId: "prod_URCbXpPRQb1nNV" },
  "aml-cis": { eurCents: 2900, stripeProductId: "prod_URCc2U8EkGSsSO" },
  "pep-screening-edd": { eurCents: 2900, stripeProductId: "prod_URCcOUYeCwnyjF" },
  "adverse-media-intelligence": { eurCents: 2900, stripeProductId: "prod_URCcuWwRKR6w2T" },
  "beneficial-ownership": { eurCents: 2900, stripeProductId: "prod_URCcNXPR9xIxu5" },
  "beneficial-ownership-ubo-transparency": { eurCents: 2900, stripeProductId: "prod_URCcLmKpBK20zV" },
  "transaction-monitoring-sar": { eurCents: 2900, stripeProductId: "prod_URCdenMZN0nNw8" },
  "risk-based-approach": { eurCents: 2900, stripeProductId: "prod_URCdnPTBqo5gbh" },
  "international-sanctions-compliance": { eurCents: 2900, stripeProductId: "prod_URCdkCCDtRRWyC" },
  "crypto-aml": { eurCents: 4900, stripeProductId: "prod_URCdSqTbYEbrFg" },
  "crypto-aml-essentials": { eurCents: 4900, stripeProductId: "prod_URCdNRdfGf9gXK" },
};

const computeDiscountPct = (count: number) => (count >= 3 ? 10 : count === 2 ? 5 : 0);

interface PendingRow {
  id: string;
  user_id: string;
  course_slug: string;
  amount_cents: number;
  currency: string;
  stripe_session_id: string | null;
  created_at: string;
}

function buildHtml(p: {
  greetingName: string;
  courseList: string;
  amountFmt: string;
  retryUrl: string;
  remintNotice: boolean;
}) {
  return `
<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#0f172a;background:#ffffff;">
  <h2 style="margin:0 0 12px;color:#0f172a;">Your WorldAML Academy seat is still saved</h2>
  <p style="margin:0 0 16px;line-height:1.55;">Hi ${p.greetingName},</p>
  <p style="margin:0 0 16px;line-height:1.55;">
    Yesterday you started checking out <strong>${p.courseList}</strong>${p.amountFmt ? ` (${p.amountFmt})` : ""}
    but didn't quite finish. No card was charged.
  </p>
  ${p.remintNotice
    ? `<p style="margin:0 0 16px;line-height:1.55;">We refreshed your checkout link so it's ready to use again:</p>`
    : `<p style="margin:0 0 16px;line-height:1.55;">Your secure checkout link is still active:</p>`}
  <p style="margin:0 0 24px;">
    <a href="${p.retryUrl}" style="display:inline-block;background:#0d9488;color:#ffffff;text-decoration:none;font-weight:600;padding:14px 26px;border-radius:6px;font-size:15px;">
      Complete your purchase
    </a>
  </p>
  <p style="margin:0 0 8px;font-size:13px;color:#475569;line-height:1.55;">
    Every Academy course includes CPD-accredited certificates and 1 month of full access.
    If something went wrong at checkout — card declined, 3-D Secure prompt, prefer to pay by invoice —
    just reply to this email and our team will help you finish.
  </p>
  <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;" />
  <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.5;">
    You're receiving this because a checkout was started on worldaml.com with this email.
    This is the only follow-up we'll send for this attempt.
  </p>
</div>`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const resendKey = Deno.env.get("RESEND_API_KEY");
  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  if (!resendKey) return json({ error: "RESEND_API_KEY not configured" }, 500);
  if (!stripeKey) return json({ error: "STRIPE_SECRET_KEY not configured" }, 500);

  const resend = new Resend(resendKey);
  const stripe = new Stripe(stripeKey, { apiVersion: "2024-06-20" });

  const now = Date.now();
  const minAgeISO = new Date(now - MIN_AGE_HOURS * 3600_000).toISOString();
  const maxAgeISO = new Date(now - MAX_AGE_DAYS * 86400_000).toISOString();

  const { data: rows, error: selErr } = await supabase
    .from("academy_course_purchases")
    .select("id, user_id, course_slug, amount_cents, currency, stripe_session_id, created_at")
    .eq("status", "pending")
    .is("recovery_email_24h_sent_at", null)
    .not("stripe_session_id", "is", null)
    .lte("created_at", minAgeISO)
    .gte("created_at", maxAgeISO)
    .order("created_at", { ascending: true })
    .limit(100);

  if (selErr) {
    console.error("select error:", selErr);
    return json({ error: selErr.message }, 500);
  }

  const candidates = (rows ?? []) as PendingRow[];
  if (candidates.length === 0) return json({ checked: 0, sent: 0, reminted: 0 });

  // Group rows that share a Stripe session (multi-course baskets).
  const bySession = new Map<string, PendingRow[]>();
  for (const r of candidates) {
    const key = r.stripe_session_id ?? `solo:${r.id}`;
    const arr = bySession.get(key) ?? [];
    arr.push(r);
    bySession.set(key, arr);
  }

  // Preload course titles and user profiles.
  const allSlugs = Array.from(new Set(candidates.map((r) => r.course_slug)));
  const allUserIds = Array.from(new Set(candidates.map((r) => r.user_id)));
  const [{ data: courses }, { data: profiles }] = await Promise.all([
    supabase.from("academy_courses").select("slug, title").in("slug", allSlugs),
    supabase.from("profiles").select("user_id, email, full_name").in("user_id", allUserIds),
  ]);
  const titleBySlug = new Map<string, string>((courses ?? []).map((c: any) => [c.slug, c.title as string]));
  const profileByUser = new Map<string, { email: string | null; full_name: string | null }>(
    (profiles ?? []).map((p: any) => [p.user_id, { email: p.email, full_name: p.full_name }]),
  );

  let sent = 0;
  let reminted = 0;
  let skipped = 0;
  let failed = 0;

  for (const [sessionId, group] of bySession) {
    const first = group[0];
    const profile = profileByUser.get(first.user_id);
    const email = profile?.email ?? null;
    const slugs = group.map((r) => r.course_slug);

    if (!email) {
      await markSent(supabase, group);
      skipped += 1;
      continue;
    }

    // Skip baskets that contain a slug we no longer have a Stripe product for —
    // can't re-mint safely.
    const unknown = slugs.find((s) => !PRICING[s]);
    if (unknown) {
      console.warn("Skipping recovery for unknown slug", unknown, "session", sessionId);
      await markSent(supabase, group);
      skipped += 1;
      continue;
    }

    let retryUrl: string | null = null;
    let didRemint = false;

    // Try the original session first.
    try {
      const original = await stripe.checkout.sessions.retrieve(sessionId);
      if (original.status === "open" && original.url) {
        retryUrl = original.url;
      } else if (original.status === "complete") {
        // Already paid — webhook will reconcile; skip and mark to stop reprocessing.
        await markSent(supabase, group);
        skipped += 1;
        continue;
      }
    } catch (err: any) {
      console.warn("Could not retrieve session", sessionId, err?.message ?? err);
    }

    // Re-mint if the original is gone or expired.
    if (!retryUrl) {
      try {
        const currency = (first.currency ?? "eur").toLowerCase();
        const lineItems = slugs.map((slug) => {
          const row = group.find((g) => g.course_slug === slug)!;
          return {
            quantity: 1,
            price_data: {
              currency,
              unit_amount: row.amount_cents,
              product: PRICING[slug].stripeProductId,
            },
          };
        });

        // The per-row amount_cents already has the bundle discount baked in
        // (see create-academy-checkout). Re-applying the coupon would
        // double-discount, so we skip the coupon on the re-mint.
        const newSession = await stripe.checkout.sessions.create({
          mode: "payment",
          customer_email: email,
          line_items: lineItems,
          success_url: `${RETRY_BASE}?purchase=success`,
          cancel_url: `${RETRY_BASE}?purchase=cancelled`,
          metadata: {
            user_id: first.user_id,
            course_slugs: slugs.join(","),
            recovery_for_session: sessionId,
          },
        });

        retryUrl = newSession.url ?? null;
        if (retryUrl) {
          didRemint = true;
          reminted += 1;
          // Repoint pending rows at the new session id so the webhook can match.
          const { error: updErr } = await supabase
            .from("academy_course_purchases")
            .update({ stripe_session_id: newSession.id })
            .in("id", group.map((g) => g.id));
          if (updErr) console.error("Failed to repoint session id", updErr);
        }
      } catch (err: any) {
        console.error("Re-mint failed for session", sessionId, err?.message ?? err);
      }
    }

    if (!retryUrl) {
      // Couldn't get any url — fall back to deep link, still mark sent so we don't loop.
      retryUrl = slugs.length === 1
        ? `${RETRY_BASE}/${slugs[0]}`
        : `${RETRY_BASE}?resume=basket`;
    }

    const courseList = slugs.map((s) => titleBySlug.get(s) ?? s).join(", ");
    const totalCents = group.reduce((s, r) => s + (r.amount_cents ?? 0), 0);
    const amountFmt = `${(totalCents / 100).toFixed(2)} ${(first.currency ?? "eur").toUpperCase()}`;
    const greetingName = profile?.full_name?.split(" ")[0] ?? "there";

    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: [email],
        subject: `Your WorldAML Academy seat is still saved — finish in one click`,
        html: buildHtml({
          greetingName,
          courseList,
          amountFmt,
          retryUrl,
          remintNotice: didRemint,
        }),
      });
      await markSent(supabase, group);
      sent += 1;
    } catch (err: any) {
      console.error("24h recovery email failed for", email, err?.message ?? err);
      failed += 1;
    }
  }

  return json({ checked: candidates.length, sent, reminted, skipped, failed });
});

async function markSent(supabase: any, group: PendingRow[]) {
  await supabase
    .from("academy_course_purchases")
    .update({ recovery_email_24h_sent_at: new Date().toISOString() })
    .in("id", group.map((r) => r.id));
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
