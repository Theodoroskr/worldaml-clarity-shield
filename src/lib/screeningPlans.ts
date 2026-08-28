/**
 * Single source of truth for WorldAML Screening & Monitoring packages.
 * Two separate lanes: the Platform subscription and the API-only subscription.
 * All prices are ANNUAL. Never display monthly equivalents.
 *
 * Stripe mapping: `stripePriceId` must be explicitly set to the price that
 * matches the annual amount below. While it is null, checkout stays disabled
 * and the buyer is routed to sales — we never reuse a legacy price ID.
 */

export type ScreeningPlanKey =
  | "demo"
  | "essentials"
  | "starter"
  | "professional"
  | "compliance"
  | "enterprise";

export type ScreeningApiPlanKey =
  | "api_sandbox"
  | "api_starter"
  | "api_professional"
  | "api_compliance"
  | "api_enterprise";

export interface ScreeningPlanDefinition {
  key: ScreeningPlanKey | ScreeningApiPlanKey;
  name: string;
  /** Annual price in cents. 0 = free, null = custom pricing. */
  priceCents: number | null;
  priceDisplay: string | null;
  period: string;
  summary: string;
  searchQuotaAnnual: number | null;
  monitorQuota: number | null;
  seats: number | null;
  features: string[];
  cta: string;
  checkoutPlan: string;
  /** Stripe price ID for the annual amount above. Null = not mapped yet. */
  stripePriceId: string | null;
  popular?: boolean;
}

export const SCREENING_PLANS: ScreeningPlanDefinition[] = [
  {
    key: "demo",
    name: "Demo",
    priceCents: 0,
    priceDisplay: "Free",
    period: "",
    summary: "Explore the workspace with a handful of screening searches.",
    searchQuotaAnnual: 5,
    monitorQuota: 0,
    seats: 1,
    features: [
      "5 lifetime screening searches",
      "No monitoring",
      "1 user",
      "No API access",
      "No bulk screening",
      "No payment card required",
    ],
    cta: "Start Free Demo",
    checkoutPlan: "demo",
    stripePriceId: null,
  },
  {
    key: "essentials",
    name: "Essentials",
    priceCents: 59000,
    priceDisplay: "€590",
    period: "/year",
    summary: "Annual compliance essentials for small teams.",
    searchQuotaAnnual: 500,
    monitorQuota: 100,
    seats: 1,
    features: [
      "500 screening searches per year",
      "Up to 100 active monitored entities",
      "Web platform access",
      "Ongoing monitoring alerts",
      "Audit-ready screening reports",
      "1 user",
      "Email support",
    ],
    cta: "Choose Essentials",
    checkoutPlan: "essentials",
    stripePriceId: null,
  },
  {
    key: "starter",
    name: "Starter",
    priceCents: 119000,
    priceDisplay: "€1,190",
    period: "/year",
    summary: "For growing compliance teams starting structured screening.",
    searchQuotaAnnual: 1000,
    monitorQuota: 200,
    seats: 3,
    features: [
      "1,000 screening searches per year",
      "Up to 200 active monitored entities",
      "Web platform access",
      "Ongoing monitoring alerts",
      "Audit-ready screening reports",
      "Case and search history",
      "Up to 3 users",
      "Email support",
    ],
    cta: "Choose Starter",
    checkoutPlan: "starter",
    stripePriceId: null,
  },
  {
    key: "professional",
    name: "Professional",
    priceCents: 249000,
    priceDisplay: "€2,490",
    period: "/year",
    summary: "For established programmes with higher volumes and team needs.",
    searchQuotaAnnual: 2000,
    monitorQuota: 500,
    seats: 5,
    features: [
      "2,000 screening searches per year",
      "Up to 500 active monitored entities",
      "Web platform access",
      "Ongoing monitoring alerts",
      "Audit-ready screening reports",
      "Case management and search history",
      "Up to 5 users",
      "Priority email support",
    ],
    cta: "Choose Professional",
    checkoutPlan: "professional",
    stripePriceId: null,
    popular: true,
  },
  {
    key: "compliance",
    name: "Compliance",
    priceCents: 595000,
    priceDisplay: "€5,950",
    period: "/year",
    summary: "For compliance programmes with significant ongoing monitoring.",
    searchQuotaAnnual: 5000,
    monitorQuota: 1000,
    seats: 10,
    features: [
      "5,000 screening searches per year",
      "Up to 1,000 active monitored entities",
      "Web platform access",
      "Enhanced monitoring configuration",
      "Audit-ready screening reports",
      "Case management and audit history",
      "Up to 10 users",
      "Priority support",
    ],
    cta: "Choose Compliance",
    checkoutPlan: "compliance",
    stripePriceId: null,
  },
  {
    key: "enterprise",
    name: "Enterprise",
    priceCents: null,
    priceDisplay: null,
    period: "",
    summary: "High-volume and multi-entity groups with bespoke requirements.",
    searchQuotaAnnual: null,
    monitorQuota: null,
    seats: null,
    features: [
      "Negotiated annual screening allowance",
      "Negotiated monitoring capacity",
      "Multiple users",
      "Advanced configuration",
      "Dedicated account manager",
      "SLA options",
      "Custom onboarding",
    ],
    cta: "Contact Sales",
    checkoutPlan: "enterprise",
    stripePriceId: null,
  },
];

export const SCREENING_API_INTRO =
  "Integrate WorldAML screening and ongoing monitoring directly into your applications and workflows. API subscriptions are separate from WorldAML Platform subscriptions.";

