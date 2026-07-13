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
  <section className="relative section-padding bg-gradient-to-br from-navy via-navy to-navy-light overflow-hidden">
    {/* Decorative accent */}
    <div className="absolute inset-0 opacity-[0.06] pointer-events-none"
      style={{
        backgroundImage:
          "radial-gradient(circle at 20% 20%, #14b8a6 0%, transparent 40%), radial-gradient(circle at 80% 70%, #14b8a6 0%, transparent 45%)",
      }}
    />
    <div className="container-enterprise relative">
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* Left content */}
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal/15 text-teal text-sm font-medium mb-6 border border-teal/20">
            <Handshake className="h-4 w-4" />
            Partner Program · Now Open
          </div>
          <h1 className="text-white mb-6 text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
            Grow Your Revenue with <span className="text-teal">WorldAML</span>
          </h1>
          <p className="text-white/80 text-lg md:text-xl mb-4 leading-relaxed">
            Join a global network of compliance professionals earning{" "}
            <span className="text-teal font-semibold">5–15% recurring commission</span>{" "}
            on every client they refer.
          </p>
          <p className="text-white/80 mb-8 leading-relaxed">
            Three flexible tiers designed for consultancies, technology partners, and resellers
            across every major compliance market — with co-branded assets, a dedicated partner
            manager, and monthly payouts.
          </p>
          <div className="flex flex-wrap gap-4 mb-8">
            <Button asChild variant="accent" size="lg">
              <Link to="/partners/apply">
                Apply Now <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline-light" size="lg" asChild>
              <a href="#partner-contact">Talk to Partnerships</a>
            </Button>
          </div>
          <div className="flex flex-wrap gap-3">
            {highlights.map((h) => (
              <div
                key={h.label}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/80 text-sm"
              >
                <h.icon className="h-3.5 w-3.5 text-teal" />
                {h.label}
              </div>
            ))}
          </div>
        </div>

        {/* Right visual — partner tier cards */}
        <div className="space-y-4">
          {tiers.map((tier) => (
            <div
              key={tier.label}
              className="rounded-xl border border-white/10 bg-white/[0.04] backdrop-blur-sm p-6 flex items-center justify-between gap-4 hover:border-teal/40 hover:bg-white/[0.06] transition-all"
            >
              <div>
                <p className="font-semibold text-white text-base">{tier.label}</p>
                <p className="text-white/80 text-sm mt-1">{tier.desc}</p>
              </div>
              <div className="text-right whitespace-nowrap">
                <span className="text-3xl font-bold text-teal">{tier.rate}</span>
                <p className="text-white/80 text-[11px] uppercase tracking-wider mt-0.5">Commission</p>
              </div>
            </div>
          ))}
          <p className="text-white/80 text-xs text-center pt-2">
            Recurring · Paid monthly · No cap
          </p>
        </div>
      </div>
    </div>
  </section>
);

export default PartnerHeroSection;
