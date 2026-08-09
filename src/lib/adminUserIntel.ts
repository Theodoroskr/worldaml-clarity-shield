/**
 * Admin → User Management intelligence layer.
 * Pure helpers: enrichment, filter engine, segments, column registry.
 * Adds capability only — no existing behaviour depends on these.
 */

export type UserType = "academy" | "business" | "partner" | "suite" | "platform";

export const USER_TYPE_LABELS: Record<UserType, string> = {
  academy: "Academy",
  business: "Business",
  partner: "Partner",
  suite: "Suite",
  platform: "Platform",
};

export type Lifecycle = "registered" | "engaged" | "paid" | "inactive";

export const LIFECYCLE_LABELS: Record<Lifecycle, string> = {
  registered: "Registered",
  engaged: "Engaged",
  paid: "Paid",
  inactive: "Inactive",
};

/** Consumer / free mailbox providers — everything else with a domain is treated as corporate. */
const PERSONAL_DOMAINS = new Set([
  "gmail.com", "googlemail.com", "yahoo.com", "yahoo.co.uk", "yahoo.gr", "ymail.com",
  "hotmail.com", "hotmail.co.uk", "outlook.com", "live.com", "msn.com", "aol.com",
  "icloud.com", "me.com", "mac.com", "proton.me", "protonmail.com", "gmx.com", "gmx.de",
  "mail.com", "mail.ru", "yandex.com", "yandex.ru", "zoho.com", "tutanota.com",
  "hotmail.gr", "cytanet.com.cy", "cablenet.com.cy", "qq.com", "163.com", "126.com",
  "web.de", "free.fr", "orange.fr", "libero.it", "hotmail.fr", "outlook.fr", "sky.com",
  "btinternet.com", "comcast.net", "verizon.net", "rediffmail.com", "inbox.lv",
]);

export const emailDomain = (email?: string | null): string => {
  const at = (email || "").toLowerCase().trim().split("@");
  return at.length === 2 && at[1].includes(".") ? at[1] : "";
};

export const isPersonalDomain = (domain: string) => !domain || PERSONAL_DOMAINS.has(domain);
export const isCorporateDomain = (domain: string) => !!domain && !PERSONAL_DOMAINS.has(domain);

export const DAY_MS = 86_400_000;

export const daysBetween = (iso: string | null | undefined, now = Date.now()): number | null => {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  if (isNaN(t)) return null;
  return Math.max(0, Math.floor((now - t) / DAY_MS));
};

/** "Today" · "1 day" · "32 days" · "1 year 2 months" */
export const formatAge = (days: number | null): string => {
  if (days === null) return "—";
  if (days === 0) return "Today";
  if (days === 1) return "1 day";
  if (days < 365) return `${days} days`;
  const years = Math.floor(days / 365);
  const months = Math.floor((days % 365) / 30);
  return `${years} year${years > 1 ? "s" : ""}${months ? ` ${months} month${months > 1 ? "s" : ""}` : ""}`;
};

export const formatDate = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

// ---------------------------------------------------------------- enrichment

export interface EnrichedUser {
  /** Original profile row — untouched. */
  p: Record<string, any>;
  id: string;
  userId: string;
  email: string;
  name: string;
  company: string;
  domain: string;
  corporate: boolean;
  country: string;
  jobTitle: string;
  registeredAt: string;
  accountAgeDays: number | null;
  lastActivityAt: string | null;
  daysInactive: number | null;
  types: UserType[];
  lifecycle: Lifecycle;
  revenueCents: number;
  currency: string;
  transactions: number;
  paidTransactions: number;
  paid: boolean;
  pendingPayment: boolean;
  abandonedCheckout: boolean;
  academyCourses: number;
  academyCompleted: number;
  certificates: number;
  annualPass: boolean;
  businessOrg: string | null;
  partnerStatus: string | null;
  roles: string[];
  status: string;
  tier: string;
  source: string;
  utm: Record<string, string>;
}

export interface EnrichInputs {
  roles: Record<string, string[]>;
  revenue: (p: any) => { total: number; currency: string; items: Array<{ status: string; date: string | null; source: string }> };
  lastSignIn: Record<string, string | null>;
  academy: Record<string, { courses: number; completed: number; lastAt: string | null }>;
  certificates: Record<string, number>;
  purchases: Record<string, { paid: number; pending: number; lastAt: string | null; annualPass: boolean }>;
  businessByEmail: Record<string, string>;
  partnerByUserId: Record<string, string>;
  isPartnerApplicant: (p: any) => boolean;
}

