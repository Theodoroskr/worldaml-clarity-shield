export type BestPracticeCategory =
  | "KYC/KYB"
  | "Sanctions Screening"
  | "Ongoing Monitoring"
  | "Risk Assessment"
  | "Governance & Audit";

export interface BestPractice {
  id: string;
  institution: string;
  institutionType: string;
  category: BestPracticeCategory;
  title: string;
  summary: string;
  principles: string[];
  sourceUrl: string;
  relatedFeature: { label: string; href: string };
}

export const bestPractices: BestPractice[] = [
  // FATF
  {
    id: "fatf-rba",
    institution: "FATF",
    institutionType: "Global Standard-Setter",
    category: "Risk Assessment",
    title: "Apply a Risk-Based Approach to Customer Due Diligence",
    summary:
      "FATF Recommendation 1 requires firms to identify, assess and understand money laundering and terrorist financing risks before applying proportionate controls.",
    principles: [
      "Tier customers by risk level before applying CDD measures",
      "Apply Enhanced Due Diligence (EDD) to high-risk customers, PEPs, and high-risk jurisdictions",
      "Document and periodically review risk assessments",
      "Align controls to the actual risk exposure of each customer segment",
    ],
    sourceUrl: "https://www.fatf-gafi.org/en/topics/fatf-recommendations.html",
    relatedFeature: { label: "WorldAML Risk Scoring", href: "/platform/suite" },
  },
  {
    id: "fatf-ongoing",
    institution: "FATF",
    institutionType: "Global Standard-Setter",
    category: "Ongoing Monitoring",
    title: "Continuous Transaction Monitoring & Relationship Review",
    summary:
      "FATF Recommendation 10 mandates that financial institutions conduct ongoing monitoring of business relationships and scrutinise transactions throughout.",
    principles: [
      "Monitor transactions on a continuous basis for unusual patterns",
      "Periodically refresh customer data and re-assess risk profiles",
      "Keep CDD records current to reflect changes in customer behaviour",
      "Flag and escalate transactions inconsistent with stated business purpose",
    ],
    sourceUrl: "https://www.fatf-gafi.org/en/topics/fatf-recommendations.html",
    relatedFeature: { label: "WorldAML API Monitoring", href: "/platform/api" },
  },
  {
    id: "fatf-pep",
    institution: "FATF",
    institutionType: "Global Standard-Setter",
    category: "KYC/KYB",
    title: "Enhanced Due Diligence for Politically Exposed Persons",
    summary:
      "FATF Recommendation 12 requires enhanced scrutiny of PEPs, their family members, and close associates due to elevated corruption risk.",
    principles: [
      "Screen all customers against PEP lists at onboarding and periodically thereafter",
      "Obtain senior management approval before establishing PEP relationships",
      "Verify the source of wealth and source of funds for PEP customers",
      "Apply heightened ongoing monitoring to all PEP relationships",
    ],
    sourceUrl: "https://www.fatf-gafi.org/en/topics/fatf-recommendations.html",
    relatedFeature: { label: "WorldCompliance® PEP Data", href: "/data-sources/worldcompliance" },
  },
  // Basel Committee
  {
    id: "basel-kyc",
    institution: "Basel Committee",
    institutionType: "Banking Supervisor",
    category: "KYC/KYB",
    title: "Sound KYC Principles for Customer Identification",
    summary:
      "The Basel Committee's Customer Due Diligence paper establishes that banks must verify customer identity using reliable, independent source documents.",
    principles: [
      "Establish the true identity of each customer and beneficial owner",
      "Use independent, reliable documentary sources to verify identity",
      "Understand the nature of the customer's business and intended account use",
      "Decline or exit relationships when CDD cannot be completed",
    ],
    sourceUrl: "https://www.bis.org/publ/bcbs85.htm",
    relatedFeature: { label: "WorldAML KYC Module", href: "/platform/suite" },
  },
  {
    id: "basel-correspondent",
    institution: "Basel Committee",
    institutionType: "Banking Supervisor",
    category: "KYC/KYB",
    title: "Due Diligence on Correspondent Banking Relationships",
    summary:
      "Banks must apply heightened due diligence to correspondent banking to prevent the financial system from being used for money laundering or sanctions evasion.",
    principles: [
      "Gather sufficient information about respondent banks to understand their business",
      "Assess the quality of the respondent's AML/CFT controls",
      "Obtain senior management sign-off for high-risk correspondents",
      "Document all correspondent relationships in a centralised register",
    ],
    sourceUrl: "https://www.bis.org/publ/bcbs85.htm",
    relatedFeature: { label: "WorldAML KYB Module", href: "/platform/suite" },
  },
  // WOLFSBERG Group
  {
    id: "wolfsberg-edd",
    institution: "Wolfsberg Group",
    institutionType: "Industry Association",
    category: "KYC/KYB",
    title: "Enhanced Due Diligence for High-Risk Clients",
    summary:
      "The Wolfsberg Group's AML Principles call for systematic enhanced due diligence on high-risk clients, including verification of beneficial ownership and source of funds.",
    principles: [
      "Identify beneficial owners behind corporate and trust structures",
      "Verify source of wealth and source of funds documentation",
      "Conduct internet and adverse media searches at onboarding",
      "Escalate high-risk relationships to senior compliance officers",
    ],
    sourceUrl: "https://www.wolfsberg-principles.com",
    relatedFeature: { label: "WorldAML Suite EDD", href: "/platform/suite" },
  },
  {
    id: "wolfsberg-sanctions",
    institution: "Wolfsberg Group",
    institutionType: "Industry Association",
    category: "Sanctions Screening",
    title: "Sanctions Screening Programme Standards",
    summary:
      "The Wolfsberg Group Sanctions Screening Guidance sets out best practices for building a robust sanctions compliance programme, including list management and match review.",
    principles: [
      "Screen all customers and transactions against current sanctions lists",
      "Define and document a clear match-review and escalation workflow",
      "Test screening systems regularly against sample data for accuracy",
      "Ensure list updates are applied within defined SLA timeframes",
    ],
    sourceUrl: "https://www.wolfsberg-principles.com/sites/default/files/wb/Wolfsberg-Guidance-on-Sanctions-Screening.pdf",
    relatedFeature: { label: "AML Screening", href: "/platform/suite" },
  },
  // EU AMLD6
  {
    id: "eu-amld6-ubo",
    institution: "EU AMLD6",
    institutionType: "EU Regulation",
    category: "KYC/KYB",
    title: "Ultimate Beneficial Ownership Transparency",
    summary:
      "The EU's 6th Anti-Money Laundering Directive requires member states to maintain centralised UBO registers and obliged entities to verify beneficial ownership.",
    principles: [
      "Identify all natural persons owning or controlling ≥25% of a legal entity",
      "Verify UBO information against national and EU registers",
      "Re-verify UBO data whenever a change in ownership structure occurs",
      "Retain UBO verification records for a minimum of five years",
    ],
    sourceUrl: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32018L0843",
    relatedFeature: { label: "KYB Onboarding", href: "/platform/suite" },
  },
  {
    id: "eu-amld6-predicate",
    institution: "EU AMLD6",
    institutionType: "EU Regulation",
    category: "Risk Assessment",
    title: "Expand Predicate Offence Scope for ML Risk",
    summary:
      "AMLD6 extended the list of predicate offences for money laundering to 22 categories, requiring firms to widen their risk typologies accordingly.",
    principles: [
      "Update internal risk typologies to cover all 22 predicate offence categories",
      "Include cybercrime and environmental crime in transaction monitoring rules",
      "Train staff on expanded predicate offence definitions",
      "Review and update risk appetite statements to reflect broader exposure",
    ],
    sourceUrl: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32018L1673",
    relatedFeature: { label: "Risk Assessment Module", href: "/platform/suite" },
  },
  // FCA
  {
    id: "fca-adverse-media",
    institution: "FCA",
    institutionType: "UK Regulator",
    category: "KYC/KYB",
    title: "Adverse Media Screening as Part of CDD",
    summary:
      "The FCA's Financial Crime Guide highlights adverse media checks as a key component of CDD, helping identify reputational and financial crime risk not captured by lists.",
    principles: [
      "Conduct structured adverse media searches at customer onboarding",
      "Refresh adverse media checks periodically and on trigger events",
      "Use credible, multi-language media sources to avoid blind spots",
      "Document adverse media findings and the rationale for decisions taken",
    ],
    sourceUrl: "https://www.handbook.fca.org.uk/handbook/FCG.pdf",
    relatedFeature: { label: "Adverse Media", href: "/platform/suite" },
  },
  {
    id: "fca-governance",
    institution: "FCA",
    institutionType: "UK Regulator",
    category: "Governance & Audit",
    title: "Senior Management Accountability for AML Controls",
    summary:
      "Under the FCA's Senior Managers and Certification Regime (SM&CR), named senior managers must own the firm's AML control framework and be accountable for failures.",
    principles: [
      "Designate a named MLRO with direct board-level reporting access",
      "Produce and retain regular AML MI reports for senior management",
      "Conduct annual independent reviews of the AML control framework",
      "Maintain clear documented escalation paths for suspicious activity",
    ],
    sourceUrl: "https://www.fca.org.uk/firms/financial-crime",
    relatedFeature: { label: "Compliance Oversight", href: "/platform/suite" },
  },
  // FinCEN
  {
    id: "fincen-cdd-rule",
    institution: "FinCEN",
    institutionType: "US Regulator",
    category: "KYC/KYB",
    title: "Customer Due Diligence Final Rule – Beneficial Ownership",
    summary:
      "FinCEN's CDD Rule requires covered financial institutions to identify and verify the identity of beneficial owners of legal entity customers at account opening.",
    principles: [
      "Collect beneficial ownership information for all legal entity customers",
      "Verify identity of any individual owning ≥25% equity or controlling the entity",
      "Update beneficial ownership information when material changes occur",
      "Retain beneficial ownership records for five years after account closure",
    ],
    sourceUrl: "https://www.fincen.gov/resources/statutes-and-regulations/cdd-final-rule",
    relatedFeature: { label: "KYB Onboarding", href: "/platform/suite" },
  },
  {
    id: "fincen-sar",
    institution: "FinCEN",
    institutionType: "US Regulator",
    category: "Governance & Audit",
    title: "Suspicious Activity Reporting Best Practices",
    summary:
      "FinCEN guidance emphasises timely and high-quality SAR filing as a cornerstone of AML compliance, with clear internal escalation and documentation standards.",
    principles: [
      "File SARs within 30 days of detecting a known or suspected violation",
      "Maintain a SAR decision log capturing rationale for filing or not filing",
      "Train frontline staff on red flags and internal escalation procedures",
      "Periodically test the effectiveness of your SAR process via internal audit",
    ],
    sourceUrl: "https://www.fincen.gov/resources/advisories/fincen-advisory-fin-2014-a007",
    relatedFeature: { label: "Audit Trail & Logs", href: "/platform/suite" },
  },
  // HSBC / Large Banks
  {
    id: "hsbc-risk-appetite",
    institution: "HSBC",
    institutionType: "Global Bank",
    category: "Risk Assessment",
    title: "Define and Enforce a Clear Financial Crime Risk Appetite",
    summary:
      "Global banks like HSBC publish robust financial crime risk frameworks that anchor all AML controls to an explicit, board-approved risk appetite statement.",
    principles: [
      "Set quantitative and qualitative risk appetite thresholds at board level",
      "Cascade risk appetite into business-line policies and product standards",
      "Monitor risk appetite consumption through quarterly KRI dashboards",
      "Trigger reviews when risk appetite thresholds are breached or approached",
    ],
    sourceUrl: "https://www.hsbc.com/who-we-are/esg-and-responsible-business/financial-crime-risk-management",
    relatedFeature: { label: "Risk Decisioning", href: "/platform/suite" },
  },
  {
    id: "deutsche-three-lines",
    institution: "Deutsche Bank",
    institutionType: "Global Bank",
    category: "Governance & Audit",
    title: "Three Lines of Defence Model for AML Governance",
    summary:
      "Leading global banks operate a three-lines-of-defence model to ensure AML controls are owned, overseen, and independently tested across the organisation.",
    principles: [
      "1st line: Business owns and operates the day-to-day AML controls",
      "2nd line: Compliance monitors, challenges, and advises the business",
      "3rd line: Internal Audit provides independent assurance on control effectiveness",
      "Document role boundaries and escalation paths across all three lines",
    ],
    sourceUrl: "https://www.db.com/what-we-do/responsible-banking/fighting-financial-crime",
    relatedFeature: { label: "Compliance Oversight", href: "/platform/suite" },
  },
  {
    id: "standard-chartered-sanctions",
    institution: "Standard Chartered",
    institutionType: "Global Bank",
    category: "Sanctions Screening",
    title: "Multi-Layered Sanctions Controls Across Correspondent Chains",
    summary:
      "Standard Chartered's approach to sanctions emphasises screening at every point in a transaction chain, including nested correspondents and payment intermediaries.",
    principles: [
      "Screen all parties to a transaction, not only the instructing customer",
      "Apply name-matching algorithms with documented threshold settings",
      "Maintain an escalation procedure for confirmed and potential matches",
      "Conduct regular tuning reviews to reduce false positives and negatives",
    ],
    sourceUrl: "https://www.sc.com/en/our-purpose/fighting-financial-crime/",
    relatedFeature: { label: "AML Screening", href: "/platform/suite" },
  },
  // QFCRA
  {
    id: "qfcra-aml",
    institution: "QFCRA",
    institutionType: "GCC Regulator",
    category: "Ongoing Monitoring",
    title: "Ongoing CDD and Transaction Monitoring in the GCC",
    summary:
      "The Qatar Financial Centre Regulatory Authority mandates that firms maintain dynamic customer risk profiles and conduct ongoing transaction monitoring proportionate to risk.",
    principles: [
      "Assign a risk rating to each customer at onboarding and update it regularly",
      "Apply transaction monitoring rules calibrated to the customer's risk rating",
      "Conduct periodic reviews of high-risk customers at least annually",
      "Report unusual or suspicious transactions to the FIU within required timeframes",
    ],
    sourceUrl: "https://www.qfcra.com/regulation/rules-and-regulations/aml-rules",
    relatedFeature: { label: "WorldAML API Monitoring", href: "/platform/api" },
  },
  {
    id: "cbuae-kyc",
    institution: "CBUAE",
    institutionType: "GCC Regulator",
    category: "KYC/KYB",
    title: "Customer Identification & Verification Standards in the UAE",
    summary:
      "The Central Bank of the UAE requires licensed financial institutions to establish and maintain robust CDD programmes aligned with FATF standards and UAE AML Law.",
    principles: [
      "Verify customer identity before or at the time of establishing a relationship",
      "Collect and verify information on the nature and purpose of the relationship",
      "Apply simplified or enhanced CDD based on documented risk classification",
      "Maintain records of all CDD documentation for a minimum of five years",
    ],
    sourceUrl: "https://www.centralbank.ae/en/financial-crime",
    relatedFeature: { label: "KYC Onboarding", href: "/platform/suite" },
  },
  {
    id: "bis-crypto",
    institution: "BIS / FATF",
    institutionType: "Global Standard-Setter",
    category: "Sanctions Screening",
    title: "Travel Rule Compliance for Virtual Asset Transfers",
    summary:
      "FATF Recommendation 16 — the 'Travel Rule' — requires VASPs and financial institutions to pass originator and beneficiary information with all qualifying virtual asset transfers.",
    principles: [
      "Collect and transmit required originator and beneficiary data for all covered transfers",
      "Screen originator and beneficiary data against sanctions lists before processing",
      "Implement controls to identify unhosted wallet transactions above thresholds",
      "Retain Travel Rule records for a minimum of five years",
    ],
    sourceUrl: "https://www.fatf-gafi.org/en/topics/virtual-assets.html",
    relatedFeature: { label: "AML Screening", href: "/platform/suite" },
  },
  {
    id: "egmont-fiu",
    institution: "Egmont Group",
    institutionType: "International Body",
    category: "Governance & Audit",
    title: "Effective Financial Intelligence Unit (FIU) Engagement",
    summary:
      "The Egmont Group of FIUs encourages regulated entities to build high-quality SAR reporting cultures and engage proactively with their national FIU for guidance.",
    principles: [
      "Designate a dedicated MLRO as the primary point of contact with the FIU",
      "Submit SARs that are timely, complete, and supported by relevant evidence",
      "Utilise FIU feedback to refine internal typologies and detection rules",
      "Train staff regularly using FIU-issued typology reports and red-flag lists",
    ],
    sourceUrl: "https://egmontgroup.org",
    relatedFeature: { label: "Audit Trail & Logs", href: "/platform/suite" },
  },
];
