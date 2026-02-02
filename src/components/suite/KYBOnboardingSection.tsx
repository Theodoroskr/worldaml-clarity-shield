import { Building2, Network, Users, Globe, FileSearch, ShieldCheck } from "lucide-react";

const features = [
  {
    icon: Building2,
    label: "Business Verification",
    description: "Verify legal entities against official company registries and authoritative sources globally.",
  },
  {
    icon: Network,
    label: "UBO Identification",
    description: "Identify and verify Ultimate Beneficial Owners (UBOs) across complex ownership structures.",
  },
  {
    icon: Users,
    label: "Director & Shareholder Screening",
    description: "Screen all key individuals including directors, officers, and significant shareholders.",
  },
  {
    icon: Globe,
    label: "Jurisdictional Risk Assessment",
    description: "Assess risk based on country of incorporation, operating jurisdictions, and regulatory environment.",
  },
  {
    icon: FileSearch,
    label: "Document Collection",
    description: "Collect and validate incorporation documents, certificates, and financial statements.",
  },
  {
    icon: ShieldCheck,
    label: "Corporate Due Diligence",
    description: "Comprehensive CDD and EDD workflows for high-risk corporate relationships.",
  },
];

export const KYBOnboardingSection = () => {
  return (
    <section className="section-padding bg-surface-subtle" id="kyb-onboarding">
      <div className="container-enterprise">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 text-caption font-medium text-navy bg-navy/5 rounded-full">
            Business Onboarding
          </div>
          <h2 className="text-headline text-navy mb-4">
            KYB Onboarding: Know Your Business Compliance
          </h2>
          <p className="text-body-lg text-text-secondary">
            Onboard corporate customers with comprehensive Know Your Business (KYB) verification. 
            WorldAML Suite automates company verification, beneficial ownership identification, 
            and corporate structure analysis to meet regulatory requirements for corporate due diligence.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {features.map((feature) => (
            <div key={feature.label} className="p-6 rounded-lg border border-divider bg-card">
              <div className="w-12 h-12 rounded-lg bg-teal/10 flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-teal" />
              </div>
              <h4 className="text-body font-semibold text-navy mb-2">{feature.label}</h4>
              <p className="text-body-sm text-text-secondary">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="p-6 rounded-lg border border-divider bg-card">
            <h4 className="text-body font-semibold text-navy mb-4">KYB Verification Process</h4>
            <ol className="space-y-3">
              {[
                "Collect company registration and incorporation details",
                "Verify entity against official company registries",
                "Identify shareholders and Ultimate Beneficial Owners",
                "Map corporate structure and control relationships",
                "Screen entity, directors, and UBOs against AML databases",
                "Assess risk and complete corporate due diligence",
              ].map((step, index) => (
                <li key={step} className="flex items-start gap-3 text-body-sm text-text-secondary">
                  <div className="w-6 h-6 rounded-full bg-teal/20 flex items-center justify-center text-caption font-semibold text-teal flex-shrink-0">
                    {index + 1}
                  </div>
                  <span className="pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </div>
          
          <div className="p-6 rounded-lg border border-divider bg-card">
            <h4 className="text-body font-semibold text-navy mb-4">UBO Requirements</h4>
            <p className="text-body-sm text-text-secondary mb-4">
              Identify and verify Ultimate Beneficial Owners as required by global regulations:
            </p>
            <div className="space-y-3">
              <div className="p-3 bg-surface-subtle rounded-lg">
                <h5 className="font-medium text-navy text-sm mb-1">EU AMLD Requirements</h5>
                <p className="text-body-sm text-text-secondary">
                  25% ownership threshold for UBO identification.
                </p>
              </div>
              <div className="p-3 bg-surface-subtle rounded-lg">
                <h5 className="font-medium text-navy text-sm mb-1">US FinCEN BOI Rule</h5>
                <p className="text-body-sm text-text-secondary">
                  Beneficial Ownership Information reporting requirements.
                </p>
              </div>
              <div className="p-3 bg-surface-subtle rounded-lg">
                <h5 className="font-medium text-navy text-sm mb-1">FATF Recommendations</h5>
                <p className="text-body-sm text-text-secondary">
                  Global standards for transparency and beneficial ownership.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default KYBOnboardingSection;
