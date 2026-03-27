import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export const KYCKYBApiWhatIsSection = () => {
  return (
    <section className="section-padding bg-surface-subtle">
      <div className="container-enterprise">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 text-caption font-medium text-navy bg-navy/5 rounded-full">
              Overview
            </div>
            <h2 className="text-headline text-navy mb-4">What Is a KYC/KYB API?</h2>
            <p className="text-body-lg text-text-secondary mb-6">
              A KYC/KYB API allows regulated businesses to programmatically verify the 
              identity of individuals (Know Your Customer) and the legitimacy of corporate 
              entities (Know Your Business) during onboarding and throughout the customer 
              lifecycle.
            </p>
            <p className="text-body text-text-secondary mb-6">
              WorldAML's KYC & KYB API consolidates identity verification, corporate 
              registry checks, UBO mapping, document verification, and AML screening 
              into a single orchestration layer — reducing integration complexity and 
              accelerating time-to-compliance.
            </p>
            <Link
              to="/platform/kyc-kyb"
              className="inline-flex items-center gap-2 text-teal font-medium hover:underline"
            >
              Explore the full KYC/KYB platform module
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="space-y-6">
            <div className="p-6 rounded-lg border border-divider bg-card">
              <h3 className="text-body font-semibold text-navy mb-2">KYC — Individual Verification</h3>
              <p className="text-body-sm text-text-secondary">
                Verify customer identities with document checks, biometric matching, 
                liveness detection, and cross-referencing against sanctions and PEP lists.
              </p>
            </div>
            <div className="p-6 rounded-lg border border-divider bg-card">
              <h3 className="text-body font-semibold text-navy mb-2">KYB — Business Verification</h3>
              <p className="text-body-sm text-text-secondary">
                Verify corporate entities through registry lookups, UBO identification, 
                director checks, and corporate structure mapping across jurisdictions.
              </p>
            </div>
            <div className="p-6 rounded-lg border border-divider bg-card">
              <h3 className="text-body font-semibold text-navy mb-2">EDD Escalation</h3>
              <p className="text-body-sm text-text-secondary">
                When standard checks flag elevated risk, trigger Enhanced Due Diligence 
                workflows automatically — including source-of-wealth and adverse media deep dives.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default KYCKYBApiWhatIsSection;
