export interface GlossaryTerm {
  term: string;
  abbreviation?: string;
  definition: string;
  relatedTerms?: string[];
  relatedLinks?: { label: string; href: string }[];
}

export const glossaryTerms: GlossaryTerm[] = [
  {
    term: "Anti-Money Laundering",
    abbreviation: "AML",
    definition:
      "A set of laws, regulations, and procedures designed to prevent criminals from disguising illegally obtained funds as legitimate income. AML frameworks require financial institutions to implement controls including customer due diligence, transaction monitoring, and suspicious activity reporting.",
    relatedTerms: ["CDD", "SAR", "TM", "FATF", "MLR"],
    relatedLinks: [{ label: "AML Screening Module", href: "/platform/aml-screening" }],
  },
  {
    term: "Adverse Media Screening",
    definition:
      "The process of searching publicly available news sources, databases, and online content for negative information about a customer, beneficial owner, or counterparty. Adverse media checks look for associations with financial crime, corruption, fraud, or other serious misconduct.",
    relatedTerms: ["CDD", "EDD", "PEP", "KYC"],
    relatedLinks: [{ label: "AML Screening Module", href: "/platform/aml-screening" }],
  },
  {
    term: "Beneficial Ownership",
    abbreviation: "UBO",
    definition:
      "The natural person(s) who ultimately own or control a legal entity, directly or indirectly. Most AML frameworks define a beneficial owner as any individual holding 25% or more of shares or voting rights, or any person exercising effective control regardless of formal shareholding percentage.",
    relatedTerms: ["KYB", "CDD", "EDD", "PSC"],
    relatedLinks: [{ label: "KYC & KYB Module", href: "/platform/kyc-kyb" }, { label: "Beneficial Ownership Guide", href: "/blog/beneficial-ownership-guide" }],
  },
  {
    term: "Business Risk Assessment",
    abbreviation: "BRA",
    definition:
      "An enterprise-wide assessment that identifies and evaluates the money laundering and terrorist financing risks inherent to an organisation's customer base, products and services, delivery channels, and geographic exposure. The BRA forms the foundation of a risk-based AML compliance programme.",
    relatedTerms: ["RBA", "EDD", "SDD", "AML"],
    relatedLinks: [{ label: "Risk Assessment Module", href: "/platform/risk-assessment" }],
  },
  {
    term: "Compliance Management System",
    abbreviation: "CMS",
    definition:
      "An integrated framework of policies, procedures, controls, and technology that an organisation uses to manage its regulatory compliance obligations. A robust CMS includes risk assessment, compliance monitoring, audit, training, and reporting functions.",
    relatedTerms: ["AML", "KYC", "RBA"],
  },
  {
    term: "Consolidated Sanctions List",
    definition:
      "A unified list that aggregates multiple sanctions measures issued by a single authority. For example, the EU Consolidated Sanctions List combines all sanctions regimes adopted by the European Union. Financial institutions are required to screen against these lists to prevent prohibited transactions.",
    relatedTerms: ["OFAC", "SDN", "AML", "Sanctions"],
    relatedLinks: [{ label: "Sanctions Lists Reference", href: "/resources/sanctions-lists" }, { label: "Free Sanctions Check", href: "/sanctions-check" }],
  },
  {
    term: "Correspondent Banking",
    definition:
      "An arrangement whereby one bank (the correspondent) provides services on behalf of another bank (the respondent), typically to facilitate international payments. Correspondent banking relationships carry elevated AML risk due to reliance on the respondent bank's own due diligence practices.",
    relatedTerms: ["CDD", "EDD", "De-risking"],
  },
  {
    term: "Customer Due Diligence",
    abbreviation: "CDD",
    definition:
      "The process of identifying and verifying the identity of customers, understanding the nature and purpose of the business relationship, and conducting ongoing monitoring of transactions. CDD is the cornerstone of AML compliance and is required at onboarding and throughout the customer lifecycle.",
    relatedTerms: ["EDD", "SDD", "KYC", "UBO", "AML"],
    relatedLinks: [{ label: "KYC & KYB Module", href: "/platform/kyc-kyb" }],
  },
  {
    term: "De-risking",
    definition:
      "The practice by which financial institutions terminate or restrict relationships with entire customer categories, geographies, or business types deemed too high-risk, rather than managing those risks on a case-by-case basis. Regulators and the FATF have repeatedly warned that de-risking undermines financial inclusion and pushes activity to unregulated channels.",
    relatedTerms: ["RBA", "Correspondent Banking", "FATF"],
  },
  {
    term: "Enhanced Due Diligence",
    abbreviation: "EDD",
    definition:
      "A higher level of scrutiny applied to customers, relationships, or transactions that present elevated money laundering or terrorist financing risk. EDD typically involves verifying source of wealth and source of funds, obtaining senior management approval, and conducting more frequent ongoing monitoring.",
    relatedTerms: ["CDD", "SDD", "PEP", "RBA", "AML"],
    relatedLinks: [{ label: "KYC & KYB Module", href: "/platform/kyc-kyb" }],
  },
  {
    term: "Financial Action Task Force",
    abbreviation: "FATF",
    definition:
      "The inter-governmental body that sets global standards for combating money laundering, terrorist financing, and proliferation financing. FATF's 40 Recommendations form the basis of AML/CFT legislation in over 200 jurisdictions. FATF conducts mutual evaluations of member countries and publishes grey and black lists of non-compliant jurisdictions.",
    relatedTerms: ["AML", "CFT", "RBA", "DNFBP"],
    relatedLinks: [],
  },
  {
    term: "Financial Intelligence Unit",
    abbreviation: "FIU",
    definition:
      "A national body responsible for receiving, analysing, and disseminating financial intelligence related to money laundering and terrorist financing. Regulated firms are required to file Suspicious Activity Reports (SARs) with their jurisdiction's FIU. Examples include FinCEN (USA), the NCA (UK), and MOKAS (Cyprus).",
    relatedTerms: ["SAR", "STR", "AML", "FinCEN"],
  },
  {
    term: "Fuzzy Matching",
    definition:
      "A name-matching technique used in sanctions and watchlist screening that identifies approximate rather than exact matches between a search query and listed names. Fuzzy matching accounts for spelling variations, transliteration differences, and name aliases to reduce the risk of missing a genuine sanctions hit.",
    relatedTerms: ["Sanctions", "False Positive", "Watchlist"],
    relatedLinks: [{ label: "Sanctions Screening Best Practices", href: "/blog/sanctions-screening-best-practices" }],
  },
  {
    term: "Grey List",
    definition:
      "The FATF's list of jurisdictions under increased monitoring, formally known as 'Jurisdictions Under Increased Monitoring'. Countries on the grey list have committed to resolving identified strategic deficiencies in their AML/CFT regimes within agreed timelines. Customers or transactions linked to grey-listed countries typically require enhanced due diligence.",
    relatedTerms: ["FATF", "Black List", "EDD", "Jurisdiction Risk"],
  },
  {
    term: "Know Your Business",
    abbreviation: "KYB",
    definition:
      "The process of verifying the identity, legal status, ownership structure, and beneficial ownership of corporate customers, counterparties, or partners. KYB extends individual KYC checks to legal entities, requiring identification and verification of Ultimate Beneficial Owners (UBOs) alongside the entity itself.",
    relatedTerms: ["KYC", "UBO", "CDD", "EDD"],
    relatedLinks: [{ label: "KYC & KYB Module", href: "/platform/kyc-kyb" }, { label: "KYC vs KYB Guide", href: "/blog/kyc-vs-kyb-differences" }],
  },
  {
    term: "Know Your Customer",
    abbreviation: "KYC",
    definition:
      "The process of verifying the identity of individual customers, understanding the purpose and intended nature of the business relationship, and assessing the associated risk. KYC involves collecting identity documents, screening against sanctions and PEP databases, and conducting ongoing monitoring throughout the relationship.",
    relatedTerms: ["KYB", "CDD", "EDD", "AML", "PEP"],
    relatedLinks: [{ label: "KYC & KYB Module", href: "/platform/kyc-kyb" }],
  },
  {
    term: "Layering",
    definition:
      "The second stage of the money laundering process, in which illicit funds are moved through a series of complex transactions to create distance from the original criminal source. Layering techniques include wire transfers between multiple jurisdictions, currency conversions, and the use of shell companies.",
    relatedTerms: ["Placement", "Integration", "AML", "Transaction Monitoring"],
  },
  {
    term: "Liveness Detection",
    definition:
      "A biometric security technique used during remote KYC onboarding to verify that the person presenting an identity document is physically present and not using a photograph, video replay, or deepfake. Liveness detection is increasingly required for digital KYC processes under EU and UK regulations.",
    relatedTerms: ["KYC", "eKYC", "Biometrics", "Remote Onboarding"],
  },
  {
    term: "Money Laundering",
    abbreviation: "ML",
    definition:
      "The process by which criminals disguise the original ownership and control of the proceeds of criminal conduct to make those proceeds appear legitimate. Money laundering typically involves three stages: placement (introducing funds into the financial system), layering (obscuring the criminal origin), and integration (re-entering the funds into the legitimate economy).",
    relatedTerms: ["AML", "TF", "Placement", "Layering", "Integration"],
  },
  {
    term: "Money Laundering Reporting Officer",
    abbreviation: "MLRO",
    definition:
      "The individual within a regulated firm who is responsible for overseeing AML compliance, receiving internal suspicious activity reports, deciding whether to file external reports with the FIU, and acting as the primary point of contact with regulatory authorities. MLROs must be senior, independent, and appropriately qualified.",
    relatedTerms: ["SAR", "FIU", "AML", "Compliance Officer"],
  },
  {
    term: "Nominee Director / Nominee Shareholder",
    definition:
      "An individual or company that appears on corporate records as a director or shareholder on behalf of the true owner. Nominee arrangements can legitimately protect commercial confidentiality but are also commonly used to conceal the identity of Ultimate Beneficial Owners. Identifying nominees is a key challenge in KYB and corporate due diligence.",
    relatedTerms: ["UBO", "KYB", "Shell Company", "CDD"],
  },
  {
    term: "Non-Face-to-Face Customer",
    definition:
      "A customer who is onboarded without being physically present, typically through digital or remote channels. Non-face-to-face onboarding is considered higher risk by most AML frameworks and may require additional verification measures such as document authentication technology or video identity verification.",
    relatedTerms: ["KYC", "eKYC", "Liveness Detection", "CDD"],
  },
  {
    term: "Office of Foreign Assets Control",
    abbreviation: "OFAC",
    definition:
      "The US Treasury Department agency responsible for administering and enforcing economic and trade sanctions based on US foreign policy and national security goals. OFAC maintains the Specially Designated Nationals (SDN) List and the Consolidated Sanctions List. OFAC has extraterritorial reach, meaning non-US entities can face penalties for OFAC violations.",
    relatedTerms: ["SDN", "Sanctions", "Sanctions Screening"],
    relatedLinks: [{ label: "Sanctions Lists Reference", href: "/resources/sanctions-lists" }],
  },
  {
    term: "Ongoing Monitoring",
    definition:
      "The continuous review of customer activity and circumstances throughout the duration of a business relationship. Ongoing monitoring includes transaction surveillance against expected behaviour profiles, periodic CDD reviews, and re-screening against updated sanctions and PEP lists. The frequency and intensity of monitoring is calibrated to customer risk.",
    relatedTerms: ["CDD", "TM", "AML", "Risk-Based Approach"],
    relatedLinks: [{ label: "AML Screening Module", href: "/platform/aml-screening" }],
  },
  {
    term: "Placement",
    definition:
      "The first stage of the money laundering process, in which illicit cash or assets are introduced into the financial system. Placement is considered the most vulnerable stage for detection, as it typically involves direct contact between criminal proceeds and financial institutions — for example through cash deposits, currency exchange, or cash-intensive businesses.",
    relatedTerms: ["Layering", "Integration", "Money Laundering", "TM"],
  },
  {
    term: "Politically Exposed Person",
    abbreviation: "PEP",
    definition:
      "A natural person who holds, or has held, a prominent public function. PEPs are subject to Enhanced Due Diligence because their positions make them potentially vulnerable to bribery and corruption. Categories include foreign heads of state, senior government officials, judicial officers, military leadership, and senior executives of state-owned enterprises — along with their immediate family members and known close associates.",
    relatedTerms: ["EDD", "CDD", "KYC", "Adverse Media", "AML"],
    relatedLinks: [{ label: "PEP Screening Guide", href: "/blog/pep-screening-guide" }, { label: "AML Screening Module", href: "/platform/aml-screening" }],
  },
  {
    term: "Proliferation Financing",
    abbreviation: "PF",
    definition:
      "The provision of funds or financial services used in the manufacture, acquisition, development, export, or transport of weapons of mass destruction. Proliferation financing is a distinct risk category identified by FATF, separate from money laundering and terrorist financing, requiring its own risk assessment and screening controls.",
    relatedTerms: ["TF", "AML", "Sanctions", "FATF"],
  },
  {
    term: "Risk-Based Approach",
    abbreviation: "RBA",
    definition:
      "A compliance methodology that requires firms to identify, assess, and understand their specific money laundering and terrorist financing risks, and to apply proportionate controls based on those risks. The RBA is mandated by FATF and forms the basis of AML frameworks globally — replacing older, prescriptive rule-based approaches.",
    relatedTerms: ["BRA", "CDD", "EDD", "SDD", "AML", "FATF"],
    relatedLinks: [{ label: "Risk-Based Approach Guide", href: "/blog/risk-based-approach-aml" }, { label: "Risk Assessment Module", href: "/platform/risk-assessment" }],
  },
  {
    term: "Sanctions",
    definition:
      "Coercive economic and political measures imposed by governments or international bodies against countries, entities, or individuals to achieve foreign policy or national security objectives. Financial sanctions prohibit doing business with designated parties and are enforced by bodies such as OFAC, the EU, UN Security Council, and HM Treasury.",
    relatedTerms: ["OFAC", "SDN", "Consolidated Sanctions List", "Sanctions Screening"],
    relatedLinks: [{ label: "Sanctions Lists Reference", href: "/resources/sanctions-lists" }, { label: "Free Sanctions Check", href: "/sanctions-check" }],
  },
  {
    term: "Shell Company",
    definition:
      "A legal entity with no active business operations, employees, or significant assets, often incorporated in low-transparency jurisdictions. Shell companies are widely used to conceal the identity of Ultimate Beneficial Owners and facilitate money laundering, tax evasion, and sanctions evasion. Identifying shells is a critical KYB and corporate due diligence challenge.",
    relatedTerms: ["UBO", "KYB", "Nominee Director", "Jurisdiction Risk"],
  },
  {
    term: "Simplified Due Diligence",
    abbreviation: "SDD",
    definition:
      "A reduced level of customer due diligence applied to customers or products assessed as presenting a lower risk of money laundering or terrorist financing. SDD does not mean no due diligence — it means lighter-touch verification appropriate to the assessed risk. SDD must be justified and documented within the firm's risk-based approach.",
    relatedTerms: ["CDD", "EDD", "RBA", "KYC"],
  },
  {
    term: "Source of Funds",
    abbreviation: "SoF",
    definition:
      "The origin of the specific funds used in a particular transaction or relationship — for example, the proceeds of a property sale, a salary payment, or a dividend distribution. Establishing and verifying source of funds is a key element of Enhanced Due Diligence, particularly for PEPs, high-value transactions, and high-risk customers.",
    relatedTerms: ["Source of Wealth", "EDD", "PEP", "CDD"],
  },
  {
    term: "Source of Wealth",
    abbreviation: "SoW",
    definition:
      "The origin of a customer's total accumulated financial assets — how they built their wealth over their lifetime. Source of wealth evidence might include employment history, business ownership, inheritance documentation, or investment records. SoW is distinct from source of funds and is particularly important in EDD for PEPs and high-net-worth individuals.",
    relatedTerms: ["Source of Funds", "EDD", "PEP", "CDD"],
  },
  {
    term: "Specially Designated Nationals List",
    abbreviation: "SDN",
    definition:
      "The primary sanctions list maintained by the US Treasury's Office of Foreign Assets Control (OFAC), listing individuals, entities, vessels, and aircraft with whom US persons are prohibited from transacting. Assets of SDN-listed parties are blocked. Given OFAC's broad extraterritorial reach, the SDN List is considered a globally critical screening requirement.",
    relatedTerms: ["OFAC", "Sanctions", "Consolidated Sanctions List"],
    relatedLinks: [{ label: "Sanctions Lists Reference", href: "/resources/sanctions-lists" }],
  },
  {
    term: "Suspicious Activity Report",
    abbreviation: "SAR",
    definition:
      "A confidential report filed by a regulated entity with its national Financial Intelligence Unit (FIU) when it knows, suspects, or has reasonable grounds to suspect that a customer is engaged in money laundering or terrorist financing. Filing a SAR does not require certainty — suspicion is sufficient. Tipping off the subject of a SAR is a criminal offence in most jurisdictions.",
    relatedTerms: ["STR", "MLRO", "FIU", "AML", "Tipping Off"],
    relatedLinks: [],
  },
  {
    term: "Terrorist Financing",
    abbreviation: "TF",
    definition:
      "The provision or collection of funds with the intention or knowledge that they will be used to carry out terrorist acts. Unlike money laundering, terrorist financing may involve clean funds — the financial crime lies in their intended use, not their origin. CFT (Countering the Financing of Terrorism) controls often mirror AML requirements but require specific typology awareness.",
    relatedTerms: ["AML", "PF", "FATF", "Sanctions", "SAR"],
  },
  {
    term: "Transaction Monitoring",
    abbreviation: "TM",
    definition:
      "The automated surveillance of customer transactions to detect patterns or behaviours that may indicate money laundering, fraud, or other financial crime. Transaction monitoring systems apply rule-based scenarios and/or machine learning models to generate alerts for analyst review. Alert quality, threshold calibration, and documentation are key regulatory focus areas.",
    relatedTerms: ["AML", "SAR", "Ongoing Monitoring", "False Positive"],
    relatedLinks: [{ label: "Transaction Monitoring Module", href: "/platform/transaction-monitoring" }],
  },
  {
    term: "Ultimate Beneficial Owner",
    abbreviation: "UBO",
    definition:
      "See Beneficial Ownership. The natural person(s) who ultimately own or exercise control over a legal entity. Identifying and verifying UBOs is a mandatory component of KYB and corporate CDD under AML frameworks globally, including the EU AMLDs, UK MLRs, FATF Recommendations, and the US Corporate Transparency Act.",
    relatedTerms: ["Beneficial Ownership", "KYB", "CDD", "EDD", "PSC"],
    relatedLinks: [{ label: "Beneficial Ownership Guide", href: "/blog/beneficial-ownership-guide" }],
  },
  {
    term: "Watchlist Screening",
    definition:
      "The process of checking individuals, entities, or transactions against published lists of sanctioned parties, designated terrorists, PEPs, and other high-risk subjects. Watchlist screening is typically automated and performed at onboarding, on a periodic basis, and in real-time whenever monitored lists are updated.",
    relatedTerms: ["Sanctions", "PEP", "Adverse Media", "Fuzzy Matching"],
    relatedLinks: [{ label: "AML Screening Module", href: "/platform/aml-screening" }, { label: "Free Sanctions Check", href: "/sanctions-check" }],
  },
];

// Sorted alphabetically by term
export const sortedGlossaryTerms = [...glossaryTerms].sort((a, b) =>
  a.term.localeCompare(b.term)
);

// Unique first letters present
export const glossaryLetters = [
  ...new Set(sortedGlossaryTerms.map((t) => t.term[0].toUpperCase())),
].sort();
