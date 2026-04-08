import { Link } from "react-router-dom";
import {
  ArrowRight,
  Shield,
  Globe,
  Zap,
  Database,
  Lock,
  BarChart3,
  HeadphonesIcon,
  Layers,
  CheckCircle2,
} from "lucide-react";
import SEO from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

const advantages = [
  {
    icon: Database,
    title: "Trusted Data Sources",
    description:
      "Access screening data from LexisNexis Risk Solutions — including WorldCompliance® and Bridger Insight XG® — through a single platform. These are the same data sources trusted by the world's largest banks and financial institutions for sanctions, PEP, and adverse media screening.",
  },
  {
    icon: Globe,
    title: "Multi-Jurisdictional Coverage",
    description:
      "Screen against sanctions, PEP, and adverse media sources across 240+ countries and territories with regulator-aligned workflows. Whether your obligations fall under EU AMLD, UK MLR, FinCEN BSA, or MAS requirements, WorldAML maps to your regulatory framework.",
  },
  {
    icon: Zap,
    title: "Rapid Integration",
    description:
      "Go live in days, not months. Our RESTful APIs, SDKs, and pre-built connectors let you embed screening into existing systems with minimal engineering effort. Most customers complete integration within one sprint cycle.",
  },
  {
    icon: Layers,
    title: "Unified Platform",
    description:
      "One interface for KYC/KYB onboarding, AML screening, transaction monitoring, risk assessment, and regulatory reporting — no more tool sprawl. Consolidate your compliance technology stack and reduce vendor management overhead.",
  },
  {
    icon: Lock,
    title: "Bank-Grade Security",
    description:
      "ISO 27001, ISO 22301, and ISO 9001 certified. Data encrypted at rest and in transit with full audit trails for every action. Our security posture is independently audited annually, meeting the standards required by the most demanding financial institutions.",
  },
  {
    icon: BarChart3,
    title: "Configurable Risk Scoring",
    description:
      "Define custom risk matrices, thresholds, and escalation rules that map to your risk appetite — not a one-size-fits-all model. Adjust scoring parameters by jurisdiction, customer type, product, or transaction pattern to align with your risk-based approach.",
  },
  {
    icon: Shield,
    title: "Regulatory Alignment",
    description:
      "Purpose-built for EU AMLD, UK MLR, FinCEN, and MAS requirements. Stay compliant as regulations evolve without re-building workflows. Our compliance team monitors regulatory changes and updates the platform proactively.",
  },
  {
    icon: HeadphonesIcon,
    title: "Dedicated Regional Support",
    description:
      "Backed by Infocredit Group's on-the-ground teams across Europe, the Middle East, UK & Ireland, and North America for onboarding and ongoing support. Get help from specialists who understand your local regulatory environment.",
  },
];

const comparisons = [
  {
    feature: "Data sourced from LexisNexis Risk Solutions",
    worldaml: true,
    others: "Varies",
  },
  {
    feature: "Unified KYC + AML + TM platform",
    worldaml: true,
    others: "Rarely",
  },
  {
    feature: "ISO 27001 / 22301 / 9001 certified",
    worldaml: true,
    others: "Sometimes",
  },
  {
    feature: "Multi-jurisdictional workflows",
    worldaml: true,
    others: "Limited",
  },
  {
    feature: "RESTful API with full documentation",
    worldaml: true,
    others: "Varies",
  },
  {
    feature: "Dedicated regional onboarding",
    worldaml: true,
    others: "Rarely",
  },
  {
    feature: "Configurable risk scoring engine",
    worldaml: true,
    others: "Sometimes",
  },
  {
    feature: "Full audit trail & governance logs",
    worldaml: true,
    others: "Sometimes",
  },
];

const painPoints = [
  {
    problem: "Fragmented compliance tools",
    solution: "WorldAML consolidates screening, onboarding, monitoring, and reporting into a single platform with unified audit trails.",
  },
  {
    problem: "Slow integration timelines",
    solution: "Our API-first architecture and comprehensive SDKs enable production integration in days, not months.",
  },
  {
    problem: "Opaque risk scoring",
    solution: "Every screening result includes detailed match breakdown, confidence scores, and configurable thresholds you can audit and explain to regulators.",
  },
  {
    problem: "Limited jurisdictional coverage",
    solution: "Screen against 1,900+ sanctions lists, global PEP databases, and curated adverse media sources covering 240+ countries and territories.",
  },
  {
    problem: "Generic vendor support",
    solution: "Regional teams with deep regulatory expertise provide localised onboarding, training, and ongoing support in your timezone and language.",
  },
  {
    problem: "Rigid compliance workflows",
    solution: "Customisable workflows, risk matrices, escalation rules, and alert configurations adapt to your organisation's specific risk appetite and regulatory requirements.",
  },
];

