import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface BusinessAccount {
  id: string;
  user_id: string;
  company_name: string;
  work_email: string;
  contact_name: string | null;
  country: string | null;
  industry: string | null;
  phone: string | null;
  company_size: string | null;
  products_of_interest: string[];
  status: string;
  created_at: string;
}

/** Business (product buyer) workspace entitlement — one account per signed-in user. */
export function useBusinessAccount() {
  const { user, isLoading: authLoading } = useAuth();

  const query = useQuery({
    queryKey: ["business-account", user?.id],
    enabled: !!user,
    staleTime: 30_000,
    queryFn: async (): Promise<BusinessAccount | null> => {
      const { data, error } = await supabase
        .from("business_accounts")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return (data as BusinessAccount) ?? null;
    },
  });

  return {
    account: query.data ?? null,
    hasBusinessAccess: !!query.data,
    isLoading: authLoading || (!!user && query.isLoading),
    refetch: query.refetch,
  };
}
