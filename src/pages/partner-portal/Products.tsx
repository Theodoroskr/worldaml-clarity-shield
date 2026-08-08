import { Link } from "react-router-dom";
import { PARTNER_PRODUCTS } from "@/data/partnerProducts";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Boxes, ArrowRight } from "lucide-react";

export default function PartnerProducts() {
  return (
    <div className="max-w-6xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-bold text-foreground">Products & Solutions</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Partner briefs — positioning, ideal customer and selling points for each WorldAML solution.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {PARTNER_PRODUCTS.map((p) => (
          <Card key={p.id} className="flex flex-col">
            <CardContent className="p-5 flex-1 flex flex-col">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-teal/10 text-teal flex items-center justify-center shrink-0">
                  <Boxes className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h2 className="font-semibold text-foreground">{p.name}</h2>
                  <p className="text-sm text-muted-foreground mt-0.5">{p.positioning}</p>
                </div>
              </div>

              <dl className="mt-4 space-y-3 text-sm flex-1">
                <div>
                  <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Ideal for</dt>
                  <dd className="text-foreground/90 mt-0.5">{p.idealFor}</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Problem it solves</dt>
                  <dd className="text-foreground/90 mt-0.5">{p.problem}</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Key selling points</dt>
                  <dd className="mt-1">
                    <ul className="space-y-1">
                      {p.sellingPoints.map((s) => (
                        <li key={s} className="flex gap-2 text-foreground/90">
                          <span className="text-teal">•</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </dd>
                </div>
                <div>
                  <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Use cases</dt>
                  <dd className="mt-1 flex flex-wrap gap-1.5">
                    {p.useCases.map((u) => (
                      <span key={u} className="text-xs px-2 py-0.5 rounded border border-border bg-muted/40 text-muted-foreground">
                        {u}
                      </span>
                    ))}
                  </dd>
                </div>
              </dl>

              <div className="flex gap-2 mt-4">
                <Button asChild size="sm">
                  <Link to={`/partner/deals/new?product=${encodeURIComponent(p.name)}`}>
                    Register opportunity <ArrowRight className="ml-1.5 w-3.5 h-3.5" />
                  </Link>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <Link to="/partner/assets">Sales materials</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
