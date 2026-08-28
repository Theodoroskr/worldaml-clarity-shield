# Screening & Monitoring: packages + case management workflow

Two connected pieces: a package model that defines what each customer actually gets (and enforces it), and a case management workflow so screening results become auditable work items with owners, SLAs and outcomes.

## Part 1 — Package Offerings

### Annual screening & monitoring packages

| Plan | Annual price | Users included | Screening searches / year | Monitored entities | Best for |
|---|---|---|---|---|---|
| **Demo** | Free | 1 user | 5 | — | Individual evaluation |
| **Essentials** | €490 | 1 user | 500 | 100 | Small teams starting out |
| **Starter** | €990 | 3 users | 1,000 | 200 | Growing compliance teams |
| **Professional** | €1,990 | 5 users | 2,000 | 500 | Mid-size operators |
| **Compliance** | €4,950 | 10 users | 5,000 | 1,000 | Regulated enterprises |
| **Enterprise** | Contact us | Negotiated | Negotiated | Negotiated | Custom volume / SLA |

### What is included in every paid package
- **Screening searches** against sanctions, PEP, RCA, warnings and adverse media lists.
- **Ongoing monitoring** of entities with automated alerts when lists change.
- **Case management workspace** with assignment, decisions, comments and audit trail.
- **Team seats** at the user count shown above; additional seats available.
- **Standard support** via email; Enterprise includes dedicated account management.

### Billing rules
- All paid plans are billed **yearly** (annual commitment).
- **Demo** is free, limited to 1 user, 5 screening searches and does not include monitoring.
- Allowances reset on the subscription renewal date; unused searches do not roll over.
- 14-day full refund; afterwards the subscription runs to the end of the paid year.
- Extra seats on paid plans: **€29/user/month billed annually** (€348/user/yr). Seat purchase is blocked if it would exceed the plan’s included user count unless the customer upgrades.

### Paid add-on modules (stack on any package)
| Add-on | Price | What it adds |
|---|---|---|
| Escalation & Four-Eyes Review | €149/mo | MLRO queue, senior approval and escalation audit trail |
| Additional search / monitor block | On request | Top-up packs for searches or monitored entities |
| Enhanced Due Diligence reports | On request | Manual analyst reports and source packs |

### Package enforcement
- Plan definitions live in one place (`src/lib/screeningPlans.ts`) and drive the public pricing page, workspace usage widget and admin screening product page.
- `screening-run` Edge Function checks the remaining annual search quota before calling the provider; over quota returns an upgrade prompt.
- Adding a subject to monitoring checks the monitored-entity quota; over quota returns an upgrade prompt.
- `/screening/team` blocks adding members beyond the seat quota with an upgrade prompt.
- Workspace header shows searches used / monitored entities / seats with renewal date.
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
