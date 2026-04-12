// ─────────────────────────────────────────────────────────────────────────────
// src/services/screeningProvider.ts
//
// Provider abstraction for AML / sanctions / PEP screening.
// Switch provider by changing SCREENING_PROVIDER in .env:
//   VITE_SCREENING_PROVIDER=mock          ← default, deterministic test data
//   VITE_SCREENING_PROVIDER=worldcompliance
//   VITE_SCREENING_PROVIDER=dowjones
// ─────────────────────────────────────────────────────────────────────────────

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
  | "FATF High-Risk";

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

const MOCK_DATABASE: ScreeningResult[] = [
  {
    id: "mock-001",
    name: "Aleksandr Volkov",
    confidence: 96,
    listType: "OFAC SDN",
    aliases: ["A. Volkov", "Sasha Volkov"],
    countries: ["RU", "BY"],
    dob: "12/03/1968",
    position: "Sanctioned oligarch — energy sector",
    dataSource: "OFAC SDN List",
    lastUpdated: "2025-11-01",
  },
  {
    id: "mock-002",
    name: "Elena Kravchenko",
    confidence: 78,
    listType: "EU Sanctions",
    aliases: ["E. Kravchenko"],
    countries: ["UA", "RU"],
    dob: "ca. 1975",
    position: "EU-designated individual",
    dataSource: "EU Consolidated Sanctions List",
    lastUpdated: "2025-09-15",
  },
  {
    id: "mock-003",
    name: "Yusuf Al-Rashid",
    confidence: 88,
    listType: "UN Consolidated",
    aliases: ["Y. Al Rashid", "Abu Yusuf"],
    countries: ["YE", "SA"],
    dob: "Unknown",
    position: "UN-designated — terrorism financing",
    dataSource: "UN Security Council Consolidated List",
    lastUpdated: "2025-10-20",
  },
  {
    id: "mock-004",
    name: "Maria Petrakis",
    confidence: 62,
    listType: "PEP Class 2",
    aliases: ["M. Petrakis"],
    countries: ["GR", "CY"],
    dob: "04/07/1980",
    position: "Member of Parliament — Greece",
    dataSource: "WorldCompliance PEP Database",
    lastUpdated: "2025-12-01",
  },
  {
    id: "mock-005",
    name: "Dmitri Sokolov",
    confidence: 45,
    listType: "Adverse Media",
    aliases: [],
    countries: ["RU"],
    dob: "1972",
    position: "Investigated — money laundering allegations",
    dataSource: "Adverse Media Monitor",
    lastUpdated: "2025-08-30",
  },
  {
    id: "mock-006",
    name: "James Thornton",
    confidence: 31,
    listType: "HMT UK",
    aliases: ["J. Thornton"],
    countries: ["GB"],
    dob: "Unknown",
    position: "HM Treasury designated person",
    dataSource: "OFSI UK Sanctions List",
    lastUpdated: "2025-07-10",
  },
];

const LISTS_SEARCHED = [
  "OFAC SDN",
  "EU Consolidated",
  "UN Security Council",
  "HMT UK / OFSI",
  "PEP Class 1–4",
  "Adverse Media",
  "Interpol Notices",
];

class MockProvider implements ScreeningProvider {
  name = "mock";

  async search(req: ScreeningRequest): Promise<ScreeningResponse> {
    await new Promise((r) => setTimeout(r, 600 + Math.random() * 400));

    const query = req.query.toLowerCase().trim();
    const minConf = req.minConfidence ?? 20;

    const scored = MOCK_DATABASE.map((record) => {
      const haystack = [record.name, ...record.aliases, record.position]
        .join(" ")
        .toLowerCase();

      const queryTokens = query.split(/\s+/);
      const matchTokens = queryTokens.filter(
        (t) => t.length > 2 && haystack.includes(t)
      );

      const overlap = matchTokens.length / Math.max(queryTokens.length, 1);
      const adjusted = Math.round(record.confidence * (0.4 + 0.6 * overlap));

      return { ...record, confidence: adjusted };
    })
      .filter((r) => r.confidence >= minConf)
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 8);

    return {
      results: scored,
      queryId: `mock-${Date.now()}`,
      provider: "mock",
      searchedAt: new Date().toISOString(),
      listsSearched: LISTS_SEARCHED,
    };
  }
}

class WorldComplianceProvider implements ScreeningProvider {
  name = "worldcompliance";

  async search(_req: ScreeningRequest): Promise<ScreeningResponse> {
    throw new Error(
      "WorldCompliance credentials not configured. Set VITE_SCREENING_PROVIDER=mock."
    );
  }
}

class DowJonesProvider implements ScreeningProvider {
  name = "dowjones";

  async search(_req: ScreeningRequest): Promise<ScreeningResponse> {
    throw new Error(
      "Dow Jones credentials not configured. Set VITE_SCREENING_PROVIDER=mock."
    );
  }
}

function getProvider(): ScreeningProvider {
  const name = import.meta.env.VITE_SCREENING_PROVIDER ?? "mock";
  switch (name) {
    case "worldcompliance":
      return new WorldComplianceProvider();
    case "dowjones":
      return new DowJonesProvider();
    default:
      return new MockProvider();
  }
}

const provider = getProvider();

export async function runScreening(
  req: ScreeningRequest
): Promise<ScreeningResponse> {
  if (!req.query.trim()) {
    throw new Error("Search query cannot be empty");
  }
  return provider.search(req);
}

export const activeProvider = provider.name;
