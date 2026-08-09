import { useNavigate } from "react-router-dom";
import { Bell, Check, EyeOff, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAdminNotifications } from "@/hooks/useAdminNotifications";
import {
  CATEGORY_LABELS,
  DecoratedNotification,
  EVENT_MAP,
  groupByAge,
  priorityColour,
  timeAgo,
} from "@/lib/adminNotifications";
import { useState } from "react";

function Row({ n, onClose }: { n: DecoratedNotification; onClose: () => void }) {
  const navigate = useNavigate();
  const { markRead, ignore } = useAdminNotifications();
  const meta = EVENT_MAP[n.event_type];
  const colours = priorityColour(n.priority);

  return (
    <div className={cn("px-3 py-2.5 border-b border-border/60 last:border-0", !n.read && "bg-primary/[0.03]")}>
      <div className="flex items-start gap-2">
        <span className={cn("mt-1.5 h-1.5 w-1.5 rounded-full shrink-0", n.status === "resolved" ? "bg-emerald-500" : n.ignored ? "bg-muted-foreground" : colours.dot)} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              {CATEGORY_LABELS[n.category] ?? n.category}
            </span>
            {n.status === "resolved" && <Badge variant="outline" className="h-4 px-1 text-[9px] border-emerald-500/40 text-emerald-600">Resolved</Badge>}
            {n.ignored && n.status === "open" && <Badge variant="outline" className="h-4 px-1 text-[9px]">Ignored</Badge>}
          </div>
          <p className="text-sm font-medium text-foreground leading-snug">{n.title}</p>
          {n.message && <p className="text-xs text-muted-foreground line-clamp-2">{n.message}</p>}
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[11px] text-muted-foreground">{timeAgo(n.created_at)}</span>
            {n.status === "open" && (
              <>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 px-2 text-[11px]"
                  onClick={() => {
                    markRead(n.id);
                    onClose();
                    navigate(n.action_url ?? meta?.navPath ?? "/admin/notifications");
                  }}
                >
                  {meta?.actionLabel ?? "View"} <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
                {!meta?.notDismissible && !n.ignored && (
                  <Button size="sm" variant="ghost" className="h-6 px-2 text-[11px] text-muted-foreground" onClick={() => ignore(n.id)}>
                    <EyeOff className="mr-1 h-3 w-3" /> Ignore
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminNotificationBell() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { notifications, unreadCount, active, markAllRead } = useAdminNotifications();

  const recent = notifications.filter((n) => !n.ignored).slice(0, 40);
  const others = recent.filter((n) => !n.active);
  const { fresh, today, earlier } = groupByAge(others);

  const section = (label: string, items: DecoratedNotification[]) =>
    items.length > 0 && (
      <div key={label}>
        <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted/50">{label}</div>
        {items.map((n) => (
          <Row key={n.id} n={n} onClose={() => setOpen(false)} />
        ))}
      </div>
    );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-semibold flex items-center justify-center">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[380px] p-0">
        <div className="flex items-center justify-between px-3 py-2 border-b border-border">
          <span className="text-sm font-semibold">Notifications</span>
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => markAllRead()}>
            <Check className="mr-1 h-3 w-3" /> Mark all as read
          </Button>
        </div>
        <ScrollArea className="max-h-[420px]">
          {recent.length === 0 && <p className="px-3 py-8 text-center text-sm text-muted-foreground">Nothing to show.</p>}
          {section("Action required", active.slice(0, 20))}
          {section("New", fresh)}
          {section("Today", today)}
          {section("Earlier", earlier)}
        </ScrollArea>
        <div className="border-t border-border p-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs"
            onClick={() => {
              setOpen(false);
              navigate("/admin/notifications");
            }}
          >
            View all notifications
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
