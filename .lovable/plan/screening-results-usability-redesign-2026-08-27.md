# Screening Results Usability Redesign

## Goal
Make the WorldAML Screening & Monitoring workspace easier to scan and faster to review by replacing the current list/dialog pattern with a card-based results view and a persistent search summary panel, inspired by the reference UI.

## Current State
- Search form supports Individuals, Companies, Organizations, Vessels, Aircraft and granular Sources / Search Profiles.
- Results are shown inside a `Dialog` case workspace as a single-column list of matches.
- Each match shows name, entity type, country, year of birth, category badges, name-similarity %, and a "Review match" button that opens a second dialog.
- Search metadata (term, fuzziness, reference, tags) is not visible while reviewing matches.

## Proposed Changes

### 1. Split-pane Results Layout
- Replace the case dialog with a full-width split-pane view:
  - **Left/center:** scrollable grid of match cards (2 columns on desktop, 1 on mobile).
  - **Right sidebar:** sticky search summary panel (search term, fuzziness, search ref, created at, tags, quick filters, bulk actions).
- Keep the case list accessible via a "Back to cases" link or tab.

### 2. Match Cards
Each card should surface the most important decision data at a glance:
- Header row: entity-type label + matched name (clickable to full profile) + selection checkbox.
- "Appears on" badges with counts, e.g. `Sanctions`, `PEPs 2`, `Adverse Media 14`.
- Relevance line: `Name matched exactly` / `AKA matched exactly` / `Partial name match`.
- Key attributes: Countries, Date of birth (with other potential DOBs), incorporation date, registration number.
- Status row: `Whitelisted: No/Yes` and a `Potential match` / `Confirmed` / `False positive` badge.
- Footer actions: "Review", "Confirm", "False positive", "Escalate", "Add to monitoring".

### 3. Inline Quick Decisions
- Allow one-click decisions directly from the card for common outcomes:
  - Confirm match
  - Mark false positive (opens a compact reason popover)
  - Escalate
- Full "Review match" remains available for attribute-by-attribute comparison.

### 4. Persistent Search Summary Panel
Right sidebar content:
- Search created timestamp.
- Search term and fuzziness interval.
- Search reference with copy button.
- Tag management (attach existing tag, create new tag).
- Quick filters: by category, by match status, by whitelisted status.
- Bulk actions for selected matches: tag, export PDF, confirm, false positive.

### 5. Attribute Comparison Redesign
- Keep the detailed comparison view but render it as an expandable section inside the card or a side drawer instead of a nested dialog.
- Group attributes into: Identity, Countries, Dates, Identifiers, Other.
- Use color-coded assessment pills (Match / Partial / Conflict / Unavailable).

### 6. Source / Listing Drawer
- Replace the current source list with a collapsible "Listings and sources" section per card.
- Show source name, jurisdiction, listing date, and a short description.
- Link to internal source URL when available.

## Technical Approach
- Extend `src/pages/suite/SuiteScreeningV2.tsx` with a new `ResultsWorkspace` component.
- Reuse existing data fetching from `screening_matches`, `match_attributes`, and `screening_sources`.
- Add local state for selection, active filters, and tag input.
- Use existing `recordDecision` helper for inline actions; require rationale only for non-obvious decisions or make it optional for confirm/false-positive with a default reason.
- No backend schema changes required; all data already exists.

## Out of Scope
- Changing the search form or provider adapter.
- Adding new screening providers.
- Monitoring alerts workflow (keep existing behavior).

## Acceptance Criteria
- Match results render as cards in a responsive grid.
- Search summary panel is visible while reviewing results.
- Users can record a decision from a card without opening a nested dialog.
- Existing case list, search form, and monitoring continue to work unchanged.
