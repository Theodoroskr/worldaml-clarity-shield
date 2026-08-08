// Shared definitions for the Academy admin reporting pages (Signups, Funnel,
// Purchase Status, Reconciliation). Keeping them in one place guarantees the
// four pages use identical rules for "corporate", "paid learner", ranges, etc.
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const FREE_EMAIL_DOMAINS = new Set([
  "gmail.com", "googlemail.com", "yahoo.com", "yahoo.co.uk", "yahoo.co.in",
  "outlook.com", "hotmail.com", "hotmail.co.uk", "live.com", "msn.com",
  "icloud.com", "me.com", "mac.com", "protonmail.com", "proton.me",
  "gmx.com", "gmx.de", "aol.com", "mail.com", "mail.ru", "yandex.com",
  "yandex.ru", "zoho.com", "qq.com", "163.com", "126.com", "web.de",
]);

export const domainOf = (email: string | null | undefined): string => {
  if (!email) return "";
  const at = email.lastIndexOf("@");
  return at >= 0 ? email.slice(at + 1).trim().toLowerCase() : "";
};

export const isCorporateEmail = (email: string | null | undefined): boolean => {
  const d = domainOf(email);
  return !!d && !FREE_EMAIL_DOMAINS.has(d);
};

export const ANNUAL_PASS_SLUG = "__annual_pass__";

/** Fallback pretty-printer for a course slug when no DB title exists. */
export const prettySlug = (slug: string): string => {
  if (slug === ANNUAL_PASS_SLUG) return "Annual All-Access Pass";
  return slug
    .replace(/^__|__$/g, "")
    .split("-")
    .map((w) => (w.length <= 3 ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(" ");
};

/** slug → human course title, from academy_courses (falls back to prettySlug). */
export function useCourseTitles() {
  const q = useQuery({
    queryKey: ["admin-academy-course-titles"],
    staleTime: 10 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("academy_courses")
        .select("id, slug, title");
      if (error) throw error;
      const bySlug = new Map<string, string>();
      const byId = new Map<string, string>();
      (data ?? []).forEach((c: any) => {
        bySlug.set(c.slug, c.title);
        byId.set(c.id, c.slug);
      });
      return { bySlug, byId };
    },
  });
  const titleOf = (slug: string) => q.data?.bySlug.get(slug) ?? prettySlug(slug);
  return { titleOf, slugById: (id: string) => q.data?.byId.get(id) ?? id, isLoading: q.isLoading };
}

/* ------------------------------------------------------------------ */
/* Date ranges                                                         */
/* ------------------------------------------------------------------ */

export type RangeKey =
  | "today" | "7d" | "30d" | "this_month" | "last_month"
  | "this_quarter" | "this_year" | "all" | "custom";

export const RANGE_OPTIONS: { value: RangeKey; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "this_month", label: "This month" },
  { value: "last_month", label: "Last month" },
  { value: "this_quarter", label: "This quarter" },
  { value: "this_year", label: "This year" },
  { value: "all", label: "All time (lifetime)" },
  { value: "custom", label: "Custom…" },
];

export interface ResolvedRange {
  start: number;
  end: number;
  label: string;
  isLifetime: boolean;
}

export function resolveRange(
  key: RangeKey,
  customFrom?: string,
  customTo?: string,
): ResolvedRange {
  const now = new Date();
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999).getTime();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const label = RANGE_OPTIONS.find((o) => o.value === key)?.label ?? "";

  switch (key) {
    case "today":
      return { start: startOfToday, end: endOfToday, label: "Today", isLifetime: false };
    case "7d":
      return { start: endOfToday - 7 * 86400000, end: endOfToday, label, isLifetime: false };
    case "30d":
      return { start: endOfToday - 30 * 86400000, end: endOfToday, label, isLifetime: false };
    case "this_month":
      return { start: new Date(now.getFullYear(), now.getMonth(), 1).getTime(), end: endOfToday, label, isLifetime: false };
    case "last_month": {
      const s = new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime();
      const e = new Date(now.getFullYear(), now.getMonth(), 1).getTime() - 1;
      return { start: s, end: e, label, isLifetime: false };
    }
    case "this_quarter": {
      const qStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1).getTime();
      return { start: qStart, end: endOfToday, label, isLifetime: false };
    }
    case "this_year":
      return { start: new Date(now.getFullYear(), 0, 1).getTime(), end: endOfToday, label, isLifetime: false };
    case "custom": {
      const s = customFrom ? new Date(customFrom).getTime() : 0;
      const e = customTo ? new Date(customTo).getTime() + 86_399_999 : endOfToday;
      return {
        start: s,
        end: e,
        label: `${customFrom || "start"} → ${customTo || "today"}`,
        isLifetime: false,
      };
    }
    case "all":
    default:
      return { start: 0, end: Number.MAX_SAFE_INTEGER, label: "Lifetime", isLifetime: true };
  }
}

