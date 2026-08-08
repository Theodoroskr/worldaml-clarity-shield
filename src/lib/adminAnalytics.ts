/**
 * Shared types, date logic and formatting helpers for the internal Admin
 * analytics layer. Every figure originates from `public.admin_analytics`,
 * a read-only, admin-only aggregate over the existing production tables.
 */

export type RangeKey =
  | "today"
  | "last_7_days"
  | "last_30_days"
  | "this_month"
  | "last_month"
  | "this_quarter"
  | "this_year"
  | "custom";

export const RANGE_LABELS: Record<RangeKey, string> = {
  today: "Today",
  last_7_days: "Last 7 days",
  last_30_days: "Last 30 days",
  this_month: "This month",
  last_month: "Last month",
  this_quarter: "This quarter",
  this_year: "This year",
  custom: "Custom",
};

export type PortalKey = "all" | "academy" | "business" | "partners" | "platform" | "marketing";

export const PORTAL_LABELS: Record<PortalKey, string> = {
  all: "All WorldAML",
  academy: "Academy",
  business: "Business",
  partners: "Partners",
  platform: "Platform / Suite",
  marketing: "Marketing",
};

export interface DateRange {
  from: Date;
  to: Date;
}

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

export function resolveRange(key: RangeKey, custom?: Partial<DateRange>): DateRange {
  const now = new Date();
  const todayStart = startOfDay(now);
  const endOfToday = new Date(todayStart.getTime() + 86_400_000);

  switch (key) {
    case "today":
      return { from: todayStart, to: endOfToday };
    case "last_7_days":
      return { from: new Date(todayStart.getTime() - 6 * 86_400_000), to: endOfToday };
    case "last_30_days":
      return { from: new Date(todayStart.getTime() - 29 * 86_400_000), to: endOfToday };
    case "this_month":
      return { from: new Date(now.getFullYear(), now.getMonth(), 1), to: endOfToday };
    case "last_month":
      return {
        from: new Date(now.getFullYear(), now.getMonth() - 1, 1),
        to: new Date(now.getFullYear(), now.getMonth(), 1),
      };
    case "this_quarter": {
      const q = Math.floor(now.getMonth() / 3) * 3;
      return { from: new Date(now.getFullYear(), q, 1), to: endOfToday };
    }
    case "this_year":
      return { from: new Date(now.getFullYear(), 0, 1), to: endOfToday };
    case "custom":
      return {
        from: custom?.from ?? new Date(todayStart.getTime() - 29 * 86_400_000),
        to: custom?.to ?? endOfToday,
      };
  }
}

/** True when the selected window has not finished yet — comparisons are then partial. */
export function isPartialPeriod(range: DateRange): boolean {
  return range.to.getTime() > Date.now();
}

// ── Shape returned by public.admin_analytics ────────────────────────────────

export interface SeriesPoint {
  date: string;
  users: number;
  leads: number;
  revenue_cents: number;
  orders: number;
  certificates: number;
  starts: number;
  searches: number;
  business_signups: number;
}

export interface LabelCount {
  label: string;
  n: number;
}

export interface AdminAnalytics {
  generated_at: string;
  period: { from: string; to: string; prev_from: string; prev_to: string };
  lifetime: Record<string, number>;
  current: Record<string, number>;
  previous: Record<string, number>;
  series: SeriesPoint[];
  academy: {
    learners_with_activity: number;
    paying_users: number;
    repeat_purchasers: number;
    completion_rate: number;
    no_activity_users: number;
    top_courses: { title: string; slug: string; enrolments: number; completions: number }[];
    revenue_by_course: { slug: string; orders: number; revenue_cents: number }[];
    funnel: { signups: number; started: number; completed: number; certified: number };
  };
  business: {
    total: number;
    entitlements: number;
    active_entitlements: number;
    members: number;
    by_status: Record<string, number>;
    funnel: {
      signups: number;
      solutions_viewed: number;
      product_viewed: number;
      checkout_started: number;
      purchased: number;
    };
    top_products: { product: string; views: number }[];
  };
  partners: {
    active: number;
    by_type: Record<string, number>;
    by_certification: Record<string, number>;
    deals_by_status: Record<string, number>;
    pipeline_eur: number;
    won_eur: number;
    avg_deal_eur: number;
    commission_earned_cents: number;
    commission_paid_cents: number;
    referrals: number;
    funnel: {
      applications: number;
      approved: number;
      registered_deal: number;
      approved_deal: number;
      won_deal: number;
    };
    top_partners: { name: string; deals: number; pipeline_eur: number }[];
  };
  marketing: {
    by_form_type: LabelCount[];
    by_status: Record<string, number>;
    by_country: LabelCount[];
    by_referrer: LabelCount[];
    by_utm_source: LabelCount[];
    by_signup_source: LabelCount[];
  };
  actions: Record<string, number>;
}

// ── Formatting ──────────────────────────────────────────────────────────────

export const fmtNum = (v: number | null | undefined) =>
  v === null || v === undefined ? "—" : Number(v).toLocaleString();

export const fmtEurCents = (cents: number | null | undefined) =>
  cents === null || cents === undefined
    ? "—"
    : `€${(Number(cents) / 100).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

export const fmtEur = (units: number | null | undefined) =>
  units === null || units === undefined
    ? "—"
    : `€${Number(units).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

/** Percentage change vs the previous equal-length period. Null when not meaningful. */
export function pctChange(current?: number, previous?: number): number | null {
  if (current === undefined || previous === undefined) return null;
  if (previous === 0) return current === 0 ? 0 : null; // no baseline → no misleading %
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

export function rate(numerator?: number, denominator?: number): string {
  if (!denominator) return "—";
  return `${Math.round(((numerator ?? 0) / denominator) * 1000) / 10}%`;
}
