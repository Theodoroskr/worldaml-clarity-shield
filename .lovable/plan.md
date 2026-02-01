
# News & Regulatory Updates Implementation Plan

## Overview
Implement a comprehensive News & Regulatory Updates system for the WorldAML website, including a dedicated news page, a Global Coverage trust section on the homepage, and fix the Suite login link.

---

## Deliverables

### 1. News & Regulatory Updates Page (`/news`)
A new page displaying curated regulatory, enforcement, and financial crime updates with category filtering.

**Structure:**
- SEO-optimised intro text (as specified)
- Category filter tabs: All, Regulatory Updates, Sanctions & Enforcement, AML & Financial Crime, GCC Regulatory Updates
- News item cards showing: Title, Source, Date, Category badge, 1-2 line summary
- Internal links to related product pages based on category
- Bottom CTA: "Explore WorldAML API" / "Get Started"

**Files to create:**
- `src/pages/News.tsx` - Main news page component
- `src/components/news/NewsCard.tsx` - Individual news item card
- `src/components/news/CategoryFilter.tsx` - Category filter tabs

**Sample data structure:**
```text
NewsItem {
  id, title, source, sourceUrl, 
  publishedAt, category, tags[], 
  summary, trustTier
}
```

### 2. Global Coverage Section (Homepage)
Add a trust-building section between StatsSection and AdverseMediaSection.

**Content:**
- Title: "Global Coverage, Regulator-Aligned"
- Body: Monitoring regulatory publications from Europe, US, and GCC
- Visual: Grid showing source regions (EU, US, GCC, Global) with regulator logos/icons
- Note: "Content is selected from reputable public sources for informational purposes."

**File to create:**
- `src/components/home/GlobalCoverageSection.tsx`

**Update:**
- `src/pages/Index.tsx` - Insert new section

### 3. Fix Header Login Link
Update the "Log In" button to link to the actual WorldAML Suite.

**Changes to `src/components/Header.tsx`:**
- Desktop: Change `<Link to="/login">` to `<a href="https://suite.worldaml.com/login" target="_blank">`
- Mobile: Same change for mobile menu

### 4. Navigation Updates

**Header (`src/components/Header.tsx`):**
- Add "News" link to main navigation

**Footer (`src/components/Footer.tsx`):**
- Add "News & Updates" under Resources section

**Router (`src/App.tsx`):**
- Register `/news` route

---

## Internal Linking Strategy (Built into News Page)

Each news category will display related product links:

| Category | Links To |
|----------|----------|
| Regulatory Updates | API, Risk Assessment |
| Sanctions & Enforcement | AML Screening, Monitoring |
| AML & Financial Crime | Monitoring, Industries |
| GCC Regulatory Updates | Industries (Banking, Payments, Crypto) |

---

## Technical Details

### News Page Structure
```text
/news
├── Hero section with SEO intro
├── CategoryFilter (tabs)
├── NewsGrid
│   └── NewsCard[] (with internal links)
└── CTA section
```

### Component Styling
- Follow existing patterns from `AdverseMediaSection.tsx` and `API.tsx`
- Use `section-padding`, `container-enterprise` layout classes
- Cards use `border-divider`, `bg-card`, `rounded-lg` styling
- Category badges use existing badge component

### SEO Considerations
- Page title: "News & Regulatory Updates | WorldAML"
- Meta description with AML, compliance, regulatory keywords
- Structured heading hierarchy (h1 > h2 > h3)
- Internal links with descriptive anchor text

---

## Files Summary

| Action | File |
|--------|------|
| Create | `src/pages/News.tsx` |
| Create | `src/components/news/NewsCard.tsx` |
| Create | `src/components/news/CategoryFilter.tsx` |
| Create | `src/components/home/GlobalCoverageSection.tsx` |
| Modify | `src/App.tsx` (add route) |
| Modify | `src/components/Header.tsx` (add nav link + fix login) |
| Modify | `src/components/Footer.tsx` (add news link) |
| Modify | `src/pages/Index.tsx` (add GlobalCoverageSection) |

---

## Sample News Data (Placeholder)
The page will include sample news items from the source list you provided:
- FATF guidance updates
- OFAC sanctions notices  
- FCA enforcement actions
- DFSA/SAMA regulatory updates

This demonstrates the content structure and allows immediate visual review.
