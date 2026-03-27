

## Plan: SEO and Readability Fixes for AML Regulations Page

The page currently references "six frameworks" and only shows 6 filter tabs, despite having 12 jurisdictions in the data. SEO metadata, structured data, filter tabs, comparison table headers, and copy all need updating.

### Changes

**1. `src/pages/AMLRegulations.tsx`**

- **SEO metadata**: Update title to "AML Regulations by Jurisdiction — 12 Countries Compared" and description to list all regions (EU, UK, US, Japan, Switzerland, etc.)
- **Filter tabs**: Add the 6 missing jurisdiction tabs (Japan, South Korea, Switzerland, Luxembourg, Cayman Islands, Jersey) to the `jurisdictions` array
- **Comparison matrix header**: Add the 6 missing column headers (`japan`, `southKorea`, `switzerland`, `luxembourg`, `cayman`, `jersey`) and update the `tbody` mapping to include all 12 keys
- **Comparison section copy**: "all six frameworks" → "all twelve frameworks"
- **Structured data description**: Update to mention all 12 jurisdictions
- **Hero subtitle**: Mention 12 jurisdictions explicitly for clarity
- **Add internal links** in the hero or below the subtitle:
  - Link to `/platform/aml-screening` ("AML Screening Platform")
  - Link to `/resources/glossary` ("Compliance Glossary")
  - Link to `/free-aml-check` ("Free Sanctions Check")
- **Add a "Related Resources" section** above the bottom CTA with links to relevant blog posts and platform pages (improves internal linking for SEO)

**2. `src/data/amlRegulations.ts`** (minor)

- Ensure each regulation entry has meaningful `relatedLinks` pointing to real internal pages (some may reference blog posts that don't exist yet — verify and fix any broken link targets)

### Scope
- 1-2 files, mostly copy and metadata updates in `AMLRegulations.tsx`

