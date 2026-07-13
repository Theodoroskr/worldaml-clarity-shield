import {
  DollarSign,
  Users,
  Megaphone,
  HeadphonesIcon,
  BarChart3,
  Shield,
  CheckCircle2,
  ArrowRight,
  Award,
  ShieldCheck,
  GraduationCap,
  KeyRound,
  FileSignature,
  Tags,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const benefits = [
  { icon: DollarSign, title: "Recurring Commissions", description: "Earn ongoing revenue for the full 24-month lifetime of each referred subscription. No cap. Monthly payouts over €100." },
  { icon: FileSignature, title: "Deal Registration", description: "Register prospects and get 90-day channel protection. No conflict with our direct sales team." },
  { icon: KeyRound, title: "Sandbox API Key on Day 1", description: "Approved partners get an instant sandbox key for AML, KYC & KYB APIs — build and test before you sell." },
  { icon: Award, title: "Certified Partner Track", description: "Earn Bronze, Silver, and Gold certifications through Academy training. Display verified badges on your site." },
  { icon: GraduationCap, title: "Free Academy Seats", description: "2–10 free CPD-certified Academy seats for your team, granted the moment your partnership is approved." },
  { icon: Tags, title: "Vertical Specialisation", description: "Get badged as a specialist in iGaming, Crypto, Payments, Banking, Fintech or Legal — matched to buyer intent." },
  { icon: Megaphone, title: "Co-Branded Materials", description: "Marketing collateral, one-pagers, and landing pages ready to co-brand with your logo." },
  { icon: HeadphonesIcon, title: "Dedicated Partner Manager", description: "A named contact to help you strategise, close deals, and grow your book." },
  { icon: BarChart3, title: "Performance Analytics", description: "Real-time dashboard: clicks, conversions, pipeline value, and revenue attribution." },
];

const tiers = [
  {
    name: "Referral Partner",
    rate: "5%",
    tagline: "Recommend & Earn",
    description: "Share your unique referral link. When a contact converts, you earn — no sales effort required.",
    features: ["Unique referral link", "Automated tracking", "2 free Academy seats", "Bronze certification eligible"],
    highlighted: false,
    cta: "Apply Now",
    href: "#partner-contact",
  },
  {
    name: "Affiliate Partner",
    rate: "10%",
    tagline: "Promote & Scale",
    description: "Run campaigns with tracking codes and co-branded promotions for higher commissions.",
    features: ["Everything in Referral", "Campaign tracking codes", "Co-branded collateral", "5 free Academy seats", "Silver certification eligible", "Quarterly business reviews"],
    highlighted: true,
    cta: "Apply Now",
    href: "#partner-contact",
  },
  {
    name: "Reseller Partner",
    rate: "15%",
    tagline: "Sell & Manage",
    description: "White-label the platform, set your pricing, and manage your entire client portfolio end-to-end.",
    features: ["Everything in Affiliate", "White-label options", "Custom pricing", "10 free Academy seats", "Gold certification eligible", "Dedicated account manager", "API access"],
    highlighted: false,
    cta: "Apply Now",
    href: "#partner-contact",
  },
  {
    name: "Technology Partner",
    rate: "Bundle",
    tagline: "Integrate & Embed",
    description: "For RegTech, core-banking and platform vendors embedding WorldAML APIs into their product.",
    features: ["Wholesale/bundled pricing", "Priority API access & higher rate limits", "Joint go-to-market", "5 free Academy seats", "Listing in partner directory", "Technical enablement"],
    highlighted: false,
    cta: "Talk to Partnerships",
    href: "#partner-contact",
  },
];


const certifications = [
  { level: "Bronze", color: "from-amber-700 to-amber-500", req: "Complete AML Fundamentals + 1 vertical course." },
  { level: "Silver", color: "from-slate-400 to-slate-200", req: "Bronze + close first paying WorldAML client." },
  { level: "Gold", color: "from-yellow-500 to-yellow-300", req: "Silver + 3 clients or €25k ARR + MLRO Masterclass." },
];

const PartnerBenefitsSection = () => (
  <>
    {/* Benefits Grid */}
    <section className="py-16 md:py-24 bg-background">
      <div className="container-enterprise">
        <div className="text-center mb-14">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-teal mb-3">Why Partner With Us</span>
          <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">Built for Growth-Minded Partners</h2>
          <p className="text-text-secondary max-w-2xl mx-auto text-lg">
            More than a referral link. A full commercial, technical, and enablement toolkit — engineered to accelerate your revenue.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((b) => (
            <Card key={b.title} className="border-divider hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
              <CardContent className="pt-6 pb-6">
                <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-teal/10 text-teal mb-4">
                  <b.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-navy mb-2 text-base">{b.title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed">{b.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>

    {/* Tiers */}
    <section className="py-16 md:py-24 bg-navy">
      <div className="container-enterprise">
        <div className="text-center mb-14">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-teal mb-3">Partner Tiers</span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Choose Your Partnership Level</h2>
          <p className="text-white/70 max-w-2xl mx-auto text-lg">
            Four models covering every partner motion — from casual referrers to embedded technology vendors.
          </p>
          <p className="text-teal text-sm mt-3 font-medium">
            All commissions are recurring for the first 24 months of each referred subscription.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tiers.map((t) => (
            <div
              key={t.name}
              className={`relative rounded-2xl p-px ${t.highlighted ? "bg-gradient-to-b from-teal to-teal/40" : "bg-white/10"}`}
            >
              {t.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-teal text-navy text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wide">
                  Most Popular
                </div>
              )}
              <div className={`rounded-2xl p-6 h-full flex flex-col ${t.highlighted ? "bg-navy-light" : "bg-white/5"}`}>
                <p className="text-xs font-semibold uppercase tracking-widest text-teal mb-3">{t.tagline}</p>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-4xl font-bold text-white">{t.rate}</span>
                  {t.rate !== "Bundle" && <span className="text-white/75 text-sm">commission</span>}
                </div>
                <h3 className="text-lg font-semibold text-white mt-3 mb-3">{t.name}</h3>
                <p className="text-white/80 text-sm leading-relaxed mb-5">{t.description}</p>
                <ul className="space-y-2 mb-6 flex-1">
                  {t.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs text-white/80">
                      <CheckCircle2 className="h-3.5 w-3.5 text-teal mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button asChild variant={t.highlighted ? "accent" : "outline-light"} size="sm" className="w-full">
                  <a href={t.href}>
                    {t.cta} <ArrowRight className="ml-2 h-3.5 w-3.5" />
                  </a>
                </Button>

              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Certification track */}
    <section className="py-16 md:py-24 bg-background">
      <div className="container-enterprise">
        <div className="text-center mb-14">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-teal mb-3">Certification</span>
          <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">WorldAML Certified Partner Track</h2>
          <p className="text-text-secondary max-w-2xl mx-auto text-lg">
            Earn verifiable Bronze, Silver, and Gold badges through our Academy. Featured on your public directory listing and your own website.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {certifications.map((c) => (
            <Card key={c.level} className="border-divider text-center">
              <CardContent className="pt-8 pb-8">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br ${c.color} mb-4 shadow-md`}>
                  <ShieldCheck className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-navy mb-2">{c.level} Certified</h3>
                <p className="text-text-secondary text-sm">{c.req}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="text-center mt-10">
          <Button variant="outline" asChild>
            <Link to="/partners/directory">
              Browse Certified Partners <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>

    {/* How It Works */}
    <section className="py-16 md:py-24 bg-surface-subtle">
      <div className="container-enterprise">
        <div className="text-center mb-14">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-teal mb-3">Getting Started</span>
          <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">How It Works</h2>
        </div>
        <div className="grid md:grid-cols-4 gap-8">
          {[
            { step: "01", title: "Apply", desc: "Submit your application with company details and preferred tier." },
            { step: "02", title: "Get Approved", desc: "Reviewed within 48 hours. Sandbox key + Academy seats issued instantly." },
            { step: "03", title: "Register Deals", desc: "Log prospects for 90-day channel protection and start referring." },
            { step: "04", title: "Earn & Certify", desc: "Recurring monthly payouts. Complete Academy tracks to level up." },
          ].map((s) => (
            <div key={s.step} className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-teal/10 text-teal font-bold text-lg mb-4">
                {s.step}
              </div>
              <h3 className="font-semibold text-navy mb-2">{s.title}</h3>
              <p className="text-text-secondary text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* CTA */}
    <section className="py-16 md:py-20 bg-navy">
      <div className="container-enterprise text-center max-w-3xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Partner with WorldAML?</h2>
        <p className="text-white/70 text-lg mb-8">
          Join a growing global network of compliance experts, RegTech vendors, and consultancies earning recurring revenue.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild variant="accent" size="lg">
            <a href="#partner-contact">
              Apply Now <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>

          <Button asChild variant="outline-light" size="lg">
            <Link to="/partners/directory">Browse Partners</Link>
          </Button>
        </div>
      </div>
    </section>
  </>
);

export default PartnerBenefitsSection;