const maxIso = (...vals: Array<string | null | undefined>): string | null => {
  let best: string | null = null;
  for (const v of vals) {
    if (!v) continue;
    if (!best || new Date(v).getTime() > new Date(best).getTime()) best = v;
  }
  return best;
};

export function enrichUser(p: any, i: EnrichInputs, now = Date.now()): EnrichedUser {
  const email = (p.email || "").toLowerCase();
  const domain = emailDomain(email);
  const rv = i.revenue(p);
  const ac = i.academy[p.user_id] || { courses: 0, completed: 0, lastAt: null };
  const pu = i.purchases[p.user_id] || { paid: 0, pending: 0, lastAt: null, annualPass: false };
  const certs = i.certificates[p.user_id] || 0;
  const businessOrg = i.businessByEmail[email] || null;
  const partnerStatus = i.partnerByUserId[p.user_id] || (i.isPartnerApplicant(p) ? "applicant" : null);

  const types: UserType[] = [];
  const tier = String(p.subscription_tier || "free").toLowerCase();
  if (tier === "academy" || ac.courses > 0 || certs > 0 || pu.paid > 0 || pu.pending > 0) types.push("academy");
  if (businessOrg || tier === "business") types.push("business");
  if (partnerStatus) types.push("partner");
  if (tier === "suite" || tier === "enterprise" || p.suite_access_granted_at) types.push("suite");
  if (!types.length) types.push("platform");

  const lastActivityAt = maxIso(i.lastSignIn[p.user_id], ac.lastAt, pu.lastAt);
  const daysInactive = daysBetween(lastActivityAt, now);
  const accountAgeDays = daysBetween(p.created_at, now);

  const paid = rv.total > 0 || pu.paid > 0;
  let lifecycle: Lifecycle = "registered";
  if (paid) lifecycle = "paid";
  else if (ac.courses > 0 || certs > 0) lifecycle = "engaged";
  if (daysInactive !== null && daysInactive >= 90 && !paid) lifecycle = "inactive";
  if (lastActivityAt === null && (accountAgeDays ?? 0) > 30) lifecycle = "inactive";

  return {
    p,
    id: p.id,
    userId: p.user_id,
    email,
    name: p.full_name || [p.first_name, p.last_name].filter(Boolean).join(" ") || "",
    company: p.company_name || "",
    domain,
    corporate: isCorporateDomain(domain),
    country: p.country || "",
    jobTitle: p.job_title || "",
    registeredAt: p.created_at,
    accountAgeDays,
    lastActivityAt,
    daysInactive,
    types,
    lifecycle,
    revenueCents: rv.total,
    currency: rv.currency,
    transactions: rv.items.length,
    paidTransactions: rv.items.filter((x) => x.status === "paid").length,
    paid,
    pendingPayment: pu.pending > 0,
    abandonedCheckout: pu.pending > 0 && pu.paid === 0,
    academyCourses: ac.courses,
    academyCompleted: ac.completed,
    certificates: certs,
    annualPass: pu.annualPass,
    businessOrg,
    partnerStatus,
    roles: i.roles[p.user_id] || [],
    status: p.status,
    tier,
    source: p.signup_source || "",
    utm: (p.signup_utm || {}) as Record<string, string>,
  };
}

// ------------------------------------------------------------- date presets

export type DatePreset =
  | "today" | "yesterday" | "7d" | "30d" | "90d" | "this_month" | "last_month"
  | "this_quarter" | "this_year" | "all" | "custom";

export const DATE_PRESET_LABELS: Record<DatePreset, string> = {
  today: "Today",
  yesterday: "Yesterday",
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  "90d": "Last 90 days",
  this_month: "This month",
  last_month: "Last month",
  this_quarter: "This quarter",
  this_year: "This year",
  all: "All time",
  custom: "Custom range…",
};

export function resolveDatePreset(preset: DatePreset, from?: string, to?: string): { from: Date; to: Date } | null {
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  const start = (d: number) => new Date(now.getFullYear(), now.getMonth(), now.getDate() - d);
  switch (preset) {
    case "today": return { from: start(0), to: end };
    case "yesterday": return { from: start(1), to: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59, 999) };
    case "7d": return { from: start(7), to: end };
    case "30d": return { from: start(30), to: end };
    case "90d": return { from: start(90), to: end };
    case "this_month": return { from: new Date(now.getFullYear(), now.getMonth(), 1), to: end };
    case "last_month": return { from: new Date(now.getFullYear(), now.getMonth() - 1, 1), to: new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999) };
    case "this_quarter": return { from: new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1), to: end };
    case "this_year": return { from: new Date(now.getFullYear(), 0, 1), to: end };
    case "all": return { from: new Date(2000, 0, 1), to: end };
    case "custom": {
      if (!from || !to) return null;
      const f = new Date(`${from}T00:00:00`);
      const t = new Date(`${to}T23:59:59`);
      if (isNaN(f.getTime()) || isNaN(t.getTime()) || f > t) return null;
      return { from: f, to: t };
    }
  }
}

