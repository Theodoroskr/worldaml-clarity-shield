import { Button } from "@/components/ui/button";
import { ArrowRight, ExternalLink } from "lucide-react";

const WorldIDStickyCTA = () => {
  return (
    <div className="hidden lg:block fixed right-6 top-1/2 -translate-y-1/2 z-40 w-64">
      <div className="bg-white border border-divider rounded-lg shadow-lg p-5">
        <p className="text-sm text-text-secondary mb-1">Starter from</p>
        <p className="text-2xl font-bold text-navy mb-4">€1,000/month</p>
        
        <div className="space-y-2">
          <Button className="w-full gap-2" variant="accent" size="sm">
            Start verification
            <ArrowRight className="w-3 h-3" />
          </Button>
          <Button 
            className="w-full gap-2" 
            variant="outline" 
            size="sm"
            asChild
          >
            <a href="https://worldaml.readme.io/reference/worldid" target="_blank" rel="noopener noreferrer">
              View API docs
              <ExternalLink className="w-3 h-3" />
            </a>
          </Button>
        </div>
        
        <p className="text-xs text-text-tertiary mt-3 text-center">
          Sandbox available
        </p>
      </div>
    </div>
  );
};

export default WorldIDStickyCTA;
