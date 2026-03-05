import { Link } from "react-router-dom";
import { ArrowRight, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LaneBadge } from "@/components/LaneBadge";

const RAHeroSection = () => {
  return (
    <section className="section-padding bg-surface-subtle">
      <div className="container-enterprise">
        <div className="max-w-3xl">
          <LaneBadge lane="platform" className="mb-6" />
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal/10 text-teal text-body-sm font-medium mb-6">
            <BarChart3 className="h-4 w-4" />
            WorldAML Suite Module
          </div>
          <h1 className="text-navy mb-6">Customer Risk Assessment & Categorisation</h1>
          <p className="text-body-lg text-text-secondary mb-4">
            Assign, maintain, and review customer risk scores using a configurable risk matrix aligned
            to your institution's risk appetite. WorldAML's risk assessment module automates the
            risk-based approach mandated by FATF and applied across all major AML/CFT frameworks.
          </p>
          <p className="text-body text-text-secondary mb-8">
            Move beyond manual spreadsheets. Categorise customers as Low, Medium, or High risk using
            weighted criteria — geography, industry, product type, PEP status, and more. Available
            as part of WorldAML Suite and via the WorldAML API.
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

export default RAHeroSection;