// ------------------------------------------------------------ filter engine

export type FilterOperator = "is" | "is_not" | "contains" | "gt" | "lt" | "between" | "in";

export interface FilterCondition {
  id: string;
  field: string;
  operator: FilterOperator;
  /** string for text/select, number for numeric, string[] for multi-select */
  value: any;
  value2?: any;
}

export interface FilterState {
  logic: "AND" | "OR";
  conditions: FilterCondition[];
}

export const EMPTY_FILTERS: FilterState = { logic: "AND", conditions: [] };

type FieldKind = "multi" | "select" | "text" | "number" | "date_preset";

export interface FieldDef {
  id: string;
  label: string;
  group: string;
  kind: FieldKind;
  options?: Array<{ value: string; label: string }>;
  /** dynamic option source key resolved by the UI (e.g. sources, countries, domains) */
  dynamic?: "source" | "country" | "domain" | "company" | "utm_source" | "utm_medium" | "utm_campaign" | "regulator" | "tier" | "role" | "product";
  get: (u: EnrichedUser) => any;
}

const num = (v: any) => (v === "" || v === null || v === undefined ? NaN : Number(v));

export const FIELD_DEFS: FieldDef[] = [
  // USER
  { id: "user_type", label: "User type", group: "User", kind: "multi", get: (u) => u.types,
    options: (Object.keys(USER_TYPE_LABELS) as UserType[]).map((v) => ({ value: v, label: USER_TYPE_LABELS[v] })) },
  { id: "status", label: "Status", group: "User", kind: "multi", get: (u) => [u.status],
    options: ["pending", "approved", "rejected"].map((v) => ({ value: v, label: v[0].toUpperCase() + v.slice(1) })) },
  { id: "role", label: "Role", group: "User", kind: "multi", dynamic: "role", get: (u) => (u.roles.length ? u.roles : ["user"]) },
  { id: "tier", label: "Tier", group: "User", kind: "multi", dynamic: "tier", get: (u) => [u.tier] },
  { id: "lifecycle", label: "Lifecycle", group: "User", kind: "multi", get: (u) => [u.lifecycle],
    options: (Object.keys(LIFECYCLE_LABELS) as Lifecycle[]).map((v) => ({ value: v, label: LIFECYCLE_LABELS[v] })) },
  { id: "registered", label: "Registration date", group: "User", kind: "date_preset", get: (u) => u.registeredAt },
  { id: "account_age", label: "Account age (days)", group: "User", kind: "number", get: (u) => u.accountAgeDays },
  { id: "days_inactive", label: "Days inactive", group: "User", kind: "number", get: (u) => u.daysInactive },
  { id: "never_active", label: "Never active", group: "User", kind: "select", get: (u) => (u.lastActivityAt ? "no" : "yes"),
    options: [{ value: "yes", label: "Never active" }, { value: "no", label: "Has activity" }] },
  // PROFILE
  { id: "country", label: "Country", group: "Profile", kind: "multi", dynamic: "country", get: (u) => (u.country ? [u.country] : []) },
  { id: "company", label: "Company", group: "Profile", kind: "text", get: (u) => u.company },
  { id: "domain", label: "Company domain", group: "Profile", kind: "multi", dynamic: "domain", get: (u) => (u.domain ? [u.domain] : []) },
  { id: "email_type", label: "Email type", group: "Profile", kind: "select", get: (u) => (u.corporate ? "corporate" : "personal"),
    options: [{ value: "corporate", label: "Corporate email" }, { value: "personal", label: "Personal email" }] },
  { id: "job_title", label: "Job title", group: "Profile", kind: "text", get: (u) => u.jobTitle },
  { id: "regulator", label: "Regulator", group: "Profile", kind: "multi", dynamic: "regulator", get: (u) => (u.p.regulator ? [u.p.regulator] : []) },
  // COMMERCIAL
  { id: "revenue", label: "Revenue (€)", group: "Commercial", kind: "number", get: (u) => u.revenueCents / 100 },
  { id: "transactions", label: "Transactions", group: "Commercial", kind: "number", get: (u) => u.transactions },
  { id: "paid", label: "Paid / unpaid", group: "Commercial", kind: "select", get: (u) => (u.paid ? "paid" : "free"),
    options: [{ value: "paid", label: "Paid users" }, { value: "free", label: "Free users" }] },
  { id: "payment_state", label: "Payment state", group: "Commercial", kind: "multi", get: (u) => [
      ...(u.paid ? ["paid"] : []),
      ...(u.pendingPayment ? ["pending"] : []),
      ...(u.abandonedCheckout ? ["abandoned"] : []),
      ...(u.paidTransactions > 1 ? ["repeat"] : []),
    ],
    options: [
      { value: "paid", label: "Has payment" },
      { value: "pending", label: "Pending payment" },
      { value: "abandoned", label: "Checkout abandoned" },
      { value: "repeat", label: "Repeat purchaser" },
    ] },
  // ACADEMY
  { id: "academy_courses", label: "Academy courses", group: "Academy", kind: "number", get: (u) => u.academyCourses },
  { id: "academy_completed", label: "Courses completed", group: "Academy", kind: "number", get: (u) => u.academyCompleted },
  { id: "certificates", label: "Certificates", group: "Academy", kind: "number", get: (u) => u.certificates },
  { id: "annual_pass", label: "Annual pass", group: "Academy", kind: "select", get: (u) => (u.annualPass ? "yes" : "no"),
    options: [{ value: "yes", label: "Has annual pass" }, { value: "no", label: "No annual pass" }] },
  // BUSINESS
  { id: "business_org", label: "Business organisation", group: "Business", kind: "text", get: (u) => u.businessOrg || "" },
  // PARTNER
  { id: "partner_status", label: "Partner status", group: "Partner", kind: "multi", get: (u) => (u.partnerStatus ? [u.partnerStatus] : []),
    options: [
      { value: "active", label: "Active partner" },
      { value: "inactive", label: "Inactive partner" },
      { value: "applicant", label: "Applicant" },
    ] },
  // ACQUISITION
  { id: "source", label: "Source", group: "Acquisition", kind: "multi", dynamic: "source", get: (u) => (u.source ? [u.source] : []) },
  { id: "utm_source", label: "UTM source", group: "Acquisition", kind: "multi", dynamic: "utm_source", get: (u) => (u.utm.utm_source ? [u.utm.utm_source] : []) },
  { id: "utm_medium", label: "UTM medium", group: "Acquisition", kind: "multi", dynamic: "utm_medium", get: (u) => (u.utm.utm_medium ? [u.utm.utm_medium] : []) },
  { id: "utm_campaign", label: "UTM campaign", group: "Acquisition", kind: "multi", dynamic: "utm_campaign", get: (u) => (u.utm.utm_campaign ? [u.utm.utm_campaign] : []) },
  { id: "referrer", label: "Referrer", group: "Acquisition", kind: "text", get: (u) => u.p.signup_referrer || "" },
  { id: "landing_page", label: "Landing page", group: "Acquisition", kind: "text", get: (u) => u.p.signup_landing_path || "" },
];

