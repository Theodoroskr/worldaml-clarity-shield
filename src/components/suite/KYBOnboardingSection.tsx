import { Building2, Network, Users, Globe } from "lucide-react";

const features = [
  {
    icon: Building2,
    label: "Business Verification",
    description: "Verify legal entities against company registries and authoritative sources.",
  },
  {
    icon: Network,
    label: "UBO Identification",
    description: "Identify and screen ultimate beneficial owners across ownership structures.",
  },
  {
    icon: Users,
    label: "Director & Shareholder Screening",
    description: "Screen key individuals associated with the business entity.",
  },
  {
    icon: Globe,
    label: "Jurisdictional Risk Assessment",
    description: "Assess risk based on country of incorporation and operating jurisdictions.",
  },
];

export const KYBOnboardingSection = () => {
  return (
    <section className="section-padding bg-surface-subtle">
      <div className="container-enterprise">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          <div className="lg:order-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 text-caption font-medium text-navy bg-navy/5 rounded-full">
              Business Onboarding
            </div>
            <h2 className="text-headline text-navy mb-4">
              KYB Onboarding
            </h2>
            <p className="text-body-lg text-text-secondary mb-8">
              Onboard businesses with comprehensive corporate verification, beneficial 
              ownership identification, and screening of all associated individuals. 
              Assess jurisdictional risk and make informed onboarding decisions.
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

          <div className="lg:order-1 lg:sticky lg:top-8 space-y-6">
            <div className="p-6 rounded-lg border border-divider bg-card">
              <h4 className="text-body font-semibold text-navy mb-4">Corporate Structure Visibility</h4>
              <p className="text-body-sm text-text-secondary mb-4">
                Understand the full ownership structure of corporate entities, including:
              </p>
              <ul className="space-y-2">
                {[
                  "Shareholders and ownership percentages",
                  "Ultimate beneficial owners (UBOs)",
                  "Directors and officers",
                  "Parent and subsidiary relationships",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-body-sm text-text-secondary">
                    <div className="w-1.5 h-1.5 rounded-full bg-teal" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default KYBOnboardingSection;
