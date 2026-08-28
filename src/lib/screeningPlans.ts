/**
 * Single source of truth for WorldAML Screening & Monitoring packages.
 * All quotas are annual and aligned: searches/year = monitored entities/year.
 */

export type ScreeningPlanKey =
  | "demo"
  | "essentials"
  | "starter"
  | "professional"
  | "compliance"
  | "enterprise";

export interface ScreeningPlanDefinition {
  key: ScreeningPlanKey;
  name: string;
  priceCents: number | null;
  priceDisplay: string | null;
  period: string;
  summary: string;
  searchQuotaAnnual: number | null;
  monitorQuota: number | null;
  seats: number | null;
  features: string[];
  checkoutPlan: string;
  popular?: boolean;
}

export const SCREENING_PLANS: ScreeningPlanDefinition[] = [
  {
    key: "demo",
    name: "Demo",
    priceCents: 0,
    priceDisplay: "Free",
    period: "",
    summary: "Explore the workspace with a handful of searches.",
    searchQuotaAnnual: 5,
    monitorQuota: 0,
    seats: 1,
    features: [
      "5 screening searches/year",
      "No ongoing monitoring",
      "1 user seat",
      "Case management",
      "Standard support",
    ],
    checkoutPlan: "demo",
  },
  {
    key: "essentials",
    name: "Essentials",
    priceCents: 49000,
    priceDisplay: "€490",
    period: "/year",
    summary: "Annual compliance essentials for small teams.",
    searchQuotaAnnual: 500,
    monitorQuota: 100,
    seats: 1,
    features: [
      "500 screening searches/year",
      "100 monitored entities",
      "1 user seat",
      "Case management",
      "Standard support",
    ],
    checkoutPlan: "essentials",
  },
  {
    key: "starter",
    name: "Starter",
    priceCents: 99000,
    priceDisplay: "€990",
    period: "/year",
    summary: "For growing compliance teams starting structured screening.",
    searchQuotaAnnual: 1000,
    monitorQuota: 200,
    seats: 3,
    features: [
      "1,000 screening searches/year",
      "200 monitored entities",
      "3 user seats",
      "Case management",
      "Standard support",
    ],
    checkoutPlan: "starter",
  },
  {
    key: "professional",
    name: "Professional",
    priceCents: 199000,
    priceDisplay: "€1,990",
    period: "/year",
    summary: "For established programmes with higher volumes and team needs.",
    searchQuotaAnnual: 2000,
    monitorQuota: 500,
    seats: 5,
    features: [
      "2,000 screening searches/year",
      "500 monitored entities",
      "5 user seats",
      "Case management",
      "Priority support",
    ],
    checkoutPlan: "professional",
    popular: true,
  },
  {
    key: "compliance",
    name: "Compliance",
    priceCents: 495000,
    priceDisplay: "€4,950",
    period: "/year",
    summary: "For compliance programmes with significant ongoing monitoring.",
    searchQuotaAnnual: 5000,
    monitorQuota: 1000,
    seats: 10,
    features: [
      "5,000 screening searches/year",
      "1,000 monitored entities",
      "10 user seats",
      "Case management",
      "Priority support",
    ],
    checkoutPlan: "compliance",
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
      "Negotiated annual volume",
      "Unlimited monitored entities",
      "Unlimited seats",
      "Dedicated account manager",
      "SLA guarantees",
    ],
    checkoutPlan: "enterprise",
  },
];

export const SCREENING_PLAN_BY_KEY: Record<ScreeningPlanKey, ScreeningPlanDefinition> =
  Object.fromEntries(SCREENING_PLANS.map((p) => [p.key, p])) as Record<
    ScreeningPlanKey,
    ScreeningPlanDefinition
  >;

/** Annual extra-seat price: €29/user/month billed annually. */
export const SCREENING_EXTRA_SEAT_CENTS_YEARLY = 34800;

export function screeningPlanFromStripePrice(priceId: string): ScreeningPlanKey | null {
  const map: Record<string, ScreeningPlanKey> = {
    price_1U9NUCLz1lUQpGdDcU0HY0k2: "essentials",
    price_1U9NUDLz1lUQpGdDw8qxmjng: "starter",
    price_1U9NUELz1lUQpGdDKpRJEy9I: "professional",
    price_1U9NUELz1lUQpGdD44gsuBzO: "compliance",
    price_1SzfOKLz1lUQpGdDOeGRsgdn: "starter",
    price_1SzfPqLz1lUQpGdDDtgsGVbp: "compliance",
  };
  return map[priceId] ?? null;
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