export const FIELD_BY_ID = Object.fromEntries(FIELD_DEFS.map((f) => [f.id, f])) as Record<string, FieldDef>;

function matchCondition(u: EnrichedUser, c: FilterCondition): boolean {
  const def = FIELD_BY_ID[c.field];
  if (!def) return true;
  const raw = def.get(u);

  if (def.kind === "date_preset") {
    const range = resolveDatePreset((c.value || "all") as DatePreset, c.value2?.from, c.value2?.to);
    if (!range) return true;
    const t = raw ? new Date(raw).getTime() : NaN;
    return !isNaN(t) && t >= range.from.getTime() && t <= range.to.getTime();
  }

  if (def.kind === "number") {
    const v = Number(raw);
    if (raw === null || raw === undefined || isNaN(v)) return false;
    const a = num(c.value);
    const b = num(c.value2);
    if (c.operator === "gt") return !isNaN(a) && v > a;
    if (c.operator === "lt") return !isNaN(a) && v < a;
    if (c.operator === "between") return (isNaN(a) || v >= a) && (isNaN(b) || v <= b);
    return !isNaN(a) && v === a;
  }

  if (def.kind === "text") {
    const s = String(raw || "").toLowerCase();
    const q = String(c.value || "").toLowerCase().trim();
    if (!q) return true;
    return c.operator === "is_not" ? !s.includes(q) : s.includes(q);
  }

  if (def.kind === "select") {
    if (!c.value) return true;
    return c.operator === "is_not" ? raw !== c.value : raw === c.value;
  }

  // multi
  const values: string[] = Array.isArray(c.value) ? c.value : c.value ? [c.value] : [];
  if (!values.length) return true;
  const owned: string[] = Array.isArray(raw) ? raw.map(String) : raw ? [String(raw)] : [];
  const hit = values.some((v) => owned.includes(v));
  return c.operator === "is_not" ? !hit : hit;
}

