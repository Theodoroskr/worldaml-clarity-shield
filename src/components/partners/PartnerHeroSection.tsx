import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Handshake, ArrowRight, TrendingUp, Globe2, ShieldCheck } from "lucide-react";

const highlights = [
  { icon: TrendingUp, label: "Up to 15% Commission" },
  { icon: Globe2, label: "Global Programme" },
  { icon: ShieldCheck, label: "ISO 27001 Certified" },
];

const PartnerHeroSection = () => (
  <section className="relative bg-navy text-white py-24 md:py-32 overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-navy via-navy-light to-navy opacity-90" />
    {/* Subtle grid pattern */}
    <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
    <div className="container-enterprise relative z-10 text-center max-w-4xl mx-auto">
      <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-5 py-2 mb-8">
        <Handshake className="h-4 w-4 text-teal" />
        <span className="text-sm font-medium text-white/90">Partner Program</span>
      </div>
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight tracking-tight">
        Grow Your Revenue with <span className="text-teal">WorldAML</span>
      </h1>
      <p className="text-lg md:text-xl text-white/75 mb-10 max-w-2xl mx-auto leading-relaxed">
        Join a global network of compliance professionals earning recurring commissions. Refer clients, access co-branded resources, and scale with dedicated support.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
        <Button asChild variant="accent" size="lg">
          <Link to="/partners/apply">
            Apply Now <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
        <Button asChild variant="outline-light" size="lg">
          <Link to="/contact-sales">Talk to Sales</Link>
        </Button>
      </div>
      <div className="flex flex-wrap justify-center gap-6 md:gap-10">
        {highlights.map((h) => (
          <div key={h.label} className="flex items-center gap-2 text-white/60">
            <h.icon className="h-4 w-4 text-teal" />
            <span className="text-sm font-medium">{h.label}</span>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default PartnerHeroSection;
