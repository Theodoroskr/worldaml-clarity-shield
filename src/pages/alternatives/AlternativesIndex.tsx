import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import SEO from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const alternatives = [
  {
    to: "/world-check-alternative",
    name: "Refinitiv World-Check",
    eyebrow: "Refinitiv / LSEG",
    desc: "Data-only sanctions and PEP feed. WorldAML adds the screening engine, case management, transaction monitoring and regulator reporting on top of equivalent Tier-1 coverage.",
    bullets: ["Same-day self-serve onboarding", "Transparent regional pricing", "Case management + TM included"],
  },
  {
    to: "/alternatives/comply-advantage",
    name: "ComplyAdvantage",
    eyebrow: "ComplyAdvantage",
    desc: "Real-time screening on a proprietary risk database. WorldAML matches on screening and monitoring while adding LexisNexis-sourced data, EU delivery and pre-built regulator report packs.",
    bullets: ["Tier-1 LexisNexis data", "EU data residency & DPA", "No per-search overages"],
  },
  {
    to: "/alternatives/dow-jones-risk-center",
    name: "Dow Jones Risk Center",
    eyebrow: "Dow Jones Risk & Compliance",
    desc: "Enterprise-grade sanctions and PEP data. WorldAML delivers equivalent Tier-1 data with the full workflow — screening, case management, TM and reporting — in a single subscription.",
    bullets: ["Platform + data, one contract", "No multi-year enterprise lock-in", "Regulator report packs included"],
  },
  {
    to: "/alternatives/napier",
    name: "Napier",
    eyebrow: "Napier Technologies",
    desc: "Modular AML platform with data-agnostic screening and TM. WorldAML bundles Tier-1 LexisNexis data in every subscription, with same-day onboarding rather than a multi-quarter programme.",
    bullets: ["Bundled data + platform", "Days-to-live, not quarters", "Transparent regional pricing"],
  },
  {
    to: "/alternatives/sanction-scanner",
    name: "Sanction Scanner",
    eyebrow: "Sanction Scanner",
    desc: "SMB-friendly sanctions and PEP screening on aggregated open-source lists. WorldAML upgrades data provenance to Tier-1 LexisNexis while adding four-eye case management and regulator reporting.",
    bullets: ["Tier-1 data provenance", "Full four-eye case workflow", "SAR/STR export packs"],
  },
  {
    to: "/resources/comparison/world-check-vs-worldcompliance-vs-dow-jones",
    name: "Side-by-side data comparison",
    eyebrow: "Provider comparison",
    desc: "In-depth comparison of the three Tier-1 AML data providers — Refinitiv World-Check, LexisNexis WorldCompliance and Dow Jones Risk & Compliance — on coverage, refresh, adverse media and pricing.",
    bullets: ["Coverage benchmarks", "Refresh & recency analysis", "Total-cost-of-ownership view"],
  },
];

const AlternativesIndex = () => {
  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: alternatives.map((a, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: a.name,
      url: `https://worldaml.com${a.to}`,
    })),
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="AML Software Alternatives Compared | WorldAML"
        description="Compare WorldAML against World-Check, ComplyAdvantage, Dow Jones Risk Center, Napier and Sanction Scanner — for procurement and compliance teams evaluating a switch."
        canonical="/alternatives"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Alternatives", url: "/alternatives" },
        ]}
        structuredData={itemListLd}
      />
      <Header />
      <main className="flex-1">
        <section className="section-padding bg-navy text-white">
          <div className="container-enterprise max-w-4xl">
            <p className="text-sm font-semibold tracking-wide uppercase text-accent mb-4">
              Alternatives & Comparisons
            </p>
            <h1 className="text-display mb-6">
              AML software alternatives — a clear view for procurement and compliance
            </h1>
            <p className="text-body-lg text-white/80 mb-8">
              Head-to-head comparisons against the tools most regulated firms shortlist —
              Refinitiv World-Check, ComplyAdvantage, Dow Jones Risk Center, Napier and
              Sanction Scanner. Every page covers Tier-1 data provenance, workflow scope,
              procurement terms and the control-effectiveness questions compliance teams
              have to answer.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button variant="accent" size="lg" asChild>
                <Link to="/contact-sales">Request a side-by-side comparison</Link>
              </Button>
              <Button variant="outline-light" size="lg" asChild>
                <Link to="/free-aml-check">
                  Run a free AML check <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="section-padding bg-background">
          <div className="container-enterprise">
            <div className="grid md:grid-cols-2 gap-6">
              {alternatives.map((a) => (
                <Card key={a.to} className="border-divider flex flex-col">
                  <CardHeader>
                    <p className="text-xs font-semibold tracking-wide uppercase text-teal">
                      {a.eyebrow}
                    </p>
                    <CardTitle className="text-xl text-navy">
                      WorldAML vs {a.name}
                    </CardTitle>
                    <CardDescription>{a.desc}</CardDescription>
                  </CardHeader>
                  <CardContent className="mt-auto">
                    <ul className="space-y-2 mb-5">
                      {a.bullets.map((b) => (
                        <li key={b} className="flex items-start gap-2 text-sm text-text-secondary">
                          <CheckCircle2 className="w-4 h-4 text-teal shrink-0 mt-0.5" />
                          {b}
                        </li>
                      ))}
                    </ul>
                    <Button variant="secondary" asChild>
                      <Link to={a.to}>
                        Open comparison <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="section-padding bg-surface-subtle">
          <div className="container-enterprise max-w-4xl">
            <h2 className="text-2xl text-navy mb-4">How to read these comparisons</h2>
            <div className="grid md:grid-cols-2 gap-6 text-text-secondary">
              <div>
                <h3 className="text-navy font-semibold mb-2">If you're in procurement</h3>
                <p>Focus on the "For procurement & finance" block on each page — total cost, contract terms, DPA/security posture and regional invoicing. Every WorldAML comparison uses a 30-day exit clause and transparent EUR/GBP/USD/AED pricing.</p>
              </div>
              <div>
                <h3 className="text-navy font-semibold mb-2">If you're in compliance</h3>
                <p>Focus on the "For compliance & MLROs" block — data provenance, match logic, four-eye workflow, audit trail and regulator report packs. Every comparison links to the underlying data provider so you can defend the choice at an s.166 or equivalent review.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="section-padding bg-navy">
          <div className="container-enterprise text-center">
            <h2 className="text-3xl text-white mb-4">Not sure where to start?</h2>
            <p className="text-white/80 mb-8 max-w-2xl mx-auto">
              Share the tool you're evaluating and we'll run the same entities through WorldAML
              — you'll get match-quality output, a total-cost view and a security packet in the
              same week.
            </p>
            <Button variant="accent" size="lg" asChild>
              <Link to="/contact-sales">Talk to the WorldAML team</Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default AlternativesIndex;
