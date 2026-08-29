import { supabase } from "@/integrations/supabase/client";

export type SubjectType = "person" | "company" | "organisation" | "vessel" | "aircraft" | "any";
export type ScreeningCategory = "sanctions" | "pep_rca" | "warnings" | "adverse_media";

export const SUBJECT_TYPE_LABELS: Record<SubjectType, string> = {
  person: "Individual",
  company: "Company",
  organisation: "Organization",
  vessel: "Vessel",
  aircraft: "Aircraft",
  any: "Any (Individual & Organisation)",
};

/**
 * Granular "Sources" selection shown in the Search UI. Values are provider
 * source types validated and allow-listed server-side; a provider search
 * profile (when entered) replaces this manual selection entirely.
 */
export const SOURCE_GROUPS: { label: string; hint?: string; types: { value: string; label: string }[] }[] = [
  {
    label: "Sanctions, Warnings and Fitness & Probity",
    types: [
      { value: "sanction", label: "Sanctions (e.g. OFAC SDN List, HM Treasury Sanctions List)" },
      { value: "warning", label: "Warnings (e.g. US Immigration and Customs Wanted)" },
      { value: "fitness-probity", label: "Fitness & Probity (e.g. US SAM Exclusions)" },
    ],
  },
  {
    label: "PEPs",
    types: [
      { value: "pep-class-1", label: "PEP Class 1 — Heads of State, National Parliaments, National Governments" },
      { value: "pep-class-2", label: "PEP Class 2 — Regional Governments, Regional Parliaments" },
      { value: "pep-class-3", label: "PEP Class 3 — Senior Management & Boards of SOEs" },
      { value: "pep-class-4", label: "PEP Class 4 — Mayors and Local City Councils" },
    ],
  },
  {
    label: "Adverse Media",
    hint: "Included in plans with adverse media",
    types: [
      { value: "adverse-media-v2-financial-aml-cft", label: "Financial AML/CFT" },
      { value: "adverse-media-v2-fraud-linked", label: "Fraud-linked" },
      { value: "adverse-media-v2-narcotics-aml-cft", label: "Narcotics AML/CFT" },
      { value: "adverse-media-v2-violence-aml-cft", label: "Violence AML/CFT" },
      { value: "adverse-media-v2-terrorism", label: "Terrorism" },
      { value: "adverse-media-v2-cybercrime", label: "Cybercrime" },
      { value: "adverse-media-v2-general-aml-cft", label: "General AML/CFT" },
      { value: "adverse-media-v2-regulatory", label: "Regulatory" },
      { value: "adverse-media-v2-financial-difficulty", label: "Financial difficulty" },
      { value: "adverse-media-v2-violence-non-aml-cft", label: "Violence NON-AML/CFT" },
      { value: "adverse-media-v2-other-financial", label: "Other Financial" },
      { value: "adverse-media-v2-other-serious", label: "Other Serious" },
      { value: "adverse-media-v2-other-minor", label: "Other Minor" },
    ],
  },
];

/** All selectable source type values (default = everything). */
export const ALL_SOURCE_TYPES: string[] = SOURCE_GROUPS.flatMap((g) => g.types.map((t) => t.value));

export const CATEGORY_LABELS: Record<ScreeningCategory, string> = {
  sanctions: "Sanctions",
  pep_rca: "PEP & RCA",
  warnings: "Warnings & regulatory enforcement",
  adverse_media: "Adverse media",
};

export const CASE_STATUS_LABELS: Record<string, string> = {
  no_potential_matches: "No potential matches",
  potential_matches_require_review: "Potential matches – review required",
  review_in_progress: "Review in progress",
  match_confirmed: "Match confirmed",
  false_positives_resolved: "False positives resolved",
  escalated: "Escalated",
  screening_failed: "Screening failed",
  monitoring_update_requires_review: "Monitoring update – review required",
  closed: "Closed",
};

export const MATCH_STATUS_LABELS: Record<string, string> = {
  review_required: "Review required",
  review_in_progress: "Review in progress",
  confirmed: "Confirmed match",
  possible: "Possible match",
  false_positive: "False positive",
  escalated: "Escalated",
};

export const ASSESSMENT_LABELS: Record<string, string> = {
  match: "Match",
  partial_match: "Partial match",
  conflict: "Conflict",
  unavailable: "Not available",
};

export const DECISIONS = [
  { key: "confirm_match", label: "Confirm match" },
  { key: "keep_possible", label: "Keep as possible match" },
  { key: "false_positive", label: "Mark as false positive" },
  { key: "escalate", label: "Escalate" },
  { key: "add_to_monitoring", label: "Add to ongoing monitoring" },
  { key: "reopen", label: "Reopen" },
] as const;

export const FALSE_POSITIVE_REASONS = [
  "Different date of birth",
  "Different nationality or country",
  "Different identification number",
  "Name similarity only",
  "Different entity type",
  "Confirmed different individual or organisation",
  "Other (explained below)",
];

export interface SubjectInput {
  subject_type: SubjectType;
  full_name: string;
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  previous_name?: string;
  date_of_birth?: string;
  year_of_birth?: number | null;
  incorporation_date?: string;
  country_of_residence?: string;
  nationality?: string;
  country_of_incorporation?: string;
  identification_number?: string;
  registration_number?: string;
  registered_address?: string;
  customer_reference?: string;
}

export interface RunScreeningResult {
  case_id: string;
  case_reference: string;
  search_id: string;
  reference: string;
  policy_name: string;
  categories_screened: ScreeningCategory[];
  categories_excluded: ScreeningCategory[];
  match_count: number;
}

