import { useAuth } from "@/contexts/AuthContext";
import { useAccess } from "@/hooks/useAccess";
import { useAcademyPurchases } from "@/hooks/useAcademyPurchases";

export interface Entitlements {
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  /** Full WorldAML Suite access (existing useAccess logic). */
  hasSuite: boolean;
  /** Any Academy entitlement beyond the free tier. */
  hasPaidAcademy: boolean;
  subscriptionTier: string;
  /** Short human label for the account badge. */
  planLabel: string;
  firstName: string;
}

/**
 * Single read-only composition of the EXISTING access hooks.
 * No new permission system — this only aggregates what already ships.
 */
export function useEntitlements(): Entitlements {
  const { user, profile, isLoading: authLoading, isAdmin } = useAuth();
  const { isLoading: accessLoading, hasSuiteAccess, subscriptionTier } = useAccess();
  const { purchasedSlugs, hasAnnualPass } = useAcademyPurchases();

  const hasPaidAcademy = hasAnnualPass || purchasedSlugs.size > 0;
  const tier = (subscriptionTier || "free").toLowerCase();

  const planLabel = hasSuiteAccess
    ? "Suite"
    : hasAnnualPass
      ? "Academy Annual Pass"
      : hasPaidAcademy
        ? "Academy Member"
        : tier !== "free"
          ? subscriptionTier
          : "Free Account";

  const fullName = profile?.full_name || user?.user_metadata?.full_name || "";
  const firstName = (fullName as string).trim().split(" ")[0] || (user?.email?.split("@")[0] ?? "there");

  return {
    isLoading: authLoading || accessLoading,
    isAuthenticated: !!user,
    isAdmin,
    hasSuite: hasSuiteAccess,
    hasPaidAcademy,
    subscriptionTier: tier,
    planLabel,
    firstName,
  };
}
