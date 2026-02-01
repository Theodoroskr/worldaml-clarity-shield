import { User, Shield, AlertTriangle, BarChart3 } from "lucide-react";

const features = [
  {
    icon: Shield,
    label: "Sanctions Screening",
    description: "Screen against global sanctions lists including OFAC, EU, UN, and regional regimes.",
  },
  {
    icon: User,
    label: "PEPs & RCAs",
    description: "Identify Politically Exposed Persons and their Relatives and Close Associates.",
  },
  {
    icon: AlertTriangle,
    label: "Adverse Media",
    description: "Structured adverse media from curated global sources across multiple languages.",
  },
  {
    icon: BarChart3,
    label: "Risk Scoring",
    description: "Dynamic risk score per individual based on screening results and configurable thresholds.",
  },
];

const useCases = [
  "KYC onboarding",
  "Account opening",
  "Periodic reviews",
  "Customer re-certification",
];

export const CustomerScreeningSection = () => {
  return (
    <section className="section-padding bg-background">
      <div className="container-enterprise">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 text-caption font-medium text-navy bg-navy/5 rounded-full">
              Individual Screening
            </div>
            <h2 className="text-headline text-navy mb-4">
              AML Customer Screening
            </h2>
            <p className="text-body-lg text-text-secondary mb-8">
              Screen individuals against sanctions lists, PEP databases, and adverse 
              media sources. Receive structured results with match details and risk 
              indicators for informed decisioning.
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

          <div className="lg:sticky lg:top-8">
            <div className="p-6 rounded-lg border border-divider bg-surface-subtle">
              <h4 className="text-body font-semibold text-navy mb-4">Use Cases</h4>
              <ul className="space-y-3">
                {useCases.map((useCase) => (
                  <li key={useCase} className="flex items-center gap-3 text-body-sm text-text-secondary">
                    <div className="w-1.5 h-1.5 rounded-full bg-teal" />
                    {useCase}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 p-6 rounded-lg border border-divider bg-card">
              <code className="text-caption text-navy font-mono">
                POST /v1/screen/individual
              </code>
              <p className="text-body-sm text-text-secondary mt-2">
                Returns match results, risk score, and monitoring status in a single request.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CustomerScreeningSection;
