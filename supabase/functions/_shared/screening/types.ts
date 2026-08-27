// WorldAML normalised screening model.
// Nothing provider-specific may leave the edge functions in these shapes.

export type SubjectType = "person" | "organisation";
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
  retrieveFullDetails(providerEntityId: string): Promise<Record<string, unknown>>;
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
