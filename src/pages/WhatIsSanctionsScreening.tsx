import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RelatedGuidesSection, { GUIDE_LINKS } from "@/components/RelatedGuidesSection";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck, Globe2, AlertTriangle, FileSearch, Repeat, CheckCircle2 } from "lucide-react";

const faqStructuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is sanctions screening?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sanctions screening is the process of checking customers, counterparties, transactions and beneficial owners against government-issued sanctions, watchlists and Politically Exposed Person (PEP) lists to detect prohibited or high-risk parties before doing business with them.",
      },
    },
    {
      "@type": "Question",
      name: "Who is required to perform sanctions screening?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Banks, fintechs, payment providers, crypto exchanges, insurers, legal and accounting firms, real estate agents, and most regulated businesses must screen against sanctions lists issued by OFAC (US), HM Treasury (UK), the EU, the UN and other national regulators.",
      },
    },
    {
      "@type": "Question",
      name: "Which sanctions lists must be screened?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "At a minimum, firms screen against OFAC SDN and Consolidated lists, the UN Security Council Consolidated List, EU Consolidated Sanctions, UK HMT Sanctions List, and local regulator lists. Globally exposed firms also screen 1,900+ regulatory and law-enforcement watchlists.",
      },
    },
    {
      "@type": "Question",
      name: "How often should sanctions screening be performed?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Screening must occur at onboarding, before each high-risk transaction, and continuously (ongoing monitoring) as lists are updated — typically within 24 hours of any list change to remain compliant.",
      },
    },
  ],
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "What is Sanctions Screening? A Complete Guide for Compliance Teams",
  description: "A plain-English guide to sanctions screening: what it is, why it matters, who must do it, the key sanctions lists (OFAC, UN, EU, HMT), and how to operate an effective screening programme.",
  author: { "@type": "Organization", name: "WorldAML" },
  publisher: {
    "@type": "Organization",
    name: "WorldAML",
    logo: { "@type": "ImageObject", url: "https://www.worldaml.com/og-image.png" },
  },
  mainEntityOfPage: "https://www.worldaml.com/resources/what-is-sanctions-screening",
};

