import { Gauge, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export type ConfidencePenalty = { code: string; label: string; points: number };

export function SofConfidenceCard({
  score,
  explanation,
  penalties = [],
  minAutoClear,
}: {
  score: number;
  explanation?: string;
  penalties?: ConfidencePenalty[];
  minAutoClear?: number;
}) {
  const tone =
    score >= (minAutoClear ?? 80)
      ? { ring: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-900/30", label: "High confidence" }
      : score >= 50
      ? { ring: "text-amber-600 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-900/30", label: "Moderate confidence" }
      : { ring: "text-red-600 dark:text-red-400", bg: "bg-red-100 dark:bg-red-900/30", label: "Low confidence" };

  return (
    <div className="rounded-md border bg-background p-3 space-y-3">
      <div className="flex items-start gap-3">
        <div className={`shrink-0 rounded-full p-2 ${tone.bg}`}>
          <Gauge className={`w-4 h-4 ${tone.ring}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">AI Confidence</span>
            <Badge variant="outline" className={`text-[10px] ${tone.ring}`}>{tone.label}</Badge>
          </div>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className={`text-2xl font-semibold tabular-nums ${tone.ring}`}>{score}</span>
            <span className="text-xs text-muted-foreground">/ 100</span>
          </div>
          <Progress value={score} className="h-1.5 mt-1" />
        </div>
      </div>

      {explanation && (
        <p className="text-xs text-foreground/90 flex items-start gap-1.5">
          <Info className="w-3 h-3 mt-0.5 shrink-0 text-muted-foreground" />
          <span>{explanation}</span>
        </p>
      )}

      {penalties.length > 0 && (
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1">
            Score deductions
          </div>
          <ul className="space-y-0.5">
            {penalties.map((p, i) => (
              <li key={`${p.code}-${i}`} className="flex justify-between text-xs">
                <span className="text-foreground/80">{p.label}</span>
                <span className="font-mono tabular-nums text-red-600 dark:text-red-400">−{p.points}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
