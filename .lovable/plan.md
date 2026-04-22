

## Enforce 70% pass requirement for certificate + next-course unlock

Lock the certificate and any "next course" navigation behind a 70%+ score on the course exam. Learners who fail see their score, the pass threshold, and a Retake button — no certificate token is issued, no progression allowed.

### Current behaviour
- Quiz submits to `submit-quiz` edge function which already calculates score and only persists a certificate when `score >= pass_mark` (existing 70%).
- `AcademyCourse.tsx` review banner currently shows "View Certificate" whenever a `certificateToken` is returned — this already aligns with passing, but the UI doesn't make the gate explicit and there's no enforcement on navigating to the next course.

### Changes

**1. `src/pages/AcademyCourse.tsx` — review banner clarity**
- Track `lastScore`, `passMark` (default 70), and `passed` (`score >= passMark`) from the submit response.
- Pass banner (emerald): "Passed — {score}% · Certificate unlocked" + **View Certificate** + **Retake** buttons.
- Fail banner (rose): "Did not pass — {score}% · {passMark}% required" + **Retake Quiz** button only. No certificate link rendered. Explanation/review of answers still shown so learners can study.
- Hide any "Next course" / "Continue" CTA unless `passed === true`.

**2. `src/pages/AcademyCourse.tsx` — next-course gating**
- Where the page links to the next course in the curriculum (footer CTA / "Continue to next course" button), wrap it in a check: if the learner does not have a passing certificate for the current course, render the button disabled with a tooltip "Pass this course's exam (70%) to unlock the next course." Otherwise link normally.
- Source of truth: query `academy_certificates` for the current `user_id` + `course_id` on mount; expose `hasPassed` boolean. Reuse the same flag to gate the "View Certificate" button after a fresh pass.

**3. `src/pages/Academy.tsx` — course list gating**
- In the course catalogue, mark each course card with one of three states:
  - **Available** — first course, or previous course passed.
  - **Locked** — previous course not yet passed. Card shows lock icon + "Complete {previous course} (70%+) to unlock" and the "Start course" button is disabled.
  - **Completed** — passed; show certificate link.
- Compute by fetching the learner's `academy_certificates` rows once and walking the ordered course list.

**4. No backend changes**
- `submit-quiz` already enforces the 70% threshold for certificate issuance — no edge-function or DB change required.
- No migration; gating reads existing `academy_certificates` rows.

### Out of scope
- Pass mark stays at 70% (unchanged).
- No changes to question banks, randomization, review mode, or module-completion gating.
- No retake cooldown or attempt-limit logic.

