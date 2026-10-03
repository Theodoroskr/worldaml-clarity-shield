import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { requirementFor, type SuiteModule } from "@/lib/suite/moduleRoutes";

type Row = { module: string; purchased: boolean; enabled: boolean; member_allowed: boolean };

export const SUITE_MODULES_KEY = ["suite-modules"] as const;

/** Modules the signed-in user can use: purchased + switched on + given to them. */
export function useSuiteModules() {
  const { user, isAdmin } = useAuth();
  const q = useQuery({
    queryKey: [...SUITE_MODULES_KEY, user?.id],
    enabled: !!user,
    staleTime: 30_000,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("current_user_suite_modules");
      if (error) throw error;
      return (data ?? []) as Row[];
    },
  });

  const usable = new Set(
    (q.data ?? []).filter((r) => r.purchased && r.enabled && r.member_allowed).map((r) => r.module),
  );
  const canUse = (m: SuiteModule) => !!isAdmin || usable.has(m);
  const canOpen = (path: string) => {
    const req = requirementFor(path);
    return req === "core" || req.some(canUse);
  };
  return { isLoading: !!user && q.isLoading, canUse, canOpen, refetch: q.refetch };
}
