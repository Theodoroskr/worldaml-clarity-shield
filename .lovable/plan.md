## Source of Funds — Audit Log

Add a complete, tamper-resistant audit trail per SoF declaration covering:
- Declaration status changes (e.g. `draft → submitted → verified`)
- Reviewer-note edits
- Document verification decisions (verify / reject)
- AI reconciliation runs (with risk flag + summary)

Surface it as a timeline panel inside the existing declaration drawer at `/suite/source-of-funds`.

### What the user sees

In the existing declaration drawer, a new **Audit Trail** section lists every event newest-first:

```text
[Apr 27, 14:02]  Status changed: under_review → verified        — Jane MLRO
[Apr 27, 13:58]  Reviewer notes updated                          — Jane MLRO
[Apr 27, 13:40]  Document verified: payslip_2025.pdf             — Jane MLRO
[Apr 27, 13:22]  AI reconciliation: 2 flag(s), risk_flag=true    — system
[Apr 26, 09:10]  Status changed: draft → submitted               — John Customer
```

Each row shows: timestamp, event type with a coloured badge, a short human description, and the actor. Clicking a row expands to show the full JSON payload (old/new values, AI summary, etc.) for forensic detail.

A "Download CSV" button exports the timeline for that declaration.

### Data model

New table `suite_sof_audit_events`:

- `declaration_id` (FK → `suite_sof_declarations`, ON DELETE CASCADE)
- `organisation_id`, `actor_user_id` (nullable — `null` for system/AI events)
- `event_type` enum-as-text: `status_change`, `notes_update`, `document_verification`, `ai_reconciliation`, `submission`, `expiry`
- `summary` text (human-readable one-liner)
- `details` jsonb (old/new values, document id + filename, AI flags, etc.)
- timestamps

RLS mirrors `suite_sof_declarations`: org members of the declaration's org (or platform admins) can `SELECT`; inserts only via `SECURITY DEFINER` triggers / edge function (no direct client inserts, no updates, no deletes — append-only).

### How events get recorded

1. **Declaration status / notes changes** — `AFTER UPDATE` trigger on `suite_sof_declarations` compares OLD vs NEW and writes one event per changed dimension (status, reviewer_notes). Actor = `auth.uid()`.
2. **Document verification** — `AFTER INSERT OR UPDATE OF verification_status` trigger on `suite_sof_documents` writes a `document_verification` event referencing the parent declaration.
3. **AI reconciliation** — the `sof-reconcile` edge function inserts an `ai_reconciliation` event after it writes results back, with `actor_user_id = auth.uid()` and details containing `flags`, `variance_pct`, `risk_flag`, model name.
4. **Submission / expiry** — captured by the same status-change trigger (since both transition the `status` column).

All triggers are `SECURITY DEFINER` with `SET search_path = public` and write directly to `suite_sof_audit_events`, bypassing RLS for the insert path only.

### UI changes

- `src/pages/suite/SuiteSourceOfFunds.tsx`
  - Add `loadAuditEvents(declarationId)` and state `auditEvents`.
  - In the declaration drawer (after the documents section), render a new `<AuditTrail />` block: timeline list, expandable JSON, CSV export button.
  - Refresh the timeline after every status update / verify / AI run.
- New small component `src/components/suite/SofAuditTrail.tsx` — pure presentational timeline + CSV download (uses existing teal accent + status-badge tokens).

### Technical notes

- Trigger functions are idempotent and only insert when a tracked field actually changed (`OLD.x IS DISTINCT FROM NEW.x`).
- Actor display name resolved client-side from `profiles.full_name` keyed by `actor_user_id`; system events render as "system".
- No data migration needed — historical events are not back-filled (audit trail starts at deployment time; this is explicitly documented in the empty state).
- CSV export is fully client-side, no new edge function.

### Files

- New migration: `suite_sof_audit_events` table + RLS + 2 trigger functions + 2 triggers.
- New: `src/components/suite/SofAuditTrail.tsx`.
- Edited: `src/pages/suite/SuiteSourceOfFunds.tsx` (load + render timeline, refresh hooks).
- Edited: `supabase/functions/sof-reconcile/index.ts` (append `ai_reconciliation` event after writing results).

Approve to implement.