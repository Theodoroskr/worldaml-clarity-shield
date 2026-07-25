import { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useOrganisation } from "@/hooks/useOrganisation";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Loader2, RefreshCw, Grid3X3, ArrowUpRight, X, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

interface CustomerRow {
  id: string;
  name: string;
  type: string | null;
  country: string | null;
  risk_level: string | null;
  risk_score: number | null;
  status: string | null;
  kyc_status: string | null;
  pep_status: string | null;
  regulator: string | null;
  created_at: string;
  onboarding_data: any;
}

interface CaseRow {
  id: string;
  customer_id: string | null;
  status: string | null;
  priority: string | null;
  title: string | null;
}

const RISK_WEIGHT: Record<string, number> = { critical: 100, high: 78, medium: 50, low: 20 };
const UNCLASSIFIED = "Unclassified";

/** Product line for a customer: explicit onboarding field, else entity type. */
function productOf(c: CustomerRow): string {
  const d = c.onboarding_data ?? {};
  const raw =
    d.product || d.product_line || d.productLine || d.service || d.service_line ||
    d.account_type || d.accountType || null;
  if (typeof raw === "string" && raw.trim()) return raw.trim();
  if (c.type === "individual") return "Individual accounts";
  if (c.type === "business" || c.type === "company") return "Corporate accounts";
  return c.type ? c.type : UNCLASSIFIED;
}

function countryOf(c: CustomerRow): string {
  return (c.country || "").trim() || UNCLASSIFIED;
}

function riskValue(c: CustomerRow): number {
  if (typeof c.risk_score === "number" && c.risk_score > 0) return c.risk_score;
  return RISK_WEIGHT[(c.risk_level || "low").toLowerCase()] ?? 20;
}

function heatStyle(score: number, count: number) {
  if (!count) return "bg-muted/20 text-muted-foreground border-border";
  if (score >= 80) return "bg-red-600 text-white border-red-700";
  if (score >= 65) return "bg-red-500/85 text-white border-red-600";
  if (score >= 50) return "bg-amber-500/90 text-white border-amber-600";
  if (score >= 35) return "bg-amber-400/70 text-amber-950 border-amber-500";
  return "bg-emerald-500/80 text-white border-emerald-600";
}

function bandLabel(score: number) {
  if (score >= 80) return "Critical";
  if (score >= 65) return "High";
  if (score >= 50) return "Elevated";
  if (score >= 35) return "Medium";
  return "Low";
}

