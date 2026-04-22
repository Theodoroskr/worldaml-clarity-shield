// Sends a 24h activation nudge to Academy signups who registered but never started a course.
// Triggered hourly by pg_cron. Supports manual test mode via { test: true, to: "..." }.
// CC'd to compliance@infocreditgroup.com for visibility.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const FROM = "WorldAML Academy <info@worldaml.com>";
const REQUIRED_CC = "compliance@infocreditgroup.com";
const CC = [REQUIRED_CC];
const SITE_URL = "https://worldaml.com";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const buildHtml = (firstName: string) => `
<!DOCTYPE html>
<html><head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:-apple-system,Segoe UI,Arial,sans-serif;color:#0f1b3d;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.06);">
        <tr><td style="background:linear-gradient(135deg,#1e3a5f 0%,#0d2137 100%);padding:28px 32px;text-align:center;">
          <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700;letter-spacing:0.3px;">WorldAML Academy</h1>
          <p style="margin:6px 0 0;color:#5eead4;font-size:13px;">Your first course awaits</p>
        </td></tr>
        <tr><td style="padding:32px;">
          <p style="margin:0 0 14px;font-size:15px;color:#374151;">Hi ${firstName || "there"},</p>
          <h2 style="margin:0 0 16px;font-size:20px;color:#1e3a5f;line-height:1.35;">You signed up yesterday — ready to earn your first compliance certificate?</h2>
          <p style="margin:0 0 18px;font-size:15px;line-height:1.65;color:#374151;">
            Most of our learners complete their first course in under 30 minutes and walk away with a shareable CPD certificate. We've curated a few starting points for you:
          </p>
          <ul style="margin:0 0 24px;padding-left:20px;font-size:14px;line-height:1.8;color:#374151;">
            <li><strong>AML Fundamentals</strong> — the perfect starting point</li>
            <li><strong>Sanctions Screening Essentials</strong> — most popular this month</li>
            <li><strong>KYC & Customer Due Diligence</strong> — practical onboarding skills</li>
          </ul>
          <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:8px 0 4px;">
            <a href="${SITE_URL}/academy" style="display:inline-block;background:#0d9488;color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:600;">
              Start your first course →
            </a>
          </td></tr></table>
          <p style="margin:24px 0 0;font-size:13px;color:#6b7280;line-height:1.6;text-align:center;">
            Pass the quiz (80%+) to unlock a downloadable certificate you can share on LinkedIn.
          </p>
        </td></tr>
        <tr><td style="background:#f9fafb;padding:18px 32px;border-top:1px solid #e5e7eb;text-align:center;">
          <p style="margin:0;color:#9ca3af;font-size:12px;">
            WorldAML Academy by Infocredit Group · <a href="${SITE_URL}/academy" style="color:#1e3a5f;text-decoration:none;">Browse all courses</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

const buildText = (firstName: string) =>
  `Hi ${firstName || "there"},

You signed up to WorldAML Academy yesterday — ready to earn your first compliance certificate?

Most learners complete their first course in under 30 minutes. Suggested starting points:
- AML Fundamentals
- Sanctions Screening Essentials
- KYC & Customer Due Diligence

Start here: ${SITE_URL}/academy

Pass the quiz (80%+) to unlock a downloadable certificate you can share on LinkedIn.

