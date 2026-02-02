import { Button } from "@/components/ui/button";
import { ArrowRight, ExternalLink } from "lucide-react";

const WorldIDCTASection = () => {
  return (
    <section className="section-padding bg-navy">
      <div className="container-enterprise text-center">
        <h2 className="text-white mb-4">
          Make onboarding compliant — without friction.
        </h2>
        <p className="text-slate-light max-w-xl mx-auto mb-8">
          Start verifying users today with WorldID's enterprise-grade identity verification.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" variant="accent" className="gap-2">
            Start verification
            <ArrowRight className="w-4 h-4" />
          </Button>
          <Button 
            size="lg" 
            variant="outline-light" 
            className="gap-2"
            asChild
          >
            <a href="https://worldaml.readme.io/reference/worldid" target="_blank" rel="noopener noreferrer">
              View API documentation
              <ExternalLink className="w-4 h-4" />
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default WorldIDCTASection;
