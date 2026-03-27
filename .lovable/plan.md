

## Plan: Add Header & Footer to Sanctions Check and Data Coverage Pages

The Sanctions Quick Check page currently has a custom mini logo instead of the main navigation. The Data Coverage pages (index + country) also lack Header/Footer. All three need the standard site navigation for consistent browsing.

### Changes

**1. `src/pages/SanctionsCheck.tsx`**
- Import `Header` and `Footer`
- Wrap content in the standard `<div className="min-h-screen flex flex-col">` layout with `<Header />` at top and `<Footer />` at bottom
- Remove the "mini brand header" block (the logo-only link around lines 152-161) since Header now provides navigation

**2. `src/pages/DataCoverageIndex.tsx`**
- Import `Header` and `Footer`
- Wrap existing JSX in standard layout wrapper with Header/Footer

**3. `src/pages/DataCoverageCountry.tsx`**
- Import `Header` and `Footer`
- Wrap existing JSX in standard layout wrapper with Header/Footer

### Scope
- 3 file edits, no new files
- Adds consistent navigation bar and footer across all subpages

