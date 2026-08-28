import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Loader2, Lock, ArrowRight, Sparkles } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SuiteScreeningV2 from "@/pages/suite/SuiteScreeningV2";
import { useScreeningAccess } from "@/hooks/useScreeningAccess";
import { supabase } from "@/integrations/supabase/client";

/**
 * Standalone WorldAML Screening & Monitoring workspace.
 * Access comes from an active screening subscription. Signed-in users with no
 * subscription are granted the one-time demo plan (5 free searches).
 */
export default function ScreeningWorkspace() {
  const { isLoading, isAuthenticated, hasAccess, plan, refresh } = useScreeningAccess();
  const [searchParams] = useSearchParams();
  const [claiming, setClaiming] = useState(false);
  const claimedRef = useRef(false);

  useEffect(() => {
    if (isLoading || !isAuthenticated || hasAccess || claimedRef.current) return;
    claimedRef.current = true;
    setClaiming(true);
    void (async () => {
      try {
        await supabase.functions.invoke("claim-screening-demo", { body: {} });
        await refresh();
      } catch (err) {
        console.warn("Demo activation failed", err);
      } finally {
        setClaiming(false);
      }
    })();
  }, [isLoading, isAuthenticated, hasAccess, refresh]);

  const busy = isLoading || claiming;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title="Screening & Monitoring | WorldAML"
        description="Provider-independent sanctions, PEP, watchlist and adverse media screening workspace with case management and ongoing monitoring."
        noindex
      />
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        {busy ? (
          <div className="flex items-center gap-3 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            {claiming ? "Activating your 5 free screenings…" : "Checking your access…"}
          </div>
        ) : hasAccess ? (
          <>
            {plan === "demo" && (
              <Alert className="mb-6">
                <Sparkles className="h-4 w-4" />
                <AlertTitle>Demo plan — 5 free screening searches</AlertTitle>
                <AlertDescription className="flex flex-wrap items-center gap-2">
                  Run real screenings across 1,900+ sanctions, PEP and watchlist sources. Ongoing
                  monitoring and adverse media need a paid package.
                  <Link to="/screening-monitoring/pricing" className="underline font-medium">
                    View packages →
                  </Link>
                </AlertDescription>
              </Alert>
            )}
            <SuiteScreeningV2 initialQuery={searchParams.get("q") ?? undefined} />
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
      <Footer />
    </div>
  );
}
