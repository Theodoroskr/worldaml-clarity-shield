import { Link } from "react-router-dom";
import { ArrowRight, CreditCard, Search, Globe, AlertTriangle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LaneBadge } from "@/components/LaneBadge";

const features = [
  {
    icon: Search,
    title: "Sanctions Screening",
    description: "Global sanctions lists including OFAC, EU, UN, HMT, and regional watchlists.",
  },
  {
    icon: Globe,
    title: "PEP Screening",
    description: "Politically Exposed Persons across multiple jurisdictions and levels.",
  },
  {
    icon: AlertTriangle,
    title: "Adverse Media",
    description: "Negative news and high-risk media coverage from global sources.",
  },
];

const WorldComplianceUKIE = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="section-padding bg-surface-subtle">
          <div className="container-enterprise">
            <div className="max-w-3xl">
              <LaneBadge lane="data-source" className="mb-6" />
              <h1 className="text-navy mb-6">WorldCompliance® Online Screening — UK & Ireland</h1>
              
              {/* Attribution Block */}
              <div className="bg-white border border-divider rounded-lg p-4 mb-8">
                <p className="text-body-sm text-text-secondary mb-1">
                  <strong>Powered by</strong> LexisNexis Risk Solutions
                </p>
                <p className="text-body-sm text-text-tertiary">
                  <strong>Delivered and supported by</strong> Infocredit Group
                </p>
              </div>

              <p className="text-body-lg text-text-secondary mb-8">
                WorldCompliance® supports professional and regulated UK & Ireland users 
                with sanctions, PEP, and adverse media screening.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Button asChild size="lg">
                  <Link to="/get-started">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Buy WorldCompliance Online
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="section-padding bg-background">
          <div className="container-enterprise">
            <h2 className="text-2xl text-navy mb-8">Screening Coverage</h2>
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl">
              {features.map((feature) => (
                <Card key={feature.title} className="border-divider">
                  <CardHeader>
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-teal/5 text-teal mb-4">
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

        {/* Pricing Info */}
        <section className="section-padding bg-surface-subtle">
          <div className="container-enterprise">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-2xl text-navy mb-4">Pricing</h2>
              <p className="text-body text-text-secondary mb-6">
                GBP / EUR pricing available. Enhanced verification and contractual approval required.
              </p>
              <Button asChild>
                <Link to="/pricing">
                  View Pricing
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Disclaimer */}
        <section className="py-8 bg-white border-t border-divider">
          <div className="container-enterprise">
            <p className="text-body-sm text-text-tertiary text-center">
              Access subject to verification and contractual approval in line with applicable regulatory requirements.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default WorldComplianceUKIE;
