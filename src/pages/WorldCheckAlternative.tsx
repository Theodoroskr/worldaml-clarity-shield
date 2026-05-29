import { Link } from "react-router-dom";
import { ArrowRight, Check, X, Minus } from "lucide-react";
import SEO from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const comparison: { feature: string; worldaml: "yes" | "no" | "partial"; worldcheck: "yes" | "no" | "partial"; note?: string }[] = [
  { feature: "Sanctions, PEP & adverse media screening", worldaml: "yes", worldcheck: "yes" },
  { feature: "Coverage of 1,900+ global watchlists", worldaml: "yes", worldcheck: "yes" },
  { feature: "Built-in case management & workflow", worldaml: "yes", worldcheck: "partial", note: "World-Check is data-only; you bring your own workflow tool." },
  { feature: "Transaction monitoring included", worldaml: "yes", worldcheck: "no" },
  { feature: "KYC/KYB onboarding included", worldaml: "yes", worldcheck: "no" },
  { feature: "Regulator-ready reporting (FinCEN, FINTRAC, MOKAS, goAML)", worldaml: "yes", worldcheck: "no" },
  { feature: "Transparent self-serve pricing", worldaml: "yes", worldcheck: "no", note: "World-Check is quote-only with multi-year enterprise contracts." },
  { feature: "Free ad-hoc sanctions check", worldaml: "yes", worldcheck: "no" },
  { feature: "REST API for screening", worldaml: "yes", worldcheck: "yes" },
  { feature: "Powered by LexisNexis WorldCompliance & BridgerXG", worldaml: "yes", worldcheck: "no", note: "World-Check uses Refinitiv's proprietary database." },
  { feature: "EU-hosted, GDPR-native delivery", worldaml: "yes", worldcheck: "partial" },
  { feature: "SMB-friendly onboarding (days, not months)", worldaml: "yes", worldcheck: "no" },
];

const reasons = [
  {
    title: "Platform, not just data",
    desc: "World-Check™ is a list. WorldAML is the screening engine, case management, transaction monitoring and regulator reporting around it — so you don't need to stitch together three tools to evidence compliance.",
  },
  {
    title: "Equivalent global coverage",
    desc: "WorldAML draws on LexisNexis WorldCompliance and BridgerXG — 9.2M+ profiles across 1,900+ sanctions, PEP and adverse media sources covering 240+ countries. Comparable depth to Refinitiv World-Check™.",
  },
  {
    title: "Pricing built for the next 10 years",
    desc: "Self-serve subscriptions and regional pricing in EUR, GBP, USD and AED. No multi-year enterprise lock-in just to switch on sanctions screening.",
  },
  {
    title: "Faster time-to-compliance",
    desc: "Onboard in days with pre-built MLR 2017, AMLR, BSA and MOKAS rule packs — not months of solutions-engineering.",
  },
  {
    title: "Audit-ready by default",
    desc: "Every screening hit, decision and override is logged with full audit trail, four-eye approval and pre-formatted SAR/STR exports.",
  },
  {
    title: "EU & GDPR native",
    desc: "Delivered from the EU by Infocredit Group, with Article 28 DPAs, EU data residency and full DPIA support — no cross-Atlantic data-transfer headaches.",
  },
];

const faqs = [
  {
    q: "Is WorldAML really a World-Check alternative?",
    a: "Yes. WorldAML covers the same screening use cases as Refinitiv World-Check™ — sanctions, PEPs, adverse media, RCAs and state-owned entities — across 1,900+ global lists. The difference is that WorldAML also includes the screening engine, case management, monitoring and regulatory reporting around the data, so you don't need a separate workflow platform.",
  },
  {
    q: "How does WorldAML's data compare to World-Check?",
    a: "WorldAML is powered by LexisNexis WorldCompliance and BridgerXG — 9.2M+ profiles across 240+ countries and 1,900+ sources. Independent reviews consistently rank LexisNexis as a Tier-1 equivalent to Refinitiv World-Check™ for breadth, refresh frequency and adverse media depth.",
  },
  {
    q: "Can I switch from World-Check without rebuilding my compliance stack?",
    a: "Yes. WorldAML provides import templates for existing customer/entity lists, mirrors common risk categories (sanctions, PEP, SIE, RCA, adverse media), and exposes a REST API with familiar request/response shapes. Most teams migrate in 2–4 weeks.",
  },
  {
    q: "Is WorldAML cheaper than World-Check?",
    a: "Typically yes for SMBs and mid-market firms. WorldAML offers transparent self-serve subscriptions in EUR, GBP, USD and AED, while Refinitiv World-Check™ is enterprise-quote-only with multi-year commitments. Enterprise pricing is also negotiable for larger volumes.",
  },
  {
    q: "Is World-Check™ a trademark of WorldAML?",
    a: "No. World-Check™ is a registered trademark of Refinitiv (now part of the London Stock Exchange Group). WorldAML is an independent product from Infocredit Group, an EU-based compliance technology company. References to World-Check on this page are used solely for lawful comparative purposes.",
  },
];

