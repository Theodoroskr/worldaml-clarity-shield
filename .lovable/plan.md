
# Plan: WorldAML API Pricing Checkout Flow

## What Changes
The "Get Started" / "Get API Access" buttons on the WorldAML API pricing cards will now check if the user is logged in. If not, they redirect to login/register. If logged in, they initiate a Stripe checkout session.

## Steps

### 1. Create Stripe Products and Prices
Create two Stripe products for the WorldAML API plans:
- **Starter**: EUR 99/month billed annually (EUR 1,188/year)
- **Compliance**: EUR 495/month billed annually (EUR 5,940/year)
- Enterprise remains "Contact Sales" (no checkout)

### 2. Create Edge Function: `create-worldaml-checkout`
A new backend function (modeled on the existing WorldID checkout function) that:
- Authenticates the user via their session token
- Looks up or creates a Stripe customer by email
- Creates a Stripe checkout session in subscription mode with the correct price ID
- Returns the checkout URL

### 3. Update Pricing Page (`src/pages/Pricing.tsx`)
Modify the WorldAML tab to:
- Replace the static `<Link to="/get-started">` buttons with onClick handlers
- If user is **not logged in**: show a toast and redirect to `/login?redirect=/pricing`
- If user is **logged in**: call the `create-worldaml-checkout` edge function and open the Stripe checkout in a new tab
- Enterprise plan still links to `/contact-sales`
- Add loading state on buttons during checkout

### 4. Update Standalone Component (`APICompanyPricingSection.tsx`)
Apply the same auth-gated checkout logic to this component (used on the API product page) so both locations behave consistently.

## Technical Details

### Edge Function Structure
```text
supabase/functions/create-worldaml-checkout/index.ts
```
- Price ID mapping: `{ starter: "price_xxx", compliance: "price_yyy" }`
- Mode: `subscription`
- Success URL: `/dashboard?subscription=success&product=worldaml`
- Cancel URL: `/pricing?canceled=true`

### Frontend Flow
```text
User clicks "Get Started"
  --> Not logged in?
      --> Toast: "Sign in required"
      --> Navigate to /login?redirect=/pricing
  --> Logged in?
      --> Call create-worldaml-checkout with plan name
      --> Open returned Stripe URL in new tab
```

## Files to Create/Modify

| File | Action |
|------|--------|
| `supabase/functions/create-worldaml-checkout/index.ts` | Create |
| `src/pages/Pricing.tsx` | Modify (WorldAML tab buttons) |
| `src/components/api/APICompanyPricingSection.tsx` | Modify (same checkout logic) |

## Notes
- Stripe products/prices will be created using the Stripe tools before writing the edge function, so real price IDs are embedded in code
- The STRIPE_SECRET_KEY is already configured
- Enterprise plan remains a static link to Contact Sales
