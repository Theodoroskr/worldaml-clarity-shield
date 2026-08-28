import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Check, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SOLUTION_BY_KEY } from "@/lib/businessCatalogue";
import { useScreeningAccess } from "@/hooks/useScreeningAccess";

const INTENT_KEY = "worldaml_screening_intent";

/**
 * Public packages block for WorldAML Screening & Monitoring.
 * Same pricing signed in or signed out — read from the single catalogue source.
 * Signed-out buyers register first, then checkout resumes automatically.
 */
export default function AMLPackagesSection() {
  const solution = SOLUTION_BY_KEY["worldaml"];
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isLoading, isAuthenticated, hasAccess, plan: activePlan } = useScreeningAccess();
  const [busy, setBusy] = useState<string | null>(null);

  const startCheckout = async (planKey: string, fn: string, plan: string) => {
    setBusy(planKey);
    try {
      const { data, error } = await supabase.functions.invoke(fn, { body: { plan } });
      if (error) throw error;
      if (data?.url) window.location.href = data.url as string;
    } catch (e) {
      toast({
        title: "Checkout unavailable",
        description: e instanceof Error ? e.message : "Please try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setBusy(null);
    }
  };

  // Resume a checkout the visitor started before registering.
  useEffect(() => {
    if (isLoading || !isAuthenticated) return;
    const pending = sessionStorage.getItem(INTENT_KEY);
    if (!pending) return;
    sessionStorage.removeItem(INTENT_KEY);
    const target = solution?.plans.find((p) => p.key === pending && p.checkout);
    if (target?.checkout) void startCheckout(target.key, target.checkout.fn, target.checkout.plan);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, isAuthenticated]);

  if (!solution) return null;

  const onBuy = (planKey: string, fn: string, plan: string) => {
    if (!isAuthenticated) {
      sessionStorage.setItem(INTENT_KEY, planKey);
      navigate(`/signup?redirect=${encodeURIComponent("/screening-monitoring/pricing")}`);
      return;
    }
    void startCheckout(planKey, fn, plan);
  };

  return (
    <section id="packages" className="py-16 bg-muted/30 scroll-mt-20">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-10">
          <Badge variant="outline" className="mb-3 border-teal/40 text-teal">Packages</Badge>
          <h2 className="text-3xl font-bold text-foreground">Choose your screening package</h2>
          <p className="mt-3 text-muted-foreground">
            Public pricing, no hidden tiers. Buy online and your screening workspace is provisioned
            immediately — the same price whether you are signed in or not.
          </p>
        </div>

        {hasAccess && (
          <div className="max-w-3xl mx-auto mb-8 rounded-lg border border-teal/40 bg-teal/5 px-4 py-3 text-sm flex items-center justify-between gap-3 flex-wrap">
            <span className="text-foreground">
              Your organisation already has screening access{activePlan ? ` (${activePlan} plan)` : ""}.
            </span>
            <Button asChild size="sm" variant="accent">
              <Link to="/screening">Open workspace <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
            </Button>
          </div>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {solution.plans.map((p) => (
            <Card key={p.key} className="flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{p.name}</CardTitle>
                <p className="text-sm">
                  {p.price ? (
                    <>
                      <span className="text-2xl font-bold text-foreground">{p.price}</span>
                      <span className="text-muted-foreground">{p.period ?? ""}</span>
                    </>
                  ) : (
                    <span className="text-muted-foreground">Pricing on request</span>
                  )}
                </p>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col gap-4">
                <p className="text-sm text-muted-foreground">{p.summary}</p>
                <ul className="space-y-1.5">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="w-3.5 h-3.5 text-teal shrink-0 mt-1" />{f}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-2">
                  {p.checkout ? (
                    <Button
                      className="w-full"
                      variant="accent"
                      disabled={busy === p.key}
                      onClick={() => onBuy(p.key, p.checkout!.fn, p.checkout!.plan)}
                    >
                      {busy === p.key && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {isAuthenticated ? "Buy now" : "Register & buy"}
                    </Button>
                  ) : (
                    <Button asChild className="w-full" variant="outline">
                      <Link to={`/contact-sales?product=${encodeURIComponent(solution.name)}&plan=${encodeURIComponent(p.name)}`}>
                        Contact Sales
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="max-w-3xl mx-auto mt-10 rounded-xl border border-border bg-card p-6">
          <h3 className="text-base font-semibold text-foreground">What you get on day one</h3>
          <ul className="mt-3 grid sm:grid-cols-2 gap-2">
            {[
              "Access to the screening workspace at /screening",
              "Your organisation workspace with team invites",
              "Default screening policy and match thresholds",
              "Ongoing monitoring with alerts on status changes",
              "REST API access for real-time and batch screening",
              "Audit-ready evidence on every match decision",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                <Check className="w-4 h-4 text-teal shrink-0 mt-0.5" />{item}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-muted-foreground">
            Payments are processed by our secure payment provider. WorldAML never stores card details.
          </p>
        </div>
      </div>
    </section>
  );
}
