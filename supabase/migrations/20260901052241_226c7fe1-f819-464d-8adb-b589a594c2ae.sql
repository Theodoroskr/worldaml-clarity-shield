
-- =====================  PEP SCREENING & EDD  =====================
UPDATE public.academy_modules SET title = 'Lesson 1 — Who is a PEP? Categories, RCAs and the legal basis', content = $md$
### The legal basis

PEP obligations flow from **FATF Recommendation 12** (foreign PEPs) and **Recommendation 22** (DNFBPs), implemented regionally through the **EU AML Directives / AMLR**, the **UK MLR 2017 reg.35**, the **US Bank Secrecy Act** (senior foreign political figures) and equivalents in APAC and the GCC.

A **Politically Exposed Person** is an individual entrusted with a **prominent public function**. The definition is about *function*, not about wrongdoing. PEP status is a **risk indicator, never an allegation**.

### The four populations you must be able to identify

| Category | Who it covers | Baseline treatment |
|---|---|---|
| **Foreign PEP** | Prominent public function in another country | Always high risk; EDD mandatory (FATF R.12) |
| **Domestic PEP** | Prominent public function in the firm's own country | Risk-based; EDD if higher risk identified |
| **International organisation PEP** | Senior management of UN, IMF, World Bank, NATO, EU institutions | Risk-based, generally treated as domestic-equivalent |
| **RCA** | Relatives and close associates of any of the above | Same treatment as the linked PEP |

### What counts as a "prominent public function"

Heads of state and government; ministers and deputy ministers; members of parliament or equivalent legislatures; members of supreme, constitutional or other high-level courts whose decisions are not generally appealable; members of courts of auditors and central bank boards; ambassadors, chargés d'affaires and high-ranking armed-forces officers; members of the administrative, management or supervisory bodies of **state-owned enterprises**; and senior officials of political parties.

**Explicitly excluded:** middle-ranking or junior officials. A district council planning officer is not a PEP — though they may still be a bribery-risk customer under your general risk assessment.

### RCAs — where most firms fail

Regulators consistently find RCA identification weaker than PEP identification. Your policy must define, at minimum:

- **Family:** spouse or partner recognised as equivalent, children and their spouses/partners, parents. Many firms extend to siblings — state your position.
- **Close associates:** persons known to hold joint beneficial ownership of a legal entity or arrangement with the PEP; persons with sole beneficial ownership of an entity **set up for the benefit of** the PEP; anyone with close business relations otherwise publicly known.

### Case study — the RCA you would have missed

A private bank onboards *Marta L.*, a 29-year-old with a €4.1m portfolio. Screening returns **no PEP hit**. During source-of-wealth review the analyst notes the funds came from the sale of a 30% stake in a logistics company. The company registry shows the other 70% shareholder is the **son of a serving transport minister**, and the two hold that company jointly.

Marta is an RCA by virtue of **joint beneficial ownership with a PEP's family member**. No screening tool would have flagged her on name alone. The control that caught it was **structured source-of-wealth analysis feeding back into screening** — not the screening list.

**Takeaway:** treat SoW findings as a screening trigger, not a downstream formality.
$md$ WHERE id = 'c2945c08-5bc9-4494-9a34-4d074c4fc603';

UPDATE public.academy_modules SET title = 'Lesson 2 — Screening mechanics: thresholds, false positives and data quality', content = $md$
### What a PEP screening engine actually does

Screening compares your customer record against a **PEP database** built from official gazettes, parliamentary registers, state-owned-enterprise filings and media. Three variables drive every result:

1. **Matching algorithm** — usually a string-similarity score (Jaro-Winkler, Levenshtein, token-sort) rather than exact equality.
2. **Fuzziness threshold** — how loose a match is allowed through. Lower = stricter (typos only). Higher = broader (reordered names, transliterations).
3. **Secondary identifiers** — date of birth, nationality, country of residence, gender, entity type. These are what turn a name match into a *decision*.

### The threshold trade-off

| Threshold | Effect | Typical use |
|---|---|---|
| 0.90+ | Near-exact only | Low-risk retail, high-volume batch |
| 0.75–0.85 | Balanced | Standard onboarding |
| 0.50–0.70 | Broad — catches transliteration and name reordering | High-risk customers, EDD, correspondent banking |

A firm that runs everything at 0.90 will produce a clean-looking alert queue and **miss transliterated names** (Aleksandr / Alexander / Oleksandr). A firm at 0.50 across the whole book will drown. Thresholds must be **documented, risk-tiered and tested** — regulators ask for the calibration rationale.

### Why false positives dominate

