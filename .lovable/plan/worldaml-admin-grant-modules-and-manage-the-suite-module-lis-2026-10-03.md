# WorldAML admin: grant modules and manage the Suite module list

## What exists today
Admin → Suite Modules already lists every client company and lets you grant, trial, suspend or end Screening, KYC / KYB and Regulatory Compliance for each one. This plan builds on that screen.

## What gets added

### 1. Module catalogue (new "Catalogue" tab)
One place to manage which modules exist in the Suite:
- Name, short description and icon shown to clients in Settings → Modules
- Status: **Live** (clients can use it), **Coming soon** (clients see it but can't request it), **Hidden** (no client sees it — e.g. Regulatory Compliance today)
- How clients get it: **Request access** (comes to you for approval) or **Buy now** (straight to checkout, with the price shown)
- Default trial length
Hiding a module removes it from every client's menu and Settings → Modules, even if previously granted (their data is kept, nothing is deleted).

### 2. Company grants (current screen, improved)
- Search and filter by company, module and status (active, trial, suspended, ending soon)
- Set an end date on any grant, not only trials
- Bulk action: grant or trial a module to several companies at once
- Click a company to see its modules, who in its team uses each one, and its history

### 3. Requests inbox
Module requests sent by Suite admins appear here with Approve (choose active or trial) or Decline with a note. The client sees the result in Settings → Modules.

### 4. Activity log
Every grant, trial, suspension, end, catalogue change and request decision made by a WorldAML admin is recorded (who, when, before/after) and cannot be edited. The company's own Suite admin sees changes affecting their company in their Audit Trail.

## Security
- Only WorldAML admins can open these screens; every action is checked on the server.
- Suite admins still only switch on modules their company has been granted.
- Client separation unchanged: nothing on these screens exposes one client's data to another.
- Security scan before release.

## Technical details
- New table `suite_module_catalog` (key = suite_module_key, name, description, icon, status live/coming_soon/hidden, acquisition request/checkout, stripe_price_id, default_trial_days, sort_order); public read of live/coming_soon rows, admin-only write via has_role; GRANTs included.
- New table `suite_module_requests` (organisation_id, module, requested_by, note, status pending/approved/declined, decided_by, decided_at, decision_note); org members read own org, insert via existing request flow, admins decide via RPC `admin_decide_module_request`.
- New insert-only `admin_module_audit` table; `admin_set_org_module`, catalogue updates and request decisions write to it and also to `suite_audit_log` for the affected org.
- `current_user_suite_modules()` and `user_can_use_module()` also require catalogue status = live.
- `admin_set_org_module` accepts `ends_at` for any status; new `admin_bulk_set_org_module(org_ids[], module, status, days)`.
- UI: AdminSuiteModules.tsx gets tabs Companies / Catalogue / Requests / Activity; SuiteModulesPanel reads names, descriptions and buy/request mode from the catalogue.
