import { Link } from "react-router-dom";
import { ArrowRight, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LaneBadge } from "@/components/LaneBadge";

const TMHeroSection = () => {
  return (
    <section className="section-padding bg-surface-subtle">
      <div className="container-enterprise">
        <div className="max-w-3xl">
          <LaneBadge lane="platform" className="mb-6" />
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal/10 text-teal text-body-sm font-medium mb-6">
            <Activity className="h-4 w-4" />
            WorldAML Platform Module
          </div>
          <h1 className="text-navy mb-6">
            Transaction Monitoring
          </h1>
          <p className="text-body-lg text-text-secondary mb-4">
            Detect, alert, and resolve suspicious financial activity in real time. WorldAML's
            transaction monitoring module screens payments against configurable rule sets, 
            typology libraries, and threshold triggers — fully aligned with FATF Recommendation 20.
          </p>
          <p className="text-body text-text-secondary mb-8">
            From batch processing to real-time payment screening, automate your SAR workflow 
            and keep your compliance team focused on high-priority cases. Available as part of 
            WorldAML Suite and via the WorldAML API.
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

export default TMHeroSection;
