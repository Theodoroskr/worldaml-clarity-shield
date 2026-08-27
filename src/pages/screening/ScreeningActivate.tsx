import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, Loader2, ArrowRight, KeyRound, Users, Bell } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

interface ActivationResult {
  status: string;
  plan?: string;
  monitored_entity_quota?: number | null;
  current_period_end?: string | null;
}

/**
 * Post-purchase access page: verifies the Stripe session server-side,
 * provisions the workspace and shows the buyer how to get started.
 */
export default function ScreeningActivate() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = params.get("session_id");
  const [state, setState] = useState<"loading" | "ready" | "pending" | "error" | "unauthenticated">("loading");
  const [result, setResult] = useState<ActivationResult | null>(null);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        if (!cancelled) setState("unauthenticated");
        return;
      }
      if (!sessionId) {
        if (!cancelled) setState("error");
        return;
      }

      const { data, error } = await supabase.functions.invoke("verify-worldaml-subscription", {
        body: { session_id: sessionId },
      });

      if (cancelled) return;
      if (error) {
        setState("error");
        return;
      }
      if (data?.status === "active") {
        setResult(data as ActivationResult);
        setState("ready");
      } else {
        setState("pending");
      }
    };

    void run();
    return () => { cancelled = true; };
  }, [sessionId]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO title="Activate Screening | WorldAML" description="Activate your WorldAML Screening & Monitoring subscription." noindex />
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-3xl">
        {state === "loading" && (
          <div className="flex items-center gap-3 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" /> Confirming your subscription…
          </div>
        )}

        {state === "unauthenticated" && (
          <Card>
            <CardHeader><CardTitle>Sign in to finish activation</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Your payment is safe. Sign in with the account you used at checkout and we will link the
                subscription to your workspace.
              </p>
              <Button onClick={() => navigate(`/signup?redirect=${encodeURIComponent(`/screening/activate?session_id=${sessionId ?? ""}`)}`)} variant="accent">
                Sign in or register
              </Button>
            </CardContent>
          </Card>
        )}

        {state === "pending" && (
          <Card>
            <CardHeader><CardTitle>Payment is still processing</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                We have not received confirmation from the payment provider yet. Refresh this page in a
                minute — access is granted automatically once payment clears.
              </p>
              <Button variant="outline" onClick={() => window.location.reload()}>Refresh</Button>
            </CardContent>
          </Card>
        )}

        {state === "error" && (
          <Card>
            <CardHeader><CardTitle>We could not confirm this purchase</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Contact info@worldaml.com with your payment reference and we will activate your workspace.
              </p>
              <Button asChild variant="outline"><Link to="/screening-monitoring/pricing">Back to packages</Link></Button>
            </CardContent>
          </Card>
        )}

        {state === "ready" && (
          <div className="space-y-6">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-8 w-8 text-teal shrink-0" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Your screening workspace is live</h1>
                <p className="mt-1 text-muted-foreground">
                  {result?.plan ? `${result.plan.charAt(0).toUpperCase()}${result.plan.slice(1)} plan` : "Subscription"} activated
                  {result?.monitored_entity_quota ? ` — up to ${result.monitored_entity_quota.toLocaleString()} monitored entities.` : "."}
                </p>
              </div>
            </div>

            <Card>
              <CardHeader><CardTitle className="text-base">Your access details</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 text-teal mt-0.5 shrink-0" />
                  Workspace: <Link to="/screening" className="text-teal underline">worldaml.com/screening</Link>
                </p>
                <p className="flex items-start gap-2">
                  <KeyRound className="h-4 w-4 text-teal mt-0.5 shrink-0" />
                  API access: request and manage keys from your business portal settings.
                </p>
                <p className="flex items-start gap-2">
                  <Bell className="h-4 w-4 text-teal mt-0.5 shrink-0" />
                  Monitoring is on by default for subjects you add to monitoring; alerts reopen the case for review.
                </p>
                <p className="flex items-start gap-2">
                  <Users className="h-4 w-4 text-teal mt-0.5 shrink-0" />
                  Invite colleagues from <Link to="/business/team" className="text-teal underline">Business Portal → Team</Link>.
                </p>
                {result?.current_period_end && (
                  <p className="text-xs">Renews {new Date(result.current_period_end).toLocaleDateString()}.</p>
                )}
              </CardContent>
            </Card>

            <div className="flex gap-3 flex-wrap">
              <Button asChild variant="accent"><Link to="/screening">Go to workspace <ArrowRight className="ml-1.5 h-4 w-4" /></Link></Button>
              <Button asChild variant="outline"><Link to="/business/dashboard">Business dashboard</Link></Button>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
