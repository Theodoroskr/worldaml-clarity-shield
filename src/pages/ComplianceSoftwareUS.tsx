import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Shield,
  Globe,
  FileCheck,
  AlertTriangle,
  Scale,
  Building2,
  Landmark,
  Users,
} from "lucide-react";
import SEO from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * US-focused landing page targeting the head keyword "compliance software"
 * (US search volume ~3,600/mo, KDI 39, CPC $24 per Semrush).
 *
 * Intent cluster covered on this page:
 *  - compliance software
 *  - aml compliance software
 *  - regulatory compliance software (for banks / fintechs)
 *  - compliance monitoring software
 *  - bsa compliance software
 *  - sanctions compliance software
 *  - ofac screening software
 */

const regulators = [
  {
    name: "FinCEN & the BSA",
    desc: "The Bank Secrecy Act (31 U.S.C. §5311+) is the foundation of US AML — FinCEN administers CTRs, SARs, CDD (final rule) and beneficial ownership reporting under the Corporate Transparency Act.",
  },
  {
    name: "OFAC",
    desc: "Office of Foreign Assets Control — SDN list, sectoral sanctions (Russia, Iran, Venezuela), 50 Percent Rule and licensing. Strict-liability regime for US persons and US-touching transactions.",
  },
  {
    name: "FFIEC BSA/AML Exam Manual",
    desc: "The playbook federal banking examiners (OCC, FRB, FDIC, NCUA) use to assess your BSA/AML program — risk assessment, CIP, CDD, EDD, suspicious activity monitoring and independent testing.",
  },
  {
    name: "SEC & FINRA",
    desc: "Rule 3310 AML programs for broker-dealers, FinCEN's investment adviser AML rule (effective 2026), and SEC marketing/record-keeping obligations.",
  },
  {
    name: "State regulators (NYDFS Part 504)",
    desc: "NYDFS 23 NYCRR Part 504 requires annual certification of transaction monitoring and OFAC filtering programs — plus state MTL and money-services examinations.",
  },
  {
    name: "USA PATRIOT Act",
    desc: "Sections 311, 314(a)/(b), 326 (CIP) and 352 — the statutory basis for information sharing, correspondent banking due diligence and customer identification.",
  },
];

const features = [
  {
    icon: Globe,
    title: "OFAC SDN + consolidated screening",
    desc: "Real-time screening against the OFAC SDN list, consolidated non-SDN lists, sectoral sanctions and the 50 Percent Rule — updated within minutes of Treasury publication.",
  },
  {
    icon: Shield,
    title: "BSA/AML program in one platform",
    desc: "CIP, CDD, EDD, beneficial-ownership collection and ongoing monitoring aligned to 31 CFR §1020.220 and the FinCEN CDD Final Rule.",
  },
  {
    icon: FileCheck,
    title: "SAR & CTR e-filing exports",
    desc: "Pre-formatted SAR and CTR outputs compatible with the FinCEN BSA E-Filing System, including narrative builder and 30/60-day deadline tracking.",
  },
  {
    icon: AlertTriangle,
    title: "Transaction monitoring (Part 504-ready)",
    desc: "Configurable rules, tuning workflows and independent-testing evidence engineered to satisfy NYDFS Part 504 annual certifications and FFIEC examiner expectations.",
  },
  {
    icon: Scale,
    title: "PEP & adverse media (US + global)",
    desc: "9.2M+ profiles including US domestic PEPs, foreign PEPs, RCAs, sanctions ownership networks and negative news across 40+ languages.",
  },
  {
    icon: Building2,
    title: "CTA beneficial ownership workflows",
    desc: "Collection, verification and refresh of beneficial ownership information aligned to the Corporate Transparency Act and FinCEN's BOI reporting rule.",
  },
  {
    icon: Landmark,
    title: "Built for US banks, MSBs & fintechs",
    desc: "Ready templates for community banks, credit unions, MSBs, broker-dealers, RIAs (2026 rule), digital-asset firms and lending fintechs.",
  },
  {
    icon: Users,
    title: "Independent-testing evidence pack",
    desc: "Immutable audit trail, model-validation artifacts and case files formatted for annual independent testing and 314(a)/(b) information sharing.",
  },
];

