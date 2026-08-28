import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useScreeningAccess } from "@/hooks/useScreeningAccess";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

function pct(used: number | null, quota: number | null) {
  if (quota == null || used == null) return null;
  if (quota <= 0) return 0;
  return Math.min(100, Math.round((used / quota) * 100));
}

interface UsageState {
  searchesUsed: number | null;
  monitorsUsed: number | null;
  loading: boolean;
}

export function UsageWidget() {
  const {
    isLoading,
    plan,
    searchQuotaAnnual,
    monitorQuota,
    seatQuota,
    seatsUsed,
    currentPeriodEnd,
  } = useScreeningAccess();
  const [usage, setUsage] = useState<UsageState>({
    searchesUsed: null,
    monitorsUsed: null,
    loading: true,
  });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setUsage((u) => ({ ...u, loading: true }));
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        setUsage({ searchesUsed: null, monitorsUsed: null, loading: false });
        return;
      }

      const { data: quotaRows } = await supabase.rpc("get_screening_org_quota", { _org_id: "" });
      // The RPC requires an org_id. Resolve org from membership first.
    }
    void load();
    return () => { cancelled = true; };
  }, []);

  if (isLoading || usage.loading) {
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
    { label: "Annual searches", used: usage.searchesUsed ?? 0, quota: searchQuotaAnnual },
    { label: "Monitored entities", used: usage.monitorsUsed ?? 0, quota: monitorQuota },
    { label: "Team seats", used: seatsUsed, quota: seatQuota },
  ];

  return (
    <Card>
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-base font-semibold">Plan usage</CardTitle>
        <span className="text-xs text-muted-foreground capitalize">{plan ?? "Demo"}</span>
      </CardHeader>
      <CardContent className="space-y-4">
        {rows.map((row) => {
          const p = pct(row.used, row.quota);
          const unlimited = row.quota == null;
          return (
            <div key={row.label} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>{row.label}</span>
                <span className="text-muted-foreground">
                  {unlimited ? "Unlimited" : `${row.used ?? 0} / ${row.quota}`}
                </span>
              </div>
              {!unlimited && p !== null && (
                <Progress value={p} className="h-2" />
              )}
            </div>
          );
        })}
        {currentPeriodEnd && (
          <p className="text-xs text-muted-foreground">
            Renews {new Date(currentPeriodEnd).toLocaleDateString()}
          </p>
        )}
        <Button variant="outline" size="sm" className="w-full" asChild>
          <Link to="/screening/team">Manage team seats</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
