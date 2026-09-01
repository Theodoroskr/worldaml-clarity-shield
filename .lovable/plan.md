# A real entitlement system for Business accounts

## Where we are today (verified)

- `business_entitlements` exists (16 columns, including `stripe_subscription_id`) but nothing writes to it — the portal reads `product_access`, `screening_subscriptions` and `product_members` instead (`src/lib/business/entitlements.ts`).
- `product_access` has no Stripe linkage at all: `id, organisation_id, product, plan, status, seats, seats_used, started_at, current_period_start, current_period_end, metadata, created_at, updated_at`. Only `screening_subscriptions` carries `stripe_customer_id / stripe_subscription_id / stripe_session_id`, and only for screening.
- `business_accounts` now stores `organisation_id` and `stripe_customer_id`.
- Billing is read-only: `business-billing` calls Stripe live on every page load; nothing is persisted, so there is no invoice history, no renewal state, no dunning and nothing an admin can see.
- Quotes can already be priced, paid and activated (`business-quote-checkout` → `business-quote-activate`), so we have one working paid path to build on.

## The shape of the fix

Keep `product_access` as the single access table the whole platform reads (Screening, Suite, Academy all rely on it) and add a **commercial layer above it** that owns plans, money, invoices and renewals. The portal keeps reading access; the new layer is what creates and expires that access.

```text
Stripe  ──webhook──▶  business_subscriptions ──drives──▶ product_access  ──read──▶ portal + apps
                              │                                (access)
                              └──▶ business_invoices (history, PDFs, dunning)
```

### 1. `business_subscriptions` — the commercial record
One row per sold plan, per organisation. Holds: organisation, business account, product key, plan code, seats, price (amount/currency/interval), Stripe customer + subscription + price ids, status (`trialing/active/past_due/canceled/paused`), `current_period_start/end`, `cancel_at_period_end`, `trial_end`, `canceled_at`, source (`self_serve` / `quote` / `manual`). Retire `business_entitlements` (drop it — it has never held data).

### 2. `business_invoices` — persisted billing history
Mirrors Stripe invoices: number, status, amounts due/paid, currency, hosted URL + PDF, period, `paid_at`, `due_at`, attempt count. Written by the webhook, not fetched live, so the Billing page loads instantly, works when Stripe is slow, and gives admins a view of what a customer has paid.

### 3. One provisioning function
A shared `provisionEntitlement()` helper in `supabase/functions/_shared/` that, given org + product + plan + seats + period, upserts `business_subscriptions`, upserts `product_access` (and `screening_subscriptions` quotas when the product is screening), and creates the owner's `product_members` row. Every purchase path calls it: quote activation, self-serve checkout, the demo claim, and admin manual provisioning — so access can never again be created three different ways.

### 4. Webhook becomes the renewal engine
Extend `stripe-worldaml-webhook` to handle `checkout.session.completed`, `customer.subscription.created/updated/deleted`, `invoice.paid`, `invoice.payment_failed`, `invoice.finalized`, keyed by `stripe_subscription_id`:
- paid renewal → roll `current_period_end` forward on the subscription **and** on `product_access`
- `past_due` → keep access, flag the account, trigger a dunning email
- `canceled` / final failure → set `product_access.status = 'inactive'` so the app locks immediately
Events are recorded idempotently by Stripe event id so replays are safe.

### 5. Self-serve checkout for catalogue plans
`business-checkout` edge function: takes a solution key + plan + seats from `src/lib/businessCatalogue.ts`, reuses/creates the Stripe customer stored on `business_accounts`, and opens a subscription Checkout session with org/product metadata. Return path activates through the same provisioning helper. This is what the "Buy" buttons in the portal have been missing.

### 6. Admin: create real customers
New `Customers` section in the admin portal (alongside `AdminClientAccess`): create a business account + organisation, attach or manually grant a plan (with seats, price, period, no card — for invoiced customers), change plan or seats, cancel, and see subscriptions + invoices per company. Every action written to the existing admin audit trail.

### 7. Portal surfaces the real thing
- **My Products / Dashboard** — read `business_subscriptions` first (plan, seats used/total, renewal date, "renews on", "cancels on"), falling back to the existing `product_access` mapping for legacy rows.
- **Billing** — subscriptions and invoices from the local tables, with "Manage billing" still deep-linking to the Stripe portal; add cancel-at-period-end and seat-change actions for business admins.
- **Renewal reminders** — a scheduled function emails 14 and 3 days before renewal, and on payment failure.

## Technical notes

- Migrations: create `public.business_subscriptions` and `public.business_invoices` (GRANTs to `authenticated` + `service_role`, RLS scoped so a member reads only their own account's/org's rows and admins read all via `has_role`), plus `updated_at` triggers; drop `business_entitlements`; add a unique index on `stripe_subscription_id` and on `(organisation_id, product)`.
- Backfill: create `business_subscriptions` rows from existing `screening_subscriptions` + `product_access` so no current customer loses their view.
- `src/lib/business/entitlements.ts` stays a pure mapper — it gains `BusinessSubscriptionRow` as the highest-priority source; extend `entitlements.test.ts` for precedence, expiry and seat rollup.
- `supabase/functions/_shared/business/provision.ts` holds the provisioning helper; `business-quote-activate` and `claim-screening-demo` are refactored onto it rather than duplicating their upserts.
- Webhook needs `STRIPE_WEBHOOK_SECRET` verification and a small `stripe_webhook_events` guard table for idempotency.

## Suggested order

1. Tables + RLS + backfill migration
2. Shared provisioning helper; move quote activation and demo claim onto it
3. Webhook expansion (renewals, invoices, cancellation)
4. Portal read path (Products, Dashboard, Billing from local tables)
5. Self-serve `business-checkout`
6. Admin customer management
7. Renewal and dunning emails
