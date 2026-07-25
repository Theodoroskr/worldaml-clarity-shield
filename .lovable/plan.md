
## Goal

Give each tenant's approved customers a self-serve portal to sign in, see outstanding document requests, upload replacements, and leave a full audit trail — cutting ops load vs. the current one-shot public onboarding link.

## Architecture

Customers authenticate through Supabase Auth just like staff, but a new `suite_customer_portal_users` table links a Supabase `auth.users.id` to a `suite_customers` row. Portal identity is completely separate from `suite_org_members` (compliance team). RLS keys every portal query off the linked customer.

Reuse the private `onboarding-submissions` storage bucket (already RLS-protected) for uploads.

```text
auth.users ──┐
             ├── suite_customer_portal_users ──▶ suite_customers ──▶ suite_customer_documents
staff side:  └── suite_org_members ──▶ suite_organizations              (existing)
```

## Deliverables

### 1. Database (migration)

- `suite_customer_portal_users` — `id`, `customer_id`, `organisation_id`, `auth_user_id`, `email`, `invited_at`, `activated_at`, `last_login_at`, `status` (`invited|active|disabled`).
- `suite_customer_portal_audit` — `id`, `customer_id`, `portal_user_id`, `event` (`invite_sent|logged_in|document_uploaded|document_replaced|rerequest_responded|profile_updated`), `details jsonb`, `ip`, `user_agent`, `created_at`.
- Extend `suite_customer_documents` with `uploaded_via_portal boolean`, `replaces_document_id uuid` (self-FK).
- New status `pending_review` used when the portal user just uploaded a replacement (staff must accept before it supersedes the old one).
- RPC `portal_invite_customer(_customer_id)` — staff-only; creates row, returns single-use magic-link token via existing Supabase invite email.
- RPC `portal_submit_document(_customer_doc_id, _new_storage_path, _issued_on, _expires_on, _notes)` — auth'd portal user; inserts a new row (status `pending_review`, `replaces_document_id` set), writes audit event, does **not** touch the old row until staff accept.
- RPC `portal_accept_document(_new_doc_id)` — staff-only; marks new row `valid`, marks old row `replaced`, closes any open `document` alert.
- RLS on all portal tables scoped by `auth.uid()`; helper `is_portal_user_of(_customer_id)`.

### 2. Edge function

- `portal-invite` — invoked from staff UI; calls `supabase.auth.admin.inviteUserByEmail` with `data: { portal_customer_id }`, then upserts `suite_customer_portal_users` in `invited` state. Sends via existing Resend flow.

### 3. Staff-side UI

- On `SuiteCustomerDocuments` header: **"Invite to portal"** button per customer (visible when no active portal user). Shows portal status badge + "Resend invite" / "Disable access".
- On each document row: a **Portal status** chip (`Requested from customer`, `Awaiting review — uploaded via portal`, `Accepted`).
- New **Accept / Reject** buttons for `pending_review` rows → calls `portal_accept_document` or moves back to `rerequested`.

### 4. Customer portal (public routes)

- `/portal/login` — email + password / magic-link, using existing `supabase.auth.signInWithOtp`.
- `/portal/*` guarded by `CustomerPortalGuard` — requires session AND a `suite_customer_portal_users` row.
- `/portal` (Overview) — tenant-branded header, greeting, count of outstanding items, "Refresh a document" CTA.
- `/portal/documents` — table of the customer's documents with status, expiry, download link; inline **Upload replacement** flow for `expired | expiring_soon | rerequested` rows.
- `/portal/activity` — read-only audit log for the customer's own events.
- Every action writes to `suite_customer_portal_audit`.

### 5. Routing / navigation

- New lazy routes in `src/App.tsx` under `/portal/*` with a dedicated `CustomerPortalLayout` (no Suite sidebar, tenant-branded).
- Add `/portal` link from the staff "Invite" toast so ops can preview.

## Out of scope for this cut

- Portal user self-signup (invite-only for now).
- Multiple portal users per customer (single contact for v1).
- SSO / social providers on the portal.
- Direct edit of `suite_customers` fields (read-only in v1; docs only).

## Files to add / change

**New**
- `supabase/migrations/<ts>_customer_portal.sql`
- `supabase/functions/portal-invite/index.ts`
- `src/pages/portal/CustomerPortalLayout.tsx`
- `src/pages/portal/PortalLogin.tsx`
- `src/pages/portal/PortalOverview.tsx`
- `src/pages/portal/PortalDocuments.tsx`
- `src/pages/portal/PortalActivity.tsx`
- `src/components/portal/CustomerPortalGuard.tsx`
- `src/hooks/usePortalSession.ts`

**Changed**
- `src/App.tsx` — mount `/portal/*` routes.
- `src/pages/suite/SuiteCustomerDocuments.tsx` — invite button, portal status chips, accept/reject.

Approve and I'll build it end-to-end in the next turn.
