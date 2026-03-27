import { useMemo } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { ArrowLeft, Shield, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SEO from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { coverageData, categorizeSource } from "@/data/worldComplianceSources";

const DataCoverageCountry = () => {
  const { country } = useParams<{ country: string }>();

  const data = country ? coverageData[country] : undefined;

  const groupedSources = useMemo(() => {
    if (!data) return {};
    const groups: Record<string, string[]> = {};
    data.sources.forEach((source) => {
      const cat = categorizeSource(source);
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(source);
    });
    // Sort categories
    const order = ["Financial Regulators", "Law Enforcement", "Courts & Prosecutors", "Sanctions Lists", "PEP Data", "Tax & Revenue", "Competition Authorities", "Regulatory Bodies"];
    const sorted: Record<string, string[]> = {};
    order.forEach((key) => {
      if (groups[key]) sorted[key] = groups[key].sort();
    });
    Object.keys(groups).forEach((key) => {
      if (!sorted[key]) sorted[key] = groups[key].sort();
    });
    return sorted;
  }, [data]);

  if (!data) {
    return <Navigate to="/data-coverage" replace />;
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: `AML Screening Coverage — ${data.country}`,
    description: `WorldAML regulatory screening coverage for ${data.country}, including financial regulators, law enforcement, sanctions lists, and PEP data.`,
    creator: {
      "@type": "Organization",
      name: "WorldAML",
      url: "https://www.worldaml.com",
    },
    spatialCoverage: data.country,
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title={`AML Screening Coverage — ${data.country}`}
        description={`Explore WorldAML's AML screening sources for ${data.country}. View financial regulators, law enforcement agencies, sanctions lists, PEP data, and more.`}
        canonical={`/data-coverage/${country}`}
        structuredData={structuredData}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Data Coverage", url: "/data-coverage" },
          { name: data.country, url: `/data-coverage/${country}` },
        ]}
      />

      {/* Hero */}
      <section className="bg-navy text-white py-12 md:py-16">
        <div className="container-enterprise">
          <Link
            to="/data-coverage"
            className="inline-flex items-center gap-1.5 text-body-sm text-white/60 hover:text-white/90 transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            All Jurisdictions
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <Badge variant="outline" className="border-white/30 text-white/80">
              {data.region}
            </Badge>
          </div>
          <h1 className="text-display-sm md:text-display-md font-bold mb-3">
            {data.country}
          </h1>
          <p className="text-body-lg text-white/70 max-w-2xl">
            WorldAML's regulatory screening coverage for {data.country}, spanning financial regulators, law enforcement agencies, sanctions authorities, and more.
          </p>
        </div>
      </section>

      {/* Sources */}
      <section className="py-12 md:py-16">
        <div className="container-enterprise">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-8">
              {Object.entries(groupedSources).map(([category, sources]) => (
                <div key={category}>
                  <div className="flex items-center gap-2 mb-4">
                    <Shield className="h-5 w-5 text-navy" />
                    <h2 className="text-heading-sm font-semibold text-navy">
                      {category}
                    </h2>
                  </div>
                  <div className="border border-divider rounded-lg divide-y divide-divider">
                    {sources.map((source) => (
                      <div
                        key={source}
                        className="flex items-start gap-3 px-4 py-3"
                      >
                        <CheckCircle className="h-4 w-4 text-teal shrink-0 mt-0.5" />
                        <span className="text-body-sm text-text-primary">
                          {source}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Sidebar CTA */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                <div className="border border-divider rounded-lg p-6 bg-surface-subtle">
                  <h3 className="text-heading-sm font-semibold text-navy mb-3">
                    Screen against {data.country} sources
                  </h3>
                  <p className="text-body-sm text-text-secondary mb-5">
                    Get access to comprehensive screening coverage for {data.country} and 200+ other jurisdictions through the WorldAML platform.
                  </p>
                  <div className="space-y-3">
                    <Button className="w-full" asChild>
                      <Link to="/contact-sales">Book a Demo</Link>
                    </Button>
                    <Button variant="outline" className="w-full" asChild>
                      <Link to="/free-aml-check">Run a Free AML Check</Link>
                    </Button>
                  </div>
                </div>

                <div className="border border-divider rounded-lg p-6">
                  <h3 className="text-body font-semibold text-navy mb-3">
                    Related Jurisdictions
                  </h3>
                  <div className="space-y-2">
                    {Object.entries(coverageData)
                      .filter(
                        ([key, d]) =>
                          d.region === data.region && key !== country
                      )
                      .slice(0, 5)
                      .map(([key, d]) => (
                        <Link
                          key={key}
                          to={`/data-coverage/${key}`}
                          className="block text-body-sm text-teal hover:text-teal-dark transition-colors"
                        >
                          {d.country}
                        </Link>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-navy text-white py-16">
        <div className="container-enterprise text-center">
          <h2 className="text-heading-md md:text-heading-lg font-bold mb-4">
            Ready to screen against {data.country} regulatory sources?
          </h2>
          <p className="text-body-lg text-white/70 max-w-xl mx-auto mb-8">
            Get started with WorldAML's unified compliance platform — covering sanctions, PEPs, adverse media, and more.
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
    </>
  );
};

export default DataCoverageCountry;
