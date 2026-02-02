import { Link } from "react-router-dom";
import { ArrowRight, Calendar, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

export const HomeCTASection = () => {
  return (
    <section className="section-padding bg-navy">
      <div className="container-enterprise">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-headline text-primary-foreground mb-4">
            Ready to Strengthen Your Compliance Programme?
          </h2>
          <p className="text-body-lg text-slate-light mb-8">
            Speak with our team to learn how WorldAML can support your 
            KYC, KYB, and AML screening requirements.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="accent" 
              asChild
              className="group"
            >
              <Link to="/demo">
                <Calendar className="mr-2 h-5 w-5" />
                Request a Demo
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button 
              size="lg" 
              variant="outline-light" 
              asChild
            >
              <Link to="/contact-sales">
                <MessageSquare className="mr-2 h-5 w-5" />
                Talk to Sales
              </Link>
            </Button>
          </div>
          
          <p className="text-body-sm text-slate-muted mt-8">
            No commitment required. Our team will respond within 24 hours.
          </p>
        </div>
      </div>
    </section>
  );
};

export default HomeCTASection;