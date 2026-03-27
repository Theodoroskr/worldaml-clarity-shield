

## Plan: AML Regulations Directory — 33 Jurisdictions

Transform the AML Regulations page from a flat 6-regulation list into a searchable directory with 33 jurisdictions across 6 regions.

### Jurisdictions (33 total)

| Region | Jurisdictions |
|--------|--------------|
| **Global** (1) | FATF |
| **Europe** (13) | EU, UK, Cyprus, Malta, Greece, Romania, Ireland, Hungary, Germany, France, Netherlands, Poland, Bulgaria |
| **Americas** (3) | US, Canada, Brazil, Mexico |
| **GCC / Middle East** (5) | UAE, Saudi Arabia, Bahrain, Qatar, Turkey |
| **Asia-Pacific** (4) | Singapore, Hong Kong, Australia, India |
| **Africa** (3) | Mauritius, South Africa, Kenya, Nigeria |
| **CIS** (1) | Armenia |

### Changes

**1. `src/data/amlRegulations.ts`**
- Add 27 new regulation entries with authority, key legislation, obligations, penalties
- Group by region with region metadata
- Update comparison matrix to dynamic structure

**2. `src/pages/AMLRegulations.tsx`**
- Search bar with instant filtering
- Region tabs: All | Europe | Americas | GCC/MENA | Asia-Pacific | Africa | CIS
- Card grid grouped by region with counts
- Expandable detail cards (existing format)
- Updated SEO with all 33 jurisdictions

### Scope
- 1 data file (~2500 lines)
- 1 page file (refactor to directory)
