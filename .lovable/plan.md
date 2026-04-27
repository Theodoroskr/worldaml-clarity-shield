## AI Flag Drill-Down Panel

When the AI reconciliation produces flags, give the analyst a dedicated panel that, for each flag, shows:
- **The exact transactions** that triggered it (counterparty, country, amount, date, link to txn)
- **The variance calculation** (formula, inputs, threshold, result)
- **The generated analyst summary** (Lovable AI narrative, model attribution)

### What the user sees

In the existing declaration drawer, the "AI Reconciliation" card is replaced with a richer block:

```text
AI Reconciliation     analysed Apr 27 14:02 · gemini-2.5-flash · [Re-run]

  Declared 60,000 EUR  ·  Actual 142,300 EUR  ·  Variance +137%
  Transactions analysed: 47  ·  Foreign countries: 4

  Analyst summary
  > "Inflows materially exceed the declared annual income, driven by
  >  high-value transfers from Cyprus and the UAE. Recommend EDD
  >  refresh and request 2024 tax return."

  ── Flags (3) ──────────────────────────────────────────────
  [HIGH]  Inflows exceed declared income by 137%        [▾]
          Calculation
            ((142,300 − 60,000) / 60,000) × 100 = 137.2%
            Threshold: actual > declared × 1.5
            Excess: 82,300 EUR
          Contributing transactions (top 10 by amount)
            • 27 Mar  — Acme Ltd (CY)   18,500 EUR  → open
            • 14 Mar  — J. Doe (UAE)    12,000 EUR  → open
            …
          [Open all in Transactions]   [Create case]
```

Each flag is collapsible. "Open" links jump to `/suite/transactions?id=...`. "Open all in Transactions" filters that page by the contributing IDs. "Create case" opens the existing case-creation modal pre-filled with the flag context.

### Data model

No schema changes. The existing `suite_sof_declarations.ai_reconciliation` JSONB column is extended with two new fields written by the edge function:

- `flags_detailed`: array of `{ code, severity, message, calculation, contributing_transactions }`
- `top_transactions`: array of the 10 largest credits in the analysis window
- `model`: `"google/gemini-2.5-flash"` (for attribution)

The flat `flags: string[]` array is preserved for backward compatibility with the existing audit-log entries and any downstream consumers.

### Edge function changes

`supabase/functions/sof-reconcile/index.ts`:

1. Select `id`, `description`, and `risk_flag` on transactions (in addition to existing fields) so we can render and link them.
2. Build `flagsDetailed` instead of plain strings. Each flag carries:
   - `calculation`: `{ formula, inputs, threshold, result, excess/shortfall }`
   - `contributing_transactions`: relevant txns (top 10 by amount; for the foreign-counterparty flag, only foreign txns)
3. Compute `byCountry` breakdown for the foreign-counterparty flag.
4. Persist `flags_detailed`, `top_transactions`, `model` into `ai_reconciliation`.
5. The AI audit-log event already records `flags`; no change needed there.

### UI changes

New component `src/components/suite/SofFlagDrillDown.tsx`:
- Renders the headline metrics row (declared / actual / variance / txn count / foreign).
- Renders the analyst summary with model attribution.
- Renders an accordion of flags. Each item shows: severity badge (high=red, medium=amber, low=blue), message, expandable calculation block, and a sortable mini-table of contributing transactions with `→ open` deep-links.
- Falls back gracefully when only the legacy flat `flags: string[]` is present (renders message-only rows with no drill-down) — important for declarations analysed before this upgrade.

Edits to `src/pages/suite/SuiteSourceOfFunds.tsx`:
- Replace the inline AI Reconciliation `<Card>` with `<SofFlagDrillDown reconciliation={openDecl.ai_reconciliation} onRerun={() => runReconciliation(openDecl.id)} busy={aiBusy === openDecl.id} />`.
- Pass `customerId` so deep-links can scope the Transactions page filter.

### Technical notes

- All data comes from the already-stored JSONB — no new round-trip when opening the drawer.
- Transaction deep-link uses an existing route convention (`/suite/transactions?customer=<id>&ids=<csv>`); if the Transactions page doesn't yet honour `ids`, we fall back to `?customer=<id>` and the user filters manually (no broken link).
- Severity is derived in the edge function (`high` for missing-income / large excess; `medium` for shortfall / foreign concentration).
- Currency formatting uses `Intl.NumberFormat` keyed off `decl.currency`.

### Files

- Edited: `supabase/functions/sof-reconcile/index.ts` — emit `flags_detailed`, `top_transactions`, `model`.
- New: `src/components/suite/SofFlagDrillDown.tsx`.
- Edited: `src/pages/suite/SuiteSourceOfFunds.tsx` — swap in the new component.

Approve to implement.