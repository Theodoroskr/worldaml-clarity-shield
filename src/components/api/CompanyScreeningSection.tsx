import { Building2, Users, Network, Search } from "lucide-react";

const features = [
  {
    icon: Building2,
    label: "Entity Sanctions Screening",
    description: "Screen companies and legal entities against global sanctions and watchlists.",
  },
  {
    icon: Search,
    label: "Company Adverse Media",
    description: "Adverse media coverage on corporate entities from structured news sources.",
  },
  {
    icon: Users,
    label: "Director & Shareholder Screening",
    description: "Screen key individuals associated with the entity including directors and shareholders.",
  },
  {
    icon: Network,
    label: "UBO Screening",
    description: "Beneficial ownership (UBO) screening to identify ultimate controlling parties.",
  },
];

const useCases = [
  "KYB onboarding",
  "Merchant onboarding",
  "Counterparty due diligence",
  "Supplier risk assessment",
];

export const CompanyScreeningSection = () => {
  return (
    <section className="section-padding bg-surface-subtle">
      <div className="container-enterprise">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          <div className="lg:order-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 text-caption font-medium text-navy bg-navy/5 rounded-full">
              Entity Screening
            </div>
            <h2 className="text-headline text-navy mb-4">
              AML Company Screening (KYB)
            </h2>
            <p className="text-body-lg text-text-secondary mb-8">
              Screen companies, legal entities, and their associated individuals. 
              Identify sanctions exposure, adverse media, and risks across the 
              corporate structure including beneficial owners.
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

          <div className="lg:order-1 lg:sticky lg:top-8">
            <div className="p-6 rounded-lg border border-divider bg-card">
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
                POST /v1/screen/company
              </code>
              <p className="text-body-sm text-text-secondary mt-2">
                Returns entity matches, associated individuals, and aggregate risk assessment.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CompanyScreeningSection;
