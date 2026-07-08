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

  return out;
}