export function applyIntelFilters(users: EnrichedUser[], state: FilterState): EnrichedUser[] {
  const active = state.conditions.filter((c) => {
    if (Array.isArray(c.value)) return c.value.length > 0;
    return c.value !== "" && c.value !== null && c.value !== undefined;
  });
  if (!active.length) return users;
  return users.filter((u) =>
    state.logic === "OR" ? active.some((c) => matchCondition(u, c)) : active.every((c) => matchCondition(u, c)),
  );
}

export const describeCondition = (c: FilterCondition): string => {
  const def = FIELD_BY_ID[c.field];
  if (!def) return "";
  const opWord = c.operator === "is_not" ? "not " : c.operator === "gt" ? "> " : c.operator === "lt" ? "< " : "";
  if (def.kind === "date_preset") {
    const label = DATE_PRESET_LABELS[(c.value || "all") as DatePreset];
    return `${def.label}: ${c.value === "custom" ? `${c.value2?.from || "?"} → ${c.value2?.to || "?"}` : label}`;
  }
  if (def.kind === "between" as any) return `${def.label}: ${c.value}–${c.value2}`;
  if (c.operator === "between") return `${def.label}: ${c.value ?? "?"}–${c.value2 ?? "?"}`;
  const val = Array.isArray(c.value)
    ? c.value.map((v) => def.options?.find((o) => o.value === v)?.label || v).join(", ")
    : def.options?.find((o) => o.value === c.value)?.label || String(c.value ?? "");
  return `${def.label}: ${opWord}${val}`;
};

let seq = 0;
export const newCondition = (field = "user_type"): FilterCondition => {
  const def = FIELD_BY_ID[field];
  seq += 1;
  return {
    id: `c${Date.now()}_${seq}`,
    field,
    operator: def?.kind === "number" ? "gt" : "is",
    value: def?.kind === "multi" ? [] : def?.kind === "date_preset" ? "30d" : "",
  };
};

// --------------------------------------------------------------- segments

export interface QuickSegment {
  id: string;
  label: string;
  description: string;
  category: "General" | "Marketing" | "Sales" | "Finance";
  state: FilterState;
}

const cond = (field: string, patch: Partial<FilterCondition>): FilterCondition => ({ ...newCondition(field), ...patch });

export const QUICK_SEGMENTS: QuickSegment[] = [
  { id: "all", label: "All users", description: "No filters applied", category: "General", state: { logic: "AND", conditions: [] } },
  { id: "new_7", label: "New — last 7 days", description: "Registered in the last 7 days", category: "General",
    state: { logic: "AND", conditions: [cond("registered", { value: "7d" })] } },
  { id: "new_30", label: "New — last 30 days", description: "Registered in the last 30 days", category: "General",
    state: { logic: "AND", conditions: [cond("registered", { value: "30d" })] } },
  { id: "academy", label: "Academy", description: "Users with Academy access or activity", category: "General",
    state: { logic: "AND", conditions: [cond("user_type", { value: ["academy"] })] } },
  { id: "business", label: "Business", description: "Users linked to a business account", category: "General",
    state: { logic: "AND", conditions: [cond("user_type", { value: ["business"] })] } },
  { id: "partners", label: "Partners", description: "Partner records and applicants", category: "General",
    state: { logic: "AND", conditions: [cond("user_type", { value: ["partner"] })] } },
  { id: "paid", label: "Paid users", description: "Users with at least one confirmed payment", category: "Finance",
    state: { logic: "AND", conditions: [cond("paid", { value: "paid" })] } },
  { id: "corporate", label: "Corporate users", description: "Registered with a corporate email domain", category: "Sales",
    state: { logic: "AND", conditions: [cond("email_type", { value: "corporate" })] } },
  { id: "inactive_90", label: "Inactive 90+ days", description: "No sign-in or Academy activity for 90+ days", category: "Marketing",
    state: { logic: "AND", conditions: [cond("days_inactive", { operator: "gt", value: 90 })] } },
  { id: "academy_no_purchase", label: "Academy — no purchase", description: "Academy users who never paid", category: "Marketing",
    state: { logic: "AND", conditions: [cond("user_type", { value: ["academy"] }), cond("paid", { value: "free" })] } },
  { id: "checkout_abandoned", label: "Checkout abandoned", description: "Started checkout, no confirmed payment", category: "Marketing",
    state: { logic: "AND", conditions: [cond("payment_state", { value: ["abandoned"] })] } },
  { id: "corporate_academy", label: "Corporate Academy users", description: "Academy learners on corporate domains", category: "Marketing",
    state: { logic: "AND", conditions: [cond("user_type", { value: ["academy"] }), cond("email_type", { value: "corporate" })] } },
  { id: "corporate_no_purchase", label: "Corporate — no purchase", description: "Corporate domain, zero revenue", category: "Sales",
    state: { logic: "AND", conditions: [cond("email_type", { value: "corporate" }), cond("paid", { value: "free" })] } },
  { id: "business_no_purchase", label: "Business — no purchase", description: "Business signups with no revenue", category: "Sales",
    state: { logic: "AND", conditions: [cond("user_type", { value: ["business"] }), cond("paid", { value: "free" })] } },
  { id: "cross_sell", label: "Partner + Business", description: "Users in both partner and business portals", category: "Sales",
    state: { logic: "AND", conditions: [cond("user_type", { value: ["partner"] }), cond("user_type", { value: ["business"] })] } },
  { id: "high_value", label: "High-value users", description: "Revenue above €200", category: "Finance",
    state: { logic: "AND", conditions: [cond("revenue", { operator: "gt", value: 200 })] } },
  { id: "repeat", label: "Repeat purchasers", description: "More than one paid transaction", category: "Finance",
    state: { logic: "AND", conditions: [cond("payment_state", { value: ["repeat"] })] } },
  { id: "pending_payment", label: "Pending payment", description: "Purchases awaiting confirmation", category: "Finance",
    state: { logic: "AND", conditions: [cond("payment_state", { value: ["pending"] })] } },
];

