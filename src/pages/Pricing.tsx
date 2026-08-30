import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, Check, Layers, Fingerprint, ShieldCheck, Search, Users } from "lucide-react";
import { CrossSellCard } from "@/components/CrossSellCard";
import SEO from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { LaneBadge } from "@/components/LaneBadge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { SCREENING_PLANS } from "@/lib/screeningPlans";

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
  const [searchParams] = useSearchParams();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const fromSanctions = searchParams.get("from") === "sanctions";

  const screeningFrom = SCREENING_PLANS.find((p) => p.key === "essentials");
  const screeningTo = SCREENING_PLANS.find((p) => p.key === "compliance");

  const handleWorldIdCheckout = async (planName: string) => {
    if (!user) {
      toast({
        title: "Business account required",
        description: "Create or sign in to a business account to complete your purchase.",
      });
      navigate(`/business/signup?next=/pricing`);
      return;
    }

    const key = `worldid-${planName}`;
    setLoadingPlan(key);
    try {
      const { data, error } = await supabase.functions.invoke("create-worldid-checkout", {
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

  const pricingStructuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        "name": "WORLDAML Screening & Monitoring",
        "description": "Sanctions, PEP and adverse media screening with ongoing monitoring. Annual subscriptions from €590/year, with separate Platform and API Only lanes.",
        "brand": { "@type": "Brand", "name": "WorldAML" },
        "offers": {
          "@type": "AggregateOffer",
          "priceCurrency": "EUR",
          "lowPrice": "590",
          "highPrice": "5950",
          "offerCount": SCREENING_PLANS.length,
          "url": "https://worldaml.com/screening-monitoring/pricing"
        }
      },
      {
        "@type": "Product",
        "name": "WorldID - Starter",
        "description": "Digital identity verification with document authentication and biometric liveness. Up to 100 verifications per month.",
        "brand": { "@type": "Brand", "name": "WorldAML" },
        "offers": {
          "@type": "Offer",
          "price": "1800",
          "priceCurrency": "EUR",
          "priceValidUntil": "2027-12-31",
          "availability": "https://schema.org/OnlineOnly",
          "url": "https://worldaml.com/pricing"
        }
      },
      {
        "@type": "Product",
        "name": "WorldID - Growth",
        "description": "Digital identity verification for growing businesses. Up to 400 verifications per month at €1.00 per IDV.",
        "brand": { "@type": "Brand", "name": "WorldAML" },
        "offers": {
          "@type": "Offer",
          "price": "4800",
          "priceCurrency": "EUR",
          "priceValidUntil": "2027-12-31",
          "availability": "https://schema.org/OnlineOnly",
          "url": "https://worldaml.com/pricing"
        }
      },
      {
        "@type": "Product",
        "name": "WorldID - Scale",
        "description": "High-volume identity verification. Up to 1,200 verifications per month at €0.83 per IDV.",
        "brand": { "@type": "Brand", "name": "WorldAML" },
        "offers": {
          "@type": "Offer",
          "price": "12000",
          "priceCurrency": "EUR",
          "priceValidUntil": "2027-12-31",
          "availability": "https://schema.org/OnlineOnly",
          "url": "https://worldaml.com/pricing"
        }
      }
    ]
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Pricing"
        description="WorldAML pricing hub: WORLDAML Screening & Monitoring annual plans from €590/year and WorldID identity verification from €1.50 per IDV."
        canonical="/pricing"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Pricing", url: "/pricing" },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pricingStructuredData) }}
      />
      <Header />
      <main className="flex-1">
        {/* Contextual banner from sanctions check */}
        {fromSanctions && (
          <div className="bg-teal/10 border-b border-teal/20">
            <div className="container-enterprise py-3">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2.5">
                  <div className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-full bg-teal/20 border border-teal/30">
                    <ArrowRight className="w-3.5 h-3.5 text-teal" />
                  </div>
                  <p className="text-sm text-foreground">
                    <span className="font-semibold">You've been using the free Sanctions Quick Check.</span>{" "}
                    Upgrade to WORLDAML Screening for higher volumes across 1,900+ lists with real-time monitoring.
                  </p>
                </div>
                <Link to="/screening-monitoring/pricing" className="flex-shrink-0 text-sm font-semibold text-teal hover:underline flex items-center gap-1">
                  View screening plans <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        )}
        {/* Hero */}
        <section className="section-padding bg-background">
          <div className="container-enterprise">
            <div className="max-w-5xl mx-auto text-center">
              <h1 className="text-navy mb-6">Pricing</h1>
              <p className="text-body-lg text-text-secondary mb-8">
                Transparent annual pricing across the WorldAML product ecosystem.
              </p>

              {/* Anchor Jump Links */}
              <div className="flex items-center justify-center gap-3 mb-12 flex-wrap">
                <a href="#screening" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-divider bg-background text-sm font-medium text-navy hover:bg-secondary hover:border-slate-muted transition-all">
                  <ShieldCheck className="w-4 h-4" />
                  WORLDAML Screening
                </a>
                <a href="#worldid" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-divider bg-background text-sm font-medium text-navy hover:bg-secondary hover:border-slate-muted transition-all">
                  <Fingerprint className="w-4 h-4" />
                  WorldID
                </a>
              </div>

              {/* ==================== FULL PRICING (public + authenticated) ==================== */}
                <>
                  {/* WORLDAML Screening & Monitoring hub card */}
                  <div id="screening" className="mb-12 scroll-mt-24">
                    <div className="bg-surface-subtle rounded-xl p-6 md:p-8 lg:p-10 text-left">
                        <LaneBadge lane="platform" className="mb-6" />
                        <h2 className="text-2xl text-navy mb-4">WORLDAML Screening &amp; Monitoring</h2>
                        <p className="text-body text-text-secondary mb-8">
                          Sanctions, PEP and adverse media screening with ongoing monitoring — available as a
                          web platform for compliance teams or as an API-only subscription for engineers.
                          All plans are billed annually.
                        </p>

                        <div className="grid md:grid-cols-2 gap-6 mb-8">
                          {/* Platform lane */}
                          <Card className="border-teal border-2 shadow-lg">
                            <CardContent className="pt-8 pb-6 px-6">
                              <div className="flex items-center gap-2 mb-4">
                                <Users className="w-5 h-5 text-teal" />
                                <p className="text-sm font-semibold text-navy">Platform</p>
                              </div>
                              <div className="mb-4">
                                <span className="text-3xl font-bold text-navy">
                                  {screeningFrom?.priceDisplay}
                                </span>
                                <span className="text-text-secondary">{screeningFrom?.period}</span>
                                <p className="text-caption text-text-tertiary mt-1">
                                  starting price — up to {screeningTo?.priceDisplay}/year
                                </p>
                              </div>
                              <ul className="space-y-3 mb-6">
                                <li className="flex items-start gap-2">
                                  <Check className="w-4 h-4 text-teal flex-shrink-0 mt-0.5" />
                                  <span className="text-body-sm text-text-secondary">500–5,000 screening searches per year</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <Check className="w-4 h-4 text-teal flex-shrink-0 mt-0.5" />
                                  <span className="text-body-sm text-text-secondary">100–1,000 active monitored entities</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <Check className="w-4 h-4 text-teal flex-shrink-0 mt-0.5" />
                                  <span className="text-body-sm text-text-secondary">Case management, audit-ready reports, team seats</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <Check className="w-4 h-4 text-teal flex-shrink-0 mt-0.5" />
                                  <span className="text-body-sm text-text-secondary">Free demo tier included</span>
                                </li>
                              </ul>
                              <Button asChild className="w-full">
                                <Link to="/screening-monitoring/pricing">
                                  View Platform plans
                                  <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                              </Button>
                            </CardContent>
                          </Card>

                          {/* API Only lane */}
                          <Card className="border-divider">
                            <CardContent className="pt-8 pb-6 px-6">
                              <div className="flex items-center gap-2 mb-4">
                                <Layers className="w-5 h-5 text-navy" />
                                <p className="text-sm font-semibold text-navy">API Only</p>
                              </div>
                              <div className="mb-4">
                                <span className="text-3xl font-bold text-navy">€1,950</span>
                                <span className="text-text-secondary">/year</span>
                                <p className="text-caption text-text-tertiary mt-1">
                                  starting price — up to €7,950/year
                                </p>
                              </div>
                              <ul className="space-y-3 mb-6">
                                <li className="flex items-start gap-2">
                                  <Check className="w-4 h-4 text-teal flex-shrink-0 mt-0.5" />
                                  <span className="text-body-sm text-text-secondary">1,000–5,000 production screening calls per year</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <Check className="w-4 h-4 text-teal flex-shrink-0 mt-0.5" />
                                  <span className="text-body-sm text-text-secondary">400–2,000 active monitored entities</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <Check className="w-4 h-4 text-teal flex-shrink-0 mt-0.5" />
                                  <span className="text-body-sm text-text-secondary">Webhooks, audit-ready JSON and PDF results</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <Check className="w-4 h-4 text-teal flex-shrink-0 mt-0.5" />
                                  <span className="text-body-sm text-text-secondary">Free sandbox environment included</span>
                                </li>
                              </ul>
                              <Button asChild className="w-full" variant="outline">
                                <Link to="/screening-monitoring/pricing">
                                  View API plans
                                  <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                              </Button>
                            </CardContent>
                          </Card>
                        </div>

                        <div className="p-4 rounded-lg bg-navy/5 border border-navy/10 text-center">
                          <p className="text-body-sm text-text-secondary">
                            <span className="font-semibold text-navy">Enterprise volumes?</span>{" "}
                            Bespoke annual allowances, SLAs and dedicated account management —{" "}
                            <Link to="/contact-sales" className="text-teal font-semibold hover:underline">
                              talk to sales
                            </Link>
                            .
                          </p>
                        </div>

                        {/* Cross-sell: not ready to integrate */}
                        <div className="mt-6">
                          <p className="text-[11px] font-semibold uppercase tracking-widest text-[hsl(215_20%_50%)] mb-3">
                            Not ready to integrate?
                          </p>
                          <CrossSellCard
                            variant="default"
                            domain="worldkycsearch.com"
                            destPath="/"
                            utmSource="worldaml.com"
                            utmMedium="pricing-page"
                            utmCampaign="not-ready-to-integrate"
                            accentColor="hsl(222 47% 40%)"
                            icon={<Search className="w-4 h-4" />}
                            eyebrow="WorldKYC Search"
                            headline="Start screening in minutes — no engineering needed"
                            body="WorldKYC Search gives compliance analysts instant PEP, sanctions, and adverse media lookups through a clean web interface. No API key, no integration sprint."
                            bullets={[
                              "Point-and-click screening across global risk lists",
                              "Audit trail and PDF export built in",
                              "Upgrade to the API any time — same account",
                            ]}
                            ctaLabel="Try WorldKYC Search free"
                          />
                        </div>
                    </div>
                  </div>

                  {/* WorldID Section */}
                  <div id="worldid" className="mb-12 scroll-mt-24">
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
                                  onClick={() => handleWorldIdCheckout(plan.name)}
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
                  </div>

                </>

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
