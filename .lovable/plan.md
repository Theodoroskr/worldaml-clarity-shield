
# Suggested Improvements

Below are the most impactful improvements identified across the codebase, grouped by area. These range from quick wins to larger features.

---

## 1. SEO & Discoverability

**Missing breadcrumbs on ~10 pages**
Pages like `/news`, `/faq`, `/get-started`, `/demo`, `/about`, `/pricing`, `/contact-sales`, the regional WorldCompliance/BridgerXG pages, and legal pages are missing breadcrumb JSON-LD. These are low-effort and directly improve rich snippets.

**Missing canonical tags on the News page**
`/news` has no `canonical` prop — crawlers may index duplicate URLs (e.g. with query strings from category filters).

**News page broken CTA link**
The "Explore WorldAML API" button in the News CTA section links to `/api` — that route does not exist. It should link to `/platform/api`.

**No `og:type` differentiation**
All pages use `og:type: website`. Article-style pages like `/news` and `/faq` would benefit from `og:type: article` where appropriate.

---

## 2. Navigation & UX

**"Request a Demo" CTA links to `/contact-sales`, not `/demo`**
The hero section primary CTA says "Request a Demo" but links to `/contact-sales`. This creates a mismatch. The `/demo` route exists and has a dedicated demo page — the CTA should point there, or the label should be updated to "Contact Sales".

**`/products` route does not exist**
The header nav has a "Products" dropdown that uses `/products` as the `href` — but no route is registered for `/products` in `App.tsx`. Clicking the parent label navigates to a 404. Either register the route or remove the `href`.

**Missing "Industries" and "Support" in header nav**
`Industries` and `Support` are useful trust-building pages that aren't accessible from the top navigation. They're buried in the footer. These could be added under a "Company" or "Resources" dropdown.

**Mobile menu has no close-on-outside-click**
The mobile menu only closes when a link is clicked or the X button is pressed. Tapping outside the menu panel does not close it, which is a standard UX expectation.

---

## 3. Performance & Code Quality

**No lazy loading of route components**
All page components are imported eagerly at the top of `App.tsx`. With 30+ pages, this inflates the initial bundle. React's `lazy()` + `Suspense` would split each page into its own chunk, reducing initial load time significantly.

**`QueryClient` instantiated outside the component but inside the module**
The `QueryClient` is created at module level — fine, but there's no `staleTime` or `gcTime` configured. This means every navigation re-fetches the same data. A sensible default (e.g. `staleTime: 5 * 60 * 1000`) would reduce redundant network calls on the News page.

---

## 4. Content & Trust

**No `<meta name="robots">` on the `/demo` page**
`/demo` is a public-facing demo showcase that should be indexed. It currently has no SEO component at all — it's missing a `<SEO>` tag entirely.

**Homepage misses an `Industries` or social proof section**
The homepage goes straight from stats → how it works → global reach → trusted logos → CTA. There's no mention of which industries are served. An `IndustriesSection` component exists but isn't used on the homepage, even though regulated-industry credibility is a key buying signal.

---

## Summary Table

| Priority | Area | Change |
|---|---|---|
| High | Navigation | Fix `/products` 404 and "Request a Demo" CTA destination |
| High | SEO | Add breadcrumbs + canonical to remaining pages |
| High | Content | Fix broken `/api` link on News page CTA |
| Medium | Performance | Add route-level code splitting with React.lazy |
| Medium | UX | Close mobile menu on outside click |
| Medium | Homepage | Add Industries section to homepage for trust signals |
| Low | SEO | Set `og:type: article` on news/faq pages |
| Low | Performance | Configure QueryClient staleTime defaults |

---

Which of these would you like me to implement? I can do all of them in one pass, or focus on a specific area.
