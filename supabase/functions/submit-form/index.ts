import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend";
import { normaliseCode, recordReferral, resolvePartnerByCode } from "../_shared/referral.ts";
import { buildIcgLeadPayload, checkIcgKey, forwardLeadToIcg } from "../_shared/icgLeadForward.ts";


const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const FREE_EMAIL_DOMAINS = new Set<string>([
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "yahoo.co.uk",
  "yahoo.fr",
  "yahoo.de",
  "yahoo.es",
  "yahoo.it",
  "ymail.com",
  "rocketmail.com",
  "hotmail.com",
  "hotmail.co.uk",
  "hotmail.fr",
  "hotmail.de",
  "hotmail.es",
  "hotmail.it",
  "outlook.com",
  "outlook.co.uk",
  "outlook.fr",
  "outlook.de",
  "outlook.es",
  "outlook.it",
  "live.com",
  "live.co.uk",
  "msn.com",
  "icloud.com",
  "me.com",
  "mac.com",
  "aol.com",
  "aim.com",
  "protonmail.com",
  "proton.me",
  "pm.me",
  "tutanota.com",
  "tuta.io",
  "tutamail.com",
  "gmx.com",
  "gmx.de",
  "gmx.net",
  "gmx.us",
  "mail.com",
  "yandex.com",
  "yandex.ru",
  "ya.ru",
  "zoho.com",
  "zohomail.com",
  "fastmail.com",
  "fastmail.fm",
  "hey.com",
  "qq.com",
  "163.com",
  "126.com",
  "sina.com",
  "sina.cn",
  "naver.com",
  "daum.net",
  "hanmail.net",
  "rediffmail.com",
  "inbox.com",
  "hushmail.com",
  "lavabit.com",
  "cock.li",
  "mailinator.com",
  "guerrillamail.com",
  "10minutemail.com",
  "tempmail.com",
  "temp-mail.org",
  "trashmail.com",
  "yopmail.com",
  "throwawaymail.com",
  "maildrop.cc",
  "getnada.com",
  "sharklasers.com",
  "dispostable.com",
  "fakemail.net",
  "mintemail.com",
]);

const NOTIFY_EMAIL = "info@worldaml.com";
const FROM_EMAIL = "WorldAML Forms <forms@worldaml.com>";

function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

async function sendEmailWithRetry(resend: any, params: any, retries = 1): Promise<void> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const { error } = await resend.emails.send(params);
      if (error) {
        const code = (error as any)?.name || (error as any)?.code || "";
        if (code === "rate_limit_exceeded" || (error as any)?.statusCode === 429) {
          console.warn("⚠️ Resend rate limit exceeded — skipping email notification.");
          return;
        }
        throw error;
      }
      return;
    } catch (err: any) {
      const isRateLimit = err?.statusCode === 429 || err?.name === "rate_limit_exceeded";
      if (isRateLimit) {
        console.warn("⚠️ Resend rate limit exceeded — skipping email notification.");
        return;
      }
      if (attempt < retries) {
        console.warn(`Email send attempt ${attempt + 1} failed, retrying in 1s…`, err?.message);
        await new Promise((r) => setTimeout(r, 1000));
      } else {
        console.error("Email send failed (non-blocking):", err?.message ?? err);
      }
    }
  }
}

function formatProducts(products: string[] | undefined): string {
  if (!Array.isArray(products) || products.length === 0) return "—";
  const LABELS: Record<string, string> = {
    "worldaml-suite": "WorldAML Suite",
    "worldaml-api": "WorldAML API",
    "worldid": "WorldID",
    "worldcompliance": "WorldCompliance",
    "bridger-xg": "Bridger Insight XG",
    "academy-team": "Academy \u2014 Team Plan",
    "partnership": "Partner Program",
    "worldaml-advisory": "WorldAML Advisory",
    "advisory": "WorldAML Advisory",
  };
  return products.map((p) => LABELS[String(p ?? "").trim().toLowerCase()] || p).join(", ");
}

// Rate limit: 5 submissions per IP per hour
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour in ms

// In-memory rate limit store (per isolate; resets on cold start)
// Key: "ip:hour-bucket" → count
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function getRateLimitKey(ip: string): string {
  // Bucket by IP + current hour slot
  const hourSlot = Math.floor(Date.now() / RATE_LIMIT_WINDOW_MS);
  return `${ip}:${hourSlot}`;
}

