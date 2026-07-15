import CountryComplianceLanding, {
  type CountryLandingConfig,
  iconMap,
} from "@/components/CountryComplianceLanding";

const config: CountryLandingConfig = {
  countryCode: "NL",
  countryName: "Netherlands",
  path: "/compliance-software/nl",
  metaTitle: "Compliance Software for Dutch Banks, PSPs & Crypto Firms | WorldAML",
  metaDescription:
    "AML compliance software for Dutch financial institutions — Wwft, Sanctiewet 1977, DNB and AFM obligations, KYC/CDD, transaction monitoring and unusual-transaction reporting to FIU-Nederland.",
  h1: "Compliance software built for Dutch banks, PSPs and crypto firms",
  heroLead:
    "WorldAML is the AML compliance software Dutch financial institutions use to meet Wwft, Sanctiewet 1977, DNB and AFM obligations — from CDD and sanctions screening to transaction monitoring and unusual-transaction reporting (ongebruikelijke transacties) to FIU-Nederland, in one auditable platform.",
  heroFootnote:
    "Trusted by Dutch banks, payment service providers, EMIs, DNB-registered crypto service providers and lenders across the Netherlands.",
  currency: "EUR",
  ctaSanctionsLabel: "Run a free EU sanctions check",
  regulators: [
    {
      name: "DNB (De Nederlandsche Bank)",
      desc: "Prudential and integrity supervisor for Dutch banks, payment institutions, EMIs, insurers and crypto service providers under the Wwft and Sanctiewet 1977.",
    },
    {
      name: "AFM (Autoriteit Financiële Markten)",
      desc: "Conduct supervisor for investment firms, fund managers and consumer credit providers — enforces Wwft obligations alongside conduct-of-business rules.",
    },
    {
      name: "FIU-Nederland",
      desc: "Financial Intelligence Unit receiving ongebruikelijke transacties (unusual transaction) reports under Wwft Art. 16. Objective-indicator and subjective-indicator regime.",
    },
    {
      name: "Ministry of Finance (Sanctiewet 1977)",
      desc: "Sanctiewet 1977 requires immediate freezing of assets of designated persons and reporting to DNB/AFM — Dutch implementation of EU and UN sanctions regimes.",
    },
    {
      name: "EU AMLA & AMLR",
      desc: "The new EU Anti-Money Laundering Authority (AMLA) directly supervises the largest EU cross-border firms; AMLR harmonises CDD, sanctions and beneficial-ownership rules across member states from 2027.",
    },
    {
      name: "EBA Guidelines",
      desc: "European Banking Authority ML/TF Risk Factor Guidelines and Guidelines on Policies & Procedures — the operational benchmark DNB and AFM apply in inspections.",
    },
  ],
  features: [
    {
      icon: iconMap.Globe,
      title: "EU + Dutch sanctions screening",
      desc: "Real-time screening against EU consolidated financial sanctions, national Sanctiewet designations, UN, UK OFSI and US OFAC — with ownership analysis to the 50% threshold.",
    },
    {
      icon: iconMap.Shield,
      title: "Wwft programme in one platform",
      desc: "CDD, verscherpt cliëntenonderzoek (EDD), vereenvoudigd (SDD), PEP handling and ongoing monitoring aligned to Wwft Articles 3–8 and DNB guidance.",
    },
    {
      icon: iconMap.FileCheck,
      title: "Ongebruikelijke-transacties reporting",
      desc: "Structured builder for unusual-transaction reports to FIU-Nederland, covering both objective and subjective indicators with statutory reporting clock tracking.",
    },
    {
      icon: iconMap.AlertTriangle,
      title: "Transaction monitoring (DNB-ready)",
      desc: "Configurable rules, tuning history, coverage analysis and independent-testing evidence DNB supervisors expect at on-site inspections and thematic reviews.",
    },
    {
      icon: iconMap.Scale,
      title: "PEP & adverse media (EU + global)",
      desc: "Dutch domestic PEPs, foreign PEPs, RCAs and adverse media across 40+ languages — with configurable EDD triggers and risk-based sign-off workflows.",
    },
    {
      icon: iconMap.Building2,
      title: "UBO register & KvK cross-checks",
      desc: "UBO collection and verification aligned to the Dutch UBO-register at KvK, with change monitoring and cross-checks against sanctions and PEP data.",
    },
    {
      icon: iconMap.Landmark,
      title: "Built for Dutch banks, PSPs & crypto",
      desc: "Ready templates for banks, PSD2 payment institutions, EMIs, DNB-registered crypto service providers, wealth managers and consumer credit lenders.",
    },
    {
      icon: iconMap.Users,
      title: "Compliance Officer evidence pack",
      desc: "Immutable audit trail, MLRO/Compliance Officer annual report artefacts and case files formatted for DNB and AFM inspections.",
    },
  ],
  useCases: [
    {
      title: "Dutch banks & building societies",
      desc: "Meet DNB integrity-supervision expectations without a dozen point tools. Consolidate CDD, monitoring, sanctions and unusual-transaction reporting into one Wwft-aligned platform.",
    },
    {
      title: "PSPs & EMIs",
      desc: "PSD2/PSR SCA context, safeguarding-aware monitoring and DNB's payments-firm expectations — baked into rule packs.",
    },
    {
      title: "DNB-registered crypto service providers",
      desc: "Wwft registration evidence, Travel Rule messaging, wallet screening and blockchain analytics for cryptoasset businesses under DNB supervision.",
    },
    {
      title: "Wealth managers & investment firms",
      desc: "Source-of-wealth and source-of-funds workflows for high-risk clients, plus MiFID II record-keeping and AFM conduct-of-business controls.",
    },
    {
      title: "Consumer credit & lenders",
      desc: "KYC, sanctions and adverse-media screening embedded in origination, plus ongoing monitoring aligned to AFM expectations.",
    },
    {
      title: "Trust offices & fund administrators",
      desc: "Wtt 2018-supervised trust offices and fund administrators — high-risk client onboarding, EDD and reporting workflows in one place.",
    },
  ],
  whyPoints: [
    "One platform for Wwft, Sanctiewet, CDD, EDD, monitoring and unusual-transaction reporting — no bolt-ons.",
    "1,900+ global watchlists including the full EU consolidated list and Dutch national designations with 50% ownership analysis.",
    "Evidence pack built for DNB integrity supervision, AFM inspections and independent Wwft audits.",
    "EU/EEA data residency and SOC 2 Type II controls.",
    "AMLR- and AMLA-ready: the harmonised EU rulebook (from 2027) is baked into the roadmap.",
  ],
  faqs: [
    {
      q: "What is compliance software in the Netherlands?",
      a: "Compliance software is a platform that automates the controls a Dutch regulated business needs to meet its legal and regulatory obligations. For financial services that primarily means AML/CTF under the Wwft and sanctions under the Sanctiewet 1977: CDD/EDD, sanctions and PEP screening, transaction monitoring, case management, unusual-transaction reporting to FIU-Nederland and Compliance Officer evidence.",
    },
    {
      q: "Is WorldAML aligned to Wwft and DNB guidance?",
      a: "Yes. Our modules map directly to Wwft Articles 2b (risk assessment), 3–8 (CDD/EDD/SDD, PEPs), 16 (unusual-transaction reporting), 33 (record-keeping) and to DNB's integrity-supervision guidance — so DNB and AFM see the artefacts they expect in the format they expect.",
    },
    {
      q: "Do you screen against Sanctiewet 1977 and EU sanctions?",
      a: "Yes. WorldAML ingests the EU consolidated financial sanctions list, national Sanctiewet 1977 designations, UN, UK OFSI and US OFAC feeds. Ownership is analysed to the 50% threshold and screening refreshes within minutes of publication.",
    },
    {
      q: "Can WorldAML file unusual-transaction reports to FIU-Nederland?",
      a: "WorldAML generates structured unusual-transaction reports covering both objective and subjective indicators, with narrative templates and statutory reporting clock tracking. Submissions are made through the FIU-Nederland goAML portal using your firm's account.",
    },
    {
      q: "How does WorldAML handle Dutch UBO obligations?",
      a: "UBO collection and verification is aligned to the Dutch UBO-register at KvK, with change monitoring, cross-checks against sanctions and PEP data, and evidence tied to each customer file.",
    },
    {
      q: "Are you ready for the EU AMLR and AMLA?",
      a: "Yes. The harmonised EU rulebook (AMLR, applying from 2027) and AMLA direct supervision are on our roadmap, with configuration switches so Dutch entities can adopt harmonised CDD, sanctions and beneficial-ownership requirements without a rebuild.",
    },
    {
      q: "How is WorldAML priced in the Netherlands?",
      a: "Dutch pricing is usage-based on screened customers and monitored transactions, in EUR, with tiers for banks, PSPs, EMIs, crypto service providers and lenders. Talk to sales for a tailored quote.",
    },
  ],
  ctaHeadline: "Ready for your next DNB or AFM inspection?",
  ctaBody:
    "Get a tailored walkthrough of WorldAML for your Dutch firm type, product mix and primary supervisor.",
};

const ComplianceSoftwareNL = () => <CountryComplianceLanding config={config} />;
export default ComplianceSoftwareNL;
