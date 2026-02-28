
## Plan: Update Coverage Messaging + Build Sanctions Quick Check MVP

### Part 1 — Update "LexisNexis coverage" to "Global Coverage (1,900+ lists)"

Three places reference LexisNexis-specific stats or coverage language that should be generalised to reflect WorldAML's own global coverage:

1. **`src/components/home/StatsSection.tsx`** — change "200+ Jurisdictions Covered" stat to **"1,900+ Global Lists"** with description "Sanctions, watchlists, PEPs and adverse media sources".
2. **`src/components/home/GlobalReachSection.tsx`** — update copy to remove LexisNexis-implied framing; replace with neutral "1,900+ global risk lists across sanctions, PEPs, adverse media and enforcement actions".
3. **`src/data/worldcompliance.ts`** — no change needed (it's a LexisNexis data-source product page and should stay as-is).

---

### Part 2 — Sanctions Quick Check MVP

A new public-facing free tool at **`/sanctions-check`** that lets anyone run a name search against open-source sanctions data (OFAC, EU, UN, HMT, etc.), with a 5-search quota gate and upgrade CTA.

#### Architecture

```text
/sanctions-check                  ← public landing + search form
/sanctions-check/results          ← results page (gated after search #1 shows full)
```

#### Database changes (migration)

New table: **`sanctions_searches`**

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| session_id | text | anonymous session fingerprint (IP+UA hash from edge fn) |
| user_id | uuid | nullable — linked after signup |
| query_name | text | searched name |
| query_country | text | nullable |
| query_type | text | individual / company |
| results_count | int | number of matches found |
| created_at | timestamptz | |

RLS: public `INSERT` allowed (anonymous searches tracked by session), authenticated users can `SELECT` their own rows.

#### Edge function: `sanctions-search`

Fetches open-source sanctions data. For the MVP, it queries against a **static compiled dataset** embedded in the function (OFAC SDN, EU consolidated list, UN consolidated list, HMT — all publicly downloadable XML/JSON). The function:

1. Accepts `{ name, country?, type? }` POST body.
2. Performs fuzzy name matching (Jaro-Winkler similarity ≥ 0.82) against the compiled list.
3. Returns matches with: `{ name, list_source, list_updated, match_score, aliases, nationality, entity_type, designation_date }`.
4. Logs the search to `sanctions_searches` table.
5. Returns remaining free quota for the session.

The open-source lists used: OFAC SDN (~15k entries), EU Consolidated (~2.1k), UN Security Council (~900), HMT (~3.5k). All are available as public JSON/XML and will be compiled into a static JSON bundle in the edge function.

#### Frontend pages

**`src/pages/SanctionsCheck.tsx`** — Landing + search page:
- Headline: "Sanctions Quick Check (Open Source)"
- Disclaimer banner: "Open-source coverage only · May be delayed · Not legal advice"
- Search form: Name (required), Country (optional select), Type: Individual / Company
- On submit: calls edge function, shows results inline
- Search #1: full results visible + CTA banner "Create free account for 5 searches + save results"
- After quota met: upgrade modal

**`src/components/sanctions/SanctionsResultCard.tsx`** — single result card showing:
- Match name, source list, match confidence badge (Exact / High / Possible)
- Aliases, nationality, designation date
- "Last updated" timestamp per source

**`src/components/sanctions/SanctionsSearchForm.tsx`** — reusable search form

**`src/components/sanctions/SanctionsQuotaBanner.tsx`** — shows remaining searches and upgrade CTA

**`src/components/sanctions/SanctionsDisclaimerBanner.tsx`** — prominent disclaimer

#### Quota logic

- Anonymous: tracked by `sessionStorage` key + edge function session fingerprint → 1 free search visible, then gate.
- Authenticated (free tier): 5 searches tracked in `sanctions_searches` per `user_id`.
- Upgrade prompt links to `/pricing` or `/contact-sales`.

#### Route addition

Add `<Route path="/sanctions-check" element={<SanctionsCheck />} />` to `App.tsx`.

#### Navigation

Add "Sanctions Check" as a secondary nav item or within the Platform dropdown in `Header.tsx`, or as a CTA on the home page hero section.

---

### Technical notes

- The edge function will embed a pre-compiled static JSON snapshot of the open-source lists (updated periodically via re-deployment). For the MVP this is acceptable and keeps infrastructure simple — no external API dependency.
- Fuzzy matching uses a pure-JS Jaro-Winkler implementation embedded in the function (no npm deps needed in Deno edge functions).
- Rate limiting: enforced via the session fingerprint in the edge function (max 1 anonymous search per session, 5 for registered users).
- All data sourced from official public government repositories; each result clearly labels its source and last-update date.
