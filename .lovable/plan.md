

## Add "Data Sources" link to Suite top menu

The Suite header navigation is missing a Data Sources entry, causing the menu to feel incomplete. Add it alongside the existing Suite product/section links.

### Change
**File:** `src/components/suite/SuiteHeader.tsx`

- Add a new nav item **"Data Sources"** linking to `/data-sources` (existing public route, rendered by `src/pages/DataSources.tsx`).
- Place it in the primary nav array next to the other product links so it inherits the existing styling, active-state highlight, and mobile menu behavior — no bespoke markup.
- Mobile drawer picks it up automatically since it iterates the same nav array.

### Out of scope
- No changes to the Data Sources page itself.
- No changes to the marketing site `Header.tsx` (this fix is scoped to the Suite header the user flagged).
- No new routes, icons, or copy beyond the single label.

