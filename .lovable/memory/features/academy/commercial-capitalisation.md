---
name: Academy commercial capitalisation
description: Team SKU (5+ seats, 20% off, invoice), INR PPP pricing, and dashboard nudge for inactive free users
type: feature
---
**Team SKU & quote flow**
- `same_domain_signup_count` RPC (SECURITY DEFINER, authenticated only) returns `{ domain, signup_count }` excluding free webmail domains.
- `useTeamSignupCount` + `TeamQuoteBanner` show a "Request team quote" CTA when ≥3 colleagues from same company domain registered. Mounted on `/academy` (hero) and inside the cart drawer (compact).
- CTA routes to `/contact-sales?topic=academy-team-quote&seats=N&domain=...`. ContactSales prefills a procurement-style message (PO/NET-30, 20% bulk discount, admin dashboard, VAT invoice) and selects the synthetic `academy-team` product (5+ seats).

**India / PPP pricing**
- New region `in` (India & South Asia: IN, PK, BD, LK, NP, BT) routes to INR.
- `INR_PPP_OVERRIDES` map (mirrored in `create-academy-checkout` edge fn): €29 → ₹999, €49 → ₹1,699. Formatted with `en-IN` locale, no decimals.
- Stripe checkout accepts `currency=inr` and uses paise.

**Free→Academy nudge**
- Dashboard shows "Your first lesson is free" card (links to `/academy/aml-fundamentals`) when the signed-in user is >7 days old, has 0 paid academy purchases, and hasn't dismissed it (`dashboard_first_lesson_nudge_dismissed` in localStorage).
