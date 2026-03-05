export interface RegulationObligation {
  area: string;
  requirement: string;
  threshold?: string;
}

export interface RegulationTimeline {
  year: string;
  event: string;
}

export interface AMLRegulation {
  id: string;
  shortName: string;
  fullName: string;
  jurisdiction: string;
  jurisdictionFlag: string; // emoji
  authority: string;
  status: "In Force" | "Proposed" | "Partially In Force";
  effectiveDate: string;
  scope: string;
  keyObligations: RegulationObligation[];
  uboThreshold: string;
  pepRequirement: string;
  sanctionsRequirement: string;
  penaltyRegime: string;
  timeline: RegulationTimeline[];
  officialUrl: string;
  relatedLinks: { label: string; href: string }[];
  color: string; // tailwind bg token for accent stripe
}

export const amlRegulations: AMLRegulation[] = [
  {
    id: "fatf",
    shortName: "FATF 40 Recommendations",
    fullName: "Financial Action Task Force 40 Recommendations & FATF Methodology",
    jurisdiction: "Global Standard",
    jurisdictionFlag: "🌐",
    authority: "Financial Action Task Force (FATF)",
    status: "In Force",
    effectiveDate: "2012 (last revised 2023)",
    scope:
      "Sets the global standard for AML/CFT/CPF compliance. Adopted by 200+ jurisdictions. Covers financial institutions, DNFBPs (Designated Non-Financial Businesses and Professions), and Virtual Asset Service Providers (VASPs).",
    keyObligations: [
      { area: "Risk-Based Approach", requirement: "Firms must identify, assess and understand their ML/TF/PF risks and apply proportionate controls (Rec. 1)" },
      { area: "Customer Due Diligence", requirement: "Identify and verify customers and beneficial owners; understand the nature and purpose of the relationship (Rec. 10)" },
      { area: "Enhanced Due Diligence", requirement: "Apply EDD for higher-risk customers, PEPs, and correspondent banking relationships (Recs. 12–13)" },
      { area: "Beneficial Ownership", requirement: "Identify and verify natural persons who own or control legal entities; maintain registries (Recs. 24–25)" },
      { area: "Transaction Monitoring", requirement: "Monitor transactions to detect and report suspicious activity consistent with the customer's risk profile (Rec. 20)" },
      { area: "Suspicious Activity Reporting", requirement: "File STRs/SARs with the national FIU when ML/TF is suspected; apply tipping-off prohibition (Recs. 20–21)" },
      { area: "Sanctions & Targeted Financial Sanctions", requirement: "Implement TFS without delay — freeze assets and prohibit dealings with designated persons (Recs. 6–8)" },
      { area: "Record Keeping", requirement: "Retain CDD and transaction records for at least five years (Rec. 11)" },
      { area: "VASPs", requirement: "Regulate and supervise Virtual Asset Service Providers; apply Travel Rule to VA transfers (Rec. 15)" },
    ],
    uboThreshold: "Not prescribed — member states set thresholds (typically 25%)",
    pepRequirement: "EDD mandatory for all foreign PEPs; risk-based for domestic PEPs and IOs",
    sanctionsRequirement: "Immediate freeze; no dealings with UN-designated persons (Rec. 6)",
    penaltyRegime: "Mutual evaluation process — poor ratings lead to grey/black listing and market access consequences",
    timeline: [
      { year: "1989", event: "FATF established by G7 Summit" },
      { year: "1990", event: "Original 40 Recommendations published" },
      { year: "2001", event: "8 Special Recommendations on Terrorist Financing added" },
      { year: "2012", event: "Revised and consolidated 40 Recommendations adopted; risk-based approach formalised" },
      { year: "2019", event: "Guidance on Virtual Assets and VASPs; Travel Rule extended to crypto" },
      { year: "2022", event: "Guidance on beneficial ownership transparency strengthened" },
      { year: "2023", event: "Amendments to Rec. 25 on transparency of legal arrangements (trusts)" },
    ],
    officialUrl: "https://www.fatf-gafi.org/recommendations.html",
    relatedLinks: [
      { label: "Risk-Based Approach Guide", href: "/blog/risk-based-approach-aml" },
      { label: "AML Compliance Checklist", href: "/blog/aml-compliance-checklist-2025" },
      { label: "Risk Assessment Module", href: "/platform/risk-assessment" },
    ],
    color: "brand-teal",
  },
  {
    id: "eu6amld",
    shortName: "EU AML Package 2024",
    fullName: "EU Anti-Money Laundering Regulation (AMLR), 6th AML Directive (AMLD6), and EU AML Authority (AMLA)",
    jurisdiction: "European Union",
    jurisdictionFlag: "🇪🇺",
    authority: "European Commission / AMLA (from 2025)",
    status: "In Force",
    effectiveDate: "AMLD6 transposition by July 2027; AMLR direct effect from 2027",
    scope:
      "Applies to all EU-licensed financial institutions, crypto-asset service providers (CASPs), real estate agents, lawyers, accountants, and trust and company service providers (TCSPs) operating within the EU.",
    keyObligations: [
      { area: "Unified Rulebook", requirement: "The new AMLR creates a directly applicable EU-wide rulebook — eliminating inconsistency between member state transpositions" },
      { area: "CDD & UBO", requirement: "Mandatory CDD at onboarding and on a risk-sensitive ongoing basis; UBO identification required for all corporate customers", threshold: "25% ownership threshold" },
      { area: "UBO Registers", requirement: "Member states must maintain centralised, publicly accessible beneficial ownership registers interconnected via the EU BRIS system" },
      { area: "Enhanced Due Diligence", requirement: "Mandatory EDD for PEPs, correspondent relationships, and customers from high-risk third countries identified by the Commission" },
      { area: "Crypto-Asset Service Providers", requirement: "CASPs subject to full AML/CFT requirements equivalent to traditional financial institutions; Travel Rule applies to all transfers" },
      { area: "Cash Payment Limit", requirement: "€10,000 EU-wide cash payment limit for goods and services transactions", threshold: "€10,000" },
      { area: "AMLA Supervision", requirement: "New EU AML Authority (AMLA) will directly supervise high-risk obliged entities and coordinate national supervisors from 2026" },
      { area: "Sanctions Screening", requirement: "Real-time screening against EU Consolidated Sanctions List; no grace period for new designations" },
    ],
    uboThreshold: "25% shareholding or voting rights",
    pepRequirement: "EDD mandatory for all PEPs (foreign and domestic); 12-month post-mandate monitoring period",
    sanctionsRequirement: "Screen against EU Consolidated Sanctions List; asset freeze without delay",
    penaltyRegime: "Up to €10 million or 10% of annual turnover for serious, repeated or systematic breaches",
    timeline: [
      { year: "1991", event: "1st EU AML Directive — first framework applying to credit institutions" },
      { year: "2005", event: "3rd AML Directive — implemented FATF 2003 Recommendations" },
      { year: "2015", event: "4th AML Directive — risk-based approach; UBO registers established" },
      { year: "2018", event: "5th AML Directive — crypto exchanges; public UBO register access" },
      { year: "2020", event: "6th AML Directive — criminal liability harmonisation; 22 predicate offences" },
      { year: "2021", event: "Commission publishes AML Package — proposed AMLR, AMLD6, and AMLA Regulation" },
      { year: "2024", event: "AML Package formally adopted by Council and Parliament; AMLA established" },
      { year: "2027", event: "Target date for AMLR direct application and AMLD6 full transposition" },
    ],
    officialUrl: "https://finance.ec.europa.eu/financial-crime/anti-money-laundering-and-countering-financing-terrorism_en",
    relatedLinks: [
      { label: "KYC & KYB Module", href: "/platform/kyc-kyb" },
      { label: "Beneficial Ownership Guide", href: "/blog/beneficial-ownership-guide" },
      { label: "AML Screening Module", href: "/platform/aml-screening" },
      { label: "WorldCompliance® Data", href: "/data-sources/worldcompliance" },
    ],
    color: "navy",
  },
  {
    id: "uk-mlrs",
    shortName: "UK MLRs 2017",
    fullName: "Money Laundering, Terrorist Financing and Transfer of Funds (Information on the Payer) Regulations 2017 (as amended)",
    jurisdiction: "United Kingdom",
    jurisdictionFlag: "🇬🇧",
    authority: "HM Treasury / FCA / HMRC",
    status: "In Force",
    effectiveDate: "26 June 2017 (multiple amendments to 2023)",
    scope:
      "Applies to credit institutions, financial institutions, auditors, accountants, tax advisers, solicitors, estate agents, trust and company service providers, and casinos operating in the UK.",
    keyObligations: [
      { area: "Customer Due Diligence", requirement: "Verify customer identity and UBOs before establishing a business relationship; ongoing monitoring required throughout", threshold: "25% UBO threshold" },
      { area: "Enhanced Due Diligence", requirement: "Mandatory EDD for high-risk third country customers, PEPs, and correspondent banking; senior management approval required for PEP relationships" },
      { area: "Risk Assessment", requirement: "Firms must maintain a written, board-approved business risk assessment identifying their ML/TF/PF risks and controls" },
      { area: "Suspicious Activity Reporting", requirement: "Submit SARs to the National Crime Agency (NCA) via UKFIU systems; consent regime applies for certain transactions" },
      { area: "Politically Exposed Persons", requirement: "Identify whether customers are domestic or foreign PEPs; apply EDD for 12 months minimum post-mandate" },
      { area: "Proliferation Financing", requirement: "Firms must assess and mitigate proliferation financing risks following 2022 amendments" },
      { area: "Cryptoasset Registration", requirement: "Cryptoasset businesses must register with the FCA and comply with MLRs; Travel Rule applies from September 2023" },
      { area: "Record Keeping", requirement: "Retain CDD records and transaction records for five years from end of relationship" },
    ],
    uboThreshold: "25% shareholding, voting rights, or other ownership interest",
    pepRequirement: "EDD for all PEPs; senior management approval; source of wealth/funds; 12-month post-PEP status monitoring",
    sanctionsRequirement: "Screen against HM Treasury Financial Sanctions List; compliance with OFSI guidance; freeze obligations",
    penaltyRegime: "Civil penalties up to £1 million or higher where proportionate; criminal penalties up to 2 years imprisonment for senior managers",
    timeline: [
      { year: "2007", event: "MLRs 2007 implemented EU 3rd AML Directive" },
      { year: "2017", event: "MLRs 2017 replaced 2007 Regulations; implemented EU 4th AML Directive" },
      { year: "2019", event: "MLRs amended — EU 5th AML Directive elements transposed pre-Brexit" },
      { year: "2020", event: "MLRs further amended — digital ID, enhanced controls" },
      { year: "2022", event: "MLRs amended — Proliferation Financing risk assessment obligation added" },
      { year: "2023", event: "Cryptoasset Travel Rule implemented under MLRs (1 September 2023)" },
      { year: "2024", event: "Economic Crime and Corporate Transparency Act introduces corporate criminal liability reforms" },
    ],
    officialUrl: "https://www.legislation.gov.uk/uksi/2017/692/contents",
    relatedLinks: [
      { label: "KYC & KYB Module", href: "/platform/kyc-kyb" },
      { label: "PEP Screening Guide", href: "/blog/pep-screening-guide" },
      { label: "Sanctions Lists Reference", href: "/resources/sanctions-lists" },
      { label: "Regulatory Reporting Module", href: "/platform/regulatory-reporting" },
    ],
    color: "slate",
  },
  {
    id: "us-bsa",
    shortName: "US BSA / FinCEN",
    fullName: "Bank Secrecy Act (BSA) and FinCEN AML Programme Requirements, including the Anti-Money Laundering Act 2020 (AMLA 2020)",
    jurisdiction: "United States",
    jurisdictionFlag: "🇺🇸",
    authority: "FinCEN (Financial Crimes Enforcement Network) / OCC / Federal Reserve / FDIC",
    status: "In Force",
    effectiveDate: "1970 (BSA); AMLA 2020 enacted January 2021; CTA effective January 2024",
    scope:
      "Applies to banks, broker-dealers, money services businesses (MSBs), mutual funds, insurance companies, casinos, and other covered financial institutions operating in or with the US.",
    keyObligations: [
      { area: "AML Programme", requirement: "Maintain a written AML programme with four pillars: internal controls, independent testing, a designated BSA Officer, and ongoing training" },
      { area: "Customer Identification Programme", requirement: "Verify customer identity at account opening using name, address, DOB, and government ID", threshold: "CIP required for all account openings" },
      { area: "Customer Due Diligence Rule", requirement: "Collect and verify beneficial ownership information for legal entity customers (FinCEN CDD Rule, May 2018)", threshold: "25% ownership; 1 control person" },
      { area: "Currency Transaction Reports", requirement: "File CTRs for cash transactions exceeding $10,000 with FinCEN", threshold: "$10,000 cash threshold" },
      { area: "Suspicious Activity Reports", requirement: "File SARs with FinCEN for transactions of $5,000+ involving suspected ML, fraud, or other financial crime", threshold: "$5,000 SAR threshold" },
      { area: "OFAC Compliance", requirement: "Screen all customers and transactions against OFAC SDN List and other sanctions programmes; block/reject prohibited transactions" },
      { area: "Corporate Transparency Act (CTA)", requirement: "Reporting companies must file beneficial ownership information (BOI) reports with FinCEN's BOI database", threshold: "25% ownership or substantial control" },
      { area: "Travel Rule", requirement: "Financial institutions must pass identifying information on transfers of $3,000 or more to the next institution in the payment chain", threshold: "$3,000 wire transfer threshold" },
    ],
    uboThreshold: "25% ownership; plus one control person (FinCEN CDD Rule) / CTA: 25% or substantial control",
    pepRequirement: "No statutory PEP definition, but EDD expected by examiners for senior foreign political figures; FFIEC guidance applies",
    sanctionsRequirement: "Screen against OFAC SDN List and all applicable sanctions programmes; strict liability — no intent required",
    penaltyRegime: "Civil penalties up to $1 million+ per violation; criminal penalties up to $250,000 and 5 years imprisonment; deferred prosecution agreements",
    timeline: [
      { year: "1970", event: "Bank Secrecy Act enacted — foundational US AML legislation" },
      { year: "2001", event: "USA PATRIOT Act — Customer Identification Programme (CIP) requirement; correspondent account due diligence" },
      { year: "2014", event: "FinCEN issues advance notice of proposed rulemaking on CDD" },
      { year: "2016", event: "FinCEN CDD Final Rule issued — beneficial ownership requirements formalised" },
      { year: "2018", event: "FinCEN CDD Rule effective date — legal entity customers covered" },
      { year: "2021", event: "Anti-Money Laundering Act 2020 (AMLA 2020) enacted — modernises BSA; innovation office; whistleblower programme" },
      { year: "2022", event: "FinCEN priorities published; real estate AML rules proposed" },
      { year: "2024", event: "Corporate Transparency Act BOI reporting goes live (1 January 2024)" },
    ],
    officialUrl: "https://www.fincen.gov/resources/statutes-regulations",
    relatedLinks: [
      { label: "AML Compliance Checklist", href: "/blog/aml-compliance-checklist-2025" },
      { label: "Transaction Monitoring Module", href: "/platform/transaction-monitoring" },
      { label: "Regulatory Reporting Module", href: "/platform/regulatory-reporting" },
      { label: "WorldCompliance® NA", href: "/data-sources/worldcompliance/na" },
    ],
    color: "teal",
  },
  {
    id: "cyprus-aml",
    shortName: "Cyprus AML Law",
    fullName: "Prevention and Suppression of Money Laundering and Terrorist Financing Laws 2007–2021 (L.188(I)/2007 as amended)",
    jurisdiction: "Cyprus",
    jurisdictionFlag: "🇨🇾",
    authority: "Cyprus Securities and Exchange Commission (CySEC) / CBC / ICPAC / Bar Association",
    status: "In Force",
    effectiveDate: "2007 (multiple amendments; latest 2021 — implementing EU 5th AML Directive)",
    scope:
      "Applies to banks, investment firms, payment institutions, e-money institutions, insurance intermediaries, accountants, auditors, legal professionals, real estate agents, and other obliged entities operating in Cyprus.",
    keyObligations: [
      { area: "CDD & UBO", requirement: "Full customer due diligence at onboarding; identify and verify beneficial owners of legal entities", threshold: "25% ownership threshold" },
      { area: "Risk Assessment", requirement: "Obliged entities must conduct a written business risk assessment and maintain a risk-based compliance programme" },
      { area: "UBO Register", requirement: "All Cyprus-registered companies must register beneficial ownership information with the Registrar of Companies" },
      { area: "Compliance Officer", requirement: "Appoint a MLCO (Money Laundering Compliance Officer) — must be a senior executive approved by the relevant supervisor" },
      { area: "Suspicious Transaction Reports", requirement: "File STRs with MOKAS (Unit for Combating Money Laundering) upon suspicion; tipping off prohibited" },
      { area: "Politically Exposed Persons", requirement: "Implement enhanced screening for domestic and foreign PEPs; source of wealth required; senior management approval" },
      { area: "Sanctions", requirement: "Screen against EU Consolidated Sanctions List and UN Security Council List; immediate freeze and report to competent authorities" },
      { area: "Training", requirement: "Provide ongoing AML training to all relevant staff; maintain training records" },
    ],
    uboThreshold: "25% shareholding or voting rights",
    pepRequirement: "EDD for domestic and foreign PEPs; source of wealth/funds; board-level approval for PEP relationships; enhanced ongoing monitoring",
    sanctionsRequirement: "Screen against EU Consolidated List and UN Lists; report to MOKAS and Ministry of Finance",
    penaltyRegime: "CySEC: administrative fines up to €5 million or 10% of turnover; disqualification of management; public censure",
    timeline: [
      { year: "2007", event: "L.188(I)/2007 enacted — implemented EU 3rd AML Directive" },
      { year: "2012", event: "First major amendment — enhanced PEP and correspondent banking provisions" },
      { year: "2017", event: "Amendment implementing EU 4th AML Directive — risk-based approach, UBO registers" },
      { year: "2019", event: "Amendment implementing EU 5th AML Directive — crypto regulation, public UBO register" },
      { year: "2021", event: "Latest amendment — strengthened supervisory powers; MOKAS reporting updates" },
      { year: "2027", event: "AMLR and AMLD6 will supersede domestic law with directly applicable EU regulation" },
    ],
    officialUrl: "https://www.cysec.gov.cy/en-GB/legislation/aml/",
    relatedLinks: [
      { label: "KYC & KYB Module", href: "/platform/kyc-kyb" },
      { label: "AML Screening Module", href: "/platform/aml-screening" },
      { label: "WorldCompliance® EU/ME", href: "/data-sources/worldcompliance/eu-me" },
    ],
    color: "brand-teal",
  },
  {
    id: "malta-pmlftr",
    shortName: "Malta PMLFTR",
    fullName: "Prevention of Money Laundering and Funding of Terrorism Regulations (PMLFTR) — S.L. 373.01",
    jurisdiction: "Malta",
    jurisdictionFlag: "🇲🇹",
    authority: "Financial Intelligence Analysis Unit (FIAU) / Malta Financial Services Authority (MFSA) / Malta Gaming Authority (MGA)",
    status: "In Force",
    effectiveDate: "Consolidated text 2018 (last revised 2021)",
    scope:
      "Covers all subject persons: banks, investment services firms, financial institutions, insurance companies, accountants, auditors, legal professionals, estate agents, gaming operators, and trust/company service providers in Malta.",
    keyObligations: [
      { area: "Risk-Based Approach", requirement: "Subject persons must implement a documented risk-based AML/CFT programme including a Business Risk Assessment" },
      { area: "CDD", requirement: "Identify and verify customers, legal entities, and beneficial owners at onboarding and on an ongoing basis" },
      { area: "iGaming & Gaming", requirement: "Enhanced AML obligations for gambling operators — CDD triggered at €2,000 cumulative threshold; transaction monitoring mandatory", threshold: "€2,000 gaming threshold" },
      { area: "Suspicious Transaction Reports", requirement: "File STRs with FIAU electronically via the goAML platform; no de minimis threshold" },
      { area: "FIAU Compliance Examinations", requirement: "Subject to FIAU on-site and off-site examinations; must cooperate fully with requests" },
      { area: "Sanctions", requirement: "Real-time screening against EU Consolidated List; freeze and report to FIAU and competent authorities" },
      { area: "TCSPs", requirement: "Trust and Company Service Providers face specific obligations — maintain beneficial ownership records for all administered entities" },
    ],
    uboThreshold: "25% ownership or control",
    pepRequirement: "EDD for all domestic and foreign PEPs; 12-month post-mandate monitoring; source of wealth/funds documentation",
    sanctionsRequirement: "EU Consolidated Sanctions List; UN Security Council List; report to FIAU",
    penaltyRegime: "FIAU: administrative penalties up to €5 million or 10% of annual turnover; public naming; licence withdrawal by MFSA/MGA",
    timeline: [
      { year: "1994", event: "Prevention of Money Laundering Act enacted" },
      { year: "2008", event: "PMLFTR first published implementing EU 3rd AML Directive" },
      { year: "2018", event: "PMLFTR consolidated to implement EU 4th AML Directive" },
      { year: "2019", event: "EU 5th AML Directive elements transposed; iGaming AML guidance updated" },
      { year: "2021", event: "Latest revision — strengthened FIAU powers; VASP AML registration requirements" },
    ],
    officialUrl: "https://www.fiau.gov.mt/en/amlcft-obligations/legislation/",
    relatedLinks: [
      { label: "KYC & KYB Module", href: "/platform/kyc-kyb" },
      { label: "Transaction Monitoring Module", href: "/platform/transaction-monitoring" },
      { label: "WorldCompliance® EU/ME", href: "/data-sources/worldcompliance/eu-me" },
    ],
    color: "navy",
  },
];

