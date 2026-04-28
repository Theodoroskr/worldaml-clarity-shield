## Goal

Make the AI variance thresholds used by `sof-reconcile` configurable per organisation (instead of hard-coded 1.5×, 0.3×, ≥3 foreign countries), and surface an **AI Confidence Score** plus a plain-language **explanation** on the Source of Funds page.

---

## 1. Database — thresholds + confidence storage

New migration: `suite_sof_thresholds` table (one row per organisation, upsert pattern).

| Column | Type | Default | Notes |
|---|---|---|---|
| `organisation_id` | uuid PK | — | FK to `suite_organizations` |
| `inflow_high_multiplier` | numeric | `1.5` | trigger when actual > declared × this |
| `inflow_low_multiplier` | numeric | `0.3` | trigger when actual < declared × this |
| `foreign_countries_min` | int | `3` | min distinct foreign counterparty countries |
| `high_severity_variance_pct` | numeric | `100` | variance % above which a flag is "high" |
| `min_confidence_for_auto_clear` | int | `80` | UI-only: badge tone helper |
| `updated_at`, `updated_by` | — | — | audit |

RLS: select/insert/update restricted to members of the org (`organisation_id = get_user_org_id(auth.uid())`); admins of the org can update. No DELETE policy.

`ai_reconciliation` JSONB on `suite_sof_declarations` gains two new fields (no schema change needed — JSON):
- `confidence_score` (0–100 int)
- `confidence_explanation` (string, plain language)
- `thresholds_used` (snapshot of values used for the run, for audit)

---

## 2. Edge function — `supabase/functions/sof-reconcile/index.ts`

- Load `suite_sof_thresholds` for `decl.organisation_id`; fall back to defaults if no row.
- Replace hard-coded `1.5`, `0.3`, `>= 3` literals with the loaded values; include them in each flag's `calculation` block and at the top level as `thresholds_used`.
- Compute a **confidence score** (0–100) deterministically before calling the LLM:
  - Base 100.
  - Subtract weighted penalties per flag (high = 30, medium = 15, low = 5).
  - Subtract penalty when supporting documents are missing (no rows in `suite_sof_documents` for the declaration: −20; some but none `verified`: −10).
  - Subtract a small penalty for very low transaction sample size (`< 5` txns: −10).
  - Clamp to `[0, 100]`.
- Update the LLM prompt to also produce a one-paragraph **confidence explanation** that justifies the score in plain language. Use a strict JSON response (`response_format: json_object`) returning `{ "summary": string, "confidence_explanation": string }`. Keep the existing 2-sentence `summary` behaviour; if JSON parse fails, fall back to using the raw text as `summary` and a generated rule-based explanation.
- Persist `confidence_score`, `confidence_explanation`, `thresholds_used` into `ai_reconciliation`.
- Append both to the existing `suite_sof_audit_events` `ai_reconciliation` event details.

---

## 3. Frontend

### 3a. New component `src/components/suite/SofConfidenceCard.tsx`
- Shows a circular/linear progress bar with the score and a tone (green ≥80, amber 50–79, red <50, using the existing status badging palette).
- Lists the contributing penalties (e.g. "−30 high-severity variance flag", "−20 no supporting documents") generated from `flags_detailed` + `thresholds_used`.
- Renders the AI `confidence_explanation` paragraph below.

### 3b. Update `src/components/suite/SofFlagDrillDown.tsx`
- Render `<SofConfidenceCard />` at the top of the panel when `reconciliation.confidence_score` is present.
- Display the active thresholds row (e.g. "Thresholds: high ×1.5 · low ×0.3 · foreign ≥3") with an "Edit" link that opens the new settings dialog (admins only).

### 3c. New dialog `src/components/suite/SofThresholdsDialog.tsx`
- Form with the five threshold fields, Zod-validated, sensible min/max.
- Loads via `select` from `suite_sof_thresholds`; saves with upsert on `organisation_id`.
- Visible only to users with admin role for the org (reuse `useUserRole`/`has_role` pattern already in the codebase).
- Toast on save; closes and re-opens drilldown so the next "Re-run AI" uses fresh values.

### 3d. `src/pages/suite/SuiteSourceOfFunds.tsx`
- Pass org admin flag to `SofFlagDrillDown` so the Edit thresholds button can be conditionally shown.
- No other layout changes.

---

## 4. Audit & types

- Regenerated `src/integrations/supabase/types.ts` will include the new table (auto).
- Audit event detail already stores arbitrary JSON, so no schema changes needed there.

---

## Out of scope

- Per-customer threshold overrides (org-level only for now).
- Historical re-scoring of past declarations (only future runs use new values; existing `ai_reconciliation` rows continue to render without the confidence card).

---

## Files

**New**
- `supabase/migrations/<timestamp>_sof_thresholds.sql`
- `src/components/suite/SofConfidenceCard.tsx`
- `src/components/suite/SofThresholdsDialog.tsx`

**Edited**
- `supabase/functions/sof-reconcile/index.ts`
- `src/components/suite/SofFlagDrillDown.tsx`
- `src/pages/suite/SuiteSourceOfFunds.tsx`
