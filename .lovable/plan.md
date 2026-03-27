

## Remove Duplicate Meta Tags from `index.html`

### Problem
`index.html` has hardcoded meta tags (title, description, OG, Twitter) that conflict with the dynamic tags managed by `react-helmet-async` via the `<SEO />` component. This causes duplicate tags in the DOM and can confuse search engines.

### Change — Single file: `index.html`

**Keep:**
- `<meta charset>`, `<meta name="viewport">`, `<link rel="icon">`
- `<link rel="canonical">` (base canonical)
- JSON-LD structured data blocks (Organization, WebSite, SoftwareApplication) — these don't conflict
- The `<body>` and script tags

**Remove:**
- `<title>` tag (line ~10)
- `<meta name="title">` 
- `<meta name="description">`
- `<meta name="keywords">`
- `<meta name="author">`
- `<meta name="robots">`
- All `<meta property="og:*">` tags (6 tags)
- All `<meta name="twitter:*">` tags (5 tags)

These are all dynamically set per-page by the `<SEO />` component via `react-helmet-async`.

### Result
Each page will have exactly one set of meta tags, controlled by the `<SEO />` component with page-specific content, rather than duplicated generic tags from `index.html`.