// saved segments (filter configuration only — never user records)
const SEG_KEY = "worldaml.admin.userSegments.v1";

export interface SavedSegment { id: string; name: string; state: FilterState; createdAt: string }

export const loadSavedSegments = (): SavedSegment[] => {
  try { return JSON.parse(localStorage.getItem(SEG_KEY) || "[]"); } catch { return []; }
};
export const saveSegment = (name: string, state: FilterState): SavedSegment[] => {
  const list = loadSavedSegments().filter((s) => s.name !== name);
  const next = [...list, { id: `s${Date.now()}`, name, state, createdAt: new Date().toISOString() }];
  localStorage.setItem(SEG_KEY, JSON.stringify(next));
  return next;
};
export const deleteSegment = (id: string): SavedSegment[] => {
  const next = loadSavedSegments().filter((s) => s.id !== id);
  localStorage.setItem(SEG_KEY, JSON.stringify(next));
  return next;
};

// ----------------------------------------------------------------- columns

export interface ColumnDef { id: string; label: string; optional: boolean; group: string }

export const COLUMN_DEFS: ColumnDef[] = [
  { id: "user", label: "User", optional: false, group: "Core" },
  { id: "company", label: "Company", optional: false, group: "Core" },
  { id: "revenue", label: "Revenue", optional: false, group: "Core" },
  { id: "status", label: "Status", optional: false, group: "Core" },
  { id: "tier", label: "Tier", optional: false, group: "Core" },
  { id: "source", label: "Source", optional: false, group: "Core" },
  { id: "regulator", label: "Regulator", optional: false, group: "Core" },
  { id: "roles", label: "Roles", optional: false, group: "Core" },
  { id: "registered", label: "Registered", optional: false, group: "Core" },
  { id: "user_type", label: "User type", optional: true, group: "Added" },
  { id: "account_age", label: "Account age", optional: true, group: "Added" },
  { id: "last_activity", label: "Last activity", optional: true, group: "Added" },
  { id: "days_inactive", label: "Days inactive", optional: true, group: "Added" },
  { id: "country", label: "Country", optional: true, group: "Added" },
  { id: "job_title", label: "Job title", optional: true, group: "Added" },
  { id: "domain", label: "Domain", optional: true, group: "Added" },
  { id: "transactions", label: "Transactions", optional: true, group: "Added" },
  { id: "academy", label: "Academy courses", optional: true, group: "Added" },
  { id: "business", label: "Business account", optional: true, group: "Added" },
  { id: "partner", label: "Partner status", optional: true, group: "Added" },
  { id: "lifecycle", label: "Lifecycle", optional: true, group: "Added" },
  { id: "actions", label: "Actions", optional: false, group: "Core" },
];

