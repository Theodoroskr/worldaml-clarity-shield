import { Database, FileText, Clock, ClipboardList } from "lucide-react";

const features = [
  {
    icon: Database,
    title: "API-Enabled Logs",
    description: "Access screening and activity logs via API for integration with external systems.",
  },
  {
    icon: FileText,
    title: "Screening History",
    description: "Full screening history per individual or entity with timestamped records.",
  },
  {
    icon: Clock,
    title: "Activity Tracking",
    description: "Track user actions, workflow events, and status changes throughout the platform.",
  },
  {
    icon: ClipboardList,
    title: "Audit-Ready Records",
    description: "Structured records designed to support regulatory examinations and compliance reviews.",
  },
];

export const SuiteLogsAuditSection = () => {
  return (
    <section className="section-padding bg-background" id="logs-audit">
      <div className="container-enterprise">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 text-caption font-medium text-navy bg-navy/5 rounded-full">
            Logs & Audit
          </div>
          <h2 className="text-headline text-navy mb-4">
            Audit Trail & Compliance Records
          </h2>
          <p className="text-body-lg text-text-secondary">
            Maintain comprehensive audit trails for all screening and workflow 
            activities. Access logs via API and generate records for regulatory 
            examinations and internal compliance reviews.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="p-6 rounded-lg border border-divider bg-card"
            >
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-md bg-navy/5 text-navy mb-4">
                <feature.icon className="w-5 h-5" />
              </div>
              <h3 className="text-body font-semibold text-navy mb-2">{feature.title}</h3>
              <p className="text-body-sm text-text-secondary">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SuiteLogsAuditSection;
