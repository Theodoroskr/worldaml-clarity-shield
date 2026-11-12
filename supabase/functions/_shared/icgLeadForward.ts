// Forwards website enquiries to the Infocredit Group CRM lead receiver.
// The payload builder is pure (no Deno APIs) so it can be unit-tested.

export const ICG_LEADS_URL = "https://infocredit-group-connect.lovable.app/api/public/leads";
export const ICG_SITE = "worldaml.com";

export interface IcgLeadInput {
  form_type: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  job_title?: string | null;
  country?: string | null;
  industry?: string | null;
  region?: string | null;
  account_type?: string | null;
  message?: string | null;
  /** Human-readable product names, already joined. */
  product?: string | null;
  metadata?: Record<string, unknown> | null;
}

const TOPICS: Record<string, string> = {
  "contact-sales": "Sales enquiry / demo request",
  contact_sales: "Sales enquiry / demo request",
  book_demo: "Book a demo",
  "partner-application": "Partner application",
  "partner-contact": "Partner enquiry",
  "casino-aml-demo-us": "US casino AML demo request",
};

const str = (v: unknown): string => (typeof v === "string" ? v.trim() : v == null ? "" : String(v).trim());
const cut = (v: unknown, n: number): string | undefined => {
  const s = str(v);
  return s ? s.slice(0, n) : undefined;
};

export function icgTopicFor(formType: string): string {
  const key = str(formType).toLowerCase();
  if (TOPICS[key]) return TOPICS[key];
  if (/-demo-us$/.test(key)) return "US AML demo request";
  return key.replace(/[-_]+/g, " ").replace(/^\w/, (c) => c.toUpperCase());
}

export function buildIcgLeadPayload(input: IcgLeadInput): Record<string, unknown> {
  const md = (input.metadata ?? {}) as Record<string, any>;
  const at = (md.attribution ?? {}) as Record<string, any>;

  const service =
    md.partner_type || md.segment_label || md.segment || md.operator_type || input.industry || input.account_type;

  // Extra details the group CRM has no field for are appended to the message.
  const details = [
    ["Job title", input.job_title],
    ["Industry", input.industry],
    ["Region", input.region],
    ["Account type", input.account_type],
    ["Jurisdiction", md.jurisdiction],
    ["Company size", md.company_size],
    ["Role", md.role],
    ["Volume", md.volume || md.screening_volume],
    ["Company website", md.website],
    ["Partner referral code", md.referral_code],
    ["Lead score", md.lead_score],
  ]
    .filter(([, v]) => str(v))
    .map(([k, v]) => `${k}: ${str(v)}`);
  const message = [str(input.message), details.length ? details.join("\n") : ""]
    .filter(Boolean)
    .join("\n\n");

  const pageUrl = at.landing_page || md.page || md.source_page || md.landing_page;

  const payload: Record<string, unknown> = {
    site: ICG_SITE,
    form_type: cut(input.form_type, 150),
    name: cut(`${str(input.first_name)} ${str(input.last_name)}`, 150),
    email: str(input.email).slice(0, 255),
    company: cut(input.company, 200),
    job_title: cut(input.job_title, 150),
    phone: cut(input.phone, 40),
    country: cut(input.country, 100),
    product: cut(input.product, 200),
    service: cut(service, 150),
    topic: cut(icgTopicFor(input.form_type), 200),
    message: cut(message, 3000),
    consent_marketing: md.marketing_consent === true,
    utm_source: cut(at.utm_source, 200),
    utm_medium: cut(at.utm_medium, 200),
    utm_campaign: cut(at.utm_campaign, 200),
    utm_content: cut(at.utm_content, 200),
    utm_term: cut(at.utm_term, 200),
    page_url: cut(pageUrl, 1000),
    referrer: cut(at.cta_referrer || at.referrer, 1000),
    first_page_visited: cut(at.first_page_visited, 1000),
  };
  // Never send `website`: the receiver treats it as a bot honeypot.
  for (const k of Object.keys(payload)) if (payload[k] === undefined) delete payload[k];
  return payload;
}

/** Posts the lead; never throws. Retries once on network errors or 5xx. */
export async function forwardLeadToIcg(payload: Record<string, unknown>): Promise<boolean> {
  const key = (globalThis as any).Deno?.env.get("ICG_LEAD_WEBHOOK_KEY");
  if (!key) {
    console.warn("ICG_LEAD_WEBHOOK_KEY not set — lead not forwarded to Infocredit Group CRM");
    return false;
  }
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const res = await fetch(ICG_LEADS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-lead-api-key": key },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(8000),
      });
      const text = await res.text().catch(() => "");
      if (res.ok) {
        console.log(`Lead forwarded to Infocredit Group CRM [${res.status}] ${text.slice(0, 200)}`);
        return true;
      }
      console.error(`Infocredit Group lead forward failed [${res.status}] attempt ${attempt}: ${text.slice(0, 300)}`);
      if (res.status < 500) return false;
    } catch (err) {
      console.error(`Infocredit Group lead forward error attempt ${attempt}:`, (err as Error)?.message ?? err);
    }
  }
  return false;
}

/**
 * Side-effect-free key check: posts an empty body, which the receiver rejects
 * as invalid (400) when the key is accepted, or 401 when it is not.
 */
export async function checkIcgKey(): Promise<"accepted" | "rejected" | "missing" | "unreachable"> {
  const key = (globalThis as any).Deno?.env.get("ICG_LEAD_WEBHOOK_KEY");
  if (!key) return "missing";
  try {
    const res = await fetch(ICG_LEADS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-lead-api-key": key },
      body: "{}",
      signal: AbortSignal.timeout(8000),
    });
    await res.text().catch(() => "");
    return res.status === 401 ? "rejected" : res.status === 400 ? "accepted" : "unreachable";
  } catch {
    return "unreachable";
  }
}
