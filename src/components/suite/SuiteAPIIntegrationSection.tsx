import { Link } from "react-router-dom";
import { ArrowRight, Code } from "lucide-react";
import { Button } from "@/components/ui/button";

export const SuiteAPIIntegrationSection = () => {
  return (
    <section className="section-padding bg-background">
      <div className="container-enterprise">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-navy/5 text-navy mb-6">
            <Code className="w-6 h-6" />
          </div>
          <h2 className="text-headline text-navy mb-4">
            How It Fits with WorldAML API
          </h2>
          <p className="text-body-lg text-text-secondary mb-8">
            WorldAML Suite is powered by the same engine as WorldAML API and can 
            be extended or integrated programmatically. Use the Suite interface for 
            day-to-day compliance operations while leveraging the API for automation 
            and system integration.
          </p>
          <Button variant="outline" size="lg" asChild>
            <Link to="/api">
              Explore WorldAML API
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default SuiteAPIIntegrationSection;
