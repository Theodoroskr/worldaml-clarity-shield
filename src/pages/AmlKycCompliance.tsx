import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  ScanSearch,
  FileCheck,
  Shield,
  Globe,
  Building2,
  Activity,
  Scale,
  FileText,
} from "lucide-react";
import SEO from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RelatedGuidesSection, { GUIDE_LINKS } from "@/components/RelatedGuidesSection";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Landing page targeting "aml kyc compliance" and the surrounding cluster
 * (aml compliance / kyc compliance / aml kyc requirements).
 *
 * Intent cluster covered on this page:
 *  - aml kyc compliance (programme-level)
 *  - CDD / EDD / sanctions & PEP screening / ongoing monitoring
 *  - FATF-aligned AML KYC requirements by industry
 *  - AML KYC compliance software
 */

const pillars = [
  {
    icon: FileCheck,
    title: "KYC & customer due diligence",
    desc: "Document verification, biometric face match, liveness detection and proof-of-address checks evidence CDD at onboarding — with SDD/EDD tiers applied by risk.",
  },
  {
    icon: ScanSearch,
    title: "Sanctions, PEP & adverse media screening",
    desc: "Screen customers and counterparties against 1,900+ global lists — UN, EU, OFAC, UK HMT and local regimes — plus PEPs, RCAs and adverse media in 40+ languages.",
  },
  {
    icon: Activity,
    title: "Ongoing monitoring",
    desc: "List changes re-screen your customer base automatically, and transaction monitoring flags unusual activity with configurable rules and thresholds.",
  },
  {
    icon: Building2,
    title: "KYB & beneficial ownership",
    desc: "Registry lookups, UBO discovery to the 25% threshold (configurable) and director-level KYC bring corporate customers into the same compliance file.",
  },
  {
    icon: Scale,
    title: "Risk scoring & assessment",
    desc: "Composite 0–100 risk scores across geography, product, channel, customer type and behaviour — the backbone of a defensible risk-based approach.",
  },
  {
    icon: FileText,
    title: "Case management & reporting",
    desc: "Alerts become cases with evidence, decisions and rationale; SAR/STR-ready packages and regulatory exports keep your reporting obligations covered.",
  },
  {
    icon: Shield,
    title: "Audit trail & MLRO evidence",
    desc: "Every check, decision and rule change is immutably logged — the evidence pack supervisors and independent testers ask for first.",
  },
  {
    icon: Globe,
    title: "Global regulatory coverage",
    desc: "Programme templates aligned to FATF Recommendations, EU AMLD/AMLA, UK MLR 2017, US BSA and 40+ national regimes.",
  },
];

const steps = [
  {
    title: "Onboard & verify",
    desc: "KYC verification confirms identity, KYB maps ownership, and a risk score is assigned from your risk assessment model.",
  },
  {
    title: "Screen & risk-rate",
    desc: "Sanctions, PEP and adverse-media screening runs at onboarding, with risk-based EDD triggers for higher-risk customers.",
  },
  {
    title: "Monitor & report",
    desc: "Ongoing screening and transaction monitoring surface changes; alerts become cases, and cases become regulatory reports.",
  },
];

const useCases = [
  {
    title: "Banks & credit unions",
    desc: "A full AML KYC compliance programme — CDD, screening, monitoring and reporting — aligned to your prudential and conduct supervisors.",
  },
  {
    title: "Fintechs & payment institutions",
    desc: "Compliance that scales with growth: API-first onboarding, sponsor-bank reporting packs and monitoring tuned for payments risk.",
  },
  {
    title: "Crypto & VASPs",
    desc: "Travel Rule-ready KYC, wallet screening and sanctions controls that satisfy licensing and registration requirements.",
  },
  {
    title: "Investment & wealth firms",
    desc: "Source of wealth and source of funds workflows, EDD for high-risk clients and record-keeping built for securities regulators.",
  },
  {
    title: "Real estate & TCSPs",
    desc: "Buyer/seller due diligence, UBO verification for corporate purchasers and reporting aligned to non-financial-sector AML rules.",
  },
  {
    title: "iGaming & gambling operators",
    desc: "Player KYC, PEP screening and monitoring rules tuned to licence conditions from the MGA, UKGC and other regulators.",
  },
];

