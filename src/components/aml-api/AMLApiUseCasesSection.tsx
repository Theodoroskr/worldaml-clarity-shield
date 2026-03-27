import { Landmark, Wallet, Bitcoin, CreditCard, Scale, Gamepad2 } from "lucide-react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const useCases = [
  {
    icon: Landmark,
    title: "Banks & Financial Institutions",
    description: "Embed AML screening into digital onboarding and periodic CDD refresh cycles.",
    link: "/industries/banking",
  },
  {
    icon: Wallet,
    title: "Fintechs & Neobanks",
    description: "Screen customers at sign-up and monitor accounts continuously as you scale.",
    link: "/industries/fintech",
  },
  {
    icon: Bitcoin,
    title: "Crypto & Digital Assets",
    description: "Meet Travel Rule and 6AMLD obligations with real-time wallet-holder screening.",
    link: "/industries/crypto",
  },
  {
    icon: CreditCard,
    title: "Payment Service Providers",
    description: "Screen merchants and payers before processing transactions to reduce chargeback and compliance risk.",
    link: "/industries/payments",
  },
  {
    icon: Scale,
    title: "Legal & Professional Services",
    description: "Automate client intake screening for law firms and accountancies under AML obligations.",
    link: "/industries/legal",
  },
  {
    icon: Gamepad2,
    title: "Gaming & Gambling",
    description: "Screen players during registration and flag high-risk activity patterns in real time.",
    link: "/industries/gaming",
  },
];

export const AMLApiUseCasesSection = () => {
  return (
    <section className="section-padding bg-background">
      <div className="container-enterprise">
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 text-caption font-medium text-navy bg-navy/5 rounded-full">
            Use Cases
          </div>
          <h2 className="text-headline text-navy mb-4">Built for Regulated Industries</h2>
          <p className="text-body-lg text-text-secondary">
            From neobanks to law firms, the AML API adapts to any compliance workflow 
            where programmatic screening is required.
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

export default AMLApiUseCasesSection;
