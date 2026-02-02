import { Shield, AlertTriangle, ClipboardList, Search, Database, Zap } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Sanctions Screening",
    description: "Screen against OFAC, EU, UN, and 200+ global sanctions lists with real-time updates.",
  },
  {
    icon: AlertTriangle,
    title: "PEP Screening",
    description: "Identify Politically Exposed Persons and their relatives and close associates (RCAs).",
  },
  {
    icon: Search,
    title: "Adverse Media Screening",
    description: "Screen against curated global news sources for financial crime and reputational risk indicators.",
  },
  {
    icon: ClipboardList,
    title: "Case Management",
    description: "Review, investigate, and resolve potential matches with comprehensive case management tools.",
  },
  {
    icon: Database,
    title: "Centralised Results",
    description: "View all screening results across data sources in a single, unified compliance dashboard.",
  },
  {
    icon: Zap,
    title: "Batch Screening",
    description: "Screen large volumes of customers efficiently with automated batch processing capabilities.",
  },
];

const screeningCoverage = [
  { category: "Sanctions", details: "OFAC SDN, EU Consolidated, UN Security Council, HMT, and 200+ global lists" },
  { category: "PEPs", details: "Politically Exposed Persons across all levels of government and state-owned enterprises" },
  { category: "Adverse Media", details: "Curated news sources covering financial crime, fraud, corruption, and regulatory actions" },
  { category: "Watchlists", details: "Law enforcement lists, regulatory enforcement actions, and industry-specific databases" },
];

export const AMLScreeningSection = () => {
  return (
    <section className="section-padding bg-background" id="aml-screening">
      <div className="container-enterprise">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 text-caption font-medium text-teal bg-teal/10 rounded-full">
            Screening & Case Management
          </div>
          <h2 className="text-headline text-navy mb-4">
            AML Screening: Sanctions, PEP & Adverse Media
          </h2>
          <p className="text-body-lg text-text-secondary">
            Screen individuals and businesses against comprehensive global databases including 
            sanctions lists, Politically Exposed Persons (PEPs), and adverse media. WorldAML 
            Suite provides real-time screening with intelligent match scoring and integrated 
            case management for efficient compliance operations.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="p-6 rounded-lg border border-divider bg-card"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-navy/5 text-navy mb-4">
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-body font-semibold text-navy mb-2">{feature.title}</h3>
              <p className="text-body-sm text-text-secondary">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="p-8 rounded-xl border border-divider bg-surface-subtle">
          <h4 className="text-lg font-semibold text-navy mb-6 text-center">Global Screening Coverage</h4>
          <div className="grid md:grid-cols-2 gap-6">
            {screeningCoverage.map((item) => (
              <div key={item.category} className="flex gap-4">
                <div className="w-2 h-2 rounded-full bg-teal mt-2 flex-shrink-0" />
                <div>
                  <h5 className="font-semibold text-navy mb-1">{item.category}</h5>
                  <p className="text-body-sm text-text-secondary">{item.details}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-text-tertiary mt-6 pt-6 border-t border-divider">
            Data powered by LexisNexis Risk Solutions — WorldCompliance® and Bridger Insight XG®
          </p>
        </div>
      </div>
    </section>
  );
};

export default AMLScreeningSection;
