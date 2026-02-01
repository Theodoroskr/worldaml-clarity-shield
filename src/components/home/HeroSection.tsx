import { Link } from "react-router-dom";
import { ArrowRight, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-background">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-secondary/50 via-background to-background" />
      
      <div className="container-enterprise relative">
        <div className="py-20 md:py-28 lg:py-36 max-w-4xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 text-caption font-medium text-teal bg-teal/10 rounded-full animate-fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-teal" />
            Trusted by 500+ regulated businesses
          </div>
          
          {/* Headline */}
          <h1 className="text-display-lg text-navy mb-6 animate-slide-up text-balance">
            Enterprise-Grade AML Compliance, Delivered via API
          </h1>
          
          {/* Subheadline */}
          <p className="text-body-lg text-text-secondary max-w-2xl mb-8 animate-fade-in-delay">
            Real-time sanctions screening, risk assessment, and continuous monitoring. 
            A single API for global AML compliance that scales with your business.
          </p>
          
          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-delay" style={{ animationDelay: "0.2s" }}>
            <Button size="lg" asChild>
              <Link to="/get-started">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/documentation">
                <FileText className="mr-2 h-4 w-4" />
                View Documentation
              </Link>
            </Button>
          </div>
          
          {/* Trust indicators */}
          <div className="mt-12 pt-8 border-t border-divider animate-fade-in-delay" style={{ animationDelay: "0.3s" }}>
            <p className="text-caption text-text-tertiary mb-4">Powering compliance for</p>
            <div className="flex flex-wrap items-center gap-8 opacity-60 mb-6">
              <span className="text-body font-semibold text-navy">Major European Bank</span>
              <span className="text-body font-semibold text-navy">Global Fintech</span>
              <span className="text-body font-semibold text-navy">Tier-1 Payment Provider</span>
              <span className="text-body font-semibold text-navy">Leading Crypto Exchange</span>
            </div>
            {/* Regulatory alignment indicator */}
            <p className="text-caption text-text-tertiary">
              Designed to support FATF, EBA, FCA and FinCEN-aligned AML frameworks
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
