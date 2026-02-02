import { Server, Zap, Layers, Shield } from "lucide-react";

const architectureFeatures = [
  {
    icon: Server,
    title: "RESTful API",
    description: "Standard REST architecture with JSON request and response formats.",
  },
  {
    icon: Zap,
    title: "Real-time & Batch",
    description: "Support for real-time single requests and batch processing for bulk operations.",
  },
  {
    icon: Layers,
    title: "Structured Responses",
    description: "Consistent, well-documented response structures across all endpoints.",
  },
  {
    icon: Shield,
    title: "Scale & Availability",
    description: "Built for high-volume environments with enterprise-grade availability.",
  },
];

export const APIArchitectureSection = () => {
  return (
    <section className="section-padding bg-navy">
      <div className="container-enterprise">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 text-caption font-medium text-accent bg-accent/10 rounded-full">
            API Architecture
          </div>
          <h2 className="text-headline text-white mb-4">
            Built for Integration
          </h2>
          <p className="text-body-lg text-slate-light">
            WorldAML API is designed for seamless integration into existing systems 
            and workflows, with consistent response structures and comprehensive documentation.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {architectureFeatures.map((feature) => (
            <div
              key={feature.title}
              className="p-6 rounded-lg border border-white/10 bg-white/5"
            >
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-md bg-accent/20 text-accent mb-4">
                <feature.icon className="w-5 h-5" />
              </div>
              <h3 className="text-body font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-body-sm text-slate-light">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
          <div className="text-center">
            <p className="text-2xl font-bold text-accent mb-1">99.9%</p>
            <p className="text-body-sm text-slate-light">Uptime SLA</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-accent mb-1">&lt;500ms</p>
            <p className="text-body-sm text-slate-light">Avg Response Time</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-accent mb-1">REST/JSON</p>
            <p className="text-body-sm text-slate-light">Standard Format</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default APIArchitectureSection;
