import { type LucideIcon } from "lucide-react";
import { Shield, Users, BarChart3, AlertTriangle, FileCheck, Search, Scale, Building2, Wallet, CreditCard, Bitcoin, Landmark } from "lucide-react";

export interface MarketPageData {
  slug: string;
  regionLabel: string;
  flag: string;
  seo: {
    title: string;
    description: string;
    canonical: string;
  };
  hero: {
    headline: string;
    subheadline: string;
    primaryCta: { label: string; href: string };
    secondaryCta: { label: string; href: string };
  };
  challenges: {
    title: string;
    description: string;
    items: { title: string; description: string }[];
  };
  regulations: {
    title: string;
    rows: { regulation: string; requirement: string; module: string }[];
  };
  modules: {
    icon: LucideIcon;
    title: string;
    description: string;
  }[];
  industries: {
    icon: LucideIcon;
    title: string;
    description: string;
  }[];
  faqs: { question: string; answer: string }[];
  cta: {
    headline: string;
    description: string;
  };
}

export const marketPages: Record<string, MarketPageData> = {
  uk: {
    slug: "uk",
    regionLabel: "United Kingdom",
    flag: "🇬🇧",
    seo: {
      title: "AML & KYC Software for UK Fintechs and EMIs | WorldAML",
      description: "AML compliance platform aligned with FCA expectations. KYC/KYB onboarding, sanctions & PEP screening, transaction monitoring, and regulatory reporting for UK fintechs, EMIs, and payment institutions.",
      canonical: "/markets/uk",
    },
    hero: {
      headline: "AML & KYC Software for UK Fintechs and EMIs",
      subheadline: "Support faster onboarding, stronger controls, and audit-ready compliance operations with a scalable AML platform aligned with FCA expectations.",
      primaryCta: { label: "Book a Demo", href: "/contact-sales" },
      secondaryCta: { label: "Free AML Check", href: "/sanctions-check" },
    },
    challenges: {
      title: "UK Compliance Challenges",
      description: "UK-regulated firms face evolving AML obligations under the FCA, with increasing scrutiny on fintechs, EMIs, and payment institutions.",
      items: [
        { title: "FCA Supervisory Pressure", description: "The FCA continues to raise expectations on AML controls, with Dear CEO letters targeting weaknesses in fintech and EMI compliance programmes." },
        { title: "Fragmented Tooling", description: "Many UK firms rely on disparate systems for screening, onboarding, and monitoring — creating operational gaps and audit risk." },
        { title: "SAR Filing Complexity", description: "Suspicious Activity Report volumes are rising. Manual investigation workflows slow response times and increase regulatory exposure." },
        { title: "Scaling Without Compromise", description: "High-growth UK fintechs need compliance infrastructure that scales with customer volumes without sacrificing quality or speed." },
      ],
    },
    regulations: {
      title: "UK Regulatory Framework",
      rows: [
        { regulation: "UK MLRs 2017", requirement: "Risk-based CDD, EDD, and ongoing monitoring", module: "KYC & KYB" },
        { regulation: "FCA SYSC 6.3", requirement: "AML systems and controls", module: "AML Screening" },
        { regulation: "Proceeds of Crime Act", requirement: "SAR filing obligations", module: "Regulatory Reporting" },
        { regulation: "Sanctions (EU Exit) Regs", requirement: "UK autonomous sanctions screening", module: "Sanctions Screening" },
        { regulation: "FCA Principles (11)", requirement: "Relations with regulators, record keeping", module: "Audit Trail" },
        { regulation: "PSRs 2017", requirement: "Payment services due diligence", module: "Transaction Monitoring" },
      ],
    },
    modules: [
      { icon: Users, title: "KYC & KYB Onboarding", description: "Individual and corporate onboarding with identity verification, UBO mapping, and document collection aligned to UK MLRs." },
      { icon: Shield, title: "Sanctions & PEP Screening", description: "Real-time screening against HMT, OFSI, and global sanctions lists. PEP and RCA checks via WorldCompliance® and Bridger Insight XG®." },
      { icon: Search, title: "Adverse Media Monitoring", description: "Continuous monitoring for negative news coverage across UK and international media sources." },
      { icon: BarChart3, title: "Risk Scoring & Categorisation", description: "Automated risk-based scoring aligned to FCA's risk-based approach guidance." },
      { icon: AlertTriangle, title: "Transaction Monitoring", description: "Rule-based monitoring with configurable typologies for UK payment patterns and suspicious activity detection." },
      { icon: FileCheck, title: "Regulatory Reporting", description: "Automated SAR generation and regulatory report workflows for FCA and NCA submissions." },
    ],
    industries: [
      { icon: Wallet, title: "Fintechs", description: "Scalable AML infrastructure for FCA-authorised fintech firms and challengers." },
      { icon: CreditCard, title: "EMIs & Payment Institutions", description: "Compliance controls for electronic money issuers and authorised payment institutions." },
      { icon: Building2, title: "Banks & Building Societies", description: "Full regulatory compliance for PRA/FCA dual-regulated deposit takers." },
      { icon: Bitcoin, title: "Crypto & VASPs", description: "FCA-registered crypto firm compliance with Travel Rule and MLR obligations." },
    ],
    faqs: [
      { question: "Is WorldAML aligned with FCA AML expectations?", answer: "Yes. WorldAML's platform supports the risk-based approach required by the UK Money Laundering Regulations 2017 and FCA SYSC 6.3. Workflows are configurable to reflect your firm's risk appetite and FCA supervisory expectations." },
      { question: "Can WorldAML support SAR filing?", answer: "WorldAML provides automated SAR generation workflows with full audit trails. Suspicious activity triggers can be configured within the transaction monitoring module, with cases routed to your MLRO for review and submission to the NCA." },
      { question: "Is the platform suitable for FCA-authorised EMIs?", answer: "Absolutely. WorldAML is designed for the specific compliance requirements of EMIs, including PSRs 2017 obligations, agent and distributor due diligence, and ongoing monitoring of payment transactions." },
      { question: "How quickly can we go live in the UK?", answer: "Most UK firms are operational within 2–4 weeks, depending on integration complexity. Our team provides dedicated onboarding support, including policy configuration and data source setup." },
      { question: "Does WorldAML screen against UK-specific sanctions lists?", answer: "Yes. WorldAML screens against the HMT Consolidated List and OFSI sanctions in real time, alongside OFAC, EU, UN, and 500+ additional global lists via our integrated data sources." },
    ],
    cta: {
      headline: "Ready to strengthen your UK compliance programme?",
      description: "Speak with our team about how WorldAML supports FCA-regulated firms with scalable, audit-ready AML infrastructure.",
    },
  },

  uae: {
    slug: "uae",
    regionLabel: "United Arab Emirates",
    flag: "🇦🇪",
    seo: {
      title: "AML Compliance Software for UAE Financial Institutions | WorldAML",
      description: "AML compliance platform for UAE banks, exchange houses, fintechs, and PSPs. Aligned with CBUAE, VARA, and FSRA regulatory frameworks. Sanctions screening, KYC, and transaction monitoring.",
      canonical: "/markets/uae",
    },
    hero: {
      headline: "AML Compliance Software for UAE Financial Institutions",
      subheadline: "Stay compliant and scale confidently with a modern AML platform designed to support onboarding, screening, monitoring, and reporting across UAE-regulated environments.",
      primaryCta: { label: "Book a Demo", href: "/contact-sales" },
      secondaryCta: { label: "Request Pricing", href: "/pricing" },
    },
    challenges: {
      title: "UAE Compliance Landscape",
      description: "The UAE's regulatory environment is evolving rapidly as the country positions itself as a global financial centre while strengthening its AML/CFT framework.",
      items: [
        { title: "FATF Mutual Evaluation Pressure", description: "Following FATF assessments, UAE regulators have significantly increased enforcement actions and compliance expectations across all licensed entities." },
        { title: "Multi-Regulator Complexity", description: "Firms operating across mainland UAE, ADGM, and DIFC must navigate requirements from CBUAE, FSRA, and DFSA simultaneously." },
        { title: "VARA Crypto Regulations", description: "Dubai's VARA framework imposes specific AML/CFT obligations on virtual asset service providers, requiring robust screening and monitoring infrastructure." },
        { title: "goAML Reporting Requirements", description: "UAE financial institutions must file STRs through the goAML platform, requiring structured data capture and case management workflows." },
      ],
    },
    regulations: {
      title: "UAE Regulatory Framework",
      rows: [
        { regulation: "Federal AML Law", requirement: "AML/CFT compliance for all financial institutions", module: "Full Platform" },
        { regulation: "CBUAE Guidance", requirement: "CDD, EDD, and transaction monitoring", module: "KYC & KYB" },
        { regulation: "VARA Regulations", requirement: "VASP-specific AML/CFT controls", module: "AML Screening" },
        { regulation: "FSRA Framework", requirement: "ADGM financial services compliance", module: "Risk Assessment" },
        { regulation: "Cabinet Resolution 74", requirement: "Targeted financial sanctions implementation", module: "Sanctions Screening" },
        { regulation: "goAML", requirement: "STR filing and regulatory reporting", module: "Regulatory Reporting" },
      ],
    },
    modules: [
      { icon: Users, title: "KYC & KYB Onboarding", description: "Individual and corporate onboarding with Emirates ID verification, trade licence validation, and UBO identification." },
      { icon: Shield, title: "Sanctions & PEP Screening", description: "Real-time screening against UAE Local Terrorist List, OFAC, EU, UN, and 500+ global sanctions lists with Arabic name matching." },
      { icon: Search, title: "Adverse Media Screening", description: "Multi-language adverse media monitoring across Arabic and English media sources covering GCC and international publications." },
      { icon: BarChart3, title: "Risk Scoring", description: "Configurable risk matrices aligned to CBUAE and FATF risk-based approach requirements for the UAE market." },
      { icon: AlertTriangle, title: "Transaction Monitoring", description: "Rule-based monitoring with typologies covering hawala, trade-based money laundering, and high-risk corridor transactions." },
      { icon: FileCheck, title: "goAML Reporting", description: "Structured STR generation compatible with the UAE FIU's goAML platform, with full case management and audit trails." },
    ],
    industries: [
      { icon: Landmark, title: "Banks & Finance Companies", description: "Full AML compliance for CBUAE-licensed banks and finance companies." },
      { icon: CreditCard, title: "Exchange Houses", description: "Sanctions screening and transaction monitoring for licensed exchange houses and remittance providers." },
      { icon: Wallet, title: "Fintechs & PSPs", description: "Scalable compliance infrastructure for payment service providers and digital banking platforms." },
      { icon: Bitcoin, title: "VASPs", description: "VARA-aligned compliance controls for virtual asset service providers operating in Dubai." },
    ],
    faqs: [
      { question: "Does WorldAML support CBUAE compliance requirements?", answer: "Yes. WorldAML's platform is designed to support the CDD, EDD, ongoing monitoring, and STR filing requirements set by the Central Bank of the UAE. Workflows are configurable to reflect CBUAE guidance and your institution's risk appetite." },
      { question: "Can WorldAML handle Arabic name screening?", answer: "Yes. Our integrated data sources support Arabic name transliteration and fuzzy matching, ensuring accurate screening across Arabic and Latin character sets." },
      { question: "Is WorldAML suitable for ADGM or DIFC-regulated firms?", answer: "Absolutely. WorldAML supports firms regulated by the FSRA (ADGM) and DFSA (DIFC), with configurable compliance workflows aligned to each regulator's specific requirements." },
      { question: "Does the platform support goAML STR filing?", answer: "WorldAML provides structured case management and STR generation workflows designed to produce reports compatible with the UAE FIU's goAML platform." },
      { question: "How does WorldAML support VARA-regulated VASPs?", answer: "WorldAML provides the screening, monitoring, and reporting infrastructure required by VARA's AML/CFT framework, including Travel Rule compliance and enhanced due diligence for virtual asset transactions." },
    ],
    cta: {
      headline: "Ready to modernise your UAE compliance operations?",
      description: "Connect with our regional team to learn how WorldAML supports UAE-regulated institutions with scalable, audit-ready compliance infrastructure.",
    },
  },

  usa: {
    slug: "usa",
    regionLabel: "United States",
    flag: "🇺🇸",
    seo: {
      title: "AML & KYC Software for US Fintechs | WorldAML",
      description: "AML compliance platform for US fintechs, banks, and MSBs. BSA/AML compliance, FinCEN reporting, OFAC screening, and SAR filing. Scalable infrastructure for high-growth regulated businesses.",
      canonical: "/markets/usa",
    },
    hero: {
      headline: "AML & KYC Software for US Fintechs",
      subheadline: "Automate screening, onboarding, monitoring, and investigations with a scalable compliance solution designed for high-growth regulated businesses.",
      primaryCta: { label: "Book a Demo", href: "/contact-sales" },
      secondaryCta: { label: "Free AML Risk Check", href: "/sanctions-check" },
    },
    challenges: {
      title: "US AML Compliance Challenges",
      description: "US financial institutions face complex, overlapping AML/BSA obligations from federal and state regulators, with increasing enforcement actions targeting fintechs and MSBs.",
      items: [
        { title: "BSA/AML Complexity", description: "The Bank Secrecy Act imposes comprehensive recordkeeping, reporting, and compliance programme requirements that grow more complex as your business scales." },
        { title: "FinCEN Enforcement Actions", description: "FinCEN has increased enforcement against fintechs and MSBs, with significant penalties for inadequate AML programmes and SAR filing failures." },
        { title: "Fragmented State Requirements", description: "Operating across multiple states means navigating varying MTL requirements and state-level AML examination expectations." },
        { title: "OFAC Sanctions Compliance", description: "OFAC's strict liability regime requires real-time screening against SDN and consolidated sanctions lists, with zero tolerance for screening gaps." },
      ],
    },
    regulations: {
      title: "US Regulatory Framework",
      rows: [
        { regulation: "BSA/AML", requirement: "Comprehensive AML programme requirements", module: "Full Platform" },
        { regulation: "FinCEN CDD Rule", requirement: "Customer due diligence and beneficial ownership", module: "KYC & KYB" },
        { regulation: "OFAC Regulations", requirement: "SDN screening and sanctions compliance", module: "Sanctions Screening" },
        { regulation: "SAR Filing (31 CFR 1020)", requirement: "Suspicious activity reporting to FinCEN", module: "Regulatory Reporting" },
        { regulation: "CTR Filing", requirement: "Currency transaction reports for $10K+ transactions", module: "Transaction Monitoring" },
        { regulation: "Section 314(b)", requirement: "Information sharing between financial institutions", module: "Case Management" },
      ],
    },
    modules: [
      { icon: Users, title: "KYC & KYB Onboarding", description: "CDD and beneficial ownership identification aligned to the FinCEN CDD Rule, with SSN verification and business entity validation." },
      { icon: Shield, title: "OFAC & Sanctions Screening", description: "Real-time screening against OFAC SDN, Consolidated Sanctions, and 500+ global lists with configurable fuzzy matching thresholds." },
      { icon: Search, title: "Adverse Media Monitoring", description: "Continuous monitoring across US and international news sources for negative coverage related to financial crime and regulatory actions." },
      { icon: BarChart3, title: "BSA Risk Assessment", description: "Automated risk-based scoring aligned to FFIEC BSA/AML examination manual risk assessment methodology." },
      { icon: AlertTriangle, title: "Transaction Monitoring", description: "Rule-based monitoring with pre-built typologies for structuring, layering, and other BSA-reportable patterns." },
      { icon: FileCheck, title: "SAR & CTR Filing", description: "Automated SAR and CTR generation with FinCEN e-filing compatibility, full investigation workflows, and audit trails." },
    ],
    industries: [
      { icon: Wallet, title: "Fintechs & Neobanks", description: "Scalable BSA/AML infrastructure for FinCEN-registered and state-licensed fintech companies." },
      { icon: CreditCard, title: "MSBs & Payment Companies", description: "Compliance controls for money services businesses, payment processors, and money transmitters." },
      { icon: Building2, title: "Community & Regional Banks", description: "Full BSA/AML programme support for FDIC and OCC-regulated banking institutions." },
      { icon: Bitcoin, title: "Crypto & Digital Assets", description: "FinCEN-registered VASP compliance with Travel Rule and BSA reporting obligations." },
    ],
    faqs: [
      { question: "Does WorldAML support BSA/AML programme requirements?", answer: "Yes. WorldAML provides the core components required for a BSA/AML compliance programme: customer identification and verification, sanctions screening, transaction monitoring, suspicious activity reporting, and comprehensive recordkeeping with audit trails." },
      { question: "Can WorldAML handle OFAC screening?", answer: "Absolutely. WorldAML provides real-time screening against the OFAC SDN list, Consolidated Sanctions List, and sectoral sanctions programmes. Configurable fuzzy matching thresholds help balance false positive rates with screening accuracy." },
      { question: "Is the platform suitable for state-licensed MSBs?", answer: "Yes. WorldAML is designed to support the compliance requirements of FinCEN-registered and state-licensed money services businesses, including MTLs across multiple states." },
      { question: "Does WorldAML support FinCEN e-filing?", answer: "WorldAML generates SAR and CTR reports in formats compatible with FinCEN's BSA E-Filing system, with full investigation documentation and audit trails." },
      { question: "How does WorldAML handle the FinCEN CDD Rule?", answer: "WorldAML's KYC/KYB module supports the four core CDD requirements: customer identification, beneficial ownership identification, understanding the nature and purpose of customer relationships, and ongoing monitoring." },
    ],
    cta: {
      headline: "Ready to scale your US compliance operations?",
      description: "Talk to our team about how WorldAML supports US fintechs, MSBs, and financial institutions with scalable, audit-ready AML infrastructure.",
    },
  },
};
