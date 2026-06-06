// deno-lint-ignore-file no-explicit-any
// Admin-only one-time reconciliation: queries each pending Academy purchase's
// Stripe Checkout Session and flips truly-paid rows to "paid".
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return json({ error: "Unauthorized" }, 401);
    }

    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userErr } = await userClient.auth.getUser(token);
    if (userErr || !userData?.user) return json({ error: "Unauthorized" }, 401);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Admin check
    const { data: isAdmin } = await admin.rpc("has_role", {
      _user_id: userData.user.id,
      _role: "admin",
    });
    if (!isAdmin) return json({ error: "Forbidden" }, 403);

    const dryRun = new URL(req.url).searchParams.get("dryRun") === "true";

    // Pull pending rows
    const { data: pending, error: selErr } = await admin
      .from("academy_course_purchases")
      .select("id, user_id, course_slug, stripe_session_id, created_at")
      .eq("status", "pending")
      .not("stripe_session_id", "is", null);

    if (selErr) return json({ error: selErr.message }, 500);
    if (!pending?.length) return json({ ok: true, message: "No pending rows", checked: 0, paid: 0 });

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
      apiVersion: "2024-06-20",
    });

    // Group rows by session id
    const bySession = new Map<string, typeof pending>();
    for (const row of pending) {
      const sid = row.stripe_session_id!;
      if (!bySession.has(sid)) bySession.set(sid, []);
      bySession.get(sid)!.push(row);
    }

    const results: Array<Record<string, unknown>> = [];
    let paidCount = 0;

    for (const [sessionId, rows] of bySession) {
      try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        const isPaid = session.payment_status === "paid";
        const piId =
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : session.payment_intent?.id ?? null;

        results.push({
          sessionId,
          payment_status: session.payment_status,
          status: session.status,
          rows: rows.length,
          will_update: isPaid,
        });

        if (isPaid && !dryRun) {
          const now = new Date();
          const expiresAt = new Date(now);
          expiresAt.setMonth(expiresAt.getMonth() + 1);
          const { error: updErr } = await admin
            .from("academy_course_purchases")
            .update({
              status: "paid",
              stripe_payment_intent_id: piId,
              paid_at: now.toISOString(),
              expires_at: expiresAt.toISOString(),
            })
            .eq("stripe_session_id", sessionId)
            .eq("status", "pending");
          if (updErr) {
            results[results.length - 1].update_error = updErr.message;
          } else {
            paidCount += rows.length;
          }
        }
      } catch (err: any) {
        results.push({ sessionId, error: err?.message ?? String(err) });
      }
    }

    return json({
      ok: true,
      dryRun,
      sessions_checked: bySession.size,
      rows_pending: pending.length,
      rows_marked_paid: paidCount,
      details: results,
    });
  } catch (err: any) {
    console.error("reconcile-academy-purchases error:", err);
    return json({ error: err?.message ?? "Internal error" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
