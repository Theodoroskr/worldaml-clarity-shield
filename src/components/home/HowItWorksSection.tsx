import { UserCheck, Shield, Eye, Scale } from "lucide-react";
import { Link } from "react-router-dom";

const steps = [
  {
    icon: UserCheck,
    step: "1",
    title: "KYC & KYB",
    description: "Verify individuals and businesses at onboarding with automated identity and entity checks.",
    link: "/kyc-kyb-api",
  },
  {
    icon: Shield,
    step: "2",
    title: "AML Screening",
    description: "Screen against global sanctions lists, PEP databases, and adverse media in real time.",
    link: "/aml-api",
  },
  {
    icon: Eye,
    step: "3",
    title: "Ongoing Monitoring",
    description: "Detect changes in risk status automatically — no manual re-screening required.",
    link: "/sanctions-screening-api",
  },
  {
    icon: Scale,
    step: "4",
    title: "Risk Assessment",
    description: "Apply configurable risk scoring to prioritise reviews and satisfy regulatory expectations.",
    link: "/platform/risk-assessment",
  },
];

export const HowItWorksSection = () => {
  return (
    <section className="section-padding bg-surface-subtle">
      <div className="container-enterprise">
        <h2 className="text-headline text-navy mb-12 text-center">
          From Onboarding to Ongoing Monitoring — in Four Steps
        </h2>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={step.title} className="relative">
              {/* Connector line (hidden on mobile, last item) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-divider -translate-x-1/2 z-0" />
              )}
              
              <div className="relative z-10 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 text-accent mb-4">
                  <step.icon className="w-7 h-7" />
                </div>
                <div className="text-caption font-medium text-text-tertiary mb-2">
                  Step {step.step}
                </div>
                <h3 className="text-body font-semibold text-navy mb-2">
                  {step.title}
                </h3>
                <p className="text-body-sm text-text-secondary">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
