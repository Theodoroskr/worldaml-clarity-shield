
Goal: fully replace the old Lovable favicon everywhere (preview + published) so browsers stop showing the wrong tab icon.

What I found
- `index.html` already points to `/favicon.png`.
- `public/favicon.ico` still exists, and many browsers request `/favicon.ico` first (or keep it cached), which is likely why you still see the old icon.

Implementation plan
1. Normalize favicon source
- Use one canonical icon file (your current WorldAML icon) as the single source.

2. Replace conflicting favicon assets
- Remove the stale `public/favicon.ico` that can override linked icons.
- Rebuild/provide a fresh `.ico` from the new icon (same brand mark), so even direct `/favicon.ico` requests return the correct icon.
- Ensure `public/favicon.png` and `public/favicon.svg` are aligned to the same icon.

3. Harden `<head>` favicon declarations in `index.html`
- Add explicit favicon links for SVG + PNG + ICO (with correct MIME types/sizes).
- Add versioned query params (e.g. `?v=2`) to force cache busting after deploy.

4. Verify end-to-end
- Check these URLs directly return the new icon: `/favicon.ico`, `/favicon.png`, `/favicon.svg`.
- Hard refresh and verify tab icon on:
  - Preview URL
  - Published URL
- Validate on desktop + mobile browser tab/home-screen behavior.

Files to update
- `index.html`
- `public/favicon.ico` (replace/regenerate)
- `public/favicon.png` and/or `public/favicon.svg` (only if needed for consistency)
