// Send 1-day follow-up email to new signups (signed by Evgenios Georgiou)
// Triggered hourly by pg_cron, also supports manual test mode via { test: true, to: "..." }
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const FROM = "WorldAML <info@worldaml.com>";
const REQUIRED_CC = "compliance@infocreditgroup.com";
const CC = [REQUIRED_CC];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const buildHtml = (firstName: string) => `
<div style="font-family: Arial, sans-serif; font-size: 14px; color: #1a1a2e; line-height: 1.6; max-width: 600px;">
  <p>Dear ${firstName ? firstName : ""},</p>
  <p>Thank you for registering your interest in the WorldAML platform by Infocredit Group.</p>
  <p>My name is <strong>Evgenios Georgiou</strong> from our Compliance Advisory team, and I will be your point of contact moving forward.</p>
  <p>WorldAML is a modular compliance platform designed to support organizations with AML/CFT requirements across <strong>onboarding, screening, risk scoring, and transaction monitoring</strong> — all within a single, configurable environment.</p>
  <p>Based on your interest, I would be happy to walk you through how the platform can support your specific requirements and share relevant use cases.</p>
  <p>Would you be available for a short <strong>20–30 minute demo early next week</strong>? Please let me know a time that suits you.</p>
  <p>In the meantime, if you have any immediate questions or areas of interest (e.g. onboarding, transaction monitoring, regulatory reporting), feel free to share them so we can tailor the session accordingly.</p>
  <p>Looking forward to your reply.</p>
  <p style="margin-top: 30px;">
    Kind regards,<br/>
    <strong>Evgenios Georgiou</strong><br/>
    Compliance Advisory Team<br/>
    Infocredit Group | WorldAML<br/>
    <a href="https://www.worldaml.com" style="color: #0d9488;">www.worldaml.com</a>
  </p>
</div>`;

const buildText = (firstName: string) =>
  `Dear ${firstName || ""},

Thank you for registering your interest in the WorldAML platform by Infocredit Group.

My name is Evgenios Georgiou from our Compliance Advisory team, and I will be your point of contact moving forward.

WorldAML is a modular compliance platform designed to support organizations with AML/CFT requirements across onboarding, screening, risk scoring, and transaction monitoring — all within a single, configurable environment.

Based on your interest, I would be happy to walk you through how the platform can support your specific requirements and share relevant use cases.

Would you be available for a short 20–30 minute demo early next week? Please let me know a time that suits you.

In the meantime, if you have any immediate questions or areas of interest (e.g. onboarding, transaction monitoring, regulatory reporting), feel free to share them so we can tailor the session accordingly.

Looking forward to your reply.

Kind regards,
Evgenios Georgiou
Compliance Advisory Team
Infocredit Group | WorldAML
www.worldaml.com`;

// Build Resend payload + assert CC is present and valid before sending
function buildPayload(toEmail: string, firstName: string, subject: string) {
  if (!EMAIL_RE.test(toEmail)) {
    throw new Error(`Invalid recipient email: ${toEmail}`);
  }
  const cc = Array.from(new Set(CC.filter((e) => EMAIL_RE.test(e))));
  if (!cc.includes(REQUIRED_CC)) {
    throw new Error(
      `CC validation failed: required address ${REQUIRED_CC} missing from CC list`,
    );
  }

  const payload = {
    from: FROM,
    to: [toEmail],
    cc,
    reply_to: "info@worldaml.com",
    subject,
    html: buildHtml(firstName),
    text: buildText(firstName),
  };

  // Final guard — never send without compliance CC
  if (!payload.cc.includes(REQUIRED_CC)) {
    throw new Error("CC guard tripped — refusing to send without compliance CC");
  }

  return payload;
}

// Translate Resend errors into a clear human-readable reason
function explainResendError(status: number, body: any): string {
  const name = body?.name ?? body?.error ?? "unknown_error";
  const message = body?.message ?? JSON.stringify(body);
  if (status === 401 || status === 403) {
    return `Auth error (${status}): ${message}. Check RESEND_API_KEY.`;
  }
  if (status === 422) {
    return `Validation error (422): ${message}. Likely an unverified sender domain or malformed payload.`;
  }
  if (status === 429) {
    return `Rate limited (429): ${message}. Resend will retry on next cron tick.`;
  }
  if (status >= 500) {
    return `Resend server error (${status}): ${message}.`;
  }
  return `Resend ${status} ${name}: ${message}`;
}

async function sendOne(
  resendKey: string,
  toEmail: string,
  firstName: string,
  subject: string,
): Promise<
  | { ok: true; messageId: string | null; cc: string[] }
  | { ok: false; reason: string; status?: number }
