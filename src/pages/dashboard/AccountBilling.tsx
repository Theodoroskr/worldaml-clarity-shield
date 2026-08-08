import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Loader2, CreditCard, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppPageHeader } from "@/components/app-shell/AppShellLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useEntitlements } from "@/hooks/useEntitlements";
import { useAcademyPurchases } from "@/hooks/useAcademyPurchases";
import { academyHref } from "@/lib/academyHost";

export default function AccountBilling() {
  const { planLabel, hasSuite, subscriptionTier } = useEntitlements();
  const { purchasedSlugs, hasAnnualPass, isLoading } = useAcademyPurchases();
  const { toast } = useToast();
  const [opening, setOpening] = useState(false);

  const openPortal = async () => {
    setOpening(true);
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
      else throw new Error("No billing portal URL returned");
    } catch (e: any) {
      toast({ title: "Could not open billing portal", description: e.message, variant: "destructive" });
    } finally {
      setOpening(false);
    }
  };

  return (
    <>
      <Helmet><title>Subscription & Billing | WorldAML</title><meta name="robots" content="noindex" /></Helmet>
      <AppPageHeader title="Subscription & Billing" description="Your plans, purchases and invoices." />

      <div className="space-y-4 max-w-2xl">
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-accent" /> Current plan
              <Badge variant="outline" className="text-[10px]">{planLabel}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            {hasSuite ? (
              <p>You have access to WorldAML Suite ({subscriptionTier}).</p>
            ) : (
              <p>You're on the {planLabel.toLowerCase()}. Upgrade any time to unlock Suite compliance tooling.</p>
            )}
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={openPortal} disabled={opening}>
                {opening && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Manage Subscription
              </Button>
              {!hasSuite && <Button asChild size="sm" variant="outline"><a href="/pricing">View Plans</a></Button>}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-3"><CardTitle className="text-base">Academy purchases</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : hasAnnualPass ? (
              <p className="text-muted-foreground">Annual Pass active — all Academy courses are unlocked.</p>
            ) : purchasedSlugs.size === 0 ? (
              <div className="space-y-2">
                <p className="text-muted-foreground">No Academy purchases yet.</p>
                <Button asChild size="sm" variant="outline">
                  <a href={academyHref("/academy")}>Browse Courses <ExternalLink className="h-3 w-3 ml-1.5" /></a>
                </Button>
              </div>
            ) : (
              <ul className="space-y-1">
                {[...purchasedSlugs].map((slug) => (
                  <li key={slug}>
                    <a className="text-accent hover:underline" href={academyHref(`/academy/${slug}`)}>{slug.replace(/-/g, " ")}</a>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