- **Common names** — "Mohammed Ali", "Kim Min-jun", "Maria Silva" appear thousands of times in any PEP dataset.
- **Transliteration variance** — Arabic, Cyrillic, Chinese and Thai names have multiple valid Latin renderings.
- **Name order** — Hungarian, Chinese, and many South-East Asian conventions put the family name first.
- **Patronymics and particles** — "bin", "ibn", "van der", "de la" are inconsistently indexed.

### Disposition discipline

Every alert needs a recorded outcome from a fixed vocabulary — typically **True match / Potential match — escalate / False positive — discounted**. Each discount must record **which identifier ruled it out** (DOB mismatch, nationality mismatch, deceased, wrong entity type). "Not our customer" with no reason is the single most common audit finding.

### Case study — the 0.92 threshold that hid a sanctioned PEP

A payments firm screened at a fixed 0.92. A customer registered as **"Viktar Kazlou"** cleared. The PEP/sanctions record held the Russian-derived transliteration **"Viktor Kozlov"** — similarity 0.87, below the cut-off. The match surfaced ten months later through an adverse-media alert, after €2.3m had moved.

Root causes: a single global threshold with no risk tiering, no transliteration normalisation, and no secondary screening on **DOB + nationality** which would have produced an exact hit on both.

**Takeaway:** tune by risk tier, normalise transliterations, and always screen on identifiers as well as names.
$md$ WHERE id = '9de10fed-171a-482b-b7e7-b45315b86d57';

INSERT INTO public.academy_modules (course_id, title, content, sort_order) VALUES
((SELECT id FROM public.academy_courses WHERE slug='pep-screening-edd'), 'Lesson 3 — Enhanced Due Diligence: the five mandatory measures', $md$
### The EDD package for a PEP relationship

Where a PEP (or RCA) is identified, FATF R.12 and its national implementations require, **in addition** to standard CDD:

**1. Senior management approval** — for establishing *and continuing* the relationship. "Senior management" means someone with authority to decline the business and no commercial conflict; the relationship manager cannot approve their own client. Record **who approved, when, and on what information**.

**2. Source of wealth (SoW)** — how the person's **overall net worth** was accumulated. Narrative plus evidence: employment history and declared salary, business sale agreements, inheritance documents, property disposals, dividend records, published asset declarations.

**3. Source of funds (SoF)** — where the **specific money in this relationship** came from. Distinct from SoW: a legitimate wealthy PEP can still be moving one tranche of corrupt funds.

**4. Enhanced ongoing monitoring** — tighter transaction thresholds, shorter review cycles (typically 12 months for high-risk PEPs vs 3 years for standard), and event-driven review triggers.

**5. Adverse media and reputational screening** — corruption, bribery, procurement fraud, asset-recovery proceedings, and investigative-journalism reporting (OCCRP, ICIJ, national outlets).

### Making SoW/SoF defensible

A defensible SoW file answers three questions in writing:

1. **Plausibility** — is the declared wealth consistent with the known income history? A minister on a US$45,000 salary with a US$12m portfolio requires an explanation that is documented, not assumed.
2. **Corroboration** — is each material component supported by an **independent** document (contract, registry extract, audited accounts, tax filing), not just the customer's statement?
3. **Coverage** — do the documented components account for the bulk of the wealth, or only a convenient slice?

### Case study — the plausible-looking file that failed audit

A wealth manager onboarded a deputy minister's spouse with US$8.5m. The SoW file recorded: "*Family business income and property sales in the client's home country.*" Attached: one property sale contract for US$310,000 and a company brochure.

Internal audit rated the file **non-compliant** — not because the customer was proven corrupt, but because **97% of the wealth was undocumented**, no independent corroboration existed, and senior-management approval had been given by the relationship manager's direct line manager, who was also credited with the revenue.

Remediation: full SoW re-papering, approval re-taken at committee level, and relationship exited when the client declined to evidence the remaining balance.

**Takeaway:** EDD is judged on documentation coverage and approval independence, not on whether the customer *seems* legitimate.
$md$, 3),

