import { cn } from "@/lib/utils";

/** Shared deal presentation helpers for the Partner Portal (dashboard, deals, register). */

export const DEAL_STAGE_LABEL: Record<string, string> = {
  pending: "Pending Review",
  approved: "Qualified",
  won: "Won",
  lost: "Lost",
  rejected: "Rejected",
  expired: "Expired",
};

const STAGE_TONE: Record<string, string> = {
  pending: "bg-amber-50 text-amber-800 border-amber-200",
  approved: "bg-emerald-50 text-emerald-800 border-emerald-200",
  won: "bg-emerald-600/10 text-emerald-800 border-emerald-300",
  lost: "bg-muted text-muted-foreground border-border",
  rejected: "bg-rose-50 text-rose-800 border-rose-200",
  expired: "bg-rose-50/70 text-rose-700 border-rose-200",
};

export const eur = (n: number) =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);

export const shortDate = (d: string | Date) =>
  new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

/** Muted placeholder so missing data never dominates a row. */
export function NotProvided({ className }: { className?: string }) {
  return <span className={cn("text-muted-foreground/60", className)}>Not provided</span>;
}

export function StageBadge({ status, className }: { status: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium leading-4 whitespace-nowrap",
        STAGE_TONE[status] ?? "bg-muted text-muted-foreground border-border",
        className,
      )}
    >
      {DEAL_STAGE_LABEL[status] ?? status}
    </span>
  );
}

export type ProtectionState = {
  /** Short label, e.g. "82 days remaining" */
  label: string;
  /** Optional caption line, e.g. "Protected until 06 Nov 2026" */
  caption?: string;
  tone: "neutral" | "good" | "warn" | "bad";
  days?: number;
};

export function protectionState(deal: any): ProtectionState {
  const expires = deal?.protection_expires_at;
  if (!expires) {
    if (["won", "lost", "rejected", "expired"].includes(deal?.status)) {
      return { label: "Not applicable", tone: "neutral" };
    }
    return { label: "Pending approval", tone: "warn" };
  }
  const exp = new Date(expires);
  const days = Math.ceil((exp.getTime() - Date.now()) / 86400000);
  if (days < 0) return { label: "Expired", caption: shortDate(exp), tone: "bad", days };
  if (days <= 30)
    return { label: `${days} day${days === 1 ? "" : "s"} remaining`, caption: shortDate(exp), tone: "warn", days };
  return { label: `${days} days remaining`, caption: `Protected until ${shortDate(exp)}`, tone: "good", days };
}

const PROTECTION_TONE: Record<ProtectionState["tone"], string> = {
  neutral: "text-muted-foreground",
  good: "text-emerald-700",
  warn: "text-amber-700",
  bad: "text-rose-700",
};

export function ProtectionCell({ deal, className }: { deal: any; className?: string }) {
  const p = protectionState(deal);
  return (
    <div className={cn("leading-tight", className)}>
      <div className={cn("text-xs font-medium", PROTECTION_TONE[p.tone])}>{p.label}</div>
      {p.caption && <div className="text-[11px] text-muted-foreground/80 mt-0.5">{p.caption}</div>}
    </div>
  );
}

/** Commission estimate from a deal value and the partner's rate. Null when data is missing. */
export function commissionEstimate(value: unknown, rate: unknown): number | null {
  const v = Number(value);
  const r = Number(rate);
  if (!Number.isFinite(v) || v <= 0 || !Number.isFinite(r) || r <= 0) return null;
  return Math.round((v * r) / 100);
}
