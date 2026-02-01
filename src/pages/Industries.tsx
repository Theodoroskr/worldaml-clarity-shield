import { Link } from "react-router-dom";
import { ArrowRight, Building2, Wallet, Bitcoin, Gamepad2, Scale, CreditCard } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

const industries = [
  {
    icon: Building2,
    title: "Banks & EMIs",
    description: "Full regulatory compliance for traditional banking and electronic money institutions. Meet your obligations under AML directives with comprehensive screening and monitoring.",
    features: ["Customer Due Diligence", "Transaction Monitoring", "Regulatory Reporting"],
    link: "/industries/banking",
  },
  {
    icon: Wallet,
    title: "Fintechs",
    description: "Scalable AML solutions that grow with your business. Fast integration, flexible APIs, and pricing that makes sense for high-growth companies.",
    features: ["API-First Integration", "Scalable Infrastructure", "Startup-Friendly Pricing"],
    link: "/industries/fintech",
  },
  {
    icon: Bitcoin,
    title: "Crypto & Digital Assets",
    description: "VASP compliance made simple. Cryptocurrency address screening, FATF travel rule support, and specialized risk scoring for digital asset businesses.",
    features: ["Wallet Screening", "Travel Rule Support", "VASP Compliance"],
    link: "/industries/crypto",
  },
  {
    icon: Gamepad2,
    title: "Gaming & Gambling",
    description: "Player verification and ongoing monitoring for regulated gaming operators. Meet licensing requirements while providing seamless player experiences.",
    features: ["Player Verification", "Self-Exclusion Checks", "Source of Funds"],
    link: "/industries/gaming",
  },
  {
    icon: Scale,
    title: "Legal & Fiduciary",
    description: "Client due diligence for law firms, trust companies, and corporate service providers. Protect your practice and meet professional obligations.",
    features: ["Client Screening", "Matter-Level Checks", "Audit Documentation"],
    link: "/industries/legal",
  },
  {
    icon: CreditCard,
    title: "Payment Providers",
    description: "Transaction monitoring and merchant screening for PSPs and acquirers. Identify high-risk merchants and suspicious transaction patterns.",
    features: ["Merchant Screening", "Transaction Analysis", "Chargeback Prevention"],
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
                WorldAML serves regulated businesses across the financial services spectrum. 
                Our flexible platform adapts to your specific compliance requirements and workflows.
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