((SELECT id FROM public.academy_courses WHERE slug='pep-screening-edd'), 'Lesson 4 — Ongoing monitoring, de-PEPing and periodic review', $md$
### PEP status is dynamic

Three things change constantly: **the customer's role**, **their risk profile**, and **the data about them**. Your monitoring must cover all three.

**Continuous screening** — re-screen the whole customer base against the refreshed PEP dataset (daily or at minimum weekly for high-risk portfolios). Point-in-time screening at onboarding only is no longer accepted practice.

**Trigger events** — force an out-of-cycle review on: election or appointment to public office, a new UBO or director, a change of country of residence, a materially unusual transaction, an adverse-media hit, or a family relationship coming to light.

**Transaction monitoring calibration** — PEP relationships warrant lower thresholds and specific scenarios: incoming government or state-owned-enterprise payments, large round-sum transfers, third-party payments from consultancy vehicles, and rapid flows to jurisdictions with weak asset-recovery cooperation.

### De-PEPing — the cooling-off decision

When a PEP leaves office, risk does **not** end on the last day. FATF and most national regimes require a **risk-based** continuation of EDD, with a commonly applied floor of **12 months** (many firms and several regulators use 18–24 months, and some never de-PEP former heads of state or ministers of high-corruption jurisdictions).

Assess at minimum:
- **Seniority and influence retained** — a former finance minister who chairs a state fund is still exposed.
- **Corruption risk of the jurisdiction** (CPI, FATF listing, Basel AML Index).
- **Any adverse media, investigation or asset-recovery action**, open or historic.
- **Nature of the relationship** — a simple current account differs from an offshore structure holding US$40m.

De-PEPing must be a **documented, approved decision**, not an automatic timer in the system. The most dangerous configuration in any platform is an auto-declassification rule that quietly downgrades customers 12 months after an office end-date pulled from a data feed.

### Case study — the automatic de-PEP that cost a licence condition

A mid-sized EMI configured its system to auto-downgrade former PEPs 12 months after the recorded end of office. A former state-energy-company chairman was downgraded on schedule; monitoring thresholds tripled and periodic review moved from annual to three-yearly.

Eight months later, an international investigation named him in a procurement-kickback case covering the period of his chairmanship. The firm had processed €6.8m in the interim with no enhanced scrutiny.

The regulator's criticism was narrow and damning: the firm had **no record of any human risk assessment** at the point of declassification, and the auto-rule was not covered by any board-approved policy.

**Takeaway:** automation may *propose* de-PEPing; a documented human decision must dispose of it.
$md$, 4),

((SELECT id FROM public.academy_courses WHERE slug='pep-screening-edd'), 'Lesson 5 — Governance: approval workflows, four-eyes and records', $md$
### Who decides what

A workable PEP governance model separates three roles:

| Role | Owns | Cannot also |
|---|---|---|
| **Analyst / first line** | Alert disposition, SoW collection, file preparation | Approve the relationship |
| **Compliance reviewer (second line)** | Challenge, quality assurance, escalation | Own the revenue |
| **Senior management / PEP committee** | Approve onboarding and continuation, approve exits | Delegate approval back to the RM |

### Four-eyes in practice

Every **true PEP match** and every **discounted high-similarity match** should carry two names: the analyst who assessed it and the reviewer who agreed. Four-eyes is not bureaucracy — it is the only control that catches the analyst who discounts an inconvenient hit under onboarding-time pressure.

Practical rules that survive audit:
- The reviewer must be **able to disagree** — measured by a non-zero overturn rate. A queue with 100% agreement is evidence the control is cosmetic.
- Escalation to committee is mandatory for foreign PEPs, any PEP from a high-risk third country, and any relationship over an agreed value.
- Approvals expire. Continuation approval is re-taken at each periodic review.

### Records — what "adequate" means

Retain for the statutory period (commonly five years from relationship end):

- The **screening evidence itself** — the search parameters, threshold used, dataset version and timestamp, and the full result set, not just the conclusion.
- The **disposition rationale** per alert, naming the discriminating identifier.
- The **SoW/SoF narrative and supporting documents**.
- The **approval record** — approver identity, role, date, and the pack they saw.
- The **review history** and every trigger-event assessment.

If your system cannot reproduce "*what did we see on the day we approved this?*", your records are not adequate — regardless of how good the decision was.

### Case study — the file that was right but indefensible

A firm exited a PEP relationship correctly and filed a well-drafted SAR. Two years later the regulator sampled the file. The screening tool had been replaced; the old alert history had not been migrated, only a PDF summary reading "*PEP — reviewed, approved by Compliance*".

The firm could not show the dataset version, the threshold, the matches discounted, or who approved. The outcome had been right; the audit trail could not prove the process was. The finding stood.

**Takeaway:** migrate screening evidence, not just conclusions, whenever you change vendor or platform.
$md$, 5),

