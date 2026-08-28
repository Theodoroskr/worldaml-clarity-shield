import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ScreeningEntitlement {
  isLoading: boolean;
  isAuthenticated: boolean;
  hasAccess: boolean;
  isAdmin: boolean;
  plan: string | null;
  status: string | null;
  monitoredEntityQuota: number | null;
  currentPeriodEnd: string | null;
  refresh: () => Promise<void>;
}

/**
 * Entitlement for the standalone WorldAML Screening & Monitoring workspace.
 * Access comes from an active screening subscription (or admin/enterprise),
 * never from simply being signed in.
 */
export function useScreeningAccess(): ScreeningEntitlement {
  const [state, setState] = useState<Omit<ScreeningEntitlement, "refresh">>({
    isLoading: true,
    isAuthenticated: false,
    hasAccess: false,
    isAdmin: false,
    plan: null,
    status: null,
    monitoredEntityQuota: null,
    currentPeriodEnd: null,
  });

  const resolve = useCallback(async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      setState({
        isLoading: false,
        isAuthenticated: false,
        hasAccess: false,
        isAdmin: false,
        plan: null,
        status: null,
        monitoredEntityQuota: null,
        currentPeriodEnd: null,
      });
      return;
    }

    const { data } = await supabase.rpc("current_user_screening_entitlement");
    const row = Array.isArray(data) ? data[0] : null;

    setState({
      isLoading: false,
      isAuthenticated: true,
      hasAccess: !!row?.has_access,
      plan: row?.plan ?? null,
      status: row?.status ?? null,
      monitoredEntityQuota: row?.monitored_entity_quota ?? null,
      currentPeriodEnd: row?.current_period_end ?? null,
    });
  }, []);

  useEffect(() => {
    let mounted = true;
    void resolve();
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      if (mounted) void resolve();
    });
    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [resolve]);

  return { ...state, refresh: resolve };
}
