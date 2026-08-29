import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, Search, Sparkles, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useScreeningAccess } from "@/hooks/useScreeningAccess";
import { useScreeningQuota } from "@/hooks/useScreeningQuota";

/**
 * Self-serve activation and status page for the free Screening Demo plan.
 * Grants the 5-search demo entitlement instantly for the signed-in business
 * account — no sales conversation, no payment card.
 */
export default function BusinessScreeningDemo() {
  const { isLoading, hasAccess, plan, refresh } = useScreeningAccess();
  const quota = useScreeningQuota();
  const { toast } = useToast();
  const [activating, setActivating] = useState(false);
  const [justActivated, setJustActivated] = useState(false);
  const started = useRef(false);

  const activate = async () => {
    setActivating(true);
    try {
      const { error } = await supabase.functions.invoke("claim-screening-demo", { body: {} });
      if (error) throw error;
      await refresh();
      await quota.refresh();
      setJustActivated(true);
    } catch (e) {
      toast({
        title: "Activation failed",
        description: e instanceof Error ? e.message : "Please try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setActivating(false);
    }
  };

  // Activate on first visit when the account has no screening entitlement yet.
  useEffect(() => {
    if (isLoading || hasAccess || started.current) return;
    started.current = true;
    void activate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, hasAccess]);

  const isDemo = plan === "demo";
  const searchQuota = quota.searchQuota ?? 5;
  const used = quota.searchesUsed ?? 0;
  const remaining = Math.max(0, searchQuota - used);
  const pct = searchQuota > 0 ? Math.min(100, (used / searchQuota) * 100) : 0;
  const busy = isLoading || activating;

  return (
    <div className="space-y-6 max-w-4xl">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link to="/business/solutions/worldaml#plans">
          <ArrowLeft className="mr-1.5 h-4 w-4" /> Screening plans
        </Link>
      </Button>

      <header className="rounded-xl bg-navy text-primary-foreground px-6 py-7">
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-2xl font-bold">Free Screening Demo</h1>
          {hasAccess && (
            <Badge variant="outline" className="bg-teal/20 text-teal border-teal/40">
              {isDemo ? "Demo active" : `${plan} plan active`}
            </Badge>
          )}
        </div>
        <p className="mt-1 text-primary-foreground/75 max-w-2xl">
          Five screening searches against sanctions, PEP and watchlist data. No payment card, no
          sales call — activated instantly on your business account.
        </p>
      </header>

      {busy ? (
        <Card>
          <CardContent className="py-10 flex items-center justify-center gap-3 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            {activating ? "Activating your 5 free screenings…" : "Checking your access…"}
          </CardContent>
        </Card>
      ) : hasAccess ? (
        <>
          {justActivated && (
            <Alert className="border-teal/40 bg-teal/5">
              <CheckCircle2 className="h-4 w-4 text-teal" />
              <AlertTitle>Demo activated</AlertTitle>
              <AlertDescription>
                Your workspace is ready. Start screening straight away.
              </AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Your screening allowance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-3xl font-bold text-foreground">
                    {quota.loading ? "—" : remaining}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    searches remaining of {searchQuota}
                  </p>
                </div>
                <Button asChild variant="accent">
                  <Link to="/screening">
                    <Search className="mr-2 h-4 w-4" /> Start screening
                  </Link>
                </Button>
              </div>
              <Progress value={pct} />
              {remaining === 0 && (
                <Alert>
                  <Sparkles className="h-4 w-4" />
                  <AlertTitle>Demo searches used</AlertTitle>
                  <AlertDescription className="flex flex-wrap items-center gap-3">
                    Upgrade to a paid plan to keep screening and switch on ongoing monitoring.
                    <Button asChild size="sm" variant="accent">
                      <Link to="/business/solutions/worldaml#plans">
                        See plans <ArrowRight className="ml-1.5 h-4 w-4" />
                      </Link>
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="py-8 space-y-4 text-center">
            <p className="text-muted-foreground">
              Activate the free demo to get 5 screening searches on this account.
            </p>
            <Button variant="accent" onClick={() => void activate()}>
              <Sparkles className="mr-2 h-4 w-4" /> Start Free Demo
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Info className="h-4 w-4 text-teal" /> How the free demo works
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• 5 screening searches in total, granted once per organisation.</li>
            <li>• Unused searches do not roll over and cannot be topped up — they expire with the demo period.</li>
            <li>• Ongoing monitoring, bulk screening and API access are not included on the demo.</li>
            <li>• One user seat. Invite teammates after upgrading to a paid plan.</li>
            <li>• Upgrading keeps your searches and cases — the demo allowance is simply replaced by your paid annual allowance.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
