import { Sliders, Target, GitBranch } from "lucide-react";

const features = [
  {
    icon: Sliders,
    title: "Configurable Thresholds",
    description: "Set screening sensitivity and match thresholds aligned to your institutional risk appetite.",
  },
  {
    icon: Target,
    title: "Risk Indicators",
    description: "Receive structured risk indicators with each screening response for informed decisioning.",
  },
  {
    icon: GitBranch,
    title: "Decisioning Workflows",
    description: "Support for risk-based decisioning workflows with configurable escalation rules.",
  },
];

export const RiskLogicSection = () => {
  return (
    <section className="section-padding bg-background">
      <div className="container-enterprise">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 text-caption font-medium text-teal bg-teal/10 rounded-full">
              Risk-Based Logic
            </div>
            <h2 className="text-headline text-navy mb-4">
              Risk-Based Screening Configuration
            </h2>
            <p className="text-body-lg text-text-secondary mb-8">
              Configure screening parameters and thresholds aligned to your institutional 
              risk appetite. WorldAML API supports risk-based decisioning workflows 
              with structured risk indicators in every response.
            </p>

            <div className="space-y-6">
              {features.map((feature) => (
                <div key={feature.title} className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-md bg-teal/10 flex items-center justify-center">
                    <feature.icon className="w-5 h-5 text-teal" />
                  </div>
                  <div>
                    <h4 className="text-body font-semibold text-navy">{feature.title}</h4>
                    <p className="text-body-sm text-text-secondary">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-lg border border-divider bg-surface-subtle">
            <h4 className="text-body font-semibold text-navy mb-4">Response Structure</h4>
            <div className="bg-navy rounded-lg p-4 overflow-x-auto">
              <pre className="text-body-sm text-slate-light font-mono whitespace-pre">
{`{
  "entity_id": "ent_123abc",
  "screening_status": "completed",
  "risk_indicators": {
    "sanctions_match": false,
    "pep_match": true,
    "adverse_media": 2,
    "risk_level": "medium"
  },
  "monitoring_status": "active",
  "next_review": "2024-06-01"
}`}
              </pre>
            </div>
            <p className="text-body-sm text-text-tertiary mt-4">
              Every screening response includes structured risk indicators for integration 
              into your decisioning workflows.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RiskLogicSection;
