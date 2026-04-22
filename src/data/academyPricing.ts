// Single source of truth for Academy paid course pricing.
// EUR is the base; USD/GBP are derived at checkout time via FX rates.
// Free courses are intentionally absent from this map.
//
// Keys MUST match academy_courses.slug in the database. Stripe product IDs
// are filled in by the AdminPricing panel as products are created in Stripe.
// Until a Stripe price exists in the DB, the basket will surface "not yet
// available for purchase" on the unlock wall — but the price badge still
// renders so learners can see what the course will cost.

export interface AcademyCoursePrice {
  eurCents: number;
  stripeProductId: string;
}

export const ACADEMY_PRICING: Record<string, AcademyCoursePrice> = {
  // ── Foundational paid course (KYC) ─────────────────────────────────
  "kyc-customer-due-diligence": { eurCents: 2900, stripeProductId: "" },

  // ── Regional AML programmes — €29 each ─────────────────────────────
  "aml-europe": { eurCents: 2900, stripeProductId: "" },
  "aml-gcc-mena": { eurCents: 2900, stripeProductId: "" },
  "aml-asia-pacific": { eurCents: 2900, stripeProductId: "" },
  "aml-americas": { eurCents: 2900, stripeProductId: "" },
  "aml-africa": { eurCents: 2900, stripeProductId: "" },
  "aml-cis": { eurCents: 2900, stripeProductId: "" },

  // ── Global specialisations — €29 standard, €49 advanced ────────────
  "pep-screening-edd": { eurCents: 2900, stripeProductId: "" },
  "adverse-media-intelligence": { eurCents: 2900, stripeProductId: "" },
  "beneficial-ownership": { eurCents: 2900, stripeProductId: "" },
  "beneficial-ownership-ubo-transparency": { eurCents: 2900, stripeProductId: "" },
  "transaction-monitoring-sar": { eurCents: 2900, stripeProductId: "" },
  "risk-based-approach": { eurCents: 2900, stripeProductId: "" },
  "international-sanctions-compliance": { eurCents: 2900, stripeProductId: "" },
  "crypto-aml": { eurCents: 4900, stripeProductId: "" },
  "crypto-aml-essentials": { eurCents: 4900, stripeProductId: "" },
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
