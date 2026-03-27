

## Plan: Build Data Coverage Pages (Rebranded for SEO)

Remove all "WorldCompliance" branding and specific source counts from the data coverage pages. Present the screening sources as **WorldAML's global regulatory coverage** — focusing on jurisdictions, regulatory bodies, and compliance categories rather than third-party product attribution.

### New Files

**1. `src/data/worldComplianceSources.ts`**
- Same structured data file mapping ~200 countries to their source lists
- Strip "WorldCompliance" from the file's exported data — sources listed by regulatory body name only (e.g., "Financial Conduct Authority", not "WC-GB-FCA")
- No total source count exported; pages derive counts dynamically but don't display them
- Format: `Record<string, { country: string; code: string; region: string; sources: string[] }>`

**2. `src/pages/DataCoverageIndex.tsx`** — Route: `/data-coverage`
- Hero: "Global Regulatory & Screening Coverage" — positions WorldAML as having deep jurisdiction knowledge
- Subtitle: "WorldAML screens against regulatory bodies, sanctions authorities, law enforcement agencies, and financial supervisors across 200+ jurisdictions."
- No mention of "1,941 sources" or "WorldCompliance" anywhere
- Region-filtered, searchable country grid with cards showing category tags (Sanctions, PEP, Law Enforcement, Financial Regulator)
- JSON-LD `DataCatalog` with WorldAML as publisher
- CTA: "Book a Demo" + "Run a Free AML Check"

**3. `src/pages/DataCoverageCountry.tsx`** — Route: `/data-coverage/:country`
- Dynamic page listing every regulatory body/source for a country
- SEO title: "AML Screening Coverage — [Country] | WorldAML"
- Sources grouped by type: Financial Regulators, Law Enforcement, Courts & Prosecutors, Sanctions Lists, PEP Data
- No "WorldCompliance" or "Bridger" references — presented as "WorldAML coverage"
- Breadcrumbs: Home → Data Coverage → [Country]
- Bottom CTA banner linking to `/contact-sales` and `/free-aml-check`
- JSON-LD `Dataset` markup

### Modified Files

**4. `src/App.tsx`** — Add two lazy routes: `/data-coverage` and `/data-coverage/:country`

**5. `src/components/Header.tsx`** — Add "Data Coverage" under Resources dropdown

**6. `src/components/Footer.tsx`** — Add "Data Coverage" link in Resources column

### Key Differences from Previous Plan
- **No source counts displayed** — no "1,941 sources" or "1,900+" stats anywhere on the pages
- **No "WorldCompliance" branding** — all sources presented under WorldAML's own coverage umbrella
- **Focus on jurisdictions and regulatory bodies** — the SEO value comes from country-specific regulatory body names, not product attribution

### Scope
- 1 data file, 2 new pages, 3 small edits

