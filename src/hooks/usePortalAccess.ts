import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type PortalKey = "academy" | "partner" | "business" | "suite" | "screening" | "admin";

export interface PortalAccess {
  isLoading: boolean;
  signedIn: boolean;
  /** Academy learners — open business model: any signed-in, non-rejected account. */
  academyAccess: boolean;
  /** Approved + activated partner record required. */
  partnerAccess: boolean;
  /** Business buyer — an owned or member business account. */
  businessAccess: boolean;
  /** Suite compliance platform — subscription tier or org membership. */
  suiteAccess: boolean;
  /** Internal WorldAML staff (user_roles.role = 'admin'). */
  adminAccess: boolean;
  /** Number of non-admin workspaces the user can enter. */
  portals: PortalKey[];
  has: (portal: PortalKey) => boolean;
}


/**
 * Single source of truth for portal entitlements.
 * One Supabase auth identity → multiple independent entitlements.
 * Entitlements are derived from server-side data (user_roles, partners, profiles)
 * and every underlying table is RLS-protected, so this is safe as a UI gate on top
 * of the database-level authorisation.
 */
export function usePortalAccess(): PortalAccess {
  const { user, isLoading: authLoading, isAdmin, profile, profileLoading } = useAuth();

  const partnerQuery = useQuery({
    queryKey: ["portal-access", "partner", user?.id],
    enabled: !!user,
    staleTime: 60_000,
    queryFn: async (): Promise<boolean> => {
      // Authoritative check runs in the database (security definer), so a
      // pending, rejected or suspended partner can never reach /partner/*.
      const { data, error } = await supabase.rpc("has_partner_portal_access" as any, {
        _user_id: user!.id,
      } as any);
      if (error) return false;
      return data === true;
    },
  });

  const businessQuery = useQuery({
    queryKey: ["portal-access", "business", user?.id],
    enabled: !!user,
    staleTime: 60_000,
    queryFn: async (): Promise<boolean> => {
      const { data, error } = await supabase
        .from("business_accounts")
        .select("id")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) return false;
      return !!data;
    },
  });

  const suiteQuery = useQuery({
    queryKey: ["portal-access", "suite", user?.id],
    enabled: !!user,
    staleTime: 60_000,
    queryFn: async (): Promise<boolean> => {
      const { data, error } = await supabase.rpc("current_user_has_suite_access" as any);
      if (error) return false;
      return data === true;
    },
  });

  const signedIn = !!user;
  const isLoading = authLoading || (signedIn && (profileLoading || partnerQuery.isLoading || businessQuery.isLoading || suiteQuery.isLoading));

  const academyAccess = signedIn && profile?.status !== "rejected";
  const partnerAccess = signedIn && partnerQuery.data === true;
  const businessAccess = signedIn && businessQuery.data === true;
  const suiteAccess = signedIn && suiteQuery.data === true;
  const adminAccess = signedIn && isAdmin;

  const portals: PortalKey[] = [];
  if (academyAccess) portals.push("academy");
  if (partnerAccess) portals.push("partner");
  if (businessAccess) portals.push("business");
  if (suiteAccess) portals.push("suite");
  if (adminAccess) portals.push("admin");

  return {
    isLoading,
    signedIn,
    academyAccess,
    partnerAccess,
    businessAccess,
    suiteAccess,
    adminAccess,
    portals,
    // Internal staff (admins) can enter every workspace for support and QA.
    has: (portal) =>
      adminAccess ? true
        : portal === "academy" ? academyAccess
        : portal === "partner" ? partnerAccess
          : portal === "business" ? businessAccess
            : portal === "suite" ? suiteAccess
              : false,
  };
}

export const PORTAL_HOME: Record<PortalKey, string> = {
  academy: "/dashboard",
  partner: "/partner/dashboard",
  business: "/business/dashboard",
  suite: "/suite",
  screening: "/screening",
  admin: "/admin/dashboard",
};

export const PORTAL_LOGIN: Record<PortalKey, string> = {
  academy: "/academy/login",
  partner: "/partner/login",
  business: "/business/login",
  suite: "/login",
  screening: "/login",
  admin: "/admin/login",
};

