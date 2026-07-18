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
 * UK-focused landing page targeting the head keywords "compliance software"
 * (UK ~1,600/mo) and "aml software" (UK meaningful volume, high commercial intent).
 *
 * Intent cluster covered on this page:
 *  - compliance software / aml software / kyc software (UK)
 *  - regulatory compliance software (banks / fintechs / EMIs)
 *  - sanctions screening software (OFSI)
 *  - transaction monitoring software (FCA / JMLSG)
 *  - MLR 2017, POCA 2002, Terrorism Act 2000
 */

const regulators = [
  {
    name: "FCA (Financial Conduct Authority)",
    desc: "Primary conduct regulator for UK banks, EMIs, payment institutions, crypto-asset firms and investment firms — enforces the Money Laundering Regulations 2017 (MLR 2017) and SYSC financial crime obligations.",
  },
  {
    name: "HMRC",
    desc: "Supervises MSBs, trust and company service providers, and other non-FCA regulated firms under MLR 2017. Conducts thematic inspections and issues fines for AML failings.",
  },
  {
    name: "OFSI (Office of Financial Sanctions Implementation)",
    desc: "HM Treasury body responsible for UK sanctions — the UK Sanctions List, Russia/Belarus/Iran regimes, strict-liability civil monetary penalties and reporting obligations for designated persons.",
  },
  {
    name: "NCA & the UKFIU",
    desc: "The National Crime Agency's UK Financial Intelligence Unit receives Suspicious Activity Reports (SARs) and Defence Against Money Laundering (DAML) requests under POCA 2002.",
  },
  {
    name: "JMLSG Guidance",
    desc: "Joint Money Laundering Steering Group guidance is HM Treasury-approved industry practice. Courts and regulators treat it as the benchmark for a compliant UK AML programme.",
  },
  {
    name: "PRA & Bank of England",
    desc: "Prudential Regulation Authority oversight for dual-regulated deposit takers and insurers — financial-crime controls sit within the wider operational-resilience and governance framework.",
  },
];

const features = [
  {
    icon: Globe,
    title: "UK Sanctions List + OFSI screening",
    desc: "Real-time screening against the UK Sanctions List (consolidated), OFSI regime-specific lists (Russia, Belarus, Iran, DPRK), UN, EU and OFAC — with ownership and control analysis to the 50% threshold.",
  },
  {
    icon: Shield,
    title: "MLR 2017 programme in one platform",
    desc: "CDD, EDD, SDD, PEP handling, ongoing monitoring and record-keeping aligned to Regulations 27–40 of the Money Laundering Regulations 2017 and JMLSG Part I & II.",
  },
  {
    icon: FileCheck,
    title: "SAR & DAML submissions to the UKFIU",
    desc: "Structured SAR builder for the NCA SAR Portal, DAML request workflow under POCA §§327–329 and 338, plus 7-day / 31-day statutory clock tracking.",
  },
  {
    icon: AlertTriangle,
    title: "Transaction monitoring (FCA-ready)",
    desc: "Configurable rules, thresholds and behavioural analytics with tuning history, coverage analysis and independent-testing evidence FCA supervisors expect at s.166 skilled-person reviews.",
  },
  {
    icon: Scale,
    title: "PEP & adverse media (UK + global)",
    desc: "UK domestic PEPs (proportionate treatment per FCA FG17/6), foreign PEPs, RCAs, sanctions ownership networks and adverse media across 40+ languages.",
  },
  {
    icon: Building2,
    title: "Companies House & UBO verification",
    desc: "PSC register cross-checks, beneficial ownership collection and verification, and change-in-control monitoring aligned to MLR Reg 28 and the Economic Crime & Corporate Transparency Act.",
  },
  {
    icon: Landmark,
    title: "Built for UK banks, EMIs, PIs & crypto firms",
    desc: "Ready templates for challenger banks, EMIs, payment institutions, FCA-registered cryptoasset firms, wealth managers, brokers and consumer-credit lenders.",
  },
  {
    icon: Users,
    title: "MLRO & SMCR-ready evidence pack",
    desc: "Immutable audit trail, MLRO annual report artifacts and case files formatted for SMCR-accountable individuals and s.166 skilled-person reviews.",
  },
];

