import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Handshake, ArrowRight } from "lucide-react";

const PartnerHeroSection = () => (
  <section className="relative bg-navy text-white py-20 md:py-28 overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-navy via-navy-light to-navy opacity-90" />
    <div className="container-enterprise relative z-10 text-center max-w-3xl mx-auto">
      <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-6">
        <Handshake className="h-4 w-4 text-teal" />
        <span className="text-sm font-medium text-white/90">Partner Program</span>
      </div>
      <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
        Grow Your Business with WorldAML
      </h1>
      <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl mx-auto">
        Join our partner program as a referral partner, affiliate, or reseller. Earn commissions, access co-branded materials, and get dedicated support.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button asChild variant="accent" size="lg">
          <Link to="/partners/apply">
            Apply Now <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
        <Button asChild variant="outline-light" size="lg">
          <Link to="/contact-sales">Talk to Sales</Link>
        </Button>
      </div>
    </div>
  </section>
);

export default PartnerHeroSection;
