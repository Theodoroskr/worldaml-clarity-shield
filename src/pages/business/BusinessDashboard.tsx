import { Link } from "react-router-dom";
import { useEffect } from "react";
import {
  ArrowRight, Boxes, CreditCard, Users, LifeBuoy, Compass, GraduationCap,
  ShieldCheck, Clock, AlertCircle, CheckCircle2, ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useBusinessWorkspace } from "@/hooks/useBusinessWorkspace";
import { usePortalAccess } from "@/hooks/usePortalAccess";
import { useScreeningAccess } from "@/hooks/useScreeningAccess";
import { BUSINESS_SOLUTIONS, SOLUTION_BY_KEY, recommendSolutions, CROSS_SELL_COPY } from "@/lib/businessCatalogue";
import { SolutionCard, TalkToExpert } from "@/components/business/SolutionCard";
import { BusinessNewsFeed } from "@/components/business/BusinessNewsFeed";
import { DashboardSanctionsWidget } from "@/components/sanctions/DashboardSanctionsWidget";


const fmtDate = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

export default function BusinessDashboard() {
  const { account, activeEntitlements, ownedKeys, hasProducts, members, track } = useBusinessWorkspace();
  const { academyAccess } = usePortalAccess();
  const { hasAccess: hasScreeningAccess } = useScreeningAccess();

  useEffect(() => { track("dashboard_viewed"); }, [track]);

  const firstName = (account?.contact_name || "").split(" ")[0] || "there";
  const recommended = recommendSolutions(ownedKeys, hasProducts ? 2 : 3);

  // Action centre — only real, checkable states.
  const actions: { icon: typeof Clock; text: string; to: string; cta: string }[] = [];
  if (account && (!account.country || !account.industry || !account.company_size)) {
    actions.push({ icon: AlertCircle, text: "Complete your company profile to speed up checkout and quotes.", to: "/business/company", cta: "Complete" });
  }
  activeEntitlements.filter((e) => !e.setup_complete).forEach((e) => {
    actions.push({ icon: Clock, text: `${SOLUTION_BY_KEY[e.product_key]?.name ?? e.product_key}: setup not finished.`, to: "/business/products", cta: "Continue setup" });
  });
  activeEntitlements.filter((e) => e.renews_at && new Date(e.renews_at).getTime() - Date.now() < 30 * 864e5).forEach((e) => {
    actions.push({ icon: CreditCard, text: `${SOLUTION_BY_KEY[e.product_key]?.name ?? e.product_key} renews on ${fmtDate(e.renews_at)}.`, to: "/business/billing", cta: "Review" });
  });
  if (members.some((m) => m.status === "invited")) {
    actions.push({ icon: Users, text: "You have pending team invitations.", to: "/business/team", cta: "Manage team" });
  }

  const nextRenewal = activeEntitlements
    .filter((e) => e.renews_at)
    .sort((a, b) => new Date(a.renews_at!).getTime() - new Date(b.renews_at!).getTime())[0];
  const academySeats = members.filter((m) => m.academy_seat).length;

  const stats = [
    { label: "Active solutions", value: String(activeEntitlements.length), icon: Boxes, to: "/business/products" },
    { label: "Team members", value: String(members.length || 1), icon: Users, to: "/business/team" },
    { label: "Academy seats", value: String(academySeats), icon: GraduationCap, to: "/business/training" },
    { label: "Next renewal", value: nextRenewal ? fmtDate(nextRenewal.renews_at) : "—", icon: CreditCard, to: "/business/billing" },
  ];

  return (
    <div className="space-y-6 max-w-6xl">
      {/* WELCOME */}
      <section className="relative overflow-hidden rounded-2xl bg-navy text-primary-foreground px-6 py-6 md:px-8 md:py-7">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-teal/20 blur-3xl"
        />
        <div className="relative flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-teal">{account?.company_name}</p>
            <h1 className="mt-1.5 text-2xl md:text-3xl font-bold tracking-tight text-primary-foreground">
              {hasProducts ? `Welcome back, ${firstName}` : `Welcome to WorldAML, ${firstName}`}
            </h1>
            <p className="mt-1.5 text-sm text-primary-foreground/70 max-w-xl">
              {hasProducts
                ? "Your compliance stack at a glance — products, team, training and billing in one place."
                : "Build the compliance stack your business needs — screening, identity verification and training."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {hasProducts ? (
              <Button asChild variant="accent"><Link to="/business/products">Open your products <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
            ) : (
              <Button asChild variant="accent"><Link to="/business/solutions">Explore Solutions <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
            )}
            <Button asChild variant="outline" className="bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
              <Link to="/business/quotes">Talk to an Expert</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* AT A GLANCE */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s) => (
          <Link
            key={s.label}
            to={s.to}
            className="group rounded-xl border border-border bg-card px-4 py-3.5 hover:border-teal/50 hover:shadow-sm transition-all"
          >
            <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              <s.icon className="w-3.5 h-3.5 text-teal" />{s.label}
            </div>
            <p className="mt-1.5 text-xl font-bold text-foreground group-hover:text-teal transition-colors">{s.value}</p>
          </Link>
        ))}
      </section>

      {/* ACTION CENTRE */}
      {actions.length > 0 && (
        <Card className="border-amber-500/30 bg-amber-500/[0.04]">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" /> Action Centre
              <Badge variant="outline" className="ml-1 h-5 border-amber-500/40 bg-amber-500/10 text-[10px] text-amber-700">
                {actions.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-border/70">
            {actions.slice(0, 5).map((a, i) => (
              <div key={i} className="flex items-center justify-between gap-4 py-2.5 first:pt-0 last:pb-0">
                <div className="flex items-center gap-2.5 text-sm text-foreground/90">
                  <a.icon className="w-4 h-4 text-teal shrink-0" />{a.text}
                </div>
                <Button asChild size="sm" variant="outline" className="shrink-0"><Link to={a.to}>{a.cta}</Link></Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {hasProducts ? (
        <>
          {/* MY PRODUCTS */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">My WorldAML</h2>
              <Button asChild variant="ghost" size="sm"><Link to="/business/products">All products <ArrowRight className="ml-1.5 h-3.5 w-3.5" /></Link></Button>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {activeEntitlements.map((e) => {
                const sol = SOLUTION_BY_KEY[e.product_key];
                const pct = e.usage_limit && e.usage_used != null ? Math.min(100, Math.round((e.usage_used / e.usage_limit) * 100)) : null;
                return (
                  <Card key={e.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between gap-3">
                        <CardTitle className="text-base">{sol?.name ?? e.product_key}</CardTitle>
                        <Badge className="bg-teal/15 text-teal border-teal/30" variant="outline">{e.status.toUpperCase()}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{e.plan ?? "—"} · Renewal {fmtDate(e.renews_at)}</p>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {pct !== null && (
                        <div>
                          <div className="flex justify-between text-xs text-muted-foreground mb-1">
                            <span>{e.usage_used?.toLocaleString()} / {e.usage_limit?.toLocaleString()} {e.usage_unit ?? sol?.usageUnit ?? ""}</span>
                            <span>{pct}%</span>
                          </div>
                          <Progress value={pct} className="h-1.5" />
                        </div>
                      )}
                      <div className="flex gap-2">
                        {!e.setup_complete ? (
                          <Button asChild variant="accent" size="sm" className="flex-1"><Link to="/business/products">Continue Setup</Link></Button>
                        ) : sol?.openUrl ? (
                          <Button asChild variant="accent" size="sm" className="flex-1"><Link to={sol.openUrl}>Open Product</Link></Button>
                        ) : null}
                        <Button asChild variant="outline" size="sm" className="flex-1"><Link to="/business/billing">Manage Plan</Link></Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>

          {/* QUICK ACTIONS */}
          <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              { label: "AML Screening", to: hasScreeningAccess ? "/screening" : "/screening-monitoring/pricing", icon: ShieldCheck },
              { label: "Explore Solutions", to: "/business/solutions", icon: Compass },
              { label: "Manage Team", to: "/business/team", icon: Users },
              { label: "View Billing", to: "/business/billing", icon: CreditCard },
              { label: "Get Support", to: "/business/support", icon: LifeBuoy },
            ].map((q) => (
              <Link key={q.to} to={q.to} className="rounded-lg border border-border bg-card px-4 py-3 flex items-center gap-2.5 text-sm font-medium hover:border-teal/50 transition-colors">
                <q.icon className="w-4 h-4 text-teal" />{q.label}
              </Link>
            ))}
          </section>
        </>
      ) : (
        <>
          {/* NEW CUSTOMER — DISCOVER */}
          <section className="space-y-3">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Get started with WorldAML</h2>
              <p className="text-sm text-muted-foreground">Choose the solutions that match your compliance requirements.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {recommended.map((s) => (
                <SolutionCard
                  key={s.key}
                  solution={s}
                  status={s.plans.some((p) => p.checkout || p.configureUrl) ? "Available" : "Contact Sales"}
                  onView={() => track("product_viewed", s.key)}
                />
              ))}
            </div>
          </section>

          {/* WHY WORLDAML */}
          <section className="grid sm:grid-cols-3 gap-4">
            {[
              { icon: ShieldCheck, title: "Regulator-ready", body: "Audit trails and evidence built into every screening and verification decision." },
              { icon: Boxes, title: "One compliance stack", body: "Screening, monitoring, identity verification and training from a single supplier." },
              { icon: CheckCircle2, title: "Fast to activate", body: "Self-service plans go live immediately; enterprise deployments are guided by our team." },
            ].map((v) => (
              <Card key={v.title}><CardContent className="pt-6">
                <v.icon className="w-5 h-5 text-teal" />
                <p className="mt-2 font-semibold text-foreground">{v.title}</p>
                <p className="text-sm text-muted-foreground mt-1">{v.body}</p>
              </CardContent></Card>
            ))}
          </section>
        </>
      )}

      {/* RECOMMENDED */}
      {recommended.length > 0 && hasProducts && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Recommended for your business</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {recommended.map((s) => (
              <Card key={s.key} className="border-border/70">
                <CardContent className="pt-5 flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-foreground">{s.name}</p>
                    <p className="text-sm text-muted-foreground mt-1">{CROSS_SELL_COPY[s.key]}</p>
                  </div>
                  <Button asChild size="sm" variant="outline" className="shrink-0">
                    <Link to={`/business/solutions/${s.key}`}>View</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* SANCTIONS QUICK CHECK */}
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Sanctions quick check</h2>
            <p className="text-sm text-muted-foreground">Run an instant screening against global sanctions lists.</p>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link to="/business/solutions/worldaml#plans">Upgrade screening <ArrowRight className="ml-1.5 h-3.5 w-3.5" /></Link>
          </Button>
        </div>
        <DashboardSanctionsWidget />
      </section>

      {/* NEWS + INSIGHTS */}
      <BusinessNewsFeed />

      {/* SUITE + ACADEMY */}
      <section className="grid lg:grid-cols-2 gap-4">
        <Card className="border-teal/30 bg-teal/[0.04] flex flex-col">
          <CardContent className="pt-6 flex-1 flex flex-col gap-3">
            <span className="w-9 h-9 rounded-lg bg-teal/10 flex items-center justify-center">
              <ShieldCheck className="w-4.5 h-4.5 text-teal" />
            </span>
            <div className="flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">WorldAML Compliance Suite</p>
              <p className="font-semibold text-foreground mt-1">One workspace for onboarding, screening, cases and reporting</p>
              <p className="text-sm text-muted-foreground mt-1">
                See every Suite module, plans and pricing — then buy online or talk to our team.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <Button asChild variant="accent" size="sm"><Link to="/business/solutions/suite">View Suite plans &amp; buy</Link></Button>
              <Button asChild variant="outline" size="sm">
                <a href="/platform/suite" target="_blank" rel="noopener noreferrer">
                  Suite Overview <ExternalLink className="ml-2 h-3.5 w-3.5" />
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>



        <Card className="border-navy/20 bg-navy/[0.03] flex flex-col">
          <CardContent className="pt-6 flex-1 flex flex-col gap-3">
            <span className="w-9 h-9 rounded-lg bg-navy/5 flex items-center justify-center">
              <GraduationCap className="w-4.5 h-4.5 text-teal" />
            </span>
            <div className="flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">WorldAML Academy for Business</p>
              <p className="font-semibold text-foreground mt-1">Build compliance knowledge across your organisation</p>
              <p className="text-sm text-muted-foreground mt-1">
                Train employees across AML, sanctions and financial crime compliance. Individual courses from €29.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <Button asChild variant="accent" size="sm"><Link to="/business/training">Explore Business Training</Link></Button>
              {academyAccess && (
                <Button asChild variant="outline" size="sm"><Link to="/dashboard">My Learning <ExternalLink className="ml-2 h-3.5 w-3.5" /></Link></Button>
              )}
            </div>
          </CardContent>
        </Card>
      </section>


      <TalkToExpert />
    </div>
  );
}
