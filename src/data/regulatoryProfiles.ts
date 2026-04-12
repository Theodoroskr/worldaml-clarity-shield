/**
 * Regulatory profiles: each regulator maps to its reporting obligations,
 * baseline alert rules, risk weight adjustments, and relevant legislation.
 */

export interface ReportingObligation {
  code: string;
  name: string;
  description: string;
  threshold?: string;
}

export interface BaselineRule {
  name: string;
  severity: string;
  conditions: Array<{
    field: string;
    operator: string;
    value: string | number | boolean;
  }>;
}

export interface RegulatoryProfile {
  id: string;
  name: string;
  shortName: string;
  country: string;
  legislation: string;
  reportingObligations: ReportingObligation[];
  baselineRules: BaselineRule[];
  riskWeights: {
    countryRisk: number;
    screeningMatches: number;
    transactions: number;
    entityType: number;
    kycStatus: number;
  };
  highRiskCountries: string[];
  currencyThresholdReport?: string;
}

export const REGULATORY_PROFILES: Record<string, RegulatoryProfile> = {
  fintrac: {
    id: "fintrac",
    name: "FINTRAC — Financial Transactions and Reports Analysis Centre of Canada",
    shortName: "FINTRAC",
    country: "CA",
    legislation: "Proceeds of Crime (Money Laundering) and Terrorist Financing Act (PCMLTFA)",
    reportingObligations: [
      { code: "STR", name: "Suspicious Transaction Report", description: "Report when there are reasonable grounds to suspect ML/TF" },
      { code: "LCTR", name: "Large Cash Transaction Report", description: "Cash transactions of CAD $10,000 or more", threshold: "CAD 10,000" },
      { code: "EFTR", name: "Electronic Funds Transfer Report", description: "International EFTs of CAD $10,000 or more", threshold: "CAD 10,000" },
      { code: "TPR", name: "Terrorist Property Report", description: "Report property owned or controlled by a listed entity" },
    ],
    baselineRules: [
      { name: "FINTRAC — Large cash threshold", severity: "high", conditions: [{ field: "amount", operator: ">=", value: 10000 }, { field: "currency", operator: "=", value: "CAD" }, { field: "method_of_transaction", operator: "=", value: "cash" }] },
      { name: "FINTRAC — International EFT threshold", severity: "high", conditions: [{ field: "amount", operator: ">=", value: 10000 }, { field: "direction", operator: "=", value: "outbound" }] },
      { name: "FINTRAC — Structuring detection", severity: "critical", conditions: [{ field: "amount", operator: ">=", value: 8000 }, { field: "amount", operator: "<", value: 10000 }] },
      { name: "FINTRAC — High-risk jurisdiction", severity: "high", conditions: [{ field: "counterparty_country", operator: "in", value: "IR,KP,SY,MM,AF" }] },
      { name: "FINTRAC — PEP screening match", severity: "high", conditions: [{ field: "pep_status", operator: "=", value: "yes" }] },
      { name: "TALKA-STR — Suspicious pattern", severity: "critical", conditions: [{ field: "risk_flag", operator: "=", value: true }] },
    ],
    riskWeights: { countryRisk: 20, screeningMatches: 25, transactions: 25, entityType: 10, kycStatus: 20 },
    highRiskCountries: ["IR", "KP", "SY", "MM", "AF", "YE", "LY", "SO", "SS"],
    currencyThresholdReport: "CAD 10,000",
  },

  fincen: {
    id: "fincen",
    name: "FinCEN — Financial Crimes Enforcement Network",
    shortName: "FinCEN",
    country: "US",
    legislation: "Bank Secrecy Act (BSA) / USA PATRIOT Act",
    reportingObligations: [
      { code: "SAR", name: "Suspicious Activity Report", description: "Report suspicious transactions ≥ $5,000 involving potential ML/TF" },
      { code: "CTR", name: "Currency Transaction Report", description: "Cash transactions exceeding $10,000 in a single day", threshold: "USD 10,000" },
      { code: "FBAR", name: "Report of Foreign Bank and Financial Accounts", description: "US persons with foreign accounts exceeding $10,000 aggregate" },
    ],
    baselineRules: [
      { name: "FinCEN — CTR cash threshold", severity: "high", conditions: [{ field: "amount", operator: ">=", value: 10000 }, { field: "currency", operator: "=", value: "USD" }] },
      { name: "FinCEN — SAR threshold ($5k)", severity: "high", conditions: [{ field: "amount", operator: ">=", value: 5000 }, { field: "risk_flag", operator: "=", value: true }] },
      { name: "FinCEN — Structuring detection", severity: "critical", conditions: [{ field: "amount", operator: ">=", value: 8000 }, { field: "amount", operator: "<", value: 10000 }] },
      { name: "FinCEN — OFAC sanctioned country", severity: "critical", conditions: [{ field: "counterparty_country", operator: "in", value: "IR,KP,SY,CU,VE" }] },
      { name: "FinCEN — PEP match", severity: "high", conditions: [{ field: "pep_status", operator: "=", value: "yes" }] },
    ],
    riskWeights: { countryRisk: 20, screeningMatches: 25, transactions: 20, entityType: 15, kycStatus: 20 },
    highRiskCountries: ["IR", "KP", "SY", "CU", "VE", "MM", "AF", "YE", "SO"],
    currencyThresholdReport: "USD 10,000",
  },

  fca: {
    id: "fca",
    name: "FCA — Financial Conduct Authority (UK)",
    shortName: "FCA",
    country: "GB",
    legislation: "Money Laundering, Terrorist Financing and Transfer of Funds Regulations 2017 (MLR 2017) / Proceeds of Crime Act 2002 (POCA)",
    reportingObligations: [
      { code: "SAR", name: "Suspicious Activity Report", description: "Submit to NCA via the SAR Online system when suspicion of ML/TF arises" },
      { code: "DAML", name: "Defence Against Money Laundering", description: "Request consent from NCA to proceed with a suspicious transaction" },
    ],
    baselineRules: [
      { name: "FCA — High-value transaction", severity: "high", conditions: [{ field: "amount", operator: ">=", value: 10000 }, { field: "currency", operator: "=", value: "GBP" }] },
      { name: "FCA — High-risk third country", severity: "high", conditions: [{ field: "counterparty_country", operator: "in", value: "IR,KP,SY,MM,AF,YE" }] },
      { name: "FCA — PEP EDD trigger", severity: "high", conditions: [{ field: "pep_status", operator: "=", value: "yes" }] },
      { name: "FCA — Rapid fund movement", severity: "medium", conditions: [{ field: "risk_flag", operator: "=", value: true }] },
      { name: "FCA — Cash structuring", severity: "critical", conditions: [{ field: "amount", operator: ">=", value: 8000 }, { field: "amount", operator: "<", value: 10000 }] },
    ],
    riskWeights: { countryRisk: 20, screeningMatches: 25, transactions: 20, entityType: 15, kycStatus: 20 },
    highRiskCountries: ["IR", "KP", "SY", "MM", "AF", "YE", "LY", "SO"],
  },

  eu_amld: {
    id: "eu_amld",
    name: "EU AMLD — Anti-Money Laundering Directives (4/5/6AMLD)",
    shortName: "EU AMLD",
    country: "EU",
    legislation: "Directive (EU) 2015/849 (4AMLD), as amended by 5AMLD (2018/843) and proposed 6AMLD",
    reportingObligations: [
      { code: "STR", name: "Suspicious Transaction Report", description: "Report to national FIU when ML/TF is suspected" },
      { code: "CTR", name: "Cash Transaction Report", description: "Report cash payments ≥ €10,000 (proposed €3,000 under AMLR)", threshold: "EUR 10,000" },
    ],
    baselineRules: [
      { name: "EU AMLD — Cash transaction threshold", severity: "high", conditions: [{ field: "amount", operator: ">=", value: 10000 }, { field: "currency", operator: "=", value: "EUR" }] },
      { name: "EU AMLD — High-risk third country", severity: "high", conditions: [{ field: "counterparty_country", operator: "in", value: "IR,KP,SY,MM,AF,YE" }] },
      { name: "EU AMLD — PEP enhanced due diligence", severity: "high", conditions: [{ field: "pep_status", operator: "=", value: "yes" }] },
      { name: "EU AMLD — Structuring below threshold", severity: "critical", conditions: [{ field: "amount", operator: ">=", value: 8000 }, { field: "amount", operator: "<", value: 10000 }] },
    ],
    riskWeights: { countryRisk: 25, screeningMatches: 25, transactions: 20, entityType: 10, kycStatus: 20 },
    highRiskCountries: ["IR", "KP", "SY", "MM", "AF", "YE", "LY", "SO", "SS"],
    currencyThresholdReport: "EUR 10,000",
  },

  cysec: {
    id: "cysec",
    name: "CySEC — Cyprus Securities and Exchange Commission",
    shortName: "CySEC",
    country: "CY",
    legislation: "Prevention and Suppression of Money Laundering and Terrorist Financing Laws 2007–2021 (L.188(I)/2007)",
    reportingObligations: [
      { code: "STR", name: "Suspicious Transaction Report", description: "Report to MOKAS (Cyprus FIU) when ML/TF is suspected" },
      { code: "CTR", name: "Cash Transaction Report", description: "Cash transactions ≥ €10,000", threshold: "EUR 10,000" },
    ],
    baselineRules: [
      { name: "CySEC — Cash threshold EUR 10k", severity: "high", conditions: [{ field: "amount", operator: ">=", value: 10000 }, { field: "currency", operator: "=", value: "EUR" }] },
      { name: "CySEC — High-risk third country", severity: "high", conditions: [{ field: "counterparty_country", operator: "in", value: "IR,KP,SY,MM,AF,YE,TR,RU" }] },
      { name: "CySEC — PEP enhanced monitoring", severity: "high", conditions: [{ field: "pep_status", operator: "=", value: "yes" }] },
      { name: "CySEC — Structuring detection", severity: "critical", conditions: [{ field: "amount", operator: ">=", value: 8000 }, { field: "amount", operator: "<", value: 10000 }] },
      { name: "CySEC — Complex corporate structure", severity: "medium", conditions: [{ field: "entity_type", operator: "=", value: "business" }] },
    ],
    riskWeights: { countryRisk: 25, screeningMatches: 25, transactions: 20, entityType: 10, kycStatus: 20 },
    highRiskCountries: ["IR", "KP", "SY", "MM", "AF", "YE", "RU", "TR"],
    currencyThresholdReport: "EUR 10,000",
  },

  icpac: {
    id: "icpac",
    name: "ICPAC — Institute of Certified Public Accountants of Cyprus",
    shortName: "ICPAC",
    country: "CY",
    legislation: "Prevention and Suppression of Money Laundering and Terrorist Financing Laws 2007–2021 / ICPAC AML Directive",
    reportingObligations: [
      { code: "STR", name: "Suspicious Transaction Report", description: "Report to MOKAS via ICPAC when ML/TF is suspected" },
      { code: "IAR", name: "Internal Assessment Report", description: "Annual internal AML risk assessment report to ICPAC" },
    ],
    baselineRules: [
      { name: "ICPAC — Cash threshold EUR 10k", severity: "high", conditions: [{ field: "amount", operator: ">=", value: 10000 }, { field: "currency", operator: "=", value: "EUR" }] },
      { name: "ICPAC — High-risk jurisdiction", severity: "high", conditions: [{ field: "counterparty_country", operator: "in", value: "IR,KP,SY,MM,AF,YE,RU" }] },
      { name: "ICPAC — PEP identification", severity: "high", conditions: [{ field: "pep_status", operator: "=", value: "yes" }] },
      { name: "ICPAC — Complex trust/foundation", severity: "medium", conditions: [{ field: "entity_type", operator: "=", value: "business" }] },
    ],
    riskWeights: { countryRisk: 25, screeningMatches: 20, transactions: 20, entityType: 15, kycStatus: 20 },
    highRiskCountries: ["IR", "KP", "SY", "MM", "AF", "YE", "RU"],
    currencyThresholdReport: "EUR 10,000",
  },

  cba_cyprus: {
    id: "cba_cyprus",
    name: "Cyprus Bar Association — AML Obligations for Lawyers",
    shortName: "CBA Cyprus",
    country: "CY",
    legislation: "Prevention and Suppression of Money Laundering and Terrorist Financing Laws / Bar Association AML Directive",
    reportingObligations: [
      { code: "STR", name: "Suspicious Transaction Report", description: "Report to MOKAS via the Cyprus Bar Association" },
      { code: "CDD", name: "Client Due Diligence Record", description: "Maintain CDD records for all client matters involving financial transactions" },
    ],
    baselineRules: [
      { name: "CBA — Cash payment threshold", severity: "high", conditions: [{ field: "amount", operator: ">=", value: 10000 }, { field: "currency", operator: "=", value: "EUR" }] },
      { name: "CBA — High-risk jurisdiction", severity: "high", conditions: [{ field: "counterparty_country", operator: "in", value: "IR,KP,SY,MM,AF,YE,RU" }] },
      { name: "CBA — PEP client", severity: "high", conditions: [{ field: "pep_status", operator: "=", value: "yes" }] },
      { name: "CBA — Trust/company formation", severity: "medium", conditions: [{ field: "entity_type", operator: "=", value: "business" }] },
    ],
    riskWeights: { countryRisk: 25, screeningMatches: 20, transactions: 15, entityType: 20, kycStatus: 20 },
    highRiskCountries: ["IR", "KP", "SY", "MM", "AF", "YE", "RU"],
    currencyThresholdReport: "EUR 10,000",
  },
};

export const REGULATOR_OPTIONS = Object.values(REGULATORY_PROFILES).map(r => ({
  id: r.id,
  label: r.shortName,
  fullName: r.name,
  country: r.country,
}));
