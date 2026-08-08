// Captures marketing attribution for lead form submissions.
// Reads current URL params + document.referrer, and falls back to first-touch
// values stored by signupAttribution.ts when the current page has none.
import { getAttribution } from "./signupAttribution";

export interface WebAttribution {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  landing_page?: string;
  referrer?: string;
  first_visited_at?: string;
  last_visited_at?: string;
  days_visited?: number;
  visit_count?: number;
  /** First page the visitor ever landed on (first touch). */
  first_page_visited?: string;
  /** The in-app page the visitor was on before reaching this form (CTA page). */
  cta_referrer?: string;
  /** Average minutes per visit, rounded to 2 decimals. */
  average_time_spent_minutes?: number;
  /** Chat conversations started by this visitor (0 when no chat was used). */
  number_of_chats?: number;
  /** Simple engagement score derived from visits, days and time on site. */
  visitor_score?: number;
}

// ── Visit summary tracking (feeds Zoho's Visit Summary fields) ──────────────
const VISIT_KEY = "waml_visits_v1";
const CHAT_KEY = "waml_chats_v1";

interface VisitStats {
  first_visited_at: string;
  last_visited_at: string;
  days: string[]; // ISO dates (YYYY-MM-DD)
  visit_count: number;
  first_page_visited?: string;
  /** Most recent page view URL. */
  last_page?: string;
  /** The page viewed immediately before `last_page` (CTA origin page). */
  previous_page?: string;
  /** Cumulative time on site in seconds (best-effort). */
  total_seconds?: number;
}


function readVisits(): VisitStats | null {
  try {
    const raw = localStorage.getItem(VISIT_KEY);
    return raw ? (JSON.parse(raw) as VisitStats) : null;
  } catch {
    return null;
  }
}

/** Increment the visitor's chat counter (call when a chat conversation starts). */
export function recordChatStarted() {
  if (typeof window === "undefined") return;
  try {
    const n = Number(localStorage.getItem(CHAT_KEY) || "0") || 0;
    localStorage.setItem(CHAT_KEY, String(n + 1));
  } catch {}
}

function readChats(): number {
  try {
    return Number(localStorage.getItem(CHAT_KEY) || "0") || 0;
  } catch {
    return 0;
  }
}

/**
 * Call on every page view (initial load and SPA route change) to maintain
 * first/last visit, days-visited counts and the previous-page (CTA) trail.
 */
export function recordVisit() {
  if (typeof window === "undefined") return;
  try {
    const now = new Date().toISOString();
    const today = now.slice(0, 10);
    const here = window.location.href.slice(0, 500);
    const prev = readVisits();

    // Ignore duplicate records for the same URL fired within a few seconds
    // (initial load + router mount) so counts and the CTA trail stay accurate.
    if (prev?.last_page === here && prev.last_visited_at) {
      const gap = Date.now() - new Date(prev.last_visited_at).getTime();
      if (gap >= 0 && gap < 3000) return;
    }

    // Best-effort time-on-site: count the gap since the previous page view when
    // it looks like the same browsing session (under 30 minutes).
    let addSeconds = 0;
    if (prev?.last_visited_at) {
      const gap = (Date.now() - new Date(prev.last_visited_at).getTime()) / 1000;
      if (gap > 0 && gap < 1800) addSeconds = gap;
    }

    const stats: VisitStats = prev
      ? {
          first_visited_at: prev.first_visited_at || now,
          last_visited_at: now,
          days: prev.days?.includes(today) ? prev.days : [...(prev.days || []), today].slice(-365),
          visit_count: (prev.visit_count || 0) + 1,
          first_page_visited: prev.first_page_visited || here,
          last_page: here,
          previous_page:
            prev.last_page && prev.last_page !== here ? prev.last_page : prev.previous_page,
          total_seconds: Math.round((prev.total_seconds || 0) + addSeconds),
        }
      : {
          first_visited_at: now,
          last_visited_at: now,
          days: [today],
          visit_count: 1,
          first_page_visited: here,
          last_page: here,
          total_seconds: 0,
        };
    localStorage.setItem(VISIT_KEY, JSON.stringify(stats));
  } catch {}
}


const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
] as const;

export function getWebAttribution(): WebAttribution {
  if (typeof window === "undefined") return {};
  const out: WebAttribution = {};
  try {
    const url = new URL(window.location.href);
    for (const k of UTM_KEYS) {
      const v = url.searchParams.get(k);
      if (v) (out as any)[k] = v.slice(0, 255);
    }
    out.landing_page = window.location.href.slice(0, 500);
    out.referrer = (document.referrer || "").slice(0, 500);
  } catch {}

  // Fill any missing utm from first-touch capture.
  try {
    const first = getAttribution();
    const firstUtm = (first.signup_utm || {}) as Record<string, string>;
    for (const k of UTM_KEYS) {
      if (!out[k] && firstUtm[k]) out[k] = firstUtm[k];
    }
    if (!out.referrer && first.signup_referrer) out.referrer = first.signup_referrer;
    if (!out.landing_page && first.signup_landing_path) {
      out.landing_page = first.signup_landing_path;
    }
  } catch {}

  // Visit summary (first/last visit, days visited) for Zoho's Visit Summary block.
  try {
    const v = readVisits();
    if (v) {
      out.first_visited_at = v.first_visited_at;
      out.last_visited_at = v.last_visited_at;
      out.days_visited = Array.isArray(v.days) ? v.days.length : undefined;
      out.visit_count = v.visit_count;
      out.first_page_visited = v.first_page_visited || out.landing_page;
      // The page the visitor was on before this form — i.e. where they clicked
      // the CTA. Falls back to the external document.referrer.
      out.cta_referrer = v.previous_page || out.referrer || undefined;

      const visits = Math.max(1, v.visit_count || 1);
      out.average_time_spent_minutes =
        Math.round(((v.total_seconds || 0) / 60 / visits) * 100) / 100;
    }
    out.number_of_chats = readChats();
    if (!out.first_visited_at) {
      const first = getAttribution();
      if (first.captured_at) out.first_visited_at = first.captured_at;
    }
    // Engagement score (0-100): page views + distinct days + time on site.
    const score =
      Math.min(40, (out.visit_count || 0) * 4) +
      Math.min(30, (out.days_visited || 0) * 6) +
      Math.min(20, Math.round((out.average_time_spent_minutes || 0) * 4)) +
      Math.min(10, (out.number_of_chats || 0) * 10);
    out.visitor_score = Math.min(100, score);
  } catch {}

  return out;
}
