import {
  Rocket,
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
 * US fintech & MSB AML landing page.
 * Intent: fintech aml software, msb compliance software, fincen msb registration,
 * neobank kyc software, payments aml compliance us.
 */
const config: USIndustryLandingConfig = {
  path: "/compliance-software/us/fintechs",
  eyebrow: "United States · Fintechs, Payments & MSBs",
  h1: "AML compliance software for US fintechs, payments and MSBs",
  seoTitle: "Fintech & MSB AML Compliance Software (US)",
  seoDescription:
    "FinCEN MSB-ready AML software for US fintechs, neobanks, payments firms and money transmitters — KYC, OFAC screening, SAR and CTR filing, monitoring and sponsor-bank reporting.",
  breadcrumbName: "US Fintechs & MSBs",
  softwareName: "WorldAML AML Compliance Software for US Fintechs and MSBs",
  audienceType:
    "Fintechs, neobanks, payment processors, money transmitters and prepaid programs (United States)",
  heroIntro:
    "WorldAML gives fintech compliance teams a documented BSA program that survives sponsor-bank diligence and state examinations — onboarding KYC/KYB, OFAC screening, real-time monitoring, SAR and CTR filing, and the reporting your bank partner asks for every month.",
  heroFootnote:
    "Built for FinCEN-registered MSBs, state-licensed money transmitters and sponsor-bank programs operating across all 50 states.",
  regulatorsHeading: "Aligned to the US fintech regulatory stack",
  regulatorsIntro:
    "Federal MSB obligations, state money transmitter rules and sponsor-bank oversight — evidenced from one system of record.",
  regulators: [
    {
      name: "FinCEN MSB registration (31 CFR 1022)",
      desc: "Money services businesses must register with FinCEN, renew every two years, maintain a written risk-based AML program with a designated compliance officer, and file SARs and CTRs.",
    },
    {
      name: "State money transmitter licensing (NMLS)",
      desc: "State regulators examine licensed transmitters on AML program adequacy, permissible investments and consumer protection. Exam findings and remediation are tracked with owners and evidence.",
    },
    {
      name: "OFAC",
      desc: "Strict-liability sanctions screening across senders, recipients, cards and wallets — SDN, consolidated lists and the 50 Percent Rule, screened in real time at transaction speed.",
    },
    {
      name: "Sponsor bank oversight",
      desc: "Bank partners run programme-level diligence: policy artifacts, alert and SAR statistics, monitoring tuning history and KYC exception rates. Package all of it on a recurring schedule.",
    },
    {
      name: "Funds Travel Rule (31 CFR 1010.410)",
      desc: "Originator and beneficiary information must accompany transmittals of $3,000 or more, with recordkeeping for five years and structured retrieval for examiners.",
    },
    {
      name: "CFPB & UDAAP considerations",
      desc: "Complaint themes, account-closure reasons and adverse action records are logged alongside AML decisions so consumer-protection and financial-crime evidence stay consistent.",
    },
  ],
  featuresHeading: "Everything a fintech BSA program needs",
  featuresIntro:
    "API-first modules that fit into your onboarding and payments flow instead of forcing a separate manual process.",
  features: [
    {
      icon: Users,
      title: "KYC & KYB onboarding APIs",
      desc: "Identity verification, document capture and liveness for consumers, plus business verification with beneficial-ownership collection — embedded in your own signup flow.",
    },
    {
      icon: Shield,
      title: "Real-time OFAC & PEP screening",
      desc: "Low-latency screening at onboarding and per transaction against 1,900+ lists, with per-customer false-positive memory so cleared matches stop re-alerting.",
    },
    {
      icon: AlertTriangle,
      title: "Payments-native monitoring",
      desc: "Detection for structuring, mule networks, first-party fraud overlap, rapid in-out cycling, card-to-crypto flows, ACH return abuse and velocity anomalies.",
    },
    {
      icon: FileCheck,
      title: "SAR & CTR filing workflow",
      desc: "Narrative builder with 30/60-day deadline tracking, continuing-activity reviews, and automatic $10,000 cash aggregation where you handle currency.",
    },
    {
      icon: Network,
      title: "Sponsor-bank reporting pack",
      desc: "Scheduled exports of alert volumes, SAR counts, KYC pass rates, tuning changes and open issues — formatted for your bank partner's oversight committee.",
    },
    {
      icon: Scale,
      title: "Travel Rule data capture",
      desc: "Originator and beneficiary fields captured and retained on qualifying transmittals, retrievable per customer or per transaction for examiners.",
    },
    {
      icon: ClipboardCheck,
      title: "Independent review evidence",
      desc: "Immutable audit log, versioned risk assessment, tuning history and training records exported as a dated pack for your annual independent review.",
    },
    {
      icon: Rocket,
      title: "Scales with volume, not headcount",
      desc: "Risk-tiered automation clears low-risk cases straight through, so analyst time goes to the alerts that actually warrant investigation.",
    },
  ],
  useCasesHeading: "Built for every US fintech model",
  useCases: [
    {
      title: "Neobanks & BaaS programs",
      desc: "Sponsor-bank-ready onboarding, monitoring and reporting, with programme-level metrics your partner's compliance team can review each month.",
    },
    {
      title: "Payment processors & PayFacs",
      desc: "Merchant KYB, beneficial-ownership screening, ongoing merchant risk scoring and transaction-level monitoring across your submerchant book.",
    },
    {
      title: "Money transmitters & remittance",
      desc: "Corridor risk scoring, Travel Rule data capture, structuring detection across agents and state-by-state reporting for NMLS examinations.",
    },
    {
      title: "Prepaid & card programs",
      desc: "Load and reload monitoring, prepaid access rules, cardholder identification thresholds and agent oversight.",
    },
    {
      title: "Lending & earned-wage access",
      desc: "Applicant verification, sanctions screening, repayment-pattern anomalies and documented adverse-action reasoning.",
    },
    {
      title: "B2B and treasury platforms",
      desc: "Entity verification for corporate customers, UBO mapping through complex structures, and counterparty screening on outbound payment rails.",
    },
  ],
  checklistHeading: "What a sponsor bank or state examiner will ask for",
  checklist: [
    "A written, risk-based AML program with a designated and qualified compliance officer.",
    "Current FinCEN MSB registration and every applicable state money transmitter licence.",
    "A documented risk assessment covering products, customers, corridors and delivery channels.",
    "KYC/KYB records with beneficial ownership for business customers, plus exception and override logs.",
    "SAR decisioning records — including alerts reviewed and not filed, with rationale — and filing timeliness statistics.",
    "An annual independent review with issue tracking, owners and evidence of remediation.",
  ],
  checklistOutro:
    "WorldAML produces every one of these artifacts as a dated, immutable export — so diligence requests and exam prep stop derailing your roadmap.",
  faqsHeading: "Fintech AML compliance — FAQ",
  faqs: [
    {
      q: "Does my fintech need to register as an MSB with FinCEN?",
      a: "If you transmit funds, issue or sell prepaid access, exchange currency or deal in virtual currency on behalf of others, you are likely a money services business under 31 CFR 1022 and must register with FinCEN and renew every two years. Firms operating solely under a sponsor bank's charter may not register separately, but the bank will still hold you to an equivalent AML program — which is exactly what this platform documents.",
    },
    {
      q: "Can I embed KYC into my own onboarding flow?",
      a: "Yes. Verification, document capture and screening are available as APIs and white-labelled hosted forms, so your signup experience stays yours while decisions, evidence and audit trail land in the compliance platform.",
    },
    {
      q: "How does screening handle latency at transaction time?",
      a: "Screening runs against an in-memory index with fuzzy matching tuned for payments latency budgets, and per-customer whitelisting means previously cleared matches don't re-trigger and don't add review time.",
    },
    {
      q: "What does the sponsor bank reporting pack contain?",
      a: "Alert and case volumes, SAR counts and filing timeliness, KYC pass and exception rates, monitoring rule changes with tuning rationale, open issues with owners, and the current version of your risk assessment and policies — on whatever cadence your bank partner requires.",
    },
    {
      q: "Do you support the Funds Travel Rule?",
      a: "Yes. For transmittals of $3,000 or more, originator and beneficiary data is captured, validated and retained for five years, with per-customer and per-transaction retrieval for examiners.",
    },
    {
      q: "Can monitoring rules be tuned before we deploy them?",
      a: "Yes. Backtest any proposed rule or threshold against your own historical transactions to see the alert-volume and hit-rate impact before it goes live, with the tuning decision versioned for your independent review.",
    },
    {
      q: "How fast can we go live?",
      a: "Most fintechs are live in weeks: connect your customer and transaction data, provision the payments rule pack, tune with backtesting, then run parallel to your existing controls before cutover.",
    },
  ],
  demoHeading: "Book a walkthrough with a fintech compliance specialist",
  demoIntro:
    "We'll show WorldAML configured for your product, rails and licensing model — onboarding APIs, real-time screening, monitoring and the sponsor-bank reporting pack.",
  demoBullets: [
    "30-minute session tailored to your rails and licence model",
    "Sponsor-bank diligence readiness review",
    "USD pricing and integration timeline",
  ],
  form: {
    formType: "fintech-aml-demo-us",
    industry: "Financial Services",
    segmentLabel: "Company type",
    segmentOptions: [
      "Neobank / BaaS program",
      "Payment processor / PayFac",
      "Money transmitter / remittance",
      "Prepaid or card program",
      "Lending / earned-wage access",
      "B2B payments or treasury platform",
      "Other fintech",
    ],
    heading: "Request a fintech AML demo",
    intro:
      "Tell us about your product and rails and we'll tailor the walkthrough to your KYC, screening and monitoring needs.",
    messagePlaceholder:
      "e.g. onboarding API integration, sponsor-bank reporting, mule detection, Travel Rule data…",
  },
  ctaHeading: "Ready for your next sponsor-bank review?",
  ctaBody:
    "Get a walkthrough of WorldAML configured for your rails, corridors and licensing model — priced in USD.",
  secondaryCta: { to: "/platform/aml-screening", label: "Explore the screening platform" },
  relatedIntro:
    "Related US regulator context, screening tooling and fintech compliance resources.",
  relatedLinks: [
    GUIDE_LINKS.csUS,
    GUIDE_LINKS.usGuide,
    GUIDE_LINKS.bankUS,
    GUIDE_LINKS.cryptoUS,
    GUIDE_LINKS.casinoUS,
    GUIDE_LINKS.sanctionsSoftware,
    GUIDE_LINKS.amlChecklist,
    GUIDE_LINKS.compareProviders,
  ],
};

const FintechAMLComplianceUS = () => <USIndustryLanding config={config} />;

export default FintechAMLComplianceUS;
