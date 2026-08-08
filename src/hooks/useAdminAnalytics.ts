import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { AdminAnalytics, DateRange } from "@/lib/adminAnalytics";

/**
 * One aggregated round-trip per date range instead of ~25 client queries.
 * `admin_analytics` is a read-only SECURITY DEFINER function that rejects
 * anyone without the internal admin role.
 */
export function useAdminAnalytics(range: DateRange, refetchMs = 5 * 60_000) {
  return useQuery({
    queryKey: ["admin-analytics", range.from.toISOString(), range.to.toISOString()],
    staleTime: 60_000,
    refetchInterval: refetchMs,
    queryFn: async (): Promise<AdminAnalytics> => {
      const { data, error } = await (supabase as any).rpc("admin_analytics", {
        _from: range.from.toISOString(),
        _to: range.to.toISOString(),
      });
      if (error) throw error;
      return data as AdminAnalytics;
    },
  });
}
