import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Check, Building2, Shield, Activity, FileText } from "lucide-react";

const features = [
  "Company sanctions screening",
  "Adverse media screening for legal entities",
  "Director and shareholder screening",
  "Jurisdictional risk signals",
  "Ongoing AML monitoring",
  "Risk assessment included by default",
  "Full API access",
  "Audit-ready screening results",
];

export const APICompanyPricingSection = () => {
  return (
    <section className="py-20 lg:py-28 bg-secondary/30">
      <div className="container-enterprise">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-body-sm font-medium mb-4">
            <Building2 className="w-4 h-4" />
            Company Screening
          </div>
          <h2 className="text-display-sm lg:text-display-md font-bold text-foreground mb-4">
            WorldAML API – Company Screening
          </h2>
          <p className="text-body-lg text-muted-foreground max-w-2xl mx-auto">
            Core AML screening and monitoring tools for companies, delivered via API.
          </p>
        </div>

        <div className="max-w-lg mx-auto">
          {/* Pricing Card */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            {/* Card Header */}
            <div className="p-8 border-b border-border bg-muted/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-heading-md font-semibold text-foreground">Starter Plan</h3>
                  <p className="text-body-sm text-muted-foreground">For growing platforms</p>
                </div>
              </div>
              
              <div className="mt-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-body text-muted-foreground">From</span>
                  <span className="text-display-sm font-bold text-foreground">€99.99</span>
                  <span className="text-body text-muted-foreground">/month</span>
                </div>
                <p className="text-body-sm text-muted-foreground mt-1">
                  €1,199.88 billed upfront per year
                </p>
              </div>

              <div className="mt-4 flex items-center gap-2 text-body-sm text-muted-foreground">
                <Activity className="w-4 h-4" />
                <span>Up to <strong className="text-foreground">2,000</strong> monitored companies</span>
              </div>
            </div>

            {/* Features List */}
            <div className="p-8">
              <p className="text-body-sm font-medium text-foreground mb-4">Everything you need:</p>
              <ul className="space-y-3">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-body-sm text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Rollover Notice */}
              <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border">
                <p className="text-body-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Rollover policy:</span> Unused checks roll over month-to-month within the same 12-month subscription period and expire at the end of the term.
                </p>
              </div>

              {/* Billing Details */}
              <div className="mt-6 flex items-center gap-4 text-body-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <FileText className="w-4 h-4" />
                  <span>Annual subscription</span>
                </div>
                <span className="text-border">•</span>
                <span>No setup fees</span>
              </div>

              {/* CTAs */}
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Button size="lg" className="flex-1" asChild>
                  <Link to="/get-started">Get API Access</Link>
                </Button>
                <Button variant="outline" size="lg" className="flex-1" asChild>
                  <a href="https://docs.worldaml.com" target="_blank" rel="noopener noreferrer">
                    View Documentation
                  </a>
                </Button>
              </div>

              <p className="text-center text-body-sm text-muted-foreground mt-4">
                Annual prepaid billing. Upgrade paths available for higher volumes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
