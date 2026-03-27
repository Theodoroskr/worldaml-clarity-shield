

## Update Certificate Page: "WorldAML Academy" Branding + CPD Hours

### Problem
The certificate page currently shows the generic WorldAML logo (via `<Logo />` component) rather than "WorldAML Academy" branding, and it doesn't display the CPD hours earned for the course.

### Changes — Single file: `src/pages/AcademyCertificate.tsx`

1. **Replace `<Logo />` with "WorldAML Academy" text branding**
   - Remove the `<Logo>` component import and usage
   - Replace with a styled heading: "WorldAML Academy" in navy with a smaller "Compliance Education & Certification" tagline beneath — matching the email template style

2. **Add CPD hours to the certificate body**
   - The `academy_courses` table already has a `cpd_hours` column (joined via `academy_courses(*)`)
   - Add a CPD hours badge below the score line, e.g.: "This course is accredited for **{n} CPD Hour(s)**"
   - Also add CPD hours to the verification footer row (alongside "Verified", "Issued", "ID")

### Visual result on the certificate card:

```text
┌──────────────────────────────────────┐
│         WorldAML Academy             │
│  Compliance Education & Certification│
│  ──────────────────────────────────  │
│      Certificate of Completion       │
│        {Course Title}                │
│                                      │
│      This certifies that             │
│        John Doe                      │
│                                      │
│   completed ... with a score of 92%  │
│                                      │
│   ✓ Verified  |  Issued: 27 Mar 2026 │
│   📘 2 CPD Hours  |  ID: ABC123      │
│                                      │
│  WorldAML Academy — worldaml.com     │
└──────────────────────────────────────┘
```

### Technical Details
- `course.cpd_hours` is already available from the existing query (`select("*, academy_courses(*)")`)
- No database changes needed
- Single file edit

