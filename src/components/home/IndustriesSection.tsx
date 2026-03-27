import { Link } from "react-router-dom";
import { Building2, Wallet, Gamepad2, Scale, Bitcoin, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";

const industries = [
  {
    icon: Building2,
    title: "Banks & EMIs",
    description: "Full regulatory compliance for traditional banking and electronic money institutions.",
  },
  {
    icon: Wallet,
    title: "Fintechs",
    description: "Scalable AML solutions for fast-growing payment and financial technology companies.",
  },
  {
    icon: Bitcoin,
    title: "Crypto & Digital Assets",
    description: "VASP compliance with specialized cryptocurrency address screening and FATF travel rule support.",
  },
  {
    icon: Gamepad2,
    title: "Gaming & Gambling",
    description: "Player verification and ongoing monitoring for regulated gaming operators.",
  },
  {
    icon: Scale,
    title: "Legal & Fiduciary",
    description: "Client due diligence for law firms, trust companies, and corporate service providers.",
  },
  {
    icon: CreditCard,
    title: "Payment Providers",
    description: "Transaction monitoring and merchant screening for PSPs and acquirers.",
  },
];

export const IndustriesSection = () => {
  return (
    <section className="section-padding bg-background">
      <div className="container-enterprise">
        {/* Section header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16">
          <div className="max-w-2xl">
            <h2 className="text-headline text-navy mb-4">
              Compliance Infrastructure for Every Regulated Sector
            </h2>
            <p className="text-body-lg text-text-secondary">
              From traditional banks to high-growth fintechs, WorldAML gives compliance teams 
              the tools to onboard faster, screen smarter, and report with confidence.
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/industries">View All Industries</Link>
          </Button>
        </div>

        {/* Industries grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {industries.map((industry) => (
            <Link
              key={industry.title}
              to={`/industries/${industry.title.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
              className="group p-6 rounded-lg border border-divider hover:border-slate-muted bg-card hover:bg-surface-subtle transition-all duration-200"
            >
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-md bg-secondary text-navy mb-4 group-hover:bg-navy group-hover:text-primary-foreground transition-colors">
                <industry.icon className="w-5 h-5" />
              </div>
              <h3 className="text-title text-navy mb-2 group-hover:text-teal transition-colors">
                {industry.title}
              </h3>
              <p className="text-body-sm text-text-secondary">{industry.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default IndustriesSection;
