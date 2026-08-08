import { Link } from "react-router-dom";
import { ArrowRight, Check, Sparkles, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BusinessSolution } from "@/lib/businessCatalogue";

export function SolutionCard({
  solution,
  status,
  onView,
}: {
  solution: BusinessSolution;
  status: "Available" | "Active" | "Upgrade Available" | "Contact Sales";
  onView?: () => void;
}) {
  const entry = solution.plans.find((p) => p.price);
  const buyable = solution.plans.some((p) => p.checkout || p.configureUrl);
  const Icon = solution.icon;

  const statusStyle =
    status === "Active" ? "bg-teal/15 text-teal border-teal/30"
      : status === "Upgrade Available" ? "bg-amber-500/15 text-amber-600 border-amber-500/30"
        : status === "Contact Sales" ? "bg-muted text-muted-foreground border-border"
          : "bg-navy/10 text-navy border-navy/20";

  return (
    <Card className="flex flex-col border-border/70 hover:border-teal/50 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-lg bg-navy/5 flex items-center justify-center">
              <Icon className="w-4.5 h-4.5 text-teal" />
            </span>
            <div>
              <CardTitle className="text-base leading-tight">{solution.name}</CardTitle>
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground mt-0.5">{solution.lane}</p>
            </div>
          </div>
          <Badge variant="outline" className={`text-[10px] shrink-0 ${statusStyle}`}>{status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">{solution.tagline}</p>
        <p className="text-sm text-foreground/90"><span className="font-medium">Outcome:</span> {solution.outcome}</p>
        <p className="text-xs text-muted-foreground"><span className="font-medium text-foreground/80">Best for:</span> {solution.idealFor}</p>
        <ul className="space-y-1.5 mt-1">
          {solution.capabilities.slice(0, 3).map((c) => (
            <li key={c} className="flex items-start gap-2 text-sm text-muted-foreground">
              <Check className="w-3.5 h-3.5 text-teal shrink-0 mt-1" />{c}
            </li>
          ))}
        </ul>
        <div className="mt-auto pt-3 space-y-2">
          {entry?.price && (
            <p className="text-sm">
              <span className="text-muted-foreground">From </span>
              <span className="text-lg font-bold text-foreground">{entry.price}</span>
              <span className="text-muted-foreground">{entry.period ?? ""}</span>
            </p>
          )}
          <div className="flex gap-2">
            <Button asChild variant="outline" className="flex-1" onClick={onView}>
              <Link to={`/business/solutions/${solution.key}`}>View Solution</Link>
            </Button>
            {buyable ? (
              <Button asChild variant="accent" className="flex-1">
                <Link to={`/business/solutions/${solution.key}#plans`}>Buy</Link>
              </Button>
            ) : (
              <Button asChild variant="secondary" className="flex-1">
                <Link to={`/business/quotes?product=${encodeURIComponent(solution.name)}`}>Contact Sales</Link>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function RecommendationBanner({ title, body, to, cta }: { title: string; body: string; to: string; cta: string }) {
  return (
    <Card className="border-teal/30 bg-teal/[0.04]">
      <CardContent className="py-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-teal mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-foreground">{title}</p>
            <p className="text-sm text-muted-foreground">{body}</p>
          </div>
        </div>
        <Button asChild variant="accent"><Link to={to}>{cta} <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
      </CardContent>
    </Card>
  );
}

export function TalkToExpert() {
  return (
    <Card>
      <CardContent className="py-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <MessageSquare className="w-5 h-5 text-navy mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-foreground">Not sure which solution fits?</p>
            <p className="text-sm text-muted-foreground">Tell us about your compliance requirements and we'll advise.</p>
          </div>
        </div>
        <Button asChild variant="outline"><Link to="/business/quotes">Talk to an Expert</Link></Button>
      </CardContent>
    </Card>
  );
}
