import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PARTNER_PRODUCTS } from "@/data/partnerProducts";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowRight,
  Search,
  ShieldCheck,
  UserCheck,
  ScanSearch,
  Scale,
  GraduationCap,
  Target,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

const PRODUCT_META: Record<string, { icon: any; accent: string; ring: string; label: string }> = {
  suite: { icon: ShieldCheck, accent: "text-teal", ring: "bg-teal/10", label: "Platform" },
  onboarding: { icon: UserCheck, accent: "text-sky-600", ring: "bg-sky-500/10", label: "Onboarding" },
  screening: { icon: ScanSearch, accent: "text-violet-600", ring: "bg-violet-500/10", label: "Screening" },
  rcm: { icon: Scale, accent: "text-amber-600", ring: "bg-amber-500/10", label: "Governance" },
  academy: { icon: GraduationCap, accent: "text-emerald-600", ring: "bg-emerald-500/10", label: "Training" },
};

export default function PartnerProducts() {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<string>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PARTNER_PRODUCTS.filter((p) => {
      if (active !== "all" && p.id !== active) return false;
      if (!q) return true;
      return [p.name, p.positioning, p.idealFor, p.problem, ...p.sellingPoints, ...p.useCases]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [query, active]);

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      {/* Header */}
      <div className="rounded-xl border border-border bg-gradient-to-br from-navy via-navy to-navy-light p-6 text-white">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-teal">Sales enablement</p>
        <h1 className="text-2xl font-bold mt-1">Products & Solutions</h1>
        <p className="text-sm text-white/70 mt-2 max-w-2xl">
          Partner briefs for every WorldAML solution — positioning, ideal customer, the problem it solves and
          the points that win deals.
        </p>
        <div className="flex flex-wrap gap-2 mt-4">
          <Button asChild size="sm" variant="accent">
            <Link to="/partner/deals/new">
              Register opportunity <ArrowRight className="ml-1.5 w-3.5 h-3.5" />
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="bg-white/10 text-white border-white/25 hover:bg-white/20 hover:text-white">
            <Link to="/partner/assets">Marketing hub</Link>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products, use cases or selling points…"
            className="pl-9 h-9"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Button
            size="sm"
            variant={active === "all" ? "default" : "outline"}
            className="h-9 px-3 text-xs"
            onClick={() => setActive("all")}
          >
            All
          </Button>
          {PARTNER_PRODUCTS.map((p) => (
            <Button
              key={p.id}
              size="sm"
              variant={active === p.id ? "default" : "outline"}
              className="h-9 px-3 text-xs"
              onClick={() => setActive(p.id)}
            >
              {PRODUCT_META[p.id]?.label ?? p.name}
            </Button>
          ))}
        </div>
      </div>

      {filtered.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No products match “{query}”.
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-2 gap-4">
        {filtered.map((p) => {
          const meta = PRODUCT_META[p.id] ?? PRODUCT_META.suite;
          const Icon = meta.icon;
          return (
            <Card
              key={p.id}
              className="flex flex-col overflow-hidden border-border hover:shadow-md hover:border-teal/40 transition-all"
            >
              <div className="p-5 pb-4 border-b border-border bg-muted/30">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg ${meta.ring} ${meta.accent} flex items-center justify-center shrink-0`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-semibold text-foreground leading-tight">{p.name}</h2>
                      <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-background border border-border text-muted-foreground">
                        {meta.label}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{p.positioning}</p>
                  </div>
                </div>
              </div>

              <CardContent className="p-5 flex-1 flex flex-col gap-4">
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="rounded-lg border border-border p-3">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      <Target className="w-3.5 h-3.5" /> Ideal for
                    </div>
                    <p className="text-sm text-foreground/90 mt-1.5">{p.idealFor}</p>
                  </div>
                  <div className="rounded-lg border border-border p-3">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      <AlertTriangle className="w-3.5 h-3.5" /> Problem it solves
                    </div>
                    <p className="text-sm text-foreground/90 mt-1.5">{p.problem}</p>
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Key selling points
                  </div>
                  <ul className="mt-2 grid sm:grid-cols-2 gap-x-4 gap-y-1.5">
                    {p.sellingPoints.map((s) => (
                      <li key={s} className="flex gap-2 text-sm text-foreground/90">
                        <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${meta.accent}`} />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-auto">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Use cases
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {p.useCases.map((u) => (
                      <span
                        key={u}
                        className="text-xs px-2 py-0.5 rounded-full border border-border bg-muted/40 text-muted-foreground"
                      >
                        {u}
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                    <Button asChild size="sm">
                      <Link to={`/partner/deals/new?product=${encodeURIComponent(p.name)}`}>
                        Register opportunity <ArrowRight className="ml-1.5 w-3.5 h-3.5" />
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline">
                      <Link to="/partner/assets">Sales materials</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
