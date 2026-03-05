import { ArrowRight } from "lucide-react";

const steps = [
  { number: "01", title: "Submit", description: "Customer submits identity documents or entity details via the Suite UI or API. Supports individual ID, passport, utility documents, and company registration data." },
  { number: "02", title: "Verify", description: "Document authenticity and identity verification checks run automatically. Company registry lookups and UBO mapping execute in real time for business entities." },
  { number: "03", title: "Screen", description: "The subject — and for KYB, all directors and UBOs — are screened against sanctions, PEP, adverse media, and RCA databases." },
  { number: "04", title: "Score", description: "Risk assessment criteria are applied automatically. The customer receives a risk tier (Low / Medium / High) based on your configured risk matrix." },
  { number: "05", title: "Onboard", description: "Clean results proceed to onboarding. Matches or high-risk triggers route to the compliance review queue for case management and EDD if required." },
];

const KYCHowItWorksSection = () => {
  return (
    <section className="section-padding bg-background">
      <div className="container-enterprise">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-teal font-semibold text-body-sm uppercase tracking-wider mb-3">How It Works</p>
          <h2 className="text-navy mb-4">From Identity Submission to Onboarding Decision</h2>
          <p className="text-body text-text-secondary">
            A single, auditable flow covering both KYC and KYB — from document submission to compliance approval.
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

export default KYCHowItWorksSection;
