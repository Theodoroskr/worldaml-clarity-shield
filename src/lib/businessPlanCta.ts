import type { BusinessPlan } from "@/lib/businessCatalogue";

/**
 * Single source of truth for how a business-portal plan card behaves.
 *
 * Routing rules (audited):
 *  1. `checkout`      -> self-service card checkout ("Buy Now" / "Upgrade")
 *  2. `configureUrl`  -> in-app activation or configuration (e.g. free demo)
 *  3. custom pricing  -> Contact Sales (Enterprise only: price === null)
 *  4. priced, no Stripe mapping yet -> Request invoice (still a quote request,
 *     but never labelled "Contact Sales" so Enterprise stays the only one)
 */
export type PlanCta =
  | { kind: "checkout"; label: string }
  | { kind: "configure"; label: string; to: string }
  | { kind: "sales"; label: string; to: string }
  | { kind: "invoice"; label: string; to: string };

const quoteUrl = (solutionName: string, planName: string) =>
  `/business/quotes?product=${encodeURIComponent(solutionName)}&plan=${encodeURIComponent(planName)}`;

export function resolvePlanCta(
  plan: BusinessPlan,
  solutionName: string,
  owned = false,
): PlanCta {
  if (plan.checkout) {
    return { kind: "checkout", label: owned ? "Upgrade" : "Buy Now" };
  }
  if (plan.configureUrl) {
    return { kind: "configure", label: plan.configureLabel ?? "Configure & Buy", to: plan.configureUrl };
  }
  if (!plan.price) {
    return { kind: "sales", label: "Contact Sales", to: quoteUrl(solutionName, plan.name) };
  }
  return { kind: "invoice", label: "Request invoice", to: quoteUrl(solutionName, plan.name) };
}

/** True when the plan is a free, instantly activatable entitlement. */
export function isFreeActivationPlan(plan: BusinessPlan): boolean {
  return !!plan.configureUrl && /^free$/i.test((plan.price ?? "").trim());
}
