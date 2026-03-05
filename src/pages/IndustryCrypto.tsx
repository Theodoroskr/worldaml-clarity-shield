import { Link } from "react-router-dom";
import { ArrowRight, Bitcoin, Shield, Globe, FileCheck, Wallet, AlertTriangle } from "lucide-react";
import SEO from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "AML Compliance for Crypto & VASPs | WorldAML",
  description: "VASP compliance platform for crypto exchanges, custodians, and digital asset businesses. KYC onboarding, wallet screening, FATF Travel Rule, and risk-based decisioning.",
  url: "https://www.worldaml.com/industries/crypto",
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://www.worldaml.com/" },
      { "@type": "ListItem", position: 2, name: "Industries", item: "https://www.worldaml.com/industries" },
      { "@type": "ListItem", position: 3, name: "Crypto & Digital Assets", item: "https://www.worldaml.com/industries/crypto" },
    ],
  },
  mainEntity: {
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What AML obligations apply to crypto exchanges and VASPs?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Virtual Asset Service Providers (VASPs) are subject to the full FATF AML/CFT framework under Recommendation 15 and its 2019 update. Obligations include: KYC/CDD on all customers, sanctions and PEP screening, ongoing transaction monitoring, SAR filing, and the FATF Travel Rule (R.16) requiring originator and beneficiary information to accompany transfers above the threshold. MiCA in the EU and CARF under OECD also impose additional reporting requirements.",
        },
      },
      {
        "@type": "Question",
        name: "What is the FATF Travel Rule for crypto?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The FATF Travel Rule requires VASPs to collect, verify, and transmit originator and beneficiary information (name, account/wallet address, and in some cases physical address) for virtual asset transfers at or above USD/EUR 1,000. This mirrors the wire transfer rule applied to banks. The rule has been transposed into law in the EU (via TFR regulation), UK, US (FinCEN), and other jurisdictions.",
        },
      },
      {
        "@type": "Question",
        name: "Does WorldAML support crypto-specific AML use cases?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. WorldAML supports VASP KYC onboarding (including liveness checks for higher-value accounts), sanctions screening of counterparty identities, Travel Rule data collection and transmission workflows, and ongoing monitoring for unusual activity patterns. The platform is aligned to FATF R.15, MiCA, and major VASP licensing frameworks.",
        },
      },
    ],
  },
};

const features = [
  { icon: Bitcoin, title: "VASP KYC Onboarding", description: "Identity verification, document checks, and liveness detection for retail and institutional VASP customers — all via API." },
  { icon: Wallet, title: "Travel Rule Compliance", description: "Collect and transmit originator/beneficiary data for virtual asset transfers. Aligned to FATF R.16, EU TFR, and UK HMRC requirements." },
  { icon: Shield, title: "Sanctions Screening", description: "Screen customer and counterparty identities against OFAC, EU, UN, and crypto-specific sanctions designations in real time." },
  { icon: AlertTriangle, title: "Transaction Monitoring", description: "Monitor on-chain and off-chain activity for suspicious patterns. Configurable thresholds and typologies for VASP workflows." },
  { icon: Globe, title: "Multi-Jurisdiction Support", description: "Cover EU MiCA, UK FCA VASP registration, US FinCEN MSB, and ADGM VASP requirements from a single platform." },
  { icon: FileCheck, title: "CARF Reporting", description: "Automated Crypto-Asset Reporting Framework (CARF) data collection and report generation for OECD reporting obligations." },
];

const IndustryCrypto = () => (
  <div className="min-h-screen flex flex-col">
    <SEO
      title="AML Compliance for Crypto Exchanges & VASPs | FATF Travel Rule | WorldAML"
      description="VASP compliance platform for crypto exchanges and digital asset businesses. KYC onboarding, sanctions screening, FATF Travel Rule, and CARF reporting. MiCA and FATF R.15 aligned."
      canonical="/industries/crypto"
      breadcrumbs={[
        { name: "Home", url: "/" },
        { name: "Industries", url: "/industries" },
        { name: "Crypto & Digital Assets", url: "/industries/crypto" },
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
              <span className="text-caption font-semibold text-teal uppercase tracking-wider">Crypto & Digital Assets</span>
            </div>
            <h1 className="text-display text-primary-foreground mb-6">
              VASP AML Compliance for Crypto & Digital Asset Businesses
            </h1>
            <p className="text-body-lg text-slate-light mb-8">
              Meet FATF R.15, MiCA, and Travel Rule obligations with an API-first compliance platform built for virtual asset service providers. KYC onboarding, sanctions screening, and CARF reporting in a single integration.
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
            <h2 className="text-headline text-navy mb-4">VASP Regulatory Framework</h2>
            <p className="text-body text-text-secondary">The crypto industry faces an expanding global regulatory perimeter. WorldAML maps to each major framework.</p>
          </div>
          <div className="overflow-x-auto rounded-xl border border-divider">
            <table className="w-full text-left">
              <thead className="bg-secondary">
                <tr>
                  <th className="px-6 py-4 text-caption font-semibold text-slate uppercase tracking-wider">Framework</th>
                  <th className="px-6 py-4 text-caption font-semibold text-slate uppercase tracking-wider">Key Requirement</th>
                  <th className="px-6 py-4 text-caption font-semibold text-slate uppercase tracking-wider">WorldAML Coverage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-divider">
                {[
                  { framework: "FATF R.15", req: "VASPs subject to full AML/CFT framework", module: "Full platform" },
                  { framework: "FATF R.16 / Travel Rule", req: "Originator/beneficiary data for transfers ≥ $1,000", module: "Travel Rule module" },
                  { framework: "EU MiCA / TFR", req: "CASP licensing, full KYC, sanctions screening", module: "KYC & AML Screening" },
                  { framework: "UK FCA VASP Reg.", req: "Registered VASP AML obligations", module: "KYC & Monitoring" },
                  { framework: "US FinCEN MSB", req: "BSA compliance, SAR filing", module: "Monitoring + Reporting" },
                  { framework: "OECD CARF", req: "Crypto-Asset Reporting Framework", module: "Regulatory Reporting" },
                ].map((row) => (
                  <tr key={row.framework} className="bg-card hover:bg-secondary/50 transition-colors">
                    <td className="px-6 py-4 text-body-sm font-mono font-semibold text-teal">{row.framework}</td>
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
          <h2 className="text-headline text-navy mb-12">Platform Capabilities for VASPs</h2>
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
          <h2 className="text-headline text-primary-foreground mb-4">Meet your VASP compliance obligations</h2>
          <p className="text-body-lg text-slate-light mb-8">Talk to our specialists about your crypto exchange or digital asset business requirements.</p>
          <Button size="lg" variant="accent" asChild>
            <Link to="/contact-sales">Contact Sales <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </section>
    </main>
    <Footer />
  </div>
);

export default IndustryCrypto;
