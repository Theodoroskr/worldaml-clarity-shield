export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  category: string;
  date: string;
  readTime: number; // minutes
  author: string;
  authorTitle: string;
  tags: string[];
  content: BlogSection[];
  relatedSlugs?: string[];
}

export interface BlogSection {
  type: "intro" | "h2" | "h3" | "p" | "ul" | "ol" | "callout" | "table";
  text?: string;
  items?: string[];
  headers?: string[];
  rows?: string[][];
}

export const blogCategories = [
  "All",
  "AML Compliance",
  "KYC & KYB",
  "Sanctions",
  "Regulatory Updates",
  "Risk Assessment",
  "Technology",
];

export const blogPosts: BlogPost[] = [
  {
    slug: "aml-compliance-checklist-2025",
    title: "AML Compliance Checklist for Financial Institutions in 2025",
    description:
      "A practical, step-by-step AML compliance checklist covering risk assessments, CDD, transaction monitoring, and SAR filing — updated for 2025 regulatory requirements.",
    category: "AML Compliance",
    date: "2025-02-18",
    readTime: 9,
    author: "WorldAML Compliance Team",
    authorTitle: "Compliance Research",
    tags: [
      "AML",
      "compliance checklist",
      "CDD",
      "transaction monitoring",
      "SAR",
      "FATF",
    ],
    relatedSlugs: [
      "kyc-vs-kyb-differences",
      "sanctions-screening-best-practices",
      "risk-based-approach-aml",
    ],
    content: [
      {
        type: "intro",
        text: "Anti-money laundering (AML) compliance is no longer a tick-box exercise — it is a core operational function for any regulated financial institution. With FATF mutual evaluations intensifying, national regulators tightening enforcement, and fines reaching record highs, having a robust, auditable AML programme is essential. This checklist distils the key obligations into actionable steps.",
      },
      {
        type: "h2",
        text: "1. Establish a Risk-Based Approach (RBA)",
      },
      {
        type: "p",
        text: "The cornerstone of any AML programme is the risk-based approach. Regulators expect firms to assess their inherent money laundering and terrorist financing risks and allocate resources proportionately.",
      },
      {
        type: "ul",
        items: [
          "Conduct and document an enterprise-wide Business Risk Assessment (BRA) at least annually",
          "Identify risk factors: customer type, product/service, geography, delivery channel",
          "Map risk appetite and define residual risk tolerance thresholds",
          "Ensure senior management sign-off and board oversight of the BRA",
        ],
      },
      {
        type: "h2",
        text: "2. Customer Due Diligence (CDD) & Know Your Customer",
      },
      {
        type: "p",
        text: "CDD is the foundation of knowing who you are doing business with. Deficiencies in CDD are among the most common AML enforcement findings globally.",
      },
      {
        type: "ul",
        items: [
          "Verify customer identity using reliable, independent source documents",
          "Identify and verify the identity of beneficial owners (25%+ ownership threshold in most jurisdictions)",
          "Apply Enhanced Due Diligence (EDD) for high-risk customers, PEPs, and high-risk geographies",
          "Conduct Simplified Due Diligence (SDD) only where allowed by your jurisdiction's regulations",
          "Maintain CDD records for a minimum of 5 years (or as required locally)",
        ],
      },
      {
        type: "h2",
        text: "3. Sanctions & PEP Screening",
      },
      {
        type: "p",
        text: "Screening must occur at onboarding, on a periodic basis, and in real-time as lists are updated. Missed sanctions hits carry the most severe regulatory penalties.",
      },
      {
        type: "ul",
        items: [
          "Screen all customers and beneficial owners against OFAC SDN, EU Consolidated, UN, and HM Treasury lists at onboarding",
          "Configure ongoing monitoring to trigger re-screening when global watchlists are updated",
          "Screen for Politically Exposed Persons (PEPs) — including immediate family members and close associates",
          "Document screening methodology, list sources, and false-positive management procedures",
          "Maintain an audit trail of every screening event with timestamps and analyst decisions",
        ],
      },
      {
        type: "h2",
        text: "4. Transaction Monitoring",
      },
      {
        type: "p",
        text: "Automated transaction monitoring systems detect unusual patterns that may indicate money laundering. Rules and thresholds must be calibrated and regularly reviewed.",
      },
      {
        type: "ul",
        items: [
          "Deploy scenario-based monitoring rules tuned to your product and customer risk profile",
          "Set meaningful alert thresholds — avoid both over-alerting and under-alerting",
          "Review and update rule sets at least annually or after significant business model changes",
          "Ensure every alert has a documented investigation rationale",
          "Track and report on alert volumes, investigation times, and SAR conversion rates",
        ],
      },
      {
        type: "h2",
        text: "5. Suspicious Activity Reporting (SAR)",
      },
      {
        type: "ul",
        items: [
          "Train all relevant staff to recognise and escalate red flags",
          "Maintain an internal SAR submission log",
          "Meet filing deadlines — typically 30 days from suspicion in most jurisdictions",
          "Implement tipping-off controls: do not alert the subject of a SAR",
          "Review declined SAR submissions to identify training gaps",
        ],
      },
      {
        type: "h2",
        text: "6. Training & Culture",
      },
      {
        type: "ul",
        items: [
          "Deliver role-specific AML training at induction and annually thereafter",
          "Test comprehension — passing a quiz is a minimum; practical scenario training is better",
          "Ensure the MLRO/compliance function has direct board access",
          "Document a culture of compliance through board minutes and management information reports",
        ],
      },
      {
        type: "h2",
        text: "7. Governance, Controls & Audit",
      },
      {
        type: "ul",
        items: [
          "Appoint a qualified, independent Money Laundering Reporting Officer (MLRO)",
          "Conduct independent AML audits annually (more frequently for high-risk businesses)",
          "Maintain a findings log and remediation tracker",
          "Produce periodic MI reports to senior management covering screening volumes, SAR rates, and open investigations",
        ],
      },
      {
        type: "callout",
        text: "Tip: Use automated platforms like WorldAML Suite to consolidate CDD, sanctions screening, transaction monitoring, and audit trail management in a single environment — reducing manual effort and improving auditability.",
      },
    ],
  },
  {
    slug: "kyc-vs-kyb-differences",
    title: "KYC vs KYB: Key Differences and Why Both Matter",
    description:
      "Understand the critical differences between Know Your Customer (KYC) and Know Your Business (KYB) verification, and why regulated organisations need both to manage onboarding risk.",
    category: "KYC & KYB",
    date: "2025-01-30",
    readTime: 7,
    author: "WorldAML Compliance Team",
    authorTitle: "Compliance Research",
    tags: [
      "KYC",
      "KYB",
      "customer onboarding",
      "identity verification",
      "beneficial ownership",
      "CDD",
    ],
    relatedSlugs: [
      "aml-compliance-checklist-2025",
      "beneficial-ownership-guide",
      "risk-based-approach-aml",
    ],
    content: [
      {
        type: "intro",
        text: "Know Your Customer (KYC) and Know Your Business (KYB) are both mandated by anti-money laundering regulations, yet they serve distinct purposes and involve fundamentally different verification workflows. Confusing or conflating the two leads to compliance gaps — particularly in corporate onboarding.",
      },
      {
        type: "h2",
        text: "What is KYC?",
      },
      {
        type: "p",
        text: "KYC refers to the process of verifying the identity of individual customers. It typically involves collecting and verifying government-issued ID, confirming address, and screening the individual against sanctions, PEP, and adverse media databases. KYC is the standard for consumer-facing financial services.",
      },
      {
        type: "h2",
        text: "What is KYB?",
      },
      {
        type: "p",
        text: "KYB extends the due diligence process to legal entities — companies, partnerships, trusts, and other corporate structures. It requires verifying the entity itself (registration, legal standing, jurisdiction) and then drilling down to identify and verify the Ultimate Beneficial Owners (UBOs) — the individuals who ultimately own or control the business.",
      },
      {
        type: "h2",
        text: "Side-by-Side Comparison",
      },
      {
        type: "table",
        headers: ["Dimension", "KYC", "KYB"],
        rows: [
          ["Subject", "Individual person", "Legal entity (company, trust, etc.)"],
          ["Primary data sources", "Government ID, biometrics, address verification", "Company registries, articles of incorporation, statutory filings"],
          ["Ownership layer", "N/A", "Must identify & verify UBOs (typically ≥25%)"],
          ["Complexity", "Generally lower", "Higher — may involve complex ownership chains"],
          ["Ongoing monitoring", "Re-screen on watchlist update", "Re-screen entity + UBOs; monitor for ownership changes"],
          ["Risk signals", "PEP status, adverse media, sanctions", "UBO risk, jurisdiction, industry, sanctions on directors"],
        ],
      },
      {
        type: "h2",
        text: "Why Both Are Required",
      },
      {
        type: "p",
        text: "Most regulated entities — banks, payment processors, crypto exchanges, FX brokers — serve both individuals and corporate clients. Regulators expect firms to apply appropriate due diligence to both. KYB without KYC on UBOs is incomplete: if a company's beneficial owner is sanctioned, the entity itself is effectively off-limits regardless of its clean corporate registration.",
      },
      {
        type: "h2",
        text: "Key Challenges in KYB",
      },
      {
        type: "ul",
        items: [
          "Complex ownership structures with multi-layered holding companies across jurisdictions",
          "Inconsistent data quality across national business registries",
          "Shell company risk — entities with no real economic activity",
          "Nominee directors obscuring true UBOs",
          "Dynamic ownership changes post-onboarding that go undetected",
        ],
      },
      {
        type: "h2",
        text: "Best Practice: Unified KYC/KYB Workflows",
      },
      {
        type: "p",
        text: "Leading compliance teams unify KYC and KYB into a single onboarding workflow. This means: entity verification triggers automatic UBO extraction, each identified UBO is then run through the same individual KYC flow, and all decisions are logged in a single audit trail. Platforms like WorldAML Suite's KYC/KYB module automate this end-to-end — reducing onboarding time while improving data quality.",
      },
      {
        type: "callout",
        text: "Regulatory note: The EU's 6th Anti-Money Laundering Directive (6AMLD) and the UK's MLRs 2017 (as amended) both require verification of beneficial ownership for corporate customers. Failure to identify and verify UBOs is a common enforcement finding.",
      },
    ],
  },
  {
    slug: "sanctions-screening-best-practices",
    title: "Sanctions Screening Best Practices: Reducing False Positives Without Increasing Risk",
    description:
      "How to tune your sanctions screening programme to minimise false positives, maintain regulatory defensibility, and ensure no genuine hit goes undetected.",
    category: "Sanctions",
    date: "2025-01-14",
    readTime: 8,
    author: "WorldAML Compliance Team",
    authorTitle: "Compliance Research",
    tags: [
      "sanctions screening",
      "OFAC",
      "false positives",
      "watchlist management",
      "fuzzy matching",
      "compliance operations",
    ],
    relatedSlugs: [
      "aml-compliance-checklist-2025",
      "pep-screening-guide",
      "risk-based-approach-aml",
    ],
    content: [
      {
        type: "intro",
        text: "Sanctions screening is one of the highest-stakes operations in a compliance programme. A missed hit can result in criminal liability, multi-million dollar fines, and reputational damage. But excessive false positives create alert fatigue, slow down onboarding, and burn analyst capacity. The goal is precision — catching every genuine hit while managing false positives intelligently.",
      },
      {
        type: "h2",
        text: "The False Positive Problem",
      },
      {
        type: "p",
        text: "Industry studies suggest that between 90% and 99% of sanctions alerts are false positives. At scale, this means thousands of analyst-hours spent on reviews that yield no genuine matches. Alert fatigue increases the risk that analysts dismiss real hits along with false ones.",
      },
      {
        type: "h2",
        text: "1. Use Fuzzy Name Matching — Calibrated Correctly",
      },
      {
        type: "p",
        text: "Exact-match screening is insufficient. Sanctioned individuals often appear on lists with transliterated names, aliases, or name variants. However, overly permissive fuzzy matching generates massive false positive volumes.",
      },
      {
        type: "ul",
        items: [
          "Use phonetic algorithms (Soundex, Metaphone, Double Metaphone) alongside edit-distance matching",
          "Apply different match thresholds by risk tier — stricter for lower-risk customers, broader for high-risk",
          "Include all listed aliases and AKAs in your screening scope, not just primary names",
          "Test your match rates quarterly using known-entity test sets",
        ],
      },
      {
        type: "h2",
        text: "2. Screen Against Comprehensive, Up-to-Date Lists",
      },
      {
        type: "ul",
        items: [
          "OFAC SDN and Consolidated Sanctions List (USA)",
          "EU Consolidated Sanctions List",
          "UN Security Council Consolidated List",
          "HM Treasury Financial Sanctions List (UK)",
          "DFAT Consolidated Sanctions List (Australia)",
          "Regional lists relevant to your business geographies",
        ],
      },
      {
        type: "p",
        text: "List update frequency matters. OFAC can add designations with same-day effect. Ensure your data provider delivers updates within hours, not days.",
      },
      {
        type: "h2",
        text: "3. Document False Positive Decisions",
      },
      {
        type: "p",
        text: "Every false positive decision must be documented with the analyst's rationale. Regulators conducting examinations will review a sample of dismissed alerts. An undocumented dismissal looks indistinguishable from negligence.",
      },
      {
        type: "ul",
        items: [
          "Record the comparison between the alert subject and the listed entity",
          "Note differentiating factors: different date of birth, different nationality, different address",
          "Apply and document a 'safe harbour' approval from a senior analyst for borderline cases",
          "Retain records for minimum 5 years",
        ],
      },
      {
        type: "h2",
        text: "4. Implement Ongoing Monitoring",
      },
      {
        type: "p",
        text: "Screening only at onboarding is insufficient. Sanctions lists change constantly — an existing customer can be designated after onboarding. Ongoing monitoring re-screens your entire customer base whenever lists are updated.",
      },
      {
        type: "h2",
        text: "5. Review and Tune Rules Regularly",
      },
      {
        type: "ul",
        items: [
          "Track false positive rates by list source, customer segment, and name origin",
          "Review threshold settings at least quarterly",
          "Compare your alert-to-SAR conversion rate as a health indicator — too low suggests over-alerting",
          "Engage a third-party reviewer annually to validate your screening methodology",
        ],
      },
      {
        type: "callout",
        text: "WorldAML integrates LexisNexis WorldCompliance® data — one of the most comprehensive commercially available watchlist databases, updated multiple times daily. Combined with configurable match thresholds, it significantly reduces false positive rates while maintaining full regulatory coverage.",
      },
    ],
  },
  {
    slug: "risk-based-approach-aml",
    title: "The Risk-Based Approach to AML: A Practical Implementation Guide",
    description:
      "Learn how to implement a FATF-compliant risk-based approach to AML compliance — from business risk assessments to customer risk scoring and resource allocation.",
    category: "Risk Assessment",
    date: "2025-01-07",
    readTime: 10,
    author: "WorldAML Compliance Team",
    authorTitle: "Compliance Research",
    tags: [
      "risk-based approach",
      "FATF",
      "risk assessment",
      "customer risk scoring",
      "AML",
      "compliance framework",
    ],
    relatedSlugs: [
      "aml-compliance-checklist-2025",
      "kyc-vs-kyb-differences",
      "beneficial-ownership-guide",
    ],
    content: [
      {
        type: "intro",
        text: "The risk-based approach (RBA) is the cornerstone of modern AML regulation. Rather than applying identical controls to every customer and transaction, the RBA requires firms to identify, assess, and understand their specific money laundering and terrorist financing risks — then apply proportionate controls. Regulators globally, following FATF Recommendation 1, now mandate this approach.",
      },
      {
        type: "h2",
        text: "Why the Risk-Based Approach Matters",
      },
      {
        type: "p",
        text: "A rules-based, checklist approach to AML is both inefficient and ineffective. It wastes resources on low-risk customers while potentially missing sophisticated laundering schemes that don't trigger standard rules. The RBA forces firms to think critically about where risk actually lies in their business.",
      },
      {
        type: "h2",
        text: "Step 1: Enterprise-Wide Risk Assessment (EWRA)",
      },
      {
        type: "p",
        text: "The EWRA is the top-level assessment of inherent ML/TF risk across the entire organisation. It considers:",
      },
      {
        type: "ul",
        items: [
          "Customer risk: types of customers served, PEP exposure, high-risk jurisdictions",
          "Product/service risk: cash-intensive products, anonymous payment instruments, correspondent banking",
          "Geographic risk: countries of operation, customer origins, transaction corridors",
          "Delivery channel risk: face-to-face vs. non-face-to-face, digital-only onboarding",
        ],
      },
      {
        type: "h2",
        text: "Step 2: Customer Risk Scoring",
      },
      {
        type: "p",
        text: "Individual customers are assigned a risk score based on factors identified in the EWRA. This drives the level of due diligence applied.",
      },
      {
        type: "table",
        headers: ["Risk Factor", "Low Risk", "High Risk"],
        rows: [
          ["Customer type", "Retail individual, domestic", "Corporate, trust, or legal arrangement"],
          ["Geography", "EU/EEA, UK, US, Australia", "FATF grey/black list country, secrecy jurisdiction"],
          ["PEP status", "Not a PEP", "PEP, PEP family member, or close associate"],
          ["Business activity", "Salaried employment", "Cash-intensive business, cryptocurrency, precious metals"],
          ["Transaction profile", "Regular, predictable amounts", "Irregular, high-value, frequent cross-border"],
        ],
      },
      {
        type: "h2",
        text: "Step 3: Calibrate Controls to Risk",
      },
      {
        type: "ul",
        items: [
          "Low-risk: Simplified Due Diligence (SDD) — verify identity, less frequent reviews",
          "Medium-risk: Standard CDD — full identity verification, annual review cycle",
          "High-risk: Enhanced Due Diligence (EDD) — source of wealth/funds, senior management approval, 6-monthly review",
          "PEPs/Sanctions hits: Dedicated EDD workflow with MLRO approval before onboarding",
        ],
      },
      {
        type: "h2",
        text: "Step 4: Document and Defend Your Methodology",
      },
      {
        type: "p",
        text: "The RBA only works if it is documented. Regulators reviewing your AML programme will ask to see your risk methodology, the scoring criteria, and evidence that high-risk customers received enhanced scrutiny. Undocumented RBA decisions are treated as no RBA at all.",
      },
      {
        type: "h2",
        text: "Automating the Risk-Based Approach",
      },
      {
        type: "p",
        text: "Manual risk scoring is error-prone and difficult to audit. Compliance platforms can automate customer risk scoring at onboarding and continuously recalculate scores as new information comes in — from sanctions re-screens, adverse media hits, or changes in transaction behaviour.",
      },
      {
        type: "callout",
        text: "WorldAML's Risk Assessment module provides automated customer risk scoring with configurable factor weights, full audit trails, and integration with screening and transaction monitoring data — giving compliance teams a defensible, consistent risk classification across their entire customer base.",
      },
    ],
  },
  {
    slug: "beneficial-ownership-guide",
    title: "Beneficial Ownership Verification: Regulatory Requirements and Practical Steps",
    description:
      "A comprehensive guide to beneficial ownership identification and verification — covering EU 6AMLD, UK MLRs, FATF standards, and how to operationalise UBO checks at scale.",
    category: "KYC & KYB",
    date: "2024-12-19",
    readTime: 8,
    author: "WorldAML Compliance Team",
    authorTitle: "Compliance Research",
    tags: [
      "beneficial ownership",
      "UBO",
      "6AMLD",
      "MLRs",
      "FATF",
      "corporate transparency",
      "KYB",
    ],
    relatedSlugs: [
      "kyc-vs-kyb-differences",
      "aml-compliance-checklist-2025",
      "risk-based-approach-aml",
    ],
    content: [
      {
        type: "intro",
        text: "Beneficial ownership transparency is at the heart of the global fight against money laundering, corruption, and tax evasion. Shell companies and complex corporate structures remain the primary vehicles for concealing the proceeds of crime. Identifying and verifying the Ultimate Beneficial Owner (UBO) — the real human being who ultimately owns or controls a corporate entity — is a non-negotiable AML obligation.",
      },
      {
        type: "h2",
        text: "What is a Beneficial Owner?",
      },
      {
        type: "p",
        text: "A beneficial owner is any natural person who ultimately owns or controls a legal entity, typically defined by a shareholding or voting rights threshold. The most common thresholds are:",
      },
      {
        type: "ul",
        items: [
          "25% or more (EU 4th/5th/6AMLD, UK MLRs 2017, FATF standard)",
          "10% or more in some jurisdictions for higher-risk entities or sectors",
          "Any person exercising effective control, regardless of formal shareholding",
          "Senior managing officials as a fallback when no UBO can be identified",
        ],
      },
      {
        type: "h2",
        text: "Regulatory Framework Overview",
      },
      {
        type: "table",
        headers: ["Jurisdiction", "Key Legislation", "UBO Threshold", "Registry"],
        rows: [
          ["European Union", "6AMLD / AML Package 2024", "25%", "National registries (interconnected via BRIS)"],
          ["United Kingdom", "MLRs 2017 (amended)", "25%", "Companies House PSC Register"],
          ["United States", "Corporate Transparency Act 2024", "25% / substantial control", "FinCEN BOI Database"],
          ["Cyprus", "Prevention of Money Laundering Law", "25%", "Registrar of Companies"],
          ["Malta", "PMLFTR (as amended)", "25%", "Malta Business Registry"],
        ],
      },
      {
        type: "h2",
        text: "Steps for UBO Identification",
      },
      {
        type: "ol",
        items: [
          "Obtain constitutional documents (articles of incorporation, partnership agreement, trust deed)",
          "Map the ownership structure — identify all direct shareholders above threshold",
          "For each corporate shareholder, repeat the exercise upward through the chain",
          "Identify any natural person exercising effective control (e.g. via power of attorney, nominee arrangements)",
          "Collect identity documents for every identified UBO",
          "Screen each UBO against sanctions, PEP, and adverse media databases",
          "Apply risk-appropriate due diligence based on UBO profile",
        ],
      },
      {
        type: "h2",
        text: "Common Challenges",
      },
      {
        type: "ul",
        items: [
          "Multi-jurisdictional chains: holding companies spanning 5+ countries requiring research in each registry",
          "Bearer shares: largely prohibited but still exist in some offshore jurisdictions",
          "Trusts and foundations: discretionary trusts may have no fixed beneficial owners",
          "Non-cooperative subjects: entities or individuals who resist providing ownership information",
          "Registry data quality: inconsistencies, outdated filings, and incomplete data",
        ],
      },
      {
        type: "callout",
        text: "WorldAML Suite's KYB module automates UBO extraction from corporate registries across 200+ jurisdictions, delivers pre-built ownership maps, and routes each identified UBO through a full KYC screening workflow — reducing manual research time by up to 80%.",
      },
    ],
  },
  {
    slug: "pep-screening-guide",
    title: "PEP Screening Guide: Who Are PEPs and How to Screen Them Effectively",
    description:
      "Everything compliance teams need to know about Politically Exposed Persons (PEPs) — definitions, risk categories, screening requirements, and how to manage PEP relationships under EU, UK, and FATF standards.",
    category: "AML Compliance",
    date: "2024-12-05",
    readTime: 7,
    author: "WorldAML Compliance Team",
    authorTitle: "Compliance Research",
    tags: [
      "PEP",
      "politically exposed persons",
      "EDD",
      "enhanced due diligence",
      "AML screening",
      "FATF",
    ],
    relatedSlugs: [
      "sanctions-screening-best-practices",
      "aml-compliance-checklist-2025",
      "risk-based-approach-aml",
    ],
    content: [
      {
        type: "intro",
        text: "Politically Exposed Persons (PEPs) represent a higher risk of corruption, bribery, and the laundering of proceeds from public office abuse. Regulators require financial institutions to identify PEPs, apply Enhanced Due Diligence (EDD), and maintain ongoing monitoring for the duration of the relationship — and often for a defined period after a person leaves a PEP role.",
      },
      {
        type: "h2",
        text: "Who is a PEP?",
      },
      {
        type: "p",
        text: "A PEP is any natural person who is, or has been, entrusted with a prominent public function. This typically includes:",
      },
      {
        type: "ul",
        items: [
          "Heads of state or government, senior politicians, government ministers",
          "Senior executives of state-owned enterprises",
          "Senior officials of international organisations (UN, EU, IMF, World Bank)",
          "Senior military officials, judiciary, and law enforcement leadership",
          "Senior central bank officials and members of supreme audit institutions",
        ],
      },
      {
        type: "h2",
        text: "PEP Categories: Foreign, Domestic, and International",
      },
      {
        type: "table",
        headers: ["Category", "Definition", "Risk Level"],
        rows: [
          ["Foreign PEP", "Holds/held senior position in another country's government", "Highest — automatic EDD in most jurisdictions"],
          ["Domestic PEP", "Holds/held senior position in their own country", "High — EDD required; some jurisdictions allow risk-based assessment"],
          ["International Organisation PEP", "Senior role in international body (UN, EU, IMF, etc.)", "High — EDD required"],
          ["PEP Family Member", "Spouse, partner, children, parents, in-laws of a PEP", "High — same EDD requirements as the PEP"],
          ["Close Associate", "Person with known business or social relationships with a PEP", "High — EDD where relationship is beneficial"],
        ],
      },
      {
        type: "h2",
        text: "How Long Does PEP Status Last?",
      },
      {
        type: "p",
        text: "Leaving public office does not immediately eliminate PEP risk. Most frameworks require a 'cooling-off' period during which EDD obligations continue. The EU's AMLD states that firms must consider PEP risk for at least 12 months after leaving office. In practice, many institutions apply risk-based assessments extending to 3–5 years or longer for senior roles.",
      },
      {
        type: "h2",
        text: "Enhanced Due Diligence for PEPs",
      },
      {
        type: "ul",
        items: [
          "Obtain senior management approval before establishing or continuing a relationship",
          "Establish and document the source of wealth (how did they accumulate their assets?)",
          "Establish and document the source of funds for the specific transactions",
          "Conduct enhanced ongoing monitoring — typically semi-annual or quarterly reviews",
          "Screen PEP family members and known close associates",
          "Apply adverse media screening for corruption, bribery, and abuse-of-power allegations",
        ],
      },
      {
        type: "h2",
        text: "PEP List Quality Matters",
      },
      {
        type: "p",
        text: "PEP lists vary enormously in quality and coverage. Some providers cover only current officeholders; others include former officials, family members, and associates. Coverage of officials in Africa, MENA, and Southeast Asia — where PEP risk is often highest — is frequently incomplete in lower-tier data sources.",
      },
      {
        type: "callout",
        text: "WorldAML uses LexisNexis WorldCompliance® data, covering 3+ million PEP profiles across 235 jurisdictions — including family members and close associates. Profiles are reviewed and updated by a global team of data analysts, with changes reflected in real-time screening.",
      },
    ],
  },
];
