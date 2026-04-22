

## Cart drawer: detailed price breakdown

Expand the Academy cart drawer summary so users see a clear line-item breakdown before they hit Checkout.

### What changes for the user

In the drawer footer (above the Checkout button), replace the single "Total" row with a structured summary:

```text
Subtotal (3 courses)         €87.00
Bundle discount (10% off)   −€8.70
─────────────────────────────────
Total                        €78.30
VAT will be calculated at checkout
```

- **Subtotal** — sum of list prices in the user's region currency, with item count.
- **Bundle discount** — only shown when `discountPct > 0`; uses the existing tier label ("5% bundle discount (2 courses)" / "10% bundle discount (3+ courses)") in muted/accent green.
- **Total** — bold, larger, in the regional currency.
- **Tax note** — small muted line stating VAT/sales tax is handled by Stripe Checkout (Stripe Tax computes and displays it on the hosted page; we don't pre-compute it).
- **Empty cart** — unchanged (existing empty state).

### Technical details

- File: `src/components/academy/AcademyCartDrawer.tsx`.
- Pull `subtotal`, `discountPct`, `discountAmount`, `total` from the existing `computeTotals(currency)` in `CartContext` — no new math, no schema change.
- Use `formatPrice` from `src/lib/academyFx.ts` for all amounts; pull `currency` from `RegionContext` the same way the rest of the drawer does.
- Pull the discount label from `computeDiscount(items.length).label` in `src/lib/academyDiscount.ts` to stay in sync with the checkout edge function.
- Conditionally render the discount row only when `discountAmount > 0`.
- Keep existing line-item list and Checkout button untouched; only the summary block between them changes.
- No backend, migration, or Stripe changes — Stripe Checkout already shows tax on its hosted page when Stripe Tax is enabled.

