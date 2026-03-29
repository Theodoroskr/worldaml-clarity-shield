

# Update Sitemap

## What needs updating

The sitemap is comprehensive but has stale `lastmod` dates. After the recent market page additions and navigation changes, several dates need refreshing to `2026-03-29`.

### Pages to update `lastmod` to `2026-03-29`

| Section | Pages | Reason |
|---|---|---|
| Main pages | `/`, `/pricing`, `/demo`, `/contact-sales`, `/get-started` | Navigation updated |
| All platform pages | `/platform`, `/platform/suite`, `/platform/api`, etc. | Header/footer changed |
| All data source pages | `/data-sources/*` | Footer changed |
| Industry pages | `/industries/*` | Footer changed |
| Existing market pages (UK, UAE, USA) | `/markets/uk`, `/markets/uae`, `/markets/usa` | Were `2026-03-15`, now grouped in new nav |
| Blog index | `/blog` | Already current |
| Partners | `/partners`, `/partners/apply` | Footer changed |
| Tools | `/free-aml-check`, `/sanctions-check` | Footer changed |
| Academy, data-coverage | `/academy`, `/data-coverage` | Footer changed |
| Legal pages | `/privacy`, `/terms`, `/cookies`, `/access-your-data` | Leave as-is (no content change) |

### No missing routes

Cross-referencing `App.tsx` routes against the sitemap, all public-facing pages are present. Auth routes (`/login`, `/signup`, `/dashboard`, `/admin`, etc.) are correctly excluded. Dynamic routes (`/blog/:slug`, `/eu-sanctions/:slug`, `/markets/:market`, `/data-coverage/:country`) have their known entries listed.

### Implementation

Single file edit: `public/sitemap.xml` -- update all `lastmod` values (except legal pages and EU sanctions country pages which haven't changed) to `2026-03-29`.

