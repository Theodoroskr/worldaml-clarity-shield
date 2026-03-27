

## Add 3 Missing API Pages to sitemap.xml

### Change

**`public/sitemap.xml`** — Insert 3 new `<url>` entries after the Products section (after line 135), before the Resources section:

```xml
<!-- API Landing Pages -->
<url>
  <loc>https://www.worldaml.com/aml-api</loc>
  <lastmod>2026-03-27</lastmod>
  <changefreq>monthly</changefreq>
  <priority>0.9</priority>
</url>
<url>
  <loc>https://www.worldaml.com/sanctions-screening-api</loc>
  <lastmod>2026-03-27</lastmod>
  <changefreq>monthly</changefreq>
  <priority>0.9</priority>
</url>
<url>
  <loc>https://www.worldaml.com/kyc-kyb-api</loc>
  <lastmod>2026-03-27</lastmod>
  <changefreq>monthly</changefreq>
  <priority>0.9</priority>
</url>
```

Priority set to 0.9 to match other high-value product pages. One file, three entries.

