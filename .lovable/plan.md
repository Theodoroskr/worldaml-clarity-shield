

## Fix Partner Program Hero Section

### Problem
The current hero uses a dark navy background with low-contrast text (white/75 opacity for body, white/60 for highlights), a busy SVG grid pattern, and centered layout that feels generic compared to the rest of the site's professional, left-aligned product heroes.

### Solution
Redesign to match the site's established professional pattern — light `bg-surface-subtle` background, left-aligned content, strong navy headings, proper typography hierarchy, and a professional visual element on the right side (partner tier cards or a network visual). This aligns with AML Screening, KYC, and other product heroes.

### Changes — Single File

**`src/components/partners/PartnerHeroSection.tsx`** — Full rewrite:

- Switch from dark `bg-navy` to light `bg-surface-subtle` (matches site pattern)
- Left-align content with `max-w-3xl` (like AMLHeroSection)
- Use proper `text-navy` heading and `text-text-secondary` body text for strong contrast
- Add a teal pill badge ("Partner Program") matching the LaneBadge pattern
- Replace the busy SVG grid background with a clean right-side visual: three stacked partner tier cards (Referral 5%, Affiliate 10%, Reseller 15%) showing the commission structure at a glance
- Keep the same CTAs (Apply Now + Talk to Sales) with proper `Button` variants
- Move the highlights (commission, global, ISO) into subtle bordered chips below the CTAs
- Use `section-padding` class for consistent spacing

### Visual Result
- Clean, light background matching the rest of the site
- Strong typographic hierarchy with navy heading
- Right-side visual showing the three partner tiers with commission rates
- Professional, institutional feel consistent with the enterprise brand

