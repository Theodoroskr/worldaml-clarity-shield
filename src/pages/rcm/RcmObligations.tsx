import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useRcmOrg } from "@/hooks/useRcmOrg";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, X, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { toast } from "sonner";

type Obligation = {
  id: string;
  title: string;
  description: string | null;
  jurisdiction: string | null;
  risk_level: string | null;
  compliance_status: string | null;
  deadline: string | null;
};

const STATUS_OPTIONS = ["compliant", "partial", "non_compliant", "not_assessed", "not_applicable"] as const;
const RISK_OPTIONS = ["low", "medium", "high", "critical"] as const;
const STATUS_RANK: Record<string, number> = { compliant: 0, partial: 1, non_compliant: 2, not_assessed: 3, not_applicable: 4 };
const RISK_RANK: Record<string, number> = { low: 0, medium: 1, high: 2, critical: 3 };
type SortKey = "title" | "deadline" | "compliance_status" | "risk_level";
const SORT_KEYS: SortKey[] = ["title", "deadline", "compliance_status", "risk_level"];

const STATUS_BADGE: Record<string, string> = {
  compliant: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
  partial: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
  non_compliant: "bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/30",
  not_assessed: "bg-muted text-muted-foreground border-border",
  not_applicable: "bg-muted text-muted-foreground border-border",
};
const RISK_BADGE: Record<string, string> = {
  low: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
  medium: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
  high: "bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-500/30",
  critical: "bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/30",
};

