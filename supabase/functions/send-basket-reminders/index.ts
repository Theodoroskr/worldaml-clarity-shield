// deno-lint-ignore-file no-explicit-any
// Abandoned Academy basket reminders.
//
// Two branded touch points, driven by `academy_basket_snapshots`:
//   • 3 days  after the basket last changed  -> gentle reminder
//   • 30 days after the basket last changed  -> final reminder
//
// A basket that changes resets both reminder stamps (handled client-side on
// upsert). Courses the learner already owns are filtered out; if nothing
// payable remains, the snapshot is cleared instead of emailed.
//
// Invoked hourly by pg_cron. Service-role only.

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Resend } from "npm:resend";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const FROM_EMAIL = "WorldAML Academy <info@worldaml.com>";
const SITE = "https://worldaml.com";
const LOGO = `${SITE}/email-logo.png`;
const BASKET_URL = `${SITE}/dashboard/cart`;

const NAVY = "#0f172a";
const TEAL = "#0d9488";
const MUTED = "#64748b";

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

interface Snapshot {
  user_id: string;
  email: string | null;
  full_name: string | null;
  items: string[];
  currency: string | null;
  updated_at: string;
  reminder_3d_sent_at: string | null;
  reminder_30d_sent_at: string | null;
}

function buildHtml(p: { name: string; courses: string[]; stage: "3d" | "30d" }) {
  const heading =
    p.stage === "3d"
      ? "Your basket is still waiting"
      : "Still interested in your CPD training?";
  const intro =
    p.stage === "3d"
      ? "You added the following WorldAML Academy course(s) to your basket a few days ago but didn't complete checkout. Nothing has been charged and your selection is saved."
      : "It's been a month since you saved these WorldAML Academy course(s). They're still available, still CPD-accredited, and your basket is exactly as you left it.";
  const nudge =
    p.stage === "3d"
      ? "Each course takes 15–20 minutes and ends with a verifiable certificate you can share with your regulator, auditor or employer."
      : "If now isn't the right time, you can clear your basket at any time — we won't email you about it again.";

  const list = p.courses
    .map(
      (c) =>
        `<tr><td style="padding:8px 0;border-bottom:1px solid #e2e8f0;color:${NAVY};font-size:14px;">${escapeHtml(c)}</td></tr>`,
    )
    .join("");

  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#f1f5f9;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:28px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;font-family:Arial,Helvetica,sans-serif;">
        <tr><td style="background:${NAVY};padding:20px 24px;">
          <img src="${LOGO}" alt="WorldAML" width="148" style="display:block;border:0;height:auto;" />
        </td></tr>
        <tr><td style="padding:26px 24px 8px;">
          <div style="font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:${TEAL};font-weight:bold;">WorldAML Academy</div>
          <h1 style="margin:8px 0 12px;font-size:20px;line-height:1.3;color:${NAVY};">${heading}</h1>
          <p style="margin:0 0 14px;font-size:14px;line-height:1.6;color:${NAVY};">Hi ${escapeHtml(p.name)},</p>
          <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:${NAVY};">${intro}</p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 18px;">${list}</table>
          <p style="margin:0 0 22px;font-size:14px;line-height:1.6;color:${MUTED};">${nudge}</p>
          <a href="${BASKET_URL}" style="display:inline-block;background:${TEAL};color:#ffffff;text-decoration:none;font-size:14px;font-weight:bold;padding:12px 22px;border-radius:8px;">Return to my basket</a>
          <p style="margin:20px 0 0;font-size:12px;line-height:1.6;color:${MUTED};">
            Bundle pricing applies automatically: 5% off two courses, 10% off three or more.
          </p>
        </td></tr>
        <tr><td style="padding:18px 24px 24px;border-top:1px solid #e2e8f0;">
          <p style="margin:0 0 6px;font-size:12px;color:${MUTED};">
            WorldAML — AML, KYC and financial crime compliance.
            <a href="${SITE}/academy" style="color:${TEAL};text-decoration:none;">worldaml.com/academy</a>
          </p>
          <p style="margin:0;font-size:11px;color:#94a3b8;">
            You're receiving this because you saved courses in your WorldAML Academy basket.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

  // Service-role only: reject anything that isn't the scheduled job.
  const auth = req.headers.get("authorization") ?? "";
  if (!SERVICE_KEY || auth !== `Bearer ${SERVICE_KEY}`) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  if (!RESEND_API_KEY) {
    return new Response(JSON.stringify({ error: "RESEND_API_KEY not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
  const resend = new Resend(RESEND_API_KEY);

  const now = Date.now();
  const threeDays = new Date(now - 3 * 24 * 3600 * 1000).toISOString();

  const { data, error } = await supabase
    .from("academy_basket_snapshots")
    .select("user_id, email, full_name, items, currency, updated_at, reminder_3d_sent_at, reminder_30d_sent_at")
    .lt("updated_at", threeDays)
    .limit(200);

  if (error) {
    console.error("snapshot query failed", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { data: courses } = await supabase
    .from("academy_courses")
    .select("slug, title")
    .eq("is_published", true);
  const titleBySlug = new Map((courses ?? []).map((c: any) => [c.slug, c.title as string]));

  let sent3 = 0;
  let sent30 = 0;
  let skipped = 0;

  for (const row of (data ?? []) as Snapshot[]) {
    const items = Array.isArray(row.items) ? row.items.filter(Boolean) : [];
    if (items.length === 0 || !row.email) {
      skipped++;
      continue;
    }

    const ageDays = (now - new Date(row.updated_at).getTime()) / 86_400_000;
    const stage: "3d" | "30d" | null =
      !row.reminder_3d_sent_at && ageDays >= 3
        ? "3d"
        : row.reminder_3d_sent_at && !row.reminder_30d_sent_at && ageDays >= 30
          ? "30d"
          : null;
    if (!stage) {
      skipped++;
      continue;
    }

    // Never remind about courses the learner already owns.
    const { data: purchases } = await supabase
      .from("academy_course_purchases")
      .select("course_slug, status")
      .eq("user_id", row.user_id)
      .eq("status", "completed");
    const owned = new Set((purchases ?? []).map((p: any) => p.course_slug));
    const payable = items.filter((s) => !owned.has(s));

    if (payable.length === 0) {
      await supabase.from("academy_basket_snapshots").delete().eq("user_id", row.user_id);
      skipped++;
      continue;
    }

    const name = (row.full_name || "").trim().split(/\s+/)[0] || "there";
    const titles = payable.map((s) => titleBySlug.get(s) ?? s.replace(/-/g, " "));

    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: [row.email],
        subject:
          stage === "3d"
            ? "Your WorldAML Academy basket is still saved"
            : "Your saved WorldAML Academy courses are still available",
        html: buildHtml({ name, courses: titles, stage }),
      });

      await supabase
        .from("academy_basket_snapshots")
        .update(
          stage === "3d"
            ? { reminder_3d_sent_at: new Date().toISOString() }
            : { reminder_30d_sent_at: new Date().toISOString() },
        )
        .eq("user_id", row.user_id);

      stage === "3d" ? sent3++ : sent30++;
    } catch (e) {
      console.error(`send failed for ${row.user_id}:`, (e as Error).message);
    }
  }

  return new Response(JSON.stringify({ sent3, sent30, skipped }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
