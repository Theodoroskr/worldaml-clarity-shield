DELETE FROM public.academy_modules m USING public.academy_courses c WHERE m.course_id = c.id AND c.slug = 'aml-asia-pacific';

INSERT INTO public.academy_modules (course_id, title, content, sort_order)
SELECT c.id, v.title, v.content, v.sort_order
FROM public.academy_courses c,
(VALUES
('Lesson 1 — The APAC Regulatory Map', '### Lesson 1 — The APAC Regulatory Map

Asia-Pacific is not a single AML jurisdiction. It is roughly forty regimes supervised by two FATF-style regional bodies: the **Asia/Pacific Group on Money Laundering (APG)** covering most of the region, and the **Eurasian Group** for parts of Central Asia. A single regional policy will therefore always be wrong somewhere; you need a jurisdiction matrix.

**The four tiers you should model**

| Tier | Examples | Supervisory intensity | Practical implication |
|---|---|---|---|
| Mature | Singapore, Hong Kong, Japan, Australia, New Zealand | High, enforcement-active | Expect thematic reviews, s.166-style skilled person reports |
| Developing | Malaysia, Thailand, Indonesia, India, Philippines | Rising, uneven | Rules exist; supervision is patchy — do not rely on local licensing as assurance |
| Constrained | Cambodia, Laos, Myanmar, PNG | Weak, resource-poor | Treat local documents as unverified until independently corroborated |
| Prohibited/High-risk | DPRK, Myanmar (FATF call for action) | N/A | Sanctions and counter-measures dominate the analysis |

**Why the mature tier still generates the largest fines.** Volume and connectivity. Singapore and Hong Kong intermediate flows for the whole region, so a weakness there is a weakness for every counterparty. Australia''s AUSTRAC actions against Westpac (23 million reporting failures) and Crown Resorts show that the fine follows systemic reporting failure, not a single laundering event.

**Case study — the "one policy" failure.** A European payments firm applied its EU simplified due diligence tier to customers in five APAC markets because each held a local licence. In two of those markets the licence involved no fitness-and-propriety check on ultimate owners. Two customers turned out to be fronts for an illegal gambling operator. The regulator''s criticism was not the missed customer; it was the group''s assumption that "licensed" carried the same meaning everywhere.

**Takeaway:** Build a jurisdiction matrix that records supervisory strength, register quality, and document reliability separately from formal legal status. Licence held is a data point, not an assurance.', 1),
('Lesson 2 — Singapore and Hong Kong: Standards and Pressure Points', '### Lesson 2 — Singapore and Hong Kong: Standards and Pressure Points

**Singapore.** The Monetary Authority of Singapore (MAS) supervises under the Notices to Banks (MAS 626) and the CDD requirements they impose; the Suspicious Transaction Reporting Office (STRO) receives STRs under the Corruption, Drug Trafficking and Other Serious Crimes Act. Distinctive features: no de minimis threshold for STRs, personal criminal liability for failing to report, and an expectation of source-of-wealth corroboration for higher-risk wealth clients rather than self-declaration.

**Hong Kong.** The Anti-Money Laundering and Counter-Terrorist Financing Ordinance (AMLO) applies to financial institutions and, since 2018, to designated non-financial businesses. The HKMA and SFC supervise; the Joint Financial Intelligence Unit receives STRs. Distinctive features: heavy reliance on corporate service providers, and a very large volume of shell-company incorporations that are legal but structurally opaque.

**The 2023 Singapore money-laundering case** — S$3bn in assets seized from a network holding multiple passports, using family offices, property and luxury goods — reset expectations across the region. The regulatory follow-through focused on three things: nationality/passport inconsistencies as a standalone red flag, source-of-wealth evidence for tax-incentivised family office structures, and information-sharing between banks (the COSMIC platform).

**Operational pressure points**

- Multiple passports or residence-by-investment status not reconciled to a single tax residency
- Family office vehicles claiming incentive status with no verifiable operating wealth history
- Corporate service provider nominee directors sitting across hundreds of entities
- Trade flows routed through both centres with no commercial rationale

**Case study.** A private bank onboarded a client with a Cypriot passport, a PRC birthplace and a Vanuatu passport used for account opening. Source of wealth was "family business proceeds". The RM accepted an unaudited summary. Two years later law enforcement linked the funds to an offshore gambling network. The failure was documentary: no corroboration, no reconciliation of identity documents, no adverse-media re-run in Chinese-language sources.

**Takeaway:** In both centres, the control that matters is corroborated source of wealth plus identity reconciliation across every document a client presents.', 2),
('Lesson 3 — China, Japan, Korea and India: Four Different Problems', '### Lesson 3 — China, Japan, Korea and India: Four Different Problems

**China.** The People''s Bank of China supervises AML; capital controls (a USD 50,000 annual individual conversion quota) shape typologies more than AML rules do. The dominant mechanism is **underground banking / mirror transfers**: value is paid in RMB onshore to a broker and released offshore in another currency, leaving no cross-border payment record. For a foreign institution, the visible artefact is a customer receiving third-party funds from unrelated individuals in small, repeated amounts.

**Japan.** Historically criticised by FATF for weak beneficial ownership verification and low STR quality. The 2021 mutual evaluation triggered a national action plan; the Financial Services Agency has since pushed banks toward transaction-monitoring modernisation and shared utilities. Practical implication: Japanese counterparties may hold thin UBO records for older corporate customers.

**South Korea.** KoFIU operates a real-name financial transaction regime and, unusually, imposed the **travel rule on virtual asset service providers** early with strict local licensing. Foreign exchanges without Korean registration cannot serve Korean residents — an issue that surfaces as residency masking via VPN and foreign ID.

**India.** The Prevention of Money Laundering Act with the Financial Intelligence Unit-India; the distinguishing feature is the sheer scale of low-value digital payments (UPI) and a large cash economy. Typologies concentrate in mule-account farms, shell entities used for GST invoice fraud, and hawala.

**Case study.** A UK e-money issuer saw 400 accounts opened by Indian students in one quarter, each receiving 6–10 inbound transfers of GBP 400–900 from unrelated senders and immediately transferring out to three merchant accounts. Individually each account was low value; collectively it was a GBP 2.4m mule network. Detection required **network analysis**, not per-account thresholds.

**Decision rule:** For China exposure, monitor third-party funders. For India exposure, monitor shared devices, shared beneficiaries and account-opening cohorts. Neither is caught by an amount threshold.

**Takeaway:** Match the control to the mechanism — mirror transfers, thin UBO records, travel-rule evasion and mule networks each need a different detection method.', 3),
('Lesson 4 — Casinos, Junkets and Underground Banking', '### Lesson 4 — Casinos, Junkets and Underground Banking

Asia-Pacific hosts the largest concentration of casino-linked laundering risk in the world. The mechanism is not the gaming floor; it is the credit and settlement layer around it.

**How junket laundering works**

1. A junket operator extends credit to a player in Macau, Manila or a Mekong border zone.
2. The player gambles; wins or unspent chips are settled offshore in a different currency.
3. The junket nets positions across players and jurisdictions, so no single cross-border payment matches any single player.
4. Settlement reaches the banking system as a corporate payment from a "consultancy" or "travel" company.

The Philippines'' Bangladesh Bank heist (USD 81m, 2016) ran through exactly this layer: funds entered casino accounts, were converted to chips, and exited as clean settlement. Philippine casinos were only brought within the AML regime afterwards, in 2017.

**Special economic zones.** Border SEZs — notably the Golden Triangle SEZ in Laos and zones in Cambodia and Myanmar — combine casinos, crypto exchanges and scam compounds. The US and UK have sanctioned operators in this space. Any counterparty whose registered address sits in such a zone warrants enhanced due diligence regardless of stated business.

**Detection markers for banking counterparties**

| Marker | Why it matters |
|---|---|
| Payments described as "marketing", "consultancy" or "travel services" to Macau/Manila entities | Classic junket settlement wrapper |
| Round-amount USD transfers to entities incorporated within 90 days | Netting vehicles are short-lived |
| Directors also listed on gaming or "entertainment" companies | Junket ecosystem overlap |
| Customer receives funds from multiple casino-adjacent payers | Player-side collection |

**Case study.** A Hong Kong trading company banked USD 42m over 14 months, described as electronics wholesale. Goods flows were unverifiable; the counterparties were six Macau "travel" companies sharing two directors. Trade documents existed but described generic "consumer electronics" with no unit pricing. The bank exited after a trade-document review, not after a monitoring alert — the amounts were consistent and never breached a threshold.

**Takeaway:** Casino-related risk enters mainstream banking disguised as ordinary corporate services. Test the commercial substance of the payer, not the payment size.', 4),
('Lesson 5 — Virtual Assets, Scam Compounds and the Travel Rule', '### Lesson 5 — Virtual Assets, Scam Compounds and the Travel Rule

APAC leads the world in both virtual asset adoption and virtual-asset-enabled crime. Three structures dominate.

**1. Pig-butchering (romance investment fraud).** Industrial-scale operations run from compounds in Myanmar, Cambodia and Laos, often using trafficked workers. Victim funds move fiat → local mule accounts → licensed exchange → USDT on Tron → mixers or high-risk exchanges. For a bank, the visible stage is the mule account; for a VASP, it is the withdrawal pattern.

**2. Travel rule fragmentation.** Singapore, Japan, South Korea and Hong Kong enforce the travel rule; several neighbouring markets do not. Transfers from a compliant VASP to a non-compliant one create the "sunrise problem": originator data is sent and discarded. Your policy must specify what you do when the counterparty cannot receive data — most mature firms restrict or block rather than transmit blindly.

**3. Unlicensed offshore exchanges serving licensed markets.** Residency masking via VPN and foreign identity documents is routine. Detect through device and IP telemetry, not stated address.

**Control set**

- Blockchain analytics on deposits and withdrawals with a documented risk threshold for exposure to sanctioned or mixer addresses
- Counterparty VASP due diligence: licence status, travel-rule capability, and ownership
- Mule-detection on the fiat side: rapid pass-through, dormant accounts reactivating, shared devices
- Named-victim reporting channels and rapid freeze capability — recovery is measured in hours

**Case study.** An exchange licensed in one APAC market processed USDT withdrawals of USD 6.8m over three months to a cluster of addresses later attributed to a Cambodian scam compound. Deposits came from 214 retail customers, average USD 32,000, most aged over 55, most funded by newly opened bank transfers. Every individual account passed KYC. The failure was that no rule joined customer age, funding recency and common withdrawal destination — that conjunction, not any single field, was the signal.

**Takeaway:** In the virtual asset layer, risk is expressed as clusters and destinations. Monitoring built only on individual customer thresholds will not see it.', 5),
('Lesson 6 — Worked Case: Building an APAC Correspondent Programme', '### Lesson 6 — Worked Case: Building an APAC Correspondent Programme

**Scenario.** A EUR 40bn European bank offers USD and EUR correspondent clearing to 60 respondent banks across nine APAC markets. A regulatory review finds no differentiation between respondents in Tokyo and in Phnom Penh. You have 90 days to remediate.

**Step 1 — Segment the book.** Score each respondent on five weighted dimensions:

| Dimension | Weight | Evidence |
|---|---|---|
| Jurisdiction AML strength | 25% | FATF/APG evaluation ratings, grey-list status |
| Respondent ownership and PEP exposure | 25% | UBO chain, state ownership, PEP directors |
| Nested/downstream relationships | 20% | Does the respondent clear for other banks? |
| Product risk | 15% | Trade finance, cash letters, payable-through accounts |
| Historic behaviour | 15% | RFI response quality, alert rate, sanctions hits |

**Step 2 — Set gating rules.** Payable-through accounts prohibited. Nesting permitted only with a disclosed list of downstream institutions refreshed quarterly. Any respondent scoring above 70 requires an on-site visit within 12 months.

**Step 3 — Build the monitoring that fits.** Correspondent monitoring cannot use customer-level rules. Use: sender/beneficiary concentration by country pair, sudden change in currency mix, growth in volume against declared business plan, and a monthly sample-testing regime of 25 payments per high-risk respondent.

**Step 4 — Evidence the decision.** Three respondents score above 85: one in a jurisdiction under a FATF call for action, one with undisclosed nesting for four institutions, one whose chairman is a serving minister. Outcome: exit the first, remediate the second within 60 days with disclosure conditions, and retain the third under an EDD file with ministerial-PEP approval at board committee level.

**Step 5 — Result.** Volume falls 12%; alert quality rises — investigator hit-rate goes from 3% to 19% because rules are calibrated per segment rather than per book.

**Takeaway:** Differentiation is the deliverable. A correspondent programme that treats a Tokyo clearer and a frontier-market respondent identically is deficient even if every individual control is documented.', 6),
('Lesson 7 — Failure Modes and an Operational Checklist', '### Lesson 7 — Failure Modes and an Operational Checklist

**The seven failure modes seen most often in APAC programmes**

1. **Licence equivalence.** Treating any local licence as evidence of AML supervision.
2. **English-only screening.** Missing adverse media and sanctions matches in Chinese, Japanese, Korean, Thai and Bahasa sources; missing romanisation variants (Zhang/Chang, Lee/Li/Ly).
3. **Threshold-only monitoring.** Mule networks and junket settlement sit deliberately below thresholds.
4. **Unverified source of wealth.** Accepting self-declaration for high-net-worth and family-office clients.
5. **Nested relationships undisclosed.** Correspondent exposure to institutions you never onboarded.
6. **Static jurisdiction ratings.** Grey-list additions and removals move several times a year; a rating set annually is out of date within months.
7. **No local-language investigation capability.** Escalations stall because nobody can read the source document.

**Name-matching note.** Transliteration is the single largest source of screening error in the region. Configure your screening engine to handle: surname-first ordering, multiple romanisation systems (Pinyin, Wade-Giles, Hepburn, Revised Romanization), generational and honorific particles (bin, binti, a/l, a/p), and the absence of a family name in parts of Indonesia and Myanmar.

**Operational checklist**

- [ ] Jurisdiction matrix maintained with supervisory strength, register quality and refresh date
- [ ] Screening configured for CJK scripts and at least two romanisation variants per name
- [ ] Source-of-wealth corroboration standard defined by risk tier, with documentary examples
- [ ] Network-level monitoring rules (shared device, shared beneficiary, cohort onboarding)
- [ ] VASP counterparty due diligence including travel-rule capability
- [ ] Correspondent nesting disclosure refreshed quarterly
- [ ] Grey-list monitoring subscribed to FATF plenary outcomes, applied within 30 days
- [ ] Local-language investigative capability or a contracted provider per major market

**Case study — closing.** A regional bank rebuilt on these lines cut its false-positive rate by 46% while doubling confirmed-suspicion SAR conversions. The change was not a new system; it was per-jurisdiction calibration and CJK screening configuration.

**Takeaway:** APAC compliance is won on configuration and local evidence quality, not on policy length.', 7)
) AS v(title, content, sort_order)
WHERE c.slug = 'aml-asia-pacific';

UPDATE public.academy_courses SET duration_minutes = 20, cpd_hours = 0.5, estimated_words = 3200 WHERE slug = 'aml-asia-pacific';

DELETE FROM public.academy_questions q USING public.academy_courses c WHERE q.course_id = c.id AND c.slug = 'aml-asia-pacific';

INSERT INTO public.academy_questions (course_id, question, options, correct_index, explanation, sort_order)
SELECT c.id, v.question, v.options::jsonb, v.correct_index, v.explanation, v.sort_order
FROM public.academy_courses c,
(VALUES
('Which FATF-style regional body covers most Asia-Pacific jurisdictions?', '["APG","MONEYVAL","GAFILAT","ESAAMLG"]', 0, 'The Asia/Pacific Group on Money Laundering (APG) is the FATF-style regional body for most of the region.', 1),
('A customer holds a local licence in a developing APAC market. What weight should this carry in your risk assessment?', '["It permits simplified due diligence","It is a data point, not assurance of AML supervision","It removes the need for UBO verification","It automatically qualifies the client as low risk"]', 1, 'Licensing regimes vary widely in rigour; a licence is evidence of registration, not of effective supervision.', 2),
('What is the defining feature of Singapore''s STR regime?', '["A SGD 20,000 reporting threshold","No de minimis threshold and personal liability for failure to report","Reports filed annually","Reports only required for cash transactions"]', 1, 'Singapore imposes no monetary threshold for STRs and attaches personal criminal liability to failure to report.', 3),
('The 2023 Singapore money-laundering case most sharply raised expectations around which control?', '["Branch cash limits","Corroborated source of wealth and reconciliation of multiple identity documents","ATM withdrawal monitoring","Cheque clearing times"]', 1, 'Multiple passports and unverified source of wealth in family office structures were the central failings.', 4),
('An onshore RMB payment is matched by an offshore USD release with no cross-border payment record. What is this?', '["A documentary credit","A mirror transfer through underground banking","A SWIFT MT202 cover payment","A netting agreement"]', 1, 'Mirror transfers settle value in two jurisdictions separately, leaving no cross-border payment trail.', 5),
('Which visible artefact most commonly signals underground banking at a foreign institution?', '["Large single wire transfers","Repeated third-party inbound funds from unrelated individuals","Payments to government agencies","Standing orders to utilities"]', 1, 'The customer receives funds from unrelated third parties because value was collected onshore by a broker.', 6),
('Which country imposed the virtual asset travel rule early with strict local VASP registration?', '["Cambodia","South Korea","Laos","Papua New Guinea"]', 1, 'KoFIU in South Korea introduced early and strict travel rule and registration requirements for VASPs.', 7),
('400 low-value accounts share inbound senders and three common beneficiaries. What detection method is required?', '["Higher amount thresholds","Network analysis across accounts","Annual KYC refresh","Enhanced cash reporting"]', 1, 'Mule networks are visible only when accounts are analysed collectively, not individually.', 8),
('In junket laundering, why does no single cross-border payment match a single player?', '["Players use cash only","Positions are netted across players and jurisdictions","Casinos are exempt from reporting","Chips are non-transferable"]', 1, 'The junket operator nets exposures, so settlement payments do not correspond to individual gaming activity.', 9),
('Which payment narrative most commonly wraps junket settlement into the banking system?', '["Payroll","Consultancy, marketing or travel services","Dividend distribution","Tax payment"]', 1, 'Generic service descriptions are used because they are hard to disprove and require no goods flow.', 10),
('A counterparty is registered inside a Mekong border special economic zone. What is the appropriate response?', '["Standard due diligence","Enhanced due diligence regardless of stated business","Simplified due diligence if licensed locally","No action if no sanctions hit"]', 1, 'These zones concentrate casino, crypto and scam-compound activity and warrant EDD by default.', 11),
('What is the "sunrise problem" in virtual asset compliance?', '["Time-zone differences in reporting","Transfers to jurisdictions that have not implemented the travel rule","Morning liquidity gaps","Daylight saving errors in timestamps"]', 1, 'Originator information sent to a non-implementing counterparty is not received or retained.', 12),
('In the pig-butchering typology, which stage is normally visible to a retail bank?', '["The compound''s payroll","The victim''s mule-account transfers","The mixer transaction","The USDT bridge"]', 1, 'Banks see the fiat leg — victim funds moving to mule accounts before conversion.', 13),
('An exchange''s risk signal was the conjunction of customer age, funding recency and common withdrawal destination. What does this illustrate?', '["Thresholds are sufficient","Conjunction rules are needed because single fields look normal","KYC should be removed","Only sanctions screening matters"]', 1, 'The individual attributes were unremarkable; only their combination revealed the scam cluster.', 14),
('In correspondent banking, which arrangement should normally be prohibited outright?', '["Nostro accounts","Payable-through accounts","USD clearing","Trade finance confirmations"]', 1, 'Payable-through accounts allow a respondent''s customers direct access and are treated as unacceptable risk.', 15),
('What condition should apply where nesting is permitted for a respondent bank?', '["No condition","A disclosed downstream institution list refreshed quarterly","Annual attestation only","Volume caps only"]', 1, 'Undisclosed nesting creates exposure to institutions you never onboarded; disclosure must be current.', 16),
('Which is the largest single source of screening error across APAC name data?', '["Date of birth formats","Transliteration and romanisation variance","Address abbreviations","Currency codes"]', 1, 'Multiple romanisation systems and name-ordering conventions cause both misses and false positives.', 17),
('How quickly should a firm apply a FATF plenary grey-list change to its jurisdiction ratings?', '["Within 30 days","At the next annual review","Only if a customer is affected","Within two years"]', 0, 'Grey-list changes occur several times a year; a prompt defined refresh (around 30 days) keeps ratings current.', 18)
) AS v(question, options, correct_index, explanation, sort_order)
WHERE c.slug = 'aml-asia-pacific';