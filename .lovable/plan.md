
## New Page: AML & Compliance Best Practices from Global Companies

### What This Is

A new `/resources/best-practices` page that showcases curated AML/compliance best practices drawn from globally recognised institutions — FATF, Basel Committee, WOLFSBERG Group, major banks like HSBC and Deutsche Bank, and global regulators. This gives visitors (prospects) a high-value resource page that positions WorldAML as a thought leader, drives SEO traffic, and naturally links back to your products.

### Why This Helps Sales

- Visitors searching "AML best practices" or "KYC compliance framework" will land on this page
- Each best practice card naturally links to the relevant WorldAML product (e.g., a card on "Ongoing Monitoring" links to the API page)
- It creates a reason for visitors to share the page, return, and contact sales

---

### Pages & Files to Create/Modify

**New page:** `src/pages/BestPractices.tsx`
- Full-page layout with Header + Footer
- Hero section: "Global AML & Compliance Best Practices"
- Filterable grid of best practice cards by topic (KYC/KYB, Sanctions, Ongoing Monitoring, Risk Assessment, Governance)
- Each card shows: Institution name, practice title, summary, category badge, and a "Related WorldAML feature" link

**New component:** `src/components/bestpractices/BestPracticeCard.tsx`
- Card component with institution logo/name, category badge, summary text, key principle bullet points, and a CTA link

**New data file:** `src/data/bestPractices.ts`
- Static curated data (~20 best practices) from:
  - FATF (risk-based approach, ongoing monitoring)
  - Basel Committee (KYC principles, correspondent banking)
  - WOLFSBERG Group (due diligence, PEP screening)
  - HSBC, Deutsche Bank, Standard Chartered (public compliance frameworks)
  - EU AMLD6, FinCEN, FCA guidance

**Route added to** `src/App.tsx`:
- `/resources/best-practices`

**Navigation:** Add link to `/resources/best-practices` in the Header or Footer under a "Resources" group

---

### Page Structure

```text
[Hero]
  "Global AML & Compliance Best Practices"
  Subtitle: Drawn from FATF, Basel Committee, WOLFSBERG Group and leading financial institutions

[Filter Bar]
  All | KYC/KYB | Sanctions Screening | Ongoing Monitoring | Risk Assessment | Governance & Audit

[Cards Grid — 3 columns]
  [Card]
    Institution: FATF
    Category badge: Risk Assessment
    Title: "Apply a Risk-Based Approach to Customer Due Diligence"
    Summary: "FATF Recommendation 1 requires firms to identify, assess and understand ML/TF risks..."
    Key Principles:
    - Tier customers by risk level before applying CDD
    - Apply enhanced due diligence to high-risk customers
    - Document and review risk assessments periodically
    Related: → WorldAML Risk Scoring

[Bottom CTA Section]
  "See these practices in action"
  → Request a Demo   → Explore the Platform
```

---

### Technical Details

- All content is static (no database needed) — fast to build, zero maintenance
- Category filter uses the same pattern as `CategoryFilter.tsx` on the News page
- Cards follow the same visual pattern as `NewsCard.tsx` for consistency
- Each card links to the relevant WorldAML product page to drive internal navigation
- SEO-optimised with structured data and canonical URL at `/resources/best-practices`
- Route added in `App.tsx` alongside other resource routes
- Footer updated to include the new page under a Resources column
