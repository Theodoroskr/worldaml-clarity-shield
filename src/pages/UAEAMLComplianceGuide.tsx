import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RelatedGuidesSection, { GUIDE_LINKS } from "@/components/RelatedGuidesSection";
import { Button } from "@/components/ui/button";
import { ArrowRight, Building2, ShieldCheck, Globe2, FileSearch, AlertTriangle, CheckCircle2 } from "lucide-react";

const faqStructuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Do UAE Free Zone companies need to comply with AML regulations?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. All UAE Free Zone entities classified as Designated Non-Financial Businesses and Professions (DNFBPs) or financial institutions must comply with Federal Decree-Law No. 20 of 2018 on AML/CFT, register with the goAML portal, and follow guidance issued by their Free Zone regulator (DFSA for DIFC, FSRA for ADGM, or the relevant Free Zone authority).",
      },
    },
    {
      "@type": "Question",
      name: "What is the difference between DIFC and ADGM AML requirements?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "DIFC firms are supervised by the Dubai Financial Services Authority (DFSA) under the AML Module of its Rulebook. ADGM firms fall under the Financial Services Regulatory Authority (FSRA) and the ADGM AML and Sanctions Rules and Guidance (AML). Both align with FATF standards but issue separate rulebooks, thematic reviews and sanctions notices.",
      },
    },
    {
      "@type": "Question",
      name: "Which sanctions lists must UAE Free Zone businesses screen against?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "At minimum: the UAE Local Terrorist List, the UN Security Council Consolidated List, and any targeted financial sanctions issued by the UAE Executive Office for Control & Non-Proliferation (EOCN). Globally exposed firms also screen OFAC, EU, HMT and 1,900+ international watchlists.",
      },
    },
    {
      "@type": "Question",
      name: "How often must Free Zone firms file Suspicious Transaction Reports (STRs)?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Without delay, via the goAML portal operated by the UAE Financial Intelligence Unit (FIU), as soon as a suspicion of money laundering, terrorist financing or proliferation financing arises — regardless of transaction value.",
      },
    },
  ],
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "UAE AML Compliance Guide for Free Zones (DIFC, ADGM & Mainland)",
  description: "A practical AML/CFT compliance guide for UAE Free Zone businesses — DIFC, ADGM, DMCC and JAFZA — covering regulators, sanctions screening, goAML reporting and FATF alignment.",
  author: { "@type": "Organization", name: "WorldAML" },
  publisher: {
    "@type": "Organization",
    name: "WorldAML",
    logo: { "@type": "ImageObject", url: "https://www.worldaml.com/og-image.png" },
  },
  mainEntityOfPage: "https://www.worldaml.com/resources/uae-aml-compliance-guide",
};