const useCases = [
  {
    title: "UK banks & building societies",
    desc: "Meet FCA and PRA financial-crime expectations without a dozen point tools. Consolidate CDD, monitoring, sanctions and SAR filing into one MLR 2017-aligned platform.",
  },
  {
    title: "EMIs & payment institutions",
    desc: "PSD2/PSRs 2017 SCA context, safeguarding-aware monitoring, and the FCA's Dear CEO letter expectations for payments firms — all baked into rule packs.",
  },
  {
    title: "FCA-registered crypto-asset firms",
    desc: "MLR 2017 Part 4A registration evidence, Travel Rule messaging (JMLSG Sector 22), wallet screening and blockchain analytics for cryptoasset businesses.",
  },
  {
    title: "Consumer credit & lenders",
    desc: "KYC, sanctions and adverse-media screening embedded in origination, plus ongoing monitoring aligned to FCA CONC and Consumer Duty expectations.",
  },
  {
    title: "Wealth managers & investment firms",
    desc: "Source of wealth, source of funds and EDD workflows for high-risk clients, plus MiFID II record-keeping and SYSC financial-crime controls.",
  },
  {
    title: "MSBs & TCSPs (HMRC-supervised)",
    desc: "HMRC AML supervision-ready programme with risk assessment, monitoring and record-keeping tuned for money service businesses and trust & company service providers.",
  },
];

const faqs = [
  {
    q: "What is compliance software in the UK?",
    a: "Compliance software is a platform that automates the controls a UK regulated business needs to meet its legal and regulatory obligations. For financial services that primarily means AML/CTF under the Money Laundering Regulations 2017: customer due diligence (CDD), sanctions and PEP screening (OFSI, UN, EU, OFAC), transaction monitoring, case management, SAR/DAML submissions to the NCA UKFIU and MLRO evidence. WorldAML delivers all of these in one auditable platform aligned to JMLSG guidance.",
  },
  {
    q: "Is WorldAML aligned to JMLSG guidance and MLR 2017?",
    a: "Yes. Our modules map directly to MLR 2017 Regulations 18 (risk assessment), 19–21 (policies, controls and procedures), 27–35 (CDD/EDD/SDD, PEPs, correspondent relationships), 40 (record-keeping) and to JMLSG Parts I and II — so FCA and HMRC supervisors see the artifacts they expect in the format they expect.",
  },
  {
    q: "Do you screen against the UK Sanctions List and OFSI regimes?",
    a: "Yes. WorldAML ingests the UK Sanctions List (consolidated), OFSI regime-specific lists (Russia, Belarus, Iran, DPRK, Syria and others), plus UN, EU and OFAC feeds. Ownership and control is analysed to the UK's 50% and 'control' tests, and screening refreshes within minutes of OFSI publication.",
  },
  {
    q: "Can WorldAML submit SARs and DAMLs to the NCA?",
    a: "WorldAML generates structured SAR and DAML packages compatible with the NCA SAR Portal, with narrative templates, glossary code tagging and statutory clock tracking (7 working days for DAML moratorium, 31 calendar days for moratorium extension). Submissions are made through your firm's SAR Portal account.",
  },
  {
    q: "Does WorldAML support FCA s.166 skilled-person reviews?",
    a: "Yes. Rule tuning history, coverage analysis, sample validation, above/below-the-line testing and issue remediation are captured in an evidence pack designed for s.166 skilled-person reviews, MLRO annual reports and FCA supervisory visits.",
  },
  {
    q: "How does WorldAML handle UK PEP screening under FCA FG17/6?",
    a: "UK domestic PEPs are handled proportionately in line with FCA guidance FG17/6 (updated 2024), with configurable EDD triggers, risk-based sign-off workflows and family/close-associate scoping — reducing over-alerting on low-risk domestic PEPs.",
  },
  {
    q: "Are you ready for the Economic Crime & Corporate Transparency Act (ECCTA)?",
    a: "Yes. Beneficial-ownership collection, PSC register cross-checks, identity verification and change monitoring are aligned to the Companies House reforms under ECCTA, including identity verification of directors and PSCs as the regime rolls out.",
  },
  {
    q: "How is WorldAML priced in the UK?",
    a: "UK pricing is usage-based on screened customers and monitored transactions, with tiers for challenger banks, EMIs, cryptoasset firms and lenders. Talk to sales for a tailored GBP quote — most UK customers replace 3–5 point tools with one platform.",
  },
];

