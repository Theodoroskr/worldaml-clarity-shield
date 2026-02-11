

## Pricing Page: Public "Starting From" + Full Details After Login

### What Changes

**Public view (logged out):**
- Show one card per product (WorldAML API, WorldID, LexisNexis) with:
  - Product name and short description
  - "Starting from" price (e.g., "Starting from EUR 99/month")
  - 2-3 key highlights (bullet points)
  - CTA button: "Sign up to view full pricing"
- Keep the anchor jump links at the top
- JSON-LD structured data remains with "starting from" offers

**Authenticated view (logged in):**
- Show the full pricing cards with all tiers, features, and Stripe checkout buttons (current layout)
- WorldAML: Starter, Compliance, Enterprise
- WorldID: Starter, Growth, Scale, Enterprise
- LexisNexis: Full interactive regional calculator

### Technical Approach

**File: `src/pages/Pricing.tsx`**

1. Use the existing `useAuth()` hook to check login state
2. Conditionally render:
   - If `!user`: simplified "starting from" cards with register/login CTA
   - If `user`: full pricing sections (current code, unchanged)
3. CTA buttons for logged-out users link to `/signup?redirect=/pricing`

### No backend changes needed
- Auth context already exists
- Stripe checkout already gates on auth
- No new tables or edge functions required

### Summary of sections

| Product | Public Price Shown | Full Detail Trigger |
|---|---|---|
| WorldAML API | Starting from EUR 99/month | Login |
| WorldID | Starting from EUR 1.50/IDV | Login |
| LexisNexis | Starting from EUR 75/user/month | Login |

