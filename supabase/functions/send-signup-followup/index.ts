// Send 1-day follow-up email to new signups from Evgenios Georgiou
// Triggered hourly by pg_cron
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const FROM = "Evgenios Georgiou <info@worldaml.com>";
const CC = ["compliance@infocreditgroup.com"];

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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!RESEND_API_KEY) {
      return new Response(
        JSON.stringify({ error: "RESEND_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

    // Find approved profiles created >24h ago that haven't received a follow-up yet
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
        JSON.stringify({ message: "No candidates", processed: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Filter out users who've already been emailed
    const userIds = candidates.map((c) => c.user_id);
    const { data: alreadySent } = await supabase
      .from("signup_followups_sent")
      .select("user_id")
      .in("user_id", userIds);

    const sentSet = new Set((alreadySent ?? []).map((r) => r.user_id));
    const toSend = candidates.filter((c) => !sentSet.has(c.user_id) && c.email);

    console.log(`[followup] candidates=${candidates.length} pending=${toSend.length}`);

    let success = 0;
    let failed = 0;

    for (const user of toSend) {
      const firstName = (user.full_name ?? "").split(" ")[0] ?? "";
      try {
        const resp = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: FROM,
            to: [user.email],
            cc: CC,
            reply_to: "info@worldaml.com",
            subject: "Welcome to WorldAML — Let's schedule a demo",
            html: buildHtml(firstName),
            text: buildText(firstName),
          }),
        });

        const result = await resp.json();

        if (!resp.ok) {
          console.error(`[followup] failed for ${user.email}:`, result);
          await supabase.from("signup_followups_sent").insert({
            user_id: user.user_id,
            email: user.email,
            status: "failed",
            error_message: JSON.stringify(result).slice(0, 500),
          });
          failed++;
          continue;
        }

        await supabase.from("signup_followups_sent").insert({
          user_id: user.user_id,
          email: user.email,
          status: "sent",
          resend_message_id: result.id ?? null,
        });
        success++;
      } catch (err) {
        console.error(`[followup] error for ${user.email}:`, err);
        await supabase.from("signup_followups_sent").insert({
          user_id: user.user_id,
          email: user.email,
          status: "failed",
          error_message: String(err).slice(0, 500),
        });
        failed++;
      }
    }

    return new Response(
      JSON.stringify({ processed: toSend.length, success, failed }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("[followup] fatal:", e);
    return new Response(
      JSON.stringify({ error: String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
