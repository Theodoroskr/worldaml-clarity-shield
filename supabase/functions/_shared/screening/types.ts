// WorldAML normalised screening model.
// Nothing provider-specific may leave the edge functions in these shapes.

import type { MatchBasis, NameMatchDebug } from "./nameMatch.ts";
export type { MatchBasis, NameMatchDebug, NameMatchResult, NameMatchCandidate } from "./nameMatch.ts";

export type SubjectType = "person" | "company" | "organisation" | "vessel" | "aircraft";
export const SUBJECT_TYPES: SubjectType[] = ["person", "company", "organisation", "vessel", "aircraft"];
export type Category = "sanctions" | "pep_rca" | "warnings" | "adverse_media";
export type Assessment = "match" | "partial_match" | "conflict" | "unavailable";

export interface ScreeningSubjectInput {
  subject_type: SubjectType;
  full_name: string;
  first_name?: string | null;
  middle_name?: string | null;
  last_name?: string | null;
  previous_name?: string | null;
  date_of_birth?: string | null;
  year_of_birth?: number | null;
  incorporation_date?: string | null;
  country_of_residence?: string | null;
  nationality?: string | null;
  country_of_incorporation?: string | null;
  identification_number?: string | null;
  registration_number?: string | null;
  registered_address?: string | null;
  customer_reference?: string | null;
}

export interface ScreeningOptions {
  categories: Category[];
  nameThreshold: number;
  exactMatch: boolean;
  countries?: string[];
  yearOfBirth?: number | null;
  maxResults: number;
  monitoring: boolean;
  /** Granular provider source types (e.g. "pep-class-1"); overrides the types derived from `categories`. */
  providerTypes?: string[];
  /** Provider-defined search profile; when set, manual source/category filters are not sent. */
  searchProfileId?: string | null;
  /** When true, matches carry `similarity_debug` explaining the name scoring. */
  debug?: boolean;
}

/**
 * Provider source types selectable in the Search UI ("Sources" section).
 * Validated server-side; mapped back to normalised categories for policy checks.
 */
export const PROVIDER_SOURCE_TYPES = [
  "sanction",
  "warning",
  "fitness-probity",
  "pep",
  "pep-class-1",
  "pep-class-2",
  "pep-class-3",
  "pep-class-4",
  "adverse-media",
  "adverse-media-v2-financial-aml-cft",
  "adverse-media-v2-fraud-linked",
  "adverse-media-v2-narcotics-aml-cft",
  "adverse-media-v2-violence-aml-cft",
  "adverse-media-v2-terrorism",
  "adverse-media-v2-cybercrime",
  "adverse-media-v2-general-aml-cft",
  "adverse-media-v2-regulatory",
  "adverse-media-v2-financial-difficulty",
  "adverse-media-v2-violence-non-aml-cft",
  "adverse-media-v2-other-financial",
  "adverse-media-v2-other-serious",
  "adverse-media-v2-other-minor",
] as const;

export function categoryForSourceType(t: string): Category | null {
  const key = t.toLowerCase();
  if (key.startsWith("sanction")) return "sanctions";
  if (key.startsWith("pep") || key === "rca") return "pep_rca";
  if (key.startsWith("warning") || key.startsWith("fitness")) return "warnings";
  if (key.startsWith("adverse-media")) return "adverse_media";
  return null;
}

export interface NormalisedSource {
  source_name: string;
  jurisdiction?: string | null;
  category?: Category | null;
  listing_date?: string | null;
  last_updated?: string | null;
  reference_number?: string | null;
  description?: string | null;
  internal_source_url?: string | null;
}

export interface NormalisedAdverseMediaItem {
  headline: string;
  publication?: string | null;
  published_at?: string | null;
  media_category?: string | null;
  snippet?: string | null;
  relevant_subject?: string | null;
  internal_source_url?: string | null;
}

export interface NormalisedAttribute {
  field_key: string;
  field_label: string;
  subject_value: string | null;
  match_value: string | null;
  assessment: Assessment;
  sort_order: number;
}

export interface NormalisedMatch {
  provider_id: string; // stored internally only
  matched_name: string;
  entity_type: SubjectType | null;
  categories: Category[];
  category_labels: string[];
  name_similarity: number | null;
  /** Raw provider signals, e.g. "name_exact". */
  match_types: string[];
  /** Plain-English labels for `match_types`. */
  match_type_labels: string[];
  /** Displayed match status the similarity maps to. */
  match_basis: MatchBasis;
  /** Provider list-relevance (0-100); reference only, never shown as name match. */
  provider_relevance: number | null;
  /** Only populated when the caller requested debug output. */
  similarity_debug?: NameMatchDebug | null;
  country: string | null;
  year_of_birth: number | null;
  matched_attribute_count: number;
  conflicting_attribute_count: number;
  profile: Record<string, unknown>;
  last_data_update: string | null;
  attributes: NormalisedAttribute[];
  sources: NormalisedSource[];
  adverse_media: NormalisedAdverseMediaItem[];
}

export interface NormalisedScreening {
  provider: string;
  provider_search_id: string;
  matches: NormalisedMatch[];
  categories_screened: Category[];
  raw: unknown;
}

export interface MonitoringChange {
  provider_monitor_id: string;
  change_type: string;
  change_description: string;
  details: Record<string, unknown>;
  detected_at: string;
}

export interface ScreeningProviderAdapter {
  name: string;
  createScreening(
    subject: ScreeningSubjectInput,
    options: ScreeningOptions,
    idempotencyKey: string,
  ): Promise<NormalisedScreening>;
  retrieveScreening(providerSearchId: string): Promise<NormalisedScreening>;
  retrieveFullDetails(
    providerSearchId: string,
    providerEntityId: string,
  ): Promise<Record<string, unknown>>;
  updateMatchDecision(
    providerSearchId: string,
    providerEntityId: string,
    decision: string,
    comment?: string,
  ): Promise<void>;
  startMonitoring(providerSearchId: string): Promise<string>;
  stopMonitoring(providerSearchId: string): Promise<void>;
  retrieveMonitoringChanges(since: string): Promise<MonitoringChange[]>;
  acknowledgeMonitoringChange(providerSearchId: string): Promise<void>;
  addProviderComment(providerSearchId: string, comment: string): Promise<void>;
}

/** Customer-facing error messages. Technical detail never reaches the client. */
export const PROVIDER_ERRORS = {
  failed: "Screening could not be completed",
  unavailable: "Screening service temporarily unavailable",
  rateLimited: "Too many requests; the screening will be retried",
  invalid: "Invalid screening information",
  monitoring: "Monitoring update could not be retrieved",
} as const;

export class ProviderError extends Error {
  constructor(
    public readonly userMessage: string,
    public readonly detail: string,
    public readonly httpStatus = 502,
  ) {
    super(userMessage);
  }
}
