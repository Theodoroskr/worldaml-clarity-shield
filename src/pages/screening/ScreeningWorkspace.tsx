import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Loader2, Lock, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import SEO from "@/components/SEO";
import ScreeningLayout from "@/components/screening/ScreeningLayout";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SuiteScreeningV2 from "@/pages/suite/SuiteScreeningV2";
import { useScreeningAccess } from "@/hooks/useScreeningAccess";
import { useScreeningQuota } from "@/hooks/useScreeningQuota";
import { supabase } from "@/integrations/supabase/client";

/**
 * Standalone WorldAML Screening & Monitoring workspace.
 * Access comes from an active screening subscription. Signed-in users with no
 * subscription are granted the one-time demo plan (5 free searches).
 */
export default function ScreeningWorkspace() {
  const { isLoading, isAuthenticated, hasAccess, plan, refresh } = useScreeningAccess();
  const quota = useScreeningQuota();
  const [searchParams] = useSearchParams();
  const [claiming, setClaiming] = useState(false);
  const [justActivated, setJustActivated] = useState(false);
  const claimedRef = useRef(false);

  useEffect(() => {
    if (isLoading || !isAuthenticated || hasAccess || claimedRef.current) return;
    claimedRef.current = true;
    setClaiming(true);
    void (async () => {
      try {
        await supabase.functions.invoke("claim-screening-demo", { body: {} });
        await refresh();
        setJustActivated(true);
      } catch (err) {
        console.warn("Demo activation failed", err);
      } finally {
        setClaiming(false);
      }
    })();
  }, [isLoading, isAuthenticated, hasAccess, refresh]);

  const busy = isLoading || claiming;
  const isDemo = plan === "demo";
  // Until the demo credits are counted, screening runs stay blocked.
  const provisioning = isDemo && quota.loading;
  const searchQuota = quota.searchQuota ?? 5;
  const used = quota.searchesUsed ?? 0;
  const remaining = Math.max(0, searchQuota - used);

  return (
    <ScreeningLayout
      head={
        <SEO
          title="Screening & Monitoring | WorldAML"
          description="Provider-independent sanctions, PEP, watchlist and adverse media screening workspace with case management and ongoing monitoring."
          noindex
        />
      }
    >
      <>

          {busy ? (
            <div className="flex items-center gap-3 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              {claiming ? "Activating your 5 free screenings…" : "Checking your access…"}
            </div>
          ) : hasAccess ? (
            <>
              {isDemo && (
                <Alert className="mb-6 border-teal/40 bg-teal/5">
                  {justActivated ? (
                    <CheckCircle2 className="h-4 w-4 text-teal" />
                  ) : (
                    <Sparkles className="h-4 w-4 text-teal" />
                  )}
                  <AlertTitle>
                    {justActivated
                      ? `Activated — you have exactly ${searchQuota} free screenings`
                      : `Demo plan — ${searchQuota} free screening searches`}
                  </AlertTitle>
                  <AlertDescription className="space-y-2">
                    <p className="flex flex-wrap items-center gap-2">
                      {provisioning ? (
                        <span className="inline-flex items-center gap-2 font-medium text-foreground">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Provisioning your demo
                          credits… screening runs unlock in a moment.
                        </span>
                      ) : (
                        <span className="font-medium text-foreground">
                          {remaining} of {searchQuota} free screenings remaining
                        </span>
                      )}
                    </p>
                    <p className="flex flex-wrap items-center gap-2">
                      Run real screenings across 1,900+ sanctions, PEP and watchlist sources. Ongoing
                      monitoring and adverse media need a paid package.
                      <Link to="/screening-monitoring/pricing" className="underline font-medium">
                        View packages →
                      </Link>
                    </p>
                  </AlertDescription>
                </Alert>
              )}
              {provisioning ? (
                <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-4 py-6 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Preparing your workspace — screening is disabled until your demo credits are
                  provisioned.
                </div>
              ) : (
                <SuiteScreeningV2 initialQuery={searchParams.get("q") ?? undefined} />
              )}
            </>
          ) : (
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Lock className="h-5 w-5 text-teal" /> Screening & Monitoring is not active yet
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  This workspace is part of WorldAML Screening & Monitoring. Choose a package to activate
                  sanctions, PEP and adverse media screening with ongoing monitoring for your organisation.
                </p>
                <div className="flex gap-3 flex-wrap">
                  <Button asChild variant="accent">
                    <Link to="/screening-monitoring/pricing">
                      View packages <ArrowRight className="ml-1.5 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link to="/contact-sales?product=WorldAML%20Screening%20%26%20Monitoring">Talk to sales</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}
