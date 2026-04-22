// Bundle discount tiers for the Academy basket.
// Mirrored in supabase/functions/create-academy-checkout/index.ts.

export interface BundleDiscount {
  pct: number; // 0, 5, 10
  label: string; // human-readable description
}

export const computeDiscount = (itemCount: number): BundleDiscount => {
  if (itemCount >= 3) return { pct: 10, label: "10% bundle discount (3+ courses)" };
  if (itemCount === 2) return { pct: 5, label: "5% bundle discount (2 courses)" };
  return { pct: 0, label: "" };
};

/** Apply a percentage discount to a cents amount, rounding to the nearest cent. */
export const applyDiscount = (cents: number, pct: number): number =>
  Math.round(cents * (1 - pct / 100));
