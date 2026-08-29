// Name-similarity engine for screening matches.
//
// The data provider's `score` is a list-relevance figure (typically a flat 0.7
// for any fuzzy hit) — it is NOT a name-similarity measure. We compute our own
// Jaro-Winkler similarity between the searched name and the matched
// name/aliases so the UI can honestly say "name match", and we expose how the
// provider's `match_types` mapped onto the displayed match status.

export type MatchBasis =
  | "exact_name"
  | "exact_alias"
  | "reordered_name"
  | "partial_name"
  | "fuzzy_name"
  | "provider_only"
  | "unknown";

export interface NameMatchCandidate {
  value: string;
  kind: "primary_name" | "alias";
  similarity: number; // 0-100
}

export interface NameMatchDebug {
  subject_name: string | null;
  normalised_subject_name: string | null;
  candidates: NameMatchCandidate[];
  best_candidate: NameMatchCandidate | null;
  provider_relevance: number | null;
  provider_exact_flag: boolean;
  applied_rule: string;
}

export interface NameMatchResult {
  /** 0-100 displayed "name match" figure. */
  name_similarity: number | null;
  /** How the score was arrived at. */
  match_basis: MatchBasis;
  /** Raw provider match_types, passed through unchanged. */
  match_types: string[];
  /** Plain-English labels for the raw match_types. */
  match_type_labels: string[];
  /** Provider list-relevance (0-100), kept for reference only. */
  provider_relevance: number | null;
  /** The candidate (listed name or alias) that produced the winning score. */
  winning_name: string | null;
  /** Whether the winning candidate was the primary listed name or an alias. */
  winning_name_kind: "primary_name" | "alias" | null;
  /** Present only when debug output was requested. */
  debug?: NameMatchDebug;
}

/** Provider match_type → customer-facing label. */
export const MATCH_TYPE_LABELS: Record<string, string> = {
  name_exact: "Name matched exactly",
  exact_match: "Name matched exactly",
  equivalent_name: "Equivalent name matched",
  name_fuzzy: "Name matched approximately",
  name_variations_removal: "Name matched after removing a name part",
  name_variations_reversal: "Name matched with the name parts reversed",
  aka_exact: "Alias matched exactly",
  equivalent_aka: "Equivalent alias matched",
  aka_fuzzy: "Alias matched approximately",
  phonetic_name: "Name matched phonetically",
  phonetic_aka: "Alias matched phonetically",
  year_of_birth: "Year of birth matched",
  country: "Country matched",
  unknown: "Matched on other attributes",
};

export function labelMatchType(type: string): string {
  const key = String(type || "").toLowerCase();
  return MATCH_TYPE_LABELS[key] ??
    key.replace(/[_-]+/g, " ").replace(/^\w/, (c) => c.toUpperCase());
}

export function labelMatchTypes(types: string[]): string[] {
  return Array.from(new Set((types ?? []).filter(Boolean).map(labelMatchType)));
}

const EXACT_TYPE_RE = /^(name_exact|exact_match|equivalent_name)$/i;
const ALIAS_TYPE_RE = /^(aka_exact|equivalent_aka)$/i;

export function isProviderExactName(types: string[]): boolean {
  return (types ?? []).some((t) => EXACT_TYPE_RE.test(String(t)));
}

export function isProviderExactAlias(types: string[]): boolean {
  return (types ?? []).some((t) => ALIAS_TYPE_RE.test(String(t)));
}

