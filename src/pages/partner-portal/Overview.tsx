import { useMemo } from "react";
import { Link } from "react-router-dom";
import { usePartner } from "@/hooks/usePartner";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  PlusCircle,
  Briefcase,
  FolderOpen,
  Mail,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  GraduationCap,
  ShieldCheck,
} from "lucide-react";

const eur = (n: number) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending Review",
  approved: "Approved",
  won: "Won",
  lost: "Lost",
  rejected: "Rejected",
  expired: "Expired",
};

export default function PartnerOverview() {
  const { partner, summary, deals, referrals } = usePartner();
  const { user } = useAuth();
  if (!partner) return null;

  const firstName =
    (user?.user_metadata?.first_name as string) ||
    (user?.user_metadata?.full_name as string)?.split(" ")[0] ||
    user?.email?.split("@")[0] ||
    "there";

  const activeDeals = (deals as any[]).filter((d) => ["pending", "approved"].includes(d.status));
  const wonDeals = (deals as any[]).filter((d) => d.status === "won");

  const actions = useMemo(() => {
    const list: { tone: "warn" | "info"; text: string; to: string; cta: string }[] = [];
    for (const d of deals as any[]) {
      if (d.protection_expires_at && ["pending", "approved"].includes(d.status)) {
        const days = Math.ceil((new Date(d.protection_expires_at).getTime() - Date.now()) / 86400000);
        if (days >= 0 && days <= 30) {
          list.push({
            tone: "warn",
            text: `Deal protection for ${d.prospect_company} expires in ${days} day${days === 1 ? "" : "s"}.`,
            to: "/partner/deals",
            cta: "Review deal",
          });
        }
      }
      if (d.status === "pending") {
        list.push({
          tone: "info",
          text: `${d.prospect_company} is awaiting review by the partnerships team.`,
          to: "/partner/deals",
          cta: "View",
        });
      }
    }
    if (!partner.display_name || !partner.website_url) {
      list.push({
        tone: "warn",
        text: "Your company profile is incomplete — add your display name and website.",
        to: "/partner/profile",
        cta: "Complete profile",
      });
    }
    if (summary.pending > 0) {
      list.push({
        tone: "info",
        text: `${eur(summary.pending)} commission is pending payout.`,
        to: "/partner/payouts",
        cta: "View payouts",
      });
    }
    if (deals.length === 0) {
      list.push({
        tone: "info",
        text: "You haven't registered a deal yet — register your first opportunity.",
        to: "/partner/deals/new",
        cta: "Register deal",
      });
    }
    return list.slice(0, 5);
  }, [deals, partner, summary.pending]);

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      {/* Welcome + status */}
      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-4 items-stretch">
        <div className="flex flex-col justify-center">
          <h1 className="text-2xl font-bold text-foreground">Welcome back, {firstName}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {partner.display_name || "WorldAML Partner"}
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            <Button asChild size="sm">
              <Link to="/partner/deals/new"><PlusCircle className="mr-1.5 w-4 h-4" /> Register new deal</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link to="/partner/deals"><Briefcase className="mr-1.5 w-4 h-4" /> Active deals</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link to="/partner/assets"><FolderOpen className="mr-1.5 w-4 h-4" /> Sales kit</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link to="/partner/manager"><Mail className="mr-1.5 w-4 h-4" /> Partner manager</Link>
            </Button>
          </div>
        </div>

        <Card className="border-teal/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-muted-foreground">
              <ShieldCheck className="w-3.5 h-3.5 text-teal" /> Partner status
            </div>
            <div className="mt-1.5 flex items-center gap-2">
              <span className="text-base font-semibold text-foreground">Approved Partner</span>
              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Active</Badge>
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-y-2 text-xs">
              <Meta label="Partner type" value={(partner.partner_type || "—").replace(/_/g, " ")} />
              <Meta label="Commission" value={partner.commission_rate ? `${partner.commission_rate}%` : "—"} />
              <Meta
                label="Partner since"
                value={(partner as any).created_at ? new Date((partner as any).created_at).toLocaleDateString() : "—"}
              />
              <Meta label="Referral code" value={partner.referral_code || "—"} />
            </dl>
            <p className="text-[11px] text-muted-foreground mt-3">
              Partner type, commission and status are set by WorldAML and cannot be edited here.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Action centre */}
      <Card>
        <CardContent className="p-4">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
            Action centre
          </div>
          {actions.length === 0 ? (
            <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-green-600" /> You're all caught up.
            </div>
          ) : (
            <ul className="mt-2 divide-y divide-border">
              {actions.map((a, i) => (
                <li key={i} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="flex items-start gap-2 min-w-0">
                    <AlertCircle
                      className={`w-4 h-4 mt-0.5 shrink-0 ${a.tone === "warn" ? "text-amber-600" : "text-teal"}`}
                    />
                    <span className="text-sm text-foreground">{a.text}</span>
                  </div>
                  <Button asChild size="sm" variant="ghost" className="shrink-0 text-teal">
                    <Link to={a.to}>{a.cta} <ArrowRight className="ml-1 w-3.5 h-3.5" /></Link>
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Commercial snapshot */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <Kpi label="Active deals" value={String(activeDeals.length)} />
        <Kpi label="Registered pipeline" value={eur(summary.pipelineValue)} />
        <Kpi label="Won deals" value={String(wonDeals.length)} sub={wonDeals.length ? eur(summary.wonDealsValue) : undefined} />
        <Kpi label="Commission earned" value={eur(summary.lifetimeEarned)} tone="text-teal" />
        <Kpi label="Pending payout" value={eur(summary.pending)} tone="text-amber-600" />
      </div>

      {/* Active deals + growth */}
      <div className="grid lg:grid-cols-[1.5fr_1fr] gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-foreground">Active deals</div>
              <Link to="/partner/deals" className="text-xs text-teal hover:underline flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            {activeDeals.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">Register your first WorldAML opportunity.</p>
                <Button asChild size="sm" className="mt-3">
                  <Link to="/partner/deals/new">Register deal</Link>
                </Button>
              </div>
            ) : (
              <table className="w-full text-sm mt-2">
                <tbody className="divide-y divide-border">
                  {activeDeals.slice(0, 5).map((d: any) => (
                    <tr key={d.id}>
                      <td className="py-2">
                        <div className="font-medium text-foreground">{d.prospect_company}</div>
                        <div className="text-xs text-muted-foreground">
                          {(d.product_interest ?? []).join(", ") || d.prospect_country || "—"}
                        </div>
                      </td>
                      <td className="py-2 text-right text-xs font-mono">
                        {d.estimated_arr_eur ? eur(Number(d.estimated_arr_eur)) : "—"}
                      </td>
                      <td className="py-2 text-right text-xs text-muted-foreground">
                        {STATUS_LABEL[d.status] ?? d.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-semibold text-foreground">Partner growth</div>
            <dl className="mt-3 space-y-2 text-sm">
              <GrowthRow label="Deals registered" value={String(deals.length)} />
              <GrowthRow label="Deals won" value={String(wonDeals.length)} />
              <GrowthRow label="Referrals" value={`${summary.referralConversions}/${summary.totalReferrals} converted`} />
              <GrowthRow
                label="Verticals"
                value={(partner.verticals ?? []).length ? (partner.verticals ?? []).join(", ") : "Not set"}
              />
            </dl>
            <div className="mt-4 rounded-lg border border-border bg-muted/30 p-3">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Recommended next step</div>
              <p className="text-sm text-foreground mt-1">
                {deals.length === 0
                  ? "Register your first deal to activate protection and commission."
                  : !partner.display_name || !partner.website_url
                    ? "Complete your company profile so we can list you in the partner directory."
                    : referrals.length === 0
                      ? "Share your referral link to start tracking attributed signups."
                      : "Explore WorldAML sales resources to support your active pipeline."}
              </p>
              <Button asChild size="sm" variant="outline" className="mt-3">
                <Link
                  to={
                    deals.length === 0
                      ? "/partner/deals/new"
                      : !partner.display_name || !partner.website_url
                        ? "/partner/profile"
                        : referrals.length === 0
                          ? "/partner/referrals"
                          : "/partner/assets"
                  }
                >
                  Continue
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Training + partner manager */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal/10 text-teal flex items-center justify-center shrink-0">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-semibold text-foreground">Training & certification</div>
              <p className="text-xs text-muted-foreground mt-1">
                Partner training runs on your existing WorldAML Academy account — no separate login.
              </p>
              <Button asChild size="sm" variant="outline" className="mt-3">
                <Link to="/dashboard">Go to Academy</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal/10 text-teal flex items-center justify-center shrink-0">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-semibold text-foreground">Your WorldAML partner manager</div>
              <p className="text-xs text-muted-foreground mt-1">
                Deal reviews, pricing support and co-selling — contact the partnerships team.
              </p>
              <Button asChild size="sm" variant="outline" className="mt-3">
                <Link to="/partner/manager">Contact</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-foreground font-medium capitalize">{value}</dd>
    </div>
  );
}

function Kpi({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: string }) {
  return (
    <Card>
      <CardContent className="p-3.5">
        <div className="text-[11px] text-muted-foreground">{label}</div>
        <div className={`text-lg font-bold mt-1 ${tone ?? "text-foreground"}`}>{value}</div>
        {sub && <div className="text-[11px] text-muted-foreground">{sub}</div>}
      </CardContent>
    </Card>
  );
}

function GrowthRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm text-foreground text-right">{value}</dd>
    </div>
  );
}
