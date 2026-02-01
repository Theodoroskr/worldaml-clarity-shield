import { Link } from "react-router-dom";
import { Code, ArrowRight, Webhook, Server } from "lucide-react";
import { Button } from "@/components/ui/button";

export const SuiteAPIAccessSection = () => {
  return (
    <section className="section-padding bg-background">
      <div className="container-enterprise">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 text-caption font-medium text-navy bg-navy/5 rounded-full">
              <Code className="w-3.5 h-3.5" />
              Full API Access
            </div>
            <h2 className="text-headline text-navy mb-4">
              API Access
            </h2>
            <p className="text-body-lg text-text-secondary mb-6">
              All WorldAML Suite capabilities are exposed via API. Integrate 
              onboarding, screening, and monitoring directly into your existing 
              systems and workflows, or use the Suite interface alongside 
              programmatic access.
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <Server className="w-5 h-5 text-teal mt-0.5" />
                <div>
                  <h4 className="text-body font-semibold text-navy">REST API</h4>
                  <p className="text-body-sm text-text-secondary">
                    Standard REST endpoints for all platform capabilities.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Webhook className="w-5 h-5 text-teal mt-0.5" />
                <div>
                  <h4 className="text-body font-semibold text-navy">Webhooks</h4>
                  <p className="text-body-sm text-text-secondary">
                    Event-driven notifications for monitoring alerts and status changes.
                  </p>
                </div>
              </div>
            </div>

            <Button variant="outline" asChild>
              <a 
                href="https://worldaml.readme.io" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                View API Documentation
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>

          <div className="p-6 rounded-lg border border-divider bg-navy overflow-hidden">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-red-500/60" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
              <div className="w-3 h-3 rounded-full bg-green-500/60" />
            </div>
            <pre className="text-body-sm text-slate-light overflow-x-auto">
{`// Create a customer in WorldAML Suite
const customer = await worldaml.customers.create({
  type: "individual",
  name: "Jane Doe",
  dateOfBirth: "1990-05-20",
  nationality: "GB"
});

// Screening is automatic at onboarding
console.log(customer.screening.status);
// → "clear"

// Monitoring starts automatically
console.log(customer.monitoring.enabled);
// → true`}
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SuiteAPIAccessSection;
