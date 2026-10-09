/**
 * Aggregate screening-data coverage statistics.
 * Source: Data_Coverage.xlsx (Infocredit Group dataset overview), Oct 2026.
 * Counts are list-level aggregates only — individual list names are not
 * republished here; the full directory stays in the product.
 */

export interface CoverageCategory {
  key: string;
  label: string;
  description: string;
  total: number;
  countries: number;
  regions: Record<string, number>;
  examples: string[];
}

export const coverageCategories: CoverageCategory[] = [
  {
    key: "sanctions",
    label: "Sanctions lists",
    description:
      "Government and multilateral sanctions programmes — UN Security Council, EU Consolidated, OFAC, UK OFSI and national implementing lists.",
    total: 156,
    countries: 64,
    regions: {
      Europe: 45,
      Asia: 44,
      "North America": 25,
      "Middle East": 20,
      International: 10,
      Oceania: 6,
      "South America": 3,
      Africa: 3,
    },
    examples: [
      "UN Security Council Consolidated List",
      "EU Consolidated Financial Sanctions List",
      "OFAC SDN & Consolidated Lists",
      "UK OFSI Sanctions List",
    ],
  },
  {
    key: "warnings",
    label: "Warning & enforcement lists",
    description:
      "Regulatory enforcement actions, most-wanted notices, debarments and banned-entity registers issued by supervisors and law enforcement.",
    total: 1128,
    countries: 111,
    regions: {
      "North America": 344,
      Europe: 322,
      Asia: 260,
      "South America": 68,
      Oceania: 43,
      "Middle East": 30,
      Africa: 24,
      International: 23,
      "Central America & the Caribbean": 14,
    },
    examples: [
      "Europol Most Wanted",
      "Asian Development Bank Sanctions",
      "SEC enforcement actions",
      "FCA warnings and notices",
    ],
  },
  {
    key: "fitnessProbity",
    label: "Fitness & probity lists",
    description:
      "Registers of individuals and firms judged not fit and proper — licence withdrawals, disqualifications and disciplinary findings.",
    total: 164,
    countries: 36,
    regions: {
      "North America": 57,
      Asia: 49,
      Europe: 31,
      Oceania: 10,
      International: 6,
      "South America": 6,
      "Middle East": 3,
      Africa: 2,
    },
    examples: [
      "EBRD Ineligible Entities",
      "Inter-American Development Bank debarments",
      "Director disqualification registers",
      "Regulator disciplinary panels",
    ],
  },
];

export const coverageRegionTotals: Record<string, number> = {
  "North America": 426,
  Europe: 398,
  Asia: 353,
  "South America": 77,
  Oceania: 59,
  "Middle East": 53,
  International: 39,
  Africa: 29,
  "Central America & the Caribbean": 14,
};

export const coverageGrandTotal = coverageCategories.reduce(
  (acc, c) => acc + c.total,
  0
);
