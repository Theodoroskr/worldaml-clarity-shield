import { describe, it, expect } from "vitest";
import { resolvePlanCta, isFreeActivationPlan } from "@/lib/businessPlanCta";
import { SOLUTION_BY_KEY } from "@/lib/businessCatalogue";
import type { BusinessPlan } from "@/lib/businessCatalogue";

const base: BusinessPlan = { key: "x", name: "X", price: "€100", summary: "", features: [] };

describe("resolvePlanCta", () => {
  it("uses checkout when a Stripe-backed checkout exists", () => {
    const cta = resolvePlanCta({ ...base, checkout: { fn: "f", plan: "p" } }, "Prod");
    expect(cta.kind).toBe("checkout");
    expect(cta.label).toBe("Buy Now");
  });

  it("labels an owned checkout plan as Upgrade", () => {
    const cta = resolvePlanCta({ ...base, checkout: { fn: "f", plan: "p" } }, "Prod", true);
    expect(cta.label).toBe("Upgrade");
  });

  it("routes free demo plans to in-app activation", () => {
    const cta = resolvePlanCta(
      { ...base, price: "Free", configureUrl: "/business/demo", configureLabel: "Start Free Demo" },
      "Prod",
    );
    expect(cta).toMatchObject({ kind: "configure", to: "/business/demo", label: "Start Free Demo" });
  });

  it("sends only custom-priced plans to Contact Sales", () => {
    const cta = resolvePlanCta({ ...base, price: null, name: "Enterprise" }, "Prod");
    expect(cta.kind).toBe("sales");
    if (cta.kind !== "sales") throw new Error("expected sales");
    expect(cta.to).toContain("plan=Enterprise");
  });

  it("sends priced plans without checkout to an invoice request, not Contact Sales", () => {
    const cta = resolvePlanCta(base, "Prod");
    expect(cta.kind).toBe("invoice");
    expect(cta.label).toBe("Request invoice");
  });
});

describe("screening catalogue routing", () => {
  const solution = SOLUTION_BY_KEY["worldaml"];

  it("only exposes Contact Sales on custom-priced plans", () => {
    const sales = solution.plans.filter((p) => resolvePlanCta(p, solution.name).kind === "sales");
    expect(sales.every((p) => p.price == null)).toBe(true);
  });

  it("makes the free Demo plan self-serve", () => {
    const demo = solution.plans.find((p) => p.key === "demo")!;
    expect(isFreeActivationPlan(demo)).toBe(true);
    expect(resolvePlanCta(demo, solution.name).kind).toBe("configure");
  });
});
