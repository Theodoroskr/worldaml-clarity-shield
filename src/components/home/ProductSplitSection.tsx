import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const products = [
  {
    title: "WorldAML API",
    subtitle: "For developers and engineering teams",
    description: "Embed AML screening and ongoing monitoring directly into your onboarding and compliance workflows.",
    features: [
      "Individual & company screening",
      "Sanctions, PEP & adverse media",
      "Ongoing monitoring via webhooks",
      "Audit-ready JSON outputs",
    ],
    cta: "Explore the API",
    href: "/api",
  },
  {
    title: "WorldAML Suite",
    subtitle: "For compliance teams and MLROs",
    description: "A complete compliance platform for managing onboarding, screening, monitoring and risk assessment.",
    features: [
      "KYC & KYB onboarding workflows",
      "AML screening & case management",
      "Risk-based decisioning tools",
      "Compliance dashboard & reporting",
    ],
    cta: "Explore the Platform",
    href: "/suite",
  },
  {
    title: "WorldID",
    subtitle: "For regulated onboarding",
    description: "Digital identity verification with document authentication, biometric liveness, and structured identity data.",
    features: [
      "Government ID verification",
      "Selfie & liveness detection",
      "OCR data extraction",
      "Clear decision outcomes",
    ],
    cta: "Explore WorldID",
    href: "/products/worldid",
  },
];

export const ProductSplitSection = () => {
  return (
    <section className="section-padding bg-background">
      <div className="container-enterprise">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-headline text-navy mb-4">
            The WorldAML Platform
          </h2>
          <p className="text-body text-text-secondary">
            Three products for complete compliance coverage — from identity verification to ongoing monitoring.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {products.map((product) => (
            <div
              key={product.title}
              className="p-6 rounded-lg border border-divider bg-card border-l-4 border-l-accent"
            >
              <h3 className="text-subheadline text-navy mb-1">
                {product.title}
              </h3>
              <p className="text-caption text-accent mb-4">
                {product.subtitle}
              </p>
              <p className="text-body-sm text-text-secondary mb-6">
                {product.description}
              </p>
              
              <ul className="space-y-2 mb-6">
                {product.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-accent flex-shrink-0" />
                    <span className="text-caption text-text-secondary">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button variant="outline" asChild className="w-full">
                <Link to={product.href}>
                  {product.cta}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductSplitSection;
