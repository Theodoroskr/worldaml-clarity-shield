// deno-lint-ignore-file no-explicit-any
// Cron-driven recovery email for academy checkouts that have been "pending"
// for 30+ minutes without ever moving to "paid" or "failed". Stripe only sends
// `checkout.session.expired` ~24h after the session is created, which is far
// too late to recover the buyer. We nudge them earlier with the same retry
// link the existing recovery email uses.
//
// Runs every 15 minutes via pg_cron. Idempotent: marks
// `recovery_email_sent_at` so each session is nudged at most once.

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Resend } from "npm:resend";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const FROM_EMAIL = "WorldAML <info@worldaml.com>";
const RETRY_BASE = "https://worldaml.com/academy";

// Look at pending purchases created between 30 minutes and 6 hours ago.
// Older than 6h is left to Stripe's own `checkout.session.expired` recovery
// (the existing webhook flow handles that case).
const MIN_AGE_MIN = 30;
const MAX_AGE_HOURS = 6;

interface PendingRow {
  id: string;
  user_id: string;
  course_slug: string;
  amount_cents: number;
  currency: string;
  stripe_session_id: string | null;
  created_at: string;
}

function buildHtml(p: { greetingName: string; courseList: string; amountFmt: string; retryUrl: string }) {
  return `
<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#0f172a;background:#ffffff;">
  <h2 style="margin:0 0 12px;color:#0f172a;">You left your WorldAML Academy course in the basket</h2>
  <p style="margin:0 0 16px;line-height:1.55;">Hi ${p.greetingName},</p>
  <p style="margin:0 0 16px;line-height:1.55;">
    We saved your spot for <strong>${p.courseList}</strong>${p.amountFmt ? ` (${p.amountFmt})` : ""}.
    Looks like the checkout window closed before payment went through — no card was charged.
  </p>
  <p style="margin:0 0 24px;line-height:1.55;">Pick up where you left off and start the course in minutes:</p>
  <p style="margin:0 0 24px;">
    <a href="${p.retryUrl}" style="display:inline-block;background:#0d9488;color:#ffffff;text-decoration:none;font-weight:600;padding:12px 22px;border-radius:6px;">
      Complete your purchase
    </a>
  </p>
  <p style="margin:0 0 8px;font-size:13px;color:#475569;line-height:1.55;">
    Every Academy course includes CPD-accredited certificates and 1 month of full access.
    If you had any trouble at checkout — card declined, 3-D Secure prompt, anything else —
    just reply to this email and our team will help you finish.
  </p>
  <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;" />
  <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.5;">
    You're receiving this because a checkout was started on worldaml.com with this email.
    This is a one-time transactional message — no further reminders will be sent for this attempt.
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
  if (!resendKey) {
    return json({ error: "RESEND_API_KEY not configured" }, 500);
  }
  const resend = new Resend(resendKey);

  // Manual one-off send for admin recovery: POST { email, courseList?, amount?, currency?, retryUrl?, name? }
  if (req.method === "POST") {
    let body: any = {};
    try { body = await req.json(); } catch { /* fall through to cron */ }
    if (body && typeof body.email === "string" && body.email.includes("@")) {
      const html = buildHtml({
        greetingName: body.name ?? "there",
        courseList: body.courseList ?? "your WorldAML Academy courses",
        amountFmt: body.amount && body.currency
          ? `${Number(body.amount).toFixed(2)} ${String(body.currency).toUpperCase()}`
          : "",
        retryUrl: body.retryUrl ?? `${RETRY_BASE}?resume=basket`,
      });
      try {
        await resend.emails.send({
          from: FROM_EMAIL,
          to: [body.email],
          subject: `Finish your WorldAML Academy purchase — your spot is saved`,
          html,
        });
        return json({ sent: 1, to: body.email });
      } catch (err: any) {
        console.error("manual recovery email failed", body.email, err);
        return json({ error: err?.message ?? String(err) }, 500);
      }
    }
  }

  const now = Date.now();
  const minAgeISO = new Date(now - MIN_AGE_MIN * 60_000).toISOString();
  const maxAgeISO = new Date(now - MAX_AGE_HOURS * 3600_000).toISOString();

  // Find pending purchases in the window with no recovery email yet.
  // Dedupe by stripe_session_id so multi-course baskets only email once.
  const { data: rows, error: selErr } = await supabase
    .from("academy_course_purchases")
    .select("id, user_id, course_slug, amount_cents, currency, stripe_session_id, created_at")
    .eq("status", "pending")
    .is("recovery_email_sent_at", null)
    .lte("created_at", minAgeISO)
    .gte("created_at", maxAgeISO)
    .order("created_at", { ascending: true })
    .limit(100);

  if (selErr) {
    console.error("select error:", selErr);
    return json({ error: selErr.message }, 500);
  }

  const candidates = (rows ?? []) as PendingRow[];
  if (candidates.length === 0) {
    return json({ checked: 0, sent: 0 });
  }

  // Group by stripe_session_id so a basket of N courses sends 1 email.
  const bySession = new Map<string, PendingRow[]>();
  for (const r of candidates) {
    const key = r.stripe_session_id ?? `solo:${r.id}`;
    const arr = bySession.get(key) ?? [];
    arr.push(r);
    bySession.set(key, arr);
  }

  // Preload course titles and user emails in one round-trip each.
  const allSlugs = Array.from(new Set(candidates.map((r) => r.course_slug)));
  const allUserIds = Array.from(new Set(candidates.map((r) => r.user_id)));

  const [{ data: courses }, { data: profiles }] = await Promise.all([
    supabase.from("academy_courses").select("slug, title").in("slug", allSlugs),
    supabase.from("profiles").select("user_id, email, full_name").in("user_id", allUserIds),
  ]);

  const titleBySlug = new Map<string, string>(
    (courses ?? []).map((c: any) => [c.slug, c.title as string]),
  );
  const profileByUser = new Map<string, { email: string | null; full_name: string | null }>(
    (profiles ?? []).map((p: any) => [p.user_id, { email: p.email, full_name: p.full_name }]),
  );

  let sent = 0;
  let failed = 0;

  for (const [, group] of bySession) {
    const first = group[0];
    const profile = profileByUser.get(first.user_id);
    const email = profile?.email ?? null;
    if (!email) {
      // No email on file — mark as sent to stop reprocessing forever.
      await supabase
        .from("academy_course_purchases")
        .update({ recovery_email_sent_at: new Date().toISOString() })
        .in("id", group.map((r) => r.id));
      continue;
    }

    const courseList = group
      .map((r) => titleBySlug.get(r.course_slug) ?? r.course_slug)
      .join(", ");
    const totalCents = group.reduce((s, r) => s + (r.amount_cents ?? 0), 0);
    const currency = (first.currency ?? "eur").toUpperCase();
    const amountFmt = `${(totalCents / 100).toFixed(2)} ${currency}`;
    const retryUrl =
      group.length === 1
        ? `${RETRY_BASE}/${first.course_slug}`
        : `${RETRY_BASE}?resume=basket`;
    const greetingName = profile?.full_name?.split(" ")[0] ?? "there";

    const html = `
<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#0f172a;background:#ffffff;">
  <h2 style="margin:0 0 12px;color:#0f172a;">You left your WorldAML Academy course in the basket</h2>
  <p style="margin:0 0 16px;line-height:1.55;">Hi ${greetingName},</p>
  <p style="margin:0 0 16px;line-height:1.55;">
    We saved your spot for <strong>${courseList}</strong> (${amountFmt}).
    Looks like the checkout window closed before payment went through —
    no card was charged.
  </p>
  <p style="margin:0 0 24px;line-height:1.55;">
    Pick up where you left off and start the course in minutes:
  </p>
  <p style="margin:0 0 24px;">
    <a href="${retryUrl}"
       style="display:inline-block;background:#0d9488;color:#ffffff;text-decoration:none;font-weight:600;padding:12px 22px;border-radius:6px;">
      Complete your purchase
    </a>
  </p>
  <p style="margin:0 0 8px;font-size:13px;color:#475569;line-height:1.55;">
    Every Academy course includes CPD-accredited certificates and 1 month of full access.
    If you had any trouble at checkout — card declined, 3-D Secure prompt, anything else —
    just reply to this email and our team will help you finish.
  </p>
  <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;" />
  <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.5;">
    You're receiving this because a checkout was started on worldaml.com with this email.
    This is a one-time transactional message — no further reminders will be sent for this attempt.
  </p>
</div>`;

    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: [email],
        subject: `Finish your WorldAML Academy purchase — your spot is saved`,
        html,
      });
      await supabase
        .from("academy_course_purchases")
        .update({ recovery_email_sent_at: new Date().toISOString() })
        .in("id", group.map((r) => r.id));
      sent += 1;
    } catch (err) {
      console.error("recovery email failed for", email, err);
      failed += 1;
    }
  }

  return json({ checked: candidates.length, sent, failed });
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
