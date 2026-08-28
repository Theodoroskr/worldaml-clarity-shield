import { Shield, Scale, Search, type LucideIcon } from "lucide-react";

export type EcosystemProductId = "suite" | "rcm" | "quickcheck";

export interface EcosystemProduct {
  id: EcosystemProductId;
  name: string;
  blurb: string;
  icon: LucideIcon;
  /** Public marketing / tool route used for Academy-only users. */
  exploreHref: string;
  exploreLabel: string;
  /** In-app route, only offered when the user genuinely has access. */
  appHref?: string;
  appLabel?: string;
}

export const ECOSYSTEM_PRODUCTS: Record<EcosystemProductId, EcosystemProduct> = {
  suite: {
    id: "suite",
    name: "WorldAML Suite",
    blurb: "KYC, KYB, sanctions screening, monitoring and compliance workflows in one platform.",
    icon: Shield,
    exploreHref: "/platform/suite",
    exploreLabel: "Explore WorldAML Suite",
    appHref: "/suite",
    appLabel: "Go to Suite",
  },
  rcm: {
    id: "rcm",
    name: "Regulatory Compliance Management",
    blurb: "Manage regulatory obligations, controls, assessments, tasks and evidence.",
    icon: Scale,
    exploreHref: "/platform/regulatory-reporting",
    exploreLabel: "Learn More",
    appHref: "/rcm",
    appLabel: "Go to RCM",
  },
  quickcheck: {
    id: "quickcheck",
    name: "Sanctions Quick Check",
    blurb: "Run a quick sanctions screening against major global lists.",
    icon: Search,
    exploreHref: "/?demo=1",
    exploreLabel: "Run Quick Check",
  },
};

/** Course category / title → single most relevant product. */
export function productForCourse(input?: { category?: string | null; title?: string | null }): EcosystemProduct | null {
  const text = `${input?.category ?? ""} ${input?.title ?? ""}`.toLowerCase();
  if (!text.trim()) return null;
  if (/sanction|pep|screening|adverse media/.test(text)) return ECOSYSTEM_PRODUCTS.quickcheck;
  if (/regulat|governance|obligation|risk assessment|ewra/.test(text)) return ECOSYSTEM_PRODUCTS.rcm;
  if (/kyc|kyb|cdd|onboard|ubo|beneficial owner|transaction monitoring|aml|financial crime|mlro/.test(text)) {
    return ECOSYSTEM_PRODUCTS.suite;
  }
  return null;
}

/** Short, contextual heading shown above a course-driven recommendation. */
export function promoHeadline(product: EcosystemProduct): string {
  switch (product.id) {
    case "quickcheck":
      return "Put your learning into practice";
    case "rcm":
      return "See how regulatory obligations can be managed operationally";
    default:
      return "Explore practical KYC & KYB workflows";
  }
}

/** Uses the existing Microsoft Clarity tag — no new analytics stack. */
export function trackEcosystemClick(productId: EcosystemProductId, surface: string) {
  try {
    (window as any).clarity?.("event", `ecosystem_${productId}_${surface}`);
  } catch {
    /* analytics must never break the UI */
  }
}
