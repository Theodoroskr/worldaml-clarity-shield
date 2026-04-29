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
import { Loader2, X } from "lucide-react";
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

  const updateParam = (key: string, value: string, defaultValue: string) => {
    const next = new URLSearchParams(searchParams);
    if (!value || value === defaultValue) next.delete(key);
    else next.set(key, value);
    setSearchParams(next, { replace: true });
  };
  const setStatus = (v: string) => updateParam("status", v, "all");
  const setRisk = (v: string) => updateParam("risk", v, "all");
  const setQ = (v: string) => updateParam("q", v, "");

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
    return items.filter(o => {
      if (status !== "all" && (o.compliance_status || "not_assessed") !== status) return false;
      if (risk !== "all" && (o.risk_level || "medium") !== risk) return false;
      if (needle && !`${o.title} ${o.description ?? ""} ${o.jurisdiction ?? ""}`.toLowerCase().includes(needle)) return false;
      return true;
    });
  }, [items, status, risk, q]);

  const filtersActive = status !== "all" || risk !== "all" || q.length > 0;
  const clearFilters = () => {
    const next = new URLSearchParams(searchParams);
    next.delete("status"); next.delete("risk"); next.delete("q");
    setSearchParams(next, { replace: true });
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
          <ul className="divide-y">
            {filtered.map(o => (
              <li key={o.id} className="p-4 hover:bg-muted/40 transition-colors">
                <div className="flex items-start justify-between gap-4 flex-wrap">
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
