import { Button } from "@/components/ui/button";
import { ArrowRight, ExternalLink } from "lucide-react";

const WorldIDStickyCTA = () => {
  return (
    <section className="section-padding bg-secondary">
      <div className="container-enterprise">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white border border-divider rounded-lg p-6 md:p-8">
          <div>
            <p className="text-sm text-text-secondary mb-1">Starter from</p>
            <p className="text-3xl font-bold text-navy">€1.50 / IDV</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button className="gap-2" variant="accent">
              Start verification
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button 
              className="gap-2" 
              variant="outline"
              asChild
            >
              <a href="https://worldaml.readme.io/reference/worldid" target="_blank" rel="noopener noreferrer">
                View API docs
                <ExternalLink className="w-4 h-4" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WorldIDStickyCTA;
