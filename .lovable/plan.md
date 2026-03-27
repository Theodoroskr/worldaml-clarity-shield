

## Fix Certificate Sharing + Create Proper Badge

### Problems identified
1. **LinkedIn sharing**: The `shareArticle` endpoint is deprecated. LinkedIn now uses `sharing/share-offsite/` for link sharing.
2. **Popup blockers**: `window.open()` with specific dimensions triggers popup blockers in many browsers. Should use `_blank` target without size constraints.
3. **Copy link works** — this part is fine with the published origin URL.
4. **Badge is not shareable** — it's just a visual div. Users need something they can actually download/embed.

### Changes — Single file: `src/pages/AcademyCertificate.tsx`

1. **Fix LinkedIn share URL**
   - Change from: `linkedin.com/shareArticle?mini=true&url=...&title=...`
   - Change to: `linkedin.com/sharing/share-offsite/?url=...`
   - Remove the `width/height` from `window.open` — just use `"_blank"` target via `window.open(url, "_blank")` to avoid popup blockers

2. **Fix X/Twitter share**
   - Same fix: remove the `width/height` constraints from `window.open` to avoid popup blockers

3. **Add a native share option**
   - Use `navigator.share()` API (available on mobile and modern browsers) as an additional option alongside LinkedIn/X/Copy
   - Falls back gracefully — button hidden if API not available

4. **Make badge downloadable**
   - Add a "Download Badge" button that uses `html2canvas` or a canvas-based approach to render the badge as a PNG image the user can save
   - Since adding a dependency may be complex, a simpler approach: render the badge as an SVG-based element and provide a download link using a data URI

### Simpler alternative for badge download
Instead of `html2canvas`, generate a small SVG string containing the badge content (course title, score, CPD) and convert it to a downloadable PNG via canvas. This keeps it dependency-free.

### Files changed
- `src/pages/AcademyCertificate.tsx` — fix share URLs, add native share, add badge download

