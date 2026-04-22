

## Load 30-question exam banks for Courses 1, 2, and 3

Replace the existing quiz questions in `academy_questions` for the three foundational courses with the full 30-question banks (10 easy, 10 medium, 10 advanced) provided.

### Courses targeted
- **Course 1** — AML Fundamentals (`aml-fundamentals`)
- **Course 2** — CDD & KYC (`kyc-customer-due-diligence`, id `a1000000-0000-0000-0000-000000000002`)
- **Course 3** — Suspicious Activity & Reporting (`transaction-monitoring-sar`, id `0db4258d-3806-4aea-83e4-d7d1d3e334d4`)

I'll resolve Course 1's id by slug before insert.

### What gets written
For each course, in a single migration:
1. `DELETE FROM academy_questions WHERE course_id = <id>` to clear the existing bank.
2. `INSERT` 30 rows with:
   - `question` — the prompt (medium/advanced single-line prompts converted to full questions, e.g. "Which stage hides origin of funds?").
   - `options` — JSONB array of 3–4 plausible distractors plus the correct answer (medium/advanced items only have the correct answer in source, so I'll author 2–3 sensible distractors per question grounded in the lesson content already loaded).
   - `correct_index` — index of the ✅ answer.
   - `sort_order` — 1–30 (easy 1–10, medium 11–20, advanced 21–30).
   - `explanation` — one-sentence rationale tied to the lesson material.

### Quality guardrails
- Every question gets 4 options where feasible (minimum 3) so the quiz feels substantive.
- Distractors are domain-plausible (drawn from neighbouring AML concepts), never joke answers.
- Pass mark stays at 70% (existing app behaviour); 30 questions × 70% = 21 correct to pass.
- The existing `academy-courses.test.ts` requirement of ≥9 questions per course is comfortably exceeded.

### Out of scope
- No changes to lesson content, course metadata, images, or UI.
- No changes to certificate or scoring logic.
- Other courses' question banks remain untouched.

