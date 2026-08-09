import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Check, EyeOff, ArrowRight, Settings2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useAdminNotifications } from "@/hooks/useAdminNotifications";
import AdminPageAttention from "@/components/admin/AdminPageAttention";
import {
  CATEGORY_LABELS,
  EVENT_MAP,
  priorityColour,
  priorityLabel,
  timeAgo,
} from "@/lib/adminNotifications";

const STATUS_FILTERS = ["all", "open", "unread", "action_required", "resolved", "ignored"] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

const STATUS_LABELS: Record<StatusFilter, string> = {
  all: "All",
  open: "Open",
  unread: "Unread",
  action_required: "Action required",
  resolved: "Resolved",
  ignored: "Ignored",
};

export default function AdminNotificationCentre() {
  const navigate = useNavigate();
  const { notifications, loading, refresh, markRead, markAllRead, ignore, unignore } = useAdminNotifications();
  const [status, setStatus] = useState<StatusFilter>("all");
  const [category, setCategory] = useState<string>("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return notifications.filter((n) => {
      if (category !== "all" && n.category !== category) return false;
      if (status === "open" && (n.status !== "open" || n.ignored)) return false;
      if (status === "unread" && (n.read || n.ignored)) return false;
      if (status === "action_required" && !n.active) return false;
      if (status === "resolved" && n.status !== "resolved") return false;
      if (status === "ignored" && !n.ignored) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!`${n.title} ${n.message ?? ""}`.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [notifications, status, category, search]);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" /> Notification Centre
            <AdminPageAttention path="/admin/notifications" />
          </h1>
          <p className="text-sm text-muted-foreground">Complete history of admin notifications — open, resolved and ignored.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refresh()} disabled={loading}>
            <RefreshCw className={cn("mr-1.5 h-3.5 w-3.5", loading && "animate-spin")} /> Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={() => markAllRead()}>
            <Check className="mr-1.5 h-3.5 w-3.5" /> Mark all as read
          </Button>
          <Button size="sm" onClick={() => navigate("/admin/notification-settings")}>
            <Settings2 className="mr-1.5 h-3.5 w-3.5" /> Notification settings
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {STATUS_FILTERS.map((s) => (
          <Button key={s} size="sm" variant={status === s ? "default" : "outline"} className="h-7 text-xs" onClick={() => setStatus(s)}>
            {STATUS_LABELS[s]}
          </Button>
        ))}
        <span className="mx-1 h-7 w-px bg-border" />
        <Button size="sm" variant={category === "all" ? "secondary" : "ghost"} className="h-7 text-xs" onClick={() => setCategory("all")}>
          All categories
        </Button>
        {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
          <Button key={key} size="sm" variant={category === key ? "secondary" : "ghost"} className="h-7 text-xs" onClick={() => setCategory(key)}>
            {label}
          </Button>
        ))}
      </div>

      <Input placeholder="Search notifications…" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm h-9" />

      <Card className="divide-y divide-border">
        {filtered.length === 0 && <p className="p-8 text-center text-sm text-muted-foreground">No notifications match these filters.</p>}
        {filtered.map((n) => {
          const meta = EVENT_MAP[n.event_type];
          const colours = priorityColour(n.priority);
          return (
            <div key={n.id} className={cn("flex items-start gap-3 p-3", !n.read && n.status === "open" && "bg-primary/[0.03]")}>
              <span className={cn("mt-2 h-2 w-2 rounded-full shrink-0", n.status === "resolved" ? "bg-emerald-500" : n.ignored ? "bg-muted-foreground" : colours.dot)} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {CATEGORY_LABELS[n.category] ?? n.category}
                  </span>
                  <Badge variant="outline" className="h-4 px-1 text-[9px]">{priorityLabel(n.priority)}</Badge>
                  {n.status === "resolved" ? (
                    <Badge variant="outline" className="h-4 px-1 text-[9px] border-emerald-500/40 text-emerald-600">Resolved</Badge>
                  ) : n.ignored ? (
                    <Badge variant="outline" className="h-4 px-1 text-[9px]">Ignored</Badge>
                  ) : (
                    <Badge variant="outline" className="h-4 px-1 text-[9px] border-amber-500/40 text-amber-600">Open</Badge>
                  )}
                  {!n.read && <Badge variant="outline" className="h-4 px-1 text-[9px] border-primary/40 text-primary">Unread</Badge>}
                </div>
                <p className="text-sm font-medium text-foreground">{n.title}</p>
                {n.message && <p className="text-xs text-muted-foreground">{n.message}</p>}
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {timeAgo(n.created_at)}
                  {n.resolved_at && ` · resolved ${timeAgo(n.resolved_at)}`}
                  {n.resolution_note && ` · ${n.resolution_note}`}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {(n.action_url || meta?.navPath) && (
                  <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => { markRead(n.id); navigate(n.action_url ?? meta!.navPath); }}>
                    {meta?.actionLabel ?? "View"} <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                )}
                {!n.read && (
                  <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => markRead(n.id)}>
                    <Check className="h-3 w-3" />
                  </Button>
                )}
                {n.status === "open" && !meta?.notDismissible && (
                  n.ignored ? (
                    <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => unignore(n.id)}>Restore</Button>
                  ) : (
                    <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-muted-foreground" onClick={() => ignore(n.id)}>
                      <EyeOff className="h-3 w-3" />
                    </Button>
                  )
                )}
              </div>
            </div>
          );
        })}
      </Card>
    </div>
  );
}
