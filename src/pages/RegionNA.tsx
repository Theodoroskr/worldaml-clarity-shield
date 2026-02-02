import { Link } from "react-router-dom";
import { ArrowRight, MapPin, Building2, Database } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const RegionNA = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="section-padding bg-surface-subtle">
          <div className="container-enterprise">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 text-navy mb-4">
                <MapPin className="w-5 h-5" />
                <span className="text-sm font-medium">North America</span>
              </div>
              <h1 className="text-navy mb-6">WorldAML Services — North America</h1>
              <p className="text-body-lg text-text-secondary mb-6">
                WorldAML services are available to regulated institutions in the United States 
                and Canada, delivered and supported by Infocredit Group.
              </p>
              <div className="flex gap-3">
                <span className="text-sm bg-navy/5 px-3 py-1 rounded-full text-navy">USD</span>
              </div>
            </div>
          </div>
        </section>

        {/* Available Products */}
        <section className="section-padding bg-background">
          <div className="container-enterprise">
            <h2 className="text-2xl text-navy mb-8">Available Products & Services</h2>
            
            {/* Platform Section */}
            <div className="mb-12">
              <h3 className="text-lg text-navy mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                WorldAML Platform
              </h3>
              <div className="grid md:grid-cols-2 gap-6 max-w-4xl">
                <Card className="border-divider">
                  <CardHeader>
                    <CardTitle className="text-lg">WorldAML Suite</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <CardDescription>
                      Unified screening workflow management and case handling for regulated institutions.
                    </CardDescription>
                    <Button variant="outline" asChild size="sm">
                      <Link to="/platform/suite">
                        Learn More
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
                <Card className="border-divider">
                  <CardHeader>
                    <CardTitle className="text-lg">WorldAML API</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <CardDescription>
                      Programmatic access to screening workflows and approved data sources.
                    </CardDescription>
                    <Button variant="outline" asChild size="sm">
                      <Link to="/platform/api">
                        Learn More
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Data Sources Section */}
            <div>
              <h3 className="text-lg text-navy mb-4 flex items-center gap-2">
                <Database className="w-5 h-5" />
                Data Sources
              </h3>
              <div className="grid md:grid-cols-2 gap-6 max-w-4xl">
                <Card className="border-divider">
                  <CardHeader>
                    <div className="text-xs text-teal-dark mb-2">Data Source: LexisNexis</div>
                    <CardTitle className="text-lg">WorldCompliance®</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <CardDescription>
                      Search-based screening for sanctions, PEPs, and adverse media. 
                      Online subscription packages available in USD. Eligibility assessment required.
                    </CardDescription>
                    <Button variant="outline" asChild size="sm">
                      <Link to="/data-sources/worldcompliance/na">
                        View Pricing
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
                <Card className="border-divider">
                  <CardHeader>
                    <div className="text-xs text-teal-dark mb-2">Data Source: LexisNexis</div>
                    <CardTitle className="text-lg">Bridger Insight XG®</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <CardDescription>
                      Enterprise-grade screening and risk scoring for high-volume environments. 
                      Available on request.
                    </CardDescription>
                    <Button variant="outline" asChild size="sm">
                      <Link to="/data-sources/bridger-xg/na">
                        Contact Sales
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Regulatory Note */}
        <section className="section-padding bg-surface-subtle">
          <div className="container-enterprise">
            <div className="bg-white border border-divider rounded-lg p-6 max-w-3xl">
              <h3 className="text-lg text-navy mb-4">Regulatory Considerations</h3>
              <p className="text-body-sm text-text-secondary mb-4">
                Services provided in North America are subject to applicable regulatory 
                requirements, including OFAC, FinCEN, and FINTRAC guidance on financial 
                crime prevention.
              </p>
              <p className="text-body-sm text-text-tertiary">
                <strong>Important:</strong> Availability is subject to suitability assessment 
                and contractual approval. Some services may have restricted availability 
                based on regulatory considerations.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="section-padding bg-navy">
          <div className="container-enterprise text-center">
            <h2 className="text-2xl text-white mb-4">Get Started in North America</h2>
            <p className="text-white/80 mb-8 max-w-2xl mx-auto">
              Contact our regional team to discuss your requirements and receive 
              jurisdiction-specific guidance.
            </p>
            <Button variant="secondary" size="lg" asChild>
              <Link to="/get-started">Contact Sales</Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default RegionNA;
