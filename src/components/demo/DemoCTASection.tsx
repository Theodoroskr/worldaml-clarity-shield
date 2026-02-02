import { Link } from "react-router-dom";
import { ArrowRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

export const DemoCTASection = () => {
  return (
    <section className="section-padding bg-navy">
      <div className="container-enterprise">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-headline text-white mb-4">
            Ready to See WorldAML in Action?
          </h2>
          <p className="text-body-lg text-white/70 mb-8">
            Schedule a personalized demo with our team to explore how WorldAML 
            can transform your compliance operations.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="accent" asChild>
              <Link to="/get-started">
                Request Access
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline-light" asChild>
              <Link to="/support">
                <Calendar className="mr-2 h-4 w-4" />
                Book a Demo
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DemoCTASection;
