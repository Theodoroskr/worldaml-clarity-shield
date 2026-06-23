// First-touch attribution captured on first page visit, used on signup.
const KEY = "waml_attribution_v1";

export interface Attribution {
  signup_source: string;
  signup_landing_path: string;
  signup_referrer: string;
  signup_utm: Record<string, string>;
  captured_at: string;
}

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "fbclid"];

function inferSource(path: string, utm: Record<string, string>, referrer: string): string {
  if (utm.utm_source) return utm.utm_source;
  if (path.startsWith("/academy")) return "academy";
  if (path.startsWith("/pricing")) return "pricing";
  if (path.startsWith("/contact-sales")) return "contact-sales";
  if (path.startsWith("/partners")) return "partners";
  if (path.startsWith("/suite")) return "suite";
  if (path.startsWith("/products")) return "products";
  if (path.startsWith("/industries")) return "industries";
  if (referrer) {
    try {
      const host = new URL(referrer).hostname.replace(/^www\./, "");
      if (host && !host.endsWith("worldaml.com")) return host;
    } catch {}
  }
  if (path === "/" || path === "") return "homepage-direct";
  return path.split("/")[1] || "direct";
}

export function captureAttribution() {
  if (typeof window === "undefined") return;
  try {
    const existing = localStorage.getItem(KEY);
    if (existing) return; // first-touch wins
    const url = new URL(window.location.href);
    const utm: Record<string, string> = {};
    UTM_KEYS.forEach((k) => {
      const v = url.searchParams.get(k);
      if (v) utm[k] = v;
    });
    const referrer = document.referrer || "";
    const path = url.pathname + url.search;
    const payload: Attribution = {
      signup_source: inferSource(url.pathname, utm, referrer),
      signup_landing_path: path.slice(0, 500),
      signup_referrer: referrer.slice(0, 500),
      signup_utm: utm,
      captured_at: new Date().toISOString(),
    };
    localStorage.setItem(KEY, JSON.stringify(payload));
  } catch {}
}

export function getAttribution(): Partial<Attribution> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function clearAttribution() {
  try {
    localStorage.removeItem(KEY);
  } catch {}
}
