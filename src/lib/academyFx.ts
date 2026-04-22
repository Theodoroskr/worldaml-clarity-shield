// Fixed FX rates for Academy course pricing.
// Mirrored in supabase/functions/create-academy-checkout/index.ts —
// keep both in sync when adjusting.

export type AcademyCurrency = "eur" | "usd" | "gbp";

const RATES: Record<AcademyCurrency, number> = {
  eur: 1,
  usd: 1.08,
  gbp: 0.86,
};

export const CURRENCY_SYMBOLS: Record<AcademyCurrency, string> = {
  eur: "€",
  usd: "$",
  gbp: "£",
};

/** Convert EUR cents to the target currency, returning cents (integer, rounded). */
export const convertEurCents = (eurCents: number, target: AcademyCurrency): number =>
  Math.round(eurCents * RATES[target]);

/** Format a cents amount as a localized currency string (no decimals for clean prices). */
export const formatPrice = (cents: number, currency: AcademyCurrency): string => {
  const major = cents / 100;
  return `${CURRENCY_SYMBOLS[currency]}${major.toFixed(major % 1 === 0 ? 0 : 2)}`;
};
