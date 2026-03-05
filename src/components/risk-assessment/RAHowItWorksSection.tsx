import { ArrowRight } from "lucide-react";

const steps = [
  { number: "01", title: "Profile", description: "Customer data is collected and structured — individual or entity attributes, product usage, geography, and any existing screening results or flags." },
  { number: "02", title: "Score", description: "Weighted criteria are applied automatically using your configured risk matrix. Each criterion contributes to an overall numeric risk score." },
  { number: "03", title: "Categorise", description: "The numeric score maps to a risk tier — Low, Medium, or High — with configurable threshold bands. Results are recorded with full scoring rationale." },
  { number: "04", title: "Apply Controls", description: "Risk tier drives downstream controls: CDD depth, transaction monitoring thresholds, review frequency, and EDD triggers for high-risk customers." },
  { number: "05", title: "Review & Update", description: "Periodic review cycles and trigger-based re-assessments automatically update risk tiers as customer circumstances or data change over time." },
];

const RAHowItWorksSection = () => {
  return (
    <section className="section-padding bg-background">
      <div className="container-enterprise">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-teal font-semibold text-body-sm uppercase tracking-wider mb-3">How It Works</p>
          <h2 className="text-navy mb-4">From Customer Profile to Risk-Based Controls</h2>
          <p className="text-body text-text-secondary">
            Five steps from data collection to an auditable, regulator-ready risk classification.
          </p>
        </div>
        <div className="relative">
          <div className="hidden lg:block absolute top-10 left-[10%] right-[10%] h-0.5 bg-divider" aria-hidden="true" />
          <div className="grid lg:grid-cols-5 gap-6 relative">
            {steps.map((step, idx) => (
              <div key={step.number} className="relative flex flex-col items-center text-center lg:items-start lg:text-left">
                <div className="relative z-10 flex items-center justify-center w-20 h-20 rounded-2xl bg-navy text-white mb-5 shrink-0">
                  <div>
                    <p className="text-caption text-white/60 font-mono">{step.number}</p>
                    <p className="text-lg font-bold leading-tight">{step.title}</p>
                  </div>
                </div>
                <p className="text-body-sm text-text-secondary">{step.description}</p>
                {idx < steps.length - 1 && (
                  <div className="lg:hidden flex justify-center my-2 text-divider">
                    <ArrowRight className="w-5 h-5 rotate-90" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default RAHowItWorksSection;
