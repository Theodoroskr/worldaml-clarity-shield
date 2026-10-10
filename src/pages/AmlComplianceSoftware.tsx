import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, Landmark } from "lucide-react";
import SEO from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RelatedGuidesSection, { GUIDE_LINKS } from "@/components/RelatedGuidesSection";
import { Button } from "@/components/ui/button";

/**
 * Guide page targeting "what is aml compliance software", "aml compliance software",
 * "aml software" and "best aml software for banks".
 */

const components = [
  { t: "Customer due diligence (KYC/KYB)", d: "Verifies identity documents, biometrics and company ownership at onboarding, with simplified or enhanced due diligence applied by risk." },
  { t: "Sanctions, PEP & adverse media screening", d: "Checks customers and counterparties against sanctions, watchlists, politically exposed persons and negative news — at onboarding and continuously." },
  { t: "Transaction monitoring", d: "Applies rules and thresholds to payments and account activity to flag patterns linked to money laundering or terrorist financing." },
  { t: "Risk scoring", d: "Rates each customer on geography, product, channel and behaviour so controls match the risk — the core of a risk-based approach." },
  { t: "Case management", d: "Turns alerts into cases with evidence, analyst decisions and rationale, with four-eyes review for higher-risk outcomes." },
  { t: "Regulatory reporting & audit trail", d: "Prepares suspicious activity reports and keeps an immutable record of every check and decision for supervisors and auditors." },
];

const bankCriteria = [
  { t: "List coverage you can verify", d: "Ask for list-level coverage — UN, EU, OFAC, UK HMT and local regimes — not just a headline count, plus how quickly list updates reach your screening." },
  { t: "False-positive performance on your own data", d: "Banks carry large customer books. Run a sample of your own names through the tool before signing; tuning and fuzzy matching decide analyst workload." },
  { t: "Transaction monitoring depth", d: "Look for configurable rules by product and segment, scenario testing and clear alert explanations your model-risk team can validate." },
  { t: "Evidence and model governance", d: "Every alert should be reconstructable years later: which list version, which threshold, who decided and why." },
  { t: "Integration with core banking", d: "API and batch options, webhooks and support for your onboarding channels — without a 12-month implementation." },
  { t: "Data residency and security", d: "Hosting location, encryption at rest, access controls, sub-processor list and exit terms should all be documented up front." },
  { t: "Total cost, not unit price", d: "Compare per-check fees, monitoring charges, list add-ons and the analyst time spent clearing false positives." },
];

const faqs = [
  { q: "What is AML compliance software?", a: "AML compliance software is technology regulated businesses use to meet anti-money-laundering obligations. It automates customer due diligence, sanctions and PEP screening, transaction monitoring, risk scoring, case management and suspicious activity reporting, and keeps an audit trail that proves to regulators the controls were applied." },
  { q: "What does AML software do?", a: "It verifies who your customers are, checks them against sanctions, PEP and adverse-media lists, watches their transactions for suspicious patterns, scores their risk, and routes alerts to analysts who decide and document the outcome. Reports to the financial intelligence unit are prepared from those cases." },
  { q: "What is the best AML software for banks?", a: "The best AML software for a bank is the one that covers the lists and regimes you are supervised under, keeps false positives low on your own customer data, offers configurable transaction monitoring, and records evidence your regulator and auditors can reconstruct. Shortlist vendors, then test each on a sample of your own names before deciding." },
  { q: "Who needs AML compliance software?", a: "Banks, credit unions, payment and e-money institutions, fintechs, crypto firms, investment managers, gambling operators, real estate agents, law and accountancy firms, and trust and company service providers — any business covered by FATF-based AML rules such as EU AMLD, UK MLR 2017 or the US Bank Secrecy Act." },
  { q: "What is the difference between AML and KYC software?", a: "KYC software verifies customer identity at onboarding. AML software is broader: it includes KYC, plus screening, ongoing monitoring, risk scoring and reporting across the whole customer relationship." },
  { q: "How much does AML software cost?", a: "Pricing usually depends on the number of customers checked, screening and monitoring volumes and the modules used. WorldAML publishes self-serve plans on its pricing page and quotes enterprise volumes." },
];