export default function RcmObligations() {
  const { t } = useTranslation();
  const { membership, loading: orgLoading } = useRcmOrg();
  const [items, setItems] = useState<Obligation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const status = searchParams.get("status") || "all";
  const risk = searchParams.get("risk") || "all";
  const q = searchParams.get("q") || "";

  const sortKey = (SORT_KEYS as string[]).includes(searchParams.get("sort") || "")
    ? (searchParams.get("sort") as SortKey)
    : "deadline";
  const sortDir: "asc" | "desc" = searchParams.get("dir") === "desc" ? "desc" : "asc";

  const updateParam = (key: string, value: string, defaultValue: string) => {
    const next = new URLSearchParams(searchParams);
    if (!value || value === defaultValue) next.delete(key);
    else next.set(key, value);
    setSearchParams(next, { replace: true });
  };
  const setStatus = (v: string) => updateParam("status", v, "all");
  const setRisk = (v: string) => updateParam("risk", v, "all");
  const setQ = (v: string) => updateParam("q", v, "");
  const toggleSort = (key: SortKey) => {
    const next = new URLSearchParams(searchParams);
    if (sortKey === key) {
      const newDir = sortDir === "asc" ? "desc" : "asc";
      next.set("sort", key);
      if (newDir === "asc") next.delete("dir"); else next.set("dir", newDir);
    } else {
      if (key === "deadline") next.delete("sort"); else next.set("sort", key);
      next.delete("dir");
    }
    setSearchParams(next, { replace: true });
  };


  useEffect(() => {
    if (!membership) { setLoading(false); return; }
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("rcm_obligations")
        .select("id, title, description, jurisdiction, risk_level, compliance_status, deadline")
        .eq("organization_id", membership.orgId)
        .order("deadline", { ascending: true, nullsFirst: false });
      setItems((data || []) as Obligation[]);
      setLoading(false);
    })();
  }, [membership]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const list = items.filter(o => {
      if (status !== "all" && (o.compliance_status || "not_assessed") !== status) return false;
      if (risk !== "all" && (o.risk_level || "medium") !== risk) return false;
      if (needle && !`${o.title} ${o.description ?? ""} ${o.jurisdiction ?? ""}`.toLowerCase().includes(needle)) return false;
      return true;
    });
    const dir = sortDir === "asc" ? 1 : -1;
    const cmpVal = (o: Obligation): string | number => {
      switch (sortKey) {
        case "title": return (o.title || "").toLowerCase();
        case "compliance_status": return STATUS_RANK[o.compliance_status || "not_assessed"] ?? 99;
        case "risk_level": return RISK_RANK[o.risk_level || "medium"] ?? 99;
        case "deadline":
        default: return o.deadline ? new Date(o.deadline).getTime() : Number.POSITIVE_INFINITY;
      }
    };
    return [...list].sort((a, b) => {
      const av = cmpVal(a); const bv = cmpVal(b);
      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return 0;
    });
  }, [items, status, risk, q, sortKey, sortDir]);

  const filtersActive = status !== "all" || risk !== "all" || q.length > 0;
  const clearFilters = () => {
    const next = new URLSearchParams(searchParams);
    next.delete("status"); next.delete("risk"); next.delete("q");
    setSearchParams(next, { replace: true });
  };

  // Bulk selection
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState<string>("");
  const [bulkRisk, setBulkRisk] = useState<string>("");
  const [applying, setApplying] = useState(false);

  const filteredIds = useMemo(() => filtered.map(o => o.id), [filtered]);
  const allSelected = filteredIds.length > 0 && filteredIds.every(id => selected.has(id));
  const someSelected = filteredIds.some(id => selected.has(id));

  const toggleOne = (id: string, on: boolean) => {
    setSelected(prev => {
      const next = new Set(prev);
      on ? next.add(id) : next.delete(id);
      return next;
    });
  };
  const toggleAll = (on: boolean) => {
    setSelected(prev => {
      const next = new Set(prev);
      filteredIds.forEach(id => on ? next.add(id) : next.delete(id));
      return next;
    });
  };
  const clearSelection = () => setSelected(new Set());

  const applyBulk = async () => {
    if (!membership || selected.size === 0) return;
    const patch: Record<string, string> = {};
    if (bulkStatus) patch.compliance_status = bulkStatus;
    if (bulkRisk) patch.risk_level = bulkRisk;
    if (Object.keys(patch).length === 0) return;
    setApplying(true);
    const ids = Array.from(selected);
    const { error } = await supabase
      .from("rcm_obligations")
      .update(patch)
      .in("id", ids)
      .eq("organization_id", membership.orgId);
    setApplying(false);
    if (error) {
      toast.error(t("rcm.obligations.bulk_error"));
      return;
    }
    setItems(prev => prev.map(o => ids.includes(o.id) ? { ...o, ...patch } : o));
    toast.success(t("rcm.obligations.bulk_success", { count: ids.length }));
    setBulkStatus(""); setBulkRisk(""); clearSelection();
  };

  if (orgLoading) {
    return <div className="p-8 flex items-center gap-2 text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin"/> {t("rcm.common.loading")}</div>;
  }
  if (!membership) {
    return <div className="p-8 max-w-2xl mx-auto"><Card className="p-8 text-center text-muted-foreground">{t("rcm.common.no_org")}</Card></div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="text-2xl font-bold">{t("rcm.nav.obligations")}</h1>
        <div className="text-sm text-muted-foreground">
          {filtered.length} / {items.length}
        </div>
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs text-muted-foreground block mb-1.5">{t("rcm.common.search")}</label>
            <Input value={q} onChange={e => setQ(e.target.value)} placeholder={t("rcm.common.search")} />
          </div>
          <div className="min-w-[180px]">
            <label className="text-xs text-muted-foreground block mb-1.5">{t("rcm.common.status")}</label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("rcm.obligations.all_statuses")}</SelectItem>
                {STATUS_OPTIONS.map(s => (
                  <SelectItem key={s} value={s}>{t(`rcm.dashboard.status_${s}`)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="min-w-[160px]">
            <label className="text-xs text-muted-foreground block mb-1.5">{t("rcm.common.risk")}</label>
            <Select value={risk} onValueChange={setRisk}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("rcm.obligations.all_risks")}</SelectItem>
                {RISK_OPTIONS.map(r => (
                  <SelectItem key={r} value={r}>{t(`rcm.dashboard.risk_${r}`)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {filtersActive && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1.5">
              <X className="h-3.5 w-3.5" /> {t("rcm.obligations.clear_filters")}
            </Button>
          )}
        </div>
      </Card>

      {loading ? (
        <div className="p-8 flex items-center gap-2 text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin"/> {t("rcm.common.loading")}</div>
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground border-dashed">
          {items.length === 0 ? t("rcm.dashboard.no_obligations") : t("rcm.obligations.no_matches")}
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-2.5 border-b bg-muted/30 text-sm flex-wrap">
            <Checkbox
              checked={allSelected ? true : someSelected ? "indeterminate" : false}
              onCheckedChange={(v) => toggleAll(v === true)}
              aria-label={t("rcm.obligations.select_all")}
            />
            {selected.size > 0 ? (
              <>
                <span className="font-medium">{t("rcm.obligations.selected_count", { count: selected.size })}</span>
                <Select value={bulkStatus} onValueChange={setBulkStatus}>
                  <SelectTrigger className="h-8 w-[170px]"><SelectValue placeholder={t("rcm.obligations.bulk_set_status")} /></SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map(s => (
                      <SelectItem key={s} value={s}>{t(`rcm.dashboard.status_${s}`)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={bulkRisk} onValueChange={setBulkRisk}>
                  <SelectTrigger className="h-8 w-[150px]"><SelectValue placeholder={t("rcm.obligations.bulk_set_risk")} /></SelectTrigger>
                  <SelectContent>
                    {RISK_OPTIONS.map(r => (
                      <SelectItem key={r} value={r}>{t(`rcm.dashboard.risk_${r}`)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button size="sm" onClick={applyBulk} disabled={applying || (!bulkStatus && !bulkRisk)} className="h-8">
                  {applying && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />}
                  {applying ? t("rcm.obligations.applying") : t("rcm.obligations.apply")}
                </Button>
                <Button size="sm" variant="ghost" onClick={clearSelection} className="h-8 gap-1">
                  <X className="h-3.5 w-3.5" /> {t("rcm.obligations.clear_selection")}
                </Button>
              </>
            ) : (
              <span className="text-muted-foreground">{t("rcm.obligations.select_all")}</span>
            )}
          </div>
          <div className="flex items-center gap-1 px-4 py-2 border-b bg-muted/10 text-xs text-muted-foreground flex-wrap">
            <span className="me-2">{t("rcm.obligations.sort_by")}:</span>
            {SORT_KEYS.map(key => {
              const active = sortKey === key;
              const Icon = active ? (sortDir === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown;
              return (
                <Button
                  key={key}
                  variant={active ? "secondary" : "ghost"}
                  size="sm"
                  className="h-7 px-2 gap-1 text-xs"
                  onClick={() => toggleSort(key)}
                  aria-pressed={active}
                >
                  {t(`rcm.obligations.sort_${key}`)}
                  <Icon className="h-3 w-3" />
                </Button>
              );
            })}
          </div>
          <ul className="divide-y">
            {filtered.map(o => (
              <li key={o.id} className="p-4 hover:bg-muted/40 transition-colors">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <Checkbox
                      className="mt-1"
                      checked={selected.has(o.id)}
                      onCheckedChange={(v) => toggleOne(o.id, v === true)}
                      aria-label={o.title}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="font-medium truncate">{o.title}</div>
                      {o.description && (
                        <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{o.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground flex-wrap">
                        {o.jurisdiction && <span>{o.jurisdiction}</span>}
                        {o.deadline && <span>· {t("rcm.common.deadline")}: {o.deadline}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {o.risk_level && (
                      <Badge variant="outline" className={RISK_BADGE[o.risk_level] || ""}>
                        {t(`rcm.dashboard.risk_${o.risk_level}`, o.risk_level)}
                      </Badge>
                    )}
                    {o.compliance_status && (
                      <Badge variant="outline" className={STATUS_BADGE[o.compliance_status] || ""}>
                        {t(`rcm.dashboard.status_${o.compliance_status}`, o.compliance_status)}
                      </Badge>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <div className="text-xs text-muted-foreground">
        <Link to="/rcm" className="underline">← {t("rcm.nav.dashboard")}</Link>
      </div>
    </div>
  );
}
