DELETE FROM public.academy_modules m USING public.academy_courses c WHERE m.course_id = c.id AND c.slug = 'aml-africa';

INSERT INTO public.academy_modules (course_id, title, content, sort_order)
SELECT c.id, v.title, v.content, v.sort_order
FROM public.academy_courses c,
(VALUES
('Lesson 1 — Africa''s AML Architecture', '### Lesson 1 — Africa''s AML Architecture

Africa is covered by three FATF-style regional bodies: **ESAAMLG** (eastern and southern Africa), **GIABA** (west Africa) and **GABAC** (central Africa). North African states largely sit with **MENAFATF**. Each conducts mutual evaluations against the same forty Recommendations, but effectiveness ratings across the continent are consistently lower than technical-compliance ratings — the laws exist; the supervision often does not reach.

**What that means in practice.** A customer can hold a licence, a registered company and a tax number, all genuine, in a jurisdiction where no supervisor has ever inspected the sector. Documentary verification therefore carries less assurance than it does in Europe, and independent corroboration matters more.

**Structural features that shape risk**

| Feature | Consequence for controls |
|---|---|
| High cash intensity | Cash deposit patterns are weak signals; look at behaviour and counterparties |
| Company registers often unavailable or not machine-readable | UBO verification needs documents plus corroboration, not register lookups |
| Very large informal economy | Absence of financial history is normal, not suspicious in itself |
| Mobile money penetration among the highest globally | Payment risk sits outside traditional banking rails |
| Extractive industries and state procurement | Corruption and PEP exposure dominate predicate offences |

**Case study.** A European commodities trader onboarded a west African supplier with a certificate of incorporation, a tax clearance certificate and a bank reference. All were authentic. None disclosed that the beneficial owner was the brother of the minister awarding the export licences. The trader''s error was equating document authenticity with ownership transparency; the register simply did not record beneficial owners.

**Takeaway:** Across much of Africa the binding constraint is data availability, not legal standards. Design controls that assume registers are incomplete and that corroboration must come from independent sources.', 1),
('Lesson 2 — South Africa, Nigeria and the Grey-List Experience', '### Lesson 2 — South Africa, Nigeria and the Grey-List Experience

**South Africa.** The Financial Intelligence Centre Act (FICA), amended in 2017 to a risk-based approach, with the Financial Intelligence Centre as FIU and the Prudential Authority and FSCA as supervisors. The "state capture" period produced systemic corruption and procurement laundering; the Zondo Commission documented it in detail. South Africa was grey-listed by FATF in February 2023 and worked through an action plan focused on beneficial ownership access, DNFBP supervision and financial-crime investigations.

**Nigeria.** The Money Laundering (Prevention and Prohibition) Act 2022, with the NFIU and the EFCC as the enforcement agency. Nigeria was grey-listed in the same 2023 plenary. Dominant typologies: oil-sector theft and illegal bunkering, procurement fraud, and business email compromise — Nigeria-linked BEC accounts for a very large share of global BEC losses.

**What grey-listing actually does to you as a firm**

1. Correspondent banks apply enhanced due diligence to your payments and may re-price or exit.
2. Your own jurisdiction ratings must be updated, which cascades into customer risk scores and review cycles.
3. EU and UK high-risk third country lists may follow, triggering mandatory EDD in those regimes.
4. Onboarding times lengthen; some counterparties impose blanket restrictions.

**Practical response for a firm exposed to a newly grey-listed country**

- Re-score affected customers within 30 days and identify those crossing into high risk
- Refresh source-of-funds evidence for the largest exposures rather than the whole book
- Document the analysis: regulators criticise both under-reaction and indiscriminate exit

**Case study.** A UK bank responded to a grey-listing by exiting all corporate customers with that nationality. Two were long-standing manufacturers with fully documented flows. The FCA''s subsequent criticism was of blanket de-risking without customer-level assessment — the opposite failure from the one the bank feared.

**Takeaway:** Grey-listing requires re-assessment, not evacuation. Evidence a risk-based decision for each affected relationship.', 2),
('Lesson 3 — Mobile Money and Agent Networks', '### Lesson 3 — Mobile Money and Agent Networks

Mobile money is the defining African payment innovation — and the defining control challenge. M-Pesa, MTN MoMo, Airtel Money and Orange Money serve hundreds of millions of accounts, often as the customer''s only financial relationship.

**Where the risk sits: the agent layer.** Cash-in and cash-out happen at hundreds of thousands of small agents — shops, kiosks, fuel stations. Agents perform identification. They are paid by transaction volume. That combination creates the core vulnerability: agents have a commercial incentive to process transactions and little incentive to refuse them.

**Typologies**

| Typology | Mechanism | Detection signal |
|---|---|---|
| Smurfing across wallets | Value split below transaction and daily limits across many SIMs | Common recipient across many low-value senders |
| Agent self-dealing | Agent transacts through customer wallets or ghost accounts | Agent float inconsistent with reported transactions |
| SIM-swap and identity reuse | One ID registered against many wallets | Duplicate ID numbers across accounts |
| Cross-border corridor abuse | Interoperable wallet-to-wallet transfers between countries | Corridor volume out of line with declared purpose |
| Merchant collusion | Cash-out disguised as goods purchase | Merchant with no goods flow and high wallet turnover |

**Control design.** Transaction limits alone are not a control — they define the smurfing increment. Effective programmes combine: device and SIM fingerprinting, ID-uniqueness checks at registration, agent-level monitoring (float reconciliation, transaction concentration, out-of-hours activity), and network analysis of recipient concentration.

**Case study.** A mobile money operator found that 0.3% of its agents accounted for 22% of cash-out value. Investigation showed 41 agents in one region processing withdrawals for wallets funded minutes earlier by hundreds of unrelated senders — the collection layer for a fraud ring. The operator introduced agent risk scoring; within two quarters, cash-out concentration in the top 0.3% of agents fell to 4%.

**Takeaway:** In mobile money, monitor the agent as if it were a customer. Agent-level analytics detect what wallet-level limits are designed to hide.', 3),
('Lesson 4 — Corruption, Extractives and PEP Risk', '### Lesson 4 — Corruption, Extractives and PEP Risk

Corruption is the dominant predicate offence across much of the continent, and it laundered value overwhelmingly through three channels: public procurement, extractive licensing, and state-owned enterprises.

**How procurement laundering is structured**

1. A contract is awarded to a company with no track record, often incorporated shortly before the tender.
2. The contract price is inflated, or the works are partially delivered.
3. Proceeds are paid to subcontractors and "consultants" controlled by relatives of the awarding official.
4. Value exits through property purchases, education fees, luxury goods and offshore trusts, frequently in Europe, the Gulf and southern Africa.

**PEP scope in practice.** Restricting PEP screening to heads of state and ministers misses the majority of the risk. Include: SOE board members and executives, procurement officials, customs and revenue heads, military procurement officers, regulators awarding licences, provincial governors, and close associates and family members.

**Extractive-sector specifics.** Gold, diamonds, cobalt, oil. Artisanal gold is the highest-risk commodity: it is bearer value, easily smuggled, and refined into fungible bullion. Typical laundering route: artisanal production → local aggregator paying cash → smuggled across a border → declared as domestic production in a transit country → refined in a Gulf or Asian centre → sold into the legitimate market.

**Red flags for the trade leg**

- Declared gold exports exceeding the country''s known production capacity
- Trading company incorporated within 12 months handling multi-million-dollar consignments
- Payments in cash or by third parties in a bearer-value commodity trade
- No refinery certification or chain-of-custody documentation

**Case study.** A refinery''s bank reviewed a customer buying gold from three transit-country suppliers. Combined declared national production of the transit country was 2 tonnes annually; the customer alone imported 14 tonnes from it. That single arithmetic test — imports versus national production — was the whole finding.

**Takeaway:** Corruption and extractive risk are usually detectable through arithmetic and relationships, not through transaction monitoring rules.', 4),
('Lesson 5 — Sanctions, Terrorist Financing and Conflict Finance', '### Lesson 5 — Sanctions, Terrorist Financing and Conflict Finance

Several African contexts attract UN, US, EU and UK sanctions: Sudan, Libya, Somalia, the DRC, Zimbabwe, Mali, Central African Republic and others. Regimes are usually **targeted** — designated persons, entities and sectors — rather than comprehensive, so blanket country blocking is both over- and under-inclusive.

**Terrorist financing.** Al-Shabaab, ISWAP, Boko Haram, JNIM and affiliates finance through extortion and "taxation" of local commerce, kidnap for ransom, livestock and charcoal trading, and cash couriers. Amounts are small; the network is the signal.

**Hawala and value transfer.** In the Horn of Africa, hawala is essential financial infrastructure serving diaspora remittances where banking is absent. It is not inherently illicit. The compliance question is whether the operator is registered, keeps records, screens, and can evidence settlement — not whether it is informal.

**Non-profit sector.** FATF Recommendation 8 was revised precisely because blanket restriction of NPOs proved both ineffective and harmful. The expectation is targeted, risk-based measures based on identified TF risk, not sector-wide de-banking.

**Practical screening configuration**

- Screen against UN consolidated, OFAC SDN, UK OFSI and EU lists — regimes diverge; a single list is insufficient
- Configure Arabic, French, Portuguese, Swahili and Amharic transliteration variants
- Screen intermediaries and cash-courier destinations, not only account parties
- Use conflict-zone geolocation of transacting parties as a risk factor, not an automatic block

**Case study.** A remittance firm serving a Horn of Africa corridor filed an SAR on a cluster of senders funding one receiver in small monthly amounts. Investigation showed a legitimate extended-family support arrangement. The firm''s error was not the SAR — it was that no rule distinguished family remittance patterns from collection patterns. After tuning on beneficiary relationship data, alert volume fell 60% and the two genuine TF cases that year both surfaced within a week.

**Takeaway:** Sanctions and TF work in Africa is about calibration and multilingual configuration. Blanket exclusion of a country, a sector or a channel is a control failure, not a conservative choice.', 5),
('Lesson 6 — Worked Case: The Pan-African Telecom Subsidiary', '### Lesson 6 — Worked Case: The Pan-African Telecom Subsidiary

**Scenario.** A telecommunications group operates mobile money in eight African markets. Group compliance sits in Johannesburg. An internal audit finds that one subsidiary''s SAR volume is 90% below peer subsidiaries despite comparable customer numbers. You are asked to investigate.

**Step 1 — Test the obvious explanations.** Customer base composition, product mix and transaction volumes are comparable. Monitoring rules are the group standard. The rule set is therefore not the cause.

**Step 2 — Trace the alert lifecycle.** 41,000 alerts generated; 39,600 closed at level one; 1,400 escalated; 11 SARs filed. Peer subsidiaries convert escalations to SARs at roughly 25%. This one converts at 0.8%.

**Step 3 — Find the constraint.** Level-two investigation is staffed by two analysts covering 1,400 escalations, both reporting to the country commercial director rather than to group compliance. Interviews establish that escalations involving customers of the largest distributor were routinely closed after "commercial confirmation".

**Step 4 — Quantify the exposure.** A sample of 200 closed escalations is re-reviewed independently. 38 meet the suspicion threshold. Extrapolated, roughly 260 unfiled SARs across 18 months, concentrated in one distributor''s agent network — the same network flagged in Lesson 3''s concentration analysis.

**Step 5 — Remediate.**

- Immediate: independent reporting line for the MLRO to group, not to commercial management
- Backward look: full re-review of 18 months of closed escalations, with retrospective SARs filed and the FIU notified of the programme
- Structural: agent-level risk scoring, distributor exit, mandatory four-eyes on any closure involving a related distributor
- Governance: SAR conversion rate reported monthly to the group board risk committee as a leading indicator

**Outcome.** Retrospective filings were accepted, and the regulator''s finding focused on governance independence rather than on the underlying laundering.

**Takeaway:** A suppressed SAR rate is almost never a rules problem. Look at reporting lines, staffing and the incentives of whoever closes the alert.', 6),
('Lesson 7 — Failure Modes and an Operational Checklist', '### Lesson 7 — Failure Modes and an Operational Checklist

**Failure modes seen repeatedly in African programmes**

1. **Document authenticity mistaken for transparency.** Genuine papers from registers that never captured beneficial ownership.
2. **Blanket de-risking after a grey-listing.** Criticised by supervisors and it destroys legitimate corridors.
3. **Wallet limits treated as controls.** They set the smurfing increment rather than preventing it.
4. **Narrow PEP definitions.** Missing SOE executives, procurement officials and provincial officeholders.
5. **Compliance reporting into commercial management.** The single most common cause of suppressed reporting.
6. **Single sanctions list.** UN, OFAC, OFSI and EU designations diverge materially for African regimes.
7. **English-only adverse media.** Missing French, Portuguese, Arabic, Swahili and Amharic reporting.
8. **No arithmetic sanity checks.** Export volumes exceeding national production; turnover exceeding sector norms.

**Operational checklist**

- [ ] Jurisdiction ratings refreshed after every FATF plenary, applied within 30 days
- [ ] UBO verification standard that does not rely on register availability
- [ ] Agent-level monitoring: float reconciliation, transaction concentration, ID uniqueness, out-of-hours activity
- [ ] Extended PEP taxonomy covering SOEs, procurement, customs, regulators, sub-national officials, and associates
- [ ] Multilingual screening and adverse media across the relevant regional languages
- [ ] Multiple sanctions lists with divergence handled explicitly in policy
- [ ] MLRO independence: reporting line to group compliance and board, never to commercial
- [ ] SAR conversion rate monitored per country as a governance indicator
- [ ] Commodity trade checks including production-capacity and chain-of-custody testing
- [ ] Documented, customer-level rationale for any exit decision

**Closing case study.** A pan-African bank applied this checklist across nine markets. The measurable outcomes were an 18% reduction in alert volume, a threefold increase in SAR conversion, and — the outcome its board cared about — retention of two correspondent relationships that had been under review.

**Takeaway:** Effective African AML programmes are built on independent governance, agent and network analytics, and multilingual data. Policy text is the least important part.', 7)
) AS v(title, content, sort_order)
WHERE c.slug = 'aml-africa';

UPDATE public.academy_courses SET duration_minutes = 20, cpd_hours = 0.5, estimated_words = 3200 WHERE slug = 'aml-africa';

DELETE FROM public.academy_questions q USING public.academy_courses c WHERE q.course_id = c.id AND c.slug = 'aml-africa';

INSERT INTO public.academy_questions (course_id, question, options, correct_index, explanation, sort_order)
SELECT c.id, v.question, v.options::jsonb, v.correct_index, v.explanation, v.sort_order
FROM public.academy_courses c,
(VALUES
('Which FATF-style regional body covers west Africa?', '["GIABA","ESAAMLG","GABAC","CFATF"]', 0, 'GIABA is the FATF-style regional body for west Africa; ESAAMLG covers eastern and southern Africa.', 1),
('Across much of Africa, mutual evaluations typically show which pattern?', '["Effectiveness ratings higher than technical compliance","Technical compliance higher than effectiveness","Both uniformly high","Both uniformly low"]', 1, 'Laws are often in place while supervisory effectiveness lags, which is the practical constraint for firms.', 2),
('A supplier presents an authentic certificate of incorporation and tax clearance. What does this establish?', '["Beneficial ownership transparency","Existence of the entity, not who ultimately owns it","Low AML risk","That EDD is unnecessary"]', 1, 'Registers in many jurisdictions do not record beneficial owners, so authentic documents prove existence only.', 3),
('South Africa and Nigeria were both added to the FATF grey list in which year?', '["2019","2021","2023","2025"]', 2, 'Both were grey-listed at the February 2023 FATF plenary.', 4),
('What is the appropriate firm-level response to a country being grey-listed?', '["Exit all customers of that nationality","Re-score affected customers and evidence risk-based decisions","Ignore it until the next annual review","Apply simplified due diligence"]', 1, 'Blanket de-risking has itself been criticised by supervisors; customer-level assessment is expected.', 5),
('Where does the principal control weakness sit in mobile money?', '["The core banking ledger","The cash-in/cash-out agent layer","The SMS gateway","Interest calculation"]', 1, 'Agents perform identification and are paid by volume, creating a structural conflict of interest.', 6),
('Why are wallet transaction limits a weak standalone control?', '["They are optional","They define the increment used for smurfing","They increase costs","They breach privacy rules"]', 1, 'Value is simply split below the limit across many wallets and SIMs.', 7),
('An operator finds 0.3% of agents handle 22% of cash-out value. What does this indicate?', '["Efficient distribution","Concentration warranting agent-level investigation","A pricing error","Normal seasonality"]', 1, 'Extreme concentration in a small agent set is a classic collection-layer signal.', 8),
('Which population is most often missing from PEP screening scope in the region?', '["Heads of state","SOE executives, procurement and customs officials","Ambassadors","Central bank governors"]', 1, 'Procurement and state-owned enterprise roles carry the bulk of corruption risk.', 9),
('Which commodity presents the highest laundering risk in African extractives?', '["Iron ore","Artisanal gold","Coal","Bauxite"]', 1, 'Gold is bearer value, easily smuggled and becomes fungible after refining.', 10),
('A country''s national gold production is 2 tonnes a year and one customer imports 14 tonnes from it. What test revealed this?', '["Sanctions screening","An arithmetic comparison of volumes against production capacity","Adverse media","PEP screening"]', 1, 'Simple capacity arithmetic exposes transit-country mislabelling of smuggled gold.', 11),
('Most African sanctions regimes are:', '["Comprehensive country embargoes","Targeted at designated persons, entities and sectors","Advisory only","Applied only by the UN"]', 1, 'Targeted designations mean country-level blocking is both over- and under-inclusive.', 12),
('How should hawala operators be assessed?', '["Automatically prohibited","On registration, recordkeeping, screening and settlement evidence","Treated as low risk","Treated as banks"]', 1, 'Informality is not illegality; the question is whether controls and records exist.', 13),
('What does the revised FATF Recommendation 8 expect for non-profits?', '["Sector-wide restrictions","Targeted, risk-based measures based on identified TF risk","Prohibition of cross-border grants","Annual audits by the FIU"]', 1, 'FATF revised R.8 because blanket NPO restriction was ineffective and harmful.', 14),
('A subsidiary escalates 1,400 alerts and files 11 SARs while peers convert at 25%. What is the most likely cause?', '["Better customers","Governance and reporting-line failure at level-two investigation","Superior monitoring rules","Lower transaction volumes"]', 1, 'A suppressed conversion rate points to independence and staffing problems, not rule design.', 15),
('In that case, what was the essential structural remediation?', '["Buying a new monitoring system","An independent MLRO reporting line to group and board","Raising alert thresholds","Reducing agent numbers"]', 1, 'Compliance reporting into commercial management was the root cause of suppressed filings.', 16),
('Why is a single sanctions list insufficient for African exposure?', '["Lists are identical","UN, OFAC, OFSI and EU designations diverge materially","Only UN lists are enforceable","Lists are updated annually"]', 1, 'Designations differ between regimes, so screening against one list leaves gaps.', 17),
('Which languages should adverse-media screening cover for broad African exposure?', '["English only","French, Portuguese, Arabic, Swahili and Amharic alongside English","Only Arabic","Only French"]', 1, 'Relevant reporting frequently appears only in regional and colonial-legacy languages.', 18)
) AS v(question, options, correct_index, explanation, sort_order)
WHERE c.slug = 'aml-africa';