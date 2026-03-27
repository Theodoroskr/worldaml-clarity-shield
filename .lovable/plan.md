

## Add Course Filtering by Category and CPD Hours

### Problem
The Academy page has no way to filter courses by type (regional vs global vs foundational) and doesn't show CPD (Continuing Professional Development) hours — a key credibility signal for compliance professionals.

### Database Changes

**Migration — add two columns to `academy_courses`:**
- `category TEXT NOT NULL DEFAULT 'global'` — values: `foundational`, `regional`, `global-specialisation`
- `cpd_hours NUMERIC NOT NULL DEFAULT 0` — CPD credit hours (typically duration_minutes rounded to nearest 0.5 hr)

**Data update — categorise all 15 existing courses:**

| Course | Category | CPD Hours |
|--------|----------|-----------|
| AML Fundamentals | foundational | 0.5 |
| Sanctions Screening Essentials | foundational | 0.5 |
| KYC & Customer Due Diligence | foundational | 1.0 |
| AML Europe / Americas / Asia-Pacific / GCC-MENA / Africa / CIS | regional | 1.0 each (0.5 for 30-min courses) |
| PEP Screening, Adverse Media, Beneficial Ownership, Transaction Monitoring, Crypto AML, Risk-Based Approach | global-specialisation | 0.5–1.0 based on duration |

### UI Changes — `src/pages/Academy.tsx`

1. **Category filter row** — Add pill buttons above the course grid: "All", "Foundational", "Regional", "Specialisation". Works alongside the existing progress filter for logged-in users.

2. **Difficulty filter** — Add a secondary row or combined dropdown for difficulty: "All Levels", "Beginner", "Intermediate", "Advanced".

3. **CPD hours badge** — Show on each course card next to the duration, e.g. `1.0 CPD` with a small award/clock icon.

4. **Category badge** — Add a subtle tag on each card showing the category (e.g. "Regional" in a muted blue pill, "Foundational" in green).

5. **Hero update** — Add "CPD-Accredited" to the hero highlights row alongside "Interactive Courses" and "Shareable Certificates".

### Technical Details

- Category filter state: `useState<string>("all")` separate from progress filter
- Both filters compose: `filteredCourses` applies category filter then progress filter
- CPD hours derived from `cpd_hours` column, displayed as `{n} CPD Hr{s}`
- No new tables or RLS changes needed — just two new columns on existing table

