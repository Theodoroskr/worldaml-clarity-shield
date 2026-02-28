
## End-to-End Funnel Test Plan

This is a walkthrough test of all 6 funnel improvements against the live preview, covering every state from anonymous visitor through quota exhaustion.

### What exists (verified by code review)

All 6 improvements are in the codebase. Here is what each one does and how to verify it manually:

---

### Step 1 — Anonymous user runs 1 search on /sanctions-check

**URL:** `/sanctions-check`

**What to do:** Visit the page without being logged in. Enter a known sanctions name such as "Wagner Group" and submit.

**What to verify:**
- The search runs and returns result cards.
- The first 2 results are visible in full.
- Remaining results are shown as faded/locked cards.
- A registration gate overlay appears beneath the locked results showing:
  - "X more results hidden"
  - "Join 500+ compliance teams already using WorldAML"
  - A checklist: View all matches / 5 free searches / Save & export / Upgrade anytime
  - "Create Free Account" and "Log in" buttons

**What to verify if they try a second search:**
- The search form is disabled (greyed out, pointer-events-none)
- A full-page gate block appears: "Create a free account to continue" with the same checklist and CTA buttons
- The form area is visually locked

**Potential issue found in code:** The `isGated` state triggers after `anonSearchCount >= 1`, and this is stored in `sessionStorage`. If a user clears their session or opens a new tab, the gate resets. This is expected behaviour (not a bug).

---

### Step 2 — Sign up and land on the dashboard

**URL:** `/signup` → `/dashboard`

**What to do:** Click "Create Free Account" from the gate overlay. Complete the signup form.

**What to verify after signup:**
- User is redirected to `/dashboard` (or `/pending-approval` if the approval gate is active).
- The "Quick Tools" section is visible at the bottom of the dashboard with the **Sanctions Quick Check** widget.
- No remaining-searches badge is shown yet (it only appears after the first search returns a `remaining` count from the API).

---

### Step 3 — Exhaust 5 searches on the dashboard widget

**What to do:** Run 5 searches in the dashboard sanctions widget (e.g. "Wagner Group", "Al-Qaeda", "Sberbank", "Iran", "Putin").

**What to verify after each search:**

| Search # | `remaining` returned | Badge colour & text |
|---|---|---|
| 1st | 4 | Teal — "4 searches remaining" |
| 2nd | 3 | Teal — "3 searches remaining" |
| 3rd | 2 | Amber — "Only 2 left" |
| 4th | 1 | Orange — "Last free search" |
| 5th | 0 | Red lock icon — "Quota reached" |

**After the 5th search (`remaining === 0`):**
- The search form disappears and is replaced by the **quota-exhausted upgrade panel** showing:
  - Lock icon + "You've used all 5 free searches"
  - Feature comparison table: Searches (5 total → Unlimited), Lists (4 open-source → 1,900+), Monitoring (Manual → Real-time alerts)
  - "Talk to Sales" (primary) and "View Plans" (outline) buttons
- The header badge switches to a red "Quota reached" pill

**Potential issue found in code:** The widget only shows the quota-exhausted panel when `remaining === 0`. The `remaining` state starts as `null` (not `0`), so the upgrade panel only appears *after* the 5th search completes and the API returns `remaining: 0`. The form is NOT blocked if the user refreshes the page — the `remaining` state resets to `null` on remount, showing the form again (but the next search will return `quota_exceeded` error from the edge function). This is a **gap worth fixing**: the widget should initialise `remaining` by calling the edge function on mount to fetch the user's current quota.

---

### Step 4 — "No matches" cross-sell state

**What to do:** Search for a name unlikely to be on a sanctions list (e.g. "John Smith Apple Bakery").

**What to verify when results are empty:**
- Green "Clear on 4 open-source lists" confirmation box appears.
- Immediately below: a navy cross-sell callout with header "Catch what open-source misses" and chips for "PEPs & relatives", "Adverse media", "1,900+ risk lists", "Real-time alerts".
- A "See what you're missing →" button links to `/contact-sales?from=sanctions`.

This works on both the full `/sanctions-check` page and the dashboard widget.

---

### Step 5 — Search history panel updates

**What to do:** After running any searches on the dashboard, scroll to the **Recent Searches** panel below the widget.

**What to verify:**
- The last 5 searches are listed with query name, timestamp, and result count.
- Searches with 0 results show a green "Clear" badge.
- Searches with matches show a red "X matches" badge.
- The panel updates immediately after each new search (the `onSearchComplete` callback triggers `historyRef.current?.refresh()`).
- Below the history rows: the WorldAML upgrade nudge strip showing "Unlimited searches · Real-time alerts · Audit trail" and an "Explore plans →" link.

---

### Step 6 — Pricing page contextual banner

**What to do:** From the quota-exhausted panel, click "View Plans". This navigates to `/pricing?from=sanctions`.

**What to verify:**
- A teal banner appears at the top of the pricing page (above the main content) saying:
  > "You've been using the free Sanctions Quick Check. Upgrade to WorldAML for unlimited searches across 1,900+ lists with real-time monitoring."
- The banner only appears when `?from=sanctions` is in the URL. Visiting `/pricing` directly shows no banner.

The `fromSanctions` variable is derived from `useSearchParams()` and the banner is conditionally rendered at line 239 of `Pricing.tsx`.

---

### Known gaps identified during review

1. **Dashboard widget quota not persisted across page refresh** — `remaining` resets to `null` on remount, so the quota-exhausted panel disappears after a page reload even if the user has 0 searches left. The next search attempt will fail with an API error rather than showing the upgrade panel gracefully. **Fix:** fetch the user's current `remaining` count from the edge function (or from `sanctions_searches` table) on widget mount.

2. **No "No matches" cross-sell in the dashboard widget** — The dashboard widget's empty-results state only shows "No matches for X on 4 open-source lists" in a simple green bar, without the richer "Catch what open-source misses" callout that exists on the standalone `/sanctions-check` page. This is inconsistent — the same cross-sell value message should appear in both places.

---

### Files involved

| File | Role |
|---|---|
| `src/pages/SanctionsCheck.tsx` | Anon gate overlay, gated search lock, progressive urgency bar, no-matches cross-sell |
| `src/components/sanctions/DashboardSanctionsWidget.tsx` | Progressive urgency badge, quota-exhausted upgrade panel |
| `src/components/sanctions/SearchHistoryPanel.tsx` | History rows + WorldAML upgrade nudge |
| `src/pages/Pricing.tsx` | `?from=sanctions` contextual banner |

---

### Recommended fixes to implement

Based on the code review, two improvements are worth making alongside this test:

1. **Fix the widget quota persistence** — On mount, fetch `remaining` from the DB so the upgrade panel survives page refreshes.
2. **Add the "Catch what open-source misses" cross-sell to the dashboard widget's no-results state** — mirrors the richer callout already on the standalone page.

Would you like me to implement both of these fixes?
