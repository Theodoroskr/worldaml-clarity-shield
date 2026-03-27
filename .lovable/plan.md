

## Update sitemap.xml with All Missing Routes

### What's missing
Comparing the router in `App.tsx` against the current `sitemap.xml`, these routes are absent:

1. **Market pages** (3): `/markets/uk`, `/markets/uae`, `/markets/usa`
2. **Academy** (1): `/academy`

Everything else — all 17 blog posts, all 6 industry pages, glossary, best practices, sanctions lists, AML regulations, data coverage, partners, tools, products — is already present.

### What won't be added
- `/academy/:slug` and `/academy/certificate/:token` — these are dynamic database-driven routes; individual URLs can't be enumerated in a static sitemap
- Auth pages (`/login`, `/signup`, `/dashboard`, `/admin`, etc.) — should remain excluded
- `/suite-layout-preview` — internal preview route

### Changes

**File: `public/sitemap.xml`**

Add 4 new `<url>` entries after the existing Industry Landing Pages section:

```xml
<!-- Market Landing Pages -->
<url>
  <loc>https://www.worldaml.com/markets/uk</loc>
  <lastmod>2026-03-27</lastmod>
  <changefreq>monthly</changefreq>
  <priority>0.8</priority>
</url>
<url>
  <loc>https://www.worldaml.com/markets/uae</loc>
  <lastmod>2026-03-27</lastmod>
  <changefreq>monthly</changefreq>
  <priority>0.8</priority>
</url>
<url>
  <loc>https://www.worldaml.com/markets/usa</loc>
  <lastmod>2026-03-27</lastmod>
  <changefreq>monthly</changefreq>
  <priority>0.8</priority>
</url>

<!-- Academy -->
<url>
  <loc>https://www.worldaml.com/academy</loc>
  <lastmod>2026-03-27</lastmod>
  <changefreq>monthly</changefreq>
  <priority>0.7</priority>
</url>
```

Also update all existing `lastmod` dates to `2026-03-27` to reflect the current state.

### Files changed
- `public/sitemap.xml` — add 4 URLs, update dates