export const SCREENING_API_PLANS: ScreeningPlanDefinition[] = [
  {
    key: "api_sandbox",
    name: "API Sandbox",
    priceCents: 0,
    priceDisplay: "Free",
    period: "",
    summary: "Build and test the integration against sandbox data.",
    searchQuotaAnnual: 0,
    monitorQuota: 0,
    seats: null,
    features: [
      "Sandbox environment",
      "Test data only",
      "API documentation",
      "Test webhooks",
      "No production screening or monitoring",
    ],
    cta: "Get Sandbox Access",
    checkoutPlan: "api_sandbox",
    stripePriceId: null,
  },
  {
    key: "api_starter",
    name: "API Starter",
    priceCents: 195000,
    priceDisplay: "€1,950",
    period: "/year",
    summary: "Production screening and monitoring endpoints for first integrations.",
    searchQuotaAnnual: 1000,
    monitorQuota: 400,
    seats: null,
    features: [
      "1,000 production API screening calls per year",
      "Up to 400 active monitored entities",
      "Screening and monitoring endpoints",
      "Standard webhooks",
      "Audit-ready JSON and PDF results",
      "Email technical support",
    ],
    cta: "Choose API Starter",
    checkoutPlan: "api_starter",
    stripePriceId: null,
  },
  {
    key: "api_professional",
    name: "API Professional",
    priceCents: 395000,
    priceDisplay: "€3,950",
    period: "/year",
    summary: "Higher volumes with configurable webhooks and integration support.",
    searchQuotaAnnual: 2500,
    monitorQuota: 1000,
    seats: null,
    features: [
      "2,500 production API screening calls per year",
      "Up to 1,000 active monitored entities",
      "Screening and monitoring endpoints",
      "Configurable webhooks",
      "Audit-ready JSON and PDF results",
      "Integration support",
      "Priority email support",
    ],
    cta: "Choose API Professional",
    checkoutPlan: "api_professional",
    stripePriceId: null,
    popular: true,
  },
  {
    key: "api_compliance",
    name: "API Compliance",
    priceCents: 795000,
    priceDisplay: "€7,950",
    period: "/year",
    summary: "Large programmes running screening and monitoring at scale.",
    searchQuotaAnnual: 5000,
    monitorQuota: 2000,
    seats: null,
    features: [
      "5,000 production API screening calls per year",
      "Up to 2,000 active monitored entities",
      "Screening and monitoring endpoints",
      "Enhanced monitoring configuration",
      "Custom webhooks",
      "Audit-ready JSON and PDF results",
      "Priority technical support",
    ],
    cta: "Choose API Compliance",
    checkoutPlan: "api_compliance",
    stripePriceId: null,
  },
  {
    key: "api_enterprise",
    name: "API Enterprise",
    priceCents: null,
    priceDisplay: null,
    period: "",
    summary: "Bespoke volumes, integrations and commercial terms.",
    searchQuotaAnnual: null,
    monitorQuota: null,
    seats: null,
    features: [
      "Negotiated annual screening allowance",
      "Negotiated monitoring capacity",
      "Volume-based pricing",
      "Dedicated account manager",
      "SLA options",
      "Custom integrations",
      "Technical onboarding",
    ],
    cta: "Contact Sales",
    checkoutPlan: "api_enterprise",
    stripePriceId: null,
  },
];

/** Checkout is only offered once the matching annual Stripe price is mapped. */
export function isCheckoutEnabled(plan: ScreeningPlanDefinition): boolean {
  return Boolean(plan.priceCents && plan.stripePriceId);
}

export const SCREENING_PLAN_BY_KEY = Object.fromEntries(
  [...SCREENING_PLANS, ...SCREENING_API_PLANS].map((p) => [p.key, p])
) as Record<ScreeningPlanKey | ScreeningApiPlanKey, ScreeningPlanDefinition>;

/** Annual extra-seat price: €29/user/month billed annually. */
export const SCREENING_EXTRA_SEAT_CENTS_YEARLY = 34800;

export function screeningPlanFromStripePrice(priceId: string): ScreeningPlanKey | null {
  const mapped = SCREENING_PLANS.find((p) => p.stripePriceId === priceId);
  if (mapped) return mapped.key as ScreeningPlanKey;
  // Legacy prices retained so existing customers keep their entitlements.
  const legacy: Record<string, ScreeningPlanKey> = {
    price_1U9NUCLz1lUQpGdDcU0HY0k2: "essentials",
    price_1U9NUDLz1lUQpGdDw8qxmjng: "starter",
    price_1U9NUELz1lUQpGdDKpRJEy9I: "professional",
    price_1U9NUELz1lUQpGdD44gsuBzO: "compliance",
    price_1SzfOKLz1lUQpGdDOeGRsgdn: "starter",
    price_1SzfPqLz1lUQpGdDDtgsGVbp: "compliance",
  };
  return legacy[priceId] ?? null;
}

export function screeningQuotaForPlan(plan: string): {
  searchQuotaAnnual: number | null;
  monitorQuota: number | null;
  seats: number | null;
} {
  const def = SCREENING_PLAN_BY_KEY[(plan ?? "").toLowerCase() as ScreeningPlanKey];
  if (def) {
    return {
      searchQuotaAnnual: def.searchQuotaAnnual,
      monitorQuota: def.monitorQuota,
      seats: def.seats,
    };
  }
  return { searchQuotaAnnual: null, monitorQuota: null, seats: null };
}
