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
  /**
   * Optional hero image URL that overrides the auto-generated OG card
   * for this specific post. Must be an absolute https:// URL (recommended
   * 1200x630, <5MB) so LinkedIn/Facebook/Twitter crawlers can fetch it.
   * When omitted, the branded blog-og edge function renders the preview.
   */
  heroImage?: string;
  /** Optional alt text for heroImage; falls back to the post title. */
  heroImageAlt?: string;
}

export interface BlogSection {
  type: "intro" | "h2" | "h3" | "p" | "ul" | "ol" | "callout" | "table";
  text?: string;
  items?: string[];
  headers?: string[];
  rows?: string[][];
}

/**
 * A post goes live on its `date` (UTC calendar day). Future-dated posts stay
 * hidden from the blog, the feed and the Google page list until that day, so a
 * batch of articles can be written ahead and released on a schedule.
 */
export function isPostPublished(post: Pick<BlogPost, "date">, now: Date = new Date()): boolean {
  return post.date <= now.toISOString().slice(0, 10);
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
  // ─── NEW ARTICLES ────────────────────────────────────────────────────────────
  {
    slug: "aml-compliance-crypto-vasp",
    title: "AML Compliance for Crypto Exchanges and VASPs: 2025 Regulatory Guide",
    description:
      "A complete guide to AML/CFT obligations for cryptocurrency exchanges and Virtual Asset Service Providers — covering FATF Travel Rule, MiCA, FinCEN requirements, and best-practice compliance frameworks.",
    category: "AML Compliance",
    date: "2025-03-01",
    readTime: 11,
    author: "WorldAML Compliance Team",
    authorTitle: "Compliance Research",
    tags: ["crypto", "VASP", "Travel Rule", "MiCA", "FinCEN", "FATF", "AML"],
    relatedSlugs: ["sanctions-screening-best-practices", "kyc-vs-kyb-differences", "aml-compliance-checklist-2025"],
    content: [
      {
        type: "intro",
        text: "Virtual Asset Service Providers (VASPs) — including cryptocurrency exchanges, custodial wallet providers, and crypto-to-fiat conversion platforms — are now subject to the same AML/CFT obligations as traditional financial institutions in most major jurisdictions. With FATF's Recommendation 15, the EU's MiCA Regulation, and FinCEN's enforcement posture all tightening simultaneously, crypto compliance is one of the most demanding areas in financial crime prevention.",
      },
      { type: "h2", text: "What Makes Crypto AML Different?" },
      {
        type: "p",
        text: "The pseudonymous nature of blockchain transactions, the global and borderless character of crypto flows, and the speed of settlement all create unique AML challenges. However, the underlying regulatory obligations are the same as traditional finance: know your customer, monitor transactions, report suspicious activity, and screen against sanctions lists.",
      },
      { type: "h2", text: "FATF Recommendation 15 and the Travel Rule" },
      {
        type: "p",
        text: "FATF's updated Recommendation 15 explicitly applies the Travel Rule to VASPs. Under the Travel Rule, any VASP transmitting a virtual asset transfer of USD/EUR 1,000 or more must collect and transmit originator and beneficiary information — mirroring the wire transfer rules that apply to banks.",
      },
      {
        type: "ul",
        items: [
          "Originator information: name, account identifier (wallet address or account number), and physical address",
          "Beneficiary information: name and account identifier",
          "Information must be transmitted to the beneficiary VASP simultaneously with the transaction",
          "Both VASPs must verify the information and screen it against sanctions and watchlists",
          "Transactions with non-compliant or unhosted wallets require additional due diligence",
        ],
      },
      { type: "h2", text: "EU MiCA Regulation: Key AML Implications" },
      {
        type: "p",
        text: "The EU's Markets in Crypto-Assets (MiCA) Regulation, fully applicable from December 2024, brings CASPs (Crypto-Asset Service Providers) fully within the EU AML framework. CASPs must be licensed in an EU member state and comply with the full suite of AML/CFT obligations under the EU's Transfer of Funds Regulation (ToFR), which implements the Travel Rule.",
      },
      { type: "h2", text: "US Requirements: FinCEN and OFAC" },
      {
        type: "ul",
        items: [
          "VASPs operating in the US or serving US persons must register as Money Services Businesses (MSBs) with FinCEN",
          "Bank Secrecy Act (BSA) obligations apply: KYC, SAR filing, CTR filing above $10,000",
          "OFAC has demonstrated willingness to sanction non-compliant VASPs — Binance ($4.3bn settlement, 2023) being the most prominent example",
          "The DOGE/crypto ecosystem does not create safe harbour from sanctions obligations",
        ],
      },
      { type: "h2", text: "Customer Risk Categories for VASPs" },
      {
        type: "table",
        headers: ["Customer Type", "Risk Level", "Required Controls"],
        rows: [
          ["Retail individual, verified identity, domestic", "Low–Medium", "Standard CDD, transaction monitoring"],
          ["High-volume trader, cross-border", "Medium–High", "Enhanced monitoring, source of funds"],
          ["Corporate entity with complex structure", "High", "Full KYB, UBO verification, EDD"],
          ["Unhosted wallet transactions above threshold", "High", "Enhanced due diligence, counterparty assessment"],
          ["PEP or sanctioned jurisdiction connection", "Very High", "EDD, senior approval, possible refusal"],
        ],
      },
      { type: "h2", text: "Transaction Monitoring for Crypto" },
      {
        type: "p",
        text: "On-chain analytics tools (e.g. Chainalysis, Elliptic) can trace the provenance of funds across the blockchain. VASPs should integrate these tools to flag transactions involving: darknet markets, mixer/tumbler services, sanctioned addresses, and high-risk jurisdictions.",
      },
      {
        type: "callout",
        text: "WorldAML Suite provides VASPs with a complete AML compliance stack: KYC/KYB onboarding, sanctions and PEP screening with LexisNexis WorldCompliance® data, transaction monitoring, and regulatory reporting — all accessible via API for native integration into your exchange or wallet infrastructure.",
      },
    ],
  },
  {
    slug: "igaming-aml-obligations",
    title: "iGaming AML Obligations: What Online Gambling Operators Must Do",
    description:
      "A practical guide to AML compliance for online gambling and iGaming operators — covering customer due diligence, source of funds checks, transaction monitoring, and the EU and UK regulatory frameworks.",
    category: "AML Compliance",
    date: "2025-02-22",
    readTime: 9,
    author: "WorldAML Compliance Team",
    authorTitle: "Compliance Research",
    tags: ["iGaming", "gambling", "AML", "source of funds", "UK Gambling Commission", "EU AML"],
    relatedSlugs: ["kyc-vs-kyb-differences", "risk-based-approach-aml", "pep-screening-guide"],
    content: [
      {
        type: "intro",
        text: "The online gambling sector is a high-risk industry for money laundering, and regulators in the UK, EU, and internationally have consistently identified iGaming as a priority target for AML enforcement. Operators that fail to implement adequate controls face licence revocation, multi-million-pound fines, and in some cases criminal prosecution of senior officers. This guide sets out the key AML obligations for online gambling operators.",
      },
      { type: "h2", text: "Why iGaming is High-Risk for Money Laundering" },
      {
        type: "ul",
        items: [
          "Large volumes of frequent small transactions can obscure the origin of funds",
          "Bonus abuse and chip dumping can be used to legitimise criminal proceeds",
          "Cross-border customer bases create complex jurisdictional overlaps",
          "Withdrawals of 'winnings' provide an apparent legitimate source of funds",
          "Cash-based top-ups and cryptocurrency deposits add anonymity risks",
        ],
      },
      { type: "h2", text: "UK Gambling Commission Requirements" },
      {
        type: "p",
        text: "In the UK, the Gambling Commission's Licence Conditions and Codes of Practice (LCCP) require all licensed operators to implement an AML/CTF programme meeting the Proceeds of Crime Act 2002 and Terrorism Act 2000 requirements, underpinned by the Money Laundering, Terrorist Financing and Transfer of Funds Regulations 2017.",
      },
      {
        type: "ul",
        items: [
          "Conduct a business-level ML/TF risk assessment, reviewed annually",
          "Apply Customer Due Diligence (CDD) at the point of establishing a business relationship",
          "Apply Enhanced Due Diligence (EDD) for high-risk customers — trigger-based and periodic",
          "Conduct source of funds checks when customers reach defined spend thresholds",
          "Screen all customers against sanctions lists and PEP databases",
          "Monitor for suspicious transaction patterns and file Suspicious Activity Reports (SARs)",
        ],
      },
      { type: "h2", text: "Source of Funds: The Central Challenge" },
      {
        type: "p",
        text: "Source of funds (SOF) checks are the defining challenge of iGaming AML. Operators must determine how a customer generated the funds they are using to gamble — not just where the funds came from in the most recent transaction. Acceptable SOF evidence includes payslips, bank statements, tax returns, property sale proceeds, or inheritance documentation.",
      },
      { type: "h2", text: "Trigger-Based vs. Continuous Monitoring" },
      {
        type: "table",
        headers: ["Approach", "Description", "When to Use"],
        rows: [
          ["Trigger-based EDD", "Enhanced checks triggered by cumulative spend threshold or behavioural flag", "Initial high-spend episodes, unusual deposit patterns"],
          ["Periodic review", "Scheduled re-assessment of customer risk profile", "Annual for standard customers; quarterly for high-risk"],
          ["Continuous monitoring", "Automated real-time monitoring of all transactions against risk rules", "All customers throughout the lifecycle"],
          ["Account-level profiling", "Behavioural baselines with deviation alerts", "Detecting anomalous play patterns linked to ML risk"],
        ],
      },
      { type: "h2", text: "The EU AML Package and iGaming" },
      {
        type: "p",
        text: "The EU's new AML Package, including the establishment of the Anti-Money Laundering Authority (AMLA), extends enhanced oversight to the gambling sector. Under the new AMLD, gambling services are explicitly listed as obliged entities, requiring full CDD, record-keeping, and reporting obligations. Member states must implement the requirements by 2027.",
      },
      {
        type: "callout",
        text: "WorldAML Suite is deployed by leading iGaming operators to automate KYC onboarding, conduct real-time sanctions and PEP screening, monitor transaction patterns, and produce SAR-ready documentation — enabling compliance at scale without friction to the customer experience.",
      },
    ],
  },
  {
    slug: "mlro-responsibilities-obligations",
    title: "MLRO Responsibilities and Obligations: A Complete Guide for Money Laundering Reporting Officers",
    description:
      "Everything a Money Laundering Reporting Officer (MLRO) needs to know — legal obligations, SAR filing duties, governance responsibilities, and how to build a defensible compliance function.",
    category: "AML Compliance",
    date: "2025-02-10",
    readTime: 10,
    author: "WorldAML Compliance Team",
    authorTitle: "Compliance Research",
    tags: ["MLRO", "Money Laundering Reporting Officer", "SAR", "governance", "compliance officer", "AML"],
    relatedSlugs: ["aml-compliance-checklist-2025", "risk-based-approach-aml", "pep-screening-guide"],
    content: [
      {
        type: "intro",
        text: "The Money Laundering Reporting Officer (MLRO) is the individual legally responsible for a firm's AML compliance programme. In the UK and across the EU, the MLRO role carries personal legal liability — making it one of the most consequential compliance appointments in any regulated firm. This guide sets out what MLROs must know, what they must do, and how to build a compliance function that protects both the firm and themselves personally.",
      },
      { type: "h2", text: "Who Must Appoint an MLRO?" },
      {
        type: "p",
        text: "Any firm subject to AML regulations must appoint a nominated officer (the MLRO). In the UK, this is a requirement under the Money Laundering Regulations 2017 and the Proceeds of Crime Act 2002. The FCA and PRA require the MLRO to be an approved person, registered under the SMF17 Senior Management Function.",
      },
      { type: "h2", text: "Core Legal Obligations of the MLRO" },
      {
        type: "ul",
        items: [
          "Receive and evaluate all internal Suspicious Activity Reports (SARs) from staff",
          "Determine whether to submit an external SAR to the National Crime Agency (NCA) in the UK or relevant FIU in other jurisdictions",
          "Obtain a 'consent decision' from the NCA before proceeding with a transaction where consent is required",
          "Maintain records of all internal SARs, decisions made, and rationale",
          "Ensure AML policies, controls, and procedures are documented, implemented, and effective",
          "Produce an annual MLRO report to the board covering the firm's AML programme effectiveness",
        ],
      },
      { type: "h2", text: "Personal Liability: What MLROs Must Know" },
      {
        type: "p",
        text: "The MLRO can be personally prosecuted for failing to disclose knowledge or suspicion of money laundering. Under section 330 of the Proceeds of Crime Act 2002 (UK), a nominated officer who fails to make a required disclosure is guilty of a criminal offence. This is not delegatable — the MLRO must personally evaluate SARs and make disclosure decisions.",
      },
      { type: "h2", text: "The SAR Decision Framework" },
      {
        type: "ol",
        items: [
          "Receive internal report from staff member",
          "Review the report and gather supporting evidence",
          "Assess: does this constitute knowledge or suspicion of money laundering or terrorist financing?",
          "If yes: submit external SAR to the FIU; obtain consent if required before proceeding",
          "If no: document the rationale for non-disclosure clearly",
          "Record the decision and retain for minimum 5 years",
        ],
      },
      { type: "h2", text: "Governance: The MLRO's Role at Board Level" },
      {
        type: "p",
        text: "Effective MLROs are not back-office functions. They must have direct access to the board and senior management, the authority to halt transactions, and the resources to do their job. The annual MLRO report to the board should include: SAR volumes and trends, screening metrics, training completion rates, audit findings, and emerging regulatory risks.",
      },
      { type: "h2", text: "Technology and the Modern MLRO" },
      {
        type: "p",
        text: "The volume of alerts generated by modern transaction monitoring and screening systems makes manual review impossible at scale. MLROs increasingly rely on compliance platforms to triage alerts, prioritise high-risk cases, and maintain audit trails that demonstrate the quality of their decision-making to regulators.",
      },
      {
        type: "callout",
        text: "WorldAML Suite provides MLROs with a unified compliance dashboard covering sanctions screening, KYC/KYB case management, transaction monitoring alerts, and a full audit trail — giving the evidence base needed to satisfy regulatory scrutiny and produce credible board reporting.",
      },
    ],
  },
  {
    slug: "edd-vs-sdd-enhanced-simplified-due-diligence",
    title: "EDD vs SDD: When to Apply Enhanced or Simplified Due Diligence",
    description:
      "A clear guide to Enhanced Due Diligence (EDD) and Simplified Due Diligence (SDD) — when each applies, what steps are required, and how to document your decisions to satisfy regulators.",
    category: "KYC & KYB",
    date: "2025-01-20",
    readTime: 8,
    author: "WorldAML Compliance Team",
    authorTitle: "Compliance Research",
    tags: ["EDD", "SDD", "Enhanced Due Diligence", "Simplified Due Diligence", "CDD", "KYC", "AML"],
    relatedSlugs: ["risk-based-approach-aml", "pep-screening-guide", "kyc-vs-kyb-differences"],
    content: [
      {
        type: "intro",
        text: "Customer due diligence is not one-size-fits-all. The risk-based approach requires firms to calibrate the level of due diligence applied to the actual risk posed by each customer relationship. At the extremes of the risk spectrum, Enhanced Due Diligence (EDD) and Simplified Due Diligence (SDD) represent fundamentally different levels of scrutiny — each with distinct legal requirements and documentation obligations.",
      },
      { type: "h2", text: "The CDD Spectrum" },
      {
        type: "table",
        headers: ["Level", "When Applied", "Key Requirements"],
        rows: [
          ["Simplified Due Diligence (SDD)", "Low-risk customers and relationships", "Reduced verification; less frequent reviews; still requires basic ID check"],
          ["Standard CDD", "Default for most customers", "Full identity verification, UBO identification, ongoing monitoring"],
          ["Enhanced Due Diligence (EDD)", "High-risk customers, PEPs, high-risk jurisdictions", "Source of wealth/funds, senior approval, enhanced monitoring, more frequent reviews"],
        ],
      },
      { type: "h2", text: "When is Simplified Due Diligence Permitted?" },
      {
        type: "p",
        text: "SDD can only be applied where a firm has assessed and documented that the customer relationship presents a genuinely low risk of money laundering or terrorist financing. Regulatory frameworks specify categories where SDD may be permissible:",
      },
      {
        type: "ul",
        items: [
          "Regulated financial institutions in low-risk jurisdictions",
          "Listed companies subject to disclosure requirements in recognised markets",
          "Public authorities and government bodies",
          "Low-value, low-risk financial products (e.g. basic savings accounts with strict limits)",
        ],
      },
      {
        type: "callout",
        text: "Critical: SDD is never a complete exemption from CDD. Even where SDD applies, you must still conduct identity verification and monitor the relationship for suspicious activity. Applying SDD to a customer who presents high-risk indicators is a serious AML failure.",
      },
      { type: "h2", text: "When is Enhanced Due Diligence Mandatory?" },
      {
        type: "p",
        text: "EDD is mandatory — not discretionary — in a number of situations specified by AML legislation. In the UK and EU, EDD is automatically required for:",
      },
      {
        type: "ul",
        items: [
          "Politically Exposed Persons (PEPs), their family members, and close associates",
          "Customers from FATF grey-listed or black-listed jurisdictions",
          "Correspondent banking relationships",
          "Non-face-to-face business relationships where other risk factors are present",
          "Complex transactions with no apparent economic or lawful purpose",
          "Any customer where the firm's risk assessment indicates high ML/TF risk",
        ],
      },
      { type: "h2", text: "What EDD Actually Requires" },
      {
        type: "ol",
        items: [
          "Obtain senior management (or board) approval before establishing or continuing the relationship",
          "Establish and document the source of wealth (how did the customer accumulate their assets?)",
          "Establish and document the source of funds for the specific transactions or relationship",
          "Conduct enhanced ongoing monitoring — typically quarterly or semi-annual reviews vs. annual for standard CDD",
          "Apply more detailed scrutiny to the nature and purpose of the business relationship",
          "Document all EDD measures taken and the rationale for the risk assessment",
        ],
      },
      { type: "h2", text: "Documenting Your Decisions" },
      {
        type: "p",
        text: "Both SDD and EDD decisions must be fully documented. Regulators examining your AML programme will specifically look for evidence that: (a) your risk methodology justified the SDD or EDD decision, (b) the appropriate level of verification was actually performed, and (c) the decision was reviewed and remains appropriate. An undocumented EDD decision is treated as no EDD at all.",
      },
      {
        type: "callout",
        text: "WorldAML Suite's Risk Assessment module automates risk scoring at onboarding and triggers the appropriate CDD workflow — SDD, standard, or EDD — based on your configured risk criteria, with a full audit trail of every decision for regulatory examination.",
      },
    ],
  },
  {
    slug: "fatf-travel-rule-explained",
    title: "The FATF Travel Rule Explained: Obligations for VASPs and Financial Institutions",
    description:
      "A practical explainer on the FATF Travel Rule — what information must travel with wire transfers and crypto transactions, which firms are affected, and how to achieve compliance.",
    category: "Regulatory Updates",
    date: "2025-03-05",
    readTime: 8,
    author: "WorldAML Compliance Team",
    authorTitle: "Compliance Research",
    tags: ["Travel Rule", "FATF", "VASP", "wire transfer", "crypto compliance", "originator information"],
    relatedSlugs: ["aml-compliance-crypto-vasp", "sanctions-screening-best-practices", "aml-compliance-checklist-2025"],
    content: [
      {
        type: "intro",
        text: "The FATF Travel Rule — so called because customer information 'travels' with the transaction — is one of the most technically complex compliance obligations in modern financial regulation. Originally established for traditional wire transfers in FATF Recommendation 16, it was extended to Virtual Asset Service Providers in the 2019 update to Recommendation 15. Compliance requires not just policy but technical infrastructure to capture, transmit, and verify the required data.",
      },
      { type: "h2", text: "What is the Travel Rule?" },
      {
        type: "p",
        text: "The Travel Rule requires that certain customer information accompanies funds transfers above the threshold amount (USD/EUR 1,000 for wire transfers; USD/EUR 1,000 for virtual asset transfers). Both the sending and receiving institution bear compliance obligations.",
      },
      { type: "h2", text: "Who Must Comply?" },
      {
        type: "ul",
        items: [
          "Banks and financial institutions making or receiving wire transfers",
          "Virtual Asset Service Providers (VASPs) — exchanges, custodial wallets, brokers",
          "Payment processors facilitating fund transfers",
          "In most jurisdictions, obligations apply when either the sender or receiver is located in the jurisdiction",
        ],
      },
      { type: "h2", text: "What Information Must Travel?" },
      {
        type: "table",
        headers: ["Party", "Required Information", "Threshold"],
        rows: [
          ["Originator (sender)", "Full name, account number/wallet address, physical address (or national ID / date+place of birth)", "All transfers ≥ USD/EUR 1,000"],
          ["Beneficiary (recipient)", "Full name, account number/wallet address", "All transfers ≥ USD/EUR 1,000"],
          ["Below threshold transfers", "Name and account number only", "Transfers < USD/EUR 1,000"],
        ],
      },
      { type: "h2", text: "The VASP-Specific Challenge" },
      {
        type: "p",
        text: "For VASPs, the Travel Rule introduces a fundamental technical problem: the blockchain protocol does not carry identity metadata. To comply, VASPs must use off-chain Travel Rule messaging solutions — protocols like TRISA, OpenVASP, or commercial solutions from Notabene, Sygna, or Shyft — to exchange the required information separately from the on-chain transaction.",
      },
      { type: "h2", text: "Unhosted Wallets" },
      {
        type: "p",
        text: "Transactions involving unhosted (self-custodied) wallets — where no VASP is on the other side — present particular challenges. FATF guidance requires VASPs to apply risk-based measures when dealing with unhosted wallets, which may include wallet ownership verification and enhanced transaction monitoring for high-value transfers.",
      },
      { type: "h2", text: "Jurisdictional Implementation" },
      {
        type: "ul",
        items: [
          "EU: Transfer of Funds Regulation (ToFR) — effective December 2024, covers all VASPs and CASPs",
          "UK: FCA Travel Rule (SI 2022/1368) — effective September 2023",
          "US: FinCEN's 'Funds Travel Rule' (31 CFR 103.33) — applies to bank wire transfers; VASP rulemaking ongoing",
          "Switzerland: FINMA circular 2022/1 — comprehensive Travel Rule implementation for VASPs",
          "Singapore: MAS PSN02 — Travel Rule requirements for Digital Payment Token service providers",
        ],
      },
      {
        type: "callout",
        text: "WorldAML's API integrates with leading Travel Rule messaging protocols, enabling VASPs to automate originator/beneficiary data exchange, validate counterparty information, and maintain a complete audit trail of Travel Rule compliance events.",
      },
    ],
  },
  {
    slug: "transaction-monitoring-red-flags",
    title: "Transaction Monitoring Red Flags: 25 Indicators of Suspicious Activity",
    description:
      "A reference guide to the most important transaction monitoring red flags for AML compliance — covering structuring, layering, high-risk geography indicators, and sector-specific patterns.",
    category: "AML Compliance",
    date: "2025-02-05",
    readTime: 9,
    author: "WorldAML Compliance Team",
    authorTitle: "Compliance Research",
    tags: ["transaction monitoring", "red flags", "suspicious activity", "SAR", "AML", "money laundering"],
    relatedSlugs: ["aml-compliance-checklist-2025", "risk-based-approach-aml", "mlro-responsibilities-obligations"],
    content: [
      {
        type: "intro",
        text: "Transaction monitoring is the engine of any AML programme — but it is only as good as the red flags it is configured to detect. Knowing which indicators are most likely to reflect genuine money laundering activity, and distinguishing them from legitimate unusual transactions, is both an art and a science. This reference guide collects 25 of the most operationally significant red flags, organised by money laundering stage.",
      },
      { type: "h2", text: "Placement Stage Red Flags" },
      {
        type: "p",
        text: "Placement is the first stage of money laundering — introducing illicit cash into the financial system.",
      },
      {
        type: "ul",
        items: [
          "Multiple cash deposits just below reporting thresholds on successive days (structuring/smurfing)",
          "Cash deposits inconsistent with the customer's known business activity or income profile",
          "Third-party cash deposits — unrelated individuals depositing cash on behalf of the account holder",
          "Sudden large cash deposits with no prior transaction history",
          "Use of multiple branches or ATMs in the same day for deposits",
          "Commingling: mixing legitimate business revenue with suspected illicit funds",
        ],
      },
      { type: "h2", text: "Layering Stage Red Flags" },
      {
        type: "p",
        text: "Layering involves moving funds through complex transactions to disguise their origin.",
      },
      {
        type: "ul",
        items: [
          "Rapid movement of funds through multiple accounts (round-tripping) with no business purpose",
          "Transactions with no apparent economic rationale — funds in and out within hours",
          "Use of shell companies or holding structures with no apparent operating activity",
          "Frequent international wire transfers to or from high-risk jurisdictions",
          "Large payments to law firms, accountants, or real estate agents inconsistent with the relationship",
          "Use of cryptocurrency to convert bank funds, then reconvert to fiat elsewhere",
          "Numerous small transactions from multiple sources aggregating to a large amount",
        ],
      },
      { type: "h2", text: "Integration Stage Red Flags" },
      {
        type: "p",
        text: "Integration is where laundered funds re-enter the legitimate economy.",
      },
      {
        type: "ul",
        items: [
          "High-value asset purchases (real estate, luxury goods, art) inconsistent with customer income",
          "Loan repayment using funds from an unrelated third party",
          "Overpayment of taxes or invoices followed by refund requests",
          "Incoming large transfers labelled as 'loans' or 'gifts' with no supporting documentation",
          "Business revenue patterns inconsistent with the industry (e.g. retail business with no weekday transactions)",
        ],
      },
      { type: "h2", text: "High-Risk Geography Indicators" },
      {
        type: "ul",
        items: [
          "Transactions involving FATF grey-listed or black-listed jurisdictions",
          "Correspondent banking flows through jurisdictions with weak AML regimes",
          "IP address or device location inconsistent with stated customer address",
          "Transactions routed through jurisdictions with no apparent business connection",
        ],
      },
      { type: "h2", text: "Behavioural Red Flags" },
      {
        type: "ul",
        items: [
          "Customer unusually knowledgeable about reporting thresholds",
          "Customer reluctant to provide source of funds or source of wealth documentation",
          "Significant change in transaction volume or pattern following regulatory enquiry",
          "Customer requests for unusual transaction structures that seem designed to avoid records",
        ],
      },
      { type: "h2", text: "Calibrating Your Monitoring Rules" },
      {
        type: "p",
        text: "Red flags are only useful if your monitoring system is calibrated to detect them proportionately. Monitoring every deviation from baseline generates unmanageable alert volumes. Use a risk-based approach: apply tighter thresholds and more sensitive rules to high-risk customer segments, while using broader thresholds for verified, low-risk customers.",
      },
      {
        type: "callout",
        text: "WorldAML's Transaction Monitoring module provides a pre-built library of scenario-based rules mapped to FATF and FINCEN red flag typologies, with configurable thresholds by customer risk tier — reducing false positive rates while maintaining comprehensive coverage.",
      },
    ],
  },
  {
    slug: "adverse-media-screening-guide",
    title: "Adverse Media Screening: Why Negative News Checks Are Essential for AML",
    description:
      "A comprehensive guide to adverse media screening in AML compliance — what it is, why it matters, how to implement it, and what the regulators expect.",
    category: "AML Compliance",
    date: "2025-01-12",
    readTime: 7,
    author: "WorldAML Compliance Team",
    authorTitle: "Compliance Research",
    tags: ["adverse media", "negative news screening", "AML", "KYC", "reputational risk", "EDD"],
    relatedSlugs: ["pep-screening-guide", "risk-based-approach-aml", "edd-vs-sdd-enhanced-simplified-due-diligence"],
    content: [
      {
        type: "intro",
        text: "Adverse media screening — also called negative news screening — is the systematic search for negative information about a customer or counterparty in news sources, public records, and online databases. It is an increasingly important component of both KYC onboarding and ongoing monitoring, providing intelligence that sanctions lists and PEP databases alone cannot capture.",
      },
      { type: "h2", text: "Why Adverse Media Matters" },
      {
        type: "p",
        text: "Sanctions lists are reactive — they designate individuals after an enforcement action. A major fraudster, corrupt official, or money launderer may be well-known in press reports long before they appear on a formal watchlist. Adverse media screening closes this gap, providing an early warning signal that allows compliance teams to escalate due diligence before formal designation occurs.",
      },
      { type: "h2", text: "What Adverse Media Covers" },
      {
        type: "ul",
        items: [
          "Criminal proceedings: arrest, prosecution, conviction, or suspected involvement in crime",
          "Financial crime: fraud, Ponzi schemes, bribery, corruption, insider trading",
          "Regulatory sanctions: FCA/SEC/FINRA enforcement actions, regulatory bans, licence revocations",
          "Terrorism and extremism: association with listed or suspected terrorist organisations",
          "Human rights violations: trafficking, forced labour, serious human rights abuses",
          "Reputational risk: controversies not rising to criminal level but relevant to the relationship",
        ],
      },
      { type: "h2", text: "Regulatory Expectation" },
      {
        type: "p",
        text: "The EU's AMLD framework, the UK MLRs, and FATF guidance all reference adverse media as a component of EDD, particularly for PEPs and high-risk customers. The FCA's Financial Crime Guide (FCG) explicitly states that adverse media checks form part of a robust customer risk assessment. Regulators expect adverse media to be checked at onboarding and on an ongoing basis.",
      },
      { type: "h2", text: "Challenges in Adverse Media Screening" },
      {
        type: "ul",
        items: [
          "Name disambiguation: common names generate thousands of unrelated results",
          "Language barriers: relevant negative news may be in local languages not covered by English-only searches",
          "Source reliability: not all media is credible — tabloids and politically motivated outlets can generate false positives",
          "Coverage gaps: regional and local media in emerging markets is frequently not indexed",
          "Alert volume: manual Google searches are not scalable; automated tools are essential",
        ],
      },
      { type: "h2", text: "Building an Adverse Media Programme" },
      {
        type: "ol",
        items: [
          "Define your adverse media categories — which types of negative information are material to your risk assessment",
          "Select a data source covering global media, court records, regulatory databases, and local news in your key markets",
          "Configure screening triggers: at onboarding, when risk tier changes, and on ongoing monitoring schedule",
          "Establish a review and escalation workflow: who reviews hits, what evidence is required to dismiss, who approves escalation",
          "Document all screening decisions with rationale — regulators will sample your dismissed alerts",
          "Integrate adverse media findings into your customer risk score",
        ],
      },
      {
        type: "callout",
        text: "WorldAML integrates LexisNexis WorldCompliance® adverse media data covering 100+ languages and thousands of sources globally — including court records, regulatory notices, and regional media not accessible through standard search engines.",
      },
    ],
  },
  {
    slug: "fatca-crs-reporting-guide",
    title: "FATCA and CRS Reporting: Obligations for Financial Institutions",
    description:
      "A practical guide to FATCA and Common Reporting Standard (CRS) compliance — who must report, what information is required, key deadlines, and how to avoid the most common reporting failures.",
    category: "Regulatory Updates",
    date: "2025-01-05",
    readTime: 9,
    author: "WorldAML Compliance Team",
    authorTitle: "Compliance Research",
    tags: ["FATCA", "CRS", "Common Reporting Standard", "tax compliance", "AEOI", "OECD", "regulatory reporting"],
    relatedSlugs: ["aml-compliance-checklist-2025", "kyc-vs-kyb-differences", "beneficial-ownership-guide"],
    content: [
      {
        type: "intro",
        text: "FATCA (Foreign Account Tax Compliance Act) and the OECD's Common Reporting Standard (CRS) together form the backbone of the global Automatic Exchange of Information (AEOI) regime. Financial institutions in over 100 jurisdictions are required to identify accounts held by foreign tax residents, collect prescribed information, and report it to their local tax authority annually for onward transmission to partner jurisdictions. Non-compliance carries substantial penalties.",
      },
      { type: "h2", text: "FATCA vs CRS: Key Differences" },
      {
        type: "table",
        headers: ["Dimension", "FATCA", "CRS"],
        rows: [
          ["Origin", "US law (2010)", "OECD standard (2014), legally implemented by each jurisdiction"],
          ["Scope", "US persons holding accounts at foreign financial institutions", "Tax residents of participating jurisdictions holding accounts abroad"],
          ["Reporting to", "IRS (directly or via local tax authority)", "Local tax authority → exchange with partner jurisdictions"],
          ["Participating countries", "Bilateral IGA agreements (~100+ jurisdictions)", "~120 participating jurisdictions (multilateral)"],
          ["Penalties (US)", "30% withholding on US-source income for non-compliant FFIs", "Jurisdiction-specific; typically substantial fines"],
          ["Due diligence threshold", "Aggregate balance > USD 50,000 (individual); USD 250,000 (entity)", "Generally no minimum threshold"],
        ],
      },
      { type: "h2", text: "Who Must Comply?" },
      {
        type: "p",
        text: "The reporting obligation falls on Foreign Financial Institutions (FFIs) under FATCA and Reporting Financial Institutions (RFIs) under CRS. These include:",
      },
      {
        type: "ul",
        items: [
          "Banks, credit unions, and depository institutions",
          "Custodial institutions (holding financial assets for others)",
          "Investment entities, including fund managers and asset managers",
          "Specified insurance companies with cash-value products",
          "Certain holding companies and treasury centres",
        ],
      },
      { type: "h2", text: "The Due Diligence Process" },
      {
        type: "ol",
        items: [
          "Identify all account holders and classify by account type (individual or entity)",
          "Apply self-certification forms (W-9 for US persons; CRS self-cert for other jurisdictions)",
          "Cross-reference self-certifications against account data and known indicia (addresses, phone numbers, standing instructions)",
          "Perform enhanced due diligence for high-value individual accounts (> USD 1M for FATCA)",
          "Document findings and maintain records for a minimum of 6 years",
          "Report required information annually to the relevant tax authority",
        ],
      },
      { type: "h2", text: "Key Reporting Deadlines" },
      {
        type: "p",
        text: "Reporting deadlines vary by jurisdiction, but the standard pattern for CRS is reporting by 31 May or 30 June of the year following the reporting period. FATCA reporting in most IGA jurisdictions follows the same calendar. Late reporting, incorrect filings, and failure to report attract penalties that vary significantly by jurisdiction — from warnings in some countries to substantial per-account fines in others.",
      },
      { type: "h2", text: "Common Reporting Failures" },
      {
        type: "ul",
        items: [
          "Failure to obtain self-certifications at account opening",
          "Accepting self-certifications that are inconsistent with other known information",
          "Incorrect entity classification — misidentifying a passive NFE as an active NFE",
          "Missing controlling person information for passive NFEs",
          "Failure to re-document accounts when indicia of foreign tax residency emerge",
          "Incorrect jurisdiction codes or TIN formats in reporting files",
        ],
      },
      {
        type: "callout",
        text: "WorldAML's Regulatory Reporting module automates FATCA and CRS due diligence workflows, self-certification tracking, and reporting file generation — reducing the manual burden of annual AEOI submissions while ensuring accuracy and auditability.",
      },
    ],
  },

  // ─── NEW POST 1 ───────────────────────────────────────────────────────────
  {
    slug: "aml-real-estate-property-transactions",
    title: "AML for Real Estate Agents: Obligations, Red Flags, and Compliance Workflows",
    description:
      "Real estate is one of the highest-risk sectors for money laundering. This guide covers AML obligations for estate agents, property transaction red flags, CDD requirements, and how to build a compliant onboarding workflow.",
    category: "AML Compliance",
    date: "2025-03-08",
    readTime: 11,
    author: "WorldAML Compliance Team",
    authorTitle: "Compliance Research",
    tags: [
      "real estate AML",
      "property transactions",
      "estate agents",
      "CDD",
      "beneficial ownership",
      "FATF",
      "money laundering",
    ],
    relatedSlugs: [
      "aml-compliance-checklist-2025",
      "beneficial-ownership-guide",
      "kyc-vs-kyb-differences",
    ],
    content: [
      {
        type: "intro",
        text: "Real estate is consistently identified by the Financial Action Task Force (FATF) as one of the most significant money laundering vulnerabilities globally. High transaction values, complex ownership structures, and the relative opacity of property markets make them attractive channels for illicit funds. For estate agents, developers, and property professionals, AML obligations are no longer optional — they are legally mandated and increasingly enforced.",
      },
      {
        type: "h2",
        text: "Why Real Estate Is High-Risk for Money Laundering",
      },
      {
        type: "p",
        text: "Property transactions are uniquely attractive for money launderers for several reasons. A single transaction can move millions of dollars in a single, relatively unremarkable deal. Unlike financial accounts, property ownership can be obscured through shell companies, nominee owners, trusts, and multi-layered corporate structures — many of which are domiciled in secrecy jurisdictions. Rental income then provides a legitimate-looking revenue stream to further integrate illicit proceeds.",
      },
      {
        type: "p",
        text: "FATF's 2022 guidance on real estate highlighted that the sector is exploited across all three stages of the money laundering cycle: placement (purchasing property with illicit cash), layering (selling and re-selling to create transaction distance), and integration (generating rental income or capital gains that appear legitimate).",
      },
      {
        type: "h2",
        text: "Who Is Regulated: Obligated Entities in Real Estate",
      },
      {
        type: "ul",
        items: [
          "Estate agents and letting agents acting for buyers or sellers in property transactions",
          "Property developers selling directly to the public",
          "Lawyers and notaries facilitating property transfers",
          "Accountants and tax advisors involved in property transactions",
          "High-value dealers accepting large cash payments for property",
        ],
      },
      {
        type: "p",
        text: "In the UK, estate agents are supervised by HMRC under the Money Laundering Regulations 2017 (MLRs). In the EU, obliged entities are defined under the 5th and 6th Anti-Money Laundering Directives (5AMLD/6AMLD). In the US, FinCEN Geographic Targeting Orders (GTOs) require title insurance companies in major metro areas to report all-cash transactions involving legal entities.",
      },
      {
        type: "h2",
        text: "Core AML Obligations for Estate Agents",
      },
      {
        type: "ol",
        items: [
          "Register with your supervisory authority (e.g., HMRC in the UK) and maintain registration",
          "Conduct a firm-wide risk assessment covering your client base, transaction types, and geographies",
          "Implement written AML policies, controls, and procedures signed off by senior management",
          "Appoint a nominated officer (equivalent to an MLRO) to receive internal SAR disclosures",
          "Conduct Customer Due Diligence (CDD) on buyers and sellers before the transaction completes",
          "Identify and verify the beneficial owners of any corporate purchasers or sellers",
          "Screen all parties against sanctions, PEP, and adverse media databases",
          "File Suspicious Activity Reports (SARs) when suspicion arises — before completing the transaction",
          "Maintain all CDD records for a minimum of 5 years post-transaction",
          "Deliver annual AML training to all relevant staff",
        ],
      },
      {
        type: "h2",
        text: "Customer Due Diligence in Property Transactions",
      },
      {
        type: "p",
        text: "CDD in real estate must be applied to both the buyer and the seller. For individuals, this means verifying government-issued photo ID and proof of address. For corporate purchasers — which represent a disproportionate share of money laundering risk — firms must identify and verify the Ultimate Beneficial Owners (UBOs): the individuals who ultimately own or control the purchasing entity.",
      },
      {
        type: "p",
        text: "Source of funds and source of wealth verification are particularly critical in high-value transactions. Regulated firms should obtain and retain documentary evidence of where the purchase funds originated — bank statements, mortgage offers, sale proceeds documentation, or inheritance evidence. A buyer unable to provide credible source of funds documentation is a significant red flag.",
      },
      {
        type: "callout",
        text: "Enhanced Due Diligence (EDD) is required when the buyer or seller is a Politically Exposed Person (PEP), when the transaction involves a high-risk jurisdiction, or when the ownership structure is complex or opaque. EDD typically includes senior management approval, independent verification of source of funds, and enhanced ongoing monitoring.",
      },
      {
        type: "h2",
        text: "Key Red Flags in Real Estate Transactions",
      },
      {
        type: "ul",
        items: [
          "All-cash purchases with no mortgage financing, particularly for high-value properties",
          "Third-party payments — funds coming from a different person or entity than the buyer",
          "Reluctance to provide source of funds documentation or identity verification",
          "Rapid purchase and resale of the same property at similar or below-market prices",
          "Properties purchased by shell companies, nominee owners, or through multi-jurisdictional structures",
          "Buyers located in high-risk or sanctioned jurisdictions",
          "Transactions involving known PEPs or their immediate family members",
          "Price paid significantly above or below market value without credible explanation",
          "Use of multiple lawyers or agents across different transactions to fragment oversight",
          "Payments from cryptocurrency wallets or virtual asset service providers (VASPs)",
        ],
      },
      {
        type: "h2",
        text: "Sanctions and PEP Screening in Property",
      },
      {
        type: "p",
        text: "Sanctions screening is non-negotiable. If a buyer is on the OFAC SDN list, the EU Consolidated Sanctions List, or the UK HM Treasury Financial Sanctions List, completing the transaction may constitute a sanctions violation regardless of whether the agent was aware. Ignorance is not a defence. Automated screening via a platform like WorldAML's AML Screening module ensures every client — individual or corporate — is checked before the transaction proceeds, with a full audit trail of every screening event.",
      },
      {
        type: "h2",
        text: "Suspicious Activity Reporting in Real Estate",
      },
      {
        type: "p",
        text: "In the UK, SARs must be submitted to the National Crime Agency (NCA) via the UKFIU portal. In the US, SARs are filed with FinCEN. Critically, in many jurisdictions a SAR must be submitted before completing a transaction if there is suspicion of money laundering — completing the transaction without consent from the FIU may constitute a money laundering offence (tipping off is also prohibited).",
      },
      {
        type: "h2",
        text: "Enforcement Trends: Rising Penalties for Non-Compliance",
      },
      {
        type: "p",
        text: "HMRC has significantly increased its enforcement activity against estate agents under the MLRs, issuing fines for failures including: inadequate CDD procedures, failure to screen for PEPs and sanctions, no written AML policies, and failure to train staff. The average fine for estate agents has risen steadily since 2020. In the US, the Financial Crimes Enforcement Network (FinCEN) has issued proposed rulemaking to extend AML programme requirements to all real estate professionals — closing a longstanding gap in the framework.",
      },
      {
        type: "h2",
        text: "Building a Compliant Property Onboarding Workflow",
      },
      {
        type: "ol",
        items: [
          "Collect identity documentation from all parties at the point of instruction",
          "For corporate buyers: extract UBO structure and verify each beneficial owner individually",
          "Run all parties through sanctions, PEP, and adverse media screening before proceeding",
          "Request and verify source of funds documentation",
          "Apply risk scoring — low, medium, or high — based on client type, geography, and transaction characteristics",
          "For high-risk cases: escalate to the nominated officer for EDD sign-off",
          "Document all decisions and store records securely for 5 years post-completion",
          "File a SAR if suspicion arises at any stage — and do not complete the transaction until you have consent if required",
        ],
      },
      {
        type: "callout",
        text: "WorldAML's KYC/KYB onboarding module and AML Screening tools are designed to support regulated real estate professionals with automated identity verification, beneficial ownership mapping, and integrated sanctions and PEP screening — all with a full audit trail. Explore the platform at /platform/kyc-kyb and /platform/aml-screening.",
      },
    ],
  },

  // ─── NEW POST 2 ───────────────────────────────────────────────────────────
  {
    slug: "psd2-open-banking-aml-obligations",
    title: "PSD2 and Open Banking: AML Obligations for Third-Party Providers",
    description:
      "PSD2 opened payment markets to new entrants — but it also extended AML obligations to Account Information Service Providers (AISPs) and Payment Initiation Service Providers (PISPs). This guide explains what is required.",
    category: "Regulatory Updates",
    date: "2025-03-08",
    readTime: 10,
    author: "WorldAML Compliance Team",
    authorTitle: "Compliance Research",
    tags: [
      "PSD2",
      "open banking",
      "AML",
      "AISP",
      "PISP",
      "payment services",
      "fintech compliance",
      "EU regulation",
    ],
    relatedSlugs: [
      "aml-compliance-checklist-2025",
      "risk-based-approach-aml",
      "transaction-monitoring-red-flags",
    ],
    content: [
      {
        type: "intro",
        text: "The EU's Second Payment Services Directive (PSD2) fundamentally reshaped the European payments landscape by mandating open access to bank account data and enabling third parties to initiate payments on behalf of customers. While PSD2's innovation goals are well-documented, its AML implications for the new category of Third-Party Providers (TPPs) — Account Information Service Providers (AISPs) and Payment Initiation Service Providers (PISPs) — are frequently overlooked. This guide sets out what PSD2 firms must do to meet their AML obligations.",
      },
      {
        type: "h2",
        text: "PSD2 in Brief: What Changed",
      },
      {
        type: "p",
        text: "Implemented in January 2018, PSD2 required EU banks and payment account providers to open access to customer account data (with customer consent) via standardised Application Programming Interfaces (APIs). This gave rise to two new regulated payment service categories: AISPs, which aggregate and display account information from multiple banks, and PISPs, which initiate payments from customer bank accounts on behalf of merchants or users. Both categories require authorisation from a national competent authority under PSD2.",
      },
      {
        type: "h2",
        text: "How PSD2 Intersects with AML Regulations",
      },
      {
        type: "p",
        text: "PSD2 itself does not override or replace AML obligations — it adds to them. Authorised payment institutions (PIs) and electronic money institutions (EMIs) operating under PSD2 are also subject to the EU's Anti-Money Laundering Directives (4AMLD/5AMLD/6AMLD) and their national transpositions. The AML obligations apply whenever a PSD2-licensed firm falls within the definition of an 'obliged entity' under the AMLD.",
      },
      {
        type: "callout",
        text: "Important distinction: AISPs that only access account information and do not hold or move funds typically have lighter AML obligations. PISPs, which initiate payment transactions, are more likely to be classified as obliged entities under the AMLD and have full AML programme requirements.",
      },
      {
        type: "h2",
        text: "AML Obligations for PISPs",
      },
      {
        type: "p",
        text: "Payment Initiation Service Providers sit squarely within the scope of EU AML obligations when they facilitate fund transfers. Key obligations include:",
      },
      {
        type: "ul",
        items: [
          "Customer Due Diligence (CDD) at onboarding — verify identity, screen for sanctions and PEPs",
          "Ongoing transaction monitoring to detect unusual payment patterns",
          "Suspicious Transaction Reporting (STR) to the national Financial Intelligence Unit (FIU)",
          "Maintenance of a firm-wide risk assessment covering customer types, payment corridors, and product risk",
          "Senior management approval for higher-risk customer relationships",
          "Record-keeping for a minimum of 5 years post-transaction",
        ],
      },
      {
        type: "h2",
        text: "The Strong Customer Authentication (SCA) and Fraud-AML Overlap",
      },
      {
        type: "p",
        text: "PSD2's Strong Customer Authentication (SCA) requirements — mandating multi-factor authentication for electronic payments — have a natural overlap with AML controls. SCA reduces the risk of unauthorised payment initiation, which is a prerequisite for many money mule schemes. However, SCA is a fraud prevention mechanism, not an AML control: it does not substitute for CDD, transaction monitoring, or SAR filing obligations. Compliance teams should ensure there is no confusion between the two frameworks in their programme design.",
      },
      {
        type: "h2",
        text: "Open Banking AML Risk Factors",
      },
      {
        type: "p",
        text: "Open banking creates new money laundering typologies that traditional bank AML models were not designed to detect. Key risk factors include:",
      },
      {
        type: "ul",
        items: [
          "Layering via multiple AISPs: structured use of multiple account aggregators to obscure fund flows across banks",
          "Rapid payment velocity: PISPs enabling high-frequency micro-transactions that individually fall below reporting thresholds (smurfing)",
          "Cross-border payment corridors: PSD2 operates across 30+ EEA countries, creating complex multi-jurisdiction transaction chains",
          "Synthetic identity fraud at onboarding: using stolen or fabricated identity data to open accounts exploited through open banking",
          "Third-party payment abuse: directing payments through legitimate third-party PISP services to distance funds from predicate offences",
        ],
      },
      {
        type: "h2",
        text: "Transaction Monitoring for Open Banking Providers",
      },
      {
        type: "p",
        text: "Conventional transaction monitoring rules were designed for bank accounts and card payments. Open banking providers often need to adapt or build new monitoring scenarios specific to their payment model. Relevant monitoring typologies include: rapid in-and-out transactions with no plausible commercial purpose; payments to counterparties in high-risk jurisdictions; multiple small payments to the same recipient just below reporting thresholds; and sudden changes in transaction volume or value inconsistent with a customer's profile.",
      },
      {
        type: "p",
        text: "WorldAML's Transaction Monitoring module supports custom rule-building, enabling open banking firms to deploy typology-specific scenarios alongside standard AML monitoring frameworks. Review the full capabilities at /platform/transaction-monitoring.",
      },
      {
        type: "h2",
        text: "PSR 2017 and the Travel Rule for PISPs",
      },
      {
        type: "p",
        text: "In the UK, the Payment Services Regulations 2017 (PSR 2017) transpose PSD2 into domestic law and are supervised by the Financial Conduct Authority (FCA). UK PISPs are also subject to the FATF Travel Rule (implemented in the UK under the Wire Transfer (Information on the Payer) Regulations 2017), which requires that payment firms include payer and payee information in electronic fund transfers above EUR 1,000. With the EU's Transfer of Funds Regulation (TFR) extended to crypto-asset transfers under MiCA, open banking and crypto convergence is creating new compliance complexity for multi-product PSD2 firms.",
      },
      {
        type: "h2",
        text: "PSD3 and Future AML Requirements",
      },
      {
        type: "p",
        text: "The European Commission published its PSD3 proposal in June 2023, alongside a new Payment Services Regulation (PSR). PSD3 strengthens fraud liability rules, refines open banking API standards, and aligns more closely with the forthcoming EU AML Regulation (AMLR) — which will establish a single EU AML rulebook directly applicable across member states without national transposition. PSD2-licenced firms should begin gap analysis against the AMLR now, as the new framework is expected to apply from 2027.",
      },
      {
        type: "h2",
        text: "Building an AML Programme for a PSD2 Firm",
      },
      {
        type: "ol",
        items: [
          "Determine your regulatory perimeter: are you an AISP, PISP, or both? Are you an obliged entity under the AMLD?",
          "Conduct a firm-wide risk assessment tailored to open banking payment typologies",
          "Implement CDD workflows with automated identity verification and sanctions/PEP screening at onboarding",
          "Deploy transaction monitoring with scenarios specific to your payment flows and customer behaviour",
          "Establish an STR filing process with your national FIU",
          "Train all relevant staff on PSD2 and AML obligations at least annually",
          "Appoint a qualified Money Laundering Reporting Officer (MLRO) with direct access to the board",
          "Review and update your risk assessment and monitoring rules at least annually",
        ],
      },
      {
        type: "callout",
        text: "WorldAML provides a complete compliance stack for PSD2 firms: KYC onboarding, automated sanctions and PEP screening, real-time transaction monitoring, and regulatory reporting — all accessible via API for seamless integration into your payment platform. See /platform/suite for the full module overview.",
      },
    ],
  },

  // ─── NEW POST 3 ───────────────────────────────────────────────────────────
  {
    slug: "dora-regulation-compliance-financial-institutions",
    title: "DORA Regulation: What Financial Institutions Need to Know About Digital Operational Resilience",
    description:
      "The EU's Digital Operational Resilience Act (DORA) came into force in January 2025. This guide explains DORA's requirements for financial institutions, the intersection with AML and cybersecurity, and how to build a compliant ICT risk management framework.",
    category: "Regulatory Updates",
    date: "2025-03-08",
    readTime: 12,
    author: "WorldAML Compliance Team",
    authorTitle: "Compliance Research",
    tags: [
      "DORA",
      "digital operational resilience",
      "ICT risk",
      "EU regulation",
      "financial institutions",
      "cyber resilience",
      "third-party risk",
    ],
    relatedSlugs: [
      "aml-compliance-checklist-2025",
      "fatca-crs-reporting-guide",
      "risk-based-approach-aml",
    ],
    content: [
      {
        type: "intro",
        text: "The EU's Digital Operational Resilience Act (DORA) — Regulation (EU) 2022/2554 — became applicable across all EU member states on 17 January 2025. DORA establishes a comprehensive framework for managing ICT (Information and Communications Technology) risk in the financial sector, creating binding requirements for banks, payment institutions, investment firms, insurance companies, crypto-asset service providers, and the ICT third-party providers that serve them. For compliance and technology teams, DORA represents a significant new operational obligation alongside existing AML and prudential frameworks.",
      },
      {
        type: "h2",
        text: "What Is DORA and Why Does It Exist?",
      },
      {
        type: "p",
        text: "DORA was developed in response to the increasing frequency and severity of cyber incidents affecting financial institutions and the systemic risks posed by the sector's concentration in a small number of critical technology providers. The regulation recognises that financial stability depends not only on capital adequacy and AML controls, but on the operational resilience of the digital infrastructure underpinning financial services. A systemic outage at a major cloud provider or core banking software vendor can destabilise multiple institutions simultaneously — DORA is designed to mitigate that risk.",
      },
      {
        type: "h2",
        text: "Which Entities Are in Scope?",
      },
      {
        type: "p",
        text: "DORA applies to a broad range of financial entities regulated in the EU, including:",
      },
      {
        type: "ul",
        items: [
          "Credit institutions (banks and building societies)",
          "Payment institutions and electronic money institutions (EMIs)",
          "Investment firms and asset management companies",
          "Insurance and reinsurance undertakings",
          "Crypto-asset service providers (CASPs) authorised under MiCA",
          "Central counterparties (CCPs) and trade repositories",
          "ICT third-party service providers designated as 'critical' by the European Supervisory Authorities (ESAs)",
          "Data reporting service providers and credit rating agencies",
        ],
      },
      {
        type: "p",
        text: "Proportionality applies: microenterprises (fewer than 10 employees, turnover under EUR 2M) benefit from simplified requirements across several pillars.",
      },
      {
        type: "h2",
        text: "The Five Pillars of DORA",
      },
      {
        type: "table",
        headers: ["Pillar", "Requirements", "Key Deliverable"],
        rows: [
          ["ICT Risk Management", "Establish and maintain an ICT risk management framework as part of the overall risk management system", "Board-approved ICT risk policy, risk register, and control framework"],
          ["ICT Incident Reporting", "Classify, manage, and report major ICT incidents to competent authorities within defined timelines", "Incident classification methodology; regulatory reporting to ESAs/NCAs"],
          ["Digital Operational Resilience Testing", "Conduct regular testing including vulnerability assessments, penetration testing, and Threat-Led Penetration Testing (TLPT) for significant firms", "Annual testing programme; TLPT at least every 3 years for significant entities"],
          ["Third-Party ICT Risk Management", "Maintain a register of all ICT third-party providers; conduct due diligence; include contractual provisions in all agreements", "Third-party ICT register; exit strategies; sub-outsourcing provisions"],
          ["Information Sharing", "Participate in voluntary intelligence sharing arrangements on cyber threats and vulnerabilities", "Formal participation agreements with peer institutions or sector bodies"],
        ],
      },
      {
        type: "h2",
        text: "ICT Risk Management Framework",
      },
      {
        type: "p",
        text: "At the core of DORA is the requirement for a comprehensive, board-approved ICT risk management framework. This must identify, classify, and document all ICT assets and their dependencies; establish risk tolerance levels; define detection and response processes for ICT incidents; and include a documented Business Continuity Plan (BCP) and Disaster Recovery Plan (DRP) tested at least annually.",
      },
      {
        type: "p",
        text: "The framework must be reviewed at least annually and updated after any major ICT incident. Senior management are personally accountable for approving the framework and ensuring adequate resourcing. Regulators will scrutinise whether the framework is genuinely operational or a paper exercise.",
      },
      {
        type: "h2",
        text: "ICT Incident Reporting Requirements",
      },
      {
        type: "p",
        text: "DORA introduces a three-stage incident reporting timeline for major ICT-related incidents:",
      },
      {
        type: "ol",
        items: [
          "Initial notification: within 4 hours of classifying an incident as 'major' (and no later than 24 hours from detection)",
          "Intermediate report: within 72 hours of initial notification, providing updated information on the incident and its impact",
          "Final report: within 1 month of resolving the incident, including root cause analysis and remediation actions",
        ],
      },
      {
        type: "p",
        text: "Major ICT incidents are classified based on their impact across five criteria: number of clients affected, duration, geographic spread, data loss, and economic impact. Financial institutions must maintain an internal incident log and classify all ICT incidents — not just those meeting the major incident threshold — to demonstrate a complete picture of their ICT risk landscape.",
      },
      {
        type: "h2",
        text: "Third-Party ICT Risk: The Concentration Risk Problem",
      },
      {
        type: "p",
        text: "DORA's most practically challenging pillar for many institutions is third-party ICT risk management. Firms must maintain a comprehensive register of all ICT third-party providers — from critical cloud providers to niche software vendors — and conduct proportionate due diligence on each. Contractual agreements with ICT providers must include specific provisions required by DORA, including:",
      },
      {
        type: "ul",
        items: [
          "Full description of services and SLAs with measurable performance metrics",
          "Audit rights for the financial entity and its regulators",
          "Sub-outsourcing notification and approval obligations",
          "Data portability, deletion, and return provisions",
          "Business continuity obligations and recovery time objectives",
          "Termination rights including provisions for performance failures or regulatory non-compliance",
          "Exit strategy and transition assistance obligations",
        ],
      },
      {
        type: "callout",
        text: "Concentration risk — where a large proportion of the financial sector relies on a single ICT provider — is specifically addressed by DORA's Critical Third-Party Provider (CTPP) designation framework. CTPPs are subject to direct oversight by the European Supervisory Authorities (EBA, ESMA, EIOPA), including the right to conduct on-site inspections.",
      },
      {
        type: "h2",
        text: "DORA and AML: The Intersection",
      },
      {
        type: "p",
        text: "DORA and AML compliance are distinct frameworks, but they intersect at several critical points. First, cyber incidents are increasingly linked to financial crime: ransomware attacks, account takeover fraud, and insider threats all have AML implications. Second, DORA's requirement for business continuity planning directly affects AML operations — if transaction monitoring systems or sanctions screening infrastructure goes down, the institution may be unable to meet its real-time AML obligations. Third, DORA's third-party risk requirements extend to AML technology vendors: any firm using a third-party AML screening or transaction monitoring platform must include DORA-compliant contractual provisions in that vendor relationship.",
      },
      {
        type: "p",
        text: "Compliance teams should therefore engage with their institution's DORA implementation programme, particularly around: ensuring AML platforms are included in the ICT asset register; confirming vendor contracts meet DORA's contractual requirements; and verifying that BCP/DRP plans include AML system recovery within regulatory timeframes.",
      },
      {
        type: "h2",
        text: "Threat-Led Penetration Testing (TLPT)",
      },
      {
        type: "p",
        text: "Significant financial institutions — as identified by their national competent authority — must conduct Threat-Led Penetration Testing (TLPT) at least every three years. TLPT is a sophisticated testing methodology based on real threat intelligence, where ethical hackers simulate advanced persistent threat (APT) actor techniques against live production systems. TLPT must be conducted by accredited external testers following the TIBER-EU framework published by the European Central Bank.",
      },
      {
        type: "h2",
        text: "Key Deadlines and Implementation Steps",
      },
      {
        type: "ol",
        items: [
          "January 2025: DORA became applicable — all requirements are now binding",
          "Immediately: Establish ICT risk management framework and assign board accountability",
          "Immediately: Begin auditing all ICT third-party contracts for DORA compliance gaps",
          "Q1 2025: Submit register of information on ICT third-party providers to national competent authority",
          "Ongoing: Implement ICT incident classification and reporting processes",
          "Annually: Conduct ICT resilience testing programme; review and update BCP/DRP",
          "Every 3 years (significant entities): Conduct TLPT under TIBER-EU framework",
        ],
      },
      {
        type: "h2",
        text: "Penalties for Non-Compliance",
      },
      {
        type: "p",
        text: "DORA does not prescribe a uniform penalty scale — enforcement powers remain with national competent authorities (NCAs) under their existing supervisory frameworks. However, for critical third-party providers directly overseen by the ESAs, DORA provides for periodic penalty payments of up to 1% of average daily worldwide turnover for each day of non-compliance, up to a maximum of 6 months. For financial entities, the consequences of non-compliance will be determined by national enforcement frameworks, but regulators have been explicit that DORA obligations are supervisory priorities from January 2025 onwards.",
      },
      {
        type: "h2",
        text: "How Compliance Teams Should Respond",
      },
      {
        type: "ol",
        items: [
          "Map your institution's full ICT asset landscape, including all third-party and outsourced services",
          "Identify gaps between existing contracts and DORA's mandatory contractual provisions",
          "Ensure AML, sanctions screening, and transaction monitoring systems are included in ICT risk and BCP frameworks",
          "Establish the incident classification methodology and reporting workflow before an incident occurs",
          "Engage the board: DORA requires formal board approval and accountability for the ICT risk management framework",
          "Coordinate with technology and procurement teams on CTPP register submissions",
          "Plan your testing programme: DORA testing requirements are likely more rigorous than existing penetration testing cycles",
        ],
      },
      {
        type: "callout",
        text: "WorldAML's platform is built on a DORA-ready infrastructure — hosted on ISO 27001-certified cloud infrastructure with documented SLAs, audit rights, and business continuity provisions. For institutions that use WorldAML as an AML technology provider, our contractual terms are designed to meet DORA's third-party ICT requirements. Review our security and compliance posture at /platform/security.",
      },
    ],
  },
  {
    slug: "worldcompliance-vs-world-check",
    title: "LexisNexis WorldCompliance vs LSEG World-Check: A 2026 Comparison",
    description:
      "Side-by-side comparison of LexisNexis WorldCompliance and LSEG World-Check across coverage, refresh frequency, PEP depth, adverse media, integration and pricing — and how WorldAML packages WorldCompliance for live, API-first screening.",
    category: "Sanctions",
    date: "2026-06-21",
    readTime: 11,
    author: "WorldAML Research Team",
    authorTitle: "Sanctions & Screening Data",
    tags: [
      "WorldCompliance",
      "World-Check",
      "sanctions screening",
      "PEP",
      "adverse media",
      "LexisNexis",
      "LSEG",
      "Refinitiv",
    ],
    relatedSlugs: [
      "sanctions-screening-best-practices",
      "aml-compliance-checklist-2025",
    ],
    content: [
      {
        type: "intro",
        text: "If you are evaluating screening data for sanctions, PEPs and adverse media, the conversation almost always narrows to two names: LexisNexis WorldCompliance and LSEG World-Check (formerly Refinitiv / Thomson Reuters). Both are market-leading databases used by tier-one banks, payment institutions and crypto exchanges — but they differ meaningfully in coverage depth, refresh cadence, licensing model and how easily they integrate into modern AML platforms. This guide compares them on the criteria that actually drive procurement decisions, and explains where WorldAML's WorldCompliance-powered offering fits in.",
      },
      { type: "h2", text: "TL;DR — which one should you pick?" },
      {
        type: "ul",
        items: [
          "Choose **WorldCompliance** if you need the broadest list coverage (1,900+ global watchlists), API-first integration, transparent licensing, and want to avoid the legacy enterprise sales cycle.",
          "Choose **World-Check** if you are already on the LSEG stack, need its specific risk-intelligence narrative format, and are comfortable with enterprise contracting and per-seat licensing.",
          "Choose **WorldAML (powered by WorldCompliance)** if you want the WorldCompliance dataset already integrated into a live screening, monitoring, and case-management platform — without managing the data pipeline yourself.",
        ],
      },
      { type: "h2", text: "1. Coverage breadth" },
      {
        type: "p",
        text: "Both providers cover the canonical sanctions regimes (OFAC, EU, UN, HMT/OFSI, DFAT, SECO) and the major PEP categories. The difference is in the long tail.",
      },
      {
        type: "table",
        headers: ["Coverage area", "LexisNexis WorldCompliance", "LSEG World-Check"],
        rows: [
          ["Global watchlists", "1,900+ structured lists", "~1,100 curated lists"],
          ["Sanctions regimes", "All major + regional (incl. Asia-Pacific, LatAm)", "All major + regional"],
          ["PEP coverage", "~2.6M profiles incl. RCAs and family", "~3M profiles incl. RCAs"],
          ["Adverse media", "Structured + unstructured news ingestion", "Curated risk-intelligence narratives"],
          ["State-Owned Enterprises (SOE)", "Yes, with ownership chains", "Yes"],
          ["Crypto / VASP enrichment", "Yes (LexisNexis Digital Identity overlay)", "Limited, via World-Check One add-ons"],
        ],
      },
      { type: "h2", text: "2. Refresh frequency and data freshness" },
      {
        type: "p",
        text: "For sanctions screening, freshness is non-negotiable — a 24-hour delay against an OFAC update is a regulatory finding waiting to happen.",
      },
      {
        type: "ul",
        items: [
          "**WorldCompliance:** Near real-time ingestion for sanctions lists (typically <15 minutes after publication). PEPs and adverse media refreshed continuously.",
          "**World-Check:** Updated multiple times daily; SLA on sanctions varies by feed type and contract tier.",
          "**WorldAML platform:** Streams WorldCompliance updates directly into your customer monitoring — no nightly batch, no manual list refresh.",
        ],
      },
      { type: "h2", text: "3. Match quality and tuning" },
      {
        type: "p",
        text: "False positives are the silent cost of any screening programme. Both vendors offer fuzzy matching, transliteration handling, and secondary identifier disambiguation (date of birth, nationality, identifier numbers).",
      },
      {
        type: "ul",
        items: [
          "WorldCompliance exposes raw match attributes (name parts, scripts, identifiers) so you can tune scoring thresholds per business line.",
          "World-Check pairs matches with curated intelligence narratives, which speeds adjudication but locks you into LSEG's scoring opinion.",
          "WorldAML applies Jaro-Winkler + token-based secondary scoring on top of WorldCompliance, with an MLRO-tunable threshold (default 0.70).",
        ],
      },
      { type: "h2", text: "4. Integration model" },
      {
        type: "table",
        headers: ["Capability", "WorldCompliance (direct)", "World-Check One", "WorldAML"],
        rows: [
          ["REST API", "Yes", "Yes (separate license)", "Yes — included"],
          ["Bulk file feed", "Yes", "Yes", "Optional"],
          ["Web UI for ad-hoc screening", "Limited", "Yes (per-seat)", "Included for all users"],
          ["Webhooks / streaming updates", "Available", "Limited", "Native"],
          ["Case management & STR drafting", "No", "Add-on", "Built-in"],
          ["Transaction monitoring engine", "No", "No", "Built-in (46 baseline rules)"],
        ],
      },
      { type: "h2", text: "5. Licensing and commercial model" },
      {
        type: "ul",
        items: [
          "**WorldCompliance:** Annual data license, typically scoped by record volume and use case. No per-seat fees.",
          "**World-Check:** Per-seat licensing for World-Check One, plus data feed fees for API access. Enterprise sales cycle is typically 4–8 weeks.",
          "**WorldAML:** Transparent SaaS pricing — WorldCompliance data, screening engine, and case management bundled into a single subscription, with self-serve onboarding.",
        ],
      },
      { type: "h2", text: "6. Auditability and regulator acceptance" },
      {
        type: "p",
        text: "Both datasets are accepted by FATF-aligned regulators worldwide. Mutual evaluations have cited deployments of both as evidence of adequate screening controls. The audit trail you can produce matters more than the brand on the data license — regulators want to see who screened whom, against which list version, on which date, and how matches were adjudicated.",
      },
      {
        type: "callout",
        text: "WorldAML retains a per-screening snapshot of the WorldCompliance list version used, every match returned, every analyst decision, and the rationale — exportable as a regulator-ready PDF audit pack. See our /world-check-alternative page for a deeper feature-by-feature breakdown.",
      },
      { type: "h2", text: "When to migrate from World-Check" },
      {
        type: "ul",
        items: [
          "Per-seat licensing is becoming a barrier as your compliance team grows.",
          "You need API-first integration into onboarding, payments, or KYB flows that World-Check One cannot deliver natively.",
          "Your false-positive rate is being driven by curated narratives you can't tune.",
          "You want sanctions, PEP, adverse media, AND case management on a single contract.",
        ],
      },
      { type: "h2", text: "Getting started with WorldCompliance via WorldAML" },
      {
        type: "ol",
        items: [
          "Book a 30-minute scoping call to confirm your jurisdictions, expected screening volume, and risk appetite.",
          "Receive a sandbox API key the same day, pre-loaded with the WorldCompliance dataset.",
          "Run a parallel-run pilot — screen 30 days of historical customers and compare match quality against your incumbent.",
          "Migrate live traffic with zero downtime — WorldAML exposes both REST and webhook integrations.",
        ],
      },
      {
        type: "callout",
        text: "Ready to compare WorldCompliance against your current World-Check setup? Book a demo at /contact-sales or read the detailed feature breakdown at /world-check-alternative.",
      },
    ],
  },
  {
    slug: "how-to-choose-aml-screening-provider",
    title: "How to Choose an AML Screening Provider: 12 Questions to Ask Before You Sign",
    description:
      "A buyer's guide to sanctions, PEP and adverse media screening vendors: the 12 questions that reveal data coverage, false-positive rates, audit evidence, integration effort and total cost.",
    category: "Sanctions",
    date: "2026-11-13",
    readTime: 9,
    author: "WorldAML Compliance Team",
    authorTitle: "Compliance Research",
    tags: ["AML screening", "vendor selection", "sanctions screening", "PEP screening", "RFP", "AML software"],
    relatedSlugs: ["sanctions-screening-best-practices", "worldcompliance-vs-world-check", "pep-screening-guide"],
    content: [
      {
        type: "intro",
        text: "Most AML screening tools look the same in a demo: a search box, a list of matches and a risk score. The differences that matter — how complete the data is, how many false alerts your team will clear every day, and whether you can prove to a regulator what happened to an alert eight months ago — only show up once you are live. These 12 questions help you find them before you sign.",
      },
      { type: "h2", text: "Scope: what must the tool actually cover?" },
      {
        type: "p",
        text: "Start with your obligations, not the vendor's feature list. Write down the jurisdictions you operate in, the customer types you onboard (individuals, companies, beneficial owners, counterparties) and the points at which you must screen: onboarding, ongoing monitoring and payments.",
      },
      {
        type: "ol",
        items: [
          "Which sanctions, PEP and watchlists are covered — by name? Ask for the source list, not a headline count. 'Global coverage' should include the domestic lists of every market you operate in, not only OFAC, the EU, the UN and the UK.",
          "How quickly are list changes reflected? Ask for the typical time between an authority publishing an update and the change being searchable, and what happens to customers you have already screened.",
          "Does screening reach beneficial owners, directors and connected parties, or only the name you type in? Ownership-based sanctions risk sits in the structure, not just the customer record.",
        ],
      },
      { type: "h2", text: "Data quality: where does it come from?" },
      {
        type: "ol",
        items: [
          "Is the data collected in-house, licensed from a third party, or scraped? Each model is valid, but you need to know who is accountable for accuracy.",
          "What identifiers does each record carry? Dates of birth, nationalities, passport numbers and company registration numbers are what let your team discount a false match quickly.",
          "How are PEPs defined and kept current? Ask how relatives and close associates are captured and how often PEP profiles are reviewed.",
        ],
      },
      { type: "h2", text: "Matching: how many false alerts will you clear?" },
      {
        type: "p",
        text: "False positives are the hidden cost of screening. A tool tuned too loosely buries analysts in alerts; one tuned too tightly misses a sanctioned name with two letters changed — exactly the test regulators like to run.",
      },
      {
        type: "ol",
        items: [
          "Will the vendor run a sample of your own customer names through the system before you buy? A false-positive rate measured on the vendor's demo data tells you very little.",
          "Can you see why each match was returned — which part of the name matched, and whether date of birth or nationality agreed? Explainable matching speeds up review and makes tuning defensible.",
          "How does the engine handle transliteration, name order and non-Latin scripts? Shared-token collisions on Arabic, Chinese and Slavic names are the most common source of noise.",
        ],
      },
      { type: "h2", text: "Evidence, integration and cost" },
      {
        type: "ol",
        items: [
          "Can every decision be reconstructed later? You need the list version used, every match returned, who cleared it, when and why — kept for at least five years and exportable for an audit.",
          "How will it connect to your onboarding and payment flows? Ask for API documentation, webhook support, batch re-screening and realistic implementation timelines.",
          "What is the full annual cost? Include per-search or per-entity fees, monitoring charges, seat licences, set-up fees and the price of adding a jurisdiction later.",
        ],
      },
      {
        type: "table",
        headers: ["Area", "Red flag in a vendor answer"],
        rows: [
          ["Coverage", "A list count with no named sources"],
          ["Updates", "'Daily' with no answer on how existing customers are re-screened"],
          ["Matching", "Refuses to test on your own data"],
          ["Evidence", "Match history is overwritten when lists change"],
          ["Cost", "Pricing only available after a long sales process"],
        ],
      },
      { type: "h2", text: "Run a short pilot before committing" },
      {
        type: "p",
        text: "The most reliable way to compare providers is a parallel run: screen the same few thousand historical customers through each shortlisted tool and compare alert volumes, true matches found and the time your analysts spend per alert. Two to four weeks is usually enough.",
      },
      {
        type: "callout",
        text: "WorldAML Suite screens against 1,900+ global lists, shows why each match was returned and keeps a full decision history for audits. See the sources we cover at /resources/sanctions-lists or request a pilot at /contact-sales.",
      },
    ],
  },
  {
    slug: "eu-aml-package-amla-2027-guide",
    title: "The EU AML Package and AMLA: What Changes Before 10 July 2027",
    description:
      "What the EU Anti-Money Laundering Regulation, the sixth directive and the new AMLA authority mean for obliged entities — key dates, new rules and a readiness checklist for 2027.",
    category: "Regulatory Updates",
    date: "2026-11-17",
    readTime: 10,
    author: "WorldAML Compliance Team",
    authorTitle: "Compliance Research",
    tags: ["AMLA", "AMLR", "AMLD6", "EU AML package", "single rulebook", "EU regulation"],
    relatedSlugs: ["aml-compliance-checklist-2025", "beneficial-ownership-guide", "risk-based-approach-aml"],
    content: [
      {
        type: "intro",
        text: "For the first time, the EU will have one set of anti-money laundering rules that applies directly in every Member State. The EU AML package — a Regulation (AMLR), a sixth Directive (AMLD6) and the Regulation creating the Anti-Money Laundering Authority (AMLA) — applies from 10 July 2027. With fewer than eight months to go, here is what changes and what firms should be doing now.",
      },
      { type: "h2", text: "The three parts of the package" },
      {
        type: "table",
        headers: ["Instrument", "What it does"],
        rows: [
          ["AML Regulation (AMLR)", "The single rulebook: customer due diligence, beneficial ownership, reporting and internal controls, directly applicable without national transposition"],
          ["Sixth AML Directive (AMLD6)", "Rules for national supervisors, financial intelligence units and registers, transposed into national law"],
          ["AMLA Regulation", "Creates the EU Authority for Anti-Money Laundering and Countering the Financing of Terrorism, based in Frankfurt"],
        ],
      },
      { type: "h2", text: "What AMLA does — and when" },
      {
        type: "p",
        text: "AMLA began operating in summer 2025 and took over the European Banking Authority's AML mandates in January 2026. It is writing the technical standards that fill in the detail of the single rulebook, coordinating national supervisors and supporting cooperation between financial intelligence units.",
      },
      {
        type: "p",
        text: "From 2028, AMLA will directly supervise up to 40 of the highest-risk financial institutions or groups. Firms operating in at least six Member States are eligible, and the first selection round takes place in 2027 based on each group's residual risk profile. Everyone else stays with their national supervisor, but under the same rulebook.",
      },
      { type: "h2", text: "Key changes for obliged entities" },
      {
        type: "ul",
        items: [
          "One rulebook: national gold-plating of due diligence rules is largely replaced by directly applicable EU requirements, which helps firms operating across borders.",
          "Targeted financial sanctions: firms must assess and control the risk of sanctions evasion, not only money laundering and terrorist financing.",
          "Beneficial ownership: the 25% ownership threshold is harmonised and ownership and control structures must be understood in more depth, with more detailed register data.",
          "Cash limit: an EU-wide cap of €10,000 on cash payments for goods and services, with Member States free to set a lower limit.",
          "New obliged entities: crypto-asset service providers are fully in scope, and top-tier professional football clubs and agents follow later in the transition.",
          "Ongoing due diligence: customer information must be kept up to date on a risk basis, with higher-risk customers reviewed more often.",
        ],
      },
      { type: "h2", text: "A readiness checklist for 2027" },
      {
        type: "ol",
        items: [
          "Map your current policies against the AMLR and record every gap — especially where your national rules differed from the new EU standard.",
          "Add sanctions-evasion risk to your business-wide risk assessment and show how your controls address it.",
          "Review beneficial ownership procedures for complex and multi-layered structures, and plan how you will report discrepancies to central registers.",
          "Check that customer files can be refreshed on a risk-based schedule, and estimate the remediation volume for files that fall short.",
          "Follow AMLA's consultations on draft technical standards; final texts will set the detail for due diligence, risk assessment and supervision.",
          "If you operate in six or more Member States, prepare for the data requests national supervisors use to assess eligibility for direct supervision.",
        ],
      },
      {
        type: "callout",
        text: "Our EU AML Training Course covers the AMLR, AMLD6 and AMLA in depth — see /academy/aml-europe. For teams preparing systems, WorldAML Suite combines screening, monitoring and case management with a full audit trail: /contact-sales.",
      },
    ],
  },
  {
    slug: "how-to-become-aml-analyst",
    title: "How to Become an AML Analyst: Skills, Certifications and Career Path",
    description:
      "What AML analysts do, the skills employers look for, which certifications help, and how a career can progress from KYC analyst to MLRO — with free ways to get started.",
    category: "AML Compliance",
    date: "2026-11-20",
    readTime: 8,
    author: "WorldAML Compliance Team",
    authorTitle: "Compliance Research",
    tags: ["AML careers", "AML analyst", "KYC analyst", "AML certification", "MLRO", "compliance jobs"],
    relatedSlugs: ["mlro-responsibilities-obligations", "transaction-monitoring-red-flags", "kyc-vs-kyb-differences"],
    content: [
      {
        type: "intro",
        text: "Anti-money laundering is one of the few areas of finance where demand for people keeps growing regardless of the economic cycle. Banks, payment firms, crypto exchanges, gaming operators, accountants and law firms all need people who can spot suspicious activity and document their decisions. Here is what the job involves and how to get into it.",
      },
      { type: "h2", text: "What an AML analyst does day to day" },
      {
        type: "ul",
        items: [
          "Reviews new customers: checks identity documents, company structures and beneficial owners (KYC and KYB).",
          "Clears screening alerts: decides whether a sanctions or PEP match is the same person or a false positive, and records why.",
          "Investigates transaction monitoring alerts: looks at account activity, source of funds and customer behaviour to decide whether something is unusual.",
          "Escalates suspicions: writes clear internal reports so the MLRO can decide whether to file a suspicious activity report.",
          "Supports periodic reviews and remediation projects when customer files need to be brought up to date.",
        ],
      },
      { type: "h2", text: "The skills employers look for" },
      {
        type: "table",
        headers: ["Skill", "Why it matters"],
        rows: [
          ["Attention to detail", "Most alerts are cleared or escalated on small inconsistencies — a date, an address, an ownership percentage"],
          ["Clear writing", "Every decision must be documented so that an auditor can understand it months later"],
          ["Investigative curiosity", "Good analysts ask why money moved, not only whether a rule was triggered"],
          ["Regulatory knowledge", "You need to know what the law requires: due diligence levels, reporting duties, record keeping"],
          ["Data confidence", "Spreadsheets, case management tools and basic data analysis are part of daily work"],
        ],
      },
      { type: "h2", text: "Do you need a degree or certification?" },
      {
        type: "p",
        text: "Many analysts start without a specialist degree; law, finance, criminology and languages backgrounds are all common. What helps most is showing that you understand the fundamentals before your first interview. An entry-level certificate gives you the vocabulary — risk-based approach, CDD and EDD, typologies, SARs — and a credential you can list on your CV.",
      },
      {
        type: "p",
        text: "Experienced professionals often add a recognised industry qualification later, such as ACAMS's CAMS or one of the International Compliance Association's AML certificates and diplomas. These carry fees and study time, so most people take them once they are already working in compliance, often with employer support.",
      },
      { type: "h2", text: "A typical career path" },
      {
        type: "ol",
        items: [
          "KYC or onboarding analyst — learning documents, due diligence and screening.",
          "Transaction monitoring or EDD analyst — investigating alerts and high-risk customers.",
          "Senior analyst or investigator — complex cases, quality checks, mentoring.",
          "Team lead or compliance manager — owning processes, metrics and training.",
          "Deputy MLRO or MLRO — personal regulatory responsibility for the firm's AML framework.",
        ],
      },
      { type: "h2", text: "How to stand out when applying" },
      {
        type: "ul",
        items: [
          "Complete a free fundamentals course and add the certificate link to your CV and LinkedIn profile.",
          "Learn one sector well — payments, crypto, gaming or banking — and the typologies that come with it.",
          "Practise writing a short case summary: facts, red flags, what you checked and your recommendation.",
          "Follow regulatory news from FATF and your national regulator so you can talk about current issues.",
        ],
      },
      {
        type: "callout",
        text: "Start with WorldAML Academy's free AML Fundamentals course: pass the final assessment with 80% or more to earn a verifiable, CPD-accredited certificate you can share with employers. Begin at /academy/aml-fundamentals.",
      },
    ],
  },
  {
    slug: "aml-compliance-fintech-payment-institutions",
    title: "AML Compliance for Fintechs and Payment Institutions: A Practical Guide",
    description:
      "How payment institutions, e-money firms and fintechs can build an AML programme that scales: risk assessment, digital onboarding, real-time screening, transaction monitoring and governance.",
    category: "AML Compliance",
    date: "2026-11-24",
    readTime: 9,
    author: "WorldAML Compliance Team",
    authorTitle: "Compliance Research",
    tags: ["fintech AML", "payment institutions", "e-money", "transaction monitoring", "digital onboarding", "EMI"],
    relatedSlugs: ["psd2-open-banking-aml-obligations", "transaction-monitoring-red-flags", "aml-compliance-checklist-2025"],
    content: [
      {
        type: "intro",
        text: "Fintechs grow fast, onboard customers remotely and move money in seconds. Those same strengths are what criminals look for. Supervisors across Europe, the UK and the US have repeatedly found that controls at fast-growing payment and e-money firms did not keep pace with customer numbers. This guide sets out the core of an AML programme that can scale with the business.",
      },
      { type: "h2", text: "1. Start with an honest risk assessment" },
      {
        type: "p",
        text: "Your business-wide risk assessment should reflect how your product can be abused, not a generic template. Consider customer types, countries you serve, delivery channels, and product features such as instant payouts, card issuing, cross-border transfers or crypto on-ramps.",
      },
      {
        type: "ul",
        items: [
          "Which features let money move fastest, or to the most places, with the least friction?",
          "Where do you rely on partners — banks, card schemes, agents — and who performs which checks?",
          "Which customer segments are growing fastest, and has the risk assessment caught up with them?",
        ],
      },
      { type: "h2", text: "2. Digital onboarding that is fast and defensible" },
      {
        type: "p",
        text: "Remote onboarding is accepted by regulators when it is reliable and documented. Combine document verification, liveness or biometric checks, and data checks against independent sources. For business customers, verify the company, its directors and its beneficial owners before the account goes live.",
      },
      {
        type: "callout",
        text: "Speed is not a defence. If growth targets lead you to open accounts before checks are complete, document the risk decision, the limits applied and the deadline for completing verification.",
      },
      { type: "h2", text: "3. Screening at onboarding and on every payment" },
      {
        type: "p",
        text: "Payment firms need two kinds of screening: customer screening against sanctions and PEP lists at onboarding and whenever lists change, and payment screening of counterparties and payment details in real time. Missed sanctions matches are among the most serious failures a payment firm can have, because a payment that has left cannot easily be recalled.",
      },
      { type: "h2", text: "4. Transaction monitoring tuned to your product" },
      {
        type: "ul",
        items: [
          "Rapid movement of funds in and out of an account with no economic purpose",
          "Many small incoming payments from unrelated senders — a sign of money mule activity",
          "Activity that does not match the expected turnover declared at onboarding",
          "Sudden changes in device, location or payout destination",
          "Payments to or from high-risk jurisdictions without a clear business reason",
        ],
      },
      {
        type: "p",
        text: "Start with rules that reflect your risk assessment, measure how many alerts each rule produces and how many lead to escalation, and retune regularly. Document every tuning decision — supervisors will ask why a threshold was set where it is.",
      },
      { type: "h2", text: "5. Governance that keeps pace with growth" },
      {
        type: "ol",
        items: [
          "Appoint an MLRO with real authority, resources and a direct line to the board.",
          "Report AML metrics to the board: alert backlogs, overdue reviews, SAR volumes and onboarding exceptions.",
          "Plan compliance headcount and tooling as part of every growth forecast, not after a backlog appears.",
          "Train staff on the typologies specific to your product, and keep records of who completed what.",
          "Commission independent testing of the AML framework at least annually or after major product changes.",
        ],
      },
      {
        type: "callout",
        text: "WorldAML Suite brings onboarding checks, screening, transaction monitoring and case management into one workspace with a single audit trail. Talk to us about a pilot at /contact-sales.",
      },
    ],
  },
  {
    slug: "reduce-false-positives-sanctions-screening",
    title: "How to Reduce False Positives in Sanctions Screening Without Missing Real Matches",
    description:
      "Practical ways to cut false positive sanctions and PEP alerts: better customer data, secondary identifiers, smarter name matching, risk-based thresholds and documented tuning.",
    category: "Sanctions",
    date: "2026-11-27",
    readTime: 8,
    author: "WorldAML Compliance Team",
    authorTitle: "Compliance Research",
    tags: ["false positives", "sanctions screening", "name matching", "fuzzy matching", "PEP screening", "alert tuning"],
    relatedSlugs: ["sanctions-screening-best-practices", "pep-screening-guide", "how-to-choose-aml-screening-provider"],
    content: [
      {
        type: "intro",
        text: "In many screening programmes, the overwhelming majority of alerts turn out to be false positives. Each one costs analyst time, delays onboarding and, at scale, makes it more likely that a real match is cleared in a hurry. The goal is not fewer alerts at any price — it is fewer alerts without missing the sanctioned name with two letters changed.",
      },
      { type: "h2", text: "Why false positives happen" },
      {
        type: "ul",
        items: [
          "Common names: thousands of customers share names with listed individuals.",
          "Missing data: without a date of birth or nationality, the engine can only compare names.",
          "Transliteration: one Arabic, Cyrillic or Chinese name can be written in many Latin spellings.",
          "Loose thresholds: fuzzy matching set very low to be safe returns matches on single shared words.",
          "Over-broad lists: screening every customer against every list, regardless of relevance.",
        ],
      },
      { type: "h2", text: "1. Fix the data you screen" },
      {
        type: "p",
        text: "The cheapest improvement is usually upstream. Collect full names, dates of birth, nationalities and, for companies, registration numbers and countries at onboarding — and send them to the screening engine. Clean obvious errors such as titles in name fields, swapped first and last names, and placeholder dates.",
      },
      { type: "h2", text: "2. Use secondary identifiers to discount matches" },
      {
        type: "p",
        text: "A name match where the date of birth is 30 years apart, or the nationality differs and the list entry has a passport number that does not match, can usually be discounted quickly. Configure your tool to show which identifiers agree and which conflict, so analysts decide on evidence rather than on a single score.",
      },
      { type: "h2", text: "3. Tune name matching — carefully" },
      {
        type: "table",
        headers: ["Technique", "Effect", "Watch out for"],
        rows: [
          ["Name normalisation", "Treats accents, punctuation and word order consistently", "Over-normalising distinct names"],
          ["Transliteration variants", "Matches different spellings of the same name", "Variant lists that are too broad"],
          ["Risk-based thresholds", "Stricter matching for high-risk customers and payments", "Undocumented differences between segments"],
          ["Stop-word handling", "Ignores common company words like 'Ltd' or 'Trading'", "Removing words that are part of a listed name"],
        ],
      },
      {
        type: "callout",
        text: "Always test a tuning change against known variations of listed names before it goes live. A change that cuts alerts by half but misses a sanctioned name with one letter changed is a regulatory finding waiting to happen.",
      },
      { type: "h2", text: "4. Handle repeat alerts with care" },
      {
        type: "p",
        text: "When the same customer keeps matching the same list entry, a reviewed and documented 'good guy' decision stops the alert from returning on every re-screen. Set a review date for each one, and make sure the suppression lifts automatically if either the customer data or the list entry changes.",
      },
      { type: "h2", text: "5. Measure, document and repeat" },
      {
        type: "ol",
        items: [
          "Track alert volume, false-positive rate and average handling time by list and customer segment.",
          "Sample cleared alerts regularly to check that decisions were correct and well documented.",
          "Run above- and below-the-line testing when thresholds change, and keep the results.",
          "Record who approved each tuning change and why — auditors and supervisors will ask.",
        ],
      },
      {
        type: "callout",
        text: "WorldAML Suite shows the basis of every match — name, date of birth, nationality — and records each analyst decision for audit. Learn the fundamentals in our free Sanctions Screening course at /academy/sanctions-screening-essentials, or talk to us at /contact-sales.",
      },
    ],
  },
  {
    slug: "uk-eccta-failure-to-prevent-fraud-companies-house-id",
    title: "UK Economic Crime Act: Failure to Prevent Fraud and Companies House ID Checks Explained",
    description:
      "What the UK's Economic Crime and Corporate Transparency Act means now: the failure to prevent fraud offence in force since September 2025 and mandatory identity verification for directors and PSCs.",
    category: "Regulatory Updates",
    date: "2026-12-01",
    readTime: 8,
    author: "WorldAML Compliance Team",
    authorTitle: "Compliance Research",
    tags: ["ECCTA", "failure to prevent fraud", "Companies House", "identity verification", "UK regulation", "PSC"],
    relatedSlugs: ["beneficial-ownership-guide", "kyc-vs-kyb-differences", "eu-aml-package-amla-2027-guide"],
    content: [
      {
        type: "intro",
        text: "The Economic Crime and Corporate Transparency Act 2023 (ECCTA) is reshaping how UK companies prevent fraud and how the UK company register works. Two of its biggest changes are now live: a corporate offence of failure to prevent fraud, and mandatory identity verification for company directors and people with significant control (PSCs). Both matter for compliance teams — whether you are the company in scope or the firm relying on the register for due diligence.",
      },
      { type: "h2", text: "The failure to prevent fraud offence" },
      {
        type: "p",
        text: "Since 1 September 2025, a large organisation can be criminally liable if an employee, agent, subsidiary or other associated person commits a specified fraud offence intending to benefit the organisation. Prosecutors do not need to show that senior managers ordered or knew about the fraud.",
      },
      {
        type: "ul",
        items: [
          "Who is in scope: large incorporated bodies, subsidiaries and partnerships, including incorporated charities — broadly those meeting two of three tests: more than 250 employees, more than £36 million turnover, more than £18 million in total assets.",
          "Examples of conduct: dishonest sales practices, hiding important information from customers or investors, and dishonest practices in financial markets.",
          "The defence: having reasonable fraud prevention procedures in place at the time of the fraud.",
        ],
      },
      { type: "h2", text: "What reasonable procedures look like" },
      {
        type: "p",
        text: "Government guidance follows six principles familiar from the Bribery Act. Use them to structure your fraud prevention framework and the evidence behind it.",
      },
      {
        type: "table",
        headers: ["Principle", "In practice"],
        rows: [
          ["Top-level commitment", "Board ownership, clear tone from the top, named accountable executives"],
          ["Risk assessment", "A documented, regularly updated assessment of where associated persons could commit fraud for your benefit"],
          ["Proportionate procedures", "Controls matched to the risks identified, not generic policies"],
          ["Due diligence", "Checks on the people and partners who act on your behalf"],
          ["Communication and training", "Staff understand the policy and how to speak up"],
          ["Monitoring and review", "Testing whether controls work and improving them"],
        ],
      },
      { type: "h2", text: "Companies House identity verification" },
      {
        type: "p",
        text: "Identity verification became a legal requirement on 18 November 2025. New directors must verify before they can be appointed, and existing directors and PSCs were given a 12-month transition, generally tied to their next confirmation statement or an appointed date. Verification can be done directly with Companies House through GOV.UK One Login, or through an Authorised Corporate Service Provider.",
      },
      {
        type: "p",
        text: "With the transition window now closed, the register shows whether each director and PSC has verified. That is useful information for KYB — but it does not replace your own due diligence.",
      },
      { type: "h2", text: "What this means for compliance teams" },
      {
        type: "ol",
        items: [
          "If your organisation is in scope of the fraud offence, make sure the fraud risk assessment exists, is current, and covers agents, introducers and subsidiaries.",
          "Add verification status from the Companies House register to your KYB checks for UK companies, and treat unverified directors or PSCs as a reason to ask questions.",
          "Keep verifying beneficial ownership independently: register data is self-declared and a verified identity does not prove the ownership structure is complete.",
          "Report discrepancies between what customers tell you and what the register shows, where your regime requires it.",
        ],
      },
      {
        type: "callout",
        text: "WorldAML Suite helps teams run KYB checks, screen directors and owners, and keep a full audit trail of each review. Learn more at /contact-sales, or take our UK AML Training Course at /academy/aml-uk.",
      },
    ],
  },
  {
    slug: "aml-obligations-accountants-lawyers-tcsps",
    title: "AML Obligations for Accountants, Lawyers and Trust and Company Service Providers",
    description:
      "A practical guide to AML duties for accountants, lawyers, notaries and trust and company service providers: when the rules apply, due diligence, red flags, reporting and tipping off.",
    category: "AML Compliance",
    date: "2026-12-04",
    readTime: 9,
    author: "WorldAML Compliance Team",
    authorTitle: "Compliance Research",
    tags: ["DNFBP", "accountants AML", "lawyers AML", "TCSP", "professional services", "FATF Recommendation 22"],
    relatedSlugs: ["beneficial-ownership-guide", "edd-vs-sdd-enhanced-simplified-due-diligence", "aml-real-estate-property-transactions"],
    content: [
      {
        type: "intro",
        text: "Criminals rarely need a bank's help alone to launder money — they need companies set up, trusts formed, property bought and funds moved through client accounts. That is why international standards treat accountants, lawyers, notaries and trust and company service providers (TCSPs) as gatekeepers with their own AML obligations. Supervisors continue to find weak risk assessments and poor beneficial ownership checks across these sectors.",
      },
      { type: "h2", text: "When do the rules apply?" },
      {
        type: "p",
        text: "Under FATF Recommendation 22, which most national regimes follow, lawyers, notaries, other independent legal professionals and accountants are covered when they prepare for or carry out certain transactions for clients. TCSPs are covered for the corporate and trust services they provide.",
      },
      {
        type: "ul",
        items: [
          "Buying and selling real estate or businesses",
          "Managing client money, securities or other assets",
          "Managing bank, savings or securities accounts",
          "Organising contributions for creating, operating or managing companies",
          "Creating, operating or managing legal persons or arrangements, such as companies and trusts",
          "Acting as, or arranging for someone to act as, a director, nominee shareholder or trustee, or providing a registered office",
        ],
      },
      { type: "h2", text: "Core obligations" },
      {
        type: "table",
        headers: ["Obligation", "What it means in practice"],
        rows: [
          ["Firm-wide risk assessment", "A written assessment of how your services, clients and locations expose you to money laundering"],
          ["Client due diligence", "Identify and verify the client and beneficial owners, and understand the purpose of the work"],
          ["Enhanced due diligence", "Extra checks for PEPs, high-risk countries and complex or unusual structures"],
          ["Ongoing monitoring", "Keep client information current and watch for activity that no longer fits"],
          ["Reporting", "Report suspicions to your financial intelligence unit through your nominated officer"],
          ["Records and training", "Keep due diligence and transaction records, typically for at least five years, and train staff"],
        ],
      },
      { type: "h2", text: "Red flags specific to professional services" },
      {
        type: "ul",
        items: [
          "A client asks to use your client account to pass funds through without a related legal or accounting service.",
          "Complex ownership chains or offshore entities with no clear commercial reason.",
          "Reluctance to explain the source of funds or source of wealth, or explanations that change.",
          "Unusual urgency, or willingness to pay well above normal fees for speed.",
          "Instructions that are changed at the last minute to send money to a different party.",
          "Nominee directors or shareholders where the real controller is hard to identify.",
        ],
      },
      { type: "h2", text: "Legal privilege and tipping off" },
      {
        type: "p",
        text: "Many regimes recognise legal professional privilege, which can affect when a lawyer must report. The boundaries are narrow and vary by country, so firms need clear internal guidance and access to their nominated officer. Separately, telling a client — even indirectly — that a report has been made or is being considered can be a criminal offence. Train fee earners on how to pause work without tipping off.",
      },
      { type: "h2", text: "Making it workable for smaller firms" },
      {
        type: "ol",
        items: [
          "Use a standard client risk form for every new matter, so risk scoring is consistent.",
          "Screen clients and beneficial owners against sanctions and PEP lists at onboarding and when lists change.",
          "Keep a simple log of reviews, decisions and the reasons behind them.",
          "Refresh client files on a risk-based schedule rather than only when a new matter opens.",
        ],
      },
      {
        type: "callout",
        text: "WorldAML Suite gives professional firms sanctions and PEP screening, beneficial ownership checks and an audit-ready record of every decision. Explore the WorldAML Academy at /academy or contact us at /contact-sales.",
      },
    ],
  },
  {
    slug: "aml-certifications-compared",
    title: "AML Certifications Compared: Which One Is Right for Your Career?",
    description:
      "A plain comparison of AML certifications — free entry-level certificates, ICA qualifications, ACAMS's CAMS and specialist credentials — and how to choose based on your role and experience.",
    category: "AML Compliance",
    date: "2026-12-08",
    readTime: 7,
    author: "WorldAML Compliance Team",
    authorTitle: "Compliance Research",
    tags: ["AML certification", "CAMS", "ICA", "free AML certification", "CPD", "AML training"],
    relatedSlugs: ["how-to-become-aml-analyst", "mlro-responsibilities-obligations", "aml-compliance-checklist-2025"],
    content: [
      {
        type: "intro",
        text: "Search for 'AML certification' and you will find everything from free online certificates to qualifications that take months of study. They serve different purposes. The right choice depends on where you are in your career, what your employer expects and how much time and money you can invest.",
      },
      { type: "h2", text: "The main types of AML certification" },
      {
        type: "table",
        headers: ["Type", "Best for", "Typical commitment"],
        rows: [
          ["Free or low-cost online certificates", "Newcomers, career changers, staff who need awareness training", "A few hours; online assessment"],
          ["ICA certificates and diplomas", "People building a UK or international compliance career", "Weeks to months of structured study and assessment"],
          ["ACAMS CAMS", "Experienced professionals wanting a widely recognised global credential", "Eligibility requirements, self-study and a proctored exam"],
          ["Specialist credentials", "Analysts focusing on sanctions, fraud or financial crime investigations", "Varies by issuer"],
        ],
      },
      { type: "h2", text: "Entry-level certificates" },
      {
        type: "p",
        text: "If you are new to compliance, start with a course that teaches the fundamentals: what money laundering is, the risk-based approach, customer due diligence, sanctions, red flags and reporting. Look for a final assessment with a real pass mark, a certificate employers can verify online, and CPD hours you can log.",
      },
      { type: "h2", text: "ICA qualifications" },
      {
        type: "p",
        text: "The International Compliance Association offers a ladder of AML qualifications, from introductory certificates to advanced certificates and diplomas. They are well known in the UK and in many international financial centres and suit people who want structured, assessed learning over several months.",
      },
      { type: "h2", text: "ACAMS CAMS" },
      {
        type: "p",
        text: "The Certified Anti-Money Laundering Specialist (CAMS) credential from ACAMS is one of the most recognised AML qualifications worldwide, particularly in banking and in the US. It requires meeting eligibility criteria, preparing for a substantial exam and maintaining the credential over time. Many candidates take it after a few years in the field, often with employer funding.",
      },
      { type: "h2", text: "How to choose" },
      {
        type: "ol",
        items: [
          "Check job adverts for the roles you want — they show which credentials employers in your market actually ask for.",
          "Start with fundamentals before paying for an advanced qualification; it makes the advanced material far easier.",
          "Ask your employer about funding and study leave; many support recognised qualifications.",
          "Pick a specialism once you know your direction — sanctions, transaction monitoring, investigations or governance.",
          "Keep a CPD log: certificates and hours earned show ongoing development at interviews and appraisals.",
        ],
      },
      {
        type: "callout",
        text: "WorldAML Academy's AML Fundamentals course is free: pass the assessment with 80% or more to earn a verifiable, CPD-accredited certificate. Specialist courses on KYC, sanctions and more are available when you're ready. Start at /academy.",
      },
    ],
  },
];

/** Live posts only, newest first. */
export function getPublishedPosts(now: Date = new Date()): BlogPost[] {
  return blogPosts
    .filter((p) => isPostPublished(p, now))
    .sort((a, b) => b.date.localeCompare(a.date));
}
