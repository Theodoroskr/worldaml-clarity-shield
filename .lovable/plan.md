
## Add Sanctions Search Widget to Dashboard

### Overview
Embed a fully functional inline sanctions search widget on the Dashboard page so authenticated users can run checks without navigating away. The widget will reuse existing components (`SanctionsSearchForm`, `SanctionsResultCard`, `SanctionsDisclaimerBanner`) and the same `handleSearch` logic already proven on the `/sanctions-check` page.

### What will be built

**New file: `src/components/sanctions/DashboardSanctionsWidget.tsx`**
A self-contained component that includes:
- A card header with a Shield icon, title "Sanctions Quick Check", and a remaining-searches badge showing the logged-in user's quota
- The `SanctionsSearchForm` embedded inline
- Result rendering using `SanctionsResultCard` (up to 5 results with a "Show all" toggle)
- Empty state (no hits), error state, and loading state
- A small `SanctionsDisclaimerBanner` beneath results
- A "Full search page →" link to `/sanctions-check` for advanced filtering (country/type)

**Updated file: `src/pages/Dashboard.tsx`**
- Import and render `DashboardSanctionsWidget` below the existing cards grid, spanning the full width as a separate prominent section titled "Quick Tools"

### Search logic
The widget will replicate the `handleSearch` function from `SanctionsCheck.tsx`:
- Reads the Supabase project ID and anon key from `import.meta.env`
- Attaches the user's `Authorization` Bearer token (via `supabase.auth.getSession()`) since the user is always authenticated on the dashboard
- Posts to the `sanctions-search` edge function
- Updates `remaining` count in local state after each search

### Technical details
- No new edge functions or DB migrations needed — reuses the existing `sanctions-search` function
- No anonymous gating logic needed (dashboard is auth-protected)
- Widget state is local (no persistence between page loads — same as the standalone page)
- Results limited to 5 visible by default with a "Show all N results" button, same as the authenticated flow on the standalone page

### Files to change
1. **Create** `src/components/sanctions/DashboardSanctionsWidget.tsx` — new self-contained widget
2. **Edit** `src/pages/Dashboard.tsx` — add a "Quick Tools" section below the cards grid, rendering the widget full-width
