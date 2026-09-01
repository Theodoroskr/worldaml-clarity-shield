# Slim down the Business portal

Keep the buyer-facing business portal, but stop it maintaining its own parallel entitlement system. It becomes a view layer over the entitlement data the rest of the platform already writes (`product_access`, `product_members`, `screening_subscriptions`), and billing stops guessing the Stripe customer from an email address.

## What changes for the user

- **My Products** finally shows something real. Today it reads `business_entitlements`, a table nothing writes to, so the page can only ever say "no products". After the change it lists the products the organisation genuinely has — including the free Screening demo, which is already provisioned correctly but invisible in the portal.
- **Billing** reliably finds the right Stripe customer instead of matching on the signed-in email address.
- Everything else in the portal — solutions catalogue, company profile, team, quotes, demo activation, support, resources — stays as it is.

## Scope

1. **Link the business account to a real organisation.**
   Add `organisation_id` and `stripe_customer_id` to `business_accounts`. Backfill `organisation_id` where the owner already has one via `product_members`/`suite_org_members`; `claim-screening-demo` sets it when it provisions a new org.

2. **Rewire the entitlement read path.**
   In `useBusinessWorkspace`, replace the `business_entitlements` query with a read of `product_access` (plan, status, seats, period end) joined with `screening_subscriptions` (search/monitor quotas) for the linked organisation. Map the results to the existing `BusinessEntitlement` shape so `BusinessProducts.tsx`, `BusinessTeam.tsx` (`ownedKeys`) and the dashboard keep working with minimal edits. Usage bars come from real quota fields.

3. **Fix Stripe customer resolution.**
   `business-billing` uses `business_accounts.stripe_customer_id` when present, falls back to the email lookup, and writes the resolved ID back so the next call is exact. Screening checkout / demo claim store the ID when Stripe creates a customer.

4. **Retire the dead table.**
   Once nothing reads `business_entitlements`, drop it (or leave it empty and unreferenced if you'd rather keep the history — it has zero rows either way).

5. **Tests.**
   Unit tests for the entitlement mapping (product_access + screening_subscriptions to the portal shape, including the no-org and no-products cases) and for the Stripe customer resolution order.

## Technical notes

- `business_accounts` today: `id, user_id, company_name, work_email, ... status` — no `organisation_id`, no `stripe_customer_id`.
- `product_access`: `organisation_id, product, plan, status, seats, seats_used, current_period_end`.
- `screening_subscriptions`: `organisation_id, plan, status, stripe_customer_id, search_quota_annual, monitor_quota, seat_quota, current_period_end`.
- Files touched: `src/hooks/useBusinessWorkspace.tsx`, `src/pages/business/BusinessProducts.tsx` (field mapping only), `src/pages/business/BusinessDashboard.tsx`, `supabase/functions/business-billing/index.ts`, `supabase/functions/claim-screening-demo/index.ts`, plus two migrations (columns + backfill, then drop `business_entitlements`).
- `business_members` and `business_events` are unchanged — team invites and internal tracking keep working as they do now.

## Out of scope

- No new self-serve checkout flows or entitlement provisioning from the portal.
- No changes to Suite org membership, partner portal, or Academy access.
