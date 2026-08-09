import { useMemo, useState } from "react";
import AdminActionRequired from "@/components/admin/AdminActionRequired";
import AdminPageAttention from "@/components/admin/AdminPageAttention";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import {
  Users, Building2, AlertTriangle, UserPlus, DollarSign, Activity, TrendingUp,
  BarChart3, Handshake, GraduationCap, Award, Inbox, ShieldCheck, Search,
  Briefcase, Target, PlayCircle, CheckCircle2, ArrowRight, TriangleAlert,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, Line, LineChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import AdminFilters from "@/components/admin/AdminFilters";
import { Funnel, KpiCard, Panel, RankList, SectionHeading } from "@/components/admin/AnalyticsPrimitives";
import { useAdminAnalytics } from "@/hooks/useAdminAnalytics";
import {
  DateRange, PortalKey, RANGE_LABELS, RangeKey, fmtEur, fmtEurCents, fmtNum,
  isPartialPeriod, pctChange, rate, resolveRange,
} from "@/lib/adminAnalytics";
import { exportSummaryCsv, exportSummaryPdf } from "@/lib/adminReportExport";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAdminRealtime } from "@/hooks/useAdminRealtime";
import DataFreshness from "@/components/admin/DataFreshness";


/** Recent activity feeds — kept from the original dashboard. */
async function loadFeeds() {
  const [{ data: recentSignups }, { data: recentLeads }] = await Promise.all([
    supabase.from("profiles").select("email, created_at, status").order("created_at", { ascending: false }).limit(8),
    supabase.from("form_submissions").select("id, email, company, created_at, form_type").order("created_at", { ascending: false }).limit(8),
  ]);
  return {
    recentSignups: recentSignups ?? [],
    recentLeads: (recentLeads ?? []) as { id: string; email: string | null; company: string | null; created_at: string; form_type: string | null }[],
  };
}

