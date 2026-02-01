import { Link } from "react-router-dom";
import { ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

export const SuiteHeroSection = () => {
  return (
    <section className="section-padding bg-background">
      <div className="container-enterprise">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-caption font-medium text-accent mb-4">
            WorldAML Suite
          </p>
          <h1 className="text-display text-navy mb-6">
            End-to-End AML Compliance Platform for Regulated Organisations
          </h1>
          <p className="text-body-lg text-text-secondary mb-10 max-w-3xl mx-auto">
            Manage KYC and KYB onboarding, AML screening, continuous monitoring 
            and risk assessment from a single compliance dashboard.
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