> {
  let payload;
  try {
    payload = buildPayload(toEmail, firstName, subject);
  } catch (e) {
    return { ok: false, reason: `Payload build failed: ${(e as Error).message}` };
  }

  let resp: Response;
  try {
    resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendKey}`,
      },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    return {
      ok: false,
      reason: `Network error contacting Resend: ${(e as Error).message}`,
    };
  }

  let body: any = null;
  try {
    body = await resp.json();
  } catch {
    body = { message: await resp.text() };
  }

  if (!resp.ok) {
    return {
      ok: false,
      status: resp.status,
      reason: explainResendError(resp.status, body),
    };
  }

  return { ok: true, messageId: body?.id ?? null, cc: payload.cc };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Auth: require service-role key for all modes (cron + test)
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "");
    if (!token || token !== SERVICE_KEY) {
      return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!RESEND_API_KEY) {
      return new Response(
        JSON.stringify({ ok: false, error: "RESEND_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Parse body once (tolerate empty cron POSTs)
    let body: any = {};
    try {
      const raw = await req.text();
      body = raw ? JSON.parse(raw) : {};
    } catch {
      body = {};
    }

    // ---- Test mode (requires service role key) ----
    // Usage: POST { "test": true, "to": "you@example.com", "name": "Optional First" }
    if (body?.test === true) {
      const to = String(body.to ?? "").trim();
      if (!EMAIL_RE.test(to)) {
        return new Response(
          JSON.stringify({
            ok: false,
            error: "Provide a valid 'to' email address for the test send.",
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      const firstName = String(body.name ?? "").trim();
      const result = await sendOne(
        RESEND_API_KEY,
        to,
        firstName,
        "[TEST] Welcome to WorldAML — Let's schedule a demo",
      );

      if (!result.ok) {
        console.error(`[followup][test] FAILED to=${to}: ${result.reason}`);
        return new Response(
          JSON.stringify({
            ok: false,
            test: true,
            to,
            cc_required: REQUIRED_CC,
            reason: result.reason,
            status: result.status ?? null,
          }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      console.log(
        `[followup][test] sent to=${to} cc=${result.cc.join(",")} id=${result.messageId}`,
      );
      return new Response(
        JSON.stringify({
          ok: true,
          test: true,
          to,
          cc: result.cc,
          message_id: result.messageId,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // ---- Normal cron mode ----
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data: candidates, error: fetchErr } = await supabase
      .from("profiles")
      .select("user_id, email, full_name, created_at")
      .lte("created_at", cutoff)
      .not("email", "is", null)
      .limit(50);

    if (fetchErr) throw fetchErr;

    if (!candidates || candidates.length === 0) {
      return new Response(
        JSON.stringify({ ok: true, message: "No candidates", processed: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const userIds = candidates.map((c) => c.user_id);
    const { data: alreadySent } = await supabase
      .from("signup_followups_sent")
      .select("user_id")
      .in("user_id", userIds);

    const sentSet = new Set((alreadySent ?? []).map((r) => r.user_id));
    const toSend = candidates.filter((c) => !sentSet.has(c.user_id) && c.email);

    console.log(
      `[followup] candidates=${candidates.length} pending=${toSend.length}`,
    );

    let success = 0;
    let failed = 0;
    const failures: Array<{ email: string; reason: string }> = [];

    for (const user of toSend) {
      const firstName = (user.full_name ?? "").split(" ")[0] ?? "";
      const result = await sendOne(
        RESEND_API_KEY,
        user.email!,
        firstName,
        "Welcome to WorldAML — Let's schedule a demo",
      );

      if (!result.ok) {
        console.error(`[followup] FAILED user=${user.user_id} email=${user.email} reason=${result.reason}`);
        await supabase.from("signup_followups_sent").insert({
          user_id: user.user_id,
          email: user.email,
          status: "failed",
          error_message: result.reason.slice(0, 500),
        });
        failed++;
        failures.push({ email: user.email!, reason: result.reason });
        continue;
      }

      await supabase.from("signup_followups_sent").insert({
        user_id: user.user_id,
        email: user.email,
        status: "sent",
        resend_message_id: result.messageId,
      });
      success++;
    }

    return new Response(
      JSON.stringify({
        ok: true,
        processed: toSend.length,
        success,
        failed,
        cc_applied: REQUIRED_CC,
        failures: failures.slice(0, 10),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("[followup] fatal:", e);
    return new Response(
      JSON.stringify({ ok: false, error: String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
