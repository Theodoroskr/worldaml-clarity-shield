import { Link } from "react-router-dom";
import { ArrowRight, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

export const KYCKYBApiCTASection = () => {
  return (
    <section className="section-padding bg-navy">
      <div className="container-enterprise">
        <div className="max-w-3xl mx-auto mb-12">
          <div className="bg-white/10 border border-white/20 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <Info className="h-5 w-5 text-teal-light mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Orchestration Layer</h3>
                <p className="text-slate-light text-sm leading-relaxed">
                  WorldAML's KYC & KYB API acts as an orchestration layer. Identity verification 
                  and registry data is sourced from approved third-party providers, selected based 
                  on jurisdiction and customer requirements.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-headline text-white mb-4">
            Automate Your KYC & KYB Workflows
          </h2>
          <p className="text-body-lg text-slate-light mb-8">
            Get sandbox credentials and start verifying customers and companies 
            programmatically. Our solutions team will support your integration.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="accent" asChild>
              <Link to="/get-started">
                Request API Access
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline-light" asChild>
              <Link to="/contact-sales">
                Talk to Sales
              </Link>
            </Button>
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-6 text-sm text-slate-light/70">
            <Link to="/platform/kyc-kyb" className="hover:text-white transition-colors">
              KYC/KYB Platform Module →
            </Link>
            <Link to="/platform/api" className="hover:text-white transition-colors">
              WorldAML API →
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

export default KYCKYBApiCTASection;
