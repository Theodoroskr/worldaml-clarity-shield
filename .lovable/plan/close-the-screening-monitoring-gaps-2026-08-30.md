# Close the Screening & Monitoring Gaps

Three gaps confirmed against the codebase. The most important: ongoing monitoring is registered but never actually polled, so provider updates never reach your timeline.

## 1. Schedule the monitoring poll (critical)

**Problem:** `screening-monitoring-poll` exists but nothing ever calls it — no pg_cron job, no schedule. Monitored subjects are never re-checked, so `monitoring_alerts` never fire.

**Fix:**
- Add a shared cron secret: store a random token in the Supabase vault (`screening_poll_secret`).
- Update `screening-monitoring-poll/index.ts` to also accept an `x-cron-secret` header matching the vault secret (keeps the existing service-role auth for manual runs). Done because the service-role key is not accessible on Lovable Cloud.
- Schedule a daily pg_cron job (06:00 UTC) via `run_sql` that uses `pg_net` to POST to the function with the cron secret header.
- Verify with a manual invocation: run the function once, confirm it returns `{ ok: true }` and check `cron.job_run_details` for the scheduled run.

## 2. Stripe webhook for screening subscriptions

**Problem:** Only the Academy has a Stripe webhook (`stripe-academy-webhook`). Screening checkouts (`create-worldaml-checkout`) rely on the user-triggered `verify-worldaml-subscription`, so renewals, cancellations and failed payments never sync automatically — a cancelled customer keeps access until someone notices.

**Fix:**
- New edge function `stripe-worldaml-webhook` (JWT verification off, Stripe signature verification on) handling:
  - `customer.subscription.updated` / `customer.subscription.deleted` → sync `screening_subscriptions.status` and `current_period_end`
  - `invoice.payment_failed` → flag subscription as `past_due`
  - `checkout.session.completed` → belt-and-braces entitlement confirmation
- Register the webhook endpoint in Stripe and store its signing secret (`STRIPE_WORLDAML_WEBHOOK_SECRET`).
- Test with a Stripe CLI-style signed test event.

## 3. Alert acknowledgment on the case page

**Problem:** Acknowledgment exists only inside the EntityDetailDrawer ("Acknowledge all"). The new case-page monitoring timeline shows "Requires review" badges with no way to clear them there.

**Fix:**
- Add a "Mark reviewed" action per alert (and "Mark all reviewed") on the monitoring timeline card in `SuiteScreeningV2.tsx`, writing `status = 'acknowledged'`, `acknowledged_at`, `acknowledged_by` to `monitoring_alerts` (RLS UPDATE policy already exists — verified).
- Refresh timeline state in place so badges clear immediately.

## Verification

- Manual poll run + `monitoring_alerts` insert check
- Webhook signature test event updates a sandbox subscription
- Timeline acknowledge buttons clear badges without reload
- Existing vitest suite stays green

## Technical details

- Files: `supabase/functions/screening-monitoring-poll/index.ts`, new `supabase/functions/stripe-worldaml-webhook/index.ts`, `src/pages/suite/SuiteScreeningV2.tsx`
- SQL: vault secret insert + `cron.schedule(...)` via run_sql (contains project URL + secret, so run_sql not a migration file)
- New secret: `STRIPE_WORLDAML_WEBHOOK_SECRET` (Stripe will generate it when the endpoint is created)
