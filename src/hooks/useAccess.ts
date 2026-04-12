import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface AccessFlags {
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  hasSuiteAccess: boolean;
  subscriptionTier: string;
}

export function useAccess(): AccessFlags {
  const [flags, setFlags] = useState<AccessFlags>({
    isLoading: true,
    isAuthenticated: false,
    isAdmin: false,
    hasSuiteAccess: false,
    subscriptionTier: "free",
  });

  useEffect(() => {
    let mounted = true;

    const resolve = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        if (mounted) setFlags(f => ({ ...f, isLoading: false }));
        return;
      }

      // Fetch profile + role in parallel — use user_id (not id)
      const [profileRes, roleRes] = await Promise.all([
        supabase
          .from("profiles")
          .select("subscription_tier")
          .eq("user_id", user.id)
          .single(),
        supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .eq("role", "admin")
          .maybeSingle(),
      ]);

      const tier = (profileRes.data as any)?.subscription_tier ?? "free";
      const isAdmin = !!roleRes.data;
      const hasSuiteAccess = isAdmin || tier === "suite" || tier === "enterprise";

      if (mounted) {
        setFlags({
          isLoading: false,
          isAuthenticated: true,
          isAdmin,
          hasSuiteAccess,
          subscriptionTier: tier,
        });
      }
    };

    resolve();

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      resolve();
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  return flags;
}
