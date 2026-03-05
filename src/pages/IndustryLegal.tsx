import { Link } from "react-router-dom";
import { ArrowRight, Scale, Shield, FileCheck, Users, ClipboardList, Building } from "lucide-react";
import SEO from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "AML Compliance for Law Firms & Fiduciary Services | WorldAML",
  description: "AML compliance platform for law firms, trust companies, and corporate service providers. Client KYC/KYB onboarding, sanctions screening, and audit trail. FATF DNFBP and AMLD aligned.",
  url: "https://www.worldaml.com/industries/legal",
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://www.worldaml.com/" },
      { "@type": "ListItem", position: 2, name: "Industries", item: "https://www.worldaml.com/industries" },
      { "@type": "ListItem", position: 3, name: "Legal & Fiduciary", item: "https://www.worldaml.com/industries/legal" },
    ],
  },
  mainEntity: {
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Are law firms required to comply with AML regulations?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Law firms and fiduciary services providers are classified as Designated Non-Financial Businesses and Professions (DNFBPs) under FATF Recommendation 22. When providing specified services — company formation, trust administration, real estate transactions, client account management — they must conduct Customer Due Diligence (CDD), screen for sanctions and PEPs, apply Enhanced Due Diligence for high-risk clients, and file Suspicious Activity Reports. EU AMLD, UK MLRs, and FATF-compliant national laws apply.",
        },
      },
      {
        "@type": "Question",
        name: "What is Enhanced Due Diligence (EDD) for legal professionals?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Enhanced Due Diligence requires law firms to gather additional information about high-risk clients — those who are PEPs, from high-risk jurisdictions, or involved in complex corporate structures. EDD typically includes Source of Wealth verification, beneficial ownership mapping for corporate clients, deeper background checks, and senior management approval before onboarding. WorldAML's EDD workflow automates documentation collection and approval routing.",
        },
      },
      {
        "@type": "Question",
        name: "How does WorldAML help law firms manage client AML compliance?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "WorldAML provides law firms with client KYC and KYB onboarding via API or platform UI, including UBO mapping for corporate clients. It screens against global sanctions and PEP lists, calculates a risk score for each client, triggers EDD workflows for high-risk clients, and maintains a full audit trail of all compliance actions. This significantly reduces manual effort while ensuring regulator-ready documentation.",
        },
      },
    ],
  },
};

const features = [
  { icon: Users, title: "Client KYC & KYB", description: "Individual and corporate client onboarding with identity verification, document checks, and UBO mapping for corporate structures." },
  { icon: Shield, title: "Sanctions & PEP Screening", description: "Screen every client against global sanctions lists and PEP databases. Real-time and periodic re-screening for ongoing engagements." },
  { icon: ClipboardList, title: "EDD Workflows", description: "Structured Enhanced Due Diligence workflows for high-risk clients. Source of Wealth documentation, approval routing, and senior sign-off." },
  { icon: Building, title: "UBO Mapping", description: "Identify and verify Ultimate Beneficial Owners for corporate, trust, and partnership structures. Visual ownership tree with verification status." },
  { icon: Scale, title: "Risk Categorisation", description: "Automated client risk scoring with Low/Medium/High tier assignment. FATF risk-based approach, aligned to legal sector guidance." },
  { icon: FileCheck, title: "Audit Trail & Documentation", description: "Regulator-ready audit trail of every compliance action. Exportable documentation packages for supervisory inspections." },
];

const IndustryLegal = () => (
  <div className="min-h-screen flex flex-col">
    <SEO
      title="AML Compliance for Law Firms & Fiduciary Services | KYC & EDD | WorldAML"
      description="AML compliance platform for law firms, trust companies, and CSPs. Client KYC/KYB, UBO mapping, EDD workflows, and audit trail. FATF DNFBP and EU AMLD aligned."
      canonical="/industries/legal"
      breadcrumbs={[
        { name: "Home", url: "/" },
        { name: "Industries", url: "/industries" },
        { name: "Legal & Fiduciary", url: "/industries/legal" },
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
              <span className="text-caption font-semibold text-teal uppercase tracking-wider">Legal & Fiduciary</span>
            </div>
            <h1 className="text-display text-primary-foreground mb-6">
              AML Compliance for Law Firms, Trust Companies & CSPs
            </h1>
            <p className="text-body-lg text-slate-light mb-8">
              Client KYC/KYB onboarding, UBO mapping, EDD workflows, and a full audit trail for legal professionals and fiduciary service providers. Meet your DNFBP obligations without the manual overhead.
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
            <h2 className="text-headline text-navy mb-4">DNFBP AML Obligations for Legal Professionals</h2>
            <p className="text-body text-text-secondary">Law firms and fiduciary services providers face specific AML obligations under FATF R.22 and local legislation. WorldAML covers every requirement.</p>
          </div>
          <div className="overflow-x-auto rounded-xl border border-divider">
            <table className="w-full text-left">
              <thead className="bg-secondary">
                <tr>
                  <th className="px-6 py-4 text-caption font-semibold text-slate uppercase tracking-wider">Obligation</th>
                  <th className="px-6 py-4 text-caption font-semibold text-slate uppercase tracking-wider">When It Applies</th>
                  <th className="px-6 py-4 text-caption font-semibold text-slate uppercase tracking-wider">WorldAML Module</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-divider">
                {[
                  { ob: "Customer Due Diligence", when: "All new clients; trigger-based re-verification", module: "KYC & KYB" },
                  { ob: "Enhanced Due Diligence", when: "PEPs, high-risk jurisdictions, complex structures", module: "EDD Workflow" },
                  { ob: "Sanctions Screening", when: "Before and during client engagement", module: "AML Screening" },
                  { ob: "UBO Identification", when: "Corporate, trust, and partnership clients", module: "KYB / UBO Mapping" },
                  { ob: "Risk-Based Assessment", when: "All clients — Low / Medium / High tier", module: "Risk Assessment" },
                  { ob: "SAR Filing Obligation", when: "When suspicious activity identified", module: "Audit Trail + SAR prep" },
                ].map((row) => (
                  <tr key={row.ob} className="bg-card hover:bg-secondary/50 transition-colors">
                    <td className="px-6 py-4 text-body-sm font-semibold text-navy">{row.ob}</td>
                    <td className="px-6 py-4 text-body-sm text-text-secondary">{row.when}</td>
                    <td className="px-6 py-4 text-body-sm font-mono text-teal">{row.module}</td>
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
          <h2 className="text-headline text-navy mb-12">Platform Capabilities for Legal Professionals</h2>
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
          <h2 className="text-headline text-primary-foreground mb-4">Meet your DNFBP obligations with confidence</h2>
          <p className="text-body-lg text-slate-light mb-8">Talk to our team about your law firm or fiduciary services provider requirements.</p>
          <Button size="lg" variant="accent" asChild>
            <Link to="/contact-sales">Contact Sales <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </section>
    </main>
    <Footer />
  </div>
);

export default IndustryLegal;
