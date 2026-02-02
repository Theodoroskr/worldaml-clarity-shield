import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { LaneBadge } from "@/components/LaneBadge";

const apiPlans = [
  {
    name: "Starter",
    price: "€99",
    period: "/month",
    description: "For startups and small businesses",
    features: [
      "Up to 2,000 monitored entities",
      "Full API access",
      "Ongoing monitoring included",
      "Email support",
    ],
    highlight: false,
  },
  {
    name: "Compliance",
    price: "€495",
    period: "/month",
    description: "For growing regulated businesses",
    features: [
      "Up to 10,000 monitored entities",
      "Enhanced monitoring",
      "Priority support",
      "Custom webhooks",
    ],
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For large-scale operations",
    features: [
      "Unlimited monitored entities",
      "Dedicated account manager",
      "SLA guarantees",
      "Custom integrations",
    ],
    highlight: false,
  },
];

const Pricing = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="section-padding bg-background">
          <div className="container-enterprise">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-navy mb-6">Pricing</h1>
              <p className="text-body-lg text-text-secondary">
                Pricing structure varies by product type and jurisdiction. 
                Select the relevant section below for details.
              </p>
            </div>
          </div>
        </section>

        {/* Section 1: WorldAML Platform & API */}
        <section className="section-padding bg-surface-subtle">
          <div className="container-enterprise">
            <div className="max-w-4xl mx-auto">
              <LaneBadge lane="platform" className="mb-6" />
              <h2 className="text-2xl text-navy mb-4">WorldAML API Pricing</h2>
              <p className="text-body text-text-secondary mb-8">
                Simple, transparent pricing with annual billing. All plans include full API access 
                and audit-ready screening reports. Unused checks roll over within your subscription period.
              </p>
              
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                {apiPlans.map((plan) => (
                  <Card 
                    key={plan.name} 
                    className={`relative ${plan.highlight ? 'border-teal border-2 shadow-lg' : 'border-divider'}`}
                  >
                    {plan.highlight && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="bg-teal text-white text-xs font-medium px-3 py-1 rounded-full">
                          Most Popular
                        </span>
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle className="text-navy">{plan.name}</CardTitle>
                      <CardDescription>{plan.description}</CardDescription>
                      <div className="mt-4">
                        <span className="text-3xl font-bold text-navy">{plan.price}</span>
                        <span className="text-text-secondary">{plan.period}</span>
                        {plan.price !== "Custom" && (
                          <p className="text-caption text-text-tertiary mt-1">billed annually</p>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3 mb-6">
                        {plan.features.map((feature) => (
                          <li key={feature} className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-teal flex-shrink-0 mt-0.5" />
                            <span className="text-body-sm text-text-secondary">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <Button 
                        asChild 
                        className="w-full"
                        variant={plan.highlight ? "default" : "outline"}
                      >
                        <Link to="/get-started">
                          {plan.price === "Custom" ? "Contact Sales" : "Get Started"}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="p-4 rounded-lg bg-navy/5 border border-navy/10 text-center">
                <p className="text-body-sm text-text-secondary">
                  <span className="font-semibold text-navy">Usage Rollover:</span> Unused checks 
                  roll over month-to-month within the same 12-month subscription period and expire 
                  at the end of the term.
                </p>
              </div>
            </div>
          </div>
        </section>

        <Separator className="mx-auto max-w-3xl" />

        {/* Section 2: Data Sources */}
        <section className="section-padding bg-background">
          <div className="container-enterprise">
            <div className="max-w-3xl mx-auto">
              <LaneBadge lane="data-source" className="mb-6" />
              <h2 className="text-2xl text-navy mb-4">Data Sources</h2>
              <p className="text-body text-text-secondary mb-8">
                Screening data is provided by LexisNexis Risk Solutions. 
                Pricing varies by product and region.
              </p>

              <div className="space-y-6">
                {/* WorldCompliance */}
                <Card className="border-teal/20">
                  <CardHeader>
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <CardTitle>WorldCompliance®</CardTitle>
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-teal/10 text-teal">
                        Online Purchase Available
                      </span>
                    </div>
                    <CardDescription>
                      Search-based screening for individuals and companies across global sanctions, PEPs, and adverse media.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid sm:grid-cols-3 gap-4 mb-6">
                      <div className="p-4 rounded-lg bg-surface-subtle">
                        <p className="text-body-sm font-medium text-navy mb-1">EU & Middle East</p>
                        <p className="text-caption text-text-tertiary">EUR / AED pricing</p>
                      </div>
                      <div className="p-4 rounded-lg bg-surface-subtle">
                        <p className="text-body-sm font-medium text-navy mb-1">UK & Ireland</p>
                        <p className="text-caption text-text-tertiary">GBP / EUR pricing</p>
                      </div>
                      <div className="p-4 rounded-lg bg-surface-subtle">
                        <p className="text-body-sm font-medium text-navy mb-1">North America</p>
                        <p className="text-caption text-text-tertiary">USD pricing</p>
                      </div>
                    </div>
                    <Button variant="outline" asChild className="w-full sm:w-auto">
                      <Link to="/data-sources/worldcompliance">
                        View Regional Pricing
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>

                {/* Bridger Insight XG */}
                <Card className="border-teal/20">
                  <CardHeader>
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <CardTitle>Bridger Insight XG®</CardTitle>
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-navy/10 text-navy">
                        Enterprise Only
                      </span>
                    </div>
                    <CardDescription>
                      Enterprise-grade screening solution with advanced matching algorithms and batch processing.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-body-sm text-text-secondary mb-6">
                      Pricing is provided on request. Enterprise deployment includes dedicated implementation support.
                    </p>
                    <Button variant="outline" asChild className="w-full sm:w-auto">
                      <Link to="/data-sources/bridger-xg">
                        Request Demo
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Disclaimer */}
        <section className="py-8 bg-surface-subtle border-t border-divider">
          <div className="container-enterprise">
            <p className="text-body-sm text-text-tertiary text-center max-w-3xl mx-auto">
              Pricing, availability, and service scope vary by jurisdiction and delivery entity. 
              Contact us for a detailed quote based on your specific requirements.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="section-padding bg-background">
          <div className="container-enterprise">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl text-navy mb-4">Have Questions?</h2>
              <p className="text-body text-text-secondary mb-8">
                Our team is ready to help you find the right solution for your compliance needs.
              </p>
              <Button asChild size="lg">
                <Link to="/get-started">
                  Contact Sales
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

export default Pricing;
