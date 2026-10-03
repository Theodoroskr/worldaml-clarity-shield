// ─────────────────────────────────────────────────────────────────────────────
// src/services/screeningProvider.ts
//
// Compatibility wrapper used by Suite pages (AML Screening, UBO, onboarding
// submissions). Always calls the real WorldAML screening engine
// (`screening-run`). There is NO mock fallback in the live app: if the engine
// fails, the call throws so callers can record "failed" — never "clear".
// ─────────────────────────────────────────────────────────────────────────────

import { runScreeningV2 } from "@/lib/suite/screeningV2";

export type ListType =
  | "OFAC SDN"
  | "EU Sanctions"
  | "UN Consolidated"
  | "HMT UK"
  | "PEP Class 1"
  | "PEP Class 2"
  | "PEP Class 3"
  | "PEP Class 4"
  | "Adverse Media"
  | "Interpol"
  | "FATF High-Risk"
  | "Sanctions"
  | "PEP"
  | "Warnings";

export interface ScreeningResult {
  id: string;
  name: string;
  confidence: number;
  listType: ListType;
  aliases: string[];
  countries: string[];
  dob: string;
  position: string;
  dataSource: string;
  lastUpdated: string;
}

export interface ScreeningRequest {
  query: string;
  types?: ("sanctions" | "pep" | "adverse_media")[];
  countryFilter?: string[];
  minConfidence?: number;
}

export interface ScreeningResponse {
  results: ScreeningResult[];
  queryId: string;
  provider: string;
  searchedAt: string;
  listsSearched: string[];
}

interface ScreeningProvider {
  name: string;
  search(req: ScreeningRequest): Promise<ScreeningResponse>;
}

const CATEGORY_TO_LIST: Record<string, ListType> = {
  sanctions: "Sanctions",
  pep_rca: "PEP",
  warnings: "Warnings",
  adverse_media: "Adverse Media",
};

const LIST_PRIORITY: ListType[] = ["Sanctions", "Warnings", "PEP", "Adverse Media"];

/** Real WorldAML engine (LexisNexis-powered), via the `screening-run` function. */
class WorldAmlProvider implements ScreeningProvider {
  name = "worldaml";

  async search(req: ScreeningRequest): Promise<ScreeningResponse> {
    const query = req.query.trim();
    if (!query) throw new Error("A name is required to screen");
    const types = req.types ?? ["sanctions", "pep", "adverse_media"];
    const res = await runScreeningV2({
      subject: { subject_type: "any", full_name: query },
      include_adverse_media: types.includes("adverse_media"),
      start_monitoring: false,
    }) as Awaited<ReturnType<typeof runScreeningV2>> & {
      matches?: Array<{
        matched_name: string;
        categories?: string[];
        country?: string | null;
        year_of_birth?: number | null;
        name_similarity?: number | null;
        provider_relevance?: number | null;
      }>;
    };
    const minConf = req.minConfidence ?? 0;
    const results: ScreeningResult[] = (res.matches ?? []).map((m, i) => {
      const lists = (m.categories ?? []).map((c) => CATEGORY_TO_LIST[c]).filter(Boolean);
      const listType = LIST_PRIORITY.find((l) => lists.includes(l)) ?? "Warnings";
      return {
        id: `${res.search_id}-${i}`,
        name: m.matched_name,
        confidence: Math.round(m.name_similarity ?? m.provider_relevance ?? 0),
        listType,
        aliases: [],
        countries: m.country ? [m.country] : [],
        dob: m.year_of_birth ? String(m.year_of_birth) : "",
        position: "",
        dataSource: `WorldAML case ${res.case_reference}`,
        lastUpdated: new Date().toISOString().slice(0, 10),
      };
    })
      .filter((r) => r.confidence >= minConf)
      .sort((a, b) => b.confidence - a.confidence);

    return {
      results,
      queryId: res.search_id,
      provider: "worldaml",
      searchedAt: new Date().toISOString(),
      listsSearched: res.categories_screened.map((c) => CATEGORY_TO_LIST[c] ?? c),
    };
  }
}

const provider: ScreeningProvider = new WorldAmlProvider();

export async function runScreening(req: ScreeningRequest): Promise<ScreeningResponse> {
  return provider.search(req);
}