const show = (portal: PortalKey, ...areas: PortalKey[]) => portal === "all" || areas.includes(portal);

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [rangeKey, setRangeKey] = useState<RangeKey>("last_30_days");
  const [custom, setCustom] = useState<DateRange>(resolveRange("last_30_days"));
  const [portal, setPortal] = useState<PortalKey>("all");
  const [revenueGrain, setRevenueGrain] = useState<"daily" | "weekly" | "monthly">("daily");

  const range = useMemo(() => resolveRange(rangeKey, custom), [rangeKey, custom]);
  const partial = isPartialPeriod(range);
  const rangeLabel = rangeKey === "custom"
    ? `${format(range.from, "d MMM")} – ${format(range.to, "d MMM yyyy")}`
    : RANGE_LABELS[rangeKey];

  const { data: a, isLoading, isFetching, refetch, error } = useAdminAnalytics(range);
  const feeds = useQuery({ queryKey: ["admin-feeds"], queryFn: loadFeeds, staleTime: 60_000 });

  /**
   * Operational tables (leads, applications, deals, orders) stream in live.
   * Aggregated analytics are refetched alongside them so the KPI cards and the
   * feeds never disagree.
   */
  const [liveAt, setLiveAt] = useState<number | null>(null);
  useAdminRealtime(
    ["form_submissions", "partner_applications", "deal_registrations", "academy_course_purchases"],
    () => { setLiveAt(Date.now()); feeds.refetch(); refetch(); },
  );


  const spark = (key: keyof NonNullable<typeof a>["series"][number]) =>
    a?.series?.map((p) => Number(p[key] ?? 0)) ?? [];

  /** Revenue / growth series grouped to the selected grain. */
  const grouped = useMemo(() => {
    if (!a?.series) return [];
    if (revenueGrain === "daily") {
      return a.series.map((p) => ({ ...p, bucket: format(new Date(p.date), "d MMM") }));
    }
    const map = new Map<string, any>();
    for (const p of a.series) {
      const d = new Date(p.date);
      const key = revenueGrain === "monthly"
        ? format(d, "MMM yyyy")
        : `w/c ${format(new Date(d.getTime() - ((d.getDay() + 6) % 7) * 86_400_000), "d MMM")}`;
      const cur = map.get(key) ?? { bucket: key, revenue_cents: 0, orders: 0, users: 0, leads: 0, business_signups: 0, certificates: 0, starts: 0, searches: 0 };
      for (const k of ["revenue_cents", "orders", "users", "leads", "business_signups", "certificates", "starts", "searches"] as const) {
        cur[k] += Number(p[k] ?? 0);
      }
      map.set(key, cur);
    }
    return Array.from(map.values());
  }, [a?.series, revenueGrain]);

  /** Rule-based exceptions — only thresholds that can be computed reliably. */
  const exceptions = useMemo(() => {
    if (!a || partial) return [];
    const out: { text: string; path?: string }[] = [];
    const rev = pctChange(a.current.revenue_cents, a.previous.revenue_cents);
    const usr = pctChange(a.current.new_users, a.previous.new_users);
    const lds = pctChange(a.current.new_leads, a.previous.new_leads);
    if (rev !== null && rev <= -25) out.push({ text: `Revenue down ${Math.abs(rev)}% vs previous period`, path: "/admin/purchase-status" });
    if (usr !== null && usr <= -25) out.push({ text: `New signups down ${Math.abs(usr)}% vs previous period`, path: "/admin/users" });
    if (lds !== null && lds <= -25) out.push({ text: `New leads down ${Math.abs(lds)}% vs previous period`, path: "/admin/forms" });
    if ((a.actions.unreconciled_purchases ?? 0) > 0) out.push({ text: `${a.actions.unreconciled_purchases} checkout(s) stuck in pending`, path: "/admin/reconcile-purchases" });
    if ((a.actions.deals_pending_review ?? 0) >= 3) out.push({ text: `${a.actions.deals_pending_review} partner deals awaiting review`, path: "/admin/partners" });
    if (a.academy.completion_rate < 40) out.push({ text: `Academy completion rate is ${a.academy.completion_rate}%`, path: "/admin/academy-funnel" });
    return out;
  }, [a, partial]);

  const actionItems = a
    ? [
        { label: "Pending partner applications", value: a.actions.pending_partner_apps, path: "/admin/partners" },
        { label: "Deals awaiting review", value: a.actions.deals_pending_review, path: "/admin/partners" },
        { label: "Unreconciled purchases", value: a.actions.unreconciled_purchases, path: "/admin/reconcile-purchases" },
        { label: "Untouched new leads", value: a.actions.new_leads_untouched, path: "/admin/forms" },
        { label: "Open Suite alerts", value: a.actions.open_alerts, path: "/admin/alert-rules" },
        { label: "Business accounts to review", value: a.actions.pending_business_accounts, path: "/admin/business" },
        { label: "Partner co-branding requests", value: a.actions.pending_cobrand_requests, path: "/admin/partner-assets" },
        { label: "Published courses missing pricing", value: a.actions.courses_missing_price, path: "/admin/pricing" },
      ].filter((i) => (i.value ?? 0) > 0)
    : [];

  return (
    <div className="p-6 space-y-6">
      {/* Header + global controls */}
      <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
          <AdminPageAttention path="/admin/dashboard" className="ml-2" />
          <p className="text-sm text-muted-foreground mt-1">
            Internal intelligence across Academy, Business, Partners, Platform and Marketing — every figure is queried live from the database.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <AdminFilters
            rangeKey={rangeKey}
            onRangeKey={(k) => { setRangeKey(k); if (k !== "custom") setCustom(resolveRange(k)); }}
            custom={custom}
            onCustom={setCustom}
            portal={portal}
            onPortal={setPortal}
            onRefresh={() => { refetch(); feeds.refetch(); }}
            refreshing={isFetching}
            lastUpdated={a?.generated_at ?? null}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9" disabled={!a}>Download report</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover z-50">
              <DropdownMenuItem onClick={() => a && exportSummaryPdf(a, rangeLabel)}>Summary PDF</DropdownMenuItem>
              <DropdownMenuItem onClick={() => a && exportSummaryCsv(a, rangeLabel)}>Summary CSV</DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/admin/reports")}>Scheduled reports…</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <AdminActionRequired path="/admin/dashboard" />

      {error && (
        <Card className="border-destructive/40">
          <CardContent className="p-4 text-sm text-destructive">
            Could not load metrics from the backend. Try refreshing.
          </CardContent>
        </Card>
      )}

      {partial && (
        <p className="text-[11px] text-muted-foreground">
          The selected period is still in progress — period-on-period comparisons are hidden to avoid misleading figures.
        </p>
      )}

      {isLoading || !a ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <Card key={i} className="border-border">
              <CardContent className="p-4 space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {/* ROW 1 — Core WorldAML KPIs */}
          <section className="space-y-2">
            <SectionHeading title="WorldAML performance" hint={rangeLabel} />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <KpiCard label="Total Users" value={fmtNum(a.lifetime.total_users)} icon={Users} color="text-blue-500" scope="Lifetime" path="/admin/users" />
              <KpiCard label="New Users" value={fmtNum(a.current.new_users)} icon={UserPlus} color="text-purple-500" scope="Period" delta={pctChange(a.current.new_users, a.previous.new_users)} partial={partial} spark={spark("users")} path="/admin/users" />
              <KpiCard label="Active Users" value={fmtNum(a.current.active_users)} icon={Activity} color="text-primary" scope="Period" note="Any portal activity" />
              <KpiCard label="Revenue" value={fmtEurCents(a.current.revenue_cents)} icon={DollarSign} color="text-emerald-500" scope="Period" delta={pctChange(a.current.revenue_cents, a.previous.revenue_cents)} partial={partial} spark={spark("revenue_cents")} path="/admin/purchase-status" />
              <KpiCard label="Paid Orders" value={fmtNum(a.current.paid_orders)} icon={BarChart3} color="text-emerald-500" scope="Period" delta={pctChange(a.current.paid_orders, a.previous.paid_orders)} partial={partial} spark={spark("orders")} path="/admin/purchase-status" />
              <KpiCard label="New Leads" value={fmtNum(a.current.new_leads)} icon={Inbox} color="text-cyan-500" scope="Period" delta={pctChange(a.current.new_leads, a.previous.new_leads)} partial={partial} spark={spark("leads")} path="/admin/forms" />
              <KpiCard label="Business Accounts" value={fmtNum(a.lifetime.business_accounts)} icon={Building2} color="text-blue-500" scope="Lifetime" path="/admin/business" />
              <KpiCard label="Active Partners" value={fmtNum(a.lifetime.active_partners)} icon={Handshake} color="text-teal-500" scope="Lifetime" path="/admin/partners" />
              <KpiCard label="Pending Applications" value={fmtNum(a.lifetime.pending_applications)} icon={UserPlus} color="text-amber-500" scope="Now" path="/admin/partners" />
              <KpiCard label="Deal Registrations" value={fmtNum(a.lifetime.deal_registrations)} icon={Target} color="text-purple-500" scope="Lifetime" path="/admin/partners" />
              <KpiCard label="Active Orgs" value={fmtNum(a.lifetime.active_orgs)} icon={Building2} color="text-emerald-500" scope="Lifetime" path="/admin/organizations" />
              <KpiCard label="Open Alerts" value={fmtNum(a.lifetime.open_alerts)} icon={AlertTriangle} color="text-amber-500" scope="Now" path="/admin/alert-rules" />
            </div>
          </section>

          {/* ROW 2 — Revenue + user growth */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Panel
              title="Revenue over time"
              action={
                <div className="flex gap-1">
                  {(["daily", "weekly", "monthly"] as const).map((g) => (
                    <Button key={g} size="sm" variant={revenueGrain === g ? "secondary" : "ghost"} className="h-7 px-2 text-[11px] capitalize" onClick={() => setRevenueGrain(g)}>
                      {g}
                    </Button>
                  ))}
                </div>
              }
            >
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={grouped}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="bucket" tick={{ fontSize: 10 }} minTickGap={20} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `€${Math.round(v / 100)}`} />
                    <Tooltip formatter={(v: number) => fmtEurCents(v)} contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", fontSize: 12 }} />
                    <Area type="monotone" dataKey="revenue_cents" name="Revenue" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.2)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Academy course payments in EUR. Business and partner-sourced revenue will appear here once those orders are recorded.
              </p>
            </Panel>

            <Panel title="User growth">
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={grouped}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="bucket" tick={{ fontSize: 10 }} minTickGap={20} />
                    <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                    <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", fontSize: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Line type="monotone" dataKey="users" name="Unique users" stroke="hsl(var(--primary))" dot={false} strokeWidth={2} />
                    <Line type="monotone" dataKey="business_signups" name="Business accounts" stroke="hsl(var(--accent))" dot={false} strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p className="text-[10px] text-muted-foreground">
                One person holds one user record even with several portal entitlements — business accounts are counted separately.
              </p>
            </Panel>
          </section>

          {/* ROW 3 — Academy | Business | Partner */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {show(portal, "academy") && (
              <Panel title="Academy" action={<Button size="sm" variant="ghost" className="h-7 text-[11px]" onClick={() => navigate("/admin/analytics")}>Details <ArrowRight className="w-3 h-3 ml-1" /></Button>}>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <Stat label="Learners active" value={fmtNum(a.academy.learners_with_activity)} />
                  <Stat label="Paying learners" value={fmtNum(a.academy.paying_users)} />
                  <Stat label="Completion rate" value={`${a.academy.completion_rate}%`} />
                  <Stat label="Repeat buyers" value={fmtNum(a.academy.repeat_purchasers)} />
                  <Stat label="Started (period)" value={fmtNum(a.current.courses_started)} />
                  <Stat label="Certificates (period)" value={fmtNum(a.current.certificates)} />
                </div>
                <Funnel steps={[
                  { label: "Signups", value: a.academy.funnel.signups },
                  { label: "Course started", value: a.academy.funnel.started },
                  { label: "Course completed", value: a.academy.funnel.completed },
                  { label: "Certificate issued", value: a.academy.funnel.certified },
                ]} />
              </Panel>
            )}

            {show(portal, "business") && (
              <Panel title="Business" action={<Button size="sm" variant="ghost" className="h-7 text-[11px]" onClick={() => navigate("/admin/business")}>Open <ArrowRight className="w-3 h-3 ml-1" /></Button>}>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <Stat label="Accounts" value={fmtNum(a.business.total)} />
                  <Stat label="New (period)" value={fmtNum(a.current.new_business_accounts)} />
                  <Stat label="Team members" value={fmtNum(a.business.members)} />
                  <Stat label="Active products" value={fmtNum(a.business.active_entitlements)} />
                </div>
                <Funnel steps={[
                  { label: "Business signup", value: a.business.funnel.signups },
                  { label: "Solutions viewed", value: a.business.funnel.solutions_viewed },
                  { label: "Product viewed", value: a.business.funnel.product_viewed },
                  { label: "Checkout started", value: a.business.funnel.checkout_started },
                  { label: "Purchased", value: a.business.funnel.purchased },
                ]} />
              </Panel>
            )}

            {show(portal, "partners") && (
              <Panel title="Partners" action={<Button size="sm" variant="ghost" className="h-7 text-[11px]" onClick={() => navigate("/admin/partners")}>Open <ArrowRight className="w-3 h-3 ml-1" /></Button>}>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <Stat label="Active partners" value={fmtNum(a.partners.active)} />
                  <Stat label="Pipeline" value={fmtEur(a.partners.pipeline_eur)} />
                  <Stat label="Won ARR" value={fmtEur(a.partners.won_eur)} />
                  <Stat label="Avg deal" value={fmtEur(a.partners.avg_deal_eur)} />
                  <Stat label="Commission earned" value={fmtEurCents(a.partners.commission_earned_cents)} />
                  <Stat label="Deal conversion" value={rate(a.partners.funnel.won_deal, a.partners.funnel.registered_deal)} />
                </div>
                <Funnel steps={[
                  { label: "Applications", value: a.partners.funnel.applications },
                  { label: "Approved", value: a.partners.funnel.approved },
                  { label: "Registered a deal", value: a.partners.funnel.registered_deal },
                  { label: "Deal approved", value: a.partners.funnel.approved_deal },
                  { label: "Deal won", value: a.partners.funnel.won_deal },
                ]} />
              </Panel>
            )}
          </section>

          {/* ROW 4 — Marketing / leads */}
          {show(portal, "marketing") && (
            <section className="space-y-2">
              <SectionHeading title="Marketing & leads" hint={rangeLabel} />
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <Panel title="Leads by form type">
                  <div className="h-44">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={a.marketing.by_form_type} layout="vertical" margin={{ left: 8 }}>
                        <XAxis type="number" tick={{ fontSize: 10 }} allowDecimals={false} />
                        <YAxis type="category" dataKey="label" width={95} tick={{ fontSize: 10 }} />
                        <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", fontSize: 12 }} />
                        <Bar dataKey="n" name="Leads" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Panel>
                <Panel title="Top lead sources">
                  <RankList items={a.marketing.by_referrer.map((r) => ({ label: r.label, value: r.n }))} />
                </Panel>
                <Panel title="Leads by country">
                  <RankList items={a.marketing.by_country.map((r) => ({ label: r.label, value: r.n }))} />
                </Panel>
                <Panel title="Lead pipeline status">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {Object.entries(a.marketing.by_status).map(([k, v]) => (
                      <Stat key={k} label={k} value={fmtNum(v)} />
                    ))}
                  </div>
                  <RankList
                    items={a.marketing.by_utm_source.map((r) => ({ label: `utm: ${r.label}`, value: r.n }))}
                    empty="No UTM-tagged leads in this period"
                  />
                </Panel>
              </div>
            </section>
          )}

          {/* ROW 5 — Product & screening */}
          {show(portal, "platform", "academy", "business") && (
            <section className="space-y-2">
              <SectionHeading title="Product & screening activity" />
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <KpiCard label="Suite Users" value={fmtNum(a.lifetime.suite_users)} icon={TrendingUp} color="text-primary" scope="Lifetime" path="/admin/users" />
                <KpiCard label="Suite Screenings" value={fmtNum(a.current.suite_screenings)} icon={ShieldCheck} color="text-cyan-500" scope="Period" delta={pctChange(a.current.suite_screenings, a.previous.suite_screenings)} partial={partial} />
                <KpiCard label="Sanctions Searches" value={fmtNum(a.current.sanctions_searches)} icon={Search} color="text-cyan-500" scope="Period" delta={pctChange(a.current.sanctions_searches, a.previous.sanctions_searches)} partial={partial} spark={spark("searches")} />
                <KpiCard label="Certificates" value={fmtNum(a.lifetime.certificates)} icon={Award} color="text-amber-500" scope="Lifetime" path="/admin/academy-users" />
                <KpiCard label="Academy Users" value={fmtNum(a.academy.learners_with_activity)} icon={GraduationCap} color="text-blue-500" scope="With activity" path="/admin/academy-users" />
                <KpiCard label="Business Events" value={fmtNum(a.current.business_events)} icon={Briefcase} color="text-blue-500" scope="Period" path="/admin/business" />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
                <Panel title="Top courses">
                  <RankList items={a.academy.top_courses.map((c) => ({ label: c.title, value: c.enrolments, sub: `${c.completions} completed` }))} />
                </Panel>
                <Panel title="Top products viewed (Business)">
                  <RankList items={a.business.top_products.map((p) => ({ label: p.product, value: p.views }))} />
                </Panel>
                <Panel title="Top partners">
                  <RankList items={a.partners.top_partners.map((p) => ({ label: p.name, value: p.deals, sub: fmtEur(p.pipeline_eur) }))} />
                </Panel>
              </div>
            </section>
          )}

          {/* ROW 6 — Action centre + exceptions */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Panel title="Internal action centre">
              {actionItems.length === 0 ? (
                <p className="text-xs text-muted-foreground flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Nothing needs attention right now.</p>
              ) : (
                <div className="space-y-1">
                  {actionItems.map((i) => (
                    <button
                      key={i.label}
                      onClick={() => navigate(i.path)}
                      className="w-full flex items-center justify-between gap-3 px-2 py-2 rounded-md text-left text-xs hover:bg-muted transition-colors"
                    >
                      <span className="text-foreground">{i.label}</span>
                      <span className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{i.value}</Badge>
                        <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </Panel>

            <Panel title="Exceptions">
              {exceptions.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  {partial ? "Comparisons run once the selected period has completed." : "No threshold breaches for this period."}
                </p>
              ) : (
                <div className="space-y-1">
                  {exceptions.map((e) => (
                    <button
                      key={e.text}
                      onClick={() => e.path && navigate(e.path)}
                      className="w-full flex items-center gap-2 px-2 py-2 rounded-md text-left text-xs hover:bg-muted transition-colors"
                    >
                      <TriangleAlert className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span className="text-foreground">{e.text}</span>
                    </button>
                  ))}
                </div>
              )}
            </Panel>
          </section>
        </>
      )}

      {/* ROW 7 — Recent activity (unchanged behaviour) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" /> Recent Signups
            </CardTitle>
          </CardHeader>
          <CardContent>
            {feeds.isLoading ? (
              <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-6 w-full" />)}</div>
            ) : (
              <div className="space-y-2">
                {feeds.data?.recentSignups.map((u, i) => (
                  <div key={i} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                    <span className="text-sm text-foreground truncate max-w-[200px]">{u.email ?? "—"}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant={u.status === "approved" ? "default" : u.status === "pending" ? "secondary" : "destructive"} className="text-[10px] px-1.5 py-0">
                        {u.status ?? "unknown"}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">{format(new Date(u.created_at), "MMM d")}</span>
                    </div>
                  </div>
                ))}
                {feeds.data?.recentSignups.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No signups yet</p>}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Inbox className="w-4 h-4 text-primary" /> Latest Enquiries
            </CardTitle>
          </CardHeader>
          <CardContent>
            {feeds.isLoading ? (
              <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-6 w-full" />)}</div>
            ) : (
              <div className="space-y-2">
                {feeds.data?.recentLeads.map((l) => (
                  <div key={l.id} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                    <span className="text-sm text-foreground truncate max-w-[220px]">
                      {l.email ?? "—"}
                      {l.company ? <span className="text-muted-foreground"> · {l.company}</span> : null}
                    </span>
                    <div className="flex items-center gap-2">
                      {l.form_type && <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{l.form_type}</Badge>}
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">{format(new Date(l.created_at), "MMM d")}</span>
                    </div>
                  </div>
                ))}
                {feeds.data?.recentLeads.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No enquiries yet</p>}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border/60 px-2 py-1.5">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground truncate">{label}</div>
      <div className="text-sm font-semibold text-foreground">{value}</div>
    </div>
  );
}
