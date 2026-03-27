

## SEO Audit Results & Fix Plan

### Audit Summary

I audited all 64+ pages across the site. Here are the findings:

---

### CRITICAL: Pages completely missing `<SEO>` component

| Page | Route | Impact |
|------|-------|--------|
| `API.tsx` | (not routed — `PlatformAPI.tsx` is used instead) | Low — orphan file |
| `Suite.tsx` | (not routed — `PlatformSuite.tsx` is used instead) | Low — orphan file |

These two files exist but are **not used in routing** (`App.tsx` maps `/platform/api` to `PlatformAPI` and `/platform/suite` to `PlatformSuite`). No fix needed.

---

### Pages missing `canonical` URL (public, indexable pages)

These pages have `<SEO>` with title + description but no `canonical`, `breadcrumbs`, or `structuredData`:

| Page | Route | Missing |
|------|-------|---------|
| `News.tsx` | `/news` | canonical, breadcrumbs |
| `Support.tsx` | `/support` | canonical, breadcrumbs |
| `About.tsx` | `/about` | canonical, breadcrumbs |
| `GetStarted.tsx` | `/get-started` | canonical, breadcrumbs |
| `Industries.tsx` | `/industries` | canonical, breadcrumbs |
| `SanctionsCheck.tsx` | `/sanctions-check` | canonical, breadcrumbs |
| `Glossary.tsx` | `/resources/glossary` | canonical, breadcrumbs (has structuredData) |
| `AMLRegulations.tsx` | `/resources/aml-regulations` | canonical, breadcrumbs (has structuredData) |
| `SanctionsLists.tsx` | `/resources/sanctions-lists` | canonical, breadcrumbs (has structuredData) |
| `BestPractices.tsx` | `/resources/best-practices` | canonical, breadcrumbs |
| `WorldCompliance.tsx` | `/data-sources/worldcompliance` | canonical, breadcrumbs |
| `WorldComplianceDemo.tsx` | `/data-sources/worldcompliance/demo` | canonical, breadcrumbs |
| `WorldCompliancePricing.tsx` | `/data-sources/worldcompliance/pricing` | canonical, breadcrumbs |
| `BridgerXG.tsx` | `/data-sources/bridger-xg` | canonical, breadcrumbs |

**Auth/noindex pages** (Login, Signup, Dashboard, Admin, etc.) correctly use `noindex` and don't need canonical/breadcrumbs.

---

### Sitemap missing pages

These indexable pages are **not in `sitemap.xml`**:

- `/partners` (partner program landing)
- `/partners/apply`
- `/free-aml-check`
- `/sanctions-check`
- `/data-coverage` (index)
- `/resources/best-practices`
- `/data-sources/worldcompliance/eu-me`
- `/data-sources/worldcompliance/uk-ie`
- `/data-sources/worldcompliance/na`
- `/data-sources/bridger-xg/eu-me`
- `/data-sources/bridger-xg/uk-ie`
- `/data-sources/bridger-xg/na`

---

### Plan: Fix all gaps

**1. Add canonical + breadcrumbs to 14 public pages** listed above. Each gets:
- `canonical="/route"`
- `breadcrumbs` array (Home → Section → Page)
- `structuredData` where missing (WebPage schema for product/feature pages)

**2. Update `sitemap.xml`** to add the 12 missing public routes.

**3. No changes to**: auth pages (correctly `noindex`), orphan files (`API.tsx`, `Suite.tsx`), or pages that already have full SEO.

### Files Modified
- 14 page files (add canonical + breadcrumbs)
- `public/sitemap.xml` (add 12 URLs)

### Scope
- 15 files modified
- No new files, no backend changes

