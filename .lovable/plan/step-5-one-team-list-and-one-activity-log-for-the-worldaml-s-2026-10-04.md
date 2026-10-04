# Step 5 — One team list and one activity log for the WorldAML Suite

## What changes for you
- **One team list** in Suite → Settings → Team Members. Everyone in the company, whether they joined via Screening or the Suite, appears once, with one role and the modules they're allowed to use.
- **Invite once**: invite by email, pick a role and modules (Screening, KYC / KYB, ...). The invite email is sent automatically. Seat limits from the company's plan are shown and enforced.
- **The old Screening team page is retired** — its link already redirects to Suite Settings; nothing to look for elsewhere.
- **One activity log** in Suite → Audit Trail: screening runs, match decisions, escalations, monitoring alerts, team changes, module changes and sensitive-detail views all appear in one timeline with the real person's name (not "You"), filters by module and type, and CSV export.
- Existing history is kept: past screening activity is copied into the single log so the timeline is complete from day one.

## Roles (one set for the whole Suite)
Admin, MLRO, Compliance officer, Analyst, Viewer. Former Screening roles map across: Admin → Admin, MLRO approver → MLRO, Analyst → Analyst, Viewer → Viewer. Only MLRO and Admin can resolve escalated matches (unchanged behaviour).

## Security
- Team list and log only show your own company; nobody can see another client's people or activity.
- Only Suite admins can invite, change roles or remove members; checked on the server, not just hidden buttons.
- The log stays write-once — no one, including admins, can edit or delete entries.
- Removing someone takes away Suite and Screening access immediately.
- Security audit and two-company separation test run before release.

## Technical details
- Source of truth: `suite_org_members` (+ `suite_member_module_access`). New RPCs `suite_team_members()`, `suite_invite_member(email, role, modules[])`, `suite_set_member_role`, `suite_remove_member` — security definer, `is_suite_org_admin` check, seat quota check, write to `suite_audit_log`.
- Sync: backfill screening `product_members` into `suite_org_members` with role mapping (idempotent); keep `product_members` updated from Suite changes via trigger so existing screening RLS/edge checks keep working during transition. Legacy `screening_team_members`/`invite_screening_member` RPCs left in place, marked deprecated.
- Audit: trigger on `screening_audit_events` INSERT mirrors into `suite_audit_log` (entity_type 'screening', actor user_id, details); one-off backfill of existing events; `suite_pii_access_log` and `admin_module_audit` entries for the org surfaced in the same view. `suite_audit_log` gets `module` column (default null) if missing.
- UI: SuiteSettings Team tab rebuilt on the new RPCs (module checkboxes per member, pending invites, seat bar, reuse `send-screening-invite-email` renamed copy to "WorldAML Suite"); SuiteAudit shows actor names via profiles, module/type filters, paging beyond 100. `ScreeningTeam.tsx` and `ScreeningModules` page deleted; routes already redirect.
- Verify signed in as a client admin: invite, role change, remove, and the event appears in Audit Trail.
