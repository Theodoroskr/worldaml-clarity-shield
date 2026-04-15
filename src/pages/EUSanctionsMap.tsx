import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { useAuth } from "@/contexts/AuthContext";
import { allEUSanctionsRegimes, regionLabels } from "@/data/euSanctionsRegimes";
import { Shield, Globe, Search, ExternalLink, ChevronRight, Filter, Map, ArrowLeft } from "lucide-react";
import InteractiveSanctionsMap from "@/components/sanctions/InteractiveSanctionsMap";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const regionColors: Record<string, string> = {
  europe: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  africa: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  "middle-east": "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  asia: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  americas: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  thematic: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300",
};

const EUSanctionsMap = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [activeRegion, setActiveRegion] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return allEUSanctionsRegimes.filter((r) => {
      const matchesSearch = !search || r.country.toLowerCase().includes(search.toLowerCase()) ||
        r.regimes.some((reg) => reg.title.toLowerCase().includes(search.toLowerCase()));
      const matchesRegion = !activeRegion || r.region === activeRegion;
      return matchesSearch && matchesRegion;
    });
  }, [search, activeRegion]);

  const totalRegimes = allEUSanctionsRegimes.reduce((sum, r) => sum + r.regimes.length, 0);
  const uniqueMeasures = new Set(allEUSanctionsRegimes.flatMap((r) => r.regimes.flatMap((reg) => reg.measures)));

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Resources", url: "/resources/sanctions-lists" },
    { name: "EU Sanctions Map", url: "/eu-sanctions-map" },
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "EU Sanctions Regimes",
    description: "Complete directory of EU restrictive measures (sanctions) regimes by country and thematic category.",
    numberOfItems: allEUSanctionsRegimes.length,
    itemListElement: allEUSanctionsRegimes.map((r, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: r.country,
      url: `https://www.worldaml.com/eu-sanctions/${r.slug}`,
    })),
  };

  return (
    <>
      <SEO
        title="EU Sanctions Map – Complete Guide to EU Restrictive Measures"
        description={`Explore ${allEUSanctionsRegimes.length} EU sanctions regimes. Country-by-country guide to EU, UN, and joint sanctions with measure types and compliance guidance.`}
        canonical="/eu-sanctions-map"
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
      <section className="bg-gradient-to-b from-primary to-primary/90 text-primary-foreground py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 mb-6">
            <Shield className="w-4 h-4" />
            <span className="text-sm font-medium">EU Restrictive Measures Directory</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-6">
            EU Sanctions Map
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground/80 max-w-3xl mx-auto mb-8">
            Comprehensive guide to all {allEUSanctionsRegimes.length} EU sanctions regimes covering {totalRegimes} restrictive
            measures frameworks across {uniqueMeasures.size}+ measure types. Essential reference for compliance officers and regulated entities.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { label: "Sanctioned Entities", value: `${allEUSanctionsRegimes.length}` },
              { label: "Regime Frameworks", value: `${totalRegimes}` },
              { label: "Measure Types", value: `${uniqueMeasures.size}+` },
              { label: "Regions Covered", value: "6" },
            ].map((s) => (
              <div key={s.label} className="bg-white/10 rounded-xl p-4">
                <div className="text-2xl md:text-3xl font-bold">{s.value}</div>
                <div className="text-sm text-primary-foreground/70">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Map */}
      <section className="py-10 bg-card border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2 mb-6">
            <Map className="w-5 h-5 text-accent" />
            <h2 className="text-lg font-semibold text-foreground">Interactive Sanctions Map</h2>
            <span className="text-sm text-muted-foreground ml-auto">Click a country to view details</span>
          </div>
          <InteractiveSanctionsMap activeRegion={activeRegion} />
        </div>
      </section>

      {/* Search & Filter */}
      <section className="py-8 border-b border-border sticky top-0 z-10 bg-background/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by country or regime..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-4 h-4 text-muted-foreground hidden md:block" />
              <Button
                variant={!activeRegion ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveRegion(null)}
              >
                All
              </Button>
              {Object.entries(regionLabels).map(([key, label]) => (
                <Button
                  key={key}
                  variant={activeRegion === key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveRegion(activeRegion === key ? null : key)}
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Regime Cards */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <p className="text-sm text-muted-foreground mb-6">
            Showing {filtered.length} of {allEUSanctionsRegimes.length} sanctions regimes
          </p>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((regime) => (
              <Link
                key={regime.slug}
                to={`/eu-sanctions/${regime.slug}`}
                className="group border border-border rounded-xl p-5 hover:border-accent hover:shadow-lg transition-all bg-card"
              >
                <div className="flex items-start justify-between mb-3">
                  <h2 className="text-lg font-semibold text-foreground group-hover:text-accent transition-colors">
                    {regime.country}
                  </h2>
                  <Badge className={regionColors[regime.region]} variant="secondary">
                    {regionLabels[regime.region]}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{regime.description}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{regime.regimes.length} regime{regime.regimes.length > 1 ? "s" : ""}</span>
                  <span>{regime.regimes[0].adoptedBy}</span>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {regime.regimes[0].measures.slice(0, 3).map((m) => (
                    <span key={m} className="text-xs bg-muted rounded px-2 py-0.5">{m}</span>
                  ))}
                  {regime.regimes[0].measures.length > 3 && (
                    <span className="text-xs text-muted-foreground">+{regime.regimes[0].measures.length - 3} more</span>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16">
              <Globe className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No sanctions regimes match your search.</p>
            </div>
          )}
        </div>
      </section>

      {/* Source Attribution & CTA */}
      <section className="py-12 bg-muted/50 border-t border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Data sourced from the{" "}
            <a href="https://sanctionsmap.eu/#/main" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline inline-flex items-center gap-1">
              EU Sanctions Map <ExternalLink className="w-3 h-3" />
            </a>
            , maintained by the European Commission. This page is for informational purposes only and does not constitute legal advice.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Link to="/sanctions-check">
              <Button size="lg">
                <Shield className="w-4 h-4 mr-2" />
                Free Sanctions Check
              </Button>
            </Link>
            <Link to="/resources/sanctions-lists">
              <Button size="lg" variant="outline">
                View All Sanctions Lists
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default EUSanctionsMap;
