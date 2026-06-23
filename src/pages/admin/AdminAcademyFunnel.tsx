import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, TrendingUp, Download, RefreshCw, Filter, X, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const FREE_EMAIL = new Set([
  "gmail.com", "googlemail.com", "yahoo.com", "yahoo.co.uk", "yahoo.co.in",
  "outlook.com", "hotmail.com", "live.com", "msn.com", "icloud.com", "me.com",
  "protonmail.com", "proton.me", "gmx.com", "gmx.de", "aol.com", "mail.com",
  "yandex.com", "yandex.ru", "zoho.com", "qq.com", "163.com", "126.com",
]);

const domainOf = (email: string | null | undefined) => {
  if (!email) return "";
  const at = email.lastIndexOf("@");
  return at >= 0 ? email.slice(at + 1).toLowerCase() : "";
};

interface Profile {
  user_id: string;
  email: string | null;
  full_name: string | null;
  company_name: string | null;
  created_at: string;
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

type Range = "7d" | "30d" | "90d" | "ytd" | "all";

const rangeStart = (r: Range): number => {
  const now = Date.now();
  switch (r) {
    case "7d": return now - 7 * 86400000;
    case "30d": return now - 30 * 86400000;
    case "90d": return now - 90 * 86400000;
    case "ytd": return new Date(new Date().getFullYear(), 0, 1).getTime();
    case "all": return 0;
  }
};

const pct = (n: number, d: number) => (d === 0 ? 0 : Math.round((n / d) * 1000) / 10);

export default function AdminAcademyFunnel() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<Range>("30d");
  const [domainSegment, setDomainSegment] = useState<"all" | "corporate" | "personal">("all");
  const [drill, setDrill] = useState<{
    kind: "course" | "domain";
    key: string;
    signupIds: string[];
    startedIds: string[];
    paidIds: string[];
  } | null>(null);

