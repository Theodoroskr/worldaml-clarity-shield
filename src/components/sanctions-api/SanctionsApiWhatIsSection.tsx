import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export const SanctionsApiWhatIsSection = () => {
  return (
    <section className="section-padding bg-surface-subtle">
      <div className="container-enterprise">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 text-caption font-medium text-navy bg-navy/5 rounded-full">
              Overview
            </div>
            <h2 className="text-headline text-navy mb-4">What Is a Sanctions Screening API?</h2>
            <p className="text-body-lg text-text-secondary mb-6">
              A sanctions screening API enables regulated businesses to automatically 
              check customers, counterparties, and transactions against global sanctions 
              and watchlists — OFAC, EU Consolidated, UN Security Council, HMT, DFAT, 
              and hundreds more.
            </p>
            <p className="text-body text-text-secondary mb-6">
              WorldAML's Sanctions Screening API provides configurable matching thresholds, 
              phonetic and fuzzy matching algorithms, and jurisdiction-specific list routing 
              to minimise false positives while maintaining regulatory coverage.
            </p>
            <Link
              to="/platform/aml-screening"
              className="inline-flex items-center gap-2 text-teal font-medium hover:underline"
            >
              Explore the full AML Screening platform
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="space-y-6">
            <div className="p-6 rounded-lg border border-divider bg-card">
              <h3 className="text-body font-semibold text-navy mb-2">Real-Time Screening</h3>
              <p className="text-body-sm text-text-secondary">
                Sub-200ms response times for individual entity checks. Ideal for 
                inline onboarding and payment gating workflows.
              </p>
            </div>
            <div className="p-6 rounded-lg border border-divider bg-card">
              <h3 className="text-body font-semibold text-navy mb-2">Batch Processing</h3>
              <p className="text-body-sm text-text-secondary">
                Submit thousands of entities in a single batch request for portfolio-wide 
                re-screening. Results delivered via webhook or polling.
              </p>
            </div>
            <div className="p-6 rounded-lg border border-divider bg-card">
              <h3 className="text-body font-semibold text-navy mb-2">Ongoing Monitoring</h3>
              <p className="text-body-sm text-text-secondary">
                Enrol entities for continuous sanctions monitoring. Get alerted automatically 
                when list changes affect your customer base.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SanctionsApiWhatIsSection;
