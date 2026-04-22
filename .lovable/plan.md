

## Block direct URL navigation to next lesson / next course until exam passed

Today the "Next lesson" and "Next course" buttons can be visually disabled, but a learner who knows the URL (or refreshes a tab) can still load `/academy/courses/<next-slug>` or jump to a later module without passing the current course's quiz. We'll enforce the gate at the router/page level so direct URL hits are blocked too.

### Definition of "passed"
- Server-side source of truth: a row in `academy_certificates` for `(user_id, course_id)` exists ⇔ learner scored ≥ 70% (the `submit_quiz_and_issue_certificate` RPC only inserts on pass).
- Anonymous (logged-out) learners are treated as "not passed" for any gating purpose.

### Scope of the gate

We protect two navigation surfaces:

1. **Next course** — visiting `/academy/courses/:slug` for a course whose `sort_order` is greater than the lowest `sort_order` the user has *not yet passed*. In plain terms: a learner can only open course N if they've passed every published course with `sort_order < N` (within the same `category` track they're following — to keep this simple and predictable, we gate strictly by global `sort_order` across all published courses).
2. **Next lesson (module)** — within a course page, modules are revealed sequentially. A learner can already only mark modules complete in order, but the quiz unlock and any "next module" deep-link state must require the previous module to be complete. We'll keep the existing in-page sequencing (it already enforces this client-side via `completed_modules`) and add a hard block: if someone tries to jump to the quiz tab via URL hash / query (`?tab=quiz`) without all modules complete, we redirect them back to the first incomplete module.

> Why not gate individual module URLs? Modules are rendered inside the course page (`AcademyCourse.tsx`), not separate routes — there's no `/academy/courses/:slug/modules/:id` route to protect. The only "next" deep links that exist today are the course route and the in-page quiz tab. So the two surfaces above cover every direct-URL escape hatch.

### Implementation

**1. New hook: `src/hooks/useCourseGate.ts`**
   - Inputs: `courseSlug: string`.
   - Loads (in parallel):
     - All published courses (`id, slug, sort_order`) ordered by `sort_order`.
     - The current user's certificates: `select course_id from academy_certificates where user_id = auth.uid()`.
   - Computes:
     - `currentCourse` (the one matching `slug`).
     - `passedCourseIds: Set<string>`.
     - `firstUnpassedCourse` = first course in sort order whose id is **not** in `passedCourseIds`.
     - `isAccessible` = `currentCourse.sort_order <= firstUnpassedCourse.sort_order` (i.e., it's the next course you're allowed to take, or any course you've already passed).
     - `redirectSlug` = `firstUnpassedCourse.slug` when blocked.
   - Returns `{ loading, isAccessible, redirectSlug, currentCourse }`.
   - Logged-out users: only the very first course (lowest `sort_order`) is accessible; everything else returns `isAccessible: false` with `redirectSlug` pointing to the first course (and the page already prompts login for quiz/cert actions, so this stays consistent).

**2. Wire the gate into `src/pages/AcademyCourse.tsx`**
   - At the top of the component, call `useCourseGate(slug)`.
   - While `loading`, render the existing skeleton.
   - If `!isAccessible`:
     - Show a small full-page "Locked" panel (reuse the existing card styling on the page) with copy:
       > "Finish *{previousCourseTitle}* (score 70 % or higher) to unlock this course."
     - Provide a primary button `Continue with {previousCourseTitle}` → `Navigate` to `/academy/courses/{redirectSlug}`.
     - Secondary link back to `/academy`.
   - This replaces the rest of the page render so no module/quiz content leaks.
   - Also handle the in-page quiz deep link: if the URL has `?tab=quiz` (or whatever query/hash the existing tab logic reads) and not all modules are complete, strip that param and force the modules tab. (Read the file first to confirm the exact param name; if no such deep-link exists today, this sub-step is a no-op.)

**3. Wire the gate into the Academy index list**
   - File: `src/pages/Academy.tsx`.
   - Fetch the same `passedCourseIds` set (single query) and compute `firstUnpassedCourse` once.
   - For each course card:
     - If the course is **passed** or is the `firstUnpassedCourse`, render as a normal `<Link>`.
     - Otherwise render as a non-link card with a lock icon and tooltip "Pass the previous course to unlock". Clicking is a no-op.
   - This isn't strictly necessary for the security gate (the route-level gate is the real enforcement), but it prevents users from clicking into a guaranteed-blocked page and softens the UX.

### Out of scope
- No DB schema changes — we reuse `academy_certificates` and the existing 70% server-side threshold.
- No changes to `submit_quiz_and_issue_certificate`, RLS, or any edge function.
- No changes to the certificate page (`AcademyCertificate.tsx`) or the Suite/admin areas.
- No category-aware tracks (e.g., separate prerequisite chains per role) — we use a single global sort order, matching how courses are already ordered today.
- No retake throttling, no time-based unlocks, no "review-only" mode for locked courses.

