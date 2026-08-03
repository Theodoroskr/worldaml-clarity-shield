import {
  Building2,
  FileCheck,
  Shield,
  AlertTriangle,
  Users,
  Scale,
  Landmark,
  ClipboardCheck,
} from "lucide-react";
import USIndustryLanding, {
  type USIndustryLandingConfig,
} from "@/components/landing/USIndustryLanding";
import { GUIDE_LINKS } from "@/components/RelatedGuidesSection";

/**
 * US banks & credit unions AML landing page.
 * Intent: bsa aml software for banks, ffiec compliance software,
 * sar filing software, ctr filing software, credit union aml software.
 */
const config: USIndustryLandingConfig = {
  path: "/compliance-software/us/banks",
  eyebrow: "United States · Banks & Credit Unions",
  h1: "BSA/AML compliance software for US banks and credit unions",
  seoTitle: "BSA/AML Software for US Banks & Credit Unions",
  seoDescription:
    "FFIEC-aligned BSA/AML software for US banks and credit unions — CDD/beneficial ownership, CTR and SAR filing, OFAC screening, transaction monitoring and exam-ready audit trails.",
  breadcrumbName: "US Banks & Credit Unions",
  softwareName: "WorldAML BSA/AML Compliance Software for US Banks",
  audienceType:
    "Community banks, regional banks, credit unions and trust companies (United States)",
  heroIntro:
    "WorldAML gives BSA officers one platform for the five pillars: customer due diligence and beneficial ownership, CTR and SAR filing, OFAC and PEP screening, risk-based transaction monitoring, and the independent-testing evidence your FFIEC examiner expects.",
  heroFootnote:
    "Used by OCC-, FDIC-, Federal Reserve- and NCUA-supervised institutions, from single-branch credit unions to multi-state regional banks.",
  regulatorsHeading: "Aligned to the US banking supervisory stack",
  regulatorsIntro:
    "Federal BSA obligations, prudential examination expectations and sanctions rules — evidenced from one system of record.",
  regulators: [
    {
      name: "Bank Secrecy Act & 31 CFR Chapter X",
      desc: "Written, risk-based AML program with a designated BSA officer, CTR and SAR filing, recordkeeping, and the CDD Final Rule's beneficial-ownership requirements for legal entity customers.",
    },
    {
      name: "FFIEC BSA/AML Examination Manual",
      desc: "Examination modules for risk assessment, internal controls, independent testing, training and the CIP/CDD/EDD chain — mapped to artifacts the platform produces automatically.",
    },
    {
      name: "FinCEN",
      desc: "SAR (Form 111) and CTR (Form 112) filing, 314(a) and 314(b) information sharing, advisories, and the AML Act of 2020's national priorities.",
    },
    {
      name: "OCC, FDIC, Federal Reserve & NCUA",
      desc: "Prudential supervisors examine BSA/AML at each cycle. Matters Requiring Attention (MRAs) and consent orders are tracked as remediation items with evidence and owners.",
    },
    {
      name: "OFAC",
      desc: "Strict-liability sanctions screening across customers, counterparties, wires and ACH — SDN, consolidated lists, sectoral programs and the 50 Percent Rule.",
    },
    {
      name: "USA PATRIOT Act §312 / §326",
      desc: "Correspondent and private banking due diligence plus Customer Identification Program controls, with structured EDD questionnaires and MLRO-equivalent sign-off.",
    },
  ],
  featuresHeading: "Everything a bank BSA program needs",
  featuresIntro:
    "Purpose-built modules for retail, commercial, wire and correspondent activity — with the audit trail examiners ask for.",
  features: [
    {
      icon: Users,
      title: "CIP, CDD & beneficial ownership",
      desc: "Digital account opening with identity verification, legal-entity beneficial ownership capture to 25%, control-person certification and refresh cycles tied to risk rating.",
    },
    {
      icon: FileCheck,
      title: "CTR & SAR filing workflow",
      desc: "Automatic $10,000 CTR aggregation with exemption handling, plus SAR narrative builder, 30/60-day deadline tracking and continuing-activity reviews.",
    },
    {
      icon: AlertTriangle,
      title: "Risk-based transaction monitoring",
      desc: "Structuring, rapid movement of funds, unusual ACH and wire patterns, cash-intensive business anomalies and elder financial exploitation typologies — all tunable with backtesting.",
    },
    {
      icon: Shield,
      title: "OFAC, PEP & adverse media screening",
      desc: "Real-time and batch screening against 1,900+ lists with per-customer false-positive memory, so cleared matches stop re-alerting.",
    },
    {
      icon: Landmark,
      title: "Correspondent & MSB customer risk",
      desc: "Enhanced due diligence for foreign correspondents, MSB and crypto-adjacent deposit customers, with ownership-network screening and periodic reassessment.",
    },
    {
      icon: Scale,
      title: "Institution risk assessment",
      desc: "Documented, versioned BSA/AML risk assessment across products, customers, channels and geographies — refreshed as your portfolio changes.",
    },
    {
      icon: ClipboardCheck,
      title: "Independent testing evidence",
      desc: "Immutable audit log, rule-tuning history, training completion by role and issue tracking, exported as a dated pack for auditors and examiners.",
    },
    {
      icon: Building2,
      title: "Multi-charter & branch rollups",
      desc: "Branch- and charter-level controls with holding-company rollup reporting for institutions operating across several states.",
    },
  ],
  useCasesHeading: "Built for every US depository institution",
  useCases: [
    {
      title: "Community banks",
      desc: "A right-sized BSA program with automated CTR aggregation and a monitoring rule pack that a two-person compliance team can actually tune and defend.",
    },
    {
      title: "Credit unions",
      desc: "NCUA-aligned member due diligence, share-draft and ACH monitoring, and elder-exploitation detection with board-ready reporting.",
    },
    {
      title: "Regional & multi-state banks",
      desc: "Segmented risk models by line of business, case queues with SLAs and assignees, and holding-company rollups for consolidated oversight.",
    },
    {
      title: "Trust & private banking",
      desc: "§312 enhanced due diligence, source-of-wealth documentation and beneficial-ownership mapping across trusts and complex structures.",
    },
    {
      title: "Banks serving MSBs & fintechs",
      desc: "Programme-level oversight of sponsored fintech partners and MSB deposit relationships, with per-partner risk scoring and periodic reviews.",
    },
    {
      title: "De novo & digital banks",
      desc: "Stand up a documented, examinable BSA program before your first exam cycle, with policy artifacts and evidence produced from day one.",
    },
  ],
  checklistHeading: "What an FFIEC examiner will ask for",
  checklist: [
    "A written, board-approved BSA/AML program with a designated and qualified BSA officer.",
    "A current, documented risk assessment covering products, customers, channels and geographies.",
    "CIP and beneficial-ownership records for legal entity customers, with refresh evidence.",
    "CTR filing accuracy and exemption documentation, plus SAR decisioning records — including the alerts you reviewed and chose not to file, with rationale.",
    "Independent testing results with issue tracking, owners and evidence of remediation.",
    "Training records by role, including the board, front line, operations and audit.",
  ],
  checklistOutro:
    "WorldAML produces every one of these artifacts as a dated, immutable export — so exam preparation stops being a three-week fire drill.",
  faqsHeading: "BSA/AML software for banks — FAQ",
  faqs: [
    {
      q: "Does WorldAML support CTR filing and exemptions?",
      a: "Yes. Cash transactions are aggregated per customer per business day with automatic $10,000 CTR triggers, Phase I and Phase II exemption tracking with biennial renewal reminders, and structured FinCEN Form 112 output.",
    },
    {
      q: "How does the SAR workflow handle the 30/60-day deadline?",
      a: "The clock starts at initial detection, which is recorded automatically on the alert. Cases display the 30-day deadline (60 days where no subject is identified), escalate as they approach, and support 90-day continuing-activity reviews with linked prior filings.",
    },
    {
      q: "Can it satisfy the CDD Final Rule's beneficial ownership requirement?",
      a: "Yes. Legal entity customers complete a structured beneficial-ownership certification covering 25% ownership and the control prong, with each individual screened against sanctions, PEP and adverse-media data and re-verified on trigger events.",
    },
    {
      q: "Do you support 314(a) and 314(b) information sharing?",
      a: "314(a) subject lists can be run as batch searches across your customer and transaction records with documented results and retention. 314(b) sharing is supported through case-level exports with an access-logged audit trail.",
    },
    {
      q: "Is the monitoring tunable, or is it a black box?",
      a: "Every rule is inspectable and tunable, and you can backtest a proposed change against your own historical transactions to see the alert-volume and hit-rate impact before you deploy it. Tuning decisions are versioned for independent testing.",
    },
    {
      q: "How does it help with an MRA or consent order?",
      a: "Remediation items are tracked with owners, due dates and linked evidence, and the audit log shows exactly what changed and when — which is the artifact examiners request when validating remediation.",
    },
    {
      q: "How long does implementation take?",
      a: "Most institutions are live in weeks: import customer and transaction history, provision the FFIEC-aligned rule pack, tune with backtesting against your own data, then run parallel to your existing system before cutover.",
    },
  ],
  demoHeading: "Book a walkthrough with a BSA/AML specialist",
  demoIntro:
    "We'll show WorldAML configured for your charter type, asset size and product mix — CDD, CTR and SAR filing, OFAC screening, and the evidence pack your examiner expects.",
  demoBullets: [
    "30-minute session tailored to your charter and supervisor",
    "FFIEC exam-readiness checklist review",
    "USD pricing and rollout timeline",
  ],
  form: {
    formType: "bank-aml-demo-us",
    industry: "Financial Services",
    segmentLabel: "Institution type",
    segmentOptions: [
      "Community bank",
      "Regional bank",
      "National bank",
      "Credit union",
      "Trust company",
      "Private bank / wealth management",
      "De novo or digital bank",
      "Other depository institution",
    ],
    heading: "Request an FFIEC-aligned demo",
    intro:
      "Tell us about your institution and we'll tailor the walkthrough to your CDD, CTR, SAR and OFAC workflows.",
    messagePlaceholder:
      "e.g. CTR exemption handling, SAR narrative quality, beneficial ownership refresh, monitoring tuning…",
  },
  ctaHeading: "Ready for your next BSA/AML exam?",
  ctaBody:
    "Get a walkthrough of WorldAML configured for your charter, asset size and customer base — priced in USD.",
  secondaryCta: { to: "/platform/aml-screening", label: "Explore the screening platform" },
  relatedIntro:
    "Related US regulator context, screening tooling and BSA/AML compliance resources.",
  relatedLinks: [
    GUIDE_LINKS.csUS,
    GUIDE_LINKS.usGuide,
    GUIDE_LINKS.fintechUS,
    GUIDE_LINKS.cryptoUS,
    GUIDE_LINKS.casinoUS,
    GUIDE_LINKS.sanctionsSoftware,
    GUIDE_LINKS.amlChecklist,
    GUIDE_LINKS.compareProviders,
  ],
};

const BankAMLComplianceUS = () => <USIndustryLanding config={config} />;

export default BankAMLComplianceUS;
