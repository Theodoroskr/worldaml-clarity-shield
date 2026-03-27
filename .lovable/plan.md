

## Add WhatsApp Link to Footer

### What
Add a WhatsApp icon + link (`wa.me/971504780113`) in the footer's logo/tagline column, below the InfoCredit badge.

### Changes

**`src/components/Footer.tsx`**
- Import `MessageCircle` from lucide-react (or use an inline WhatsApp SVG icon for brand accuracy)
- After the InfoCredit Group badge block (line ~95), add a "Chat with us" WhatsApp link:
  - WhatsApp brand icon (green) + "Chat on WhatsApp" text
  - Links to `https://wa.me/971504780113` with `target="_blank"`
  - Styled consistently with the existing footer text (small, secondary color, hover effect)

### Files changed
- `src/components/Footer.tsx` — add WhatsApp link

