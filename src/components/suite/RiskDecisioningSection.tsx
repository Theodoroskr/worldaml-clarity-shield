import { BarChart3, Users, FileSearch, GitBranch, Target, AlertTriangle } from "lucide-react";

const features = [
  {
    icon: BarChart3,
    title: "Dynamic Risk Scoring",
    description: "Assign and update risk scores at onboarding and throughout the customer lifecycle.",
  },
  {
    icon: Users,
    title: "Risk Categorisation",
    description: "Categorise customers into risk tiers for proportionate oversight and resource allocation.",
  },
  {
    icon: FileSearch,
    title: "Enhanced Due Diligence",
    description: "Trigger and manage EDD workflows automatically for higher-risk customers.",
  },
  {
    icon: GitBranch,
    title: "Automated Workflows",
    description: "Automate compliance actions and escalations based on risk assessment outcomes.",
  },
  {
    icon: Target,
    title: "Risk Factor Analysis",
    description: "Analyse multiple risk factors including geography, industry, transaction patterns, and PEP exposure.",
  },
  {
    icon: AlertTriangle,
    title: "Risk Alerts",
    description: "Receive alerts when customer risk profiles change or exceed defined thresholds.",
  },
];

const riskFactors = [
  { factor: "Customer Type", examples: "Individual, corporate, trust, foundation" },
  { factor: "Geography", examples: "Country of residence, nationality, transaction destinations" },
  { factor: "Industry", examples: "High-risk sectors: gaming, crypto, money services" },
  { factor: "PEP Status", examples: "Politically Exposed Persons and their associates" },
  { factor: "Transaction Profile", examples: "Volume, frequency, and patterns of activity" },
  { factor: "Source of Funds", examples: "Origin and legitimacy of wealth and funds" },
];

export const RiskDecisioningSection = () => {
  return (
    <section className="section-padding bg-background" id="risk-assessment">
      <div className="container-enterprise">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 text-caption font-medium text-navy bg-navy/5 rounded-full">
            Risk-Based Approach
          </div>
          <h2 className="text-headline text-navy mb-4">
            Risk Assessment: Dynamic Risk Scoring & Decisioning
          </h2>
          <p className="text-body-lg text-text-secondary">
            Implement a risk-based approach to AML compliance with dynamic risk scoring, 
            customer categorisation, and automated decisioning workflows. WorldAML Suite 
            helps regulated institutions allocate compliance resources proportionately 
            based on customer risk profiles, as required by FATF and global regulators.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {features.map((feature) => (
            <div key={feature.title} className="p-6 rounded-lg border border-divider bg-card">
              <div className="w-12 h-12 rounded-lg bg-navy/5 flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-navy" />
              </div>
              <h4 className="text-body font-semibold text-navy mb-2">{feature.title}</h4>
              <p className="text-body-sm text-text-secondary">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="p-6 rounded-lg border border-divider bg-surface-subtle">
            <h4 className="text-body font-semibold text-navy mb-6">Risk Tier Distribution</h4>
            <div className="space-y-4 mb-6">
              {[
                { tier: "Low Risk", percentage: 72, color: "bg-emerald-500", description: "Standard CDD, periodic review" },
                { tier: "Medium Risk", percentage: 21, color: "bg-amber-500", description: "Enhanced monitoring, more frequent review" },
                { tier: "High Risk", percentage: 7, color: "bg-red-500", description: "EDD required, senior management approval" },
              ].map((item) => (
                <div key={item.tier}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-body-sm font-medium text-navy">{item.tier}</span>
                    <span className="text-body-sm font-semibold text-navy">{item.percentage}%</span>
                  </div>
                  <div className="h-3 bg-navy/10 rounded-full overflow-hidden mb-1">
                    <div 
                      className={`h-full ${item.color} rounded-full`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <p className="text-caption text-text-tertiary">{item.description}</p>
                </div>
              ))}
            </div>
            <p className="text-caption text-text-tertiary border-t border-divider pt-4">
              Illustrative distribution for a regulated financial institution.
            </p>
          </div>
          
          <div className="p-6 rounded-lg border border-divider bg-surface-subtle">
            <h4 className="text-body font-semibold text-navy mb-4">Risk Factors Assessed</h4>
            <div className="space-y-3">
              {riskFactors.map((item) => (
                <div key={item.factor} className="p-3 bg-card rounded-lg">
                  <h5 className="font-medium text-navy text-sm mb-1">{item.factor}</h5>
                  <p className="text-body-sm text-text-secondary">{item.examples}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RiskDecisioningSection;
