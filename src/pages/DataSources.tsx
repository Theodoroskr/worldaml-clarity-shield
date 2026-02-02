import { Link } from "react-router-dom";
import { ArrowRight, Database, Shield } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LaneBadge } from "@/components/LaneBadge";
import lexisNexisLogo from "@/assets/lexisnexis-risk-solutions-logo.png";

const dataSources = [
  {
    id: "worldcompliance",
    name: "WorldCompliance®",
    description: "Search-based screening for individuals and companies across global sanctions, PEPs, and adverse media.",
    icon: Database,
    href: "/data-sources/worldcompliance",
  },
  {
    id: "bridger-xg",
    name: "Bridger Insight XG®",
    description: "Enterprise-grade screening solution with advanced matching algorithms and batch processing.",
    icon: Shield,
    href: "/data-sources/bridger-xg",
  },
];

const DataSources = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="section-padding bg-surface-subtle">
          <div className="container-enterprise">
            <div className="max-w-3xl">
              <LaneBadge lane="data-source" className="mb-6" />
              <div className="flex items-center gap-4 mb-6">
                <h1 className="text-navy">Data Sources</h1>
                <img src={lexisNexisLogo} alt="LexisNexis Risk Solutions" className="h-10 object-contain" />
              </div>
              <p className="text-body-lg text-text-secondary mb-8">
                WorldAML connects regulated institutions to trusted financial crime screening solutions. 
                Data sources remain attributed to their respective providers and are accessed through 
                the WorldAML platform and APIs.
              </p>
            </div>
          </div>
        </section>

        {/* Data Source Cards */}
        <section className="section-padding bg-background">
          <div className="container-enterprise">
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl">
              {dataSources.map((source) => (
                <Card key={source.id} className="border-teal/20 hover:border-teal/30 transition-colors">
                  <CardHeader>
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-teal/5 text-teal mb-4">
                      <source.icon className="w-6 h-6" />
                    </div>
                    <div className="inline-flex items-center gap-2 mb-2">
                      <span className="text-xs font-medium px-2 py-1 rounded-full border border-teal/20 bg-teal/5 text-teal">
                        Data Source: LexisNexis
                      </span>
                    </div>
                    <CardTitle className="text-xl text-navy">{source.name}</CardTitle>
                    <CardDescription className="text-text-secondary">
                      {source.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" asChild className="w-full">
                      <Link to={source.href}>
                        Learn More
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Attribution */}
        <section className="py-8 bg-surface-subtle border-t border-divider">
          <div className="container-enterprise">
            <div className="text-center">
              <p className="text-body-sm text-text-secondary mb-2">
                <strong>Powered by</strong> LexisNexis Risk Solutions
              </p>
              <p className="text-body-sm text-text-tertiary">
                <strong>Delivered and supported by</strong> Infocredit Group
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default DataSources;
