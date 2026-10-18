import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Bell, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useOrganisation } from "@/hooks/useOrganisation";
import { useSuiteModules } from "@/hooks/useSuiteModules";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AlertRow = { id: string; title: string; severity: string; status: string; created_at: string };

const dot: Record<string, string> = {
  critical: "bg-destructive",
  high: "bg-destructive/70",
  medium: "bg-accent",
  low: "bg-muted-foreground",
};

/** Topbar bell: open/escalated Suite alerts for the current organisation. */
export default function SuiteAlertBell() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { orgId } = useOrganisation();
  const { canOpen } = useSuiteModules();
  const allowed = canOpen("/suite/alerts");

  const { data = [] } = useQuery({
    queryKey: ["suite-alert-bell", orgId],
    enabled: !!orgId && allowed,
    refetchInterval: 60_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("suite_alerts")
        .select("id, title, severity, status, created_at")
        .eq("organisation_id", orgId!)
        .in("status", ["open", "escalated"])
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return (data ?? []) as AlertRow[];
    },
  });

  const count = data.length;
  const go = (path: string) => { setOpen(false); navigate(path); };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-8 w-8" aria-label="Alerts">
          <Bell className="w-4 h-4 text-muted-foreground" />
          {count > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-semibold flex items-center justify-center">
              {count >= 20 ? "20+" : count}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="px-3 py-2 border-b border-border text-sm font-semibold">Open alerts</div>
        <div className="max-h-80 overflow-y-auto">
          {!allowed ? (
            <p className="px-3 py-6 text-center text-xs text-muted-foreground">Alerts aren't part of your modules.</p>
          ) : count === 0 ? (
            <p className="px-3 py-6 text-center text-xs text-muted-foreground">No open alerts.</p>
          ) : data.map((a) => (
            <button key={a.id} onClick={() => go("/suite/alerts")} className="w-full text-left px-3 py-2 border-b border-border/60 last:border-0 hover:bg-muted flex gap-2">
              <span className={cn("mt-1.5 h-1.5 w-1.5 rounded-full shrink-0", dot[a.severity] ?? "bg-muted-foreground")} />
              <span className="min-w-0 flex-1">
                <span className="block text-sm text-foreground truncate">{a.title}</span>
                <span className="block text-[11px] text-muted-foreground capitalize">
                  {a.severity} · {a.status} · {new Date(a.created_at).toLocaleDateString("en-GB")}
                </span>
              </span>
            </button>
          ))}
        </div>
        {allowed && (
          <div className="border-t border-border p-2">
            <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => go("/suite/alerts")}>
              View all alerts <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
