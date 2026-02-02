import { Link } from "react-router-dom";
import { Server, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";

export const SuiteIntegrationSection = () => {
  return (
    <section className="section-padding bg-surface-subtle" id="integration">
      <div className="container-enterprise">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 text-caption font-medium text-teal bg-teal/10 rounded-full">
              Integration
            </div>
            <h2 className="text-headline text-navy mb-4">
              API-Enabled by Design
            </h2>
            <p className="text-body-lg text-text-secondary mb-6">
              WorldAML Suite is API-enabled by design, allowing integration with 
              onboarding systems and internal platforms. It can operate standalone 
              or alongside WorldAML API for programmatic access.
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-md bg-teal/10 flex items-center justify-center">
                  <Server className="w-5 h-5 text-teal" />
                </div>
                <div>
                  <h4 className="text-body font-semibold text-navy">Standalone Operation</h4>
                  <p className="text-body-sm text-text-secondary">
                    Use WorldAML Suite as your primary compliance interface without additional integration.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-md bg-teal/10 flex items-center justify-center">
                  <Layers className="w-5 h-5 text-teal" />
                </div>
                <div>
                  <h4 className="text-body font-semibold text-navy">API Integration</h4>
                  <p className="text-body-sm text-text-secondary">
                    Combine with WorldAML API for programmatic screening and workflow automation.
                  </p>
                </div>
              </div>
            </div>

            <Button variant="outline" asChild>
              <Link to="/platform/api">
                Learn About WorldAML API
              </Link>
            </Button>
          </div>

          <div className="p-6 rounded-lg border border-divider bg-card">
            <h4 className="text-body font-semibold text-navy mb-4">Platform Characteristics</h4>
            <ul className="space-y-3">
              {[
                "Clean, compliance-focused interface",
                "Structured workflows for core AML processes",
                "Clear separation between platform and data sources",
                "Designed for regulated environments",
                "Role-based access control",
                "Multi-jurisdiction support",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-body-sm text-text-secondary">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SuiteIntegrationSection;
