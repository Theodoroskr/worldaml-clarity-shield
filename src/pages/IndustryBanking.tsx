import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, Shield, FileCheck, Users, BarChart3, AlertTriangle } from "lucide-react";
import SEO from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "AML Compliance for Banks & EMIs | WorldAML",
  description: "AML compliance platform for banks and electronic money institutions. KYC/KYB onboarding, sanctions screening, PEP checks, and ongoing monitoring. FATF, AMLD6, and CRR2 aligned.",
  url: "https://www.worldaml.com/industries/banking",
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://www.worldaml.com/" },
      { "@type": "ListItem", position: 2, name: "Industries", item: "https://www.worldaml.com/industries" },
      { "@type": "ListItem", position: 3, name: "Banks & EMIs", item: "https://www.worldaml.com/industries/banking" },
    ],
  },
  mainEntity: {
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What AML obligations do banks and EMIs have?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Banks and EMIs must conduct Customer Due Diligence (CDD) on all customers, screen against sanctions and PEP lists, apply Enhanced Due Diligence (EDD) for high-risk customers, monitor transactions on an ongoing basis, and file Suspicious Activity Reports (SARs). These obligations are set by FATF Recommendations 10–16 and implemented via EU AMLD, UK MLRs, and local CRD/CRR frameworks.",
        },
      },
      {
        "@type": "Question",
        name: "How does WorldAML help banks with AML compliance?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "WorldAML provides an API-first compliance platform covering KYC/KYB onboarding, real-time sanctions and PEP screening via WorldCompliance® and Bridger Insight XG®, risk-based customer categorisation, transaction monitoring, and automated regulatory reporting. All data is audit-logged for regulatory inspection.",
        },
      },
      {
        "@type": "Question",
        name: "Does WorldAML support FATF Recommendations for banks?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. WorldAML's platform is aligned to FATF Recommendations 10 (CDD), 12 (PEPs), 13 (Correspondent banking), 15 (New technologies), 16 (Wire transfers), and 20 (Reporting of suspicious transactions). Compliance workflows are configurable to local AMLD and national transpositions.",
        },
      },
    ],
  },
};

const features = [
  { icon: Users, title: "KYC & KYB Onboarding", description: "Individual and corporate customer onboarding with identity verification, UBO mapping, and document collection — API or platform UI." },
  { icon: Shield, title: "Sanctions & PEP Screening", description: "Real-time screening against OFAC, EU, UN, and 500+ global sanctions lists. PEP and RCA screening via WorldCompliance® and Bridger Insight XG®." },
  { icon: BarChart3, title: "Risk Categorisation", description: "Automated risk-based scoring with Low/Medium/High tier assignment. Configurable matrix aligned to your risk appetite and FATF RBA." },
  { icon: AlertTriangle, title: "Transaction Monitoring", description: "Rule-based and AI-assisted monitoring for suspicious activity. STR/SAR workflow triggers with configurable typologies." },
  { icon: FileCheck, title: "Regulatory Reporting", description: "Automated generation of CRS, FATCA, and jurisdiction-specific regulatory reports. Reduces manual reporting effort by 80%." },
  { icon: Shield, title: "Audit Trail", description: "Immutable, timestamped audit log of every compliance action for regulatory inspection and internal governance." },
];

const obligations = [
  { regulation: "FATF R.10", requirement: "Customer Due Diligence (CDD)" },
  { regulation: "FATF R.12", requirement: "Politically Exposed Persons (PEPs)" },
  { regulation: "FATF R.16", requirement: "Wire Transfer (Travel Rule)" },
  { regulation: "EU AMLD6", requirement: "Extended predicate offences, criminal liability" },
  { regulation: "UK MLRs 2017", requirement: "Risk-based approach, EDD, SAR filing" },
  { regulation: "CRD/CRR2", requirement: "AML governance, internal controls" },
];

const IndustryBanking = () => (
  <div className="min-h-screen flex flex-col">
    <SEO
      title="AML Compliance for Banks & EMIs | KYC Onboarding | WorldAML"
      description="AML compliance for banks and EMIs. KYC/KYB onboarding, sanctions and PEP screening, transaction monitoring, and regulatory reporting."
      canonical="/industries/banking"
      breadcrumbs={[
        { name: "Home", url: "/" },
        { name: "Industries", url: "/industries" },
        { name: "Banks & EMIs", url: "/industries/banking" },
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
              <span className="text-caption font-semibold text-teal uppercase tracking-wider">Banks & EMIs</span>
            </div>
            <h1 className="text-display text-primary-foreground mb-6">
              AML Compliance for Banks & Electronic Money Institutions
            </h1>
            <p className="text-body-lg text-slate-light mb-8">
              End-to-end compliance infrastructure for regulated banks and EMIs. KYC/KYB onboarding, real-time sanctions screening, risk categorisation, and automated regulatory reporting — via API or platform UI.
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

      {/* Regulatory obligations table */}
      <section className="section-padding bg-background">
        <div className="container-enterprise">
          <div className="max-w-2xl mb-12">
            <h2 className="text-headline text-navy mb-4">Regulatory Framework for Banks & EMIs</h2>
            <p className="text-body text-text-secondary">
              Banks and EMIs face the most comprehensive AML obligations of any regulated sector. WorldAML is designed to address each obligation directly.
            </p>
          </div>
          <div className="overflow-x-auto rounded-xl border border-divider">
            <table className="w-full text-left">
              <thead className="bg-secondary">
                <tr>
                  <th className="px-6 py-4 text-caption font-semibold text-slate uppercase tracking-wider">Regulation</th>
                  <th className="px-6 py-4 text-caption font-semibold text-slate uppercase tracking-wider">Requirement</th>
                  <th className="px-6 py-4 text-caption font-semibold text-slate uppercase tracking-wider">WorldAML Module</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-divider">
                {[
                  { ...obligations[0], module: "KYC & KYB" },
                  { ...obligations[1], module: "AML Screening" },
                  { ...obligations[2], module: "Transaction Monitoring" },
                  { ...obligations[3], module: "Risk Assessment" },
                  { ...obligations[4], module: "AML Screening + Reporting" },
                  { ...obligations[5], module: "Audit Trail" },
                ].map((row) => (
                  <tr key={row.regulation} className="bg-card hover:bg-secondary/50 transition-colors">
                    <td className="px-6 py-4 text-body-sm font-mono font-semibold text-teal">{row.regulation}</td>
                    <td className="px-6 py-4 text-body-sm text-navy">{row.requirement}</td>
                    <td className="px-6 py-4 text-body-sm text-text-secondary">{row.module}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="section-padding bg-secondary/30">
        <div className="container-enterprise">
          <div className="max-w-2xl mb-12">
            <h2 className="text-headline text-navy mb-4">Platform Capabilities for Banks</h2>
            <p className="text-body text-text-secondary">Everything you need to meet AML obligations across the full customer lifecycle.</p>
          </div>
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
          <h2 className="text-headline text-primary-foreground mb-4">Ready to modernise your AML programme?</h2>
          <p className="text-body-lg text-slate-light mb-8">Talk to our compliance specialists about your bank or EMI's specific requirements.</p>
          <Button size="lg" variant="accent" asChild>
            <Link to="/contact-sales">Contact Sales <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </section>
    </main>
    <Footer />
  </div>
);

export default IndustryBanking;
