import { Link } from "react-router-dom";
import { ArrowRight, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LaneBadge } from "@/components/LaneBadge";

const KYCHeroSection = () => {
  return (
    <section className="section-padding bg-surface-subtle">
      <div className="container-enterprise">
        <div className="max-w-3xl">
          <LaneBadge lane="platform" className="mb-6" />
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal/10 text-teal text-body-sm font-medium mb-6">
            <Users className="h-4 w-4" />
            WorldAML Suite Module
          </div>
          <h1 className="text-navy mb-6">KYC & KYB Onboarding Software</h1>
          <p className="text-body-lg text-text-secondary mb-4">
            Screen individuals and business entities at onboarding and throughout the relationship.
            WorldAML's KYC and KYB module combines identity verification, sanctions and PEP checks,
            document review, and beneficial ownership mapping in a single compliance workflow.
          </p>
          <p className="text-body text-text-secondary mb-8">
            Built for regulated institutions subject to FATF Recommendation 10, EU AMLD, and
            national CDD obligations. Available as part of WorldAML Suite and via the WorldAML API.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button asChild size="lg">
              <Link to="/get-started">
                Request Access
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/platform/api">View API Documentation</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default KYCHeroSection;
