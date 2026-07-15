import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type PartnerRow = {
  id: string;
  user_id: string;
  referral_code: string;
  partner_type: string;
  commission_rate: number;
  is_active: boolean;
  display_name: string | null;
  logo_url: string | null;
  tagline: string | null;
  bio: string | null;
  verticals: string[] | null;
  website_url: string | null;
  certification_level: string | null;
  sandbox_key: string | null;
  academy_seats_granted: number | null;
  commission_lifetime_months: number | null;
  payout_method: string | null;
  notification_prefs: Record<string, boolean> | null;
};

export type CommissionSummary = {
  lifetimeEarned: number;
  paid: number;
  pending: number;
  pipelineValue: number;
  wonDealsValue: number;
  referralConversions: number;
  totalReferrals: number;
};

export function usePartner() {
  const { user, isLoading: authLoading } = useAuth();

  const partnerQuery = useQuery({
    queryKey: ["partner-portal", "partner", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<PartnerRow | null> => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("partners")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return (data as unknown as PartnerRow) ?? null;
    },
  });

  const partnerId = partnerQuery.data?.id ?? null;

  const referralsQuery = useQuery({
    queryKey: ["partner-portal", "referrals", partnerId],
    enabled: !!partnerId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("referrals")
        .select("*")
        .eq("partner_id", partnerId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const dealsQuery = useQuery({
    queryKey: ["partner-portal", "deals", partnerId],
    enabled: !!partnerId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("deal_registrations")
        .select("*")
        .eq("partner_id", partnerId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const payoutsQuery = useQuery({
    queryKey: ["partner-portal", "payouts", partnerId],
    enabled: !!partnerId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("partner_payouts")
        .select("*")
        .eq("partner_id", partnerId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const referrals = referralsQuery.data ?? [];
  const deals = dealsQuery.data ?? [];
  const payouts = payoutsQuery.data ?? [];

  const lifetimeEarned = referrals.reduce(
    (sum: number, r: any) => sum + Number(r.commission_earned || 0),
    0,
  );
  const paid = payouts
    .filter((p: any) => p.status === "paid")
    .reduce((s: number, p: any) => s + Number(p.amount_eur || 0), 0);
  const pending = Math.max(lifetimeEarned - paid, 0);
  const pipelineValue = deals
    .filter((d: any) => ["pending", "approved"].includes(d.status))
    .reduce((s: number, d: any) => s + Number(d.estimated_arr_eur || 0), 0);
  const wonDealsValue = deals
    .filter((d: any) => d.status === "won")
    .reduce((s: number, d: any) => s + Number(d.estimated_arr_eur || 0), 0);
  const referralConversions = referrals.filter((r: any) =>
    ["converted", "paid"].includes(r.status),
  ).length;

  const summary: CommissionSummary = {
    lifetimeEarned,
    paid,
    pending,
    pipelineValue,
    wonDealsValue,
    referralConversions,
    totalReferrals: referrals.length,
  };

  return {
    partner: partnerQuery.data ?? null,
    isLoading:
      authLoading ||
      partnerQuery.isLoading ||
      referralsQuery.isLoading ||
      dealsQuery.isLoading ||
      payoutsQuery.isLoading,
    error: partnerQuery.error,
    referrals,
    deals,
    payouts,
    summary,
    refetch: async () => {
      await Promise.all([
        partnerQuery.refetch(),
        referralsQuery.refetch(),
        dealsQuery.refetch(),
        payoutsQuery.refetch(),
      ]);
    },
  };
}
