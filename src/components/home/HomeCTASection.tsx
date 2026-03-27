import { Link } from "react-router-dom";
import { ArrowRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

export const HomeCTASection = () => {
  return (
    <section className="section-padding bg-navy">
      <div className="container-enterprise">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-headline text-primary-foreground mb-4">
            Ready to Reduce Compliance Friction?
          </h2>
          <p className="text-body-lg text-slate-light mb-8">
            Book a 30-minute walkthrough and see how WorldAML can cut onboarding time, 
            reduce false positives, and keep your compliance programme audit-ready.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="accent" 
              asChild
              className="group"
            >
              <Link to="/contact-sales">
                <Calendar className="mr-2 h-5 w-5" />
                Request a Demo
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              asChild
              className="group border-slate-light/30 text-primary-foreground hover:bg-primary-foreground/10"
            >
              <Link to="/free-aml-check">
                Run a Free AML Check
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
          
          <p className="text-body-sm text-slate-muted mt-8">
            No commitment. No credit card. Response within 24 hours.
          </p>
        </div>
      </div>
    </section>
  );
};

export default HomeCTASection;