((SELECT id FROM public.academy_courses WHERE slug='pep-screening-edd'), 'Lesson 6 — Full worked case: onboarding a foreign PEP', $md$
### The scenario

**Customer:** Dr Adaeze N., 54, applying to open a private-banking relationship with an initial deposit of **US$3.2m**.
**Declared occupation:** consultant and non-executive director.
**Nationality/residence:** West African country, CPI score 26; resident in the UK for four years.
**Structure:** funds to be held via a BVI company, *Harbourline Consulting Ltd*, of which she is sole shareholder.

### Step 1 — Screening

Screened at 0.75 across PEP, sanctions and adverse-media datasets, with DOB and nationality as secondary identifiers.

- **Hit 1 (0.91):** "Adaeze N." — Special Adviser to the Minister of Petroleum Resources, 2016–2021. DOB matches. → **True match, former domestic-in-country PEP, foreign PEP to us.**
- **Hit 2 (0.78):** "A. Nwosu" — municipal councillor, different country, DOB 1971 vs 1972, no nationality overlap. → **Discounted: DOB and nationality mismatch.**
- **Adverse media:** two 2022 articles referencing a parliamentary committee review of petroleum-ministry advisory contracts. She is named as a contract counterparty, **not** as a subject of investigation.

### Step 2 — Classification

Foreign PEP, left office 2021 — inside any reasonable cooling-off window, from a high-corruption jurisdiction, with sector-specific adverse media. **High risk. EDD mandatory. No de-PEPing consideration.**

### Step 3 — Source of wealth

| Component | Declared | Evidence obtained | Verdict |
|---|---|---|---|
| Advisory fees 2016–2021 | US$0.6m | Contracts + bank statements + tax filings | Corroborated |
| Sale of family property | US$0.4m | Sale deed + registry extract | Corroborated |
| Consultancy earnings 2021–2026 | US$1.9m | Three invoices, one client, offshore payer | **Weak — single counterparty, no contracts** |
| Investment returns | US$0.3m | Broker statements | Corroborated |

The US$1.9m component — 59% of the wealth — rests on an offshore payer with no underlying contract. **This is the whole case.**

### Step 4 — The decision

Analyst recommendation: **do not onboard on current evidence**; request underlying consultancy agreements, identify the ultimate payer, and screen that entity and its owners. If the payer is a petroleum-sector contractor that held ministry contracts during her tenure, the relationship presents a **live bribery/kickback risk** and should be declined.

Committee outcome: conditional approval **refused pending** the additional evidence; a 30-day deadline set; no funds accepted in the interim.

### Step 5 — What good looks like on file

Screening parameters and full result set; disposition reasons for both hits; the SoW table above with each document referenced; the adverse-media assessment distinguishing *named* from *implicated*; the committee minute; and the diarised follow-up.

**The lesson of the case:** the PEP flag was easy. The risk lived in the **unevidenced 59%** — and only a structured SoW method surfaced it.
$md$, 6),

((SELECT id FROM public.academy_courses WHERE slug='pep-screening-edd'), 'Lesson 7 — Common failures, regulator expectations and your checklist', $md$
### The eight failures regulators keep finding

1. **No RCA methodology** — PEPs identified, relatives and associates not.
2. **Single global fuzziness threshold**, uncalibrated and untested.
3. **Bulk discounting** of alerts with no recorded discriminating identifier.
4. **SoW narratives without documents**, or documents covering a minority of wealth.
5. **Approval by conflicted staff** — the revenue owner approving their own PEP.
6. **Point-in-time screening only**, with no continuous re-screening against refreshed data.
7. **Automatic de-PEPing** with no human assessment.
8. **Screening evidence not retained** — conclusions kept, underlying results lost.

### What examiners ask for

Expect to be asked to produce, for a named customer, within a working day: the screening record with dataset version and threshold; every alert and its disposition; the SoW/SoF pack; the approval; the last three periodic reviews; and the transaction-monitoring rules applied to that relationship. Firms fail this exercise on **retrieval**, not on judgement, more often than they expect.

### Your operational checklist

**At onboarding**
- Screen name **and** identifiers (DOB, nationality, country of residence) at the risk-appropriate threshold
- Classify: foreign / domestic / international organisation / RCA
- Record disposition and discriminating identifier for every alert
- Build SoW with component-level evidence coverage
- Separate SoF for the initial funding
- Obtain independent senior-management approval before funds are accepted

**Ongoing**
- Continuous re-screening against refreshed datasets
- Trigger-event reviews (office change, UBO change, adverse media, unusual activity)
- Periodic review at 12 months for high-risk PEPs, with approval re-taken
- Enhanced transaction-monitoring scenarios calibrated to PEP typologies

**On exit or declassification**
- Documented human de-PEPing assessment covering seniority, jurisdiction, media and relationship value
- Committee approval of any downgrade
- Retain the full evidence set for the statutory period

### Three principles to carry away

1. **PEP status is a risk indicator, not a verdict** — de-risking whole categories is a supervisory concern in its own right (FATF has repeatedly warned against blanket PEP de-risking).
2. **The screening tool finds names; your process finds risk.** Almost every real case in this course was caught by source-of-wealth analysis, not by a list hit.
3. **If it is not retrievable, it did not happen.** Evidence retention is the difference between a good decision and a defensible one.
$md$, 7);

UPDATE public.academy_courses SET duration_minutes = 20, cpd_hours = 0.5, estimated_words = 3050 WHERE slug = 'pep-screening-edd';


-- =====================  ADVERSE MEDIA INTELLIGENCE  =====================
UPDATE public.academy_modules SET title = 'Lesson 1 — What adverse media is, and why regulators expect it', content = $md$
### Definition

