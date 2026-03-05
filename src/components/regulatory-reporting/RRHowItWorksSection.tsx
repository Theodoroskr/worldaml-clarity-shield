import { ArrowRight } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Collect",
    description:
      "Ingest account holder data, self-certifications (W-8, W-9, CRS self-cert), and transaction records via API batch upload or direct core banking connector.",
  },
  {
    number: "02",
    title: "Classify",
    description:
      "Automatically classify accounts by reportability status — applying CRS entity type logic, FATCA status categories, and FINTRAC reporting thresholds.",
  },
  {
    number: "03",
    title: "Validate",
    description:
      "Run pre-submission validation: TIN format checks, missing documentation flags, schema compliance, and cross-regime consistency checks.",
  },
  {
    number: "04",
    title: "File",
    description:
      "Generate jurisdiction-ready XML or structured report files. Submit directly via IDES (FATCA), local CRS portal, or FINTRAC F2R system with full status tracking.",
  },
  {
    number: "05",
    title: "Archive",
    description:
      "Every report, validation run, and submission event is stored in an immutable audit log with timestamps, operator IDs, and supporting documentation links.",
  },
];

const RRHowItWorksSection = () => {
  return (
    <section className="section-padding bg-surface-subtle">
      <div className="container-enterprise">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-teal font-semibold text-body-sm uppercase tracking-wider mb-3">How It Works</p>
          <h2 className="text-navy mb-4">Five Steps from Data to Filed Report</h2>
          <p className="text-body text-text-secondary">
            A linear, auditable workflow that takes your raw account data and transforms it 
            into compliant, submission-ready regulatory reports.
          </p>
        </div>
        <div className="relative">
          {/* Connector line — desktop only */}
          <div className="hidden lg:block absolute top-10 left-[10%] right-[10%] h-0.5 bg-divider" aria-hidden="true" />
          <div className="grid lg:grid-cols-5 gap-6 relative">
            {steps.map((step, idx) => (
              <div key={step.number} className="relative flex flex-col items-center text-center lg:items-start lg:text-left">
                {/* Step circle */}
                <div className="relative z-10 flex items-center justify-center w-20 h-20 rounded-2xl bg-navy text-white mb-5 shrink-0">
                  <div>
                    <p className="text-caption text-white/60 font-mono">{step.number}</p>
                    <p className="text-lg font-bold leading-tight">{step.title}</p>
                  </div>
                </div>
                <p className="text-body-sm text-text-secondary">{step.description}</p>
                {/* Arrow between steps on mobile */}
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

export default RRHowItWorksSection;
