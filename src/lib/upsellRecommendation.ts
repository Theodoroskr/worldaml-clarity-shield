export type UpsellTemplate =
  | "suite-upsell"
  | "screening-upsell"
  | "academy-course-upsell"
  | "business-solutions-upsell";

export interface UpsellSignals {
  subscription_tier: string;
  status: string;
  revenueCents: number;
  academyPurchases: number;
  industry?: string | null;
  company_size?: string | null;
  seniority?: string | null;
  regulator?: string | null;
  marketing_opt_out_at?: string | null;
}

export interface UpsellRecommendation {
  template: UpsellTemplate;
  title: string;
  rationale: string;
  nextSteps: string[];
  blocked: boolean;
  blockedReason?: string;
}

/** Picks the most relevant upsell play for a user based on their profile and spend. */
export function recommendUpsell(s: UpsellSignals): UpsellRecommendation {
  const blocked = !!s.marketing_opt_out_at;
  const blockedReason = blocked ? "User has opted out of marketing communications." : undefined;

  if (s.subscription_tier === "suite" || s.subscription_tier === "enterprise") {
    return {
      template: "screening-upsell",
      title: "Expand screening volume & data coverage",
      rationale: "Already a Suite customer — grow account value with additional screening capacity or WorldID.",
      nextSteps: [
        "Review monthly screening usage against plan limits",
        "Offer WorldID identity verification add-on",
        "Introduce expanded adverse media and PEP screening coverage",
      ],
      blocked,
      blockedReason,
    };
  }

  if (s.academyPurchases > 0 || s.subscription_tier === "academy") {
    return {
      template: "suite-upsell",
      title: "Academy learner → Compliance Suite",
      rationale: `Engaged learner${s.revenueCents > 0 ? ` with €${(s.revenueCents / 100).toFixed(0)} lifetime spend` : ""} — strong fit for the operational Suite (KYC, screening, monitoring).`,
      nextSteps: [
        "Send the Suite upsell email",
        "Offer a guided Suite walkthrough for their regulator",
        "Bundle team Academy seats with the Suite plan",
      ],
      blocked,
      blockedReason,
    };
  }

  if (s.status !== "approved") {
    return {
      template: "screening-upsell",
      title: "Activate the account first",
      rationale: "Account is not approved yet — nurture with a free sanctions check before a paid offer.",
      nextSteps: ["Approve the account", "Send the free screening trial", "Follow up after first search"],
      blocked: true,
      blockedReason: blockedReason ?? "Account not approved.",
    };
  }

  return {
    template: "screening-upsell",
    title: "Free user → first paid screening plan",
    rationale: "No recorded revenue yet — lead with the sanctions & PEP screening offer to create a first purchase.",
    nextSteps: [
      "Send the screening upsell email",
      "Share the relevant industry case study",
      "Offer an Academy starter course as an entry point",
    ],
    blocked,
    blockedReason,
  };
}