// Quick comparison matrix rows
export const comparisonMatrix = [
  {
    aspect: "UBO Threshold",
    fatf: "Not prescribed (typically 25%)",
    eu: "25%",
    uk: "25%",
    us: "25% + 1 control person",
    cyprus: "25%",
    malta: "25%",
  },
  {
    aspect: "PEP EDD",
    fatf: "Mandatory (foreign); RBA (domestic)",
    eu: "Mandatory (all PEPs)",
    uk: "Mandatory (all PEPs)",
    us: "Examiner expectation; no statute",
    cyprus: "Mandatory (all PEPs)",
    malta: "Mandatory (all PEPs)",
  },
  {
    aspect: "SAR / STR Filing",
    fatf: "Required (Rec. 20)",
    eu: "Required",
    uk: "NCA UKFIU",
    us: "FinCEN ($5,000+)",
    cyprus: "MOKAS",
    malta: "FIAU goAML",
  },
  {
    aspect: "Sanctions Screening",
    fatf: "UN lists (Rec. 6)",
    eu: "EU Consolidated List",
    uk: "HM Treasury OFSI List",
    us: "OFAC SDN + programmes",
    cyprus: "EU + UN Lists",
    malta: "EU + UN Lists",
  },
  {
    aspect: "Crypto / VASP Coverage",
    fatf: "Yes — Rec. 15 (Travel Rule)",
    eu: "Yes — AMLR / MiCA",
    uk: "Yes — FCA registration + Travel Rule",
    us: "Yes — FinCEN MSB registration",
    cyprus: "Partial — CySEC licensing",
    malta: "Yes — MFSA VASP framework",
  },
  {
    aspect: "Record Retention",
    fatf: "Minimum 5 years",
    eu: "5 years",
    uk: "5 years from end of relationship",
    us: "5 years (BSA records)",
    cyprus: "5 years",
    malta: "5 years",
  },
  {
    aspect: "Max Civil Penalty",
    fatf: "Mutual evaluation consequences",
    eu: "€10m or 10% of turnover",
    uk: "Up to £1m+ (proportionate)",
    us: "$1m+ per violation (OFAC: unlimited)",
    cyprus: "€5m or 10% of turnover",
    malta: "€5m or 10% of turnover",
  },
];
