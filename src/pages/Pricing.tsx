import { Link } from "react-router-dom";
import { ArrowRight, Check, Layers, Database } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
              <p className="text-body-lg text-text-secondary mb-8">
                Pricing structure varies by product type and jurisdiction. 
                Select the relevant section below for details.
              </p>
              
              {/* Tabs */}
              <Tabs defaultValue="worldaml" className="w-full">
                <TabsList className="grid w-full max-w-lg mx-auto grid-cols-2 h-14 mb-8">
                  <TabsTrigger 
                    value="worldaml" 
                    className="flex items-center gap-2 data-[state=active]:bg-navy data-[state=active]:text-white"
                  >
                    <Layers className="w-4 h-4" />
                    <span className="hidden sm:inline">WorldAML Platform</span>
                    <span className="sm:hidden">WorldAML</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="lexisnexis"
                    className="flex items-center gap-2 data-[state=active]:bg-navy data-[state=active]:text-white"
                  >
                    <Database className="w-4 h-4" />
                    <span className="hidden sm:inline">LexisNexis Data</span>
                    <span className="sm:hidden">LexisNexis</span>
                  </TabsTrigger>
                </TabsList>

                {/* WorldAML Tab Content */}
                <TabsContent value="worldaml" className="mt-0">
                  <div className="bg-surface-subtle rounded-xl p-6 md:p-8 lg:p-10 text-left">
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

                    {/* Suite Pricing Note */}
                    <div className="mt-8 p-6 rounded-lg border border-divider bg-card">
                      <h3 className="text-lg font-semibold text-navy mb-2">WorldAML Suite</h3>
                      <p className="text-body-sm text-text-secondary mb-4">
                        WorldAML Suite is included with all API plans. Access the compliance interface 
                        to manage screenings, review cases, and generate reports.
                      </p>
                      <Button variant="outline" size="sm" asChild>
                        <Link to="/platform/suite">
                          Learn More About Suite
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>

                    {/* WorldID Pricing Note */}
                    <div className="mt-6 p-6 rounded-lg border border-divider bg-card">
                      <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-navy">WorldID</h3>
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-teal/10 text-teal">
                          Identity Verification
                        </span>
                      </div>
                      <p className="text-body-sm text-text-secondary mb-4">
                        Digital identity verification with document authentication, biometric liveness detection, 
                        and face matching. Starting from €1,800/year.
                      </p>
                      <Button variant="outline" size="sm" asChild>
                        <Link to="/products/worldid#pricing">
                          View WorldID Pricing
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                {/* LexisNexis Tab Content */}
                <TabsContent value="lexisnexis" className="mt-0">
                  <div className="bg-surface-subtle rounded-xl p-6 md:p-8 lg:p-10 text-left">
                    <div className="flex items-center gap-3 mb-6 flex-wrap">
                      <LaneBadge lane="data-source" />
                      <span className="text-xs font-medium px-2 py-1 rounded bg-slate-100 text-slate-600">
                        Powered by LexisNexis Risk Solutions
                      </span>
                    </div>
                    <h2 className="text-2xl text-navy mb-4">LexisNexis Data Products</h2>
                    <p className="text-body text-text-secondary mb-8">
                      Screening data and matching engines are provided by LexisNexis Risk Solutions. 
                      Pricing varies by product, region, and volume.
                    </p>

                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                      {/* WorldCompliance */}
                      <Card className="border-l-4 border-l-teal border-divider">
                        <CardHeader>
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <CardTitle>WorldCompliance®</CardTitle>
                            <span className="text-xs font-medium px-2 py-1 rounded-full bg-teal/10 text-teal">
                              Online Purchase
                            </span>
                          </div>
                          <CardDescription>
                            Search-based screening for individuals and companies across global sanctions, PEPs, and adverse media.
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 mb-6">
                            <div className="flex items-center justify-between text-body-sm">
                              <span className="text-text-secondary">EU & Middle East</span>
                              <span className="text-navy font-medium">EUR / AED</span>
                            </div>
                            <div className="flex items-center justify-between text-body-sm">
                              <span className="text-text-secondary">UK & Ireland</span>
                              <span className="text-navy font-medium">GBP / EUR</span>
                            </div>
                            <div className="flex items-center justify-between text-body-sm">
                              <span className="text-text-secondary">North America</span>
                              <span className="text-navy font-medium">USD</span>
                            </div>
                          </div>
                          <Button variant="outline" asChild className="w-full">
                            <Link to="/data-sources/worldcompliance/pricing">
                              View Regional Pricing
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                          </Button>
                        </CardContent>
                      </Card>

                      {/* Bridger Insight XG */}
                      <Card className="border-l-4 border-l-navy border-divider">
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
                            Pricing is provided on request. Enterprise deployment includes dedicated implementation support and custom SLAs.
                          </p>
                          <Button variant="outline" asChild className="w-full">
                            <Link to="/contact-sales">
                              Contact Sales
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                          </Button>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Data Source Attribution */}
                    <div className="p-4 rounded-lg bg-white border border-divider">
                      <p className="text-body-sm text-text-tertiary text-center">
                        WorldCompliance® and Bridger Insight XG® are products of LexisNexis Risk Solutions. 
                        Delivered and supported by Infocredit Group.
                      </p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </section>

        {/* Disclaimer */}
        <section className="py-8 bg-navy">
          <div className="container-enterprise">
            <p className="text-body-sm text-slate-light text-center max-w-3xl mx-auto">
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
                <Link to="/contact-sales">
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
