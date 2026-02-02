import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const pricingPlans = [
  {
    name: "Starter",
    price: "€1.50",
    unit: "/ IDV",
    billing: "Billed annually",
    annual: "€1,800 per year (€150/month)",
    volume: "Up to 100 verifications per month",
    cta: "Start small",
    footnote: "Includes document verification, selfie & liveness, API access",
    featured: false,
    hasCheckout: true,
  },
  {
    name: "Growth",
    badge: "Most Popular",
    price: "€1.00",
    unit: "/ IDV",
    billing: "Billed annually",
    annual: "€4,800 per year (€400/month)",
    volume: "Up to 400 verifications per month",
    cta: "Choose Growth",
    footnote: "Advanced liveness, fraud checks, priority processing",
    featured: true,
    hasCheckout: true,
  },
  {
    name: "Scale",
    price: "€0.83",
    unit: "/ IDV",
    billing: "Billed annually",
    annual: "€12,000 per year (€1,000/month)",
    volume: "Up to 1,200 verifications per month",
    cta: "Choose Scale",
    footnote: "SLA, automation, webhooks, high-volume support",
    featured: false,
    hasCheckout: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    unit: "/ IDV",
    billing: "",
    annual: "5,000+ verifications per month",
    volume: "Custom contract & infrastructure",
    cta: "Request enterprise pricing",
    footnote: "Dedicated setup, private cloud, enterprise compliance",
    featured: false,
    hasCheckout: false,
  },
];

const WorldIDPricingSection = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleCheckout = async (planName: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to subscribe to a plan.",
        variant: "destructive",
      });
      navigate(`/login?redirect=/products/worldid&plan=${planName.toLowerCase()}`);
      return;
    }

    setLoadingPlan(planName);
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

  return (
    <section id="pricing" className="section-padding bg-background">
      <div className="container-enterprise">
        <div className="text-center mb-12">
          <h2 className="text-navy mb-4">Pricing</h2>
          <p className="text-text-secondary max-w-2xl mx-auto">
            Simple, transparent pricing for identity verification.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {pricingPlans.map((plan, index) => (
            <Card 
              key={index} 
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
              <CardContent className="pt-8 pb-6 px-6">
                {/* Plan name - secondary */}
                <p className="text-sm font-medium text-text-secondary mb-4">
                  {plan.name}
                </p>
                
                {/* Main price - PRIMARY FOCUS */}
                <div className="mb-4">
                  <span className="text-4xl font-bold text-navy">{plan.price}</span>
                  <span className="text-lg text-text-secondary ml-1">{plan.unit}</span>
                </div>
                
                {/* Secondary details - smaller, lighter */}
                <div className="space-y-1 mb-6">
                  {plan.billing && (
                    <p className="text-xs text-text-secondary">{plan.billing}</p>
                  )}
                  <p className="text-xs text-text-secondary">{plan.annual}</p>
                  <p className="text-xs text-text-secondary">{plan.volume}</p>
                </div>
                
                {/* CTA button */}
                {plan.hasCheckout ? (
                  <Button 
                    className="w-full mb-4" 
                    variant={plan.featured ? "accent" : "outline"}
                    onClick={() => handleCheckout(plan.name)}
                    disabled={loadingPlan === plan.name}
                  >
                    {loadingPlan === plan.name ? "Loading..." : plan.cta}
                  </Button>
                ) : (
                  <Button 
                    className="w-full mb-4" 
                    variant="outline"
                    asChild
                  >
                    <Link to={`/contact-sales?product=worldid&plan=${plan.name.toLowerCase()}`}>
                      {plan.cta}
                    </Link>
                  </Button>
                )}
                
                {/* Footnote - very small, muted */}
                <p className="text-[11px] text-muted-foreground leading-tight">
                  {plan.footnote}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Global note */}
        <p className="text-center text-xs text-muted-foreground max-w-xl mx-auto">
          All plans include API access, real-time verification, and GDPR-compliant processing.
        </p>
      </div>
    </section>
  );
};

export default WorldIDPricingSection;
