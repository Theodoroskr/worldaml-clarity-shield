import { Link } from "react-router-dom";
import { ArrowRight, Zap, Code2, TrendingUp, Shield, Users, FileCheck } from "lucide-react";
import SEO from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "AML Compliance for Fintechs | WorldAML",
  description: "Scalable AML compliance for fintech companies. API-first KYC/KYB onboarding, sanctions screening, and risk decisioning that grows with your product.",
  url: "https://www.worldaml.com/industries/fintech",
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://www.worldaml.com/" },
      { "@type": "ListItem", position: 2, name: "Industries", item: "https://www.worldaml.com/industries" },
      { "@type": "ListItem", position: 3, name: "Fintechs", item: "https://www.worldaml.com/industries/fintech" },
    ],
  },
  mainEntity: {
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What AML requirements apply to fintech companies?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Fintechs with an EMI, PSP, or lending licence are subject to the same AML/CFT obligations as traditional banks: Customer Due Diligence, sanctions screening, PEP checks, transaction monitoring, and SAR filing. Obligations are set by FATF Recommendations, EU AMLD, and local regulators like the FCA, BaFin, or CBI.",
        },
      },
      {
        "@type": "Question",
        name: "How does WorldAML support API-first fintech integration?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "WorldAML is built API-first. Every compliance function — KYC onboarding, sanctions screening, risk scoring, audit logging — is accessible as a RESTful API call with JSON responses. You can embed compliance directly into your product flow, onboarding funnel, or back-office system without switching to a separate UI.",
        },
      },
      {
        "@type": "Question",
        name: "Can WorldAML scale with a growing fintech?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. WorldAML is designed for volume. Pricing is usage-based, the API handles high-throughput batch and real-time requests, and the platform modules can be activated individually as your compliance programme matures — starting with KYC and adding risk scoring, transaction monitoring, and reporting as needed.",
        },
      },
    ],
  },
};

const features = [
  { icon: Code2, title: "API-First Architecture", description: "Every compliance function exposed as a clean RESTful API. Embed KYC, screening, and risk scoring directly into your product flow." },
  { icon: Zap, title: "Fast Onboarding Integration", description: "Go live in days, not months. Pre-built SDKs, comprehensive documentation, and sandbox environment for rapid development." },
  { icon: TrendingUp, title: "Usage-Based Pricing", description: "Pay for what you use. No minimum commitments. Pricing scales with your customer volume — ideal for growth-stage fintechs." },
  { icon: Users, title: "KYC & KYB Onboarding", description: "Verify individuals and businesses at onboarding. Identity verification, sanctions screening, UBO mapping, and EDD workflows." },
  { icon: Shield, title: "Sanctions & PEP Screening", description: "Real-time screening against 500+ global lists via WorldCompliance® and Bridger Insight XG®. Covers sanctions, PEPs, adverse media, and RCAs." },
  { icon: FileCheck, title: "Regulatory Reporting", description: "Automated CRS, FATCA, and local regulatory reports. Reduces compliance team overhead as you scale into new jurisdictions." },
];

const IndustryFintech = () => (
  <div className="min-h-screen flex flex-col">
    <SEO
      title="AML Compliance for Fintechs | API-First KYC & Screening | WorldAML"
      description="API-first AML compliance for fintechs. Embed KYC/KYB onboarding, sanctions screening, and risk decisioning into your product. Usage-based pricing."
      canonical="/industries/fintech"
      breadcrumbs={[
        { name: "Home", url: "/" },
        { name: "Industries", url: "/industries" },
        { name: "Fintechs", url: "/industries/fintech" },
      ]}
      structuredData={structuredData}
    />
    <Header />
    <main className="flex-1">
      {/* Hero */}
      <section className="section-padding bg-navy">
        <div className="container-enterprise">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal/10 border border-teal/20 mb-6">
              <span className="text-caption font-semibold text-teal uppercase tracking-wider">Fintechs</span>
            </div>
            <h1 className="text-display text-primary-foreground mb-6">
              AML Compliance Built for Fintech Scale
            </h1>
            <p className="text-body-lg text-slate-light mb-8">
              API-first compliance infrastructure that embeds directly into your product. KYC/KYB onboarding, real-time sanctions screening, and risk decisioning — without slowing down your user experience.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" variant="accent" asChild>
                <Link to="/get-started">Get Started <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button size="lg" variant="outline" className="border-slate/30 text-primary-foreground hover:bg-white/10" asChild>
                <Link to="/platform/api">View API Docs</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Why API-first matters */}
      <section className="section-padding bg-background">
        <div className="container-enterprise">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-headline text-navy mb-6">Compliance that doesn't interrupt your UX</h2>
              <p className="text-body text-text-secondary mb-6">
                Legacy compliance tools are built for compliance teams, not engineering teams. WorldAML is designed code-first — every function is a clean API call, responses are structured JSON, and the latency is low enough to run inline in your onboarding flow.
              </p>
              <ul className="space-y-4">
                {["KYC check inline at signup — average response under 500ms", "Batch screening for existing customer books via bulk API", "Webhook-based alerts for ongoing monitoring hits", "Full audit trail returned in every API response"].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <ArrowRight className="w-4 h-4 text-teal mt-1 shrink-0" />
                    <span className="text-body text-text-secondary">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-4">
              <div className="p-6 rounded-xl border border-divider bg-secondary/30">
                <p className="text-caption font-mono text-teal mb-2">POST /v1/screen/individual</p>
                <p className="text-body-sm text-text-secondary">Screen an individual against sanctions, PEP, and adverse media lists. Returns structured match results with confidence scores and source data.</p>
              </div>
              <div className="p-6 rounded-xl border border-divider bg-secondary/30">
                <p className="text-caption font-mono text-teal mb-2">POST /v1/kyc/onboard</p>
                <p className="text-body-sm text-text-secondary">Initiate KYC onboarding for an individual. Identity verification, document checks, liveness, and sanctions screening in a single call.</p>
              </div>
              <div className="p-6 rounded-xl border border-divider bg-secondary/30">
                <p className="text-caption font-mono text-teal mb-2">GET /v1/risk/score/:customerId</p>
                <p className="text-body-sm text-text-secondary">Retrieve current risk score and tier for a customer. Triggers EDD workflow automatically for high-risk results.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section-padding bg-secondary/30">
        <div className="container-enterprise">
          <h2 className="text-headline text-navy mb-12">Everything fintechs need to stay compliant</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f) => (
              <div key={f.title} className="p-6 rounded-xl border border-divider bg-card">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-navy/5 text-navy mb-4">
                  <f.icon className="w-5 h-5" />
                </div>
                <h3 className="text-title text-navy mb-2">{f.title}</h3>
                <p className="text-body-sm text-text-secondary">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-padding bg-background">
        <div className="container-enterprise max-w-3xl">
          <h2 className="text-headline text-navy mb-10">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {structuredData.mainEntity.mainEntity.map((faq) => (
              <div key={faq.name} className="p-6 rounded-xl border border-divider">
                <h3 className="text-title text-navy mb-3">{faq.name}</h3>
                <p className="text-body text-text-secondary">{faq.acceptedAnswer.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-navy">
        <div className="container-enterprise max-w-3xl text-center">
          <h2 className="text-headline text-primary-foreground mb-4">Start integrating compliance today</h2>
          <p className="text-body-lg text-slate-light mb-8">Sandbox access, API keys, and full documentation available immediately on sign-up.</p>
          <Button size="lg" variant="accent" asChild>
            <Link to="/get-started">Get API Access <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </section>
    </main>
    <Footer />
  </div>
);

export default IndustryFintech;
