
# WorldAML Suite — Small Enterprise Plan

## Overview
Build a functional compliance suite dashboard at `/suite/*` routes, behind authentication, with sidebar navigation. Pull UI components from [Compliance UX Insights](/projects/13c9046c-cc72-411a-aae9-266e029f88ce) and adapt them to the WorldAML design system. Start with visual UI + sample data, then wire to real backend tables.

---

## Modules & Routes

### 1. Dashboard (Home)
**Route:** `/suite`
**Source:** `DashboardPage.tsx`, `WorkspaceDashboard.tsx`
**Features:** Overview stats (total customers, pending alerts, screening queue, risk summary), recent activity feed, quick actions

### 2. Customer Onboarding (KYC/KYB)
**Route:** `/suite/onboarding`
**Sub-routes:** `/suite/onboarding/individuals`, `/suite/onboarding/businesses`
**Source:** `OnboardingPage.tsx`, `IndividualsPage.tsx`, `KYBPage.tsx`, `UBOPage.tsx`, `ProfilePage.tsx`
**Features:**
- Individual customer registration with ID details
- Business entity registration with UBO mapping
- Document upload & status tracking
- Risk categorisation (low/medium/high)

### 3. IDV & Liveness
**Route:** `/suite/idv`
**Source:** `IdentityVerificationPage.tsx`
**Features:**
- Document authentication status
- Biometric liveness check results
- Manual review queue for inconclusive results
- Integration hook for WorldID/Identomat

### 4. AML Screening & Monitoring
**Route:** `/suite/screening`
**Sub-routes:** `/suite/screening/matches`, `/suite/screening/watchlist`
**Source:** `ScreeningPage.tsx`, `ScreeningDashboard.tsx`, `MatchesPage.tsx`, `WatchlistPage.tsx`
**Features:**
- Search individuals/entities against sanctions, PEP, adverse media
- Match review with confidence scores
- Ongoing monitoring with change alerts
- Custom watchlist management

### 5. Transaction Monitoring
**Route:** `/suite/transactions`
**Source:** `TransactionMonitor.tsx`, `TransactionsDashboard.tsx`, `TransactionsPage.tsx`
**Features:**
- Real-time transaction feed
- Rule-based alert generation
- Threshold monitoring
- Suspicious pattern detection

### 6. Alert Management
**Route:** `/suite/alerts`
**Sub-routes:** `/suite/alerts/rules`
**Source:** `AlertRuleBuilder.tsx`, `RulesPage.tsx`
**Features:**
- Alert queue (open, in-review, escalated, closed)
- Priority levels and assignment
- Custom alert rules builder
- Escalation workflows

### 7. Risk Assessment
**Route:** `/suite/risk`
**Source:** `RiskScoringPage.tsx`, `CDDPage.tsx`
**Features:**
- Customer risk scoring (automated + manual override)
- CDD/EDD triggers based on risk level
- Risk factor weighting configuration
- Periodic re-assessment scheduling

### 8. Case Management & SAR Filing
**Route:** `/suite/cases`
**Sub-routes:** `/suite/cases/sar`, `/suite/cases/ctr`
**Source:** `SARPage.tsx`, `CTRPage.tsx`, `ReportsPage.tsx`
**Features:**
- Link alerts to investigation cases
- Case notes, evidence attachments
- SAR/STR report drafting
- CTR generation
- Filing status tracking

### 9. Audit Trail & Logs
**Route:** `/suite/audit`
**Source:** `RegulatoryPage.tsx`, `RepositoryPage.tsx`
**Features:**
- Timestamped action log (who did what, when)
- Exportable audit reports
- Document repository
- Regulatory examination readiness

### 10. Settings & Team Management
**Route:** `/suite/settings`
**Source:** `TeamsPage.tsx`, `SystemPage.tsx`
**Features:**
- User/team management with role assignment
- System configuration
- Notification preferences
- API key management

---

## Shared Components
- **Suite Sidebar** — collapsible navigation with module icons and badge counts
- **Suite Topbar** — search, notifications bell, user menu
- **Suite Layout** — wrapper with sidebar + topbar + main content area

---

## Database Tables (new)

| Table | Key Columns | Purpose |
|-------|-------------|---------|
| `suite_customers` | user_id, type (individual/business), name, risk_level, status, kyc_status | Customer records |
| `suite_ubo` | customer_id, name, ownership_pct, nationality, is_verified | UBO mapping for businesses |
| `suite_screenings` | customer_id, type (sanctions/pep/media), result, match_count, screened_at | Screening history |
| `suite_matches` | screening_id, matched_name, source, confidence, status (pending/confirmed/dismissed) | Match results |
| `suite_transactions` | customer_id, amount, currency, direction, counterparty, risk_flag | Transaction records |
| `suite_alerts` | customer_id, type, severity, status (open/reviewing/escalated/closed), assigned_to | Alert queue |
| `suite_alert_rules` | name, conditions (jsonb), severity, is_active | Custom alert rules |
| `suite_cases` | alert_id, customer_id, status, assigned_to, priority, resolution | Investigation cases |
| `suite_case_notes` | case_id, author_id, content, created_at | Case notes |
| `suite_audit_log` | actor_id, action, entity_type, entity_id, details (jsonb), created_at | Audit trail |
| `suite_idv_sessions` | customer_id, status, document_type, liveness_result, reviewed_by | IDV results |

All tables will have RLS policies scoped to authenticated users within the same organisation.

---

## Implementation Phases

### Phase 1 — Layout & Navigation (1 session)
- Suite layout with sidebar, topbar, auth gate
- Route structure under `/suite/*`
- Dashboard overview with sample data

### Phase 2 — Onboarding & IDV (1-2 sessions)
- Customer onboarding forms (individual + business)
- UBO mapping UI
- IDV status display
- Database tables: `suite_customers`, `suite_ubo`, `suite_idv_sessions`

### Phase 3 — Screening & Monitoring (1-2 sessions)
- Screening search interface
- Match review workflow
- Watchlist management
- Database tables: `suite_screenings`, `suite_matches`

### Phase 4 — Transactions & Alerts (1-2 sessions)
- Transaction feed + monitoring dashboard
- Alert queue with assignment
- Alert rule builder
- Database tables: `suite_transactions`, `suite_alerts`, `suite_alert_rules`

### Phase 5 — Cases & Reporting (1 session)
- Case management with notes
- SAR/CTR drafting
- Database tables: `suite_cases`, `suite_case_notes`

### Phase 6 — Audit & Settings (1 session)
- Audit trail viewer with filters/export
- Team management
- Database tables: `suite_audit_log`

---

## Integrations
- **WorldID / Identomat** — IDV & liveness (existing integration hook)
- **Existing sanctions search** — Reuse `sanctions-search` edge function for screening
- **Email notifications** — Reuse Resend for alert escalation emails
- **Stripe** — Existing billing integration for suite subscription

---

## What This Gives Small Enterprises
✅ Single dashboard for all compliance workflows
✅ Customer onboarding in < 5 minutes
✅ Real-time screening against sanctions/PEP/adverse media
✅ Alert queue that reduces false-positive fatigue
✅ Audit-ready exports for regulators
✅ Team collaboration with role-based access
✅ Affordable — no need for 4-6 separate vendor contracts