const ComplianceSoftwareUK = () => {
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
    name: "WorldAML Compliance Software (UK)",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description:
      "UK compliance software for MLR 2017, OFSI sanctions, KYC/CDD, transaction monitoring and SAR/DAML submissions — built for FCA-authorised banks, EMIs, PIs, cryptoasset firms and lenders.",
    url: "https://worldaml.com/compliance-software/uk",
    audience: {
      "@type": "Audience",
      audienceType: "Financial institutions and fintechs (United Kingdom)",
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "GBP",
      price: "0",
      category: "Enterprise SaaS",
      url: "https://worldaml.com/contact-sales",
    },
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Compliance Software for UK Banks & EMIs"
        description="AML compliance software for UK financial institutions — MLR 2017, OFSI sanctions, KYC/CDD, FCA-ready transaction monitoring and SAR/DAML submissions in one JMLSG-aligned platform."
        canonical="/compliance-software/uk"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Compliance Software", url: "/compliance-software/uk" },
          { name: "United Kingdom", url: "/compliance-software/uk" },
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
                United Kingdom
              </p>
              <h1 className="text-headline text-navy mb-6">
                Compliance software built for UK banks, EMIs and crypto firms
              </h1>
              <p className="text-body-lg text-text-secondary mb-8">
                WorldAML is the AML compliance software UK financial institutions use to meet MLR
                2017, FCA, HMRC, OFSI and JMLSG obligations — from CDD and sanctions screening to
                FCA-ready transaction monitoring and SAR/DAML submissions to the NCA UKFIU, in one
                auditable platform.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button variant="accent" size="lg" asChild>
                  <Link to="/contact-sales">Talk to a UK compliance specialist</Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/free-aml-check">
                    Run a free OFSI sanctions check <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <p className="text-sm text-text-secondary mt-6">
                Trusted by challenger banks, EMIs, payment institutions, FCA-registered cryptoasset
                firms and lenders across the UK.
              </p>
            </div>
          </div>
        </section>

        {/* Regulators */}
        <section className="section-padding bg-background">
          <div className="container-enterprise">
            <h2 className="text-2xl text-navy mb-2">Aligned to the UK regulatory stack</h2>
            <p className="text-text-secondary mb-8 max-w-2xl">
              One compliance platform covering every UK regulator, supervisor and industry body a
              regulated financial institution needs to evidence a programme against.
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
            <h2 className="text-2xl text-navy mb-2">Everything a UK MLR 2017 programme needs</h2>
            <p className="text-text-secondary mb-8 max-w-2xl">
              Replace 3–5 point tools with one platform. Purpose-built modules for every regulation
              in a UK financial-crime programme.
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
            <h2 className="text-2xl text-navy mb-8">
              Regulatory compliance software for every UK firm type
            </h2>
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
              Why UK compliance teams pick WorldAML
            </h2>
            <ul className="space-y-4">
              {[
                "One platform for MLR 2017, OFSI, CDD, EDD, monitoring, SAR/DAML — no bolt-ons.",
                "1,900+ global watchlists including the full UK Sanctions List and OFSI regime lists with 50%/control analysis.",
                "MLRO evidence pack built for FCA supervisors, HMRC AML supervision and s.166 skilled-person reviews.",
                "UK/EEA data residency options and SOC 2 Type II controls.",
                "Deploy a working programme in weeks, not the 6–12 months legacy vendors quote.",
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
            <h2 className="text-2xl text-navy mb-8">UK compliance software — FAQ</h2>
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
            <h2 className="text-3xl text-white mb-4">Ready for your next FCA or HMRC review?</h2>
            <p className="text-white/80 mb-8 max-w-2xl mx-auto">
              Get a tailored walkthrough of WorldAML for your UK firm type, product mix and primary
              supervisor.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Button variant="accent" size="lg" asChild>
                <Link to="/contact-sales">Request a demo</Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                asChild
                className="bg-transparent text-white border-white/40 hover:bg-white/10 hover:text-white"
              >
                <Link to="/free-aml-check">Try a free OFSI check</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ComplianceSoftwareUK;
