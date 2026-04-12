/**
 * Shared risk scoring engine used by SuiteRisk and SuiteOnboarding.
 * Basel AML Index 2025 (Public Edition) — Basel Institute on Governance.
 * Scale: 0 (low risk) → 10 (high risk). Normalised to 0-100 for the scoring engine.
 */

export const BASEL_AML_SCORES: Record<string, number> = {
  MM: 8.18, HT: 8.12, CD: 7.63, TD: 7.56, GQ: 7.55, VE: 7.55,
  MZ: 7.54, LA: 7.49, ML: 7.41, KH: 7.34, TJ: 7.27, SN: 7.26,
  UG: 7.25, GN: 7.19, MG: 7.16, BD: 7.13, CM: 7.12, NI: 7.11,
  PG: 7.02, NP: 6.95, TZ: 6.89, HN: 6.85, CI: 6.84, ZW: 6.82,
  PK: 6.81, BO: 6.77, CO: 6.76, BF: 6.73, MW: 6.72, GT: 6.68,
  VN: 6.67, DO: 6.63, PA: 6.60, PY: 6.55, KE: 6.54, TG: 6.52,
  SV: 6.51, EC: 6.50, GH: 6.49, ET: 6.46, SL: 6.43, TT: 6.39,
  JM: 6.38, BJ: 6.35, PH: 6.34, EG: 6.31, NG: 6.29, DZ: 6.25,
  AR: 6.22, ZA: 6.20, ME: 6.17, ID: 6.15, RU: 6.13, MA: 6.10,
  MX: 6.08, TH: 6.05, RS: 6.03, BA: 5.98, BY: 5.96, CN: 5.94,
  IN: 5.92, TR: 5.90, UA: 5.88, PE: 5.85, MN: 5.82, AL: 5.80,
  MK: 5.78, KZ: 5.75, GE: 5.70, AZ: 5.65, UZ: 5.60, MD: 5.55,
  AM: 5.50, BR: 5.48, CL: 5.42, UY: 5.40, JO: 5.35, BH: 5.30,
  TN: 5.28, LB: 5.25, KW: 5.20, SA: 5.15, OM: 5.10, QA: 5.05,
  AE: 5.00, HR: 4.95, BG: 4.90, RO: 4.85, HU: 4.80,
  MT: 4.75, GR: 4.70, SK: 4.65, CY: 4.60, LV: 4.55, PL: 4.50,
  LT: 4.45, IT: 4.40, PT: 4.35, ES: 4.30, KR: 4.25,
  SG: 4.20, IL: 4.15, HK: 4.10, TW: 4.08, JP: 4.05,
  US: 4.00, CA: 3.95, BE: 3.92, FR: 3.90, IE: 3.88, DE: 3.85,
  AT: 3.83, CZ: 3.82, NZ: 3.76, NO: 3.73, SI: 3.49, AD: 3.48, SE: 3.48,
  EE: 3.25, DK: 3.18, SM: 3.08, IS: 3.04, FI: 3.03,
  IR: 8.50, KP: 9.00, SY: 8.50, AF: 8.00, YE: 8.00, SO: 8.00,
  LY: 7.80, SD: 7.80, SS: 8.00, BI: 7.00,
  AU: 3.60, GB: 3.85, LU: 3.90, CH: 3.70, NL: 3.80,
};

export const WEIGHTS = {
  country: 20,
  screening: 25,
  transaction: 20,
  customerType: 15,
  kycStatus: 20,
};

export interface RiskBreakdown {
  country: number;
  screening: number;
  transaction: number;
  customerType: number;
  kycStatus: number;
  composite: number;
}

export function scoreCountry(country: string | null): number {
  if (!country) return 50;
  const c = country.toUpperCase();
  const baselScore = BASEL_AML_SCORES[c];
  if (baselScore !== undefined) return Math.round(baselScore * 10);
  return 50;
}

export function scoreScreening(matchCount: number, hasMatches: boolean): number {
  if (matchCount >= 5) return 100;
  if (matchCount >= 3) return 85;
  if (matchCount >= 1) return 60;
  if (hasMatches) return 40;
  return 10;
}

export function scoreTransactions(flaggedCount: number, totalCount: number, totalVolume: number): number {
  if (totalCount === 0) return 10;
  const flagRatio = flaggedCount / totalCount;
  let score = 10;
  if (flagRatio >= 0.3) score += 40;
  else if (flagRatio >= 0.1) score += 20;
  else if (flaggedCount > 0) score += 10;
  if (totalVolume > 500000) score += 30;
  else if (totalVolume > 100000) score += 20;
  else if (totalVolume > 50000) score += 10;
  if (flaggedCount >= 5) score += 20;
  else if (flaggedCount >= 2) score += 10;
  return Math.min(score, 100);
}

export function scoreCustomerType(type: string): number {
  switch (type) {
    case "corporate": return 55;
    case "business": return 45;
    case "trust": return 65;
    case "individual": return 25;
    default: return 35;
  }
}

export function scoreKycStatus(status: string): number {
  switch (status) {
    case "rejected": return 90;
    case "pending": return 65;
    case "expired": return 75;
    case "verified": return 10;
    default: return 50;
  }
}

export function computeComposite(b: Omit<RiskBreakdown, "composite">): number {
  return Math.round(
    (b.country * WEIGHTS.country +
      b.screening * WEIGHTS.screening +
      b.transaction * WEIGHTS.transaction +
      b.customerType * WEIGHTS.customerType +
      b.kycStatus * WEIGHTS.kycStatus) / 100
  );
}

export const riskColor = (r: number) => r >= 75 ? "text-destructive" : r >= 55 ? "text-amber-600" : r >= 35 ? "text-foreground" : "text-emerald-600";
export const riskBg = (r: number) => r >= 75 ? "bg-destructive" : r >= 55 ? "bg-amber-400" : r >= 35 ? "bg-primary" : "bg-emerald-500";
export const riskBadgeClass = (r: number) => r >= 75 ? "bg-red-50 text-red-700 border-red-200" : r >= 55 ? "bg-amber-50 text-amber-700 border-amber-200" : r >= 35 ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-emerald-50 text-emerald-700 border-emerald-200";
export const riskLabel = (r: number) => r >= 75 ? "Critical" : r >= 55 ? "High" : r >= 35 ? "Medium" : "Low";
