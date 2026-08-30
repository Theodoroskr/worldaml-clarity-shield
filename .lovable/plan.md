# Fix: "Buy now with card" doesn't open the Stripe payment screen

## Diagnosis (verified)

- The `create-worldaml-checkout` Edge Function works — direct test returned HTTP 200 with a valid `checkout.stripe.com` URL.
- Clicking "Buy now with card" in a normal browser tab **works** (Playwright test landed on the Stripe payment page).
- The failure happens inside the **Lovable preview**, where the app runs inside an iframe on `lovable.app`. `AMLPackagesSection.tsx` navigates with `window.location.href = data.url`, i.e. the iframe itself navigates to Stripe Checkout. Stripe Checkout uses first-party cookies/storage and in the embedded preview context the payment page fails to render (blank/stuck screen).

## Changes

1. **`src/components/aml-screening/AMLPackagesSection.tsx`**
   - Replace `window.location.href = data.url` with opening the checkout URL in a new top-level tab: `window.open(data.url, "_blank", "noopener,noreferrer")`.
   - Popup-blocker fallback: if `window.open` returns `null`, fall back to `window.location.href` (production domains, where same-tab redirect is fine).
   - Surface real server errors: read the response body on `FunctionsHttpError` so the toast shows the actual reason (e.g. "Online checkout for this plan is not available yet") instead of a generic message.
   - Apply the same new-tab logic to the guest-checkout resume effect (it calls the same `startCheckout`).

2. **Sweep for the same pattern** in sibling checkout entry points (e.g. `src/components/api/APICompanyPricingSection.tsx`, Academy checkout, business-portal plan checkout) and apply the same new-tab + fallback behaviour wherever `window.location.href` is used for a Stripe URL.

3. **Verify** with Playwright: click "Buy now with card", assert a new tab opens on `checkout.stripe.com` and the Stripe payment form renders; confirm the popup fallback and error toast paths still work.

## Technical notes

- New-tab redirect is the pattern recommended for Stripe Checkout (per the project's subscription integration guide: "open the checkout session in a new tab").
- No changes to the Edge Functions, prices, or success/cancel redirects — those were verified working earlier.
- The published site (`worldaml.com`) is unaffected by the iframe issue, but the new-tab behaviour is safer everywhere.