const useCases = [
  {
    title: "Community & regional banks",
    desc: "Meet OCC/FDIC/FRB exam expectations without a dozen point tools. Consolidate CIP, CDD, monitoring, OFAC and SAR filing into one BSA/AML platform.",
  },
  {
    title: "Fintechs & sponsor-bank programs",
    desc: "Give your sponsor bank the audit trail they demand — configurable rules, oversight dashboards and evidence for third-party risk reviews.",
  },
  {
    title: "MSBs & payments",
    desc: "State MTL, FinCEN registration, CTR aggregation and OFAC screening across every payment corridor, with jurisdictional rule packs.",
  },
  {
    title: "Digital-asset & crypto firms",
    desc: "Travel Rule messaging, wallet screening, blockchain analytics and SAR narratives built for MSB-registered VASPs.",
  },
  {
    title: "Broker-dealers & investment advisers",
    desc: "FINRA Rule 3310 programs and the new FinCEN investment-adviser AML rule (effective 2026) — CIP, CDD and monitoring in one place.",
  },
  {
    title: "Lenders & consumer finance",
    desc: "KYC, sanctions and adverse-media screening embedded in origination, plus ongoing monitoring for the life of the loan.",
  },
];

const faqs = [
  {
    q: "What is compliance software?",
    a: "Compliance software is a platform that automates the controls a regulated business needs to meet legal and regulatory obligations — in financial services, that primarily means AML/CFT: customer identification (CIP), customer due diligence (CDD), sanctions and PEP screening, transaction monitoring, case management, suspicious activity reporting (SAR/CTR) and independent testing evidence. WorldAML delivers all of these in one auditable platform, purpose-built around US BSA/AML rules.",
  },
  {
    q: "Is WorldAML aligned to the FFIEC BSA/AML Examination Manual?",
    a: "Yes. Our BSA/AML program modules map directly to the FFIEC Manual's pillars — risk assessment, internal controls, independent testing, BSA officer oversight, training, CDD/EDD and suspicious activity monitoring — so examiners see the artifacts they expect in the format they expect.",
  },
  {
    q: "Do you screen against the full OFAC list, including the 50 Percent Rule?",
    a: "Yes. WorldAML ingests the OFAC SDN list, all consolidated non-SDN lists (SSI, FSE, NS-PLC and others), sectoral sanctions and ownership networks required by the 50 Percent Rule. Screening refreshes within minutes of Treasury publication and is available in real time or in batch.",
  },
  {
    q: "Can WorldAML file SARs and CTRs to FinCEN?",
    a: "WorldAML generates SAR and CTR outputs compatible with the FinCEN BSA E-Filing System, including narrative templates, supporting documentation packaging and deadline tracking (30 days from detection, extendable to 60). Filers submit through their existing BSA E-Filing credentials.",
  },
  {
    q: "Does WorldAML support NYDFS Part 504 annual certifications?",
    a: "Yes. Rule tuning history, coverage analysis, sample validation, above/below-the-line testing and issue remediation are all captured in an evidence pack you can hand to your Senior Officer for the annual Part 504 certification.",
  },
  {
    q: "Are you ready for the FinCEN investment adviser AML rule (2026)?",
    a: "Yes. Registered investment advisers and exempt reporting advisers subject to the new FinCEN rule can deploy a full AML program on WorldAML — CIP, CDD, sanctions and adverse-media screening, monitoring and SAR filing — well ahead of the compliance date.",
  },
  {
    q: "How does WorldAML handle the Corporate Transparency Act (CTA) BOI reporting?",
    a: "We collect and verify beneficial ownership information aligned to FinCEN's BOI reporting rule, with change-tracking, refresh workflows and cross-checks against sanctions and PEP data.",
  },
  {
    q: "How is WorldAML priced?",
    a: "US pricing is usage-based on screened customers and monitored transactions, with volume tiers for community banks, MSBs and fintechs. Talk to sales for a tailored quote — most customers replace 3–5 point tools with one platform.",
  },
];

