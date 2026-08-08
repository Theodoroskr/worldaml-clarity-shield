import { Layers, Fingerprint, Database, GraduationCap, ShieldCheck, LucideIcon } from "lucide-react";

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
  checkoutDialog?: "worldcompliance";

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
      { q: "Is there a free trial?", a: "Trials are arranged with our team. Use Contact Sales to request an evaluation." },
    ],
    plans: [
      {
        key: "starter",
        name: "Starter",
        price: "€99",
        period: "/month",
        summary: "For smaller compliance teams starting structured screening.",
        features: ["Up to 2,000 monitored entities", "Full API access", "Email support"],
        checkout: { fn: "create-worldaml-checkout", plan: "starter" },
      },
      {
        key: "compliance",
        name: "Compliance",
        price: "€495",
        period: "/month",
        summary: "For established compliance programmes with ongoing monitoring.",
        features: ["Up to 10,000 monitored entities", "Enhanced monitoring", "Priority support"],
        checkout: { fn: "create-worldaml-checkout", plan: "compliance" },
      },
      {
        key: "enterprise",
        name: "Enterprise",
        price: null,
        summary: "For high-volume and multi-entity groups.",
        features: ["Unlimited entities", "Dedicated account manager", "SLA guarantees"],
      },
    ],
    pairsWith: ["worldid", "academy"],
    usageUnit: "monitored entities",
    openUrl: "/suite/dashboard",
    publicUrl: "/products/worldaml-api",
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
    key: "lexisnexis",
    name: "LexisNexis Risk Data",
    lane: "Data Source",
    icon: Database,
    tagline: "WorldCompliance® data and Bridger Insight XG® enterprise deployment.",
    outcome: "Licence enterprise-grade risk data directly through WorldAML.",
    solves: [
      "Fragmented or low-quality risk data",
      "Enterprise deployments requiring on-premise matching",
      "Group-wide screening across business units",
    ],
    capabilities: [
      "2.5M+ risk profiles across 50+ risk categories",
      "Unlimited searches on WorldCompliance®",
      "Batch processing and advanced matching (Bridger Insight XG®)",
      "Multi-user licensing",
    ],
    idealFor: "Banks, large regulated groups and enterprise compliance functions.",
    included: ["Data licence", "Onboarding assistance", "LexisNexis® support pathway"],
    faq: [
      { q: "Is this WorldAML software?", a: "No — these are LexisNexis® Risk Solutions products licensed through WorldAML as an authorised partner." },
      { q: "Can we buy online?", a: "Enterprise data licensing is arranged with our team via a consultation." },
    ],
    plans: [
      {
        key: "worldcompliance",
        name: "WorldCompliance®",
        price: "From €1,750",
        period: "/year",
        summary: "Hosted screening data with unlimited searches.",
        features: ["2.5M+ profiles, 50+ risk categories", "Unlimited searches", "Multi-user discounts"],
        checkoutDialog: "worldcompliance",
        configureLabel: "Configure & Buy",

      },
      {
        key: "bridger",
        name: "Bridger Insight XG®",
        price: null,
        summary: "Enterprise deployment with advanced matching.",
        features: ["Batch processing", "Advanced matching", "Custom SLAs"],
      },
    ],
    pairsWith: ["worldaml"],
    publicUrl: "/products/lexisnexis",
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
  {
    key: "suite",
    name: "WorldAML Compliance Suite",
    lane: "WorldAML Platform",
    icon: ShieldCheck,
    tagline: "The full compliance workspace: onboarding, screening, monitoring, cases and reporting.",
    outcome: "Run your entire compliance programme in one regulator-ready workspace.",
    solves: [
      "Compliance work spread across spreadsheets and email",
      "No single audit trail across onboarding, screening and reporting",
      "Manual regulatory reporting and case handling",
    ],
    capabilities: [
      "KYC/KYB onboarding forms and customer records",
      "Sanctions, PEP and adverse media screening with alerts",
      "Transaction monitoring rules and case management",
      "Risk scoring, periodic reviews and audit logs",
      "Regulatory reporting and exports",
    ],
    idealFor: "Compliance teams that need a full workspace, not just an API.",
    included: ["Suite workspace access", "Case and alert management", "Audit-ready evidence", "Standard support"],
    addOns: ["Additional users", "Regulator-specific reporting adapters"],
    faq: [
      { q: "How does the Suite relate to the API?", a: "The Suite is the workspace interface powered by the same WorldAML engine as the API. You can start with either." },
      { q: "Can we buy it online?", a: "Suite plans start with the Screening & Monitoring subscription; larger deployments are scoped with our team." },
    ],
    plans: [
      {
        key: "starter",
        name: "Suite Starter",
        price: "€99",
        period: "/month",
        summary: "Suite workspace with screening and monitoring for smaller teams.",
        features: ["Up to 2,000 monitored entities", "Case and alert management", "Email support"],
        checkout: { fn: "create-worldaml-checkout", plan: "starter" },
      },
      {
        key: "compliance",
        name: "Suite Compliance",
        price: "€495",
        period: "/month",
        summary: "Full workspace for established compliance programmes.",
        features: ["Up to 10,000 monitored entities", "Enhanced monitoring", "Priority support"],
        checkout: { fn: "create-worldaml-checkout", plan: "compliance" },
      },
      {
        key: "enterprise",
        name: "Suite Enterprise",
        price: null,
        summary: "Multi-entity groups with bespoke reporting requirements.",
        features: ["Unlimited entities and users", "Dedicated account manager", "SLA guarantees"],
      },
    ],
    pairsWith: ["worldid", "lexisnexis", "academy"],
    usageUnit: "monitored entities",
    openUrl: "/suite/dashboard",
    publicUrl: "/platform/suite",
  },
];

export const SOLUTION_BY_KEY = Object.fromEntries(
  BUSINESS_SOLUTIONS.map((s) => [s.key, s]),
) as Record<string, BusinessSolution>;

export const CROSS_SELL_COPY: Record<string, string> = {
  worldaml: "Extend your compliance programme with ongoing screening and monitoring.",
  worldid: "Add identity verification so you know who you are onboarding.",
  lexisnexis: "Licence enterprise risk data for group-wide screening.",
  academy: "Train your team on the controls you have just put in place.",
  suite: "Run onboarding, screening, cases and reporting in one compliance workspace.",
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
