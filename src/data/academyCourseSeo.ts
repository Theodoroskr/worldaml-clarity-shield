/**
 * Search snippets for each public Academy course page (/academy/<slug>).
 *
 * Used in two places so they always agree:
 *  - plugins/seo-prerender.ts writes them into the static HTML each course URL
 *    serves before JavaScript runs (what crawlers see first);
 *  - src/pages/AcademyCourse.tsx sets the same title/description at runtime.
 *
 * Budgets: Google cuts titles around 60 characters and descriptions around
 * 158. The SEO component appends " | WorldAML" (11 chars), so titles here stay
 * at or under 49 characters and descriptions at or under 158.
 * Checked by src/test/academy-course-seo.test.ts, which also fails when a
 * course in the pricing map has no entry here.
 *
 * Only courses a visitor can actually start or buy belong here — this list
 * also drives the Academy URLs in the sitemap.
 */
export interface AcademyCourseSeo {
  title: string;
  description: string;
}

export const ACADEMY_COURSE_SEO: Record<string, AcademyCourseSeo> = {
  // ── Free ──────────────────────────────────────────────────────────
  "aml-fundamentals": {
    title: "AML Fundamentals Course — Free CPD Certificate",
    description:
      "Free online AML course: the three stages of money laundering, FATF rules, red flags and SAR filing. 25 minutes, CPD-accredited, verifiable certificate.",
  },
  "sanctions-screening-essentials": {
    title: "Sanctions Screening Course — Free Certificate",
    description:
      "Free sanctions screening training: OFAC, EU, UN and UK regimes, fuzzy matching, false positives and handling a hit. CPD-accredited, verifiable certificate.",
  },

  // ── Foundational & regional ───────────────────────────────────────
  "kyc-customer-due-diligence": {
    title: "KYC & Customer Due Diligence Training Course",
    description:
      "KYC and CDD training: risk-based due diligence, KYB and UBO checks, simplified vs enhanced due diligence and periodic reviews. CPD-accredited certificate.",
  },
  "aml-europe": {
    title: "EU AML Training Course — AMLR, AMLD6 & AMLA",
    description:
      "EU AML compliance course: AMLD5, AMLD6, the new AML Regulation and AMLA, EDD rules, UBO registers and suspicious transaction reporting. CPD certificate.",
  },
  "aml-uk": {
    title: "UK AML Training Course — MLR 2017 & POCA",
    description:
      "UK AML compliance course: MLR 2017, POCA 2002, FCA and HMRC supervision, SARs, source of funds checks and post-Brexit sanctions screening. CPD certificate.",
  },
  "aml-gcc-mena": {
    title: "GCC & MENA AML Training Course (UAE, KSA)",
    description:
      "AML compliance across the UAE, Saudi Arabia, Qatar and the Gulf: MENAFATF, hawala, trade-based laundering, PEP due diligence and goAML. CPD certificate.",
  },
  "aml-asia-pacific": {
    title: "Asia-Pacific AML Training Course",
    description:
      "AML compliance in Singapore, Hong Kong, Japan and Australia: MAS, HKMA, JFSA and AUSTRAC rules, regional typologies and source of wealth. CPD certificate.",
  },
  "aml-americas": {
    title: "Americas AML Training Course — BSA & FINTRAC",
    description:
      "AML compliance in the US, Canada and Latin America: BSA/FinCEN, the Corporate Transparency Act, FINTRAC reporting and OFAC sanctions. CPD certificate.",
  },
  "aml-africa": {
    title: "Africa AML Training Course",
    description:
      "AML compliance across African jurisdictions: ESAAMLG and GIABA frameworks, mobile-money risk, extractive industries and PEP screening. CPD certificate.",
  },
  "aml-cis": {
    title: "CIS AML & Sanctions Training Course",
    description:
      "AML and sanctions compliance in CIS countries: Eurasian Group standards, Rosfinmonitoring, Kazakhstan, correspondent banking and evasion risk. CPD certificate.",
  },

  // ── Specialisations ───────────────────────────────────────────────
  "pep-screening-edd": {
    title: "PEP Screening & EDD Training Course",
    description:
      "Identify politically exposed persons, relatives and close associates, then apply risk-based enhanced due diligence that stands up to audit. CPD certificate.",
  },
  "adverse-media-intelligence": {
    title: "Adverse Media Screening Training Course",
    description:
      "Adverse media screening training: news feeds and open-source intelligence, judging relevance, severity and recency, and documenting decisions. CPD certificate.",
  },
  "beneficial-ownership": {
    title: "Beneficial Ownership & UBO Training Course",
    description:
      "Ultimate beneficial ownership rules under FATF, EU AMLD and the US Corporate Transparency Act, plus tracing complex structures and nominees. CPD certificate.",
  },
  "beneficial-ownership-ubo-transparency": {
    title: "UBO Transparency & Verification Course",
    description:
      "Advanced UBO course: global transparency registers, ownership verification techniques and the regulation driving corporate disclosure. CPD-accredited.",
  },
  "transaction-monitoring-sar": {
    title: "Transaction Monitoring & SAR Training Course",
    description:
      "Transaction monitoring training: rule design, threshold tuning and SAR/STR filing across wires, trade-based laundering and crypto. CPD-accredited certificate.",
  },
  "risk-based-approach": {
    title: "Risk-Based Approach to AML Training Course",
    description:
      "Apply the FATF risk-based approach: customer risk scoring, country and product risk matrices and residual risk management. CPD-accredited certificate.",
  },
  "international-sanctions-compliance": {
    title: "International Sanctions Compliance Course",
    description:
      "Advanced sanctions course: global regimes, screening obligations, evasion typologies and building an effective sanctions programme. CPD certificate.",
  },
  "crypto-aml": {
    title: "Crypto AML & VASP Compliance Training Course",
    description:
      "Crypto AML training for VASPs: the FATF Travel Rule, blockchain analytics, DeFi risk and exchange compliance programmes. CPD-accredited certificate.",
  },
  "crypto-aml-essentials": {
    title: "Crypto AML Essentials Course",
    description:
      "Crypto AML for compliance officers new to digital assets: blockchains, wallets and the risks they create, mapped to FATF, MiCA and FinCEN. CPD certificate.",
  },
  "tbml-export-controls": {
    title: "Trade-Based Money Laundering (TBML) Course",
    description:
      "Advanced TBML training: over- and under-invoicing, phantom shipments, shell trading networks, dual-use goods and sanctions evasion. CPD-accredited.",
  },
  "aml-fintechs-payments": {
    title: "AML for Fintechs & Payments Training Course",
    description:
      "Build a scalable fintech AML programme: PSP and EMI rules, onboarding at volume, instant-payment monitoring and mule detection. CPD-accredited certificate.",
  },
  "source-of-funds-wealth": {
    title: "Source of Funds & Source of Wealth Course",
    description:
      "Verify source of funds and source of wealth: evidence standards, corroboration, PEP-linked wealth and defensible records. CPD-accredited EDD training.",
  },
  "terrorist-financing-essentials": {
    title: "Terrorist Financing Training Course",
    description:
      "Counter-terrorist financing training: how it differs from money laundering, FATF Recommendations 5–8, NPO risk, hawala and crowdfunding abuse. CPD certificate.",
  },
  "mlro-masterclass": {
    title: "MLRO Training Course — The MLRO Masterclass",
    description:
      "Advanced training for MLROs and deputies: personal liability, governance, board reporting, regulator relationships and SAR decisions. CPD-accredited.",
  },

  // ── Sector track ──────────────────────────────────────────────────
  "aml-law-firms": {
    title: "AML Training Course for Law Firms",
    description:
      "AML training for solicitors and law firms: SRA expectations, which work is regulated, source of funds checks and tipping-off risk. CPD-accredited certificate.",
  },
  "aml-accountancy": {
    title: "AML Training Course for Accountants",
    description:
      "AML training for accountants, auditors and bookkeepers: MLR 2017, AAT, ICAEW and ACCA guidance and practice-wide risk assessments. CPD-accredited certificate.",
  },
  "aml-real-estate": {
    title: "AML Training Course for Real Estate Agents",
    description:
      "AML training for estate agents: high-value dealer rules, beneficial ownership, third-party payments and red flags in property sales and lettings. CPD certificate.",
  },
  "aml-gaming-gambling": {
    title: "AML Training for Gaming & Gambling Operators",
    description:
      "AML training for casinos, sportsbooks and iGaming: UKGC, MGA and FATF expectations, customer interaction, chip dumping and bonus abuse. CPD-accredited certificate.",
  },
};

/** Course slugs with a public page — drives the Academy sitemap entries. */
export const PUBLIC_ACADEMY_COURSE_SLUGS = Object.keys(ACADEMY_COURSE_SEO).sort();
