import { Building2, Network, Shield, Eye } from "lucide-react";

const features = [
  {
    icon: Building2,
    title: "Business Entity Screening",
    description: "Screen corporate entities against global watchlists and databases.",
  },
  {
    icon: Network,
    title: "UBO & Related Party Checks",
    description: "Identify and screen Ultimate Beneficial Owners and related parties.",
  },
  {
    icon: Shield,
    title: "Sanctions & Adverse Media",
    description: "Comprehensive screening against sanctions lists and adverse media sources.",
  },
  {
    icon: Eye,
    title: "Monitoring Status Tracking",
    description: "Track ongoing monitoring status for screened business entities.",
  },
];

export const KYBOnboardingSection = () => {
  return (
    <section className="section-padding bg-surface-subtle" id="kyb-module">
      <div className="container-enterprise">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 text-caption font-medium text-teal bg-teal/10 rounded-full">
              KYB Module
            </div>
            <h2 className="text-headline text-navy mb-4">
              KYB – Companies
            </h2>
            <p className="text-body-lg text-text-secondary mb-8">
              Screen and onboard business entities with comprehensive AML checks. 
              Verify UBOs and related parties, review entity risk profiles, and 
              track ongoing monitoring status.
            </p>

            <div className="space-y-6">
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

          <div className="space-y-6">
            <div className="p-6 rounded-lg border border-divider bg-card">
              <h4 className="text-body font-semibold text-navy mb-4">KYB Workflow</h4>
              <ol className="space-y-3">
                {[
                  "Collect business entity details",
                  "Identify shareholders and UBOs",
                  "Screen entity against watchlists",
                  "Screen directors and UBOs individually",
                  "Review results and assign risk tier",
                  "Enable ongoing monitoring",
                ].map((step, index) => (
                  <li key={step} className="flex items-start gap-3 text-body-sm text-text-secondary">
                    <div className="w-6 h-6 rounded-full bg-teal/20 flex items-center justify-center text-caption font-semibold text-teal flex-shrink-0">
                      {index + 1}
                    </div>
                    <span className="pt-0.5">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default KYBOnboardingSection;
