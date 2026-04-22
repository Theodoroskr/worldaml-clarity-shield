import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Returns the set of course slugs the current user has an active paid purchase for.
 * Empty set when the user is signed out.
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
      (data || []).forEach((row) => {
        if (!row.expires_at || new Date(row.expires_at).getTime() > now) {
          slugs.add(row.course_slug as string);
        }
      });
      return slugs;
    },
  });

  return {
    purchasedSlugs: query.data ?? new Set<string>(),
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
};
