import { Link } from "react-router-dom";
import { ArrowRight, Workflow, Shield, FileSearch, BarChart3 } from "lucide-react";
import SEO from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LaneBadge } from "@/components/LaneBadge";

const capabilities = [
  {
    icon: Workflow,
    title: "Workflow Orchestration",
    description: "Design and automate screening workflows across multiple data sources.",
  },
  {
    icon: Shield,
    title: "Access Control & Governance",
    description: "Role-based access control and policy enforcement for compliance teams.",
  },
  {
    icon: FileSearch,
    title: "Audit Trails",
    description: "Complete audit logging of all screening activities and decisions.",
  },
  {
    icon: BarChart3,
    title: "Reporting",
    description: "Comprehensive reporting and analytics for regulatory requirements.",
  },
];

const Platform = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Platform Overview"
        description="WorldAML platform provides unified UI and API layer for orchestrating financial crime screening workflows using approved third-party data sources."
        canonical="/platform"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Platform", url: "/platform" },
        ]}
      />
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="section-padding bg-surface-subtle">
          <div className="container-enterprise">
            <div className="max-w-3xl">
              <LaneBadge lane="platform" className="mb-6" />
              <h1 className="text-navy mb-6">WorldAML Platform</h1>
              <p className="text-body-lg text-text-secondary mb-8">
                WorldAML is a technology platform that provides a unified interface and API layer 
                to orchestrate financial crime screening workflows using approved third-party data sources.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild size="lg">
                  <Link to="/get-started">
                    Request Access
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/platform/api">View API Documentation</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Capabilities */}
        <section className="section-padding bg-background">
          <div className="container-enterprise">
            <h2 className="text-2xl text-navy mb-8">Platform Capabilities</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {capabilities.map((cap) => (
                <Card key={cap.title} className="border-divider">
                  <CardHeader>
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-navy/5 text-navy mb-4">
                      <cap.icon className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-lg">{cap.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{cap.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Disclaimer */}
        <section className="py-8 bg-surface-subtle border-t border-divider">
          <div className="container-enterprise">
            <p className="text-body-sm text-text-tertiary text-center">
              <strong>Important:</strong> WorldAML does not own or generate sanctions, PEP, or adverse media data. 
              Screening results are produced by integrated third-party data sources.
            </p>
          </div>
        </section>

        {/* Product Links */}
        <section className="section-padding bg-background">
          <div className="container-enterprise">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
              <Card className="border-divider hover:border-navy/20 transition-colors">
                <CardHeader>
                  <CardTitle>WorldAML Suite</CardTitle>
                  <CardDescription>
                    Complete compliance platform for screening workflows, case reviews, and reporting.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" asChild className="w-full">
                    <Link to="/platform/suite">
                      Explore Suite
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
              <Card className="border-divider hover:border-navy/20 transition-colors">
                <CardHeader>
                  <CardTitle>WorldAML API</CardTitle>
                  <CardDescription>
                    Programmatic access to screening workflows through a unified integration layer.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" asChild className="w-full">
                    <Link to="/platform/api">
                      Explore API
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
              <Card className="border-divider hover:border-navy/20 transition-colors">
                <CardHeader>
                  <CardTitle>Transaction Monitoring</CardTitle>
                  <CardDescription>
                    Real-time AML transaction screening with rule-based alerts, typology detection, and SAR workflow.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" asChild className="w-full">
                    <Link to="/platform/transaction-monitoring">
                      Explore TM
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
              <Card className="border-divider hover:border-navy/20 transition-colors">
                <CardHeader>
                  <CardTitle>Regulatory Reporting</CardTitle>
                  <CardDescription>
                    Automated CRS, FATCA, and FINTRAC reporting — from account classification to filed submission.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" asChild className="w-full">
                    <Link to="/platform/regulatory-reporting">
                      Explore RR
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Platform;
