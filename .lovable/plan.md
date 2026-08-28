# Product Access Rights

One clear model: who can use each product, and what they can do inside it. Applied both internally (WorldAML staff managing clients) and client-side (a client org assigning rights to its own people).

Product architecture (confirmed):
1. **WorldAML Screening** — standalone product, live now (screening & monitoring workspace, own subscription).
2. **WorldAML Compliance Suite** — in development; KYC/KYB Onboarding and Regulatory Change Management are modules inside it, not separate products.
3. **WorldAML Academy** — training and certification.

Priority: Screening is live, so its access model ships first. Suite + Academy rights are built into the same registry but only become user-facing when each product goes live.

## Where we stand today (verified)

- Internal staff: 3 rows in `user_roles`, all `admin`. No tiering.
- Screening access today comes from `screening_subscriptions` (0 rows) + `screening_org_modules` add-on (0 rows) via `current_user_screening_entitlement()`. No per-user roles inside a client org.
- Suite/RCM: 2 `suite_org_members` rows, 1 `rcm_org_members` row — the org_member_role enum (admin, mlro, compliance_officer, analyst, viewer) exists but is barely used. No one anywhere holds mlro/compliance_officer, so Four-Eyes escalation cannot function yet.
- Result: there is no single answer to "which client has which product, and who inside that client can do what".

## What gets built

### 1. Product access registry (single source of truth)
- `product_access`: org, product (`screening` | `suite` | `academy`), plan, status (trial / active / suspended), seats, dates.
- `suite_module_access`: org, module (`kyc_kyb` | `rcm`), status, seats — created now, enforced when Suite launches.
- Every product page, guard and entitlement RPC reads from the registry.

### 2. Role presets per product
Fixed presets, no free-form permissions:

```text
Screening (live) Admin | MLRO/Approver | Analyst | Viewer
Suite (global)   Admin | Manager | Analyst | Viewer
KYC/KYB module   Admin | Reviewer | Submitter | Viewer
RCM module       Admin | Owner | Contributor | Viewer
Academy          Admin (seat manager) | Learner
```

Each preset maps to a fixed capability set (run screenings, review matches, confirm/false-positive, manage members, export, view-only). Screening's MLRO/Approver preset is what makes Four-Eyes work: an org needs at least two approvers.

### 3. Screening access now (live product)
- `product_members` table for per-user presets per product, with GRANTs, RLS and org-locking triggers.
- Screening workspace UI: Team & Access screen where a client Admin invites people, assigns a preset, revokes access — limited by seats.
- `screening-decision` and the workspace respect presets: Analysts review, MLRO/Approver resolves escalations, Admin manages members.
- Seat count surfaced on the activation page (`/screening/activate`) and in the Screening modules view.

### 4. Internal staff rights (tiered)
- Super Admin — everything (current 3 admins stay Super Admin).
- Product Manager (per product) — manage clients, plans, seats and members for that product only.
- Support — read-only across products.
- Finance — plans, seats and billing status only.
- Extends existing `admin_set_internal_role` / `admin_revoke_internal` with a product scope; all changes written to the admin audit trail.

### 5. Admin "Clients & Access" view
One table: client org, products held (Screening live, Suite/Academy shown as not-launched where applicable), plan and status per product, seats used vs bought, member count, approvers count, last activity. Filters by product and status. Actions: grant/suspend product, adjust seats, change a member's preset. Flags: Screening orgs on Four-Eyes with fewer than two approvers, orgs with zero admins, seats over limit.

### 6. Enforcement
Route guards and RLS derive from the registry plus the member's preset — a revoked product or downgraded preset takes effect immediately, server side.

## Technical notes

- New tables: `product_access`, `suite_module_access`, `product_members` — GRANTs to `authenticated` + `service_role`, RLS on, org-locking triggers matching existing suite/rcm patterns.
- Backfill: existing `screening_subscriptions`, `screening_org_modules`, `suite_org_members`, `rcm_org_members`, partner academy seats map into the registry so nothing is lost. First org member becomes Admin by default.
- New RPCs: `admin_client_access_overview()`, `admin_set_product_access()`, `set_product_member_role()` — `SECURITY DEFINER`, admin- or org-admin-gated.
- `current_user_screening_entitlement()` keeps working during rollout (legacy fallback), then reads the registry.
- Suite/Academy presets and `suite_module_access` are defined in the schema now but UI-gated until those products launch.

## Rollout

1. Tables + backfill + RPCs (guards keep working via fallback)
2. Screening Team & Access (client-side) + preset enforcement in screening functions
3. Admin Clients & Access view + staff tiering
4. Suite/Academy activation switches when those products go live
