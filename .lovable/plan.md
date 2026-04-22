

## Highlight selected quiz answer (option + radio button)

Make the currently selected quiz answer visually obvious before submission by highlighting both the radio button and the surrounding option row.

### Change (single file: `src/pages/AcademyCourse.tsx`)

In the quiz rendering loop (pre-submit state), each answer option is currently a plain `<label>` wrapping a `<RadioGroupItem>` and the option text. Update so the selected option:

- **Row**: teal-tinted background (`bg-teal/10`), teal border (`border-teal`), and stronger text weight. Unselected rows keep the current neutral border and add a subtle `hover:bg-secondary` state.
- **Radio dot**: teal fill via `text-teal border-teal` on `RadioGroupItem` when `quizAnswers[question.id] === option`.
- Keep accessibility: the entire row remains a `<label htmlFor>` so clicking anywhere on the row selects the option (already the case).
- No change to review-mode highlighting (green/red for correct/incorrect after submission stays as-is).

### Out of scope
- No logic changes — selection state, submission, scoring, and review mode are untouched.
- No changes to other pages or shared `RadioGroupItem` component.

