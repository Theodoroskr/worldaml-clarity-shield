

# Send Email to User on Account Approval

## Overview

When an admin clicks "Approve" on a user profile in the Admin panel, send a branded email to that user notifying them their account is now active.

## Implementation

### 1. Create `notify-user-approved` Edge Function

New file: `supabase/functions/notify-user-approved/index.ts`

- Uses the existing Resend setup (same pattern as `notify-new-signup` and `send-certificate-email`)
- Accepts `{ email, full_name }` in the request body
- Sends a branded email from `WorldAML <forms@worldaml.com>` to the user
- Email content: congratulates the user, tells them their account is approved, includes a "Log In" CTA button linking to the login page
- Styled consistently with the existing navy/teal brand (matching `notify-new-signup` template)
- Uses the same `escapeHtml`, `sendEmailWithRetry`, and CORS patterns

### 2. Update Admin page to trigger the email

**File:** `src/pages/Admin.tsx`

In the `updateProfileStatus` function, after a successful update to `"approved"`, fire-and-forget call to `supabase.functions.invoke('notify-user-approved', { body: { email, full_name } })` using the profile's email and name from the existing `profiles` state array.

No change needed for "rejected" status — only approval triggers an email.

## Technical notes

- Uses existing `RESEND_API_KEY` secret (already configured)
- Fire-and-forget pattern (don't block the admin UI on email delivery)
- No new database tables or migrations needed

