import { UserCheck, FileCheck, BarChart3, Shield } from "lucide-react";

const features = [
  {
    icon: UserCheck,
    label: "Identity Verification",
    description: "Verify customer identity against authoritative data sources.",
  },
  {
    icon: FileCheck,
    label: "Document Validation",
    description: "Validate identity documents with automated checks and extraction.",
  },
  {
    icon: BarChart3,
    label: "Risk-Based Onboarding",
    description: "Make onboarding decisions based on risk assessment outcomes.",
  },
  {
    icon: Shield,
    label: "Integrated AML Screening",
    description: "Screen individuals against sanctions, PEPs, and adverse media at onboarding.",
  },
];

export const KYCOnboardingSection = () => {
  return (
    <section className="section-padding bg-background">
      <div className="container-enterprise">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 text-caption font-medium text-navy bg-navy/5 rounded-full">
              Individual Onboarding
            </div>
            <h2 className="text-headline text-navy mb-4">
              KYC Onboarding
            </h2>
            <p className="text-body-lg text-text-secondary mb-8">
              Onboard individual customers with integrated identity verification, 
              document validation, and AML screening. Make risk-based onboarding 
              decisions with full visibility into each customer's risk profile.
            </p>

            <div className="space-y-4">
              {features.map((feature) => (
                <div key={feature.label} className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-md bg-navy/5 flex items-center justify-center">
                    <feature.icon className="w-5 h-5 text-navy" />
                  </div>
                  <div>
                    <h4 className="text-body font-semibold text-navy">{feature.label}</h4>
                    <p className="text-body-sm text-text-secondary">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:sticky lg:top-8 space-y-6">
            <div className="p-6 rounded-lg border border-divider bg-surface-subtle">
              <h4 className="text-body font-semibold text-navy mb-4">Onboarding Workflow</h4>
              <ol className="space-y-3">
                {[
                  "Collect customer information",
                  "Verify identity and documents",
                  "Screen against AML databases",
                  "Assess and assign risk level",
                  "Approve, reject, or escalate",
                ].map((step, index) => (
                  <li key={step} className="flex items-center gap-3 text-body-sm text-text-secondary">
                    <div className="w-6 h-6 rounded-full bg-navy/10 flex items-center justify-center text-caption font-semibold text-navy">
                      {index + 1}
                    </div>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default KYCOnboardingSection;
