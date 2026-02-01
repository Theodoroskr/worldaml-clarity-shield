import { Link } from "react-router-dom";
import { ArrowRight, Code, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";

export const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-background">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-secondary/30 via-background to-background" />
      
      <div className="container-enterprise relative">
        <div className="py-20 md:py-28 lg:py-32 max-w-4xl">
          {/* Single value statement */}
          <h1 className="text-display text-navy mb-6 text-balance">
            AML Compliance Infrastructure for Regulated Organisations
          </h1>
          
          {/* Clear positioning statement */}
          <p className="text-body-lg text-text-secondary max-w-2xl mb-10">
            KYC and KYB onboarding, real-time AML screening, ongoing monitoring 
            and risk assessment — delivered via API and platform.
          </p>
          
          {/* Dual-persona CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <Button size="lg" asChild>
              <Link to="/get-started">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/api" className="gap-2">
                <Code className="h-4 w-4" />
                Explore the API
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/suite" className="gap-2">
                <Layers className="h-4 w-4" />
                Explore the Platform
              </Link>
            </Button>
          </div>
          
          {/* Regulatory alignment - text only, no logos */}
          <div className="pt-8 border-t border-divider">
            <p className="text-body-sm text-text-tertiary">
              Designed to support FATF, EBA, FCA and FinCEN-aligned compliance frameworks.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
