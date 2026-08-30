import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Check, Loader2, ArrowRight, CreditCard, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  SCREENING_PLANS,
  SCREENING_API_PLANS,
  SCREENING_API_INTRO,
  isCheckoutEnabled,
  type ScreeningPlanDefinition,
} from "@/lib/screeningPlans";
import { useScreeningAccess } from "@/hooks/useScreeningAccess";

const INTENT_KEY = "worldaml_screening_intent";
const CHECKOUT_FN = "create-worldaml-checkout";

/**
 * Public packages block for WorldAML Screening & Monitoring.
 * Two separate lanes — Platform and API Only — all prices annual.
 * Checkout only appears once the matching annual Stripe price is mapped.
 */
export default function AMLPackagesSection() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isLoading, isAuthenticated, hasAccess, plan: activePlan } = useScreeningAccess();
  const [busy, setBusy] = useState<string | null>(null);

  const startCheckout = async (planKey: string, plan: string) => {
    setBusy(planKey);
    try {
      const { data, error } = await supabase.functions.invoke(CHECKOUT_FN, { body: { plan } });
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
    const target = [...SCREENING_PLANS, ...SCREENING_API_PLANS].find(
      (p) => p.key === pending && isCheckoutEnabled(p)
    );
    if (target) void startCheckout(target.key, target.checkoutPlan);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, isAuthenticated]);

  const onBuy = (plan: ScreeningPlanDefinition) => {
    // Guest checkout: no login gate. Stripe collects the email at checkout and
    // the subscription is linked to the account on activation.
    void startCheckout(plan.key, plan.checkoutPlan);
  };


  const salesLink = (plan: ScreeningPlanDefinition) =>
    `/contact-sales?product=${encodeURIComponent("WorldAML Screening & Monitoring")}&plan=${encodeURIComponent(plan.name)}`;

  const PlanGrid = ({ plans }: { plans: ScreeningPlanDefinition[] }) => (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
      {plans.map((p) => (
        <Card key={p.key} className={`flex flex-col ${p.popular ? "border-teal/50" : ""}`}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-lg">{p.name}</CardTitle>
              {p.popular && (
                <Badge variant="outline" className="border-teal/40 text-teal">Most Popular</Badge>
              )}
            </div>
            <p className="text-sm">
              {p.priceDisplay ? (
                <>
                  <span className="text-2xl font-bold text-foreground">{p.priceDisplay}</span>
                  <span className="text-muted-foreground">{p.period}</span>
                </>
              ) : (
                <span className="text-muted-foreground">Custom pricing</span>
              )}
            </p>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">{p.summary}</p>
            <ul className="space-y-1.5">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Check className="w-3.5 h-3.5 text-teal shrink-0 mt-1" aria-hidden="true" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <div className="mt-auto pt-2 space-y-2">
              {isCheckoutEnabled(p) ? (
                <>
                  <Button
                    className="w-full"
                    variant="accent"
                    disabled={busy === p.key}
                    onClick={() => onBuy(p)}
                  >
                    {busy === p.key ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <CreditCard className="mr-2 h-4 w-4" aria-hidden="true" />
                    )}
                    Buy now with card
                  </Button>
                  <Button asChild className="w-full" variant="outline">
                    <Link to={salesLink(p)}>
                      <Phone className="mr-2 h-4 w-4" aria-hidden="true" /> Talk to sales
                    </Link>
                  </Button>
                  <p className="text-[11px] text-center text-muted-foreground">
                    Secure card checkout · or get an invoice via sales
                  </p>
                </>
              ) : p.priceCents === 0 ? (
                <>
                  <Button asChild className="w-full" variant="accent">
                    <Link to={isAuthenticated ? "/screening" : "/signup"}>{p.cta}</Link>
                  </Button>
                  <Button asChild className="w-full" variant="outline">
                    <Link to={salesLink(p)}>
                      <Phone className="mr-2 h-4 w-4" aria-hidden="true" /> Talk to sales
                    </Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild className="w-full" variant="accent">
                    <Link to={salesLink(p)}>
                      <Phone className="mr-2 h-4 w-4" aria-hidden="true" />
                      {p.priceCents == null ? p.cta : "Talk to sales"}
                    </Link>
                  </Button>
                  <p className="text-[11px] text-center text-muted-foreground">
                    Card checkout for this package is arranged by our team.
                  </p>
                </>
              )}
            </div>

          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <section id="packages" className="py-16 bg-muted/30 scroll-mt-20">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-10">
          <Badge variant="outline" className="mb-3 border-teal/40 text-teal">Packages</Badge>
          <h2 className="text-3xl font-bold text-foreground">Choose your screening package</h2>
          <p className="mt-3 text-muted-foreground">
            All packages are billed annually. The same public pricing applies whether you are signed
            in or not.
          </p>
        </div>

        {hasAccess && (
          <div className="max-w-3xl mx-auto mb-8 rounded-lg border border-teal/40 bg-teal/5 px-4 py-3 text-sm flex items-center justify-between gap-3 flex-wrap">
            <span className="text-foreground">
              Your organisation already has screening access{activePlan ? ` (${activePlan} plan)` : ""}.
            </span>
            <Button asChild size="sm" variant="accent">
              <Link to="/screening">
                Open workspace <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        )}

        <Tabs defaultValue="platform" className="w-full">
          <TabsList className="mx-auto mb-8 flex w-fit">
            <TabsTrigger value="platform">Platform</TabsTrigger>
            <TabsTrigger value="api">API Only</TabsTrigger>
          </TabsList>

          <TabsContent value="platform">
            <PlanGrid plans={SCREENING_PLANS} />
          </TabsContent>

          <TabsContent value="api">
            <p className="max-w-3xl mx-auto mb-8 text-center text-sm text-muted-foreground">
              {SCREENING_API_INTRO}
            </p>
            <PlanGrid plans={SCREENING_API_PLANS} />
          </TabsContent>
        </Tabs>

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
                <Check className="w-4 h-4 text-teal shrink-0 mt-0.5" aria-hidden="true" />
                <span>{item}</span>
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
