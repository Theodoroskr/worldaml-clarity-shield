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
        if (mounted) {
          setFlags({
            isLoading: false,
            isAuthenticated: false,
            isAdmin: false,
            hasSuiteAccess: false,
            subscriptionTier: "free",
          });
        }
        return;
      }

      // Fetch profile, role and product access in parallel — use user_id (not id)
      const [profileRes, roleRes, productRes] = await Promise.all([
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
        supabase
          .from("product_access")
          .select("product, status")
          .in("product", ["suite", "screening"]),
      ]);

      const tier = (profileRes.data as any)?.subscription_tier ?? "free";
      const isAdmin = !!roleRes.data;
      const hasProductAccess = (product: string) =>
        (productRes.data ?? []).some(
          (row: any) => row.product === product && (row.status === "active" || row.status === "trial")
        );
      const hasSuiteAccess = isAdmin || tier === "suite" || tier === "enterprise" || hasProductAccess("suite") || hasProductAccess("screening");

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
