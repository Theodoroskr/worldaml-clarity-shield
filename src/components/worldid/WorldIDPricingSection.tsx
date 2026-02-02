import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Check, Star } from "lucide-react";

const bundlePlans = [
  {
    name: "Starter",
    price: "€1,000",
    period: "/ month",
    verifications: "Up to 500 verifications",
    cta: "Start with Starter",
    featured: false,
  },
  {
    name: "Growth",
    price: "€3,600",
    period: "/ month",
    verifications: "Up to 2,000 verifications",
    cta: "Choose Growth",
    featured: true,
  },
  {
    name: "Scale",
    price: "€14,000",
    period: "/ month",
    verifications: "Up to 10,000 verifications",
    cta: "Talk to sales",
    featured: false,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    verifications: "50,000+ verifications",
    cta: "Request enterprise pricing",
    featured: false,
  },
];

const payAsYouGo = [
  { range: "0–500 verifications", price: "€2.50 per check" },
  { range: "501–2,000", price: "€2.00 per check" },
  { range: "2,001–10,000", price: "€1.50 per check" },
  { range: "10,000+", price: "Custom" },
];

const WorldIDPricingSection = () => {
  const [isPayAsYouGo, setIsPayAsYouGo] = useState(false);

  return (
    <section id="pricing" className="section-padding bg-background">
      <div className="container-enterprise">
        <div className="text-center mb-8">
          <h2 className="text-navy mb-4">Pricing</h2>
          <p className="text-text-secondary max-w-2xl mx-auto mb-6">
            Transparent pricing for every stage of growth.
          </p>
          
          <div className="flex items-center justify-center gap-4">
            <span className={`text-sm font-medium ${!isPayAsYouGo ? 'text-navy' : 'text-text-secondary'}`}>
              Monthly bundles
            </span>
            <Switch 
              checked={isPayAsYouGo} 
              onCheckedChange={setIsPayAsYouGo}
            />
            <span className={`text-sm font-medium ${isPayAsYouGo ? 'text-navy' : 'text-text-secondary'}`}>
              Pay-as-you-go
            </span>
          </div>
        </div>
        
        {!isPayAsYouGo ? (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {bundlePlans.map((plan, index) => (
                <Card 
                  key={index} 
                  className={`relative ${plan.featured ? 'border-teal border-2 shadow-lg' : 'border-divider'}`}
                >
                  {plan.featured && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-teal text-white text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1">
                        <Star className="w-3 h-3" /> Popular
                      </span>
                    </div>
                  )}
                  <CardHeader className="text-center pb-2">
                    <CardTitle className="text-lg text-navy">{plan.name}</CardTitle>
                    <div className="mt-2">
                      <span className="text-3xl font-bold text-navy">{plan.price}</span>
                      <span className="text-text-secondary text-sm">{plan.period}</span>
                    </div>
                    <p className="text-sm text-text-secondary mt-2">{plan.verifications}</p>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      className="w-full" 
                      variant={plan.featured ? "accent" : "outline"}
                    >
                      {plan.cta}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="max-w-2xl mx-auto bg-secondary p-4 rounded-lg">
              <p className="text-sm text-text-secondary text-center">
                <span className="font-medium text-navy">Includes:</span> Document + selfie + liveness verification.
                Manual review may incur additional fees. AML screening not included.
              </p>
            </div>
          </>
        ) : (
          <div className="max-w-xl mx-auto">
            <Card className="border-divider">
              <CardHeader>
                <CardTitle className="text-xl text-navy text-center">Pay-as-you-go pricing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {payAsYouGo.map((tier, index) => (
                  <div key={index} className="flex justify-between items-center py-3 border-b border-divider last:border-0">
                    <span className="text-navy font-medium">{tier.range}</span>
                    <span className="text-teal font-semibold">{tier.price}</span>
                  </div>
                ))}
                <Button className="w-full mt-4" variant="accent">
                  Start pay-as-you-go
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </section>
  );
};

export default WorldIDPricingSection;
