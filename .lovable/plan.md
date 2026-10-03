# Screening as a Suite module: revised plan

## Where things stand (checked)

- **Fake screening data:** the Suite's AML Screening page, its owner (UBO) checks and its onboarding-form checks all fall back to a built-in list of six fake people, because nothing tells them to use real data. The Screening workspace already uses the real LexisNexis-powered checks.
- **No fake results were ever saved.** The Suite's screening records are empty: 0 rows, 0 companies. So nothing needs re-screening and no clients need to be told. A record of this check will be kept for compliance.
- **Access disagreement:** one access check lets in anyone on the "suite"/"enterprise" plan level, or with Screening only. Today that only affects which menu links show. Entry to the Suite and the data itself are protected by other checks. It's not a data leak, but it gets fixed early.
- **Two separate workspaces** with duplicated team, case, alert and audit screens, and no way to move between them.

## Direction

The Suite becomes the one workspace, and clients choose their modules. Screening & Monitoring is one of them. Screening-only customers keep their pricing and land in the Suite with only that module switched on.

## Plan (in this order)

**1. Make screening safe (urgent)**
- Switch the Suite's AML Screening page, UBO checks and onboarding-form checks to the real engine.
- If the screening provider is missing or misconfigured, show a clear error instead of quietly using fake data. An automatic test stops any live release that contains the fake data.
- Until this ships, the Suite's AML Screening page is hidden and the UBO and onboarding checks are blocked.

**2. One access rule**
- Both access checks follow the same rule, and plan level alone no longer grants Suite access.

**3. Modules, without locking anyone out**
- Every company that already has Screening (paid, demo or add-on) gets the Screening module first, before anything moves.
- Then the Suite opens for anyone with at least one module and only shows the modules that company has. Locked ones show "Ask your admin" or "Add module".

**4. Screening moves into the Suite, plus admin controls**
- A "Screening & Monitoring" group in the Suite menu holds Screening, Monitored, Risk alerts and Add-ons.
- Old /screening links redirect to the matching Suite page and keep their filters and record links.
- A "Modules" panel per company in the admin portal lets admins switch each module and add-on on or off, with an optional end date. Customer requests show there for approval.

**5. One team, one audit trail**
- Team members are managed in Suite Settings, and the old Screening team screen redirects there.
- Screening decisions are recorded in the Suite audit log. Past Screening decisions are copied in, and the start date is noted for auditors.

**6. Signup and buying**
- Buying Screening switches on the Screening module, then opens the Suite.
- The free demo needs a "Start free trial" click instead of starting automatically. This also removes the "Preparing your workspace…" screen that can get stuck.

**7. One place to review matches**
- All matches, manual and automatic, go to the Suite's case queue. The Screening page's own decision records feed into it, so there's one review queue.

**8. Automatic screening in the client workflow**
- Screening runs when staff add a client by hand, when a prospect sends in an onboarding form, and for every owner and director.
- Clients are screened again when their name, date of birth or nationality changes.
- Each client shows a clear status: Pending, Clear, Possible match, Match, Not screened (with the reason: module off, quota used up or skipped) or Failed. Never a blank that looks like "clear".
- Spam protection on public forms (rate limits and basic checks) so junk forms can't use up quota.
- Each record version is screened only once, so retries don't double-charge.
- When the module is switched on, existing clients are not screened automatically. Admins get a "Screen existing clients" button instead.
- Data protection: you confirm the privacy notice on onboarding forms covers screening. I'll add a standard line you can edit.

**9. Tidy up**
- Remove the old separate Screening menu and leftover code.

## How we'll know it works

On every path (manual, UBO, manual client add, onboarding form):
- A known sanctioned name shows as a match and opens a case.
- A known clean name shows as clear.
- With the provider switched off, it shows "Failed" or "Not screened", never "Clear".
- An existing Screening customer still gets in after the move, and old links still open.

## Questions to confirm

- Should the free trial need a click (recommended) or keep starting automatically?
- Which privacy wording should onboarding forms use? I'll draft a default line.

## Technical details

- Mock: `screeningProvider.ts` `getProvider()` defaults to `MockProvider`. Used by `SuiteScreening.tsx`, `SuiteUBO.tsx:151`, `SuiteOnboardingSubmissions.tsx:167`. `suite_screenings` row count = 0 (queried). Replace these with `screeningV2` → `screening-run`. `getProvider` throws when the provider isn't configured. Add a vitest/CI check that greps `dist/` for `MOCK_DATABASE`. Temporary kill switch: hide the sidebar entry and redirect the route.
- Access: `useAccess.ts:65` drops the `tier` branch and is derived from `usePortalAccess`.
- Enum: `ALTER TYPE suite_module_key ADD VALUE 'screening'` goes in its own migration. The backfill (from `product_access`/`screening_subscriptions`/`screening_org_modules`) goes in the next one, before the route changes.
- Redirects: `<Navigate>` keeps `location.search`/hash and IDs.
- Admin RPC `admin_set_org_module` (with a `has_role` admin check) writes to `suite_module_access`/`screening_org_modules`.
- Audit: `screening-decision` and `invite_screening_member` write to `suite_audit_log`, and past decisions are copied in.
- Auto-screen: a new `auto-screen-subject` function, triggered from inserts and updates of the relevant fields on `suite_customers`, `suite_onboarding_submissions` and `suite_ubo` via `pg_net`, behind a cron-secret check. An idempotency key (record id + hash of the screened fields) is stored in a new `screening_runs` table with a status enum. It applies the whitelist and quota, and the existing `trigger_workflow_screening_match` raises cases. The public form gets a per-form/IP rate limit in `get_public_onboarding_form`'s submit path.
