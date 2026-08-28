import { Link } from "react-router-dom";
import { Check, Minus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  SCREENING_PLANS,
  SCREENING_API_PLANS,
  SCREENING_API_INTRO,
  type ScreeningPlanDefinition,
} from "@/lib/screeningPlans";

const yearly = (p: ScreeningPlanDefinition) => {
  if (p.priceDisplay) return p.priceDisplay;
  if (p.priceCents == null) return "Custom";
  if (p.priceCents === 0) return "Free";
  return `€${(p.priceCents / 100).toLocaleString("en-GB")}`;
};

const qty = (v: number | null) => (v == null ? "Negotiated" : v.toLocaleString("en-GB"));

/**
 * Side-by-side annual comparison of the Screening & Monitoring packages,
 * split into the Platform and API-only lanes. Reads from the single plan source.
 */
export default function ScreeningPlanComparison() {
  const Table = ({
    plans,
    searchLabel,
    showSeats,
  }: {
    plans: ScreeningPlanDefinition[];
    searchLabel: string;
    showSeats: boolean;
  }) => (
    <div className="max-w-6xl mx-auto overflow-x-auto rounded-xl border border-border bg-card">
      <table className="w-full min-w-[760px] text-sm">
        <caption className="sr-only">
          Annual price, included searches, monitored entities and seats per package
        </caption>
        <thead>
          <tr className="border-b border-border">
            <th scope="col" className="p-4 text-left font-medium text-muted-foreground">
              Package
            </th>
            {plans.map((p) => (
              <th key={p.key} scope="col" className="p-4 text-left align-bottom">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">{p.name}</span>
                  {p.popular && (
                    <Badge variant="outline" className="border-teal/40 text-teal">
                      Most Popular
                    </Badge>
                  )}
                </div>
                <div className="mt-1 text-lg font-bold text-foreground">{yearly(p)}</div>
                <div className="text-xs text-muted-foreground">
                  {p.priceCents ? "per year" : "\u00a0"}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-border/60">
            <th scope="row" className="p-4 text-left font-medium text-foreground">
              {searchLabel}
              <span className="ml-1 text-xs font-normal text-muted-foreground">(per year)</span>
            </th>
            {plans.map((p) => (
              <td key={p.key} className="p-4 text-foreground">
                {qty(p.searchQuotaAnnual)}
              </td>
            ))}
          </tr>
          <tr className="border-b border-border/60">
            <th scope="row" className="p-4 text-left font-medium text-foreground">
              Active monitored entities
            </th>
            {plans.map((p) => (
              <td key={p.key} className="p-4 text-foreground">
                {qty(p.monitorQuota)}
              </td>
            ))}
          </tr>
          {showSeats && (
            <tr className="border-b border-border/60">
              <th scope="row" className="p-4 text-left font-medium text-foreground">
                Users
              </th>
              {plans.map((p) => (
                <td key={p.key} className="p-4 text-foreground">
                  {p.seats == null ? "Negotiated" : p.seats.toLocaleString("en-GB")}
                </td>
              ))}
            </tr>
          )}
          <tr className="border-b border-border/60">
            <th scope="row" className="p-4 text-left font-medium text-foreground">
              Ongoing monitoring
            </th>
            {plans.map((p) => (
              <td key={p.key} className="p-4">
                {p.monitorQuota === 0 ? (
                  <Minus className="h-4 w-4 text-muted-foreground" aria-label="Not included" />
                ) : (
                  <Check className="h-4 w-4 text-teal" aria-label="Included" />
                )}
              </td>
            ))}
          </tr>
          <tr>
            <th scope="row" className="p-4 text-left font-medium text-foreground">
              Get started
            </th>
            {plans.map((p) => (
              <td key={p.key} className="p-4">
                <Button asChild size="sm" variant={p.priceCents ? "accent" : "outline"}>
                  <Link
                    to={
                      p.priceCents == null
                        ? `/contact-sales?product=${encodeURIComponent("WorldAML Screening & Monitoring")}&plan=${encodeURIComponent(p.name)}`
                        : "#packages"
                    }
                  >
                    {p.cta}
                  </Link>
                </Button>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );

  return (
    <section id="compare-plans" className="py-16 scroll-mt-20">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-10">
          <Badge variant="outline" className="mb-3 border-teal/40 text-teal">Compare</Badge>
          <h2 className="text-3xl font-bold text-foreground">
            Screening &amp; Monitoring packages at a glance
          </h2>
          <p className="mt-3 text-muted-foreground">
            All packages are annual subscriptions. Searches are your annual allowance; monitored
            entities are the subjects you can keep under continuous monitoring at any one time.
          </p>
        </div>

        <Tabs defaultValue="platform" className="w-full">
          <TabsList className="mx-auto mb-8 flex w-fit">
            <TabsTrigger value="platform">Platform</TabsTrigger>
            <TabsTrigger value="api">API Only</TabsTrigger>
          </TabsList>

          <TabsContent value="platform">
            <Table plans={SCREENING_PLANS} searchLabel="Screening searches" showSeats />
          </TabsContent>

          <TabsContent value="api">
            <p className="max-w-3xl mx-auto mb-6 text-center text-sm text-muted-foreground">
              {SCREENING_API_INTRO}
            </p>
            <Table
              plans={SCREENING_API_PLANS}
              searchLabel="Production API screening calls"
              showSeats={false}
            />
          </TabsContent>
        </Tabs>

        <p className="max-w-6xl mx-auto mt-4 text-xs text-muted-foreground">
          Allowances are enforced in the workspace and on the API: screening is blocked once the
          annual allowance is used, and monitoring cannot exceed the entities included in your
          package.
        </p>
      </div>
    </section>
  );
}
