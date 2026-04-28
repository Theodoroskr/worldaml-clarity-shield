## Goal

Automatically transition `verified` Source of Funds declarations to `expired` once their `expires_at` (12-month term) is reached, then notify the responsible compliance team members of every declaration that just expired.

---

## 1. New Edge Function — `supabase/functions/sof-expire-declarations/index.ts`

Runs once a day via pg_cron. Service-role only.

**Steps:**
1. Select all rows in `suite_sof_declarations` where `status = 'verified'` AND `expires_at <= now()`.
2. For each row, in a single update, set `status = 'expired'`. The existing `log_sof_declaration_changes` trigger will automatically write an `expiry` row to `suite_sof_audit_events` — no extra audit code needed.
3. Group expired declarations by `organisation_id`, join to `suite_customers` to get customer names, and join `suite_org_members` + `profiles` to find recipients with role `admin`, `mlro`, or `compliance_officer`.
4. For each org, send **one digest email** via Resend (reusing the same `RESEND_API_KEY` and `WorldAML <forms@worldaml.com>` sender used by `send-admin-notification`) listing every declaration that expired today, with deep links to `https://worldaml.com/suite/source-of-funds`. Subject: "SoF declarations expired — N customer(s) require re-verification".
5. Also append a single audit-trail event per declaration of type `expiry` (covered automatically by the existing trigger when status changes).
6. Return JSON `{ expired_count, notified_orgs, errors }` for observability.

**Idempotency:** because the WHERE clause filters `status = 'verified'`, re-running the job after declarations already moved to `expired` is a no-op.

**Config:** function deployed with `verify_jwt = false` (cron call uses anon Bearer token). Reject any request that does not present the anon key.

---

## 2. Schedule via pg_cron

Use the **insert** tool (not migration) to register the cron job, since it embeds the project URL and anon key:

```sql
select cron.schedule(
  'sof-expire-declarations-daily',
  '15 2 * * *',  -- 02:15 UTC daily
  $$ select net.http_post(
       url := 'https://uxjjxnnyrjkhcggptihx.supabase.co/functions/v1/sof-expire-declarations',
       headers := '{"Content-Type":"application/json","Authorization":"Bearer <ANON_KEY>"}'::jsonb,
       body := '{"trigger":"cron"}'::jsonb
     ); $$
);
```

`pg_cron` and `pg_net` are already enabled (used by other cron jobs in this project).

---

## 3. Manual trigger button (admin-only) on the SoF page

In `src/pages/suite/SuiteSourceOfFunds.tsx`, add a small **"Run expiry sweep"** button next to the "+ New Declaration" button, visible only to `canManage` users. Calls `supabase.functions.invoke('sof-expire-declarations')` and toasts the result. Useful for testing and for ad-hoc sweeps after timezone-edge expirations.

---

## Files

**New**
- `supabase/functions/sof-expire-declarations/index.ts`

**Edited**
- `src/pages/suite/SuiteSourceOfFunds.tsx` (manual trigger button)

**Database (insert tool, not migration)**
- New `cron.schedule` job `sof-expire-declarations-daily`.

---

## Out of scope

- Pre-expiry warnings (e.g. "expires in 7 days"). Easy to add later by querying `expires_at BETWEEN now() AND now() + interval '7 days'` on the same cron.
- Auto re-screening or auto-creating a follow-up review case — just the status flip + notification for now.
