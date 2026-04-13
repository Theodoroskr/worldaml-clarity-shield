// ─────────────────────────────────────────────────────────────────────────────
// src/components/suite/CustomerRiskScore.tsx
//
// Drop-in component showing the automated risk score breakdown for any customer.
// Used in SuiteOnboarding customer detail panel and SuiteRisk page.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { ChevronDown, ChevronUp, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface RiskFactor {
  score: number;
  max: number;
  reason?: string;
  status?: string;
  country?: string;
  matches_90d?: number;
  high_confidence_matches?: number;
  transactions_90d?: number;
  avg_amount?: number;
  flagged_count?: number;
  type?: string;
}

interface RiskFactors {
  total_score: number;
  risk_level: string;
  geography: RiskFactor;
  pep_status: RiskFactor;
  customer_type: RiskFactor;
  kyc_status: RiskFactor;
  screening_history: RiskFactor;
  transaction_behaviour: RiskFactor;
}

interface Props {
  customerId: string;
  riskLevel: string;
  riskScore: number;
  riskFactors: RiskFactors | null;
  scoredAt: string | null;
  onRefresh?: () => void;
}

const LEVEL_COLORS: Record<string, string> = {
  critical: "text-purple-700 bg-purple-50 border-purple-200",
  high:     "text-destructive bg-red-50 border-red-200",
  medium:   "text-amber-700 bg-amber-50 border-amber-200",
  low:      "text-emerald-700 bg-emerald-50 border-emerald-200",
};

const BAR_COLORS: Record<string, string> = {
  critical: "bg-purple-500",
  high:     "bg-destructive",
  medium:   "bg-amber-400",
  low:      "bg-emerald-500",
};

function ScoreBar({ score, max, level }: { score: number; max: number; level: string }) {
  const pct = Math.round((score / max) * 100);
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all", BAR_COLORS[level] ?? "bg-primary")}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[10px] font-mono text-muted-foreground w-12 text-right">
        {score}/{max}
      </span>
    </div>
  );
}