const faqs = [
  {
    q: "What is AML KYC compliance?",
    a: "AML KYC compliance is the set of controls a regulated business operates to meet anti-money-laundering obligations: Know Your Customer identity verification and due diligence (KYC/CDD), sanctions and PEP screening, a documented risk assessment, ongoing monitoring of customers and transactions, suspicious-activity reporting and record-keeping. Frameworks include FATF Recommendations, EU AMLD, UK MLR 2017 and the US BSA.",
  },
  {
    q: "What does an AML KYC compliance programme need to include?",
    a: "At minimum: a written risk assessment; customer due diligence with identity verification; screening against sanctions, PEP and adverse-media lists; enhanced due diligence for higher-risk customers; ongoing monitoring of relationships and transactions; suspicious activity reporting; training; and records retained for the statutory period. WorldAML covers each of these in one platform.",
  },
  {
    q: "Is WorldAML aligned to FATF Recommendations?",
    a: "Yes. Workflows evidence FATF Recommendation 10 (customer due diligence), Recommendation 12 (PEPs), Recommendation 6/7 (targeted financial sanctions) and Recommendation 20 (suspicious transaction reporting), plus the record-keeping and risk-based-approach requirements that national regimes derive from them.",
  },
  {
    q: "Can one platform handle KYC, KYB, screening and monitoring?",
    a: "Yes — that is the point of WorldAML. Identity verification, business verification with UBO discovery, sanctions/PEP/adverse-media screening, ongoing monitoring, case management and regulatory reporting all live in one platform with one audit trail, replacing 3–5 point tools.",
  },
  {
    q: "How does ongoing monitoring work?",
    a: "Monitored customers are re-screened automatically when sanctions, PEP and adverse-media lists change, and transaction monitoring applies configurable rules to activity. Material changes raise alerts with the delta highlighted, so your team reviews what changed rather than re-reading whole files.",
  },
  {
    q: "Which regulations and jurisdictions are covered?",
    a: "Programme templates cover EU AMLD (including AMLD6 and the AMLA transition), UK MLR 2017 and JMLSG guidance, US BSA/FinCEN requirements, and 40+ other national regimes. Screening coverage spans 1,900+ global lists including UN, EU, OFAC and UK HMT.",
  },
  {
    q: "How quickly can we implement AML KYC compliance?",
    a: "Self-serve plans go live in days with hosted KYC flows and default screening configurations. Enterprise rollouts with custom risk models, data migration and API integration typically complete in weeks — not the 6–12 months legacy vendors quote.",
  },
  {
    q: "How is WorldAML priced for AML KYC compliance?",
    a: "Pricing is based on verified customers and screening/monitoring volumes, with self-serve plans published on the pricing page and tailored quotes for enterprise volumes. Screening is bundled — no per-list surcharges.",
  },
];