const Icon = ({ value }: { value: "yes" | "no" | "partial" }) =>
  value === "yes" ? (
    <Check className="w-5 h-5 text-teal" aria-label="Yes" />
  ) : value === "no" ? (
    <X className="w-5 h-5 text-red-500" aria-label="No" />
  ) : (
    <Minus className="w-5 h-5 text-text-tertiary" aria-label="Partial" />
  );

const WorldCheckAlternative = () => {
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="World-Check Alternative — Sanctions & PEP"
        description="Looking for a World-Check alternative? Compare WorldAML vs Refinitiv World-Check — same global sanctions, PEP and adverse media coverage, plus built-in case management, monitoring and transparent pricing."
        canonical="/world-check-alternative"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "World-Check Alternative", url: "/world-check-alternative" },
        ]}
        structuredData={faqLd}
      />
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="section-padding bg-navy text-white">
          <div className="container-enterprise">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold tracking-wide uppercase text-accent mb-4">
                Refinitiv World-Check™ Alternative
              </p>
              <h1 className="text-display mb-6">
                A modern alternative to World-Check — screening, monitoring and case management in one platform
              </h1>
              <p className="text-body-lg text-white/80 mb-8">
                WorldAML gives banks, fintechs and regulated firms the same Tier-1 sanctions, PEP
                and adverse media coverage as Refinitiv World-Check™ — plus the screening engine,
                case management, transaction monitoring and regulator-ready reporting Refinitiv
                doesn't include.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button variant="accent" size="lg" asChild>
                  <Link to="/contact-sales">Compare against your World-Check quote</Link>
                </Button>
                <Button variant="outline-light" size="lg" asChild>
                  <Link to="/free-aml-check">
                    Run a free AML check <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Why switch */}
        <section className="section-padding bg-background">
          <div className="container-enterprise">
            <h2 className="text-2xl text-navy mb-2">Why teams switch from World-Check to WorldAML</h2>
            <p className="text-text-secondary mb-8 max-w-2xl">
              Equivalent data depth, a complete compliance workflow on top, and pricing that fits
              modern fintech and SMB economics.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reasons.map((r) => (
                <Card key={r.title} className="border-divider">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-navy">{r.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{r.desc}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison table */}
        <section className="section-padding bg-surface-subtle">
          <div className="container-enterprise">
            <h2 className="text-2xl text-navy mb-2">WorldAML vs Refinitiv World-Check™</h2>
            <p className="text-text-secondary mb-8 max-w-2xl">
              Head-to-head on the capabilities compliance teams actually evaluate.
            </p>
            <div className="overflow-x-auto rounded-lg border border-divider bg-white">
              <table className="w-full text-left">
                <thead className="bg-navy text-white">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Capability</th>
                    <th className="px-6 py-4 font-semibold text-center">WorldAML</th>
                    <th className="px-6 py-4 font-semibold text-center">World-Check™</th>
                  </tr>
                </thead>
                <tbody>
                  {comparison.map((row, i) => (
                    <tr key={row.feature} className={i % 2 === 0 ? "bg-white" : "bg-surface-subtle"}>
                      <td className="px-6 py-4 align-top">
                        <div className="text-navy font-medium">{row.feature}</div>
                        {row.note && (
                          <div className="text-caption text-text-tertiary mt-1">{row.note}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center align-top">
                        <div className="inline-flex">
                          <Icon value={row.worldaml} />
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center align-top">
                        <div className="inline-flex">
                          <Icon value={row.worldcheck} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-caption text-text-tertiary mt-4">
              Comparison reflects publicly documented capabilities at time of writing. World-Check™
              is a registered trademark of Refinitiv (LSEG). References used for lawful
              comparative purposes only.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="section-padding bg-background">
          <div className="container-enterprise max-w-3xl">
            <h2 className="text-2xl text-navy mb-8">World-Check alternative — FAQ</h2>
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

        {/* CTA */}
        <section className="section-padding bg-navy">
          <div className="container-enterprise text-center">
            <h2 className="text-3xl text-white mb-4">See WorldAML beside your current World-Check setup</h2>
            <p className="text-white/80 mb-8 max-w-2xl mx-auto">
              Bring a recent screening report or quote — our team will run the same entities
              through WorldAML so you can compare match quality, workflow and total cost.
            </p>
            <Button variant="accent" size="lg" asChild>
              <Link to="/contact-sales">Request a side-by-side comparison</Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default WorldCheckAlternative;
