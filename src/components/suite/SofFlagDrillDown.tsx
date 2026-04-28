import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Sparkles, ChevronDown, ChevronRight, RefreshCw, Loader2,
  ExternalLink, AlertTriangle, Calculator, ListChecks, Settings2,
} from "lucide-react";
import { SofConfidenceCard, type ConfidencePenalty } from "./SofConfidenceCard";

type Txn = {
  id: string;
  amount: number;
  currency?: string | null;
  counterparty?: string | null;
  counterparty_country?: string | null;
  description?: string | null;
  risk_flag?: boolean | null;
  created_at: string;
};

type DetailedFlag = {
  code: string;
  severity: "high" | "medium" | "low";
  message: string;
  calculation: Record<string, any>;
  contributing_transactions: Txn[];
};

export type SofReconciliation = {
  declared_annual_income?: number;
  actual_inflow_12m?: number;
  variance_pct?: number;
  transaction_count?: number;
  foreign_counterparty_countries?: number;
  flags?: string[];
  flags_detailed?: DetailedFlag[];
  top_transactions?: Txn[];
  ai_summary?: string;
  confidence_score?: number;
  confidence_explanation?: string;
  confidence_penalties?: ConfidencePenalty[];
  thresholds_used?: {
    inflow_high_multiplier?: number;
    inflow_low_multiplier?: number;
    foreign_countries_min?: number;
    high_severity_variance_pct?: number;
    min_confidence_for_auto_clear?: number;
  };
  model?: string;
  analysed_at?: string;
};

const SEV: Record<string, string> = {
  high: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  medium: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  low: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
};

const fmtMoney = (n: number | undefined, ccy?: string) => {
  if (n === undefined || n === null || Number.isNaN(n)) return "—";
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency: ccy || "EUR", maximumFractionDigits: 0 }).format(n);
  } catch {
    return `${n.toLocaleString()} ${ccy || ""}`;
  }
};
const fmtDate = (iso: string) => new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

function TxnRow({ t, customerId }: { t: Txn; customerId?: string }) {
  return (
    <li className="flex items-center justify-between gap-3 text-sm py-1.5 px-2 rounded hover:bg-muted/50">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-muted-foreground text-xs tabular-nums">{fmtDate(t.created_at)}</span>
          <span className="truncate font-medium">{t.counterparty || "Unknown counterparty"}</span>
          {t.counterparty_country && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">{t.counterparty_country}</Badge>
          )}
          {t.risk_flag && <Badge variant="secondary" className="text-[10px] bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">flagged</Badge>}
        </div>
        {t.description && <div className="text-xs text-muted-foreground truncate">{t.description}</div>}
      </div>
      <div className="text-right shrink-0">
        <div className="font-mono text-sm tabular-nums">{fmtMoney(t.amount, t.currency || undefined)}</div>
      </div>
      <Link
        to={customerId ? `/suite/transactions?customer=${customerId}&txn=${t.id}` : `/suite/transactions?txn=${t.id}`}
        className="text-muted-foreground hover:text-foreground shrink-0"
        title="Open in Transactions"
      >
        <ExternalLink className="w-3.5 h-3.5" />
      </Link>
    </li>
  );
}

