
# Fix Academy Paid Course Checkout

## Problem

No one can buy paid courses because of three cascading failures:

1. **Database**: All 18 courses have `stripe_price_id = NULL`, `stripe_product_id = NULL`, and `price_eur_cents = 0`.
2. **Stripe**: Only 4 of 15 paid courses have Stripe products created (KYC & CDD, AML Europe, AML GCC & MENA, AML Asia-Pacific). The other 11 have no products at all.
3. **Edge function**: The `create-academy-checkout` function has a hardcoded `PRICING` map with **stale slugs** that don't match the database (e.g. `aml-compliance-eu` in the edge function vs `aml-europe` in the DB). Even if the DB were correct, the slug mismatch would cause "Unknown course" errors.
4. **Frontend config**: `academyPricing.ts` has the correct slugs but all `stripeProductId` fields are empty strings.

The result: the purchase wall shows "This course is not yet available for purchase" for every paid course.

## Plan

### Step 1 --- Create 11 missing Stripe products (all at EUR 29.00 except the two crypto courses at EUR 49.00)

Create one Stripe product + one-time price for each of these courses:

| Slug | Price | 
|---|---|
| aml-americas | EUR 29 |
| aml-africa | EUR 29 |
| aml-cis | EUR 29 |
| pep-screening-edd | EUR 29 |
| adverse-media-intelligence | EUR 29 |
| beneficial-ownership | EUR 29 |
| beneficial-ownership-ubo-transparency | EUR 29 |
| transaction-monitoring-sar | EUR 29 |
| risk-based-approach | EUR 29 |
| international-sanctions-compliance | EUR 29 |
| crypto-aml | EUR 49 |
| crypto-aml-essentials | EUR 49 |

(12 products total -- crypto-aml was also missing)

### Step 2 --- Update the database

Use the insert tool to run UPDATE statements on `academy_courses`, setting `stripe_product_id`, `stripe_price_id`, and `price_eur_cents` for all 15 paid courses using the Stripe IDs from Step 1 plus the 4 existing ones:

- KYC & CDD: `prod_UNtNyYF6HC7Osp` / `price_1TP7b1Lz1lUQpGdDbUFcR1mr` / 2900
- AML Europe: `prod_UNtOIK9w7fRxZy` / `price_1TP7btLz1lUQpGdDDZ5AdfNG` / 2900
- AML GCC & MENA: `prod_UNtPKlfpEfKIP6` / `price_1TP7cJLz1lUQpGdDoS8nj8Oh` / 2900
- AML Asia-Pacific: `prod_UNtWobcmrPAJU3` / `price_1TP7jkLz1lUQpGdDs7NLWGjx` / 2900

### Step 3 --- Update `src/data/academyPricing.ts`

Fill in every `stripeProductId` field with the real product IDs from Stripe.

### Step 4 --- Fix the edge function `create-academy-checkout/index.ts`

- Replace the stale hardcoded `PRICING` map with the correct slugs and product IDs (matching the database).
- Since the function already falls through to DB-managed pricing when `stripe_product_id` and `price_eur_cents` are present, the hardcoded map mainly serves as a safety fallback. Aligning it eliminates the "Unknown course" error path.

### Step 5 --- Smoke-test the checkout flow

- Call the `create-academy-checkout` edge function with a test course slug to confirm it returns a valid Stripe Checkout URL.
- Verify the Stripe session contains the correct price, product, and metadata.
- Check that the `academy_course_purchases` table receives a `pending` row.

## Technical details

- The webhook (`stripe-academy-webhook`) is already correctly implemented: it listens for `checkout.session.completed` and marks pending rows as `paid` with a 1-month `expires_at`.
- The frontend purchase wall (`AcademyCourse.tsx` line 370-372) checks `isPaidCourse(slug)` OR `stripe_price_id` being truthy. Once `price_eur_cents > 0` in the DB and `isPaidCourse` returns true from the updated pricing map, the "Add to basket" button will be enabled.
- The cart drawer reads prices from `ACADEMY_PRICING` in the frontend, so those must be populated for correct price display.
- No database schema changes are needed -- only data updates.
