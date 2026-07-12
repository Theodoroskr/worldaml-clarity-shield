import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, Shield, Globe, FileCheck, AlertTriangle, Scale, Building2 } from "lucide-react";
import SEO from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const regulators = [
  { name: "EU AMLA", desc: "The new EU Anti-Money Laundering Authority (operational 2026) directly supervises high-risk cross-border financial institutions." },
  { name: "6AMLD", desc: "Sixth AML Directive expanding predicate offences and corporate criminal liability across all 27 Member States." },
  { name: "AMLR (Regulation 2024/1624)", desc: "The Single Rulebook — directly applicable AML rules harmonising obligations across the EU from July 2027." },
  { name: "EU Sanctions (CFSP)", desc: "Restrictive measures adopted under the Common Foreign and Security Policy — including the consolidated EU sanctions list and Russia/Belarus packages." },
  { name: "EBA Guidelines", desc: "European Banking Authority guidelines on risk factors, customer due diligence, and risk-based supervision." },
  { name: "National FIUs", desc: "Reporting to BaFin (DE), AMF/Tracfin (FR), Bank of Italy (IT), SEPBLAC (ES), and 23 other national authorities." },
];

const features = [
  { icon: Globe, title: "EU consolidated sanctions list", desc: "Full coverage of the EU Financial Sanctions Database (FSF) plus all CFSP designations, updated within minutes of publication." },
  { icon: Shield, title: "AMLR-ready customer due diligence", desc: "CDD, EDD, UBO verification and ongoing monitoring workflows aligned to Regulation (EU) 2024/1624." },
  { icon: FileCheck, title: "goAML & national FIU reporting", desc: "Pre-formatted STR/SAR exports for BaFin, Tracfin, SEPBLAC, MOKAS, FIU-NL, and other EU FIUs using the goAML schema." },
  { icon: AlertTriangle, title: "PEP & adverse media (EU + global)", desc: "9.2M+ profiles including domestic, foreign and international organisation PEPs across all 27 EU Member States." },
  { icon: Scale, title: "Risk-based approach", desc: "Configurable risk models aligned to EBA risk-factor guidelines and your national supervisor's expectations." },
  { icon: Building2, title: "Multi-jurisdiction tenants", desc: "Separate compliance environments per Member State with localised rules, languages and reporting templates." },
];

const faqs = [
  {
    q: "What is the EU AMLR and when does it apply?",
    a: "The Anti-Money Laundering Regulation (EU) 2024/1624 is directly applicable EU-wide from 10 July 2027. It harmonises CDD, beneficial ownership, and reporting rules under a single rulebook supervised by AMLA. WorldAML's screening, KYC/KYB and monitoring workflows are mapped to the AMLR Single Rulebook so EU firms can migrate without re-engineering controls.",
  },
  {
    q: "Does WorldAML cover the EU consolidated sanctions list?",
    a: "Yes. We ingest the EU Financial Sanctions Database (FSF), every CFSP Council Decision, and all national transpositions. Updates propagate to screening within minutes of EU Official Journal publication, including the latest Russia, Belarus, Iran and counter-terrorism packages.",
  },
  {
    q: "Which EU regulators and FIUs are supported for reporting?",
    a: "Pre-built export templates cover goAML (the UN-standard schema used by most EU FIUs), plus jurisdiction-specific formats for BaFin (Germany), Tracfin (France), Banca d'Italia UIF (Italy), SEPBLAC (Spain), FIU-NL (Netherlands), MOKAS (Cyprus), CSSF (Luxembourg), and others.",
  },
  {
    q: "How do you handle the EU UBO registers?",
    a: "We provide UBO data ingestion and verification workflows compatible with the EU Beneficial Ownership Registers Interconnection System (BORIS) and national registers, with cross-checks against PEP and sanctions data.",
  },
  {
    q: "Is WorldAML GDPR compliant?",
    a: "Yes. WorldAML is delivered by Infocredit Group, a Cyprus/EU-headquartered processor. All EU customer data is hosted in the EU, with full GDPR Article 28 data processing agreements, DPIA support, and audit logs.",
  },
];

const AMLScreeningEU = () => {
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="EU AML Screening & Sanctions Compliance Software"
        description="EU AML screening & sanctions compliance software — AMLR, 6AMLD, AMLA, EU consolidated sanctions and goAML reporting across all 27 Member States."
        canonical="/aml-screening/eu"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "AML Screening", url: "/platform/aml-screening" },
          { name: "European Union", url: "/aml-screening/eu" },
        ]}
        structuredData={faqLd}
      />
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="section-padding bg-surface-subtle">
          <div className="container-enterprise">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold tracking-wide uppercase text-accent mb-4">European Union</p>
              <h1 className="text-headline text-navy mb-6">
                AML screening and sanctions compliance for the European Union
              </h1>
              <p className="text-body-lg text-text-secondary mb-8">
                WorldAML helps banks, fintechs, payment institutions and obliged entities across the EU
                meet 6AMLD, the new AML Regulation (AMLR), AMLA supervision and EBA guidelines — with a
                single platform for screening, KYC/KYB, transaction monitoring and FIU reporting.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button variant="accent" size="lg" asChild>
                  <Link to="/contact-sales">Talk to an EU compliance specialist</Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/free-aml-check">
                    Run a free EU sanctions check <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Regulators */}
        <section className="section-padding bg-background">
          <div className="container-enterprise">
            <h2 className="text-2xl text-navy mb-2">EU regulatory framework, covered end-to-end</h2>
            <p className="text-text-secondary mb-8 max-w-2xl">
              One platform aligned to every layer of the EU AML/CFT framework — from EU-level
              regulation to national supervisor expectations.
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
            <h2 className="text-2xl text-navy mb-8">Built for EU obliged entities</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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

        {/* FAQ */}
        <section className="section-padding bg-background">
          <div className="container-enterprise max-w-3xl">
            <h2 className="text-2xl text-navy mb-8">EU AML compliance — FAQ</h2>
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
            <h2 className="text-3xl text-white mb-4">Ready for AMLA and the EU Single Rulebook?</h2>
            <p className="text-white/80 mb-8 max-w-2xl mx-auto">
              Get a tailored walkthrough of WorldAML for your Member State, FIU, and product mix.
            </p>
            <Button variant="accent" size="lg" asChild>
              <Link to="/contact-sales">Request a demo</Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default AMLScreeningEU;
