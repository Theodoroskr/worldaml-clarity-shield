// Single source of truth for Academy paid course pricing.
// EUR is the base; USD/GBP are derived at checkout time via FX rates.
// Free courses are intentionally absent from this map.
//
// Keys MUST match academy_courses.slug in the database.

export interface AcademyCoursePrice {
  eurCents: number;
  stripeProductId: string;
}

export const ACADEMY_PRICING: Record<string, AcademyCoursePrice> = {
  // ── Foundational paid course (KYC) ─────────────────────────────────
  "kyc-customer-due-diligence": { eurCents: 2900, stripeProductId: "prod_UNtNyYF6HC7Osp" },

  // ── Regional AML programmes — €29 each ─────────────────────────────
  "aml-europe": { eurCents: 2900, stripeProductId: "prod_UNtOIK9w7fRxZy" },
  "aml-gcc-mena": { eurCents: 2900, stripeProductId: "prod_UNtPKlfpEfKIP6" },
  "aml-asia-pacific": { eurCents: 2900, stripeProductId: "prod_UNtWobcmrPAJU3" },
  "aml-americas": { eurCents: 2900, stripeProductId: "prod_URCbOPZTOUEZGi" },
  "aml-africa": { eurCents: 2900, stripeProductId: "prod_URCbXpPRQb1nNV" },
  "aml-cis": { eurCents: 2900, stripeProductId: "prod_URCc2U8EkGSsSO" },

  // ── Global specialisations — €29 standard, €49 advanced ────────────
  "pep-screening-edd": { eurCents: 2900, stripeProductId: "prod_URCcOUYeCwnyjF" },
  "adverse-media-intelligence": { eurCents: 2900, stripeProductId: "prod_URCcuWwRKR6w2T" },
  "beneficial-ownership": { eurCents: 2900, stripeProductId: "prod_URCcNXPR9xIxu5" },
  "beneficial-ownership-ubo-transparency": { eurCents: 2900, stripeProductId: "prod_URCcLmKpBK20zV" },
  "transaction-monitoring-sar": { eurCents: 2900, stripeProductId: "prod_URCdenMZN0nNw8" },
  "risk-based-approach": { eurCents: 2900, stripeProductId: "prod_URCdnPTBqo5gbh" },
  "international-sanctions-compliance": { eurCents: 2900, stripeProductId: "prod_URCdkCCDtRRWyC" },
  "crypto-aml": { eurCents: 4900, stripeProductId: "prod_URCdSqTbYEbrFg" },
  "crypto-aml-essentials": { eurCents: 4900, stripeProductId: "prod_URCdNRdfGf9gXK" },
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
