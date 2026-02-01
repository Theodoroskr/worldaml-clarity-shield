import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const CTASection = () => {
  return (
    <section className="section-padding bg-navy">
      <div className="container-enterprise">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-headline text-primary-foreground mb-4">
            Ready to Streamline Your Compliance?
          </h2>
          <p className="text-body-lg text-slate-light mb-8">
            Join hundreds of regulated businesses that trust WorldAML for their 
            AML compliance needs. Get started in minutes with our developer-friendly API.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link to="/get-started">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-slate-light text-primary-foreground hover:bg-navy-light" asChild>
              <Link to="/contact">
                Talk to Sales
              </Link>
            </Button>
          </div>
          
          <p className="mt-6 text-body-sm text-slate-muted">
            No credit card required • Full API access • Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
