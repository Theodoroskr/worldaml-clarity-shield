UPDATE public.academy_modules SET sort_order = 1, title = 'Lesson 1 — The Global Sanctions Architecture', content = $md$### Lesson 1 — The Global Sanctions Architecture

Sanctions are restrictive measures imposed by states and international bodies to change behaviour, constrain capability or signal condemnation. Unlike AML, sanctions compliance is **strict liability** in most regimes: an honest mistake is still a breach.

**The four layers you must map**

| Layer | Issuer | Reach |
|---|---|---|
| Multilateral | UN Security Council | Binding on member states once transposed |
| Regional | EU (Council Regulations) | EU persons, EU territory, EU-incorporated entities, EU-flagged vessels |
| National | US (OFAC), UK (OFSI), Switzerland (SECO), others | Own nexus rules, often extraterritorial |
| Sectoral | Embargoes on arms, dual-use goods, energy, finance | Activity-based, not just name-based |

**Types of measures**
- **Targeted asset freezes** — no funds or economic resources may be made available, directly or indirectly, to a listed person
- **Financial restrictions** — debt and equity limits, correspondent-banking bans, transaction-reporting duties
- **Sectoral / trade measures** — export bans, price caps, service prohibitions
- **Comprehensive embargoes** — near-total prohibition on a territory

**Jurisdictional reach.** OFAC primary sanctions bite where there is a US nexus: US persons, US dollars clearing through the US, US-origin goods or technology. **Secondary sanctions** target non-US persons for dealings with certain listed parties — no US nexus required, with the penalty being exclusion from the US market. EU and UK measures apply on nationality, territory and incorporation.

**Worked case study — the dollar clearing trap.** A Cyprus-based trader, with no US presence, invoices a counterparty in USD. The payment clears through a New York correspondent. The beneficiary's parent is 55% owned by an SDN. The dollar leg creates the US nexus; OFAC's 50% Rule makes the beneficiary blocked; the funds are frozen and the trader faces enforcement despite having "no US business".

**Takeaway:** Determine every applicable regime — by currency, counterparty, goods, territory and ownership — before you screen a single name.$md$ WHERE id = '7cf1cdda-86a4-4a19-b833-b5693e34913e';

UPDATE public.academy_modules SET sort_order = 2, title = 'Lesson 2 — Ownership, Control and the 50% Rule', content = $md$### Lesson 2 — Ownership, Control and the 50% Rule

The most expensive sanctions breaches rarely involve a name on a list. They involve an entity **owned or controlled** by someone on a list.

**OFAC's 50% Rule.** Any entity owned 50% or more, directly or indirectly, individually or **in the aggregate**, by one or more blocked persons is itself blocked — even though it is not named on the SDN List. Two SDNs holding 26% and 25% together block the company.

**EU and UK: ownership *or* control.** Ownership above 50% blocks the entity, but **control** alone is sufficient even below 50%: the right to appoint or remove a majority of the board, dominant influence under a contract or articles, or acting on the designated person's instructions.

**Aggregation worked example**

| Shareholder | Stake | Status |
|---|---|---|
| Designated person A | 30% | SDN |
| Designated person B | 22% | SDN |
| Unlisted investor | 48% | Clean |

Aggregate designated ownership is 52% — the entity is blocked under OFAC and frozen under EU/UK rules, despite the largest single holder being clean.

**Indirect chains.** Ownership multiplies down a chain for percentage tests, but control does not dilute. A designated person owning 60% of HoldCo, which owns 60% of OpCo, controls OpCo even though the arithmetic product is 36%.

**Red flags for hidden control**
- Recent transfers of shares to 49% just before or after a designation
- Family members, close associates or long-standing nominees holding the balance
- Golden shares, veto rights, or loan covenants that confer effective control
- Directors who have served every entity in a designated person's network

**Worked case study — the 49% restructure.** Two weeks after designation, an oligarch's stake in a shipping group is reduced from 70% to 49%, with 21% transferred to his former chief of staff, who has no capital to fund it. The group argues it is no longer blocked. OFSI and OFAC both treat the entity as still controlled: the divestment is uncompensated, the transferee is a close associate, and board composition is unchanged.

**Takeaway:** Screen the ownership tree, aggregate designated stakes, and test control separately from percentages.$md$ WHERE id = '5d5ae493-0849-4517-8042-a0ace1481fdf';

UPDATE public.academy_modules SET sort_order = 3, title = 'Lesson 3 — Screening That Actually Works', content = $md$### Lesson 3 — Screening That Actually Works

Screening is a system, not a search box. Four questions define its quality: what do you screen, against what, when, and how do you resolve hits?

**What to screen**
- Customers, beneficial owners, directors and authorised signatories
- Counterparties, intermediary banks and payment-message free text
- Vessels, IMO numbers, aircraft tail numbers, ports and goods descriptions
- Addresses, dates of birth and identifiers — not just names

