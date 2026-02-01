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
];

export const ProductSplitSection = () => {
  return (
    <section className="section-padding bg-background">
      <div className="container-enterprise">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-headline text-navy mb-4">
            Two Ways to Use WorldAML
          </h2>
          <p className="text-body text-text-secondary">
            Consume individual modules via API, or use the full platform for end-to-end compliance management.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {products.map((product) => (
            <div
              key={product.title}
              className="p-8 rounded-lg border border-divider bg-card border-l-4 border-l-accent"
            >
              <h3 className="text-subheadline text-navy mb-1">
                {product.title}
              </h3>
              <p className="text-caption text-accent mb-4">
                {product.subtitle}
              </p>
              <p className="text-body text-text-secondary mb-6">
                {product.description}
              </p>
              
              <ul className="space-y-3 mb-8">
                {product.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-accent flex-shrink-0" />
                    <span className="text-body-sm text-text-secondary">{feature}</span>
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
