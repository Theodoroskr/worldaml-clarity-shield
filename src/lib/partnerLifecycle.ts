/**
 * Partner Program lifecycle helpers.
 * Application status and Portal access are deliberately SEPARATE concepts.
 */

export type ApplicationStatus =
  | "pending"
  | "more_info"
  | "approved"
  | "rejected"
  | "withdrawn";

export type PortalAccess =
  | "not_granted"
  | "invitation_pending"
  | "active"
  | "suspended"
  | "revoked";

export const APPLICATION_STATUS_LABEL: Record<string, string> = {
  pending: "Pending review",
  more_info: "More information required",
  approved: "Approved",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
};

export const APPLICATION_STATUS_STYLE: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  more_info: "bg-blue-100 text-blue-800 border-blue-200",
  approved: "bg-green-100 text-green-800 border-green-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
  withdrawn: "bg-slate-100 text-slate-700 border-slate-200",
};

export const PORTAL_ACCESS_LABEL: Record<string, string> = {
  not_granted: "Not granted",
  invitation_pending: "Invitation pending",
  active: "Active",
  suspended: "Suspended",
  revoked: "Revoked",
};

export const PORTAL_ACCESS_STYLE: Record<string, string> = {
  not_granted: "bg-slate-100 text-slate-700 border-slate-200",
  invitation_pending: "bg-amber-100 text-amber-800 border-amber-200",
  active: "bg-green-100 text-green-800 border-green-200",
  suspended: "bg-orange-100 text-orange-800 border-orange-200",
  revoked: "bg-red-100 text-red-800 border-red-200",
};

/** Default commission per partner type (percentage points). */
export const DEFAULT_COMMISSION: Record<string, number> = {
  referral: 5,
  affiliate: 10,
  reseller: 15,
  technology: 10,
};

export function toPercent(rate: number | string | null | undefined): number {
  const r = Number(rate || 0);
  if (!r) return 0;
  return Math.round((r <= 1 ? r * 100 : r) * 10) / 10;
}

export function daysBetween(iso: string, now = Date.now()): number {
  return Math.max(0, Math.floor((now - new Date(iso).getTime()) / 86_400_000));
}

export function applicationAge(iso: string): string {
  const d = daysBetween(iso);
  if (d === 0) return "Submitted today";
  if (d === 1) return "1 day waiting";
  return `${d} days waiting`;
}

export function ageSeverity(iso: string, status: string): "ok" | "warn" | "late" {
  if (!["pending", "more_info"].includes(status)) return "ok";
  const d = daysBetween(iso);
  if (d >= 7) return "late";
  if (d >= 3) return "warn";
  return "ok";
}

export function emailDomain(email?: string | null): string | null {
  if (!email || !email.includes("@")) return null;
  return email.split("@")[1]!.toLowerCase().replace(/^www\./, "");
}

export function hostFromUrl(url?: string | null): string | null {
  if (!url) return null;
  try {
    return new URL(url.startsWith("http") ? url : `https://${url}`).hostname
      .toLowerCase()
      .replace(/^www\./, "");
  } catch {
    return null;
  }
}

export interface DuplicateHit {
  reason: string;
  partnerId?: string;
  applicationId?: string;
  label: string;
}

