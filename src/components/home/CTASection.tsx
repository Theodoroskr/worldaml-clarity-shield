import { Link } from "react-router-dom";
import { ArrowRight, Shield, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const CTASection = () => {
  return (
    <section className="section-padding bg-navy relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent rounded-full blur-3xl" />
      </div>
      
      <div className="container-enterprise relative">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-teal/20 text-teal-light px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Shield className="w-4 h-4" />
            Enterprise-Grade Compliance Infrastructure
          </div>
          
          <h2 className="text-3xl md:text-4xl font-semibold text-white mb-6">
            Screen Smarter. Comply Faster.<br />
            <span className="text-teal-light">Start in Minutes.</span>
          </h2>
          
          <p className="text-lg text-slate-light mb-8 max-w-2xl mx-auto">
            Join 200+ regulated institutions using WorldAML to automate sanctions, 
            PEP, and adverse media screening with bank-grade accuracy.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button size="lg" variant="accent" asChild>
              <Link to="/get-started">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline-light" asChild>
              <Link to="/demo">
                See Live Demo
              </Link>
            </Button>
          </div>
          
          {/* Trust signals */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-light">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-light" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-light" />
              <span>Setup in under 5 minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-teal-light" />
              <span>SOC 2 & ISO 27001 certified</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
