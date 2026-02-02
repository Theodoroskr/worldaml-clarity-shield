import { UserCheck, Shield, BarChart3, Eye } from "lucide-react";

const features = [
  {
    icon: UserCheck,
    title: "Customer Onboarding Screening",
    description: "Screen individuals during onboarding against global watchlists and databases.",
  },
  {
    icon: Shield,
    title: "Sanctions, PEP & Adverse Media",
    description: "Comprehensive checks against sanctions lists, PEP databases, and adverse media sources.",
  },
  {
    icon: BarChart3,
    title: "Risk Profile Review",
    description: "Review and assess individual risk profiles based on screening results.",
  },
  {
    icon: Eye,
    title: "Monitoring Visibility",
    description: "View ongoing monitoring status and alerts for screened individuals.",
  },
];

export const KYCOnboardingSection = () => {
  return (
    <section className="section-padding bg-background" id="kyc-module">
      <div className="container-enterprise">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 text-caption font-medium text-navy bg-navy/5 rounded-full">
              KYC Module
            </div>
            <h2 className="text-headline text-navy mb-4">
              KYC – Individuals
            </h2>
            <p className="text-body-lg text-text-secondary mb-8">
              Screen and onboard individual customers with integrated AML checks. 
              Review risk profiles, manage screening results, and maintain visibility 
              over ongoing monitoring status.
            </p>

            <div className="space-y-6">
              {features.map((feature) => (
                <div key={feature.title} className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-md bg-navy/5 flex items-center justify-center">
                    <feature.icon className="w-5 h-5 text-navy" />
                  </div>
                  <div>
                    <h4 className="text-body font-semibold text-navy">{feature.title}</h4>
                    <p className="text-body-sm text-text-secondary">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-6 rounded-lg border border-divider bg-surface-subtle">
              <h4 className="text-body font-semibold text-navy mb-4">KYC Workflow</h4>
              <ol className="space-y-3">
                {[
                  "Collect customer information",
                  "Screen against sanctions, PEP, and adverse media",
                  "Review screening results and matches",
                  "Assign risk categorisation",
                  "Approve, reject, or escalate for review",
                  "Enable ongoing monitoring",
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
          </div>
        </div>
      </div>
    </section>
  );
};

export default KYCOnboardingSection;