export function CustomerRiskScore({ customerId, riskLevel, riskScore, riskFactors, scoredAt, onRefresh }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [rescoring, setRescoring] = useState(false);

  const rescore = async () => {
    setRescoring(true);
    const { error } = await supabase.rpc("calculate_customer_risk_score", {
      p_customer_id: customerId,
    });
    if (error) {
      toast.error("Re-score failed: " + error.message);
    } else {
      toast.success("Risk score updated");
      onRefresh?.();
    }
    setRescoring(false);
  };

  const level = riskLevel ?? "low";
  const factors = riskFactors;

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/20 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className="text-center">
            <div className="text-2xl font-bold font-mono text-foreground">{riskScore}</div>
            <div className="text-[10px] text-muted-foreground">/ 100</div>
          </div>
          <div>
            <span className={cn("text-xs px-2 py-0.5 rounded border font-bold capitalize", LEVEL_COLORS[level])}>
              {level} risk
            </span>
            {scoredAt && (
              <div className="text-[10px] text-muted-foreground mt-1">
                Scored {new Date(scoredAt).toLocaleDateString("en-GB")}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={e => { e.stopPropagation(); rescore(); }}
            disabled={rescoring}
            className="p-1.5 rounded hover:bg-muted transition-colors"
            title="Re-calculate score"
          >
            <RefreshCw className={cn("w-3.5 h-3.5 text-muted-foreground", rescoring && "animate-spin")} />
          </button>
          {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </div>

      {/* Factor breakdown */}
      {expanded && factors && (
        <div className="border-t border-border p-4 space-y-3 bg-muted/10">
          {[
            {
              label: "Geography",
              factor: factors.geography,
              detail: factors.geography?.reason,
            },
            {
              label: "PEP status",
              factor: factors.pep_status,
              detail: factors.pep_status?.reason,
            },
            {
              label: "Customer type",
              factor: factors.customer_type,
              detail: factors.customer_type?.type,
            },
            {
              label: "KYC status",
              factor: factors.kyc_status,
              detail: factors.kyc_status?.status,
            },
            {
              label: "Screening history",
              factor: factors.screening_history,
              detail: factors.screening_history?.matches_90d != null
                ? `${factors.screening_history.matches_90d} matches (90d), ${factors.screening_history.high_confidence_matches} high-confidence`
                : undefined,
            },
            {
              label: "Transaction behaviour",
              factor: factors.transaction_behaviour,
              detail: factors.transaction_behaviour?.transactions_90d != null
                ? `${factors.transaction_behaviour.transactions_90d} txns, ${factors.transaction_behaviour.flagged_count} flagged`
                : undefined,
            },
          ].map(({ label, factor, detail }) => {
            if (!factor) return null;
            const factorLevel = factor.score >= factor.max * 0.75 ? "critical"
              : factor.score >= factor.max * 0.5 ? "high"
              : factor.score >= factor.max * 0.25 ? "medium" : "low";
            return (
              <div key={label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-medium text-foreground">{label}</span>
                  {detail && <span className="text-[10px] text-muted-foreground truncate max-w-[180px]">{detail}</span>}
                </div>
                <ScoreBar score={factor.score} max={factor.max} level={factorLevel} />
              </div>
            );
          })}

          <div className="pt-2 border-t border-border">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground">Total score</span>
              <span className="text-xs font-mono font-bold text-foreground">{riskScore} / 100</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// ─────────────────────────────────────────────────────────────────────────────
// QUERY MIGRATION GUIDE
// ─────────────────────────────────────────────────────────────────────────────
//
// After running both SQL migrations, update every suite page to use organisation_id
// instead of user_id. The useOrganisation() hook provides orgId.
//
// PATTERN:
//
//   // OLD (user-scoped, single user only):
//   const { data: { user } } = await supabase.auth.getUser();
//   const { data } = await supabase
//     .from("suite_customers")
//     .select("*")
//     .eq("user_id", user.id);
//
//   // NEW (org-scoped, full team shares data):
//   const { orgId, userId } = useOrganisation();
//   const { data } = await supabase
//     .from("suite_customers")
//     .select("*")
//     .eq("organisation_id", orgId);
//
// For INSERTS, set both fields:
//   await supabase.from("suite_customers").insert({
//     organisation_id: orgId,   // ← shared with team
//     user_id: userId,           // ← who created it (for audit)
//     name: form.name,
//     ...
//   });
//
// Files to update (search for ".eq(\"user_id\""):
//   src/pages/suite/SuiteDashboard.tsx
//   src/pages/suite/SuiteScreening.tsx
//   src/pages/suite/SuiteOnboarding.tsx
//   src/pages/suite/SuiteAlerts.tsx
//   src/pages/suite/SuiteAlertRules.tsx
//   src/pages/suite/SuiteCases.tsx
//   src/pages/suite/SuiteTransactions.tsx
//   src/pages/suite/SuiteRisk.tsx
//   src/pages/suite/SuiteAudit.tsx
//   src/pages/suite/SuiteIDV.tsx
//   supabase/functions/evaluate-transactions/index.ts
//
// RISK SCORE DISPLAY — add to SuiteOnboarding detail panel:
//
//   import { CustomerRiskScore } from "@/components/suite/CustomerRiskScore";
//
//   // In the customer detail slide-out, after the risk level buttons:
//   <CustomerRiskScore
//     customerId={selected.id}
//     riskLevel={selected.risk_level}
//     riskScore={selected.risk_score ?? 0}
//     riskFactors={selected.risk_score_factors ?? null}
//     scoredAt={selected.risk_scored_at ?? null}
//     onRefresh={fetchCustomers}
//   />
//
// RISK SCORE IN SUITERISK PAGE:
//   Query suite_customers ordered by risk_score DESC to show the highest-risk
//   customers at the top. The risk_score_factors column gives you the full
//   breakdown for a detailed risk register view.
