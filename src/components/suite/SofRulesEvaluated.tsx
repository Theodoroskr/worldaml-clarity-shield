import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronRight, CheckCircle2, AlertTriangle, Gauge, ShieldCheck } from "lucide-react";
import type { SofReconciliation } from "./SofFlagDrillDown";

type Severity = "high" | "medium" | "low";

type RuleDef = {
  code: string;
  title: string;
  description: string;
  predicate: string;
  /** What this rule looks at, used to render the observed-vs-threshold row */
  observation: (r: SofReconciliation, t: NonNullable<SofReconciliation["thresholds_used"]>) => {
    observed: string;
    threshold: string;
  };
  /** Whether the rule fired, derived from r.flags_detailed */
  triggeredSeverity: (r: SofReconciliation) => Severity | null;
  /** Plain-English reason shown when triggered. Pulled from the matching detailed flag if present. */
  reasonFromFlag?: boolean;
  /** Citation / regulatory rationale */
  citation: string;
};

const RULES: RuleDef[] = [
  {
    code: "inflow_exceeds_declared",
    title: "Inflows exceed declared income",
    description: "Detects customers whose 12-month credit volume materially exceeds the income they declared on their SoF form — a classic indicator of unexplained wealth.",
    predicate: "actual_inflow_12m > declared_annual_income × inflow_high_multiplier",
    observation: (r, t) => ({
      observed: `actual ${fmtN(r.actual_inflow_12m)} vs declared ${fmtN(r.declared_annual_income)} (variance ${fmtPct(r.variance_pct)})`,
      threshold: `actual > declared × ${t.inflow_high_multiplier}`,
    }),
    triggeredSeverity: (r) => sevOf(r, "inflow_exceeds_declared"),
    reasonFromFlag: true,
    citation: "FATF R.10 — ongoing due diligence; EU 6AMLD Art. 18a — EDD source-of-wealth scrutiny.",
  },
  {
    code: "inflow_below_declared",
    title: "Inflows materially below declared income",
    description: "Identifies customers whose actual credits fall well short of their declared earnings — possible undisclosed external accounts or false declaration.",
    predicate: "actual_inflow_12m < declared_annual_income × inflow_low_multiplier AND transactions > 0",
    observation: (r, t) => ({
      observed: `actual ${fmtN(r.actual_inflow_12m)} vs declared ${fmtN(r.declared_annual_income)} (variance ${fmtPct(r.variance_pct)})`,
      threshold: `actual < declared × ${t.inflow_low_multiplier}`,
    }),
    triggeredSeverity: (r) => sevOf(r, "inflow_below_declared"),
    reasonFromFlag: true,
    citation: "FATF R.10 — declared profile must reconcile with observed activity.",
  },
  {
    code: "foreign_counterparties",
    title: "Foreign counterparty concentration",
    description: "Counts distinct foreign jurisdictions transacting with the customer vs. their declared source country. Cross-border concentration warrants enhanced scrutiny.",
    predicate: "distinct_foreign_counterparty_countries ≥ foreign_countries_min",
    observation: (r, t) => ({
      observed: `${r.foreign_counterparty_countries ?? 0} foreign countries observed`,
      threshold: `≥ ${t.foreign_countries_min} distinct foreign countries`,
    }),
    triggeredSeverity: (r) => sevOf(r, "foreign_counterparties"),
    reasonFromFlag: true,
    citation: "EU 6AMLD Art. 18a(1)(c); FATF R.19 — higher-risk geographies.",
  },
  {
    code: "missing_income_declaration",
    title: "Inbound activity without declared income",
    description: "Customer has inbound transactions but has not declared any annual income — declaration is incomplete and cannot be reconciled.",
    predicate: "declared_annual_income == 0 AND transactions > 0",
    observation: (r) => ({
      observed: `declared ${fmtN(r.declared_annual_income)} · ${r.transaction_count ?? 0} inbound txns`,
      threshold: "declared = 0 AND txns > 0",
    }),
    triggeredSeverity: (r) => sevOf(r, "missing_income_declaration"),
    reasonFromFlag: true,
    citation: "EU 6AMLD Art. 18a — full SoF/SoW declaration mandatory for high-risk relationships.",
  },
];

function sevOf(r: SofReconciliation, code: string): Severity | null {
  const f = (r.flags_detailed || []).find((x) => x.code === code);
  return f ? f.severity : null;
}
function fmtN(n: number | undefined) {
  if (n === undefined || n === null || Number.isNaN(n)) return "—";
  return Math.round(n).toLocaleString();
}
function fmtPct(n: number | undefined) {
  if (n === undefined || n === null || Number.isNaN(n)) return "—";
  return `${n > 0 ? "+" : ""}${n.toFixed(1)}%`;
}

