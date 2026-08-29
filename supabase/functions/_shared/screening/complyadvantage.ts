// Server-side data-provider adapter. The provider is never named in any
// customer-facing payload produced by this module.

import {
  Assessment,
  Category,
  MonitoringChange,
  NormalisedAdverseMediaItem,
  NormalisedAttribute,
  NormalisedMatch,
  NormalisedScreening,
  NormalisedSource,
  PROVIDER_ERRORS,
  ProviderError,
  ScreeningOptions,
  ScreeningProviderAdapter,
  ScreeningSubjectInput,
  SUBJECT_TYPES,
  SubjectType,
} from "./types.ts";

const DEFAULT_BASE = "https://api.complyadvantage.com";
const TIMEOUT_MS = 25_000;
const MAX_ATTEMPTS = 3;

const CATEGORY_MAP: Record<string, Category> = {
  sanction: "sanctions",
  "sanction-current": "sanctions",
  "sanction-former": "sanctions",
  pep: "pep_rca",
  "pep-class-1": "pep_rca",
  "pep-class-2": "pep_rca",
  "pep-class-3": "pep_rca",
  "pep-class-4": "pep_rca",
  "pep-former": "pep_rca",
  rca: "pep_rca",
  warning: "warnings",
  fitness_probity: "warnings",
  "adverse-media": "adverse_media",
};

const CATEGORY_FILTERS: Record<Category, string[]> = {
  sanctions: ["sanction"],
  pep_rca: ["pep", "pep-class-1", "pep-class-2", "pep-class-3", "pep-class-4"],
  warnings: ["warning", "fitness-probity"],
  adverse_media: [
    "adverse-media",
    "adverse-media-financial-crime",
    "adverse-media-fraud",
    "adverse-media-general",
    "adverse-media-violent-crime",
  ],
};

function normaliseCategory(term: string): Category | null {
  const key = String(term || "").toLowerCase();
  if (CATEGORY_MAP[key]) return CATEGORY_MAP[key];
  if (key.startsWith("adverse-media")) return "adverse_media";
  if (key.startsWith("pep")) return "pep_rca";
  if (key.startsWith("sanction")) return "sanctions";
  if (key.startsWith("warning") || key.startsWith("fitness")) return "warnings";
  return null;
}

function labelFor(term: string): string {
  const key = String(term || "").toLowerCase();
  if (key.startsWith("adverse-media")) return "Adverse media";
  if (key.startsWith("pep")) return "PEP";
  if (key === "rca") return "Relative or close associate";
  if (key.startsWith("sanction")) return "Sanctions";
  if (key.startsWith("warning")) return "Warning";
  if (key.startsWith("fitness")) return "Fitness and probity";
  return term;
}

function firstFieldValue(fields: Array<Record<string, unknown>> | undefined, names: string[]): string | null {
  if (!Array.isArray(fields)) return null;
  for (const f of fields) {
    const n = String(f?.name ?? "").toLowerCase();
    if (names.some((x) => n.includes(x))) {
      const v = f?.value;
      if (v != null && String(v).trim()) return String(v).trim();
    }
  }
  return null;
}

function compare(subjectValue: string | null, matchValue: string | null): Assessment {
  if (!subjectValue || !matchValue) return "unavailable";
  const a = subjectValue.trim().toLowerCase();
  const b = matchValue.trim().toLowerCase();
  if (a === b) return "match";
  if (a.includes(b) || b.includes(a)) return "partial_match";
  return "conflict";
}

function yearOf(value: string | null): string | null {
  if (!value) return null;
  const m = value.match(/(18|19|20)\d{2}/);
  return m ? m[0] : null;
}

// ── name similarity ────────────────────────────────────────────────────────
// The provider's `score` is a list-relevance figure (typically a flat 0.7 for
// any fuzzy hit) — it is NOT a name-similarity measure. We compute our own
// Jaro-Winkler similarity between the searched name and the matched
// name/aliases so the UI can honestly say "name match".