**Against what.** Consolidated lists: UN, EU, OFAC SDN and non-SDN (SSI, NS-MBS), UK OFSI, plus national lists relevant to your footprint. Add PEP and adverse-media layers separately — never conflate them with sanctions.

**When**
- At onboarding, before the relationship goes live
- Real-time on every payment, before release
- Continuously against list updates — new designations must be applied within hours, not at the next review

**Fuzzy matching and tuning.** Names transliterate inconsistently (Mohammed / Muhammad / Mohamed), so exact matching fails. Set fuzziness by risk: tighter for high-volume retail payments, wider for high-risk corridors. Too tight and you miss; too wide and analysts drown and start clicking "false positive" reflexively.

**Alert resolution discipline.** Every hit is cleared on **discriminating data** — date of birth, passport number, nationality, address — never on "different spelling" or "our client seems fine". Record the identifier that resolved it. Whitelist only a specific customer against a specific list entry, with review dates.

**Worked case study — the free-text bypass.** A bank screens beneficiary names but not the payment reference field. Instructions carry "for onward credit to" a designated entity in the remittance narrative. Twelve payments totalling $4.1m are released. The controls existed; the coverage did not.

**Takeaway:** Coverage gaps, not matching algorithms, cause most breaches — screen every field, every party, in real time.$md$ WHERE id = 'c02800dd-00b2-4dd3-aea6-a53940dbcd49';

UPDATE public.academy_modules SET sort_order = 4, title = 'Lesson 4 — Evasion Typologies and Red Flags', content = $md$### Lesson 4 — Evasion Typologies and Red Flags

Sophisticated evasion is designed to defeat name screening. Recognise the patterns.

**Corporate layering.** New intermediaries in permissive jurisdictions, incorporated shortly before the trade, with nominee directors and no operating history. The designated party sits three companies back.

**Trade-based evasion**
- Mis-invoicing: over- or under-stating value, quantity or grade
- Transhipment through a neutral hub to disguise origin or destination
- Vague goods descriptions ("machinery parts", "general cargo") on high-value shipments
- Dual-use goods routed to civilian end-users who then divert them

**Maritime evasion**
- **AIS gaps** — transponders switched off during a voyage leg
- **STS transfers** — ship-to-ship cargo transfers at sea, often at night in known transfer zones
- Flag hopping, repeated renaming, and false IMO or destination declarations
- Voyage documents inconsistent with draft, speed or fuel consumption

**Financial evasion**
- Payment stripping: removing originator details from wire messages
- Splitting values below screening or reporting thresholds
- Crypto, informal value transfer and third-country nested correspondent accounts
- Front companies with an address shared by dozens of entities

**Worked case study — the two-hop cargo.** A refined-products cargo is sold to a Hong Kong trader incorporated four months earlier, resold within 48 hours at a marginal mark-up to a UAE buyer, then delivered by a tanker with a 31-hour AIS gap off a known STS zone. Documents show a clean origin. The combination — new intermediary, back-to-back resale with no commercial logic, AIS gap, transfer-zone loitering — is a classic origin-laundering chain.

**Takeaway:** Evasion is visible in behaviour and logistics long before a listed name appears. Build rules for patterns, not just for names.$md$ WHERE id = '657b6b73-a507-411e-8a20-0f041fab4688';

INSERT INTO public.academy_modules (course_id, sort_order, title, content)
SELECT c.id, 5, 'Lesson 5 — Handling a Potential Hit', $md$### Lesson 5 — Handling a Potential Hit

When an alert fires, the clock starts. What you do in the first hour determines whether you have a compliance record or a breach.

**Immediate steps**
1. **Freeze the transaction.** Do not release, return or reroute pending resolution. Returning funds to the originator can itself be a breach.
2. **Preserve everything.** Payment message, screening output, list entry version, timestamps.
3. **Escalate** to the sanctions officer/MLRO immediately — sanctions escalation is not a next-business-day task.
4. **Investigate** using discriminating identifiers, ownership data and the underlying commercial documents.
5. **Decide and document**: false positive (record the identifier that cleared it) or true match.

**If it is a true match**
- **Block or reject** according to the regime: US SDN matches are *blocked* (held in an interest-bearing blocked account); many EU/UK cases are *frozen*; sectoral or trade prohibitions may require *rejection*.
- **Report to the competent authority** within the statutory window — OFAC blocking reports within 10 business days and an annual report; OFSI reports "as soon as practicable".
- **Do not tip off** where a related suspicion has been reported, and never advise the customer how to restructure to avoid the measure.
- Consider whether a **licence** (specific or general) permits the activity — humanitarian, wind-down, legal-fees and basic-needs licences are common.

**Voluntary self-disclosure.** If a breach has occurred, a prompt, complete voluntary disclosure with remediation typically halves the base penalty and is the single strongest mitigating factor. Concealment converts a civil matter into a criminal one.

