import { UserCheck, FileCheck, BarChart3, Shield, Globe, Clock } from "lucide-react";

const features = [
  {
    icon: UserCheck,
    label: "Identity Verification",
    description: "Verify customer identity against authoritative government and commercial data sources with real-time validation.",
  },
  {
    icon: FileCheck,
    label: "Document Validation",
    description: "Automated document authentication with OCR extraction, fraud detection, and liveness checks for remote onboarding.",
  },
  {
    icon: BarChart3,
    label: "Risk-Based Onboarding",
    description: "Dynamically assess customer risk during onboarding with configurable risk scoring models and thresholds.",
  },
  {
    icon: Shield,
    label: "Integrated AML Screening",
    description: "Real-time screening against global sanctions lists, PEP databases, and adverse media at the point of onboarding.",
  },
  {
    icon: Globe,
    label: "Global Coverage",
    description: "Support for 240+ countries with localised ID verification and compliance requirements.",
  },
  {
    icon: Clock,
    label: "Fast Onboarding",
    description: "Reduce customer onboarding time from days to minutes with automated workflows and instant verification.",
  },
];

export const KYCOnboardingSection = () => {
  return (
    <section className="section-padding bg-background" id="kyc-onboarding">
      <div className="container-enterprise">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 text-caption font-medium text-navy bg-navy/5 rounded-full">
            Individual Onboarding
          </div>
          <h2 className="text-headline text-navy mb-4">
            KYC Onboarding: Know Your Customer Compliance
          </h2>
          <p className="text-body-lg text-text-secondary">
            Streamline individual customer onboarding with comprehensive Know Your Customer (KYC) 
            verification. WorldAML Suite combines identity verification, document validation, and 
            AML screening into a single, efficient workflow that meets regulatory requirements 
            while delivering a seamless customer experience.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {features.map((feature) => (
            <div key={feature.label} className="p-6 rounded-lg border border-divider bg-card">
              <div className="w-12 h-12 rounded-lg bg-navy/5 flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-navy" />
              </div>
              <h4 className="text-body font-semibold text-navy mb-2">{feature.label}</h4>
              <p className="text-body-sm text-text-secondary">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="p-6 rounded-lg border border-divider bg-surface-subtle">
            <h4 className="text-body font-semibold text-navy mb-4">KYC Onboarding Workflow</h4>
            <ol className="space-y-3">
              {[
                "Collect customer personal information and consent",
                "Verify identity against authoritative data sources",
                "Validate government-issued ID documents",
                "Screen against sanctions, PEP, and adverse media",
                "Calculate risk score and assign risk tier",
                "Approve, reject, or escalate for manual review",
              ].map((step, index) => (
                <li key={step} className="flex items-start gap-3 text-body-sm text-text-secondary">
                  <div className="w-6 h-6 rounded-full bg-navy/10 flex items-center justify-center text-caption font-semibold text-navy flex-shrink-0">
                    {index + 1}
                  </div>
                  <span className="pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </div>
          
          <div className="p-6 rounded-lg border border-divider bg-surface-subtle">
            <h4 className="text-body font-semibold text-navy mb-4">Regulatory Compliance</h4>
            <p className="text-body-sm text-text-secondary mb-4">
              WorldAML Suite KYC onboarding helps regulated entities meet requirements under:
            </p>
            <ul className="space-y-2">
              {[
                "FATF Recommendations on Customer Due Diligence",
                "EU Anti-Money Laundering Directives (AMLD)",
                "US Bank Secrecy Act (BSA) and USA PATRIOT Act",
                "UK Money Laundering Regulations",
                "Local regulatory requirements across 240+ jurisdictions",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-body-sm text-text-secondary">
                  <span className="text-teal">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default KYCOnboardingSection;
