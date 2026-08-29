import { ReactNode, useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  ArrowRight, BellPlus, CreditCard, Gauge, Menu, PanelLeftClose, PanelLeftOpen,
  Puzzle, Radar, Search, ShieldCheck, Users, X,
} from "lucide-react";
import Header from "@/components/Header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useScreeningAccess } from "@/hooks/useScreeningAccess";
import { useScreeningQuota } from "@/hooks/useScreeningQuota";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "worldaml.screening.sidebarCollapsed";

export const SCREENING_NAV = [
  { label: "Workspace", to: "/screening", icon: Search, end: true },
  { label: "Monitored entities", to: "/screening/monitored", icon: Radar },
  { label: "Risk alerts", to: "/screening/risk-alerts", icon: BellPlus },
  { label: "Team & access", to: "/screening/team", icon: Users },
  { label: "Add-on modules", to: "/screening/modules", icon: Puzzle },
  { label: "Packages", to: "/screening-monitoring/pricing", icon: CreditCard },
];

interface ScreeningLayoutProps {
  children: ReactNode;
  /** Optional extra content (SEO tags etc.) rendered outside the main column. */
  head?: ReactNode;
  /** Constrain the main column width like a container. */
  contained?: boolean;
}

/**
 * Shared shell for every Screening & Monitoring module: persistent, collapsible
 * left sidebar on desktop and a slide-down nav on mobile.
 */
export default function ScreeningLayout({ children, head, contained = false }: ScreeningLayoutProps) {
  const { plan } = useScreeningAccess();
  const quota = useScreeningQuota();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(STORAGE_KEY) === "1");
    } catch {
      /* ignore */
    }
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  const searchQuota = quota.searchQuota ?? 0;
  const used = quota.searchesUsed ?? 0;
  const remaining = Math.max(0, searchQuota - used);
  const usagePct = searchQuota > 0 ? Math.min(100, (used / searchQuota) * 100) : 0;
  const showUsage = !quota.loading && searchQuota > 0;

  const renderNav = (isCollapsed: boolean) => (
    <nav
      className={cn("flex-1 space-y-1 py-4", isCollapsed ? "px-2" : "px-3")}
      aria-label="Screening navigation"
    >
      {SCREENING_NAV.map((item) => {
        const link = (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => setMobileNavOpen(false)}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2.5 rounded-md py-2 text-sm transition-colors",
                isCollapsed ? "justify-center px-2" : "px-3",
                isActive
                  ? "bg-teal/15 text-teal font-medium"
                  : "text-white/70 hover:bg-white/5 hover:text-white",
              )
            }
          >
            <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
            {!isCollapsed && <span className="truncate">{item.label}</span>}
            {isCollapsed && <span className="sr-only">{item.label}</span>}
          </NavLink>
        );

        if (!isCollapsed) return link;
        return (
          <Tooltip key={item.to} delayDuration={100}>
            <TooltipTrigger asChild>{link}</TooltipTrigger>
            <TooltipContent side="right">{item.label}</TooltipContent>
          </Tooltip>
        );
      })}
    </nav>
  );

  const sidebar = (isCollapsed: boolean, showToggle: boolean) => (
    <div className="flex h-full flex-col">
      <div
        className={cn(
          "flex items-center gap-2.5 border-b border-white/10 py-5",
          isCollapsed ? "justify-center px-2" : "px-5",
        )}
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal/20">
          <ShieldCheck className="h-5 w-5 text-teal" aria-hidden="true" />
        </span>
        {!isCollapsed && (
          <div className="leading-tight min-w-0">
            <p className="text-sm font-semibold text-white">WORLDAML</p>
            <p className="text-[11px] text-white/60">Screening &amp; Monitoring</p>
          </div>
        )}
      </div>

      {renderNav(isCollapsed)}

      {!isCollapsed && (plan || showUsage) && (
        <div className="px-3 pb-3">
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
            {showUsage && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-white/60">
                  <span>Screenings</span>
                  <span className="font-medium text-white">
                    {remaining}/{searchQuota} left
                  </span>
                </div>
                <Progress value={usagePct} className="h-1.5 bg-white/10" />
              </div>
            )}
            {plan === "demo" && (
              <Button asChild size="sm" variant="accent" className="w-full">
                <Link to="/screening-monitoring/pricing">
                  Upgrade <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      )}

      {showToggle && (
        <div className={cn("border-t border-white/10 p-2", isCollapsed && "flex justify-center")}>
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={cn(
              "flex items-center gap-2 rounded-md py-2 text-xs text-white/70 transition-colors hover:bg-white/5 hover:text-white",
              isCollapsed ? "justify-center px-2" : "w-full px-3",
            )}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="h-4 w-4" aria-hidden="true" />
            ) : (
              <>
                <PanelLeftClose className="h-4 w-4" aria-hidden="true" />
                Collapse
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background flex flex-col">
        {head}
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
            {showUsage && (
              <Badge variant="outline" className="ml-auto border-teal/40 text-teal text-[10px]">
                {remaining}/{searchQuota} left
              </Badge>
            )}
          </div>
          {mobileNavOpen && (
            <div className="border-t border-white/10 max-h-[70vh] overflow-y-auto">
              {sidebar(false, false)}
            </div>
          )}
        </div>

        <div className="flex-1 flex min-h-0">
          <aside
            className={cn(
              "hidden lg:flex flex-col shrink-0 bg-primary text-primary-foreground border-r border-white/10 sticky top-0 h-[calc(100vh-4rem)] overflow-y-auto transition-[width] duration-200",
              collapsed ? "w-[4.5rem]" : "w-64",
            )}
          >
            {sidebar(collapsed, true)}
          </aside>

          <main className={cn("flex-1 min-w-0 px-4 sm:px-6 py-6", contained && "container mx-auto")}>
            {children}
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
