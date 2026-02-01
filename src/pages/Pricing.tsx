import { Link } from "react-router-dom";
import { Check, ArrowRight, HelpCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const plans = [
  {
    name: "WorldAML Basic",
    description: "For startups and small businesses getting started with AML compliance.",
    price: "Contact Sales",
    priceSubtext: "Billed annually, prepaid",
    features: [
      { text: "AML Screening API", included: true },
      { text: "Global Sanctions Coverage", included: true },
      { text: "PEP Screening", included: true },
      { text: "Basic Adverse Media", included: true },
      { text: "Ongoing Monitoring", included: false, tooltip: "Available in Compliance plan" },
      { text: "Risk Assessment Tools", included: false },
      { text: "ID Verification", included: false },
      { text: "Dedicated Support", included: false },
    ],
    cta: "Contact Sales",
    highlight: false,
  },
  {
    name: "WorldAML Compliance",
    description: "For growing regulated businesses with full compliance requirements.",
    price: "Contact Sales",
    priceSubtext: "Billed annually, prepaid",
    features: [
      { text: "AML Screening API", included: true },
      { text: "Global Sanctions Coverage", included: true },
      { text: "PEP Screening", included: true },
      { text: "Advanced Adverse Media", included: true },
      { text: "Ongoing Monitoring", included: true },
      { text: "Risk Assessment Tools", included: true },
      { text: "ID Verification Basic", included: true },
      { text: "Priority Support", included: true },
    ],
    cta: "Contact Sales",
    highlight: true,
    badge: "Most Popular",
  },
  {
    name: "WorldAML Enterprise",
    description: "For large-scale operations with custom requirements and SLAs.",
    price: "Custom",
    priceSubtext: "Tailored to your needs",
    features: [
      { text: "Everything in Compliance", included: true },
      { text: "Custom Integration Support", included: true },
      { text: "Dedicated Account Manager", included: true },
      { text: "Custom SLA", included: true },
      { text: "On-Premise Deployment Option", included: true },
      { text: "Advanced Analytics", included: true },
      { text: "Custom Rules Engine", included: true },
      { text: "24/7 Enterprise Support", included: true },
    ],
    cta: "Talk to Sales",
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
              <h1 className="text-display text-navy mb-6">
                Simple, Transparent Pricing
              </h1>
              <p className="text-body-lg text-text-secondary mb-8">
                Choose the plan that fits your compliance needs. All plans are billed 
                annually and include full API access with predictable pricing.
              </p>
            </div>
          </div>
        </section>

        {/* Pricing cards */}
        <section className="pb-16 md:pb-24 bg-background">
          <div className="container-enterprise">
            <div className="grid lg:grid-cols-3 gap-8">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`relative rounded-xl border p-8 flex flex-col ${
                    plan.highlight
                      ? "border-navy bg-navy/[0.02] ring-1 ring-navy"
                      : "border-divider bg-card"
                  }`}
                >
                  {/* Badge */}
                  {plan.badge && (
                    <div className="absolute -top-3 left-8">
                      <span className="inline-flex px-3 py-1 text-caption font-semibold text-primary-foreground bg-navy rounded-full">
                        {plan.badge}
                      </span>
                    </div>
                  )}

                  {/* Header */}
                  <div className="mb-6">
                    <h3 className="text-title text-navy mb-2">{plan.name}</h3>
                    <p className="text-body-sm text-text-secondary">{plan.description}</p>
                  </div>

                  {/* Price */}
                  <div className="mb-8">
                    <div className="text-headline text-navy">{plan.price}</div>
                    <div className="text-body-sm text-text-tertiary">{plan.priceSubtext}</div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-4 mb-8 flex-1">
                    {plan.features.map((feature) => (
                      <li key={feature.text} className="flex items-start gap-3">
                        <div
                          className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${
                            feature.included ? "bg-teal/10" : "bg-secondary"
                          }`}
                        >
                          <Check
                            className={`w-3 h-3 ${
                              feature.included ? "text-teal" : "text-text-tertiary"
                            }`}
                          />
                        </div>
                        <span
                          className={`text-body-sm ${
                            feature.included ? "text-text-primary" : "text-text-tertiary"
                          }`}
                        >
                          {feature.text}
                          {feature.tooltip && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <HelpCircle className="inline-block w-3.5 h-3.5 ml-1 text-text-tertiary cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{feature.tooltip}</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <Button
                    className="w-full"
                    variant={plan.highlight ? "default" : "outline"}
                    asChild
                  >
                    <Link to="/contact">
                      {plan.cta}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Rollover notice */}
        <section className="pb-16 md:pb-24 bg-background">
          <div className="container-enterprise">
            <div className="max-w-3xl mx-auto">
              <div className="p-6 rounded-lg bg-surface-subtle border border-divider">
                <h3 className="text-body font-semibold text-navy mb-2">Usage Rollover Policy</h3>
                <p className="text-body-sm text-text-secondary">
                  Unused checks roll over month-to-month within the same 12-month subscription 
                  period and expire at the end of the term. This ensures you get full value from 
                  your annual commitment while maintaining predictable budgeting.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Preview */}
        <section className="section-padding bg-surface-subtle">
          <div className="container-enterprise">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-headline text-navy mb-4">Have Questions?</h2>
              <p className="text-body-lg text-text-secondary mb-8">
                Our team is ready to help you find the right plan for your compliance needs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild>
                  <Link to="/contact">
                    Talk to Sales
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/support">View Support Options</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Pricing;
