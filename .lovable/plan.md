
## New Page: Global Sanctions Lists & AML Data Sources

### Overview

Build a new static reference page at `/resources/sanctions-lists` that serves as a trusted compliance hub. The page lists 25+ official sanctions authorities and regulatory data sources across 5 thematic sections, each shown as a card with name, jurisdiction, description, tag badge, official source link, and a "Used by WorldAML" indicator.

---

### Files to Create or Modify

**1. `src/data/sanctionsLists.ts`** — typed data file holding all 25 entries across 5 sections:
- Section 1: Global Sanctions Authorities (8 entries — UN, EU, OFAC, OFSI, SECO, Canada, DFAT, MAS)
- Section 2: Counter Terrorism Lists (3 entries — US FTO, UK Proscribed, UAE National Terrorist)
- Section 3: Development Bank Debarment Lists (3 entries — World Bank, ADB, EIB)
- Section 4: High Risk Jurisdictions (2 entries — FATF, EU High Risk Third Countries)
- Section 5: Regional Sanctions Authorities (5 entries — UAE Central Bank, Cyprus, Malta, Greece, Romania)

Each entry typed as:
```typescript
interface SanctionSource {
  name: string;
  jurisdiction: string;
  description: string;
  officialUrl: string | { label: string; url: string }[]; // supports multi-link entries like Cyprus
  tag: "Sanctions" | "Terrorism" | "AML" | "Export Controls" | "Debarment" | "High Risk" | "Regional";
  usedByWorldAML: boolean;
}
```

**2. `src/pages/SanctionsLists.tsx`** — full page component with:
- SEO component with JSON-LD `ItemList` structured data for all sources
- Breadcrumb (Home > Resources > Sanctions Lists)
- Hero section: title, subtitle, CTA button "Run a Sanctions Check → /sanctions-check"
- 5 labelled sections rendered as card grids
- Each card: authority name, jurisdiction badge, tag badge (colour-coded), 2–3 sentence description, external source link with `ExternalLink` icon, "Used by WorldAML" tick badge
- Category filter bar (All / Sanctions / Terrorism / AML / Debarment / High Risk / Regional) that filters across all sections
- Sticky CTA bar at bottom (optional, same pattern as WorldIDStickyCTA)

**3. `src/App.tsx`** — add route:
```tsx
const SanctionsLists = lazy(() => import("./pages/SanctionsLists"));
// ...
<Route path="/resources/sanctions-lists" element={<SanctionsLists />} />
```

**4. `src/pages/BestPractices.tsx`** — add a cross-link card at the bottom pointing to the new page (optional, improves internal linking / SEO).

---

### Card Design

Each card follows the existing compliance card style (white card, border, hover shadow) and includes:

```
┌──────────────────────────────────────┐
│ [Sanctions tag]      [Global]        │
│                                      │
│  United Nations Security Council     │
│  Consolidated Sanctions List         │
│                                      │
│  The United Nations Security...      │
│  (2-3 sentences)                     │
│                                      │
│ ─────────────────────────────────── │
│ ✓ Used by WorldAML    Source ↗      │
└──────────────────────────────────────┘
```

Tag colour map:
- Sanctions → red
- Terrorism → orange
- AML → violet
- Export Controls → amber
- Debarment → zinc
- High Risk → yellow
- Regional → teal

---

### SEO & Structured Data

The page will include a JSON-LD `ItemList` schema enumerating all sources with their URLs, boosting visibility for queries like "OFAC sanctions list", "EU consolidated financial sanctions list", "FATF high risk jurisdictions".

Canonical: `/resources/sanctions-lists`

---

### Route Registration

The new route `/resources/sanctions-lists` will be lazily imported and added above the catch-all `*` route in `src/App.tsx`.
