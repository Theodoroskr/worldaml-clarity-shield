import { DollarSign, Users, Megaphone, HeadphonesIcon, BarChart3, Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const benefits = [
  { icon: DollarSign, title: "Competitive Commissions", description: "Earn recurring commissions on every referred customer that converts." },
  { icon: Users, title: "Referral Tracking", description: "Real-time dashboard to monitor your referrals, conversions, and earnings." },
  { icon: Megaphone, title: "Co-Branded Materials", description: "Access marketing collateral, landing pages, and branded assets." },
  { icon: HeadphonesIcon, title: "Dedicated Support", description: "A dedicated partner manager to help you succeed and grow." },
  { icon: BarChart3, title: "Performance Analytics", description: "Detailed reports on click-through rates, sign-ups, and revenue." },
  { icon: Shield, title: "Trusted Platform", description: "Leverage WorldAML's ISO-certified compliance platform your clients trust." },
];

const tiers = [
  { name: "Referral Partner", description: "Share your unique link and earn commission on every sign-up that converts.", rate: "10%" },
  { name: "Affiliate Partner", description: "Integrate tracking codes, run campaigns, and earn commission-based payouts.", rate: "15%" },
  { name: "Reseller Partner", description: "White-label our platform, set your own pricing, and manage your client base.", rate: "20%" },
];

const PartnerBenefitsSection = () => (
  <>
    {/* Benefits Grid */}
    <section className="py-16 md:py-24 bg-background">
      <div className="container-enterprise">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-navy mb-4">Why Partner with WorldAML?</h2>
          <p className="text-text-secondary max-w-2xl mx-auto">
            Whether you're an independent consultant, a technology integrator, or a compliance advisory firm, our program is designed to reward your growth.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((b) => (
            <Card key={b.title} className="border-divider hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-teal/10 text-teal mb-4">
                  <b.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-navy mb-2">{b.title}</h3>
                <p className="text-text-secondary text-sm">{b.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>

    {/* Tiers */}
    <section className="py-16 md:py-24 bg-surface-subtle">
      <div className="container-enterprise">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-navy mb-4">Partner Tiers</h2>
          <p className="text-text-secondary max-w-2xl mx-auto">Choose the tier that best fits your business model.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {tiers.map((t) => (
            <Card key={t.name} className="border-divider text-center">
              <CardContent className="pt-8 pb-8">
                <p className="text-4xl font-bold text-teal mb-2">{t.rate}</p>
                <p className="text-xs text-text-secondary mb-4">Commission Rate</p>
                <h3 className="text-lg font-semibold text-navy mb-3">{t.name}</h3>
                <p className="text-text-secondary text-sm">{t.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  </>
);

export default PartnerBenefitsSection;
