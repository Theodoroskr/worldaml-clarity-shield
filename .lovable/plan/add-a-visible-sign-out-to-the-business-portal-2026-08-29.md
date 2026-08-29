# Add a visible Sign Out to the Business portal

## Current state
`src/pages/business/BusinessLayout.tsx` already contains a sign-out action, but it is hidden inside the avatar dropdown in the top-right header (next to the Support button). There is no sign-out in the left sidebar, so it is easy to miss.

## Change
In `BusinessLayout.tsx`, add a **Sign out** button to the sidebar footer, directly below "Back to worldaml.com":

- Full-width sidebar entry with the `LogOut` icon, styled like the "Back to worldaml.com" link (muted, hover highlight).
- On click: call `signOut()` from `useAuth()` (already imported in this file) and navigate to `/business/login`.
- Keep the existing sign-out item in the header avatar dropdown unchanged (both paths remain available).

## Result
Signing out from the Business portal is always one visible click away in the left sidebar, no dropdown hunting required.