**Adverse media** (negative news) screening is the systematic search of open-source information for reports that a customer, UBO, director or counterparty has been **linked to financial crime, predicate offences, or reputationally serious conduct**.

It is the only AML control that surfaces risk **before** it becomes a list entry. Sanctions and PEP lists are lagging indicators — someone appears on them after an official act. Media reporting typically precedes indictment by months or years, and a large share of financial criminals are **never** listed at all.

### Where the obligation comes from

FATF **Recommendation 10** requires CDD to be based on "*information from reliable, independent sources*"; **Recommendation 12** requires EDD on PEPs including reputational assessment. National rules make it explicit — the **EU AMLD/AMLR** require assessment of adverse information for high-risk relationships, the UK **JMLSG Guidance** (Part I, 5.5) expects negative-news checks in EDD, and US regulators examine negative-news processes under the **CDD Rule**.

In practice, no supervisor accepts "*we only screen lists*" for a high-risk customer.

### The categories that matter

| Category | Examples |
|---|---|
| **Financial crime** | Money laundering, fraud, embezzlement, tax evasion, market abuse |
| **Corruption** | Bribery, kickbacks, procurement fraud, illicit enrichment |
| **Predicate offences** | Drug trafficking, human trafficking, arms trafficking, environmental crime, cybercrime |
| **Regulatory** | Enforcement actions, licence revocations, debarments, censures |
| **Terrorism / proliferation** | TF financing links, dual-use export breaches |
| **Reputational** | Organised-crime association, labour abuses, serious ESG breaches |

Not everything negative is *adverse media for AML purposes*. A defamation suit, a divorce, or a commercial contract dispute is usually noise. **Define your in-scope categories in policy** — otherwise analysts apply their own, inconsistently.

### Structured vs unstructured sources

- **Structured** — curated, entity-resolved risk databases (the same vendors that supply PEP and sanctions data). Consistent, deduplicated, tagged by category and date; but they lag, and coverage of local-language regional press is uneven.
- **Unstructured** — the open web, news APIs, court and regulatory registers, insolvency and debarment lists, investigative outlets (OCCRP, ICIJ, Bellingcat), and local-language press. Broadest coverage; enormous noise; hard to reproduce.

Mature programmes use **structured screening as the baseline for the whole book**, and **unstructured search as an EDD step** for high-risk customers.

### Case study — the customer no list would have caught

A commercial bank onboarded a scrap-metal exporter with clean sanctions, PEP and register checks. Eighteen months later the firm was raided in a VAT-carousel and waste-trafficking investigation.

A retrospective review found **four local-language news items published before onboarding** describing regulatory seizures at the company's yard and an environmental prosecution of its director. The bank's provider held none of them; its coverage of that country's regional press began two years later.

**Takeaway:** structured data defines your floor, not your ceiling. Know your provider's language and geographic coverage — and supplement it where your customer base sits.
$md$ WHERE id = 'd8eb9fb4-3e2f-4934-93c6-5c487e79f573';

UPDATE public.academy_modules SET title = 'Lesson 2 — Triage: relevance, recency, severity, reliability', content = $md$
### The triage problem

A single common name can return hundreds of articles. Triage is the disciplined reduction of that volume to **decisions**. Four tests, applied in order.

### 1. Relevance — is it the same person?

Match on **corroborating identifiers**, never on name alone: date or year of birth, nationality, city, employer, role, company registration number, known associates, photograph.

Three outcomes only:
- **Confirmed same entity** — two or more independent identifiers align.
- **Cannot confirm / cannot exclude** — escalate; do not silently discount.
- **Different entity** — record which identifier excluded it.

### 2. Recency — how old is the conduct?

Age the article by the **date of the alleged conduct**, not the date of publication. A 2026 retrospective about a 1998 conviction is old conduct, freshly reported.

| Age of conduct | Typical weight |
|---|---|
| < 2 years | High |
| 2–5 years | Medium |
| 5–10 years | Lower, unless serious or unresolved |
| > 10 years | Contextual; serious/unresolved matters never expire |

Spent convictions and rehabilitation rules apply in some jurisdictions — check before recording historic criminality against an individual.

### 3. Severity — how bad, and how close?

Weight by **offence gravity** (predicate offence vs regulatory technicality), **proximity** (subject of the investigation vs mentioned in the same article), and **stage** (allegation → investigation → charge → conviction → sanction imposed).

A useful working scale: *Reported allegation (low) → Formal investigation (medium) → Charged (medium-high) → Convicted / enforcement action (high)*.

### 4. Reliability — who is reporting it?

Tier your sources in policy: regulators, courts and official gazettes (tier 1); established national and international media and recognised investigative consortia (tier 2); trade press and reputable local outlets (tier 3); blogs, anonymous forums, unattributed aggregators (tier 4 — corroborate or discard).

