

## Fix "Try Free Check" Button in Sticky Bottom CTA

### Problem
The "Try Free Check" button in the sticky bottom bar is nearly invisible. It uses `variant="outline"` which applies `bg-background text-navy` (white background, dark navy text). The custom className overrides attempt (`text-primary-foreground`, `border-white/20`) conflict with the variant's base styles, resulting in a broken appearance on the dark navy bar.

### Fix
In `src/components/StickyBottomCTA.tsx`, change the "Try Free Check" button from `variant="outline"` with manual overrides to `variant="outline-light"` — a variant that already exists in the button system specifically for dark backgrounds (`border border-white/30 bg-transparent text-white hover:bg-white/10`). Remove the now-unnecessary custom className overrides.

**Before:**
```tsx
<Button size="sm" variant="outline" asChild className="border-white/20 text-primary-foreground hover:bg-white/10 flex-1 sm:flex-none">
```

**After:**
```tsx
<Button size="sm" variant="outline-light" asChild className="flex-1 sm:flex-none">
```

Single file change, one line.