export function normaliseName(value: string): string {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function jaro(a: string, b: string): number {
  if (!a || !b) return 0;
  if (a === b) return 1;
  const window = Math.max(0, Math.floor(Math.max(a.length, b.length) / 2) - 1);
  const aFlags = new Array(a.length).fill(false);
  const bFlags = new Array(b.length).fill(false);
  let matches = 0;
  for (let i = 0; i < a.length; i++) {
    const start = Math.max(0, i - window);
    const end = Math.min(i + window + 1, b.length);
    for (let j = start; j < end; j++) {
      if (bFlags[j] || a[i] !== b[j]) continue;
      aFlags[i] = true;
      bFlags[j] = true;
      matches++;
      break;
    }
  }
  if (!matches) return 0;
  let transpositions = 0;
  let k = 0;
  for (let i = 0; i < a.length; i++) {
    if (!aFlags[i]) continue;
    while (!bFlags[k]) k++;
    if (a[i] !== b[k]) transpositions++;
    k++;
  }
  transpositions /= 2;
  return (matches / a.length + matches / b.length + (matches - transpositions) / matches) / 3;
}

export function jaroWinkler(a: string, b: string): number {
  const base = jaro(a, b);
  let prefix = 0;
  while (prefix < 4 && prefix < a.length && prefix < b.length && a[prefix] === b[prefix]) prefix++;
  return base + prefix * 0.1 * (1 - base);
}

/** Token-order-insensitive similarity (handles "Udrea Elena Gabriela"). */
export function nameSimilarity(subjectName: string, candidate: string): number {
  const a = normaliseName(subjectName);
  const b = normaliseName(candidate);
  if (!a || !b) return 0;
  if (a === b) return 1;
  const aTokens = a.split(" ").sort();
  const bTokens = b.split(" ").sort();
  if (aTokens.join(" ") === bTokens.join(" ")) return 0.98;
  // Every searched token present in the candidate (extra middle names allowed).
  const allPresent = aTokens.every((t) => bTokens.some((u) => jaroWinkler(t, u) >= 0.95));
  const direct = jaroWinkler(a, b);
  const sorted = jaroWinkler(aTokens.join(" "), bTokens.join(" "));
  return Math.max(direct, sorted, allPresent ? 0.92 : 0);
}

function pct(value: number): number {
  return Math.round(Math.max(0, Math.min(1, value)) * 100);
}

function basisFor(
  subjectName: string,
  best: NameMatchCandidate | null,
  matchTypes: string[],
): { basis: MatchBasis; rule: string } {
  if (!best) return { basis: "unknown", rule: "no candidate name available" };
  const a = normaliseName(subjectName);
  const b = normaliseName(best.value);
  const exactText = a === b;
  if (exactText) {
    return best.kind === "alias"
      ? { basis: "exact_alias", rule: "alias string identical after normalisation" }
      : { basis: "exact_name", rule: "primary name identical after normalisation" };
  }
  if (isProviderExactName(matchTypes) && best.similarity >= 90) {
    return { basis: "exact_name", rule: "provider name_exact confirmed by local similarity >= 90" };
  }
  if (isProviderExactAlias(matchTypes) && best.similarity >= 90) {
    return { basis: "exact_alias", rule: "provider aka_exact confirmed by local similarity >= 90" };
  }
  if (a.split(" ").sort().join(" ") === b.split(" ").sort().join(" ")) {
    return { basis: "reordered_name", rule: "same tokens in a different order" };
  }
  if (best.similarity >= 92) {
    return { basis: "partial_name", rule: "all searched tokens present, extra tokens in the listed name" };
  }
  return { basis: "fuzzy_name", rule: "Jaro-Winkler similarity" };
}

export interface ComputeNameMatchInput {
  subjectName: string | null | undefined;
  matchedName: string;
  aliases?: string[];
  matchTypes?: string[];
  /** Provider list-relevance 0-1 (as returned by the provider). */
  providerScore?: number | null;
  debug?: boolean;
}

export function computeNameMatch(input: ComputeNameMatchInput): NameMatchResult {
  const matchTypes = (input.matchTypes ?? []).map((t) => String(t)).filter(Boolean);
  const providerRelevance = typeof input.providerScore === "number"
    ? Math.max(0, Math.min(100, Math.round(input.providerScore * 100)))
    : null;
  const matchTypeLabels = labelMatchTypes(matchTypes);
  const subjectName = input.subjectName?.trim() || null;

  const candidates: NameMatchCandidate[] = [
    ...(input.matchedName ? [{ value: input.matchedName, kind: "primary_name" as const, similarity: 0 }] : []),
    ...(input.aliases ?? []).filter(Boolean).map((v) => ({ value: v, kind: "alias" as const, similarity: 0 })),
  ];

  if (!subjectName) {
    const result: NameMatchResult = {
      name_similarity: providerRelevance,
      match_basis: "provider_only",
      match_types: matchTypes,
      match_type_labels: matchTypeLabels,
      provider_relevance: providerRelevance,
      winning_name: null,
      winning_name_kind: null,
    };
    if (input.debug) {
      result.debug = {
        subject_name: null,
        normalised_subject_name: null,
        candidates,
        best_candidate: null,
        provider_relevance: providerRelevance,
        provider_exact_flag: isProviderExactName(matchTypes),
        applied_rule: "no subject name supplied; provider relevance used",
      };
    }
    return result;
  }

  for (const c of candidates) c.similarity = pct(nameSimilarity(subjectName, c.value));
  const best = candidates.reduce<NameMatchCandidate | null>(
    (acc, c) => (!acc || c.similarity > acc.similarity ? c : acc),
    null,
  );

  const providerExact = isProviderExactName(matchTypes) || isProviderExactAlias(matchTypes);
  let score = best?.similarity ?? providerRelevance ?? 0;
  const { basis, rule } = basisFor(subjectName, best, matchTypes);
  let appliedRule = rule;
  // Only trust the provider's "matched exactly" flag when our own comparison agrees.
  if (providerExact && score >= 90 && score < 100) {
    score = 100;
    appliedRule = "provider exact-match flag applied (local similarity >= 90)";
  }

  const result: NameMatchResult = {
    name_similarity: Math.min(100, score),
    match_basis: basis,
    match_types: matchTypes,
    match_type_labels: matchTypeLabels,
    provider_relevance: providerRelevance,
    winning_name: best?.value ?? null,
    winning_name_kind: best?.kind ?? null,
  };

  if (input.debug) {
    result.debug = {
      subject_name: subjectName,
      normalised_subject_name: normaliseName(subjectName),
      candidates,
      best_candidate: best,
      provider_relevance: providerRelevance,
      provider_exact_flag: providerExact,
      applied_rule: appliedRule,
    };
  }
  return result;
}
