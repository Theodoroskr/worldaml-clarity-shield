import { Link } from "react-router-dom";
import { ArrowRight, CreditCard, Shield, BarChart3, Building, AlertTriangle, FileCheck } from "lucide-react";
import SEO from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "AML Compliance for Payment Providers & PSPs | WorldAML",
  description: "AML compliance platform for payment service providers and acquirers. Merchant KYB onboarding, sanctions screening, transaction monitoring, and PSD2/EMD2 compliance.",
  url: "https://www.worldaml.com/industries/payments",
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://www.worldaml.com/" },
      { "@type": "ListItem", position: 2, name: "Industries", item: "https://www.worldaml.com/industries" },
      { "@type": "ListItem", position: 3, name: "Payment Providers", item: "https://www.worldaml.com/industries/payments" },
    ],
  },
  mainEntity: {
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What AML obligations apply to payment service providers?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Payment Service Providers (PSPs) are regulated as financial institutions under FATF Recommendations. Obligations include: Customer Due Diligence on all merchants and customers, screening against sanctions and PEP lists, transaction monitoring for suspicious activity, compliance with the FATF Travel Rule (R.16) for transfers above thresholds, SAR filing, and recordkeeping. In the EU, PSPs fall under PSD2 and AMLD obligations. In the UK, PSPs are regulated by the FCA under the Payment Services Regulations.",
        },
      },
      {
        "@type": "Question",
        name: "How should PSPs conduct merchant KYB (Know Your Business)?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Merchant KYB involves verifying the legal entity, directors, and Ultimate Beneficial Owners (UBOs) of each merchant before processing their payments. It includes: company registration verification, director identity checks, UBO identification and verification, sanctions and PEP screening of all principals, and a risk assessment of the merchant's business type and jurisdiction. WorldAML's KYB module handles the full workflow via API, including document collection and UBO tree mapping.",
        },
      },
      {
        "@type": "Question",
        name: "Does WorldAML support transaction monitoring for payment providers?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. WorldAML's transaction monitoring module supports rule-based and AI-assisted detection of suspicious payment patterns including structuring, layering, unusual velocity, high-risk merchant category codes, and cross-border wire anomalies. Alerts integrate into a case management workflow with SAR preparation capability.",
        },
      },
    ],
  },
};

const features = [
  { icon: Building, title: "Merchant KYB Onboarding", description: "End-to-end merchant verification including entity registration, director identity checks, UBO mapping, and sanctions screening." },
  { icon: Shield, title: "Sanctions & PEP Screening", description: "Screen all merchants, directors, and UBOs against global sanctions and PEP lists at onboarding and on an ongoing basis." },
  { icon: AlertTriangle, title: "Transaction Monitoring", description: "Detect structuring, velocity anomalies, unusual merchant category activity, and cross-border transfer patterns in real time." },
  { icon: BarChart3, title: "Merchant Risk Scoring", description: "Automated risk categorisation for merchants based on business type, geography, volume, and ownership structure." },
  { icon: CreditCard, title: "Travel Rule Compliance", description: "Capture and transmit originator/beneficiary data for qualifying wire transfers. Aligned to FATF R.16, EU TFR, and UK requirements." },
  { icon: FileCheck, title: "SAR Workflow & Reporting", description: "Structured SAR preparation with case notes, evidence attachment, and regulatory report generation for FCA, CBI, and other PSP supervisors." },
];

const IndustryPayments = () => (
  <div className="min-h-screen flex flex-col">
    <SEO
      title="AML Compliance for Payment Providers & PSPs | Merchant KYB | WorldAML"
      description="AML compliance for PSPs and acquirers. Merchant KYB onboarding, sanctions screening, transaction monitoring, and Travel Rule. PSD2, AMLD, and FATF R.16 aligned."
      canonical="/industries/payments"
      breadcrumbs={[
        { name: "Home", url: "/" },
        { name: "Industries", url: "/industries" },
        { name: "Payment Providers", url: "/industries/payments" },
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
              <span className="text-caption font-semibold text-teal uppercase tracking-wider">Payment Providers</span>
            </div>
            <h1 className="text-display text-primary-foreground mb-6">
              AML Compliance for Payment Service Providers & Acquirers
            </h1>
            <p className="text-body-lg text-slate-light mb-8">
              Merchant KYB onboarding, real-time transaction monitoring, and Travel Rule compliance for PSPs and acquirers. Embed into your merchant workflows via API — aligned to PSD2, AMLD, and FATF R.16.
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

      {/* Obligations */}
      <section className="section-padding bg-background">
        <div className="container-enterprise">
          <div className="max-w-2xl mb-12">
            <h2 className="text-headline text-navy mb-4">PSP Regulatory Framework</h2>
            <p className="text-body text-text-secondary">Payment providers operate under multiple overlapping regulatory frameworks. WorldAML addresses each one.</p>
          </div>
          <div className="overflow-x-auto rounded-xl border border-divider">
            <table className="w-full text-left">
              <thead className="bg-secondary">
                <tr>
                  <th className="px-6 py-4 text-caption font-semibold text-slate uppercase tracking-wider">Framework</th>
                  <th className="px-6 py-4 text-caption font-semibold text-slate uppercase tracking-wider">Requirement</th>
                  <th className="px-6 py-4 text-caption font-semibold text-slate uppercase tracking-wider">WorldAML Module</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-divider">
                {[
                  { fw: "FATF R.10", req: "CDD on all customers and merchants", module: "KYC & KYB" },
                  { fw: "FATF R.16", req: "Travel Rule — wire transfer originator/beneficiary data", module: "Travel Rule" },
                  { fw: "EU PSD2 / AMLD6", req: "PSP AML obligations, enhanced CDD for high-risk", module: "Full platform" },
                  { fw: "UK PSRs 2017", req: "FCA supervised PSP AML programme", module: "KYC + Monitoring" },
                  { fw: "EU TFR Regulation", req: "Transfers of Funds — payer/payee data retention", module: "Monitoring + Audit" },
                ].map((row) => (
                  <tr key={row.fw} className="bg-card hover:bg-secondary/50 transition-colors">
                    <td className="px-6 py-4 text-body-sm font-mono font-semibold text-teal">{row.fw}</td>
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
          <h2 className="text-headline text-navy mb-12">Platform Capabilities for Payment Providers</h2>
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
          <h2 className="text-headline text-primary-foreground mb-4">Streamline your PSP compliance programme</h2>
          <p className="text-body-lg text-slate-light mb-8">Talk to our specialists about your payment provider requirements.</p>
          <Button size="lg" variant="accent" asChild>
            <Link to="/contact-sales">Contact Sales <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </section>
    </main>
    <Footer />
  </div>
);

export default IndustryPayments;
