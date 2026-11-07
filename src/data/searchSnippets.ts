/**
 * Search snippets for high-impression pages whose titles were rewritten for
 * click-through. Shared by the page (runtime <head>) and
 * plugins/seo-prerender.ts (build-time HTML) so both always match.
 *
 * Budgets: the SEO component appends " | WorldAML" (11 chars) and Google shows
 * roughly 60 title characters and 158 description characters.
 * Checked by src/test/search-snippets.test.ts.
 */

/** /resources/sanctions-lists — searchers want a list directory with sources. */
export const SANCTIONS_LISTS_SEO = {
  title: "Global Sanctions Lists Database: OFAC, EU, UN, UK",
  description:
    "Free directory of international sanctions lists — OFAC SDN, EU, UN, UK OFSI and national regimes — with a summary and official source link for each list.",
  h1: "Global Sanctions Lists Database",
} as const;

/**
 * /sanctions-check — searchers are ready to run a check now. The free tool
 * matches against a small sample of OFAC, EU, UN and UK entries (not the
 * paid platform's 1,900+ lists), so the snippet must not promise a full
 * list search.
 */
export const SANCTIONS_CHECK_SEO = {
  title: "Free Sanctions Check & OFAC Search — No Signup",
  description:
    "Try a free sanctions check with no signup: instant name matching against sample OFAC, EU, UN and UK entries, with a match score and source for each hit.",
  h1: "Free sanctions check — try instant OFAC, EU, UN and UK name matching",
} as const;
