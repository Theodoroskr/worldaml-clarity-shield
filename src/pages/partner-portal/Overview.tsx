import { useMemo } from "react";
import { Link } from "react-router-dom";
import { usePartner } from "@/hooks/usePartner";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  PlusCircle,
  Briefcase,
  FolderOpen,
  Mail,
  CheckCircle2,
  AlertTriangle,
  Info,
  ArrowRight,
  ChevronRight,
  GraduationCap,
  ShieldCheck,
  TrendingUp,
  Trophy,
  Wallet,
  Clock,
  LifeBuoy,
} from "lucide-react";
import {
  eur,
  StageBadge,
  ProtectionCell,
  commissionEstimate,
  shortDate,
} from "@/components/partner/dealUi";

type ActionTone = "warn" | "info";
type ActionItem = { tone: ActionTone; category: string; text: string; to: string; cta: string };

export default function PartnerOverview() {
  const { partner, summary, deals, referrals } = usePartner();
  const { user } = useAuth();

  const firstName =
    (user?.user_metadata?.first_name as string) ||
    (user?.user_metadata?.full_name as string)?.split(" ")[0] ||
    user?.email?.split("@")[0] ||
    "there";

  const allDeals = (deals ?? []) as any[];
  const activeDeals = allDeals.filter((d) => ["pending", "approved"].includes(d.status));
  const wonDeals = allDeals.filter((d) => d.status === "won");

  const actions = useMemo<ActionItem[]>(() => {
    const list: ActionItem[] = [];
    for (const d of allDeals) {
      if (d.protection_expires_at && ["pending", "approved"].includes(d.status)) {
        const days = Math.ceil((new Date(d.protection_expires_at).getTime() - Date.now()) / 86400000);
        if (days >= 0 && days <= 30) {
          list.push({
            tone: "warn",
            category: "Protection expiring",
            text: `Deal protection for ${d.prospect_company} expires in ${days} day${days === 1 ? "" : "s"}.`,
            to: "/partner/deals",
            cta: "Review deal",
          });
        }
      }
      if (d.status === "pending") {
        list.push({
          tone: "info",
          category: "Pending review",
          text: `${d.prospect_company} is awaiting review by the partnerships team.`,
          to: "/partner/deals",
          cta: "View",
        });
      }
    }
    if (!partner?.display_name || !partner?.website_url) {
      list.push({
        tone: "warn",
        category: "Profile",
        text: "Your company profile is incomplete — add your display name and website.",
        to: "/partner/profile",
        cta: "Complete profile",
      });
    }
    if ((summary?.pending ?? 0) > 0) {
      list.push({
        tone: "info",
        category: "Payouts",
        text: `${eur(summary.pending)} commission is pending payout.`,
        to: "/partner/payouts",
        cta: "View payouts",
      });
    }
    if (allDeals.length === 0) {
      list.push({
        tone: "info",
        category: "Get started",
        text: "You haven't registered a deal yet — register your first opportunity.",
        to: "/partner/deals/new",
        cta: "Register deal",
      });
    }
    return list.slice(0, 5);
  }, [allDeals, partner, summary?.pending]);

  if (!partner) return null;

  const nextStep = allDeals.length === 0
    ? {
        text: "Register your first opportunity to activate deal protection and commission eligibility.",
        to: "/partner/deals/new",
      }
    : !partner.display_name || !partner.website_url
      ? {
          text: "Complete your company profile so we can list you in the partner directory.",
          to: "/partner/profile",
        }
      : (referrals ?? []).length === 0
        ? { text: "Share your referral link to start tracking attributed signups.", to: "/partner/referrals" }
        : { text: "Explore WorldAML sales resources to support your active pipeline.", to: "/partner/assets" };

  const certLevel = partner.certification_level
    ? `${partner.certification_level.charAt(0).toUpperCase()}${partner.certification_level.slice(1)} Certified`
    : null;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* ── Welcome + partner status ───────────────────────────── */}
      <div className="grid lg:grid-cols-[1.5fr_1fr] gap-4 items-start">
        <div className="flex flex-col justify-center py-1">
          <h1 className="text-2xl sm:text-[26px] font-bold text-foreground tracking-tight">
            Welcome back, {firstName}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Here's an overview of your WorldAML partnership.
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <Button asChild size="sm" className="h-9">
              <Link to="/partner/deals/new">
                <PlusCircle className="mr-1.5 w-4 h-4" /> Register new deal
              </Link>
            </Button>
            <Button asChild size="sm" variant="ghost" className="h-9 border border-border hover:bg-muted">
              <Link to="/partner/deals">
                <Briefcase className="mr-1.5 w-4 h-4 text-muted-foreground" /> Active deals
              </Link>
            </Button>
            <Button asChild size="sm" variant="ghost" className="h-9 border border-border hover:bg-muted">
              <Link to="/partner/assets">
                <FolderOpen className="mr-1.5 w-4 h-4 text-muted-foreground" /> Sales kit
              </Link>
            </Button>
            <Button asChild size="sm" variant="ghost" className="h-9 border border-border hover:bg-muted">
              <Link to="/partner/manager">
                <Mail className="mr-1.5 w-4 h-4 text-muted-foreground" /> Partner manager
              </Link>
            </Button>
          </div>
        </div>

        <Card className="border-teal/25 bg-gradient-to-br from-teal/[0.06] to-transparent">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-teal/12 text-teal flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground font-semibold">
                    Partner status
                  </div>
                  <div className="text-[15px] font-semibold text-foreground leading-tight">
                    Approved Partner
                  </div>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" /> Active
              </span>
            </div>

            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-border/70 pt-3">
              <Meta
                label="Partner type"
                value={(partner.partner_type || "Partner").replace(/_/g, " ")}
                strong
              />
              <Meta
                label="Commission"
                value={partner.commission_rate ? `${partner.commission_rate}%` : "—"}
                strong
              />
              <Meta
                label="Partner since"
                value={
                  (partner as any).created_at ? shortDate((partner as any).created_at) : "—"
                }
              />
              <div className="min-w-0">
                <dt className="text-[11px] text-muted-foreground">Referral code</dt>
                <dd className="text-xs font-mono text-muted-foreground truncate">
                  {partner.referral_code || "—"}
                </dd>
              </div>
            </dl>

            <p className="text-[11px] text-muted-foreground/80 mt-3 leading-snug">
              Partner type, commission and status are set by WorldAML.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ── KPIs ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <Kpi to="/partner/deals" icon={Briefcase} label="Active deals" value={String(activeDeals.length)} />
        <Kpi to="/partner/deals" icon={TrendingUp} label="Registered pipeline" value={eur(summary.pipelineValue)} />
        <Kpi
          to="/partner/deals"
          icon={Trophy}
          label="Won deals"
          value={String(wonDeals.length)}
          sub={wonDeals.length ? eur(summary.wonDealsValue) : undefined}
        />
        <Kpi to="/partner/payouts" icon={Wallet} label="Commission earned" value={eur(summary.lifetimeEarned)} tone="text-teal" />
        <Kpi to="/partner/payouts" icon={Clock} label="Pending payout" value={eur(summary.pending)} tone="text-amber-600" />
      </div>

      {/* ── Action centre ──────────────────────────────────────── */}
      <Card>
        <CardContent className="p-0">
          <div className="px-4 pt-4 pb-2 text-[11px] uppercase tracking-[0.08em] text-muted-foreground font-semibold">
            Action centre
          </div>
          {actions.length === 0 ? (
            <div className="flex items-center gap-2 px-4 pb-4 text-sm text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> You're all caught up.
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {actions.map((a, i) => {
                const Icon = a.tone === "warn" ? AlertTriangle : Info;
                return (
                  <li key={i}>
                    <Link
                      to={a.to}
                      className="group flex items-center justify-between gap-3 px-4 py-3 hover:bg-muted/50 transition-colors focus-visible:outline-none focus-visible:bg-muted/60"
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        <Icon
                          className={`w-4 h-4 mt-0.5 shrink-0 ${a.tone === "warn" ? "text-amber-600" : "text-teal"}`}
                        />
                        <div className="min-w-0">
                          <div className="text-[10px] uppercase tracking-[0.08em] font-semibold text-muted-foreground">
                            {a.category}
                          </div>
                          <p className="text-sm text-foreground mt-0.5 leading-snug">{a.text}</p>
                        </div>
                      </div>
                      <span className="shrink-0 hidden sm:inline-flex items-center gap-1 text-xs font-medium text-teal group-hover:underline">
                        {a.cta} <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                      <ChevronRight className="sm:hidden w-4 h-4 text-muted-foreground shrink-0" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* ── Active deals + growth ──────────────────────────────── */}
      <div className="grid lg:grid-cols-[1.6fr_1fr] gap-4 items-start">
        <Card>
          <CardContent className="p-0">
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
              <div className="text-sm font-semibold text-foreground">Active deals</div>
              <Link
                to="/partner/deals"
                className="text-xs font-medium text-teal hover:underline flex items-center gap-1"
              >
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {activeDeals.length === 0 ? (
              <div className="text-center px-4 py-10">
                <Briefcase className="w-5 h-5 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm font-medium text-foreground">No active opportunities</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Register your first WorldAML opportunity to start tracking protection.
                </p>
                <Button asChild size="sm" className="mt-4 h-9">
                  <Link to="/partner/deals/new">Register deal</Link>
                </Button>
              </div>
            ) : (
              <ul className="divide-y divide-border border-t border-border">
                {activeDeals.slice(0, 5).map((d: any) => {
                  const est = commissionEstimate(d.estimated_arr_eur, partner.commission_rate);
                  return (
                    <li key={d.id}>
                      <Link
                        to="/partner/deals"
                        className="group flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-foreground text-sm truncate">
                            {d.prospect_company}
                          </div>
                          <div className="text-xs text-muted-foreground truncate mt-0.5">
                            {(d.product_interest ?? []).join(", ") || d.prospect_country || "WorldAML"}
                          </div>
                        </div>
                        <div className="hidden sm:block text-right shrink-0 w-28">
                          <div className="text-sm font-semibold text-foreground tabular-nums">
                            {d.estimated_arr_eur ? eur(Number(d.estimated_arr_eur)) : "—"}
                          </div>
                          {est !== null && (
                            <div className="text-[11px] text-teal">{eur(est)} est. commission</div>
                          )}
                        </div>
                        <div className="hidden md:block shrink-0 w-36">
                          <StageBadge status={d.status} />
                          <ProtectionCell deal={d} className="mt-1" />
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground/60 group-hover:text-foreground shrink-0" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border-teal/25 bg-teal/[0.04]">
            <CardContent className="p-4">
              <div className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground font-semibold">
                Recommended next step
              </div>
              <p className="text-sm text-foreground mt-1.5 leading-snug">{nextStep.text}</p>
              <Button asChild size="sm" className="mt-3 h-9">
                <Link to={nextStep.to}>
                  Continue <ArrowRight className="ml-1.5 w-3.5 h-3.5" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground font-semibold">
                Partner activity
              </div>
              <dl className="mt-3 space-y-2.5">
                <GrowthRow label="Deals registered" value={String(allDeals.length)} />
                <GrowthRow label="Deals won" value={String(wonDeals.length)} />
                <GrowthRow
                  label="Referrals"
                  value={`${summary.referralConversions}/${summary.totalReferrals} converted`}
                />
                <GrowthRow
                  label="Verticals"
                  value={(partner.verticals ?? []).length ? (partner.verticals ?? []).join(", ") : "Not set"}
                />
              </dl>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Training + partner manager ─────────────────────────── */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="hover:border-teal/40 transition-colors">
          <CardContent className="p-4 flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-teal/10 text-teal flex items-center justify-center shrink-0">
              <GraduationCap className="w-4.5 h-4.5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold text-foreground">Training & certification</span>
                {certLevel && (
                  <span className="inline-flex items-center rounded-full border border-teal/30 bg-teal/10 px-2 py-0.5 text-[11px] font-medium text-teal">
                    {certLevel}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1 leading-snug">
                Continue your partner training through WorldAML Academy — no separate login required.
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                <Button asChild size="sm" variant="outline" className="h-9">
                  <Link to="/dashboard">Go to Academy</Link>
                </Button>
                <Button asChild size="sm" variant="ghost" className="h-9 text-teal">
                  <Link to="/partner/certification">View certification</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-teal/40 transition-colors">
          <CardContent className="p-4 flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-navy/10 text-navy flex items-center justify-center shrink-0">
              <LifeBuoy className="w-4.5 h-4.5" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-foreground">WorldAML Partnerships Team</div>
              <p className="text-xs text-muted-foreground mt-1 leading-snug">
                Support with deal reviews, pricing and co-selling.
              </p>
              <Button asChild size="sm" variant="outline" className="mt-3 h-9">
                <Link to="/partner/manager">
                  <Mail className="mr-1.5 w-3.5 h-3.5" /> Contact team
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Meta({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] text-muted-foreground">{label}</dt>
      <dd
        className={`capitalize truncate ${strong ? "text-sm font-semibold text-foreground" : "text-xs text-foreground"}`}
      >
        {value}
      </dd>
    </div>
  );
}

function Kpi({
  label,
  value,
  sub,
  tone,
  icon: Icon,
  to,
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: string;
  icon: React.ComponentType<{ className?: string }>;
  to?: string;
}) {
  const inner = (
    <CardContent className="p-4 h-full flex flex-col justify-between">
      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Icon className="w-3.5 h-3.5 shrink-0 text-muted-foreground/70" />
        <span className="truncate">{label}</span>
      </div>
      <div className={`text-2xl font-bold mt-2 tabular-nums leading-none ${tone ?? "text-foreground"}`}>
        {value}
      </div>
      <div className="text-[11px] text-muted-foreground mt-1 min-h-[14px]">{sub ?? ""}</div>
    </CardContent>
  );

  if (!to) return <Card className="h-full">{inner}</Card>;
  return (
    <Link to={to} className="block h-full rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/50">
      <Card className="h-full transition-colors hover:border-teal/40 hover:bg-muted/30">{inner}</Card>
    </Link>
  );
}

function GrowthRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium text-foreground text-right">{value}</dd>
    </div>
  );
}
