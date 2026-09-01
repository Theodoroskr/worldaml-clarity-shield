INSERT INTO public.academy_modules (course_id, sort_order, title, content)
SELECT c.id, 4, 'Lesson 4 — Evasion Typologies and Red Flags', $md$### Lesson 4 — Evasion Typologies and Red Flags

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

**Takeaway:** Evasion is visible in behaviour and logistics long before a listed name appears. Build rules for patterns, not just for names.$md$
FROM public.academy_courses c WHERE c.slug = 'international-sanctions-compliance';

DELETE FROM public.academy_questions q USING public.academy_courses c
WHERE q.course_id = c.id AND c.slug = 'international-sanctions-compliance';

INSERT INTO public.academy_questions (course_id, question, options, correct_index, explanation, sort_order)
SELECT c.id, v.question, v.options::jsonb, v.correct_index, v.explanation, v.sort_order
FROM public.academy_courses c,
(VALUES
 ('Sanctions compliance breaches are generally assessed on what basis?', '["Strict liability — intent is not required","Only where dishonesty is proven","Only where the amount exceeds EUR 100,000","Only where a court has convicted the counterparty"]', 0, 'Most sanctions regimes impose strict liability: a breach occurs even without intent or knowledge.', 1),
 ('Two designated persons hold 30% and 22% of a company. Under OFAC''s 50% Rule the company is:', '["Blocked, because designated holdings aggregate to 52%","Not blocked, because no single holder reaches 50%","Blocked only if it is US-incorporated","Subject to enhanced due diligence but not blocked"]', 0, 'Ownership by blocked persons is aggregated. 30% + 22% = 52%, so the entity is itself blocked.', 2),
 ('Under EU and UK rules, an entity can be caught even below 50% ownership when:', '["The designated person exercises control, e.g. appointing the board","The entity trades in commodities","The entity is newly incorporated","The entity uses a nominee director"]', 0, 'EU and UK measures apply to ownership OR control; control alone is sufficient.', 3),
 ('A non-US company with no US offices pays in USD through a New York correspondent. This:', '["Creates a US nexus and brings OFAC primary sanctions into play","Is irrelevant because the company is not a US person","Only matters if the goods are US-origin","Only matters above USD 1 million"]', 0, 'Clearing US dollars through the US creates the nexus for OFAC primary sanctions.', 4),
 ('Secondary sanctions are distinctive because they:', '["Target non-US persons without requiring a US nexus","Apply only to UN member states","Replace asset freezes with reporting duties","Expire automatically after 12 months"]', 0, 'Secondary sanctions penalise non-US parties for dealings with certain targets, typically by cutting off US market access.', 5),
 ('A payment alerts on a possible SDN match. The correct first action is to:', '["Hold the payment and escalate to the sanctions officer","Return the funds to the originating bank","Release it and review at month-end","Ask the customer whether they are sanctioned"]', 0, 'Freeze and escalate. Returning funds can itself be an unauthorised transfer and a separate violation.', 6),
 ('An analyst clears a hit because "the spelling is slightly different". This is:', '["Inadequate — hits must be cleared on discriminating identifiers","Acceptable for retail customers","Acceptable if the amount is small","Best practice for reducing false positives"]', 0, 'Alerts must be resolved on date of birth, passport, nationality or address — not spelling impressions.', 7),
 ('Which shipping behaviours most strongly indicate sanctions evasion?', '["AIS gaps combined with ship-to-ship transfers in known zones","Use of a container vessel","Filing a cargo manifest","Bunkering at a scheduled port"]', 0, 'Transponder gaps plus STS transfers in known transfer zones are hallmark origin-laundering indicators.', 8),
 ('Payment "stripping" means:', '["Removing originator details from wire messages to defeat screening","Splitting a payment across two banks","Converting a payment to another currency","Cancelling and reissuing a payment"]', 0, 'Stripping removes identifying data so screening at correspondent banks does not alert. It is a serious, often criminal, breach.', 9),
 ('Which field is most commonly missed in screening and has caused major breaches?', '["Payment reference / free-text narrative fields","The beneficiary name","The customer''s date of birth","The transaction amount"]', 0, 'Free-text remittance fields frequently carry "for onward credit to" instructions naming designated parties.', 10),
 ('Newly published designations should be applied:', '["As soon as the list is released, in near real time","At the next quarterly review","Only for new customers","Within 90 days"]', 0, 'Designations take effect on publication; delayed ingestion means unlawful payments in the interim.', 11),
 ('Two weeks after designation, an oligarch cuts his stake from 70% to 49%, transferring 21% to his former chief of staff for no payment. The entity should be treated as:', '["Still controlled and therefore restricted","Clean, since ownership is now below 50%","Clean, if the transfer was registered","Subject only to enhanced monitoring"]', 0, 'Uncompensated transfers to close associates with unchanged board control are treated as continued control.', 12),
 ('A licence issued by a competent authority:', '["Permits specified activity within its exact scope and conditions","Exempts the holder from all sanctions rules","Removes the need to screen","Applies across all jurisdictions automatically"]', 0, 'Licences are narrow. Activity outside the stated scope, conditions or expiry remains prohibited.', 13),
 ('Voluntary self-disclosure of a breach typically:', '["Substantially reduces the penalty and is a key mitigating factor","Guarantees no penalty","Has no effect on the outcome","Is prohibited once funds are frozen"]', 0, 'Prompt, complete self-disclosure with remediation is the strongest mitigating factor in most enforcement frameworks.', 14),
 ('Which is NOT one of the five essential components of a sanctions compliance programme?', '["Guaranteeing zero false positives","Management commitment","Risk assessment","Testing and audit"]', 0, 'The five components are management commitment, risk assessment, internal controls, testing/audit and training. Zero false positives is neither achievable nor required.', 15),
 ('A screening feed silently fails to ingest updates for 19 days. The root-cause failure is:', '["No ingestion-failure alerting or post-load reconciliation","Poor fuzzy-matching configuration","Insufficient analyst headcount","Excessive list coverage"]', 0, 'Change control and reconciliation over list ingestion are core internal controls; silent failure means unscreened designations.', 16),
 ('Outsourcing screening to a vendor means:', '["The firm remains fully liable and must obtain testing evidence","Liability transfers to the vendor","Internal audit is no longer needed","List coverage no longer needs review"]', 0, 'Outsourcing an activity never outsources the regulatory obligation; vendor coverage and update frequency must be contracted and tested.', 17),
 ('Setting screening fuzziness too wide most commonly leads to:', '["Alert overload and reflexive false-positive clearing","Missed designations only","Faster payment release","Lower regulatory risk"]', 0, 'Excessive alerts degrade analyst quality and cause genuine matches to be cleared in bulk. Tuning must be risk-calibrated and tested.', 18)
) AS v(question, options, correct_index, explanation, sort_order)
WHERE c.slug = 'international-sanctions-compliance';