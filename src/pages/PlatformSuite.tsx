import { Link } from "react-router-dom";
import { ArrowRight, Users, FileCheck, BarChart3, Settings } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LaneBadge } from "@/components/LaneBadge";

const features = [
  {
    icon: Users,
    title: "Screening Workflow Management",
    description: "Streamlined workflows for individual and corporate screening processes.",
  },
  {
    icon: FileCheck,
    title: "Case Handling",
    description: "Efficient case management with assignment, escalation, and resolution tracking.",
  },
  {
    icon: BarChart3,
    title: "Reporting & Audit Logs",
    description: "Comprehensive reporting for regulatory compliance and internal audits.",
  },
  {
    icon: Settings,
    title: "Governance Controls",
    description: "Configurable rules, thresholds, and approval workflows.",
  },
];

const PlatformSuite = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="section-padding bg-surface-subtle">
          <div className="container-enterprise">
            <div className="max-w-3xl">
              <LaneBadge lane="platform" className="mb-6" />
              <h1 className="text-navy mb-6">WorldAML Suite</h1>
              <p className="text-body-lg text-text-secondary mb-8">
                WorldAML Suite enables regulated institutions to manage screening workflows, 
                case reviews, and reporting across approved data sources.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild size="lg">
                  <Link to="/get-started">
                    Request Demo
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <a href="https://suite.worldaml.com" target="_blank" rel="noopener noreferrer">
                    Access Suite
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="section-padding bg-background">
          <div className="container-enterprise">
            <h2 className="text-2xl text-navy mb-8">Suite Features</h2>
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl">
              {features.map((feature) => (
                <Card key={feature.title} className="border-divider">
                  <CardHeader>
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-navy/5 text-navy mb-4">
                      <feature.icon className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{feature.description}</CardDescription>
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
              Screening results are produced by integrated third-party data sources.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default PlatformSuite;