const AmlKycCompliance = () => {
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
    name: "WorldAML AML KYC Compliance Platform",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description:
      "AML KYC compliance platform uniting identity verification, sanctions and PEP screening, ongoing monitoring, case management and regulatory reporting in one auditable system.",
    url: "https://worldaml.com/aml-kyc-compliance",
    audience: {
      "@type": "Audience",
      audienceType: "Regulated businesses and financial institutions",
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "EUR",
      price: "0",
      category: "Enterprise SaaS",
      url: "https://worldaml.com/pricing",
    },
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="AML KYC Compliance — One Platform for the Whole Programme"
        description="AML KYC compliance software uniting identity verification, sanctions & PEP screening, ongoing monitoring, case management and regulatory reporting — FATF-aligned and audit-ready."
        canonical="/aml-kyc-compliance"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "AML KYC Compliance", url: "/aml-kyc-compliance" },
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
                The WorldAML Platform
              </p>
              <h1 className="text-headline text-navy mb-6">
                AML KYC compliance, end to end in one platform
              </h1>
              <p className="text-body-lg text-text-secondary mb-8">
                WorldAML unites KYC verification, KYB and beneficial ownership, sanctions and PEP
                screening, ongoing monitoring, case management and regulatory reporting — a
                FATF-aligned AML KYC compliance programme with one audit trail instead of five
                vendors.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button variant="accent" size="lg" asChild>
                  <Link to="/contact-sales">Talk to a compliance specialist</Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/?demo=1">
                    Run a free sanctions check <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <p className="text-sm text-text-secondary mt-6">
                FATF-aligned · 1,900+ global lists · Audit-ready evidence for every decision.
              </p>
            </div>
          </div>
        </section>

        {/* Lifecycle */}
        <section className="section-padding bg-background">
          <div className="container-enterprise">
            <h2 className="text-2xl text-navy mb-2">The compliance lifecycle, covered</h2>
            <p className="text-text-secondary mb-8 max-w-2xl">
              From first onboarding to regulatory reporting — every stage of an AML KYC programme in
              one flow.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              {steps.map((s, i) => (
                <Card key={s.title} className="border-divider">
                  <CardHeader className="pb-3">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-accent/10 text-accent mb-3 font-semibold">
                      {i + 1}
                    </div>
                    <CardTitle className="text-lg text-navy">{s.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{s.desc}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Pillars */}
        <section className="section-padding bg-surface-subtle">
          <div className="container-enterprise">
            <h2 className="text-2xl text-navy mb-2">Every pillar of AML KYC compliance</h2>
            <p className="text-text-secondary mb-8 max-w-2xl">
              Replace point tools with modules that share one data model, one risk score and one
              audit trail.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {pillars.map((f) => (
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
            <h2 className="text-2xl text-navy mb-8">AML KYC compliance for your sector</h2>
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
            <h2 className="text-2xl text-navy mb-6">Why compliance teams pick WorldAML</h2>
            <ul className="space-y-4">
              {[
                "One platform for KYC, KYB, screening, monitoring and reporting — no bolt-ons or swivel-chair work.",
                "1,900+ global watchlists with ownership-and-control analysis and automatic re-screening on list changes.",
                "Composite risk scoring and configurable EDD triggers that make your risk-based approach defensible.",
                "Immutable audit trail and MLRO evidence packs built for supervisors and independent testing.",
                "Live in days on self-serve plans, weeks for enterprise — not the 6–12 months legacy vendors quote.",
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
            <h2 className="text-2xl text-navy mb-8">AML KYC compliance — FAQ</h2>
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
            <h2 className="text-3xl text-white mb-4">Build a programme your regulator respects</h2>
            <p className="text-white/80 mb-8 max-w-2xl mx-auto">
              Get a tailored walkthrough of WorldAML for your sector, jurisdictions and supervisory
              expectations.
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
                <Link to="/pricing">View pricing</Link>
              </Button>
            </div>
          </div>
        </section>
        <RelatedGuidesSection
          currentPath="/aml-kyc-compliance"
          intro="Related AML, KYC and screening resources."
          links={[
            GUIDE_LINKS.kycVerification,
            GUIDE_LINKS.identityVerificationService,
            GUIDE_LINKS.amlChecklist,
            GUIDE_LINKS.whatIsSanctions,
            GUIDE_LINKS.sanctionsLists,
            GUIDE_LINKS.sanctionsSoftware,
            GUIDE_LINKS.usGuide,
            GUIDE_LINKS.compareProviders,
            GUIDE_LINKS.platformScreening,
          ]}
        />
      </main>
      <Footer />
    </div>
  );
};

export default AmlKycCompliance;
