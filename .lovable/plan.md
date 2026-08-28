# Screening & Monitoring: packages + case management workflow

Two connected pieces: a package model that defines what each customer actually gets (and enforces it), and a case management workflow so screening results become auditable work items with owners, SLAs and outcomes.

## Part 1 — Packages

### Package structure — annual billing

| Plan | Annual price | Screening searches / year | Monitored entities |
|---|---|---|---|---|
| Demo | Free | 5 | — |
| Essentials | €490 | 500 | 100 |
| Starter | €990 | 1,000 | 200 |
| Professional | €1,990 | 2,000 | 500 |
| Compliance | €4,950 | 5,000 | 1,000 |
| Enterprise | Contact us | Negotiated | Negotiated |

- All paid plans are billed **yearly** (annual commitment). The Demo plan is free and capped at 5 screening searches; it does not include ongoing monitoring.
- Allowances reset on the subscription renewal date; unused searches do not roll over.
- New Stripe annual prices are created for Essentials, Starter, Professional and Compliance; the existing monthly prices are replaced on the public pricing page and the business catalogue.
- Cancellation within the first 14 days is refunded in full; afterwards the subscription runs to the end of the paid year (no partial refunds).

Paid add-on modules stay separate and stack on any package:
- Escalation & Four-Eyes Review — EUR 149/mo (already built)
- Additional monitored entities / search blocks — priced on request
- Enhanced Due Diligence reports — priced on request

### Making the package real (limits, not just marketing)
- Extend `screening_subscriptions` with `search_quota_annual`, `monitor_quota`, `seat_quota`, `searches_used_this_period`, `monitors_used`, `period_started_at`.
- Plan definitions live in one place (`src/lib/screeningPlans.ts`) and are used by the public pricing page, the workspace usage widget and the admin screening product page — so there is a single source of truth.
- `screening-run` edge function checks search quota before calling the provider; over quota returns a clear upgrade message instead of a silent failure.
- Adding a subject to monitoring checks `monitor_quota`; over quota returns an upgrade prompt.
- `/screening/team` blocks adding members beyond the seat quota with an upgrade prompt.
- Usage bar in the workspace header: searches used / monitored entities / seats, with a renewal date.
- Admin can override quotas per organisation from `/admin/screening-product`.

## Part 2 — Case management workflow

The tables already exist (`screening_cases` with assignment, priority, due date, escalation fields; plus decisions, comments, attachments, audit events). What is missing is the workflow layer around them.

### Case lifecycle

```text
Screening run
     v
Case created  ── no hits ──> auto-closed (no potential matches), evidence retained
     v hits
Open / unassigned  ->  Assigned to analyst  ->  In review
     v
   Decision per match: false positive | possible | confirmed | escalate
     v                                            v
Resolved (all matches decided)              Escalated -> MLRO queue
     v                                            v
   Closed with outcome + reason        Approved / returned to analyst
     v
Monitoring alert reopens the case -> back to In review
```

### What gets built
1. **Case queue** at `/screening/cases` — table + filters (status, priority, assignee, risk category, age, due date), saved views for "My cases", "Unassigned", "Escalated", "Overdue".
2. **Assignment** — assign or reassign to a team member, bulk-assign, auto-assign to the creator on run (configurable per org).
3. **Priority & SLA** — priority derived from match type (sanctions > PEP > adverse media) and editable. Due date set from per-org SLA targets (e.g. sanctions 1 day, PEP 3 days, adverse media 5 days). Overdue and due-soon badges.
4. **Case detail workspace** — subject summary, all matches with decision controls, internal comments with @mentions, attachments, and a full chronological audit timeline.
5. **Closure discipline** — a case cannot close while any match is undecided; closure requires an outcome and a reason, both written to the audit trail.
6. **Escalation** — routes into the MLRO queue when the Four-Eyes module is active; senior reviewer approves or returns with a note.
7. **Monitoring feedback loop** — a monitoring alert reopens the linked case, reassigns to the last owner and flags it as a monitoring review.
8. **Dashboard metrics** — open cases by status, average time to close, overdue count, decisions by analyst, escalation rate.
9. **Exports** — case list CSV and per-case PDF evidence pack for regulators/auditors.

## Suggested build order
1. Plan definitions + quota columns + usage enforcement and usage widget (packages become real).
2. Case queue, assignment, priority/SLA.
3. Case detail workspace with decisions, comments, closure rules.
4. Escalation routing and monitoring reopen loop.
5. Metrics dashboard and exports.

## Technical notes
- Stripe: create four annual prices (Essentials €490, Starter €990, Professional €1,990, Compliance €4,950); `create-worldaml-checkout` accepts `essentials`, `starter`, `professional` and `compliance`; Demo is free and requires no checkout. `verify-worldaml-subscription` maps annual subscriptions to quotas.
- Migration: extend `screening_subscriptions` with separate `search_quota_annual` and `monitor_quota`, plus usage counters; add `screening_sla_settings` per organisation; add case activity/assignment audit rows where not already covered by `screening_audit_events`.
- Frontend: new `src/lib/screeningPlans.ts` (single source for tiers/quotas), `src/pages/screening/ScreeningCases.tsx`, `ScreeningCaseDetail.tsx`, usage widget component; reuse existing shadcn table/dialog patterns from the Suite case queue. Pricing page and business catalogue updated to yearly display.
- Edge functions: quota check in `screening-run`, decision/closure rules extended in `screening-decision`, reopen handling in `screening-monitoring-poll`.
- Pricing displayed identically signed in and signed out, read from the shared catalogue.
