import {
  Bitcoin,
  FileCheck,
  Shield,
  AlertTriangle,
  Users,
  Scale,
  Network,
  ClipboardCheck,
} from "lucide-react";
import USIndustryLanding, {
  type USIndustryLandingConfig,
} from "@/components/landing/USIndustryLanding";
import { GUIDE_LINKS } from "@/components/RelatedGuidesSection";

/**
 * US crypto / VASP AML landing page.
 * Intent: crypto aml software, vasp compliance software, travel rule solution us,
 * blockchain analytics aml, digital asset compliance software.
 */
const config: USIndustryLandingConfig = {
  path: "/compliance-software/us/crypto",
  eyebrow: "United States · Crypto & Digital Assets",
  h1: "Crypto AML compliance software for US exchanges and VASPs",
  seoTitle: "Crypto & VASP AML Compliance Software (US)",
  seoDescription:
    "AML compliance software for US crypto exchanges, custodians and VASPs — FinCEN MSB program, Travel Rule, OFAC wallet screening, SAR filing and on-chain transaction monitoring.",
  breadcrumbName: "US Crypto & Digital Assets",
  softwareName: "WorldAML Crypto AML Compliance Software (US)",
  audienceType:
    "Crypto exchanges, custodians, brokers, ATM operators and digital asset platforms (United States)",
  heroIntro:
    "WorldAML gives digital asset businesses a defensible BSA program: FinCEN MSB obligations, state money transmitter and NYDFS expectations, Travel Rule data exchange, OFAC wallet and address screening, and monitoring that reads both fiat rails and on-chain flows.",
  heroFootnote:
    "Built for FinCEN-registered exchanges, custodians, OTC desks, crypto ATM operators and NYDFS BitLicense holders.",
  regulatorsHeading: "Aligned to the US digital asset regulatory stack",
  regulatorsIntro:
    "Federal MSB rules, state licensing regimes and sanctions obligations — evidenced from one system of record.",
  regulators: [
    {
      name: "FinCEN (31 CFR 1022) — convertible virtual currency",
      desc: "Exchangers and administrators of convertible virtual currency are money transmitters: register as an MSB, maintain a risk-based AML program, file SARs and CTRs, and follow FinCEN's 2019 CVC guidance.",
    },
    {
      name: "Funds Travel Rule & Recordkeeping Rule",
      desc: "Originator and beneficiary information must accompany qualifying transmittals of $3,000 or more, including where value moves between VASPs — captured, transmitted and retained with counterparty evidence.",
    },
    {
      name: "OFAC",
      desc: "Sanctions obligations extend to wallet addresses and mixing services. Screen customers, counterparties and on-chain addresses against SDN listings, including designated addresses and the 50 Percent Rule.",
    },
    {
      name: "NYDFS BitLicense & Part 504",
      desc: "New York licensees face heightened transaction-monitoring and filtering program requirements with annual certification — supported by documented tuning, testing and governance records.",
    },
    {
      name: "State money transmitter licensing (NMLS)",
      desc: "Most states treat digital asset transmission as money transmission. Examination findings, permissible investment reporting and remediation are tracked with owners and evidence.",
    },
    {
      name: "SEC & CFTC perimeter considerations",
      desc: "Where products touch securities or derivatives, customer, product and counterparty records are retained in a form that supports parallel regulatory requests.",
    },
  ],
  featuresHeading: "Everything a VASP compliance program needs",
  featuresIntro:
    "On-chain and off-chain risk in one case file — so investigations don't require three tools and a spreadsheet.",
  features: [
    {
      icon: Users,
      title: "KYC, KYB & source of funds",
      desc: "Identity verification and document capture for retail users, business verification with beneficial ownership for institutional accounts, and structured source-of-funds and source-of-wealth for high-value activity.",
    },
    {
      icon: Shield,
      title: "Wallet & address screening",
      desc: "Screen deposit and withdrawal addresses against sanctioned addresses, mixers, darknet markets, ransomware clusters and high-risk exchange counterparties before value moves.",
    },
    {
      icon: Network,
      title: "Travel Rule data exchange",
      desc: "Capture, validate, transmit and retain originator and beneficiary information on qualifying transfers, with counterparty VASP records and unhosted-wallet handling.",
    },
    {
      icon: AlertTriangle,
      title: "On-chain & fiat monitoring",
      desc: "Detection for structuring across fiat ramps, peel chains, rapid chain-hopping, mixer exposure, dormant-wallet reactivation and account-takeover patterns.",
    },
    {
      icon: FileCheck,
      title: "SAR filing with crypto narratives",
      desc: "Narrative builder that includes wallet addresses, transaction hashes and chain context in the format FinCEN expects, with 30/60-day deadline tracking.",
    },
    {
      icon: Scale,
      title: "Sanctions & jurisdiction controls",
      desc: "Geoblocking evidence, IP and device signals, and jurisdiction risk scoring documented alongside every account decision.",
    },
    {
      icon: ClipboardCheck,
      title: "Part 504-style testing evidence",
      desc: "Versioned rule logic, tuning rationale, backtesting results, model validation notes and training records exported as a certification-ready pack.",
    },
    {
      icon: Bitcoin,
      title: "Multi-asset, multi-chain coverage",
      desc: "One customer file across chains, tokens and fiat rails, so risk scoring reflects the customer's full activity rather than a single asset view.",
    },
  ],
  useCasesHeading: "Built for every US digital asset business model",
  useCases: [
    {
      title: "Centralised exchanges",
      desc: "High-volume retail onboarding, real-time address screening at deposit and withdrawal, and monitoring that scales without scaling the analyst team.",
    },
    {
      title: "Custodians & institutional platforms",
      desc: "Institutional KYB with UBO mapping, counterparty VASP due diligence and detailed Travel Rule records for large transfers.",
    },
    {
      title: "OTC desks & brokers",
      desc: "Enhanced due diligence on large-ticket counterparties, source-of-funds documentation and settlement-counterparty screening.",
    },
    {
      title: "Crypto ATM operators",
      desc: "Per-kiosk risk, cash aggregation for CTR thresholds, elder-exploitation and scam-victim typologies, and state-by-state reporting.",
    },
    {
      title: "Payment & stablecoin platforms",
      desc: "Merchant onboarding, on-chain settlement monitoring and issuer-grade sanctions controls for token flows.",
    },
    {
      title: "DeFi-adjacent and hybrid services",
      desc: "Where a regulated entity sits at the fiat perimeter, document the control boundary, screening logic and the risk decisions behind it.",
    },
  ],
  checklistHeading: "What a FinCEN or NYDFS examiner will ask for",
  checklist: [
    "A written, risk-based AML program with a designated and qualified compliance officer, plus current MSB registration and state licences.",
    "A documented risk assessment covering assets, chains, customer types, jurisdictions and delivery channels.",
    "Evidence that Travel Rule data is captured, transmitted and retained on qualifying transfers, including unhosted-wallet policy.",
    "Address screening logic, sanctioned-address hit handling and blocked-property reporting records.",
    "SAR decisioning records with wallet and hash-level detail — including alerts reviewed and not filed, with rationale.",
    "Transaction-monitoring and filtering program testing, tuning history and annual certification support.",
  ],
  checklistOutro:
    "WorldAML produces every one of these artifacts as a dated, immutable export — so exam and certification cycles stop consuming your compliance quarter.",
  faqsHeading: "Crypto AML compliance — FAQ",
  faqs: [
    {
      q: "Is a US crypto exchange an MSB?",
      a: "Under FinCEN's 2019 guidance, exchangers and administrators of convertible virtual currency are money transmitters and therefore MSBs. That means FinCEN registration, a written risk-based AML program, SAR and CTR filing, recordkeeping, and — in most states — money transmitter licensing on top.",
    },
    {
      q: "How does the Travel Rule apply to crypto transfers?",
      a: "For transmittals of $3,000 or more, originator and beneficiary information must be collected, transmitted to the next financial institution and retained for five years. WorldAML captures and validates the required fields, records the counterparty VASP, applies your unhosted-wallet policy, and keeps the data retrievable per transfer.",
    },
    {
      q: "Do you screen wallet addresses against OFAC?",
      a: "Yes. Deposit and withdrawal addresses are screened against sanctioned addresses and high-risk clusters — mixers, darknet markets, ransomware and sanctioned exchange exposure — before value moves, with blocked-property handling and reporting evidence.",
    },
    {
      q: "Can it support a NYDFS Part 504 annual certification?",
      a: "Yes. Rule logic is versioned, every tuning change is recorded with rationale and backtesting results, testing and validation notes are stored with the model, and the full package exports as a dated certification-support pack.",
    },
    {
      q: "How do you handle unhosted wallets?",
      a: "You define the policy — thresholds, attestation requirements, ownership proof and enhanced review triggers — and the platform enforces it consistently, logging each decision so your treatment is demonstrably uniform.",
    },
    {
      q: "Does on-chain risk feed the customer risk score?",
      a: "Yes. Counterparty exposure, mixer proximity and high-risk cluster interaction feed the composite customer risk score alongside KYC, geography and product factors, so a single score drives review cadence and EDD triggers.",
    },
    {
      q: "How quickly can we implement?",
      a: "Most VASPs are live in weeks: connect fiat and on-chain data, provision the digital-asset rule pack, tune with backtesting against your own history, then run parallel to existing controls before cutover.",
    },
  ],
  demoHeading: "Book a walkthrough with a digital assets compliance specialist",
  demoIntro:
    "We'll show WorldAML configured for your assets, chains and licence footprint — address screening, Travel Rule, monitoring and SAR filing with chain-level detail.",
  demoBullets: [
    "30-minute session tailored to your chains and licence footprint",
    "Travel Rule and Part 504 readiness review",
    "USD pricing and integration timeline",
  ],
  form: {
    formType: "crypto-aml-demo-us",
    industry: "Cryptocurrency",
    segmentLabel: "Business type",
    segmentOptions: [
      "Centralised exchange",
      "Custodian / institutional platform",
      "OTC desk or broker",
      "Crypto ATM operator",
      "Payments or stablecoin platform",
      "Wallet or infrastructure provider",
      "Other digital asset business",
    ],
    heading: "Request a crypto AML demo",
    intro:
      "Tell us about your assets and licence footprint and we'll tailor the walkthrough to your screening, Travel Rule and monitoring needs.",
    messagePlaceholder:
      "e.g. address screening at withdrawal, Travel Rule counterparties, Part 504 certification, mixer exposure rules…",
  },
  ctaHeading: "Ready for your next FinCEN or NYDFS exam?",
  ctaBody:
    "Get a walkthrough of WorldAML configured for your assets, chains and licence footprint — priced in USD.",
  secondaryCta: { to: "/platform/aml-screening", label: "Explore the screening platform" },
  relatedIntro:
    "Related US regulator context, screening tooling and digital asset compliance resources.",
  relatedLinks: [
    GUIDE_LINKS.csUS,
    GUIDE_LINKS.usGuide,
    GUIDE_LINKS.fintechUS,
    GUIDE_LINKS.bankUS,
    GUIDE_LINKS.casinoUS,
    GUIDE_LINKS.travelRule,
    GUIDE_LINKS.sanctionsSoftware,
    GUIDE_LINKS.compareProviders,
  ],
};

const CryptoAMLComplianceUS = () => <USIndustryLanding config={config} />;

export default CryptoAMLComplianceUS;
