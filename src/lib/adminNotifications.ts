/**
 * Admin notification system — shared catalogue & helpers.
 * One engine powers: sidebar counts, page-level alerts, and the global bell/history.
 */

export type NotificationPriority = "critical" | "action_required" | "attention" | "information";
export type NotificationStatus = "open" | "resolved";

export interface AdminNotification {
  id: string;
  category: string;
  event_type: string;
  entity_type: string | null;
  entity_id: string | null;
  title: string;
  message: string | null;
  priority: NotificationPriority;
  status: NotificationStatus;
  nav_path: string | null;
  action_url: string | null;
  metadata: Record<string, any>;
  created_at: string;
  resolved_at: string | null;
  resolution_note: string | null;
}

export interface AdminNotificationState {
  notification_id: string;
  read_at: string | null;
  ignored_at: string | null;
  snoozed_until: string | null;
}

export interface DecoratedNotification extends AdminNotification {
  read: boolean;
  ignored: boolean;
  snoozedUntil: string | null;
  /** Counts towards sidebar / page action badges */
  active: boolean;
}

export const CATEGORY_LABELS: Record<string, string> = {
  partners: "Partners",
  finance: "Finance / Payments",
  academy: "Academy",
  business: "Business",
  marketing: "Marketing / Sales",
  reports: "Reports",
  security: "Security",
};

export interface EventTypeMeta {
  eventType: string;
  label: string;
  category: string;
  navPath: string;
  actionLabel: string;
  /** Informational events never drive sidebar/page badges */
  informational?: boolean;
  /** Critical notifications cannot be ignored */
  notDismissible?: boolean;
  defaults: { inApp: boolean; email: boolean };
}

export const EVENT_TYPES: EventTypeMeta[] = [
  { eventType: "partner_application_pending", label: "New Partner Applications", category: "partners", navPath: "/admin/partners", actionLabel: "Review", defaults: { inApp: true, email: true } },
  { eventType: "partner_deal_pending", label: "New Deal Registrations", category: "partners", navPath: "/admin/partners", actionLabel: "Review", defaults: { inApp: true, email: true } },
  { eventType: "partner_access_issue", label: "Partner Portal Access Issues", category: "partners", navPath: "/admin/partners", actionLabel: "Fix", defaults: { inApp: true, email: false } },
  { eventType: "purchase_failed", label: "Failed Payments", category: "finance", navPath: "/admin/purchase-status", actionLabel: "View", notDismissible: false, defaults: { inApp: true, email: true } },
  { eventType: "purchase_stale_pending", label: "Pending Payment Issues", category: "finance", navPath: "/admin/purchase-status", actionLabel: "View", defaults: { inApp: true, email: true } },
  { eventType: "purchase_reconciliation", label: "Reconciliation Issues", category: "finance", navPath: "/admin/reconcile-purchases", actionLabel: "Reconcile", defaults: { inApp: true, email: true } },
  { eventType: "purchase_success", label: "Successful Purchase", category: "finance", navPath: "/admin/purchase-status", actionLabel: "View", informational: true, defaults: { inApp: false, email: false } },
  { eventType: "new_lead", label: "New Leads", category: "marketing", navPath: "/admin/forms", actionLabel: "View", defaults: { inApp: true, email: true } },
  { eventType: "demo_request", label: "Demo Requests", category: "marketing", navPath: "/admin/forms", actionLabel: "View", defaults: { inApp: true, email: true } },
  { eventType: "business_enquiry", label: "New Business Enquiries", category: "business", navPath: "/admin/business", actionLabel: "View", defaults: { inApp: true, email: true } },
  { eventType: "report_failed", label: "Report Failed", category: "reports", navPath: "/admin/reports", actionLabel: "Retry", defaults: { inApp: true, email: true } },
  { eventType: "report_sent", label: "Report Sent Successfully", category: "reports", navPath: "/admin/reports", actionLabel: "View", informational: true, defaults: { inApp: false, email: false } },
  { eventType: "security_issue", label: "Security Issues", category: "security", navPath: "/admin/security", actionLabel: "Review", notDismissible: true, defaults: { inApp: true, email: true } },
];

export const EVENT_MAP: Record<string, EventTypeMeta> = Object.fromEntries(
  EVENT_TYPES.map((e) => [e.eventType, e]),
);

/** Role-based defaults — used when an admin has no saved preference for an event type. */
export const ROLE_CATEGORY_DEFAULTS: Record<string, string[]> = {
  marketing: ["marketing", "academy", "business", "partners"],
  sales: ["marketing", "business", "partners"],
  finance: ["finance", "reports"],
  partner_management: ["partners"],
  management: ["partners", "finance", "reports", "security", "business"],
  super_admin: ["partners", "finance", "academy", "business", "marketing", "reports", "security"],
};

export function defaultsForRole(eventType: string, role?: string | null) {
  const meta = EVENT_MAP[eventType];
  if (!meta) return { inApp: true, email: false };
  if (!role) return meta.defaults;
  const cats = ROLE_CATEGORY_DEFAULTS[role];
  if (!cats) return meta.defaults;
  const relevant = cats.includes(meta.category);
  return { inApp: relevant && meta.defaults.inApp, email: relevant && meta.defaults.email };
}

export function priorityColour(priority: NotificationPriority) {
  switch (priority) {
    case "critical":
      return { badge: "bg-destructive text-destructive-foreground", text: "text-destructive", dot: "bg-destructive" };
    case "action_required":
      return { badge: "bg-amber-500 text-white", text: "text-amber-600", dot: "bg-amber-500" };
    case "attention":
      return { badge: "bg-amber-400/90 text-amber-950", text: "text-amber-600", dot: "bg-amber-400" };
    default:
      return { badge: "bg-muted text-muted-foreground", text: "text-muted-foreground", dot: "bg-muted-foreground" };
  }
}

export function priorityLabel(priority: NotificationPriority) {
  return (
    { critical: "Critical", action_required: "Action required", attention: "Attention", information: "Information" } as Record<string, string>
  )[priority] ?? priority;
}

export function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} minute${mins === 1 ? "" : "s"} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? "" : "s"} ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  return new Date(iso).toLocaleDateString();
}

export function groupByAge(items: DecoratedNotification[]) {
  const now = Date.now();
  const today: DecoratedNotification[] = [];
  const earlier: DecoratedNotification[] = [];
  const fresh: DecoratedNotification[] = [];
  for (const n of items) {
    const age = now - new Date(n.created_at).getTime();
    if (age < 60 * 60 * 1000) fresh.push(n);
    else if (age < 24 * 60 * 60 * 1000) today.push(n);
    else earlier.push(n);
  }
  return { fresh, today, earlier };
}
