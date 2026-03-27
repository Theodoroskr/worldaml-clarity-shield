import { DollarSign, Users, Megaphone, HeadphonesIcon, BarChart3, Shield, CheckCircle2, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const benefits = [
  { icon: DollarSign, title: "Recurring Commissions", description: "Earn ongoing revenue on every referred customer throughout their subscription lifecycle." },
  { icon: Users, title: "Referral Tracking", description: "Real-time dashboard with full visibility into referral activity, conversions, and payouts." },
  { icon: Megaphone, title: "Co-Branded Materials", description: "Access professionally designed marketing collateral, landing pages, and branded assets." },
  { icon: HeadphonesIcon, title: "Dedicated Partner Manager", description: "A dedicated point of contact to help you strategise, close deals, and grow." },
  { icon: BarChart3, title: "Performance Analytics", description: "Granular reports on click-through rates, pipeline value, sign-ups, and revenue attribution." },
  { icon: Shield, title: "Enterprise-Grade Platform", description: "Leverage WorldAML's ISO 27001-certified compliance platform trusted by 500+ organisations." },
];

const tiers = [
  {
    name: "Referral Partner",
    rate: "5%",
    tagline: "Recommend & Earn",
    description: "Share your unique referral link. When a contact signs up and converts, you earn commission — no sales effort required.",
    features: ["Unique referral link", "Automated tracking", "Monthly payouts", "Partner portal access"],
    highlighted: false,
  },
  {
    name: "Affiliate Partner",
    rate: "10%",
    tagline: "Promote & Scale",
    description: "Integrate tracking codes into your campaigns, run co-branded promotions, and earn higher commission-based payouts.",
    features: ["Everything in Referral", "Campaign tracking codes", "Co-branded collateral", "Quarterly business reviews", "Priority support"],
    highlighted: true,
  },
  {
    name: "Reseller Partner",
    rate: "15%",
    tagline: "Sell & Manage",
    description: "White-label our platform under your brand, set your own pricing, and manage your entire client portfolio.",
    features: ["Everything in Affiliate", "White-label options", "Custom pricing", "Dedicated account manager", "API access", "Volume discounts"],
    highlighted: false,
  },
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
            Whether you're an independent consultant, a technology integrator, or a compliance advisory firm — our programme is engineered to accelerate your revenue.
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
            Select the tier that aligns with your business model. Upgrade at any time as your partnership grows.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {tiers.map((t) => (
            <div
              key={t.name}
              className={`relative rounded-2xl p-px ${
                t.highlighted
                  ? "bg-gradient-to-b from-teal to-teal/40"
                  : "bg-white/10"
              }`}
            >
              {t.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-teal text-navy text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wide">
                  Most Popular
                </div>
              )}
              <div className={`rounded-2xl p-8 h-full flex flex-col ${t.highlighted ? "bg-navy-light" : "bg-white/5"}`}>
                <p className="text-xs font-semibold uppercase tracking-widest text-teal mb-4">{t.tagline}</p>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-5xl font-bold text-white">{t.rate}</span>
                  <span className="text-white/50 text-sm">commission</span>
                </div>
                <h3 className="text-xl font-semibold text-white mt-3 mb-3">{t.name}</h3>
                <p className="text-white/60 text-sm leading-relaxed mb-6">{t.description}</p>
                <ul className="space-y-2.5 mb-8 flex-1">
                  {t.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-white/80">
                      <CheckCircle2 className="h-4 w-4 text-teal mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  variant={t.highlighted ? "accent" : "outline-light"}
                  size="lg"
                  className="w-full"
                >
                  <Link to="/partners/apply">
                    Apply Now <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* How It Works */}
    <section className="py-16 md:py-24 bg-background">
      <div className="container-enterprise">
        <div className="text-center mb-14">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-teal mb-3">Getting Started</span>
          <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">How It Works</h2>
          <p className="text-text-secondary max-w-2xl mx-auto text-lg">
            From application to your first payout — it's simple, transparent, and fast.
          </p>
        </div>
        <div className="grid md:grid-cols-4 gap-8">
          {[
            { step: "01", title: "Apply", desc: "Submit your application with basic company details." },
            { step: "02", title: "Get Approved", desc: "Our team reviews and approves qualifying partners within 48 hours." },
            { step: "03", title: "Share & Refer", desc: "Use your unique referral link, tracking codes, or white-label setup." },
            { step: "04", title: "Earn", desc: "Receive recurring commission payouts every month via bank transfer." },
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
          Join a growing network of compliance professionals earning recurring revenue while helping organisations stay compliant.
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
  </>
);

export default PartnerBenefitsSection;
