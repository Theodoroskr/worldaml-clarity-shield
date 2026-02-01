import { Server, Zap, RefreshCw, Shield } from "lucide-react";

const capabilities = [
  {
    icon: Server,
    title: "Programmatic Access",
    description: "Full API access to screening, monitoring, and risk assessment capabilities.",
  },
  {
    icon: Zap,
    title: "Low-Latency Decisioning",
    description: "Sub-second response times for real-time compliance workflows.",
  },
  {
    icon: RefreshCw,
    title: "Automation Ready",
    description: "Designed for integration into automated onboarding and monitoring pipelines.",
  },
  {
    icon: Shield,
    title: "Enterprise Scale",
    description: "Built to handle high-volume environments with consistent performance.",
  },
];

export const WhatIsAPISection = () => {
  return (
    <section className="section-padding bg-surface-subtle">
      <div className="container-enterprise">
        <div className="max-w-3xl mb-16">
          <h2 className="text-headline text-navy mb-4">What is WorldAML API?</h2>
          <p className="text-body-lg text-text-secondary">
            WorldAML API provides programmatic access to AML screening and monitoring 
            capabilities, allowing organisations to integrate compliance directly into 
            their products and internal systems. Built for scalability, automation, 
            and low-latency decisioning.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {capabilities.map((item) => (
            <div
              key={item.title}
              className="p-6 rounded-lg border border-divider bg-card"
            >
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-md bg-navy/5 text-navy mb-4">
                <item.icon className="w-5 h-5" />
              </div>
              <h3 className="text-body font-semibold text-navy mb-2">{item.title}</h3>
              <p className="text-body-sm text-text-secondary">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhatIsAPISection;
