// Shared risk-level model for the Screening & Monitoring workspace.
// Mirrors the derivation in supabase/functions/_shared/screening/riskAlerts.ts.

export type RiskLevel = "low" | "elevated" | "medium" | "high";

export const RISK_LEVEL_ORDER: Record<RiskLevel, number> = {
  low: 0,
  elevated: 1,
  medium: 2,
  high: 3,
};

export interface RiskCounts {
  sanctions_matches?: number | null;
  pep_matches?: number | null;
  warning_matches?: number | null;
  adverse_media_matches?: number | null;
}

export function deriveRiskLevel(c: RiskCounts): RiskLevel {
  if ((c.sanctions_matches ?? 0) > 0) return "high";
  if ((c.pep_matches ?? 0) > 0 || (c.warning_matches ?? 0) > 0) return "medium";
  if ((c.adverse_media_matches ?? 0) > 0) return "elevated";
  return "low";
}

export const RISK_LEVEL_META: Record<RiskLevel, { label: string; badgeClass: string }> = {
  low: { label: "Low", badgeClass: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30" },
  elevated: { label: "Elevated", badgeClass: "bg-amber-500/15 text-amber-600 border-amber-500/30" },
  medium: { label: "Medium", badgeClass: "bg-orange-500/15 text-orange-500 border-orange-500/30" },
  high: { label: "High", badgeClass: "bg-destructive/15 text-destructive border-destructive/30" },
};
