

## Promote Academy on the Landing Page

### Approach
Add a lightweight **Academy promotion section** between `GlobalReachSection` and `TrustedByLogos` — a natural content break that doesn't interrupt the core conversion flow (Hero → Impact → Stats → Industries → How It Works → Global Reach).

### What gets built

**New component: `src/components/home/AcademyPromoSection.tsx`**

A compact, two-column section on a light gray (`bg-slate-50`) background:

- **Left column**: Heading ("Build Compliance Expertise"), short paragraph about CPD-accredited courses, and two stats chips ("15+ Courses" · "CPD Accredited"). CTA button: "Explore Academy →" linking to `/academy`.
- **Right column**: 3 mini course cards (stacked or in a tight grid) showing the top courses with category badges and CPD hours — pulled from static data (no DB fetch on homepage). Icons for Foundational / Regional / Specialisation.

This keeps the design consistent with the rest of the page (navy text, teal accents, clean layout) and adds zero friction to the existing sales funnel.

### Page order after change

1. NewHeroSection
2. BusinessImpactSection
3. StatsSection
4. IndustriesSection
5. HowItWorksSection
6. GlobalReachSection
7. **AcademyPromoSection** ← new
8. TrustedByLogos
9. HomeCTASection

### Files changed
- `src/components/home/AcademyPromoSection.tsx` — new component
- `src/pages/Index.tsx` — import and place between GlobalReach and TrustedByLogos

