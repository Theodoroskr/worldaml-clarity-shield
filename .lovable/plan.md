# Commercial flow for WorldAML Screening & Monitoring

Today the "AML Screening" links drop people straight into the gated `/screening` workspace. Anyone without a business account just hits a guard. The flow should instead be: **learn about the product → see packages → buy or register → get access details → enter the workspace.**

## Target flow

```text
Header / Business dashboard link
        v
/platform/aml-screening   (public product page: what it does, coverage, proof)
        v
Packages section          (Starter EUR 99, Compliance EUR 495, Enterprise = contact)
        v
   Buy now  ──────────> Stripe Checkout (subscription)
   Enterprise ───────-> /contact-sales (prefilled: WorldAML Screening)
        v
/screening/activate       (post-payment: confirms plan, creates workspace access)
        v
/screening                (workspace, now entitled)
```

Signed-out buyers are asked to register (or sign in) before checkout so the purchase attaches to a real account; signed-in business users skip that step.

## What changes

### 1. Public product page becomes the entry point
- Point every "AML Screening" discovery link (public header Platform menu, business dashboard tile, business catalogue `openUrl`) at `/platform/aml-screening` for users **without** entitlement, and at `/screening` for users **with** it.
- Add a Packages section to `/platform/aml-screening` rendering the three real plans from `businessCatalogue.ts` (single source of truth, no duplicated prices), each with a clear CTA plus a "What you get on day one" access summary.

### 2. Buy / register step
- Starter and Compliance CTAs call the existing `create-worldaml-checkout` function.
- If the visitor is signed out, route through `/signup?next=/platform/aml-screening&intent=worldaml:<plan>` first, then resume checkout automatically after sign-up, so the subscription lands on their account.
- Enterprise CTA goes to `/contact-sales` with the product preselected.

### 3. Entitlement + activation (the missing piece)
There is currently no fulfilment path: `create-worldaml-checkout` opens Stripe, but nothing grants access afterwards. Add:
- A `screening_subscriptions` table (organisation, plan, status, Stripe customer/subscription ids, monitored-entity quota) with RLS and grants.
- A `verify-worldaml-subscription` edge function (service role) that reads the Stripe session, records/updates the subscription, ensures the buyer has an organisation and `suite_org_members` row, and returns the plan details.
- Change checkout `success_url` to `/screening/activate?session_id=...`.

### 4. Access-info page
New `/screening/activate` page which, after verification, shows: plan and quota, workspace link, API key/where to find it, monitoring defaults, invite-your-team link, and a "Go to workspace" button. It also sends the existing-style confirmation email to the buyer and a purchase notification to compliance@infocreditgroup.com.

### 5. Gate the workspace on entitlement, not just portal
- `/screening` keeps the business portal guard but adds an entitlement check: no active screening subscription -> friendly upsell screen with a link back to the packages section (admins and existing Suite/enterprise tiers keep access).

## Technical notes
- Files touched: `src/App.tsx` (routes), `src/pages/PlatformAMLScreening.tsx`, `src/pages/screening/ScreeningWorkspace.tsx`, new `src/pages/screening/ScreeningActivate.tsx`, `src/components/Header.tsx`, `src/pages/business/BusinessDashboard.tsx`, `src/lib/businessCatalogue.ts`, `src/hooks/useAccess.ts` (add `hasScreeningAccess`).
- Backend: one migration (`screening_subscriptions` + RLS + grants), one new edge function (`verify-worldaml-subscription`), updated `create-worldaml-checkout` success URL.
- Pricing stays in `businessCatalogue.ts`; the public page and portal read the same data so public and signed-in pricing remain identical.
