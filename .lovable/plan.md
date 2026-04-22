
## Protect Academy course & quiz content from copy/print/screenshot

Add a content protection layer to Academy course pages and quizzes that discourages casual copying, right-click saving, text selection, and printing. True screenshot blocking isn't possible in a browser, but we can make it inconvenient and visibly watermark.

### Scope
- `src/pages/AcademyCourse.tsx` (course lessons + quiz)
- `src/components/academy/ModuleContent.tsx` (rendered lesson markdown)
- New: `src/components/academy/ContentProtection.tsx` (wrapper + global print CSS + watermark)

### What it does
1. **Disable text selection** on protected regions via `select-none` + `user-select: none`.
2. **Block right-click context menu** with `onContextMenu={e => e.preventDefault()}`.
3. **Block copy / cut / drag** via `onCopy`, `onCut`, `onDragStart` handlers.
4. **Block keyboard shortcuts** (Ctrl/Cmd+C, Ctrl/Cmd+P, Ctrl/Cmd+S, Ctrl/Cmd+A, PrintScreen) with a window keydown listener while mounted; clear clipboard on PrintScreen.
5. **Hide content when printing** via injected `@media print { .academy-protected { display: none !important; } body::after { content: "Printing protected content is not allowed — © WorldAML Academy"; } }`.
6. **Diagonal watermark overlay** with the user's email (or "WorldAML Academy") repeated, `pointer-events-none`, low opacity — discourages screenshots.
7. **Blur on tab blur** (optional small touch) so screenshots from screen-recorders capturing background tabs are less useful.

### Implementation
- Create `ContentProtection.tsx` exporting a `<ContentProtection>` wrapper component that:
  - Renders children inside a div with the protection handlers and `academy-protected` class.
  - Mounts a global `<style>` for print rules (only once via a module-level guard).
  - Renders the watermark overlay.
  - Registers/cleans up the keydown listener.
- Wrap the lesson body + quiz body in `AcademyCourse.tsx` with `<ContentProtection>`.
- Pass the user's email from `useAuth()` as the watermark label.

### Out of scope
- No backend/DRM changes.
- No changes to public marketing pages or certificates.
- We will note in the summary that browser-based protection is deterrent-only.
