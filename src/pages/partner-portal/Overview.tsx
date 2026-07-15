import { usePartner } from "@/hooks/usePartner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Briefcase, DollarSign, TrendingUp, ArrowRight, Sparkles, ImageIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const eur = (n: number) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

export default function PartnerOverview() {
  const { partner, summary, referrals, deals } = usePartner();
  if (!partner) return null;

  const recentReferrals = referrals.slice(0, 5);
  const recentDeals = deals.slice(0, 5);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Welcome back, {partner.display_name || "Partner"}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track your referrals, register deals, and grow your commissions.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={DollarSign} label="Lifetime earned" value={eur(summary.lifetimeEarned)} accent="text-teal" />
        <StatCard icon={TrendingUp} label="Pending payout" value={eur(summary.pending)} accent="text-amber-600" />
        <StatCard icon={Users} label="Referrals" value={`${summary.referralConversions}/${summary.totalReferrals}`} sub="converted" />
        <StatCard icon={Briefcase} label="Deal pipeline" value={eur(summary.pipelineValue)} sub="in review/approved" />
      </div>

      {/* Quick actions */}
      <div className="grid md:grid-cols-3 gap-4">
        <QuickCard
          title="Register a deal"
          desc="Lock in deal protection & higher commission on qualified opportunities."
          to="/partner-portal/deals"
          cta="Register deal"
        />
        <QuickCard
          title="Marketing assets"
          desc="Download logos, one-pagers, decks and email templates."
          to="/partner-portal/assets"
          cta="Browse assets"
          icon={ImageIcon}
        />
        <QuickCard
          title="Sandbox API key"
          desc="Start integrating WorldAML APIs with your test key."
          to="/partner-portal/profile"
          cta="View key"
          icon={Sparkles}
        />
      </div>

      {/* Recent activity */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Recent referrals</CardTitle>
            <Link to="/partner-portal/referrals" className="text-xs text-teal hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </CardHeader>
          <CardContent>
            {recentReferrals.length === 0 ? (
              <p className="text-sm text-muted-foreground">No referrals yet. Share your link to start.</p>
            ) : (
              <ul className="divide-y divide-border">
                {recentReferrals.map((r: any) => (
                  <li key={r.id} className="py-2 flex items-center justify-between text-sm">
                    <span className="truncate">{r.referred_email || "—"}</span>
                    <span className="text-xs text-muted-foreground capitalize">{r.status}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Recent deals</CardTitle>
            <Link to="/partner-portal/deals" className="text-xs text-teal hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </CardHeader>
          <CardContent>
            {recentDeals.length === 0 ? (
              <p className="text-sm text-muted-foreground">No deals registered yet.</p>
            ) : (
              <ul className="divide-y divide-border">
                {recentDeals.map((d: any) => (
                  <li key={d.id} className="py-2 flex items-center justify-between text-sm">
                    <span className="truncate">{d.prospect_company}</span>
                    <span className="text-xs text-muted-foreground capitalize">{d.status}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: any;
  label: string;
  value: string;
  sub?: string;
  accent?: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Icon className={`w-4 h-4 ${accent ?? ""}`} />
          {label}
        </div>
        <div className={`text-2xl font-bold mt-2 ${accent ?? "text-foreground"}`}>{value}</div>
        {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
      </CardContent>
    </Card>
  );
}

function QuickCard({
  title,
  desc,
  to,
  cta,
  icon: Icon = Briefcase,
}: {
  title: string;
  desc: string;
  to: string;
  cta: string;
  icon?: any;
}) {
  return (
    <Card className="flex flex-col">
      <CardContent className="p-5 flex-1 flex flex-col">
        <div className="w-9 h-9 rounded-lg bg-teal/10 text-teal flex items-center justify-center mb-3">
          <Icon className="w-4 h-4" />
        </div>
        <h3 className="font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground mt-1 flex-1">{desc}</p>
        <Button asChild variant="outline" size="sm" className="mt-4 self-start">
          <Link to={to}>{cta}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