const SEV_BADGE: Record<Severity, string> = {
  high: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  medium: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  low: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
};

export function SofRulesEvaluated({
  reconciliation,
}: {
  reconciliation: SofReconciliation | null | undefined;
}) {
  const [openRule, setOpenRule] = useState<string | null>(null);
  const r = reconciliation || {};
  const t = r.thresholds_used || {
    inflow_high_multiplier: 1.5,
    inflow_low_multiplier: 0.3,
    foreign_countries_min: 3,
    high_severity_variance_pct: 100,
    min_confidence_for_auto_clear: 80,
  };
  const hasResult = !!r.analysed_at || (r.flags && r.flags.length > 0);

  const evaluated = useMemo(
    () =>
      RULES.map((rule) => {
        const sev = rule.triggeredSeverity(r);
        const obs = rule.observation(r, t as any);
        const flag = (r.flags_detailed || []).find((x) => x.code === rule.code);
        return { rule, severity: sev, triggered: !!sev, observation: obs, reason: flag?.message };
      }),
    [r, t],
  );

  const triggeredCount = evaluated.filter((e) => e.triggered).length;

  if (!hasResult) {
    return null;
  }

  return (
    <Card className="p-4 space-y-3 border-dashed">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Gauge className="w-4 h-4 text-accent" />
          <span className="text-sm font-semibold">Rules evaluated</span>
          <Badge variant="outline" className="text-[10px]">
            {triggeredCount}/{RULES.length} triggered
          </Badge>
        </div>
        <span className="text-[11px] text-muted-foreground">
          Deterministic engine · thresholds applied per organisation
        </span>
      </div>

      <ul className="space-y-1.5">
        {evaluated.map(({ rule, severity, triggered, observation, reason }) => {
          const isOpen = openRule === rule.code;
          return (
            <li key={rule.code} className={`border rounded-md ${triggered ? "bg-background" : "bg-muted/20"}`}>
              <button
                type="button"
                className="w-full flex items-start gap-2 text-left px-3 py-2 hover:bg-muted/40 rounded-md"
                onClick={() => setOpenRule(isOpen ? null : rule.code)}
              >
                {isOpen ? (
                  <ChevronDown className="w-3.5 h-3.5 mt-1 shrink-0 text-muted-foreground" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 mt-1 shrink-0 text-muted-foreground" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {triggered && severity ? (
                      <Badge className={`text-[10px] uppercase ${SEV_BADGE[severity]}`}>
                        <AlertTriangle className="w-2.5 h-2.5 mr-1" />
                        triggered · {severity}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] uppercase text-emerald-700 dark:text-emerald-400 border-emerald-300/60">
                        <CheckCircle2 className="w-2.5 h-2.5 mr-1" />
                        passed
                      </Badge>
                    )}
                    <span className={`text-sm font-medium ${triggered ? "" : "text-muted-foreground"}`}>{rule.title}</span>
                    <code className="text-[10px] text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded">{rule.code}</code>
                  </div>
                  {triggered && reason && (
                    <p className="text-xs text-foreground/80 mt-1 leading-snug">{reason}</p>
                  )}
                </div>
              </button>

              {isOpen && (
                <div className="px-3 pb-3 pt-0 space-y-2 text-xs">
                  <p className="text-muted-foreground leading-relaxed">{rule.description}</p>

                  <div className="grid sm:grid-cols-2 gap-2">
                    <div className="bg-muted/40 rounded p-2">
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Predicate</div>
                      <code className="font-mono text-[11px] break-all">{rule.predicate}</code>
                    </div>
                    <div className="bg-muted/40 rounded p-2">
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Threshold (active)</div>
                      <code className="font-mono text-[11px] break-all">{observation.threshold}</code>
                    </div>
                  </div>

                  <div className={`rounded p-2 border ${triggered ? "border-amber-300/60 bg-amber-50/40 dark:bg-amber-900/10 dark:border-amber-900/40" : "border-emerald-300/60 bg-emerald-50/40 dark:bg-emerald-900/10 dark:border-emerald-900/40"}`}>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Observed value</div>
                    <div className="font-mono text-[11px]">{observation.observed}</div>
                    <div className="mt-1 text-[11px] flex items-center gap-1">
                      {triggered ? (
                        <>
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          <span className="text-foreground/90">Outcome: <strong>flag raised</strong> — observed value crossed the threshold.</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          <span className="text-muted-foreground">Outcome: within tolerance — no flag.</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="text-[11px] text-muted-foreground italic border-l-2 border-border pl-2">
                    {rule.citation}
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
