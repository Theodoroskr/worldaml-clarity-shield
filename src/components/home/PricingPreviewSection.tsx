import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "Starter",
    features: [
      "Up to 2,000 monitored entities",
      "From €99/month (billed annually)",
      "Ongoing monitoring included",
    ],
  },
  {
    name: "Compliance",
    features: [
      "Up to 10,000 monitored entities",
      "From €495/month (billed annually)",
      "Enhanced monitoring",
    ],
  },
];

export const PricingPreviewSection = () => {
  return (
    <section className="section-padding bg-background">
      <div className="container-enterprise">
        <h2 className="text-headline text-navy mb-12 text-center">
          Simple, Transparent API Pricing
        </h2>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className="p-8 rounded-lg border border-divider bg-card"
            >
              <h3 className="text-subheadline text-navy mb-6">
                {plan.name}
              </h3>
              
              <ul className="space-y-4">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                    <span className="text-body-sm text-text-secondary">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <p className="text-body-sm text-text-tertiary text-center mt-8 mb-8">
          All plans include full API access and audit-ready screening reports.
        </p>
        
        <div className="text-center">
          <Button variant="outline" asChild>
            <Link to="/pricing">
              View Full Pricing
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default PricingPreviewSection;
