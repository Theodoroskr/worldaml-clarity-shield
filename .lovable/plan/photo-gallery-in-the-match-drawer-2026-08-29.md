# Photo gallery in the match drawer

Show a small photo gallery in the match detail drawer whenever a listed profile has more than one usable photo. Today only the first working photo is shown as the round avatar next to "Key information" in `SuiteScreeningV2.tsx`; the rest of `profile.images` is never displayed.

## What the user sees

- The existing round avatar stays as the main photo (first photo that loads).
- When the profile has 2+ photos, a row of small square thumbnails appears under the avatar (max ~5 visible, horizontal scroll for more).
- Clicking a thumbnail swaps the main photo; the active thumbnail gets a teal ring highlight.
- Photos that fail to load are silently dropped from the gallery (same try-next logic as today); if only one photo survives, no gallery is shown.
- Each thumbnail is keyboard-focusable with an accessible label ("View photo 2 of Elena Udrea").
- Loading state: thumbnails render as small pulsing skeletons until each image resolves — no layout shift, no initials flash.

## Technical details

- Extend `ProfileAvatar` in `src/pages/suite/SuiteScreeningV2.tsx` into a small `ProfilePhotoGallery` block (avatar + thumbnail strip) rendered in the same spot in the Key information section. No new shadcn carousel dependency needed — a flex row of 40px thumbnails with `overflow-x-auto` is lighter than `carousel.tsx` for a drawer.
- Track failed URLs in a `Set` (shared with the avatar's try-next logic) so failed photos disappear from both the avatar fallback chain and the thumbnail strip.
- Keep the https-first `orderImages` ordering and `referrerPolicy="no-referrer"`.
- Extend the photo warm-up in `fetchFullProfile` (`src/lib/suite/screeningV2.ts`) to preload all https photos (not just the first) so thumbnails are instant.
- Works automatically with the alias photo-sharing already deployed (borrowed photos appear in the gallery too).
- No backend or schema changes.
