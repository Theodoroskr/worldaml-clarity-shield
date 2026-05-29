import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, Shield, Globe, FileCheck, AlertTriangle, Scale, Building2 } from "lucide-react";
import SEO from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const regulators = [
  { name: "FCA", desc: "Financial Conduct Authority — supervises banks, e-money, payments, crypto-asset firms and consumer credit firms under the Money Laundering Regulations 2017." },
  { name: "MLR 2017", desc: "Money Laundering, Terrorist Financing and Transfer of Funds (Information on the Payer) Regulations 2017 — the UK's core AML rulebook." },
  { name: "POCA 2002", desc: "Proceeds of Crime Act — predicate offences, SARs to the NCA, and tipping-off provisions." },
  { name: "OFSI (HMT)", desc: "Office of Financial Sanctions Implementation — UK consolidated sanctions list, Russia/Belarus regimes and licensing." },
  { name: "JMLSG Guidance", desc: "Joint Money Laundering Steering Group sectoral guidance recognised by HM Treasury." },
  { name: "HMRC & Gambling Commission", desc: "AML supervision for MSBs, high-value dealers, art market participants and licensed gambling operators." },
];

const features = [
  { icon: Globe, title: "OFSI UK sanctions list", desc: "Full coverage of the UK consolidated list of financial sanctions targets — refreshed within minutes of OFSI publication, separate from EU regimes." },
  { icon: Shield, title: "MLR 2017 CDD & EDD workflows", desc: "Customer due diligence, simplified, enhanced and source-of-funds workflows aligned to Regulations 27–35 and JMLSG guidance." },
  { icon: FileCheck, title: "NCA SAR Online reporting", desc: "Pre-formatted Suspicious Activity Reports compatible with the NCA's SAR Online portal, including DAML and consent SARs." },
  { icon: AlertTriangle, title: "UK PEP regime (FCA FG17/6)", desc: "Domestic PEP screening proportionate to FCA Finalised Guidance 17/6, distinguishing UK domestic PEPs from foreign PEPs." },
  { icon: Scale, title: "Crypto-asset firm compliance", desc: "Travel Rule, wallet screening and ongoing monitoring built for FCA-registered crypto-asset businesses under MLR 2017 (as amended)." },
  { icon: Building2, title: "Companies House & UBO checks", desc: "PSC register integration, Companies House data ingestion, and beneficial ownership verification for UK and overseas entities." },
];

const faqs = [
  {
    q: "Is WorldAML aligned to the UK Money Laundering Regulations 2017?",
    a: "Yes. WorldAML's CDD, EDD, ongoing monitoring, record-keeping and risk-assessment workflows are mapped to the MLR 2017 (as amended in 2019, 2022 and 2023) and to JMLSG sectoral guidance. We support all categories of regulated firm — banks, e-money, payments, MSBs, crypto-asset firms, and DNFBPs.",
  },
  {
    q: "Do you cover the OFSI UK consolidated sanctions list separately from the EU list?",
    a: "Yes. Since Brexit the UK operates an autonomous sanctions regime under the Sanctions and Anti-Money Laundering Act 2018 (SAMLA). We screen against the OFSI consolidated list, UK Russia and Belarus regulations, and all UK-specific designations independently of EU CFSP measures.",
  },
  {
    q: "Can WorldAML file SARs to the NCA?",
    a: "We generate SAR-ready exports compatible with the NCA's SAR Online portal, including suspected money laundering SARs, DAML (Defence Against Money Laundering) and consent requests. The platform tracks reporting deadlines and tipping-off controls under POCA 2002.",
  },
  {
    q: "How does WorldAML handle FCA-registered crypto-asset firms?",
    a: "We provide blockchain analytics, wallet screening, Travel Rule (FATF Recommendation 16) messaging, and transaction monitoring aligned to the MLR 2017 obligations the FCA enforces for UK crypto-asset businesses.",
  },
  {
    q: "Are domestic UK PEPs treated proportionately?",
    a: "Yes. In line with FCA Finalised Guidance FG17/6 (updated 2024), domestic UK PEPs and their family/associates start at a lower inherent risk than foreign PEPs, with proportionate EDD that can be adjusted by your MLRO.",
  },
];

const AMLScreeningUK = () => {
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
        title="UK AML Screening & OFSI Sanctions Software"
        description="AML, sanctions and PEP screening built for the UK — MLR 2017, FCA supervision, JMLSG guidance, OFSI consolidated list and NCA SAR Online reporting for banks, fintechs and crypto-asset firms."
        canonical="/aml-screening/uk"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "AML Screening", url: "/platform/aml-screening" },
          { name: "United Kingdom", url: "/aml-screening/uk" },
        ]}
        structuredData={faqLd}
      />
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="section-padding bg-surface-subtle">
          <div className="container-enterprise">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold tracking-wide uppercase text-accent mb-4">United Kingdom</p>
              <h1 className="text-headline text-navy mb-6">
                AML and sanctions compliance for UK regulated firms
              </h1>
              <p className="text-body-lg text-text-secondary mb-8">
                WorldAML gives UK banks, fintechs, payment institutions, MSBs, crypto-asset firms and
                DNFBPs a single platform for MLR 2017, FCA, OFSI and NCA obligations — from CDD and
                EDD to ongoing monitoring, sanctions screening and SAR filing.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button variant="accent" size="lg" asChild>
                  <Link to="/contact-sales">Talk to a UK compliance specialist</Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/free-aml-check">
                    Run a free UK sanctions check <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Regulators */}
        <section className="section-padding bg-background">
          <div className="container-enterprise">
            <h2 className="text-2xl text-navy mb-2">Built around the UK AML/CFT rulebook</h2>
            <p className="text-text-secondary mb-8 max-w-2xl">
              One platform covering every UK supervisor and regulation a regulated firm needs to
              evidence compliance against.
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
            <h2 className="text-2xl text-navy mb-8">UK-ready out of the box</h2>
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
            <h2 className="text-2xl text-navy mb-8">UK AML compliance — FAQ</h2>
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
            <h2 className="text-3xl text-white mb-4">FCA-ready AML compliance, without the spreadsheets</h2>
            <p className="text-white/80 mb-8 max-w-2xl mx-auto">
              See WorldAML in action with UK data, UK regulators and your firm's product mix.
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

export default AMLScreeningUK;
