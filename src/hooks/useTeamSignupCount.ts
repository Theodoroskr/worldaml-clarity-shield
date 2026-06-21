import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface TeamSignupInfo {
  domain: string | null;
  count: number;
  isLoading: boolean;
}

/**
 * Returns the number of signups sharing the current user's company email
 * domain (free webmail domains return 0). Used to surface a "Request team
 * quote" CTA when ≥3 colleagues from the same company have registered.
 */
export function useTeamSignupCount(): TeamSignupInfo {
  const { user } = useAuth();
  const [state, setState] = useState<TeamSignupInfo>({
    domain: null,
    count: 0,
    isLoading: true,
  });

  useEffect(() => {
    let cancelled = false;
    if (!user) {
      setState({ domain: null, count: 0, isLoading: false });
      return;
    }
    (async () => {
      const { data, error } = await supabase.rpc("same_domain_signup_count");
      if (cancelled) return;
      if (error || !data || data.length === 0) {
        setState({ domain: null, count: 0, isLoading: false });
        return;
      }
      const row = data[0] as { domain: string; signup_count: number };
      setState({
        domain: row.domain ?? null,
        count: Number(row.signup_count ?? 0),
        isLoading: false,
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  return state;
}
