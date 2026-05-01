
## What changes

Replace the current two-column "What you get" section (Free vs Paid) on the Academy page with a polished three-tier pricing card layout:

1. **Free tier** (€0) — unchanged: 2 free courses, quizzes, certificates.
2. **Per-Course tier** (from €29) — existing one-time purchase model with bundle discounts.
3. **Annual All-Access tier** (new, e.g. €199/year) — annual prepaid subscription unlocking every course, with rollover messaging.

### Pricing card details for the new Annual tier
- Badge: "Best value"
- Price display: €199/year (or localised equivalent via existing FX logic)
- Feature list:
  - Unlimited access to all 16+ courses
  - Annual prepaid billing — one payment, full year of access
  - Unused course completions roll over (certificates never expire)
  - Priority access to new courses added during your subscription
  - All CPD certificates and MLRO Toolkit included
  - Cancel anytime, keep certificates earned
- CTA: "Subscribe annually" (links to contact-sales for now — no Stripe subscription wired yet)

### Rollover usage callout
- Add a small highlighted callout below the pricing cards:
  > "Annual subscribers: your access renews each year. Certificates and CPD credits you've earned are yours forever — they never expire, even if you cancel."

### Technical details
- **File modified**: `src/pages/Academy.tsx` — the "What you get" section (lines ~464–565)
- **No backend changes** — this is a UI-only update. The annual tier CTA will route to `/contact-sales` until a Stripe annual subscription product is created.
- **No new Stripe products created** in this step — the UI is forward-looking. When you're ready to wire up actual annual billing, we'll create the Stripe product and checkout flow.
- Existing per-course pricing, cart, and checkout remain completely untouched.
- Uses the existing design system: `bg-card`, `border-border`, `Badge`, teal accent for the recommended tier.
