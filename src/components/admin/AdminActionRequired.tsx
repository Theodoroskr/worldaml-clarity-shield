import { useNavigate } from "react-router-dom";
import { AlertTriangle, ArrowRight, EyeOff, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAdminNotifications } from "@/hooks/useAdminNotifications";
import { EVENT_MAP, priorityColour } from "@/lib/adminNotifications";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Props {
  /** Match notifications by sidebar path (e.g. "/admin/partners") */
  path?: string;
  /** Or match by explicit event types (for section-level alerts) */
  eventTypes?: string[];
  /** Compact single-line inline alert for a page section */
  variant?: "panel" | "inline";
  className?: string;
  title?: string;
}

function snoozeOptions() {
  const now = new Date();
  const laterToday = new Date(now.getTime() + 4 * 60 * 60 * 1000);
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0);
  const threeDays = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  const oneWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  return [
    { label: "Later today", date: laterToday },
    { label: "Tomorrow", date: tomorrow },
    { label: "In 3 days", date: threeDays },
    { label: "In 1 week", date: oneWeek },
  ];
}

export default function AdminActionRequired({ path, eventTypes, variant = "panel", className, title }: Props) {
  const navigate = useNavigate();
  const { forPath, forEventTypes, ignore, snooze } = useAdminNotifications();
  const items = eventTypes ? forEventTypes(eventTypes) : path ? forPath(path) : [];

  if (items.length === 0) return null;

  if (variant === "inline") {
    return (
      <div className={cn("flex items-center gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm", className)}>
        <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
        <span className="text-foreground">
          {items.length} {title ?? (items.length === 1 ? "item requires attention" : "items require attention")}
        </span>
      </div>
    );
  }

  return (
    <div className={cn("rounded-lg border border-amber-500/30 bg-amber-500/5", className)}>
      <div className="flex items-center gap-2 px-3 py-2 border-b border-amber-500/20">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <span className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">
          {title ?? "Action required"}
        </span>
        <span className="ml-auto min-w-[18px] h-[18px] px-1 rounded-full bg-amber-500 text-white text-[10px] font-semibold flex items-center justify-center">
          {items.length}
        </span>
      </div>
      <ul className="divide-y divide-amber-500/10">
        {items.slice(0, 6).map((n) => {
          const meta = EVENT_MAP[n.event_type];
          const colours = priorityColour(n.priority);
          return (
            <li key={n.id} className="flex items-center gap-2 px-3 py-2">
              <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", colours.dot)} />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-foreground truncate">{n.title}</p>
                {n.message && <p className="text-xs text-muted-foreground truncate">{n.message}</p>}
              </div>
              <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => navigate(n.action_url ?? meta?.navPath ?? "#")}>
                {meta?.actionLabel ?? "Review"} <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
              {!meta?.notDismissible && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {snoozeOptions().map((o) => (
                      <DropdownMenuItem key={o.label} onClick={() => snooze(n.id, o.date)}>
                        Snooze — {o.label}
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuItem onClick={() => ignore(n.id)}>
                      <EyeOff className="mr-2 h-3.5 w-3.5" /> Ignore
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </li>
          );
        })}
      </ul>
      {items.length > 6 && (
        <div className="px-3 py-1.5 text-xs text-muted-foreground">+{items.length - 6} more</div>
      )}
    </div>
  );
}
