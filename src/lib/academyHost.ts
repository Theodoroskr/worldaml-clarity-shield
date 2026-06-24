/**
 * Detect whether the current request is being served from the
 * Academy subdomain (e.g. academy.worldaml.com). When true, the
 * app renders an Academy-only experience using the same codebase.
 *
 * Safe for SSR/build-time: returns false when window is undefined.
 */
export const isAcademyHost = (): boolean => {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname.toLowerCase();
  // Production + any preview/staging subdomain that begins with "academy."
  return host === "academy.worldaml.com" || host.startsWith("academy.");
};

/**
 * Build an internal href that works on both the main site
 * (/academy/...) and the Academy subdomain (/...).
 */
export const academyHref = (path: string): string => {
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (isAcademyHost()) {
    // Strip a leading "/academy" so links resolve at the subdomain root.
    return clean.replace(/^\/academy(?=\/|$)/, "") || "/";
  }
  // On the main site, ensure links land under /academy.
  if (clean === "/" || clean === "") return "/academy";
  return clean.startsWith("/academy") ? clean : `/academy${clean}`;
};
