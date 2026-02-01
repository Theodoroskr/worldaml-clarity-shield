import { Shield, AlertTriangle, ClipboardList, Search } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Comprehensive Screening",
    description: "Screen against global sanctions lists, PEP databases, and adverse media sources.",
  },
  {
    icon: AlertTriangle,
    title: "Risk-Based Alerts",
    description: "Receive alerts prioritised by risk level and match confidence.",
  },
  {
    icon: Search,
    title: "Centralised Results",
    description: "View all screening results in a single, unified interface.",
  },
  {
    icon: ClipboardList,
    title: "Case Review",
    description: "Review, investigate, and resolve matches with full audit trail.",
  },
];

export const AMLScreeningSection = () => {
  return (
    <section className="section-padding bg-background">
      <div className="container-enterprise">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 text-caption font-medium text-teal bg-teal/10 rounded-full">
            Screening & Case Management
          </div>
          <h2 className="text-headline text-navy mb-4">
            AML Screening & Case Review
          </h2>
          <p className="text-body-lg text-text-secondary">
            Screen individuals and businesses against sanctions, PEP databases, and adverse 
            media. Review matches in a centralised interface designed for compliance teams, 
            with full audit trail and case management capabilities.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="p-6 rounded-lg border border-divider bg-card text-center"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-navy/5 text-navy mb-4">
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-body font-semibold text-navy mb-2">{feature.title}</h3>
              <p className="text-body-sm text-text-secondary">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 p-6 rounded-lg border border-divider bg-surface-subtle max-w-3xl mx-auto">
          <h4 className="text-body font-semibold text-navy mb-4 text-center">Screening Coverage</h4>
          <div className="grid sm:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-navy">Sanctions</div>
              <p className="text-body-sm text-text-secondary">OFAC, EU, UN, and 200+ global lists</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-navy">PEPs</div>
              <p className="text-body-sm text-text-secondary">Politically Exposed Persons & RCAs</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-navy">Adverse Media</div>
              <p className="text-body-sm text-text-secondary">Curated global news sources</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AMLScreeningSection;
