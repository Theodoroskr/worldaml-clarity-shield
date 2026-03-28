

# Add Interactive SVG World Map to EU Sanctions Map Page

## What we'll build
An interactive, clickable SVG world map rendered directly above the existing country cards on `/eu-sanctions-map`. Sanctioned countries are color-coded by region, hovering shows a tooltip with the country name and number of regimes, and clicking navigates to the country detail page.

## Approach
Use a lightweight, dependency-free inline SVG world map component with pre-mapped ISO country codes. No external libraries needed — just an SVG with path data for each country, matched to the existing `euSanctionsRegimes` data via country slugs/names.

## Changes

### 1. Create `src/components/sanctions/InteractiveSanctionsMap.tsx`
- Render an SVG world map using standard SVG `<path>` elements for each country
- Use a lookup map from country name/slug to SVG path IDs (ISO alpha-2 codes)
- Color sanctioned countries by their region color; non-sanctioned countries stay light gray
- On hover: show a floating tooltip with country name, regime count, and region badge
- On click: navigate to `/eu-sanctions/:slug` for sanctioned countries
- Responsive: scales to container width, scrollable on mobile
- Active region filter from parent highlights only that region's countries

### 2. Update `src/pages/EUSanctionsMap.tsx`
- Import and render `InteractiveSanctionsMap` between the stats section and the search/filter section
- Pass `activeRegion` and the regimes data as props
- Add a legend below the map showing region color coding

### 3. SVG map data
- Use a simplified world map SVG with ~180 country paths (common open-source approach, e.g., from amCharts or Natural Earth simplified projections)
- Each path gets an `id` matching the ISO alpha-2 code
- Map the existing `slug` values to ISO codes via a small lookup object

## Technical notes
- Pure SVG + React — zero additional dependencies
- Map paths are ~50KB of inline SVG data, well within acceptable bundle size
- Tooltip implemented with absolute-positioned div tracking mouse coordinates
- Uses the same `regionColors` palette already defined on the page

