# WorldAML Admin Portal — Data Flow Audit + Adaptation Plan

Audit first, as requested. No CRM connectors or workflows are touched anywhere in this plan.

## A. Data flow audit

| Area | Source of truth (tables/APIs) | Portals writing it | Admin surface reading it | Live / cached | Known gaps |
|---|---|---|---|---|---|
| Users / identity | `profiles`, `auth.users` (via `admin_user_activity`), `user_roles` | All portals | User Management, Dashboard, Internal Access | Live query, no realtime | No `last_activity_at`; no single 360 view |
| Academy | `academy_course_purchases`, `academy_progress`, `academy_certificates`, `academy_courses`, `academy_recognition_levels` | Academy | Academy Signups, Funnel, Purchase Status, Reconcile | Live | Course started/completed exist as progress rows, not events; no per-user timeline |
| Business | `business_accounts`, `business_members`, `business_entitlements`, `business_events`, `business_quote_requests` | Business Portal | Admin Business | Live | Company 360 missing; product-view events sparse |
| Partners | `partners`, `partner_applications`, `deal_registrations`, `referrals`, `partner_commissions`, `partner_payouts`, `partner_deal_events`, `partner_admin_audit_log` | Partner Portal + Admin | Partner Program | Live | Deal/referral changes not realtime in Admin |
| Suite | `suite_organizations`, `suite_org_members`, `suite_screenings`, `suite_alerts`, `suite_audit_log` | Suite | Organisations, Alert Rules | Live | Suite usage not represented on the main dashboard |
| Leads / website | `form_submissions` (+ `signup_source`, `signup_utm`, `signup_landing_path`, `signup_referrer` on `profiles`) | Public site | Dashboard, Notifications | Live | First-touch stored, latest-touch not; no GA data source connected |
| Payments / revenue | `academy_course_purchases` (Stripe session + status), `product_purchase_notifications` | Academy / Business checkout | Purchase Status, Reconcile, Dashboard | Live | Refunds not modelled as a distinct amount; gross vs net not separated |
| Analytics | `admin_analytics()` RPC — already server-side aggregation over 20+ tables | — | Dashboard, Reports | Cached per request, no "last updated" shown | Refresh time not surfaced |
| Notifications | `admin_notifications` + `admin_notifications_sync()` derived from real records | Derived | Bell, Centre, page alerts | Realtime | Already correct — derived, auto-resolving |
| Reports | `admin_reports`, `admin_report_runs` | — | Reports | Executed at run time | Already queries live at execution |

### Findings

1. **Already correct:** one shared backend; `admin_analytics()` is a real server-side aggregation; notifications derive from business records and auto-resolve; admin actions (partner approval, portal access, suite access, reconcile) already write to the source records with audit logging.
2. **Duplicated today:** none material — no admin-only copies of records exist.
3. **Not stored today:** unified cross-portal activity stream; `last_activity_at`; latest-touch attribution; refunded amounts.
4. **Admin can't currently see:** per-user cross-portal timeline; company-level (domain/org) rollup; Suite usage on the main dashboard.
5. **Inconsistent definitions:** user segmentation is defined in `adminUserIntel.ts` (frontend) while reports/analytics define it in SQL.
6. **Realtime opportunities:** leads, partner applications, deal registrations, payment status changes (cheap tables, low volume).
7. **Should stay cached:** revenue, growth, funnel and partner performance aggregates from `admin_analytics()`.
8. **Missing events:** academy completion, business product purchase, partner deal lifecycle, website form submitted — as a single normalised stream.
9. **Missing timestamps:** `last_activity_at` on `profiles`; `refunded_at`/`refund_amount` on purchases.
10. **Missing relationships:** company ↔ users link by verified email domain / business account id.
11. **Security:** department-based visibility already exists for notifications; must be applied to the new 360 views.
12. **Performance:** dashboard already aggregates server-side; new views must be indexed and paginated.

## B. Adaptation plan (additive only, no data loss)

### 1. Central activity stream (additive)
- New `public.ecosystem_events` (`event_type`, `entity_type`, `entity_id`, `user_id`, `organisation_id`, `portal`, `occurred_at`, `metadata`), admin-read only, service-role write.
- Backfill-free triggers on existing tables emit: `academy.purchase_completed`, `academy.course_completed`, `academy.certificate_issued`, `business.account_created`, `business.product_purchased`, `partner.application_submitted`, `partner.deal_registered`, `partner.deal_approved`, `partner.commission_earned`, `suite.screening_completed`, `website.form_submitted`.
- Existing per-domain event tables stay untouched and keep working.

### 2. Missing timestamps and revenue fields
- Add `last_activity_at` to `profiles` (maintained by the event triggers).
- Add `refund_amount` / `refunded_at` to Academy purchases so gross, refunded and net revenue are separable.

### 3. User 360 and Company 360
- `admin_user_360(user_id)` RPC: identity, entitlements, Academy, Business, Partner, Suite, acquisition and commercial sections from the real records.
- `admin_company_360(domain or business_account_id)` RPC: users, Academy spend, business products, partner relationship, deals, revenue. Matched by business account id or verified email domain only — never by name similarity.
- Surfaced inside the existing user detail dialog and Admin Business, plus an activity timeline from `ecosystem_events`.

### 4. Live vs cached
- Realtime subscriptions for `form_submissions`, `partner_applications`, `deal_registrations`, `academy_course_purchases` status changes.
- Aggregates keep the existing RPC with a visible "Last updated HH:MM" plus Refresh control on every cached card.

### 5. Consistency and drill-down
- Move segment definitions into one shared SQL definition used by dashboard totals, tables, exports and scheduled reports.
- Make KPI cards clickable to the filtered record list they represent.
- Exports run server-side against the same filters.

### 6. Data quality panel
- `admin_data_quality()` RPC surfacing: Stripe paid vs local pending, portal access without entitlement, purchases without a user, orphaned business members, duplicate identities. Shown as a review list, never auto-fixed.

### Technical notes
All schema work is additive (`CREATE TABLE`, `ADD COLUMN IF NOT EXISTS`), with GRANTs and RLS restricted to admins. No existing table, column, policy or record is dropped or rewritten. CRM connectors, `submit-form` mappings and workflow tables are left exactly as they are.

### Suggested order
1. `ecosystem_events` + triggers + timestamps (migration)
2. 360 RPCs + data quality RPC (migration)
3. Admin UI: timeline, 360 panels, realtime, last-updated, clickable KPIs, shared segments
