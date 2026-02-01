import { Link } from "react-router-dom";
import { ArrowRight, Building2, Wallet, Bitcoin, Gamepad2, Scale, CreditCard } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

const industries = [
  {
    icon: Building2,
    title: "Banks & EMIs",
    description: "Full regulatory compliance via a single API-first platform. KYC onboarding, AML screening and ongoing monitoring integrated into your core banking systems.",
    features: ["KYC/KYB Onboarding", "AML Screening", "Ongoing Monitoring"],
    link: "/industries/banking",
  },
  {
    icon: Wallet,
    title: "Fintechs",
    description: "Scalable compliance platform that grows with your business. Embed KYC/KYB, screening and monitoring directly into your product via API.",
    features: ["API-First Integration", "Scalable Platform", "Growth-Friendly Pricing"],
    link: "/industries/fintech",
  },
  {
    icon: Bitcoin,
    title: "Crypto & Digital Assets",
    description: "VASP compliance via API. KYC onboarding, wallet screening, FATF travel rule support and risk-based decisioning for digital asset businesses.",
    features: ["KYC Onboarding", "Wallet Screening", "Travel Rule Support"],
    link: "/industries/crypto",
  },
  {
    icon: Gamepad2,
    title: "Gaming & Gambling",
    description: "Player KYC verification and ongoing AML monitoring for regulated gaming operators. API or platform UI workflows for seamless player experiences.",
    features: ["Player KYC", "Ongoing Monitoring", "Source of Funds"],
    link: "/industries/gaming",
  },
  {
    icon: Scale,
    title: "Legal & Fiduciary",
    description: "Client KYC/KYB onboarding and AML screening for law firms, trust companies and corporate service providers. Full audit trail via API or platform.",
    features: ["Client KYC/KYB", "AML Screening", "Audit Documentation"],
    link: "/industries/legal",
  },
  {
    icon: CreditCard,
    title: "Payment Providers",
    description: "Merchant KYB onboarding, AML screening and transaction monitoring for PSPs and acquirers. Embed compliance directly into your merchant workflows.",
    features: ["Merchant KYB", "AML Screening", "Risk Monitoring"],
    link: "/industries/payments",
  },
];

const Industries = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="section-padding bg-background">
          <div className="container-enterprise">
            <div className="max-w-3xl">
              <h1 className="text-display text-navy mb-6">
                Industry Solutions
              </h1>
              <p className="text-body-lg text-text-secondary">
                WorldAML is an API-first compliance platform serving regulated businesses across 
                the financial services spectrum. Integrate KYC/KYB onboarding, AML screening 
                and monitoring directly into your systems, or use our platform UI.
              </p>
            </div>
          </div>
        </section>

        {/* Industries grid */}
        <section className="pb-16 md:pb-24 bg-background">
          <div className="container-enterprise">
            <div className="grid md:grid-cols-2 gap-8">
              {industries.map((industry) => (
                <div
                  key={industry.title}
                  className="group p-8 rounded-xl border border-divider bg-card hover:border-slate-muted transition-all duration-200"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-navy/5 text-navy mb-6 group-hover:bg-navy group-hover:text-primary-foreground transition-colors">
                    <industry.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-title text-navy mb-3">{industry.title}</h3>
                  <p className="text-body text-text-secondary mb-6">{industry.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-6">
                    {industry.features.map((feature) => (
                      <span
                        key={feature}
                        className="px-3 py-1 text-caption font-medium text-slate bg-secondary rounded-full"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>

                  <Link
                    to={industry.link}
                    className="inline-flex items-center text-body-sm font-medium text-teal hover:text-teal-light transition-colors"
                  >
                    Learn More
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="section-padding bg-navy">
          <div className="container-enterprise">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-headline text-primary-foreground mb-4">
                Don't See Your Industry?
              </h2>
              <p className="text-body-lg text-slate-light mb-8">
                WorldAML supports compliance requirements across many regulated sectors. 
                Talk to our team to discuss your specific needs.
              </p>
              <Button size="lg" variant="secondary" asChild>
                <Link to="/contact">
                  Contact Sales
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Industries;
