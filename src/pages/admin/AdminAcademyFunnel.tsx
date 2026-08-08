import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, TrendingUp, Download, RefreshCw, Filter, ChevronRight, Search, TrendingDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { KpiCard, DefinitionsButton, MetricInfo } from "@/components/admin/AcademyMetricUI";
import { RangePicker } from "@/components/admin/RangePicker";
import {
  FREE_EMAIL_DOMAINS as FREE_EMAIL,
  domainOf,
  money,
  pct,
  resolveRange,
  useCourseTitles,
  type RangeKey,
} from "@/lib/academyAdmin";

interface Profile {
  user_id: string;
  email: string | null;
  full_name: string | null;
  company_name: string | null;
  created_at: string;
  signup_source?: string | null;
  signup_utm?: Record<string, string> | null;
}

interface Purchase {
  user_id: string;
  course_slug: string;
  amount_cents: number;
  currency: string;
  status: "pending" | "paid" | "failed" | "refunded";
  paid_at: string | null;
  created_at: string;
}

export default function AdminAcademyFunnel() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [range, setRange] = useState<RangeKey>("30d");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [domainSegment, setDomainSegment] = useState<"all" | "corporate" | "personal">("all");
  const { titleOf } = useCourseTitles();
  const [drill, setDrill] = useState<{
    kind: "course" | "domain";
    key: string;
    signupIds: string[];
    startedIds: string[];
    paidIds: string[];
  } | null>(null);

  const resolved = useMemo(
    () => resolveRange(range, customFrom, customTo),
    [range, customFrom, customTo],
  );

  const load = async () => {
    setLoading(true);
    setLoadError(null);
    const [{ data: p, error: pErr }, { data: pu, error: puErr }] = await Promise.all([
      supabase
        .from("profiles")
        .select("user_id, email, full_name, company_name, created_at, signup_source, signup_utm"),
      supabase
        .from("academy_course_purchases")
        .select("user_id, course_slug, amount_cents, currency, status, paid_at, created_at"),
    ]);
    if (pErr || puErr) {
      const msg = (pErr || puErr)?.message || "Failed to load funnel data";
      setLoadError(msg);
      toast.error(msg);
      setLoading(false);
      return;
    }
    setProfiles((p || []) as Profile[]);
    setPurchases((pu || []) as Purchase[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const sourceOf = (p: Profile | undefined): string => {
    if (!p) return "Unknown";
    const utm = (p.signup_utm || {}) as Record<string, string>;
    return utm.utm_source || p.signup_source || "Direct / unknown";
  };

  const data = useMemo(() => {
    const start = resolved.start;
    const end = resolved.end;
    const within = (ts: string) => {
      const t = new Date(ts).getTime();
      return t >= start && t <= end;
    };

    // Signups in range
    const signups = profiles.filter(p => within(p.created_at));

    // Purchases in range (by created_at)
    const inRangePurchases = purchases.filter(pu => within(pu.created_at));

    // Per-user state
    const userStartedSet = new Set<string>();
    const userPaidSet = new Set<string>();
    const userRevenue = new Map<string, number>();
    inRangePurchases.forEach(pu => {
      userStartedSet.add(pu.user_id);
      if (pu.status === "paid") {
        userPaidSet.add(pu.user_id);
        userRevenue.set(pu.user_id, (userRevenue.get(pu.user_id) || 0) + (pu.amount_cents || 0));
      }
    });

    const profileByIdAll = new Map(profiles.map(p => [p.user_id, p]));

    // Domain segment filter for signups & users
    const filterUser = (userId: string) => {
      if (domainSegment === "all") return true;
      const prof = profileByIdAll.get(userId);
      const dom = domainOf(prof?.email);
      const isCorporate = !!dom && !FREE_EMAIL.has(dom);
      return domainSegment === "corporate" ? isCorporate : !isCorporate;
    };

    const filteredSignups = signups.filter(p => filterUser(p.user_id));
    const filteredStarted = Array.from(userStartedSet).filter(filterUser);
    const filteredPaid = Array.from(userPaidSet).filter(filterUser);

    const totalSignups = filteredSignups.length;
    const totalStarted = filteredStarted.length;
    const totalPaid = filteredPaid.length;
    const totalRevenue = filteredPaid.reduce((s, uid) => s + (userRevenue.get(uid) || 0), 0);

    // Lifetime revenue — shown alongside so period €0 never looks like a bug.
    const lifetimeRevenue = purchases
      .filter(pu => pu.status === "paid")
      .reduce((s, pu) => s + (pu.amount_cents || 0), 0);

    // Drop-off (commercial leakage)
    const signupsNoCheckout = Math.max(
      filteredSignups.filter(p => !userStartedSet.has(p.user_id)).length,
      0,
    );
    const checkoutNotPaid = Math.max(totalStarted - totalPaid, 0);

    // Per-course
    const courseMap = new Map<string, {
      started: Set<string>; paid: Set<string>; revenue: number; currency: string;
      paidRows: number; failedRows: number; pendingRows: number; refundedRows: number;
    }>();
    inRangePurchases.forEach(pu => {
      if (!filterUser(pu.user_id)) return;
      const c = courseMap.get(pu.course_slug) || {
        started: new Set<string>(), paid: new Set<string>(), revenue: 0, currency: pu.currency,
        paidRows: 0, failedRows: 0, pendingRows: 0, refundedRows: 0,
      };
      c.started.add(pu.user_id);
      if (pu.status === "paid") {
        c.paid.add(pu.user_id);
        c.revenue += pu.amount_cents || 0;
        c.paidRows += 1;
      } else if (pu.status === "failed") c.failedRows += 1;
      else if (pu.status === "pending") c.pendingRows += 1;
      else if (pu.status === "refunded") c.refundedRows += 1;
      c.currency = pu.currency || c.currency;
      courseMap.set(pu.course_slug, c);
    });
    const courseRows = Array.from(courseMap.entries()).map(([slug, v]) => ({
      slug,
      started: v.started.size,
      paid: v.paid.size,
      conversion: pct(v.paid.size, v.started.size),
      revenue: v.revenue,
      currency: v.currency,
      aov: v.paidRows ? v.revenue / v.paidRows : 0,
      failedRows: v.failedRows,
      pendingRows: v.pendingRows,
      refundedRows: v.refundedRows,
      startedIds: Array.from(v.started),
      paidIds: Array.from(v.paid),
    })).sort((a, b) => b.paid - a.paid || b.started - a.started);

    // Per-domain
    const domainMap = new Map<string, {
      signups: Set<string>;
      started: Set<string>;
      paid: Set<string>;
      revenue: number;
      isCorporate: boolean;
    }>();
    const ensureDom = (dom: string) => {
      let d = domainMap.get(dom);
      if (!d) {
        d = { signups: new Set(), started: new Set(), paid: new Set(), revenue: 0, isCorporate: !!dom && !FREE_EMAIL.has(dom) };
        domainMap.set(dom, d);
      }
      return d;
    };
    filteredSignups.forEach(p => {
      const dom = domainOf(p.email) || "(unknown)";
      ensureDom(dom).signups.add(p.user_id);
    });
    inRangePurchases.forEach(pu => {
      if (!filterUser(pu.user_id)) return;
      const prof = profileByIdAll.get(pu.user_id);
      const dom = domainOf(prof?.email) || "(unknown)";
      const d = ensureDom(dom);
      d.started.add(pu.user_id);
      if (pu.status === "paid") {
        d.paid.add(pu.user_id);
        d.revenue += pu.amount_cents || 0;
      }
    });
    const domainRows = Array.from(domainMap.entries())
      .map(([dom, v]) => ({
        domain: dom,
        isCorporate: v.isCorporate,
        users: v.signups.size + Array.from(v.started).filter(u => !v.signups.has(u)).length,
        signups: v.signups.size,
        started: v.started.size,
        paid: v.paid.size,
        signupToPaid: pct(v.paid.size, v.signups.size),
        startedToPaid: pct(v.paid.size, v.started.size),
        revenue: v.revenue,
        signupIds: Array.from(v.signups),
        startedIds: Array.from(v.started),
        paidIds: Array.from(v.paid),
      }))
      .filter(r => r.signups + r.started + r.paid > 0)
      .sort((a, b) => b.paid - a.paid || b.signups - a.signups);

    // Per-source (from profiles.signup_utm.utm_source / signup_source)
    const sourceMap = new Map<string, { signups: number; started: Set<string>; paid: Set<string>; revenue: number }>();
    const ensureSrc = (k: string) => {
      let s = sourceMap.get(k);
      if (!s) { s = { signups: 0, started: new Set(), paid: new Set(), revenue: 0 }; sourceMap.set(k, s); }
      return s;
    };
    filteredSignups.forEach(p => { ensureSrc(sourceOf(p)).signups += 1; });
    inRangePurchases.forEach(pu => {
      if (!filterUser(pu.user_id)) return;
      const s = ensureSrc(sourceOf(profileByIdAll.get(pu.user_id)));
      s.started.add(pu.user_id);
      if (pu.status === "paid") { s.paid.add(pu.user_id); s.revenue += pu.amount_cents || 0; }
    });
    const sourceRows = Array.from(sourceMap.entries())
      .map(([source, v]) => ({
        source,
        signups: v.signups,
        started: v.started.size,
        paid: v.paid.size,
        revenue: v.revenue,
        conversion: pct(v.paid.size, v.signups),
      }))
      .sort((a, b) => b.revenue - a.revenue || b.signups - a.signups);

    // Lookup helpers for drill-down
    const purchasesByUser = new Map<string, Purchase[]>();
    inRangePurchases.forEach(pu => {
      const arr = purchasesByUser.get(pu.user_id) || [];
      arr.push(pu);
      purchasesByUser.set(pu.user_id, arr);
    });
    const signupsInRangeSet = new Set(signups.map(s => s.user_id));

    return {
      totalSignups,
      totalStarted,
      totalPaid,
      totalRevenue,
      lifetimeRevenue,
      signupsNoCheckout,
      checkoutNotPaid,
      signupToStarted: pct(totalStarted, totalSignups),
      startedToPaid: pct(totalPaid, totalStarted),
      signupToPaid: pct(totalPaid, totalSignups),
      courseRows,
      domainRows,
      sourceRows,
      profileById: profileByIdAll,
      purchasesByUser,
      signupsInRangeSet,
    };
  }, [profiles, purchases, resolved, domainSegment]);

  const exportCsv = (filename: string, rows: (string | number)[][]) => {
    const csv = rows
      .map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportCourses = () => {
    exportCsv(`academy-funnel-courses-${range}.csv`, [
      ["course", "course_slug", "started_checkout", "paid", "conversion_%", "avg_order_value", "failed_rows", "pending_rows", "refunded_rows", "revenue", "currency"],
      ...data.courseRows.map(r => [
        titleOf(r.slug), r.slug, r.started, r.paid, r.conversion,
        (r.aov / 100).toFixed(2), r.failedRows, r.pendingRows, r.refundedRows,
        (r.revenue / 100).toFixed(2), r.currency.toUpperCase(),
      ]),
    ]);
  };

  const exportDomains = () => {
    exportCsv(`academy-funnel-domains-${range}.csv`, [
      ["domain", "is_corporate", "signups", "started_checkout", "paid", "signup_to_paid_%", "started_to_paid_%", "revenue_eur"],
      ...data.domainRows.map(r => [r.domain, r.isCorporate ? "yes" : "no", r.signups, r.started, r.paid, r.signupToPaid, r.startedToPaid, (r.revenue / 100).toFixed(2)]),
    ]);
  };

  const exportSources = () => {
    exportCsv(`academy-funnel-sources-${range}.csv`, [
      ["source", "signups", "started_checkout", "paid", "signup_to_paid_%", "revenue_eur"],
      ...data.sourceRows.map(r => [r.source, r.signups, r.started, r.paid, r.conversion, (r.revenue / 100).toFixed(2)]),
    ]);
  };

  const periodLabel = resolved.isLifetime ? "Lifetime" : resolved.label;

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Academy Funnel Metrics
          </h1>
          <p className="text-xs text-muted-foreground">
            Conversion from signup → checkout → paid, broken down by course, email domain and source.
          </p>
          <DefinitionsButton />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={`w-3.5 h-3.5 mr-1 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Range</span>
          <RangePicker
            value={range} onChange={setRange}
            from={customFrom} to={customTo}
            onFromChange={setCustomFrom} onToChange={setCustomTo}
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Segment</span>
          <Select value={domainSegment} onValueChange={(v) => setDomainSegment(v as any)}>
            <SelectTrigger className="w-40 h-9 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All emails</SelectItem>
              <SelectItem value="corporate">Corporate only</SelectItem>
              <SelectItem value="personal">Personal only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Building funnel…</span>
        </div>
      ) : loadError ? (
        <Card className="p-8 text-center space-y-3">
          <p className="text-sm text-destructive">{loadError}</p>
          <Button size="sm" variant="outline" onClick={load}>Try again</Button>
        </Card>
      ) : (
        <>
          {/* Top funnel */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KpiCard
              label="Signups" value={data.totalSignups} scope={periodLabel}
              info="Profiles created in the selected period. Every WorldAML account creates a profile, so this is platform-wide top-of-funnel — not only Academy buyers."
            />
            <KpiCard
              label="Started checkout" value={data.totalStarted} accent="blue" scope={periodLabel}
              sub={`${data.signupToStarted}% signup → checkout`}
              info="Unique users with at least one Academy checkout session created during the selected period. Abandoned checkouts count here."
            />
            <KpiCard
              label="Paid learners" value={data.totalPaid} accent="emerald" scope={periodLabel}
              sub={`${data.startedToPaid}% of checkouts · ${data.signupToPaid}% of signups`}
              info="Unique users with at least one purchase in status 'paid' created in the selected period."
            />
            <KpiCard
              label="Revenue" value={money(data.totalRevenue)} accent="violet" scope={periodLabel}
              sub={`Lifetime Academy revenue ${money(data.lifetimeRevenue)}`}
              info="Sum of paid purchases created in the selected period. Lifetime revenue ignores the date filter — that is why the two can differ."
            />
          </div>

          {/* Conversion + drop-off */}
          <div className="grid gap-3 md:grid-cols-2">
            <Card className="p-4">
              <div className="text-xs font-semibold uppercase text-muted-foreground mb-2">Funnel</div>
              <FunnelBar label="Signups" value={data.totalSignups} max={Math.max(data.totalSignups, 1)} color="bg-slate-400" />
              <FunnelBar label="Started checkout" value={data.totalStarted} max={Math.max(data.totalSignups, 1)} color="bg-blue-500" />
              <FunnelBar label="Paid" value={data.totalPaid} max={Math.max(data.totalSignups, 1)} color="bg-emerald-500" />
              <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-border">
                <ConvStat label="Signup → Checkout" value={data.signupToStarted} />
                <ConvStat label="Checkout → Paid" value={data.startedToPaid} />
                <ConvStat label="Signup → Paid" value={data.signupToPaid} />
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
                <span className="text-xs font-semibold uppercase text-muted-foreground">Drop-off</span>
                <MetricInfo text="Where the commercial leakage happens in the selected period. Signups that never opened a checkout, and checkouts that never completed payment." />
              </div>
              <div className="space-y-3">
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl font-semibold text-rose-500 tabular-nums">{data.signupsNoCheckout}</span>
                  <span className="text-xs text-muted-foreground">
                    signed up but did not start checkout
                    {data.totalSignups > 0 && ` · ${pct(data.signupsNoCheckout, data.totalSignups)}% of signups`}
                  </span>
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl font-semibold text-amber-500 tabular-nums">{data.checkoutNotPaid}</span>
                  <span className="text-xs text-muted-foreground">
                    started checkout but did not pay
                    {data.totalStarted > 0 && ` · ${pct(data.checkoutNotPaid, data.totalStarted)}% of checkouts`}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground pt-2 border-t border-border">
                  Unpaid checkouts remain <code>pending</code> until reconciliation confirms the
                  Stripe session — check Academy Purchase Status for aging.
                </p>
              </div>
            </Card>
          </div>

          {/* Per-course, per-domain, per-source */}
          <Tabs defaultValue="courses">
            <TabsList>
              <TabsTrigger value="courses">By Course ({data.courseRows.length})</TabsTrigger>
              <TabsTrigger value="domains">By Domain ({data.domainRows.length})</TabsTrigger>
              <TabsTrigger value="sources">By Source ({data.sourceRows.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="courses" className="space-y-3">
              <div className="flex justify-end">
                <Button variant="outline" size="sm" onClick={exportCourses} disabled={!data.courseRows.length}>
                  <Download className="w-3.5 h-3.5 mr-1" /> Export CSV
                </Button>
              </div>
              <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0">
                      <tr className="border-b border-border bg-muted text-xs uppercase text-muted-foreground">
                        <th className="px-3 py-2 text-left">Course</th>
                        <th className="px-3 py-2 text-right">Started checkout</th>
                        <th className="px-3 py-2 text-right">Paid</th>
                        <th className="px-3 py-2 text-right">Checkout → Paid</th>
                        <th className="px-3 py-2 text-right">Avg order</th>
                        <th className="px-3 py-2 text-right">Failed</th>
                        <th className="px-3 py-2 text-right">Refunds</th>
                        <th className="px-3 py-2 text-right">Revenue</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {data.courseRows.map(r => (
                        <tr
                          key={r.slug}
                          className="hover:bg-muted/30 cursor-pointer transition-colors"
                          onClick={() => setDrill({
                            kind: "course",
                            key: r.slug,
                            signupIds: [],
                            startedIds: r.startedIds,
                            paidIds: r.paidIds,
                          })}
                        >
                          <td className="px-3 py-2 font-medium">
                            <span className="inline-flex items-center gap-1 text-foreground hover:text-primary" title={r.slug}>
                              {titleOf(r.slug)}
                              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                            </span>
                          </td>
                          <td className="px-3 py-2 text-right tabular-nums">{r.started}</td>
                          <td className="px-3 py-2 text-right tabular-nums text-emerald-600 font-medium">{r.paid}</td>
                          <td className="px-3 py-2 text-right tabular-nums"><ConvBadge value={r.conversion} /></td>
                          <td className="px-3 py-2 text-right tabular-nums">{r.aov > 0 ? money(r.aov, r.currency) : "—"}</td>
                          <td className="px-3 py-2 text-right tabular-nums text-rose-600">{r.failedRows || "—"}</td>
                          <td className="px-3 py-2 text-right tabular-nums">{r.refundedRows || "—"}</td>
                          <td className="px-3 py-2 text-right tabular-nums">{money(r.revenue, r.currency)}</td>
                        </tr>
                      ))}
                      {data.courseRows.length === 0 && (
                        <tr><td colSpan={8} className="text-center py-8 text-sm text-muted-foreground">No course activity in this range.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="domains" className="space-y-3">
              <div className="flex justify-end">
                <Button variant="outline" size="sm" onClick={exportDomains} disabled={!data.domainRows.length}>
                  <Download className="w-3.5 h-3.5 mr-1" /> Export CSV
                </Button>
              </div>
              <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0">
                      <tr className="border-b border-border bg-muted text-xs uppercase text-muted-foreground">
                        <th className="px-3 py-2 text-left">Domain</th>
                        <th className="px-3 py-2 text-right">Signups</th>
                        <th className="px-3 py-2 text-right">Started checkout</th>
                        <th className="px-3 py-2 text-right">Paid</th>
                        <th className="px-3 py-2 text-right">Signup → Paid</th>
                        <th className="px-3 py-2 text-right">Checkout → Paid</th>
                        <th className="px-3 py-2 text-right">Revenue</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-border">
                      {data.domainRows.map(r => (
                        <tr
                          key={r.domain}
                          className="hover:bg-muted/30 cursor-pointer transition-colors"
                          onClick={() => setDrill({
                            kind: "domain",
                            key: r.domain,
                            signupIds: r.signupIds,
                            startedIds: r.startedIds,
                            paidIds: r.paidIds,
                          })}
                        >
                          <td className="px-3 py-2">
                            <span className="font-medium inline-flex items-center gap-1 hover:text-primary">
                              {r.domain}
                              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                            </span>
                            <Badge
                              variant="outline"
                              className={`ml-2 text-[10px] ${r.isCorporate ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-muted text-muted-foreground"}`}
                            >
                              {r.isCorporate ? "corp" : "personal"}
                            </Badge>
                          </td>
                          <td className="px-3 py-2 text-right tabular-nums">{r.signups}</td>
                          <td className="px-3 py-2 text-right tabular-nums">{r.started}</td>
                          <td className="px-3 py-2 text-right tabular-nums text-emerald-600 font-medium">{r.paid}</td>
                          <td className="px-3 py-2 text-right tabular-nums"><ConvBadge value={r.signupToPaid} /></td>
                          <td className="px-3 py-2 text-right tabular-nums"><ConvBadge value={r.startedToPaid} /></td>
                          <td className="px-3 py-2 text-right tabular-nums">€{(r.revenue / 100).toFixed(2)}</td>
                        </tr>
                      ))}
                      {data.domainRows.length === 0 && (
                        <tr><td colSpan={7} className="text-center py-8 text-sm text-muted-foreground">No domain activity in this range.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </TabsContent>
          </Tabs>

          <p className="text-[11px] text-muted-foreground">
            Signups counted by <code>profiles.created_at</code> in range. Checkout = any purchase row created in range (paid/pending/failed/refunded). Paid = at least one <code>paid</code> purchase in range. Users are deduplicated; revenue sums all paid purchases in range.
          </p>
        </>
      )}

      <DrillDownDialog
        drill={drill}
        onClose={() => setDrill(null)}
        profileById={data.profileById}
        purchasesByUser={data.purchasesByUser}
        signupsInRangeSet={data.signupsInRangeSet}
      />
    </div>
  );
}

interface DrillProps {
  drill: {
    kind: "course" | "domain";
    key: string;
    signupIds: string[];
    startedIds: string[];
    paidIds: string[];
  } | null;
  onClose: () => void;
  profileById: Map<string, Profile>;
  purchasesByUser: Map<string, Purchase[]>;
  signupsInRangeSet: Set<string>;
}

function DrillDownDialog({ drill, onClose, profileById, purchasesByUser, signupsInRangeSet }: DrillProps) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    setQuery("");
  }, [drill?.kind, drill?.key]);

  if (!drill) return null;

  const allIds = Array.from(new Set([
    ...drill.signupIds,
    ...drill.startedIds,
    ...drill.paidIds,
  ]));

  const startedSet = new Set(drill.startedIds);
  const paidSet = new Set(drill.paidIds);
  const courseFilter = drill.kind === "course" ? drill.key : null;
  const q = query.trim().toLowerCase();

  const rows = allIds
    .map((uid) => {
      const profile = profileById.get(uid);
      const userPurchases = purchasesByUser.get(uid) || [];
      const scoped = courseFilter
        ? userPurchases.filter(p => p.course_slug === courseFilter)
        : userPurchases;
      const paidRows = scoped.filter(p => p.status === "paid");
      const revenue = paidRows.reduce((s, p) => s + (p.amount_cents || 0), 0);
      const status: "paid" | "started" | "signup" = paidSet.has(uid)
        ? "paid"
        : startedSet.has(uid)
        ? "started"
        : "signup";
      const lastActivity =
        scoped.map(p => p.paid_at || p.created_at).filter(Boolean).sort().reverse()[0]
        || profile?.created_at
        || "";
      return {
        uid,
        profile,
        scoped,
        revenue,
        status,
        lastActivity,
        isSignupInRange: signupsInRangeSet.has(uid),
      };
    })
    .filter((r) => {
      if (!q) return true;
      const name = (r.profile?.full_name || "").toLowerCase();
      const email = (r.profile?.email || "").toLowerCase();
      return name.includes(q) || email.includes(q);
    })
    .sort((a, b) => {
      const order = { paid: 0, started: 1, signup: 2 } as const;
      if (order[a.status] !== order[b.status]) return order[a.status] - order[b.status];
      return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime();
    });

  const exportRows = () => {
    const csv = [
      ["email", "full_name", "company", "status", "signup_in_range", "courses_in_scope", "paid_courses", "revenue_eur", "last_activity"],
      ...rows.map(r => [
        r.profile?.email || "",
        r.profile?.full_name || "",
        r.profile?.company_name || "",
        r.status,
        r.isSignupInRange ? "yes" : "no",
        r.scoped.map(p => p.course_slug).join("|"),
        r.scoped.filter(p => p.status === "paid").map(p => p.course_slug).join("|"),
        (r.revenue / 100).toFixed(2),
        r.lastActivity,
      ]),
    ]
      .map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `funnel-${drill.kind}-${drill.key}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={!!drill} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="flex items-center gap-2 flex-wrap">
              {drill.kind === "course" ? "Course" : "Domain"}:{" "}
              <code className="text-sm bg-muted px-2 py-0.5 rounded">{drill.key}</code>
              <Badge variant="outline" className="text-[10px]">
                {rows.length} user{rows.length === 1 ? "" : "s"}
              </Badge>
            </span>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  placeholder="Filter by name or email"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-7 h-8 text-sm w-48 sm:w-64"
                />
              </div>
              <Button variant="outline" size="sm" onClick={exportRows} disabled={!rows.length}>
                <Download className="w-3.5 h-3.5 mr-1" /> Export CSV
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto -mx-6 px-6">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-card">
              <tr className="border-b border-border bg-muted/30 text-xs uppercase text-muted-foreground">
                <th className="px-2 py-2 text-left">Learner</th>
                <th className="px-2 py-2 text-left">Company</th>
                <th className="px-2 py-2 text-left">Status</th>
                <th className="px-2 py-2 text-left">{drill.kind === "course" ? "Purchase rows" : "Courses"}</th>
                <th className="px-2 py-2 text-right">Revenue</th>
                <th className="px-2 py-2 text-left">Last activity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map(r => (
                <tr key={r.uid} className="hover:bg-muted/20">
                  <td className="px-2 py-2">
                    <div className="font-medium text-foreground">{r.profile?.full_name || "—"}</div>
                    <div className="text-xs text-muted-foreground">{r.profile?.email}</div>
                  </td>
                  <td className="px-2 py-2 text-xs text-muted-foreground">{r.profile?.company_name || "—"}</td>
                  <td className="px-2 py-2">
                    {r.status === "paid" && <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">Paid</Badge>}
                    {r.status === "started" && <Badge className="bg-blue-50 text-blue-700 border-blue-200">Started checkout</Badge>}
                    {r.status === "signup" && <Badge variant="outline" className="bg-muted text-muted-foreground">Signup only</Badge>}
                    {r.isSignupInRange && (
                      <Badge variant="outline" className="ml-1 text-[10px] bg-amber-50 text-amber-700 border-amber-200">
                        New signup
                      </Badge>
                    )}
                  </td>
                  <td className="px-2 py-2">
                    <div className="flex flex-wrap gap-1">
                      {r.scoped.length === 0 && <span className="text-xs text-muted-foreground">—</span>}
                      {r.scoped.map((p, i) => (
                        <Badge
                          key={`${p.course_slug}-${i}`}
                          variant="outline"
                          className={`text-[10px] ${
                            p.status === "paid"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : p.status === "pending"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {drill.kind === "course" ? p.status : `${p.course_slug}:${p.status}`}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="px-2 py-2 text-right tabular-nums text-xs">
                    {r.revenue > 0 ? `€${(r.revenue / 100).toFixed(2)}` : "—"}
                  </td>
                  <td className="px-2 py-2 text-xs text-muted-foreground">
                    {r.lastActivity ? new Date(r.lastActivity).toLocaleDateString() : "—"}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={6} className="text-center py-8 text-sm text-muted-foreground">No matching records.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function FunnelCard({
  label,
  value,
  sub,
  accent,
}: { label: string; value: number | string; sub?: string; accent?: "blue" | "emerald" | "violet" }) {
  const color =
    accent === "blue" ? "text-blue-500"
    : accent === "emerald" ? "text-emerald-500"
    : accent === "violet" ? "text-violet-500"
    : "text-foreground";
  return (
    <Card className="p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`text-2xl font-semibold ${color}`}>{value}</div>
      {sub && <div className="text-[11px] text-muted-foreground mt-0.5">{sub}</div>}
    </Card>
  );
}

function FunnelBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const w = Math.max(2, Math.round((value / max) * 100));
  return (
    <div className="flex items-center gap-3 py-1.5">
      <div className="w-32 text-xs text-muted-foreground">{label}</div>
      <div className="flex-1 bg-muted rounded-full h-5 overflow-hidden">
        <div className={`${color} h-full flex items-center justify-end px-2`} style={{ width: `${w}%` }}>
          <span className="text-[11px] font-semibold text-white">{value}</span>
        </div>
      </div>
    </div>
  );
}

function ConvBadge({ value }: { value: number }) {
  const color = value >= 25 ? "text-emerald-600" : value >= 10 ? "text-amber-600" : "text-muted-foreground";
  return <span className={`font-medium ${color}`}>{value}%</span>;
}