/** Error carrying the backend's machine-readable code (e.g. quota codes). */
export class ScreeningError extends Error {
  code?: string;
  constructor(message: string, code?: string) {
    super(message);
    this.name = "ScreeningError";
    this.code = code;
  }
}

export const isQuotaCode = (code?: string) =>
  code === "search_quota_exceeded" || code === "monitor_quota_exceeded";

export async function runScreeningV2(payload: {
  subject: SubjectInput;
  include_adverse_media: boolean;
  start_monitoring: boolean;
  advanced?: Record<string, unknown>;
}): Promise<RunScreeningResult> {
  const { data, error } = await supabase.functions.invoke("screening-run", { body: payload });
  if (error) {
    // Non-2xx responses put the body on error.context, not on `data`.
    let message = (data as { error?: string } | null)?.error;
    let code = (data as { code?: string } | null)?.code;
    const res = (error as unknown as { context?: Response }).context;
    if (!message && res && typeof res.json === "function") {
      try {
        const body = await res.clone().json() as { error?: string; code?: string };
        message = body?.error;
        code = body?.code ?? code;
      } catch { /* keep fallback message */ }
    }
    throw new ScreeningError(message || "Screening could not be completed", code);
  }
  if ((data as { error?: string })?.error) {
    throw new ScreeningError(
      (data as { error: string }).error,
      (data as { code?: string }).code,
    );
  }
  return data as RunScreeningResult;
}

export async function recordDecision(payload: {
  match_id: string;
  decision: string;
  rationale: string;
  reason_code?: string;
  reason_label?: string;
}) {
  const { data, error } = await supabase.functions.invoke("screening-decision", { body: payload });
  if (error) throw new Error((data as { error?: string } | null)?.error || "Decision could not be saved");
  if ((data as { error?: string })?.error) throw new Error((data as { error: string }).error);
  return data as { ok: boolean; case_status: string; match_status: string | null };
}

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

/** In-flight and resolved profile requests, keyed by match id, so hover prefetch and
 *  opening the review dialog never fire the same request twice. */
const profileCache = new Map<string, Promise<FullEntityProfile>>();

async function requestFullProfile(matchId: string, refresh: boolean): Promise<FullEntityProfile> {
  const { data, error } = await supabase.functions.invoke("screening-entity-details", {
    body: { match_id: matchId, refresh },
  });
  if (error) {
    let message = (data as { error?: string } | null)?.error;
    const res = (error as unknown as { context?: Response }).context;
    if (!message && res && typeof res.json === "function") {
      try {
        const body = await res.clone().json();
        message = (body as { error?: string })?.error;
      } catch { /* keep fallback message */ }
    }
    throw new Error(message || "The full profile could not be loaded");
  }
  if ((data as { error?: string })?.error) throw new Error((data as { error: string }).error);
  return (data as { profile: FullEntityProfile }).profile;
}

/** Session cache of photo URLs already preloaded — keyed by URL so alias
 *  matches that share borrowed photos never trigger duplicate preloads. */
const preloadedPhotoUrls = new Set<string>();

/** True when the photo URL has already been warmed this session. */
export function isPhotoPreloaded(url: string): boolean {
  return preloadedPhotoUrls.has(url);
}

/** Preloads profile photos once per session per URL. Failed preloads are
 *  evicted so a later open can retry a transiently failed photo. */
export function preloadProfilePhotos(images: string[]): void {
  const urls = images.filter(Boolean);
  const ordered = [
    ...urls.filter((u) => u.startsWith("https://")),
    ...urls.filter((u) => !u.startsWith("https://")),
  ];
  for (const src of ordered) {
    if (preloadedPhotoUrls.has(src)) continue;
    preloadedPhotoUrls.add(src);
    const img = new Image();
    img.referrerPolicy = "no-referrer";
    img.onerror = () => preloadedPhotoUrls.delete(src);
    img.src = src;
  }
}

/** Loads the complete listed-entity profile for a match (deduplicated per session). */
export function fetchFullProfile(matchId: string, refresh = false): Promise<FullEntityProfile> {
  if (refresh) profileCache.delete(matchId);
  const cached = profileCache.get(matchId);
  if (cached) return cached;
  const promise = requestFullProfile(matchId, refresh).catch((err) => {
    // A failed attempt must not be cached, so the next open retries.
    profileCache.delete(matchId);
    throw err;
  });
  profileCache.set(matchId, promise);
  // Warm the profile photos as soon as the profile lands so the avatar never
  // flashes initials before the image has had a chance to resolve.
  void promise.then((profile) => {
    preloadProfilePhotos(profile?.images ?? []);
  }).catch(() => undefined);
  return promise;
}

/** Warms the cache in the background; failures stay silent. */
export function prefetchFullProfile(matchId: string): void {
  if (profileCache.has(matchId)) return;
  void fetchFullProfile(matchId).catch(() => undefined);
}


export function riskTone(categories: string[]): string {
  if (categories.includes("sanctions")) return "bg-red-50 text-red-700 border-red-200";
  if (categories.includes("warnings")) return "bg-amber-50 text-amber-700 border-amber-200";
  if (categories.includes("pep_rca")) return "bg-purple-50 text-purple-700 border-purple-200";
  return "bg-slate-50 text-slate-600 border-slate-200";
}

export function assessmentTone(assessment: string): string {
  switch (assessment) {
    case "match":
      return "text-emerald-600";
    case "partial_match":
      return "text-amber-600";
    case "conflict":
      return "text-red-600";
    default:
      return "text-muted-foreground";
  }
}
