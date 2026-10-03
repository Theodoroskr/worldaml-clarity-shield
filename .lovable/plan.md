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
7. **Screening inside the client workflow.** With the Screening module on, screening happens two ways:
   - **Manual:** staff type a name and screen it on the Screening page.
   - **Automatic:** a new client is screened as soon as staff add one by hand, or as soon as a prospect sends in one of our client's onboarding forms. Owners and directors (UBOs) are screened too.
   The result goes on the client's profile (clear, possible match, or match). Matches open a review case and, where set up, add the client to ongoing monitoring. Today, onboarding-form screening only runs when staff approve the form, and it uses the test data. It will run as soon as the form arrives, using real data.
8. **Tidy up.** Remove the Screening workspace's separate dark menu, and make the Suite and Screening use the same access check so they can't disagree.

Later, not in this plan: merging Screening's cases and alerts with the Suite's. It's a bigger change and should be decided on its own.

## Technical details

- `src/services/screeningProvider.ts` falls back to `MockProvider` when `VITE_SCREENING_PROVIDER` isn't set, and the project never sets it. It's used by `SuiteScreening.tsx` (route `/suite/screening`), `SuiteUBO.tsx:151` and `SuiteOnboardingSubmissions.tsx:167`. That last one only runs on staff approval, inside the browser.
- Step 1: `/suite/screening` renders `SuiteScreeningV2`. UBO and Submissions call `screening-run` through `src/lib/suite/screeningV2.ts`. The mock is kept only for tests.
- Step 2: move the pages under `/suite/screening/*` inside `SuiteAppLayout`, and turn the `/screening/*` routes into `<Navigate>` redirects. Update links in `SuiteScreeningV2.tsx` and in emails, for example `SCREENING_URL` in `send-screening-invite-email`.
- Step 3: add `screening` to `suite_module_key` (additive enum value). `PortalGuard`/`SuiteAppLayout` allow entry with any active module. `SuiteAppSidebar` filters groups by module.
- Step 4: an admin RPC writes to `suite_module_access` and `screening_org_modules`, guarded by `has_role(admin)`. A new panel goes in AdminOrganizations.
- Step 5: `ScreeningTeam` redirects to Suite Settings members. `invite_screening_member` and `screening-decision` write to `suite_audit_log`.
- Step 6: `claim-screening-demo` and the screening webhook grant the `screening` module. Add a timeout and error state to the activation screen.
- Step 7: a new `auto-screen-subject` function, run server-side for new `suite_customers` rows (manual add) and new `suite_onboarding_submissions` rows (public form), plus UBO rows. It calls the shared screening engine, links the search to the customer, writes `suite_screenings`, and uses the existing `trigger_workflow_screening_match` for cases and workflows. It applies the screening whitelist and counts against the screening quota, and is skipped when the module is off.
- Step 8: delete `ScreeningLayout`. `useAccess` uses the same rule as `usePortalAccess`.
