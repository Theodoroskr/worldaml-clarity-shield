import { Link } from "react-router-dom";
import { ArrowRight, MapPin, Globe } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRegion } from "@/contexts/RegionContext";

const regions = [
  {
    id: "eu-me",
    name: "EU & Middle East",
    description: "EUR / AED pricing. Services delivered by Infocredit Group across the European Union and Middle East region.",
    href: "/regions/eu-me",
    currencies: ["EUR", "AED"],
  },
  {
    id: "uk-ie",
    name: "UK & Ireland",
    description: "GBP / EUR pricing. Services subject to UK and Irish regulatory requirements.",
    href: "/regions/uk-ie",
    currencies: ["GBP", "EUR"],
  },
  {
    id: "na",
    name: "North America",
    description: "USD pricing. Services subject to US and Canadian regulatory requirements.",
    href: "/regions/na",
    currencies: ["USD"],
  },
];

const Regions = () => {
  const { region } = useRegion();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="section-padding bg-surface-subtle">
          <div className="container-enterprise">
            <div className="max-w-3xl">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-navy/5 text-navy mb-6">
                <Globe className="w-6 h-6" />
              </div>
              <h1 className="text-navy mb-6">LexisNexis Data Sources — Regional Pricing</h1>
              <p className="text-body-lg text-text-secondary">
                Regional pricing and currency options for LexisNexis Risk Solutions data sources 
                (WorldCompliance® and Bridger Insight XG®). Delivered and supported by Infocredit Group.
              </p>
              <p className="text-body-sm text-text-tertiary mt-4">
                Note: Regional selection applies only to LexisNexis data source pricing. 
                The WorldAML Platform is available globally without regional restrictions.
              </p>
            </div>
          </div>
        </section>

        {/* Region Selection */}
        <section className="section-padding bg-background">
          <div className="container-enterprise">
            <h2 className="text-2xl text-navy mb-8">Select Region for LexisNexis Pricing</h2>
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl">
              {regions.map((r) => (
                <Card 
                  key={r.id} 
                  className={`border-divider hover:border-navy/30 transition-colors ${
                    r.id === region ? "ring-2 ring-navy/20" : ""
                  }`}
                >
                  <CardHeader>
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-navy/5 text-navy mb-4">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-lg">{r.name}</CardTitle>
                    {r.id === region && (
                      <span className="text-xs text-navy bg-navy/10 px-2 py-1 rounded-full w-fit">
                        Your detected region
                      </span>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <CardDescription>{r.description}</CardDescription>
                    <div className="flex gap-2">
                      {r.currencies.map((currency) => (
                        <span 
                          key={currency} 
                          className="text-xs bg-surface-subtle px-2 py-1 rounded text-text-secondary"
                        >
                          {currency}
                        </span>
                      ))}
                    </div>
                    <Button variant="outline" asChild className="w-full">
                      <Link to={r.href}>
                        View Region Details
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Disclaimer */}
        <section className="section-padding bg-surface-subtle">
          <div className="container-enterprise">
            <div className="bg-white border border-divider rounded-lg p-6 max-w-3xl">
              <p className="text-body-sm text-text-tertiary">
                <strong>Important:</strong> Regional pricing applies to LexisNexis data sources 
                (WorldCompliance® and Bridger Insight XG®) only. The WorldAML Platform and API 
                are available globally. Some products may require verification, eligibility 
                assessment, or contractual approval before access can be granted.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Regions;
