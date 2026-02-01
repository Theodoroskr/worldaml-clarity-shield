import { Link } from "react-router-dom";
import { ArrowRight, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";

export const SuiteIntegrationSection = () => {
  return (
    <section className="section-padding bg-background">
      <div className="container-enterprise">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-navy/5 text-navy mb-6">
            <Layers className="w-6 h-6" />
          </div>
          <h2 className="text-headline text-navy mb-4">
            How It Fits with WorldAML Suite
          </h2>
          <p className="text-body-lg text-text-secondary mb-8">
            WorldAML API can be used independently as standalone infrastructure, or as the 
            underlying engine powering the WorldAML Suite. Organisations can start with 
            API-only integration and add the Suite interface as needed.
          </p>
          <Button variant="outline" size="lg" asChild>
            <a 
              href="https://suite.worldaml.com" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              Explore WorldAML Suite
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default SuiteIntegrationSection;
