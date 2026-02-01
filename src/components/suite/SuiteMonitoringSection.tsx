import { RefreshCw, Bell, History, Eye } from "lucide-react";

const features = [
  {
    icon: RefreshCw,
    title: "Continuous Monitoring",
    description: "Automatically monitor all onboarded individuals and businesses.",
  },
  {
    icon: Bell,
    title: "Change Detection",
    description: "Detect new sanctions, PEP exposure, or adverse media in real time.",
  },
  {
    icon: History,
    title: "Monitoring History",
    description: "View full monitoring history and timeline for each customer.",
  },
  {
    icon: Eye,
    title: "Lifecycle Visibility",
    description: "Track risk changes throughout the entire customer relationship.",
  },
];

export const SuiteMonitoringSection = () => {
  return (
    <section className="section-padding bg-surface-subtle">
      <div className="container-enterprise">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 text-caption font-medium text-navy bg-navy/5 rounded-full">
              Continuous Compliance
            </div>
            <h2 className="text-headline text-navy mb-4">
              Ongoing Monitoring
            </h2>
            <p className="text-body-lg text-text-secondary mb-8">
              Maintain continuous oversight of all onboarded entities. Automatically 
              detect changes in sanctions status, PEP exposure, and adverse media 
              coverage throughout the customer lifecycle.
            </p>

            <div className="space-y-4">
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

          <div className="p-6 rounded-lg border border-divider bg-card">
            <h4 className="text-body font-semibold text-navy mb-4">Monitoring Timeline</h4>
            <div className="space-y-4">
              {[
                { date: "Jan 2025", event: "Customer onboarded", status: "Low risk" },
                { date: "Mar 2025", event: "Periodic review completed", status: "Low risk" },
                { date: "Jun 2025", event: "Adverse media detected", status: "Medium risk" },
                { date: "Jun 2025", event: "EDD review initiated", status: "Under review" },
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-2 h-2 rounded-full bg-teal mt-2" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-caption text-text-tertiary">{item.date}</span>
                      <span className="text-caption text-teal">{item.status}</span>
                    </div>
                    <p className="text-body-sm text-text-secondary">{item.event}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SuiteMonitoringSection;
