import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Search, Globe, Shield, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SEO from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { coverageData, regions, type Region, categorizeSource } from "@/data/worldComplianceSources";

const DataCoverageIndex = () => {
  const [search, setSearch] = useState("");
  const [activeRegion, setActiveRegion] = useState<Region>("All");

  const countries = useMemo(() => {
    return Object.entries(coverageData)
      .map(([slug, data]) => {
        const categories = [...new Set(data.sources.map(categorizeSource))];
        return { slug, ...data, categories };
      })
      .filter((c) => {
        const matchSearch = c.country.toLowerCase().includes(search.toLowerCase());
        const matchRegion = activeRegion === "All" || c.region === activeRegion;
        return matchSearch && matchRegion;
      })
      .sort((a, b) => a.country.localeCompare(b.country));
  }, [search, activeRegion]);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "DataCatalog",
    name: "WorldAML Global Regulatory & Screening Coverage",
    description:
      "WorldAML screens against regulatory bodies, sanctions authorities, law enforcement agencies, and financial supervisors across 200+ jurisdictions.",
    publisher: {
      "@type": "Organization",
      name: "WorldAML",
      url: "https://www.worldaml.com",
    },
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Global AML Screening Data Coverage"
        description="Explore WorldAML's global screening coverage across 200+ jurisdictions. View sanctions lists, PEP data, and financial regulators by country."
        canonical="/data-coverage"
        structuredData={structuredData}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Data Coverage", url: "/data-coverage" },
        ]}
      />
      <Header />
      <main className="flex-1">

      {/* Hero */}
      <section className="bg-navy text-white py-16 md:py-24">
        <div className="container-enterprise text-center">
          <Badge variant="outline" className="border-white/30 text-white/80 mb-6">
            <Globe className="h-3 w-3 mr-1" />
            200+ Jurisdictions
          </Badge>
          <h1 className="text-display-sm md:text-display-md font-bold mb-4">
            Global Regulatory & Screening Coverage
          </h1>
          <p className="text-body-lg text-white/70 max-w-2xl mx-auto mb-8">
            WorldAML screens against regulatory bodies, sanctions authorities, law enforcement agencies, and financial supervisors worldwide — giving your compliance team the depth and breadth to make confident decisions.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="accent" size="lg" asChild>
              <Link to="/contact-sales">Book a Demo</Link>
            </Button>
            <Button variant="outline-light" size="lg" asChild>
              <Link to="/free-aml-check">Run a Free AML Check</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Search & Filter */}
      <section className="py-8 border-b border-divider bg-surface-subtle">
        <div className="container-enterprise">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
              <Input
                placeholder="Search jurisdictions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {regions.map((r) => (
                <button
                  key={r}
                  onClick={() => setActiveRegion(r)}
                  className={`px-4 py-2 rounded-md text-body-sm font-medium transition-colors ${
                    activeRegion === r
                      ? "bg-navy text-white"
                      : "bg-background text-text-secondary hover:bg-secondary"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Country Grid */}
      <section className="py-12 md:py-16">
        <div className="container-enterprise">
          <p className="text-body-sm text-text-tertiary mb-6">
            {countries.length} jurisdiction{countries.length !== 1 ? "s" : ""} found
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {countries.map((c) => (
              <Link
                key={c.slug}
                to={`/data-coverage/${c.slug}`}
                className="group border border-divider rounded-lg p-5 hover:border-navy/30 hover:shadow-md transition-all bg-background"
              >
                <div className="flex items-start justify-between mb-3">
                  <h2 className="text-body font-semibold text-navy group-hover:text-navy-light transition-colors">
                    {c.country}
                  </h2>
                  <ArrowRight className="h-4 w-4 text-text-tertiary group-hover:text-navy transition-colors shrink-0 mt-0.5" />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {c.categories.slice(0, 3).map((cat) => (
                    <Badge key={cat} variant="secondary" className="text-caption">
                      {cat}
                    </Badge>
                  ))}
                  {c.categories.length > 3 && (
                    <Badge variant="secondary" className="text-caption">
                      +{c.categories.length - 3}
                    </Badge>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {countries.length === 0 && (
            <div className="text-center py-16">
              <Shield className="h-12 w-12 text-text-tertiary mx-auto mb-4" />
              <p className="text-body text-text-secondary">No jurisdictions match your search.</p>
            </div>
          )}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-navy text-white py-16">
        <div className="container-enterprise text-center">
          <h2 className="text-heading-md md:text-heading-lg font-bold mb-4">
            Need coverage in a specific jurisdiction?
          </h2>
          <p className="text-body-lg text-white/70 max-w-xl mx-auto mb-8">
            Talk to our team about tailored screening packages for your regulatory environment.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="accent" size="lg" asChild>
              <Link to="/contact-sales">Contact Sales</Link>
            </Button>
            <Button variant="outline-light" size="lg" asChild>
              <Link to="/free-aml-check">Try a Free AML Check</Link>
            </Button>
          </div>
        </div>
      </section>
      </main>
      <Footer />
    </div>
  );
};

export default DataCoverageIndex;
