import { Link } from "react-router-dom";
import { ArrowRight, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export const APICTASection = () => {
  return (
    <section className="section-padding bg-navy">
      <div className="container-enterprise">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-headline text-white mb-4">
            Ready to Integrate?
          </h2>
          <p className="text-body-lg text-slate-light mb-8">
            Request API access to start building with WorldAML. Our team will 
            provide sandbox credentials, documentation, and technical support.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link to="/get-started">
                Request API Access
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-slate-light text-white hover:bg-white/10"
              asChild
            >
              <a 
                href="https://worldaml.readme.io" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <FileText className="mr-2 h-4 w-4" />
                View Documentation
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default APICTASection;
