# WorldAML Portal — one real portal for paying customers

Today a paying customer lands in two disconnected places: the Business portal (`/business/*` — company, billing, team, catalogue) and the Screening workspace (`/screening/*` — search, monitored entities, alerts, team, help). They have separate shells, separate navigation and separate team screens. This turns them into a single WorldAML portal with one dashboard, product modules and an admin area.

Delivered in stages so the portal is usable after each one.

## Stage 1 — One portal shell and dashboard

- New portal shell at `/portal` (sidebar + topbar, org switcher, account menu, sign out) reusing the existing Business layout styling.
- **Dashboard** — the real landing page after login: entitlement summary (products held, plan, status, renewal date), usage against quota (searches used/remaining, monitored entities, seats used/bought), recent screening activity, open alerts and open cases, plus next-step cards for products not yet held.
- Login routing sends a customer to `/portal` and, if they hold no product, to the self-serve catalogue instead of a dead end.
- `/business/*` and `/screening/*` keep working and redirect into the matching portal section, so existing links and emails don't break.

## Stage 2 — Screening modules inside the portal

All existing screening screens move under the portal shell as modules, each gated by real entitlement (not just being signed in):

- **Search & results** — screening runs, match review, case decisions.
- **Monitoring** — monitored entities, monitoring timeline, alerts and acknowledgment.
- **Risk alerts** — alert rules and thresholds.
- **Cases & review** — case list, escalation and four-eyes approval where the add-on module is active.
- **Reports & exports** — PDF case reports, decision PDFs, CSV exports and the audit trail in one place.
- **Add-ons & activation** — the modules/activate screens, showing what is on, what is available and seats.

Locked modules show a clear "not included in your plan" state with an upgrade path rather than disappearing.

## Stage 3 — Customer admin (org owner)

A single **Administration** area, replacing the two separate team screens:

- **Team & access** — invite by email, assign the existing role presets (Admin / MLRO-Approver / Analyst / Viewer), revoke, seats used vs bought enforced server side.
- **Company profile** — company details, addresses, compliance contacts.
- **Billing** — subscriptions, invoices, payment method, plan changes and seat purchases.
- **Security** — sessions, password, 2FA settings already present.
- **Audit** — who did what in the org.

## Stage 4 — Internal WorldAML admin

Extends the existing admin area with a portal-focused **Customers** view:

- Per-customer row: products held, plan, status, seats used/bought, searches used, approvers count, last activity.
- Actions: grant / suspend a product, adjust seats, change a member's role, impersonate-free "view as" summary.
- Flags: four-eyes enabled with fewer than two approvers, orgs with zero admins, seats over limit, subscriptions past due.

## Technical notes

- Entitlement stays server-derived: `business_subscriptions` (commercial truth) → `product_access` / `screening_subscriptions` / `product_members`, read through `usePortalAccess` and `current_user_screening_entitlement()`. No new entitlement source is introduced.
- Route guards: `/portal/*` requires sign-in; each module additionally requires its product/module entitlement, mirrored by existing RLS. The currently unguarded `/screening/*` routes get proper guards as part of the move.
- New code is presentation + routing: a portal layout, a dashboard page composed from existing hooks (`usePortalAccess`, `useScreeningAccess`, `useScreeningQuota`, `useBusinessWorkspace`), and re-parented existing pages. Existing business logic, edge functions and provisioning (`_shared/business/provision.ts`) are untouched.
- Redirect components map old paths to new ones so bookmarks, emails and Stripe success URLs keep working.
- Portal routes stay `noindex`.