const ComplianceSoftwareUS = () => {
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const softwareLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "WorldAML Compliance Software (US)",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description:
      "US compliance software for BSA/AML, OFAC sanctions, KYC/CIP, transaction monitoring and SAR/CTR filing — built for banks, fintechs, MSBs and investment advisers.",
    url: "https://worldaml.com/compliance-software/us",
    audience: { "@type": "Audience", audienceType: "Financial institutions and fintechs (United States)" },
    offers: {
      "@type": "Offer",
      priceCurrency: "USD",
      price: "0",
      category: "Enterprise SaaS",
      url: "https://worldaml.com/contact-sales",
    },
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Compliance Software for US Banks, Fintechs & MSBs | WorldAML"
        description="Compliance software for US financial institutions — BSA/AML, OFAC sanctions, KYC/CIP, transaction monitoring and SAR/CTR e-filing in one FFIEC- and NYDFS Part 504-ready platform."
        canonical="/compliance-software/us"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Compliance Software", url: "/compliance-software/us" },
          { name: "United States", url: "/compliance-software/us" },
        ]}
        structuredData={[faqLd, softwareLd]}
      />
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="section-padding bg-surface-subtle">
          <div className="container-enterprise">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold tracking-wide uppercase text-accent mb-4">
                United States
              </p>
              <h1 className="text-headline text-navy mb-6">
                Compliance software built for US banks, fintechs and MSBs
              </h1>
              <p className="text-body-lg text-text-secondary mb-8">
                WorldAML is the AML compliance software US financial institutions use to meet BSA,
                OFAC, FFIEC, FinCEN and NYDFS Part 504 obligations — from CIP and CDD to sanctions
                screening, transaction monitoring and SAR/CTR e-filing, in one auditable platform.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button variant="accent" size="lg" asChild>
                  <Link to="/contact-sales">Talk to a US compliance specialist</Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/free-aml-check">
                    Run a free OFAC sanctions check <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <p className="text-sm text-text-secondary mt-6">
                Trusted by community banks, sponsor-bank fintech programs, MSBs, broker-dealers and
                digital-asset firms across all 50 states.
              </p>
            </div>
          </div>
        </section>

        {/* Regulators */}
        <section className="section-padding bg-background">
          <div className="container-enterprise">
            <h2 className="text-2xl text-navy mb-2">Aligned to the US regulatory stack</h2>
            <p className="text-text-secondary mb-8 max-w-2xl">
              One compliance platform covering every US federal and state authority a regulated
              financial institution needs to evidence a program against.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regulators.map((r) => (
                <Card key={r.name} className="border-divider">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-navy">{r.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{r.desc}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="section-padding bg-surface-subtle">
          <div className="container-enterprise">
            <h2 className="text-2xl text-navy mb-2">Everything a US BSA/AML program needs</h2>
            <p className="text-text-secondary mb-8 max-w-2xl">
              Replace 3–5 point tools with one platform. Purpose-built modules for every pillar of a
              US compliance program.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((f) => (
                <Card key={f.title} className="border-divider bg-white">
                  <CardHeader className="pb-3">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-accent/10 text-accent mb-3">
                      <f.icon className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-lg text-navy">{f.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{f.desc}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Use cases */}
        <section className="section-padding bg-background">
          <div className="container-enterprise">
            <h2 className="text-2xl text-navy mb-8">Regulatory compliance software for every US charter</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {useCases.map((u) => (
                <div key={u.title} className="p-6 rounded-lg border border-divider bg-white">
                  <h3 className="text-lg font-semibold text-navy mb-2">{u.title}</h3>
                  <p className="text-text-secondary">{u.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why WorldAML */}
        <section className="section-padding bg-surface-subtle">
          <div className="container-enterprise max-w-4xl">
            <h2 className="text-2xl text-navy mb-6">
              Why US compliance teams pick WorldAML
            </h2>
            <ul className="space-y-4">
              {[
                "One platform for BSA/AML, OFAC, KYC, CIP, CDD, monitoring, SAR/CTR — no bolt-ons.",
                "1,900+ global watchlists including the full OFAC universe and 50 Percent Rule ownership networks.",
                "Independent-testing evidence pack built for FFIEC examiners and NYDFS Part 504 certification.",
                "US data residency options and SOC 2 Type II controls.",
                "Deploy a working program in weeks, not the 6–12 months legacy vendors quote.",
              ].map((point) => (
                <li key={point} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-1" />
                  <span className="text-text-secondary">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* FAQ */}
        <section className="section-padding bg-background">
          <div className="container-enterprise max-w-3xl">
            <h2 className="text-2xl text-navy mb-8">US compliance software — FAQ</h2>
            <div className="space-y-6">
              {faqs.map((f) => (
                <div key={f.q} className="border-b border-divider pb-6">
                  <h3 className="text-lg font-semibold text-navy mb-2 flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-1" />
                    {f.q}
                  </h3>
                  <p className="text-text-secondary pl-7">{f.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="section-padding bg-navy">
          <div className="container-enterprise text-center">
            <h2 className="text-3xl text-white mb-4">
              Ready for your next BSA/AML exam?
            </h2>
            <p className="text-white/80 mb-8 max-w-2xl mx-auto">
              Get a tailored walkthrough of WorldAML for your charter, product mix and primary
              regulator.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Button variant="accent" size="lg" asChild>
                <Link to="/contact-sales">Request a demo</Link>
              </Button>
              <Button variant="outline" size="lg" asChild className="bg-transparent text-white border-white/40 hover:bg-white/10 hover:text-white">
                <Link to="/free-aml-check">Try a free OFAC check</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ComplianceSoftwareUS;
