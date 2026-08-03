import {
  Gavel,
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
 * US law firm / legal sector AML landing page.
 * Intent: law firm aml compliance software, client due diligence software legal,
 * ABA voluntary good practices guidance, sanctions screening for law firms.
 */
const config: USIndustryLandingConfig = {
  path: "/compliance-software/us/legal",
  eyebrow: "United States · Law Firms & Legal Services",
  h1: "Client due diligence and sanctions screening software for US law firms",
  seoTitle: "AML & Client Due Diligence Software for US Law Firms",
  seoDescription:
    "Client due diligence, sanctions screening and risk software for US law firms — ABA-aligned intake CDD, OFAC checks, beneficial ownership, IOLTA payment risk and matter-level audit trails.",
  breadcrumbName: "US Law Firms",
  softwareName: "WorldAML Client Due Diligence Software for US Law Firms",
  audienceType:
    "Law firms, in-house legal teams and legal service providers (United States)",
  heroIntro:
    "WorldAML turns client intake into a documented risk decision: identify the client and its beneficial owners, screen against OFAC and PEP data, assess matter and payment risk, and keep a matter-level audit trail your general counsel and outside auditors can rely on.",
  heroFootnote:
    "Aligned to ABA voluntary good practices guidance, OFAC obligations that apply to every US person, and state bar trust-account rules.",
  regulatorsHeading: "Aligned to the obligations that apply to US legal practice",
  regulatorsIntro:
    "Sanctions law, professional responsibility and emerging transparency rules — evidenced from one system of record without disturbing privilege.",
  regulators: [
    {
      name: "OFAC (applies to all US persons)",
      desc: "Sanctions compliance is not sector-specific: law firms may not provide services to, or receive payment from, blocked persons. Screening covers clients, opposing parties, payers and counterparties in a matter.",
    },
    {
      name: "ABA voluntary good practices guidance",
      desc: "Risk-based client due diligence for the legal profession — client and matter risk assessment, verification of identity and beneficial ownership, and ongoing monitoring across the engagement.",
    },
    {
      name: "FinCEN Corporate Transparency Act context",
      desc: "Firms that form entities or advise on ownership structures frequently field beneficial-ownership questions. Structured UBO capture keeps that information consistent and retrievable.",
    },
    {
      name: "State bar trust account (IOLTA) rules",
      desc: "Trust accounts are a known laundering vector. Payment-source review, third-party payer checks and refund-request red flags are documented per matter.",
    },
    {
      name: "Model Rules 1.2(d) and 1.16",
      desc: "Counsel may not assist conduct known to be criminal or fraudulent. Documented escalation and declination records support both the decision to withdraw and the decision to proceed.",
    },
    {
      name: "Gatekeeper legislative proposals",
      desc: "Proposals such as the ENABLERS Act would extend formal AML duties to certain legal professionals. A risk-based program built now materially reduces the cost of any future mandate.",
    },
  ],
  featuresHeading: "Everything a firm's intake and risk process needs",
  featuresIntro:
    "Client-facing intake, screening and escalation that partners will actually use — without adding days to engagement.",
  features: [
    {
      icon: Users,
      title: "Digital client intake & CDD",
      desc: "White-labelled intake forms that collect identity documents, entity records and beneficial ownership at engagement, with automated chasers instead of partner follow-up emails.",
    },
    {
      icon: Shield,
      title: "OFAC, PEP & adverse media screening",
      desc: "Screen clients, related parties, opposing parties and payers against 1,900+ lists in 40+ languages, with per-client false-positive memory so cleared matches stop re-alerting.",
    },
    {
      icon: Scale,
      title: "Matter-level risk assessment",
      desc: "Risk scored by practice area, jurisdiction, entity complexity, payment route and client type — with high-risk matters routed to enhanced review before work begins.",
    },
    {
      icon: Landmark,
      title: "Beneficial ownership mapping",
      desc: "Structured ownership trees through holding companies, trusts and offshore vehicles, with each controlling individual screened and re-verified on trigger events.",
    },
    {
      icon: AlertTriangle,
      title: "Payment & IOLTA red flags",
      desc: "Third-party payers, unexplained overpayment and refund requests, unusual funding jurisdictions and rapid retainer cycling flagged for review before funds are accepted.",
    },
    {
      icon: FileCheck,
      title: "Conflicts-adjacent record keeping",
      desc: "Party and entity records structured so risk screening results sit alongside your conflicts process rather than duplicating it.",
    },
    {
      icon: Gavel,
      title: "Escalation & declination log",
      desc: "Documented escalation to the risk partner or GC, with recorded rationale for accepting, conditioning or declining an engagement.",
    },
    {
      icon: ClipboardCheck,
      title: "Privilege-aware audit trail",
      desc: "Role-based access with immutable logging, so risk evidence is defensible while matter substance stays restricted to the engagement team.",
    },
  ],
  useCasesHeading: "Built for the practice areas that carry the most exposure",
  useCases: [
    {
      title: "Corporate & M&A",
      desc: "Counterparty and target screening, ownership mapping through acquisition chains, and sanctions checks before closing funds move.",
    },
    {
      title: "Real estate & conveyancing",
      desc: "Buyer and seller verification, source-of-funds review and third-party payer checks on high-value US property transactions.",
    },
    {
      title: "Private client, trusts & estates",
      desc: "Source-of-wealth documentation for high-net-worth clients, settlor and beneficiary screening, and periodic review of long-running relationships.",
    },
    {
      title: "Entity formation & corporate services",
      desc: "Consistent beneficial-ownership capture and screening for firms that form or administer entities for clients.",
    },
    {
      title: "International & cross-border practice",
      desc: "Jurisdiction risk scoring, FATF list awareness and sanctions checks on foreign clients, funders and counterparties.",
    },
    {
      title: "Litigation funding & disputes",
      desc: "Diligence on third-party funders and payers, with documented review of the source of litigation funding.",
    },
  ],
  checklistHeading: "What a risk partner, insurer or auditor will ask for",
  checklist: [
    "A written, risk-based client due diligence policy with a designated owner and clear escalation path.",
    "Verified identity and beneficial-ownership records for entity clients, retained per matter with refresh evidence.",
    "Sanctions screening evidence for clients, related parties and payers — dated, with match-resolution rationale.",
    "A documented matter risk assessment, with enhanced review for high-risk practice areas and jurisdictions.",
    "Records of engagements accepted with conditions, and of engagements declined or terminated, with rationale.",
    "Training records for partners and fee earners, and periodic review of the programme's effectiveness.",
  ],
  checklistOutro:
    "WorldAML produces every one of these artifacts as a dated, immutable export — useful for professional indemnity insurers, client audits and bank relationship reviews alike.",
  faqsHeading: "Law firm AML & client due diligence — FAQ",
  faqs: [
    {
      q: "Are US law firms legally required to run an AML program?",
      a: "US law firms are not currently subject to a general BSA AML program mandate the way banks and MSBs are. However, OFAC sanctions obligations apply to every US person including law firms, ABA voluntary good practices guidance sets a risk-based client due diligence expectation, and clients, banks and insurers increasingly require evidence of a documented process. Legislative proposals would extend formal duties further.",
    },
    {
      q: "Does this conflict with attorney-client privilege?",
      a: "No. The platform holds identity, ownership, screening and risk-decision records — the intake and diligence layer — not matter substance or legal advice. Role-based access restricts visibility to the people who need it, and the audit log records access without exposing privileged content.",
    },
    {
      q: "How does client intake work for the client?",
      a: "You send a branded intake link. The client uploads identity or entity documents and completes ownership and source-of-funds questions on their own device, with automated reminders. Everything lands in the matter file already verified and screened, so nobody chases documents by email.",
    },
    {
      q: "Can we screen opposing parties and third-party payers?",
      a: "Yes. Any party attached to a matter — client, related entity, opposing party, funder or payer — can be screened against OFAC, PEP, RCA and adverse-media data, with results dated and attached to the matter record.",
    },
    {
      q: "Does it help with Corporate Transparency Act beneficial ownership questions?",
      a: "It gives you structured, consistent beneficial-ownership records for entity clients, including the ownership chain and control persons. That is the same data set clients need when considering their own reporting position, though the platform does not file reports on their behalf.",
    },
    {
      q: "Is this practical for a small firm?",
      a: "Yes. Intake, screening and risk scoring run automatically for low-risk matters and only route to a human when something warrants review, so a firm without a dedicated compliance team can still evidence a defensible process.",
    },
    {
      q: "How long does it take to roll out?",
      a: "Most firms are live in weeks: configure your intake form and risk factors by practice area, import your existing client list for a baseline screen, then run new matters through the process from a chosen start date.",
    },
  ],
  demoHeading: "Book a walkthrough with a legal-sector risk specialist",
  demoIntro:
    "We'll show WorldAML configured for your practice areas and intake process — client CDD, sanctions screening, ownership mapping and the matter-level evidence trail.",
  demoBullets: [
    "30-minute session tailored to your practice areas",
    "Client intake and escalation workflow review",
    "USD pricing and rollout timeline",
  ],
  form: {
    formType: "legal-aml-demo-us",
    industry: "Legal",
    segmentLabel: "Firm type",
    segmentOptions: [
      "Full-service law firm",
      "Corporate / M&A practice",
      "Real estate practice",
      "Private client, trusts & estates",
      "Boutique or solo practice",
      "In-house legal team",
      "Corporate services / entity formation",
      "Other legal services provider",
    ],
    heading: "Request a client due diligence demo",
    intro:
      "Tell us about your firm and practice areas and we'll tailor the walkthrough to your intake, screening and escalation process.",
    messagePlaceholder:
      "e.g. client intake forms, OFAC screening on payers, beneficial ownership for entity clients, IOLTA payment red flags…",
  },
  ctaHeading: "Make client intake a documented risk decision",
  ctaBody:
    "Get a walkthrough of WorldAML configured for your practice areas, client base and intake process — priced in USD.",
  secondaryCta: { to: "/platform/aml-screening", label: "Explore the screening platform" },
  relatedIntro:
    "Related US regulator context, screening tooling and due diligence resources.",
  relatedLinks: [
    GUIDE_LINKS.csUS,
    GUIDE_LINKS.usGuide,
    GUIDE_LINKS.bankUS,
    GUIDE_LINKS.fintechUS,
    GUIDE_LINKS.cryptoUS,
    GUIDE_LINKS.sanctionsSoftware,
    GUIDE_LINKS.whatIsSanctions,
    GUIDE_LINKS.amlChecklist,
  ],
};

const LegalAMLComplianceUS = () => <USIndustryLanding config={config} />;

export default LegalAMLComplianceUS;
