import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useBusinessAccount, BusinessAccount } from "@/hooks/useBusinessAccount";

export interface BusinessEntitlement {
  id: string;
  business_account_id: string;
  product_key: string;
  plan: string | null;
  status: string;
  activated_at: string | null;
  renews_at: string | null;
  usage_used: number | null;
  usage_limit: number | null;
  usage_unit: string | null;
  seats: number | null;
  setup_complete: boolean;
}

export interface BusinessMember {
  id: string;
  business_account_id: string;
  user_id: string | null;
  email: string;
  full_name: string | null;
  job_title: string | null;
  role: string;
  status: string;
  products: string[];
  academy_seat: boolean;
  created_at: string;
}

export const BUSINESS_ROLE_LABEL: Record<string, string> = {
  business_admin: "Business Admin",
  billing_admin: "Billing Admin",
  user: "User",
};

/**
 * Business workspace state: company account, owned products, team.
 * Every query is RLS-scoped to the caller's own company.
 */
export function useBusinessWorkspace() {
  const { user } = useAuth();
  const { account, isLoading: accountLoading, refetch: refetchAccount } = useBusinessAccount();
  const queryClient = useQueryClient();
  const accountId = account?.id;

  const entitlements = useQuery({
    queryKey: ["business-entitlements", accountId],
    enabled: !!accountId,
    staleTime: 30_000,
    queryFn: async (): Promise<BusinessEntitlement[]> => {
      const { data, error } = await supabase
        .from("business_entitlements")
        .select("*")
        .eq("business_account_id", accountId!)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as BusinessEntitlement[];
    },
  });

  const members = useQuery({
    queryKey: ["business-members", accountId],
    enabled: !!accountId,
    staleTime: 30_000,
    queryFn: async (): Promise<BusinessMember[]> => {
      const { data, error } = await supabase
        .from("business_members")
        .select("*")
        .eq("business_account_id", accountId!)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as BusinessMember[];
    },
  });

  /** Internal commercial tracking — never surfaced to the customer. */
  const track = useCallback(
    async (event_type: string, product_key?: string, metadata: Record<string, unknown> = {}) => {
      if (!user) return;
      try {
        await supabase.from("business_events").insert({
          business_account_id: accountId ?? null,
          user_id: user.id,
          event_type,
          product_key: product_key ?? null,
          metadata: metadata as never,
        });
      } catch {
        /* tracking must never break the UI */
      }
    },
    [user, accountId],
  );

  const active = (entitlements.data ?? []).filter((e) => e.status === "active" || e.status === "trialing");
  const isOwner = !!account && account.user_id === user?.id;
  const selfMember = (members.data ?? []).find((m) => m.user_id === user?.id);
  const isBusinessAdmin = isOwner || selfMember?.role === "business_admin" || selfMember?.role === "billing_admin";

  return {
    account: account as BusinessAccount | null,
    entitlements: entitlements.data ?? [],
    activeEntitlements: active,
    ownedKeys: active.map((e) => e.product_key),
    hasProducts: active.length > 0,
    members: members.data ?? [],
    isBusinessAdmin,
    isOwner,
    isLoading: accountLoading || entitlements.isLoading || members.isLoading,
    track,
    refresh: () => {
      refetchAccount();
      queryClient.invalidateQueries({ queryKey: ["business-entitlements", accountId] });
      queryClient.invalidateQueries({ queryKey: ["business-members", accountId] });
    },
  };
}
