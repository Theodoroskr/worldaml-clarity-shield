import { RefreshCw, Bell, History, Eye, Shield, BarChart3 } from "lucide-react";

const features = [
  {
    icon: RefreshCw,
    title: "Continuous Monitoring",
    description: "Automatically monitor all onboarded individuals and businesses against updated databases.",
  },
  {
    icon: Bell,
    title: "Real-Time Alerts",
    description: "Receive instant notifications when sanctions, PEP, or adverse media status changes.",
  },
  {
    icon: History,
    title: "Monitoring History",
    description: "View complete monitoring history and timeline for each customer relationship.",
  },
  {
    icon: Eye,
    title: "Lifecycle Visibility",
    description: "Track risk profile changes throughout the entire customer relationship lifecycle.",
  },
  {
    icon: Shield,
    title: "Regulatory Compliance",
    description: "Meet ongoing monitoring requirements under AMLD, BSA, and other regulatory frameworks.",
  },
  {
    icon: BarChart3,
    title: "Risk Trend Analysis",
    description: "Analyse risk trends across your customer portfolio with comprehensive reporting.",
  },
];

export const SuiteMonitoringSection = () => {
  return (
    <section className="section-padding bg-surface-subtle" id="ongoing-monitoring">
      <div className="container-enterprise">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 text-caption font-medium text-navy bg-navy/5 rounded-full">
            Continuous Compliance
          </div>
          <h2 className="text-headline text-navy mb-4">
            Ongoing Monitoring: Continuous AML Compliance
          </h2>
          <p className="text-body-lg text-text-secondary">
            Maintain continuous oversight of all onboarded entities with automated ongoing monitoring. 
            WorldAML Suite automatically detects changes in sanctions status, PEP exposure, and 
            adverse media coverage throughout the customer lifecycle, ensuring you stay compliant 
            with regulatory requirements for continuous due diligence.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {features.map((feature) => (
            <div key={feature.title} className="p-6 rounded-lg border border-divider bg-card">
              <div className="w-12 h-12 rounded-lg bg-teal/10 flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-teal" />
              </div>
              <h4 className="text-body font-semibold text-navy mb-2">{feature.title}</h4>
              <p className="text-body-sm text-text-secondary">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="p-6 rounded-lg border border-divider bg-card">
            <h4 className="text-body font-semibold text-navy mb-4">Example Monitoring Timeline</h4>
            <div className="space-y-4">
              {[
                { date: "Jan 2025", event: "Customer onboarded — initial screening clear", status: "Low risk" },
                { date: "Mar 2025", event: "Periodic review completed — no changes detected", status: "Low risk" },
                { date: "Jun 2025", event: "Adverse media alert — negative news coverage", status: "Medium risk" },
                { date: "Jun 2025", event: "EDD review initiated — under investigation", status: "Under review" },
                { date: "Jul 2025", event: "EDD completed — risk mitigated", status: "Medium risk" },
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-2 h-2 rounded-full bg-teal mt-2" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="text-caption text-text-tertiary">{item.date}</span>
                      <span className="text-caption text-teal bg-teal/10 px-2 py-0.5 rounded">{item.status}</span>
                    </div>
                    <p className="text-body-sm text-text-secondary">{item.event}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="p-6 rounded-lg border border-divider bg-card">
            <h4 className="text-body font-semibold text-navy mb-4">Why Ongoing Monitoring Matters</h4>
            <p className="text-body-sm text-text-secondary mb-4">
              Regulatory frameworks require continuous monitoring of customer relationships:
            </p>
            <ul className="space-y-3">
              {[
                "FATF requires ongoing due diligence and monitoring of business relationships",
                "EU AMLD mandates continuous monitoring proportionate to risk level",
                "US BSA/AML requires ongoing customer due diligence programs",
                "Regulators expect timely detection of sanctions and PEP exposure changes",
                "Adverse media monitoring helps identify emerging reputational risks",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-body-sm text-text-secondary">
                  <span className="text-teal mt-1">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SuiteMonitoringSection;
