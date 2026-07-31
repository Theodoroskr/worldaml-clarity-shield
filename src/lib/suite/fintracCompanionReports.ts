/**
 * FINTRAC companion-report detection.
 *
 * An STR rarely travels alone: the same transactions frequently also trigger a
 * Large Cash Transaction Report (LCTR), an Electronic Funds Transfer Report
 * (EFTR), a Large Virtual Currency Transaction Report (LVCTR), a Casino
 * Disbursement Report (CDR) or a Listed Person or Entity Property Report
 * (LPEPR).
 *
 * These heuristics flag likely companion obligations so the reporting officer
 * can confirm them and record a related-report reference on the STR.
 *
 * Reference: FINTRAC — Reporting suspicious transactions to FINTRAC.
 */

import type {
  FINTRACManualFields,
  FINTRACTransaction,
  FINTRACRelatedReport,
} from "@/services/fintracStrExport";

export const FINTRAC_REPORT_TYPES = ["STR", "LCTR", "EFTR", "LVCTR", "CDR", "LPEPR"] as const;
export type FintracReportType = typeof FINTRAC_REPORT_TYPES[number];

export interface CompanionReportHit {
  reportType: FintracReportType;
  label: string;
  reason: string;
  threshold: string;
  transactionIds: string[];
  /** Highest confidence when an explicit amount/type test passed. */
  confidence: "high" | "review";
}

const CAD_THRESHOLD = 10_000;

/** Approximate CAD value — non-CAD amounts are compared at face value and marked "review". */
function isAtOrAboveThreshold(tx: FINTRACTransaction): { hit: boolean; exact: boolean } {
  const amt = Number(tx.amount) || 0;
  const cur = (tx.currency || "CAD").toUpperCase();
  return { hit: amt >= CAD_THRESHOLD, exact: cur === "CAD" };
}

function textOf(tx: FINTRACTransaction): string {
  return [tx.description, tx.direction, tx.counterparty].filter(Boolean).join(" ").toLowerCase();
}

function isCash(tx: FINTRACTransaction): boolean {
  return /\bcash\b|banknote|currency deposit|atm deposit/.test(textOf(tx));
}

function isInternational(tx: FINTRACTransaction, homeCountry = "CA"): boolean {
  const cc = (tx.counterparty_country || "").toUpperCase();
  if (!cc) return /international|swift|cross-?border|wire/.test(textOf(tx));
  return cc !== homeCountry && cc !== "CANADA";
}

function isCasino(tx: FINTRACTransaction): boolean {
  return /casino|chips?|payout|jackpot|disbursement/.test(textOf(tx));
}

/**
 * Detect the companion FINTRAC reports likely triggered by the selected
 * transactions and manual-field context of an STR.
 */
export function detectCompanionReports(
  transactions: FINTRACTransaction[],
  mf: Pick<FINTRACManualFields, "isVirtualCurrency" | "relatedReports" | "tprTerroristEntityName">,
  strType: string,
): CompanionReportHit[] {
  const hits: CompanionReportHit[] = [];
  const push = (h: CompanionReportHit) => {
    if (h.transactionIds.length > 0 || h.confidence === "review") hits.push(h);
  };

  const over = transactions.filter((t) => isAtOrAboveThreshold(t).hit);
  const anyNonCad = over.some((t) => !isAtOrAboveThreshold(t).exact);

  // LCTR — cash received ≥ CAD 10,000 (24-hour rule applies)
  const lctrTxs = over.filter(isCash);
  if (lctrTxs.length > 0) {
    push({
      reportType: "LCTR",
      label: "Large Cash Transaction Report",
      reason: `${lctrTxs.length} cash transaction${lctrTxs.length === 1 ? "" : "s"} at or above the CAD 10,000 threshold${anyNonCad ? " (non-CAD amounts — verify the CAD equivalent)" : ""}.`,
      threshold: "CAD 10,000 cash received (24-hour rule)",
      transactionIds: lctrTxs.map((t) => t.id),
      confidence: anyNonCad ? "review" : "high",
    });
  }

  // EFTR — international EFT ≥ CAD 10,000
  const eftrTxs = over.filter((t) => !isCash(t) && isInternational(t));
  if (eftrTxs.length > 0) {
    push({
      reportType: "EFTR",
      label: "Electronic Funds Transfer Report",
      reason: `${eftrTxs.length} international electronic transfer${eftrTxs.length === 1 ? "" : "s"} at or above CAD 10,000.`,
      threshold: "CAD 10,000 international EFT (24-hour rule)",
      transactionIds: eftrTxs.map((t) => t.id),
      confidence: anyNonCad ? "review" : "high",
    });
  }

  // LVCTR — virtual currency ≥ CAD 10,000
  if (mf.isVirtualCurrency && over.length > 0) {
    push({
      reportType: "LVCTR",
      label: "Large Virtual Currency Transaction Report",
      reason: `Virtual currency flagged on this report with ${over.length} transaction${over.length === 1 ? "" : "s"} at or above CAD 10,000 equivalent.`,
      threshold: "CAD 10,000 virtual currency received (24-hour rule)",
      transactionIds: over.map((t) => t.id),
      confidence: "review",
    });
  }

  // CDR — casino disbursement ≥ CAD 10,000
  const cdrTxs = over.filter(isCasino);
  if (cdrTxs.length > 0) {
    push({
      reportType: "CDR",
      label: "Casino Disbursement Report",
      reason: `${cdrTxs.length} casino disbursement-style transaction${cdrTxs.length === 1 ? "" : "s"} at or above CAD 10,000.`,
      threshold: "CAD 10,000 casino disbursement (24-hour rule)",
      transactionIds: cdrTxs.map((t) => t.id),
      confidence: "review",
    });
  }

  // LPEPR — property of a listed person or entity
  if (strType !== "tpr" && (mf.tprTerroristEntityName || "").trim()) {
    push({
      reportType: "LPEPR",
      label: "Listed Person or Entity Property Report",
      reason: "A listed person or entity is named on this case — property in your control must be reported separately and immediately.",
      threshold: "No monetary threshold — report immediately",
      transactionIds: [],
      confidence: "review",
    });
  }

  // Drop anything already recorded as a related report reference
  const recorded = new Set((mf.relatedReports || []).map((r) => (r.reportType || "").toUpperCase()));
  return hits.filter((h) => !recorded.has(h.reportType));
}

/** Build the related-report row for a detected companion, ready to append. */
export function relatedReportFromHit(hit: CompanionReportHit): FINTRACRelatedReport {
  return {
    reportType: hit.reportType,
    reference: "",
    filedOn: "",
    note: hit.reason,
  };
}
