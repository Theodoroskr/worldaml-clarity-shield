# Suite menu and pages follow module permissions

## What users will see
- The Suite menu only lists the pages for modules that are (a) included in the company's plan, (b) switched on by the company's Suite admin, and (c) given to that team member.
- If someone opens a hidden page through a bookmark or a typed link, they see a short "Not available" message instead of the page: "Ask your Suite admin" for team members, or "Add this module" (which opens Settings > Modules) for Suite admins.
- A menu group with nothing left in it disappears completely.
- The Dashboard shows only the counts and shortcuts for modules the person can use.

## Which pages belong to which module

```text
Always available (every Suite user)
  Dashboard, Settings, Help, Audit Trail (only their own company's records)

Screening module
  AML Screening, Monitoring, Case Queue, Cases & SAR (screening matches)

KYC / KYB module
  Onboarding, Onboarding Forms, Submissions Inbox, IDV & Liveness,
  Ownership & UBO, Documents & Expiry, Risk Assessment, Risk Heat-Map,
  Periodic Reviews, Source of Funds, Enhanced DD, AML Account Risk,
  Transactions + Alert rules, Regulatory Hub, Regulator Submissions,
  DSAR & Retention, RSS Feeds

Shared (shown if either Screening or KYC/KYB is available)
  Case Queue, Cases & SAR
```
Regulatory Compliance Management stays hidden for now, as it is today.

## Nobody gets locked out
Today only Screening has been recorded as a module. Two companies pay for the full Suite but have no KYC / KYB record, so they would lose most of the menu. Before any page is hidden:
- give KYC / KYB (and Screening) to every company with an active Suite purchase, plus the KYC / KYB the WorldAML admin already set on the client-access screen;
- new Suite purchases keep KYC / KYB switched on automatically, the same way Screening purchases already do;
- WorldAML staff (platform admins) keep seeing everything, so support still works.

## Security
Hiding menu items alone isn't enough. The same module rule is also checked on the server for the actions behind each module: the screening engine refuses to run when the company doesn't have Screening switched on for that person. Client separation is unchanged, and no company ever sees another company's modules.

## Acceptance checks
- A company with Screening only sees Dashboard, AML Screening, Monitoring, Cases, Audit Trail, Settings and Help.
- A team member whose Screening access was removed doesn't see it, and gets "Ask your Suite admin" from a direct link.
- Switching a module off in Settings > Modules updates the menu without signing out.
- The two existing full-Suite companies see the same menu as before.

## Technical details
- New `src/lib/suite/moduleRoutes.ts`: one map of `path -> required module(s) | "core"`, used by both the sidebar and the route guard.
- New `useSuiteModules()` hook: calls the `current_user_suite_modules` RPC (react-query, key `["suite-modules", orgId]`) and returns `canUse(module) = purchased && enabled && member_allowed`; platform admins (`has_role admin`) short-circuit to everything. `SuiteModulesPanel` invalidates the query after a change.
- `SuiteAppSidebar`: filter `navGroups` items and children through the map, then drop empty groups and parents.
- `<RequireModule module=...>` wrapper around the module routes in `App.tsx`, rendering the "Not available" panel (with different copy for org admins). While the modules load it shows a spinner, never the page, so nothing flashes.
- `SuiteDashboard`: hide the tiles for modules the person can't use.
- Migration (data backfill as part of the change): insert `kyc_kyb` + `screening` into `suite_module_access` for orgs with active/trial `product_access.product='suite'`; extend the sync trigger so a `suite` purchase upserts `kyc_kyb`.
- `screening-run` edge function: after the org check, require Screening to be purchased, enabled and allowed for the caller (same logic as the RPC, run server-side via a new `user_can_use_module(_module)` security-definer function); return 403 `module_not_enabled`, which the UI shows as the "Not available" message.
