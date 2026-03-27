import { Landmark, Wallet, Bitcoin, CreditCard, Scale, Gamepad2 } from "lucide-react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const useCases = [
  {
    icon: Landmark,
    title: "Banks & Financial Institutions",
    description: "Digitise onboarding with automated ID verification, UBO checks, and AML screening in a single flow.",
    link: "/industries/banking",
  },
  {
    icon: Wallet,
    title: "Fintechs & Neobanks",
    description: "Onboard customers in minutes with automated KYC and real-time risk scoring at scale.",
    link: "/industries/fintech",
  },
  {
    icon: Bitcoin,
    title: "Crypto & Digital Assets",
    description: "Meet regulatory KYC requirements for wallet creation, fiat on-ramps, and institutional accounts.",
    link: "/industries/crypto",
  },
  {
    icon: CreditCard,
    title: "Payment Processors",
    description: "Verify merchants (KYB) and payers (KYC) before enabling payment processing capabilities.",
    link: "/industries/payments",
  },
  {
    icon: Scale,
    title: "Legal & Professional Services",
    description: "Automate client intake verification to meet AML obligations for law firms and accountancies.",
    link: "/industries/legal",
  },
  {
    icon: Gamepad2,
    title: "Gaming & Gambling",
    description: "Age and identity verification for player registration with integrated source-of-funds checks.",
    link: "/industries/gaming",
  },
];

export const KYCKYBApiUseCasesSection = () => {
  return (
    <section className="section-padding bg-background">
      <div className="container-enterprise">
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 text-caption font-medium text-navy bg-navy/5 rounded-full">
            Use Cases
          </div>
          <h2 className="text-headline text-navy mb-4">Who Uses a KYC/KYB API?</h2>
          <p className="text-body-lg text-text-secondary">
            Any business that needs to verify customers or corporate entities 
            programmatically during onboarding or periodic reviews.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {useCases.map((uc) => (
            <Link
              key={uc.title}
              to={uc.link}
              className="group p-6 rounded-lg border border-divider bg-card hover:border-teal/30 transition-colors"
            >
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-md bg-navy/5 text-navy mb-4">
                <uc.icon className="w-5 h-5" />
              </div>
              <h3 className="text-body font-semibold text-navy mb-2 group-hover:text-teal transition-colors">
                {uc.title}
              </h3>
              <p className="text-body-sm text-text-secondary mb-3">{uc.description}</p>
              <span className="inline-flex items-center gap-1 text-caption font-medium text-teal">
                Learn more <ArrowRight className="w-3 h-3" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default KYCKYBApiUseCasesSection;
