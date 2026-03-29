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

  singapore: {
    slug: "singapore",
    regionLabel: "Singapore",
    flag: "🇸🇬",
    seo: {
      title: "AML Compliance Software for Singapore | WorldAML",
      description: "AML compliance platform for MAS-regulated financial institutions in Singapore. Payment Services Act compliance, STRO reporting, sanctions screening, KYC/KYB, and transaction monitoring.",
      canonical: "/markets/singapore",
    },
    hero: {
      headline: "AML Compliance Software for Singapore",
      subheadline: "Meet MAS AML/CFT obligations under the Payment Services Act and MAS Notices with a scalable compliance platform designed for Singapore's digital banks, payment institutions, and crypto licensees.",
      primaryCta: { label: "Book a Demo", href: "/contact-sales" },
      secondaryCta: { label: "Free AML Check", href: "/sanctions-check" },
    },
    challenges: {
      title: "Singapore Compliance Challenges",
      description: "Singapore-regulated firms face some of the world's strictest AML supervision from MAS, with increasing enforcement against payment institutions and digital asset providers.",
      items: [
        { title: "MAS AML/CFT Enforcement", description: "MAS has significantly increased enforcement actions, issuing substantial penalties and revoking licences for inadequate AML controls, particularly targeting payment institutions and digital payment token services." },
        { title: "Payment Services Act Obligations", description: "The Payment Services Act 2019 imposes comprehensive AML/CFT requirements on all licensed payment service providers, including major, standard, and money-changing licensees." },
        { title: "STRO Reporting Complexity", description: "Suspicious transaction reporting to STRO requires structured data capture, investigation workflows, and timely filing — with MAS scrutinising both quality and timeliness of STRs." },
        { title: "Cross-Border Risk Management", description: "Singapore's role as a global financial hub creates elevated exposure to cross-border money laundering risks, requiring robust correspondent banking and remittance controls." },
      ],
    },
    regulations: {
      title: "Singapore Regulatory Framework",
      rows: [
        { regulation: "MAS Notice 626", requirement: "AML/CFT controls for banks", module: "Full Platform" },
        { regulation: "Payment Services Act 2019", requirement: "AML obligations for payment institutions", module: "KYC & KYB" },
        { regulation: "MAS Notice PSN02", requirement: "AML/CFT for payment service providers", module: "AML Screening" },
        { regulation: "CDSA / TSOFA", requirement: "Predicate offences and terrorism financing", module: "Risk Assessment" },
        { regulation: "MAS Sanctions Framework", requirement: "UN and domestic sanctions screening", module: "Sanctions Screening" },
        { regulation: "STRO", requirement: "STR filing to Suspicious Transaction Reporting Office", module: "Regulatory Reporting" },
      ],
    },
    modules: [
      { icon: Users, title: "KYC & KYB Onboarding", description: "Individual and corporate onboarding with identity verification, UBO mapping, and document collection aligned to MAS CDD requirements and Myinfo integration readiness." },
      { icon: Shield, title: "Sanctions & PEP Screening", description: "Real-time screening against MAS-designated sanctions lists, UN Security Council lists, OFAC, EU, and 500+ global lists with Asian name matching support." },
      { icon: Search, title: "Adverse Media Monitoring", description: "Continuous monitoring across Singapore, ASEAN, and international media sources for negative coverage related to financial crime." },
      { icon: BarChart3, title: "Risk Scoring", description: "Automated risk-based scoring aligned to MAS risk-based approach requirements and FATF recommendations for Singapore's risk profile." },
      { icon: AlertTriangle, title: "Transaction Monitoring", description: "Rule-based monitoring with typologies covering remittance patterns, trade-based money laundering, and digital payment token transaction anomalies." },
      { icon: FileCheck, title: "STRO Reporting", description: "Automated STR generation for STRO submissions via SONAR, with full case management, investigation workflows, and audit trails." },
    ],
    industries: [
      { icon: Landmark, title: "Banks & Finance Companies", description: "Full AML compliance for MAS-licensed banks, merchant banks, and finance companies operating in Singapore." },
      { icon: Wallet, title: "Payment Institutions", description: "Scalable AML infrastructure for MAS-licensed major and standard payment institutions under the Payment Services Act." },
      { icon: Bitcoin, title: "Digital Payment Token Services", description: "AML controls for MAS-licensed DPT service providers, including Travel Rule and enhanced monitoring requirements." },
      { icon: CreditCard, title: "Wealth Management", description: "Compliance controls for licensed fund managers, family offices, and capital markets intermediaries." },
    ],
    faqs: [
      { question: "Is WorldAML aligned with MAS AML/CFT requirements?", answer: "Yes. WorldAML supports the risk-based approach required by MAS Notices 626, PSN02, and related AML/CFT guidelines. Workflows are configurable to reflect your firm's risk appetite and MAS supervisory expectations." },
      { question: "Does WorldAML support STRO reporting?", answer: "WorldAML provides automated STR generation workflows with full audit trails. Suspicious activity triggers can be configured within the transaction monitoring module, with cases routed to your compliance officer for review and submission to STRO via SONAR." },
      { question: "Can WorldAML support Payment Services Act compliance?", answer: "Absolutely. WorldAML provides the CDD, screening, monitoring, and reporting infrastructure required by the Payment Services Act 2019 for all categories of licensed payment service providers." },
      { question: "Does WorldAML screen against Singapore sanctions lists?", answer: "Yes. WorldAML screens against MAS-designated persons and entities lists, UN Security Council sanctions, and 500+ additional global lists in real time via our integrated data sources." },
      { question: "How quickly can a Singapore firm go live?", answer: "Most Singapore firms are operational within 2–4 weeks, depending on integration complexity. Our team provides dedicated onboarding support, including MAS-aligned policy configuration and data source setup." },
    ],
    cta: {
      headline: "Ready to strengthen your Singapore compliance programme?",
      description: "Speak with our team about how WorldAML supports MAS-regulated firms with scalable, audit-ready AML infrastructure.",
    },
  },

  germany: {
    slug: "germany",
    regionLabel: "Germany",
    flag: "🇩🇪",
    seo: {
      title: "AML & KYC Compliance Software for Germany | WorldAML",
      description: "AML compliance platform for BaFin-regulated financial institutions in Germany. GwG compliance, FIU Germany reporting, sanctions screening, KYC/KYB, and transaction monitoring for banks, fintechs, and crypto firms.",
      canonical: "/markets/germany",
    },
    hero: {
      headline: "AML & KYC Compliance Software for Germany",
      subheadline: "Meet GwG and EU AML Regulation obligations with a scalable compliance platform designed for German banks, fintechs, crypto custody providers, and real estate firms.",
      primaryCta: { label: "Book a Demo", href: "/contact-sales" },
      secondaryCta: { label: "Free AML Check", href: "/sanctions-check" },
    },
    challenges: {
      title: "Germany Compliance Challenges",
      description: "German regulated entities face intensified AML supervision from BaFin following the Wirecard scandal, with the new EU AML Regulation adding further harmonised requirements.",
      items: [
        { title: "Post-Wirecard BaFin Enforcement", description: "BaFin has dramatically increased AML enforcement intensity, deploying special commissioners to supervised entities and issuing record fines for compliance failures." },
        { title: "GwG Complexity", description: "Germany's Geldwäschegesetz (GwG) imposes detailed CDD, EDD, and reporting obligations that go beyond EU minimum standards, with sector-specific requirements for different obliged entity categories." },
        { title: "Crypto Custody Licensing", description: "Germany's pioneering crypto custody licence (Kryptoverwahrgeschäft) under BaFin creates specific AML obligations for crypto firms, requiring robust screening and monitoring from day one." },
        { title: "FIU Germany Reporting Bottlenecks", description: "FIU Germany processes over 300,000 STRs annually. Firms must ensure structured, high-quality STR submissions to avoid processing delays and regulatory scrutiny." },
      ],
    },
    regulations: {
      title: "Germany Regulatory Framework",
      rows: [
        { regulation: "GwG (Geldwäschegesetz)", requirement: "AML/CFT obligations for obliged entities", module: "Full Platform" },
        { regulation: "BaFin AML Interpretation Guide", requirement: "Detailed CDD, EDD, and risk management", module: "KYC & KYB" },
        { regulation: "EU AMLR (2024/1624)", requirement: "Harmonised CDD and beneficial ownership", module: "AML Screening" },
        { regulation: "KWG § 25h", requirement: "Banking Act AML internal controls", module: "Risk Assessment" },
        { regulation: "EU Sanctions Regulation", requirement: "EU restrictive measures screening", module: "Sanctions Screening" },
        { regulation: "FIU Germany (goAML)", requirement: "STR filing via goAML platform", module: "Regulatory Reporting" },
      ],
    },
    modules: [
      { icon: Users, title: "KYC & KYB Onboarding", description: "Individual and corporate onboarding with identity verification, UBO mapping from Transparenzregister, and document collection aligned to GwG requirements." },
      { icon: Shield, title: "Sanctions & PEP Screening", description: "Real-time screening against EU Consolidated Sanctions, German national lists, OFAC, UN, and 500+ global lists with German name matching support." },
      { icon: Search, title: "Adverse Media Monitoring", description: "Continuous monitoring across German and international media sources for negative coverage related to financial crime and regulatory enforcement." },
      { icon: BarChart3, title: "Risk Scoring", description: "Automated risk-based scoring aligned to BaFin's AML interpretation guide and sector-specific risk assessment requirements." },
      { icon: AlertTriangle, title: "Transaction Monitoring", description: "Rule-based monitoring with typologies covering structuring, trade-based money laundering, and real estate transaction patterns." },
      { icon: FileCheck, title: "FIU Germany Reporting", description: "Structured STR generation compatible with FIU Germany's goAML platform, with full case management and audit trails." },
    ],
    industries: [
      { icon: Landmark, title: "Banks & Credit Institutions", description: "Full AML compliance for BaFin-supervised banks, savings banks, and cooperative institutions." },
      { icon: Wallet, title: "Fintechs & EMIs", description: "Scalable AML infrastructure for BaFin-licensed fintech firms, neobanks, and electronic money institutions." },
      { icon: Bitcoin, title: "Crypto Custody & VASPs", description: "AML controls for BaFin-licensed crypto custody providers and virtual asset service providers." },
      { icon: Building2, title: "Real Estate & DNFBPs", description: "AML programme support for real estate agents, notaries, and other designated non-financial businesses and professions." },
    ],
    faqs: [
      { question: "Is WorldAML aligned with GwG requirements?", answer: "Yes. WorldAML supports the risk-based approach required by Germany's Geldwäschegesetz and BaFin's AML interpretation guide. Workflows are configurable to reflect your firm's risk appetite and BaFin supervisory expectations." },
      { question: "Does WorldAML support FIU Germany STR filing?", answer: "WorldAML provides automated STR generation workflows compatible with FIU Germany's goAML platform, with full audit trails and case management." },
      { question: "Can WorldAML support BaFin-licensed crypto firms?", answer: "Absolutely. WorldAML provides the screening, monitoring, and reporting infrastructure required for BaFin-licensed crypto custody providers, including Travel Rule compliance and enhanced due diligence." },
      { question: "Does WorldAML screen against EU sanctions lists?", answer: "Yes. WorldAML screens against the EU Consolidated Sanctions List in real time, alongside OFAC, UN, and 500+ additional global lists via our integrated data sources." },
      { question: "How quickly can a German firm go live?", answer: "Most German firms are operational within 2–4 weeks, depending on integration complexity. Our team provides dedicated onboarding support, including GwG-aligned policy configuration and data source setup." },
    ],
    cta: {
      headline: "Ready to strengthen your German AML programme?",
      description: "Speak with our team about how WorldAML supports BaFin-regulated firms with scalable, audit-ready AML infrastructure.",
    },
  },

  "south-africa": {
    slug: "south-africa",
    regionLabel: "South Africa",
    flag: "🇿🇦",
    seo: {
      title: "AML Compliance Software for South Africa | WorldAML",
      description: "AML compliance platform for South African banks, insurers, and fintechs. FICA compliance, FIC reporting, CASP registration, sanctions screening, KYC/KYB, and transaction monitoring.",
      canonical: "/markets/south-africa",
    },
    hero: {
      headline: "AML Compliance Software for South Africa",
      subheadline: "Meet FICA obligations and demonstrate FATF compliance with a scalable AML platform designed for South African banks, insurers, estate agents, and crypto asset service providers.",
      primaryCta: { label: "Book a Demo", href: "/contact-sales" },
      secondaryCta: { label: "Free AML Check", href: "/sanctions-check" },
    },
    challenges: {
      title: "South Africa Compliance Challenges",
      description: "South African accountable institutions face heightened AML obligations following the country's removal from the FATF grey list, with regulators demanding demonstrably effective compliance programmes.",
      items: [
        { title: "Post-Grey-List Compliance Pressure", description: "Following removal from the FATF grey list in February 2025, every accountable institution must demonstrate robust and effective AML controls to prevent re-listing." },
        { title: "FICA Amendment Act Obligations", description: "The Financial Intelligence Centre Amendment Act has expanded the scope of accountable institutions and introduced beneficial ownership transparency requirements." },
        { title: "CASP Registration Requirements", description: "Crypto asset service providers (CASPs) must register with the FSCA and implement full AML/CFT controls, including screening, monitoring, and STR filing." },
        { title: "FIC Inspection Readiness", description: "The Financial Intelligence Centre conducts regular compliance inspections with administrative sanctions for non-compliance, requiring audit-ready documentation at all times." },
      ],
    },
    regulations: {
      title: "South Africa Regulatory Framework",
      rows: [
        { regulation: "FICA (Act 38 of 2001)", requirement: "AML/CFT obligations for accountable institutions", module: "Full Platform" },
        { regulation: "FICA Amendment Act", requirement: "Enhanced CDD and beneficial ownership", module: "KYC & KYB" },
        { regulation: "FIC Guidance Note 7", requirement: "Risk-based approach implementation", module: "AML Screening" },
        { regulation: "POCDATARA", requirement: "Predicate offences and asset forfeiture", module: "Risk Assessment" },
        { regulation: "Targeted Financial Sanctions", requirement: "UN and domestic sanctions screening", module: "Sanctions Screening" },
        { regulation: "FIC STR", requirement: "STR/CTR filing to Financial Intelligence Centre", module: "Regulatory Reporting" },
      ],
    },
    modules: [
      { icon: Users, title: "KYC & KYB Onboarding", description: "Individual and corporate onboarding with identity verification, UBO mapping, and document collection aligned to FICA CDD requirements." },
      { icon: Shield, title: "Sanctions & PEP Screening", description: "Real-time screening against UN Security Council sanctions, South African targeted financial sanctions lists, OFAC, EU, and 500+ global lists." },
      { icon: Search, title: "Adverse Media Monitoring", description: "Continuous monitoring across South African and international media sources for negative coverage related to financial crime and state capture." },
      { icon: BarChart3, title: "Risk Scoring", description: "Automated risk-based scoring aligned to FIC Guidance Note 7 and FATF risk assessment methodology for the South African context." },
      { icon: AlertTriangle, title: "Transaction Monitoring", description: "Rule-based monitoring with typologies covering cash-intensive businesses, trade-based money laundering, and cross-border ZAR transaction patterns." },
      { icon: FileCheck, title: "FIC Reporting", description: "Automated STR and CTR generation for FIC submissions, with full case management, investigation workflows, and audit trails." },
    ],
    industries: [
      { icon: Landmark, title: "Banks & Insurers", description: "Full AML compliance for SARB-supervised banks and FSCA-regulated insurance companies." },
      { icon: Wallet, title: "Fintechs & Payment Providers", description: "Scalable AML infrastructure for licensed fintech firms and payment service providers." },
      { icon: Bitcoin, title: "Crypto Asset Service Providers", description: "AML controls for FSCA-registered CASPs with screening, monitoring, and reporting capabilities." },
      { icon: Building2, title: "Estate Agents & DNFBPs", description: "AML programme support for estate agents, attorneys, and other accountable institutions under FICA." },
    ],
    faqs: [
      { question: "Is WorldAML aligned with FICA requirements?", answer: "Yes. WorldAML supports the risk-based approach required by FICA and FIC Guidance Notes. Workflows are configurable to reflect your institution's risk appetite and FIC supervisory expectations." },
      { question: "Does WorldAML support FIC STR filing?", answer: "WorldAML provides automated STR and CTR generation workflows with full audit trails. Suspicious activity triggers can be configured within the transaction monitoring module, with cases routed to your compliance officer for review and submission to the FIC." },
      { question: "Can WorldAML support CASP compliance?", answer: "Absolutely. WorldAML provides the screening, monitoring, and reporting infrastructure required for FSCA-registered crypto asset service providers, including Travel Rule compliance and enhanced due diligence." },
      { question: "Does WorldAML screen against South African sanctions lists?", answer: "Yes. WorldAML screens against South African targeted financial sanctions lists, UN Security Council sanctions, and 500+ additional global lists in real time." },
      { question: "How quickly can a South African firm go live?", answer: "Most South African firms are operational within 2–4 weeks, depending on integration complexity. Our team provides dedicated onboarding support, including FICA-aligned policy configuration and data source setup." },
    ],
    cta: {
      headline: "Ready to strengthen your South African AML programme?",
      description: "Speak with our team about how WorldAML supports South African accountable institutions with scalable, audit-ready AML infrastructure.",
    },
  },

  netherlands: {
    slug: "netherlands",
    regionLabel: "Netherlands",
    flag: "🇳🇱",
    seo: {
      title: "AML Compliance for Netherlands Financial Institutions | WorldAML",
      description: "AML compliance platform for DNB and AFM-regulated financial institutions in the Netherlands. Wwft compliance, FIU-Nederland reporting, sanctions screening, KYC/KYB, and transaction monitoring.",
      canonical: "/markets/netherlands",
    },
    hero: {
      headline: "AML Compliance for Netherlands Financial Institutions",
      subheadline: "Meet Wwft obligations with a scalable compliance platform designed for Dutch banks, payment institutions, crypto firms, and trust offices.",
      primaryCta: { label: "Book a Demo", href: "/contact-sales" },
      secondaryCta: { label: "Free AML Check", href: "/sanctions-check" },
    },
    challenges: {
      title: "Netherlands Compliance Challenges",
      description: "Dutch regulated entities face among Europe's strictest AML enforcement from DNB and AFM, with record penalties and intensive supervision driving demand for robust compliance infrastructure.",
      items: [
        { title: "DNB Enforcement Intensity", description: "DNB has imposed record AML fines on Dutch banks, including the €775M ING penalty and €480M ABN AMRO settlement. Supervisory intensity remains elevated across all regulated sectors." },
        { title: "Wwft Complexity", description: "The Wet ter voorkoming van witwassen en financieren van terrorisme (Wwft) imposes detailed CDD, EDD, and transaction monitoring obligations with sector-specific guidance." },
        { title: "Trust Office (TCSP) Scrutiny", description: "DNB has revoked multiple trust office licences for AML failures, making compliance infrastructure critical for surviving and maintaining authorisation." },
        { title: "Crypto Sector Regulation", description: "DNB requires crypto service providers to register and implement full AML/CFT controls, with enforcement actions against non-compliant firms." },
      ],
    },
    regulations: {
      title: "Netherlands Regulatory Framework",
      rows: [
        { regulation: "Wwft", requirement: "AML/CFT obligations for obliged entities", module: "Full Platform" },
        { regulation: "DNB AML Guidance", requirement: "Sector-specific CDD and monitoring", module: "KYC & KYB" },
        { regulation: "EU AMLR (2024/1624)", requirement: "Harmonised CDD and beneficial ownership", module: "AML Screening" },
        { regulation: "Wft (Financial Supervision Act)", requirement: "Financial institution governance and controls", module: "Risk Assessment" },
        { regulation: "EU Sanctions Regulation", requirement: "EU restrictive measures screening", module: "Sanctions Screening" },
        { regulation: "FIU-Nederland", requirement: "Unusual transaction reporting", module: "Regulatory Reporting" },
      ],
    },
    modules: [
      { icon: Users, title: "KYC & KYB Onboarding", description: "Individual and corporate onboarding with identity verification, UBO mapping via KVK (Chamber of Commerce), and document collection aligned to Wwft requirements." },
      { icon: Shield, title: "Sanctions & PEP Screening", description: "Real-time screening against EU Consolidated Sanctions, Dutch national lists, OFAC, UN, and 500+ global lists with Dutch name matching support." },
      { icon: Search, title: "Adverse Media Monitoring", description: "Continuous monitoring across Dutch and international media sources for negative coverage related to financial crime and regulatory enforcement." },
      { icon: BarChart3, title: "Risk Scoring", description: "Automated risk-based scoring aligned to DNB's risk-based approach requirements and Wwft sector-specific guidance." },
      { icon: AlertTriangle, title: "Transaction Monitoring", description: "Rule-based monitoring with typologies covering structuring, trade-based money laundering, and unusual transaction patterns per Wwft indicators." },
      { icon: FileCheck, title: "FIU-Nederland Reporting", description: "Automated unusual transaction reporting for FIU-Nederland submissions, with full case management, investigation workflows, and audit trails." },
    ],
    industries: [
      { icon: Landmark, title: "Banks & Financial Institutions", description: "Full AML compliance for DNB-supervised banks and financial institutions operating in the Netherlands." },
      { icon: CreditCard, title: "Payment Institutions", description: "Scalable AML infrastructure for DNB-licensed payment service providers and electronic money institutions." },
      { icon: Bitcoin, title: "Crypto Service Providers", description: "AML controls for DNB-registered crypto service providers with screening, monitoring, and reporting capabilities." },
      { icon: Building2, title: "Trust Offices (TCSPs)", description: "AML programme support for DNB-licensed trust and company service providers under Wtt supervision." },
    ],
    faqs: [
      { question: "Is WorldAML aligned with Wwft requirements?", answer: "Yes. WorldAML supports the risk-based approach required by the Wwft and DNB's sector-specific AML guidance. Workflows are configurable to reflect your firm's risk appetite and DNB supervisory expectations." },
      { question: "Does WorldAML support FIU-Nederland reporting?", answer: "WorldAML provides automated unusual transaction reporting workflows with full audit trails. Triggers can be configured within the transaction monitoring module, with cases routed to your compliance officer for review and submission to FIU-Nederland." },
      { question: "Can WorldAML support DNB-registered crypto firms?", answer: "Absolutely. WorldAML provides the screening, monitoring, and reporting infrastructure required for DNB-registered crypto service providers, including Travel Rule compliance and enhanced due diligence." },
      { question: "Does WorldAML screen against EU sanctions lists?", answer: "Yes. WorldAML screens against the EU Consolidated Sanctions List in real time, alongside OFAC, UN, and 500+ additional global lists via our integrated data sources." },
      { question: "How quickly can a Dutch firm go live?", answer: "Most Dutch firms are operational within 2–4 weeks, depending on integration complexity. Our team provides dedicated onboarding support, including Wwft-aligned policy configuration and data source setup." },
    ],
    cta: {
      headline: "Ready to strengthen your Netherlands AML programme?",
      description: "Speak with our team about how WorldAML supports DNB-regulated firms with scalable, audit-ready AML infrastructure.",
    },
  },

  ireland: {
    slug: "ireland",
    regionLabel: "Ireland",
    flag: "🇮🇪",
    seo: {
      title: "AML & KYC Software for Ireland | WorldAML",
      description: "AML compliance platform for Central Bank of Ireland-regulated financial institutions. Criminal Justice Act compliance, sanctions screening, KYC/KYB, and transaction monitoring for Irish fintechs, e-money firms, and fund administrators.",
      canonical: "/markets/ireland",
    },
    hero: {
      headline: "AML & KYC Software for Ireland",
      subheadline: "Meet Central Bank of Ireland AML obligations with a scalable compliance platform designed for Irish e-money institutions, payment firms, fund administrators, and crypto providers.",
      primaryCta: { label: "Book a Demo", href: "/contact-sales" },
      secondaryCta: { label: "Free AML Check", href: "/sanctions-check" },
    },
    challenges: {
      title: "Ireland Compliance Challenges",
      description: "Ireland-regulated firms face expanding AML supervision from the Central Bank of Ireland, driven by Ireland's position as the EU headquarters for major US tech and fintech companies.",
      items: [
        { title: "Central Bank AML Enforcement", description: "The Central Bank of Ireland has increased AML enforcement actions and fines, with heightened expectations for firms operating as EU hubs for international financial services companies." },
        { title: "EU Hub Compliance Complexity", description: "As the EU base for Stripe, PayPal, Coinbase, and other major platforms, Irish-authorised firms must manage AML compliance for pan-European operations from Dublin." },
        { title: "Criminal Justice Act Obligations", description: "The Criminal Justice (Money Laundering and Terrorist Financing) Act 2010 (as amended) imposes detailed CDD, EDD, and reporting obligations with sector-specific guidance." },
        { title: "Fund Administration AML", description: "Ireland's large fund administration sector faces specific AML challenges around investor due diligence, ongoing monitoring, and suspicious transaction reporting at scale." },
      ],
    },
    regulations: {
      title: "Ireland Regulatory Framework",
      rows: [
        { regulation: "CJA 2010 (as amended)", requirement: "AML/CFT obligations for designated persons", module: "Full Platform" },
        { regulation: "CBI AML Guidelines", requirement: "Sector-specific CDD and monitoring", module: "KYC & KYB" },
        { regulation: "EU AMLR (2024/1624)", requirement: "Harmonised CDD and beneficial ownership", module: "AML Screening" },
        { regulation: "S.I. No. 110/2019", requirement: "4th/5th AMLD transposition", module: "Risk Assessment" },
        { regulation: "EU Sanctions Regulation", requirement: "EU restrictive measures screening", module: "Sanctions Screening" },
        { regulation: "FIU Ireland", requirement: "STR filing to An Garda Síochána FIU", module: "Regulatory Reporting" },
      ],
    },
    modules: [
      { icon: Users, title: "KYC & KYB Onboarding", description: "Individual and corporate onboarding with identity verification, UBO mapping via RBO, and document collection aligned to CBI AML Guidelines." },
      { icon: Shield, title: "Sanctions & PEP Screening", description: "Real-time screening against EU Consolidated Sanctions, Irish domestic lists, OFAC, UN, and 500+ global lists with configurable fuzzy matching." },
      { icon: Search, title: "Adverse Media Monitoring", description: "Continuous monitoring across Irish and international media sources for negative coverage related to financial crime and regulatory enforcement." },
      { icon: BarChart3, title: "Risk Scoring", description: "Automated risk-based scoring aligned to CBI's risk-based approach requirements and sector-specific guidance for e-money and fund administration." },
      { icon: AlertTriangle, title: "Transaction Monitoring", description: "Rule-based monitoring with typologies covering payment processing patterns, fund flow anomalies, and cross-border EUR transaction risks." },
      { icon: FileCheck, title: "FIU Ireland Reporting", description: "Automated STR generation for submissions to An Garda Síochána FIU, with full case management, investigation workflows, and audit trails." },
    ],
    industries: [
      { icon: CreditCard, title: "E-Money Institutions", description: "AML compliance for CBI-authorised e-money institutions serving as EU operational headquarters." },
      { icon: Wallet, title: "Payment Firms", description: "Scalable AML infrastructure for CBI-authorised payment institutions and payment initiation service providers." },
      { icon: Landmark, title: "Fund Administrators", description: "AML controls for CBI-regulated fund administrators and management companies with investor due diligence requirements." },
      { icon: Bitcoin, title: "Crypto & VASPs", description: "AML programme support for CBI-registered virtual asset service providers under MiCA." },
    ],
    faqs: [
      { question: "Is WorldAML aligned with CBI AML requirements?", answer: "Yes. WorldAML supports the risk-based approach required by the Criminal Justice Act 2010 and CBI's sector-specific AML guidelines. Workflows are configurable to reflect your firm's risk appetite and CBI supervisory expectations." },
      { question: "Does WorldAML support FIU Ireland STR filing?", answer: "WorldAML provides automated STR generation workflows with full audit trails. Suspicious activity triggers can be configured within the transaction monitoring module, with cases routed to your MLRO for review and submission to An Garda Síochána FIU." },
      { question: "Is the platform suitable for EU-hub e-money firms?", answer: "Absolutely. WorldAML is designed for CBI-authorised e-money institutions serving as EU hubs, with scalable screening, monitoring, and reporting across pan-European operations." },
      { question: "Does WorldAML screen against EU sanctions lists?", answer: "Yes. WorldAML screens against the EU Consolidated Sanctions List in real time, alongside OFAC, UN, and 500+ additional global lists via our integrated data sources." },
      { question: "How quickly can an Irish firm go live?", answer: "Most Irish firms are operational within 2–4 weeks, depending on integration complexity. Our team provides dedicated onboarding support, including CBI-aligned policy configuration and data source setup." },
    ],
    cta: {
      headline: "Ready to modernise your Ireland compliance operations?",
      description: "Connect with our team to learn how WorldAML supports CBI-regulated firms with scalable, audit-ready AML infrastructure.",
    },
  },

  nigeria: {
    slug: "nigeria",
    regionLabel: "Nigeria",
    flag: "🇳🇬",
    seo: {
      title: "AML Compliance Software for Nigeria | WorldAML",
      description: "AML compliance platform for Nigerian banks, fintechs, and mobile money operators. CBN compliance, NFIU reporting, sanctions screening, KYC/KYB, and transaction monitoring for Nigeria's regulated financial sector.",
      canonical: "/markets/nigeria",
    },
    hero: {
      headline: "AML Compliance Software for Nigeria",
      subheadline: "Meet CBN and NFIU AML obligations with a scalable compliance platform designed for Nigerian banks, fintechs, mobile money operators, and crypto exchanges.",
      primaryCta: { label: "Book a Demo", href: "/contact-sales" },
      secondaryCta: { label: "Free AML Check", href: "/sanctions-check" },
    },
    challenges: {
      title: "Nigeria Compliance Challenges",
      description: "Nigerian financial institutions face urgent AML compliance demands while on the FATF grey list, with regulators tightening enforcement to demonstrate progress on identified deficiencies.",
      items: [
        { title: "FATF Grey List Pressure", description: "Nigeria's placement on the FATF grey list creates intense pressure on all reporting entities to demonstrate effective AML/CFT controls and contribute to the country's action plan progress." },
        { title: "CBN AML/CFT Regulations", description: "The Central Bank of Nigeria's AML/CFT regulations impose comprehensive requirements on banks, OFIs, and payment service providers, with increasing enforcement actions for non-compliance." },
        { title: "Rapid Fintech Growth", description: "Nigeria's booming fintech sector — including mobile money, digital payments, and crypto — must build AML infrastructure that scales with explosive user growth." },
        { title: "NFIU STR Filing Requirements", description: "The Nigerian Financial Intelligence Unit requires timely and structured STR filing, with penalties for late or inadequate reporting." },
      ],
    },
    regulations: {
      title: "Nigeria Regulatory Framework",
      rows: [
        { regulation: "ML(P&P) Act 2022", requirement: "AML/CFT obligations for reporting entities", module: "Full Platform" },
        { regulation: "CBN AML/CFT Regulations", requirement: "CDD, EDD, and monitoring for financial institutions", module: "KYC & KYB" },
        { regulation: "SEC AML/CFT Rules", requirement: "Capital markets AML controls", module: "AML Screening" },
        { regulation: "Terrorism (Prevention) Act", requirement: "CFT and terrorism financing controls", module: "Risk Assessment" },
        { regulation: "UN Sanctions", requirement: "UN Security Council sanctions screening", module: "Sanctions Screening" },
        { regulation: "NFIU", requirement: "STR/CTR filing to Nigerian FIU", module: "Regulatory Reporting" },
      ],
    },
    modules: [
      { icon: Users, title: "KYC & KYB Onboarding", description: "Individual and corporate onboarding with BVN/NIN verification, UBO mapping, and document collection aligned to CBN KYC requirements." },
      { icon: Shield, title: "Sanctions & PEP Screening", description: "Real-time screening against UN Security Council sanctions, OFAC, EU, and 500+ global lists with African name matching and transliteration support." },
      { icon: Search, title: "Adverse Media Monitoring", description: "Continuous monitoring across Nigerian and international media sources for negative coverage related to financial crime and terrorism financing." },
      { icon: BarChart3, title: "Risk Scoring", description: "Automated risk-based scoring aligned to CBN risk assessment guidelines and FATF recommendations for Nigeria's specific risk profile." },
      { icon: AlertTriangle, title: "Transaction Monitoring", description: "Rule-based monitoring with typologies covering mobile money patterns, cross-border remittances, and cash-intensive transaction anomalies." },
      { icon: FileCheck, title: "NFIU Reporting", description: "Automated STR and CTR generation for NFIU submissions, with full case management, investigation workflows, and audit trails." },
    ],
    industries: [
      { icon: Landmark, title: "Banks & OFIs", description: "Full AML compliance for CBN-licensed banks and other financial institutions operating in Nigeria." },
      { icon: Wallet, title: "Fintechs & Mobile Money", description: "Scalable AML infrastructure for CBN-licensed fintechs, super-agents, and mobile money operators." },
      { icon: Bitcoin, title: "Crypto Exchanges", description: "AML controls for SEC-registered crypto exchanges and digital asset platforms." },
      { icon: CreditCard, title: "Payment Service Providers", description: "Compliance infrastructure for CBN-licensed payment service banks and payment solution providers." },
    ],
    faqs: [
      { question: "Is WorldAML aligned with CBN AML requirements?", answer: "Yes. WorldAML supports the risk-based approach required by CBN AML/CFT Regulations and the Money Laundering (Prevention and Prohibition) Act 2022. Workflows are configurable to reflect your institution's risk appetite and CBN supervisory expectations." },
      { question: "Does WorldAML support NFIU STR filing?", answer: "WorldAML provides automated STR and CTR generation workflows with full audit trails. Suspicious activity triggers can be configured within the transaction monitoring module, with cases routed to your compliance officer for review and submission to the NFIU." },
      { question: "Can WorldAML support Nigerian fintechs and mobile money operators?", answer: "Absolutely. WorldAML is designed for the compliance requirements of CBN-licensed fintechs and mobile money operators, including BVN/NIN-based KYC, sanctions screening, and transaction monitoring at scale." },
      { question: "Does WorldAML help with FATF grey list remediation?", answer: "Yes. WorldAML provides the comprehensive screening, monitoring, and reporting infrastructure that demonstrates effective AML/CFT controls — critical for Nigerian firms contributing to the country's FATF action plan." },
      { question: "How quickly can a Nigerian firm go live?", answer: "Most Nigerian firms are operational within 2–4 weeks, depending on integration complexity. Our team provides dedicated onboarding support, including CBN-aligned policy configuration and data source setup." },
    ],
    cta: {
      headline: "Ready to strengthen your Nigerian AML programme?",
      description: "Speak with our team about how WorldAML supports Nigerian financial institutions with scalable, audit-ready AML infrastructure.",
    },
  },
};