— WorldAML Academy`;

function buildPayload(toEmail: string, firstName: string) {
  if (!EMAIL_RE.test(toEmail)) throw new Error(`Invalid recipient email: ${toEmail}`);
  const cc = Array.from(new Set(CC.filter((e) => EMAIL_RE.test(e))));
  if (!cc.includes(REQUIRED_CC)) {
    throw new Error(`CC validation failed: ${REQUIRED_CC} missing`);
  }
  return {
    from: FROM,
    to: [toEmail],
    cc,
    reply_to: "info@worldaml.com",
    subject: "Your first WorldAML Academy course awaits 🎓",
    html: buildHtml(firstName),
    text: buildText(firstName),
  };
}

function explainResendError(status: number, body: any): string {
  const message = body?.message ?? JSON.stringify(body);
  if (status === 401 || status === 403) return `Auth error (${status}): ${message}`;
  if (status === 422) return `Validation error (422): ${message}`;
  if (status === 429) return `Rate limited (429): ${message}`;
  if (status >= 500) return `Resend server error (${status}): ${message}`;
  return `Resend ${status}: ${message}`;
}

async function sendOne(resendKey: string, toEmail: string, firstName: string) {
  let payload;
  try {
    payload = buildPayload(toEmail, firstName);
  } catch (e) {
    return { ok: false as const, reason: `Payload build failed: ${(e as Error).message}` };
  }
  let resp: Response;
  try {
    resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${resendKey}` },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    return { ok: false as const, reason: `Network error: ${(e as Error).message}` };
  }
  let body: any = null;
  try { body = await resp.json(); } catch { body = { message: await resp.text() }; }
  if (!resp.ok) {
    return { ok: false as const, status: resp.status, reason: explainResendError(resp.status, body) };
  }
  return { ok: true as const, messageId: body?.id ?? null, cc: payload.cc };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ ok: false, error: "RESEND_API_KEY not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let body: any = {};
    try { const raw = await req.text(); body = raw ? JSON.parse(raw) : {}; } catch { body = {}; }

    // ---- Test mode ----
    if (body?.test === true) {
      const to = String(body.to ?? "").trim();
      if (!EMAIL_RE.test(to)) {
        return new Response(JSON.stringify({ ok: false, error: "Provide a valid 'to' email" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const result = await sendOne(RESEND_API_KEY, to, String(body.name ?? "").trim());
      if (!result.ok) {
        console.error(`[nudge][test] FAILED to=${to}: ${result.reason}`);
        return new Response(JSON.stringify({ ok: false, test: true, to, reason: result.reason, status: result.status ?? null }), {
          status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      console.log(`[nudge][test] sent to=${to} cc=${result.cc.join(",")} id=${result.messageId}`);
      return new Response(JSON.stringify({ ok: true, test: true, to, cc: result.cc, message_id: result.messageId }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ---- Cron mode ----
    // Find profiles 24-48h old who have NEVER created an academy_progress row AND
    // haven't already received a nudge (tracked via signup_followups_sent with status='nudge_sent').
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
    const lowerCutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
    const upperCutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data: candidates, error: fetchErr } = await supabase
      .from("profiles")
      .select("user_id, email, full_name, created_at")
      .gte("created_at", lowerCutoff)
      .lte("created_at", upperCutoff)
      .not("email", "is", null)
      .limit(50);

    if (fetchErr) throw fetchErr;
    if (!candidates || candidates.length === 0) {
      return new Response(JSON.stringify({ ok: true, message: "No candidates", processed: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userIds = candidates.map((c) => c.user_id);

    // Exclude users who have started ANY course
    const { data: started } = await supabase
      .from("academy_progress")
      .select("user_id")
      .in("user_id", userIds);
    const startedSet = new Set((started ?? []).map((r) => r.user_id));

    // Exclude users already nudged (we reuse signup_followups_sent with status='nudge_sent')
    const { data: alreadyNudged } = await supabase
      .from("signup_followups_sent")
      .select("user_id")
      .in("user_id", userIds)
      .eq("status", "nudge_sent");
    const nudgedSet = new Set((alreadyNudged ?? []).map((r) => r.user_id));

    const toSend = candidates.filter(
      (c) => !startedSet.has(c.user_id) && !nudgedSet.has(c.user_id) && c.email
    );

    console.log(`[nudge] candidates=${candidates.length} already_started=${startedSet.size} already_nudged=${nudgedSet.size} to_send=${toSend.length}`);

    let success = 0, failed = 0;
    const failures: Array<{ email: string; reason: string }> = [];

    for (const u of toSend) {
      const firstName = (u.full_name ?? "").split(" ")[0] ?? "";
      const result = await sendOne(RESEND_API_KEY, u.email!, firstName);

      if (!result.ok) {
        console.error(`[nudge] FAILED user=${u.user_id}: ${result.reason}`);
        await supabase.from("signup_followups_sent").insert({
          user_id: u.user_id, email: u.email, status: "nudge_failed",
          error_message: result.reason.slice(0, 500),
        });
        failed++;
        failures.push({ email: u.email!, reason: result.reason });
        continue;
      }
      await supabase.from("signup_followups_sent").insert({
        user_id: u.user_id, email: u.email, status: "nudge_sent",
        resend_message_id: result.messageId,
      });
      success++;
    }

    return new Response(JSON.stringify({
      ok: true, processed: toSend.length, success, failed,
      cc_applied: REQUIRED_CC, failures: failures.slice(0, 10),
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("[nudge] fatal:", e);
    return new Response(JSON.stringify({ ok: false, error: String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
