# Channel Partners Portal

A dedicated, branded portal for approved partners — separate from the main user Dashboard — with its own layout, sidebar, and gated routes. Reuses existing `partners`, `referrals`, `deal_registrations` tables and the standard Cloud auth session; adds a small commission-payouts table and marketing-assets registry.

## Routes (all under `/partner-portal`, sign-in required)

```text
/partner-portal                → overview (stats, quick links)
/partner-portal/referrals      → referral link + referred leads table
/partner-portal/deals          → register / track deal protection
/partner-portal/commissions    → earnings, pending vs paid, payout history
/partner-portal/assets         → downloadable marketing kit (logos, one-pagers, decks, email templates, banners, co-branded PDFs)
/partner-portal/profile        → display name, logo, tagline, verticals, website, sandbox key
/partner-portal/settings       → payout details (bank/PayPal), notification prefs
```

Legacy `/partners/dashboard` redirects to `/partner-portal`.

## Access control

- Must be signed in. If no `partners` row exists for the user → show "Apply to Partner Program" screen linking to `/partners/apply`.
- If a row exists but `is_active = false` → "Application under review" screen.
- Active partners see the full portal.
- Admins can impersonate any partner via `?partner_id=` (admin-only, checked with `has_role`).

## New DB objects

- `partner_payouts` — payout ledger per partner (`amount_eur`, `currency`, `status: pending|processing|paid|failed`, `paid_at`, `method`, `reference`, `notes`).
- `partner_assets` — marketing asset registry (`title`, `description`, `category: logo|one_pager|deck|email_template|banner|case_study|contract`, `file_url`, `thumbnail_url`, `certification_min: bronze|silver|gold`, `is_active`).
- Extend `partners` with `payout_method`, `payout_details_encrypted`, `notification_prefs jsonb`.

RLS:
- `partner_payouts`: partner reads own rows; admins full access; service role manages inserts from finance workflow.
- `partner_assets`: any active partner reads active assets whose `certification_min` ≤ their level; admins manage.

All new tables get `GRANT`s for `authenticated` + `service_role` and RLS enabled.

## Commission view

Computed live from `referrals` + `deal_registrations`:
- Lifetime earned = SUM(`commission_earned`) on `referrals` where converted.
- Pending = converted referrals not yet in a paid `partner_payouts` row.
- Paid = SUM(`partner_payouts.amount_eur` WHERE status='paid').
- Deal pipeline value = SUM(`estimated_arr_eur`) grouped by status.

Cards + monthly bar chart (recharts).

## Marketing assets

- Uploaded/managed by admin in `/admin/partners` → new "Assets" tab.
- Files stored in existing Supabase storage bucket (new `partner-assets` bucket, private, signed URLs on download).
- Portal `/assets` page: grid filtered by category, gated by partner's `certification_level`.
- Co-branded PDF generator (basic): merges partner logo + name into a pre-made one-pager template client-side (jsPDF) — v1 stub, extendable.

## Layout & design

- New `PartnerPortalLayout` with sidebar (mirrors `AdminLayout` style, but branded teal/navy for partners).
- Topbar shows partner name + certification badge (bronze/silver/gold) + copy-to-clipboard referral link.
- Reuses design tokens; no hardcoded colors.

## Technical details

Files:
- `src/pages/partner-portal/PartnerPortalLayout.tsx`
- `src/pages/partner-portal/Overview.tsx`
- `src/pages/partner-portal/Referrals.tsx`
- `src/pages/partner-portal/Deals.tsx`
- `src/pages/partner-portal/Commissions.tsx`
- `src/pages/partner-portal/Assets.tsx`
- `src/pages/partner-portal/Profile.tsx`
- `src/pages/partner-portal/Settings.tsx`
- `src/components/partner-portal/PortalSidebar.tsx`
- `src/components/partner-portal/PortalTopbar.tsx`
- `src/components/partner-portal/CommissionChart.tsx`
- `src/components/partner-portal/AssetCard.tsx`
- `src/hooks/usePartner.ts` — loads partner row + derived commission totals.
- `src/pages/admin/AdminPartnerAssets.tsx` — asset CRUD for admins.
- Migration: `partner_payouts`, `partner_assets`, `partners` column additions, RLS + GRANTs, storage bucket policy.
- Route additions in `src/App.tsx`; redirect from `/partners/dashboard`.
- Header: when signed-in user is an active partner, add "Partner Portal" link (alongside existing Admin link).

Out of scope (can add later): automated Stripe payouts, tax-form collection, MDF request workflow, deep Zoho CRM sync of commissions.

Confirm and I'll build it.