const AmlComplianceSoftware = () => {
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "What Is AML Compliance Software? And the Best AML Software for Banks",
    url: "https://worldaml.com/aml-compliance-software",
    publisher: { "@type": "Organization", name: "WorldAML" },
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="What Is AML Compliance Software? Best AML Software for Banks"
        description="What AML compliance software does, the core features to expect, and how banks should choose the best AML software: coverage, false positives, monitoring and evidence."
        canonical="/aml-compliance-software"
        ogType="article"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "AML Compliance Software", url: "/aml-compliance-software" },
        ]}
        structuredData={[articleLd, faqLd]}
      />
      <Header />
      <main className="flex-1">
        <section className="section-padding bg-surface-subtle">
          <div className="container-enterprise max-w-3xl">
            <p className="text-sm font-semibold tracking-wide uppercase text-accent mb-4">Buyer's guide</p>
            <h1 className="text-headline text-navy mb-6">What is AML compliance software?</h1>
            <p className="text-body-lg text-text-secondary mb-6">
              <strong>AML compliance software</strong> helps regulated businesses meet anti-money-laundering
              obligations. It verifies customers, screens them against sanctions and PEP lists, monitors
              transactions, scores risk, manages alerts and prepares regulatory reports — with an audit trail
              that proves every control was applied.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button variant="accent" size="lg" asChild>
                <Link to="/contact-sales">Talk to a compliance specialist</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <a href="#best-for-banks">Best AML software for banks <ArrowRight className="ml-2 h-4 w-4" /></a>
              </Button>
            </div>
          </div>
        </section>

        <section className="section-padding bg-background">
          <div className="container-enterprise">
            <h2 className="text-2xl text-navy mb-2">What AML software does</h2>
            <p className="text-text-secondary mb-8 max-w-2xl">The six core capabilities most AML compliance programmes rely on.</p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {components.map((c) => (
                <div key={c.t} className="p-6 rounded-lg border border-divider bg-card">
                  <h3 className="text-lg font-semibold text-navy mb-2">{c.t}</h3>
                  <p className="text-text-secondary">{c.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="best-for-banks" className="section-padding bg-surface-subtle scroll-mt-24">
          <div className="container-enterprise max-w-4xl">
            <div className="flex items-center gap-3 mb-2">
              <Landmark className="w-6 h-6 text-accent" />
              <h2 className="text-2xl text-navy">How to choose the best AML software for banks</h2>
            </div>
            <p className="text-text-secondary mb-8">
              Banks face the heaviest supervisory scrutiny and the largest customer books. Use these seven
              criteria to compare vendors.
            </p>
            <ol className="space-y-5">
              {bankCriteria.map((c, i) => (
                <li key={c.t} className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/10 text-accent font-semibold flex items-center justify-center">{i + 1}</span>
                  <div>
                    <h3 className="font-semibold text-navy">{c.t}</h3>
                    <p className="text-text-secondary">{c.d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="section-padding bg-background">
          <div className="container-enterprise max-w-4xl">
            <h2 className="text-2xl text-navy mb-6">How WorldAML fits</h2>
            <ul className="space-y-4">
              {[
                "KYC, KYB, screening, transaction monitoring, case management and reporting in one platform with one audit trail.",
                "Screening against 1,900+ global lists, including sanctions, warning and enforcement, and fitness and probity lists.",
                "Composite 0–100 risk scoring and four-eyes review for defensible decisions.",
                "Self-serve plans live in days; enterprise rollouts in weeks.",
              ].map((p) => (
                <li key={p} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-1" />
                  <span className="text-text-secondary">{p}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-wrap gap-4 text-sm">
              <Link to="/industries/banking" className="text-accent hover:underline">AML for banks →</Link>
              <Link to="/aml-kyc-compliance" className="text-accent hover:underline">AML KYC compliance platform →</Link>
              <Link to="/pricing" className="text-accent hover:underline">Pricing →</Link>
            </div>
          </div>
        </section>

        <section className="section-padding bg-surface-subtle">
          <div className="container-enterprise max-w-3xl">
            <h2 className="text-2xl text-navy mb-8">AML compliance software — FAQ</h2>
            <div className="space-y-6">
              {faqs.map((f) => (
                <div key={f.q} className="border-b border-divider pb-6">
                  <h3 className="text-lg font-semibold text-navy mb-2">{f.q}</h3>
                  <p className="text-text-secondary">{f.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <RelatedGuidesSection
          currentPath="/aml-compliance-software"
          intro="Related AML, KYC and screening resources."
          links={[
            GUIDE_LINKS.amlKycCompliance,
            GUIDE_LINKS.sanctionsSoftware,
            GUIDE_LINKS.amlChecklist,
            GUIDE_LINKS.whatIsSanctions,
            GUIDE_LINKS.sanctionsLists,
            GUIDE_LINKS.compareProviders,
          ]}
        />
      </main>
      <Footer />
    </div>
  );
};

export default AmlComplianceSoftware;
