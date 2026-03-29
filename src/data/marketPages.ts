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

  greece: {
    slug: "greece",
    regionLabel: "Greece",
    flag: "🇬🇷",
    seo: {
      title: "AML Compliance Software for Greece | WorldAML",
      description: "AML compliance platform aligned with Hellenic Capital Market Commission (HCMC) and Bank of Greece requirements. KYC/KYB, sanctions screening, transaction monitoring, and regulatory reporting for Greek financial institutions.",
      canonical: "/markets/greece",
    },
    hero: {
      headline: "AML Compliance Software for Greece",
      subheadline: "Meet AML obligations under Law 4557/2018 and the EU AML Regulation with a scalable compliance platform designed for Greek financial institutions, fintechs, and crypto licensees.",
      primaryCta: { label: "Book a Demo", href: "/contact-sales" },
      secondaryCta: { label: "Free AML Check", href: "/sanctions-check" },
    },
    challenges: {
      title: "Greece Compliance Challenges",
      description: "Greek regulated entities face evolving AML obligations under EU harmonisation, HCMC supervision, and the Bank of Greece's increasing enforcement activity.",
      items: [
        { title: "EU AML Regulation (AMLR)", description: "The directly applicable EU AML Regulation (2024/1624) introduces uniform CDD, beneficial ownership, and reporting obligations across all EU member states, including Greece." },
        { title: "HCMC Supervisory Scrutiny", description: "The Hellenic Capital Market Commission is expanding AML supervision to cover investment firms, fund managers, and MiCA-licensed crypto asset service providers." },
        { title: "Hellenic FIU Reporting", description: "Suspicious transaction reporting to the Hellenic Financial Intelligence Unit requires structured data capture and case management workflows that many firms still handle manually." },
        { title: "MiCA Crypto Licensing", description: "Greece's implementation of MiCA creates new AML obligations for crypto asset service providers, requiring robust screening and monitoring from day one." },
      ],
    },
    regulations: {
      title: "Greece Regulatory Framework",
      rows: [
        { regulation: "Law 4557/2018", requirement: "AML/CFT obligations for obliged entities", module: "Full Platform" },
        { regulation: "EU AMLR (2024/1624)", requirement: "Uniform CDD, EDD, and beneficial ownership", module: "KYC & KYB" },
        { regulation: "HCMC Circular 64", requirement: "Investment firm AML controls", module: "AML Screening" },
        { regulation: "Bank of Greece Act 2577", requirement: "Credit institution AML supervision", module: "Risk Assessment" },
        { regulation: "EU Sanctions Regulation", requirement: "EU restrictive measures screening", module: "Sanctions Screening" },
        { regulation: "Hellenic FIU", requirement: "STR filing and regulatory reporting", module: "Regulatory Reporting" },
      ],
    },
    modules: [
      { icon: Users, title: "KYC & KYB Onboarding", description: "Individual and corporate onboarding with identity verification, UBO mapping, and document collection aligned to Law 4557/2018 and EU AMLR." },
      { icon: Shield, title: "Sanctions & PEP Screening", description: "Real-time screening against EU Consolidated Sanctions List, Greek national lists, and 500+ global lists with Greek name transliteration support." },
      { icon: Search, title: "Adverse Media Monitoring", description: "Continuous monitoring across Greek and international media sources for negative coverage related to financial crime." },
      { icon: BarChart3, title: "Risk Scoring", description: "Automated risk-based scoring aligned to HCMC and Bank of Greece risk-based approach requirements." },
      { icon: AlertTriangle, title: "Transaction Monitoring", description: "Rule-based monitoring with configurable typologies for patterns common in Greek financial markets and cross-border transactions." },
      { icon: FileCheck, title: "Regulatory Reporting", description: "Automated STR generation for Hellenic FIU submissions with full case management and audit trails." },
    ],
    industries: [
      { icon: Landmark, title: "Banks & Credit Institutions", description: "Full AML compliance for Bank of Greece-supervised credit institutions and cooperative banks." },
      { icon: Wallet, title: "Fintechs & EMIs", description: "Scalable AML infrastructure for Bank of Greece-licensed fintech firms and electronic money institutions." },
      { icon: Bitcoin, title: "Crypto & MiCA Licensees", description: "AML controls for MiCA-licensed crypto asset service providers operating in Greece." },
      { icon: Scale, title: "Shipping & Maritime", description: "AML compliance for maritime finance, ship management companies, and related service providers." },
    ],
    faqs: [
      { question: "Is WorldAML aligned with Greek AML legislation?", answer: "Yes. WorldAML supports the risk-based approach required by Law 4557/2018 and the directly applicable EU AML Regulation (2024/1624). Workflows are configurable to reflect your firm's risk appetite and HCMC or Bank of Greece supervisory expectations." },
      { question: "Does WorldAML support Hellenic FIU reporting?", answer: "WorldAML provides automated STR generation workflows with full audit trails. Suspicious activity triggers can be configured within the transaction monitoring module, with cases routed to your MLRO for review and submission to the Hellenic FIU." },
      { question: "Can WorldAML support MiCA crypto compliance in Greece?", answer: "Yes. WorldAML provides the screening, monitoring, and reporting infrastructure required for MiCA-licensed crypto asset service providers, including Travel Rule compliance and enhanced due diligence." },
      { question: "Does WorldAML screen against EU sanctions lists?", answer: "Yes. WorldAML screens against the EU Consolidated Sanctions List in real time, alongside OFAC, UN, and 500+ additional global lists via our integrated data sources." },
      { question: "How quickly can a Greek firm go live?", answer: "Most Greek firms are operational within 2–4 weeks, depending on integration complexity. Our team provides dedicated onboarding support, including policy configuration and data source setup." },
    ],
    cta: {
      headline: "Ready to strengthen your AML programme in Greece?",
      description: "Speak with our team about how WorldAML supports Greek regulated entities with scalable, audit-ready AML infrastructure.",
    },
  },

  cyprus: {
    slug: "cyprus",
    regionLabel: "Cyprus",
    flag: "🇨🇾",
    seo: {
      title: "AML & KYC Software for Cyprus Investment Firms | WorldAML",
      description: "AML compliance platform for CySEC-regulated investment firms, forex brokers, and crypto providers in Cyprus. MOKAS STR filing, sanctions screening, KYC/KYB onboarding, and transaction monitoring.",
      canonical: "/markets/cyprus",
    },
    hero: {
      headline: "AML & KYC Software for Cyprus Investment Firms",
      subheadline: "Meet CySEC AML obligations with a scalable compliance platform built for Cyprus Investment Firms, forex brokers, payment institutions, and crypto service providers.",
      primaryCta: { label: "Book a Demo", href: "/contact-sales" },
      secondaryCta: { label: "Free AML Check", href: "/sanctions-check" },
    },
    challenges: {
      title: "Cyprus Compliance Challenges",
      description: "Cyprus-regulated firms face rigorous AML supervision from CySEC and the Central Bank of Cyprus, with heightened expectations following FATF and Moneyval assessments.",
      items: [
        { title: "CySEC AML Enforcement", description: "CySEC has significantly increased AML enforcement actions against Cyprus Investment Firms (CIFs), with substantial fines for inadequate customer due diligence and transaction monitoring." },
        { title: "MOKAS STR Filing", description: "Suspicious transaction reporting to MOKAS (Cyprus FIU) requires structured data capture, investigation workflows, and timely filing — a challenge for firms with manual processes." },
        { title: "Cross-Border Client Risk", description: "CIFs and forex brokers serving international clients face elevated risk from high-risk jurisdictions, requiring enhanced due diligence and ongoing monitoring at scale." },
        { title: "EU AML Package Implementation", description: "The new EU AML Regulation and AMLA supervision from 2026 will impose additional harmonised requirements on all Cyprus-regulated entities." },
      ],
    },
    regulations: {
      title: "Cyprus Regulatory Framework",
      rows: [
        { regulation: "AML Law 188(I)/2007", requirement: "AML/CFT obligations for obliged entities", module: "Full Platform" },
        { regulation: "CySEC AML Directive", requirement: "CIF-specific CDD, EDD, and monitoring", module: "KYC & KYB" },
        { regulation: "CBC AML Directive", requirement: "Credit institution AML controls", module: "AML Screening" },
        { regulation: "EU AMLR (2024/1624)", requirement: "Harmonised CDD and beneficial ownership", module: "Risk Assessment" },
        { regulation: "EU Sanctions Regulation", requirement: "EU restrictive measures screening", module: "Sanctions Screening" },
        { regulation: "MOKAS", requirement: "STR filing to Cyprus FIU", module: "Regulatory Reporting" },
      ],
    },
    modules: [
      { icon: Users, title: "KYC & KYB Onboarding", description: "Individual and corporate onboarding with identity verification, UBO mapping, and document collection aligned to CySEC AML Directive requirements." },
      { icon: Shield, title: "Sanctions & PEP Screening", description: "Real-time screening against EU Consolidated Sanctions, OFAC, UN, and 500+ global lists with multi-language name matching for international client bases." },
      { icon: Search, title: "Adverse Media Screening", description: "Continuous monitoring across international media sources for negative coverage related to financial crime, relevant for CIFs with global client portfolios." },
      { icon: BarChart3, title: "Risk Scoring", description: "Configurable risk matrices aligned to CySEC risk-based approach requirements, with jurisdiction and product risk factors." },
      { icon: AlertTriangle, title: "Transaction Monitoring", description: "Rule-based monitoring with typologies covering forex trading patterns, unusual fund flows, and cross-border transaction anomalies." },
      { icon: FileCheck, title: "MOKAS Reporting", description: "Structured STR generation for MOKAS submissions with full case management, investigation workflows, and audit trails." },
    ],
    industries: [
      { icon: Landmark, title: "Cyprus Investment Firms", description: "Full AML compliance for CySEC-authorised CIFs providing investment services and activities." },
      { icon: CreditCard, title: "Forex Brokers", description: "Scalable screening and monitoring for CySEC-licensed forex and CFD brokers serving international clients." },
      { icon: Bitcoin, title: "Crypto Providers", description: "AML controls for CySEC-registered crypto asset service providers under MiCA." },
      { icon: Building2, title: "Holding & Trust Companies", description: "AML compliance for Cyprus holding structures, trust and company service providers (TCSPs)." },
    ],
    faqs: [
      { question: "Is WorldAML aligned with CySEC AML requirements?", answer: "Yes. WorldAML supports the CDD, EDD, ongoing monitoring, and STR filing requirements set by CySEC's AML Directive. Workflows are configurable to reflect your CIF's risk appetite and CySEC supervisory expectations." },
      { question: "Can WorldAML handle MOKAS STR filing?", answer: "WorldAML provides automated STR generation workflows with full audit trails. Suspicious activity triggers can be configured within the transaction monitoring module, with cases routed to your compliance officer for review and submission to MOKAS." },
      { question: "Is the platform suitable for forex brokers?", answer: "Absolutely. WorldAML is designed for the specific compliance requirements of CySEC-licensed forex and CFD brokers, including onboarding international clients, screening against global sanctions lists, and monitoring trading-related transaction patterns." },
      { question: "Does WorldAML support EU sanctions screening?", answer: "Yes. WorldAML screens against the EU Consolidated Sanctions List in real time, alongside OFAC, UN, and 500+ additional global lists. This is critical for CIFs serving clients from multiple jurisdictions." },
      { question: "How quickly can a Cyprus firm go live?", answer: "Most Cyprus firms are operational within 2–4 weeks. Our team provides dedicated onboarding support including CySEC-aligned policy configuration and data source integration." },
    ],
    cta: {
      headline: "Ready to modernise your Cyprus compliance operations?",
      description: "Connect with our team to learn how WorldAML supports CySEC-regulated firms with scalable, audit-ready AML infrastructure.",
    },
  },

  malta: {
    slug: "malta",
    regionLabel: "Malta",
    flag: "🇲🇹",
    seo: {
      title: "AML Compliance for Malta iGaming & Fintech | WorldAML",
      description: "AML compliance platform for FIAU and MFSA-regulated entities in Malta. iGaming AML, crypto/DLT licensing, sanctions screening, KYC/KYB, and transaction monitoring for Malta's regulated sectors.",
      canonical: "/markets/malta",
    },
    hero: {
      headline: "AML Compliance for Malta iGaming & Fintech",
      subheadline: "Meet FIAU and MFSA AML obligations with a scalable compliance platform designed for Malta's iGaming operators, crypto licensees, payment institutions, and financial services firms.",
      primaryCta: { label: "Book a Demo", href: "/contact-sales" },
      secondaryCta: { label: "Free AML Check", href: "/sanctions-check" },
    },
    challenges: {
      title: "Malta Compliance Challenges",
      description: "Malta-regulated entities face intensive AML supervision from the FIAU and MFSA, with heightened scrutiny following Malta's 2022 FATF grey-listing and subsequent delisting.",
      items: [
        { title: "FIAU Enforcement & Inspections", description: "The FIAU conducts regular compliance examinations with substantial penalties for inadequate AML controls. Post-grey-listing, inspection frequency and depth have increased significantly." },
        { title: "iGaming AML Complexity", description: "Malta's iGaming sector faces sector-specific AML obligations under the PMLFTR, including player due diligence, transaction monitoring, and suspicious activity reporting at scale." },
        { title: "Crypto/DLT Regulatory Framework", description: "The Virtual Financial Assets Act and MiCA create layered AML obligations for Malta-based crypto and DLT service providers." },
        { title: "Post-Grey-Listing Scrutiny", description: "Despite delisting, Malta remains under enhanced monitoring. Firms must demonstrate robust and effective AML programmes to satisfy both FIAU and international counterparts." },
      ],
    },
    regulations: {
      title: "Malta Regulatory Framework",
      rows: [
        { regulation: "PMLFTR", requirement: "AML/CFT obligations for subject persons", module: "Full Platform" },
        { regulation: "FIAU Implementing Procedures", requirement: "Detailed CDD, EDD, and monitoring rules", module: "KYC & KYB" },
        { regulation: "MFSA AML Rulebook", requirement: "Financial services AML supervision", module: "AML Screening" },
        { regulation: "VFA Act", requirement: "Virtual Financial Assets AML controls", module: "Risk Assessment" },
        { regulation: "EU Sanctions Regulation", requirement: "EU restrictive measures screening", module: "Sanctions Screening" },
        { regulation: "FIAU STR", requirement: "STR filing to Malta's FIU", module: "Regulatory Reporting" },
      ],
    },
    modules: [
      { icon: Users, title: "KYC & KYB Onboarding", description: "Individual and corporate onboarding with identity verification, UBO mapping, and document collection aligned to FIAU Implementing Procedures." },
      { icon: Shield, title: "Sanctions & PEP Screening", description: "Real-time screening against EU Consolidated Sanctions, OFAC, UN, and 500+ global lists with configurable fuzzy matching for multi-language player and client bases." },
      { icon: Search, title: "Adverse Media Monitoring", description: "Continuous monitoring across international media sources for negative coverage, critical for iGaming operators with global player pools." },
      { icon: BarChart3, title: "Risk Scoring", description: "Configurable risk matrices aligned to FIAU risk-based approach requirements, with sector-specific risk factors for iGaming and crypto." },
      { icon: AlertTriangle, title: "Transaction Monitoring", description: "Rule-based monitoring with pre-built typologies for iGaming patterns (bonus abuse, structuring, rapid fund cycling) and crypto transaction anomalies." },
      { icon: FileCheck, title: "FIAU Reporting", description: "Structured STR generation for FIAU submissions with full case management, investigation workflows, and audit trails." },
    ],
    industries: [
      { icon: Building2, title: "iGaming Operators", description: "AML compliance for MGA-licensed online gaming operators, including player due diligence and transaction monitoring." },
      { icon: Bitcoin, title: "Crypto & DLT Providers", description: "AML controls for MFSA-licensed VFA service providers and MiCA-compliant crypto firms." },
      { icon: CreditCard, title: "Payment Institutions", description: "Compliance infrastructure for MFSA-authorised payment institutions and electronic money institutions." },
      { icon: Landmark, title: "Banks & Financial Services", description: "Full AML programme support for MFSA-licensed credit institutions and financial intermediaries." },
    ],
    faqs: [
      { question: "Is WorldAML aligned with FIAU requirements?", answer: "Yes. WorldAML supports the risk-based approach required by the PMLFTR and FIAU Implementing Procedures. Workflows are configurable to reflect your firm's risk appetite and FIAU supervisory expectations." },
      { question: "Can WorldAML support iGaming AML compliance?", answer: "Absolutely. WorldAML provides player due diligence, ongoing monitoring, and suspicious activity detection with pre-built typologies designed for iGaming patterns such as bonus abuse, structuring, and rapid fund cycling." },
      { question: "Does WorldAML support FIAU STR filing?", answer: "WorldAML provides automated STR generation workflows with full audit trails. Suspicious activity triggers can be configured within the transaction monitoring module, with cases routed to your MLRO for review and submission to the FIAU." },
      { question: "Is the platform suitable for VFA service providers?", answer: "Yes. WorldAML provides the screening, monitoring, and reporting infrastructure required by the Virtual Financial Assets Act and MiCA, including Travel Rule compliance and enhanced due diligence for virtual asset transactions." },
      { question: "How does WorldAML address Malta's post-grey-listing environment?", answer: "WorldAML provides comprehensive audit trails, configurable risk scoring, and automated monitoring that help demonstrate the effectiveness of your AML programme to the FIAU and international counterparts." },
    ],
    cta: {
      headline: "Ready to strengthen your Malta compliance programme?",
      description: "Speak with our team about how WorldAML supports FIAU and MFSA-regulated entities with scalable, audit-ready AML infrastructure.",
    },
  },

  romania: {
    slug: "romania",
    regionLabel: "Romania",
    flag: "🇷🇴",
    seo: {
      title: "AML Compliance Software for Romania | WorldAML",
      description: "AML compliance platform for Romanian banks, fintechs, and payment institutions. Aligned with ONPCSB, NBR, and ASF requirements. KYC/KYB, sanctions screening, transaction monitoring, and regulatory reporting.",
      canonical: "/markets/romania",
    },
    hero: {
      headline: "AML Compliance Software for Romania",
      subheadline: "Meet AML obligations under Law 129/2019 and the EU AML Regulation with a scalable compliance platform designed for Romanian banks, fintechs, NBFIs, and payment institutions.",
      primaryCta: { label: "Book a Demo", href: "/contact-sales" },
      secondaryCta: { label: "Free AML Check", href: "/sanctions-check" },
    },
    challenges: {
      title: "Romania Compliance Challenges",
      description: "Romanian regulated entities face increasing AML obligations under Law 129/2019, NBR supervision, and EU harmonisation, with stricter penalties and expanded scope.",
      items: [
        { title: "Law 129/2019 Amendments", description: "Recent amendments to Romania's AML law have introduced stricter penalties, expanded the list of obliged entities, and strengthened beneficial ownership transparency requirements." },
        { title: "ONPCSB Reporting Obligations", description: "The National Office for Prevention and Control of Money Laundering (ONPCSB) requires timely STR filing with structured data — a challenge for firms relying on manual processes." },
        { title: "NBR Supervisory Expectations", description: "The National Bank of Romania is increasing AML examination depth and frequency for credit institutions and payment service providers." },
        { title: "Growing Fintech Sector", description: "Romania's expanding fintech and payments sector must build AML compliance infrastructure from inception, balancing growth with regulatory expectations." },
      ],
    },
    regulations: {
      title: "Romania Regulatory Framework",
      rows: [
        { regulation: "Law 129/2019", requirement: "AML/CFT obligations for reporting entities", module: "Full Platform" },
        { regulation: "NBR Regulation 2/2019", requirement: "Credit institution AML controls", module: "KYC & KYB" },
        { regulation: "ASF Regulation 13/2019", requirement: "Capital markets AML supervision", module: "AML Screening" },
        { regulation: "EU AMLR (2024/1624)", requirement: "Harmonised CDD and beneficial ownership", module: "Risk Assessment" },
        { regulation: "EU Sanctions Regulation", requirement: "EU restrictive measures screening", module: "Sanctions Screening" },
        { regulation: "ONPCSB", requirement: "STR filing to Romania's FIU", module: "Regulatory Reporting" },
      ],
    },
    modules: [
      { icon: Users, title: "KYC & KYB Onboarding", description: "Individual and corporate onboarding with identity verification, UBO mapping, and document collection aligned to Law 129/2019 and NBR requirements." },
      { icon: Shield, title: "Sanctions & PEP Screening", description: "Real-time screening against EU Consolidated Sanctions, OFAC, UN, and 500+ global lists with Romanian name matching support." },
      { icon: Search, title: "Adverse Media Monitoring", description: "Continuous monitoring across Romanian and international media sources for negative coverage related to financial crime." },
      { icon: BarChart3, title: "Risk Scoring", description: "Automated risk-based scoring aligned to NBR and ASF risk-based approach requirements for the Romanian market." },
      { icon: AlertTriangle, title: "Transaction Monitoring", description: "Rule-based monitoring with configurable typologies for patterns common in Romanian financial markets and cross-border EUR/RON transactions." },
      { icon: FileCheck, title: "ONPCSB Reporting", description: "Structured STR generation for ONPCSB submissions with full case management, investigation workflows, and audit trails." },
    ],
    industries: [
      { icon: Landmark, title: "Banks & Credit Institutions", description: "Full AML compliance for NBR-supervised banks and credit institutions operating in Romania." },
      { icon: Wallet, title: "Fintechs & EMIs", description: "Scalable AML infrastructure for NBR-licensed fintech firms and electronic money institutions." },
      { icon: CreditCard, title: "Payment Institutions", description: "Compliance controls for NBR-authorised payment service providers and money remittance firms." },
      { icon: Building2, title: "NBFIs", description: "AML programme support for non-bank financial institutions supervised by the NBR and ASF." },
    ],
    faqs: [
      { question: "Is WorldAML aligned with Romanian AML legislation?", answer: "Yes. WorldAML supports the risk-based approach required by Law 129/2019 and the directly applicable EU AML Regulation. Workflows are configurable to reflect your firm's risk appetite and NBR or ASF supervisory expectations." },
      { question: "Does WorldAML support ONPCSB STR filing?", answer: "WorldAML provides automated STR generation workflows with full audit trails. Suspicious activity triggers can be configured within the transaction monitoring module, with cases routed to your compliance officer for review and submission to ONPCSB." },
      { question: "Is the platform suitable for Romanian fintechs?", answer: "Absolutely. WorldAML is designed for the compliance requirements of NBR-licensed fintechs and payment institutions, including customer due diligence, sanctions screening, and transaction monitoring at scale." },
      { question: "Does WorldAML screen against EU sanctions lists?", answer: "Yes. WorldAML screens against the EU Consolidated Sanctions List in real time, alongside OFAC, UN, and 500+ additional global lists. This is essential for Romanian firms operating within the EU single market." },
      { question: "How quickly can a Romanian firm go live?", answer: "Most Romanian firms are operational within 2–4 weeks, depending on integration complexity. Our team provides dedicated onboarding support, including policy configuration and data source setup." },
    ],
    cta: {
      headline: "Ready to modernise your Romania compliance operations?",
      description: "Connect with our team to learn how WorldAML supports Romanian regulated entities with scalable, audit-ready AML infrastructure.",
    },
  },
};
