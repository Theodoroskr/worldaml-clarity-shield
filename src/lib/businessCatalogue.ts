import { Layers, Fingerprint, Database, GraduationCap, ShieldCheck, LucideIcon } from "lucide-react";
import { SCREENING_PLANS, isCheckoutEnabled } from "./screeningPlans";

/**
 * Authenticated business product catalogue.
 * Only real WorldAML products, real public pricing and real checkout functions.
 * Never invent prices, trials or plans here.
 */

export interface BusinessPlan {
  key: string;
  name: string;
  price: string | null;
  period?: string;
  summary: string;
  features: string[];
  /** Present only where genuine self-service checkout exists. */
  checkout?: { fn: string; plan: string; body?: Record<string, unknown> };
  /** Real in-app purchase path where the plan needs configuring before payment. */
  configureUrl?: string;
  configureLabel?: string;
  /** In-portal configure-then-pay dialog (keeps the buyer inside the business portal). */

}


export interface BusinessSolution {
  key: string;
  name: string;
  lane: "WorldAML Platform" | "Data Source" | "Training";
  icon: LucideIcon;
  tagline: string;
  /** Short business outcome. */
  outcome: string;
  solves: string[];
  capabilities: string[];
  idealFor: string;
  included: string[];
  addOns?: string[];
  faq: { q: string; a: string }[];
  plans: BusinessPlan[];
  /** Products that pair naturally — drives deterministic cross-sell. */
  pairsWith: string[];
  usageUnit?: string;
  /** Where an activated customer actually works. */
  openUrl?: string;
  publicUrl?: string;
}

