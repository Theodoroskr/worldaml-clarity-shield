import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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

  // Rate limit check
  const { allowed, remaining } = checkRateLimit(ip);
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

    // Store in database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { error: dbError } = await supabase.from("form_submissions").insert({
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
      metadata: metadata || {},
    });

    if (dbError) {
      console.error("Database insert error:", dbError);
      return new Response(JSON.stringify({ error: "Failed to save submission" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create a Lead in Zoho CRM via the connector gateway (non-blocking)
    try {
      const lovableKey = Deno.env.get("LOVABLE_API_KEY");
      const zohoKey = Deno.env.get("ZOHO_CRM_API_KEY");
      if (lovableKey && zohoKey) {
        const attribution = (metadata as any)?.attribution ?? {};

        // Description = visitor's message exactly as submitted. If no message,
        // fall back to a short auto-generated summary so the Lead still has
        // useful context.
        const trimmedMessage = message?.trim() || "";
        const fallbackDesc = [
          form_type ? `Form: ${form_type}` : null,
          products?.length ? `Products: ${products.join(", ")}` : null,
          region ? `Region: ${region}` : null,
          account_type ? `Account type: ${account_type}` : null,
        ]
          .filter(Boolean)
          .join("\n");
        const descriptionValue = trimmedMessage || fallbackDesc || undefined;

        const leadRecord: Record<string, unknown> = {
          First_Name: first_name?.trim().slice(0, 40) || undefined,
          Last_Name: (last_name?.trim() || first_name?.trim() || "Unknown").slice(0, 80),
          Email: email.trim().slice(0, 100),
          Company: (company?.trim() || "Individual").slice(0, 200),
          Phone: phone?.trim().slice(0, 30) || undefined,
          // Zoho's "Title" field has api_name "Designation".
          Designation: job_title?.trim().slice(0, 100) || undefined,
          // Contact Information → "Job title" (api_name: Job_title). Populated
          // verbatim from the website's Job Title input.
          Job_title: job_title?.trim().slice(0, 100) || undefined,
          Country: country?.trim().slice(0, 100) || undefined,
          // Industry is a Zoho picklist — map website codes to allowed values.
          Industry: (() => {
            const raw = industry?.trim();
            if (!raw) return undefined;
            const INDUSTRY_MAP: Record<string, string> = {
              "bank": "Financial Institutions",
              "banking": "Financial Institutions",
              "fintech": "Financial Institutions",
              "crypto": "Financial Institutions",
              "vasp": "Financial Institutions",
              "crypto/vasp": "Financial Institutions",
              "payments": "Payment Solutions & Processors",
              "igaming": "Betting, Gaming and Casino",
              "gaming": "Betting, Gaming and Casino",
              "casino": "Betting, Gaming and Casino",
              "legal": "Law firms",
              "law": "Law firms",
              "insurance": "Insurance",
              "forex": "Forex Companies",
              "real-estate": "Real Estate Agents",
              "real_estate": "Real Estate Agents",
              "government": "Government/Military",
              "healthcare": "Healthcare Services",
              "education": "Education",
              "shipping": "Shipping",
              "telecom": "Telecommunications",
              "other": "Other",
            };
            const mapped = INDUSTRY_MAP[raw.toLowerCase()];
            if (mapped) return mapped;
            console.warn(`Unknown industry value from website form: "${raw}" — leaving Zoho Industry unset`);
            return undefined;
          })(),
          // Topic — fixed value for every WorldAML lead so CRM workflows can
          // segment by source brand.
          Topic: "WorldAML",
          // Business Use Cases (multiselectpicklist) — mapped from the
          // website's use-case codes to Zoho's exact allowed values.
          Business_Use_Cases: (() => {
            if (!Array.isArray(products) || products.length === 0) return undefined;
            const BUC_MAP: Record<string, string> = {
              "aml": "AML Screening",
              "aml_screening": "AML Screening",
              "aml-screening": "AML Screening",
              "sanctions": "Sanctions Screening",
              "sanctions_screening": "Sanctions Screening",
              "sanctions-api": "Sanctions Screening",
              "kyc": "KYC",
              "kyb": "KYB",
              "kyc-kyb-api": "KYC",
              "cdd": "CDD",
              "edd": "EDD",
              "tm": "Transaction Monitoring",
              "transaction_monitoring": "Transaction Monitoring",
              "transaction-monitoring": "Transaction Monitoring",
              "pep": "PEP Screening",
              "pep_screening": "PEP Screening",
              "adverse_media": "Adverse Media",
              "adverse-media": "Adverse Media",
              "api": "API Integration",
              "api_integration": "API Integration",
              "worldaml-api": "API Integration",
              "training": "Training",
              "academy": "Training",
              "academy-team": "Training",
              "academy-team-plan": "Training",
              "consulting": "Consulting",
              "advisory": "Consulting",
            };
            const out = new Set<string>();
            for (const raw of products) {
              const key = String(raw ?? "").trim().toLowerCase();
              if (!key) continue;
              const mapped = BUC_MAP[key];
              if (mapped) out.add(mapped);
              else console.warn(`Unknown use-case value for Business_Use_Cases: "${raw}"`);
            }
            return out.size ? Array.from(out) : undefined;
          })(),
          // This Zoho tenant uses "Note" (textarea) as the long-text field on
          // Leads — there is no "Description" field on the layout. The
          // visitor's message is stored verbatim here.
          Note: descriptionValue,
          Lead_Source: "Website - WorldAML",
          Lead_Status: "New",
          // Distinguishes originating website form so Zoho CRM workflows and
          // Cadences can route leads to the correct email sequences. Values
          // must match the Zoho "Form Type" picklist exactly:
          // ['Contact Sales', 'Book Demo', 'Newsletter', 'Webinar',
          //  'Event Registration', 'Partner Request', 'General Contact']
          Form_Type: (() => {
            const map: Record<string, string> = {
              "contact-sales": "Contact Sales",
              "contact_sales": "Contact Sales",
              "book-demo": "Book Demo",
              "book_demo": "Book Demo",
              "free-trial": "Book Demo",
              "worldcompliance-demo": "Book Demo",
              "free-aml-check": "Book Demo",
              "free_aml_check": "Book Demo",
              "partner-application": "Partner Request",
              "newsletter": "Newsletter",
            };
            const key = String(form_type ?? "").trim().toLowerCase();
            return map[key] || (form_type ? String(form_type) : undefined);
          })(),
          // Product_Demo (picklist on Leads) — identifies which product-specific
          // demo funnel the lead came from. Set to "free_aml_check" for the
          // /free-aml-check#lead-form walkthrough demo page.
          Product_Demo: (() => {
            const key = String(form_type ?? "").trim().toLowerCase();
            if (key === "free-aml-check" || key === "free_aml_check") {
              return "free_aml_check";
            }
            return undefined;
          })(),
          // Detailed multi-select picklist "Products Multi Selection" (api_name:
          // Products_Multi_Selection) — the specific WorldAML products the lead
          // selected on the website. Values must exactly match the Zoho picklist.
          Products_Multi_Selection: (() => {
            if (!Array.isArray(products) || products.length === 0) return undefined;
            const PMS_ALLOWED = new Set([
              "WorldAML Suite",
              "WorldAML API",
              "WorldID",
              "WorldCompliance",
              "Bridger Insight XG",
              "Academy \u2014 Team Plan",
              "Partner Program",
              "WorldAML Advisory",
            ]);
            const PMS_MAP: Record<string, string> = {
              "worldaml-suite": "WorldAML Suite",
              "suite": "WorldAML Suite",
              "worldaml-api": "WorldAML API",
              "worldid": "WorldID",
              "worldcompliance": "WorldCompliance",
              "worldcompliance®": "WorldCompliance",
              "bridger-xg": "Bridger Insight XG",
              "bridger-insight-xg": "Bridger Insight XG",
              "bridger insight xg": "Bridger Insight XG",
              "bridger insight xg®": "Bridger Insight XG",
              "academy": "Academy \u2014 Team Plan",
              "academy-team": "Academy \u2014 Team Plan",
              "academy-team-plan": "Academy \u2014 Team Plan",
              "training": "Academy \u2014 Team Plan",
              // Related APIs / features roll up to WorldAML API
              "sanctions-api": "WorldAML API",
              "kyc-kyb-api": "WorldAML API",
              "aml-screening": "WorldAML API",
              "transaction-monitoring": "WorldAML API",
              "regulatory-reporting": "WorldAML API",
              "risk-assessment": "WorldAML API",
              // Book-a-Demo use-case codes → default to WorldAML Suite
              "aml": "WorldAML Suite",
              "kyc": "WorldAML Suite",
              "kyb": "WorldAML Suite",
              "tm": "WorldAML Suite",
              "reporting": "WorldAML Suite",
              // Partner Program — Zoho picklist value
              "partnership": "Partner Program",
              "partner": "Partner Program",
              "partner-program": "Partner Program",
              "partner_program": "Partner Program",
              // WorldAML Advisory
              "worldaml-advisory": "WorldAML Advisory",
              "advisory": "WorldAML Advisory",
              "mlro-advisory": "WorldAML Advisory",
            };
            const mapped = new Set<string>();
            for (const raw of products) {
              const key = String(raw ?? "").trim();
              if (!key) continue;
              const candidate =
                PMS_MAP[key.toLowerCase()] ??
                (PMS_ALLOWED.has(key) ? key : null);
              if (candidate) mapped.add(candidate);
            }
            return mapped.size ? Array.from(mapped) : undefined;
          })(),

          // High-level category picklist "Product type list" (api_name:
          // Product_type_list1). Zoho picklist values: Platform, Data Source,
          // Training. Priority when multiple categories present:
          // Training > Platform > Data Source.
          Product_type_list1: (() => {
            if (!Array.isArray(products) || products.length === 0) return undefined;
            type Category = "Training" | "Platform" | "Data Source";
            const CATEGORY_MAP: Record<string, Category> = {
              // Platform
              "worldaml-suite": "Platform",
              "suite": "Platform",
              "worldaml-api": "Platform",
              "worldid": "Platform",
              "sanctions-api": "Platform",
              "kyc-kyb-api": "Platform",
              "aml-screening": "Platform",
              "transaction-monitoring": "Platform",
              "regulatory-reporting": "Platform",
              "risk-assessment": "Platform",
              // Book-a-Demo use-case codes
              "aml": "Platform",
              "kyc": "Platform",
              "kyb": "Platform",
              "tm": "Platform",
              "reporting": "Platform",
              // Data Source
              "worldcompliance": "Data Source",
              "worldcompliance®": "Data Source",
              "bridger-xg": "Data Source",
              "bridger-insight-xg": "Data Source",
              "bridger insight xg": "Data Source",
              "bridger insight xg®": "Data Source",
              // Training
              "academy": "Training",
              "academy-team": "Training",
              "academy-team-plan": "Training",
              "training": "Training",
            };
            // Live Zoho picklist values (from settings/fields metadata):
            // 'Platforms', 'Data Sources', 'Training'.
            const PICKLIST_FOR_CATEGORY: Record<Category, string> = {
              Training: "Training",
              Platform: "Platforms",
              "Data Source": "Data Sources",
            };

            const seen = new Set<Category>();
            for (const raw of products) {
              const key = String(raw ?? "").trim().toLowerCase();
              const cat = CATEGORY_MAP[key];
              if (cat) seen.add(cat);
            }
            const chosen: Category | undefined = seen.has("Training")
              ? "Training"
              : seen.has("Platform")
                ? "Platform"
                : seen.has("Data Source")
                  ? "Data Source"
                  : undefined;
            return chosen ? [PICKLIST_FOR_CATEGORY[chosen]] : undefined;
          })(),

          // Marketing / attribution custom fields (Zoho CRM API names)
          Website_Name: "WorldAML",
          Landing_Page_URL: attribution.landing_page || undefined,
          // Custom writable URL field on Leads for document.referrer.
          Referrer_URL: attribution.referrer || undefined,

          Source_UTM: attribution.utm_source || undefined,
          Medium_UTM: attribution.utm_medium || undefined,
          Name_UTM: attribution.utm_campaign || undefined,
          // Attribution — mapped to standard Zoho campaign UTM-style fields where possible.
          $utm_source: attribution.utm_source || undefined,
          $utm_medium: attribution.utm_medium || undefined,
          $utm_campaign: attribution.utm_campaign || undefined,
          $utm_term: attribution.utm_term || undefined,
          $utm_content: attribution.utm_content || undefined,

          // ── Additional WorldAML Book Demo mappings ────────────────────────
          // Sales Organisation Unit — WorldAML leads belong to the ICG parent
          // sales unit, EXCEPT partnership enquiries which route to the
          // WorldAML Partnership sales unit for the partner team to own.
          Sales_Organisation_Unit: (() => {
            const isPartnership = Array.isArray(products) && products.some((p) => {
              const k = String(p ?? "").trim().toLowerCase();
              return k === "partnership" || k === "partner" || k === "partner-program" || k === "partner_program";
            });
            return isPartnership ? "WorldAML Partnership" : "Infocredit Group (ICG)";
          })(),

          // Qualification level — derived from lead-scoring tier:
          //   hot → Hot, qualified → Warm, low → Cold.
          Qualification_level: (() => {
            const tier = String((metadata as any)?.lead_tier ?? "").toLowerCase();
            if (tier === "hot") return "Hot";
            if (tier === "qualified") return "Warm";
            if (tier === "low") return "Cold";
            return undefined;
          })(),

          // Communication Consents (multiselectpicklist) — WorldAML leads
          // consent to regulatory/compliance communications by submitting a
          // demo request. Exact Zoho picklist value.
          Communication_Consents: ["Regulatory Compliance & Corp Governance"],

          // Marketing Communication Consent (boolean) — set true when the
          // visitor explicitly opts in via metadata.marketing_consent; leave
          // unset otherwise so Zoho does not record a false consent.
          Marketing_Communication_Consent:
            (metadata as any)?.marketing_consent === true ? true : undefined,

          // Attendance — only applies to webinar / event registrations.
          Attendance: (() => {
            const ft = String(form_type ?? "").toLowerCase();
            if (ft.includes("webinar") || ft.includes("event")) return "Attending";
            return undefined;
          })(),

          // Old_CRM_lead_ID and Account_Party_ID are legacy identifiers from
          // Infocredit's previous CRM — populated only when the website sends
          // an explicit value via metadata (never fabricated).
          Old_CRM_lead_ID: (metadata as any)?.old_crm_lead_id
            ? String((metadata as any).old_crm_lead_id).slice(0, 100)
            : undefined,
          Account_Party_ID: (metadata as any)?.account_party_id
            ? String((metadata as any).account_party_id).slice(0, 100)
            : undefined,

          // Partner Type (picklist on Leads) — mapped from the Partner
          // contact form's partner_type value. Zoho picklist values must
          // match exactly:
          //   'Referral Partner 5%', 'Affiliate Partner 10%',
          //   'Reseller Partner 15%', 'Technology / Integration Partner',
          //   'Not sure yet'.
          Partner_Type: (() => {
            const raw = String((metadata as any)?.partner_type ?? "").trim().toLowerCase();
            if (!raw) return undefined;
            const PARTNER_TYPE_MAP: Record<string, string> = {
              "referral": "Referral Partner 5%",
              "affiliate": "Affiliate Partner 10%",
              "reseller": "Reseller Partner 15%",
              "technology": "Technology / Integration Partner",
              "not-sure": "Not sure yet",
              "not_sure": "Not sure yet",
            };
            const mapped = PARTNER_TYPE_MAP[raw];
            if (!mapped) {
              console.warn(`Unknown partner_type value from website form: "${raw}"`);
              return undefined;
            }
            return mapped;
          })(),
        };




        // Strip undefined values before sending.
        Object.keys(leadRecord).forEach(
          (k) => leadRecord[k] === undefined && delete leadRecord[k],
        );

        // Resolve the Zoho Lead Assignment Rule ID so ownership is decided by
        // Zoho CRM (via the configured Assignment Rule) rather than set here.
        // Prefer an explicit env override; otherwise auto-discover the first
        // active Leads assignment rule and cache it on the module.
        let larId: string | undefined = Deno.env.get("ZOHO_CRM_LEAD_ASSIGNMENT_RULE_ID") || undefined;
        if (!larId) {
          larId = (globalThis as any).__zohoLeadsLarId;
        }
        if (!larId) {
          try {
            const rulesRes = await fetch(
              "https://connector-gateway.lovable.dev/zoho_crm/settings/automation/assignment_rules?module=Leads",
              {
                headers: {
                  Authorization: `Bearer ${lovableKey}`,
                  "X-Connection-Api-Key": zohoKey,
                },
              },
            );
            if (rulesRes.ok) {
              const rulesBody = await rulesRes.json().catch(() => null);
              const rules = rulesBody?.assignment_rules ?? [];
              larId = rules[0]?.id;
              if (larId) (globalThis as any).__zohoLeadsLarId = larId;
            } else {
              console.warn(
                `Zoho assignment rule lookup failed [${rulesRes.status}]: ${await rulesRes.text()}`,
              );
            }
          } catch (lookupErr) {
            console.warn("Zoho assignment rule lookup error:", lookupErr);
          }
        }

        const leadPayload: Record<string, unknown> = {
          data: [leadRecord],
          trigger: ["approval", "workflow", "blueprint"],
        };
        if (larId) leadPayload.lar_id = larId;
        else {
          console.warn(
            "No Zoho Lead Assignment Rule ID available — lead will be created without triggering an assignment rule.",
          );
        }

        // Retry transient upstream failures (5xx / network resets) up to 3 attempts
        // with exponential backoff. The connector gateway sometimes returns 503
        // "upstream connect error" when Zoho briefly resets the connection.
        let zohoRes: Response | null = null;
        let lastErrBody = "";
        const MAX_ATTEMPTS = 3;
        for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
          try {
            zohoRes = await fetch(
              "https://connector-gateway.lovable.dev/zoho_crm/Leads",
              {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${lovableKey}`,
                  "X-Connection-Api-Key": zohoKey,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(leadPayload),
              },
            );
            if (zohoRes.ok) break;
            lastErrBody = await zohoRes.text();
            const retriable = zohoRes.status >= 500 && zohoRes.status < 600;
            console.error(
              `Zoho CRM lead creation failed [${zohoRes.status}] attempt ${attempt}/${MAX_ATTEMPTS}: ${lastErrBody}`,
            );
            if (!retriable || attempt === MAX_ATTEMPTS) break;
          } catch (netErr) {
            console.error(
              `Zoho CRM lead creation network error attempt ${attempt}/${MAX_ATTEMPTS}:`,
              netErr,
            );
            if (attempt === MAX_ATTEMPTS) throw netErr;
          }
          await new Promise((r) => setTimeout(r, 500 * attempt));
        }

        if (zohoRes && zohoRes.ok) {
          const okBody = await zohoRes.json().catch(() => null);
          const record = okBody?.data?.[0];
          if (record?.status && record.status !== "success") {
            console.error("Zoho CRM lead rejected:", JSON.stringify(record));
          } else {
            console.log("Zoho CRM lead created:", record?.details?.id ?? "ok");
          }
        }

      } else {
        console.warn("Zoho CRM connector secrets not configured — skipping lead sync");
      }
    } catch (zohoErr) {
      console.error("Zoho CRM lead sync failed (non-blocking):", zohoErr);
    }

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
