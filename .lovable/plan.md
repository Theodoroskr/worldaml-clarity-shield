# Screening as a Suite module: revised plan

## Where things stand (checked)

- **Fake screening data:** the Suite's AML Screening page, its owner (UBO) checks and its onboarding-form checks all fall back to a built-in list of six fake people, because nothing tells them to use real data. The Screening workspace already uses the real LexisNexis-powered checks.
- **No fake results were ever saved.** The Suite's screening records are empty: 0 rows, 0 companies. So nothing needs re-screening and no clients need to be told. A record of this check will be kept for compliance.
- **Access disagreement:** one access check lets in anyone on the "suite"/"enterprise" plan level, or with Screening only. Today that only affects which menu links show. Entry to the Suite and the data itself are protected by other checks. It's not a data leak, but it gets fixed early.
- **Two separate workspaces** with duplicated team, case, alert and audit screens, and no way to move between them.

## Direction

The Suite becomes the one workspace, renamed **WorldAML Suite** (was "Compliance Suite"). Clients choose their modules, and Screening & Monitoring is one of them. Screening-only customers keep their pricing and land in WorldAML Suite with only that module switched on.

It stays in this project as its own walled-off area. It shares login, billing, the website and the WorldAML admin portal, but keeps all client data, teams and module settings separate from Academy, Partners and Business.

**Rename:** "Compliance Suite" is replaced with "WorldAML Suite" across the app, menus, page titles, emails and marketing pages (13 files today). Web addresses (/suite) stay the same, so existing links keep working.

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

**4. Screening moves into the Suite, and the Suite admin manages modules**
- A "Screening & Monitoring" group in the Suite menu holds Screening, Monitored, Risk alerts and Add-ons.
- Old /screening links redirect to the matching Suite page and keep their filters and record links.
- New **Settings > Modules** page for each company's own Suite admin:
  - See every module: what's included in the plan, what's on and what's available to add.
  - Switch included modules on or off for the company.
  - Choose which team members can use each module (for example, analysts get Screening only).
  - Request or buy a module that isn't included. The request goes to WorldAML for approval, or straight to checkout for fixed-price modules.
- The WorldAML admin portal still decides what each company has bought (and can grant trials or end dates). The Suite admin manages everything within that.

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
- Data protection: every onboarding form gets a default notice that each client can edit: "By submitting this form, you agree that [Company] may check the information you provide against sanctions, politically exposed person (PEP) and adverse media sources to meet its anti-money laundering obligations. Your data is processed in line with [Company]'s privacy policy." [Company] fills in automatically, and the privacy policy is a link the client provides.

**9. Branded onboarding forms for each client**
Clients can already build forms with their own fields and set a logo link, one colour and a company name. This adds:
- **A personal web address for each client,** such as worldaml.com/onboard/acme-bank/individual. It replaces the current long code link, and old links keep working.
- **Upload a logo** instead of pasting a link, plus colour choices for the main colour, buttons and background, with a live preview.
- **Custom fields** in the existing builder: text, date, dropdown, yes/no, file upload, country. Fields can be marked as required or as the name used for screening.
- Each client edits only their own forms and branding. Prospects see the client's brand, with an optional small "Powered by WorldAML" line.

**10. Tidy up**
- Remove the old separate Screening menu and leftover code.

## Client separation (applies to every step)

Each client company is fully separate. Customers, screenings, matches, cases, team members, modules, quotas, false-positive lists and audit logs all belong to one company only. The only things shared are public reference lists, such as sanctions lists and country risk ratings. Every new table and function in this plan is tied to the company. A user in company A gets nothing back for company B, even with a direct link or ID. A Suite admin can only manage their own company's modules and team.

## How we'll know it works

- Separation test: two test companies. Each one's screenings, cases, onboarding forms, modules and audit log are invisible to the other, including through direct links.

On every path (manual, UBO, manual client add, onboarding form):
- A known sanctioned name shows as a match and opens a case.
- A known clean name shows as clear.
- With the provider switched off, it shows "Failed" or "Not screened", never "Clear".
- An existing Screening customer still gets in after the move, and old links still open.

## Decisions confirmed

- The free trial starts only when the user clicks "Start free trial".
- Name: WorldAML Suite.
- Default privacy line as drafted in step 8, editable for each client.

## Technical details

- Mock: `screeningProvider.ts` `getProvider()` defaults to `MockProvider`. Used by `SuiteScreening.tsx`, `SuiteUBO.tsx:151`, `SuiteOnboardingSubmissions.tsx:167`. `suite_screenings` row count = 0 (queried). Replace these with `screeningV2` → `screening-run`. `getProvider` throws when the provider isn't configured. Add a vitest/CI check that greps `dist/` for `MOCK_DATABASE`. Temporary kill switch: hide the sidebar entry and redirect the route.
- Access: `useAccess.ts:65` drops the `tier` branch and is derived from `usePortalAccess`.
- Enum: `ALTER TYPE suite_module_key ADD VALUE 'screening'` goes in its own migration. The backfill (from `product_access`/`screening_subscriptions`/`screening_org_modules`) goes in the next one, before the route changes.
- Redirects: `<Navigate>` keeps `location.search`/hash and IDs.
- Two layers. The platform RPC `admin_set_org_module` (with a `has_role` admin check) sets what each company has bought in `suite_module_access`/`screening_org_modules`. The Suite admin RPCs `org_set_module_enabled` and `org_set_member_modules` check for org admin (`suite_org_members.role = 'admin'`). They can only switch on modules the company has bought, and they store per-member module access. The sidebar and route guards check both company module and member access.
- Audit: `screening-decision` and `invite_screening_member` write to `suite_audit_log`, and past decisions are copied in.
- Auto-screen: a new `auto-screen-subject` function, triggered from inserts and updates of the relevant fields on `suite_customers`, `suite_onboarding_submissions` and `suite_ubo` via `pg_net`, behind a cron-secret check. An idempotency key (record id + hash of the screened fields) is stored in a new `screening_runs` table with a status enum. It applies the whitelist and quota, and the existing `trigger_workflow_screening_match` raises cases. The public form gets a per-form/IP rate limit in `get_public_onboarding_form`'s submit path.
