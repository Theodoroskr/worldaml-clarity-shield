DELETE FROM public.academy_modules m USING public.academy_courses c WHERE m.course_id = c.id AND c.slug = 'aml-europe';

INSERT INTO public.academy_modules (course_id, title, content, sort_order)
SELECT c.id, v.title, v.content, v.sort_order
FROM public.academy_courses c,
(VALUES
('Lesson 1 — The European Legal Architecture', '### Lesson 1 — The European Legal Architecture

European AML law has moved from directives, which member states transposed differently, to a directly applicable regulation with a central supervisor. Understanding both matters, because the old regime governs conduct you are reviewing today and the new one governs the programme you are building.

**The directive era.** 4AMLD (2015) introduced the risk-based approach and beneficial ownership registers. 5AMLD (2018) extended scope to virtual asset service providers and prepaid cards, tightened high-risk third country measures and expanded register access. 6AMLD (2018) harmonised predicate offences — 22 categories — and extended criminal liability to legal persons and to aiding, abetting and attempting.

**The 2024 package.** Three instruments:

| Instrument | Effect |
|---|---|
| AML Regulation (AMLR) | Directly applicable single rulebook: CDD, beneficial ownership, EUR 10,000 cash payment limit, ban on anonymous crypto accounts |
| AMLD6 (the new directive) | National supervisors, FIUs, registers, access rules |
| AMLA Regulation | Creates the Anti-Money Laundering Authority in Frankfurt, with direct supervision of selected high-risk cross-border firms and indirect oversight of national supervisors |

**Why this matters operationally.** Under directives, a group could run different standards per country and defend each locally. Under a regulation, the rule is the same everywhere, and AMLA can supervise the group directly. Divergence between your subsidiaries becomes a finding rather than a feature.

**Case study.** A payments group operated with materially different EDD triggers in five member states, each aligned to local transposition. Preparing for AMLR, it mapped every requirement across the five and found 34 substantive differences. The remediation was not to pick the strictest — that would have been disproportionate — but to define one group standard against the regulation, with documented national add-ons only where local law genuinely required more.

**Takeaway:** Build one group standard against the regulation, with explicit, evidenced local add-ons. Unmanaged national divergence is now a supervisory risk in itself.', 1),
('Lesson 2 — Supervisors, FIUs and AMLA', '### Lesson 2 — Supervisors, FIUs and AMLA

**National architecture.** Each member state has one or more supervisors and a single FIU. Structures differ: prudential regulators supervising banks in some states, dedicated AML authorities in others, self-regulatory bodies for lawyers and accountants in many. The Nordic-Baltic scandals — Danske Bank''s Estonian branch (roughly EUR 200bn of non-resident flows), Swedbank, ABLV in Latvia — arose in the gaps between home and host supervisors.

**FIUs.** Reports go to the national FIU: SARs or STRs depending on the state, filed through national platforms with materially different formats and expectations. FIU.net supports cross-border exchange between EU FIUs. Two rules are near-universal: report as soon as suspicion is formed, and do not tip off the customer.

**AMLA.** Operational from Frankfurt, AMLA will directly supervise a limited number of selected obliged entities with significant cross-border activity, coordinate national supervisors, and mediate disagreements. It also sets regulatory technical standards, which is where the operational detail of the AMLR will actually be specified.

**What consistent supervisory findings look like across Europe**

| Finding | Frequency |
|---|---|
| Weak beneficial ownership verification | Very high |
| Transaction monitoring not tuned or tested | Very high |
| Late or low-quality SAR filing | High |
| Inadequate management information to the board | High |
| Group oversight of subsidiaries and branches | High |
| Reliance on third parties without evidence review | Moderate |

**Case study — Danske.** The Estonian branch operated on a separate IT platform, was not integrated into group monitoring, and served non-resident customers whose profitability far exceeded the domestic book. Internal warnings and a whistleblower report were not escalated to group level. Estonian and Danish supervisors each assumed the other had primary responsibility. The lesson repeatedly drawn by supervisors: branch profitability that is wildly out of line with the rest of the business is a compliance indicator, not just a commercial one.

**Takeaway:** Group oversight is the recurring European failure. Any entity on separate systems, with separate reporting lines or anomalous profitability, needs specific board attention.', 2),
('Lesson 3 — CDD, EDD and the Risk-Based Approach in Practice', '### Lesson 3 — CDD, EDD and the Risk-Based Approach in Practice

**Standard CDD.** Identify and verify the customer; identify and take reasonable measures to verify beneficial owners; understand the purpose and intended nature of the relationship; conduct ongoing monitoring including keeping documents current.

**When EDD is mandatory**

- Customers or transactions connected to a high-risk third country on the EU list
- Politically exposed persons, their family members and known close associates
- Correspondent relationships with third-country institutions
- Complex or unusually large transactions with no apparent economic purpose
- Non-face-to-face onboarding without appropriate safeguards

**What EDD must actually contain.** Senior management approval, established source of wealth and source of funds, and enhanced ongoing monitoring. In practice supervisors test the middle element hardest: a file stating source of wealth as "business income" with no corroboration is the most commonly criticised EDD defect in Europe.

**Simplified due diligence** is permitted only where you have demonstrated lower risk. It reduces the extent and timing of measures; it never removes them. Ongoing monitoring always applies.

**PEP handling.** There is no de-PEPing by seniority alone. Once a person ceases to hold office, apply a risk-based assessment for at least twelve months, considering the influence retained and the corruption risk of the office held. Family members and close associates carry the same treatment as the PEP.

**Risk factors that supervisors expect to see modelled**

| Category | Examples |
|---|---|
| Customer | PEP status, complexity of structure, cash intensity, adverse media |
| Product | Correspondent banking, private banking, crypto, trade finance |
| Channel | Non-face-to-face, introducers, agents |
| Geography | High-risk third countries, FATF listings, tax secrecy, conflict |

**Case study.** A private bank''s PEP files consistently contained approval and monitoring, but source of wealth was recorded as a single sentence. The supervisor sampled 20 files and found none where wealth could be reconciled to the assets held. The penalty was framed as a systemic EDD failure despite a compliant-looking policy.

**Takeaway:** In Europe, EDD stands or falls on corroborated source of wealth. Approval and monitoring without it will not survive inspection.', 3),
('Lesson 4 — Cash Limits, Crypto and Payment Transparency', '### Lesson 4 — Cash Limits, Crypto and Payment Transparency

**Cash.** The AMLR sets an EU-wide limit of EUR 10,000 on cash payments in the course of trade, with member states free to set lower limits — several already have (Italy, France, Greece, Spain, Portugal). Traders in goods above the threshold become obliged entities. The practical control question for a bank is not the limit itself but whether a customer''s cash deposit behaviour is consistent with a business that can lawfully receive cash at that scale.

**Crypto and MiCA.** The Markets in Crypto-Assets Regulation created a licensing regime for crypto-asset service providers with passporting across the EU. Alongside it, the **Transfer of Funds Regulation** recast applies the travel rule to crypto transfers with no de minimis threshold: originator and beneficiary information must accompany transfers between CASPs. The AMLR additionally prohibits anonymous crypto accounts and CASP services to privacy coins in the terms adopted.

**Self-hosted wallets.** Transfers to and from wallets not held by a provider require the CASP to verify ownership or control of the wallet above a EUR 1,000 threshold, using methods such as a signed message or a satoshi test.

**Payment transparency for fiat.** The original Transfer of Funds Regulation requires full originator and beneficiary information on transfers. Truncated or meaningless fields ("one of our clients", "customer") are a recognised deficiency and a common cause of correspondent RFIs.

**Case study.** An EU e-money institution offered accounts to a crypto exchange and processed EUR 340m over 18 months. Its own monitoring saw only aggregated settlement flows and treated them as one corporate customer. It had no visibility of the exchange''s end customers, no travel-rule data, and no wallet exposure analytics. When two of the exchange''s customers were designated, the institution could not establish whether their funds had passed through the account. The supervisory finding was that it had banked a payment institution without applying correspondent-style controls.

**Takeaway:** When your customer is itself a financial or crypto intermediary, apply correspondent-style controls: downstream visibility, information sharing, and periodic sample testing.', 4),
('Lesson 5 — European Typologies and Red Flags', '### Lesson 5 — European Typologies and Red Flags

**The non-resident deposit model.** The Baltic and Cyprus scandals shared a template: high-margin non-resident clients, shell companies in the UK, Ireland, Cyprus or the Marshall Islands, nominee directors, and payments described as loan repayments or consultancy fees. Detection markers: registered office shared by hundreds of entities, directors resident thousands of kilometres from the company, and no employees.

**Mirror trading.** Securities bought in one currency in one jurisdiction and sold near-simultaneously in another, transferring value without a payment. Deutsche Bank''s Moscow equities desk moved roughly USD 10bn this way. Marker: matched buy/sell pairs of the same size in different currencies with no economic outcome.

**Golden visas and property.** Residence-by-investment programmes across southern Europe channelled substantial sums into property. Markers: purchase price at variance from market value, third-party payment, and a buyer with no verifiable income in the country of the funds'' origin.

**VAT carousel fraud.** Goods circulate between member states, VAT is reclaimed and never paid. Markers: high-value, low-weight goods (chips, phones, carbon credits), newly incorporated counterparties, and the same goods traded repeatedly in a short period.

**Professional enablers.** Lawyers, accountants and corporate service providers structuring and holding funds in client accounts. Marker: significant flows through a professional client account with no underlying transaction identified.

| Red flag | Why it matters |
|---|---|
| Payments labelled "loan repayment" between unrelated parties | Standard shell-company narrative |
| Company incorporated less than 12 months handling large volumes | No trading history to explain the scale |
| Registered address shared with hundreds of companies | Corporate service provider mass incorporation |
| Round-sum payments to consultancies in secrecy jurisdictions | Fee-based extraction |
| Sudden change in counterparty geography | Sanctions circumvention or new laundering route |

**Case study.** A Latvian bank''s book contained 240 UK limited partnerships, all registered at three Edinburgh addresses, all with partners in the same two offshore jurisdictions. Individually each passed onboarding. The commonality — address, partner jurisdiction and incorporation agent — was never analysed because no rule examined customers as a population.

**Takeaway:** European typologies are structural. Run population-level analytics across your book: shared addresses, shared directors, shared incorporation agents.', 5),
('Lesson 6 — Worked Case: Preparing a Group for AMLR and AMLA', '### Lesson 6 — Worked Case: Preparing a Group for AMLR and AMLA

**Scenario.** A banking group operates in six member states plus a branch in a third country. You are group MLRO. The board asks what must change before AMLR applies and whether the group could fall under direct AMLA supervision.

**Step 1 — Assess selection likelihood.** AMLA directly supervises a limited set of entities with significant cross-border activity and high inherent risk. Assess against those criteria: number of member states, cross-border customer share, high-risk customer proportion. Conclusion: plausible in the second selection cycle. Plan on that basis.

**Step 2 — Gap-assess against the regulation, not the transpositions.** Line-by-line mapping of AMLR articles to group policy. Findings: cash handling policy exceeds the new EUR 10,000 limit in two states; PEP definitions vary; CDD data retention periods differ; crypto exposure is unaddressed; outsourced onboarding in one state has no evidence review.

**Step 3 — Fix the group standard.** One policy, one set of risk factors, one EDD standard, one PEP definition. Local addenda permitted only where national law imposes more, each with a legal citation.

**Step 4 — Fix data.** AMLA supervision is data-driven. The group must be able to produce, on request: customer risk distribution by entity, alert and SAR volumes by entity, UBO completeness rates, screening coverage and overdue review counts. The group finds it cannot produce UBO completeness at all — three subsidiaries hold ownership data in free text.

**Step 5 — Fix governance.** Group MLRO with an unobstructed line to the board; subsidiary MLROs reporting functionally to group; quarterly consolidated financial crime MI; and an annual independent review covering every entity, including the third-country branch.

**Step 6 — Sequence it.** Data remediation first — it takes longest and everything else depends on it. Policy convergence second. Systems and monitoring tuning third, since tuning requires clean data.

**Outcome.** The group defines 14 workstreams over 18 months, with UBO data remediation on the critical path.

**Takeaway:** AMLA readiness is a data project before it is a policy project. If you cannot produce consolidated financial crime metrics on demand, that is the first thing to fix.', 6),
('Lesson 7 — Failure Modes and an Operational Checklist', '### Lesson 7 — Failure Modes and an Operational Checklist

**Failure modes in European programmes**

1. **Fragmented group standards** justified by differing transpositions — no longer defensible under a regulation.
2. **Branches outside group monitoring**, on separate systems and reporting lines. This is the Danske pattern.
3. **Uncorroborated source of wealth** in EDD files.
4. **Untuned monitoring.** Rules inherited at implementation and never tested against outcomes.
5. **Customers reviewed individually, never as a population.** Shared addresses and directors go unseen.
6. **Intermediary customers banked as ordinary corporates**, without downstream visibility.
7. **Truncated payment information**, driving correspondent RFIs and sanctions screening failures.
8. **Board MI that reports activity, not risk** — alert counts without conversion rates, overdue reviews or thematic findings.

**Board management information that supervisors expect**

- Customer risk distribution and its movement over the period
- Alert volumes, escalation and SAR conversion rates by entity and by rule
- Overdue periodic reviews and overdue UBO refreshes
- Screening coverage and list update timeliness
- Thematic issues, incidents, regulatory interactions and remediation status

**Operational checklist**

- [ ] Single group AML standard mapped to the AMLR, with evidenced local add-ons only
- [ ] Every branch and subsidiary inside group monitoring and reporting lines
- [ ] Source-of-wealth corroboration standard with worked documentary examples
- [ ] Annual monitoring tuning with above/below-the-line testing and documented results
- [ ] Population-level analytics: shared addresses, directors, incorporation agents, IPs
- [ ] Correspondent-style controls for financial and crypto intermediary customers
- [ ] Travel rule implemented for both fiat and crypto transfers, self-hosted wallet verification above EUR 1,000
- [ ] Payment message quality monitoring for truncated originator/beneficiary fields
- [ ] Consolidated financial crime MI produced quarterly to the board
- [ ] Independent review covering every entity including third-country branches

**Takeaway:** Europe is converging on a single rulebook enforced with data. The programmes that will pass are those that operate one standard consistently and can prove it with numbers.', 7)
) AS v(title, content, sort_order)
WHERE c.slug = 'aml-europe';

UPDATE public.academy_courses SET duration_minutes = 20, cpd_hours = 0.5, estimated_words = 3200 WHERE slug = 'aml-europe';

DELETE FROM public.academy_questions q USING public.academy_courses c WHERE q.course_id = c.id AND c.slug = 'aml-europe';

INSERT INTO public.academy_questions (course_id, question, options, correct_index, explanation, sort_order)
SELECT c.id, v.question, v.options::jsonb, v.correct_index, v.explanation, v.sort_order
FROM public.academy_courses c,
(VALUES
('What is the principal change from AML directives to the AML Regulation?', '["Lower penalties","A directly applicable single rulebook with no national transposition","Removal of the risk-based approach","Voluntary compliance"]', 1, 'A regulation applies directly and uniformly, so national divergence is no longer a defence.', 1),
('Where is the EU Anti-Money Laundering Authority (AMLA) based?', '["Paris","Frankfurt","Brussels","Dublin"]', 1, 'AMLA is headquartered in Frankfurt.', 2),
('What EU-wide cash payment limit does the AMLR introduce?', '["EUR 1,000","EUR 3,000","EUR 10,000","EUR 15,000"]', 2, 'The AMLR caps cash payments in trade at EUR 10,000; member states may set lower limits.', 3),
('Which directive harmonised predicate offences and extended liability to legal persons?', '["4AMLD","5AMLD","6AMLD","MiFID II"]', 2, '6AMLD harmonised 22 predicate offence categories and extended criminal liability.', 4),
('Which element of EDD do European supervisors test most severely?', '["Senior management approval","Corroborated source of wealth","Address verification","Account opening speed"]', 1, 'Uncorroborated source of wealth is the most commonly criticised EDD defect.', 5),
('Simplified due diligence means:', '["No due diligence","Reduced extent and timing of measures, with ongoing monitoring retained","Exemption from monitoring","Annual review only"]', 1, 'SDD reduces but never removes measures, and ongoing monitoring always applies.', 6),
('How should a person who has ceased to hold public office be treated?', '["Immediately de-PEPed","Risk-assessed for at least twelve months considering retained influence","Treated as a PEP forever","Exited"]', 1, 'A risk-based assessment applies for a minimum of twelve months after leaving office.', 7),
('What was the central structural failing in the Danske Bank Estonia case?', '["Poor customer service","A branch outside group systems, monitoring and reporting lines","Excessive capital requirements","Currency mismatch"]', 1, 'The branch ran on separate IT with separate reporting, and warnings were not escalated to group.', 8),
('Which commercial signal should be read as a compliance indicator?', '["High staff turnover","Branch profitability wildly out of line with the rest of the business","Low interest margins","High marketing spend"]', 1, 'Disproportionate profitability in one unit repeatedly precedes major AML failures.', 9),
('Under the recast Transfer of Funds Regulation, the crypto travel rule applies:', '["Above EUR 1,000","Above EUR 10,000","With no de minimis threshold","Only for stablecoins"]', 2, 'Originator and beneficiary information must accompany crypto transfers regardless of value.', 10),
('Above what value must a CASP verify ownership or control of a self-hosted wallet?', '["EUR 100","EUR 1,000","EUR 10,000","EUR 50,000"]', 1, 'Verification of self-hosted wallet ownership is required above EUR 1,000.', 11),
('A bank''s customer is itself a crypto exchange. What controls should apply?', '["Standard corporate controls","Correspondent-style controls with downstream visibility and sample testing","Simplified due diligence","No controls beyond sanctions screening"]', 1, 'Intermediary customers give access to unknown downstream users and require correspondent-style oversight.', 12),
('Matched securities purchases and sales in different currencies with no economic outcome describe:', '["Arbitrage","Mirror trading","Hedging","Market making"]', 1, 'Mirror trading transfers value across jurisdictions without a payment.', 13),
('Which goods characterise VAT carousel fraud?', '["Heavy machinery","High-value, low-weight goods such as chips, phones and carbon credits","Bulk agricultural produce","Construction materials"]', 1, 'Ease of movement and high value per unit make these goods ideal for carousel schemes.', 14),
('240 customers share three registered addresses and two offshore partner jurisdictions. What capability was missing?', '["Sanctions screening","Population-level analytics across the customer book","Cash reporting","Interest rate monitoring"]', 1, 'Each customer passed individually; only cross-book analysis reveals the commonality.', 15),
('What should be the first workstream in preparing a group for AMLA supervision?', '["Rewriting the policy manual","Data remediation so consolidated metrics can be produced","Hiring more analysts","Rebranding"]', 1, 'AMLA supervision is data-driven and policy and tuning work both depend on clean data.', 16),
('Which board MI is a supervisor most likely to consider inadequate?', '["Alert-to-SAR conversion rates by entity","Raw alert counts with no conversion or outcome data","Overdue review counts","Screening list update timeliness"]', 1, 'Activity volumes without outcome measures tell the board nothing about risk.', 17),
('What is the correct treatment of national add-ons to a group AML standard under AMLR?', '["Allowed freely per country preference","Permitted only where national law imposes more, with a legal citation","Prohibited entirely","Decided by each subsidiary CEO"]', 1, 'One group standard against the regulation, with evidenced local additions only where law requires.', 18)
) AS v(question, options, correct_index, explanation, sort_order)
WHERE c.slug = 'aml-europe';