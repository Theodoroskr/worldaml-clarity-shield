import { Landmark, Wallet, Bitcoin, CreditCard, Scale, Gamepad2 } from "lucide-react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const useCases = [
  {
    icon: Landmark,
    title: "Banks & Trade Finance",
    description: "Screen counterparties and beneficiaries in real time before processing wire transfers and trade transactions.",
    link: "/industries/banking",
  },
  {
    icon: Wallet,
    title: "Fintechs & Neobanks",
    description: "Gate onboarding and payment flows with inline sanctions checks — zero manual intervention required.",
    link: "/industries/fintech",
  },
  {
    icon: Bitcoin,
    title: "Crypto Exchanges",
    description: "Meet Travel Rule requirements by screening wallet holders and counterparties before transaction settlement.",
    link: "/industries/crypto",
  },
  {
    icon: CreditCard,
    title: "Payment Processors",
    description: "Screen merchants and payees in batch before payouts to avoid processing sanctioned transactions.",
    link: "/industries/payments",
  },
  {
    icon: Scale,
    title: "Legal & Advisory",
    description: "Automate conflict-of-interest and sanctions checks during client onboarding for law firms and consultancies.",
    link: "/industries/legal",
  },
  {
    icon: Gamepad2,
    title: "iGaming & Betting",
    description: "Screen player registrations and high-value deposit sources to comply with gambling AML regulations.",
    link: "/industries/gaming",
  },
];

export const SanctionsApiUseCasesSection = () => {
  return (
    <section className="section-padding bg-surface-subtle">
      <div className="container-enterprise">
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 text-caption font-medium text-navy bg-navy/5 rounded-full">
            Use Cases
          </div>
          <h2 className="text-headline text-navy mb-4">Who Uses Sanctions Screening APIs?</h2>
          <p className="text-body-lg text-text-secondary">
            Any regulated entity that processes transactions, onboards customers, or 
            manages counterparty risk benefits from automated sanctions screening.
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

export default SanctionsApiUseCasesSection;
