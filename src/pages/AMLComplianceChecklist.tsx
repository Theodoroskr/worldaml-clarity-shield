import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  ShieldCheck,
  Users,
  FileSearch,
  AlertTriangle,
  Repeat,
  Archive,
  BookOpen,
} from "lucide-react";

const faqStructuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is an AML compliance checklist?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "An AML compliance checklist is a structured list of the minimum controls a regulated business must have in place to detect and prevent money laundering — covering governance, customer due diligence, sanctions and PEP screening, transaction monitoring, suspicious activity reporting, staff training and record-keeping.",
      },
    },
    {
      "@type": "Question",
      name: "Who needs to follow an AML compliance checklist?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Banks, payment institutions, e-money issuers, fintechs, crypto-asset service providers, insurers, gaming operators, legal and accountancy firms, real-estate agents, dealers in high-value goods, and any other business classified as a financial institution or DNFBP under local AML law.",
      },
    },
    {
      "@type": "Question",
      name: "How often should an AML programme be audited?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "At least annually. An independent AML audit tests policies, sanctions and PEP screening effectiveness, transaction monitoring calibration, staff training and record-keeping against current regulatory expectations (FATF Recommendations, EU AMLD, UK MLRs 2017, US Bank Secrecy Act, UAE Federal Decree-Law 20/2018).",
      },
    },
    {
      "@type": "Question",
      name: "What are the core FATF Recommendations an AML checklist should map to?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "At minimum: R.1 risk-based approach, R.10 customer due diligence, R.12 politically exposed persons, R.15 new technologies, R.20 suspicious transaction reporting, R.6/7 targeted financial sanctions, R.11 record-keeping (5 years) and R.18 internal controls including an independent audit function.",
      },
    },
  ],
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "AML Compliance Checklist for Regulated Businesses",
  description:
    "Comprehensive AML compliance and audit checklist covering governance, customer due diligence, sanctions and PEP screening, transaction monitoring, SAR filing, training and record-keeping — mapped to FATF, EU AMLD and UK MLRs.",
  author: { "@type": "Organization", name: "WorldAML" },
  publisher: {
    "@type": "Organization",
    name: "WorldAML",
    logo: { "@type": "ImageObject", url: "https://worldaml.com/og-image.png" },
  },
  mainEntityOfPage: "https://worldaml.com/resources/aml-compliance-checklist",
};

const sections = [
  {
    icon: ShieldCheck,
    title: "1. Governance & AML programme",
    items: [
      "Board-approved AML/CFT policy reviewed at least annually",
      "Appointed, qualified MLRO (Money Laundering Reporting Officer) with direct board access",
      "Documented three-lines-of-defence model with clear ownership",
      "Enterprise-Wide Risk Assessment (EWRA) covering customer, geographic, product and channel risk",
      "Documented risk appetite statement linked to onboarding and monitoring thresholds",
    ],
  },
  {
    icon: Users,
    title: "2. Customer Due Diligence (CDD & KYC)",
    items: [
      "Identity verification on every natural person using government-issued ID + liveness / biometric check",
      "KYB verification against corporate registries in every jurisdiction where you onboard",
      "Beneficial ownership mapping to the ≥ 25% threshold with UBO KYC on each",
      "Source of funds and source of wealth for high-risk customers",
      "Documented risk rating (low / medium / high) applied at onboarding and refreshed on trigger events",
    ],
  },
  {
    icon: FileSearch,
    title: "3. Sanctions, PEP & adverse media screening",
    items: [
      "Real-time screening against 1,900+ global sanctions and watchlists at onboarding",
      "Continuous re-screening within 24 hours of any list update (OFAC, UN, EU, HMT, EOCN)",
      "PEP screening including domestic PEPs, family members and known close associates",
      "Adverse media screening covering financial crime, corruption and sanctions evasion",
      "Documented false-positive resolution workflow with 4-eyes review on true hits",
    ],
  },
  {
    icon: Repeat,
    title: "4. Ongoing monitoring & transaction monitoring",
    items: [
      "Rule-based transaction monitoring calibrated to the EWRA and product mix",
      "Behavioural / anomaly detection for structuring, layering and rapid-movement typologies",
      "Periodic KYC refresh cycle: annually (high-risk), 2–3 years (medium), 5 years (low)",
      "Trigger-based reviews on material change (new UBO, new jurisdiction, PEP status change)",
      "Alert-handling SLA and audit trail for every disposition decision",
    ],
  },
  {
    icon: AlertTriangle,
    title: "5. Suspicious activity & regulatory reporting",
    items: [
      "SAR / STR filing procedure with escalation from front line → MLRO",
      "No de minimis threshold — file on suspicion, not on amount",
      "Filing via the correct national channel (goAML, FinCEN, NCA, MOKAS, FINTRAC)",
      "Tipping-off controls preventing disclosure to the subject",
      "Currency Transaction Reports (CTRs) and cross-border wire reports where applicable",
    ],
  },
  {
    icon: BookOpen,
    title: "6. Training & culture",
    items: [
      "Role-based AML training completed within 30 days of joining",
      "Annual refresher training with documented competency test",
      "Board and senior management briefed at least annually on AML risk",
      "Typology updates issued to front-line staff after major regulatory changes",
    ],
  },
  {
    icon: Archive,
    title: "7. Record-keeping & audit",
    items: [
      "Retention of CDD, transaction and screening records for at least 5 years",
      "Immutable audit trail on every screening decision and SAR filing",
      "Independent AML audit at least annually, with findings tracked to closure",
      "Regulator-ready evidence pack for on-demand inspections",
    ],
  },
];

