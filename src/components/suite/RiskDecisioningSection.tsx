import { BarChart3, Users, FileSearch, GitBranch } from "lucide-react";

const features = [
  {
    icon: BarChart3,
    title: "Risk Scoring",
    description: "Assign risk scores at onboarding and update dynamically over time.",
  },
  {
    icon: Users,
    title: "Customer Risk Categorisation",
    description: "Categorise customers by risk tier for proportionate oversight.",
  },
  {
    icon: FileSearch,
    title: "Enhanced Due Diligence",
    description: "Trigger and manage EDD workflows for higher-risk customers.",
  },
  {
    icon: GitBranch,
    title: "Risk-Based Workflows",
    description: "Automate compliance actions based on risk assessment outcomes.",
  },
];

export const RiskDecisioningSection = () => {
  return (
    <section className="section-padding bg-background">
      <div className="container-enterprise">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="lg:order-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 text-caption font-medium text-navy bg-navy/5 rounded-full">
              Risk-Based Approach
            </div>
            <h2 className="text-headline text-navy mb-4">
              Risk Assessment & Decisioning
            </h2>
            <p className="text-body-lg text-text-secondary mb-8">
              Implement a risk-based approach with dynamic risk scoring at onboarding 
              and throughout the customer lifecycle. Categorise customers by risk tier 
              and trigger appropriate compliance workflows.
            </p>

            <div className="space-y-4">
              {features.map((feature) => (
                <div key={feature.title} className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-md bg-navy/5 flex items-center justify-center">
                    <feature.icon className="w-5 h-5 text-navy" />
                  </div>
                  <div>
                    <h4 className="text-body font-semibold text-navy">{feature.title}</h4>
                    <p className="text-body-sm text-text-secondary">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:order-1 p-6 rounded-lg border border-divider bg-surface-subtle">
            <h4 className="text-body font-semibold text-navy mb-6">Risk Tier Distribution</h4>
            <div className="space-y-4">
              {[
                { tier: "Low Risk", percentage: 72, color: "bg-emerald-500" },
                { tier: "Medium Risk", percentage: 21, color: "bg-amber-500" },
                { tier: "High Risk", percentage: 7, color: "bg-red-500" },
              ].map((item) => (
                <div key={item.tier}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-body-sm text-text-secondary">{item.tier}</span>
                    <span className="text-body-sm font-medium text-navy">{item.percentage}%</span>
                  </div>
                  <div className="h-2 bg-navy/10 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${item.color} rounded-full`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <p className="text-caption text-text-tertiary mt-4">
              Illustrative risk distribution for a regulated financial institution.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RiskDecisioningSection;
