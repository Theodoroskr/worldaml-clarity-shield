import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useRegion } from "@/contexts/RegionContext";
import { AcademyCurrency, REGION_TO_CURRENCY } from "@/lib/academyFx";

/**
 * Thin wrapper around the EXISTING create-academy-checkout / create-academy-annual-checkout
 * edge functions. No new payment system — this only starts a hosted Stripe session and
 * returns the learner to the dashboard afterwards. Technical errors are logged, never shown.
 */
export function useAcademyCheckout() {
  const { toast } = useToast();
  const { region } = useRegion();
  const currency: AcademyCurrency = REGION_TO_CURRENCY[region] ?? "eur";
  const [buyingSlug, setBuyingSlug] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const fail = (err: unknown) => {
    console.error("[academy-checkout]", err);
    toast({
      title: "We couldn't start your checkout",
      description: "Please check your details and try again. If it keeps happening, contact support.",
      variant: "destructive",
    });
  };

  const startCheckout = async (courseSlugs: string[], returnPath: string) => {
    if (courseSlugs.length === 0) return;
    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-academy-checkout", {
        body: { courseSlugs, currency, returnPath },
      });
      if (error) throw error;
      if (!data?.url) throw new Error("No checkout URL returned");
      window.location.href = data.url;
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
    }
  };

  const buyNow = async (slug: string) => {
    setBuyingSlug(slug);
    await startCheckout([slug], `/dashboard/courses/${slug}`);
    setBuyingSlug(null);
  };

  const buyAnnualPass = async () => {
    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-academy-annual-checkout", {
        body: { currency, returnPath: "/dashboard/plans" },
      });
      if (error) throw error;
      if (!data?.url) throw new Error("No checkout URL returned");
      window.location.href = data.url;
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
    }
  };

  return { startCheckout, buyNow, buyAnnualPass, buyingSlug, busy, currency };
}
