import { supabase } from "@/integrations/supabase/client";

export type SubjectType = "person" | "organisation";
export type ScreeningCategory = "sanctions" | "pep_rca" | "warnings" | "adverse_media";

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
    const res = (error as unknown as { context?: Response }).context;
    if (!message && res && typeof res.json === "function") {
      try {
        const body = await res.clone().json();
        message = (body as { error?: string })?.error;
      } catch { /* keep fallback message */ }
    }
    throw new Error(message || "Screening could not be completed");
  }
  if ((data as { error?: string })?.error) throw new Error((data as { error: string }).error);
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
