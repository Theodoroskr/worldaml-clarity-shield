export type PartnerProduct = {
  id: string;
  name: string;
  positioning: string;
  idealFor: string;
  problem: string;
  sellingPoints: string[];
  useCases: string[];
};

/**
 * Partner-facing product briefs — written to help partners SELL, not marketing copy.
 * Keep in sync with the public platform pages, but stay short and commercial.
 */
export const PARTNER_PRODUCTS: PartnerProduct[] = [
  {
    id: "suite",
    name: "WorldAML Compliance Suite",
    positioning: "End-to-end AML operations: onboarding, screening, monitoring and reporting in one platform.",
    idealFor: "Regulated firms (fintech, banking, gaming, payments) with 5–200 compliance users.",
    problem: "Compliance teams stitch together spreadsheets, screening tools and manual filings — with no audit trail.",
    sellingPoints: [
      "One system for KYC/KYB, screening, monitoring, cases and regulator filings",
      "Multi-tenant with full audit trail and role-based access",
      "Regulator-ready exports (FinCEN, FINTRAC, MOKAS and more)",
      "Deploys in weeks, not quarters",
    ],
    useCases: ["New licence go-live", "Replacing manual/spreadsheet AML", "Audit or regulator remediation"],
  },
  {
    id: "onboarding",
    name: "KYC / KYB Onboarding",
    positioning: "White-labelled onboarding forms and identity verification with automated risk scoring.",
    idealFor: "Firms onboarding businesses or individuals at volume.",
    problem: "Slow, manual onboarding with inconsistent CDD evidence and poor drop-off visibility.",
    sellingPoints: [
      "Drag-and-drop form builder with versioning",
      "UBO / corporate ownership capture",
      "Automatic screening and risk score on submission",
      "Customer portal for document refreshes",
    ],
    useCases: ["Corporate onboarding", "Individual CDD", "Periodic review refresh"],
  },
  {
    id: "screening",
    name: "WORLDAML Screening & Monitoring",
    positioning: "Sanctions, PEP and adverse-media screening plus ongoing transaction monitoring.",
    idealFor: "Any obliged entity needing continuous screening coverage.",
    problem: "High false positives and no defensible evidence of ongoing monitoring.",
    sellingPoints: [
      "1,900+ global lists coverage",
      "Whitelisting and suppression to cut false positives",
      "Rule backtesting before go-live",
      "Alert-to-case workflow with SLA tracking",
    ],
    useCases: ["Sanctions coverage gap", "Transaction monitoring rules", "Alert backlog reduction"],
  },
  {
    id: "rcm",
    name: "Regulatory Change Management",
    positioning: "Track obligations, controls and assessments across jurisdictions.",
    idealFor: "Multi-jurisdiction compliance and risk teams.",
    problem: "Obligations tracked in documents, with no link to controls or evidence.",
    sellingPoints: ["Obligation-to-control mapping", "Assessment workflows", "Evidence library", "Jurisdiction coverage"],
    useCases: ["Regulatory inspection prep", "Group-wide obligation register"],
  },
  {
    id: "academy",
    name: "WorldAML Academy",
    positioning: "CPD-accredited AML training and certification for compliance staff.",
    idealFor: "Teams needing documented AML training for regulators.",
    problem: "Training obligations evidenced ad hoc, with no certificates or audit trail.",
    sellingPoints: ["Role and sector-specific courses", "Verifiable certificates", "Annual team access", "Progress reporting"],
    useCases: ["Annual staff training", "MLRO upskilling", "Onboarding new compliance hires"],
  },
];
