import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Loader2, ArrowRight, Layers, Fingerprint, Database } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useBusinessAccount } from "@/hooks/useBusinessAccount";

type Plan = {
  name: string;
  price: string;
  period: string;
  features: string[];
  checkout?: { fn: string; plan: string };
  highlight?: boolean;
};

const CATALOGUE: {
  id: string;
  product: string;
  icon: any;
  lane: string;
  description: string;
  plans: Plan[];
}[] = [
  {
    id: "worldaml",
    product: "WorldAML API",
    icon: Layers,
    lane: "WorldAML Platform",
    description: "AML screening and ongoing monitoring across 1,900+ global lists.",
    plans: [
      { name: "Starter", price: "€99", period: "/month", features: ["Up to 2,000 monitored entities", "Full API access", "Email support"], checkout: { fn: "create-worldaml-checkout", plan: "starter" } },
      { name: "Compliance", price: "€495", period: "/month", features: ["Up to 10,000 monitored entities", "Enhanced monitoring", "Priority support"], checkout: { fn: "create-worldaml-checkout", plan: "compliance" }, highlight: true },
      { name: "Enterprise", price: "Custom", period: "", features: ["Unlimited entities", "Dedicated account manager", "SLA guarantees"] },
    ],
  },
  {
    id: "worldid",
    product: "WorldID",
    icon: Fingerprint,
    lane: "WorldAML Platform",
    description: "KYC document authentication and biometric liveness verification.",
    plans: [
      { name: "Starter", price: "€1.50", period: "/ IDV", features: ["Up to 100 verifications/month", "€1,800 billed annually"], checkout: { fn: "create-worldid-checkout", plan: "starter" } },
      { name: "Growth", price: "€1.00", period: "/ IDV", features: ["Up to 400 verifications/month", "€4,800 billed annually"], checkout: { fn: "create-worldid-checkout", plan: "growth" }, highlight: true },
      { name: "Scale", price: "€0.83", period: "/ IDV", features: ["Up to 1,200 verifications/month", "€12,000 billed annually"], checkout: { fn: "create-worldid-checkout", plan: "scale" } },
    ],
  },
  {
    id: "lexisnexis",
    product: "LexisNexis Data",
    icon: Database,
    lane: "Data Source",
    description: "WorldCompliance® screening data and Bridger Insight XG® enterprise deployment.",
    plans: [
      { name: "WorldCompliance®", price: "From €1,750", period: "/year", features: ["2.5M+ profiles, 50+ risk categories", "Unlimited searches", "Multi-user discounts"] },
      { name: "Bridger Insight XG®", price: "Custom", period: "", features: ["Batch processing", "Advanced matching", "Custom SLAs"] },
    ],
  },
];

export default function BusinessCatalogue() {
  const { account } = useBusinessAccount();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  const checkout = async (key: string, fn: string, plan: string) => {
    setLoading(key);
    try {
      const { data, error } = await supabase.functions.invoke(fn, { body: { plan } });
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch (e) {
      toast({ title: "Checkout failed", description: e instanceof Error ? e.message : "Something went wrong", variant: "destructive" });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Welcome, {account?.company_name}</h1>
        <p className="text-muted-foreground">Buy WorldAML products directly, or request a tailored quote.</p>
      </div>

      {CATALOGUE.map((group) => (
        <section key={group.id} className="space-y-3">
          <div className="flex items-center gap-2">
            <group.icon className="w-4 h-4 text-teal" />
            <h2 className="text-lg font-semibold text-foreground">{group.product}</h2>
            <Badge variant="secondary" className="text-[10px]">{group.lane}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">{group.description}</p>
          <div className="grid md:grid-cols-3 gap-4">
            {group.plans.map((plan) => {
              const key = `${group.id}-${plan.name}`;
              return (
                <Card key={key} className={plan.highlight ? "border-teal border-2" : ""}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">{plan.name}</CardTitle>
                    <CardDescription>
                      <span className="text-xl font-bold text-foreground">{plan.price}</span>
                      <span className="text-muted-foreground"> {plan.period}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-2">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <Check className="w-4 h-4 text-teal shrink-0 mt-0.5" />{f}
                        </li>
                      ))}
                    </ul>
                    {plan.checkout ? (
                      <Button
                        className="w-full"
                        variant={plan.highlight ? "accent" : "outline"}
                        disabled={loading === key}
                        onClick={() => checkout(key, plan.checkout!.fn, plan.checkout!.plan)}
                      >
                        {loading === key && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Buy {plan.name}
                      </Button>
                    ) : (
                      <Button asChild className="w-full" variant="outline">
                        <Link to={`/business/quotes?product=${encodeURIComponent(group.product)}&plan=${encodeURIComponent(plan.name)}`}>
                          Request a quote <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
