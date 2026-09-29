# Enterprise AML Screening — SEO copy (title, meta description, FAQ)

## Why this wording

Semrush data (US): "aml screening" = 720 searches/mo, difficulty 30, CPC $17.82 — the main target. "enterprise aml" = 20/mo, difficulty 0 — a differentiator phrase with no real competition. Question searches worth answering in the FAQ: "what are the best aml screening software tools" (40/mo), "what is aml screening" (30/mo), "how to reduce false positives in aml screening" (10/mo). The title keeps "Enterprise AML Screening" so it contains both target phrases as exact substrings; the description leads with the volume phrase.

The page at `/enterprise-aml-screening` already exists and is verified working. This plan only rewrites its search wording — no layout, form, or functional changes.

## Proposed copy (for approval)

**Title** (58 chars, replaces current in both places):
`Enterprise AML Screening — LexisNexis® Data | WorldAML`

**Meta description** (~160 chars):
`Enterprise AML screening across 1,900+ global lists, powered by LexisNexis® data. Sanctions, PEP and adverse-media checks via API, batch and daily monitoring.`

**H1** — unchanged: `Enterprise AML screening — the WorldAML platform, powered by LexisNexis® data`

**FAQ — replaced with 7 questions** (each answer naturally carries "AML screening" / "enterprise AML"):

1. **What is enterprise AML screening?** — Screening customers and transactions against sanctions, PEP and adverse-media lists as part of an anti-money-laundering programme. Enterprise AML screening adds the volume, controls and audit evidence regulated firms need: case management, four-eyes review, SSO and full audit trails.
2. **Which data and lists does it screen against?** — 1,900+ global lists supplied by LexisNexis Risk Solutions — OFAC, OFSI, EU, UN and national regimes, PEPs, relatives & close associates, enforcement and adverse-media profiles — refreshed within minutes of publication.
3. **What are the best AML screening tools for enterprises?** — Look for tier-one data coverage, tunable fuzzy matching, API plus batch screening, daily monitoring, case management and regulator-ready audit logs. WorldAML Enterprise combines all of these on one platform, powered by LexisNexis® data.
4. **How do you reduce false positives in AML screening?** — Tunable name-matching thresholds, screening against the right list set for your risk profile, and workflow that surfaces only real hits for review. The WorldAML platform lets compliance teams tune matching per entity type and monitor only what changes.
5. **Can we screen at scale — API, batch or both?** — Yes: real-time API screening for onboarding and payments, SFTP/file batch screening for large portfolios, and daily rescreening against list changes — all on one contract.
6. **How fast can we go live?** — Most teams start screening through the web platform within days. API and batch integrations typically take two to four weeks, including threshold tuning.
7. **Can we try it first?** — Yes — run a free sanctions search today, then request a demo for a guided trial on your own sample data.

## Where each change lands

1. `plugins/seo-prerender.ts` (line ~276, `/enterprise-aml-screening` entry) — replace title and description with the new copy.
2. `src/pages/EnterpriseAMLScreening.tsx` — replace the `<SEO>` title/description (lines ~158-159), the `softwareLd.description` (line ~151), and the `faqs` array (lines 65-70) with the 7-question set above.

Structured data: keep the existing `SoftwareApplication` JSON-LD (updated description); per SEO policy, no FAQPage schema is added. Canonical, breadcrumbs, H1, page content, lead form and CTA routing stay as they are.

## Verification

- Typecheck (`bunx tsgo --noEmit -p tsconfig.app.json`) and prerender parse check.
- Playwright: open `/enterprise-aml-screening` in the preview and confirm the new title, description, and FAQ section render.
- Changes reach the live site on the next publish.
