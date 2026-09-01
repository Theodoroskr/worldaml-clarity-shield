# Real Business entitlement system + login clarity

## What this does
Turns the Business portal into a real commercial layer: customers get plans, invoices and renewals stored in the database (not read live from Stripe), self-serve checkout works, and admins can provision customers manually. Also clarifies the Academy vs Business login experience.

## Part 1 — Entitlement system

### 1. Tables (one migration)
- `public.business_subscriptions` — one row per sold plan per org: organisation, business account, product, plan code, seats, amount/currency/interval, Stripe customer/subscription/price ids, status (trialing/active/past_due/canceled/paused), current_period_start/end, cancel_at_period_end, trial_end, canceled_at, source (self_serve/quote/manual). GRANTs to authenticated + service_role; RLS: members read their own account's rows, admins read all via has_role.
- `public.business_invoices` — persisted Stripe invoice mirror: number, status, amounts, currency, hosted URL + PDF, period, paid_at, due_at. Same grants/RLS.
- `public.stripe_webhook_events` — idempotency guard by Stripe event id.
- Drop the never-used `business_entitlements` table.
- Backfill: create `business_subscriptions` rows from existing `screening_subscriptions` + `product_access` so no current customer loses their view.

### 2. Shared provisioning helper
`supabase/functions/_shared/business/provision.ts`: given org + product + plan + seats + period, upserts `business_subscriptions`, upserts `product_access` (and screening quotas when the product is screening), creates the owner's `product_members` row. Refactor `business-quote-activate` and `claim-screening-demo` onto it so access is created one way only.

### 3. Webhook as renewal engine
Extend `stripe-worldaml-webhook`: `checkout.session.completed`, `customer.subscription.created/updated/deleted`, `invoice.paid`, `invoice.payment_failed`, `invoice.finalized`. Paid renewal rolls `current_period_end` forward on both the subscription and `product_access`; past_due keeps access + flags the account; canceled sets `product_access.status='inactive'`. Idempotent via the events table.

### 4. Self-serve checkout
`business-checkout` edge function: solution key + plan + seats from `src/lib/businessCatalogue.ts`, reuses/creates the Stripe customer on `business_accounts`, opens a subscription Checkout session; return path activates via the provisioning helper.

### 5. Portal reads the real data
- My Products / Dashboard read `business_subscriptions` first (plan, seats, renews-on / cancels-on), falling back to the existing `product_access` mapping for legacy rows — extend `src/lib/business/entitlements.ts` (pure mapper) + `entitlements.test.ts`.
- Billing page reads local subscriptions + invoices (fast, works when Stripe is slow); "Manage billing" still deep-links to the Stripe portal.

### 6. Admin customer management
New Customers section in the admin portal: create business account + org, grant a plan manually (seats, price, period, no card — for invoiced customers), change plan/seats, cancel, view subscriptions + invoices per company. All actions to the existing admin audit trail.

### 7. Renewal emails
Scheduled function emails 14 and 3 days before renewal, and on payment failure.

## Part 2 — Login clarity
- Keep the three doors: `/academy/login`, `/business/login`, `/partner/login` — one identity, the door decides where you land. Generic `/login` stays product-count based.
- Soft strictness: entering via the "wrong" door signs you in and shows that portal (with the self-serve catalogue) instead of blocking.
- Clearer labels so the two doors are visibly distinct in the Sign In dropdown and portal headers (e.g. "Client Portal" vs "Academy").
- No changes to PortalGuard semantics.

## Suggested order
1. Tables + RLS + backfill
2. Provisioning helper; refactor quote activation + demo claim
3. Webhook expansion
4. Portal read path (Products/Dashboard/Billing)
5. Self-serve checkout
6. Admin customer management
7. Renewal emails
8. Login labels (quick, any point)