export default function SuiteRiskHeatmap() {
  const { orgId, isLoading: orgLoading } = useOrganisation();
  const navigate = useNavigate();

  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [cases, setCases] = useState<CaseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [riskFilter, setRiskFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [kycFilter, setKycFilter] = useState("all");
  const [pepOnly, setPepOnly] = useState(false);
  const [metric, setMetric] = useState<"avg" | "count" | "high">("avg");
  const [minCustomers, setMinCustomers] = useState(0);
  const [search, setSearch] = useState("");
  const [createdFrom, setCreatedFrom] = useState("");
  const [createdTo, setCreatedTo] = useState("");

  const [cell, setCell] = useState<{ country: string; product: string } | null>(null);

  const load = useCallback(async () => {
    if (!orgId) return;
    setRefreshing(true);
    const [cRes, kRes] = await Promise.all([
      supabase
        .from("suite_customers")
        .select("id,name,type,country,risk_level,risk_score,status,kyc_status,pep_status,regulator,created_at,onboarding_data")
        .eq("organisation_id", orgId)
        .limit(5000),
      supabase
        .from("suite_cases")
        .select("id,customer_id,status,priority,title")
        .eq("organisation_id", orgId)
        .limit(5000),
    ]);
    setCustomers((cRes.data ?? []) as CustomerRow[]);
    setCases((kRes.data ?? []) as CaseRow[]);
    setLoading(false);
    setRefreshing(false);
  }, [orgId]);

  useEffect(() => { if (!orgLoading && orgId) load(); }, [orgId, orgLoading, load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const from = createdFrom ? new Date(createdFrom).getTime() : null;
    const to = createdTo ? new Date(createdTo).getTime() + 86400000 : null;
    return customers.filter(c => {
      if (riskFilter !== "all" && (c.risk_level || "").toLowerCase() !== riskFilter) return false;
      if (statusFilter !== "all" && (c.status || "") !== statusFilter) return false;
      if (kycFilter !== "all" && (c.kyc_status || "") !== kycFilter) return false;
      if (pepOnly && !["yes", "true", "pep", "confirmed"].includes((c.pep_status || "").toLowerCase())) return false;
      if (q && !(`${c.name} ${c.country ?? ""} ${productOf(c)}`.toLowerCase().includes(q))) return false;
      const t = new Date(c.created_at).getTime();
      if (from && t < from) return false;
      if (to && t > to) return false;
      return true;
    });
  }, [customers, riskFilter, statusFilter, kycFilter, pepOnly, search, createdFrom, createdTo]);

  const openCasesByCustomer = useMemo(() => {
    const m = new Map<string, number>();
    cases.forEach(k => {
      if (!k.customer_id) return;
      if (["closed", "resolved"].includes((k.status || "").toLowerCase())) return;
      m.set(k.customer_id, (m.get(k.customer_id) ?? 0) + 1);
    });
    return m;
  }, [cases]);

  const { countries, products, grid } = useMemo(() => {
    const g = new Map<string, CustomerRow[]>();
    const cSet = new Map<string, number>();
    const pSet = new Map<string, number>();
    filtered.forEach(c => {
      const country = countryOf(c);
      const product = productOf(c);
      const key = `${country}|||${product}`;
      if (!g.has(key)) g.set(key, []);
      g.get(key)!.push(c);
      cSet.set(country, (cSet.get(country) ?? 0) + 1);
      pSet.set(product, (pSet.get(product) ?? 0) + 1);
    });
    const countries = [...cSet.entries()]
      .filter(([, n]) => n >= minCustomers)
      .sort((a, b) => b[1] - a[1])
      .map(([k]) => k);
    const products = [...pSet.entries()].sort((a, b) => b[1] - a[1]).map(([k]) => k);
    return { countries, products, grid: g };
  }, [filtered, minCustomers]);

  const cellRows = (country: string, product: string) => grid.get(`${country}|||${product}`) ?? [];

  const cellMetric = (rows: CustomerRow[]) => {
    if (rows.length === 0) return 0;
    if (metric === "count") return Math.min(100, (rows.length / Math.max(1, filtered.length)) * 100 * 4);
    if (metric === "high") {
      const hi = rows.filter(r => ["high", "critical"].includes((r.risk_level || "").toLowerCase())).length;
      return (hi / rows.length) * 100;
    }
    return rows.reduce((s, r) => s + riskValue(r), 0) / rows.length;
  };

  const cellLabel = (rows: CustomerRow[]) => {
    if (rows.length === 0) return "—";
    if (metric === "count") return String(rows.length);
    if (metric === "high") return `${Math.round(cellMetric(rows))}%`;
    return String(Math.round(cellMetric(rows)));
  };

  const totals = useMemo(() => {
    const high = filtered.filter(c => ["high", "critical"].includes((c.risk_level || "").toLowerCase())).length;
    const avg = filtered.length ? Math.round(filtered.reduce((s, c) => s + riskValue(c), 0) / filtered.length) : 0;
    let hottest: { key: string; score: number; count: number } | null = null;
    grid.forEach((rows, key) => {
      if (rows.length < 2) return;
      const score = rows.reduce((s, r) => s + riskValue(r), 0) / rows.length;
      if (!hottest || score > hottest.score) hottest = { key, score, count: rows.length };
    });
    return { high, avg, hottest };
  }, [filtered, grid]);

  const selectedRows = cell ? cellRows(cell.country, cell.product) : [];

  const resetFilters = () => {
    setRiskFilter("all"); setStatusFilter("all"); setKycFilter("all");
    setPepOnly(false); setSearch(""); setCreatedFrom(""); setCreatedTo(""); setMinCustomers(0);
  };

  if (orgLoading || loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in h-full overflow-y-auto">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Risk Heat-Map</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Customer risk exposure by country and product line · {filtered.length} customers in scope
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={refreshing}>
          <RefreshCw className={cn("w-4 h-4 mr-2", refreshing && "animate-spin")} /> Refresh
        </Button>
      </div>

      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground uppercase font-semibold">Customers in scope</p>
          <p className="text-2xl font-bold text-foreground mt-1">{filtered.length}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground uppercase font-semibold">High / critical</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{totals.high}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground uppercase font-semibold">Avg risk score</p>
          <p className="text-2xl font-bold text-foreground mt-1">{totals.avg}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground uppercase font-semibold flex items-center gap-1">
            <Flame className="w-3 h-3" /> Hottest segment
          </p>
          {totals.hottest ? (
            <p className="text-sm font-semibold text-foreground mt-1">
              {totals.hottest.key.split("|||")[0]} · {totals.hottest.key.split("|||")[1]}
              <span className="block text-xs font-normal text-muted-foreground">
                {Math.round(totals.hottest.score)} avg · {totals.hottest.count} customers
              </span>
            </p>
          ) : (
            <p className="text-sm text-muted-foreground mt-1">Not enough data</p>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-4">
        <div className="grid gap-3 md:grid-cols-4">
          <div>
            <Label className="text-xs">Metric</Label>
            <Select value={metric} onValueChange={(v: any) => setMetric(v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="avg">Average risk score</SelectItem>
                <SelectItem value="count">Customer concentration</SelectItem>
                <SelectItem value="high">% high / critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Risk level</Label>
            <Select value={riskFilter} onValueChange={setRiskFilter}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["all", "critical", "high", "medium", "low"].map(v => (
                  <SelectItem key={v} value={v} className="capitalize">{v === "all" ? "All risk levels" : v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Customer status</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {[...new Set(customers.map(c => c.status).filter(Boolean))].map(s => (
                  <SelectItem key={s!} value={s!} className="capitalize">{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">KYC status</Label>
            <Select value={kycFilter} onValueChange={setKycFilter}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All KYC states</SelectItem>
                {[...new Set(customers.map(c => c.kyc_status).filter(Boolean))].map(s => (
                  <SelectItem key={s!} value={s!} className="capitalize">{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-4">
          <div>
            <Label className="text-xs">Search</Label>
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Name, country, product" />
          </div>
          <div>
            <Label className="text-xs">Onboarded from</Label>
            <Input type="date" value={createdFrom} onChange={e => setCreatedFrom(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs">Onboarded to</Label>
            <Input type="date" value={createdTo} onChange={e => setCreatedTo(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs">Min customers per country</Label>
            <Input type="number" min={0} value={minCustomers} onChange={e => setMinCustomers(Number(e.target.value) || 0)} />
          </div>
        </div>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input type="checkbox" checked={pepOnly} onChange={e => setPepOnly(e.target.checked)} />
            PEP-flagged customers only
          </label>
          <Button variant="ghost" size="sm" onClick={resetFilters}>Reset filters</Button>
        </div>
      </div>

      {/* Heat-map */}
      <div className="bg-card border border-border rounded-xl">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Grid3X3 className="w-4 h-4 text-muted-foreground" />
            <h2 className="font-semibold text-foreground">Country × Product</h2>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <span>Low</span>
            {["bg-emerald-500/80", "bg-amber-400/70", "bg-amber-500/90", "bg-red-500/85", "bg-red-600"].map(c => (
              <span key={c} className={cn("w-6 h-3 rounded-sm", c)} />
            ))}
            <span>Critical</span>
          </div>
        </div>

        {countries.length === 0 || products.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-10">
            No customers match the current filters.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-separate border-spacing-1 p-3">
              <thead>
                <tr>
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase px-2">Country</th>
                  {products.map(p => (
                    <th key={p} className="text-xs font-semibold text-muted-foreground uppercase px-2 whitespace-nowrap">{p}</th>
                  ))}
                  <th className="text-xs font-semibold text-muted-foreground uppercase px-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {countries.map(country => {
                  const rowTotal = products.reduce((n, p) => n + cellRows(country, p).length, 0);
                  return (
                    <tr key={country}>
                      <td className="px-2 font-medium text-foreground whitespace-nowrap">{country}</td>
                      {products.map(p => {
                        const rows = cellRows(country, p);
                        const score = cellMetric(rows);
                        return (
                          <td key={p} className="p-0">
                            <button
                              disabled={rows.length === 0}
                              onClick={() => setCell({ country, product: p })}
                              title={rows.length ? `${country} · ${p} — ${rows.length} customers · ${bandLabel(score)}` : "No customers"}
                              className={cn(
                                "w-full min-w-[76px] h-14 rounded-md border text-xs font-bold transition-transform",
                                heatStyle(score, rows.length),
                                rows.length > 0 && "hover:scale-[1.04] cursor-pointer",
                                cell?.country === country && cell?.product === p && "ring-2 ring-offset-1 ring-primary",
                              )}
                            >
                              <span className="block">{cellLabel(rows)}</span>
                              {rows.length > 0 && (
                                <span className="block text-[10px] font-normal opacity-90">{rows.length} cust.</span>
                              )}
                            </button>
                          </td>
                        );
                      })}
                      <td className="px-2 font-mono text-xs text-muted-foreground text-center">{rowTotal}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Drill-down */}
      {cell && (
        <div className="bg-card border border-border rounded-xl">
          <div className="px-5 py-4 border-b border-border flex items-start justify-between gap-3">
            <div>
              <h2 className="font-semibold text-foreground">
                {cell.country} · {cell.product}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {selectedRows.length} customers · avg risk {Math.round(
                  selectedRows.length ? selectedRows.reduce((s, r) => s + riskValue(r), 0) / selectedRows.length : 0,
                )} ·{" "}
                {selectedRows.reduce((n, r) => n + (openCasesByCustomer.get(r.id) ?? 0), 0)} open cases
              </p>
            </div>
            <button onClick={() => setCell(null)} className="p-1 hover:bg-muted rounded">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {["Customer", "Risk", "Score", "Status", "KYC", "Open cases", ""].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {selectedRows
                .sort((a, b) => riskValue(b) - riskValue(a))
                .map(c => {
                  const open = openCasesByCustomer.get(c.id) ?? 0;
                  return (
                    <tr key={c.id} className="hover:bg-muted/20">
                      <td className="px-5 py-3 font-medium text-foreground">{c.name}</td>
                      <td className="px-5 py-3">
                        <span className={cn(
                          "text-xs px-2 py-0.5 rounded-full border font-medium capitalize",
                          ["high", "critical"].includes((c.risk_level || "").toLowerCase())
                            ? "bg-red-50 text-red-700 border-red-200"
                            : (c.risk_level || "").toLowerCase() === "medium"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-emerald-50 text-emerald-700 border-emerald-200",
                        )}>
                          {c.risk_level ?? "unrated"}
                        </span>
                      </td>
                      <td className="px-5 py-3 font-mono font-bold text-foreground">{riskValue(c)}</td>
                      <td className="px-5 py-3 text-xs capitalize text-muted-foreground">{c.status ?? "—"}</td>
                      <td className="px-5 py-3 text-xs capitalize text-muted-foreground">{c.kyc_status ?? "—"}</td>
                      <td className="px-5 py-3 font-mono text-xs text-foreground">{open}</td>
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={() => navigate(`/suite/case-queue?customerId=${c.id}&status=${open > 0 ? "open" : "all"}`)}
                          className="inline-flex items-center gap-1 text-[11px] px-2 py-1 border border-border rounded text-muted-foreground hover:bg-muted"
                        >
                          {open > 0 ? "View cases" : "Open case queue"} <ArrowUpRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
          <div className="px-5 py-3 border-t border-border flex justify-end">
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate(`/suite/case-queue?status=open&risk=high&q=${encodeURIComponent(cell.country)}`)}
            >
              Open high-risk cases for {cell.country} <ArrowUpRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
