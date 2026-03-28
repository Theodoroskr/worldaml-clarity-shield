import { useParams, Link, Navigate } from "react-router-dom";
import SEO from "@/components/SEO";
import { allEUSanctionsRegimes, regionLabels } from "@/data/euSanctionsRegimes";
import { Shield, ChevronRight, ExternalLink, ArrowLeft, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const measureIcons: Record<string, string> = {
  "Arms export": "🔫",
  "Arms procurement": "🔫",
  "Arms embargo": "🔫",
  "Arms import": "🔫",
  "Asset freeze and prohibition to make funds available": "🏦",
  "Restrictions on admission": "🚫",
  "Financial measures": "💰",
  "Prohibition to satisfy claims": "⚖️",
  "Restrictions on goods": "📦",
  "Restrictions on services": "🔧",
  "Inspections": "🔍",
  "Investments": "📈",
  "Flights, airports, aircrafts": "✈️",
  "Ports and vessels": "🚢",
  "Road transport": "🚛",
  "Embargo on dual-use goods": "⚙️",
  "Dual-use goods export": "⚙️",
  "Restrictions on equipment used for internal repression": "🛡️",
  "Telecommunications equipment": "📡",
  "Vigilance": "👁️",
  "Cultural property": "🏛️",
};

const EUSanctionsCountry = () => {
  const { slug } = useParams<{ slug: string }>();
  const regime = allEUSanctionsRegimes.find((r) => r.slug === slug);

  if (!regime) return <Navigate to="/eu-sanctions-map" replace />;

  const totalMeasures = regime.regimes.reduce((sum, r) => sum + r.measures.length, 0);
  const allMeasures = [...new Set(regime.regimes.flatMap((r) => r.measures))];

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "EU Sanctions Map", url: "/eu-sanctions-map" },
    { name: regime.country, url: `/eu-sanctions/${regime.slug}` },
  ];

  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: `EU Sanctions on ${regime.country}`,
      description: regime.description,
      url: `https://www.worldaml.com/eu-sanctions/${regime.slug}`,
      publisher: { "@id": "https://www.worldaml.com/#organization" },
      dateModified: "2026-03-28",
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: `What EU sanctions are imposed on ${regime.country}?`,
          acceptedAnswer: {
            "@type": "Answer",
            text: regime.description,
          },
        },
        {
          "@type": "Question",
          name: `How many sanctions regimes target ${regime.country}?`,
          acceptedAnswer: {
            "@type": "Answer",
            text: `There are ${regime.regimes.length} distinct EU sanctions regime(s) targeting ${regime.country}, covering ${allMeasures.length} unique types of restrictive measures.`,
          },
        },
      ],
    },
  ];

  // Find related regimes in same region
  const related = allEUSanctionsRegimes
    .filter((r) => r.region === regime.region && r.slug !== regime.slug)
    .slice(0, 6);

  return (
    <>
      <SEO
        title={`EU Sanctions on ${regime.country} – Restrictive Measures Guide`}
        description={regime.description}
        canonical={`/eu-sanctions/${regime.slug}`}
        breadcrumbs={breadcrumbs}
        structuredData={structuredData}
      />

      {/* Breadcrumbs */}
      <nav className="bg-muted/50 border-b border-border" aria-label="Breadcrumb">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <ol className="flex items-center gap-2 text-sm text-muted-foreground">
            {breadcrumbs.map((bc, i) => (
              <li key={bc.url} className="flex items-center gap-2">
                {i > 0 && <ChevronRight className="w-3 h-3" />}
                {i < breadcrumbs.length - 1 ? (
                  <Link to={bc.url} className="hover:text-foreground transition-colors">{bc.name}</Link>
                ) : (
                  <span className="text-foreground font-medium">{bc.name}</span>
                )}
              </li>
            ))}
          </ol>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-b from-primary to-primary/90 text-primary-foreground py-12 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <Link to="/eu-sanctions-map" className="inline-flex items-center gap-1 text-primary-foreground/70 hover:text-primary-foreground mb-6 text-sm">
            <ArrowLeft className="w-4 h-4" /> Back to EU Sanctions Map
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <Badge className="bg-white/15 text-primary-foreground">{regionLabels[regime.region]}</Badge>
            <Badge className="bg-white/15 text-primary-foreground">{regime.regimes.length} Regime{regime.regimes.length > 1 ? "s" : ""}</Badge>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            EU Sanctions on {regime.country}
          </h1>
          <p className="text-lg text-primary-foreground/80 max-w-3xl">
            {regime.description}
          </p>
        </div>
      </section>

      {/* Summary Stats */}
      <section className="py-8 border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-xl">
              <div className="text-2xl font-bold text-foreground">{regime.regimes.length}</div>
              <div className="text-sm text-muted-foreground">Sanctions Regimes</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-xl">
              <div className="text-2xl font-bold text-foreground">{allMeasures.length}</div>
              <div className="text-sm text-muted-foreground">Measure Types</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-xl">
              <div className="text-2xl font-bold text-foreground">
                {[...new Set(regime.regimes.map((r) => r.adoptedBy))].length}
              </div>
              <div className="text-sm text-muted-foreground">Adopting Bodies</div>
            </div>
          </div>
        </div>
      </section>

      {/* Regimes Detail */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
          <h2 className="text-2xl font-bold text-foreground">Sanctions Regimes in Detail</h2>

          {regime.regimes.map((reg, idx) => (
            <div key={idx} className="border border-border rounded-xl p-6 bg-card">
              <div className="flex items-start justify-between gap-4 mb-4">
                <h3 className="text-lg font-semibold text-foreground">{reg.title}</h3>
                <Badge variant="outline" className="whitespace-nowrap shrink-0">{reg.adoptedBy}</Badge>
              </div>

              <h4 className="text-sm font-medium text-muted-foreground mb-3">Restrictive Measures ({reg.measures.length})</h4>
              <div className="grid gap-2 sm:grid-cols-2">
                {[...new Set(reg.measures)].map((measure) => (
                  <div key={measure} className="flex items-center gap-2 text-sm bg-muted/50 rounded-lg px-3 py-2">
                    <span>{measureIcons[measure] || "📋"}</span>
                    <span className="text-foreground">{measure}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Compliance Warning */}
      <section className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-amber-900 dark:text-amber-200 mb-1">Compliance Obligation</h3>
                <p className="text-sm text-amber-800 dark:text-amber-300">
                  EU sanctions are legally binding on all EU persons and entities, including EU nationals abroad and companies incorporated in the EU.
                  Non-compliance can result in criminal penalties. This page is for informational purposes only — always consult official EU sources and legal counsel
                  for compliance decisions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Regimes */}
      {related.length > 0 && (
        <section className="py-12 bg-muted/30 border-t border-border">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <h2 className="text-xl font-bold text-foreground mb-6">
              Other {regionLabels[regime.region]} Sanctions Regimes
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  to={`/eu-sanctions/${r.slug}`}
                  className="border border-border rounded-lg p-4 hover:border-accent hover:shadow transition-all bg-card"
                >
                  <h3 className="font-medium text-foreground">{r.country}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{r.regimes.length} regime{r.regimes.length > 1 ? "s" : ""} · {r.regimes[0].adoptedBy}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-12 border-t border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Screen Against EU Sanctions in Real-Time</h2>
          <p className="text-muted-foreground mb-6">
            WorldAML's platform screens against 1,400+ sanctions lists including all EU restrictive measures, updated in real-time.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/sanctions-check">
              <Button size="lg">
                <Shield className="w-4 h-4 mr-2" /> Free Sanctions Check
              </Button>
            </Link>
            <Link to="/contact-sales">
              <Button size="lg" variant="outline">Talk to Sales</Button>
            </Link>
          </div>
          <p className="text-xs text-muted-foreground mt-6">
            Source:{" "}
            <a href="https://sanctionsmap.eu/#/main" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline inline-flex items-center gap-1">
              EU Sanctions Map <ExternalLink className="w-3 h-3" />
            </a>
          </p>
        </div>
      </section>
    </>
  );
};

export default EUSanctionsCountry;
