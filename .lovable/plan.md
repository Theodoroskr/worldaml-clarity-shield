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

## Should you combine them?

Yes, but keep selling them as two products. They already sit on the same organisation and team setup behind the scenes. Combine the engine and the look; keep the separate plans and pricing:
- One screening engine: the Suite uses the Screening workspace's real checks.
- One audit trail that covers both.
- The same layout for both, with a switcher between Screening and Suite for people who have both.

## Fix plan (in order)

1. **Stop the fake results (urgent).** Point the Suite's AML Screening page at the real Screening workspace, the way its old "screening-v2" link already does. Switch the ownership and onboarding checks to the real engine. Remove the test data from the live app.
2. **Workspace switcher.** Add a "Switch to Suite / Switch to Screening" control to both menus, shown only to people with access to both.
3. **One look.** Restyle the Screening menu to match the Suite's (light, grouped). Keep each product's own menu items.
4. **Shared audit trail.** Record Screening decisions, invites and monitoring changes in the Suite audit log, labelled "Screening".
5. **One access rule.** Make both areas use the same "who has access" check, so they can't disagree.
6. **Demo setup.** If setting up the free demo fails or takes more than about 10 seconds, show a clear message with a retry button.
7. **Modules with admin on/off.** Today Screening add-ons (like Four-Eyes Review) can only be switched on when a customer asks and an admin approves the request. Suite module access is set on separate admin pages. Add one "Modules" panel per company in the admin portal that lists every Screening add-on and Suite module. Admins can switch each one on or off directly, optionally with an end date. Customers only see menu items for modules that are on; switched-off ones show "Ask your admin" instead.

Later, not in this plan: merging cases and alerts into one system. It's a bigger change and should be decided on its own.

## Technical details

- `src/services/screeningProvider.ts` falls back to `MockProvider` when `VITE_SCREENING_PROVIDER` isn't set, and the project never sets it. It's used by `SuiteScreening.tsx` (route `/suite/screening`), `SuiteUBO.tsx:151` and `SuiteOnboardingSubmissions.tsx:167`.
- Step 1: route `/suite/screening` to `Navigate to="/screening"` (or render `SuiteScreeningV2`). Replace `runScreening` in UBO and Submissions with `src/lib/suite/screeningV2.ts`, which calls the `screening-run` function. Leave the mock only for tests.
- Step 2: a new `WorkspaceSwitcher` in `ScreeningLayout.tsx` and `SuiteAppSidebar.tsx`, based on `usePortalAccess` (suite) and `useScreeningAccess`.
- Step 4: write to `suite_audit_log` from `screening-decision`, `invite_screening_member` and the monitoring add/remove actions, using the caller's `organisation_id`.
- Step 5: `useAccess` uses the same suite rule as `usePortalAccess`, and the duplicate rule is removed.
- Step 6: add a timeout and error state in `ScreeningWorkspace.tsx`.
