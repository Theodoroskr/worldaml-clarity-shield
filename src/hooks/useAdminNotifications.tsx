import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  AdminNotification,
  AdminNotificationState,
  DecoratedNotification,
  EVENT_MAP,
  defaultsForRole,
} from "@/lib/adminNotifications";

interface Prefs {
  [eventType: string]: { in_app: boolean; email: boolean };
}

interface Ctx {
  notifications: DecoratedNotification[];
  loading: boolean;
  /** Unresolved, non-ignored, non-snoozed, in-app enabled */
  active: DecoratedNotification[];
  unreadCount: number;
  countsByPath: Record<string, number>;
  countsByCategory: Record<string, number>;
  forPath: (path: string) => DecoratedNotification[];
  forEventTypes: (types: string[]) => DecoratedNotification[];
  prefs: Prefs;
  department: string | null;
  refresh: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  ignore: (id: string) => Promise<void>;
  unignore: (id: string) => Promise<void>;
  snooze: (id: string, until: Date) => Promise<void>;
  savePref: (eventType: string, patch: { in_app?: boolean; email?: boolean }) => Promise<void>;
}

const AdminNotificationContext = createContext<Ctx | null>(null);

export function AdminNotificationProvider({ children }: { children: React.ReactNode }) {
  const { user, isAdmin } = useAuth();
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [states, setStates] = useState<Record<string, AdminNotificationState>>({});
  const [prefs, setPrefs] = useState<Prefs>({});
  const [department, setDepartment] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const syncedRef = useRef(false);

  const load = useCallback(async () => {
    if (!user || !isAdmin) {
      setNotifications([]);
      setLoading(false);
      return;
    }
    // Re-derive open items from business records once per session (auto-resolve + backfill).
    if (!syncedRef.current) {
      syncedRef.current = true;
      await supabase.rpc("admin_notifications_sync" as any).catch(() => {});
    }
    const [{ data: notifs }, { data: st }, { data: pf }, { data: profile }] = await Promise.all([
      supabase
        .from("admin_notifications" as any)
        .select("*")
        .order("created_at", { ascending: false })
        .limit(400),
      supabase.from("admin_notification_state" as any).select("*").eq("admin_id", user.id),
      supabase.from("admin_notification_prefs" as any).select("*").eq("user_id", user.id),
      supabase.from("profiles").select("department").eq("id", user.id).maybeSingle(),
    ]);
    setNotifications((notifs as any[] as AdminNotification[]) ?? []);
    const stateMap: Record<string, AdminNotificationState> = {};
    ((st as any[]) ?? []).forEach((s) => (stateMap[s.notification_id] = s));
    setStates(stateMap);
    const prefMap: Prefs = {};
    ((pf as any[]) ?? []).forEach((p) => (prefMap[p.event_type] = { in_app: p.in_app, email: p.email }));
    setPrefs(prefMap);
    setDepartment(((profile as any)?.department as string) ?? null);
    setLoading(false);
  }, [user, isAdmin]);

  useEffect(() => {
    load();
  }, [load]);

  // Realtime + gentle polling fallback
  useEffect(() => {
    if (!user || !isAdmin) return;
    const channel = supabase
      .channel("admin-notifications-feed")
      .on("postgres_changes", { event: "*", schema: "public", table: "admin_notifications" }, () => load())
      .subscribe();
    const timer = setInterval(load, 120000);
    return () => {
      supabase.removeChannel(channel);
      clearInterval(timer);
    };
  }, [user, isAdmin, load]);

  const decorated: DecoratedNotification[] = useMemo(() => {
    const now = Date.now();
    return notifications.map((n) => {
      const s = states[n.id];
      const meta = EVENT_MAP[n.event_type];
      const pref = prefs[n.event_type] ?? {
        in_app: defaultsForRole(n.event_type, department).inApp,
        email: defaultsForRole(n.event_type, department).email,
      };
      const snoozed = s?.snoozed_until ? new Date(s.snoozed_until).getTime() > now : false;
      const active =
        n.status === "open" &&
        !s?.ignored_at &&
        !snoozed &&
        pref.in_app !== false &&
        !meta?.informational;
      return {
        ...n,
        read: !!s?.read_at,
        ignored: !!s?.ignored_at,
        snoozedUntil: s?.snoozed_until ?? null,
        active,
      };
    });
  }, [notifications, states, prefs, department]);

  const active = useMemo(() => decorated.filter((n) => n.active), [decorated]);

  const countsByPath = useMemo(() => {
    const map: Record<string, number> = {};
    active.forEach((n) => {
      const path = n.nav_path ?? EVENT_MAP[n.event_type]?.navPath;
      if (path) map[path] = (map[path] ?? 0) + 1;
    });
    return map;
  }, [active]);

  const countsByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    active.forEach((n) => (map[n.category] = (map[n.category] ?? 0) + 1));
    return map;
  }, [active]);

  const unreadCount = useMemo(
    () => decorated.filter((n) => !n.read && !n.ignored && n.status === "open").length,
    [decorated],
  );

  const setState = async (id: string, patch: { read?: boolean; ignore?: boolean; snooze?: Date | null }) => {
    if (!user) return;
    setStates((prev) => ({
      ...prev,
      [id]: {
        notification_id: id,
        read_at: patch.read === false ? null : patch.read ? new Date().toISOString() : prev[id]?.read_at ?? null,
        ignored_at:
          patch.ignore === false ? null : patch.ignore ? new Date().toISOString() : prev[id]?.ignored_at ?? null,
        snoozed_until: patch.snooze ? patch.snooze.toISOString() : prev[id]?.snoozed_until ?? null,
      },
    }));
    await supabase.rpc("admin_notification_set_state" as any, {
      _notification_id: id,
      _read: patch.read ?? null,
      _ignore: patch.ignore ?? null,
      _snooze_until: patch.snooze ? patch.snooze.toISOString() : null,
    });
  };

  const value: Ctx = {
    notifications: decorated,
    loading,
    active,
    unreadCount,
    countsByPath,
    countsByCategory,
    forPath: (path) => active.filter((n) => (n.nav_path ?? EVENT_MAP[n.event_type]?.navPath) === path),
    forEventTypes: (types) => active.filter((n) => types.includes(n.event_type)),
    prefs,
    department,
    refresh: load,
    markRead: (id) => setState(id, { read: true }),
    markAllRead: async () => {
      const now = new Date().toISOString();
      setStates((prev) => {
        const next = { ...prev };
        decorated.forEach((n) => {
          next[n.id] = {
            notification_id: n.id,
            read_at: next[n.id]?.read_at ?? now,
            ignored_at: next[n.id]?.ignored_at ?? null,
            snoozed_until: next[n.id]?.snoozed_until ?? null,
          };
        });
        return next;
      });
      await supabase.rpc("admin_notifications_mark_all_read" as any);
    },
    ignore: (id) => setState(id, { ignore: true, read: true }),
    unignore: (id) => setState(id, { ignore: false }),
    snooze: (id, until) => setState(id, { snooze: until }),
    savePref: async (eventType, patch) => {
      if (!user) return;
      const current = prefs[eventType] ?? {
        in_app: defaultsForRole(eventType, department).inApp,
        email: defaultsForRole(eventType, department).email,
      };
      const next = { ...current, ...patch };
      setPrefs((p) => ({ ...p, [eventType]: next }));
      await supabase
        .from("admin_notification_prefs" as any)
        .upsert({ user_id: user.id, event_type: eventType, in_app: next.in_app, email: next.email }, { onConflict: "user_id,event_type" });
    },
  };

  return <AdminNotificationContext.Provider value={value}>{children}</AdminNotificationContext.Provider>;
}

export function useAdminNotifications() {
  const ctx = useContext(AdminNotificationContext);
  if (!ctx) {
    // Safe no-op fallback so pages can render outside the admin shell.
    return {
      notifications: [],
      loading: false,
      active: [],
      unreadCount: 0,
      countsByPath: {},
      countsByCategory: {},
      forPath: () => [],
      forEventTypes: () => [],
      prefs: {},
      department: null,
      refresh: async () => {},
      markRead: async () => {},
      markAllRead: async () => {},
      ignore: async () => {},
      unignore: async () => {},
      snooze: async () => {},
      savePref: async () => {},
    } as Ctx;
  }
  return ctx;
}
