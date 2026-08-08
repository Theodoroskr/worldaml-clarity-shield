import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowDownRight, ArrowRight, ArrowUpRight, type LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";

export function SectionHeading({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="flex items-baseline gap-3">
      <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{title}</h2>
      {hint && <span className="text-[11px] text-muted-foreground/70">{hint}</span>}
    </div>
  );
}

export interface KpiProps {
  label: string;
  value: string;
  icon: LucideIcon;
  color?: string;
  /** "Lifetime" or "Selected period" — makes the scope explicit. */
  scope?: string;
  /** % change vs the previous equal-length period; null hides the delta. */
  delta?: number | null;
  /** Suppresses the delta when the current period is still running. */
  partial?: boolean;
  spark?: number[];
  path?: string;
  note?: string;
}

export function KpiCard({
  label, value, icon: Icon, color = "text-primary", scope, delta, partial, spark, path, note,
}: KpiProps) {
  const navigate = useNavigate();
  const showDelta = delta !== null && delta !== undefined && !partial;
  const up = (delta ?? 0) > 0;
  const flat = (delta ?? 0) === 0;

  return (
    <Card
      className={cn("border-border transition-shadow", path && "cursor-pointer hover:shadow-md")}
      onClick={() => path && navigate(path)}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-medium text-muted-foreground">{label}</span>
          <Icon className={cn("w-4 h-4", color)} />
        </div>
        <div className="flex items-end justify-between gap-2">
          <div className="min-w-0">
            <span className="text-2xl font-bold text-foreground">{value}</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              {scope && <span className="text-[10px] uppercase tracking-wide text-muted-foreground/70">{scope}</span>}
              {showDelta && (
                <span
                  className={cn(
                    "inline-flex items-center gap-0.5 text-[10px] font-medium",
                    flat ? "text-muted-foreground" : up ? "text-emerald-500" : "text-destructive",
                  )}
                >
                  {flat ? <ArrowRight className="w-3 h-3" /> : up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {up && !flat ? "+" : ""}{delta}%
                </span>
              )}
            </div>
          </div>
          {spark && spark.length > 1 && (
            <div className="h-8 w-16 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={spark.map((v, i) => ({ i, v }))}>
                  <Area
                    type="monotone"
                    dataKey="v"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary) / 0.15)"
                    strokeWidth={1.5}
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
        {note && <p className="text-[10px] text-muted-foreground mt-1.5">{note}</p>}
      </CardContent>
    </Card>
  );
}

/** Horizontal step funnel — every step must come from real, trackable data. */
export function Funnel({ steps }: { steps: { label: string; value: number }[] }) {
  const top = Math.max(1, steps[0]?.value ?? 1);
  return (
    <div className="space-y-2">
      {steps.map((s, i) => {
        const pct = Math.round((s.value / top) * 100);
        const prev = i > 0 ? steps[i - 1].value : null;
        return (
          <div key={s.label}>
            <div className="flex items-baseline justify-between text-xs mb-1">
              <span className="text-foreground">{s.label}</span>
              <span className="text-muted-foreground tabular-nums">
                {s.value.toLocaleString()}
                {prev ? <span className="ml-2 text-[10px]">{Math.round((s.value / Math.max(prev, 1)) * 100)}% of prev</span> : null}
              </span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full bg-primary/70" style={{ width: `${Math.max(pct, 1)}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Compact "top 5" ranking list. */
export function RankList({
  items, empty = "No data for this period",
}: {
  items: { label: string; value: string | number; sub?: string }[];
  empty?: string;
}) {
  if (!items.length) return <p className="text-xs text-muted-foreground py-3">{empty}</p>;
  const max = Math.max(...items.map((i) => (typeof i.value === "number" ? i.value : 0)), 1);
  return (
    <div className="space-y-1.5">
      {items.slice(0, 5).map((it) => (
        <div key={it.label} className="space-y-1">
          <div className="flex items-baseline justify-between gap-3 text-xs">
            <span className="text-foreground truncate">{it.label}</span>
            <span className="text-muted-foreground tabular-nums whitespace-nowrap">
              {typeof it.value === "number" ? it.value.toLocaleString() : it.value}
              {it.sub ? <span className="ml-2 text-[10px]">{it.sub}</span> : null}
            </span>
          </div>
          {typeof it.value === "number" && (
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full bg-primary/50" style={{ width: `${Math.max((it.value / max) * 100, 2)}%` }} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export function Panel({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <Card className="border-border">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          {action}
        </div>
        {children}
      </CardContent>
    </Card>
  );
}
