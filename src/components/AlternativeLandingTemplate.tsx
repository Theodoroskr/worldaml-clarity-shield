import { Link } from "react-router-dom";
import { ArrowRight, Check, X, Minus, ShieldCheck, Scale, Wallet, ClipboardCheck, Users, Globe } from "lucide-react";
import SEO from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RelatedGuidesSection, { GUIDE_LINKS } from "@/components/RelatedGuidesSection";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export type Verdict = "yes" | "no" | "partial";
export interface ComparisonRow {
  feature: string;
  worldaml: Verdict;
  competitor: Verdict;
  note?: string;
}
export interface FaqItem { q: string; a: string }

export interface AlternativeLandingProps {
  competitorName: string;                 // e.g. "ComplyAdvantage"
  competitorTrademark?: string;           // e.g. "ComplyAdvantage® is a registered trademark of IVXS UK Limited"
  eyebrow: string;                        // e.g. "ComplyAdvantage Alternative"
  headline: string;                       // H1
  subhead: string;                        // hero paragraph
  seoTitle: string;                       // <60 chars
  seoDescription: string;                 // <160 chars
  canonical: string;                      // e.g. /alternatives/comply-advantage
  reasons: { title: string; desc: string }[];
  comparison: ComparisonRow[];
  procurement: { title: string; desc: string }[]; // procurement-team focused points
  compliance: { title: string; desc: string }[];  // compliance-team focused points
  faqs: FaqItem[];
}

const Icon = ({ value }: { value: Verdict }) =>
  value === "yes" ? (
    <Check className="w-5 h-5 text-teal" aria-label="Yes" />
  ) : value === "no" ? (
    <X className="w-5 h-5 text-red-500" aria-label="No" />
  ) : (
    <Minus className="w-5 h-5 text-text-tertiary" aria-label="Partial" />
  );

const procIcons = [Wallet, Scale, ClipboardCheck, Users, Globe, ShieldCheck];

const AlternativeLandingTemplate = (p: AlternativeLandingProps) => {
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: p.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title={p.seoTitle}
        description={p.seoDescription}
        canonical={p.canonical}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Alternatives", url: "/alternatives" },
          { name: p.competitorName, url: p.canonical },
        ]}
        structuredData={faqLd}
      />
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="section-padding bg-navy text-white">
          <div className="container-enterprise">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold tracking-wide uppercase text-accent mb-4">{p.eyebrow}</p>
              <h1 className="text-display mb-6">{p.headline}</h1>
              <p className="text-body-lg text-white/80 mb-8">{p.subhead}</p>
              <div className="flex flex-wrap gap-3">
                <Button variant="accent" size="lg" asChild>
                  <Link to="/contact-sales">Compare against your {p.competitorName} quote</Link>
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
            <h2 className="text-2xl text-navy mb-2">Why teams switch from {p.competitorName} to WorldAML</h2>
            <p className="text-text-secondary mb-8 max-w-2xl">
              Equivalent Tier-1 coverage, a complete compliance workflow on top, and pricing built for modern fintech and mid-market economics.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {p.reasons.map((r) => (
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
            <h2 className="text-2xl text-navy mb-2">WorldAML vs {p.competitorName}</h2>
            <p className="text-text-secondary mb-8 max-w-2xl">
              Head-to-head on the capabilities compliance teams and procurement actually evaluate.
            </p>
            <div className="overflow-x-auto rounded-lg border border-divider bg-white">
              <table className="w-full text-left">
                <thead className="bg-navy text-white">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Capability</th>
                    <th className="px-6 py-4 font-semibold text-center">WorldAML</th>
                    <th className="px-6 py-4 font-semibold text-center">{p.competitorName}</th>
                  </tr>
                </thead>
                <tbody>
                  {p.comparison.map((row, i) => (
                    <tr key={row.feature} className={i % 2 === 0 ? "bg-white" : "bg-surface-subtle"}>
                      <td className="px-6 py-4 align-top">
                        <div className="text-navy font-medium">{row.feature}</div>
                        {row.note && (
                          <div className="text-caption text-text-tertiary mt-1">{row.note}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center align-top">
                        <div className="inline-flex"><Icon value={row.worldaml} /></div>
                      </td>
                      <td className="px-6 py-4 text-center align-top">
                        <div className="inline-flex"><Icon value={row.competitor} /></div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-caption text-text-tertiary mt-4">
              Comparison reflects publicly documented capabilities at time of writing.
              {p.competitorTrademark ? ` ${p.competitorTrademark}. References used for lawful comparative purposes only.` : " All trademarks referenced belong to their respective owners and are used for lawful comparative purposes only."}
            </p>
          </div>
        </section>

        {/* Procurement vs Compliance differentiation */}
        <section className="section-padding bg-background">
          <div className="container-enterprise">
            <h2 className="text-2xl text-navy mb-2">Built for procurement <em>and</em> compliance</h2>
            <p className="text-text-secondary mb-8 max-w-2xl">
              Two audiences sign the contract. WorldAML answers both — the commercial checklist procurement runs and the control-effectiveness questions compliance owns.
            </p>
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="border-divider">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-navy flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-teal" /> For procurement & finance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {p.procurement.map((item, i) => {
                    const I = procIcons[i % procIcons.length];
                    return (
                      <div key={item.title} className="flex gap-3">
                        <I className="w-5 h-5 text-teal shrink-0 mt-0.5" />
                        <div>
                          <div className="text-navy font-semibold">{item.title}</div>
                          <div className="text-sm text-text-secondary">{item.desc}</div>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
              <Card className="border-divider">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-navy flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-teal" /> For compliance & MLROs
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {p.compliance.map((item, i) => {
                    const I = procIcons[(i + 3) % procIcons.length];
                    return (
                      <div key={item.title} className="flex gap-3">
                        <I className="w-5 h-5 text-teal shrink-0 mt-0.5" />
                        <div>
                          <div className="text-navy font-semibold">{item.title}</div>
                          <div className="text-sm text-text-secondary">{item.desc}</div>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="section-padding bg-surface-subtle">
          <div className="container-enterprise max-w-3xl">
            <h2 className="text-2xl text-navy mb-8">{p.competitorName} alternative — FAQ</h2>
            <div className="space-y-6">
              {p.faqs.map((f) => (
                <div key={f.q} className="border-b border-divider pb-6">
                  <h3 className="text-lg font-semibold text-navy mb-2">{f.q}</h3>
                  <p className="text-text-secondary">{f.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <RelatedGuidesSection
          currentPath={p.canonical}
          links={[
            GUIDE_LINKS.worldCheckAlternative,
            GUIDE_LINKS.comparisonGuide,
            GUIDE_LINKS.sanctionsScreeningSoftware,
            GUIDE_LINKS.usAmlKycGuide,
          ].filter(Boolean) as typeof GUIDE_LINKS[keyof typeof GUIDE_LINKS][]}
        />

        {/* CTA */}
        <section className="section-padding bg-navy">
          <div className="container-enterprise text-center">
            <h2 className="text-3xl text-white mb-4">See WorldAML beside your current {p.competitorName} setup</h2>
            <p className="text-white/80 mb-8 max-w-2xl mx-auto">
              Bring a recent screening report or quote — our team will run the same entities through WorldAML so procurement can compare total cost and compliance can compare match quality.
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

export default AlternativeLandingTemplate;
