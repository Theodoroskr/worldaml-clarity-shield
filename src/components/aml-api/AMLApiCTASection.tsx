import { Link } from "react-router-dom";
import { ArrowRight, FileText, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

export const AMLApiCTASection = () => {
  return (
    <section className="section-padding bg-navy">
      <div className="container-enterprise">
        <div className="max-w-3xl mx-auto mb-12">
          <div className="bg-white/10 border border-white/20 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <Info className="h-5 w-5 text-teal-light mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Important Information</h3>
                <p className="text-slate-light text-sm leading-relaxed">
                  WorldAML API does not generate screening data. All results are produced 
                  by approved third-party data sources, selected based on jurisdiction and 
                  customer requirements.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-headline text-white mb-4">
            Start Screening Programmatically
          </h2>
          <p className="text-body-lg text-slate-light mb-8">
            Get sandbox credentials and integrate AML screening into your platform 
            in days. Our solutions team will guide your implementation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="accent" asChild>
              <Link to="/get-started">
                Request API Access
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline-light" asChild>
              <a href="https://worldaml.readme.io" target="_blank" rel="noopener noreferrer">
                <FileText className="mr-2 h-4 w-4" />
                View Documentation
              </a>
            </Button>
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-6 text-sm text-slate-light/70">
            <Link to="/platform/api" className="hover:text-white transition-colors">
              WorldAML API Platform →
            </Link>
            <Link to="/platform/aml-screening" className="hover:text-white transition-colors">
              AML Screening Module →
            </Link>
            <Link to="/pricing" className="hover:text-white transition-colors">
              Pricing →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AMLApiCTASection;
