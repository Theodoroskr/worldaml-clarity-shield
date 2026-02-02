import { Link } from "react-router-dom";
import { ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

export const SuiteCTASection = () => {
  return (
    <section className="section-padding bg-navy">
      <div className="container-enterprise">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-headline text-white mb-4">
            Ready to Simplify Your AML Compliance?
          </h2>
          <p className="text-body-lg text-slate-light mb-8">
            Get started with WorldAML Suite and cover your full AML compliance 
            lifecycle from a single platform. Request a demo to see how it works 
            for your organisation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="accent" asChild>
              <Link to="/get-started">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline-light" asChild>
              <Link to="/demo">
                <Play className="mr-2 h-4 w-4" />
                Request Demo
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SuiteCTASection;