const UAEAMLComplianceGuide = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="UAE AML Compliance Guide (DIFC & ADGM)"
        description="Practical AML/CFT guide for UAE Free Zone firms: DIFC, ADGM, DMCC obligations, sanctions screening, goAML reporting and FATF alignment."
        canonical="/resources/uae-aml-compliance-guide"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Resources", url: "/resources/glossary" },
          { name: "UAE AML Compliance Guide", url: "/resources/uae-aml-compliance-guide" },
        ]}
        structuredData={[faqStructuredData, articleStructuredData]}
      />
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="section-padding bg-gradient-to-b from-primary/5 to-background">
          <div className="container-enterprise max-w-4xl">
            <p className="text-caption uppercase tracking-widest text-primary font-semibold mb-3">
              Regional Compliance Guide
            </p>
            <h1 className="text-display text-navy mb-4">
              UAE AML Compliance for Free Zones: DIFC, ADGM &amp; Beyond
            </h1>
            <p className="text-body-lg text-text-secondary mb-6">
              A practical reference for compliance officers and MLROs operating in UAE Free Zones —
              covering Federal Decree-Law No. 20 of 2018, DFSA and FSRA rulebooks, EOCN sanctions
              obligations, and how to align local controls with FATF Recommendations.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link to="/contact-sales">Speak to a UAE specialist</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/aml-screening/eu">Compare with EU requirements</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* What is it */}
        <section className="section-padding">
          <div className="container-enterprise max-w-4xl space-y-6">
            <h2 className="text-headline text-navy">Why UAE Free Zones face unique AML obligations</h2>
            <p className="text-body text-text-secondary">
              The UAE hosts more than 40 Free Zones — including DIFC, ADGM, DMCC, JAFZA, RAKEZ and
              Meydan — each with its own licensing regime. Although Free Zones offer 100% foreign
              ownership and tax incentives, every licensed entity that meets the definition of a
              financial institution or DNFBP must comply with the same federal AML/CFT regime as
              mainland firms, plus rules issued by their Free Zone regulator.
            </p>
            <p className="text-body text-text-secondary">
              Since the UAE exited the FATF grey list in February 2024, supervisors have increased
              the frequency and depth of AML inspections. Free Zone firms can no longer rely on
              jurisdictional arbitrage — controls, sanctions screening and reporting expectations
              are aligned across the federation.
            </p>
          </div>
        </section>

        {/* Regulators */}
        <section className="section-padding bg-surface-subtle">
          <div className="container-enterprise max-w-4xl">
            <h2 className="text-headline text-navy mb-8">The regulators you need to know</h2>
            <div className="grid sm:grid-cols-2 gap-6">
              {[
                {
                  icon: Building2,
                  title: "DFSA — Dubai International Financial Centre",
                  body: "Supervises all DIFC-licensed firms under the AML Module of the DFSA Rulebook. Issues thematic reviews and enforces SEO (Sanctions Compliance) requirements aligned with UN and EOCN lists.",
                },
                {
                  icon: Building2,
                  title: "FSRA — Abu Dhabi Global Market",
                  body: "Regulates ADGM financial firms under the AML & Sanctions Rules and Guidance (AML). Maintains its own consolidated rulebook and supervisory priorities, including beneficial ownership transparency.",
                },
                {
                  icon: ShieldCheck,
                  title: "EOCN — Executive Office for Control & Non-Proliferation",
                  body: "Operates the UAE Local Terrorist List and issues federal targeted financial sanctions. All licensed entities, including Free Zone firms, must screen against EOCN designations and freeze assets without delay.",
                },
                {
                  icon: FileSearch,
                  title: "FIU — Financial Intelligence Unit",
                  body: "Runs the goAML portal. Every reporting entity — Free Zone or mainland — must register and file STRs, SARs, PNMRs and DPMSR reports through this single channel.",
                },
              ].map((r) => (
                <div key={r.title} className="bg-card border border-divider rounded-lg p-6">
                  <r.icon className="w-6 h-6 text-teal mb-3" />
                  <h3 className="text-body-lg font-semibold text-navy mb-2">{r.title}</h3>
                  <p className="text-body-sm text-text-secondary">{r.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Core obligations */}
        <section className="section-padding">
          <div className="container-enterprise max-w-4xl">
            <h2 className="text-headline text-navy mb-8">Core AML obligations for Free Zone firms</h2>
            <ol className="space-y-6">
              {[
                {
                  title: "Appoint a qualified MLRO / Compliance Officer",
                  body: "Required by Cabinet Decision No. 10 of 2019. The MLRO must be UAE-resident, independent of business lines, and approved by the Free Zone regulator where applicable.",
                },
                {
                  title: "Conduct an Enterprise-Wide Risk Assessment (EWRA)",
                  body: "Documented, board-approved, and refreshed at least annually — covering customer, geographic, product, channel and proliferation-financing risk.",
                },
                {
                  title: "Customer Due Diligence (CDD) and Enhanced Due Diligence (EDD)",
                  body: "Apply risk-based CDD on every customer; perform EDD on PEPs, high-risk jurisdictions, complex structures and any customer with beneficial owners outside the UAE.",
                },
                {
                  title: "Ongoing sanctions and PEP screening",
                  body: "Screen at onboarding and continuously thereafter against EOCN, UN, OFAC, EU and HMT lists, with re-screening within 24 hours of any list update.",
                },
                {
                  title: "goAML registration and STR filing",
                  body: "Register the entity and the MLRO on goAML and file STRs without delay when suspicion arises — regardless of transaction value.",
                },
                {
                  title: "Record-keeping for 5 years",
                  body: "Retain CDD records, transaction data, screening hits and STR submissions for at least five years after the end of the business relationship.",
                },
              ].map((step, i) => (
                <li key={step.title} className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-teal/10 text-teal flex items-center justify-center font-semibold">
                    {i + 1}
                  </div>
                  <div>
                    <h3 className="text-body-lg font-semibold text-navy mb-1">{step.title}</h3>
                    <p className="text-body-sm text-text-secondary">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* FATF alignment */}
        <section className="section-padding bg-surface-subtle">
          <div className="container-enterprise max-w-4xl">
            <h2 className="text-headline text-navy mb-6">UAE rules vs FATF Recommendations</h2>
            <p className="text-body text-text-secondary mb-6">
              UAE federal law and Free Zone rulebooks are structured to map onto the 40 FATF
              Recommendations. Where the UAE goes further than the international baseline is in
              targeted financial sanctions: the EOCN regime imposes immediate freezing obligations
              without prior notice — comparable in strictness to OFAC's SDN framework.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                "Risk-based approach (FATF R.1) — mandatory EWRA documented and board-approved",
                "Beneficial ownership (FATF R.24/25) — UBO register filed with the licensing authority",
                "Targeted sanctions (FATF R.6/7) — freeze without delay under EOCN designations",
                "STR filing (FATF R.20) — via goAML, no de minimis threshold",
              ].map((item) => (
                <div key={item} className="flex gap-3 bg-card border border-divider rounded-lg p-4">
                  <CheckCircle2 className="w-5 h-5 text-teal flex-shrink-0 mt-0.5" />
                  <p className="text-body-sm text-text-secondary">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Common pitfalls */}
        <section className="section-padding">
          <div className="container-enterprise max-w-4xl">
            <h2 className="text-headline text-navy mb-6">Common pitfalls in Free Zone AML programmes</h2>
            <div className="space-y-4">
              {[
                "Treating Free Zone licensing as a substitute for substantive AML controls",
                "Screening only at onboarding without continuous re-screening against updated lists",
                "Outsourcing CDD without retaining accountability or independent verification",
                "Failing to document the rationale for risk ratings or EDD decisions",
                "Missing the goAML registration deadline after obtaining a new licence",
              ].map((item) => (
                <div key={item} className="flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-body text-text-secondary">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="section-padding bg-navy text-white">
          <div className="container-enterprise max-w-4xl text-center">
            <Globe2 className="w-12 h-12 text-teal mx-auto mb-4" />
            <h2 className="text-headline mb-4">Built for UAE compliance teams</h2>
            <p className="text-body-lg text-white/80 mb-6 max-w-2xl mx-auto">
              WorldAML supports DIFC, ADGM and mainland firms with continuous sanctions screening
              against EOCN, UN, OFAC, EU and HMT lists — plus 1,900+ global watchlists.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button asChild size="lg">
                <Link to="/contact-sales">
                  Talk to our UAE team <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-transparent text-white border-white/30 hover:bg-white/10">
                <Link to="/resources/glossary">Browse the AML glossary</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default UAEAMLComplianceGuide;