/** Non-destructive duplicate detection — surfaces possible matches for admin review only. */
export function findPossibleDuplicates(
  app: any,
  partners: any[],
  applications: any[],
): DuplicateHit[] {
  const hits: DuplicateHit[] = [];
  const domain = emailDomain(app.contact_email) || hostFromUrl(app.website);
  const company = (app.company_name || "").trim().toLowerCase();

  for (const p of partners) {
    if (p.user_id && p.user_id === app.user_id) {
      hits.push({
        reason: "Same WorldAML account already has a partner record",
        partnerId: p.id,
        label: p.display_name || p.referral_code,
      });
      continue;
    }
    const pHost = hostFromUrl(p.website_url);
    if (company && (p.display_name || "").trim().toLowerCase() === company) {
      hits.push({ reason: "Same company name", partnerId: p.id, label: p.display_name });
    } else if (domain && pHost && pHost === domain) {
      hits.push({ reason: "Same company domain", partnerId: p.id, label: p.display_name || pHost });
    }
  }

  for (const a of applications) {
    if (a.id === app.id) continue;
    const sameEmail =
      a.contact_email && app.contact_email &&
      a.contact_email.toLowerCase() === app.contact_email.toLowerCase();
    if (sameEmail) {
      hits.push({
        reason: `Earlier application (${APPLICATION_STATUS_LABEL[a.status] ?? a.status})`,
        applicationId: a.id,
        label: a.company_name,
      });
    }
  }

  // de-duplicate by label+reason
  const seen = new Set<string>();
  return hits.filter((h) => {
    const key = `${h.reason}|${h.label}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

const ACTION_LABEL: Record<string, string> = {
  partner_application_approved: "Partner Application Approved",
  partner_application_rejected: "Partner Application Rejected",
  partner_application_more_info_requested: "More Information Requested",
  partner_application_withdrawn: "Application Withdrawn",
  partner_application_reopened: "Application Reopened",
  partner_portal_activated: "Partner Portal Activated",
  partner_portal_suspended: "Partner Portal Suspended",
  partner_portal_revoked: "Partner Portal Revoked",
  partner_portal_access_changed: "Partner Portal Access Changed",
  approve_application: "Partner Application Approved",
  reject_application: "Partner Application Rejected",
  activate_partner: "Partner Set Active",
  deactivate_partner: "Partner Set Inactive",
  remove_partner: "Partner Relationship Removed",
  edit_partner_profile: "Partner Profile Edited",
  convert_deal_to_won: "Deal Converted to Won",
  update_deal_link: "Deal Customer Link Updated",
  deal_approved: "Deal Approved",
  deal_rejected: "Deal Rejected",
  deal_lost: "Deal Marked Lost",
  update_notification_settings: "Notification Preferences Updated",
  create_notification_settings: "Notification Preferences Created",
  remove_notification_settings: "Notification Recipient Removed",
};

export function auditActionLabel(action: string): string {
  return (
    ACTION_LABEL[action] ??
    action.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

const FIELD_LABEL: Record<string, string> = {
  commission_rate: "Commission",
  partner_type: "Partner type",
  portal_access: "Portal access",
  is_active: "Partner status",
  status: "Status",
  certification_level: "Certification",
  linked_customer_id: "Linked customer",
  actual_arr_eur: "Actual ARR",
};

function fmtValue(field: string, v: any): string {
  if (v === null || v === undefined || v === "") return "—";
  if (field === "commission_rate") return `${toPercent(v)}%`;
  if (field === "portal_access") return PORTAL_ACCESS_LABEL[String(v)] ?? String(v);
  if (field === "status") return APPLICATION_STATUS_LABEL[String(v)] ?? String(v);
  if (field === "is_active") return v ? "Active" : "Inactive";
  if (typeof v === "boolean") return v ? "Yes" : "No";
  if (Array.isArray(v)) return v.join(", ") || "—";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

/** Human-readable summary lines for an audit entry's `changes` JSON. */
export function summariseChanges(changes: any): string[] {
  if (!changes || typeof changes !== "object") return [];
  const lines: string[] = [];
  for (const [key, val] of Object.entries<any>(changes)) {
    const label = FIELD_LABEL[key] ?? key.replace(/_/g, " ");
    if (val && typeof val === "object" && !Array.isArray(val) && ("from" in val || "to" in val)) {
      const from = "from" in val ? fmtValue(key, val.from) : null;
      const to = fmtValue(key, val.to);
      lines.push(from !== null ? `${label}: ${from} → ${to}` : `${label}: ${to}`);
    } else {
      lines.push(`${label}: ${fmtValue(key, val)}`);
    }
  }
  return lines;
}
