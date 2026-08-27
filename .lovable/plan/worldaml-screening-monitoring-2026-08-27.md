# WorldAML Screening & Monitoring

Replace the current Suite screening experience with a premium, provider-independent screening and monitoring product. Built alongside the existing page behind a feature flag, with the real ComplyAdvantage integration server-side only.

## What exists today (verified)

- `src/pages/suite/SuiteScreening.tsx` (636 lines) — single name box, results from a **client-side mock** in `src/services/screeningProvider.ts` (mock / "worldcompliance" / "dowjones" switch, `confidence` shown with red/amber colouring, provider names in `dataSource`).
- `supabase/functions/sanctions-search` — static open-source sanctions dataset with Jaro-Winkler matching. Used by the public quick check.
- Tables: `suite_screenings` (9 columns), `suite_screening_whitelist`, `suite_cases`, `suite_alerts`, `suite_audit_log`, `suite_customers`, `suite_organizations`. None of the new screening tables exist.
- No ComplyAdvantage code or credential anywhere in the project.
- Public page `src/pages/PlatformAMLScreening.tsx` (136 lines).

## Retain / modify / replace

**Retain unchanged:** brand, navigation shell, auth, portals, subscriptions, `suite_cases`, `suite_alerts`, `suite_audit_log`, `suite_customers`, CRM connections and workflows, the public sanctions quick check.

**Modify:** `SuiteAppLayout` navigation (add Screening Cases, Monitoring, Batch, Internal Lists under permission), `suite_screenings` (kept read-only as legacy, surfaced in the new case list), public AML screening page.

**Replace:** `src/services/screeningProvider.ts` client mock (deleted once the flag flips), the four commercial screening profiles, `confidence` presented as risk, all provider naming in the UI.

## Data model (new tables, tenant-scoped by `organisation_id`)

`screening_policies`, `screening_policy_versions`, `screening_subjects`, `screening_searches`, `screening_cases`, `screening_matches`, `match_attributes`, `screening_sources`, `adverse_media_items`, `analyst_decisions`, `case_comments`, `case_attachments`, `monitoring_subjects`, `monitoring_alerts`, `usage_transactions`, `provider_references`, `provider_raw_responses`, `screening_audit_events`.

Rules applied to every table: RLS on, GRANTs to `authenticated` + `service_role`, org-scoped policies with `WITH CHECK` invariants that block cross-org moves. `provider_raw_responses` and `provider_references` get **no** `authenticated` grant — service role only, readable through an admin-only RPC.

Legacy `suite_screenings` rows are backfilled into `screening_searches` / `screening_cases` as `legacy` records. Nothing is deleted.

## Provider integration layer (server-side only)

New edge functions, all requiring a verified JWT and resolving the caller's org:

- `screening-run` — createScreening, deducts a credit only after a valid provider search is created
- `screening-fetch` — retrieveScreening / retrieveFullDetails
- `screening-decision` — updateMatchDecision + audit event
- `screening-monitoring` — start/stop/retrieveChanges/acknowledge
- `screening-webhook` — signature validation, monitoring event ingestion
- `screening-report` — WorldAML-branded PDF

Shared adapter in `supabase/functions/_shared/screeningAdapter/` with a `ScreeningProvider` interface and a `complyadvantage.ts` implementation. Every response is normalised into the WorldAML model before it leaves the function: no provider IDs, URLs, share links or raw JSON in any customer-facing payload. Provider errors map to the five customer-friendly messages; technical detail is stored for admins only. Includes timeouts, exponential backoff, idempotency keys, duplicate-request protection and usage logging.

The ComplyAdvantage API key is stored as a backend secret and read only inside these functions.

## Phase 1 — screening core

- `/suite/screening/new` — "Screen a person or organisation", Person/Organisation segmented selector, the specified required and optional fields, coverage card (Sanctions + PEPs and RCAs included by policy), collapsed Advanced options limited by policy, credit estimate, "Run screening".
- Screening policy name displayed, never editable by operational users.
- Result header with WorldAML reference (`WAML-SCR-2026-000123` format), subject, policy, monitoring status, analyst.
- Four summary cards (Sanctions, PEPs and RCAs, Warnings, Adverse Media) that distinguish "0 potential matches / Screened" from "Not screened".
- Match list as expandable cards showing **name similarity**, matched vs conflicting attributes, status. No red styling for a possible match.
- Match review workspace with Comparison, Profile, Sources, Notes, Audit Trail tabs; side-by-side attribute assessment with written Match / Partial match / Conflict / Unavailable labels.
- Decisions: Confirm match, Keep as possible match, Mark as false positive, Escalate, Add to monitoring — with mandatory reason + comment on confirm/false positive/escalate.
- Case list with the specified filters and saved views; every action writes an audit event.

## Phase 2 — adverse media, monitoring, reports

- Adverse media as a separate opt-in control and a separate tab, with plan-gated locked state ("Not included in your plan" + Contact us) and no silent search.
- Monitoring section: subject list, what-changed messages, acknowledge / comment / escalate / stop, "Monitoring update requires review".
- WorldAML-branded PDF report with the full field list and the specified disclaimer; no provider branding, URLs or JSON.

## Permissions

New permission set stored against Suite org roles: run screenings, view cases, review matches, confirm matches, resolve false positives, view adverse media, view source URLs, start/stop monitoring, export reports, batch screening, manage policies, view provider diagnostics, manage API credentials. Provider diagnostics restricted to WorldAML platform admins only.

## Public page

Redesign `/platform/aml-screening`: headline "Screen. Investigate. Decide. Monitor.", the supporting copy, Request a Demo / Explore AML Screening CTAs, a static WorldAML product mock-up (no live data), sections for each capability, single H1, unique title/description, Product + FAQ structured data, prerender entry so the page is never blank without JS. No provider named publicly.

## Rollout

Everything ships behind a `screening_v2` flag per organisation. The current `/suite/screening` page stays live and untouched until you sign off, then the route swaps and the client mock provider is deleted. No production data is dropped at any point.

## Out of scope for this pass

Batch screening, Internal Lists, advanced policy administration UI and dashboard analytics (Phase 3) — planned for after sign-off on Phases 1–2.