function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const key = getRateLimitKey(ip);
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1 };
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0 };
  }

  entry.count += 1;
  return { allowed: true, remaining: RATE_LIMIT_MAX - entry.count };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Extract client IP from standard headers (set by Supabase edge infra)
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  // Rate limit check. Dry-run verification requests (no writes, no email, no
  // CRM call) are exempt so mappings can be validated in bulk.
  const isDryRunRequest = req.headers.get("x-dry-run") === "true";
  const { allowed, remaining } = isDryRunRequest
    ? { allowed: true, remaining: RATE_LIMIT_MAX }
    : checkRateLimit(ip);
  if (!allowed) {
    return new Response(
      JSON.stringify({ error: "Too many requests. Please try again later." }),
      {
        status: 429,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "Retry-After": "3600",
          "X-RateLimit-Limit": String(RATE_LIMIT_MAX),
          "X-RateLimit-Remaining": "0",
        },
      },
    );
  }

  try {
    const body = await req.json();
    const {
      form_type,
      first_name,
      last_name,
      email,
      phone,
      company,
      job_title,
      country,
      industry,
      message,
      products,
      account_type,
      region,
      metadata,
      referral_code,

    } = body;

    // Validate required fields
    if (!form_type || !first_name || !last_name || !email) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: form_type, first_name, last_name, email" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({ error: "Invalid email address" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Lead / demo forms accept company emails only (partner forms excluded).
    const ftKey = String(form_type).toLowerCase();
    const emailDomain = String(email).trim().toLowerCase().split("@").pop() ?? "";
    if (!ftKey.startsWith("partner") && FREE_EMAIL_DOMAINS.has(emailDomain)) {
      return new Response(JSON.stringify({ error: "Please use your company email address. Free providers are not accepted." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Dry-run mode: build and return the group CRM lead payload only —
    // nothing is stored, emailed, or forwarded.
    const dryRun = body?.dry_run === true;

    // Store in database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // ── Partner referral attribution ────────────────────────────────────
    // A referral code entered on the form is validated against active
    // partners. When valid it is stored on the lead (admin visibility) AND a
    // referral row is created (partner-portal visibility).
    const rawReferralCode = referral_code ?? (metadata as any)?.referral_code;
    const referralPartner = rawReferralCode
      ? await resolvePartnerByCode(supabase, rawReferralCode)
      : null;
    const referralInvalid = !!normaliseCode(rawReferralCode) && !referralPartner;

    const enrichedMetadata = {
      ...(metadata || {}),
      ...(referralPartner
        ? {
            referral_code: referralPartner.referral_code,
            referral_partner_id: referralPartner.partner_id,
            referral_partner_name: referralPartner.display_name,
          }
        : rawReferralCode
          ? { referral_code_submitted: String(rawReferralCode).slice(0, 40), referral_code_valid: false }
          : {}),
    };

    const { error: dbError } = dryRun
      ? { error: null }
      : await supabase.from("form_submissions").insert({
      form_type,
      first_name: first_name.trim().slice(0, 100),
      last_name: last_name.trim().slice(0, 100),
      email: email.trim().slice(0, 255),
      phone: phone?.trim().slice(0, 50) || null,
      company: company?.trim().slice(0, 200) || null,
      job_title: job_title?.trim().slice(0, 100) || null,
      country: country?.trim().slice(0, 100) || null,
      industry: industry?.trim().slice(0, 100) || null,
      message: message?.trim().slice(0, 2000) || null,
      products: products || null,
      account_type: account_type?.trim().slice(0, 50) || null,
      region: region?.trim().slice(0, 50) || null,
      metadata: enrichedMetadata,
    });

    if (!dryRun && referralPartner) {
      await recordReferral(supabase, {
        partner: referralPartner,
        email,
        source: `lead:${form_type}`,
        status: "signed_up",
      });
    }


    if (dbError) {
      console.error("Database insert error:", dbError);
      return new Response(JSON.stringify({ error: "Failed to save submission" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Copy of the lead for the Infocredit Group CRM (sent below).
    const icgPayload = buildIcgLeadPayload({
      form_type, first_name, last_name, email, phone, company, job_title,
      country, industry, region, account_type, message,
      product: Array.isArray(products) && products.length ? formatProducts(products) : null,
      metadata: enrichedMetadata,
    });

    // Dry-run: return the exact payload that would be sent to the Infocredit
    // Group CRM without storing, emailing, or forwarding anything.
    if (dryRun) {
      return new Response(
        JSON.stringify({ success: true, dry_run: true, icg_payload: icgPayload, icg_key: await checkIcgKey() }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Forward to the Infocredit Group CRM (non-blocking; never fails the form).
    if (!dryRun) await forwardLeadToIcg(icgPayload);

    try {
      const resendApiKey = Deno.env.get("RESEND_API_KEY");
      if (resendApiKey) {
        const resend = new Resend(resendApiKey);

        const detailRows = [
          ["Form Type", form_type],
          ["Name", `${first_name} ${last_name}`],
          ["Email", email],
          ["Phone", phone || "—"],
          ["Company", company || "—"],
          ["Job Title", job_title || "—"],
          ["Country", country || "—"],
          ["Industry", industry || "—"],
          ["Region", region || "—"],
          ["Account Type", account_type || "—"],
          ["Products", formatProducts(products)],
          ["Message", message || "—"],
        ]
          .map(([label, value]) => `<tr><td style="padding:6px 12px;font-weight:600;color:#374151;">${escapeHtml(label)}</td><td style="padding:6px 12px;color:#111827;">${escapeHtml(value)}</td></tr>`)
          .join("");

        const html = `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
            <h2 style="color:#1e3a5f;">New ${escapeHtml(form_type)} Submission</h2>
            <table style="border-collapse:collapse;width:100%;font-size:14px;">
              ${detailRows}
            </table>
            <p style="margin-top:16px;font-size:12px;color:#6b7280;">This notification was sent automatically by WorldAML Forms.</p>
          </div>`;

        const leadScore = Number((metadata as any)?.lead_score ?? 0);
        const scoreFlag = leadScore >= 70 ? "🔥 HOT LEAD " : leadScore >= 40 ? "⭐ Qualified " : "";
        const scoreSuffix = leadScore > 0 ? ` (score ${leadScore})` : "";
        await sendEmailWithRetry(resend, {
          from: FROM_EMAIL,
          to: [NOTIFY_EMAIL],
          cc: ["compliance@infocreditgroup.com"],
          subject: `${scoreFlag}New ${escapeHtml(form_type)} from ${escapeHtml(first_name)} ${escapeHtml(last_name)}${scoreSuffix}`,
          html,
        });
      }
    } catch (emailErr) {
      console.error("Email send failed (non-blocking):", emailErr);
    }

    return new Response(JSON.stringify({ success: true, message: "Form submitted successfully" }), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "X-RateLimit-Limit": String(RATE_LIMIT_MAX),
        "X-RateLimit-Remaining": String(remaining),
      },
    });
  } catch (err) {
    console.error("Submit form error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
