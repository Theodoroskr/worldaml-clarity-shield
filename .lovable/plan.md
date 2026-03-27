

## Plan: Route "Request a Demo" buttons to /contact-sales

The `/demo` page is a platform showcase (mockup dashboard), not a demo request form. All "Request a Demo" CTAs across the site should point to `/contact-sales`, which contains the actual contact form.

### Files to update

1. **`src/components/home/NewHeroSection.tsx`** — Change `Link to="/demo"` → `Link to="/contact-sales"` (line 168)
2. **`src/components/home/HomeCTASection.tsx`** — Change `Link to="/demo"` → `Link to="/contact-sales"` (line 25)
3. **`src/components/AnnouncementBar.tsx`** — Already points to `/contact-sales` — no change needed
4. **`src/components/suite/SuiteCTASection.tsx`** — Change `Link to="/demo"` → `Link to="/contact-sales"` (line 46, the "Request Demo" button)

### Scope

Four link changes across three files. No new components or routes needed.

