

## Remaining Stripe + Academy Paywall Steps

We've created 4 of 16 paid course products in Stripe so far. Here's everything left to do, in order.

### 1. Finish Stripe product creation (12 remaining)

Continue creating EUR base products one per turn. Remaining paid courses:

**€29 courses (11 left):**
- AML Compliance in the Caribbean
- AML Compliance in the United States
- Sanctions Compliance
- PEP Screening & Adverse Media
- Transaction Monitoring Fundamentals
- Suspicious Activity Reporting (SAR/STR)
- Risk-Based Approach (RBA)
- Beneficial Ownership (UBO)
- Compliance Officer Essentials
- Regulatory Reporting Essentials
- Travel Rule & Wire Transfers

**€49 course (1 left):**
- Crypto AML Essentials

Free (no Stripe product needed): AML Fundamentals, Sanctions Screening Essentials.

> Note: We chose **inline `price_data`** for USD/GBP, so no extra price IDs need to be created in Stripe. Each Stripe product gets one EUR base price; USD/GBP are computed at checkout time using FX rates and passed inline.

### 2. Add the `STRIPE_WEBHOOK_SECRET`

Required for the production-grade webhook to verify Stripe signatures. I'll request this secret once products are done.

### 3. Build the `create-academy-checkout` edge function

- Auth-required (uses Bearer token like existing checkouts).
- Input: `{ courseSlug, currency: 'eur'|'usd'|'gbp' }`.
- Looks up the course's EUR base price, converts to USD/GBP via fixed rates table (e.g. EUR→USD 1.08, EUR→GBP 0.86 — easy to update later).
- Creates a Stripe Checkout Session in `mode: 'payment'` with inline `price_data` (product = pre-created Stripe product ID, unit_amount in chosen currency).
- Inserts a `pending` row into `academy_course_purchases` with `stripe_session_id`.
- Returns `{ url }` for redirect.
- `success_url`: `/academy/{slug}?purchase=success`
- `cancel_url`: `/academy/{slug}?purchase=cancelled`

### 4. Build the `stripe-academy-webhook` edge function

- `verify_jwt = false` in `supabase/config.toml` (webhook is public, signed by Stripe).
- Verifies signature with `STRIPE_WEBHOOK_SECRET`.
- Handles `checkout.session.completed`: marks the matching `academy_course_purchases` row `paid`, stores `stripe_payment_intent_id`, sets `paid_at`.
- Handles `charge.refunded`: marks `refunded`.
- Uses service role key (bypasses RLS — RLS already blocks direct user writes).

### 5. Update `useCourseGate` (rename → `useCourseAccess`)

Add a new check alongside the existing prerequisite logic:

- Course is free (slug in `FREE_COURSES` set) → accessible.
- User has a `paid` row in `academy_course_purchases` for this slug → accessible.
- Otherwise → blocked with `requiresPurchase: true` and the price.

Prerequisite gating still applies on top (you must pass course N-1 before you can even buy course N).

### 6. Frontend: course price map + paywall UI

- Add `src/data/academyPricing.ts` mapping `courseSlug → { eur, usd, gbp, stripeProductId }`.
- On `/academy/courses/:slug`:
  - If locked by prerequisite → existing redirect UX (unchanged).
  - If locked by paywall → show **Purchase card** with currency switcher (EUR/USD/GBP, default from `RegionContext`: EU/ME→EUR, UK/IE→GBP, NA→USD), price, and "Unlock this course" button → calls `create-academy-checkout`.
- On `/academy` index: show a small "€29" / "€49" / "Free" badge on each course card; replace "Locked" with "Buy" where applicable.

### 7. Certificate gating

Certificate generation already requires passing the quiz. Add one extra check: certificate route also requires either free course OR `paid` purchase row. Free certificates remain free and shareable.

### 8. Admin visibility (light)

Add a read-only "Course purchases" panel under `/admin` showing recent rows from `academy_course_purchases` (already covered by the admin RLS policy in the migration).

---

### Technical summary

```text
Stripe products (16)  ──┐
                        ├─► create-academy-checkout (auth, inline price_data, FX) ──► Stripe Checkout
DB: academy_course_purchases (pending row)
                                                                ▼
                                          stripe-academy-webhook (signed)
                                                                ▼
                                       UPDATE row → status='paid', paid_at=now()
                                                                ▼
useCourseAccess: free | paid | locked → gates content + certificate
```

FX rates live in a single constant in the edge function for now; can be moved to a DB table or live FX API later without UI changes.

### Immediate next action

Continue with **step 1**: create the next Stripe product ("Academy: AML Compliance in the Caribbean", €29). Approve the next tool call to proceed.

