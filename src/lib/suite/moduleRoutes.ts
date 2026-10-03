// Single source of truth: which Suite module each Suite page needs.
// Used by the sidebar (hide items) and SuiteAppLayout (block direct links).
export type SuiteModule = "screening" | "kyc_kyb" | "rcm";
export type RouteRequirement = "core" | SuiteModule[]; // array = any of these

const KYC: SuiteModule[] = ["kyc_kyb"];
const SCREENING: SuiteModule[] = ["screening"];
const SHARED: SuiteModule[] = ["screening", "kyc_kyb"];

const MAP: Record<string, RouteRequirement> = {
  "/suite": "core",
  "/suite/setup": "core",
  "/suite/settings": "core",
  "/suite/help": "core",
  "/suite/audit": "core",

  "/suite/screening": SCREENING,
  "/suite/monitoring": SCREENING,

  "/suite/case-queue": SHARED,
  "/suite/cases": SHARED,

  "/suite/onboarding": KYC,
  "/suite/onboarding-forms": KYC,
  "/suite/onboarding-submissions": KYC,
  "/suite/idv": KYC,
  "/suite/ubo": KYC,
  "/suite/customer-documents": KYC,
  "/suite/risk": KYC,
  "/suite/risk-heatmap": KYC,
  "/suite/periodic-reviews": KYC,
  "/suite/source-of-funds": KYC,
  "/suite/edd": KYC,
  "/suite/aml-ar": KYC,
  "/suite/transactions": KYC,
  "/suite/alerts": KYC,
  "/suite/regulatory": KYC,
  "/suite/regulator-submissions": KYC,
  "/suite/dsar": KYC,
  "/suite/rss": KYC,
};

/** Longest matching prefix wins; unknown Suite pages default to KYC/KYB. */
export function requirementFor(pathname: string): RouteRequirement {
  const path = pathname.replace(/\/+$/, "") || "/suite";
  let best: string | null = null;
  for (const key of Object.keys(MAP)) {
    if ((path === key || path.startsWith(key + "/")) && (!best || key.length > best.length)) best = key;
  }
  return best ? MAP[best] : KYC;
}

export const MODULE_LABELS: Record<SuiteModule, string> = {
  screening: "Screening",
  kyc_kyb: "KYC / KYB",
  rcm: "Regulatory Compliance",
};
