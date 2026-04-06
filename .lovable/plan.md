
# Admin Management Panel — Full Plan

## Location & Access
- Standalone route: `/admin` with sub-routes
- Protected by `has_role(auth.uid(), 'admin')` check
- Separate layout with admin sidebar navigation
- Redirect non-admin users to `/dashboard`

---

## Module 1: User Management (`/admin/users`)

### Features
- Paginated user list with search/filter (by status, role, date)
- View user profile details (name, email, company, signup date)
- Assign/remove roles (admin, moderator, user)
- Approve/suspend/reject users manually
- View user's suite activity (customers, screenings, alerts count)

### Database Changes
- No new tables needed — uses existing `profiles`, `user_roles` tables
- New RLS policies: admin-only SELECT on all suite tables for user activity aggregation

### UI Components
- `AdminUserList` — searchable table with bulk actions
- `AdminUserDetail` — slide-over panel with role editor & activity summary

---

## Module 2: Onboarding Form Builder (`/admin/forms`)

### Features
- Create custom KYC/KYB onboarding forms with drag-and-drop field ordering
- Field types: text, email, date, select/dropdown, file upload, country picker, checkbox
- Mark fields as required/optional
- Set conditional visibility (e.g., show "Registration Number" only if type = business)
- Preview form before publishing
- Multiple form templates (Individual KYC, Business KYB, EDD)

### Database Changes
New table: `admin_form_templates`
```
id UUID PK
name TEXT
form_type TEXT (kyc, kyb, edd)
fields JSONB (array of field definitions)
is_active BOOLEAN DEFAULT false
created_by UUID
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

New table: `admin_form_submissions`
```
id UUID PK
template_id UUID FK → admin_form_templates
customer_id UUID FK → suite_customers
submitted_data JSONB
status TEXT (pending, reviewed, approved, rejected)
reviewed_by UUID
user_id UUID
created_at TIMESTAMPTZ
```

### UI Components
- `FormTemplateList` — list/create/archive templates
- `FormFieldEditor` — drag-and-drop field configuration
- `FormPreview` — live preview of the form
- `FormSubmissionsList` — review submitted forms

---

## Module 3: Visual Workflow Builder (`/admin/workflows`)

### Features
- Drag-and-drop node-based workflow editor
- Node types: Trigger, Action, Condition, Approval, Notification, End
- Trigger types: New customer, Screening match, Transaction flagged, Manual
- Action types: Assign reviewer, Change risk level, Send alert, Create case, Request EDD
- Condition branches: IF risk_level = high, IF amount > threshold, IF country in list
- Connect nodes with edges; support parallel branches
- Save/publish/deactivate workflows
- Execution log showing which workflow fired for which entity

### Database Changes
New table: `admin_workflows`
```
id UUID PK
name TEXT
description TEXT
is_active BOOLEAN DEFAULT false
trigger_type TEXT
nodes JSONB (array of node objects with positions, types, config)
edges JSONB (array of connections between nodes)
created_by UUID
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

New table: `admin_workflow_executions`
```
id UUID PK
workflow_id UUID FK → admin_workflows
entity_type TEXT
entity_id UUID
status TEXT (running, completed, failed)
execution_log JSONB
started_at TIMESTAMPTZ
completed_at TIMESTAMPTZ
user_id UUID
```

### UI Components
- `WorkflowList` — list all workflows with status toggle
- `WorkflowCanvas` — visual drag-and-drop editor (using react-flow library)
- `NodeConfigPanel` — configure selected node's properties
- `WorkflowExecutionLog` — view execution history

### Dependencies
- `@xyflow/react` (formerly reactflow) for the visual node editor

---

## Module 4: Pricing & Limits (`/admin/pricing`)

### Features
- Define subscription tiers with name, monthly price, feature list
- Set API rate limits per tier (requests/day, requests/month)
- Set usage quotas: max customers, max screenings/month, max alerts
- Assign tiers to users
- View current usage vs. limits per user
- Connect tiers to Stripe products/prices

### Database Changes
New table: `admin_subscription_tiers`
```
id UUID PK
name TEXT
description TEXT
monthly_price_cents INTEGER
stripe_price_id TEXT
max_customers INTEGER
max_screenings_per_month INTEGER
max_api_requests_per_day INTEGER
features JSONB
is_active BOOLEAN DEFAULT true
sort_order INTEGER
created_at TIMESTAMPTZ
```

New table: `admin_user_subscriptions`
```
id UUID PK
user_id UUID
tier_id UUID FK → admin_subscription_tiers
stripe_subscription_id TEXT
status TEXT (active, cancelled, past_due)
current_period_start TIMESTAMPTZ
current_period_end TIMESTAMPTZ
created_at TIMESTAMPTZ
```

### UI Components
- `TierEditor` — create/edit subscription tiers
- `TierList` — overview of all tiers with user counts
- `UserSubscriptionManager` — assign/change user tiers
- `UsageDashboard` — per-user usage vs. limits overview

---

## Admin Layout & Navigation

### Sidebar Links
1. 👥 Users (`/admin/users`)
2. 📋 Forms (`/admin/forms`)
3. 🔀 Workflows (`/admin/workflows`)
4. 💰 Pricing (`/admin/pricing`)
5. ← Back to Suite (`/suite`)

### Shared Components
- `AdminLayout` — sidebar + topbar with admin badge
- `AdminGuard` — role check wrapper redirecting non-admins

---

## Build Order
1. Database migration (all 6 new tables + RLS policies)
2. Admin layout, guard, and routing
3. User Management module
4. Onboarding Form Builder
5. Visual Workflow Builder (install @xyflow/react)
6. Pricing & Limits module

---

## Estimated Scope
- 6 new database tables
- ~15 new React components
- 1 new npm dependency (@xyflow/react)
- 4 new page routes under /admin
