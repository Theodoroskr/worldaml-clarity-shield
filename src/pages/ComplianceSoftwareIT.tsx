import CountryComplianceLanding, {
  type CountryLandingConfig,
  iconMap,
} from "@/components/CountryComplianceLanding";

const config: CountryLandingConfig = {
  countryCode: "IT",
  countryName: "Italy",
  path: "/compliance-software/it",
  metaTitle: "Compliance Software for Italian Banks, IPs & Crypto Firms | WorldAML",
  metaDescription:
    "AML compliance software for Italian financial institutions — D.Lgs. 231/2007, Banca d'Italia and UIF obligations, KYC/adeguata verifica, transaction monitoring and SOS reporting to UIF.",
  h1: "Compliance software built for Italian banks, payment institutions and crypto firms",
  heroLead:
    "WorldAML is the AML compliance software Italian financial institutions use to meet D.Lgs. 231/2007, Banca d'Italia, IVASS, CONSOB and OAM obligations — from adeguata verifica and sanctions screening to transaction monitoring and Segnalazioni di Operazioni Sospette (SOS) to UIF, in one auditable platform.",
  heroFootnote:
    "Trusted by Italian banks, payment institutions, IMEL, OAM-registered VASPs, SIM and consumer credit lenders across Italy.",
  currency: "EUR",
  ctaSanctionsLabel: "Run a free EU sanctions check",
  regulators: [
    {
      name: "Banca d'Italia",
      desc: "Primary supervisor for Italian banks, payment institutions (IP), electronic money institutions (IMEL) and asset managers under D.Lgs. 231/2007 and the Banca d'Italia AML Provvedimenti.",
    },
    {
      name: "UIF (Unità di Informazione Finanziaria)",
      desc: "Financial Intelligence Unit inside Banca d'Italia — receives Segnalazioni di Operazioni Sospette (SOS) and comunicazioni oggettive under D.Lgs. 231/2007 Art. 35.",
    },
    {
      name: "CONSOB & IVASS",
      desc: "CONSOB supervises investment firms and market conduct; IVASS supervises insurers — both apply D.Lgs. 231/2007 AML obligations within their sectors.",
    },
    {
      name: "OAM (Organismo Agenti e Mediatori)",
      desc: "Register of currency-exchange operators (cambiavalute) and Virtual Asset Service Providers (VASP) — Italian VASPs must be OAM-registered and follow AML rules.",
    },
    {
      name: "MEF & Comitato di Sicurezza Finanziaria",
      desc: "Ministry of Economy and Finance and the Comitato di Sicurezza Finanziaria coordinate Italian sanctions policy, EU restrictive measures and national terrorism-financing designations.",
    },
    {
      name: "EU AMLA, AMLR & MiCA",
      desc: "The new EU AMLA directly supervises the largest EU cross-border firms; AMLR harmonises CDD, sanctions and beneficial-ownership rules from 2027; MiCA governs cryptoasset services alongside D.Lgs. 231.",
    },
  ],
  features: [
    {
      icon: iconMap.Globe,
      title: "EU + national sanctions screening",
      desc: "Real-time screening against EU consolidated financial sanctions, Italian national designations, UN, UK OFSI and US OFAC — with ownership analysis to the 50% threshold.",
    },
    {
      icon: iconMap.Shield,
      title: "Adeguata verifica in one platform",
      desc: "Adeguata verifica ordinaria, semplificata and rafforzata (CDD/SDD/EDD), titolare effettivo identification, PEP handling and ongoing monitoring aligned to D.Lgs. 231/2007 Art. 17–25.",
    },
    {
      icon: iconMap.FileCheck,
      title: "SOS reporting to UIF",
      desc: "Structured builder for Segnalazioni di Operazioni Sospette and comunicazioni oggettive, with narrative templates and statutory reporting-clock tracking. Submits via UIF INFOSTAT-UIF portal.",
    },
    {
      icon: iconMap.AlertTriangle,
      title: "Transaction monitoring (Banca d'Italia-ready)",
      desc: "Configurable rules, tuning history, coverage analysis and independent-audit evidence Banca d'Italia inspectors expect at on-site inspections and thematic reviews.",
    },
    {
      icon: iconMap.Scale,
      title: "PEP & adverse media (EU + global)",
      desc: "Italian domestic PEPs, foreign PEPs, RCAs and adverse media across 40+ languages — with configurable EDD triggers per D.Lgs. 231 Art. 24.",
    },
    {
      icon: iconMap.Building2,
      title: "Titolare effettivo & Registro RTE",
      desc: "Titolare effettivo collection and verification aligned to the Registro dei Titolari Effettivi at Camere di Commercio, with change monitoring and cross-checks against sanctions and PEP data.",
    },
    {
      icon: iconMap.Landmark,
      title: "Built for Italian banks, IP, IMEL & VASP",
      desc: "Ready templates for banks, payment institutions (IP), electronic money institutions (IMEL), OAM-registered VASPs, SIM and consumer credit lenders.",
    },
    {
      icon: iconMap.Users,
      title: "Responsabile AML evidence pack",
      desc: "Immutable audit trail, Responsabile Antiriciclaggio annual report artefacts and case files formatted for Banca d'Italia inspections and internal audit.",
    },
  ],
  useCases: [
    {
      title: "Italian banks",
      desc: "Meet Banca d'Italia expectations without a dozen point tools. Consolidate adeguata verifica, monitoring, sanctions and SOS reporting into one D.Lgs. 231-aligned platform.",
    },
    {
      title: "IP & IMEL",
      desc: "PSD2 SCA context, safeguarding-aware monitoring and Banca d'Italia's payments-firm expectations — baked into rule packs for payment institutions and electronic money institutions.",
    },
    {
      title: "OAM-registered VASPs",
      desc: "OAM registration evidence, Travel Rule messaging (MiCA/TFR), wallet screening and blockchain analytics for Italian cryptoasset businesses.",
    },
    {
      title: "SIM & asset managers",
      desc: "SIM (società di intermediazione mobiliare) and SGR workflows for high-risk client onboarding, MiFID II record-keeping and CONSOB conduct-of-business controls.",
    },
    {
      title: "Consumer credit & lenders",
      desc: "KYC, sanctions and adverse-media screening embedded in origination, plus ongoing monitoring aligned to Banca d'Italia consumer-credit supervisory expectations.",
    },
    {
      title: "Insurers (IVASS-supervised)",
      desc: "Life insurance and financial-intermediary insurance products under IVASS supervision — adeguata verifica, sanctions and SOS reporting in one platform.",
    },
  ],
  whyPoints: [
    "One platform for D.Lgs. 231/2007, adeguata verifica, monitoring and SOS reporting — no bolt-ons.",
    "1,900+ global watchlists including the full EU consolidated list and Italian national designations with 50% ownership analysis.",
    "Evidence pack built for Banca d'Italia inspections, UIF thematic reviews and independent AML audits.",
    "EU/EEA data residency and SOC 2 Type II controls.",
    "AMLR-, AMLA- and MiCA-ready: harmonised EU rulebook and cryptoasset rules baked into the roadmap.",
  ],
  faqs: [
    {
      q: "What is compliance software in Italy?",
      a: "Compliance software is a platform that automates the controls an Italian regulated business needs to meet its legal and regulatory obligations. For financial services that primarily means AML/CTF under D.Lgs. 231/2007: adeguata verifica (CDD/SDD/EDD), titolare effettivo identification, sanctions and PEP screening, transaction monitoring, case management, Segnalazioni di Operazioni Sospette (SOS) to UIF and Responsabile AML evidence.",
    },
    {
      q: "Is WorldAML aligned to D.Lgs. 231/2007 and Banca d'Italia guidance?",
      a: "Yes. Our modules map directly to D.Lgs. 231/2007 Articles 17–25 (adeguata verifica ordinaria/semplificata/rafforzata, titolare effettivo, PEP), 35 (SOS reporting), 31 (record-keeping) and to Banca d'Italia AML Provvedimenti — so Banca d'Italia inspectors see the artefacts they expect.",
    },
    {
      q: "Do you screen against EU and Italian national sanctions?",
      a: "Yes. WorldAML ingests the EU consolidated financial sanctions list, Italian national designations, UN, UK OFSI and US OFAC feeds. Ownership is analysed to the 50% threshold and screening refreshes within minutes of publication.",
    },
    {
      q: "Can WorldAML submit SOS to UIF?",
      a: "WorldAML generates structured Segnalazioni di Operazioni Sospette and comunicazioni oggettive with narrative templates and statutory reporting-clock tracking. Submissions are made through UIF's INFOSTAT-UIF portal using your firm's account.",
    },
    {
      q: "How does WorldAML handle titolare effettivo and the Registro RTE?",
      a: "Titolare effettivo collection and verification is aligned to the Registro dei Titolari Effettivi at the Camere di Commercio, with change monitoring, cross-checks against sanctions and PEP data, and evidence tied to each customer file.",
    },
    {
      q: "Are you ready for AMLR, AMLA and MiCA?",
      a: "Yes. The harmonised EU rulebook (AMLR, applying from 2027), AMLA direct supervision and MiCA cryptoasset rules are on our roadmap, with configuration switches so Italian entities can adopt them without a rebuild.",
    },
    {
      q: "How is WorldAML priced in Italy?",
      a: "Italian pricing is usage-based on screened customers and monitored transactions, in EUR, with tiers for banks, IP, IMEL, OAM-registered VASPs, SIM and lenders. Talk to sales for a tailored quote.",
    },
  ],
  ctaHeadline: "Ready for your next Banca d'Italia inspection?",
  ctaBody:
    "Get a tailored walkthrough of WorldAML for your Italian firm type, product mix and primary supervisor.",
};

const ComplianceSoftwareIT = () => <CountryComplianceLanding config={config} />;
export default ComplianceSoftwareIT;
