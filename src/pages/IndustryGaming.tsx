import { Link } from "react-router-dom";
import { ArrowRight, Gamepad2, Shield, Users, DollarSign, AlertTriangle, FileCheck } from "lucide-react";
import SEO from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "AML Compliance for Gaming & Gambling Operators | WorldAML",
  description: "AML and KYC compliance for licensed gaming and gambling operators. Player KYC verification, source of funds checks, ongoing monitoring, and SAR workflows. MGA, UKGC, and GRA aligned.",
  url: "https://www.worldaml.com/industries/gaming",
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://www.worldaml.com/" },
      { "@type": "ListItem", position: 2, name: "Industries", item: "https://www.worldaml.com/industries" },
      { "@type": "ListItem", position: 3, name: "Gaming & Gambling", item: "https://www.worldaml.com/industries/gaming" },
    ],
  },
  mainEntity: {
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What AML obligations apply to gaming and gambling operators?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Licensed gaming and gambling operators are classified as Designated Non-Financial Businesses and Professions (DNFBPs) under FATF recommendations. Obligations include: player KYC/CDD above defined thresholds, ongoing monitoring of player activity, Source of Funds (SoF) and Source of Wealth (SoW) checks for high-value players, PEP screening, and SAR filing. Specific rules vary by licensing jurisdiction — UKGC, MGA, GRA, and others have detailed AML programme requirements.",
        },
      },
      {
        "@type": "Question",
        name: "When must a gaming operator conduct KYC on a player?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Under FATF and most gaming regulators, CDD must be conducted before a player exceeds EUR 2,000 in aggregate transactions, or immediately for players who appear high-risk. The UKGC requires KYC before a player can withdraw, and ongoing monitoring triggers re-verification when activity patterns change. WorldAML supports configurable threshold-based KYC triggering.",
        },
      },
      {
        "@type": "Question",
        name: "How does WorldAML support iGaming AML compliance?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "WorldAML provides player KYC onboarding via API, sanctions and PEP screening for new and existing players, Source of Funds documentation workflow, ongoing transaction monitoring with iGaming-specific typologies (unusual win patterns, rapid deposit-withdrawal, multi-account indicators), and SAR preparation workflows with audit trail.",
        },
      },
    ],
  },
};

const features = [
  { icon: Users, title: "Player KYC Onboarding", description: "Automated player verification at registration or CDD thresholds. Identity checks, sanctions screening, and PEP flags via API." },
  { icon: DollarSign, title: "Source of Funds Checks", description: "Structured SoF and Source of Wealth documentation workflows for high-value players, triggered by deposit thresholds or risk scores." },
  { icon: Shield, title: "PEP & Sanctions Screening", description: "Screen all players against global PEP databases and sanctions lists. Catch politically exposed players before they become regulatory incidents." },
  { icon: AlertTriangle, title: "Transaction Monitoring", description: "iGaming-specific typologies: rapid deposit-withdrawal cycles, multi-account patterns, unusual win/loss ratios, and structuring indicators." },
  { icon: Gamepad2, title: "Ongoing Player Monitoring", description: "Continuous monitoring of player activity between sessions. Automated alerts when behaviour changes warrant re-verification." },
  { icon: FileCheck, title: "SAR Workflow & Audit Trail", description: "Structured SAR preparation workflows and immutable audit trail. Demonstrate compliance to UKGC, MGA, and GRA inspectors." },
];

const IndustryGaming = () => (
  <div className="min-h-screen flex flex-col">
    <SEO
      title="AML Compliance for Gaming & iGaming Operators | Player KYC | WorldAML"
      description="AML and KYC compliance for gaming and gambling operators. Player KYC, source of funds checks, PEP screening, and transaction monitoring."
      canonical="/industries/gaming"
      breadcrumbs={[
        { name: "Home", url: "/" },
        { name: "Industries", url: "/industries" },
        { name: "Gaming & Gambling", url: "/industries/gaming" },
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
              <span className="text-caption font-semibold text-teal uppercase tracking-wider">Gaming & Gambling</span>
            </div>
            <h1 className="text-display text-primary-foreground mb-6">
              AML Compliance for Gaming & iGaming Operators
            </h1>
            <p className="text-body-lg text-slate-light mb-8">
              Player KYC onboarding, Source of Funds checks, and ongoing transaction monitoring for licensed gaming and gambling operators. API-first or platform UI — aligned to UKGC, MGA, and GRA requirements.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" variant="accent" asChild>
                <Link to="/get-started">Get Started <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button size="lg" variant="outline" className="border-slate/30 text-primary-foreground hover:bg-white/10" asChild>
                <Link to="/demo">Request Demo</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Regulatory obligations */}
      <section className="section-padding bg-background">
        <div className="container-enterprise">
          <div className="max-w-2xl mb-12">
            <h2 className="text-headline text-navy mb-4">Gaming AML Regulatory Framework</h2>
            <p className="text-body text-text-secondary">Gaming regulators are tightening AML requirements. WorldAML covers the key obligations across major licensing jurisdictions.</p>
          </div>
          <div className="overflow-x-auto rounded-xl border border-divider">
            <table className="w-full text-left">
              <thead className="bg-secondary">
                <tr>
                  <th className="px-6 py-4 text-caption font-semibold text-slate uppercase tracking-wider">Regulator</th>
                  <th className="px-6 py-4 text-caption font-semibold text-slate uppercase tracking-wider">Key Requirement</th>
                  <th className="px-6 py-4 text-caption font-semibold text-slate uppercase tracking-wider">WorldAML Module</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-divider">
                {[
                  { reg: "UKGC", req: "KYC before withdrawal, ongoing monitoring, SAR filing", module: "KYC + Monitoring" },
                  { reg: "MGA (Malta)", req: "CDD above €2,000, EDD for high-risk players", module: "KYC + Risk Assessment" },
                  { reg: "GRA (Gibraltar)", req: "DNFBP AML programme, risk-based approach", module: "Full platform" },
                  { reg: "FATF DNFBP", req: "CDD, monitoring, SAR obligations for casinos", module: "KYC + Monitoring" },
                  { reg: "EU AMLD6", req: "Extended AML obligations for online gaming", module: "Full platform" },
                ].map((row) => (
                  <tr key={row.reg} className="bg-card hover:bg-secondary/50 transition-colors">
                    <td className="px-6 py-4 text-body-sm font-mono font-semibold text-teal">{row.reg}</td>
                    <td className="px-6 py-4 text-body-sm text-navy">{row.req}</td>
                    <td className="px-6 py-4 text-body-sm text-text-secondary">{row.module}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section-padding bg-secondary/30">
        <div className="container-enterprise">
          <h2 className="text-headline text-navy mb-12">Platform Capabilities for Gaming Operators</h2>
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
          <h2 className="text-headline text-primary-foreground mb-4">Meet your gaming AML obligations</h2>
          <p className="text-body-lg text-slate-light mb-8">Talk to our compliance specialists about your gaming licence requirements.</p>
          <Button size="lg" variant="accent" asChild>
            <Link to="/contact-sales">Contact Sales <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </section>
    </main>
    <Footer />
  </div>
);

export default IndustryGaming;
