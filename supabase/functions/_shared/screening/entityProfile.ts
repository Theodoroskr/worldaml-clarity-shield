// Normalises a full provider entity record into WorldAML's structured
// profile model. Nothing here names the provider in customer-facing output.

export interface ProfileListing {
  source_key: string;
  source_name: string;
  category: string | null;
  category_label: string | null;
  status: "current" | "former" | "unknown";
  listed_from: string | null;
  listed_to: string | null;
  country_codes: string[];
  urls: string[];
  details: { label: string; values: string[] }[];
}

export interface FullEntityProfile {
  primary_name: string | null;
  entity_type: string | null;
  aliases: string[];
  countries: string[];
  dates_of_birth: string[];
  places_of_birth: string[];
  nationalities: string[];
  images: string[];
  associates: { name: string; relationship: string | null }[];
  listings: ProfileListing[];
  media: { title: string; url: string | null; date: string | null; snippet: string | null }[];
  last_updated: string | null;
}

const IGNORED_FIELD_NAMES = new Set(["picture url"]);

/** The data provider is never named in customer-facing output. */
function scrubProvider(value: string): string {
  return value.replace(/comply\s*advantage/gi, "WorldAML").trim();
}

function uniq(values: (string | null | undefined)[]): string[] {
  const out: string[] = [];
  for (const v of values) {
    const s = (v ?? "").toString().trim();
    if (s && !out.includes(s)) out.push(s);
  }
  return out;
}

