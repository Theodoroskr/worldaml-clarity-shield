import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Boxes, ArrowRight } from "lucide-react";
import { useBusinessWorkspace } from "@/hooks/useBusinessWorkspace";
import { SOLUTION_BY_KEY } from "@/lib/businessCatalogue";

const fmt = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

export default function BusinessProducts() {
  const { entitlements, isLoading } = useBusinessWorkspace();

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Products</h1>
        <p className="text-muted-foreground">Solutions your organisation currently owns or has access to.</p>
      </div>

      {!isLoading && entitlements.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center space-y-3">
            <Boxes className="w-8 h-8 text-muted-foreground mx-auto" />
            <p className="font-medium text-foreground">No active WorldAML products yet</p>
            <p className="text-sm text-muted-foreground">Explore our solutions to activate screening, identity verification or training.</p>
            <Button asChild variant="accent"><Link to="/business/solutions">Explore Solutions <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {entitlements.map((e) => {
          const sol = SOLUTION_BY_KEY[e.product_key];
          const pct = e.usage_limit && e.usage_used != null ? Math.min(100, Math.round((e.usage_used / e.usage_limit) * 100)) : null;
          return (
            <Card key={e.id}>
              <CardContent className="pt-6 grid md:grid-cols-[1fr_auto] gap-5">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-semibold text-foreground">{sol?.name ?? e.product_key}</h2>
                    <Badge variant="outline" className={e.status === "active" ? "bg-teal/15 text-teal border-teal/30" : ""}>
                      {e.status.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="grid sm:grid-cols-3 gap-3 text-sm">
                    <div><p className="text-xs text-muted-foreground">Plan</p><p className="text-foreground">{e.plan ?? "—"}</p></div>
                    <div><p className="text-xs text-muted-foreground">Activated</p><p className="text-foreground">{fmt(e.activated_at)}</p></div>
                    <div><p className="text-xs text-muted-foreground">Renewal</p><p className="text-foreground">{fmt(e.renews_at)}</p></div>
                  </div>
                  {pct !== null && (
                    <div className="max-w-md">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Usage: {e.usage_used?.toLocaleString()} / {e.usage_limit?.toLocaleString()} {e.usage_unit ?? sol?.usageUnit ?? ""}</span>
                        <span>{pct}%</span>
                      </div>
                      <Progress value={pct} className="h-1.5" />
                    </div>
                  )}
                </div>
                <div className="flex md:flex-col gap-2 md:w-44">
                  {!e.setup_complete ? (
                    <Button asChild variant="accent" size="sm" className="flex-1">
                      <Link to="/business/support">Continue Setup</Link>
                    </Button>
                  ) : sol?.openUrl ? (
                    <Button asChild variant="accent" size="sm" className="flex-1"><Link to={sol.openUrl}>Open Product</Link></Button>
                  ) : null}
                  <Button asChild variant="outline" size="sm" className="flex-1"><Link to="/business/billing">Manage Plan</Link></Button>
                  {sol && (
                    <Button asChild variant="ghost" size="sm" className="flex-1">
                      <Link to={`/business/solutions/${sol.key}`}>View details</Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
