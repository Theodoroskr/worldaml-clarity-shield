import { Code, Zap, Webhook, Server, Lock, Globe } from "lucide-react";

const specs = [
  {
    icon: Code,
    label: "REST API (JSON)",
    description: "Standard REST architecture with JSON request/response format.",
  },
  {
    icon: Server,
    label: "Stateless Endpoints",
    description: "Stateless screening endpoints for simplified integration and scaling.",
  },
  {
    icon: Webhook,
    label: "Webhooks",
    description: "Event-driven webhooks for monitoring alerts and status changes.",
  },
  {
    icon: Zap,
    label: "High Throughput",
    description: "Built for high-volume environments with consistent performance.",
  },
  {
    icon: Globe,
    label: "Low Latency",
    description: "Sub-second response times for real-time compliance workflows.",
  },
  {
    icon: Lock,
    label: "Enterprise Security",
    description: "TLS encryption, API key authentication, and IP allowlisting.",
  },
];

export const TechnicalSpecsSection = () => {
  return (
    <section className="section-padding bg-background">
      <div className="container-enterprise">
        <div className="text-center mb-16">
          <h2 className="text-headline text-navy mb-4">Technical Characteristics</h2>
          <p className="text-body-lg text-text-secondary max-w-2xl mx-auto">
            WorldAML API is designed for production environments with enterprise-grade 
            reliability, security, and performance.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {specs.map((spec) => (
            <div
              key={spec.label}
              className="flex items-start gap-4 p-6 rounded-lg border border-divider bg-card"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-md bg-navy/5 flex items-center justify-center">
                <spec.icon className="w-5 h-5 text-navy" />
              </div>
              <div>
                <h4 className="text-body font-semibold text-navy">{spec.label}</h4>
                <p className="text-body-sm text-text-secondary">{spec.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TechnicalSpecsSection;
