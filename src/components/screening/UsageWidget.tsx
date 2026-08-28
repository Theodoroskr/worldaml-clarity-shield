import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import { useScreeningQuota } from "@/hooks/useScreeningQuota";

function pct(used: number | null, quota: number | null) {
  if (quota == null || used == null) return null;
  if (quota <= 0) return 100;
  return Math.min(100, Math.round((used / quota) * 100));
}

export function UsageWidget() {
  const q = useScreeningQuota();

  if (q.loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </CardContent>
      </Card>
    );
  }

  const rows = [
    { label: "Annual searches", used: q.searchesUsed ?? 0, quota: q.searchQuota, over: q.searchesExceeded },
    { label: "Monitored entities", used: q.monitorsUsed ?? 0, quota: q.monitorQuota, over: q.monitorsExceeded },
    { label: "Team seats", used: q.seatsUsed ?? 0, quota: q.seatQuota, over: q.seatsExceeded },
  ];
  const anyExceeded = q.searchesExceeded || q.monitorsExceeded;

  return (
    <Card>
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-base font-semibold">Plan usage</CardTitle>
        <span className="text-xs text-muted-foreground capitalize">{q.plan ?? "Demo"}</span>
      </CardHeader>
      <CardContent className="space-y-4">
        {rows.map((row) => {
          const p = pct(row.used, row.quota);
          const unlimited = row.quota == null;
          return (
            <div key={row.label} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>{row.label}</span>
                <span className={row.over ? "text-destructive font-medium" : "text-muted-foreground"}>
                  {unlimited ? "Unlimited" : `${row.used} / ${row.quota}`}
                </span>
              </div>
              {!unlimited && p !== null && (
                <Progress
                  value={p}
                  className={`h-2 ${row.over ? "[&>div]:bg-destructive" : ""}`}
                />
              )}
            </div>
          );
        })}

        {anyExceeded && (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
            <p className="flex items-start gap-2 font-medium">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              {q.searchesExceeded
                ? "Annual search allowance used up — new screenings are blocked."
                : "Monitored entity allowance used up — no new subjects can be monitored."}
            </p>
            <Button asChild size="sm" variant="accent" className="mt-2 w-full">
              <Link to="/screening-monitoring/pricing">Upgrade plan</Link>
            </Button>
          </div>
        )}

        {q.currentPeriodEnd && (
          <p className="text-xs text-muted-foreground">
            Renews {new Date(q.currentPeriodEnd).toLocaleDateString()}
          </p>
        )}
        <Button variant="outline" size="sm" className="w-full" asChild>
          <Link to="/screening/team">Manage team seats</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
