
## Funnel Improvements: Free Search → Subscription

### Current Funnel Audit

The existing flow has several conversion gaps:

**Anonymous user path:**
1. Visits `/sanctions-check` → runs 1 free search → gets gated (locked overlay + signup CTA)
2. Signs up → lands on `/dashboard` → can run 5 more searches
3. After 5 searches → sees "Upgrade for unlimited" button → goes to `/contact-sales` or `/pricing`

**Friction points identified:**
- After signing up and exhausting 5 searches on the dashboard, the upgrade CTA is a small text link — easy to miss
- The "No matches found" state has a weak upsell ("For comprehensive screening across 1,900+ lists") with no urgency or value framing
- The remaining-search counter counts down silently — no progressive urgency as the user approaches 0
- After exhausting quota on the dashboard widget, the form just shows an error — no inline upsell moment
- Search history rows are passive — they don't invite re-engagement or upsell
- The `/pricing` page has no direct reference to the free-tier experience the user just had
- No post-signup onboarding moment that shows the user what they get with a paid plan vs. the free tier

---

### Proposed Improvements (6 targeted changes)

---

#### 1. Progressive urgency on the remaining-searches counter

**Where:** Dashboard widget header badge + SanctionsCheck status bar

**Change:** The remaining-search pill changes color and messaging as the count drops:
- 5–3: teal (current) — "X searches remaining"
- 2: amber — "Only 2 searches left"
- 1: orange — "Last free search"
- 0: red with a lock icon + inline "Upgrade" button replacing the badge

This is a pure UI change — no backend needed. Implemented in `DashboardSanctionsWidget.tsx` and `SanctionsCheck.tsx`.

---

#### 2. Quota-exhausted inline upgrade panel in the dashboard widget

**Where:** `DashboardSanctionsWidget.tsx`

**Change:** When `remaining === 0`, instead of just disabling the form, replace the search form area with a high-contrast upgrade panel showing:
- "You've used all 5 free searches"
- 3 bullet feature comparisons: Free vs. WorldAML (e.g. "5 searches" → "Unlimited", "4 lists" → "1,900+ lists", "Manual only" → "Real-time monitoring + alerts")
- Two CTA buttons: **"Talk to Sales"** (primary) and **"View Plans"** (outline)

---

#### 3. Smarter "No matches" state — cross-sell value

**Where:** `SanctionsCheck.tsx` and `DashboardSanctionsWidget.tsx`

**Change:** The current "No matches on open-source lists" message is a weak reassurance. Replace it with a value-add callout:
> "Clear on 4 open-source lists. WorldAML screens 1,900+ global risk lists including PEPs, adverse media, and proprietary watchlists — catch what open-source misses."

Add a small icon grid (4 open-source lists = free, 1,900+ lists = paid) and a "See what you're missing →" CTA linking to `/platform/api` or `/contact-sales?product=worldaml`.

---

#### 4. Post-search upgrade nudge in the search history panel

**Where:** `SearchHistoryPanel.tsx`

**Change:** Below the 5 search history rows, add a subtle "What's included in WorldAML" teaser row with 3 chips: "Unlimited searches · Real-time alerts · Audit trail" and a "Explore plans →" link. Only shown when history has at least 1 entry (the user has engaged).

---

#### 5. Smarter gating copy for the anonymous lock wall

**Where:** `SanctionsCheck.tsx` (the registration gate overlay shown after 1 anon search)

**Change:** The current copy says "Create a free account to view all matches, save results, and run 5 free searches." Add urgency framing and social proof:
- "Join 500+ compliance teams already using WorldAML"
- Feature checklist: ✓ View all matches ✓ 5 free searches ✓ Save & export results ✓ Upgrade anytime

This improves the free-to-registered conversion before we even need to sell the paid plan.

---

#### 6. "You've been upgraded" moment on the pricing page (contextual referral)

**Where:** `/pricing` page — add a `?from=sanctions` URL param handler

**Change:** When a user arrives at `/pricing?from=sanctions`, show a small highlight banner at the top:
> "You've been using the free Sanctions Quick Check. Upgrade to WorldAML for unlimited searches across 1,900+ lists with real-time monitoring."

This closes the loop between the experience they just had and the product they're being asked to buy. Implemented purely in `Pricing.tsx` using `useSearchParams`.

---

### Files to Change

| File | Change |
|---|---|
| `src/components/sanctions/DashboardSanctionsWidget.tsx` | Progressive urgency counter, quota-exhausted upgrade panel |
| `src/pages/SanctionsCheck.tsx` | Progressive urgency counter, smarter "No matches" state, improved anon gate copy |
| `src/components/sanctions/SearchHistoryPanel.tsx` | Post-history upgrade nudge strip |
| `src/pages/Pricing.tsx` | `?from=sanctions` contextual banner |

### No database changes needed
All improvements are frontend-only — the `sanctions_searches` table and edge function remain unchanged.
