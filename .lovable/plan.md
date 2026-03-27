

## Fix Missing Meta Description in index.html

### Problem
The static `index.html` has no `<meta name="description">` tag. While the React `SEO` component injects one at runtime via `react-helmet-async`, crawlers and audit tools that read only the initial HTML source report it as missing.

### Fix
Add a default `<meta name="description">` tag to `index.html` inside the `<head>` section. React Helmet will override it on each page with the page-specific description, but the static fallback ensures non-JS crawlers always see a description.

### File Change

**`index.html`** — Add after the viewport meta tag (line 5):

```html
<meta name="description" content="Enterprise-grade AML sanctions, PEP & adverse media screening platform. KYC, KYB, transaction monitoring and regulatory reporting for regulated organisations worldwide." />
```

One line, one file. React Helmet will continue to manage per-page descriptions dynamically on top of this fallback.

