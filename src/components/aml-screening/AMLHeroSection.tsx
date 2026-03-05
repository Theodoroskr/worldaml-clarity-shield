import { Link } from "react-router-dom";
import { ArrowRight, ShieldSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LaneBadge } from "@/components/LaneBadge";
import { Shield } from "lucide-react";

const AMLHeroSection = () => {
  return (
    <section className="section-padding bg-surface-subtle">
      <div className="container-enterprise">
        <div className="max-w-3xl">
          <LaneBadge lane="platform" className="mb-6" />
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal/10 text-teal text-body-sm font-medium mb-6">
            <Shield className="h-4 w-4" />
            WorldAML Suite Module
          </div>
          <h1 className="text-navy mb-6">AML Screening & Monitoring Software</h1>
          <p className="text-body-lg text-text-secondary mb-4">
            Screen customers against global sanctions lists, PEP databases, and adverse media sources
            at onboarding and continuously thereafter. WorldAML's AML screening module delivers
            comprehensive coverage across 50+ risk categories from world-leading data providers.
          </p>
          <p className="text-body text-text-secondary mb-8">
            Powered by WorldCompliance® and Bridger Insight XG® data. Designed to satisfy FATF
            Recommendations 6, 12, and 16, EU AMLD obligations, and national watchlist screening
            requirements. Available as part of WorldAML Suite and via the WorldAML API.
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

export default AMLHeroSection;
