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
      "Access screening data from LexisNexis Risk Solutions — including WorldCompliance® and Bridger Insight XG® — through a single platform.",
  },
  {
    icon: Globe,
    title: "Multi-Jurisdictional Coverage",
    description:
      "Screen against sanctions, PEP, and adverse media sources across 240+ countries and territories with regulator-aligned workflows.",
  },
  {
    icon: Zap,
    title: "Rapid Integration",
    description:
      "Go live in days, not months. Our RESTful APIs, SDKs, and pre-built connectors let you embed screening into existing systems with minimal engineering effort.",
  },
  {
    icon: Layers,
    title: "Unified Platform",
    description:
      "One interface for KYC/KYB onboarding, AML screening, transaction monitoring, risk assessment, and regulatory reporting — no more tool sprawl.",
  },
  {
    icon: Lock,
    title: "Bank-Grade Security",
    description:
      "ISO 27001, ISO 22301, and ISO 9001 certified. Data encrypted at rest and in transit with full audit trails for every action.",
  },
  {
    icon: BarChart3,
    title: "Configurable Risk Scoring",
    description:
      "Define custom risk matrices, thresholds, and escalation rules that map to your risk appetite — not a one-size-fits-all model.",
  },
  {
    icon: Shield,
    title: "Regulatory Alignment",
    description:
      "Purpose-built for EU AMLD, UK MLR, FinCEN, and MAS requirements. Stay compliant as regulations evolve without re-building workflows.",
  },
  {
    icon: HeadphonesIcon,
    title: "Dedicated Regional Support",
    description:
      "Backed by Infocredit Group's on-the-ground teams across Europe, the Middle East, UK & Ireland, and North America for onboarding and ongoing support.",
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

const WhyWorldAML = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Why WorldAML — Competitive Advantages"
        description="Discover why regulated institutions choose WorldAML for financial crime screening: trusted data sources, multi-jurisdictional coverage, bank-grade security, and rapid integration."
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
              <p className="text-body-lg text-text-secondary">
                WorldAML combines trusted screening data from LexisNexis Risk Solutions with a
                modern, unified platform — giving compliance teams the coverage, speed, and
                auditability they need across every jurisdiction they operate in.
              </p>
            </div>
          </div>
        </section>

        {/* Competitive Advantages Grid */}
        <section className="section-padding bg-surface-subtle">
          <div className="container-enterprise">
            <div className="text-center mb-12">
              <h2 className="text-2xl text-navy mb-4">What Sets Us Apart</h2>
              <p className="text-body text-text-secondary max-w-2xl mx-auto">
                Eight reasons regulated institutions choose WorldAML over alternatives.
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
        <section className="section-padding bg-background">
          <div className="container-enterprise">
            <div className="text-center mb-12">
              <h2 className="text-2xl text-navy mb-4">How We Compare</h2>
              <p className="text-body text-text-secondary max-w-2xl mx-auto">
                A clear view of WorldAML capabilities versus typical market alternatives.
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

        {/* CTA */}
        <section className="section-padding bg-surface-subtle">
          <div className="container-enterprise">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl text-navy mb-4">
                Ready to see the difference?
              </h2>
              <p className="text-body text-text-secondary mb-8">
                Talk to our team about how WorldAML can strengthen your compliance programme.
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
