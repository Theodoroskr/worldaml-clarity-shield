import { Bell, Mail, MonitorSmartphone } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useAdminNotifications } from "@/hooks/useAdminNotifications";
import { CATEGORY_LABELS, EVENT_TYPES, defaultsForRole } from "@/lib/adminNotifications";

export default function AdminNotificationSettings() {
  const { prefs, savePref, department } = useAdminNotifications();

  const categories = Array.from(new Set(EVENT_TYPES.map((e) => e.category)));

  const value = (eventType: string) =>
    prefs[eventType] ?? {
      in_app: defaultsForRole(eventType, department).inApp,
      email: defaultsForRole(eventType, department).email,
    };

  return (
    <div className="p-6 space-y-5 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" /> Notification Settings
        </h1>
        <p className="text-sm text-muted-foreground">
          Control your own in-app and email notifications. Defaults follow your role
          {department ? ` (${department})` : ""}. Partner Programme notification recipients remain configurable on the Partner Program page.
        </p>
      </div>

      {categories.map((cat) => (
        <Card key={cat} className="overflow-hidden">
          <div className="px-4 py-2 border-b border-border bg-muted/40 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {CATEGORY_LABELS[cat] ?? cat}
            </span>
            <div className="flex items-center gap-6 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1"><MonitorSmartphone className="h-3 w-3" /> In-app</span>
              <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> Email</span>
            </div>
          </div>
          <div className="divide-y divide-border">
            {EVENT_TYPES.filter((e) => e.category === cat).map((e) => {
              const v = value(e.eventType);
              return (
                <div key={e.eventType} className="flex items-center gap-4 px-4 py-2.5">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">{e.label}</p>
                    {e.informational && <p className="text-[11px] text-muted-foreground">Informational — history only</p>}
                  </div>
                  <Switch
                    checked={v.in_app}
                    onCheckedChange={(c) => savePref(e.eventType, { in_app: c })}
                    aria-label={`${e.label} in-app`}
                  />
                  <Switch
                    checked={v.email}
                    onCheckedChange={(c) => savePref(e.eventType, { email: c })}
                    aria-label={`${e.label} email`}
                  />
                </div>
              );
            })}
          </div>
        </Card>
      ))}
    </div>
  );
}
