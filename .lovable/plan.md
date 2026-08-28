# Replace Hero "Free Sanctions Quick Check" with Demo Access Flow (5 Free Screenings)

## Goal

The homepage hero's inline "Free Sanctions Quick Check" widget is replaced by a **demo acquisition flow**: a visitor registers a business account and immediately gets the **Demo plan — 5 free screening searches** in the WorldAML Screening workspace, with quota enforcement and an upgrade path when the 5 are used.

## Decisions (defaults chosen)

- **Replace the hero widget** with a demo CTA card. The standalone `/sanctions-check` page stays live (still linked from footer/other pages); only the homepage hero section changes.
- **Demo grant happens automatically on first entry to the screening workspace** for any signed-in user with no screening subscription — so both CTA-originated signups and organic signups get the same one-time demo. One demo per organisation, idempotent.

## Current state (verified)

- `src/components/home/NewHeroSection.tsx` lines 186–224 hold the quick-check card (search box, "Check" button, footnote with "Full tool →").
- Demo plan exists in `src/lib/screeningPlans.ts` (5 searches, 0 monitoring, 1 seat) but **nothing provisions it** — `verify-worldaml-subscription` only runs after a paid Stripe checkout; the Demo card CTA just links to `/signup` or `/screening`.
- `screening-run` Edge Function already enforces annual search/monitor quotas via `get_screening_org_quota` and returns `search_quota_exceeded`, so once a demo subscription row exists, hard blocking + upgrade messaging already work (`useScreeningQuota`, `UsageWidget`).
- `/signup` already accepts `?redirect=` and the packages section uses an intent key pattern we can mirror.

## Changes

### 1. Hero section (`src/components/home/NewHeroSection.tsx`)
- Replace the quick-check card with a demo card: headline "Try the Demo — 5 Free Screenings", subline "Register a business account and run 5 real screening searches across 1,900+ global lists. No card required.", CTA button "Start Free Demo".
- CTA routes to `/signup?redirect=/screening&demo=1` (unauthenticated) or straight to `/screening` if already signed in.
- Keep a small footnote link "Just need a one-off check? Free Sanctions Quick Check →" pointing to `/sanctions-check`.

### 2. Demo provisioning Edge Function `claim-screening-demo` (new)
- Auth required (bearer token). Idempotent:
  1. Resolve caller's org (`suite_org_members`); create org + admin membership if none (same pattern as `verify-worldaml-subscription`).
  2. If a `screening_subscriptions` row already exists for the org → return current plan (no demo grant).
  3. Otherwise insert `screening_subscriptions` with `plan='demo'`, `status='active'`, `search_quota_annual=5`, `monitor_quota=0`, `seat_quota=1`, `current_period_end = now + 1 year`, and sync `product_access` (`product_key='screening'`, status active).
- Returns `{ plan: 'demo', granted: true|false }`.

### 3. Workspace auto-claim (`src/pages/suite/SuiteScreeningV2.tsx`)
- When `useScreeningAccess` resolves with `isAuthenticated && !hasAccess`, invoke `claim-screening-demo` once, then `refresh()` the entitlement so the workspace opens with demo quotas.
- Demo users see a welcome banner: "Demo plan — 5 free screening searches" + link to `/screening-monitoring/pricing`. Existing `UsageWidget` and quota-exceeded banner handle the rest.

### 4. SEO/sitemap hygiene
- No route changes. Update homepage copy only; `/sanctions-check` unchanged.

## Technical notes

- New Edge Function deployed via `supabase--deploy_edge_functions`; uses service role server-side only, never exposes keys.
- Demo searches run through the existing `screening-run` pipeline (same providers, same audit trail); monitoring stays disabled (quota 0), adverse media remains plan-gated.
- Abuse control: one demo per organisation; a user with an existing paid subscription never gets downgraded by the claim function.
- Admin visibility: demo subscriptions appear in Admin → Screening (existing `admin_screening_overview` / users queries read `screening_subscriptions`).

## Verification

- Playwright: homepage renders new demo card; `/sanctions-check` still works.
- End-to-end: new signup → land in `/screening` → demo plan active → run a search → quota widget shows 1/5 → after 5, run is blocked with upgrade message.
