import CountryComplianceLanding, {
  type CountryLandingConfig,
  iconMap,
} from "@/components/CountryComplianceLanding";

const config: CountryLandingConfig = {
  countryCode: "CH",
  countryName: "Switzerland",
  path: "/compliance-software/ch",
  metaTitle: "Compliance Software for Swiss Banks, Fintechs & VASPs | WorldAML",
  metaDescription:
    "AML compliance software for Swiss financial institutions — GwG, GwV-FINMA, SECO sanctions, KYC/CDD, transaction monitoring and MROS reporting in one FINMA- and SRO-ready platform.",
  h1: "Compliance software built for Swiss banks, fintechs and VASPs",
  heroLead:
    "WorldAML is the AML compliance software Swiss financial intermediaries use to meet Geldwäschereigesetz (GwG), GwV-FINMA, SECO sanctions and SRO obligations — from CDD and sanctions screening to transaction monitoring and MROS reporting, in one auditable platform.",
  heroFootnote:
    "Trusted by Swiss banks, securities firms, fintechs, FINMA-authorised VASPs and SRO-affiliated financial intermediaries across Switzerland.",
  currency: "CHF",
  ctaSanctionsLabel: "Run a free SECO sanctions check",
  regulators: [
    {
      name: "FINMA",
      desc: "Swiss Financial Market Supervisory Authority — prudential and conduct supervisor for banks, securities firms, fund managers, insurers and directly-supervised VASPs under the GwG and GwV-FINMA.",
    },
    {
      name: "SECO (State Secretariat for Economic Affairs)",
      desc: "Administers Swiss sanctions under the Embargo Act (EmbG) — the SECO SESAM sanctions list mirrors EU and UN regimes and adds Swiss-specific designations.",
    },
    {
      name: "MROS (Money Laundering Reporting Office Switzerland)",
      desc: "Financial Intelligence Unit receiving Verdachtsmeldungen (suspicious activity reports) under GwG Art. 9 with a mandatory reporting duty for financial intermediaries.",
    },
    {
      name: "Self-Regulatory Organisations (SROs)",
      desc: "Non-FINMA-directly-supervised financial intermediaries operate under an SRO (e.g. VQF, PolyReg, ARIF), which enforces GwG obligations through regulations mirroring FINMA standards.",
    },
    {
      name: "Swiss Bankers Association (SBA)",
      desc: "CDB 20 (Agreement on the Swiss Banks' Code of Conduct with regard to the Exercise of Due Diligence) — the industry standard for CDD, beneficial-ownership identification and documentation.",
    },
    {
      name: "FATF & MER 2027",
      desc: "Switzerland's next FATF Mutual Evaluation is scheduled for 2027 — FINMA and SROs are actively raising expectations on transaction monitoring, sanctions and beneficial-ownership.",
    },
  ],
  features: [
    {
      icon: iconMap.Globe,
      title: "SECO + EU + UN sanctions screening",
      desc: "Real-time screening against the SECO SESAM list, EU consolidated sanctions, UN Security Council regimes, UK OFSI and US OFAC — with ownership analysis to the 50% threshold.",
    },
    {
      icon: iconMap.Shield,
      title: "GwG & GwV-FINMA programme",
      desc: "Vertragspartei-Identifizierung, wirtschaftlich Berechtigte (beneficial owner) identification, EDD for PEPs and high-risk relationships, aligned to GwG Art. 3–7 and GwV-FINMA.",
    },
    {
      icon: iconMap.FileCheck,
      title: "MROS Verdachtsmeldung submissions",
      desc: "Structured builder for MROS suspicious activity reports (SAR) with narrative templates, evidence packaging and statutory reporting clock tracking (immediate reporting duty under GwG Art. 9).",
    },
    {
      icon: iconMap.AlertTriangle,
      title: "Transaction monitoring (FINMA-ready)",
      desc: "Configurable rules, tuning history, coverage analysis and independent-audit evidence FINMA and SRO auditors expect at annual GwG audits.",
    },
    {
      icon: iconMap.Scale,
      title: "PEP & adverse media (global)",
      desc: "Domestic (Swiss), foreign and international-organisation PEPs, RCAs and adverse media across 40+ languages — with configurable EDD triggers per GwV-FINMA.",
    },
    {
      icon: iconMap.Building2,
      title: "CDB 20 Formulare A / K / T / S",
      desc: "Digital workflows for CDB 20 beneficial-ownership declarations (Form A, K, T, S) with change-of-controlling-person monitoring and evidence tied to each file.",
    },
    {
      icon: iconMap.Landmark,
      title: "Built for banks, fintechs, VASPs & SROs",
      desc: "Ready templates for Swiss banks, securities firms, fintech-licence holders, FINMA-authorised VASPs and SRO-affiliated financial intermediaries.",
    },
    {
      icon: iconMap.Users,
      title: "GwG audit evidence pack",
      desc: "Immutable audit trail and case files formatted for the annual GwG audit performed by the FINMA-recognised audit firm or SRO auditor.",
    },
  ],
  useCases: [
    {
      title: "Swiss banks & securities firms",
      desc: "Meet FINMA expectations without a dozen point tools. Consolidate CDD, monitoring, sanctions and MROS reporting into one GwG- and GwV-FINMA-aligned platform.",
    },
    {
      title: "Fintechs (fintech licence, Art. 1b BankG)",
      desc: "Rule packs for Article 1b BankG fintech-licence holders, with monitoring and reporting workflows sized for the licence's operational profile.",
    },
    {
      title: "FINMA-authorised VASPs",
      desc: "Travel Rule messaging (VASP-VASP), wallet screening and blockchain analytics for FINMA-authorised cryptoasset businesses.",
    },
    {
      title: "SRO-affiliated intermediaries",
      desc: "Portfolio managers, trustees, currency traders and money-transmitters — full GwG workflows aligned to VQF, PolyReg, ARIF and other SRO regulations.",
    },
    {
      title: "Wealth managers & family offices",
      desc: "Source-of-wealth and source-of-funds workflows for high-net-worth relationships, plus CDB 20 Form A / K / T / S digital handling.",
    },
    {
      title: "Insurers & pension funds",
      desc: "GwG obligations for life insurers and other financial-intermediary insurance products — CDD, sanctions and reporting in one platform.",
    },
  ],
  whyPoints: [
    "One platform for GwG, GwV-FINMA, SECO sanctions, CDD, EDD, monitoring and MROS reporting — no bolt-ons.",
    "1,900+ global watchlists including the full SECO SESAM list with 50% ownership analysis.",
    "GwG-audit evidence pack built for FINMA and SRO auditors, plus FATF MER 2027 readiness.",
    "Swiss / EEA data residency options and SOC 2 Type II controls.",
    "CDB 20 Formulare A / K / T / S digitised — no more PDF binders.",
  ],
  faqs: [
    {
      q: "What is compliance software in Switzerland?",
      a: "Compliance software is a platform that automates the controls a Swiss financial intermediary needs to meet GwG and GwV-FINMA obligations — CDD, EDD, beneficial-ownership identification per CDB 20, sanctions and PEP screening (SECO SESAM + EU + UN + OFAC), transaction monitoring and MROS suspicious activity reporting.",
    },
    {
      q: "Is WorldAML aligned to GwG, GwV-FINMA and CDB 20?",
      a: "Yes. Our modules map directly to GwG Articles 3–7 (identification, beneficial-ownership, EDD, monitoring, reporting), GwV-FINMA operational requirements and CDB 20 Formulare A / K / T / S — so FINMA and SRO auditors see the artefacts they expect.",
    },
    {
      q: "Do you screen against the SECO sanctions list?",
      a: "Yes. WorldAML ingests the full SECO SESAM list (currently active Swiss designations plus embargo regimes), plus EU, UN, UK OFSI and US OFAC feeds. Ownership analysis to the 50% threshold is included, and screening refreshes within minutes of SECO publication.",
    },
    {
      q: "Can WorldAML submit Verdachtsmeldungen to MROS?",
      a: "WorldAML generates structured suspicious activity reports covering the GwG Art. 9 mandatory reporting duty and GwG Art. 305ter voluntary reporting, with narrative templates and reporting-clock tracking. Submissions are made through the MROS goAML portal using your firm's account.",
    },
    {
      q: "Does it support the fintech licence (Art. 1b BankG)?",
      a: "Yes. Rule packs and evidence templates are sized for Article 1b BankG fintech-licence holders, with an operational profile that matches the licence's deposit-taking and payment-services scope.",
    },
    {
      q: "How does WorldAML handle CDB 20 Formulare A / K / T / S?",
      a: "Digital workflows replace the traditional PDF Formulare A (beneficial owner), K (controlling person), T (trust) and S (foundation) — with change monitoring, e-signature and evidence tied to each customer file.",
    },
    {
      q: "How is WorldAML priced in Switzerland?",
      a: "Swiss pricing is usage-based on screened customers and monitored transactions, in CHF, with tiers for banks, securities firms, fintechs, VASPs and SRO-affiliated intermediaries. Talk to sales for a tailored quote.",
    },
  ],
  ctaHeadline: "Ready for your next GwG audit?",
  ctaBody:
    "Get a tailored walkthrough of WorldAML for your Swiss licence type, product mix and primary supervisor or SRO.",
};

const ComplianceSoftwareCH = () => <CountryComplianceLanding config={config} />;
export default ComplianceSoftwareCH;
