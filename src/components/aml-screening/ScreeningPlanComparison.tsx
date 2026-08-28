import { Link } from "react-router-dom";
import { Check, Minus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SCREENING_PLANS, type ScreeningPlanDefinition } from "@/lib/screeningPlans";

const yearly = (p: ScreeningPlanDefinition) => {
  if (p.priceDisplay) return p.priceDisplay;
  if (p.priceCents == null) return "On request";
  if (p.priceCents === 0) return "Free";
  return `€${(p.priceCents / 100).toLocaleString("en-GB")}`;
};

const qty = (v: number | null) => (v == null ? "Unlimited" : v.toLocaleString("en-GB"));

const ROWS: { label: string; hint?: string; value: (p: ScreeningPlanDefinition) => string }[] = [
  { label: "Included searches", hint: "per year", value: (p) => qty(p.searchQuotaAnnual) },
  { label: "Monitored entities", hint: "concurrent", value: (p) => qty(p.monitorQuota) },
  { label: "User seats", value: (p) => qty(p.seats) },
];

/**
 * Side-by-side yearly comparison of the Screening & Monitoring packages.
 * Reads directly from the single plan source so prices and quotas never drift.
 */
export default function ScreeningPlanComparison() {
  const plans = SCREENING_PLANS;

  return (
    <section id="compare-plans" className="py-16 scroll-mt-20">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-10">
          <Badge variant="outline" className="mb-3 border-teal/40 text-teal">Compare</Badge>
          <h2 className="text-3xl font-bold text-foreground">
            Screening &amp; Monitoring packages at a glance
          </h2>
          <p className="mt-3 text-muted-foreground">
            All packages are billed yearly. Searches are your annual allowance; monitored entities
            are the subjects you can keep under continuous monitoring at any one time.
          </p>
        </div>

        <div className="max-w-6xl mx-auto overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full min-w-[760px] text-sm">
            <caption className="sr-only">
              Yearly price, included searches, monitored entities and seats per package
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
                        <Badge variant="outline" className="border-teal/40 text-teal">Popular</Badge>
                      )}
                    </div>
                    <div className="mt-1 text-lg font-bold text-foreground">{yearly(p)}</div>
                    <div className="text-xs text-muted-foreground">
                      {p.priceCents ? "per year" : p.period || "\u00a0"}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr key={row.label} className="border-b border-border/60">
                  <th scope="row" className="p-4 text-left font-medium text-foreground">
                    {row.label}
                    {row.hint && (
                      <span className="ml-1 text-xs font-normal text-muted-foreground">
                        ({row.hint})
                      </span>
                    )}
                  </th>
                  {plans.map((p) => (
                    <td key={p.key} className="p-4 text-foreground">
                      {row.value(p)}
                    </td>
                  ))}
                </tr>
              ))}
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
                            ? "/contact-sales?product=WorldAML%20Screening%20%26%20Monitoring"
                            : "#packages"
                        }
                      >
                        {p.priceCents == null ? "Contact sales" : "Choose"}
                      </Link>
                    </Button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        <p className="max-w-6xl mx-auto mt-4 text-xs text-muted-foreground">
          Allowances are enforced in the workspace: screening is blocked once the annual search
          allowance is used, and monitoring cannot exceed the entities included in your package.
        </p>
      </div>
    </section>
  );
}
