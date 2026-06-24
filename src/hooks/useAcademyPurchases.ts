import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const ANNUAL_PASS_SLUG = "__annual_pass__";

/**
 * Returns the set of course slugs the current user has an active paid purchase for,
 * plus a flag indicating whether they hold the annual all-access pass.
 * When `hasAnnualPass` is true, treat every paid course as accessible.
 */
export const useAcademyPurchases = () => {
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ["academy-purchases-all", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("academy_course_purchases")
        .select("course_slug, expires_at")
        .eq("user_id", user!.id)
        .eq("status", "paid");
      if (error) throw error;
      const now = Date.now();
      const slugs = new Set<string>();
      let hasAnnualPass = false;
      (data || []).forEach((row) => {
        const active = !row.expires_at || new Date(row.expires_at).getTime() > now;
        if (!active) return;
        if (row.course_slug === ANNUAL_PASS_SLUG) {
          hasAnnualPass = true;
        } else {
          slugs.add(row.course_slug as string);
        }
      });
      return { slugs, hasAnnualPass };
    },
  });

  return {
    purchasedSlugs: query.data?.slugs ?? new Set<string>(),
    hasAnnualPass: query.data?.hasAnnualPass ?? false,
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
};