const auditChecklist = [
  "Is the EWRA less than 12 months old and signed off by the board?",
  "Can you produce, for any customer, the ID document, UBO chain and risk rating within 5 minutes?",
  "Are sanctions lists refreshed at least daily and re-screened against the full customer base?",
  "Is every SAR filed within the statutory window (typically 'without delay') and evidenced?",
  "Do all staff subject to AML rules have current training records?",
  "Is the independent AML audit report available with a management response and remediation plan?",
];

const AMLComplianceChecklist = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="AML Compliance Checklist — Audit-Ready Controls"
        description="Practical AML compliance and audit checklist for banks, fintechs, crypto, gaming and DNFBPs. Governance, CDD, sanctions screening, monitoring, SAR filing, training and record-keeping."
        canonical="/resources/aml-compliance-checklist"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Resources", url: "/resources/glossary" },
          { name: "AML Compliance Checklist", url: "/resources/aml-compliance-checklist" },
        ]}
        structuredData={[faqStructuredData, articleStructuredData]}
      />
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="section-padding bg-gradient-to-b from-primary/5 to-background">
          <div className="container-enterprise max-w-4xl">
            <p className="text-caption uppercase tracking-widest text-primary font-semibold mb-3">
              Compliance Resource
            </p>
            <h1 className="text-display text-navy mb-4">
              AML Compliance Checklist for Regulated Businesses
            </h1>
            <p className="text-body-lg text-text-secondary mb-6">
              A practical, audit-ready checklist compliance officers and MLROs can use to evaluate
              their anti-money laundering programme against FATF Recommendations, EU AMLD, UK MLRs
              2017 and US Bank Secrecy Act requirements — and identify where automation can close
              the gaps.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link to="/contact-sales">Book a compliance review</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/platform/aml-screening">See the WorldAML platform</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Why it matters */}
        <section className="section-padding">
          <div className="container-enterprise max-w-4xl space-y-6">
            <h2 className="text-headline text-navy">Why every regulated firm needs an AML checklist</h2>
            <p className="text-body text-text-secondary">
              Anti-money laundering supervisors are increasingly outcome-focused: it is not enough
              to have a policy, you must demonstrate that controls operate effectively. A
              well-structured AML compliance checklist gives boards, MLROs and auditors a single
              source of truth for what "good" looks like — from onboarding due diligence through
              to record-keeping — and makes it trivial to identify where manual processes are
              slowing you down or introducing risk.
            </p>
            <p className="text-body text-text-secondary">
              Use the sections below as either a self-assessment tool ahead of your next internal
              audit, or as a gap analysis when scoping automation of KYC, sanctions screening and
              transaction monitoring.
            </p>
          </div>
        </section>

        {/* Checklist sections */}
        <section className="section-padding bg-surface-subtle">
          <div className="container-enterprise max-w-4xl space-y-10">
            <div>
              <h2 className="text-headline text-navy mb-2">The 7-part AML compliance checklist</h2>
              <p className="text-body text-text-secondary">
                Each section maps to core FATF Recommendations and to the operational controls
                supervisors expect to see evidenced during inspection.
              </p>
            </div>
            {sections.map((section) => (
              <div key={section.title} className="bg-card border border-divider rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <section.icon className="w-6 h-6 text-teal" />
                  <h3 className="text-title text-navy font-semibold">{section.title}</h3>
                </div>
                <ul className="space-y-3">
                  {section.items.map((item) => (
                    <li key={item} className="flex gap-3">
                      <CheckCircle2 className="w-5 h-5 text-teal flex-shrink-0 mt-0.5" />
                      <span className="text-body-sm text-text-secondary">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Audit questions */}
        <section className="section-padding">
          <div className="container-enterprise max-w-4xl">
            <div className="flex items-center gap-3 mb-4">
              <ClipboardList className="w-7 h-7 text-teal" />
              <h2 className="text-headline text-navy">AML audit checklist: 6 questions to test readiness</h2>
            </div>
            <p className="text-body text-text-secondary mb-6">
              If you cannot answer "yes" — with evidence — to each of these, prioritise remediation
              before your next regulatory inspection or independent AML audit.
            </p>
            <ol className="space-y-4">
              {auditChecklist.map((q, i) => (
                <li key={q} className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-teal/10 text-teal flex items-center justify-center font-semibold">
                    {i + 1}
                  </div>
                  <p className="text-body text-text-secondary pt-1">{q}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* CTA */}
        <section className="section-padding bg-navy text-white">
          <div className="container-enterprise max-w-4xl text-center">
            <ShieldCheck className="w-12 h-12 text-teal mx-auto mb-4" />
            <h2 className="text-headline mb-4">Automate the checklist with WorldAML</h2>
            <p className="text-body-lg text-white/80 mb-6 max-w-2xl mx-auto">
              WorldAML operationalises this checklist end-to-end — customer due diligence, 1,900+
              list sanctions and PEP screening, adverse media, transaction monitoring, SAR
              workflows and audit-ready record-keeping — in one platform trusted by US, UK, EU and
              UAE compliance teams.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button asChild size="lg">
                <Link to="/contact-sales">
                  Book a compliance review <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-transparent text-white border-white/30 hover:bg-white/10">
                <Link to="/resources/aml-regulations">Browse AML regulations by region</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default AMLComplianceChecklist;
