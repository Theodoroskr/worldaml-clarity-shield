import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Loader2, Search, Send, Download, GraduationCap, Mail, RefreshCw, X, Building2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { KpiCard, DefinitionsButton, MetricInfo } from "@/components/admin/AcademyMetricUI";
import { RangePicker } from "@/components/admin/RangePicker";
import {
  ANNUAL_PASS_SLUG, domainOf, isCorporateEmail, money, pct, resolveRange,
  useCourseTitles, type RangeKey,
} from "@/lib/academyAdmin";

interface Profile {
  id: string;
  user_id: string;
  email: string | null;
  full_name: string | null;
  company_name: string | null;
  subscription_tier: string;
  created_at: string;
}

interface Purchase {
  id: string;
  user_id: string;
  course_slug: string;
  amount_cents: number;
  currency: string;
  status: "pending" | "paid" | "failed" | "refunded";
  paid_at: string | null;
  created_at: string;
  expires_at: string | null;
}

interface AcademyUser {
  profile: Profile;
  purchases: Purchase[];
  paidCount: number;
  pendingCount: number;
  failedCount: number;
  totalSpentCents: number;
  currency: string;
  lastActivity: string;
  courses: string[];
  hasAnnualPass: boolean;
}

const EMAIL_RE =
  /^[A-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?(?:\.[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?)+$/i;

type Segment =
  | "all" | "paid" | "pending" | "corporate" | "personal"
  | "checkout_not_paid" | "annual_pass" | "course_buyers"
  | "repeat_buyers" | "recent_signups" | "inactive" | "high_intent";

const SEGMENTS: { value: Segment; label: string }[] = [
  { value: "all", label: "All Academy users" },
  { value: "paid", label: "Paid learners" },
  { value: "pending", label: "Signed up — no purchase" },
  { value: "checkout_not_paid", label: "Checkout started — not paid" },
  { value: "corporate", label: "Corporate email" },
  { value: "personal", label: "Personal email" },
  { value: "annual_pass", label: "Annual Pass holders" },
  { value: "course_buyers", label: "Individual course buyers" },
  { value: "repeat_buyers", label: "Repeat buyers (2+ paid)" },
  { value: "recent_signups", label: "Recent signups (30 days)" },
  { value: "inactive", label: "Inactive (90+ days)" },
  { value: "high_intent", label: "High intent (2+ checkouts, unpaid)" },
];

const relativeDay = (iso: string) => {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;
  if (days < 365) return `${Math.floor(days / 30)} mo ago`;
  return `${Math.floor(days / 365)} yr ago`;
};

const fmtDay = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });

