import { Link } from "react-router-dom";
import { ArrowRight, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

const RRCTASection = () => {
  return (
    <section className="section-padding bg-navy">
      <div className="container-enterprise">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-white mb-4">Automate Your CRS, FATCA & FINTRAC Filings</h2>
          <p className="text-white/70 text-body-lg mb-8">
            Join regulated financial institutions already using WorldAML to classify accounts,
            generate compliant reports, and meet regulatory deadlines — without manual effort.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" variant="accent" asChild>
              <Link to="/get-started">
                Request Access
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline-light" asChild>
              <Link to="/contact-sales">
                <Phone className="mr-2 h-4 w-4" />
                Talk to Sales
              </Link>
            </Button>
          </div>
          <p className="mt-6 text-white/50 text-body-sm">
            Also available as part of{" "}
            <Link to="/platform/suite" className="text-white/80 hover:text-white underline underline-offset-2 transition-colors">
              WorldAML Suite
            </Link>{" "}
            and via{" "}
            <Link to="/platform/api" className="text-white/80 hover:text-white underline underline-offset-2 transition-colors">
              WorldAML API
            </Link>
            .
          </p>
        </div>
      </div>
    </section>
  );
};

export default RRCTASection;
