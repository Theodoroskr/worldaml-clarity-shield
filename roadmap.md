# Roadmap

- [x] Wire real quote requests + billing into the business account (quote offer → Stripe checkout → provisioned access)
- [x] Add a link from WorldAML Screening back to WorldAML Business (sidebar tab / button)

## WorldAML Suite modules (plan steps)
- [x] 1. Real screening engine in Suite (mock removed, fail-closed, CI guard test)
- [x] 2. One Suite access rule (useAccess = usePortalAccess)
- [x] 3. Screening module added + backfilled (41 companies) + auto-sync from purchases
- [~] 4. Settings > Modules for client Suite admins (done); sidebar/route gating by module, move /screening into Suite, WorldAML admin module panel — next
- [ ] 5. One team, one audit trail
- [ ] 6. Free trial "Start free trial" click
- [ ] 7. One match-review queue
- [ ] 8. Automatic screening in client workflow
- [ ] 9. Branded onboarding forms + personal URLs
- [ ] 10. Rename to "WorldAML Suite" (confirm spelling) + tidy

## Suite security (plan 2026-10-03)
- [x] Live Suite audit + go-live badge (Admin → Security), append-only audit trails, anon locked out of Suite tables, 30-min idle sign-out
- [x] Two-company separation test run (client user saw 0 rows of other companies on all 54 tables)
- [ ] Extra encryption for ID/passport, DOB, tax, bank fields + masking
- [ ] Two-step sign-in: required for WorldAML admins (3 without), optional per-company requirement
- [x] Nightly audit (02:00 UTC) + admin email when badge turns red
- [ ] Shared company check in every Suite server function