export const BUSINESS_SOLUTIONS: BusinessSolution[] = [
  {
    key: "worldaml",
    name: "WorldAML Screening & Monitoring",
    lane: "WorldAML Platform",
    icon: Layers,
    tagline: "Sanctions, PEP and adverse media screening with ongoing monitoring.",
    outcome: "Screen customers at onboarding and keep them monitored for life.",
    solves: [
      "Manual sanctions checks that don't scale",
      "No ongoing monitoring after onboarding",
      "Screening evidence that regulators can't audit",
    ],
    capabilities: [
      "Screening across 1,900+ global sanctions, PEP and watchlists",
      "Ongoing monitoring with alerting on status changes",
      "Full REST API and batch screening",
      "Audit trail on every match decision",
      "Whitelisting and false-positive suppression",
    ],
    idealFor: "Regulated firms, fintechs, payment providers and gaming operators.",
    included: ["API access", "Case and alert management", "Audit-ready evidence", "Email support"],
    addOns: ["Additional monitored entities", "Enhanced due diligence reports"],
    faq: [
      { q: "How many lists are covered?", a: "1,900+ global sanctions, PEP, watchlist and adverse media sources." },
      { q: "Can we screen in bulk?", a: "Yes — batch screening and the REST API are included on all plans." },
      { q: "Is there a free trial?", a: "Yes — the Demo plan is free and self-serve. Activate it instantly for 5 screening searches, no card required." },
    ],
    plans: SCREENING_PLANS.map((p) => ({
      key: p.key,
      name: p.name,
      price: p.priceDisplay,
      period: p.period,
      summary: p.summary,
      features: p.features,
      checkout: isCheckoutEnabled(p)
        ? { fn: "create-worldaml-checkout", plan: p.checkoutPlan }
        : undefined,
      // The free Demo plan is self-serve: activate it in-app, never via sales.
      configureUrl: p.key === "demo" ? "/business/demo" : undefined,
      configureLabel: p.key === "demo" ? "Start Free Demo" : undefined,
    })),
    pairsWith: ["worldid", "academy"],
    usageUnit: "monitored entities",
    openUrl: "/suite/screening",
    publicUrl: "/screening-monitoring",
  },
  {
    key: "suite",
    name: "WorldAML Suite",
    lane: "WorldAML Platform",
    icon: ShieldCheck,
    tagline: "The full compliance stack: onboarding, screening, risk, cases and reporting in one place.",
    outcome: "Run your whole AML programme from one platform with one customer record and one audit trail.",
    solves: [
      "Compliance spread across disconnected point tools",
      "No single view of a customer's risk and history",
      "Manual regulatory reporting and weak audit evidence",
    ],
    capabilities: [
      "KYC & KYB onboarding with branded client forms",
      "Sanctions, PEP and adverse media screening with monitoring",
      "Risk scoring, transaction monitoring and alert rules",
      "Case management, SAR/STR drafting and regulatory exports",
      "Team roles, per-module access and an immutable audit trail",
    ],
    idealFor: "Banks, payment and e-money firms, fintechs, gaming operators and regulated professional firms.",
    included: ["Modules agreed in your quote", "Team seats", "Onboarding & setup support", "Encrypted, client-isolated data"],
    addOns: ["Extra modules", "Additional seats", "Regulator-specific reporting packs"],
    faq: [
      { q: "How is the Suite priced?", a: "On the modules, seats and volumes you need. Request a quote and we send a fixed annual price you can accept and pay online." },
      { q: "Can we start with a pilot?", a: "Yes. Ask for the Pilot plan in your quote request and we'll scope a time-limited pilot." },
      { q: "Is Screening included?", a: "Screening runs as a Suite module, so it can be part of your Suite order." },
    ],
    plans: [
      {
        key: "pilot",
        name: "Pilot",
        price: null,
        summary: "Time-limited pilot for your team on agreed modules.",
        features: ["Selected modules", "Guided setup", "Converts to an annual plan"],
      },
      {
        key: "annual",
        name: "Annual",
        price: null,
        summary: "Full Suite subscription billed annually.",
        features: ["Modules and seats of your choice", "Onboarding support", "Accept and pay your quote online"],
      },
    ],
    pairsWith: ["academy", "worldid"],
    usageUnit: "seats",
    openUrl: "/suite",
    publicUrl: "/platform/suite",
  },
  {
    key: "worldid",
    name: "WorldID Identity Verification",
    lane: "WorldAML Platform",
    icon: Fingerprint,
    tagline: "Document authentication and biometric liveness for KYC onboarding.",
    outcome: "Verify who your customers are before they transact.",
    solves: [
      "Manual document review at onboarding",
      "Impersonation and synthetic identity fraud",
      "Inconsistent KYC evidence across markets",
    ],
    capabilities: [
      "Global ID document authentication",
      "Biometric liveness and face match",
      "Manual review fallback",
      "White-label onboarding journey",
      "Structured KYC evidence storage",
    ],
    idealFor: "Any business onboarding customers remotely.",
    included: ["Verification sessions", "Hosted onboarding flow", "Evidence retention", "Standard support"],
    addOns: ["Additional verification volume", "Custom branding"],
    faq: [
      { q: "How is it priced?", a: "Per verification, billed annually against your selected volume band." },
      { q: "Which documents are supported?", a: "Passports, national IDs and driving licences across global issuers." },
    ],
    plans: [
      {
        key: "starter",
        name: "Starter",
        price: "€1.50",
        period: "/ verification",
        summary: "Up to 100 verifications per month.",
        features: ["Up to 100 verifications/month", "€1,800 billed annually", "Document + liveness"],
        checkout: { fn: "create-worldid-checkout", plan: "starter" },
      },
      {
        key: "growth",
        name: "Growth",
        price: "€1.00",
        period: "/ verification",
        summary: "Up to 400 verifications per month.",
        features: ["Up to 400 verifications/month", "€4,800 billed annually", "Priority processing"],
        checkout: { fn: "create-worldid-checkout", plan: "growth" },
      },
      {
        key: "scale",
        name: "Scale",
        price: "€0.83",
        period: "/ verification",
        summary: "Up to 1,200 verifications per month.",
        features: ["Up to 1,200 verifications/month", "€12,000 billed annually", "Dedicated support"],
        checkout: { fn: "create-worldid-checkout", plan: "scale" },
      },
    ],
    pairsWith: ["worldaml"],
    usageUnit: "verifications",
    publicUrl: "/products/worldid",
  },
  {
    key: "academy",
    name: "WorldAML Academy for Business",
    lane: "Training",
    icon: GraduationCap,
    tagline: "Practical AML and financial crime training for your whole team.",
    outcome: "Evidence continuous compliance training across your organisation.",
    solves: [
      "Annual training obligations with no audit trail",
      "New joiners needing structured AML onboarding",
      "Teams spread across jurisdictions",
    ],
    capabilities: [
      "AML, sanctions and financial crime course library",
      "CPD hours and certificates per learner",
      "Individual learner progress tracking",
      "Course bundles and annual access",
    ],
    idealFor: "Compliance, onboarding, risk and front-line teams.",
    included: ["Course access", "Assessment and certificate", "CPD record"],
    faq: [
      { q: "Do you offer team seats?", a: "Team access is arranged with our team — request team access and we'll price the seats you need." },
      { q: "Can employees keep their certificates?", a: "Yes. Certificates are issued to the individual learner and verifiable online." },
    ],
    plans: [
      {
        key: "individual",
        name: "Individual courses",
        price: "From €29",
        summary: "Buy specific courses for named team members.",
        features: ["Per-course purchase", "Certificate on completion", "CPD hours recorded"],
        configureUrl: "/academy",
        configureLabel: "Browse & Buy Courses",
      },
      {
        key: "annual",
        name: "Annual Academy access",
        price: "€199",
        period: "/year per learner",
        summary: "Full library access for a learner for 12 months.",
        features: ["Full course library", "All certificates included", "Renews annually"],
        checkout: { fn: "create-academy-annual-checkout", plan: "annual", body: { currency: "eur" } },
      },
      {
        key: "team",
        name: "Team access",
        price: null,
        summary: "Multiple seats for your organisation, priced on volume.",
        features: ["Seat allocation to employees", "Central invoicing", "Progress visibility per learner"],
      },
    ],
    pairsWith: ["worldaml", "worldid"],
    publicUrl: "/academy",
  },
];

export const SOLUTION_BY_KEY = Object.fromEntries(
  BUSINESS_SOLUTIONS.map((s) => [s.key, s]),
) as Record<string, BusinessSolution>;

export const CROSS_SELL_COPY: Record<string, string> = {
  worldaml: "Extend your compliance programme with ongoing screening and monitoring.",
  worldid: "Add identity verification so you know who you are onboarding.",
  academy: "Train your team on the controls you have just put in place.",
  suite: "Bring onboarding, screening, risk and reporting together in the WorldAML Suite.",
};

/** Deterministic recommendations — no AI, no invented logic. */
export function recommendSolutions(ownedKeys: string[], limit = 3): BusinessSolution[] {
  const owned = new Set(ownedKeys);
  const scored = BUSINESS_SOLUTIONS.filter((s) => !owned.has(s.key)).map((s) => {
    let score = 0;
    for (const key of ownedKeys) {
      if (SOLUTION_BY_KEY[key]?.pairsWith.includes(s.key)) score += 2;
    }
    if (s.key === "academy") score += 1;
    if (s.plans.some((p) => p.checkout)) score += 1;
    return { s, score };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((x) => x.s);
}

export { ShieldCheck };
