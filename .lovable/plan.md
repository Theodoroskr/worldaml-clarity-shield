

## Stack Logo Text Vertically

### Overview
Update the Logo component to display "World" and "AML" as two words stacked vertically, creating a more distinctive brand mark similar to enterprise compliance brands.

### Current vs. New Layout

```text
CURRENT:                    NEW:
[Globe] WorldAML            [Globe] World
                                    AML
```

### Implementation Details

**File to modify:** `src/components/Logo.tsx`

**Changes:**

1. **Update the text layout** from a single inline span to a stacked flex column:
   - "World" on the first line (semibold)
   - "AML" on the second line (bold)

2. **Adjust typography sizing** for the stacked format:
   - Reduce individual line text sizes slightly to maintain compact appearance
   - Tighter line-height (leading-tight) for cohesive look

3. **Update flex alignment** so the globe icon centers vertically with the stacked text

### Visual Result

The logo will display as:
- Globe icon on the left
- "World" text (semibold) on the upper right
- "AML" text (bold) directly below "World"

### Technical Notes
- Uses `flex-col` for vertical stacking of text
- Applies `leading-none` or `leading-tight` to minimize gap between words
- Maintains existing size variants (sm, md, lg) with adjusted proportions

