import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Check, Layers, Database, Fingerprint } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LaneBadge } from "@/components/LaneBadge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import WorldCompliancePricingCalculator from "@/components/pricing/WorldCompliancePricingCalculator";

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

const worldidPlans = [
  {
    name: "Starter",
    price: "€1.50",
    unit: "/ IDV",
    annual: "€1,800/year",
    volume: "Up to 100 verifications/month",
    cta: "Start small",
    featured: false,
    hasCheckout: true,
  },
  {
    name: "Growth",
    badge: "Most Popular",
    price: "€1.00",
    unit: "/ IDV",
    annual: "€4,800/year",
    volume: "Up to 400 verifications/month",
    cta: "Choose Growth",
    featured: true,
    hasCheckout: true,
  },
  {
    name: "Scale",
    price: "€0.83",
    unit: "/ IDV",
    annual: "€12,000/year",
    volume: "Up to 1,200 verifications/month",
    cta: "Choose Scale",
    featured: false,
    hasCheckout: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    unit: "",
    annual: "5,000+ verifications/month",
    volume: "Custom contract",
    cta: "Contact Sales",
    featured: false,
    hasCheckout: false,
  },
];

const Pricing = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleCheckout = async (planName: string, product: "worldid" | "worldaml") => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to subscribe to a plan.",
        variant: "destructive",
      });
      navigate(`/login?redirect=/pricing&plan=${planName.toLowerCase()}`);
      return;
    }

    const key = `${product}-${planName}`;
    setLoadingPlan(key);
    try {
      const fnName = product === "worldid" ? "create-worldid-checkout" : "create-worldaml-checkout";
      const { data, error } = await supabase.functions.invoke(fnName, {
        body: { plan: planName.toLowerCase() },
      });

      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast({
        title: "Checkout failed",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="section-padding bg-background">
          <div className="container-enterprise">
            <div className="max-w-5xl mx-auto text-center">
              <h1 className="text-navy mb-6">Pricing</h1>
              <p className="text-body-lg text-text-secondary mb-8">
                Pricing structure varies by product type and jurisdiction. 
                Select the relevant section below for details.
              </p>
              
              {/* Tabs */}
              <Tabs defaultValue="worldaml" className="w-full">
                <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3 h-14 mb-8">
                  <TabsTrigger 
                    value="worldaml" 
                    className="flex items-center gap-2 data-[state=active]:bg-navy data-[state=active]:text-white"
                  >
                    <Layers className="w-4 h-4" />
                    <span className="hidden sm:inline">WorldAML</span>
                    <span className="sm:hidden">AML</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="worldid"
                    className="flex items-center gap-2 data-[state=active]:bg-navy data-[state=active]:text-white"
                  >
                    <Fingerprint className="w-4 h-4" />
                    <span className="hidden sm:inline">WorldID</span>
                    <span className="sm:hidden">ID</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="lexisnexis"
                    className="flex items-center gap-2 data-[state=active]:bg-navy data-[state=active]:text-white"
                  >
                    <Database className="w-4 h-4" />
                    <span className="hidden sm:inline">LexisNexis</span>
                    <span className="sm:hidden">Data</span>
                  </TabsTrigger>
                </TabsList>

                {/* WorldAML Tab Content */}
                <TabsContent value="worldaml" className="mt-0">
                  <div className="bg-surface-subtle rounded-xl p-6 md:p-8 lg:p-10 text-left">
                    <LaneBadge lane="platform" className="mb-6" />
                    <h2 className="text-2xl text-navy mb-4">WorldAML API Pricing</h2>
                    <p className="text-body text-text-secondary mb-8">
                      Simple, transparent pricing with annual billing. All plans include full API access 
                      and audit-ready screening reports.
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
                            {plan.price === "Custom" ? (
                              <Button asChild className="w-full" variant="outline">
                                <Link to="/contact-sales">
                                  Contact Sales
                                  <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                              </Button>
                            ) : (
                              <Button 
                                className="w-full"
                                variant={plan.highlight ? "default" : "outline"}
                                onClick={() => handleCheckout(plan.name, "worldaml")}
                                disabled={loadingPlan === `worldaml-${plan.name}`}
                              >
                                {loadingPlan === `worldaml-${plan.name}` ? "Loading..." : "Get Started"}
                                <ArrowRight className="ml-2 h-4 w-4" />
                              </Button>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    <div className="p-4 rounded-lg bg-navy/5 border border-navy/10 text-center">
                      <p className="text-body-sm text-text-secondary">
                        <span className="font-semibold text-navy">Suite Included:</span> WorldAML Suite 
                        is included with all API plans for case management and reporting.
                      </p>
                    </div>
                  </div>
                </TabsContent>

                {/* WorldID Tab Content */}
                <TabsContent value="worldid" className="mt-0">
                  <div className="bg-surface-subtle rounded-xl p-6 md:p-8 lg:p-10 text-left">
                    <div className="flex items-center gap-3 mb-6 flex-wrap">
                      <LaneBadge lane="platform" />
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-teal/10 text-teal">
                        Identity Verification
                      </span>
                    </div>
                    <h2 className="text-2xl text-navy mb-4">WorldID Pricing</h2>
                    <p className="text-body text-text-secondary mb-8">
                      Digital identity verification with document authentication, biometric liveness detection, 
                      and face matching. Annual billing with volume-based pricing.
                    </p>
                    
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                      {worldidPlans.map((plan) => (
                        <Card 
                          key={plan.name} 
                          className={`relative text-center ${
                            plan.featured 
                              ? 'border-teal border-2 shadow-lg' 
                              : 'border-divider'
                          }`}
                        >
                          {plan.featured && plan.badge && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                              <span className="bg-teal text-white text-xs font-medium px-3 py-1 rounded-full">
                                {plan.badge}
                              </span>
                            </div>
                          )}
                          <CardContent className="pt-8 pb-6 px-4">
                            <p className="text-sm font-medium text-text-secondary mb-4">
                              {plan.name}
                            </p>
                            
                            <div className="mb-4">
                              <span className="text-3xl font-bold text-navy">{plan.price}</span>
                              {plan.unit && (
                                <span className="text-lg text-text-secondary ml-1">{plan.unit}</span>
                              )}
                            </div>
                            
                            <div className="space-y-1 mb-6">
                              <p className="text-xs text-text-secondary">{plan.annual}</p>
                              <p className="text-xs text-text-secondary">{plan.volume}</p>
                            </div>
                            
                            {plan.hasCheckout ? (
                              <Button 
                                className="w-full" 
                                variant={plan.featured ? "accent" : "outline"}
                                onClick={() => handleCheckout(plan.name, "worldid")}
                                disabled={loadingPlan === `worldid-${plan.name}`}
                              >
                                {loadingPlan === `worldid-${plan.name}` ? "Loading..." : plan.cta}
                              </Button>
                            ) : (
                              <Button 
                                className="w-full" 
                                variant="outline"
                                asChild
                              >
                                <Link to={`/contact-sales?product=worldid&plan=${plan.name.toLowerCase()}`}>
                                  {plan.cta}
                                </Link>
                              </Button>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    <div className="p-4 rounded-lg bg-navy/5 border border-navy/10 text-center">
                      <p className="text-body-sm text-text-secondary">
                        All plans include API access, real-time verification, and GDPR-compliant processing.
                      </p>
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
                    
                    {/* WorldCompliance Section with Full Calculator */}
                    <div className="mb-10">
                      <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
                        <h2 className="text-2xl text-navy">WorldCompliance® Online</h2>
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-teal/10 text-teal">
                          Online Purchase
                        </span>
                      </div>
                      <p className="text-body text-text-secondary mb-6">
                        Search-based screening for individuals and companies across global sanctions, PEPs, and adverse media.
                        Progressive per-user discounts apply.
                      </p>
                      <WorldCompliancePricingCalculator />
                    </div>

                    {/* Bridger Insight XG */}
                    <div className="mb-8">
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
