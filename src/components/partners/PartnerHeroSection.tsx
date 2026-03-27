import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Handshake, ArrowRight, TrendingUp, Globe2, ShieldCheck } from "lucide-react";

const tiers = [
  { label: "Referral Partner", rate: "5%", desc: "Refer clients and earn per conversion" },
  { label: "Affiliate Partner", rate: "10%", desc: "Promote WorldAML with co-branded assets" },
  { label: "Reseller Partner", rate: "15%", desc: "White-label and resell the full platform" },
];

const highlights = [
  { icon: TrendingUp, label: "Recurring Commissions" },
  { icon: Globe2, label: "Global Programme" },
  { icon: ShieldCheck, label: "ISO 27001 Certified" },
];

const PartnerHeroSection = () => (
  <section className="section-padding bg-surface-subtle">
    <div className="container-enterprise">
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* Left content */}
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal/10 text-teal text-sm font-medium mb-6">
            <Handshake className="h-4 w-4" />
            Partner Program
          </div>
          <h1 className="text-navy mb-6">
            Grow Your Revenue with <span className="text-teal">WorldAML</span>
          </h1>
          <p className="text-body-lg text-text-secondary mb-4">
            Join a global network of compliance professionals earning recurring commissions.
            Refer clients, access co-branded resources, and scale with dedicated support.
          </p>
          <p className="text-body text-text-secondary mb-8">
            Three flexible tiers designed for consultancies, technology partners, and resellers
            across every major compliance market.
          </p>
          <div className="flex flex-wrap gap-4 mb-8">
            <Button asChild size="lg">
              <Link to="/partners/apply">
                Apply Now <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/contact-sales">Talk to Sales</Link>
            </Button>
          </div>
          <div className="flex flex-wrap gap-3">
            {highlights.map((h) => (
              <div
                key={h.label}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border text-text-secondary text-sm"
              >
                <h.icon className="h-3.5 w-3.5 text-teal" />
                {h.label}
              </div>
            ))}
          </div>
        </div>

        {/* Right visual — partner tier cards */}
        <div className="space-y-4">
          {tiers.map((tier, i) => (
            <div
              key={tier.label}
              className="rounded-xl border border-border bg-white p-5 flex items-center justify-between gap-4 shadow-sm"
            >
              <div>
                <p className="font-semibold text-navy text-base">{tier.label}</p>
                <p className="text-text-secondary text-sm mt-0.5">{tier.desc}</p>
              </div>
              <span className="text-2xl font-bold text-teal whitespace-nowrap">{tier.rate}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default PartnerHeroSection;