const WhyWorldAML = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Why WorldAML — Competitive Advantages"
        description="Discover why regulated institutions choose WorldAML for financial crime screening: trusted LexisNexis data sources, multi-jurisdictional coverage, bank-grade security, rapid API integration, and dedicated regional support."
        canonical="/about-us/why-worldaml"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "About", url: "/about" },
          { name: "Why WorldAML", url: "/about-us/why-worldaml" },
        ]}
      />
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="section-padding bg-background">
          <div className="container-enterprise">
            <div className="max-w-3xl">
              <p className="text-body-sm font-semibold text-teal uppercase tracking-wider mb-3">
                Why WorldAML
              </p>
              <h1 className="text-navy mb-6">
                The compliance platform built for institutions that can't afford to get it wrong
              </h1>
              <p className="text-body-lg text-text-secondary mb-4">
                WorldAML combines trusted screening data from LexisNexis Risk Solutions with a
                modern, unified platform — giving compliance teams the coverage, speed, and
                auditability they need across every jurisdiction they operate in.
              </p>
              <p className="text-body text-text-secondary">
                Choosing the right compliance platform is one of the most consequential technology 
                decisions a regulated organisation makes. The wrong choice means fragmented data, 
                audit gaps, and regulatory risk. WorldAML is designed to eliminate those risks 
                by combining institutional-grade data with a platform built for modern compliance 
                operations.
              </p>
            </div>
          </div>
        </section>

        {/* Pain Points */}
        <section className="section-padding bg-surface-subtle">
          <div className="container-enterprise">
            <div className="text-center mb-12">
              <h2 className="text-2xl text-navy mb-4">Common Challenges We Solve</h2>
              <p className="text-body text-text-secondary max-w-2xl mx-auto">
                Compliance teams across banking, fintech, payments, and gaming face the same 
                operational challenges. WorldAML addresses each one directly.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {painPoints.map((item) => (
                <div key={item.problem} className="p-6 rounded-lg border border-divider bg-card">
                  <p className="text-body font-semibold text-navy mb-2">❌ {item.problem}</p>
                  <p className="text-body-sm text-text-secondary">✅ {item.solution}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Competitive Advantages Grid */}
        <section className="section-padding bg-background">
          <div className="container-enterprise">
            <div className="text-center mb-12">
              <h2 className="text-2xl text-navy mb-4">What Sets Us Apart</h2>
              <p className="text-body text-text-secondary max-w-2xl mx-auto">
                Eight reasons regulated institutions choose WorldAML over alternative 
                compliance platforms, point solutions, and in-house screening tools.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {advantages.map((item) => (
                <div
                  key={item.title}
                  className="p-6 rounded-lg border border-divider bg-card hover:shadow-md transition-shadow"
                >
                  <div className="inline-flex items-center justify-center w-11 h-11 rounded-lg bg-teal/10 text-teal mb-4">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-body font-semibold text-navy mb-2">
                    {item.title}
                  </h3>
                  <p className="text-body-sm text-text-secondary">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="section-padding bg-surface-subtle">
          <div className="container-enterprise">
            <div className="text-center mb-12">
              <h2 className="text-2xl text-navy mb-4">How We Compare</h2>
              <p className="text-body text-text-secondary max-w-2xl mx-auto">
                A transparent comparison of WorldAML capabilities versus typical market 
                alternatives. We believe in letting the platform speak for itself.
              </p>
            </div>

            <div className="max-w-3xl mx-auto overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-divider">
                    <th className="py-3 pr-4 text-body-sm font-semibold text-navy">
                      Capability
                    </th>
                    <th className="py-3 px-4 text-body-sm font-semibold text-navy text-center">
                      WorldAML
                    </th>
                    <th className="py-3 pl-4 text-body-sm font-semibold text-text-secondary text-center">
                      Typical Alternatives
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparisons.map((row) => (
                    <tr
                      key={row.feature}
                      className="border-b border-divider/50"
                    >
                      <td className="py-3 pr-4 text-body-sm text-text-secondary">
                        {row.feature}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-teal/10 text-teal text-xs font-bold">
                          ✓
                        </span>
                      </td>
                      <td className="py-3 pl-4 text-body-sm text-text-tertiary text-center">
                        {row.others}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Who It's For */}
        <section className="section-padding bg-background">
          <div className="container-enterprise">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl text-navy mb-4 text-center">Who WorldAML Is For</h2>
              <p className="text-body text-text-secondary text-center mb-8">
                WorldAML serves regulated organisations of all sizes across the financial 
                services spectrum. Our platform scales from early-stage fintechs processing 
                their first KYC checks to established banks managing millions of screenings annually.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  "Banks and electronic money institutions (EMIs)",
                  "Payment service providers and acquirers",
                  "Fintech companies and neobanks",
                  "Crypto and digital asset businesses (VASPs)",
                  "Gaming and gambling operators",
                  "Legal and fiduciary service providers",
                  "Insurance companies and intermediaries",
                  "Compliance consultancies and RegTech firms",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 p-3 rounded-lg bg-surface-subtle">
                    <CheckCircle2 className="w-4 h-4 text-teal flex-shrink-0" />
                    <span className="text-body-sm text-text-secondary">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="section-padding bg-surface-subtle">
          <div className="container-enterprise">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl text-navy mb-4">
                Ready to see the difference?
              </h2>
              <p className="text-body text-text-secondary mb-8">
                Talk to our team about how WorldAML can strengthen your compliance programme. 
                We offer personalised demos, proof-of-concept environments, and migration 
                support for organisations switching from other providers.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild>
                  <Link to="/contact-sales">
                    Contact Sales
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/demo">Request a Demo</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default WhyWorldAML;