const COL_KEY = "worldaml.admin.userColumns.v1";
export const DEFAULT_VISIBLE_COLUMNS = [
  ...COLUMN_DEFS.filter((c) => !c.optional).map((c) => c.id),
  "user_type", "account_age",
];
export const loadColumns = (): string[] => {
  try {
    const v = JSON.parse(localStorage.getItem(COL_KEY) || "null");
    return Array.isArray(v) && v.length ? v : DEFAULT_VISIBLE_COLUMNS;
  } catch { return DEFAULT_VISIBLE_COLUMNS; }
};
export const persistColumns = (ids: string[]) => localStorage.setItem(COL_KEY, JSON.stringify(ids));

// ------------------------------------------------------------------ sorting

export type SortKey = "registered" | "account_age" | "last_activity" | "revenue" | "transactions" | "company" | "name";

export const SORT_LABELS: Record<SortKey, string> = {
  registered: "Registered",
  account_age: "Account age",
  last_activity: "Last activity",
  revenue: "Revenue",
  transactions: "Transactions",
  company: "Company",
  name: "Name",
};

export function sortUsers(list: EnrichedUser[], key: SortKey, dir: "asc" | "desc"): EnrichedUser[] {
  const sign = dir === "asc" ? 1 : -1;
  const val = (u: EnrichedUser): number | string => {
    switch (key) {
      case "registered": return new Date(u.registeredAt || 0).getTime();
      case "account_age": return u.accountAgeDays ?? -1;
      case "last_activity": return u.lastActivityAt ? new Date(u.lastActivityAt).getTime() : -1;
      case "revenue": return u.revenueCents;
      case "transactions": return u.transactions;
      case "company": return (u.company || u.domain || "").toLowerCase();
      case "name": return (u.name || u.email).toLowerCase();
    }
  };
  return [...list].sort((a, b) => {
    const x = val(a), y = val(b);
    if (typeof x === "string" || typeof y === "string") return String(x).localeCompare(String(y)) * sign;
    return (x - y) * sign;
  });
}

// ------------------------------------------------------------ domain groups

export const groupByDomain = (users: EnrichedUser[]) => {
  const map = new Map<string, EnrichedUser[]>();
  users.forEach((u) => {
    if (!u.corporate) return;
    const list = map.get(u.domain) || [];
    list.push(u);
    map.set(u.domain, list);
  });
  return [...map.entries()]
    .map(([domain, list]) => ({
      domain,
      count: list.length,
      revenueCents: list.reduce((s, u) => s + u.revenueCents, 0),
      companies: [...new Set(list.map((u) => u.company).filter(Boolean))],
    }))
    .filter((d) => d.count > 1)
    .sort((a, b) => b.count - a.count);
};

// ------------------------------------------------------------- export fields

export interface ExportFieldDef { id: string; label: string; group: string; value: (u: EnrichedUser) => string | number }

