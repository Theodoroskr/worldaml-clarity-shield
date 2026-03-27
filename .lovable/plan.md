

## Plan: Hide LexisNexis Price for Guests

Remove the "Starting from €75/user/month" price from the LexisNexis card in the public (non-authenticated) view on the Pricing page. Replace it with a "Log in to see pricing" prompt, consistent with the gate-pricing-behind-auth strategy.

### Changes

**`src/pages/Pricing.tsx`** (lines 386-390)
- Remove the price block (`Starting from`, `€75`, `/user/month`)
- Replace with a lock icon and "Sign up to see pricing" text, matching the existing CTA style below it
- Keep all feature bullet points (2.5M+ profiles, unlimited searches, progressive discounts) visible to guests

### Scope
- 1 file, ~5 lines changed

