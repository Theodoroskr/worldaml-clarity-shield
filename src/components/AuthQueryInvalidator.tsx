import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Forces a full refresh of user-scoped queries (entitlements, purchases,
 * profile, access flags, etc.) whenever the auth state changes.
 *
 * Without this, react-query keeps serving cached results from before the
 * sign-in — so a user who logs in right after purchasing sees stale
 * "no access" data until they manually reload or log out/in again.
 */
export default function AuthQueryInvalidator() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (
        event === "SIGNED_IN" ||
        event === "SIGNED_OUT" ||
        event === "TOKEN_REFRESHED" ||
        event === "USER_UPDATED"
      ) {
        // Drop all cached queries and force refetch of anything mounted.
        // This ensures Academy purchases, Suite access, profile, roles,
        // etc. reflect the newly-authenticated user immediately.
        queryClient.invalidateQueries();
      }
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  }, [queryClient]);

  return null;
}