function CalcBlock({ calc }: { calc: Record<string, any> }) {
  return (
    <div className="text-xs bg-muted/40 rounded p-3 space-y-1">
      <div className="flex items-center gap-1.5 text-muted-foreground uppercase tracking-wider text-[10px] font-medium">
        <Calculator className="w-3 h-3" /> Calculation
      </div>
      {calc.formula && <div className="font-mono text-foreground">{calc.formula}</div>}
      <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 mt-1">
        {Object.entries(calc).map(([k, v]) => {
          if (k === "formula") return null;
          if (k === "breakdown_by_country" && v && typeof v === "object") {
            return (
              <div key={k} className="col-span-2 mt-1">
                <div className="text-muted-foreground mb-0.5">By country:</div>
                <div className="grid grid-cols-3 gap-1">
                  {Object.entries(v as Record<string, { count: number; total: number }>).map(([c, b]) => (
                    <div key={c} className="flex justify-between bg-background/60 rounded px-2 py-0.5">
                      <span className="font-medium">{c}</span>
                      <span className="text-muted-foreground tabular-nums">{b.count}× · {b.total.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          }
          return (
            <div key={k} className="flex justify-between gap-2">
              <span className="text-muted-foreground">{k.replace(/_/g, " ")}</span>
              <span className="font-mono text-right tabular-nums">{typeof v === "number" ? v.toLocaleString() : String(v)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function SofFlagDrillDown({
  reconciliation,
  customerId,
  currency,
  onRerun,
  busy,
  canRerun = true,
  canEditThresholds = false,
  onEditThresholds,
}: {
  reconciliation: SofReconciliation | null | undefined;
  customerId?: string;
  currency?: string;
  onRerun?: () => void;
  busy?: boolean;
  canRerun?: boolean;
  canEditThresholds?: boolean;
  onEditThresholds?: () => void;
}) {
  const [openFlag, setOpenFlag] = useState<string | null>(null);
  const r = reconciliation || {};
  const hasResult = r.analysed_at || (r.flags && r.flags.length > 0);
  const detailed = r.flags_detailed || [];
  const legacyOnly = (!detailed.length) && (r.flags?.length || 0) > 0;
  const ccy = currency || "EUR";
  const t = r.thresholds_used;

  return (
    <Card className="p-4 space-y-3 bg-muted/30 border-dashed">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold">AI Reconciliation</span>
          {r.analysed_at && (
            <span className="text-[11px] text-muted-foreground">
              · analysed {new Date(r.analysed_at).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
            </span>
          )}
          {r.model && <Badge variant="outline" className="text-[10px]">{r.model}</Badge>}
        </div>
        {canRerun && onRerun && (
          <Button size="sm" variant="outline" className="h-7" onClick={onRerun} disabled={!!busy}>
            {busy ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <RefreshCw className="w-3 h-3 mr-1" />}
            {hasResult ? "Re-run" : "Run analysis"}
          </Button>
        )}
      </div>

      {!hasResult && !busy && (
        <p className="text-xs text-muted-foreground">Not yet analysed. Run the AI to compare declared income against actual transaction inflows.</p>
      )}

      {hasResult && (
        <>
          {/* Headline metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
            <Metric label="Declared" value={fmtMoney(r.declared_annual_income, ccy)} />
            <Metric label="Actual (12m)" value={fmtMoney(r.actual_inflow_12m, ccy)} />
            <Metric
              label="Variance"
              value={r.variance_pct === undefined ? "—" : `${r.variance_pct > 0 ? "+" : ""}${r.variance_pct.toFixed(1)}%`}
              tone={r.variance_pct !== undefined && Math.abs(r.variance_pct) > 50 ? "warn" : undefined}
            />
            <Metric label="Transactions" value={String(r.transaction_count ?? 0)} />
            <Metric label="Foreign countries" value={String(r.foreign_counterparty_countries ?? 0)} />
          </div>

          {/* Confidence */}
          {typeof r.confidence_score === "number" && (
            <SofConfidenceCard
              score={r.confidence_score}
              explanation={r.confidence_explanation}
              penalties={r.confidence_penalties}
              minAutoClear={t?.min_confidence_for_auto_clear}
            />
          )}

          {/* Active thresholds */}
          {(t || canEditThresholds) && (
            <div className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground bg-muted/40 rounded px-2 py-1.5">
              <div className="truncate">
                <span className="uppercase tracking-wider font-medium mr-2">Thresholds</span>
                {t ? (
                  <>high ×{t.inflow_high_multiplier} · low ×{t.inflow_low_multiplier} · foreign ≥{t.foreign_countries_min} · high-sev {t.high_severity_variance_pct}%</>
                ) : (
                  <>using defaults</>
                )}
              </div>
              {canEditThresholds && onEditThresholds && (
                <Button size="sm" variant="ghost" className="h-6 px-2 text-[11px]" onClick={onEditThresholds}>
                  <Settings2 className="w-3 h-3 mr-1" /> Edit
                </Button>
              )}
            </div>
          )}

          {/* Analyst summary */}
          {r.ai_summary && (
            <div className="border-l-2 border-primary/60 pl-3 py-1">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-0.5">Analyst summary</div>
              <p className="text-sm italic text-foreground/90">{r.ai_summary}</p>
            </div>
          )}

          {/* Flags */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                Flags ({detailed.length || r.flags?.length || 0})
              </span>
            </div>

            {(detailed.length === 0 && (r.flags?.length || 0) === 0) ? (
              <p className="text-xs text-muted-foreground">No flags raised — declared figures reconcile with observed transactions.</p>
            ) : legacyOnly ? (
              <ul className="space-y-1">
                {(r.flags || []).map((m, i) => (
                  <li key={i} className="text-sm flex items-start gap-2 px-2 py-1.5 rounded border border-amber-200/60 bg-amber-50/50 dark:bg-amber-900/10 dark:border-amber-900/30">
                    <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-amber-600" />
                    <span>{m}</span>
                  </li>
                ))}
                <li className="text-[11px] text-muted-foreground italic mt-1">Run analysis again to see contributing transactions and calculations per flag.</li>
              </ul>
            ) : (
              <ul className="space-y-1.5">
                {detailed.map((f) => {
                  const isOpen = openFlag === f.code;
                  const ids = f.contributing_transactions.map(t => t.id).join(",");
                  return (
                    <li key={f.code} className="border rounded-md bg-background">
                      <button
                        type="button"
                        className="w-full flex items-start gap-2 text-left px-3 py-2 hover:bg-muted/40 rounded-md"
                        onClick={() => setOpenFlag(isOpen ? null : f.code)}
                      >
                        {isOpen ? <ChevronDown className="w-3.5 h-3.5 mt-1 shrink-0 text-muted-foreground" /> : <ChevronRight className="w-3.5 h-3.5 mt-1 shrink-0 text-muted-foreground" />}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className={`text-[10px] uppercase ${SEV[f.severity] || SEV.medium}`}>{f.severity}</Badge>
                            <span className="text-sm font-medium">{f.message}</span>
                          </div>
                        </div>
                      </button>
                      {isOpen && (
                        <div className="px-3 pb-3 pt-0 space-y-3">
                          <CalcBlock calc={f.calculation} />

                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                                <ListChecks className="w-3 h-3" /> Contributing transactions ({f.contributing_transactions.length})
                              </div>
                              {f.contributing_transactions.length > 0 && customerId && (
                                <Link
                                  to={`/suite/transactions?customer=${customerId}&ids=${ids}`}
                                  className="text-[11px] text-primary hover:underline inline-flex items-center gap-1"
                                >
                                  Open all <ExternalLink className="w-3 h-3" />
                                </Link>
                              )}
                            </div>
                            {f.contributing_transactions.length === 0 ? (
                              <p className="text-xs text-muted-foreground italic">No specific transactions tied to this flag.</p>
                            ) : (
                              <ul className="divide-y rounded border bg-muted/20">
                                {f.contributing_transactions.map((t) => (
                                  <TxnRow key={t.id} t={t} customerId={customerId} />
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </>
      )}
    </Card>
  );
}

function Metric({ label, value, tone }: { label: string; value: string; tone?: "warn" }) {
  return (
    <div className={`rounded border bg-background p-2 ${tone === "warn" ? "border-amber-300 dark:border-amber-900/60" : ""}`}>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`text-sm font-mono tabular-nums ${tone === "warn" ? "text-amber-700 dark:text-amber-300" : ""}`}>{value}</div>
    </div>
  );
}
