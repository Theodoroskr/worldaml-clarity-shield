import { Link } from "react-router-dom";
import { ArrowRight, Shield, Zap, Database } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LaneBadge } from "@/components/LaneBadge";

const features = [
  {
    icon: Zap,
    title: "Advanced Matching",
    description: "Sophisticated fuzzy matching algorithms to reduce false positives.",
  },
  {
    icon: Database,
    title: "Batch Processing",
    description: "Process large volumes of screenings efficiently.",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Bank-grade security with SOC 2 compliance.",
  },
];

const BridgerXGEUME = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="section-padding bg-surface-subtle">
          <div className="container-enterprise">
            <div className="max-w-3xl">
              <LaneBadge lane="data-source" className="mb-6" />
              <h1 className="text-navy mb-6">Bridger Insight XG® — EU & Middle East</h1>
              
              {/* Attribution Block */}
              <div className="bg-white border border-divider rounded-lg p-4 mb-8">
                <p className="text-body-sm text-text-secondary mb-1">
                  <strong>Powered by</strong> LexisNexis Risk Solutions
                </p>
                <p className="text-body-sm text-text-tertiary">
                  <strong>Delivered and implemented by</strong> Infocredit Group
                </p>
              </div>

              <p className="text-body-lg text-text-secondary mb-8">
                Enterprise-grade screening solution for EU and Middle East regulated institutions, 
                with dedicated implementation and support.
              </p>
              
              <Button asChild size="lg">
                <Link to="/get-started">
                  Request Demo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="section-padding bg-background">
          <div className="container-enterprise">
            <h2 className="text-2xl text-navy mb-8">Enterprise Features</h2>
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

        {/* CTA */}
        <section className="section-padding bg-surface-subtle">
          <div className="container-enterprise">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-2xl text-navy mb-4">Ready to Get Started?</h2>
              <p className="text-body text-text-secondary mb-6">
                Contact us to discuss your requirements and schedule a demo.
              </p>
              <Button asChild size="lg">
                <Link to="/get-started">
                  Request Demo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default BridgerXGEUME;
