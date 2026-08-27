import type { UpsellTemplate } from "./upsellRecommendation";

export interface UpsellItem {
  name: string;
  description: string;
  url: string;
  meta?: string;
}

export interface UpsellOption {
  id: string;
  audience: "academy" | "business";
  template: UpsellTemplate;
  title: string;
  rationale: string;
  headline: string;
  intro: string;
  items: UpsellItem[];
}

export interface CourseRow {
  id?: string;
  slug: string;
  title: string;
  description?: string | null;
  category?: string | null;
  difficulty?: string | null;
  cpd_hours?: number | null;
  price_eur_cents?: number | null;
  is_published?: boolean | null;
}

const SITE = "https://worldaml.com";
const ACADEMY = "https://academy.worldaml.com";

/** Products & services promoted to company / business buyers. */
export const PRODUCT_CATALOG: UpsellItem[] = [
  {
    name: "WorldAML Suite",
    description:
      "End-to-end compliance operations: KYC/KYB onboarding, case management, risk scoring, monitoring and regulatory reporting.",
    url: `${SITE}/platform/suite`,
    meta: "Platform",
  },
  {
    name: "AML Screening",
    description:
      "Screen customers and counterparties against 1,900+ global sanctions, PEP and adverse media lists — instantly or via API.",
    url: `${SITE}/platform/aml-screening`,
    meta: "Platform",
  },
  {
    name: "WorldID — Identity Verification",
    description:
      "White-labelled KYC document and biometric verification with liveness checks and manual review fallback.",
    url: `${SITE}/platform/worldid`,
    meta: "Platform",
  },
  {
    name: "Transaction Monitoring",
    description:
      "Rule-based and behavioural monitoring with 46+ regulator-aligned rule templates, backtesting and alert triage.",
    url: `${SITE}/platform/monitoring`,
    meta: "Platform",
  },
  {
    name: "AML Screening & Ongoing Monitoring",
    description:
      "Continuous screening against 1,900+ sanctions, PEP and adverse media lists with tunable match thresholds.",
    url: `${SITE}/platform/aml-screening`,
    meta: "Platform",
  },
];

export const SERVICE_CATALOG: UpsellItem[] = [
  {
    name: "AML Health Check & Gap Analysis",
    description:
      "An independent review of your AML/CFT framework against your regulator's expectations, with a prioritised remediation plan.",
    url: `${SITE}/contact-sales?product=advisory`,
    meta: "Service",
  },
  {
    name: "Outsourced MLRO / Compliance Support",
    description:
      "Senior compliance professionals supporting your team on reviews, escalations and regulatory submissions.",
    url: `${SITE}/contact-sales?product=mlro`,
    meta: "Service",
  },
  {
    name: "Team Academy Seats",
    description:
      "Bulk CPD-accredited training seats for your compliance team, with progress tracking and certificates.",
    url: `${SITE}/business/dashboard`,
    meta: "Training",
  },
];

const money = (cents?: number | null) =>
  cents && cents > 0 ? `€${(cents / 100).toFixed(0)}` : "Free";

export function courseToItem(c: CourseRow): UpsellItem {
  return {
    name: c.title,
    description: (c.description || "").replace(/\s+/g, " ").slice(0, 180),
    url: `${ACADEMY}/academy/${c.slug}`,
    meta: [c.category, c.difficulty, c.cpd_hours ? `${c.cpd_hours} CPD h` : null, money(c.price_eur_cents)]
      .filter(Boolean)
      .join(" · "),
  };
}

/** Suggest courses the user hasn't started/bought, ranked by relevance to their profile. */
export function suggestCourses(
  courses: CourseRow[],
  ownedSlugs: Set<string>,
  signals: { interest_area?: string | null; industry?: string | null; regulator?: string | null },
  limit = 4,
): CourseRow[] {
  const hay = [signals.interest_area, signals.industry, signals.regulator]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return courses
    .filter((c) => c.is_published !== false && !ownedSlugs.has(c.slug))
    .map((c) => {
      const text = `${c.title} ${c.category ?? ""} ${c.description ?? ""}`.toLowerCase();
      let score = 0;
      if (hay) {
        for (const token of hay.split(/[^a-z0-9]+/).filter((t) => t.length > 3)) {
          if (text.includes(token)) score += 2;
        }
      }
      if ((c.price_eur_cents ?? 0) > 0) score += 1;
      return { c, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.c);
}

/** Builds the upsell plays offered to an admin for a given user. */
export function buildUpsellOptions(params: {
  isBusiness: boolean;
  courses: CourseRow[];
  ownedSlugs: Set<string>;
  signals: {
    interest_area?: string | null;
    industry?: string | null;
    regulator?: string | null;
    company_name?: string | null;
  };
}): UpsellOption[] {
  const { isBusiness, courses, ownedSlugs, signals } = params;
  const suggested = suggestCourses(courses, ownedSlugs, signals).map(courseToItem);
  const options: UpsellOption[] = [];

  if (suggested.length > 0) {
    options.push({
      id: "courses",
      audience: "academy",
      template: "academy-course-upsell",
      title: "Suggested courses (Academy learner)",
      rationale: "Recommends further CPD-accredited courses based on the learner's interests and completed training.",
      headline: "Courses picked for your next CPD step",
      intro:
        "Based on your training so far, these CPD-accredited WorldAML Academy courses are the natural next step.",
      items: suggested,
    });
  }

  if (isBusiness) {
    options.push({
      id: "solutions",
      audience: "business",
      template: "business-solutions-upsell",
      title: "Company solutions (products, services & training)",
      rationale: "Company buyer — promote the platform products, advisory services and team training together.",
      headline: `Compliance solutions for ${signals.company_name || "your team"}`,
      intro:
        "Here is how WorldAML can support your compliance programme across technology, expert services and team training.",
      items: [...PRODUCT_CATALOG.slice(0, 4), ...SERVICE_CATALOG, ...suggested.slice(0, 2)],
    });
    options.push({
      id: "products",
      audience: "business",
      template: "business-solutions-upsell",
      title: "Products only",
      rationale: "Focused platform pitch — Suite, Screening, WorldID, Monitoring and data coverage.",
      headline: "The WorldAML platform, end to end",
      intro: "Everything your team needs to onboard, screen, monitor and report — in one platform.",
      items: PRODUCT_CATALOG,
    });
    options.push({
      id: "services",
      audience: "business",
      template: "business-solutions-upsell",
      title: "Services & team training",
      rationale: "Advisory-led play for teams that need people support before or alongside technology.",
      headline: "Expert compliance support for your team",
      intro: "Advisory, outsourced compliance capacity and CPD-accredited team training from Infocredit Group.",
      items: [...SERVICE_CATALOG, ...suggested.slice(0, 3)],
    });
  }

  return options;
}
