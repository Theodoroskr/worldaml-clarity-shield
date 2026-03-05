import { Link } from "react-router-dom";
import { ArrowRight, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LaneBadge } from "@/components/LaneBadge";

const RRHeroSection = () => {
  return (
    <section className="section-padding bg-surface-subtle">
      <div className="container-enterprise">
        <div className="max-w-3xl">
          <LaneBadge lane="platform" className="mb-6" />
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal/10 text-teal text-body-sm font-medium mb-6">
            <FileText className="h-4 w-4" />
            WorldAML Platform Module
          </div>
          <h1 className="text-navy mb-6">
            Regulatory Reporting
          </h1>
          <p className="text-body-lg text-text-secondary mb-4">
            Automate your CRS, FATCA, and FINTRAC obligations from a single platform. WorldAML's
            regulatory reporting module collects, classifies, validates, and files mandatory reports
            with the relevant tax and financial intelligence authorities — on time, every time.
          </p>
          <p className="text-body text-text-secondary mb-8">
            From AEOI schema generation for FATCA/CRS to FINTRAC Large Cash Transaction Reports,
            eliminate manual data aggregation and reduce the risk of late or inaccurate filings.
            Available as part of WorldAML Suite and via the WorldAML API.
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

export default RRHeroSection;
