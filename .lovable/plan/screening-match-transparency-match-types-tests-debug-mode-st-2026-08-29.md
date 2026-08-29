# Screening match transparency: match types, tests, debug mode, status colours

Make the screening result explain *why* a name scored what it scored, prove the scoring with automated tests, add a verifiable debug mode, and colour-code the resulting statuses in the UI.

## 1. Expose provider match types and their mapping

Every match returned and stored will carry:

- `match_types` — the raw provider signals (e.g. `name_exact`, `aka_exact`, `name_fuzzy`).
- `match_type_labels` — plain English ("Name matched exactly", "Alias matched exactly", "Name matched approximately").
- `match_basis` — the single displayed status the score maps to: Exact name, Exact alias, Reordered name, Partial name, Fuzzy name.
- `provider_relevance` — the provider's flat list-relevance figure, kept for reference only and never shown as "name match".

Rule that governs the mapping: the score is our own Jaro-Winkler / token-aware comparison of the searched name against the listed name and every alias. The provider's "matched exactly" flag is only allowed to lift a score to 100% when our own comparison already agrees (>= 90%).

## 2. Automated tests

A Deno test suite asserts:

- Identical names ("Elena Udrea" vs "Elena Udrea", and case/accents/punctuation variants) score 100 with basis `exact_name`.
- Reordered names ("Elena Udrea" vs "Udrea Elena") score 98 with basis `reordered_name`.
- Extra middle names ("Udrea Elena Gabriela") score 92-99 with basis `partial_name`.
- Alias-only exact hits score 100 with basis `exact_alias`.
- Genuinely different names ("Elena Popescu") stay well below 90 with basis `fuzzy_name`.
- A provider `name_exact` flag on a weak name (below 90) does NOT get promoted to 100.
- Provider relevance of 0.7 never leaks into the displayed similarity.
- Match-type label mapping is correct, de-duplicated, and unknown types degrade gracefully.

## 3. Debug mode

Sending `debug: true` on a screening run returns, per match, the exact inputs used for scoring: the normalised searched name, every candidate (listed name + each alias) with its individual score, which candidate won, the provider relevance, the provider exact flag, and the rule that was applied. Debug output is returned in the response only (never persisted), and is restricted to users with screening admin/analyst rights on the organisation.

## 4. Status colours

Colour-code the match status consistently with the existing risk badging convention:

- Exact name / Exact alias — red (highest confidence hit)
- Reordered name — orange
- Partial name — amber
- Fuzzy name — blue
- Unscored / provider only — grey

Applied to the match cards in the screening results, the entity detail drawer, and the case list, alongside the existing category badges. The percentage chip keeps its current thresholds so the two read together.

## Technical notes

- New shared module `supabase/functions/_shared/screening/nameMatch.ts` holds normalisation, Jaro-Winkler, token-order-insensitive similarity, match-type labels and `computeNameMatch()`. `complyadvantage.ts` delegates to it (removing the duplicated inline scoring).
- `NormalisedMatch` in `types.ts` gains `match_types`, `match_type_labels`, `match_basis`, `provider_relevance`, and an optional `similarity_debug`.
- Migration: add `match_types text[]`, `match_type_labels text[]`, `match_basis text` to `public.screening_matches` (backfilled from the existing `profile` JSON where available); grants and RLS unchanged.
- `screening-run/index.ts`: accept and validate `debug`, persist the new columns, and include a `matches` summary array (name, similarity, basis, match types) plus optional `debug` block in the JSON response. `screening-entity-details` and `screening-monitoring-poll` pick up the shared module automatically.
- Tests live at `supabase/functions/screening-run/nameMatch_test.ts` and run with the Deno test runner.
- Frontend: a shared `matchBasisTone()` helper in `src/lib/` used by `SuiteScreeningV2.tsx` and `EntityDetailDrawer.tsx`; colours come from existing semantic badge classes, no hardcoded new palette.