export default function AdminAcademyUsers() {
  const [users, setUsers] = useState<AcademyUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState<string>("all");
  const [segment, setSegment] = useState<Segment>("all");
  const [range, setRange] = useState<RangeKey>("all");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkTemplate, setBulkTemplate] =
    useState<"suite-upsell" | "screening-upsell">("suite-upsell");
  const [sending, setSending] = useState(false);
  const { titleOf } = useCourseTitles();

  const resolved = useMemo(
    () => resolveRange(range, customFrom, customTo),
    [range, customFrom, customTo],
  );

  const load = async () => {
    setLoading(true);
    setLoadError(null);
    const [{ data: purchases, error: pErr }, { data: profiles, error: prErr }] =
      await Promise.all([
        supabase
          .from("academy_course_purchases")
          .select("id, user_id, course_slug, amount_cents, currency, status, paid_at, created_at, expires_at")
          .order("created_at", { ascending: false }),
        supabase
          .from("profiles")
          .select("id, user_id, email, full_name, company_name, subscription_tier, created_at"),
      ]);

    if (pErr || prErr) {
      const msg = (pErr || prErr)?.message || "Failed to load academy data";
      setLoadError(msg);
      toast.error(msg);
      setLoading(false);
      return;
    }

    const profileMap = new Map<string, Profile>();
    (profiles || []).forEach((p: any) => profileMap.set(p.user_id, p as Profile));

    const byUser = new Map<string, Purchase[]>();
    (purchases || []).forEach((row: any) => {
      const list = byUser.get(row.user_id) || [];
      list.push(row as Purchase);
      byUser.set(row.user_id, list);
    });

    // Also include profiles whose tier === "academy" with no purchase rows
    (profiles || []).forEach((p: any) => {
      if (p.subscription_tier === "academy" && !byUser.has(p.user_id)) {
        byUser.set(p.user_id, []);
      }
    });

    const grouped: AcademyUser[] = [];
    byUser.forEach((purchaseList, userId) => {
      const profile = profileMap.get(userId);
      if (!profile) return;
      const paid = purchaseList.filter((r) => r.status === "paid");
      const totalSpentCents = paid.reduce((s, r) => s + (r.amount_cents || 0), 0);
      const currency = paid[0]?.currency || purchaseList[0]?.currency || "eur";
      const lastActivity =
        purchaseList
          .map((r) => r.paid_at || r.created_at)
          .filter(Boolean)
          .sort()
          .reverse()[0] || profile.created_at;
      const courses = Array.from(new Set(purchaseList.map((r) => r.course_slug))).filter(Boolean);
      grouped.push({
        profile,
        purchases: purchaseList,
        paidCount: paid.length,
        pendingCount: purchaseList.filter((r) => r.status === "pending").length,
        failedCount: purchaseList.filter((r) => r.status === "failed").length,
        totalSpentCents,
        currency,
        lastActivity,
        courses,
        hasAnnualPass: paid.some((r) => r.course_slug === ANNUAL_PASS_SLUG),
      });
    });

    grouped.sort(
      (a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
    );
    setUsers(grouped);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const allCourses = useMemo(() => {
    const set = new Set<string>();
    users.forEach((u) => u.courses.forEach((c) => set.add(c)));
    return Array.from(set).sort();
  }, [users]);

  /** How many Academy users share each domain — powers corporate opportunity. */
  const domainCounts = useMemo(() => {
    const m = new Map<string, number>();
    users.forEach((u) => {
      const d = domainOf(u.profile.email);
      if (d) m.set(d, (m.get(d) || 0) + 1);
    });
    return m;
  }, [users]);

  const matchesSegment = (u: AcademyUser): boolean => {
    const corporate = isCorporateEmail(u.profile.email);
    const startedCount = u.purchases.length;
    switch (segment) {
      case "paid": return u.paidCount > 0;
      case "pending": return u.paidCount === 0;
      case "checkout_not_paid": return u.paidCount === 0 && startedCount > 0;
      case "corporate": return corporate;
      case "personal": return !corporate;
      case "annual_pass": return u.hasAnnualPass;
      case "course_buyers": return u.paidCount > 0 && !u.hasAnnualPass;
      case "repeat_buyers": return u.paidCount >= 2;
      case "recent_signups":
        return Date.now() - new Date(u.profile.created_at).getTime() <= 30 * 86400000;
      case "inactive":
        return Date.now() - new Date(u.lastActivity).getTime() >= 90 * 86400000;
      case "high_intent":
        return u.paidCount === 0 && startedCount >= 2;
      default: return true;
    }
  };

  const filtered = useMemo(() => {
    return users.filter((u) => {
      if (!matchesSegment(u)) return false;
      if (courseFilter !== "all" && !u.courses.includes(courseFilter)) return false;
      if (!resolved.isLifetime) {
        const t = new Date(u.lastActivity).getTime();
        const signedUp = new Date(u.profile.created_at).getTime();
        const active = (t >= resolved.start && t <= resolved.end) ||
          (signedUp >= resolved.start && signedUp <= resolved.end);
        if (!active) return false;
      }
      if (search) {
        const q = search.toLowerCase();
        const hay =
          (u.profile.full_name || "") + " " + (u.profile.email || "") + " " +
          (u.profile.company_name || "") + " " + domainOf(u.profile.email) + " " +
          u.courses.map((c) => `${c} ${titleOf(c)}`).join(" ");
        if (!hay.toLowerCase().includes(q)) return false;
      }
      return true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users, search, courseFilter, segment, resolved]);

  const stats = useMemo(() => {
    const total = users.length;
    const paid = users.filter((u) => u.paidCount > 0).length;
    const pending = total - paid;
    const corporate = users.filter((u) => isCorporateEmail(u.profile.email)).length;
    const revenueCents = users.reduce((s, u) => s + u.totalSpentCents, 0);
    const paidOrders = users.reduce((s, u) => s + u.paidCount, 0);
    return {
      total, paid, pending, corporate, revenueCents, paidOrders,
      conversion: pct(paid, total),
      revenuePerPaid: paid ? revenueCents / paid : 0,
      aov: paidOrders ? revenueCents / paidOrders : 0,
      corporatePct: pct(corporate, total),
    };
  }, [users]);

  const periodRevenueCents = useMemo(() => {
    if (resolved.isLifetime) return stats.revenueCents;
    return users.reduce(
      (s, u) =>
        s +
        u.purchases
          .filter((p) => {
            if (p.status !== "paid") return false;
            const t = new Date(p.paid_at || p.created_at).getTime();
            return t >= resolved.start && t <= resolved.end;
          })
          .reduce((a, p) => a + (p.amount_cents || 0), 0),
      0,
    );
  }, [users, resolved, stats.revenueCents]);

  /** Domain-level intelligence for Sales — multi-learner companies first. */
  const domainIntel = useMemo(() => {
    const m = new Map<string, { users: number; paid: number; revenue: number; courses: Set<string> }>();
    users.forEach((u) => {
      const d = domainOf(u.profile.email);
      if (!d || !isCorporateEmail(u.profile.email)) return;
      const e = m.get(d) || { users: 0, paid: 0, revenue: 0, courses: new Set<string>() };
      e.users += 1;
      if (u.paidCount > 0) e.paid += 1;
      e.revenue += u.totalSpentCents;
      u.courses.forEach((c) => e.courses.add(c));
      m.set(d, e);
    });
    return Array.from(m.entries())
      .map(([domain, v]) => ({ domain, ...v, courses: v.courses.size }))
      .filter((r) => r.users > 1 || r.revenue > 0)
      .sort((a, b) => b.revenue - a.revenue || b.users - a.users)
      .slice(0, 8);
  }, [users]);

  const opportunityOf = (u: AcademyUser): { label: string; tone: string } | null => {
    const dom = domainOf(u.profile.email);
    const sameDomain = dom ? domainCounts.get(dom) || 0 : 0;
    if (isCorporateEmail(u.profile.email) && sameDomain >= 3)
      return { label: `Team opportunity · ${sameDomain} learners`, tone: "bg-violet-50 text-violet-700 border-violet-200" };
    if (u.hasAnnualPass)
      return { label: "Academy for Business", tone: "bg-indigo-50 text-indigo-700 border-indigo-200" };
    if (isCorporateEmail(u.profile.email) && u.paidCount > 0)
      return { label: "Suite prospect", tone: "bg-teal-50 text-teal-700 border-teal-200" };
    if (u.paidCount === 0 && u.purchases.length >= 2)
      return { label: "High intent — follow up", tone: "bg-amber-50 text-amber-700 border-amber-200" };
    return null;
  };

  const toggleSelect = (userId: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((u) => u.profile.user_id)));
  };

  const buildCsv = (list: AcademyUser[]) => {
    const rows = [
      [
        "email", "full_name", "company", "domain", "is_corporate", "courses",
        "course_titles", "purchase_status", "paid_count", "pending_count",
        "failed_count", "total_spent", "currency", "commercial_opportunity",
        "last_activity", "registered_at",
      ],
      ...list.map((u) => {
        const dom = domainOf(u.profile.email);
        const opp = opportunityOf(u);
        return [
          u.profile.email || "",
          u.profile.full_name || "",
          u.profile.company_name || "",
          dom,
          isCorporateEmail(u.profile.email) ? "yes" : "no",
          u.courses.join("|"),
          u.courses.map((c) => titleOf(c)).join("|"),
          u.paidCount > 0 ? `${u.paidCount} paid` : u.pendingCount ? "pending checkout" : u.failedCount ? "failed checkout" : "no purchase",
          String(u.paidCount),
          String(u.pendingCount),
          String(u.failedCount),
          (u.totalSpentCents / 100).toFixed(2),
          u.currency.toUpperCase(),
          opp?.label || "",
          u.lastActivity,
          u.profile.created_at,
        ];
      }),
    ];
    return rows
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");
  };

  const download = (csv: string, name: string) => {
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export respects the current search / segment / course / date filters.
  const exportCsv = () =>
    download(buildCsv(filtered), `academy-users-${segment}-${range}-${new Date().toISOString().slice(0, 10)}.csv`);

  const exportSelected = () =>
    download(
      buildCsv(filtered.filter((u) => selected.has(u.profile.user_id))),
      `academy-users-selected-${new Date().toISOString().slice(0, 10)}.csv`,
    );

  const sendBulk = async () => {
    const targets = users.filter((u) => selected.has(u.profile.user_id) && u.profile.email);
    if (targets.length === 0) {
      toast.error("No selected users with a valid email");
      return;
    }
    setSending(true);
    let ok = 0;
    let fail = 0;
    for (const u of targets) {
      const email = (u.profile.email || "").trim().toLowerCase();
      if (!EMAIL_RE.test(email)) {
        fail++;
        continue;
      }
      try {
        const { data, error } = await supabase.functions.invoke("send-upsell-email", {
          body: {
            recipientEmail: email,
            recipientName: u.profile.full_name || "",
            templateId: bulkTemplate,
          },
        });
        if (error || data?.error) fail++;
        else ok++;
      } catch {
        fail++;
      }
    }
    setSending(false);
    toast.success(`Sent ${ok} email(s)${fail ? `, ${fail} failed` : ""}`);
    setBulkOpen(false);
    setSelected(new Set());
  };

  const scopeLabel = resolved.isLifetime ? "Lifetime" : resolved.label;

  return (
    <div className="p-6 space-y-5 pb-24">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-primary" />
            Academy Signups
          </h1>
          <p className="text-xs text-muted-foreground">
            Marketing &amp; sales view of Academy learners — acquisition, segmentation and upsell.
          </p>
          <DefinitionsButton />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={`w-3.5 h-3.5 mr-1 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={exportCsv} disabled={!filtered.length}>
            <Download className="w-3.5 h-3.5 mr-1" />
            Export CSV
          </Button>
          <Button size="sm" onClick={() => setBulkOpen(true)} disabled={selected.size === 0}>
            <Send className="w-3.5 h-3.5 mr-1" />
            Send Upsell ({selected.size})
          </Button>
        </div>
      </div>

      {/* KPIs — lifetime, so they never contradict the funnel page */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <KpiCard
          label="Academy users" value={stats.total} scope="Lifetime"
          info="Unique Academy user profiles — profiles with at least one Academy purchase row (any status), deduplicated per user."
        />
        <KpiCard
          label="Paid learners" value={stats.paid} accent="emerald" scope="Lifetime"
          sub={`${stats.conversion}% paid conversion`}
          info="Unique Academy users with at least one successfully paid purchase."
        />
        <KpiCard
          label="Signed up (no purchase)" value={stats.pending} accent="amber" scope="Lifetime"
          info="Academy users with no purchase in 'paid' status — includes pending and failed checkouts."
        />
        <KpiCard
          label="Corporate emails" value={stats.corporate} accent="blue" scope="Lifetime"
          sub={`${stats.corporatePct}% of users`}
          info="Users whose email domain is not a public free-mail provider. A company address is a signal, not a qualified lead."
        />
        <KpiCard
          label="Total revenue" value={money(stats.revenueCents)} accent="violet" scope="Lifetime"
          sub={
            resolved.isLifetime
              ? `Avg order ${money(stats.aov)}`
              : `${money(periodRevenueCents)} in ${resolved.label.toLowerCase()}`
          }
          info="Sum of all successfully paid Academy purchases, all time. Amounts are in the currency charged and are not FX-converted."
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard
          label="Paid conversion rate" value={`${stats.conversion}%`}
          sub={`${stats.paid} / ${stats.total} users`} scope="Lifetime"
          info="Paid learners divided by Academy users."
        />
        <KpiCard
          label="Revenue per paid learner" value={money(stats.revenuePerPaid)} scope="Lifetime"
          info="Total paid revenue divided by the number of paid learners."
        />
        <KpiCard
          label="Average order value" value={money(stats.aov)} scope="Lifetime"
          sub={`${stats.paidOrders} paid order${stats.paidOrders === 1 ? "" : "s"}`}
          info="Total paid revenue divided by the number of paid purchase rows."
        />
        <KpiCard
          label="Corporate user share" value={`${stats.corporatePct}%`}
          sub={`${stats.corporate} / ${stats.total}`} scope="Lifetime"
          info="Share of Academy users on a company email domain."
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px] max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, company, domain…"
            className="pl-8 h-9"
          />
        </div>
        <Select value={segment} onValueChange={(v) => setSegment(v as Segment)}>
          <SelectTrigger className="w-56 h-9 text-sm"><SelectValue /></SelectTrigger>
          <SelectContent>
            {SEGMENTS.map((s) => (
              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={courseFilter} onValueChange={setCourseFilter}>
          <SelectTrigger className="w-56 h-9 text-sm">
            <SelectValue placeholder="All courses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All courses</SelectItem>
            {allCourses.map((c) => (
              <SelectItem key={c} value={c}>{titleOf(c)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <RangePicker
          value={range} onChange={setRange}
          from={customFrom} to={customTo}
          onFromChange={setCustomFrom} onToChange={setCustomTo}
        />
        {(search || segment !== "all" || courseFilter !== "all" || range !== "all") && (
          <Button
            variant="ghost" size="sm"
            onClick={() => { setSearch(""); setSegment("all"); setCourseFilter("all"); setRange("all"); }}
          >
            <X className="w-3.5 h-3.5 mr-1" /> Clear filters
          </Button>
        )}
      </div>

      {/* Company / domain intelligence */}
      {domainIntel.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Company / domain intelligence
            </span>
            <MetricInfo text="Corporate domains with more than one Academy learner or with revenue. Useful for Academy for Business and Suite conversations." />
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {domainIntel.map((d) => (
              <button
                key={d.domain}
                onClick={() => { setSearch(d.domain); setSegment("all"); }}
                className="text-left rounded-md border border-border p-2.5 hover:bg-muted/40 transition-colors"
              >
                <div className="text-sm font-medium text-foreground truncate">{d.domain}</div>
                <div className="text-[11px] text-muted-foreground">
                  {d.users} user{d.users === 1 ? "" : "s"} · {d.paid} paid · {d.courses} course{d.courses === 1 ? "" : "s"}
                </div>
                <div className="text-xs font-semibold text-violet-500 tabular-nums">{money(d.revenue)}</div>
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Loading Academy learners…</span>
        </div>
      ) : loadError ? (
        <Card className="p-8 text-center space-y-3">
          <p className="text-sm text-destructive">{loadError}</p>
          <Button size="sm" variant="outline" onClick={load}>Try again</Button>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto max-h-[70vh] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10">
                <tr className="border-b border-border bg-muted text-xs uppercase text-muted-foreground">
                  <th className="px-3 py-2 w-8">
                    <Checkbox
                      checked={filtered.length > 0 && selected.size === filtered.length}
                      onCheckedChange={toggleSelectAll}
                    />
                  </th>
                  <th className="px-3 py-2 text-left">Learner</th>
                  <th className="px-3 py-2 text-left">Company / Domain</th>
                  <th className="px-3 py-2 text-left">Courses / Access</th>
                  <th className="px-3 py-2 text-left">Purchase status</th>
                  <th className="px-3 py-2 text-right">Spend</th>
                  <th className="px-3 py-2 text-left">Last activity</th>
                  <th className="px-3 py-2 text-left">Opportunity</th>
                  <th className="px-3 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((u) => {
                  const dom = domainOf(u.profile.email);
                  const corporate = isCorporateEmail(u.profile.email);
                  const opp = opportunityOf(u);
                  return (
                    <tr key={u.profile.user_id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-3 py-3">
                        <Checkbox
                          checked={selected.has(u.profile.user_id)}
                          onCheckedChange={() => toggleSelect(u.profile.user_id)}
                        />
                      </td>
                      <td className="px-3 py-3">
                        <div className="font-medium text-foreground">{u.profile.full_name || "—"}</div>
                        <div className="text-xs text-muted-foreground">{u.profile.email}</div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="text-xs text-foreground">{u.profile.company_name || "—"}</div>
                        <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                          {dom && (
                            <Badge variant="outline" className="text-[10px] bg-muted text-muted-foreground">
                              {dom}
                            </Badge>
                          )}
                          {corporate && (
                            <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700 border-blue-200">
                              CORPORATE
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex flex-wrap gap-1 max-w-[280px]">
                          {u.courses.length === 0 && (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                          {u.courses.map((c) => (
                            <Badge
                              key={c}
                              variant="outline"
                              title={c}
                              className={`text-[10px] ${
                                c === ANNUAL_PASS_SLUG
                                  ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                                  : "bg-cyan-50 text-cyan-700 border-cyan-200"
                              }`}
                            >
                              {titleOf(c)}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-xs">
                        {u.hasAnnualPass ? (
                          <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200">Annual Pass</Badge>
                        ) : u.paidCount > 0 ? (
                          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">
                            {u.paidCount} paid purchase{u.paidCount === 1 ? "" : "s"}
                          </Badge>
                        ) : u.pendingCount > 0 ? (
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                            Pending checkout
                          </Badge>
                        ) : u.failedCount > 0 ? (
                          <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200">
                            Failed checkout
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-muted text-muted-foreground">
                            No purchase
                          </Badge>
                        )}
                      </td>
                      <td className="px-3 py-3 text-xs tabular-nums text-right">
                        {u.totalSpentCents > 0 ? (
                          <span className="font-medium text-foreground">
                            {money(u.totalSpentCents, u.currency)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">No spend</span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-xs text-muted-foreground">
                        <div className="text-foreground">{fmtDay(u.lastActivity)}</div>
                        <div>{relativeDay(u.lastActivity)}</div>
                      </td>
                      <td className="px-3 py-3">
                        {opp ? (
                          <Badge variant="outline" className={`text-[10px] ${opp.tone}`}>
                            {opp.label}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        {u.profile.email && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs text-teal-600"
                            onClick={async () => {
                              try {
                                const { data, error } = await supabase.functions.invoke(
                                  "send-upsell-email",
                                  {
                                    body: {
                                      recipientEmail: u.profile.email!.toLowerCase(),
                                      recipientName: u.profile.full_name || "",
                                      templateId: "suite-upsell",
                                    },
                                  }
                                );
                                if (error || data?.error)
                                  throw new Error(error?.message || data?.error);
                                toast.success(`Upsell sent to ${u.profile.email}`);
                              } catch (err: any) {
                                toast.error(err.message || "Failed to send");
                              }
                            }}
                          >
                            <Mail className="w-3.5 h-3.5 mr-1" />
                            Suite upsell
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-10 space-y-2">
                <p className="text-sm text-muted-foreground">
                  No Academy users match this segment, course or date range.
                </p>
                <Button
                  variant="outline" size="sm"
                  onClick={() => { setSearch(""); setSegment("all"); setCourseFilter("all"); setRange("all"); }}
                >
                  Reset filters
                </Button>
              </div>
            )}
          </div>
          <div className="px-4 py-2 border-t border-border text-xs text-muted-foreground">
            Showing {filtered.length} of {users.length} Academy users · Scope: {scopeLabel}
          </div>
        </Card>
      )}

      {/* Sticky bulk action bar */}
      {selected.size > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-card border border-border shadow-lg rounded-full px-4 py-2 flex items-center gap-3">
          <span className="text-sm font-medium text-foreground">{selected.size} users selected</span>
          <Button size="sm" onClick={() => setBulkOpen(true)}>
            <Send className="w-3.5 h-3.5 mr-1" /> Send Upsell
          </Button>
          <Button size="sm" variant="outline" onClick={exportSelected}>
            <Download className="w-3.5 h-3.5 mr-1" /> Export selected
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())}>
            Clear
          </Button>
        </div>
      )}

      {/* Bulk upsell dialog */}
      <Dialog open={bulkOpen} onOpenChange={setBulkOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Send marketing email to {selected.size} learners</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium mb-1.5 block text-muted-foreground">
                Template
              </label>
              <Select value={bulkTemplate} onValueChange={(v) => setBulkTemplate(v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="suite-upsell">Suite Upsell — invite to WorldAML Suite</SelectItem>
                  <SelectItem value="screening-upsell">Screening Upsell — WorldCompliance data</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-muted-foreground">
              Emails go via the existing <code>send-upsell-email</code> function. Invalid
              addresses will be skipped.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkOpen(false)} disabled={sending}>
              Cancel
            </Button>
            <Button onClick={sendBulk} disabled={sending}>
              {sending && <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />}
              Send {selected.size}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
