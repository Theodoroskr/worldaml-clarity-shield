DELETE FROM public.academy_modules m USING public.academy_courses c WHERE m.course_id = c.id AND c.slug = 'aml-americas';

INSERT INTO public.academy_modules (course_id, title, content, sort_order)
SELECT c.id, v.title, v.content, v.sort_order
FROM public.academy_courses c,
(VALUES
('Lesson 1 — The Americas Regulatory Map', '### Lesson 1 — The Americas Regulatory Map

The Americas contain three overlapping AML systems: the United States regime, which exports itself through the US dollar; the Canadian and Latin American national regimes; and the offshore financial centres of the Caribbean.

**Regional bodies.** North America sits inside FATF directly. Latin America is covered by **GAFILAT**, the Caribbean by the **CFATF**. Both produce mutual evaluations, but enforcement capacity varies enormously.

| Bloc | Primary drivers of risk | Supervisory reality |
|---|---|---|
| United States | Dollar clearing, shell companies, real estate, cash-intensive business | Aggressive enforcement, extraterritorial reach |
| Canada | Real estate, casinos, MSB sector | FINTRAC active; historic weakness in penalties |
| Mexico / Central America | Narcotics proceeds, remittances, cash repatriation | Strong laws, constrained enforcement |
| Brazil / Andean region | Corruption, trade-based laundering, informal FX | Improving; Lava Jato reshaped expectations |
| Caribbean | Offshore incorporation, citizenship-by-investment, correspondent de-risking | Small supervisors, large volumes |

**The dollar as jurisdiction.** Any transaction cleared in USD touches a US correspondent, so OFAC sanctions and US predicate offences apply far beyond US borders. This is why a European or Middle Eastern bank with no US presence can still face a US enforcement action — the nexus is the clearing leg, not the office.

**Case study.** A Latin American bank processed USD 900m for exchange houses in a border region. It held no US licence and argued US rules did not apply. Because every payment cleared through a New York correspondent, US authorities asserted jurisdiction; the bank lost its correspondent relationships and effectively left the dollar market. De-risking, not the fine, was the fatal outcome.

**Takeaway:** In the Americas, model your exposure by currency and clearing route as well as by customer location. USD clearing imports the US regime into your programme.', 1),
('Lesson 2 — The United States Framework', '### Lesson 2 — The United States Framework

**Statutory base.** The Bank Secrecy Act (1970) as amended by the USA PATRIOT Act (2001) and the Anti-Money Laundering Act of 2020. FinCEN writes the rules; the federal banking agencies, SEC, CFTC and IRS examine for them; DOJ prosecutes.

**The five pillars of a US AML programme**

1. Internal policies, procedures and controls
2. A designated BSA compliance officer
3. Ongoing employee training
4. Independent testing
5. Risk-based customer due diligence including beneficial ownership (added 2018)

**Core reporting obligations**

| Report | Trigger | Deadline |
|---|---|---|
| CTR | Cash in or out above USD 10,000 in one business day, aggregated by person | 15 days |
| SAR | Known or suspected violation; USD 5,000 threshold for banks (USD 2,000 for MSBs) | 30 days from detection |
| FBAR | Foreign accounts aggregating above USD 10,000 | Annual |
| Form 8300 | Trade or business receiving cash over USD 10,000 | 15 days |

**Structuring** is a standalone offence: deliberately keeping deposits below USD 10,000 to avoid a CTR is criminal even when the underlying funds are lawful.

**Corporate Transparency Act.** Beneficial ownership reporting to FinCEN''s registry has been through repeated litigation and scope changes; the durable point for compliance teams is that the registry is not a substitute for your own UBO verification.

**Case study.** A community bank''s branch manager processed 62 cash deposits for a restaurant group, each between USD 8,900 and USD 9,800, over five weeks. No CTR was triggered. A single structuring rule aggregating same-customer cash across a rolling 7-day window would have caught it on week two. The bank was penalised for the monitoring gap, not for the customer''s conduct.

**Takeaway:** Aggregation logic — by person, by related party, across a rolling window — is where most US reporting failures actually occur.', 2),
('Lesson 3 — Canada, Mexico and Brazil', '### Lesson 3 — Canada, Mexico and Brazil

**Canada.** The Proceeds of Crime (Money Laundering) and Terrorist Financing Act, supervised by FINTRAC. Mandatory reports: suspicious transactions (no threshold), large cash transactions of CAD 10,000+, electronic funds transfers of CAD 10,000+ cross-border, and terrorist property reports. The Cullen Commission into money laundering in British Columbia documented casino and real-estate laundering at scale and drove reform of beneficial ownership transparency and MSB supervision.

**Mexico.** The Federal Law for the Prevention and Identification of Operations with Illicit Resources sets thresholds by "vulnerable activity" — real estate, vehicles, jewellery, professional services. USD cash deposit limits exist precisely because bulk cash repatriation from US narcotics sales is the dominant typology. Casas de cambio and remittance corridors are the pressure point.

**Brazil.** COAF is the FIU; the Central Bank supervises institutions. Two structural features matter: **PIX**, the instant payment system used by most of the population, and a long history of corruption-linked laundering exposed by Operation Car Wash (Lava Jato) — bribes routed through construction contracts, doleiros (informal FX dealers) and offshore vehicles.

**Comparative snapshot**

| Feature | Canada | Mexico | Brazil |
|---|---|---|---|
| FIU | FINTRAC | UIF | COAF |
| Cash report threshold | CAD 10,000 | Activity-specific | BRL 50,000 (varies) |
| Dominant typology | Real estate, casinos | Bulk cash, remittances | Corruption, trade, PIX mules |

**Case study.** A Brazilian fintech saw 1,900 accounts receiving PIX transfers of BRL 200–800 from thousands of payers, then consolidating into 12 accounts within minutes. The pattern was fraud proceeds from a phishing operation. Velocity, not value, was the signal: median dwell time between credit and debit was 90 seconds. The firm added a dwell-time rule and blocked 71% of the flow the following month.

**Takeaway:** Each market has one structural feature that shapes its typology — casinos and property in Canada, bulk cash in Mexico, instant payments in Brazil. Calibrate to the mechanism.', 3),
('Lesson 4 — Caribbean Centres, De-risking and Citizenship Programmes', '### Lesson 4 — Caribbean Centres, De-risking and Citizenship Programmes

Caribbean jurisdictions host company formation, captive insurance, trusts and citizenship-by-investment programmes far out of proportion to their populations. This is not inherently illicit — but the combination of light substance requirements, small supervisors and high volumes creates concentrated risk.

**Citizenship and residence by investment.** Several CBI programmes grant passports for investment of USD 100,000–250,000. From an AML perspective the issue is identity layering: a new nationality, a new name transliteration, and a new tax residency detached from source of wealth. Screening on the new passport alone will not match sanctions or PEP records held under the original identity.

**Correspondent de-risking.** Since 2014 many global banks have withdrawn correspondent relationships from Caribbean respondents. The compliance consequence is that flows migrate to fewer, longer chains — nested relationships and payment service providers — which reduces transparency rather than risk.

**Control expectations**

- Reconcile every identity document a client holds; screen all name variants and all nationalities
- Require source-of-funds evidence for the investment that obtained the citizenship, not just current wealth
- For offshore corporate customers, test substance: employees, premises, local decision-making
- Treat trust structures by looking through to settlor, protector and classes of beneficiary, not just the trustee

**Case study.** A private bank onboarded a client presenting a St Kitts passport issued 11 months earlier. The client''s original nationality was not disclosed on the application form. Sanctions screening returned no hits. A later adverse-media review in the original language identified the client as a sanctioned individual''s son-in-law. The failure was procedural: the account-opening form permitted a single nationality field.

**Takeaway:** Identity layering defeats screening. Capture every nationality and every historic name, and screen them all.', 4),
('Lesson 5 — Narcotics Proceeds and Trade-Based Money Laundering', '### Lesson 5 — Narcotics Proceeds and Trade-Based Money Laundering

The dominant regional typology is converting US-dollar cash from drug sales into usable value in Latin America. The classical mechanism is the **Black Market Peso Exchange (BMPE)**.

**How BMPE works**

1. A cartel holds USD cash in the United States.
2. A peso broker buys the dollars at a discount and pays the cartel in pesos in Colombia or Mexico.
3. The broker sells the US dollars to Latin American importers who need dollars to pay for goods.
4. The importer''s US supplier is paid by third parties in the US — often in cash or by structured payments.
5. Goods ship south; the trade is real, the payment route is not.

**Trade-based indicators**

| Indicator | Test |
|---|---|
| Third-party payment | Payer is not the named buyer on the invoice |
| Price anomaly | Unit price deviates materially from market or customs reference data |
| Over/under-invoicing | Value declared to customs differs from value paid |
| Carousel goods | Same goods re-exported repeatedly |
| Phantom shipment | No bill of lading, no inspection, no insurance |

Gold, textiles, electronics and agricultural commodities dominate because prices are variable and quality is hard to verify.

**Case study — worked.** A Miami-based electronics exporter shipped USD 38m of goods to Colombia over two years. Invoices named a single Colombian importer, but payments arrived from 340 different US individuals and small companies in amounts of USD 3,000–9,500. The exporter argued it was "customer prepayment". Testing showed: payer names never appeared on any invoice; 96% of payments were below the CTR threshold; and unit prices for identical model numbers varied by 400%. This is textbook BMPE — third-party payment plus structuring plus price anomaly.

**Detection rule to implement:** flag any commercial customer where the proportion of receipts from non-invoiced third parties exceeds 10% of monthly credit turnover.

**Takeaway:** In trade laundering the goods are usually genuine. Test the payment relationship and the price, not the existence of the shipment.', 5),
('Lesson 6 — Worked Case: Remediating a US-Dollar Clearing Book', '### Lesson 6 — Worked Case: Remediating a US-Dollar Clearing Book

**Scenario.** You are the MLRO of a mid-sized bank clearing USD for 28 Latin American and Caribbean respondents. A US correspondent issues an RFI covering 140 payments and warns that the relationship is under review. You have 60 days.

**Step 1 — Establish the facts.** Map each of the 140 payments to respondent, originator, beneficiary, currency, and stated purpose. Immediately identify three categories: payments you can evidence, payments where the respondent must provide information, and payments you cannot explain.

**Step 2 — Triage the book.** Of 28 respondents, four account for 71% of queried payments. Two are exchange houses in a border region; one clears for four undisclosed downstream institutions; one is majority-owned by a family with a serving legislator.

**Step 3 — Apply immediate controls.**

- Suspend onward clearing for the two exchange houses pending documentation
- Require the nesting respondent to disclose all downstream institutions within 10 business days or be exited
- Escalate the PEP-owned respondent to board committee with an enhanced file

**Step 4 — Fix the systemic causes.** The RFI exposed three defects: originator information truncated on outgoing MT202s; no rule detecting repeated beneficiary reuse across respondents; and no periodic sample-testing of respondent payments.

**Step 5 — Deliver evidence, not assurance.** The response pack contains: payment-by-payment explanations, the revised respondent risk model, three new monitoring rules with tuning evidence, the exit of two relationships, and a quarterly sample-testing plan with the first cycle already completed.

**Outcome.** The correspondent retains the relationship with quarterly reporting conditions. The two exited respondents represented 4% of revenue and 40% of queried volume.

**Takeaway:** A correspondent RFI is a test of whether you can explain your own book. Firms that lose the relationship usually lose it on data quality, not on the underlying customers.', 6),
('Lesson 7 — Failure Modes and an Operational Checklist', '### Lesson 7 — Failure Modes and an Operational Checklist

**Failure modes that recur across the Americas**

1. **Treating US rules as territorial.** USD clearing brings OFAC and BSA exposure to institutions with no US presence.
2. **Aggregation gaps.** Structuring survives because cash is aggregated per transaction, not per person across a rolling window and across related parties.
3. **Single-nationality data models.** Citizenship-by-investment clients defeat screening when only one passport is captured.
4. **Trade finance treated as documentary.** Checking that documents match each other, not that prices and payers make sense.
5. **Sanctions screening without ownership analysis.** OFAC''s 50% rule aggregates ownership across blocked persons; a 30%/30% pair is blocked even though neither holder is majority.
6. **De-risking without analysis.** Exiting whole countries pushes flows into longer, less transparent chains and can itself be criticised.
7. **Static PEP definitions.** Regional PEP risk sits heavily with state-owned enterprise executives and sub-national officials, not only ministers.

**Sanctions specifics to configure**

- OFAC SDN plus the Sectoral Sanctions and Non-SDN lists
- The 50 Percent Rule applied to aggregated direct and indirect ownership
- Facilitation rules for non-US persons causing a US person to violate sanctions
- Screening of vessel names, IMO numbers and free-text payment fields, not only party names

**Operational checklist**

- [ ] Currency and clearing-route exposure mapped alongside customer geography
- [ ] Cash aggregation by person and related party over rolling 7 and 30-day windows
- [ ] All nationalities, historic names and transliterations captured and screened
- [ ] Third-party payment ratio rule for commercial customers
- [ ] Price-anomaly testing against customs or market reference data for trade finance
- [ ] Ownership aggregation logic implementing the 50 Percent Rule
- [ ] Respondent nesting disclosure and quarterly payment sample testing
- [ ] SAR quality review: narrative includes who, what, when, where, why and how

**Takeaway:** The Americas reward programmes that can evidence their reasoning payment by payment. Documentation quality is the control that determines whether you keep your correspondent relationships.', 7)
) AS v(title, content, sort_order)
WHERE c.slug = 'aml-americas';

UPDATE public.academy_courses SET duration_minutes = 20, cpd_hours = 0.5, estimated_words = 3200 WHERE slug = 'aml-americas';

DELETE FROM public.academy_questions q USING public.academy_courses c WHERE q.course_id = c.id AND c.slug = 'aml-americas';

INSERT INTO public.academy_questions (course_id, question, options, correct_index, explanation, sort_order)
SELECT c.id, v.question, v.options::jsonb, v.correct_index, v.explanation, v.sort_order
FROM public.academy_courses c,
(VALUES
('Which body is the FATF-style regional body for the Caribbean?', '["CFATF","GAFILAT","APG","MONEYVAL"]', 0, 'The Caribbean Financial Action Task Force (CFATF) covers Caribbean jurisdictions; GAFILAT covers Latin America.', 1),
('Why can US authorities assert jurisdiction over a bank with no US offices?', '["Because FATF requires it","Because USD payments clear through a US correspondent","Because the bank uses SWIFT","Because its customers travel to the US"]', 1, 'Dollar clearing creates a US nexus, which is the basis for extraterritorial enforcement.', 2),
('What is the US Currency Transaction Report threshold?', '["USD 3,000","USD 5,000","USD 10,000","USD 25,000"]', 2, 'Cash in or out exceeding USD 10,000 in one business day, aggregated by person, triggers a CTR.', 3),
('Deliberately depositing USD 9,500 repeatedly to avoid a CTR is:', '["Permissible if funds are lawful","A standalone criminal offence of structuring","Only a reporting inconvenience","Allowed for business customers"]', 1, 'Structuring is criminal regardless of whether the underlying funds are legitimate.', 4),
('Which element was added as a fifth pillar of US AML programmes in 2018?', '["Independent testing","Risk-based CDD including beneficial ownership","Employee training","A designated compliance officer"]', 1, 'The CDD Rule added risk-based customer due diligence and beneficial ownership identification.', 5),
('Which control would have detected 62 restaurant deposits of USD 8,900–9,800 over five weeks?', '["Annual KYC refresh","Same-customer cash aggregation over a rolling window","Sanctions screening","Wire transfer recordkeeping"]', 1, 'Rolling-window aggregation across the same customer detects structuring below the reporting threshold.', 6),
('Which Canadian inquiry documented casino and real-estate laundering and drove reform?', '["The Cullen Commission","The Wolfsberg Review","The Bribery Inquiry","The Vancouver Accord"]', 0, 'The Cullen Commission in British Columbia examined casino and property laundering.', 7),
('What is the dominant money laundering typology associated with Mexico?', '["Securities manipulation","Bulk cash repatriation from narcotics sales","Insurance fraud","Carbon credit fraud"]', 1, 'US-dollar bulk cash from drug sales returning south drives Mexico''s AML controls and cash limits.', 8),
('A Brazilian fintech saw credits and debits separated by a median of 90 seconds. What rule addresses this?', '["Value threshold rule","Dwell-time (velocity) rule","Annual review","Geographic blocking"]', 1, 'Pass-through mule activity is detected by how long funds rest, not by how large they are.', 9),
('Why do citizenship-by-investment programmes create screening risk?', '["They are illegal","They enable identity layering across nationalities and name variants","They forbid due diligence","They remove tax obligations"]', 1, 'A new passport and transliteration can detach the client from records held under the original identity.', 10),
('What is the principal unintended consequence of correspondent de-risking?', '["Lower transaction costs","Flows move to longer, less transparent chains","Improved transparency","Fewer sanctions cases"]', 1, 'Withdrawal pushes payments into nested chains and payment service providers, reducing visibility.', 11),
('In the Black Market Peso Exchange, who typically pays the US exporter?', '["The named Colombian importer","Numerous unrelated US third parties","A US government agency","The shipping company"]', 1, 'Third-party payers settle the invoice, allowing drug cash to enter the trade system.', 12),
('Which combination is textbook trade-based laundering?', '["High volumes and long tenure","Third-party payment, structuring and price anomaly","Cross-border payments and FX conversion","Late invoicing and currency mismatch"]', 1, 'These three indicators together are the classic BMPE signature.', 13),
('A practical rule for commercial customers is to flag when third-party receipts exceed what share of monthly credit turnover?', '["1%","10%","50%","90%"]', 1, 'Around 10% is a workable trigger for review of non-invoiced third-party receipts.', 14),
('Under OFAC''s 50 Percent Rule, an entity owned 30% by one blocked person and 30% by another is:', '["Not blocked","Blocked, because ownership aggregates","Blocked only if the persons are related","Subject to reporting only"]', 1, 'Ownership interests of blocked persons aggregate; 50% or more in total blocks the entity.', 15),
('Which fields should sanctions screening cover beyond party names?', '["Only account numbers","Vessel names, IMO numbers and free-text payment fields","Only country codes","Only dates"]', 1, 'Evasion frequently hides in narrative fields, vessel identifiers and references.', 16),
('In the correspondent RFI case, what determined the outcome?', '["The size of the bank","The ability to explain the book payment by payment","The number of staff","The age of the relationship"]', 1, 'Correspondents assess data quality and explanation capability, not customer volume.', 17),
('Which PEP population is frequently underweighted in Latin American risk models?', '["Heads of state","State-owned enterprise executives and sub-national officials","Ambassadors","Central bank governors"]', 1, 'Regional corruption risk concentrates heavily in SOEs and provincial or municipal officials.', 18)
) AS v(question, options, correct_index, explanation, sort_order)
WHERE c.slug = 'aml-americas';