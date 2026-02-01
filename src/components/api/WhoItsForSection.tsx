import { 
  Wallet, 
  ShoppingCart, 
  Coins, 
  Gamepad2, 
  Building 
} from "lucide-react";

const audiences = [
  {
    icon: Wallet,
    title: "Fintechs & Payment Providers",
    description: "Embed AML screening into payment flows and digital wallet onboarding.",
  },
  {
    icon: ShoppingCart,
    title: "Marketplaces & Platforms",
    description: "Screen sellers, vendors, and counterparties at scale.",
  },
  {
    icon: Coins,
    title: "Crypto & Digital Asset Providers",
    description: "VASP compliance with real-time screening for wallet onboarding.",
  },
  {
    icon: Gamepad2,
    title: "Gaming Operators",
    description: "Player verification and ongoing monitoring for regulated gaming.",
  },
  {
    icon: Building,
    title: "Banks & Financial Institutions",
    description: "Integrate modern AML infrastructure into existing core banking systems.",
  },
];

export const WhoItsForSection = () => {
  return (
    <section className="section-padding bg-surface-subtle">
      <div className="container-enterprise">
        <div className="text-center mb-16">
          <h2 className="text-headline text-navy mb-4">Who It's For</h2>
          <p className="text-body-lg text-text-secondary max-w-2xl mx-auto">
            WorldAML API is built for organisations that need to embed AML compliance 
            directly into their products and workflows.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
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

export default WhoItsForSection;
