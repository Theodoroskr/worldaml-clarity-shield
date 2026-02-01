import { Shield, Activity, AlertTriangle, UserCheck } from "lucide-react";

const modules = [
  {
    icon: Shield,
    title: "AML Screening",
    description: "Real-time screening against global sanctions lists, PEP databases, and adverse media sources. Comprehensive coverage across 200+ jurisdictions.",
    features: ["Sanctions & Watchlists", "PEP Screening", "Adverse Media"],
  },
  {
    icon: Activity,
    title: "Ongoing Monitoring",
    description: "Continuous surveillance of your customer base with instant alerts on status changes. Stay compliant without manual checks.",
    features: ["Real-time Alerts", "Batch Processing", "Custom Rules"],
  },
  {
    icon: AlertTriangle,
    title: "Risk Assessment",
    description: "Automated risk scoring with configurable rules engine. Make informed decisions with transparent, explainable risk factors.",
    features: ["Risk Scoring", "Rules Engine", "Audit Trail"],
  },
  {
    icon: UserCheck,
    title: "ID Verification Basic",
    description: "Document verification and identity checks to complete your compliance workflow. Streamlined onboarding for your customers.",
    features: ["Document Check", "Liveness Detection", "Database Lookup"],
  },
];

export const ProductModulesSection = () => {
  return (
    <section className="section-padding bg-surface-subtle">
      <div className="container-enterprise">
        {/* Section header */}
        <div className="max-w-2xl mb-16">
          <h2 className="text-headline text-navy mb-4">
            Complete AML Infrastructure
          </h2>
          <p className="text-body-lg text-text-secondary">
            Four integrated modules that cover your entire compliance lifecycle. 
            Use them together or independently based on your needs.
          </p>
        </div>

        {/* Modules grid */}
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {modules.map((module, index) => (
            <div
              key={module.title}
              className="group relative bg-card rounded-lg border border-divider p-6 lg:p-8 hover:border-slate-muted transition-all duration-300"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Icon */}
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-navy/5 text-navy mb-5">
                <module.icon className="w-6 h-6" />
              </div>

              {/* Content */}
              <h3 className="text-title text-navy mb-3">{module.title}</h3>
              <p className="text-body text-text-secondary mb-5">{module.description}</p>

              {/* Features */}
              <div className="flex flex-wrap gap-2">
                {module.features.map((feature) => (
                  <span
                    key={feature}
                    className="inline-flex px-3 py-1 text-caption font-medium text-slate bg-secondary rounded-full"
                  >
                    {feature}
                  </span>
                ))}
              </div>

              {/* Hover indicator */}
              <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-caption font-medium text-teal">Learn more →</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductModulesSection;
