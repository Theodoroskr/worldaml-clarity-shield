
## Understanding the Problem

The "email rate limit exceeded" error is coming from **Resend's free tier limits**:
- 100 emails/day
- 3,000 emails/month
- 2 requests/second

The project sends emails via Resend in two edge functions:
1. `notify-new-signup` — fires on every new user registration
2. `submit-form` — fires on every lead form submission (Contact Sales, Free Trial, Get Started, etc.)

If multiple signups or form submissions happen in a short window, Resend's daily or per-second cap can be hit.

## What Needs Fixing

Both functions currently **fail hard** when Resend returns a rate-limit error — the error propagates and can surface to the user. The fix should:

1. **Catch Resend rate-limit errors gracefully** — log them but still return `success: true` so the DB write succeeds and the user experience is unaffected. The form data is already saved to the database regardless, so the lead isn't lost.
2. **Add retry-with-backoff** on the `2 requests/second` limit — a short delay + one retry handles the rate-limited-per-second case without failing.
3. **Degrade gracefully** — if the daily cap is hit, the admin misses an instant email notification but no user-facing error is shown and data is preserved in `form_submissions`.

## Plan

### Files to change
- `supabase/functions/notify-new-signup/index.ts`
- `supabase/functions/submit-form/index.ts`

### Changes

**Both functions:**
- Wrap the `resend.emails.send()` call to detect Resend rate-limit responses (HTTP 429 / error code `rate_limit_exceeded`)
- On rate-limit: log a warning with the rate-limit details, skip sending, and return success (data is already in DB for `submit-form`, or the signup is already complete for `notify-new-signup`)
- On transient errors (5xx): one retry after a 1-second delay before giving up silently

**`submit-form` specifically:**
- The email send is already in a try/catch that doesn't affect the success response — just ensure the error log is descriptive so we can diagnose via edge function logs

**`notify-new-signup` specifically:**
- Currently returns HTTP 500 if email fails — change to return 200 with a warning, since the email is non-blocking admin-only info (the signup already succeeded in Supabase auth)

No database changes needed.
