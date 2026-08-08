import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { usePartner } from "@/hooks/usePartner";

export type CommissionRow = {
  id: string;
  deal_id: string | null;
  referral_id: string | null;
  payout_id: string | null;
  description: string | null;
  currency: string;
  deal_value_cents: number;
  commission_rate: number;
  amount_cents: number;
  status: string;
  earned_on: string;
  approved_at: string | null;
  paid_at: string | null;
};

export type CertificationRequirement = {
  id: string;
  level: string;
  label: string;
  description: string | null;
  required_courses: number;
  required_closed_deals: number;
  required_revenue_cents: number;
  commission_rate: number;
  benefits: string[];
  sort_order: number;
};

export type Specialisation = {
  id: string;
  slug: string;
  label: string;
  status: string;
  progress_percent: number;
  awarded_at: string | null;
};

export type AcademySeat = {
  id: string;
  assigned_email: string | null;
  assigned_name: string | null;
  status: string;
  assigned_at: string | null;
};

export type DealEvent = {
  id: string;
  deal_id: string;
  event_type: string;
  description: string | null;
  created_at: string;
};

export function usePartnerProgramme() {
  const { partner } = usePartner();
  const partnerId = partner?.id;

  const commissions = useQuery({
    queryKey: ["partner-commissions", partnerId],
    enabled: !!partnerId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("partner_commissions")
        .select("*")
        .eq("partner_id", partnerId!)
        .order("earned_on", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as CommissionRow[];
    },
  });

  const certifications = useQuery({
    queryKey: ["partner-certification-requirements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("partner_certification_requirements")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []).map((r: any) => ({
        ...r,
        benefits: Array.isArray(r.benefits) ? r.benefits : [],
      })) as CertificationRequirement[];
    },
  });

  const specialisations = useQuery({
    queryKey: ["partner-specialisations", partnerId],
    enabled: !!partnerId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("partner_specialisations")
        .select("*")
        .eq("partner_id", partnerId!)
        .order("label", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as Specialisation[];
    },
  });

  const seats = useQuery({
    queryKey: ["partner-academy-seats", partnerId],
    enabled: !!partnerId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("partner_academy_seats")
        .select("*")
        .eq("partner_id", partnerId!)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as AcademySeat[];
    },
  });

  return {
    partner,
    partnerId,
    commissions: commissions.data ?? [],
    commissionsLoading: commissions.isLoading,
    certifications: certifications.data ?? [],
    specialisations: specialisations.data ?? [],
    seats: seats.data ?? [],
    isLoading:
      commissions.isLoading || certifications.isLoading || specialisations.isLoading,
  };
}

export function useDealEvents(dealId?: string) {
  return useQuery({
    queryKey: ["partner-deal-events", dealId],
    enabled: !!dealId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("partner_deal_events")
        .select("*")
        .eq("deal_id", dealId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as DealEvent[];
    },
  });
}
