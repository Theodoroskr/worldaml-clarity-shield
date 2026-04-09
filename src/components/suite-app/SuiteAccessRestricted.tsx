import { Link } from "react-router-dom";
import { ShieldAlert, ArrowRight, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function SuiteAccessRestricted() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center bg-muted/30">
        <div className="max-w-lg mx-auto text-center px-6 py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-navy/10 text-navy mb-6">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-navy mb-3">
            WorldAML Suite — Restricted Access
          </h1>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            WorldAML Suite is available to approved organisations only. To request
            platform access or schedule a live demo, please contact our team.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="default" asChild>
              <Link to="/contact-sales?product=suite">
                Request Access
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/platform/suite">
                <Phone className="mr-2 h-4 w-4" />
                Learn More
              </Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}