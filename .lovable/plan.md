

## Plan: Free AML Check Lead Capture Landing Page

Create a new page at `/free-aml-check` that combines a lead generation form with benefit callouts and conversion CTAs, linking to the existing sanctions search tool.

### New Files

**1. `src/pages/FreeAMLCheck.tsx`**

A standalone lead capture page with these sections:

- **Hero** (navy bg): Headline "Run a Free AML Check", subheadline about modern compliance workflows, two CTAs
- **Benefits row**: 3-4 cards — what they'll receive (sample screening report, quick consultation, platform walkthrough, audit-readiness tips)
- **Lead form** (two-column layout): Left side has the form (name, company, work email, country dropdown, "What are you looking for?" textarea, submit button). Right side has value points with checkmarks (similar to ContactSales pattern) and trust indicators
- **How it works**: 3-step visual flow (Submit form → Receive sample report → Book full demo)
- **Cross-sell CTA banner** (navy bg): "Want to go deeper?" with buttons to Book a Demo and View Pricing
- **Footer**

The form will submit via the existing `submit-form` edge function with `form_type: "free-aml-check"`, following the same pattern as ContactSales and GetStarted pages.

A "Try our free sanctions tool now" link in the hero will point to `/sanctions-check` for users who want to self-serve immediately.

### Modified Files

**2. `src/App.tsx`**
- Add lazy import for `FreeAMLCheck`
- Add route: `<Route path="/free-aml-check" element={<FreeAMLCheck />} />`

**3. `src/components/Header.tsx`**
- Update the "Quick Check" nav link from `/sanctions-check` to `/free-aml-check` (or add "Free AML Check" as a secondary CTA alongside "Book a Demo")

### Scope
- 1 new page component (~250 lines)
- 2 small file edits (route + nav)
- Reuses existing form submission pipeline, UI components, and design system

