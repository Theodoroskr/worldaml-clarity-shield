// Scheduled job: finds users with in-progress Academy courses untouched for 7+ days
// and sends a branded reminder email (max 2 reminders per user/course).
import { createClient } from "jsr:@supabase/supabase-js@2";
import { Resend } from "npm:resend";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const FROM_EMAIL = "WorldAML Academy <forms@worldaml.com>";
const SITE_URL = "https://worldaml.com";
const MAX_REMINDERS = 2;
const STALE_DAYS = 7;

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildEmailHtml(opts: {
  name: string;
  courseTitle: string;
  courseSlug: string;
  progressPct: number;
  daysSince: number;
  reminderNumber: number;
}): string {
  const { name, courseTitle, courseSlug, progressPct, daysSince, reminderNumber } = opts;
  const resumeUrl = `${SITE_URL}/academy/${encodeURIComponent(courseSlug)}?resume=1`;
  const headline = reminderNumber === 1
    ? `You're ${progressPct}% through ${escapeHtml(courseTitle)}`
    : `Last nudge — finish ${escapeHtml(courseTitle)}`;

  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"/><title>${escapeHtml(headline)}</title></head>
<body style="margin:0;padding:0;background:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;color:#0f1b3d;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
        <tr><td style="background:#0f1b3d;padding:24px 32px;">
          <h1 style="margin:0;color:#ffffff;font-size:18px;font-weight:600;letter-spacing:0.3px;">WorldAML Academy</h1>
        </td></tr>
        <tr><td style="padding:32px;">
          <p style="margin:0 0 8px;font-size:14px;color:#64748b;">Hi ${escapeHtml(name)},</p>
          <h2 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#0f1b3d;line-height:1.3;">${headline}</h2>
          <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#334155;">
            You started <strong>${escapeHtml(courseTitle)}</strong> ${daysSince} days ago and haven't returned since. You're already ${progressPct}% of the way to your CPD certificate — pick up exactly where you left off.
          </p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
            <tr><td style="background:#e2e8f0;border-radius:999px;height:8px;overflow:hidden;">
              <div style="background:#14b8a6;height:8px;width:${progressPct}%;border-radius:999px;"></div>
            </td></tr>
          </table>
          <table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="border-radius:8px;background:#14b8a6;">
            <a href="${resumeUrl}" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px;">Resume course →</a>
          </td></tr></table>
          <p style="margin:32px 0 0;font-size:13px;color:#94a3b8;line-height:1.5;">
            ${reminderNumber === MAX_REMINDERS ? "This is the last reminder we'll send for this course." : "We'll send one more reminder if you haven't returned."}
          </p>
        </td></tr>
        <tr><td style="background:#f8fafc;padding:16px 32px;border-top:1px solid #e5e7eb;">
          <p style="margin:0;font-size:12px;color:#94a3b8;text-align:center;">
            WorldAML Academy · <a href="${SITE_URL}/academy" style="color:#0f1b3d;text-decoration:none;">Browse all courses</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const resend = new Resend(Deno.env.get("RESEND_API_KEY")!);

    const staleCutoff = new Date(Date.now() - STALE_DAYS * 24 * 60 * 60 * 1000).toISOString();

    // Find in-progress (not yet passed) progress records that are stale
    const { data: progressRows, error: pErr } = await supabase
      .from("academy_progress")
      .select("user_id, course_id, completed_modules, created_at, completed_at, quiz_passed, academy_courses(id, title, slug, is_published)")
      .eq("quiz_passed", false)
      .lt("created_at", staleCutoff);

    if (pErr) throw pErr;

    const candidates = (progressRows ?? []).filter((r: any) => r.academy_courses?.is_published);
    let sent = 0;
    let skipped = 0;

    for (const row of candidates as any[]) {
      const courseId = row.course_id;
      const userId = row.user_id;

      // Check reminder cap
      const { count: reminderCount } = await supabase
        .from("academy_reminders_sent")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("course_id", courseId);
      if ((reminderCount ?? 0) >= MAX_REMINDERS) { skipped++; continue; }

      // Last reminder must be 7+ days old (avoid double-send within the week)
      const { data: lastReminder } = await supabase
        .from("academy_reminders_sent")
        .select("sent_at")
        .eq("user_id", userId)
        .eq("course_id", courseId)
        .order("sent_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (lastReminder && new Date(lastReminder.sent_at) > new Date(staleCutoff)) {
        skipped++; continue;
      }

      // Total module count for progress %
      const { count: totalModules } = await supabase
        .from("academy_modules")
        .select("*", { count: "exact", head: true })
        .eq("course_id", courseId);
      const completed = Array.isArray(row.completed_modules) ? row.completed_modules.length : 0;
      const total = totalModules ?? 0;
      const progressPct = total > 0 ? Math.round((completed / total) * 100) : 0;

      // Get user email + name from profiles
      const { data: profile } = await supabase
        .from("profiles")
        .select("email, full_name")
        .eq("user_id", userId)
        .maybeSingle();
      if (!profile?.email) { skipped++; continue; }

      const daysSince = Math.floor(
        (Date.now() - new Date(row.created_at).getTime()) / (24 * 60 * 60 * 1000)
      );
      const reminderNumber = (reminderCount ?? 0) + 1;
      const html = buildEmailHtml({
        name: (profile.full_name || "there").split(" ")[0],
        courseTitle: row.academy_courses.title,
        courseSlug: row.academy_courses.slug,
        progressPct,
        daysSince,
        reminderNumber,
      });

      const { error: sendErr } = await resend.emails.send({
        from: FROM_EMAIL,
        to: profile.email,
        subject: reminderNumber === 1
          ? `Pick up where you left off in ${row.academy_courses.title}`
          : `Last reminder: finish ${row.academy_courses.title}`,
        html,
      });

      if (sendErr) {
        console.error("Resend error", { userId, courseId, sendErr });
        skipped++;
        continue;
      }

      await supabase.from("academy_reminders_sent").insert({
        user_id: userId,
        course_id: courseId,
        reminder_number: reminderNumber,
      });
      sent++;
    }

    return new Response(JSON.stringify({ ok: true, candidates: candidates.length, sent, skipped }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("weekly-course-reminders error", e);
    return new Response(JSON.stringify({ error: e?.message ?? String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
