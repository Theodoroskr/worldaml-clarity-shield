

## Currency/region indicator for Academy pricing

Make it obvious to users which currency they're seeing on Academy prices, why, and how to change it.

### What the user sees

**1. Inline currency hint next to prices**

On the Academy catalog cards, course detail header, and cart drawer summary, append a small muted suffix to the first price shown per view:

```text
€29  EUR · EU & Middle East
```

On cards (space-tight) just show the ISO code in a small muted chip: `EUR`. On the course detail header and cart drawer (more room), show full `EUR · EU & Middle East`.

**2. Currency control in the cart drawer**

Above the price breakdown, add a compact row:

```text
Prices shown in  [ EUR — EU & Middle East ▾ ]   ⓘ
```

- The dropdown reuses the existing `RegionSelector` logic (writes to `RegionContext`, persists in the `worldaml_region` cookie). Changing it instantly re-renders all prices.
- The ⓘ tooltip (Radix `Tooltip`) explains:
  > "Prices are converted from EUR using fixed reference rates (USD ×1.08, GBP ×0.86). Final charge happens in your selected currency at Stripe Checkout, where VAT/sales tax is added based on your billing address."

**3. Course detail page**

Next to the price badge in `AcademyCourse.tsx`, render the same small `EUR · EU & Middle East` muted caption with the ⓘ tooltip (no dropdown here — keep the header clean; users change region from the cart drawer or global region selector).

**4. Auto-detection indicator (first visit only)**

When `RegionContext` has just auto-detected the region via IP (no saved cookie yet), show a one-time dismissible toast on `/academy`:

> "Showing prices in EUR for EU & Middle East. Change region anytime from the cart." [Dismiss]

Stored under `localStorage` key `academy_region_toast_dismissed` so it never re-appears.

### Technical details

- **New component**: `src/components/academy/CurrencyIndicator.tsx`
  - Props: `variant: "compact" | "full"`, optional `showTooltip?: boolean`.
  - Reads `region` + `regionConfig` from `useRegion()` and maps to currency via the existing `REGION_TO_CURRENCY` record (lift it into `src/lib/academyFx.ts` so all callers share one source).
  - `compact` → `<span class="text-caption text-muted-foreground">EUR</span>`.
  - `full` → `EUR · EU & Middle East` + optional `<Tooltip>` with the FX/tax explanation.
- **Lift `REGION_TO_CURRENCY`** from `AcademyCourse.tsx` into `src/lib/academyFx.ts` and export it. Reuse in catalog cards, course detail, and cart drawer.
- **`AcademyCartDrawer.tsx`**: add a header row above the line items (or directly above the breakdown) with `Prices shown in` label + an inline `<Select>` mirroring `RegionSelector`'s options + `<Tooltip>` trigger. Reuses `useRegion().setRegion`.
- **`Academy.tsx`** (catalog cards): append `<CurrencyIndicator variant="compact" />` next to each price badge.
- **`AcademyCourse.tsx`**: replace local `REGION_TO_CURRENCY` import; render `<CurrencyIndicator variant="full" showTooltip />` next to the price badge.
- **First-visit toast**: in `Academy.tsx`, on mount check `!isLoading && !localStorage.getItem("academy_region_toast_dismissed") && !cookieExisted`. Use the existing `sonner` toast. To detect "auto-detected vs saved", expose a `wasAutoDetected: boolean` flag from `RegionContext` (set to `true` when no cookie was found at mount).
- **No backend, schema, Stripe, or pricing-math changes** — purely a presentation + transparency layer over existing region/FX state.

