# Role Evaluation & Governance

## What the data shows today (verified)

Internal staff roles (`user_roles`, enum admin/moderator/user):
- 3 rows, all `admin`: theodoros@, gnicolaou@, sviolari@ (infocreditgroup.com)
- No `moderator` or `user` rows — internal access is effectively all-or-nothing

Customer-side roles:
- Suite org members: 2 rows, both `admin` — theodoros@ (My OrganisationTest), gnicolaou@ (Infocredit)
- RCM org members: 1 `admin`
- Business members: 0 rows (3 business accounts, owner-only)
- Partners: 4 active (2 with no linked staff profile), all `portal_access = active`
- Profiles: 794, all `approved`
- Customer portal users: 0

## Issues this surfaces

1. Four-Eyes / Escalation module cannot function: no member anywhere holds `mlro` or `compliance_officer`, and each org has exactly one member — an escalated match has no second senior reviewer.
2. Every internal staff member is a full admin; there is no read-only / support / finance tier even though the org-member enum supports `analyst` and `viewer`.
3. No single place to see, per user, which roles and entitlements they hold across Academy, Business, Partner, Suite/Screening, RCM and Admin.

## Proposed work

### 1. Roles & Access overview (Admin Portal)
New page `/admin/roles` listing every account that holds any role or entitlement, with columns: user, email, staff role, suite org + org role, RCM role, business membership, partner status, screening plan, last activity. Search + filter by surface and by role. Read-only first release.

### 2. Role assignment actions
From the same page: grant/revoke staff role, and change a user's suite org role (admin / mlro / compliance_officer / analyst / viewer). Every change written to the existing admin audit trail.

### 3. Segregation-of-duties checks
A checks panel that flags, from live data:
- orgs on the Escalation module with fewer than two members able to approve
- orgs where all members are `admin`
- partners with no linked user account
- staff admins with no recent activity

## Technical notes

- New `admin_roles_overview()` SECURITY DEFINER RPC aggregating `user_roles`, `profiles`, `suite_org_members`, `rcm_org_members`, `business_members`/`business_accounts`, `partners`, `screening_subscriptions`.
- Role mutations reuse existing patterns (`admin_set_internal_role`, `admin_revoke_internal`) plus a new RPC for suite org role changes, both admin-gated via `has_role()` and logged.
- No enum changes: `app_role` and `org_member_role` already cover the needed tiers.
- UI follows the existing admin table/tab conventions used in `AdminScreeningProduct.tsx`.