  const load = async () => {
    setLoading(true);
    const [{ data: p, error: pErr }, { data: pu, error: puErr }] = await Promise.all([
      supabase
        .from("profiles")
        .select("user_id, email, full_name, company_name, created_at"),
      supabase
        .from("academy_course_purchases")
        .select("user_id, course_slug, amount_cents, currency, status, paid_at, created_at"),
    ]);
    if (pErr || puErr) {
      toast.error((pErr || puErr)?.message || "Failed to load funnel data");
      setLoading(false);
      return;
    }
    setProfiles((p || []) as Profile[]);
    setPurchases((pu || []) as Purchase[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const data = useMemo(() => {
    const start = rangeStart(range);

    // Signups in range
    const signups = profiles.filter(p => new Date(p.created_at).getTime() >= start);
    const signupByUser = new Map(signups.map(p => [p.user_id, p]));

    // Purchases in range (by created_at)
    const inRangePurchases = purchases.filter(
      pu => new Date(pu.created_at).getTime() >= start
    );

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

    // Domain segment filter for signups & users
    const filterUser = (userId: string) => {
      if (domainSegment === "all") return true;
      const prof = profiles.find(p => p.user_id === userId);
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

    // Per-course
    const courseMap = new Map<string, { started: Set<string>; paid: Set<string>; revenue: number; currency: string }>();
    inRangePurchases.forEach(pu => {
      if (!filterUser(pu.user_id)) return;
      const c = courseMap.get(pu.course_slug) || { started: new Set(), paid: new Set(), revenue: 0, currency: pu.currency };
      c.started.add(pu.user_id);
      if (pu.status === "paid") {
        c.paid.add(pu.user_id);
        c.revenue += pu.amount_cents || 0;
      }
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
      startedIds: Array.from(v.started),
      paidIds: Array.from(v.paid),
    })).sort((a, b) => b.paid - a.paid);

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
      const prof = profiles.find(p => p.user_id === pu.user_id);
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

    // Lookup helpers for drill-down
    const profileById = new Map(profiles.map(p => [p.user_id, p]));
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
      signupToStarted: pct(totalStarted, totalSignups),
      startedToPaid: pct(totalPaid, totalStarted),
      signupToPaid: pct(totalPaid, totalSignups),
      courseRows,
      domainRows,
      profileById,
      purchasesByUser,
      signupsInRangeSet,
    };
  }, [profiles, purchases, range, domainSegment]);

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
      ["course_slug", "started_checkout", "paid", "conversion_%", "revenue", "currency"],
      ...data.courseRows.map(r => [r.slug, r.started, r.paid, r.conversion, (r.revenue / 100).toFixed(2), r.currency.toUpperCase()]),
    ]);
  };

  const exportDomains = () => {
    exportCsv(`academy-funnel-domains-${range}.csv`, [
      ["domain", "is_corporate", "signups", "started_checkout", "paid", "signup_to_paid_%", "started_to_paid_%", "revenue_eur"],
      ...data.domainRows.map(r => [r.domain, r.isCorporate ? "yes" : "no", r.signups, r.started, r.paid, r.signupToPaid, r.startedToPaid, (r.revenue / 100).toFixed(2)]),
    ]);
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Academy Funnel Metrics
          </h1>
          <p className="text-xs text-muted-foreground">
            Conversion from signup → checkout → paid, broken down by course and email domain.
          </p>
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
          <Select value={range} onValueChange={(v) => setRange(v as Range)}>
            <SelectTrigger className="w-32 h-8 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="ytd">Year to date</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Segment</span>
          <Select value={domainSegment} onValueChange={(v) => setDomainSegment(v as any)}>
            <SelectTrigger className="w-40 h-8 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All emails</SelectItem>
              <SelectItem value="corporate">Corporate only</SelectItem>
              <SelectItem value="personal">Personal only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* Top funnel */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <FunnelCard label="Signups" value={data.totalSignups} />
            <FunnelCard
              label="Started checkout"
              value={data.totalStarted}
              sub={`${data.signupToStarted}% of signups`}
              accent="blue"
            />
            <FunnelCard
              label="Paid learners"
              value={data.totalPaid}
              sub={`${data.startedToPaid}% of checkouts · ${data.signupToPaid}% of signups`}
              accent="emerald"
            />
            <FunnelCard
              label="Revenue"
              value={`€${(data.totalRevenue / 100).toFixed(0)}`}
              sub="Paid status only"
              accent="violet"
            />
          </div>

          {/* Funnel bar */}
          <Card className="p-4">
            <div className="text-xs font-semibold uppercase text-muted-foreground mb-2">Funnel</div>
            <FunnelBar label="Signups" value={data.totalSignups} max={Math.max(data.totalSignups, 1)} color="bg-slate-400" />
            <FunnelBar label="Started checkout" value={data.totalStarted} max={Math.max(data.totalSignups, 1)} color="bg-blue-500" />
            <FunnelBar label="Paid" value={data.totalPaid} max={Math.max(data.totalSignups, 1)} color="bg-emerald-500" />
          </Card>

          {/* Per-course & per-domain */}
          <Tabs defaultValue="courses">
            <TabsList>
              <TabsTrigger value="courses">By Course ({data.courseRows.length})</TabsTrigger>
              <TabsTrigger value="domains">By Domain ({data.domainRows.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="courses" className="space-y-3">
              <div className="flex justify-end">
                <Button variant="outline" size="sm" onClick={exportCourses} disabled={!data.courseRows.length}>
                  <Download className="w-3.5 h-3.5 mr-1" /> Export CSV
                </Button>
              </div>
              <Card className="overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30 text-xs uppercase text-muted-foreground">
                      <th className="px-3 py-2 text-left">Course</th>
                      <th className="px-3 py-2 text-right">Started checkout</th>
                      <th className="px-3 py-2 text-right">Paid</th>
                      <th className="px-3 py-2 text-right">Checkout → Paid</th>
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
                          <span className="inline-flex items-center gap-1 text-foreground hover:text-primary">
                            {r.slug}
                            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                          </span>
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums">{r.started}</td>
                        <td className="px-3 py-2 text-right tabular-nums text-emerald-600 font-medium">{r.paid}</td>
                        <td className="px-3 py-2 text-right tabular-nums">
                          <ConvBadge value={r.conversion} />
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums">
                          {(r.revenue / 100).toFixed(2)} {r.currency.toUpperCase()}
                        </td>
                      </tr>
                    ))}
                    {data.courseRows.length === 0 && (
                      <tr><td colSpan={5} className="text-center py-8 text-sm text-muted-foreground">No course activity in this range.</td></tr>
                    )}
                  </tbody>
                </table>
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
                    <thead>
                      <tr className="border-b border-border bg-muted/30 text-xs uppercase text-muted-foreground">
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
    </div>
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