Watch for **circular reporting**: forty articles that all cite one original source are one source, not forty.

### Case study — the hit that was three different people

A screening run on "**Chen Wei**", a Singapore-resident director, returned 61 adverse-media articles.

Triage found: 38 concerned a mainland-China property executive (different DOB, different city); 14 concerned a Taiwanese fraud defendant (different nationality, no Singapore link); 6 were circular reposts of one item; 2 were unrelated sports reporting.

**One** article remained: a Singapore regulator's censure of a company where the customer had been finance director, for late regulatory filings — tier 1 source, confirmed identity, low severity, four years old, fully remediated.

Outcome: recorded as a **confirmed but low-severity historic regulatory matter**, no risk-rating uplift, documented rationale.

**Takeaway:** volume is not risk. The analyst's job is to convert 61 articles into one defensible sentence — and to show the working.
$md$ WHERE id = '1976212d-2bed-42bb-9c1f-0d71a209db65';

INSERT INTO public.academy_modules (course_id, title, content, sort_order) VALUES
((SELECT id FROM public.academy_courses WHERE slug='adverse-media-intelligence'), 'Lesson 3 — Building the search: names, aliases, language and Boolean craft', $md$
### Search construction is the control

Most adverse-media failures are not analytical — they are **search-design** failures. The article existed; nobody queried in a way that would return it.

### Name handling

- **Transliteration variants** — generate them deliberately: Cyrillic (Sergey/Sergei/Serhii), Arabic (Mohammed/Muhammad/Mohamad), Chinese (pinyin vs Wade-Giles vs Cantonese romanisation), Korean (Lee/Yi/Rhee).
- **Name order** — search both orders for Chinese, Korean, Japanese, Hungarian and many South-East Asian names.
- **Particles and patronymics** — search with and without "bin/binti", "al-", "van der", "de la", and with/without middle patronymics.
- **Known aliases and maiden names** — from the customer file, registry filings and prior media.
- **The entity as well as the person** — company name, former company names, trading names, and registration number.

### Boolean craft

Combine the subject with **risk terms** and **discriminators**:

```
("Adaeze Nwosu" OR "A. Nwosu" OR "Adaeze N.")
AND (fraud OR bribery OR corruption OR "money laundering"
     OR investigation OR indicted OR sanctioned OR arrested)
AND (petroleum OR ministry OR "Harbourline")
```

Run a **negative-control** search too — the subject's name with no risk terms — to understand who else shares it before you triage.

### Language coverage

Screening a Vietnamese customer only in English is a coverage gap, not a search. For each material customer segment, identify the **local-language press** and either (a) query in-language with translated risk terms, or (b) evidence that your provider covers it. Machine translation is acceptable for triage; escalate anything material for human review.

### Reproducibility

Record, for every EDD search: the **exact query strings**, the **sources/engines used**, the **date and time**, the **number of results reviewed**, and the **articles retained**. If a colleague cannot re-run your search from the file, the search is not evidence.

### Case study — the missing 'ç'

An EMI screened a Turkish UBO as "**Gokhan Cetinkaya**". The Turkish press wrote "**Gökhan Çetinkaya**". The provider's index was diacritic-sensitive; the search returned nothing.

Eleven months later a Turkish-language investigation into invoice fraud naming him was raised by a correspondent bank. The firm's own EDD file showed "no adverse media found" — technically true of the query that was run, indefensible as a control.

The fix was cheap: diacritic normalisation, both-order name search, and a mandated local-language query for customers in the top ten country exposures.

**Takeaway:** design the search for the customer's own alphabet, language and naming convention — not for yours.
$md$, 3),

