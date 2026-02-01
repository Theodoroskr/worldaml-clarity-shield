import { Link } from "react-router-dom";
import { ArrowRight, Play, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export const SuiteHeroSection = () => {
  return (
    <section className="section-padding bg-background">
      <div className="container-enterprise">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 text-caption font-medium text-teal bg-teal/10 rounded-full">
            <Shield className="w-3.5 h-3.5" />
            End-to-End Compliance Platform
          </div>
          <h1 className="text-display text-navy mb-6">
            A Complete AML Compliance Platform for Onboarding, Screening and Ongoing Risk Management
          </h1>
          <p className="text-body-lg text-text-secondary mb-8 max-w-3xl mx-auto">
            KYC and KYB onboarding, AML screening, continuous monitoring and risk 
            assessment — delivered through a single, unified compliance platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link to="/get-started">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/get-started?demo=true">
                <Play className="mr-2 h-4 w-4" />
                Request Demo
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SuiteHeroSection;
