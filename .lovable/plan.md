
## Add /resources/sanctions-lists to Sitemap, Footer, and Header Dropdown

Three small, targeted edits across three files.

---

### 1. `public/sitemap.xml`

Add a new `<url>` entry under the existing resources section:

```xml
<url>
  <loc>https://www.worldaml.com/resources/sanctions-lists</loc>
  <changefreq>monthly</changefreq>
  <priority>0.7</priority>
</url>
```

Placed alongside `/data-sources/resources` and `/resources/best-practices` entries.

---

### 2. `src/components/Footer.tsx`

In the `resources` array (lines 29–34), add a new entry:

```ts
{ href: "/resources/sanctions-lists", label: "Sanctions Lists" },
```

This ensures the footer link column is crawlable by Googlebot as a plain `<a>` tag.

---

### 3. `src/components/Header.tsx`

In the `Resources` dropdown children array (lines 46–53), add:

```ts
{ href: "/resources/sanctions-lists", label: "Sanctions Lists" },
```

Placed below "Best Practices" so the group reads:
- Industries
- News
- Best Practices
- **Sanctions Lists** ← new
- FAQ
- Support
- About

---

### Summary

| File | Change |
|---|---|
| `public/sitemap.xml` | 1 new `<url>` block |
| `src/components/Footer.tsx` | 1 new link in `resources` array |
| `src/components/Header.tsx` | 1 new item in Resources dropdown |

No new dependencies, no data changes, no routing changes needed.
