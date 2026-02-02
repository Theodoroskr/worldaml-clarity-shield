import { Link } from "react-router-dom";
import { ArrowRight, MapPin } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LaneBadge } from "@/components/LaneBadge";
import { useRegion } from "@/contexts/RegionContext";

const regions = [
  {
    id: "eu-me",
    name: "EU & Middle East",
    description: "EUR / AED pricing. Subscription packages by search volume.",
    href: "/data-sources/worldcompliance/eu-me",
  },
  {
    id: "uk-ie",
    name: "UK & Ireland",
    description: "GBP / EUR pricing. Enhanced verification required.",
    href: "/data-sources/worldcompliance/uk-ie",
  },
  {
    id: "na",
    name: "North America",
    description: "USD pricing. Eligibility assessment required.",
    href: "/data-sources/worldcompliance/na",
  },
];

const WorldCompliance = () => {
  const { region } = useRegion();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="section-padding bg-surface-subtle">
          <div className="container-enterprise">
            <div className="max-w-3xl">
              <LaneBadge lane="data-source" className="mb-6" />
              <h1 className="text-navy mb-6">WorldCompliance®</h1>
              
              {/* Attribution Block */}
              <div className="bg-white border border-divider rounded-lg p-4 mb-8">
                <p className="text-body-sm text-text-secondary mb-1">
                  <strong>Powered by</strong> LexisNexis Risk Solutions
                </p>
                <p className="text-body-sm text-text-tertiary">
                  <strong>Delivered and supported by</strong> Infocredit Group
                </p>
              </div>

              <p className="text-body-lg text-text-secondary">
                Search-based screening for individuals and companies across global sanctions, 
                PEPs, and adverse media. Select your region below for pricing and availability.
              </p>
            </div>
          </div>
        </section>

        {/* Region Selection */}
        <section className="section-padding bg-background">
          <div className="container-enterprise">
            <h2 className="text-2xl text-navy mb-8">Select Your Region</h2>
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl">
              {regions.map((r) => (
                <Card 
                  key={r.id} 
                  className={`border-divider hover:border-teal/30 transition-colors ${
                    r.id === region ? "ring-2 ring-teal/30" : ""
                  }`}
                >
                  <CardHeader>
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-teal/5 text-teal mb-4">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-lg">{r.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <CardDescription>{r.description}</CardDescription>
                    <Button variant="outline" asChild className="w-full">
                      <Link to={r.href}>
                        View Details
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default WorldCompliance;
