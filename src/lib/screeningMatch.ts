/**
 * Presentation helpers for screening match status.
 *
 * `match_basis` explains how the displayed name-match percentage was derived
 * from the searched name, the listed name/aliases and the data provider's
 * match signals. Colours follow the platform risk-badging convention
 * (red = strongest hit, blue = weakest, grey = unscored).
 */

export type MatchBasis =
  | "exact_name"
  | "exact_alias"
  | "reordered_name"
  | "partial_name"
  | "fuzzy_name"
  | "provider_only"
  | "unknown";

export const MATCH_BASIS_LABELS: Record<MatchBasis, string> = {
  exact_name: "Exact name",
  exact_alias: "Exact alias",
  reordered_name: "Reordered name",
  partial_name: "Partial name",
  fuzzy_name: "Fuzzy name",
  provider_only: "Unscored",
  unknown: "Unscored",
};

export const MATCH_BASIS_DESCRIPTIONS: Record<MatchBasis, string> = {
  exact_name: "The listed name is identical to the name you searched.",
  exact_alias: "A recorded alias of this entity is identical to the name you searched.",
  reordered_name: "The same name parts appear in a different order.",
  partial_name: "Every searched name part is present, with additional name parts on the listing.",
  fuzzy_name: "The names are similar but not the same.",
  provider_only: "No searched name was available, so the list relevance is shown instead.",
  unknown: "The match basis could not be determined.",
};

const TONES: Record<MatchBasis, string> = {
  exact_name: "border-red-200 bg-red-50 text-red-700",
  exact_alias: "border-red-200 bg-red-50 text-red-700",
  reordered_name: "border-orange-200 bg-orange-50 text-orange-700",
  partial_name: "border-amber-200 bg-amber-50 text-amber-700",
  fuzzy_name: "border-sky-200 bg-sky-50 text-sky-700",
  provider_only: "border-border bg-muted text-muted-foreground",
  unknown: "border-border bg-muted text-muted-foreground",
};

export function normaliseMatchBasis(value: string | null | undefined): MatchBasis {
  return value && value in TONES ? (value as MatchBasis) : "unknown";
}

/** Badge classes for a match basis. */
export function matchBasisTone(value: string | null | undefined): string {
  return TONES[normaliseMatchBasis(value)];
}

export function matchBasisLabel(value: string | null | undefined): string {
  return MATCH_BASIS_LABELS[normaliseMatchBasis(value)];
}

export function matchBasisDescription(value: string | null | undefined): string {
  return MATCH_BASIS_DESCRIPTIONS[normaliseMatchBasis(value)];
}

/**
 * Fallback for records saved before match_basis existed: derive a basis from
 * the stored similarity so the badge is never blank.
 */
export function inferMatchBasis(
  basis: string | null | undefined,
  similarity: number | null | undefined,
): MatchBasis {
  if (basis) return normaliseMatchBasis(basis);
  if (similarity == null) return "provider_only";
  if (similarity >= 100) return "exact_name";
  if (similarity >= 98) return "reordered_name";
  if (similarity >= 92) return "partial_name";
  return "fuzzy_name";
}
