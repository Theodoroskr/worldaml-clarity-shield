// Presentation-only consolidation of screening matches.
//
// The data provider returns one "doc" per list entry, so the same real-world
// person can appear several times (a PEP entry, a sanctions entry, an adverse
// media profile…). This module groups those hits for display only — the raw
// rows stay untouched in `screening_matches` so the audit trail is complete.

export interface ConsolidatableMatch {
  id: string;
  matched_name: string;
  entity_type?: string | null;
  categories: string[];
  category_labels?: string[] | null;
  name_similarity: number | null;
  country?: string | null;
  year_of_birth?: number | null;
  status?: string | null;
}

export interface ConsolidatedGroup<T extends ConsolidatableMatch> {
  /** Stable key for the group (id of the primary match). */
  key: string;
  /** Highest-scoring match — the one rendered as the card. */
  primary: T;
  /** All matches in the group, primary first. */
  members: T[];
  /** Union of categories across every member. */
  categories: string[];
  /** Union of human-readable category labels across every member. */
  categoryLabels: string[];
  /** Number of underlying provider listings merged into this card. */
  listingCount: number;
}

/** Lowercase, strip accents/punctuation, collapse whitespace. */
export function normaliseName(value: string | null | undefined): string {
  if (!value) return "";
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Normalised name with tokens sorted, so "Elena Udrea" === "Udrea Elena". */
export function nameSortKey(value: string | null | undefined): string {
  return normaliseName(value).split(" ").filter(Boolean).sort().join(" ");
}

/** Jaro-Winkler similarity, 0-1. */
export function jaroWinkler(a: string, b: string): number {
  if (!a || !b) return 0;
  if (a === b) return 1;
  const matchWindow = Math.max(0, Math.floor(Math.max(a.length, b.length) / 2) - 1);
  const aFlags = new Array<boolean>(a.length).fill(false);
  const bFlags = new Array<boolean>(b.length).fill(false);
  let matches = 0;
  for (let i = 0; i < a.length; i++) {
    const start = Math.max(0, i - matchWindow);
    const end = Math.min(i + matchWindow + 1, b.length);
    for (let j = start; j < end; j++) {
      if (bFlags[j] || a[i] !== b[j]) continue;
      aFlags[i] = true;
      bFlags[j] = true;
      matches++;
      break;
    }
  }
  if (matches === 0) return 0;
  let transpositions = 0;
  let k = 0;
  for (let i = 0; i < a.length; i++) {
    if (!aFlags[i]) continue;
    while (!bFlags[k]) k++;
    if (a[i] !== b[k]) transpositions++;
    k++;
  }
  transpositions /= 2;
  const jaro = (matches / a.length + matches / b.length + (matches - transpositions) / matches) / 3;
  let prefix = 0;
  while (prefix < 4 && prefix < a.length && prefix < b.length && a[prefix] === b[prefix]) prefix++;
  return jaro + prefix * 0.1 * (1 - jaro);
}

/** Two optional attributes are compatible when equal or when either is unknown. */
function attributeCompatible<V>(a: V | null | undefined, b: V | null | undefined): boolean {
  if (a == null || b == null) return true;
  return a === b;
}

const NAME_THRESHOLD = 0.94;

export function isSameEntity(a: ConsolidatableMatch, b: ConsolidatableMatch): boolean {
  if (!attributeCompatible(a.year_of_birth ?? null, b.year_of_birth ?? null)) return false;
  const countryA = a.country ? normaliseName(a.country) : null;
  const countryB = b.country ? normaliseName(b.country) : null;
  if (!attributeCompatible(countryA, countryB)) return false;
  if (!attributeCompatible(a.entity_type ?? null, b.entity_type ?? null)) return false;

  const keyA = nameSortKey(a.matched_name);
  const keyB = nameSortKey(b.matched_name);
  if (!keyA || !keyB) return false;
  if (keyA === keyB) return true;
  return jaroWinkler(keyA, keyB) >= NAME_THRESHOLD;
}

function uniq(values: (string | null | undefined)[]): string[] {
  return Array.from(new Set(values.filter((v): v is string => Boolean(v))));
}

/**
 * Group likely-duplicate matches. Input order is preserved for the resulting
 * groups (based on the primary match's original position).
 */
export function consolidateMatches<T extends ConsolidatableMatch>(matches: T[]): ConsolidatedGroup<T>[] {
  const groups: T[][] = [];
  for (const match of matches) {
    const existing = groups.find((g) => g.some((m) => isSameEntity(m, match)));
    if (existing) existing.push(match);
    else groups.push([match]);
  }

  return groups.map((members) => {
    const ordered = [...members].sort((a, b) => (b.name_similarity ?? -1) - (a.name_similarity ?? -1));
    const primary = ordered[0];
    return {
      key: primary.id,
      primary,
      members: ordered,
      categories: uniq(ordered.flatMap((m) => m.categories ?? [])),
      categoryLabels: uniq(ordered.flatMap((m) => m.category_labels ?? [])),
      listingCount: ordered.length,
    };
  });
}
