import { UserPlus, Users, RefreshCw, Layers } from "lucide-react";

const useCases = [
  {
    icon: UserPlus,
    title: "Digital Customer Onboarding",
    description: "Embed AML screening directly into digital onboarding flows for real-time compliance checks.",
  },
  {
    icon: Users,
    title: "KYC & KYB at Scale",
    description: "Screen individuals and businesses at scale during customer lifecycle events.",
  },
  {
    icon: RefreshCw,
    title: "Ongoing Monitoring",
    description: "Continuous monitoring of customers and counterparties with automated change detection.",
  },
  {
    icon: Layers,
    title: "System Integration",
    description: "Integrate screening capabilities into internal systems, CRMs, and compliance platforms.",
  },
];

export const APIUseCasesSection = () => {
  return (
    <section className="section-padding bg-background">
      <div className="container-enterprise">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 text-caption font-medium text-navy bg-navy/5 rounded-full">
            Use Cases
          </div>
          <h2 className="text-headline text-navy mb-4">
            Typical Integration Scenarios
          </h2>
          <p className="text-body-lg text-text-secondary">
            WorldAML API is designed for regulated institutions that need to embed 
            AML screening and monitoring into their existing systems and workflows.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {useCases.map((useCase) => (
            <div
              key={useCase.title}
              className="p-6 rounded-lg border border-divider bg-card"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-navy/5 text-navy mb-4">
                <useCase.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-navy mb-2">{useCase.title}</h3>
              <p className="text-body-sm text-text-secondary">{useCase.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default APIUseCasesSection;
