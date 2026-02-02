import { Users, Building2, Shield, RefreshCw } from "lucide-react";

const modules = [
  {
    icon: Users,
    title: "KYC – Individuals",
    description: "Customer onboarding screening with sanctions, PEP, and adverse media checks.",
  },
  {
    icon: Building2,
    title: "KYB – Companies",
    description: "Business entity screening with UBO and related party verification.",
  },
  {
    icon: Shield,
    title: "AML Screening",
    description: "Manual and automated screening with monitoring alerts and review workflows.",
  },
  {
    icon: RefreshCw,
    title: "Risk Assessment",
    description: "Customer and entity risk categorisation aligned to AML requirements.",
  },
];

export const WhatIsSuiteSection = () => {
  return (
    <section className="section-padding bg-surface-subtle">
      <div className="container-enterprise">
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 text-caption font-medium text-navy bg-navy/5 rounded-full">
            Platform Overview
          </div>
          <h2 className="text-headline text-navy mb-4">What is WorldAML Suite?</h2>
          <p className="text-body-lg text-text-secondary">
            WorldAML Suite provides a clean, compliance-focused interface for core 
            AML workflows. Designed for compliance teams, MLROs, and regulated 
            organisations that need structured workflows with clear separation 
            between platform and data sources.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {modules.map((item) => (
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
