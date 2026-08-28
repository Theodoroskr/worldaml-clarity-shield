# Product Access Rights

One clear model: **two products**, with the Compliance Suite split into modules. Applied both internally (WorldAML staff managing clients) and client-side (a client org assigning rights to its own people).

Products:
1. **WorldAML Compliance Suite** — one subscription, with module entitlements for:
   - KYC/KYB Onboarding
   - AML Screening & Monitoring
   - Regulatory Change Management
2. **WorldAML Academy** — training and certification.

## Where we stand today (verified)

- Internal staff: 3 rows in `user_roles`, all `admin`. No tiering.
- Client-side membership is fragmented: 2 Suite org members, 1 RCM org member, 0 business members, 0 business entitlements, 0 screening subscriptions, 0 screening add-on modules.
- KYC/KYB and RCM are currently separate routes/tables, but commercially they are Suite modules. There is no single answer to "which client has which Suite module, and who inside that client can do what".

## What gets built

### 1. Product access registry
A single source of truth linking client organisation to product and module:
- `product_access`: org, product (`suite` | `academy`), plan, status (trial / active / suspended), seats, dates.
- `suite_modules`: org, module (`kyc_kyb` | `screening_monitoring` | `rcm`), status, seats.

Every product page, guard and feature check reads from here.

### 2. Role presets per product/module
Fixed presets, no free-form permissions:

```text
Suite (global)   Admin | Manager | Analyst | Viewer
KYC/KYB          Admin | Reviewer | Submitter | Viewer
Screening        Admin | MLRO/Approver | Analyst | Viewer
RCM              Admin | Owner | Contributor | Viewer
Academy          Admin (seat manager) | Learner
```

Each preset maps to a fixed capability set (manage members, create/edit records, approve/escalate, export, view-only). Screening's MLRO/Approver preset is what unlocks the Four-Eyes module: an org needs at least two people who can approve.

### 3. Client-side management
Inside each product/module, a Team & Access screen where the client's product Admin invites people, assigns a preset, and revokes access. Limited by seats in the registry. Cannot grant a module the org does not hold.

### 4. Internal staff rights
Staff roles become tiered per product instead of blanket admin:
- Super Admin — everything
- Product Manager (per product/module) — manage clients, plans, seats and members for that product/module only
- Support — read-only across products, no plan or role changes
- Finance — plans, seats and billing status only

### 5. Admin "Clients & Access" view
One table: client org, Suite status and modules held, Academy status, plan and status per item, seats used vs bought, member count, approvers count, last activity. Filters by product/module and status. Actions: grant/suspend a product or module, adjust seats, change a member's preset. Plus flags for orgs on Four-Eyes with fewer than two approvers, orgs with zero admins, and seats over limit.

### 6. Enforcement
Route guards and RLS both derive from the registry plus the member's preset — so a revoked module or downgraded preset takes effect immediately, server side, not just in the UI.

## Technical notes

- New tables: `product_access` (org + product + plan/status/seats), `suite_modules` (org + module + status/seats), and `product_members` (org + product/module + user + preset), all with GRANTs, RLS and org-locking triggers matching existing suite/rcm patterns.
- Backfill from current data: Suite/RCM org members, partner academy seats, screening subscriptions and modules map into the new tables so nothing is lost.
- Staff tiering extends the existing internal-access flow (`admin_set_internal_role`, `admin_revoke_internal`) with a product/module scope; all changes written to the existing admin audit trail.
- New RPCs: `admin_client_access_overview()`, `admin_set_product_access()`, `admin_set_suite_module()`, `set_product_member_role()` — all `SECURITY DEFINER`, admin- or org-admin-gated.
- Existing guards (`PortalGuard`, `useAccess`, `current_user_has_suite_access`) switch to reading the registry; legacy checks kept as fallback during rollout.

## Rollout

1. Tables + backfill + RPCs (no UI change, guards keep working)
2. Admin Clients & Access view and staff tiering
3. Client-side Team & Access screens per product/module
4. Switch guards and RLS to the registry, retire legacy checks
