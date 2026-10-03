# Screening workspace and Compliance Suite: assessment and fix plan

## What I found

**Biggest problem: the Suite checks names against made-up data.**
The Suite's "AML Screening" page, its ownership (UBO) checks and its onboarding-submission checks all use a built-in test list of six fake sanctioned people. Nothing switches them to real data, so the Suite can show staff fake "hits" or false "all clear" results. The separate Screening workspace already uses the real LexisNexis-powered checks.

**Duplicated features that don't share data**
| Area | Screening workspace | Compliance Suite |
|---|---|---|
| Name screening | Real checks | Test data (above) |
| Cases | Its own decision records | Separate case system |
| Alerts | Risk alert rules | Separate alerts and rules |
| Team | Its own invite screen | Separate members screen in Settings |
| Audit trail | None | Full audit log, but it doesn't see Screening actions |

**Moving between them is hard**
- There's no switcher between the two. From the Suite there are only three small links into Screening, and none going back.
- They look like two different apps: Screening is dark with a flat menu, the Suite is light with grouped menus.
- The Suite's "AML Screening" and the Screening workspace look like the same feature, but they run on separate systems.

**Smaller issues**
- The Suite and Screening use different rules to decide who gets in. Two separate access checks disagree in one case: users on the "suite" or "enterprise" plan level.
- Signed-in users get the free 5-screening demo automatically. While it's being set up, the page shows "Preparing your workspace…", which can stick.

## Direction: Screening becomes a module of the Suite

There will be one workspace, the Suite, and clients pick the modules they want: Screening & Monitoring, KYC/KYB, Transactions, Cases, Compliance Manager (RCM) and so on. Screening-only customers buy just the Screening module. Their pricing stays the same, but they land in the Suite with only Screening switched on. Behind the scenes both already share the same company and team setup, so this mainly changes the menus and access, not the data.

## Fix plan (in order)

1. **Stop the fake results (urgent).** The Suite's AML Screening page uses the real engine, the same one that runs the Screening workspace today. Ownership and onboarding checks switch to it too, and the test data is removed from the live app.
2. **Screening moves into the Suite.** Screening, Monitored entities, Risk alerts, Team and Add-ons become a "Screening & Monitoring" group in the Suite menu. Old /screening links redirect to their matching Suite pages, so emails, bookmarks and the pricing page keep working.
3. **Module-based access.** The Suite opens for anyone with at least one module and shows only the modules that company has. Modules they don't have show as locked with "Ask your admin" or "Add module".
4. **Admin module controls.** One "Modules" panel per company in the admin portal lists every module and Screening add-on (like Four-Eyes Review). Admins switch each on or off directly, with an optional end date. Customer add-on requests show there for approval.
5. **One team, one audit trail.** Team members are managed in one place, Suite Settings, and the separate Screening team screen redirects there. Screening decisions and monitoring changes go into the Suite audit log.
6. **Signup and buying.** Screening checkout and the free demo switch on the Screening module for the company, then send the user to the Suite. If setup fails or takes more than about 10 seconds, the user sees a clear message with a retry button.
7. **Tidy up.** Remove the Screening workspace's separate dark menu, and make the Suite and Screening use the same access check so they can't disagree.

Later, not in this plan: merging Screening's cases and alerts with the Suite's. It's a bigger change and should be decided on its own.

## Technical details

- `src/services/screeningProvider.ts` falls back to `MockProvider` when `VITE_SCREENING_PROVIDER` isn't set, and the project never sets it. It's used by `SuiteScreening.tsx` (route `/suite/screening`), `SuiteUBO.tsx:151` and `SuiteOnboardingSubmissions.tsx:167`.
- Step 1: `/suite/screening` renders `SuiteScreeningV2`. UBO and Submissions call `screening-run` through `src/lib/suite/screeningV2.ts`. The mock is kept only for tests.
- Step 2: move the pages under `/suite/screening/*` inside `SuiteAppLayout`, and turn the `/screening/*` routes into `<Navigate>` redirects. Update links in `SuiteScreeningV2.tsx` and in emails, for example `SCREENING_URL` in `send-screening-invite-email`.
- Step 3: add `screening` to `suite_module_key` (additive enum value). `PortalGuard`/`SuiteAppLayout` allow entry with any active module (Suite access or screening entitlement). `SuiteAppSidebar` filters groups by module.
- Step 4: an admin RPC writes to `suite_module_access` and `screening_org_modules`, guarded by `has_role(admin)`. A new panel goes in AdminOrganizations.
- Step 4: write to `suite_audit_log` from `screening-decision`, `invite_screening_member` and the monitoring add/remove actions, using the caller's `organisation_id`.
- Step 5: `useAccess` uses the same suite rule as `usePortalAccess`, and the duplicate rule is removed.
- Step 6: add a timeout and error state in `ScreeningWorkspace.tsx`.
