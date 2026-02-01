import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const products = [
  {
    title: "WorldAML API",
    description: "AML screening and ongoing monitoring for individuals and companies, delivered via API.",
    features: [
      "Individual & company screening",
      "Sanctions, PEP & adverse media",
      "Ongoing AML monitoring",
      "Audit-ready outputs",
    ],
    cta: "Explore WorldAML API",
    href: "/api",
  },
  {
    title: "WorldAML Suite",
    description: "A complete AML compliance platform covering onboarding, screening and ongoing risk management.",
    features: [
      "KYC & KYB onboarding",
      "AML screening & monitoring",
      "Risk assessment & oversight",
      "Built for compliance teams",
    ],
    cta: "Explore WorldAML Suite",
    href: "/suite",
  },
];

export const ProductSplitSection = () => {
  return (
    <section className="section-padding bg-background">
      <div className="container-enterprise">
        <h2 className="text-headline text-navy mb-12 text-center">
          Two Ways to Use WorldAML
        </h2>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {products.map((product) => (
            <div
              key={product.title}
              className="p-8 rounded-lg border border-divider bg-card border-l-4 border-l-accent"
            >
              <h3 className="text-subheadline text-navy mb-3">
                {product.title}
              </h3>
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