**Worked case study — the returned payment.** An analyst identifies a blocked beneficiary and, wanting to be helpful, returns the funds to the originating bank. Under OFAC rules the funds should have been blocked. The unauthorised return is a separate violation, aggravated by the fact that a trained analyst made it and no escalation was recorded.

**Takeaway:** Freeze first, escalate immediately, decide on identifiers, and report within the deadline — never return funds to "keep the client happy".$md$
FROM public.academy_courses c WHERE c.slug = 'international-sanctions-compliance';

INSERT INTO public.academy_modules (course_id, sort_order, title, content)
SELECT c.id, 6, 'Lesson 6 — Building the Sanctions Compliance Programme', $md$### Lesson 6 — Building the Sanctions Compliance Programme

OFAC's framework sets five essential components. Regulators worldwide assess against substantially the same structure.

| Component | What good looks like |
|---|---|
| Management commitment | Board-approved policy, resourced team, independent authority to stop business |
| Risk assessment | Documented by customer, product, geography and channel; refreshed on change |
| Internal controls | Screening coverage, escalation paths, licence management, record-keeping |
| Testing and audit | Independent model validation, list-ingestion testing, sample alert review |
| Training | Role-specific, at least annual, with attestation and refreshers on new designations |

**Governance essentials**
- A named sanctions officer with a direct line to senior management
- A written policy stating risk appetite, prohibited jurisdictions and escalation rules
- Change control for list ingestion: who confirms lists loaded, how quickly, and what happens on a feed failure
- A licence register recording scope, conditions, expiry and reporting duties
- Records retained for at least five years (many regimes require longer)

**Testing that matters.** Inject known synthetic designations into the screening system and confirm they alert. Test transliteration variants, aggregated-ownership entities, and free-text fields. If a control has never been tested against a positive case, you do not know it works.

**Third parties and group risk.** Outsourced screening does not outsource liability. Set contractual list-coverage and update-frequency terms, obtain testing evidence, and check subsidiary and branch coverage — including affiliates in jurisdictions with blocking statutes that conflict with your parent's obligations.

**Worked case study — the untested feed.** A mid-sized payments firm's list provider changes file format. Ingestion fails silently for 19 days; the console shows "last update: success" from a cached job. Forty-one payments to newly designated parties are released. Root cause is not screening logic but the absence of an ingestion-failure alert and any post-load reconciliation.

**Takeaway:** A programme is judged on evidence — assessments, tested controls, trained staff and reconstructable decisions.$md$
FROM public.academy_courses c WHERE c.slug = 'international-sanctions-compliance';

UPDATE public.academy_modules SET sort_order = 7, title = 'Lesson 7 — Enforcement, Penalties and Case Lessons', content = $md$### Lesson 7 — Enforcement, Penalties and Case Lessons

**Exposure.** Civil penalties are commonly assessed per transaction, so a pattern of small payments can produce an enormous aggregate. Wilful breaches attract criminal liability including imprisonment. Beyond fines come deferred prosecution agreements, monitorships, correspondent-banking loss, licence conditions and reputational damage that outlasts the penalty.

**How regulators calculate.** Base penalty is driven by egregiousness and whether the case was voluntarily self-disclosed. Aggravating factors: senior-management awareness, concealment, pattern of conduct, harm to sanctions objectives, prior warnings. Mitigating factors: self-disclosure, cooperation, remediation, a pre-existing compliance programme, first-time conduct.

**Recurring root causes in enforcement actions**
1. Screening coverage gaps — free-text fields, non-name identifiers, one-off manual payments
2. Ownership analysis not performed — the 50% Rule ignored
3. Stale lists — updates applied on a weekly cycle instead of on release
4. Alert-handling pressure — analysts clearing hits without discriminating data
5. Escalations that stopped at a middle manager
6. Foreign subsidiaries operating outside group policy

**Worked case study — the stripping bank.** Over six years, operations staff at a bank remove originator information from wire messages so that payments involving sanctioned parties clear through US correspondents. Internal audit raises the practice twice; each time it is characterised as an "efficiency workaround". The eventual settlement is measured in hundreds of millions, with an imposed monitor. The compliance function had good policy — what it lacked was authority and escalation follow-through.

**Your personal duties**
- Never release a payment against an unresolved alert to meet a cut-off
- Never accept a customer's assurance in place of documentary identifiers
- Escalate ownership uncertainty rather than assuming a clean structure
- Record what you knew, when you knew it, and what you did

**Takeaway:** Enforcement rewards disclosure and punishes workarounds. Strict liability means the only durable defence is documented, tested control.$md$ WHERE id = '657b6b73-a507-411e-8a20-0f041fab4688';

UPDATE public.academy_courses SET duration_minutes = 20, cpd_hours = 0.5, estimated_words = 3200 WHERE slug = 'international-sanctions-compliance';