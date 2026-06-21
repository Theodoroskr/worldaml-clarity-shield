// Fixed FX rates for Academy course pricing.
// Mirrored in supabase/functions/create-academy-checkout/index.ts —
// keep both in sync when adjusting.

export type AcademyCurrency = "eur" | "usd" | "gbp" | "inr";

/** Maps a Region id to the Academy currency we display prices in. */
export const REGION_TO_CURRENCY: Record<string, AcademyCurrency> = {
  "eu-me": "eur",
  "uk-ie": "gbp",
  na: "usd",
  in: "inr",
};

/** Currency ISO code in uppercase, for UI display. */
export const currencyCode = (c: AcademyCurrency): string => c.toUpperCase();

const RATES: Record<AcademyCurrency, number> = {
  eur: 1,
  usd: 1.08,
  gbp: 0.86,
  inr: 90, // fallback only — INR uses PPP overrides below
};

export const CURRENCY_SYMBOLS: Record<AcademyCurrency, string> = {
  eur: "€",
  usd: "$",
  gbp: "£",
  inr: "₹",
};

/**
 * Purchasing-power adjusted INR pricing (in paise = INR/100).
 * Keyed by the base EUR cents tier. Keep in sync with the edge function.
 * 2900 (€29) → ₹999 ; 4900 (€49) → ₹1,699.
 */
export const INR_PPP_OVERRIDES: Record<number, number> = {
  2900: 99900,
  4900: 169900,
};

/** Convert EUR cents to the target currency, returning minor units (integer, rounded). */
export const convertEurCents = (eurCents: number, target: AcademyCurrency): number => {
  if (target === "inr") {
    return INR_PPP_OVERRIDES[eurCents] ?? Math.round(eurCents * RATES.inr);
  }
  return Math.round(eurCents * RATES[target]);
};

/** Format a minor-units amount as a localized currency string. */
export const formatPrice = (cents: number, currency: AcademyCurrency): string => {
  const major = cents / 100;
  if (currency === "inr") {
    // Indian numbering with no decimals (e.g. ₹1,699)
    return `${CURRENCY_SYMBOLS.inr}${Math.round(major).toLocaleString("en-IN")}`;
  }
  return `${CURRENCY_SYMBOLS[currency]}${major.toFixed(major % 1 === 0 ? 0 : 2)}`;
};
