

# Fix Email Notifications + Add Auto-Approval for Trusted Domains

## Problem Found: Why admin notifications aren't sending

The `notify-new-signup` edge function requires an `x-internal-secret` header validated against `INTERNAL_WEBHOOK_SECRET`. But the Signup page sends only an `apikey` header — so every notification is **rejected with 403**. Additionally, `INTERNAL_WEBHOOK_SECRET` is not in the configured secrets list.

## Plan

### 1. Database: Create `auto_approve_domains` table + trigger

Create a migration that:
- Adds an `auto_approve_domains` table (columns: `id`, `domain` text unique, `created_at`) with RLS allowing only admins to manage it
- Inserts `infocreditgroup.com` as a seed row
- Creates a trigger function `auto_approve_trusted_domain()` on `profiles` INSERT that checks if the user's email domain matches any row in `auto_approve_domains` — if so, sets `status = 'approved'` immediately

### 2. Fix notification auth: Remove shared-secret check

The edge function's internal-secret check is broken (secret was never configured). Replace it with standard Supabase auth (verify the request has a valid `apikey` or `Authorization` header via Supabase client). Since this is a non-sensitive admin notification (not a data mutation), validating the anon key is sufficient.

**Files:** `supabase/functions/notify-new-signup/index.ts` — remove `INTERNAL_WEBHOOK_SECRET` check, use standard anon-key validation instead.

### 3. Update Signup page to send correct headers

**File:** `src/pages/Signup.tsx` — update the fetch call to include the `apikey` header in the standard Supabase format (already present) and add `Authorization: Bearer <anon_key>` header.

### 4. Update notification for auto-approved users

Modify the edge function to accept an `auto_approved` boolean flag. When true, the admin email says "Auto-approved (trusted domain)" instead of "awaiting your approval".

### 5. Update Signup flow for auto-approved domains

In `src/pages/Signup.tsx`, after signup succeeds, check if the email domain is in the trusted list. If auto-approved, show a different toast message ("Your account has been approved automatically") and navigate to `/login` as usual. The trigger handles the actual approval server-side.

### 6. Admin UI: Manage trusted domains

Add a section in the Admin page to view, add, and remove auto-approve domains.

## Technical detail

The trigger approach is secure — domain matching happens server-side in PostgreSQL, not client-side. The auto-approval cannot be spoofed because it runs as a `BEFORE INSERT` trigger on the `profiles` table.

