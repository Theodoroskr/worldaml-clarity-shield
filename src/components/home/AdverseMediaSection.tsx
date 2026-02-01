import { Link } from "react-router-dom";
import { ArrowRight, Newspaper, RefreshCw, Shield, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

const capabilities = [
  {
    icon: Newspaper,
    title: "Global Media Sources",
    description: "Continuously monitors curated global media sources, including structured news feeds, to identify adverse mentions.",
  },
  {
    icon: Shield,
    title: "Risk Classification",
    description: "Applies entity matching and risk classification to assess relevance and severity of media coverage.",
  },
  {
    icon: RefreshCw,
    title: "Continuous Monitoring",
    description: "Supports ongoing AML monitoring, not one-time checks, to detect emerging risks over time.",
  },
  {
    icon: AlertTriangle,
    title: "Reputational Risk Detection",
    description: "Identifies financial crime, fraud, corruption, sanctions evasion and reputational risk indicators.",
  },
];

export const AdverseMediaSection = () => {
  return (
    <section className="section-padding bg-background">
      <div className="container-enterprise">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Content */}
          <div>
            <h2 className="text-headline text-navy mb-6">
              Adverse Media & Ongoing Monitoring
            </h2>
            <p className="text-body-lg text-text-secondary mb-6">
              WorldAML supports adverse media screening and ongoing monitoring as part of 
              its AML and risk assessment framework. Adverse media refers to negative or 
              high-risk news relating to individuals or businesses — including coverage 
              of AML violations, fraud, corruption, sanctions evasion and other financial 
              crime risks.
            </p>
            <p className="text-body text-text-secondary mb-8">
              The platform continuously analyses curated global media sources, including 
              structured news feeds. Media content is risk-classified, matched to individuals 
              and businesses, and incorporated into ongoing AML monitoring to help identify 
              emerging financial crime and reputational risks. This risk-based AML approach 
              ensures continuous compliance monitoring rather than point-in-time checks.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild>
                <Link to="/api">
                  Explore WorldAML API
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/get-started">Get Started</Link>
              </Button>
            </div>
          </div>

          {/* Capabilities grid */}
          <div className="grid sm:grid-cols-2 gap-6">
            {capabilities.map((capability) => (
              <div
                key={capability.title}
                className="p-5 rounded-lg border border-divider bg-card"
              >
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-md bg-navy/5 text-navy mb-4">
                  <capability.icon className="w-5 h-5" />
                </div>
                <h3 className="text-body font-semibold text-navy mb-2">
                  {capability.title}
                </h3>
                <p className="text-body-sm text-text-secondary">
                  {capability.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdverseMediaSection;
