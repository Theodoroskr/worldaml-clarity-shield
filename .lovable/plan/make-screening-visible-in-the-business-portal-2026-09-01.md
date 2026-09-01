# Make Screening visible in the Business portal

## What's wrong today (confirmed in the data)

Screening access is granted through `product_members` (+ `screening_subscriptions`), but the Business portal only reads `product_access` and `screening_subscriptions` for the linked organisation. Current rows:

- Four screening users exist in `product_members` (Infocredit, thecorpro, an external user) — none of their organisations has a `product_access` row for `screening`; the only `product_access` rows are `suite`.
- Two of the four business accounts (`QA Test Ltd`, `QA Bridge Ltd`) have no `organisation_id` at all, so they can never resolve any product.

Result: a client who genuinely has Screening logs in, lands on "WorldAML Business", and sees no products — while Compliance Suite (not yet launched) is the only thing the portal thinks they own.

## What we'll do

### 1. Screening shows up as an owned product
Treat `product_members` as a third entitlement source. The portal will consider a company to own Screening when any of these is true for its organisation: an active `product_access` row, an active `screening_subscriptions` row, or a `product_members` row for the `screening` product. Screening then appears in "My Products" and on the dashboard with an **Open Screening** button pointing at `/screening`, plus plan/quota details when a subscription exists.

### 2. Link business accounts that have no organisation
Backfill `business_accounts.organisation_id` from `product_members` (and `suite_org_members`) for any account still unlinked, and resolve the organisation on the fly at read time when the column is still empty, so a newly provisioned customer isn't stuck with an empty portal until a backfill runs.

### 3. Hide Compliance Suite until it ships
Remove the `suite` solution from the business catalogue: no Suite card on the dashboard, no Suite entry in Solutions, no Suite plans or checkout, and no Suite recommendation copy. Existing Suite entitlements are ignored by the portal for now (the public `/platform/suite` marketing page and the internal `/suite/*` workspace are untouched). Because the only current `product_access` rows are `suite`, this also stops the portal showing a product the customer can't buy.

### 4. Route login by what the customer owns
After sign-in, resolve the customer's products once:
- exactly one product → go straight to it (Screening → `/screening`, Academy → `/dashboard`)
- more than one, or none → `/business/dashboard`

Admins and partners keep their existing routing.

## Technical notes

- `src/lib/business/entitlements.ts` — extend `mapEntitlements` to accept `product_members` rows and synthesise a `worldaml` entitlement when no `product_access` row covers screening; keep it a pure function and extend `entitlements.test.ts` with cases for members-only, subscription-only, and all-three-sources.
- `src/hooks/useBusinessWorkspace.ts` — add a `product_members` query for the org; fall back to resolving `orgId` from `product_members`/`suite_org_members` when `account.organisation_id` is null.
- `src/lib/businessCatalogue.ts` — drop the `suite` entry, its `pairsWith` references and `CROSS_SELL_COPY.suite`; remove the Suite card from `BusinessDashboard.tsx`.
- `src/pages/Login.tsx` — replace the current business/partner branch with a product-count based redirect.
- Migration: backfill `business_accounts.organisation_id` from `product_members` where null. No new tables, no policy changes — confirm the signed-in user can read their own `product_members` rows under existing RLS and adjust only if that read is blocked.
- Verify with Playwright against `http://localhost:8080` signed in as a screening customer: Screening card present, Open button reaches `/screening`, no Suite anywhere.
