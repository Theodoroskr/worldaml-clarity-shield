# Entity detail drawer + configurable risk alerts

Two additions to the Screening & Monitoring workspace, both hanging off the Monitored entities page.

## 1. Entity detail drawer

Clicking a row on `/screening/monitored` (or a "View" action) opens a right-hand slide-over for that entity.

Sections:
- **Header** — entity name, subject type, country, current risk badge, monitoring status, frequency, next check, assigned owner.
- **Screening history** — every screening search run for that subject: date, categories screened, match counts, who ran it, link to its case.
- **Monitoring history** — timeline of monitoring alerts for the entity (change type, description, detected date, acknowledged state) plus the audit trail of pause/resume/transfer actions.
- **Signals** — match breakdown by category (sanctions, PEP/RCA, warnings, adverse media) and the most recent adverse media headlines with publication and date.
- **Case links** — linked case reference, priority, status, with a button to open the case in the workspace.
- **Quick actions** — pause/resume, transfer access, acknowledge alerts, without leaving the drawer.

Everything is read from existing data (screening searches, cases, matches, monitoring alerts, adverse media items, audit events). No schema change needed for the drawer.

## 2. Configurable risk-level alerts — how it works

Today "risk level" is computed on the fly from match counts (sanctions = High, PEP/warning = Medium, adverse media = Elevated, otherwise Low). Nothing is stored and nothing fires when it changes.

Proposed mechanism:

1. **Store the risk level.** Each monitored entity keeps its last evaluated risk level so a change can be detected instead of re-derived every page load.
2. **Alert rules, per organisation.** A rule says: notify when an entity's risk reaches or crosses a chosen threshold (Elevated / Medium / High), optionally limited to certain categories (e.g. sanctions only) and to entities assigned to a given owner. Each rule chooses its channels: in-app alert, email to named recipients, or both. Rules can be enabled/disabled.
3. **Evaluation points.** Risk is re-evaluated whenever a screening re-run or a monitoring poll updates an entity's match counts. If the new level is higher than the stored one and crosses an active rule's threshold, an alert record is written and the channels fire.
4. **Surfacing.** Crossings appear as a "Risk threshold crossed" entry in the entity drawer's monitoring history, as a banner/count on the Monitored entities page, and (if enabled) as an email.
5. **Settings UI.** A new "Risk alerts" panel — reachable from the Monitored entities page and the workspace sidebar — lists rules with threshold, scope, channels, and last triggered, with create/edit/delete.

Only escalations trigger alerts (a drop back to Low doesn't), and repeat alerts for the same entity at the same level are suppressed until the level changes again.

```text
match counts change ──► evaluate risk ──► level increased?
                                            │ yes
                        rule threshold met? ─┴─► write alert ──► in-app + email
```

## Technical notes

- New table `screening_risk_alert_rules` (organisation-scoped, RLS + grants): threshold level, category scope, owner scope, channels, recipient emails, enabled flag, last_triggered_at.
- New column on `monitoring_subjects`: `risk_level` (last evaluated) and `risk_level_changed_at`.
- Threshold crossings are recorded in the existing `monitoring_alerts` table with a `risk_threshold` change type, so the drawer timeline needs no second data source.
- Evaluation lives in the existing screening-run and monitoring-poll edge functions; email dispatch reuses the existing transactional email path.
- Drawer built with the existing sheet/drawer component, lazy-loading its data only when opened.
