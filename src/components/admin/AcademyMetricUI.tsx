import { Info, BookOpen } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ACADEMY_DEFINITIONS, ACADEMY_DATA_GAPS } from "@/lib/academyAdmin";

/** Small info icon with the exact calculation behind a KPI. */
export function MetricInfo({ text }: { text: string }) {
  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button type="button" className="text-muted-foreground/70 hover:text-foreground transition-colors">
            <Info className="w-3 h-3" />
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs text-xs leading-relaxed">{text}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/** Consistent KPI card used across all Academy admin pages. */
export function KpiCard({
  label,
  value,
  sub,
  scope,
  info,
  accent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  /** "Lifetime" or the selected period label — prevents contradictory readings. */
  scope?: string;
  info?: string;
  accent?: "emerald" | "amber" | "rose" | "blue" | "violet" | "slate";
}) {
  const color =
    accent === "emerald" ? "text-emerald-500"
    : accent === "amber" ? "text-amber-500"
    : accent === "rose" ? "text-rose-500"
    : accent === "blue" ? "text-blue-500"
    : accent === "violet" ? "text-violet-500"
    : accent === "slate" ? "text-slate-400"
    : "text-foreground";
  return (
    <Card className="p-3 flex flex-col justify-between min-h-[86px]">
      <div className="flex items-start justify-between gap-1">
        <span className="text-xs text-muted-foreground leading-tight">{label}</span>
        {info && <MetricInfo text={info} />}
      </div>
      <div>
        <div className={`text-xl font-semibold tabular-nums ${color}`}>{value}</div>
        {sub && <div className="text-[11px] text-muted-foreground mt-0.5">{sub}</div>}
        {scope && (
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground/70 mt-0.5">
            {scope}
          </div>
        )}
      </div>
    </Card>
  );
}

/** "How these metrics are calculated" link + drawer. */
export function DefinitionsButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={() => setOpen(true)}>
        <BookOpen className="w-3.5 h-3.5 mr-1" />
        How these metrics are calculated
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>How Academy metrics are calculated</DialogTitle>
            <DialogDescription className="text-xs">
              Shared definitions used by Academy Signups, Funnel Metrics, Purchase Status and
              Reconciliation.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {ACADEMY_DEFINITIONS.map((d) => (
              <div key={d.term} className="border-l-2 border-primary/40 pl-3">
                <div className="text-sm font-semibold text-foreground">{d.term}</div>
                <div className="text-xs text-muted-foreground leading-relaxed">{d.detail}</div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
              Not captured today
            </div>
            <ul className="list-disc pl-4 space-y-1">
              {ACADEMY_DATA_GAPS.map((g) => (
                <li key={g} className="text-xs text-muted-foreground">{g}</li>
              ))}
            </ul>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
