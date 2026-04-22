// Single source of truth for Academy paid course pricing.
// EUR is the base; USD/GBP are derived at checkout time via FX rates.
// Free courses are intentionally absent from this map.

export interface AcademyCoursePrice {
  eurCents: number;
  stripeProductId: string;
}

// NOTE: Stripe product IDs are filled in as products are created in Stripe.
// Until a product exists, leave the entry out — the basket will refuse to add it.
export const ACADEMY_PRICING: Record<string, AcademyCoursePrice> = {
  // €49 advanced course
  "crypto-aml-essentials": { eurCents: 4900, stripeProductId: "" },

  // €29 standard courses
  "aml-compliance-eu": { eurCents: 2900, stripeProductId: "" },
  "aml-compliance-uk": { eurCents: 2900, stripeProductId: "" },
  "aml-compliance-cyprus": { eurCents: 2900, stripeProductId: "" },
  "aml-compliance-canada": { eurCents: 2900, stripeProductId: "" },
  "aml-compliance-caribbean": { eurCents: 2900, stripeProductId: "" },
  "aml-compliance-united-states": { eurCents: 2900, stripeProductId: "" },
  "sanctions-compliance": { eurCents: 2900, stripeProductId: "" },
  "pep-screening-adverse-media": { eurCents: 2900, stripeProductId: "" },
  "transaction-monitoring-fundamentals": { eurCents: 2900, stripeProductId: "" },
  "suspicious-activity-reporting": { eurCents: 2900, stripeProductId: "" },
  "risk-based-approach": { eurCents: 2900, stripeProductId: "" },
  "beneficial-ownership-ubo": { eurCents: 2900, stripeProductId: "" },
  "compliance-officer-essentials": { eurCents: 2900, stripeProductId: "" },
  "regulatory-reporting-essentials": { eurCents: 2900, stripeProductId: "" },
  "travel-rule-wire-transfers": { eurCents: 2900, stripeProductId: "" },
};

// Free course slugs — not purchasable, never blocked by paywall.
export const FREE_ACADEMY_COURSES = new Set<string>([
  "aml-fundamentals",
  "sanctions-screening-essentials",
]);

export const isPaidCourse = (slug: string): boolean =>
  !FREE_ACADEMY_COURSES.has(slug) && slug in ACADEMY_PRICING;

export const getCoursePrice = (slug: string): AcademyCoursePrice | null =>
  ACADEMY_PRICING[slug] ?? null;
