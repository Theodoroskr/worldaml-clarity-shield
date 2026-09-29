# Link the screening product from the Academy page

## What already exists

The screening product page is already built and working:

- `/screening-monitoring` — hero, what it is, features, use cases, plans, plan comparison, FAQ data, demo call to action.
- `/screening-monitoring/pricing` — the same plan cards and comparison on a dedicated pricing page.
- Every fixed-price plan already has a "Buy now with card" button (Stripe checkout) plus a "Talk to sales" option, and cancelled checkouts return to the plans section with a clear message.

So no new page or pricing work is needed. The only missing piece is a way for Academy learners to discover it.

## What gets added

A promo banner near the top of the Academy page:

- Short line positioning the product for learners, e.g. "Put your training into practice — screen customers against 1,900+ sanctions, PEP and adverse media lists."
- Primary button "See screening plans" going to `/screening-monitoring`.
- Secondary text link "Try the free sanctions check" going to `/sanctions-check`.
- Dismissible, with the choice remembered on that device so it does not nag returning learners.
- Sits directly below the existing "new courses" banner so the two never fight for the same spot, and stays visible after that one expires.

## Technical notes

- New component `src/components/academy/ScreeningPromoBanner.tsx`, modelled on the existing `NewCoursesBanner` (same card styling, teal accent call to action, `aria-label="Dismiss"` close button, own `localStorage` key `academy-screening-promo`).
- Rendered in `src/pages/Academy.tsx` inside the existing `container-enterprise pt-4` wrapper, immediately after `<NewCoursesBanner />`.
- No changes to pricing data, checkout functions, routes or the screening pages themselves.

## Verification

- Typecheck and prerender parse.
- Preview check of the Academy page: banner renders, dismiss works and persists, and the button lands on the screening plans with the checkout buttons visible.
