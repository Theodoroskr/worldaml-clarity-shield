import { Link } from "react-router-dom";
import { ArrowRight, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

export const SanctionsApiCTASection = () => {
  return (
    <section className="section-padding bg-navy">
      <div className="container-enterprise">
        <div className="max-w-3xl mx-auto mb-12">
          <div className="bg-white/10 border border-white/20 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <Info className="h-5 w-5 text-teal-light mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Data Source Notice</h3>
                <p className="text-slate-light text-sm leading-relaxed">
                  Sanctions list data is sourced from approved third-party providers. 
                  WorldAML acts as an orchestration layer and does not produce or maintain 
                  sanctions data directly.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-headline text-white mb-4">
            Automate Your Sanctions Screening
          </h2>
          <p className="text-body-lg text-slate-light mb-8">
            Get started with sandbox credentials and integrate real-time sanctions 
            screening into your platform. Our team will support your implementation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="accent" asChild>
              <Link to="/get-started">
                Request API Access
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline-light" asChild>
              <Link to="/sanctions-check">
                Try Free Sanctions Check
              </Link>
            </Button>
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-6 text-sm text-slate-light/70">
            <Link to="/platform/aml-screening" className="hover:text-white transition-colors">
              AML Screening Platform →
            </Link>
            <Link to="/resources/sanctions-lists" className="hover:text-white transition-colors">
              Sanctions Lists Directory →
            </Link>
            <Link to="/aml-api" className="hover:text-white transition-colors">
              AML API →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SanctionsApiCTASection;
