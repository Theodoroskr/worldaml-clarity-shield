import { Link } from "react-router-dom";
import { ArrowRight, Shield, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const NewHeroSection = () => {
  return (
    <section className="section-padding bg-surface-subtle">
      <div className="container-enterprise">
        {/* Hero Header */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h1 className="text-navy mb-6 text-balance">
            WorldAML — Financial Crime Screening Infrastructure
          </h1>
          <p className="text-body-lg text-text-secondary mb-8 max-w-3xl mx-auto">
            A unified platform and API layer for orchestrating financial crime screening 
            using approved third-party data sources.
          </p>
          <p className="text-body text-text-tertiary border-t border-divider pt-6 mt-6">
            WorldAML integrates trusted screening technologies, including LexisNexis Risk Solutions, 
            and is delivered and supported by Infocredit Group.
          </p>
        </div>

        {/* Two-Column Product Split */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Lane 1 - WorldAML Platform */}
          <Card className="border-navy/10 hover:border-navy/20 transition-colors">
            <CardHeader>
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-navy/5 text-navy mb-4">
                <Shield className="w-6 h-6" />
              </div>
              <div className="inline-flex items-center gap-2 mb-2">
                <span className="text-xs font-medium px-2 py-1 rounded-full border border-navy/20 bg-navy/5 text-navy">
                  WorldAML Platform
                </span>
              </div>
              <CardTitle className="text-xl text-navy">WorldAML Platform & API</CardTitle>
              <CardDescription className="text-text-secondary">
                Unified UI, APIs, workflows, and governance for managing financial crime screening.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link to="/platform">
                  Request Platform Access
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Lane 2 - Data Sources */}
          <Card className="border-teal/20 hover:border-teal/30 transition-colors">
            <CardHeader>
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-teal/5 text-teal mb-4">
                <Database className="w-6 h-6" />
              </div>
              <div className="inline-flex items-center gap-2 mb-2">
                <span className="text-xs font-medium px-2 py-1 rounded-full border border-teal/20 bg-teal/5 text-teal">
                  Data Source: LexisNexis
                </span>
              </div>
              <CardTitle className="text-xl text-navy">LexisNexis Screening Solutions</CardTitle>
              <CardDescription className="text-text-secondary">
                <span className="block mb-1">WorldCompliance®</span>
                <span className="block">Bridger Insight XG®</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" asChild className="w-full">
                <Link to="/data-sources">
                  View Data Sources
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default NewHeroSection;
