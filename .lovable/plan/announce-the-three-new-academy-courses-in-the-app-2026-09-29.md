# Announce the three new Academy courses in the app

No emails. Registered users see the news when they visit.

## What users will see
1. **"New courses" banner** at the top of the Academy page and the learner dashboard:
   "New: Trade-Based Money Laundering & Export Controls, AML for Fintechs & Payments, Source of Funds & Wealth", with a "Browse new courses" button linking to the Academy catalogue.
   - Users can close it. Once closed, it stays hidden on that device.
   - It hides itself 30 days after launch (29 Oct 2026).
2. **"New" tag** on the three course cards in the Academy catalogue for the same 30 days.
3. **News post** on the News page: "WorldAML Academy launches three new CPD courses". It gives a short summary of each course and links to the Academy.

## Technical details
- New `src/components/academy/NewCoursesBanner.tsx`. It uses existing design tokens (teal accent on navy) and shadcn Button. It remembers dismissal in localStorage under key `academy-new-courses-2026-09`, and has a hard-coded end date.
- It is rendered in `src/pages/Academy.tsx` (above the catalogue) and in the learner dashboard in `src/pages/Dashboard.tsx`.
- The "New" badge comes from a small `NEW_COURSE_SLUGS` set plus the end date in `src/data/academyPricing.ts`. It is shown on catalogue course cards.
- A row is added to `news_updates`: category "Academy", source "WorldAML", source_url `https://worldaml.com/academy`, published today, trust_tier set to match existing internal rows.
- Checks: the site builds and type-checks, and Playwright confirms the banner, the dismiss button, the tags and the news post.
