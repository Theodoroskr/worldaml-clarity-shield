import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Check, Zap, Shield, Building2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";

const sharedFeatures = [
  "Individual AML screening",
  "Company AML screening",
  "Sanctions, PEP & adverse media",
  "Ongoing AML monitoring",
  "Full API access",
  "Audit-ready screening reports",
];

const plans = [
  {
    name: "Starter",
    description: "For growing platforms",
    icon: Zap,
    entities: "2,000",
    monthlyPrice: "€119",
    annualPrice: "€99",
    annualTotal: "€1,188",
    monthlySavings: "€20",
    cta: "Get API Access",
    ctaLink: "/get-started",
    highlighted: false,
  },
  {
    name: "Compliance",
    description: "For scaling operations",
    icon: Shield,
    entities: "10,000",
    monthlyPrice: "€595",
    annualPrice: "€495",
    annualTotal: "€5,940",
    monthlySavings: "€100",
    cta: "Get API Access",
    ctaLink: "/get-started",
    highlighted: true,
  },
  {
    name: "Enterprise",
    description: "For large organisations",
    icon: Building2,
    entities: "Custom",
    monthlyPrice: null,
    annualPrice: null,
    annualTotal: null,
    monthlySavings: null,
    cta: "Contact Sales",
    ctaLink: "/get-started",
    highlighted: false,
    features: [
      "Custom volumes & jurisdictions",
      "Custom SLAs",
      "Dedicated support",
    ],
  },
];

export const APICompanyPricingSection = () => {
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <section className="py-20 lg:py-28 bg-secondary/30">
      <div className="container-enterprise">
        <div className="text-center mb-12">
          <h2 className="text-display-sm lg:text-display-md font-bold text-foreground mb-4">
            WorldAML API Pricing
          </h2>
          <p className="text-body-lg text-muted-foreground max-w-2xl mx-auto">
            API-only AML screening and monitoring for regulated platforms.
          </p>
        </div>

        {/* Shared Features */}
        <div className="max-w-2xl mx-auto mb-8">
          <p className="text-body-sm font-medium text-foreground text-center mb-4">
            Included in all plans:
          </p>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            {sharedFeatures.map((feature, index) => (
              <div key={index} className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                <span className="text-body-sm text-muted-foreground">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-3 mb-12">
          <span
            className={`text-body-sm font-medium transition-colors ${
              !isAnnual ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            Monthly
          </span>
          <Switch
            checked={isAnnual}
            onCheckedChange={setIsAnnual}
            aria-label="Toggle billing period"
          />
          <span
            className={`text-body-sm font-medium transition-colors ${
              isAnnual ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            Annual
          </span>
          {isAnnual && (
            <span className="ml-1 px-2 py-0.5 bg-primary/10 text-primary text-body-xs font-medium rounded-full">
              Save up to 17%
            </span>
          )}
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`bg-card border rounded-2xl overflow-hidden shadow-sm flex flex-col ${
                plan.highlighted
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-border"
              }`}
            >
              {plan.highlighted && (
                <div className="bg-primary text-primary-foreground text-center py-2 text-body-sm font-medium">
                  Most Popular
                </div>
              )}

              <div className="p-6 flex-1 flex flex-col">
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <plan.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-heading-sm font-semibold text-foreground">
                      {plan.name}
                    </h3>
                    <p className="text-body-sm text-muted-foreground">
                      {plan.description}
                    </p>
                  </div>
                </div>

                {/* Pricing */}
                <div className="mb-6">
                  {plan.annualPrice ? (
                    <>
                      <div className="flex items-baseline gap-1">
                        <span className="text-display-xs font-bold text-foreground">
                          {isAnnual ? plan.annualPrice : plan.monthlyPrice}
                        </span>
                        <span className="text-body-sm text-muted-foreground">
                          /month
                        </span>
                      </div>
                      <p className="text-body-sm text-muted-foreground mt-1">
                        {isAnnual
                          ? `${plan.annualTotal} billed annually`
                          : "Billed monthly"}
                      </p>
                      {isAnnual && (
                        <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 bg-primary/10 rounded text-body-sm">
                          <span className="text-primary font-medium">
                            Save {plan.monthlySavings}/mo
                          </span>
                          <span className="text-muted-foreground">vs monthly</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-display-xs font-bold text-foreground">
                      Custom pricing
                    </div>
                  )}
                </div>

                {/* Entity Limit */}
                <div className="mb-6 pb-6 border-b border-border">
                  <p className="text-body-sm text-muted-foreground">
                    Up to{" "}
                    <span className="font-semibold text-foreground">
                      {plan.entities}
                    </span>{" "}
                    monitored entities
                  </p>
                </div>

                {/* Enterprise-specific features */}
                {plan.features && (
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-primary mt-0.5" />
                        <span className="text-body-sm text-muted-foreground">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}

                {/* CTA */}
                <div className="mt-auto">
                  <Button
                    size="lg"
                    variant={plan.highlighted ? "default" : "outline"}
                    className="w-full"
                    asChild
                  >
                    <Link to={plan.ctaLink}>{plan.cta}</Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Rollover Notice */}
        <div className="max-w-2xl mx-auto mt-10 text-center">
          <p className="text-body-sm text-muted-foreground">
            Monitoring included in all plans. Unused checks roll over within the same 12-month subscription period and expire at the end of the term.
          </p>
        </div>
      </div>
    </section>
  );
};
