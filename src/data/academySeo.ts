/**
 * Search snippet for the Academy landing page (/academy and academy.worldaml.com).
 *
 * The snippet is a pixel-budget problem, not a copywriting problem: Google cuts
 * a title around 60 characters and a description around 158, and the SEO
 * component appends the site name (" | WorldAML" on worldaml.com,
 * " | WorldAML Academy" on the Academy subdomain). Anything past the cut is
 * simply not shown, so the terms that win the click — "free", "AML
 * certification", "CPD", "verifiable certificate" — have to sit inside the
 * window, not just somewhere in the string.
 *
 * The budget checks live in src/test/academy-seo.test.ts.
 */
export const ACADEMY_SEO = {
  title: "Free AML Certification Online — CPD Certificate",
  description:
    "Free AML certification online. CPD-accredited AML, KYC and sanctions courses with a verifiable certificate — no credit card, no trial, no hidden fees.",
} as const;