export const inRange = (ts: string | null | undefined, r: ResolvedRange): boolean => {
  if (!ts) return false;
  const t = new Date(ts).getTime();
  return t >= r.start && t <= r.end;
};

/* ------------------------------------------------------------------ */
/* Money                                                               */
/* ------------------------------------------------------------------ */

const SYMBOL: Record<string, string> = { eur: "€", usd: "$", gbp: "£" };

export const money = (cents: number, currency = "eur"): string => {
  const c = (currency || "eur").toLowerCase();
  const sym = SYMBOL[c];
  const amount = (cents / 100).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return sym ? `${sym}${amount}` : `${amount} ${c.toUpperCase()}`;
};

export const pct = (n: number, d: number): number =>
  d === 0 ? 0 : Math.round((n / d) * 1000) / 10;

/* ------------------------------------------------------------------ */
/* Metric definitions (shown in the "How these metrics are calculated" */
/* drawer on every Academy admin page)                                 */
/* ------------------------------------------------------------------ */

export interface MetricDefinition {
  term: string;
  detail: string;
}

export const ACADEMY_DEFINITIONS: MetricDefinition[] = [
  {
    term: "Signup",
    detail:
      "A row in profiles, counted by profiles.created_at. Every WorldAML account (Academy, Business, Partner) creates a profile, so signups are platform-wide top-of-funnel, not Academy-only.",
  },
  {
    term: "Academy user",
    detail:
      "A unique profile with at least one academy_course_purchases row (any status). This is lifetime and deduplicated per user — it is smaller than Signups by design.",
  },
  {
    term: "Started checkout",
    detail:
      "A unique user with at least one Academy purchase row created in the selected period. A row is written when the Stripe Checkout Session is created, so abandoned checkouts also count here.",
  },
  {
    term: "Paid learner",
    detail:
      "A unique user with at least one purchase row in status 'paid'. Status is set by the Stripe webhook or by reconciliation against the Checkout Session.",
  },
  {
    term: "Revenue",
    detail:
      "Sum of amount_cents on purchases in status 'paid'. Period revenue uses the purchase created_at date. Amounts are stored in the currency charged (EUR, GBP, USD); totals do not FX-convert.",
  },
  {
    term: "Pending",
    detail:
      "A purchase row whose Stripe Checkout Session was created but never confirmed as paid. Abandoned checkouts stay pending until reconciliation checks Stripe.",
  },
  {
    term: "Failed",
    detail:
      "A purchase row explicitly marked failed. No Stripe failure reason is stored today, so failed and expired sessions are not separated in the database.",
  },
  {
    term: "Refunded",
    detail:
      "Status 'refunded' on a purchase row. No refund amount or refund timestamp column exists yet, so refund reporting is count-based only.",
  },
  {
    term: "Corporate user",
    detail:
      "Email domain that is not on the public free-mail list (gmail, outlook, yahoo, icloud, proton, …). It signals a company address — it is not a qualified sales lead on its own.",
  },
  {
    term: "Last activity",
    detail:
      "Most recent of the user's purchase paid_at / created_at, otherwise their profile created_at. It is not a login timestamp — login times are not recorded.",
  },
  {
    term: "Lifetime vs Selected period",
    detail:
      "Cards labelled 'Lifetime' ignore the date filter. Cards labelled with the period respect it. This is why lifetime revenue can be non-zero while the selected period shows €0.",
  },
];

/** Data that is NOT available today — surfaced in the definitions drawer. */
export const ACADEMY_DATA_GAPS: string[] = [
  "Stripe fees and tax/VAT amounts are not stored, so true net revenue cannot be computed.",
  "Stripe failure reasons (card declined, expired session, authentication) are not stored.",
  "Refund amount and refund timestamp are not stored — only the 'refunded' status.",
  "Payment method (card brand, wallet) is not stored.",
  "Login / last-seen timestamps are not recorded, so 'inactive' is inferred from purchases and course progress.",
  "profiles.company_name, job_title and country are currently empty for all users — company insight comes from the email domain.",
  "Reconciliation runs are not persisted, so run history is limited to this browser session.",
];
