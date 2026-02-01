import { Users, Building2, Shield, RefreshCw } from "lucide-react";

const capabilities = [
  {
    icon: Users,
    title: "KYC Onboarding",
    description: "Verify individuals with integrated identity checks and AML screening.",
  },
  {
    icon: Building2,
    title: "KYB Onboarding",
    description: "Onboard businesses with UBO identification and corporate verification.",
  },
  {
    icon: Shield,
    title: "AML Screening",
    description: "Screen against sanctions, PEPs, and adverse media with case management.",
  },
  {
    icon: RefreshCw,
    title: "Ongoing Monitoring",
    description: "Continuous risk monitoring throughout the customer lifecycle.",
  },
];

export const WhatIsSuiteSection = () => {
  return (
    <section className="section-padding bg-surface-subtle">
      <div className="container-enterprise">
        <div className="max-w-3xl mb-16">
          <h2 className="text-headline text-navy mb-4">What is WorldAML Suite?</h2>
          <p className="text-body-lg text-text-secondary">
            WorldAML Suite is a ready-to-use compliance platform designed for compliance 
            teams, MLROs, and regulated organisations. It covers the full compliance 
            lifecycle from initial onboarding through to ongoing monitoring and risk 
            management — in a single, unified platform.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {capabilities.map((item) => (
            <div
              key={item.title}
              className="p-6 rounded-lg border border-divider bg-card"
            >
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-md bg-navy/5 text-navy mb-4">
                <item.icon className="w-5 h-5" />
              </div>
              <h3 className="text-body font-semibold text-navy mb-2">{item.title}</h3>
              <p className="text-body-sm text-text-secondary">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhatIsSuiteSection;