const WhatIsSanctionsScreening = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="What is Sanctions Screening? (2026 Guide)"
        description="Sanctions screening explained: how it works, OFAC/UN/EU/HMT lists, regulatory obligations, and how compliance teams build an effective screening programme."
        canonical="/resources/what-is-sanctions-screening"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Resources", url: "/resources/glossary" },
          { name: "What is Sanctions Screening", url: "/resources/what-is-sanctions-screening" },
        ]}
        structuredData={[faqStructuredData, articleStructuredData]}
      />
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="section-padding bg-gradient-to-b from-primary/5 to-background">
          <div className="container-enterprise max-w-4xl">
            <p className="text-caption uppercase tracking-widest text-primary font-semibold mb-3">
              Compliance Guide
            </p>
            <h1 className="text-display text-foreground mb-5">
              What is Sanctions Screening?
            </h1>
            <p className="text-body-lg text-muted-foreground mb-6">
              Sanctions screening is the regulatory process of checking individuals,
              companies, vessels and transactions against government-issued
              sanctions lists, watchlists and PEP databases to identify
              prohibited or high-risk parties — <em>before</em> money moves
              or a customer is onboarded.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link to="/free-aml-check">
                  Try a free sanctions check <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/resources/sanctions-lists">Browse sanctions lists</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Body */}
        <section className="section-padding">
          <article className="container-enterprise max-w-3xl prose prose-slate dark:prose-invert">
            <h2 className="text-headline text-foreground mt-0 mb-4">Why sanctions screening matters</h2>
            <p className="text-body text-muted-foreground">
              Sanctions are one of the most powerful foreign-policy and
              national-security tools governments use against terrorism,
              proliferation financing, organised crime and rogue states.
              For regulated firms, failing to screen properly is not just a
              compliance gap — it can mean multi-million-dollar fines,
              criminal liability for officers, and loss of banking licences.
              Recent enforcement actions by OFAC and the UK's OFSI have
              individually exceeded USD 1 billion.
            </p>

            <h2 className="text-headline text-foreground mt-10 mb-4">The four pillars of a screening programme</h2>
            <div className="grid sm:grid-cols-2 gap-4 not-prose my-6">
              {[
                { icon: ShieldCheck, title: "Customer screening", desc: "Screen every natural person and legal entity at onboarding and on each KYC refresh." },
                { icon: Globe2, title: "Transaction screening", desc: "Inspect payment messages (SWIFT, SEPA, card) in real time before settlement." },
                { icon: Repeat, title: "Ongoing monitoring", desc: "Re-screen the entire book whenever lists change — typically daily." },
                { icon: FileSearch, title: "Alert investigation", desc: "Disposition matches with documented reasoning to build a defensible audit trail." },
              ].map((p) => (
                <div key={p.title} className="rounded-xl border border-border bg-card p-5">
                  <p.icon className="h-5 w-5 text-primary mb-2" />
                  <h3 className="font-semibold text-foreground mb-1">{p.title}</h3>
                  <p className="text-body-sm text-muted-foreground">{p.desc}</p>
                </div>
              ))}
            </div>

            <h2 className="text-headline text-foreground mt-10 mb-4">Which sanctions lists must be screened?</h2>
            <p className="text-body text-muted-foreground">
              The mandatory list depends on a firm's jurisdiction, its
              customer footprint and the currencies it touches. At minimum,
              most regulated firms screen against:
            </p>
            <ul className="text-body text-muted-foreground">
              <li><strong>OFAC SDN &amp; Consolidated List</strong> — US Department of the Treasury, binding for any USD-denominated activity worldwide.</li>
              <li><strong>UN Security Council Consolidated List</strong> — binding on all UN member states.</li>
              <li><strong>EU Consolidated Financial Sanctions List</strong> — binding across all EU member states under Regulation 2580/2001 and CFSP decisions.</li>
              <li><strong>UK HM Treasury (OFSI) Sanctions List</strong> — binding for any GBP activity or UK touchpoint, post-Brexit.</li>
              <li><strong>National regimes</strong> — e.g. Australia DFAT, Canada OSFI, Switzerland SECO, UAE Local Terrorist List.</li>
            </ul>
            <p className="text-body text-muted-foreground">
              Mature programmes layer on PEP databases, adverse media, RCA
              (relatives and close associates) and law-enforcement watchlists,
              typically reaching 1,900+ sources globally.
            </p>

            <h2 className="text-headline text-foreground mt-10 mb-4">Regulatory bodies that mandate screening</h2>
            <ul className="text-body text-muted-foreground">
              <li><strong>OFAC</strong> (US Office of Foreign Assets Control) — strict liability for US persons and USD transactions.</li>
              <li><strong>FATF</strong> — sets the global standard; Recommendation 6 requires targeted financial sanctions.</li>
              <li><strong>FinCEN</strong> — enforces the US Bank Secrecy Act, including sanctions-related SAR filings.</li>
              <li><strong>FCA / OFSI</strong> (UK) — supervises financial sanctions compliance.</li>
              <li><strong>EBA &amp; national NCAs</strong> (EU) — under AMLD6 and the new EU AMLA.</li>
            </ul>

            <h2 className="text-headline text-foreground mt-10 mb-4">Common pitfalls and false positives</h2>
            <p className="text-body text-muted-foreground">
              The biggest operational challenge is <strong>noise</strong>.
              Common names (e.g. "Mohammed Ali", "John Smith") generate
              thousands of fuzzy matches daily. Effective programmes tune
              fuzzy-match thresholds (Jaro-Winkler 0.70+ is a common starting
              point), apply secondary identifiers (date of birth, nationality,
              passport number), and use risk-based prioritisation so analysts
              focus on the alerts most likely to be true hits.
            </p>

            <div className="not-prose my-8 rounded-xl border border-amber-500/30 bg-amber-500/5 p-5 flex gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-body-sm text-foreground m-0">
                <strong>50 USD is enough.</strong> OFAC strict-liability rules
                apply regardless of transaction size — there is no de-minimis
                threshold for sanctions breaches.
              </p>
            </div>

            <h2 className="text-headline text-foreground mt-10 mb-4">How modern screening platforms work</h2>
            <p className="text-body text-muted-foreground">
              Modern platforms like WorldAML orchestrate screening across
              multiple data providers (LexisNexis WorldCompliance, Dow Jones,
              Refinitiv) through a single API, normalising results and
              applying configurable risk rules. Typical features include
              real-time screening (&lt;200ms), batch re-screening for ongoing
              monitoring, 4-eyes alert disposition, and automated audit
              trails to satisfy regulatory examiners.
            </p>

            <h2 className="text-headline text-foreground mt-10 mb-4">Building a defensible programme — checklist</h2>
            <ul className="text-body text-muted-foreground not-prose space-y-2 my-6">
              {[
                "Document your sanctions risk assessment annually",
                "Screen at onboarding, payment, and on every list update",
                "Maintain a written list-coverage policy (which lists, why)",
                "Tune fuzzy-match thresholds and document the rationale",
                "Apply 4-eyes review on every true-positive disposition",
                "Retain audit trails for at least 5 years (longer in some regimes)",
                "Train front-line and compliance staff at least annually",
              ].map((item) => (
                <li key={item} className="flex gap-2 items-start">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <h2 className="text-headline text-foreground mt-10 mb-4">Frequently asked questions</h2>
            <div className="space-y-4 not-prose">
              {faqStructuredData.mainEntity.map((q: any) => (
                <details key={q.name} className="rounded-lg border border-border bg-card p-4">
                  <summary className="font-semibold text-foreground cursor-pointer">{q.name}</summary>
                  <p className="text-body-sm text-muted-foreground mt-2">{q.acceptedAnswer.text}</p>
                </details>
              ))}
            </div>

            <h2 className="text-headline text-foreground mt-10 mb-4">Next steps</h2>
            <p className="text-body text-muted-foreground">
              Ready to operationalise sanctions screening? Explore our
              <Link to="/platform/aml-screening" className="text-primary hover:underline"> AML screening platform</Link>,
              browse <Link to="/resources/sanctions-lists" className="text-primary hover:underline">our coverage of 1,900+ global lists</Link>,
              or run a <Link to="/free-aml-check" className="text-primary hover:underline">free sanctions check</Link> against major regimes now.
            </p>
          </article>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default WhatIsSanctionsScreening;
