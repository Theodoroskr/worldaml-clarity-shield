import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useScreeningAccess } from "@/hooks/useScreeningAccess";

export interface ScreeningQuotaState {
  loading: boolean;
  plan: string | null;
  searchesUsed: number | null;
  monitorsUsed: number | null;
  seatsUsed: number | null;
  searchQuota: number | null;
  monitorQuota: number | null;
  seatQuota: number | null;
  searchesExceeded: boolean;
  monitorsExceeded: boolean;
  seatsExceeded: boolean;
  currentPeriodEnd: string | null;
  refresh: () => Promise<void>;
}

const exceeded = (used: number | null, quota: number | null) =>
  quota != null && (used ?? 0) >= quota;

/**
 * Live annual quota usage for the signed-in organisation.
 * Counts are scoped to the same billing window the backend enforces
 * (the 12 months ending on current_period_end, else the calendar year).
 */
export function useScreeningQuota(): ScreeningQuotaState {
  const {
    isLoading,
    plan,
    searchQuotaAnnual,
    monitorQuota,
    seatQuota,
    seatsUsed,
    currentPeriodEnd,
  } = useScreeningAccess();

  const [usage, setUsage] = useState<{
    searchesUsed: number | null;
    monitorsUsed: number | null;
    loading: boolean;
  }>({ searchesUsed: null, monitorsUsed: null, loading: true });

  const load = useCallback(async () => {
    setUsage((u) => ({ ...u, loading: true }));
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      setUsage({ searchesUsed: null, monitorsUsed: null, loading: false });
      return;
    }

    const { data: orgId } = await supabase.rpc("current_user_org_id");
    if (!orgId) {
      setUsage({ searchesUsed: null, monitorsUsed: null, loading: false });
      return;
    }

    let periodStart: string;
    let periodEnd: string;
    if (currentPeriodEnd) {
      const end = new Date(currentPeriodEnd);
      const start = new Date(end);
      start.setFullYear(start.getFullYear() - 1);
      periodStart = start.toISOString();
      periodEnd = end.toISOString();
    } else {
      periodStart = new Date(new Date().getFullYear(), 0, 1).toISOString();
      periodEnd = new Date().toISOString();
    }

    const [{ count: searchesUsed }, { count: monitorsUsed }] = await Promise.all([
      supabase
        .from("screening_searches")
        .select("id", { count: "exact", head: true })
        .eq("organisation_id", orgId)
        .eq("status", "completed")
        .gte("created_at", periodStart)
        .lte("created_at", periodEnd),
      supabase
        .from("monitoring_subjects")
        .select("id", { count: "exact", head: true })
        .eq("organisation_id", orgId)
        .in("status", ["active", "paused"]),
    ]);

    setUsage({
      searchesUsed: searchesUsed ?? 0,
      monitorsUsed: monitorsUsed ?? 0,
      loading: false,
    });
  }, [currentPeriodEnd]);

  useEffect(() => {
    if (isLoading) return;
    void load();
  }, [isLoading, load]);

  return {
    loading: isLoading || usage.loading,
    plan,
    searchesUsed: usage.searchesUsed,
    monitorsUsed: usage.monitorsUsed,
    seatsUsed,
    searchQuota: searchQuotaAnnual,
    monitorQuota,
    seatQuota,
    searchesExceeded: exceeded(usage.searchesUsed, searchQuotaAnnual),
    monitorsExceeded: exceeded(usage.monitorsUsed, monitorQuota),
    seatsExceeded: exceeded(seatsUsed, seatQuota),
    currentPeriodEnd,
    refresh: load,
  };
}
