

## Academy Cart + Bundle Discounts + 1-Month Access

Adds a multi-course basket with automatic bundle discounts and a 1-month access window after purchase. This builds on the paywall work already in progress (Stripe products, `academy_course_purchases` table, inline `price_data` checkout).

### Pricing rules

- 1 course → full price
- 2 courses → **5% off the basket total**
- 3+ courses → **10% off the basket total**
- Free courses cannot be added to the basket (they're already free).
- Discount applied as a single `coupon` line in Stripe Checkout (not per-line), so the user sees one clear discount row.

### Access window

- Each `paid` purchase gets `expires_at = paid_at + 1 month`.
- `useCourseAccess` treats a purchase as valid only if `now() < expires_at` (or `expires_at IS NULL` for legacy/free).
- Expired courses re-show the paywall with a "Renew access" button (same checkout flow).
- Certificates already earned remain valid forever and stay shareable — expiry only blocks course content access, not the certificate the user already earned.

### Schema change (migration)

Add to `academy_course_purchases`:
- `expires_at TIMESTAMPTZ` — set by webhook to `paid_at + interval '1 month'`.
- Drop the partial unique index `idx_acp_user_slug_paid` and replace with a non-unique index — so a user can repurchase the same course after expiry.

### Cart implementation

**State**: `src/contexts/CartContext.tsx` — React context, persisted to `localStorage` under `academy-cart`. Stores `string[]` of course slugs. Exposes `add`, `remove`, `clear`, `items`, `count`, plus computed `subtotal`, `discountPct`, `discountAmount`, `total` per currency.

**UI surfaces**:
1. **Course card** (`/academy`) — replace the per-course "Buy" button with **"Add to basket"** (or "In basket ✓" toggle). Free courses keep the existing "Start" button.
2. **Course detail** (`/academy/courses/:slug`) — paywall card shows "Add to basket" + "View basket" instead of single-course "Unlock".
3. **Basket drawer** — new component `AcademyCartDrawer.tsx`, opened from a basket icon in the Academy header showing item count. Drawer lists items with remove buttons, currency switcher (EUR/USD/GBP from `RegionContext`), live discount line ("2 courses — 5% off"), total, and **"Checkout"** button.
4. **Empty state** in drawer with link back to course catalog.

### Edge function changes

Replace planned single-course `create-academy-checkout` with a basket-aware version:

- Input: `{ courseSlugs: string[], currency: 'eur'|'usd'|'gbp' }`.
- Validates: all slugs exist, all are paid courses, user doesn't already have an active (non-expired) purchase for any of them (drops dupes).
- Builds one `line_items` entry per course using inline `price_data` (linked to that course's pre-created Stripe product), unit prices in chosen currency via FX table.
- If `courseSlugs.length >= 2`: creates a one-time Stripe coupon with `percent_off: 5` (or `10` for 3+) via Stripe API and attaches it as `discounts: [{ coupon }]` on the session.
- Inserts one `pending` row per course in `academy_course_purchases`, all sharing the same `stripe_session_id`, each with proportional `amount_cents` (post-discount, rounded).
- `success_url`: `/academy?purchase=success` (catalog, since multiple courses).

**Webhook** (`stripe-academy-webhook`):
- On `checkout.session.completed`: updates **all** rows matching `stripe_session_id` to `paid`, sets `paid_at = now()`, `expires_at = now() + interval '1 month'`.
- On `charge.refunded`: marks all rows for that session `refunded` and clears `expires_at`.

### `useCourseAccess` updates

- Accessible if: free course OR has row where `status='paid' AND expires_at > now()`.
- Returns `expiresAt` so course pages can show "Access expires in 12 days" banner.
- Prerequisite gating still applies on top.

### Frontend price + region helpers

- `src/data/academyPricing.ts` — `{ slug → { eurCents, stripeProductId } }` (single source of truth; USD/GBP derived).
- `src/lib/academyFx.ts` — `convert(eurCents, currency)` using fixed rates (mirrors edge function).
- `src/lib/academyDiscount.ts` — `computeDiscount(itemCount) → { pct, label }`.

### Files added

- `supabase/migrations/<new>.sql` — adds `expires_at`, swaps the unique index.
- `supabase/functions/create-academy-checkout/index.ts` — basket checkout (already planned; updated for cart).
- `supabase/functions/stripe-academy-webhook/index.ts` — signature-verified, multi-row update with expiry.
- `src/contexts/CartContext.tsx`
- `src/components/academy/AcademyCartDrawer.tsx`
- `src/components/academy/AcademyCartButton.tsx` (header trigger with badge count)
- `src/data/academyPricing.ts`
- `src/lib/academyFx.ts`
- `src/lib/academyDiscount.ts`

### Files modified

- `src/App.tsx` — wrap Academy routes in `CartProvider`.
- `src/pages/Academy.tsx` — "Add to basket" buttons, header cart icon, price badges.
- `src/pages/AcademyCourse.tsx` — paywall card uses cart, expiry banner.
- `src/hooks/useCourseGate.ts` → renamed `useCourseAccess.ts` — adds paywall + expiry checks.
- `src/pages/AcademyCertificate.tsx` — still gated by quiz pass only (certs survive expiry).
- `supabase/config.toml` — add `[functions.stripe-academy-webhook] verify_jwt = false`.

### Outstanding prerequisites (carry over from previous plan)

- Finish the remaining 12 Stripe products (one per turn).
- Add `STRIPE_WEBHOOK_SECRET` for webhook signature verification.

### Immediate next action after approval

1. Run the schema migration (add `expires_at`, swap index).
2. Continue creating the next Stripe product, then build the cart context + drawer in parallel with the edge function.

