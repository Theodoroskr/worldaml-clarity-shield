import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export const AMLApiWhatIsSection = () => {
  return (
    <section className="section-padding bg-surface-subtle">
      <div className="container-enterprise">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 text-caption font-medium text-navy bg-navy/5 rounded-full">
              Overview
            </div>
            <h2 className="text-headline text-navy mb-4">What Is an AML Screening API?</h2>
            <p className="text-body-lg text-text-secondary mb-6">
              An AML (Anti-Money Laundering) screening API allows regulated businesses 
              to programmatically check individuals and companies against global watchlists, 
              sanctions databases, PEP registries, and adverse media sources — without 
              manual lookup or spreadsheet-based processes.
            </p>
            <p className="text-body text-text-secondary mb-6">
              WorldAML's AML API acts as an orchestration layer, routing each screening 
              request to approved third-party data sources and returning normalised, 
              risk-scored results through a single integration point.
            </p>
            <Link
              to="/platform/api"
              className="inline-flex items-center gap-2 text-teal font-medium hover:underline"
            >
              Learn about the full WorldAML API platform
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="space-y-6">
            <div className="p-6 rounded-lg border border-divider bg-card">
              <h3 className="text-body font-semibold text-navy mb-2">For Compliance Teams</h3>
              <p className="text-body-sm text-text-secondary">
                Eliminate manual screening backlogs. Automate customer onboarding checks 
                and periodic re-screening while maintaining a full audit trail.
              </p>
            </div>
            <div className="p-6 rounded-lg border border-divider bg-card">
              <h3 className="text-body font-semibold text-navy mb-2">For Engineering Teams</h3>
              <p className="text-body-sm text-text-secondary">
                A single RESTful endpoint replaces fragmented integrations with multiple 
                data vendors. JSON in, JSON out — with webhook support for async results.
              </p>
            </div>
            <div className="p-6 rounded-lg border border-divider bg-card">
              <h3 className="text-body font-semibold text-navy mb-2">For Risk Officers</h3>
              <p className="text-body-sm text-text-secondary">
                Configurable risk scoring, customisable thresholds, and jurisdiction-aware 
                routing ensure screening matches your risk appetite.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AMLApiWhatIsSection;
