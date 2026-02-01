import { BarChart3, Sliders, CheckCircle } from "lucide-react";

const features = [
  {
    icon: BarChart3,
    title: "Dynamic Risk Scoring",
    description: "Risk scores calculated based on screening results, match confidence, and entity attributes.",
  },
  {
    icon: Sliders,
    title: "Configurable Thresholds",
    description: "Define risk thresholds aligned with your risk appetite and regulatory requirements.",
  },
  {
    icon: CheckCircle,
    title: "FATF Risk-Based Approach",
    description: "Supports the FATF risk-based approach (RBA) with proportionate risk assessment.",
  },
];

export const RiskAssessmentSection = () => {
  return (
    <section className="section-padding bg-surface-subtle">
      <div className="container-enterprise">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 text-caption font-medium text-navy bg-navy/5 rounded-full">
              Embedded by Default
            </div>
            <h2 className="text-headline text-navy mb-4">
              Risk Assessment
            </h2>
            <p className="text-body-lg text-text-secondary mb-8">
              Risk assessment is embedded by default in every screening response. 
              Every individual and entity receives a risk score based on screening 
              results, enabling automated decisioning and risk-based workflows.
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

          <div className="p-8 rounded-lg border border-divider bg-card">
            <h4 className="text-body font-semibold text-navy mb-6">Response Structure</h4>
            <pre className="text-body-sm text-slate overflow-x-auto bg-surface-subtle p-4 rounded-md">
{`{
  "subject": {
    "name": "John Smith",
    "type": "individual"
  },
  "riskAssessment": {
    "score": 72,
    "level": "medium",
    "factors": [
      "pep_relative",
      "adverse_media_historic"
    ]
  },
  "recommendation": "enhanced_due_diligence"
}`}
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RiskAssessmentSection;