export const EXPORT_FIELDS: ExportFieldDef[] = [
  { id: "full_name", label: "Name", group: "User information", value: (u) => u.name },
  { id: "email", label: "Email", group: "User information", value: (u) => u.email },
  { id: "company_name", label: "Company", group: "User information", value: (u) => u.company },
  { id: "company_domain", label: "Company domain", group: "User information", value: (u) => u.domain },
  { id: "email_type", label: "Email type", group: "User information", value: (u) => (u.corporate ? "corporate" : "personal") },
  { id: "country", label: "Country", group: "User information", value: (u) => u.country },
  { id: "job_title", label: "Job title", group: "User information", value: (u) => u.jobTitle },
  { id: "phone", label: "Phone", group: "User information", value: (u) => u.p.phone || "" },

  { id: "registered_at", label: "Registration date", group: "Account", value: (u) => u.registeredAt },
  { id: "account_age_days", label: "Account age (days)", group: "Account", value: (u) => u.accountAgeDays ?? "" },
  { id: "user_type", label: "User type", group: "Account", value: (u) => u.types.map((t) => USER_TYPE_LABELS[t]).join("|") },
  { id: "status", label: "Status", group: "Account", value: (u) => u.status },
  { id: "tier", label: "Tier", group: "Account", value: (u) => u.tier },
  { id: "roles", label: "Roles", group: "Account", value: (u) => (u.roles.length ? u.roles.join("|") : "user") },
  { id: "regulator", label: "Regulator", group: "Account", value: (u) => u.p.regulator || "" },
  { id: "lifecycle", label: "Lifecycle", group: "Account", value: (u) => LIFECYCLE_LABELS[u.lifecycle] },

  { id: "last_activity", label: "Last activity", group: "Activity", value: (u) => u.lastActivityAt || "" },
  { id: "days_inactive", label: "Days inactive", group: "Activity", value: (u) => u.daysInactive ?? "" },

  { id: "revenue_eur", label: "Revenue", group: "Commercial", value: (u) => (u.revenueCents / 100).toFixed(2) },
  { id: "revenue_currency", label: "Currency", group: "Commercial", value: (u) => u.currency },
  { id: "transactions", label: "Transactions", group: "Commercial", value: (u) => u.transactions },
  { id: "paid_transactions", label: "Paid transactions", group: "Commercial", value: (u) => u.paidTransactions },

  { id: "academy_courses", label: "Academy courses", group: "Academy", value: (u) => u.academyCourses },
  { id: "academy_completed", label: "Courses completed", group: "Academy", value: (u) => u.academyCompleted },
  { id: "paid_learner", label: "Paid learner", group: "Academy", value: (u) => (u.types.includes("academy") && u.paid ? "yes" : "no") },
  { id: "certificates", label: "Certificates", group: "Academy", value: (u) => u.certificates },
  { id: "annual_pass", label: "Annual pass", group: "Academy", value: (u) => (u.annualPass ? "yes" : "no") },

  { id: "business_org", label: "Business organisation", group: "Business & Partner", value: (u) => u.businessOrg || "" },
  { id: "partner_status", label: "Partner status", group: "Business & Partner", value: (u) => u.partnerStatus || "" },

  { id: "signup_source", label: "Source", group: "Acquisition", value: (u) => u.source },
  { id: "utm_source", label: "UTM source", group: "Acquisition", value: (u) => u.utm.utm_source || "" },
  { id: "utm_medium", label: "UTM medium", group: "Acquisition", value: (u) => u.utm.utm_medium || "" },
  { id: "utm_campaign", label: "UTM campaign", group: "Acquisition", value: (u) => u.utm.utm_campaign || "" },
  { id: "landing_page", label: "Landing page", group: "Acquisition", value: (u) => u.p.signup_landing_path || "" },
  { id: "referrer", label: "Referrer", group: "Acquisition", value: (u) => u.p.signup_referrer || "" },

  { id: "marketing_consent", label: "Marketing consent", group: "Consent", value: (u) => (u.p.marketing_consent ? "yes" : "no") },
  { id: "marketing_opted_out", label: "Marketing opted out", group: "Consent", value: (u) => (u.p.marketing_opt_out_at ? "yes" : "no") },
];

export const DEFAULT_EXPORT_FIELDS = [
  "full_name", "email", "company_name", "company_domain", "country", "job_title",
  "registered_at", "account_age_days", "user_type", "status", "tier", "roles",
  "last_activity", "days_inactive", "revenue_eur", "transactions",
];

// ------------------------------------------------------------ growth series

export const buildGrowthSeries = (
  users: EnrichedUser[],
  granularity: "day" | "week" | "month",
  months = 12,
) => {
  const now = new Date();
  const bucketKey = (d: Date) => {
    if (granularity === "month") return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (granularity === "week") {
      const monday = new Date(d);
      monday.setDate(d.getDate() - ((d.getDay() + 6) % 7));
      return monday.toISOString().slice(0, 10);
    }
    return d.toISOString().slice(0, 10);
  };
  const cutoff = granularity === "day"
    ? new Date(now.getTime() - 30 * DAY_MS)
    : granularity === "week"
      ? new Date(now.getTime() - 12 * 7 * DAY_MS)
      : new Date(now.getFullYear(), now.getMonth() - months + 1, 1);

  const map = new Map<string, { key: string; all: number; academy: number; business: number; partner: number }>();
  users.forEach((u) => {
    const d = new Date(u.registeredAt);
    if (isNaN(d.getTime()) || d < cutoff) return;
    const k = bucketKey(d);
    const row = map.get(k) || { key: k, all: 0, academy: 0, business: 0, partner: 0 };
    row.all += 1;
    if (u.types.includes("academy")) row.academy += 1;
    if (u.types.includes("business")) row.business += 1;
    if (u.types.includes("partner")) row.partner += 1;
    map.set(k, row);
  });
  return [...map.values()].sort((a, b) => a.key.localeCompare(b.key));
};

export const topCounts = (users: EnrichedUser[], pick: (u: EnrichedUser) => string, limit = 5) => {
  const m = new Map<string, number>();
  users.forEach((u) => {
    const v = pick(u);
    if (!v) return;
    m.set(v, (m.get(v) || 0) + 1);
  });
  return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit).map(([label, count]) => ({ label, count }));
};