function normaliseName(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function jaro(a: string, b: string): number {
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

function jaroWinkler(a: string, b: string): number {
  const base = jaro(a, b);
  let prefix = 0;
  while (prefix < 4 && prefix < a.length && prefix < b.length && a[prefix] === b[prefix]) prefix++;
  return base + prefix * 0.1 * (1 - base);
}

/** Token-order-insensitive similarity (handles "Udrea Elena Gabriela"). */
function nameSimilarity(subjectName: string, candidate: string): number {
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

function bestNameSimilarity(
  subjectName: string | null | undefined,
  matchedName: string,
  aliases: string[],
  matchTypes: string[],
): number | null {
  if (!subjectName?.trim()) return null;
  const exactFlag = matchTypes.some((t) => /name_exact|equivalent_name|exact_match/i.test(t));
  const best = [matchedName, ...aliases]
    .filter(Boolean)
    .reduce((acc, candidate) => Math.max(acc, nameSimilarity(subjectName, candidate)), 0);
  // Only trust the provider's "name matched exactly" flag when our own
  // comparison agrees the names are effectively the same.
  const score = exactFlag && best >= 0.9 ? 1 : best;
  return Math.round(Math.max(0, Math.min(1, score)) * 100);
}


export class ComplyAdvantageAdapter implements ScreeningProviderAdapter {
  name = "complyadvantage";
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    const key = Deno.env.get("COMPLYADVANTAGE_API_KEY");
    if (!key) {
      throw new ProviderError(
        PROVIDER_ERRORS.unavailable,
        "Screening provider credential is not configured",
        503,
      );
    }
    this.apiKey = key;
    this.baseUrl = Deno.env.get("SCREENING_PROVIDER_BASE_URL") || DEFAULT_BASE;
  }

  private async request(
    path: string,
    init: RequestInit & { idempotencyKey?: string } = {},
  ): Promise<Record<string, unknown>> {
    let lastDetail = "";
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
      try {
        const url = `${this.baseUrl}${path}${path.includes("?") ? "&" : "?"}api_key=${encodeURIComponent(this.apiKey)}`;
        const res = await fetch(url, {
          ...init,
          signal: controller.signal,
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            ...(init.idempotencyKey ? { "Idempotency-Key": init.idempotencyKey } : {}),
            ...(init.headers || {}),
          },
        });
        clearTimeout(timer);

        if (res.status === 429 || res.status >= 500) {
          lastDetail = `HTTP ${res.status}`;
          if (attempt < MAX_ATTEMPTS) {
            await new Promise((r) => setTimeout(r, 400 * Math.pow(2, attempt)));
            continue;
          }
          throw new ProviderError(
            res.status === 429 ? PROVIDER_ERRORS.rateLimited : PROVIDER_ERRORS.unavailable,
            lastDetail,
            res.status === 429 ? 429 : 503,
          );
        }

        const text = await res.text();
        let body: Record<string, unknown> = {};
        try {
          body = text ? JSON.parse(text) : {};
        } catch {
          body = {};
        }

        if (res.status === 400 || res.status === 422) {
          throw new ProviderError(PROVIDER_ERRORS.invalid, `HTTP ${res.status}: ${text.slice(0, 500)}`, 400);
        }
        if (!res.ok) {
          throw new ProviderError(PROVIDER_ERRORS.failed, `HTTP ${res.status}: ${text.slice(0, 500)}`, 502);
        }
        return body;
      } catch (err) {
        clearTimeout(timer);
        if (err instanceof ProviderError) throw err;
        lastDetail = err instanceof Error ? err.message : String(err);
        if (attempt < MAX_ATTEMPTS) {
          await new Promise((r) => setTimeout(r, 400 * Math.pow(2, attempt)));
          continue;
        }
        throw new ProviderError(PROVIDER_ERRORS.unavailable, lastDetail, 503);
      }
    }
    throw new ProviderError(PROVIDER_ERRORS.unavailable, lastDetail, 503);
  }

  async createScreening(
    subject: ScreeningSubjectInput,
    options: ScreeningOptions,
    idempotencyKey: string,
  ): Promise<NormalisedScreening> {
    // Subject type maps 1:1 onto the provider's filters.entity_type values.
    const ENTITY_TYPE_MAP: Record<SubjectType, string> = {
      person: "person",
      company: "company",
      organisation: "organisation",
      vessel: "vessel",
      aircraft: "aircraft",
    };

    const filters: Record<string, unknown> = {
      entity_type: ENTITY_TYPE_MAP[subject.subject_type] ?? "person",
    };
    // When a search profile is selected the provider applies its own source
    // configuration — manual category/type filters must not be sent.
    if (!options.searchProfileId) {
      filters.types = options.providerTypes?.length
        ? options.providerTypes
        : options.categories.flatMap((c) => CATEGORY_FILTERS[c] ?? []);
    }
    if (options.countries?.length) filters.country_codes = options.countries;
    if (options.yearOfBirth) filters.birth_year = String(options.yearOfBirth);

    const payload = {
      search_term: subject.full_name,
      client_ref: subject.customer_reference ?? undefined,
      // Provider semantics: 0 = exact match, 1 = maximum fuzziness, max 1 decimal place.
      fuzziness: options.exactMatch
        ? 0
        : Math.round(Math.max(0, Math.min(1, 1 - options.nameThreshold)) * 10) / 10,
      limit: options.maxResults,
      share_url: 0,
      ...(options.searchProfileId ? { search_profile_id: options.searchProfileId } : {}),
      filters,
    };

    const body = await this.request("/searches", {
      method: "POST",
      body: JSON.stringify(payload),
      idempotencyKey,
    });

    return this.normalise(body, subject, options);
  }

  async retrieveScreening(providerSearchId: string): Promise<NormalisedScreening> {
    const body = await this.request(`/searches/${encodeURIComponent(providerSearchId)}/details?share_url=0`);
    return this.normalise(body, null, null);
  }

  /**
   * Full detail for a single listed entity. The provider exposes it through the
   * search-details payload, so the matching hit document is extracted here.
   */
  async retrieveFullDetails(
    providerSearchId: string,
    providerEntityId: string,
  ): Promise<Record<string, unknown>> {
    const body = await this.request(
      `/searches/${encodeURIComponent(providerSearchId)}/details?share_url=0`,
    );
    const content = (body?.content as Record<string, unknown>) ?? {};
    const data = (content?.data as Record<string, unknown>) ?? content;
    const hits = (data?.hits as Array<Record<string, unknown>>) ?? [];
    const hit = hits.find((h) => String((h?.doc as Record<string, unknown>)?.id ?? "") === providerEntityId);
    return ((hit?.doc as Record<string, unknown>) ?? {}) as Record<string, unknown>;
  }

  async updateMatchDecision(
    providerSearchId: string,
    providerEntityId: string,
    decision: string,
    comment?: string,
  ): Promise<void> {
    await this.request(`/searches/${encodeURIComponent(providerSearchId)}/entities/${encodeURIComponent(providerEntityId)}`, {
      method: "PATCH",
      body: JSON.stringify({ match_status: decision, risk_level: undefined, comment }),
    });
  }

  async startMonitoring(providerSearchId: string): Promise<string> {
    await this.request(`/searches/${encodeURIComponent(providerSearchId)}/monitors`, {
      method: "PATCH",
      body: JSON.stringify({ is_monitored: true }),
    });
    return providerSearchId;
  }

  async stopMonitoring(providerSearchId: string): Promise<void> {
    await this.request(`/searches/${encodeURIComponent(providerSearchId)}/monitors`, {
      method: "PATCH",
      body: JSON.stringify({ is_monitored: false }),
    });
  }

  async retrieveMonitoringChanges(since: string): Promise<MonitoringChange[]> {
    const body = await this.request(`/users/updates?from=${encodeURIComponent(since)}`);
    const content = (body?.content as Record<string, unknown>) ?? {};
    const items = (content?.data as Array<Record<string, unknown>>) ?? [];
    return items.map((item) => {
      const type = String(item?.update_type ?? "profile_updated");
      return {
        provider_monitor_id: String(item?.search_id ?? ""),
        change_type: type,
        change_description: describeChange(type),
        details: { summary: item?.summary ?? null },
        detected_at: String(item?.created_at ?? new Date().toISOString()),
      };
    });
  }

  async acknowledgeMonitoringChange(providerSearchId: string): Promise<void> {
    await this.request(`/searches/${encodeURIComponent(providerSearchId)}/monitors/acknowledge`, {
      method: "POST",
      body: JSON.stringify({}),
    });
  }

  async addProviderComment(providerSearchId: string, comment: string): Promise<void> {
    await this.request(`/searches/${encodeURIComponent(providerSearchId)}/comments`, {
      method: "POST",
      body: JSON.stringify({ comment }),
    });
  }

  // ── normalisation ────────────────────────────────────────────────────────
  private normalise(
    body: Record<string, unknown>,
    subject: ScreeningSubjectInput | null,
    options: ScreeningOptions | null,
  ): NormalisedScreening {
    const content = (body?.content as Record<string, unknown>) ?? {};
    const data = (content?.data as Record<string, unknown>) ?? content;
    const searchId = String(data?.id ?? data?.search_id ?? "");
    const hits = (data?.hits as Array<Record<string, unknown>>) ?? [];

    const matches: NormalisedMatch[] = hits.map((hit) => {
      const doc = (hit?.doc as Record<string, unknown>) ?? {};
      const fields = (doc?.fields as Array<Record<string, unknown>>) ?? [];
      const types = ((doc?.types as string[]) ?? []).filter(Boolean);
      const categories = Array.from(
        new Set(types.map(normaliseCategory).filter((c): c is Category => !!c)),
      );
      const countries = (doc?.countries as string[]) ?? [];
      const dobValue = firstFieldValue(fields, ["date of birth", "birth"]);
      const nationality = firstFieldValue(fields, ["nationality"]);
      const country = firstFieldValue(fields, ["country"]) ?? countries[0] ?? null;
      const idNumber = firstFieldValue(fields, ["passport", "national id", "id number", "identification"]);
      const regNumber = firstFieldValue(fields, ["registration number", "company number"]);
      const address = firstFieldValue(fields, ["address"]);
      const placeOfBirth = firstFieldValue(fields, ["place of birth"]);
      const rawEntityType = String(doc?.entity_type ?? "").toLowerCase();
      const entityType: SubjectType | null =
        (SUBJECT_TYPES as string[]).includes(rawEntityType)
          ? (rawEntityType as SubjectType)
          : null;

      const attributes: NormalisedAttribute[] = [
        attr("name", "Name", subject?.full_name ?? null, String(doc?.name ?? ""), 1),
        attr("aliases", "Aliases", null, ((doc?.aka as Array<Record<string, unknown>>) ?? []).map((a) => String(a?.name ?? "")).filter(Boolean).join(", ") || null, 2),
        attr("date_of_birth", "Date of birth", subject?.date_of_birth ?? null, dobValue, 3),
        attr("year_of_birth", "Year of birth", subject?.year_of_birth ? String(subject.year_of_birth) : null, yearOf(dobValue), 4),
        attr("place_of_birth", "Place of birth", null, placeOfBirth, 5),
        attr("nationality", "Nationality", subject?.nationality ?? null, nationality, 6),
        attr("country", "Country", subject?.country_of_residence ?? subject?.country_of_incorporation ?? null, country, 7),
        attr("address", "Address", subject?.registered_address ?? null, address, 8),
        attr("identification_number", "Identification number", subject?.identification_number ?? null, idNumber, 9),
        attr("registration_number", "Registration number", subject?.registration_number ?? null, regNumber, 10),
        attr("entity_type", "Entity type", subject?.subject_type ?? null, entityType, 11),
      ];

      const sources: NormalisedSource[] = ((doc?.source_notes as Record<string, Record<string, unknown>>) ?? {}) &&
        Object.values(((doc?.source_notes as Record<string, Record<string, unknown>>) ?? {})).map((s) => ({
          source_name: String(s?.name ?? s?.aml_types ?? "Public list"),
          jurisdiction: (s?.country_codes as string[])?.[0] ?? null,
          category: normaliseCategory(String((s?.aml_types as string[])?.[0] ?? "")),
          listing_date: (s?.listing_started_utc as string) ?? null,
          last_updated: (s?.listing_ended_utc as string) ?? null,
          reference_number: (s?.url as string) ? null : null,
          description: (s?.description as string) ?? null,
          internal_source_url: (s?.url as string) ?? null,
        }));

      const adverseMedia: NormalisedAdverseMediaItem[] = ((doc?.media as Array<Record<string, unknown>>) ?? []).map((m) => ({
        headline: String(m?.title ?? "Untitled article"),
        publication: (m?.snippet ? null : null) ?? (m?.publisher as string) ?? null,
        published_at: (m?.date as string) ?? null,
        media_category: "Other risk-related media",
        snippet: String(m?.snippet ?? "").slice(0, 400) || null,
        relevant_subject: String(doc?.name ?? "") || null,
        internal_source_url: (m?.url as string) ?? null,
      }));

      const matchedCount = attributes.filter((a) => a.assessment === "match").length;
      const conflictCount = attributes.filter((a) => a.assessment === "conflict").length;
      const score = typeof hit?.score === "number" ? Number(hit.score) : null;
      const matchTypes = (hit?.match_types as string[]) ?? [];
      const aliasNames = ((doc?.aka as Array<Record<string, unknown>>) ?? [])
        .map((a) => String(a?.name ?? ""))
        .filter(Boolean);
      // Provider relevance (flat 0.7 for fuzzy hits) is kept for reference, but the
      // displayed name match is our own Jaro-Winkler similarity.
      const providerRelevance = score != null ? Math.max(0, Math.min(100, Math.round(score * 100))) : null;
      const similarity = bestNameSimilarity(
        subject?.full_name ?? null,
        String(doc?.name ?? ""),
        aliasNames,
        matchTypes,
      ) ?? providerRelevance;

      return {
        provider_id: String(doc?.id ?? ""),
        matched_name: String(doc?.name ?? "Unknown"),
        entity_type: entityType,
        categories,
        category_labels: Array.from(new Set(types.map(labelFor))),
        name_similarity: similarity != null ? Math.min(100, similarity) : null,

        country,
        year_of_birth: yearOf(dobValue) ? Number(yearOf(dobValue)) : null,
        matched_attribute_count: matchedCount,
        conflicting_attribute_count: conflictCount,
        profile: {
          primary_name: doc?.name ?? null,
          alternative_names: ((doc?.aka as Array<Record<string, unknown>>) ?? []).map((a) => a?.name).filter(Boolean),
          entity_type: entityType,
          dates_of_birth: dobValue ? [dobValue] : [],
          place_of_birth: placeOfBirth,
          nationalities: nationality ? [nationality] : [],
          countries,
          addresses: address ? [address] : [],
          identification_numbers: [idNumber, regNumber].filter(Boolean),
          pep_positions: fields.filter((f) => String(f?.name ?? "").toLowerCase().includes("position")).map((f) => f?.value),
          sanctions_programmes: fields.filter((f) => String(f?.name ?? "").toLowerCase().includes("program")).map((f) => f?.value),
          associates: (doc?.associates as unknown[]) ?? [],
          match_types: matchTypes,
          provider_relevance: providerRelevance,
          last_updated: doc?.last_updated_utc ?? null,
        },
        last_data_update: (doc?.last_updated_utc as string) ?? null,
        attributes,
        sources,
        adverse_media: adverseMedia,
      };
    });

    return {
      provider: this.name,
      provider_search_id: searchId,
      matches,
      categories_screened: options?.categories ?? [],
      raw: body,
    };
  }
}

function attr(
  key: string,
  label: string,
  subjectValue: string | null,
  matchValue: string | null,
  order: number,
): NormalisedAttribute {
  return {
    field_key: key,
    field_label: label,
    subject_value: subjectValue,
    match_value: matchValue,
    assessment: compare(subjectValue, matchValue),
    sort_order: order,
  };
}

export function describeChange(type: string): string {
  const map: Record<string, string> = {
    new_sanction: "New sanctions listing",
    sanction_updated: "Sanctions information updated",
    new_pep: "New PEP position",
    pep_updated: "PEP status changed",
    new_media: "New adverse-media article",
    profile_updated: "Profile information changed",
    match_removed: "Match removed or no longer returned",
  };
  return map[type] ?? "Profile information changed";
}