function titleCase(value: string): string {
  return value
    .split(/\s+/)
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

function categoryLabel(amlType: string): string {
  const key = amlType.toLowerCase();
  if (key.startsWith("adverse-media")) return "Adverse media";
  if (key === "pep" || key === "pep-class-1") return "PEP";
  if (key.startsWith("pep-class")) return `PEP ${key.replace("pep-class-", "class ")}`;
  if (key.startsWith("pep")) return "PEP";
  if (key === "rca") return "Relative or close associate";
  if (key.startsWith("sanction")) return "Sanctions";
  if (key.startsWith("warning")) return "Warning";
  if (key.startsWith("fitness")) return "Fitness and probity";
  return titleCase(key.replace(/-/g, " "));
}

function normaliseCategory(amlType: string): string | null {
  const key = amlType.toLowerCase();
  if (key.startsWith("adverse-media")) return "adverse_media";
  if (key.startsWith("pep") || key === "rca") return "pep_rca";
  if (key.startsWith("sanction")) return "sanctions";
  if (key.startsWith("warning") || key.startsWith("fitness")) return "warnings";
  return null;
}

/**
 * `content` is the entity record returned by the provider's entity endpoint
 * (also compatible with a search hit's `doc`).
 */
export function normaliseEntityProfile(content: Record<string, unknown>): FullEntityProfile {
  const doc = ((content?.data as Record<string, unknown>) ?? content) as Record<string, unknown>;
  const fields = (doc?.fields as Array<Record<string, unknown>>) ?? [];
  const sourceNotes = (doc?.source_notes as Record<string, Record<string, unknown>>) ?? {};
  const assets = (doc?.assets as Array<Record<string, unknown>>) ?? [];
  const media = (doc?.media as Array<Record<string, unknown>>) ?? [];

  const dobs: string[] = [];
  const pobs: string[] = [];
  const nationalities: string[] = [];
  const images: string[] = [];
  const associates: { name: string; relationship: string | null }[] = [];

  // Fields grouped per source so listing detail stays with its listing.
  const bySource = new Map<string, { label: string; values: string[] }[]>();

  for (const f of fields) {
    const name = String(f?.name ?? "").trim();
    const value = String(f?.value ?? "").trim();
    if (!name || !value) continue;
    const lower = name.toLowerCase();

    if (lower.includes("date of birth")) dobs.push(value);
    if (lower.includes("place of birth")) pobs.push(value);
    if (lower === "nationality" || lower.includes("nationality")) nationalities.push(value);
    if (lower === "picture url" || lower === "image") images.push(value);

    if (IGNORED_FIELD_NAMES.has(lower)) continue;

    const sourceKey = String(f?.source ?? "profile");
    const list = bySource.get(sourceKey) ?? [];
    const existing = list.find((d) => d.label.toLowerCase() === lower);
    if (existing) {
      if (!existing.values.includes(value)) existing.values.push(value);
    } else {
      list.push({ label: titleCase(name), values: [value] });
    }
    bySource.set(sourceKey, list);
  }

  for (const a of (doc?.associates as Array<Record<string, unknown>>) ?? []) {
    const name = String(a?.name ?? "").trim();
    if (!name) continue;
    const rel = String(a?.association ?? a?.relationship ?? "").trim() || null;
    if (!associates.some((x) => x.name === name && x.relationship === rel)) {
      associates.push({ name, relationship: rel });
    }
  }

  for (const asset of assets) {
    const url = String(asset?.url ?? "").trim();
    const type = String(asset?.type ?? "").toLowerCase();
    if (url && (type.includes("image") || type.includes("picture"))) images.push(url);
  }

  const listings: ProfileListing[] = Object.entries(sourceNotes).map(([key, note]) => {
    const amlTypes = ((note?.aml_types as string[]) ?? []).filter(Boolean);
    const primaryType = amlTypes[0] ?? "";
    const listedTo = (note?.listing_ended_utc as string) ?? null;
    const details = bySource.get(key) ?? [];
    const urls = uniq([
      note?.url as string,
      ...details
        .filter((d) => /url/i.test(d.label))
        .flatMap((d) => d.values),
    ]);
    return {
      source_key: key,
      source_name: String(note?.name ?? primaryType ?? "Public list"),
      category: primaryType ? normaliseCategory(primaryType) : null,
      category_label: primaryType ? categoryLabel(primaryType) : null,
      status: listedTo ? "former" : (note?.listing_started_utc ? "current" : "unknown"),
      listed_from: (note?.listing_started_utc as string) ?? null,
      listed_to: listedTo,
      country_codes: ((note?.country_codes as string[]) ?? []).filter(Boolean),
      urls,
      details: details.filter((d) => !/url/i.test(d.label)),
    };
  });

  // Any field group that has no matching source note is kept as a profile block.
  for (const [key, details] of bySource.entries()) {
    if (key !== "profile" && sourceNotes[key]) continue;
    if (!details.length) continue;
    if (listings.some((l) => l.source_key === key)) continue;
    listings.push({
      source_key: key,
      source_name: "Profile information",
      category: null,
      category_label: null,
      status: "unknown",
      listed_from: null,
      listed_to: null,
      country_codes: [],
      urls: uniq(details.filter((d) => /url/i.test(d.label)).flatMap((d) => d.values)),
      details: details.filter((d) => !/url/i.test(d.label)),
    });
  }

  return {
    primary_name: (doc?.name as string) ?? null,
    entity_type: (doc?.entity_type as string) ?? null,
    aliases: uniq(((doc?.aka as Array<Record<string, unknown>>) ?? []).map((a) => String(a?.name ?? ""))),
    countries: uniq((doc?.countries as string[]) ?? []),
    dates_of_birth: uniq(dobs),
    places_of_birth: uniq(pobs),
    nationalities: uniq(nationalities),
    images: uniq(images),
    associates,
    listings: listings.sort((a, b) => {
      const rank = (c: string | null) =>
        c === "sanctions" ? 0 : c === "warnings" ? 1 : c === "pep_rca" ? 2 : c === "adverse_media" ? 3 : 4;
      return rank(a.category) - rank(b.category);
    }),
    media: media.slice(0, 50).map((m) => ({
      title: String(m?.title ?? "Untitled article"),
      url: (m?.url as string) ?? null,
      date: (m?.date as string) ?? null,
      snippet: String(m?.snippet ?? "").slice(0, 400) || null,
    })),
    last_updated: (doc?.last_updated_utc as string) ?? null,
  };
}
