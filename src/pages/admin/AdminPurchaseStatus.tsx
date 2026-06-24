import { useEffect, useState, useMemo, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, ArrowUpDown, CalendarRange, RefreshCw } from "lucide-react";
import { toast } from "sonner";

type PurchaseRow = {
  id: string;
  user_id: string;
  course_slug: string;
  amount_cents: number;
  currency: string;
  status: "pending" | "paid" | "failed" | "refunded";
  stripe_session_id: string | null;
  stripe_payment_intent_id: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
  expires_at: string | null;
};

type SortKey = "created_at" | "paid_at" | "amount_cents" | "status" | "course_slug";
type SortDir = "asc" | "desc";

export default function AdminPurchaseStatus() {
  const [rows, setRows] = useState<PurchaseRow[]>([]);
  const [profiles, setProfiles] = useState<Record<string, { email: string | null; full_name: string | null }>>({});
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "paid" | "failed" | "refunded">("all");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const prevStatusRef = useRef<Record<string, string>>({});

  const [createdFrom, setCreatedFrom] = useState("");
  const [createdTo, setCreatedTo] = useState("");
  const [paidFrom, setPaidFrom] = useState("");
  const [paidTo, setPaidTo] = useState("");

  const load = async (silent = false) => {
    if (!silent) setLoading(true);
    const { data, error } = await supabase
      .from("academy_course_purchases")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      if (!silent) toast.error(error.message);
    } else {
      const next = (data as PurchaseRow[]) ?? [];
      // Detect transitions → toast on pending→paid so admins see live unlocks
      const prev = prevStatusRef.current;
      if (Object.keys(prev).length > 0) {
        for (const row of next) {
          const before = prev[row.id];
          if (before && before !== row.status) {
            if (row.status === "paid") {
              const who = profiles[row.user_id]?.email ?? row.user_id.slice(0, 8);
              toast.success(`${who} → ${row.course_slug} unlocked (paid)`);
            } else if (row.status === "failed") {
              const who = profiles[row.user_id]?.email ?? row.user_id.slice(0, 8);
              toast.error(`${who} → ${row.course_slug} marked failed`);
            }
          }
        }
      }
      prevStatusRef.current = Object.fromEntries(next.map((r) => [r.id, r.status]));
      setRows(next);
      setLastRefresh(new Date());

      // Fetch profile emails for any new user_ids
      const missing = Array.from(new Set(next.map((r) => r.user_id))).filter((uid) => !profiles[uid]);
      if (missing.length > 0) {
        const { data: profs } = await supabase
          .from("profiles")
          .select("user_id, email, full_name")
          .in("user_id", missing);
        if (profs) {
          setProfiles((p) => {
            const merged = { ...p };
            for (const pr of profs as { user_id: string; email: string | null; full_name: string | null }[]) {
              merged[pr.user_id] = { email: pr.email, full_name: pr.full_name };
            }
            return merged;
          });
        }
      }
    }
    if (!silent) setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  // Auto-refresh every 15s when enabled
  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(() => load(true), 15_000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRefresh, profiles]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const filtered = useMemo(() => {
    let data = [...rows];
    if (statusFilter !== "all") {
      data = data.filter((r) => r.status === statusFilter);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      data = data.filter((r) => {
        const prof = profiles[r.user_id];
        return (
          r.course_slug.toLowerCase().includes(q) ||
          (r.stripe_session_id ?? "").toLowerCase().includes(q) ||
          (r.stripe_payment_intent_id ?? "").toLowerCase().includes(q) ||
          r.user_id.toLowerCase().includes(q) ||
          (prof?.email ?? "").toLowerCase().includes(q) ||
          (prof?.full_name ?? "").toLowerCase().includes(q)
        );
      });
    }
    if (createdFrom) {
      const from = new Date(createdFrom).getTime();
      data = data.filter((r) => new Date(r.created_at).getTime() >= from);
    }
    if (createdTo) {
      const to = new Date(createdTo).getTime() + 86_399_999; // end of day
      data = data.filter((r) => new Date(r.created_at).getTime() <= to);
    }
    if (paidFrom) {
      const from = new Date(paidFrom).getTime();
      data = data.filter((r) => r.paid_at && new Date(r.paid_at).getTime() >= from);
    }
    if (paidTo) {
      const to = new Date(paidTo).getTime() + 86_399_999;
      data = data.filter((r) => r.paid_at && new Date(r.paid_at).getTime() <= to);
    }
    data.sort((a, b) => {
      let cmp = 0;
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (aVal === null && bVal === null) cmp = 0;
      else if (aVal === null) cmp = 1;
      else if (bVal === null) cmp = -1;
      else if (typeof aVal === "number" && typeof bVal === "number") cmp = aVal - bVal;
      else cmp = String(aVal).localeCompare(String(bVal));
      return sortDir === "asc" ? cmp : -cmp;
    });
    return data;
  }, [rows, statusFilter, search, sortKey, sortDir, createdFrom, createdTo, paidFrom, paidTo]);

  const totals = useMemo(() => {
    const pending = rows.filter((r) => r.status === "pending").length;
    const paid = rows.filter((r) => r.status === "paid").length;
    const failed = rows.filter((r) => r.status === "failed").length;
    const refunded = rows.filter((r) => r.status === "refunded").length;
    return { pending, paid, failed, refunded, total: rows.length };
  }, [rows]);

  const statusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-emerald-600 hover:bg-emerald-600">paid</Badge>;
      case "pending":
        return <Badge variant="outline" className="text-amber-400 border-amber-400">pending</Badge>;
      case "failed":
        return <Badge variant="destructive">failed</Badge>;
      case "refunded":
        return <Badge variant="secondary">refunded</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const SortHeader = ({ label, k }: { label: string; k: SortKey }) => (
    <button
      onClick={() => toggleSort(k)}
      className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
    >
      {label}
      <ArrowUpDown className="w-3 h-3" />
    </button>
  );

  return (
    <div className="p-6 max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Academy Purchase Status</h1>
        <p className="text-sm text-muted-foreground mt-1">
          All academy course purchase rows with checkout session ID and payment timestamps.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatCard label="Total" value={totals.total} />
        <StatCard label="Pending" value={totals.pending} accent="amber" />
        <StatCard label="Paid" value={totals.paid} accent="emerald" />
        <StatCard label="Failed" value={totals.failed} accent="rose" />
        <StatCard label="Refunded" value={totals.refunded} accent="slate" />
      </div>

      {/* Filters */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="flex gap-2 flex-wrap">
            {(["all", "pending", "paid", "failed", "refunded"] as const).map((s) => (
              <Button
                key={s}
                variant={statusFilter === s ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(s)}
              >
                {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
              </Button>
            ))}
          </div>
          <div className="relative flex-1 w-full sm:w-auto">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by email, name, course, session ID, payment intent, or user ID…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-full sm:w-96"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => load(false)} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              <span className="ml-1">Refresh</span>
            </Button>
            <Button
              variant={autoRefresh ? "default" : "outline"}
              size="sm"
              onClick={() => setAutoRefresh((v) => !v)}
              title="Poll every 15 seconds"
            >
              Auto: {autoRefresh ? "On" : "Off"}
            </Button>
            {lastRefresh && (
              <span className="text-xs text-muted-foreground hidden md:inline">
                Updated {lastRefresh.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>


        <div className="flex flex-col md:flex-row gap-3 items-start md:items-end flex-wrap">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground flex items-center gap-1">
              <CalendarRange className="w-3 h-3" /> Created
            </label>
            <div className="flex gap-2 items-center">
              <input
                type="date"
                value={createdFrom}
                onChange={(e) => setCreatedFrom(e.target.value)}
                className="h-9 px-2 rounded-md border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
              <span className="text-muted-foreground text-sm">to</span>
              <input
                type="date"
                value={createdTo}
                onChange={(e) => setCreatedTo(e.target.value)}
                className="h-9 px-2 rounded-md border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground flex items-center gap-1">
              <CalendarRange className="w-3 h-3" /> Paid At
            </label>
            <div className="flex gap-2 items-center">
              <input
                type="date"
                value={paidFrom}
                onChange={(e) => setPaidFrom(e.target.value)}
                className="h-9 px-2 rounded-md border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
              <span className="text-muted-foreground text-sm">to</span>
              <input
                type="date"
                value={paidTo}
                onChange={(e) => setPaidTo(e.target.value)}
                className="h-9 px-2 rounded-md border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>

          {(createdFrom || createdTo || paidFrom || paidTo || search || statusFilter !== "all") && (
            <Button
              variant="outline"
              size="sm"
              className="mb-0.5"
              onClick={() => {
                setCreatedFrom("");
                setCreatedTo("");
                setPaidFrom("");
                setPaidTo("");
                setSearch("");
                setStatusFilter("all");
              }}
            >
              Clear filters
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-muted-foreground border-b border-border">
              <tr>
                <th className="text-left py-3 px-4"><SortHeader label="Status" k="status" /></th>
                <th className="text-left py-3 px-4">Buyer</th>
                <th className="text-left py-3 px-4"><SortHeader label="Course" k="course_slug" /></th>
                <th className="text-right py-3 px-4"><SortHeader label="Amount" k="amount_cents" /></th>
                <th className="text-left py-3 px-4">Checkout Session</th>
                <th className="text-left py-3 px-4">Payment Intent</th>
                <th className="text-left py-3 px-4"><SortHeader label="Created" k="created_at" /></th>
                <th className="text-left py-3 px-4"><SortHeader label="Paid At" k="paid_at" /></th>
                <th className="text-left py-3 px-4">Expires</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-muted-foreground">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "No rows match the current filter."}
                  </td>
                </tr>
              ) : (
                filtered.map((row) => {
                  const prof = profiles[row.user_id];
                  return (
                  <tr key={row.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4">{statusBadge(row.status)}</td>
                    <td className="py-3 px-4">
                      <div className="text-foreground text-xs font-medium truncate max-w-[220px]" title={prof?.email ?? ""}>
                        {prof?.email ?? <span className="italic text-muted-foreground">unknown</span>}
                      </div>
                      {prof?.full_name && (
                        <div className="text-muted-foreground text-xs truncate max-w-[220px]">{prof.full_name}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 font-medium">{row.course_slug}</td>
                    <td className="py-3 px-4 text-right tabular-nums">
                      {(row.amount_cents / 100).toFixed(2)} {row.currency.toUpperCase()}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-muted-foreground">
                      {row.stripe_session_id ? (
                        <span title={row.stripe_session_id}>{row.stripe_session_id.slice(0, 18)}…</span>
                      ) : (
                        <span className="italic">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-muted-foreground">
                      {row.stripe_payment_intent_id ? (
                        <span title={row.stripe_payment_intent_id}>{row.stripe_payment_intent_id.slice(0, 18)}…</span>
                      ) : (
                        <span className="italic">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{fmtDate(row.created_at)}</td>
                    <td className="py-3 px-4 text-muted-foreground">{fmtDate(row.paid_at)}</td>
                    <td className="py-3 px-4 text-muted-foreground">{fmtDate(row.expires_at)}</td>
                  </tr>
                  );
                })

              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2 border-t border-border text-xs text-muted-foreground">
          Showing {filtered.length} of {rows.length} rows
        </div>
      </Card>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: "amber" | "emerald" | "rose" | "slate";
}) {
  const color =
    accent === "amber"
      ? "text-amber-400"
      : accent === "emerald"
      ? "text-emerald-400"
      : accent === "rose"
      ? "text-rose-400"
      : accent === "slate"
      ? "text-slate-400"
      : "text-foreground";
  return (
    <Card className="p-3">
      <div className="text-muted-foreground text-xs">{label}</div>
      <div className={`text-lg font-semibold ${color}`}>{value}</div>
    </Card>
  );
}

function fmtDate(ts: string | null) {
  if (!ts) return "—";
  const d = new Date(ts);
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
