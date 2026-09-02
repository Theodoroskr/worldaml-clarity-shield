# Open portal-exit links in a new tab

## Problem
Inside the authenticated Business / Screening portals, several links point to **public marketing routes** (e.g. `/resources/aml-regulations`, `/news`, `/platform/api`). They use plain `<Link>`, so clicking one navigates the user **out of the portal in the same tab**, losing their place in the authenticated app.

## Approach
Use React Router's built-in `target="_blank"` on `<Link>` (no swap to raw `<a>` needed — keeps SPA client-side routing in the new tab). Add `rel="noopener noreferrer"` for safety.

## Scope (portal exits → public/marketing pages)

1. **`src/pages/business/BusinessResources.tsx`** — all 9 resource cards (`/news`, `/resources/*`, `/blog`, `/faq`, `/data-coverage`, `/eu-sanctions-map`). The `<Link to={r.path}>` "Open" link gets `target="_blank" rel="noopener noreferrer"`. The `ArrowUpRight` icon already signals external navigation.
2. **`src/pages/business/BusinessSupport.tsx`** (line 41) — "Open documentation" → `/platform/api`: add `target="_blank" rel="noopener noreferrer"` to the `<Link>`.
3. **`src/pages/screening/ScreeningHelp.tsx`** (line 168) — "API documentation" → `/platform/api`: same treatment.
4. **`src/pages/business/BusinessLayout.tsx`** (line 177) — "Back to worldaml.com" → `/`: this is already an intentional exit; add `target="_blank" rel="noopener noreferrer"` so the portal stays open.

### Out of scope (kept same-tab intentionally)
- Intra-portal links (`/screening` ↔ `/screening/*`, `/business/*`) — these stay in-tab SPA navigation.
- `BusinessSignup.tsx` Terms/Privacy links — inline legal consent in a form flow; left same-tab.

## Verification
- `bunx tsgo --noEmit` typecheck.
- Browser check: from `/business/resources`, click "AML Regulations" → opens `/resources/aml-regulations` in a new tab, portal tab remains on Resources. Same for Support → "Open documentation" and Screening Help → "API documentation".