((SELECT id FROM public.academy_courses WHERE slug='adverse-media-intelligence'), 'Lesson 4 — From article to risk rating: scoring and escalation', $md$
### Turning findings into a rating

A confirmed adverse-media finding should feed the **customer risk score** through a documented rule, not through analyst instinct. A workable model scores each confirmed finding on three axes and maps the result to an action.

| Axis | Low (1) | Medium (2) | High (3) |
|---|---|---|---|
| **Severity** | Regulatory technicality, civil dispute | Regulatory enforcement, fraud allegation | Predicate offence, corruption, TF, conviction |
| **Proximity** | Same-article mention, associate | Company the subject led | Subject personally named |
| **Recency** | > 5 years, resolved | 2–5 years | < 2 years or unresolved |

**Total 3–4** → record, no uplift. **5–6** → uplift one risk tier, EDD refresh. **7–8** → high risk, senior approval to continue. **9** → escalate to committee with an exit recommendation and consider a SAR.

Publish the model. An analyst who deviates must say why — that is the point of having one.

### Allegation is not guilt

Record what the source actually says, using precise language: *alleged*, *under investigation*, *charged*, *acquitted*, *convicted*, *settled without admission*. Firms create legal exposure by writing "fraudster" where the source says "faces allegations".

Equally, absence of conviction is not absence of risk. AML decisions run on **risk**, not on criminal standards of proof.

### When adverse media triggers a SAR

Media alone rarely justifies a SAR. Media **plus** something in your own data usually does: transactions consistent with the reported typology, unexplained third-party flows, a structure matching the reported scheme, or the customer's explanation contradicting documented facts. Record the internal corroboration in the SAR narrative — it is what makes the report useful to the FIU.

### Case study — media plus data

A bank's monitoring flagged a construction client receiving round-sum payments from three consultancy companies. Individually unremarkable.

Adverse-media screening then returned a tier-2 investigative report naming the same three consultancies as **conduits in a municipal procurement kickback scheme** in a neighbouring country. Neither signal alone met the reporting threshold. Together they gave a coherent typology, named counterparties, and dates matching the payment flows.

The SAR was filed with the article references and the transaction schedule attached, and the FIU responded with an information request within a fortnight.

**Takeaway:** adverse media is at its most valuable when it is **joined to your own transaction data** — build the workflow so analysts see both.
$md$, 4),

((SELECT id FROM public.academy_courses WHERE slug='adverse-media-intelligence'), 'Lesson 5 — Ongoing monitoring, alert fatigue and tuning', $md$
### Onboarding is one snapshot

Adverse media is inherently **time-varying**: today's clean customer is next quarter's indictment. Continuous monitoring is therefore not an enhancement — it is the control.

**Design choices that matter**

- **Population** — everyone at a baseline, high-risk customers and all UBOs/directors at a deeper level.
- **Frequency** — daily or weekly re-screening for high risk; monthly for standard; event-driven always.
- **Scope creep management** — adding every director of every corporate customer multiplies volume; decide deliberately and document the rationale.

### Alert fatigue is a compliance risk

Queues that exceed capacity produce **rubber-stamped discounts** — the failure mode regulators find most often. Manage it with:

1. **Category filters** — suppress out-of-scope categories (celebrity gossip, sports, obituaries) at ingestion.
2. **Deduplication and clustering** — group syndicated copies of one story; review the cluster once.
3. **Entity resolution** — use DOB, nationality and employer at the matching layer so the analyst is not doing it manually 200 times.
4. **Risk-tiered thresholds** — broad matching for high-risk customers, tighter for low-risk retail.
5. **Aged-article suppression** with an explicit exception for serious/unresolved conduct.

### Tuning must be evidenced

Regulators expect **periodic tuning with documented testing**: sample the alerts you suppressed and prove the suppression rule did not hide true risk (below-the-line testing). Record the sample size, the findings and the sign-off. Untested tuning is indistinguishable from switching the control off.

### Metrics worth reporting to the board

- Alert volume and clearance time, by risk tier
- **False-positive rate** and, critically, **true-positive count** — a queue with zero true positives in a year is a broken control, not a clean book
- Ageing: alerts open > 30 days
- Overturn rate at QA — how often reviewers disagree with analysts
- Coverage: % of customers under continuous screening, languages covered

### Case study — the queue that cleared itself

A fintech's adverse-media queue grew to 14,000 open alerts. To clear it, a temporary team was given a target of 400 dispositions per person per day — roughly one minute per alert including reading the article.

Post-hoc QA on a 200-alert sample found **9 incorrectly discounted true matches**, including two customers subsequently exited for fraud. The regulator's finding was not about the backlog; it was that the firm had **set a throughput target incompatible with the stated review standard** and had no QA sampling in place to detect it.

**Takeaway:** if capacity cannot meet volume, fix the volume through tuning and evidence it — never by accelerating the review.
$md$, 5),

