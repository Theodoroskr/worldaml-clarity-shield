import { useEffect, useState } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { ArrowLeft, Check, Loader2, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SOLUTION_BY_KEY } from "@/lib/businessCatalogue";
import { useBusinessWorkspace } from "@/hooks/useBusinessWorkspace";

export default function BusinessSolutionDetail() {
  const { key = "" } = useParams();
  const solution = SOLUTION_BY_KEY[key];
  const { ownedKeys, track } = useBusinessWorkspace();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => { if (solution) track("product_detail_viewed", solution.key); }, [solution, track]);

  if (!solution) return <Navigate to="/business/solutions" replace />;

  const owned = ownedKeys.includes(solution.key);

  const buy = async (planKey: string, fn: string, plan: string, extra?: Record<string, unknown>) => {
    setLoading(planKey);
    track("checkout_started", solution.key, { plan });
    try {
      const { data, error } = await supabase.functions.invoke(fn, { body: { plan, ...(extra ?? {}) } });
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch (e) {
      toast({ title: "Checkout failed", description: e instanceof Error ? e.message : "Something went wrong", variant: "destructive" });
    } finally {
      setLoading(null);
    }
  };

  const Icon = solution.icon;

  return (
    <div className="space-y-6 max-w-5xl">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link to="/business/solutions"><ArrowLeft className="mr-1.5 h-4 w-4" /> Explore Solutions</Link>
      </Button>

      <header className="rounded-xl bg-navy text-primary-foreground px-6 py-7">
        <div className="flex items-start gap-3">
          <span className="w-11 h-11 rounded-lg bg-primary-foreground/10 flex items-center justify-center shrink-0">
            <Icon className="w-5 h-5 text-teal" />
          </span>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold">{solution.name}</h1>
              {owned && <Badge className="bg-teal/20 text-teal border-teal/40" variant="outline">Active</Badge>}
            </div>
            <p className="mt-1 text-primary-foreground/75 max-w-2xl">{solution.tagline}</p>
            <p className="mt-2 text-sm text-teal">{solution.outcome}</p>
          </div>
        </div>
      </header>

      <div className="grid md:grid-cols-2 gap-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-base">What it solves</CardTitle></CardHeader>
          <CardContent><ul className="space-y-2">{solution.solves.map((s) => (
            <li key={s} className="flex items-start gap-2 text-sm text-muted-foreground"><Check className="w-4 h-4 text-teal shrink-0 mt-0.5" />{s}</li>
          ))}</ul></CardContent></Card>

        <Card><CardHeader className="pb-2"><CardTitle className="text-base">Key capabilities</CardTitle></CardHeader>
          <CardContent><ul className="space-y-2">{solution.capabilities.map((s) => (
            <li key={s} className="flex items-start gap-2 text-sm text-muted-foreground"><Check className="w-4 h-4 text-teal shrink-0 mt-0.5" />{s}</li>
          ))}</ul></CardContent></Card>

        <Card><CardHeader className="pb-2"><CardTitle className="text-base">Who it is for</CardTitle></CardHeader>
          <CardContent><p className="text-sm text-muted-foreground">{solution.idealFor}</p></CardContent></Card>

        <Card><CardHeader className="pb-2"><CardTitle className="text-base">What's included</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-2">{solution.included.map((s) => (
              <li key={s} className="flex items-start gap-2 text-sm text-muted-foreground"><ShieldCheck className="w-4 h-4 text-teal shrink-0 mt-0.5" />{s}</li>
            ))}</ul>
            {solution.addOns && (
              <p className="mt-3 text-xs text-muted-foreground"><span className="font-medium text-foreground/80">Optional add-ons:</span> {solution.addOns.join(", ")}</p>
            )}
          </CardContent></Card>
      </div>

      <section id="plans" className="space-y-3 scroll-mt-6">
        <h2 className="text-lg font-semibold text-foreground">Plans & pricing</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {solution.plans.map((p) => (
            <Card key={p.key} className="flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{p.name}</CardTitle>
                <p className="text-sm">
                  {p.price ? (
                    <>
                      <span className="text-xl font-bold text-foreground">{p.price}</span>
                      <span className="text-muted-foreground">{p.period ?? ""}</span>
                    </>
                  ) : (
                    <span className="text-muted-foreground">Pricing on request</span>
                  )}
                </p>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col gap-3">
                <p className="text-sm text-muted-foreground">{p.summary}</p>
                <ul className="space-y-1.5">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground"><Check className="w-3.5 h-3.5 text-teal shrink-0 mt-1" />{f}</li>
                  ))}
                </ul>
                <div className="mt-auto pt-2">
                  {p.checkout ? (
                    <Button className="w-full" variant="accent" disabled={loading === p.key}
                      onClick={() => buy(p.key, p.checkout!.fn, p.checkout!.plan)}>
                      {loading === p.key && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {owned ? "Upgrade" : "Buy Now"}
                    </Button>
                  ) : (
                    <Button asChild className="w-full" variant="outline">
                      <Link to={`/business/quotes?product=${encodeURIComponent(solution.name)}&plan=${encodeURIComponent(p.name)}`}>
                        Contact Sales
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Checkout, invoicing and payment methods are handled by our existing secure payment provider. WorldAML never stores card details.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-foreground">FAQ</h2>
        <Accordion type="single" collapsible className="rounded-lg border border-border bg-card px-4">
          {solution.faq.map((f, i) => (
            <AccordionItem key={i} value={`f${i}`}>
              <AccordionTrigger className="text-sm text-left">{f.q}</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </div>
  );
}
