# Suite security: client isolation, encryption at rest, live security audit

## Where things stand (checked)
- All 57 Suite, Screening and Monitoring tables have access rules switched on.
- 54 are tied to a client company. The other 3 are intentional: the company list itself, the module catalogue, and the public list of regulator connections.
- Only one table, the public regulator list, is open to every signed-in user. That is reference data, not client data.
- Nobody has yet proven that client A really gets nothing from client B. That proof is the main thing this plan adds.

## 1. Per-client isolation, proven
- **Rule review.** Check every Suite table's rules so each read and write goes through one shared "is this person in this company" check. Fix any rule that uses a looser shortcut.
- **Files.** Store all Suite files (customer documents, source-of-funds documents, EDD evidence, logos) in a folder named after the company. Only that company's members can open them, and only through links that expire within 10 minutes.
- **Server functions.** Every Suite function (screening, onboarding, exports, regulator submissions) checks the caller's company before doing anything. It never trusts a company ID sent from the browser.
- **Public onboarding forms.** These can only submit to the company that owns the form. They never read back data. They get rate limits and file type and size checks.
- **Two-company test.** An automatic test creates two test companies, each with a user. It confirms that user A gets nothing from company B on every Suite table, file folder and function, even with a direct link or ID. This test must pass before every release.

## 2. Encryption at rest
- **Whole-database encryption.** Before relying on it, confirm and record that the database, files and backups are encrypted on disk by the hosting provider.
- **Extra encryption for the most sensitive fields:** ID and passport numbers, dates of birth, tax numbers, bank account details, and identity check results. These are stored scrambled with a key kept in the backend's secure key store, and only turned back into readable text for authorised members of that company.
- **Search still works.** Search on encrypted fields uses a separate fingerprint, so finding a customer by ID number still works.
- **Existing data.** Existing rows are encrypted in one pass. Screens show the readable values as before.
- **Masking.** In lists and exports these fields show masked (for example ••••1234) unless the person has permission to see them in full.

## 3. Live security audit (Admin → Security)
A new WorldAML admin screen that runs on demand and every night:
- **Table checks:** every Suite table has access rules, is tied to a company, and has no rule that lets everyone in.
- **File checks:** every Suite file area is private and folder-scoped.
- **Function checks:** every server function checks who is calling.
- **Two-company test results:** the latest run, with a pass or fail for each table.
- **Results of the platform security scan and database checks.**
- **Accounts:** WorldAML admins without two-step sign-in, and client companies that require it but have members who haven't set it up.
- **Go-live gate:** a "Ready for go-live" badge that turns red on any high-risk finding, with an email to WorldAML admins when it turns red.

## 4. Supporting controls
- **Two-step sign-in (authenticator app):** available to all Suite users. Required for WorldAML admins. Each company's Suite admin can make it required for their team.
- **Audit trails:** Suite audit trails can be added to but never edited or deleted, including by that company's Suite admin.
- **Sign-out:** inactive users are signed out after 30 minutes.

## Release gate
Before the Suite goes live: the two-company test passes, the security scan has no high-risk findings, and the Admin → Security badge is green.

## Technical details
- `get_rls_audit` extended into a `security_audit_run()` security-definer function, admin only. It checks: relrowsecurity, policies whose qual/with_check is `true`, missing org column, storage buckets (`public` = false, policies using `(storage.foldername(name))[1]` plus org membership), and grants to anon. Results go into a new insert-only `security_audit_runs` table (admin read).
- Isolation test: a vitest/Deno script that makes two orgs via the service role in an edge function `security-isolation-test` (admin only). It signs in as each user and attempts select/insert/update/delete across every `suite_*`, `screening_*` and `monitoring_*` table and each storage bucket. Results are written to `security_audit_runs`. A nightly scheduled job runs it and the audit.
- Encryption: Vault-managed key; `pgcrypto` `pgp_sym_encrypt` columns (`*_enc bytea`) plus an HMAC blind index (`*_bidx`) for lookup. Readable values come only through security-definer views/RPCs that check `is_org_member` and a `can_view_pii` permission. Additive migration, backfill, app switched to the new columns, old columns marked DEPRECATED (not dropped).
- MFA: Lovable Cloud TOTP; `suite_organizations.require_mfa`; SuiteAppLayout requires aal2 when set; sensitive RPCs (exports, PII reveal, module/team changes) check `auth.jwt()->>'aal' = 'aal2'`.
- Edge functions: a shared `requireOrgMember(req)` helper in `_shared/`, used by every Suite function.
