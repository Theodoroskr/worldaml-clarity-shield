import { Link } from "react-router-dom";
import { Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "Basic",
    description: "For startups and small businesses",
    highlight: false,
  },
  {
    name: "Compliance",
    description: "For growing regulated businesses",
    highlight: true,
  },
  {
    name: "Enterprise",
    description: "For large-scale operations",
    highlight: false,
  },
];

const features = [
  "AML Screening API Access",
  "Global Sanctions Coverage",
  "Ongoing Monitoring",
  "Risk Assessment Tools",
  "Dedicated Support",
];

export const PricingTeaserSection = () => {
  return (
    <section className="section-padding bg-surface-subtle">
      <div className="container-enterprise">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left content */}
          <div>
            <h2 className="text-headline text-navy mb-4">
              Transparent, Usage-Based Pricing
            </h2>
            <p className="text-body-lg text-text-secondary mb-6">
              Pay for what you use with predictable, annual pricing. All plans include 
              full API access with no hidden fees or per-feature charges.
            </p>

            {/* Features list */}
            <ul className="space-y-3 mb-8">
              {features.map((feature) => (
                <li key={feature} className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-teal/10 flex items-center justify-center">
                    <Check className="w-3 h-3 text-teal" />
                  </div>
                  <span className="text-body text-text-primary">{feature}</span>
                </li>
              ))}
            </ul>

            {/* Rollover notice */}
            <div className="p-4 rounded-lg bg-navy/5 border border-navy/10">
              <p className="text-body-sm text-text-secondary">
                <span className="font-semibold text-navy">Usage Rollover:</span> Unused checks 
                roll over month-to-month within the same 12-month subscription period and expire 
                at the end of the term.
              </p>
            </div>
          </div>

          {/* Right - Plan cards */}
          <div className="space-y-4">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`p-6 rounded-lg border transition-all duration-200 ${
                  plan.highlight
                    ? "bg-navy text-primary-foreground border-navy"
                    : "bg-card border-divider hover:border-slate-muted"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`text-title ${plan.highlight ? "text-primary-foreground" : "text-navy"}`}>
                      WorldAML {plan.name}
                    </h3>
                    <p className={`text-body-sm ${plan.highlight ? "text-slate-light" : "text-text-secondary"}`}>
                      {plan.description}
                    </p>
                  </div>
                  <ArrowRight className={`w-5 h-5 ${plan.highlight ? "text-teal-light" : "text-slate-light"}`} />
                </div>
              </div>
            ))}

            <Button className="w-full mt-6" asChild>
              <Link to="/pricing">
                View Pricing Details
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingTeaserSection;
