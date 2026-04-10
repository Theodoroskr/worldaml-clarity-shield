

## Plan: Add LinkedIn Share Button to Academy Course Cards

### What changes
Add a LinkedIn share button to each course card on the Academy page, allowing users to share individual courses directly to LinkedIn.

### Implementation

**File: `src/pages/Academy.tsx`**

1. Import `Linkedin` icon from `lucide-react`
2. Add a small LinkedIn share button inside each course card (near the bottom, next to the duration/CPD info)
3. The button will use the same LinkedIn share-offsite pattern already used in `AcademyCertificate.tsx` and `Dashboard.tsx`:
   ```
   https://www.linkedin.com/sharing/share-offsite/?url=<published-url>/academy/<slug>
   ```
4. The button click will call `e.preventDefault()` + `e.stopPropagation()` to avoid navigating via the parent `<Link>` wrapper
5. Style as a small icon button matching the card's muted aesthetic, with a hover state highlighting LinkedIn blue

### Technical details
- Published URL: `https://worldaml-clarity-shield.lovable.app`
- Share URL per course: `https://worldaml-clarity-shield.lovable.app/academy/${course.slug}`
- Uses `window.open()` with `noopener,noreferrer` (existing pattern)
- Single file change only

