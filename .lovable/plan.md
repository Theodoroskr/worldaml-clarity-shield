# Splitting Suite into its own project (shared backend)

Goal: move the Suite application into a separate Lovable project while both projects keep using the **same** backend (one database, one auth, one storage, one set of edge functions). Marketing pages, Academy, Business and Partner portals stay in the current project.

## Model

```text
                +--------------------------+
                |   Shared backend (Cloud) |
                |  DB + Auth + Storage +   |
                |  Edge Functions          |
                +-----------+--------------+
                            |
        +-------------------+--------------------+
        |                                        |
  worldaml.com (current project)          suite.worldaml.com (new project)
  marketing, Academy, Business,           Suite app only
  Partner, Admin                          /dashboard, /screening, ...
```

Both frontends connect to the same project URL + publishable key. Auth sessions are per-origin, so a user signing in on the Suite domain signs in again there (or is handed a session via a redirect link).

## Step 1 — Freeze and inventory (before any move)

- Freeze Suite feature work in the current project for the cut-over window.
- Inventory what moves:
  - `src/pages/suite/*` (29 pages incl. `SuiteAppLayout`)
  - Suite app components in `src/components/suite/*` (excluding marketing sections: Hero, CTA, WhatIsSuite, WhoItsFor, Integration, APIAccess — those belong to `/platform/suite` and stay)
  - Suite libs/hooks (`src/lib/*` and `src/hooks/*` referenced only by Suite), entitlement guard logic, `OnboardPublic` and customer-portal routes if Suite owns them
- Inventory what stays shared: `suite_*` tables, `rcm_*` tables, storage buckets, Suite edge functions.

## Step 2 — Create the new project

- Remix the current project into a new one named "WorldAML Suite" (fastest way to inherit design tokens, shadcn setup, Tailwind config, auth client).
- Point the new project at the **existing** backend rather than provisioning a new one: reuse the same project URL, publishable key and project ID in its `.env`/client config.
- Do not run any schema migration from the new project during setup.

## Step 3 — Strip each project down

New Suite project:
- Delete Academy, Business, Partner, Admin, marketing pages/routes.
- Move Suite routes to the root: `/suite/dashboard` becomes `/dashboard`, etc.
- Keep a slim auth surface: sign-in, sign-out, password reset, entitlement guard.

Current project:
- Keep `/platform/suite` marketing page.
- Replace `/suite/*` routes with redirects to `https://suite.worldaml.com/...` preserving the sub-path.
- Delete the Suite app pages/components after the new project is verified live.

## Step 4 — Auth and access

- Add the Suite domain to the backend's allowed redirect URLs and site URL list.
- Keep entitlement checks (`current_user_has_suite_access`, `suite_org_members`) in the database — both projects read the same source of truth.
- "Open Suite" links from Admin/Business portals become external links to the Suite domain.
- Optional later: single sign-on hand-off (one-time token in the redirect) so users are not asked to sign in twice.

## Step 5 — Coordinated migrations (the key rule)

One database means one migration history. Adopt these rules:

1. **All schema migrations are authored in ONE project.** Recommendation: the Suite project owns every `suite_*`, `rcm_*` and shared-plumbing migration; the current project owns Academy/Business/Partner/Admin tables. Never author the same table from both.
2. **Additive-first.** Add columns/tables before the code that uses them; deploy the reading code after. Never rename or drop in the same migration that ships dependent UI.
3. **Deprecate in three steps** for breaking changes: add new shape -> both projects read new shape -> drop old shape in a later migration.
4. **Types file drift.** Each project regenerates its own `src/integrations/supabase/types.ts` after a migration. After any migration in project A, regenerate types in project B before its next release.
5. **Edge functions** stay deployed once against the shared backend. Assign each function an owning project (Suite functions -> Suite project) and never deploy the same function name from both.
6. **RLS is the contract.** Any new table gets GRANTs and policies in the same migration, scoped by `organisation_id`, so neither frontend can widen access.

## Step 6 — Cut-over sequence

1. Deploy the Suite project to a staging URL, verify against live data with a read-only test account.
2. Verify per module: onboarding + submissions, IDV, screening, transactions, monitoring/alerts, risk + heatmap, UBO, periodic reviews, documents, EDD, source of funds, AML/AR, cases, regulatory + submissions, DSAR, audit, RSS, settings.
3. Publish Suite to `suite.worldaml.com`.
4. Switch the current project's `/suite/*` routes to redirects (keep them permanently — old links and bookmarks exist).
5. Monitor for a week, then delete the Suite code from the current project.

## Step 7 — After the split

- Shared design tokens: keep a copy in each project and sync manually, or copy assets across with the cross-project tools when the brand changes.
- Keep one owner for the backend, with a short written rule of who migrates what.
- Admin Portal stays in the current project and continues to read Suite data directly from the shared tables.

## Technical notes

- Storage buckets (`customer-documents`, `onboarding-submissions`) and their policies stay untouched; the new frontend uses the same bucket names.
- Public/guest routes served by Suite (`/onboard/:formId`, customer portal) must move with Suite or be explicitly kept behind on the main domain — pick one, since the URL shown to customers changes.
- Realtime channels and cron jobs are backend-side and unaffected.
- Rollback: the redirect in step 4 is the only irreversible-looking step and is reversible by restoring the routes; the Suite code stays in git history in the current project until step 5.

## Main risks

- Two sign-in surfaces confuse users until SSO hand-off is added.
- Divergent `types.ts` causing type errors after a migration in the other project.
- Duplicate edge-function deployments overwriting each other — solved by the ownership rule in step 5.