((SELECT id FROM public.academy_courses WHERE slug='adverse-media-intelligence'), 'Lesson 6 — Full worked case: an adverse-media file end to end', $md$
### The scenario

**Customer:** *Meridian Agro Trading BV* (Netherlands), commodities trader, applying for trade-finance facilities of €12m.
**Directors:** two Dutch nationals.
**UBO:** *Rustam I.*, 61, dual national, resident in a Central Asian country, 100% via a Cyprus holding company.
**Trade corridors:** Central Asia → EU, grain and cotton.

### Step 1 — Scope the search

In scope: the operating company, the Cyprus holding company, both directors, and the UBO. Languages: English, Dutch, Russian, and the local Central Asian language. Sources: structured provider + open web + national court and gazette registers + OCCRP archive.

### Step 2 — Results

| Subject | Findings |
|---|---|
| Meridian Agro Trading BV | Nothing adverse |
| Cyprus holdco | Named in a 2023 leaked-documents dataset as one of ~400 entities administered by one corporate service provider — no allegation against it |
| Director A | Nothing adverse |
| Director B | 2019 Dutch civil judgment, contractual dispute, out of scope |
| **UBO Rustam I.** | **(a)** 2021 Russian-language reporting: named as a beneficiary of a cotton-procurement contract awarded without tender by a regional administration. **(b)** 2024 OCCRP piece: same procurement, describes an ongoing anti-corruption investigation into the *administration*, names him as a contract counterparty. **(c)** 2016 item: a company he chaired fined for customs under-declaration |

### Step 3 — Triage

- **(a)** Identity confirmed (DOB + company registration). Tier-3 source but corroborated by (b). Conduct 5 years old, **unresolved**. Severity: corruption-adjacent; proximity: counterparty, not subject. → Severity 2, Proximity 2, Recency 2 = **6**.
- **(b)** Tier-2 investigative consortium, identity confirmed, recent, still open. → Severity 3, Proximity 2, Recency 3 = **8**.
- **(c)** Tier-1 (customs authority notice), identity confirmed, resolved, 10 years old, low severity. → **4**, record only.

Highest score **8** → high risk, senior approval required to proceed.

### Step 4 — Corroboration against internal data

Requested the counterparty list for the proposed facilities. Two of the five named buyers are entities **linked in the OCCRP piece** to the same regional administration. This moves the file from "media about the UBO" to "**media matching the proposed transaction flow**".

### Step 5 — Decision

Committee outcome: **decline the trade-finance facility**; offer no relationship pending resolution of the investigation. Rationale recorded: unresolved corruption investigation touching the exact procurement channel the facility would finance; the firm cannot monitor away a structural conflict.

No SAR filed at application stage (no transaction, no customer relationship), but an internal record was created so any future application is linked.

### Step 6 — The file

Query strings in four languages; source tier for each item; identity-confirmation evidence; the scoring table; the counterparty overlap analysis; the committee minute; the decline letter; the diary note.

**The lesson of the case:** the UBO's media profile alone was arguable. The **overlap between the reporting and the proposed counterparties** made the decision straightforward — and that overlap only appeared because the analyst asked for the transaction data.
$md$, 6),

((SELECT id FROM public.academy_courses WHERE slug='adverse-media-intelligence'), 'Lesson 7 — Governance, data protection and your checklist', $md$
### Policy essentials

Your adverse-media policy must state, in writing: the **in-scope categories**; the **populations** screened and at what frequency; the **sources and languages** used; the **matching thresholds** by risk tier; the **triage standard** and disposition vocabulary; the **scoring model** and its escalation points; the **QA sampling** regime; and the **retention** rules.

If any of these live only in an analyst's head, the control is unmanaged.

### Data protection — the part firms forget

Adverse media processing involves personal data, frequently including **criminal-offence data**, which carries elevated protection under GDPR Art.10 and equivalent regimes.

- **Lawful basis** — legal obligation and/or substantial public interest (AML). Document it.
- **Accuracy** — you must be able to correct or annotate records. A discounted match must be recorded as discounted, not left as a hit.
- **Data subject rights** — subject access requests will ask what negative information you hold. Be ready to respond, subject to tipping-off constraints where a SAR exists.
- **Retention** — keep for the statutory AML period, then delete. Indefinite retention of unverified allegations is a breach.
- **Automated decisions** — a fully automated exit driven by a media hit may engage Art.22. Keep a human in the loop.

### Vendor management

Ask your provider, and record the answers: source count and **language breakdown by country**; how quickly new articles are ingested; entity-resolution method; how deletions and retractions are handled; and whether category tagging is human-reviewed. Re-verify annually — coverage claims drift.

### Your checklist

**Design**
- In-scope categories defined and published
- Populations, frequency and languages mapped to your customer base
- Risk-tiered thresholds; documented scoring model

**Execution**
- Search built with transliterations, name orders, aliases, entity names
- Identity confirmed on two or more identifiers before any finding is recorded
- Source tier and conduct date recorded for every retained article
- Precise language: alleged / charged / convicted
- Findings joined to transaction data before escalation

**Assurance**
- Continuous re-screening, not point-in-time
- Below-the-line testing of suppression rules, with sign-off
- QA sampling with a measured overturn rate
- Board MI: volumes, ageing, true positives, coverage
- Full reproducibility: query, sources, date, results retained

### Three principles to carry away

1. **Adverse media is the leading indicator** — lists tell you what already happened officially.
2. **Volume is not risk; triage is the skill.** Show your working on every discount.
3. **Media plus your own data is where decisions are made** — build the workflow so analysts always have both.
$md$, 7);

UPDATE public.academy_courses SET duration_minutes = 20, cpd_hours = 0.5, estimated_words = 3100 WHERE slug = 'adverse-media-intelligence';
