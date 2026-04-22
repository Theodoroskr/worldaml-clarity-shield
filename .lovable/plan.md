
## Fix lint warning on Academy.tsx

Run the linter against `src/pages/Academy.tsx`, identify the flagged warning(s), and resolve them without changing UI behaviour.

### Likely fixes
Based on recent edits to this file, the warning is most likely one of:
- An unused import (e.g. an icon imported but no longer rendered after the cover-image refactor).
- A `react-hooks/exhaustive-deps` dependency missing from a `useEffect`/`useMemo`.
- A `react-refresh/only-export-components` warning from a non-component export living next to the page component.

### Steps
1. Run ESLint on `src/pages/Academy.tsx` to get the exact rule + line.
2. Apply the minimal fix:
   - Unused import → remove the import.
   - Missing dep → add the dep, or wrap the value in `useCallback`/`useMemo` if adding it would cause a loop.
   - Non-component export → move the constant/helper into a sibling file (e.g. `src/pages/academyConfig.ts`) and import it back.
3. Re-run the linter on the file to confirm zero warnings.
4. Run `npm run build` to confirm the preview build is clean.

### Out of scope
- No visual or behavioural changes.
- No refactors to other files unless step 2 requires extracting a helper to satisfy `react-refresh/only-export-components`.
