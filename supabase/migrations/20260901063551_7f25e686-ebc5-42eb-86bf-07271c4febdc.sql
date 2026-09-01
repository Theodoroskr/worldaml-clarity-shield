DELETE FROM public.academy_modules m USING public.academy_courses c WHERE m.course_id = c.id AND c.slug = 'aml-gcc-mena';

INSERT INTO public.academy_modules (course_id, title, content, sort_order)
SELECT c.id, v.title, v.content, v.sort_order
FROM public.academy_courses c,
(VALUES
('Lesson 1 — The GCC and MENA Regulatory Map', '### Lesson 1 — The GCC and MENA Regulatory Map

MENA is supervised by **MENAFATF**, with Saudi Arabia and the Gulf Cooperation Council holding FATF membership in their own right. The region combines very high-capacity regulators with jurisdictions under conflict, sanctions or severe capacity constraints — sometimes within a few hundred kilometres of each other.

**Jurisdiction tiers**

| Tier | Examples | Character |
|---|---|---|
| Advanced, enforcement-active | UAE, Saudi Arabia, Qatar, Bahrain | Modern statutes, growing supervisory intensity, heavy trade and wealth flows |
| Developing | Kuwait, Oman, Jordan, Egypt, Morocco | Frameworks in place, uneven DNFBP supervision |
| Constrained/conflict | Lebanon, Libya, Syria, Yemen, Iraq | Cash economies, sanctions overlay, limited supervision |
| Sanctions-dominant | Iran, Syria | Counter-measures and FATF call for action govern the analysis |

**The dual-layer problem in the UAE.** Onshore federal regulation sits alongside financial free zones — the **DIFC**, regulated by the DFSA, and the **ADGM**, regulated by the FSRA — plus dozens of commercial free zones with their own registries. A customer''s "UAE company" may be onshore, DIFC, ADGM or one of forty commercial free zones, each with different disclosure standards. Never treat "UAE registered" as a single risk category.

**Case study.** A European bank assigned one country rating to all UAE corporate clients. A review found that 60% were registered in commercial free zones with no public ownership disclosure and no requirement for audited accounts, while the bank had assumed DIFC-standard governance. The remediation was a registry-level risk attribute — not a country-level one.

**Takeaway:** In the Gulf, the meaningful unit of jurisdiction risk is the registry, not the country. Capture the registering authority as a data field and score it.', 1),
('Lesson 2 — UAE and Saudi Arabia: Regulators and Expectations', '### Lesson 2 — UAE and Saudi Arabia: Regulators and Expectations

**United Arab Emirates.** Federal Decree-Law No. 20 of 2018 and its implementing regulations. Supervisors: the Central Bank (banks, exchange houses, insurance), the Securities and Commodities Authority, the Ministry of Economy (DNFBPs including real estate, precious metals, corporate service providers), plus DFSA and FSRA in the financial free zones. The FIU operates the **goAML** platform for reporting.

The UAE was grey-listed in March 2022 and removed in February 2024 after reforms covering beneficial ownership registration, DNFBP supervision, sanctions enforcement and a substantial increase in STR filing. Post-removal, supervisory intensity has not decreased — inspections and penalties on exchange houses, gold traders and real-estate agents have continued.

**Saudi Arabia.** The Anti-Money Laundering Law (Royal Decree M/20) and the Law on Combating Terrorism Crimes and its Financing. SAMA supervises banks, finance companies and insurers; the CMA supervises capital markets; the Saudi FIU receives reports. Distinctive features: strong central control, rapid Vision 2030-driven growth in new sectors (tourism, entertainment, giga-projects), and heavy procurement flows.

**What supervisors in both markets actually test**

- Whether beneficial ownership is verified and current, not just collected
- Whether STR volumes are consistent with business scale — under-reporting is the most common finding
- Whether sanctions screening covers Arabic-script names and transliteration variants
- Whether DNFBP customers (gold, real estate, CSPs) are treated as higher risk
- Whether senior management have documented, evidenced oversight

**Case study.** An exchange house filed 14 STRs in a year against 4.2 million transactions and a large migrant remittance book. Peer benchmarking suggested a filing rate at least two orders of magnitude higher. The penalty referenced not any single laundering event but the implausibility of the filing volume.

**Takeaway:** In the Gulf, filing volume relative to business scale is itself a supervisory metric. Track it and be able to explain it.', 2),
('Lesson 3 — Trade, Free Zones and Gold', '### Lesson 3 — Trade, Free Zones and Gold

The Gulf sits at the junction of Asian manufacturing, African commodities and European consumption. Re-export trade is a legitimate pillar of the economy and, simultaneously, the region''s largest laundering channel.

**Free zone risk factors**

| Factor | Why it matters |
|---|---|
| 100% foreign ownership with nominee-friendly structures | Ownership chains obscure quickly |
| Goods can transit without entering national customs territory | Documentary trail is thin |
| Company formation in days, dissolution just as fast | Short-lived vehicles are common |
| Multiple registries with inconsistent disclosure | Cross-registry ownership mapping is hard |

**Gold.** Dubai is one of the world''s largest gold trading centres. The risk chain runs: artisanal or conflict-origin gold → cash purchase → transport, sometimes hand-carried → declaration in a transit country → refining → sale into legitimate markets. Cash purchase is the critical control point; the OECD due diligence guidance for mineral supply chains is the reference standard.

**Trade-based indicators specific to the region**

- Goods described generically ("general merchandise", "electronic parts") with no unit pricing
- Payment routed by a party not named on the invoice, frequently from a third country
- Circular trade: the same goods re-exported between related companies
- Value declared to customs materially different from value paid
- Freight and insurance costs implausible for the declared goods

**Case study — worked.** A bank reviewed a DMCC-registered trading company with USD 210m annual turnover, three employees and one office. Trade was described as "precious metals and general trading". Testing found: 78% of receipts came from parties not named on any invoice; the same two Hong Kong and one Turkish counterparty appeared on both sides of transactions; and gold weights declared on export exceeded documented purchases by 40%. Individually each was arguable. Together they evidenced circular trade financing gold of undocumented origin. The bank exited and filed.

**Takeaway:** Free zone trade requires substance testing — employees, premises, unit pricing, and payer identity — because documentary consistency alone can be manufactured.', 3),
('Lesson 4 — Hawala, Exchange Houses and Remittance Corridors', '### Lesson 4 — Hawala, Exchange Houses and Remittance Corridors

The GCC hosts the world''s largest migrant workforce relative to population, and remittance is a core financial service. Exchange houses handle enormous volumes of small, legitimate transfers — and are consequently a priority supervisory target.

**Hawala.** A value-transfer arrangement settled between brokers rather than by cross-border payment. In the UAE, hawaladars must register with the Central Bank and obtain a certificate; unregistered operation is an offence. The compliance test for a bank is whether a customer''s account is being used to settle third-party value transfer — that is, acting as an unlicensed money transmitter.

**Signals that a customer account is being used for unlicensed transmission**

| Signal | Explanation |
|---|---|
| Many small inbound credits from unrelated individuals | Collection side of the corridor |
| Regular outbound bulk transfers to one or two overseas counterparties | Settlement side |
| Narratives such as "family support" on commercial-scale volumes | Mismatch between stated purpose and scale |
| Personal account turnover far exceeding declared salary | Classic pass-through indicator |
| Cash deposits followed within 48 hours by international transfer | Minimal dwell time |

**Exchange house control expectations.** Sender and beneficiary identification at the branch and agent level; aggregation of a sender''s transfers across branches and across beneficiaries; screening of both parties, in Arabic and Latin scripts; and monitoring for beneficiary concentration — many senders funding one receiver.

**Case study.** A GCC exchange house''s corridor to south Asia showed 1,100 senders remitting to 26 beneficiaries over six months. Each transfer was under USD 1,500 and each sender was an identified worker. The pattern was salary-collection fraud: an employer paid workers, then required them to remit to accounts it controlled. Only aggregation on the **beneficiary** side revealed it — sender-side monitoring showed nothing unusual.

**Takeaway:** In remittance, monitor beneficiaries as rigorously as senders. Concentration on the receiving side is the strongest single indicator of corridor abuse.', 4),
('Lesson 5 — Sanctions Exposure and Regional Evasion', '### Lesson 5 — Sanctions Exposure and Regional Evasion

The region sits adjacent to several of the world''s most heavily sanctioned economies, which makes transshipment and re-export the central sanctions risk.

**Principal exposures**

- **Iran.** Comprehensive US sanctions; FATF call for action. Evasion routes use front companies in neighbouring jurisdictions, oil sold with falsified origin documents, and shipping practices such as AIS disabling and ship-to-ship transfers.
- **Syria and Russia-related restrictions.** Dual-use and high-priority battlefield goods re-exported through third countries. Export-control authorities have issued specific lists of Harmonised System codes to watch.
- **Yemen, Libya, Iraq.** Designated individuals and militia-linked entities; heavy cash economies.

**Detection controls**

| Control | Implementation |
|---|---|
| High-priority goods screening | Flag HS codes on published control lists; require end-user documentation |
| Vessel screening | IMO number, AIS gap detection, ship-to-ship transfer indicators |
| Ownership aggregation | OFAC 50 Percent Rule and EU/UK control tests applied to indirect chains |
| Free-text screening | Narrative and reference fields, not just party names |
| Re-export destination testing | Compare declared destination to the customer''s historic markets |

**Arabic-script screening.** Configure for the definite article (al-, el-), inconsistent transliteration of the same name (Mohammed/Muhammad/Mohamed), patronymic chains (bin/ibn/bint), and the fact that many designated names exist in official lists only in Latin transliteration. Test your engine with known variants before relying on it.

**Case study.** A trading customer''s exports of industrial pumps to a central Asian buyer grew from USD 400k to USD 9m in eight months. The buyer had been incorporated four months earlier. The goods fell within a published high-priority list. The customer produced an end-user certificate; verification showed the named end user had no manufacturing facility. The bank filed and exited. The sole detection trigger was the growth-plus-new-counterparty conjunction, since no party was designated.

**Takeaway:** Sanctions evasion rarely presents as a name match. It presents as new counterparties, sudden growth, controlled goods and implausible end users.', 5),
('Lesson 6 — Worked Case: Real Estate and a Politically Exposed Buyer', '### Lesson 6 — Worked Case: Real Estate and a Politically Exposed Buyer

**Scenario.** You are MLRO at a Dubai bank. A real-estate developer client requests processing of an AED 46m (USD 12.5m) purchase of four apartments. The buyer is a company registered in a commercial free zone, owned by a foundation in a European jurisdiction. The named ultimate beneficiary is the adult son of a serving minister in a north African state.

**Step 1 — Establish the structure.** Map the chain: free zone company → foundation → named beneficiary class. Obtain the foundation''s constitutive documents, the register of beneficiaries, and the identity of the protector. Establish who can direct distributions — the control question matters more than the ownership percentage.

**Step 2 — Classify the risk.** Family member of a foreign PEP triggers mandatory EDD: senior management approval, established source of wealth and source of funds, and enhanced ongoing monitoring.

**Step 3 — Test source of wealth.** The stated source is "returns from a family construction business". Testing requires: audited accounts for the business over several years, evidence that its contracts were not awarded by the minister''s department, dividend records reconciling to the sums involved, and adverse-media screening in Arabic and French.

**Step 4 — Evaluate what you find.** Accounts exist for two years only. 80% of revenue derives from public-sector contracts in the ministry''s sector. Dividends declared over three years total roughly USD 1.9m against a USD 12.5m purchase. Payment is proposed from a third-country account in the name of a different company.

**Step 5 — Decide.** Source of wealth is not established, the shortfall is unexplained, the payer is a third party, and the contract origin creates a direct corruption nexus. Outcome: decline the transaction, file an STR through goAML, and review the developer relationship for its own onboarding standards — it presented the buyer as fully vetted.

**Step 6 — Record.** Document the analysis, the arithmetic, the senior management decision and the notification. In a later inspection, the file is the control.

**Takeaway:** For PEP-linked real estate, the decisive test is arithmetic: does documented, lawfully-derived wealth cover the purchase price? If it does not, no amount of structure documentation resolves it.', 6),
('Lesson 7 — Failure Modes and an Operational Checklist', '### Lesson 7 — Failure Modes and an Operational Checklist

**Failure modes seen repeatedly in GCC and MENA programmes**

1. **Country-level risk rating for the UAE**, ignoring the difference between onshore, DIFC, ADGM and commercial free zones.
2. **Under-filing of STRs**, the single most commonly penalised deficiency in the region.
3. **Latin-script-only screening**, missing Arabic-script names and transliteration variants.
4. **Documentary trade checking** that verifies internal consistency but never tests price, substance or payer identity.
5. **Sender-only remittance monitoring**, blind to beneficiary concentration.
6. **PEP status treated as a label**, without source-of-wealth arithmetic.
7. **Reliance on introducers** — developers, brokers and corporate service providers — as if their vetting were your own.
8. **Grey-list complacency.** UAE''s 2024 delisting did not reduce supervisory expectations.

**Operational checklist**

- [ ] Registering authority captured as a customer data field and risk-scored
- [ ] STR filing rate benchmarked against business volume and reported to senior management
- [ ] Screening tested with Arabic-script and transliteration variant test packs
- [ ] Trade substance testing: employees, premises, unit pricing, payer-versus-invoice matching
- [ ] Beneficiary-side aggregation in remittance corridors
- [ ] High-priority goods HS-code list embedded in trade finance screening
- [ ] Vessel screening including IMO number and AIS-gap indicators
- [ ] PEP files include source-of-wealth arithmetic reconciling wealth to transaction value
- [ ] Introducer due diligence with periodic file sampling of what they onboard
- [ ] goAML (or local FIU platform) filing quality reviewed for narrative completeness

**Closing case study.** A Gulf bank that implemented registry-level risk scoring and beneficiary-side aggregation saw STR filings rise fourfold in a year while alert volume fell 20%. Its next supervisory inspection closed with no material findings — the change the regulator credited was the ability to explain, with data, why each customer sat where it did.

**Takeaway:** Gulf supervisors test evidence and plausibility. A programme that can reconcile wealth to transactions and filings to volumes will withstand inspection.', 7)
) AS v(title, content, sort_order)
WHERE c.slug = 'aml-gcc-mena';

UPDATE public.academy_courses SET duration_minutes = 20, cpd_hours = 0.5, estimated_words = 3200 WHERE slug = 'aml-gcc-mena';

DELETE FROM public.academy_questions q USING public.academy_courses c WHERE q.course_id = c.id AND c.slug = 'aml-gcc-mena';

INSERT INTO public.academy_questions (course_id, question, options, correct_index, explanation, sort_order)
SELECT c.id, v.question, v.options::jsonb, v.correct_index, v.explanation, v.sort_order
FROM public.academy_courses c,
(VALUES
('Which body is the FATF-style regional body for the Middle East and North Africa?', '["MENAFATF","GIABA","APG","GAFILAT"]', 0, 'MENAFATF is the FATF-style regional body covering the MENA region.', 1),
('Why should "UAE registered" not be treated as a single risk category?', '["Because the UAE is grey-listed","Because onshore, DIFC, ADGM and commercial free zones have different disclosure standards","Because registration is optional","Because all UAE entities are high risk"]', 1, 'The registering authority determines disclosure, audit and governance standards, so it must be captured and scored.', 2),
('Which authority regulates firms in the DIFC?', '["DFSA","FSRA","SCA","SAMA"]', 0, 'The DFSA regulates the DIFC; the FSRA regulates the ADGM.', 3),
('The UAE was removed from the FATF grey list in which year?', '["2020","2022","2024","2026"]', 2, 'The UAE was grey-listed in March 2022 and removed in February 2024.', 4),
('What is the UAE FIU''s reporting platform called?', '["goAML","FINTRAC Web","SARS Online","STRO Direct"]', 0, 'Reports are submitted through the goAML platform.', 5),
('An exchange house files 14 STRs against 4.2 million transactions. Why is this a supervisory concern in itself?', '["STR volume is capped","Filing volume implausible against business scale indicates systemic under-reporting","Exchange houses cannot file STRs","Only banks may file"]', 1, 'Under-reporting relative to business scale is the region''s most commonly penalised deficiency.', 6),
('Which factor most increases free zone company risk?', '["Corporate tax rates","Rapid formation, nominee-friendly ownership and thin customs trails","Office rental costs","Local labour law"]', 1, 'These features let ownership chains and goods movements become opaque quickly.', 7),
('What is the critical control point in the gold laundering chain?', '["Retail jewellery sale","Cash purchase of artisanal or conflict-origin gold","Vault storage","Hallmarking"]', 1, 'Cash purchase at origin is where undocumented gold enters the chain before refining makes it fungible.', 8),
('A DMCC company has USD 210m turnover, three employees and 78% of receipts from parties not named on invoices. What does this evidence?', '["Efficient operations","Circular trade and probable trade-based laundering","Ordinary re-export activity","A currency mismatch"]', 1, 'Lack of substance combined with third-party payment and weight discrepancies indicates circular trade.', 9),
('In the UAE, hawaladars must:', '["Operate anonymously","Register with the Central Bank and hold a certificate","Be licensed as banks","Report only annually"]', 1, 'Unregistered hawala operation is an offence; registration and recordkeeping are required.', 10),
('Which pattern suggests a personal account is being used for unlicensed money transmission?', '["Salary credit and rent debit","Many small credits from unrelated individuals followed by bulk overseas transfers","Occasional card spending","Fixed deposit rollovers"]', 1, 'Collection followed by bulk settlement is the classic unlicensed transmission signature.', 11),
('1,100 senders remit to 26 beneficiaries in one corridor. Which monitoring approach revealed the abuse?', '["Sender-side thresholds","Beneficiary-side aggregation","Currency conversion checks","Branch cash limits"]', 1, 'Concentration on the receiving side is the strongest indicator of corridor abuse.', 12),
('Which shipping behaviours indicate probable sanctions evasion?', '["Scheduled port calls","AIS disabling and ship-to-ship transfers","Container standardisation","Use of bills of lading"]', 1, 'Both are recognised indicators used to disguise cargo origin and destination.', 13),
('Which name-matching configuration is essential for Arabic-script exposure?', '["Ignoring middle names","Handling al-/el- articles, transliteration variants and bin/ibn patronymics","Exact match only","Numeric matching"]', 1, 'These features cause both misses and excessive false positives if unconfigured.', 14),
('A customer''s exports of controlled goods grow from USD 400k to USD 9m to a four-month-old buyer. What triggered detection?', '["A sanctions name match","The conjunction of rapid growth, new counterparty and controlled goods","A currency alert","A PEP hit"]', 1, 'No party was designated; the conjunction of behavioural factors was the signal.', 15),
('For a PEP''s family member purchasing property, what is the decisive test?', '["Whether the structure is legally valid","Whether documented lawful wealth arithmetically covers the purchase price","Whether the developer vouches for them","Whether the passport is valid"]', 1, 'Source of wealth must reconcile numerically to the transaction; structure documents do not substitute.', 16),
('Payment for a property purchase is offered from a third-country account in another company''s name. This is:', '["Acceptable if the amount matches","A third-party payment red flag requiring explanation or refusal","Standard practice","Only a tax matter"]', 1, 'Third-party payment breaks the link between the customer and the funds and must be resolved.', 17),
('What is the correct view of reliance on developers, brokers and corporate service providers as introducers?', '["Their vetting replaces yours","You remain responsible and should sample-test what they onboard","They must be exited","They are exempt from AML rules"]', 1, 'Reliance does not transfer responsibility; introducer due diligence and file sampling are expected.', 18)
) AS v(question, options, correct_index, explanation, sort_order)
WHERE c.slug = 'aml-gcc-mena';