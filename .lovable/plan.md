

# Fix "Crawled — currently not indexed" for worldaml.com

## Root cause

Google is crawling your pages but choosing not to index them. For a client-side rendered React SPA, the most common reasons are:

1. **No server-side rendering** — Googlebot sees an empty `<div id="root"></div>` on first load. While Googlebot _can_ render JS, it deprioritises JS-rendered pages and may decide the initial HTML has insufficient content to index.
2. **Hardcoded canonical in `index.html`** — Line 11 has `<link rel="canonical" href="https://www.worldaml.com/" />`, which tells Google _every_ page's canonical is the homepage until JS replaces it. If rendering is slow or fails, all pages canonicalise to `/`.
3. **Missing pages in sitemap** — Several routes exist in the app but are absent from `sitemap.xml`: `/about-us/why-worldaml`, `/data-sources/resources`, academy course pages, data-coverage country pages, and several blog posts.
4. **Thin unique content signal** — Many pages share identical `<meta description>` fallback from `index.html` until JS hydrates, reducing perceived uniqueness.

## Plan

### 1. Remove hardcoded canonical from `index.html`
Delete line 11 (`<link rel="canonical" href="https://www.worldaml.com/" />`). The `SEO` component already injects the correct per-page canonical via `react-helmet-async`. The hardcoded one creates a conflict — if Googlebot reads the static HTML before JS executes, it sees all pages pointing to `/`.

### 2. Add pre-rendered meta fallbacks to `index.html`
Add a `<noscript>` block or adjust the static `<meta>` tags so that even without JS, the page has a meaningful description. This is a minor signal but helps.

### 3. Update `sitemap.xml` with missing pages
Add these missing URLs:
- `/about-us/why-worldaml`
- `/data-sources/resources`
- All EU sanctions country pages not yet listed (check `euSanctionsRegimes` data for full list)
- Blog posts added after the sitemap was last updated
- Data coverage country pages (dynamically listed from `worldComplianceSources` data)

### 4. Add `lastmod` dates that reflect actual content changes
Currently every entry shows `2026-03-27`. Google may ignore sitemaps with identical dates. Update dates to reflect when content was actually modified.

### 5. Strengthen internal linking
Ensure every page in the sitemap is reachable within 3 clicks from the homepage. Key gaps:
- `/about-us/why-worldaml` — add link from `/about` page
- EU sanctions country pages — already linked from map (good)
- Data coverage country pages — already linked from index (good)

### 6. Consider adding a prerender/SSG solution (longer-term)
The most impactful fix is server-side rendering or static prerendering. Options within Lovable's stack:
- **`vite-plugin-prerender`** or **`vite-ssg`** to generate static HTML at build time for all public routes
- This gives Googlebot real HTML content on first load, dramatically improving indexing

## Files to modify

| File | Change |
|---|---|
| `index.html` | Remove hardcoded canonical tag |
| `public/sitemap.xml` | Add ~15-20 missing URLs, update dates |
| `src/pages/About.tsx` | Add internal link to `/about-us/why-worldaml` |

## Technical note
The hardcoded canonical removal is the highest-impact, lowest-effort fix. It's likely the primary reason Google is declining to index subpages — it sees them all as duplicates of the homepage.

