# Hero Quick Check → Register for 5 Free Screenings

## Goal

Keep the existing hero "Free Sanctions Quick Check" card exactly as it looks today (same card, same header strip, same input). Change what happens on **Check**: instead of running a free open-source search, it opens a short registration prompt (business email + company), sends an activation email, and on activation the account gets the **Demo plan — 5 free screening searches** in the WorldAML Screening workspace.

## Current state (verified)

- `src/components/home/NewHeroSection.tsx` holds the quick-check card: navy header strip ("Free Sanctions Quick Check · OFAC · EU · UN · HMT"), a name/company input, a "Check" submit button, and a footnote linking to `/sanctions-check`.
- `handleQuickSearch` currently routes the typed query into the free check flow.
- Demo plan already exists in `src/lib/screeningPlans.ts` (5 searches, 0 monitoring, 1 seat) but nothing provisions it — only paid Stripe checkout creates a `screening_subscriptions` row.
- `screening-run` already enforces annual quotas and returns `search_quota_exceeded`, so once a demo row exists, blocking + upgrade messaging work via `useScreeningQuota` / `UsageWidget`.

## Changes

### 1. Hero card (visual unchanged)
- Keep the card, header strip, input, footnote layout and styling as-is.
- Change the footnote copy to: "Register with a business email to run 5 free screenings across 1,900+ lists · No card required."
- `Check` no longer performs a search. It opens a **registration dialog**, carrying the typed name/company through as the first search the user will run.

### 2. Registration dialog (new `ScreeningDemoSignupDialog`)
Fields: Full name, Business email, Company name, Country (optional), password. Validation:
- Business email required — free providers (gmail, outlook, yahoo, etc.) rejected using the existing `src/lib/workEmail.ts` helper, with a clear inline message.
- Company name required.
- Signed-in users skip the dialog entirely and go straight to `/screening?q=<query>`.

On submit: `supabase.auth.signUp` with `emailRedirectTo = ${window.location.origin}/screening?demo=1&q=<query>` and metadata `{ full_name, company_name, country, demo_intent: 'screening' }`. Show a "Check your email to activate" confirmation state inside the dialog (no auto-login claim).

### 3. Activation email
- Email confirmation stays on for this flow (the activation link is what verifies the business email). The Supabase confirmation email redirects to `/screening?demo=1&q=…`.
- After the redirect lands with a session, the workspace claims the demo automatically (below).

### 4. Demo provisioning Edge Function `claim-screening-demo` (new)
Auth required (bearer token), idempotent:
1. Resolve the caller's org (`suite_org_members`); create org + admin membership if none, same pattern as `verify-worldaml-subscription`.
2. If a `screening_subscriptions` row already exists for the org → return the current plan, grant nothing.
3. Otherwise insert `plan='demo'`, `status='active'`, `search_quota_annual=5`, `monitor_quota=0`, `seat_quota=1`, `current_period_end = now + 1 year`, and sync `product_access` (`product_key='screening'`, active).

Returns `{ plan, granted }`. One demo per organisation; a paid subscription is never downgraded.

### 5. Workspace auto-claim (`src/pages/suite/SuiteScreeningV2.tsx`)
- When `useScreeningAccess` resolves as `isAuthenticated && !hasAccess`, invoke `claim-screening-demo` once, then `refresh()`.
- If `?q=` is present, prefill the screening search box with it so the user's hero query is their first real screening.
- Show a banner: "Demo plan — 5 free screening searches" with a link to `/screening-monitoring/pricing`. Existing `UsageWidget` and the quota-exceeded banner handle the rest.

### 6. Existing free-check surfaces
- `/sanctions-check` and `/free-aml-check` pages are **removed**; `/sanctions-check` and `/free-aml-check` redirect to the homepage hero flow (`/?demo=1`), and the hero's "Run a Free AML Check" secondary CTA now opens the same registration dialog.
- Remove internal links/CTAs pointing at the deleted pages (header, footer, marketing pages, upsell banners, chatbot knowledge).
- Remove the deleted URLs from `public/sitemap.xml` and `public/llms.txt`.
- Retire the `sanctions-search` Edge Function only if nothing else calls it.

## Technical notes

- Edge Function uses the service role server-side only; no keys reach the client.
- Demo searches run through the existing `screening-run` pipeline (same providers, same audit trail); monitoring stays at quota 0 and adverse media stays plan-gated.
- Admin visibility: demo subscriptions show up in Admin → Screening through the existing `screening_subscriptions` reads.

## Verification

- Playwright: hero card renders unchanged; clicking Check with a query opens the dialog; a personal email is rejected; a business email shows the "check your email" state.
- End-to-end: activate → land on `/screening` with the query prefilled → demo plan active → run a search → usage shows 1/5 → after 5, runs are blocked with the upgrade message.
- Full-text search confirms no dead links to `/sanctions-check` or `/free-aml-check` remain outside the redirects.
