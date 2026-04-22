
## Add tasteful color accents to Academy course lessons

Enhance `ModuleContent.tsx` markdown rendering with subtle color accents that improve scannability without breaking the reading experience.

### Changes (all in `src/components/academy/ModuleContent.tsx`)
1. **Headings**: H2 gets a left teal accent border + primary color; H3 gets primary color.
2. **Blockquotes**: Teal-tinted background with accent left border (callout style).
3. **Inline code**: Primary-tinted background pill.
4. **Bold text**: Slightly stronger foreground color.
5. **Links**: Accent color with underline-on-hover.
6. **Lists**: Custom teal bullet markers via marker classes.
7. **Tables**: Header row gets primary/5 background tint.
8. **Callout detection**: Lines starting with 💡, ⚠️, ✅, 📌 get auto-wrapped in colored callout boxes (teal/amber/emerald/blue respectively).

All colors via semantic tokens (primary, accent, muted, etc.) — no hardcoded hex.

### Out of scope
- No structural/markdown changes
- No quiz styling changes (already colored)
- No course card changes
