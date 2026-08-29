import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useSearchParams } from "react-router-dom";
import {
  Loader2, Lock, ArrowRight, Sparkles, CheckCircle2, ShieldCheck,
  Search, Users, Puzzle, CreditCard, Gauge, Menu, X, Radar,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import SuiteScreeningV2 from "@/pages/suite/SuiteScreeningV2";
import { useScreeningAccess } from "@/hooks/useScreeningAccess";
import { useScreeningQuota } from "@/hooks/useScreeningQuota";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const SIDE_NAV = [
  { label: "Workspace", to: "/screening", icon: Search, end: true },
  { label: "Monitored entities", to: "/screening/monitored", icon: Radar },
  { label: "Risk alerts", to: "/screening/risk-alerts", icon: BellPlus },
  { label: "Team & access", to: "/screening/team", icon: Users },
  { label: "Add-on modules", to: "/screening/modules", icon: Puzzle },
  { label: "Packages", to: "/screening-monitoring/pricing", icon: CreditCard },
];



/**
 * Standalone WorldAML Screening & Monitoring workspace.
 * Access comes from an active screening subscription. Signed-in users with no
 * subscription are granted the one-time demo plan (5 free searches).
 */
export default function ScreeningWorkspace() {
  const { isLoading, isAuthenticated, hasAccess, plan, refresh } = useScreeningAccess();
  const quota = useScreeningQuota();
  const [searchParams] = useSearchParams();
  const [claiming, setClaiming] = useState(false);
  const [justActivated, setJustActivated] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const claimedRef = useRef(false);

  useEffect(() => {
    if (isLoading || !isAuthenticated || hasAccess || claimedRef.current) return;
    claimedRef.current = true;
    setClaiming(true);
    void (async () => {
      try {
        await supabase.functions.invoke("claim-screening-demo", { body: {} });
        await refresh();
        setJustActivated(true);
      } catch (err) {
        console.warn("Demo activation failed", err);
      } finally {
        setClaiming(false);
      }
    })();
  }, [isLoading, isAuthenticated, hasAccess, refresh]);

  const busy = isLoading || claiming;
  const isDemo = plan === "demo";
  // Until the demo credits are counted, screening runs stay blocked.
  const provisioning = isDemo && quota.loading;
  const searchQuota = quota.searchQuota ?? 5;
  const used = quota.searchesUsed ?? 0;
  const remaining = Math.max(0, searchQuota - used);
  const usagePct = searchQuota > 0 ? Math.min(100, (used / searchQuota) * 100) : 0;

  const sidebar = (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-white/10">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal/20">
          <ShieldCheck className="h-5 w-5 text-teal" aria-hidden="true" />
        </span>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-white">WORLDAML</p>
          <p className="text-[11px] text-white/60">Screening &amp; Monitoring</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-3 py-4" aria-label="Screening workspace">
        {SIDE_NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => setMobileNavOpen(false)}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-teal/15 text-teal font-medium"
                  : "text-white/70 hover:bg-white/5 hover:text-white",
              )
            }
          >
            <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Plan & usage card */}
      <div className="px-3 pb-4">
        <div className="rounded-lg border border-white/10 bg-white/5 p-3.5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-white">
              <Gauge className="h-3.5 w-3.5 text-teal" aria-hidden="true" />
              Usage
            </span>
            {plan && (
              <Badge variant="outline" className="border-teal/40 text-teal uppercase text-[10px] tracking-wide">
                {plan} plan
              </Badge>
            )}
          </div>
          {isDemo && !provisioning && (
            <>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-white/60">
                  <span>Screenings</span>
                  <span className="font-medium text-white">
                    {remaining}/{searchQuota} left
                  </span>
                </div>
                <Progress value={usagePct} className="h-1.5 bg-white/10" />
              </div>
              <Button
                asChild
                size="sm"
                variant="accent"
                className="w-full"
              >
                <Link to="/screening-monitoring/pricing">
                  Upgrade <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title="Screening & Monitoring | WorldAML"
        description="Provider-independent sanctions, PEP, watchlist and adverse media screening workspace with case management and ongoing monitoring."
        noindex
      />
      <Header />

      {/* Mobile product bar */}
      <div className="lg:hidden border-b border-border bg-primary text-primary-foreground sticky top-0 z-30">
        <div className="px-4 flex items-center gap-3 py-3">
          <button
            type="button"
            aria-label={mobileNavOpen ? "Close workspace menu" : "Open workspace menu"}
            onClick={() => setMobileNavOpen((v) => !v)}
            className="rounded-md p-1.5 hover:bg-white/10"
          >
            {mobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <span className="inline-flex items-center gap-2 font-semibold">
            <ShieldCheck className="h-4 w-4 text-teal" aria-hidden="true" />
            Screening &amp; Monitoring
          </span>
          {isDemo && !provisioning && (
            <Badge variant="outline" className="ml-auto border-teal/40 text-teal text-[10px]">
              {remaining}/{searchQuota} left
            </Badge>
          )}
        </div>
        {mobileNavOpen && (
          <div className="border-t border-white/10 max-h-[70vh] overflow-y-auto">{sidebar}</div>
        )}
      </div>

      <div className="flex-1 flex min-h-0">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-64 shrink-0 bg-primary text-primary-foreground border-r border-white/10 sticky top-0 h-[calc(100vh-4rem)] overflow-y-auto">
          {sidebar}
        </aside>

        {/* Main */}
        <main className="flex-1 min-w-0 px-4 sm:px-6 py-6">
          {busy ? (
            <div className="flex items-center gap-3 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              {claiming ? "Activating your 5 free screenings…" : "Checking your access…"}
            </div>
          ) : hasAccess ? (
            <>
              {isDemo && (
                <Alert className="mb-6 border-teal/40 bg-teal/5">
                  {justActivated ? (
                    <CheckCircle2 className="h-4 w-4 text-teal" />
                  ) : (
                    <Sparkles className="h-4 w-4 text-teal" />
                  )}
                  <AlertTitle>
                    {justActivated
                      ? `Activated — you have exactly ${searchQuota} free screenings`
                      : `Demo plan — ${searchQuota} free screening searches`}
                  </AlertTitle>
                  <AlertDescription className="space-y-2">
                    <p className="flex flex-wrap items-center gap-2">
                      {provisioning ? (
                        <span className="inline-flex items-center gap-2 font-medium text-foreground">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Provisioning your demo
                          credits… screening runs unlock in a moment.
                        </span>
                      ) : (
                        <span className="font-medium text-foreground">
                          {remaining} of {searchQuota} free screenings remaining
                        </span>
                      )}
                    </p>
                    <p className="flex flex-wrap items-center gap-2">
                      Run real screenings across 1,900+ sanctions, PEP and watchlist sources. Ongoing
                      monitoring and adverse media need a paid package.
                      <Link to="/screening-monitoring/pricing" className="underline font-medium">
                        View packages →
                      </Link>
                    </p>
                  </AlertDescription>
                </Alert>
              )}
              {provisioning ? (
                <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-4 py-6 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Preparing your workspace — screening is disabled until your demo credits are
                  provisioned.
                </div>
              ) : (
                <SuiteScreeningV2 initialQuery={searchParams.get("q") ?? undefined} />
              )}
            </>
          ) : (
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Lock className="h-5 w-5 text-teal" /> Screening & Monitoring is not active yet
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  This workspace is part of WorldAML Screening & Monitoring. Choose a package to activate
                  sanctions, PEP and adverse media screening with ongoing monitoring for your organisation.
                </p>
                <div className="flex gap-3 flex-wrap">
                  <Button asChild variant="accent">
                    <Link to="/screening-monitoring/pricing">
                      View packages <ArrowRight className="ml-1.5 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link to="/contact-sales?product=WorldAML%20Screening%20%26%20Monitoring">Talk to sales</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}
