import { Button } from "@/components/ui/button";
import { ArrowRight, ExternalLink } from "lucide-react";

const WorldIDHeroSection = () => {
  return (
    <section className="bg-navy py-16 md:py-24">
      <div className="container-enterprise">
        <div className="max-w-3xl">
          <p className="text-teal text-sm font-medium tracking-wide uppercase mb-4">
            Digital Identity Verification
          </p>
          <h1 className="text-white mb-6">
            WorldID — Digital Identity Verification
          </h1>
          <p className="text-xl md:text-2xl text-slate-light mb-8 leading-relaxed">
            Verify users globally in seconds. Document authentication, biometric liveness, and structured identity data — built for regulated onboarding.
          </p>
          
          <ul className="space-y-3 mb-10">
            <li className="flex items-start gap-3 text-white">
              <div className="w-1.5 h-1.5 rounded-full bg-teal mt-2.5 shrink-0" />
              <span>Government ID & document verification</span>
            </li>
            <li className="flex items-start gap-3 text-white">
              <div className="w-1.5 h-1.5 rounded-full bg-teal mt-2.5 shrink-0" />
              <span>Selfie & liveness detection</span>
            </li>
            <li className="flex items-start gap-3 text-white">
              <div className="w-1.5 h-1.5 rounded-full bg-teal mt-2.5 shrink-0" />
              <span>Verification report with clear decision outcome</span>
            </li>
          </ul>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
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
          
          <p className="text-slate-light text-sm">
            Sandbox environment available.
          </p>
        </div>
      </div>
    </section>
  );
};

export default WorldIDHeroSection;
