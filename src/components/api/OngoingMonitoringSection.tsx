import { RefreshCw, Bell, Webhook, Clock } from "lucide-react";

const features = [
  {
    icon: RefreshCw,
    title: "Automatic Re-screening",
    description: "Subjects are automatically re-screened when underlying data changes.",
  },
  {
    icon: Bell,
    title: "Change Detection",
    description: "Detection of new sanctions designations, PEP exposure, or adverse media.",
  },
  {
    icon: Webhook,
    title: "Event-Driven Alerts",
    description: "Receive alerts via API polling or webhooks when risk status changes.",
  },
  {
    icon: Clock,
    title: "Configurable Frequency",
    description: "Set monitoring frequency based on risk tier and regulatory requirements.",
  },
];

export const OngoingMonitoringSection = () => {
  return (
    <section className="section-padding bg-background">
      <div className="container-enterprise">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 text-caption font-medium text-teal bg-teal/10 rounded-full">
            Continuous Compliance
          </div>
          <h2 className="text-headline text-navy mb-4">
            Ongoing AML Monitoring
          </h2>
          <p className="text-body-lg text-text-secondary">
            Continuous compliance, not one-off checks. Monitor your customers and 
            counterparties for changes in sanctions status, PEP exposure, and adverse 
            media coverage throughout the relationship lifecycle.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="p-6 rounded-lg border border-divider bg-card text-center"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-teal/10 text-teal mb-4">
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-body font-semibold text-navy mb-2">{feature.title}</h3>
              <p className="text-body-sm text-text-secondary">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 p-6 rounded-lg border border-divider bg-surface-subtle max-w-2xl mx-auto">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-md bg-navy/5 flex items-center justify-center">
              <Webhook className="w-5 h-5 text-navy" />
            </div>
            <div>
              <code className="text-caption text-navy font-mono">
                POST /v1/webhooks/configure
              </code>
              <p className="text-body-sm text-text-secondary mt-2">
                Configure webhook endpoints to receive real-time notifications when 
                monitored subjects trigger alerts. Supports retry logic and signature verification.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OngoingMonitoringSection;
