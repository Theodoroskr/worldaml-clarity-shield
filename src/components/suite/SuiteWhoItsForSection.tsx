import { Building, Landmark, Briefcase, Shield } from "lucide-react";

const audiences = [
  {
    icon: Landmark,
    title: "Banks & EMIs",
    description: "Full compliance lifecycle management for banking and electronic money institutions.",
  },
  {
    icon: Building,
    title: "Regulated Financial Institutions",
    description: "End-to-end AML compliance for investment firms, payment providers, and financial services.",
  },
  {
    icon: Briefcase,
    title: "Professional Services & Fiduciaries",
    description: "AML compliance for legal firms, trust companies, and corporate service providers.",
  },
  {
    icon: Shield,
    title: "Organisations Needing Out-of-the-Box AML",
    description: "Ready-to-use compliance platform without complex integration requirements.",
  },
];

export const SuiteWhoItsForSection = () => {
  return (
    <section className="section-padding bg-surface-subtle">
      <div className="container-enterprise">
        <div className="text-center mb-16">
          <h2 className="text-headline text-navy mb-4">Who It's For</h2>
          <p className="text-body-lg text-text-secondary max-w-2xl mx-auto">
            WorldAML Suite is designed for regulated organisations that need a 
            complete, ready-to-use AML compliance platform.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {audiences.map((audience) => (
            <div
              key={audience.title}
              className="p-6 rounded-lg border border-divider bg-card"
            >
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-md bg-navy/5 text-navy mb-4">
                <audience.icon className="w-5 h-5" />
              </div>
              <h3 className="text-body font-semibold text-navy mb-2">{audience.title}</h3>
              <p className="text-body-sm text-text-secondary">{audience.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SuiteWhoItsForSection;
