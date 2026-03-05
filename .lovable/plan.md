
## What's missing to drive traffic — honest audit

This is a research/advisory answer, not an implementation task. No plan presentation needed — this is a strategic breakdown of what's actually missing.

### What's already done well
- Sitemap exists and covers all pages
- robots.txt is correct
- JSON-LD structured data on most pages
- Canonical URLs enforced
- Blog exists with 6 quality posts
- Glossary + AML Regulations resource pages
- SEO meta tags on all pages

---

### The 6 Traffic Gaps — ranked by impact

**1. CONTENT VOLUME — the biggest gap**
The blog has only 6 posts, all from late 2024/early 2025. Google ranks content hubs, not individual articles. To rank for high-intent keywords like "AML screening software", "KYC onboarding platform", "sanctions screening API", you need:
- Minimum 20–30 well-structured posts covering the full topic cluster
- Fresh content published regularly (monthly minimum)
- Missing topic clusters: transaction monitoring, adverse media, crypto VASP compliance, iGaming AML, FATCA/CRS reporting, MLRO duties, EDD vs SDD, travel rule

**2. INDUSTRY LANDING PAGES — high-intent keywords unserved**
`/industries` is a generic overview page. The 6 industry cards link to `/industries/banking`, `/industries/crypto` etc. — but **those routes don't exist**. They are dead links. Anyone searching "AML compliance for crypto exchanges" or "KYC for iGaming operators" has no landing page to find. These are extremely high-intent searches.

**3. FAQPage JSON-LD on product pages — missing featured snippets**
`/faq` has good content but the product pages (`/platform/aml-screening`, `/platform/kyc-kyb`, `/platform/risk-assessment`, etc.) have no FAQPage structured data. Google's "People Also Ask" boxes are a major traffic driver for compliance queries. This is low-effort, high-return.

**4. BLOG POSTS missing from sitemap**
The sitemap only includes 6 blog post URLs manually. As new posts are added, they won't be in the sitemap unless manually updated. The sitemap should be dynamic. Also, individual blog post URLs need `lastmod` dates for crawl prioritisation.

**5. NO BACKLINK STRATEGY / EXTERNAL SIGNALS**
Technical SEO is in place but Google still needs **authority signals**. The site likely has very few inbound links. Options:
- Submit to compliance directories (ComplyAdvantage comparison sites, FinTech databases)
- Guest posts on compliance blogs (ACAMS, Association of Certified Financial Crime Specialists)
- Press releases for product launches
- Partner pages with LexisNexis / InfoCredit

**6. PAGE SPEED / CORE WEB VITALS unknown**
The app uses `lazy()` for all routes (good), but many pages likely have large images unoptimised (client logos in `/assets/clients/`), no `loading="lazy"` on images, and no `<link rel="preconnect">` for external fonts. These affect LCP score which is a direct ranking factor.

---

### Priority action plan (ranked)

| Priority | Action | Effort | SEO Impact |
|---|---|---|---|
| 1 | **Build industry landing pages** — fix dead links + capture high-intent searches | Medium | Very High |
| 2 | **Add FAQPage JSON-LD to product pages** | Low | High |
| 3 | **Expand blog to 20+ posts** — write 3–4 new articles per topic cluster | High | Very High |
| 4 | **Dynamic sitemap** — auto-include all blog slugs with lastmod | Low | Medium |
| 5 | **Backlink outreach** — compliance directories, partner pages | Ongoing | High (long-term) |
| 6 | **Image optimisation** — lazy loading, WebP, preconnect hints | Low | Medium |

---

### The honest summary

The site is technically well-structured but **content-thin**. Google cannot rank a site with 6 blog posts over established compliance vendors with hundreds. The fastest wins are: (1) industry pages that fix dead links and serve intent-matched queries, (2) FAQPage schema for featured snippets, and (3) consistent blog publishing cadence.

**Which would you like to build first?**
