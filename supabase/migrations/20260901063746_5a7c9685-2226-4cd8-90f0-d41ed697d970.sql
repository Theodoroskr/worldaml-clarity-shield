DELETE FROM public.academy_modules m USING public.academy_courses c WHERE m.course_id = c.id AND c.slug = 'beneficial-ownership-ubo-transparency';

INSERT INTO public.academy_modules (course_id, title, content, sort_order)
SELECT c.id, v.title, v.content, v.sort_order
FROM public.academy_courses c,
(VALUES
('Lesson 1 — What Beneficial Ownership Actually Means', '### Lesson 1 — What Beneficial Ownership Actually Means

A **beneficial owner** is the natural person who ultimately owns or controls a customer, or on whose behalf a transaction is conducted. Two words carry the weight: *natural person* — never a company, trust or nominee — and *ultimately*, meaning at the end of the chain however long it is.

**Three routes to beneficial ownership**

| Route | Test | Typical threshold |
|---|---|---|
| Ownership | Direct or indirect holding of shares or capital | More than 25% in the EU/UK; 25% or more in the US CDD Rule |
| Control by other means | Voting rights, veto rights, board appointment rights, golden shares, contractual control | No percentage; judgement-based |
| Senior managing official | Fallback where no owner is identified after exhausting the other routes | Not a UBO in substance — a documented last resort |

**Indirect ownership arithmetic.** Multiply through the chain. If Ms A owns 60% of HoldCo and HoldCo owns 50% of the customer, Ms A holds 30% indirectly and is a beneficial owner. But if HoldCo holds 50% while another shareholder holds 50% and HoldCo has the casting vote, Ms A also *controls* — and control does not require a percentage.

**The single most common error.** Recording the senior managing official because the chain was hard to unravel, without evidencing that the ownership and control tests were genuinely exhausted. Supervisors treat the fallback as a red flag in itself: it means you do not know who you are dealing with.

**Case study.** A bank onboarded a Luxembourg holding company owned by two Cypriot entities at 50% each, each in turn owned by a Panamanian foundation. The bank recorded the customer''s CEO as UBO under the senior-official fallback. A journalistic investigation later established that a sanctioned individual directed the foundations through a protector letter. The bank held no protector documentation and had never asked for it.

**Takeaway:** Ownership is arithmetic; control is evidence. The fallback is an admission of failure, not a compliant answer.', 1),
('Lesson 2 — The Global Regulatory Framework', '### Lesson 2 — The Global Regulatory Framework

**FATF Recommendations 24 and 25.** R.24 covers legal persons, R.25 legal arrangements (trusts). The 2022 revision of R.24 hardened the standard significantly: countries must ensure beneficial ownership information is held by a **public authority or body** — a register or an equivalent mechanism — and is adequate, accurate and up to date. The "company approach" alone, where information sits only with the company, is no longer sufficient.

**European Union.** The 4th and 5th AML Directives created national beneficial ownership registers. In November 2022 the Court of Justice (*WM and Sovim*, joined cases C-37/20 and C-601/20) struck down general public access as a disproportionate interference with privacy rights. Access is now restricted to competent authorities, obliged entities, and persons demonstrating a legitimate interest. The new **AML Regulation and AMLA** package re-legislates access on that basis and adds a lower 25% threshold structure with specific rules for multi-layered and control-based ownership.

**United Kingdom.** The PSC (People with Significant Control) register at Companies House, plus the Register of Overseas Entities for foreign owners of UK property. The Economic Crime and Corporate Transparency Act 2023 gives Companies House identity verification and query powers — historically absent, which is why PSC data quality was poor.

**United States.** The Corporate Transparency Act and FinCEN''s beneficial ownership registry, subject to repeated litigation and scope changes since 2024. Separately, the CDD Rule obliges banks to collect beneficial ownership at 25% ownership plus one control person.

**The practical rule.** Registers are a **corroboration source**, not a verification source. Most are self-declared, few are verified, and CJEU-restricted access limits what you can even see.

**Case study.** A UK firm relied solely on PSC filings for 400 corporate customers. A sample review found 31% of PSC entries inconsistent with the shareholder register in the same company''s own filed accounts. Nothing had been falsified — the filings had simply never been updated.

**Takeaway:** Use registers to challenge what the customer tells you. Never use them as the sole evidence of who owns the customer.', 2),
('Lesson 3 — Unwrapping Complex Structures', '### Lesson 3 — Unwrapping Complex Structures

**Trusts.** Identify all of: settlor, trustee(s), protector (if any), beneficiaries or the class of beneficiaries, and any other natural person exercising ultimate control. A discretionary trust with a class of beneficiaries ("the settlor''s descendants") still requires the class to be described sufficiently to identify individuals when a distribution occurs. The protector is frequently the real locus of control and is the most commonly omitted party.

**Foundations.** Civil-law vehicles (Liechtenstein, Panama, Netherlands, Curaçao) with no shareholders. Apply the trust analysis: founder, council members, beneficiaries, and any person with power to amend the by-laws.

**Nominee arrangements.** A nominee shareholder or director holds the position for another. Nominee status may be legal and disclosed, or concealed. Indicators: the same individual holding directorships across dozens or hundreds of unrelated companies, corporate service provider addresses shared by hundreds of entities, and directors resident in a jurisdiction unrelated to any operation.

**Bearer instruments.** Bearer shares and bearer share warrants transfer ownership by physical delivery, leaving no record. Most reputable jurisdictions have abolished or immobilised them; the presence of bearer instruments in a structure is a strong risk indicator.

**Layering patterns to recognise**

| Pattern | What it suggests |
|---|---|
| Circular ownership (A owns B owns C owns A) | Designed to defeat percentage arithmetic |
| Ownership split into 24.9% slices | Deliberate threshold avoidance |
| A single holding entity between operating company and owner, in a secrecy jurisdiction | Concealment of a specific name |
| Recently restructured chain with no commercial rationale | Response to screening or an impending designation |

**Case study.** An entity''s five shareholders each held 20%, so no one met the 25% threshold. A shareholders'' agreement, obtained only because the analyst asked for it, gave one shareholder the right to appoint the majority of the board. He was the beneficial owner by control, holding 20% of the equity. No register would ever have shown this.

**Takeaway:** Ask for the constitutive documents — shareholders'' agreements, trust deeds, by-laws. Control is written down somewhere, but rarely in the register.', 3),
('Lesson 4 — Verification: Evidence Standards That Hold Up', '### Lesson 4 — Verification: Evidence Standards That Hold Up

Identification is asking. Verification is proving. Most supervisory findings on UBO concern the second.

**A tiered verification standard**

| Risk tier | Evidence expected |
|---|---|
| Low | Customer declaration plus one independent corroboration (register extract or audited accounts) |
| Standard | Declaration, register extract, structure chart signed by a director, and ID verification of each UBO |
| High | All of the above plus constitutive documents, share certificates or a certified shareholder register, independent database corroboration, and documented source of wealth |

**Non-negotiable elements**

1. **A structure chart** covering every layer to the natural persons, dated and attested by the customer.
2. **Ownership arithmetic shown**, not asserted — the multiplication through each layer recorded in the file.
3. **Identity verification of the UBOs themselves**, to the same standard as a direct customer. Holding a name and a date of birth is not verification.
4. **Discrepancy reporting.** In the UK and several EU states, obliged entities must report material discrepancies between the register and their own findings.
5. **A refresh trigger set**, not just a calendar date: change of control, adverse media, register change, restructuring, or a transaction inconsistent with the profile.

**Common evidentiary failures**

- Structure chart produced by the relationship manager rather than the customer
- Register extract older than the last known corporate change
- Screening the corporate entity but not each identified natural person
- No evidence at all for the "control by other means" conclusion
- UBO recorded once at onboarding and never revisited across a ten-year relationship

**Case study.** A supervisory review of 60 corporate files at a mid-sized bank found UBOs recorded in all 60, structure charts in 41, ownership arithmetic evidenced in 12, and UBO identity documents in 9. The bank''s policy was fully compliant on paper. The finding was that the policy was not operated — and the remediation cost exceeded the original programme''s build cost.

**Takeaway:** Write your UBO standard as a list of artefacts that must be in the file. Anything you cannot point to in a file does not exist.', 4),
('Lesson 5 — Registers, Data Quality and the Access Problem', '### Lesson 5 — Registers, Data Quality and the Access Problem

Beneficial ownership registers exist in over a hundred jurisdictions, and their quality varies more than almost any other compliance data source.

**The four quality dimensions to assess for each register you use**

| Dimension | Question |
|---|---|
| Coverage | Which entity types must file? Are trusts, partnerships and foreign entities included? |
| Verification | Does anyone check the filing, or is it self-declared? |
| Currency | What is the update obligation and is it enforced? |
| Accessibility | Public, legitimate-interest, or authority-only? Machine-readable? |

**Post-CJEU reality in the EU.** Since the 2022 judgment, general public access has ended. Obliged entities retain access for AML purposes, but processes differ by member state and some require registration or fee arrangements. Journalists and NGOs now access on a legitimate-interest basis. Practically, this means your firm needs an access route per jurisdiction, documented, with fallbacks where none exists.

**Data quality problems you will meet**

- Self-declaration with no verification, so errors persist indefinitely
- Free-text name fields with no consistent transliteration
- No unique identifier for a natural person, so the same UBO appears as several people
- Stale filings following restructuring
- Entity types out of scope entirely — commonly trusts and foreign-registered owners

**Discrepancy reporting done properly.** Where you must report, define materiality: a spelling variance is not a discrepancy; a different person, a missing owner, or a materially different percentage is. Log every discrepancy, the report reference, and the outcome — supervisors sample this.

**Case study.** A firm built automated register lookups across eight jurisdictions and treated a "match found" as verification. Testing revealed the connector was matching on company name alone; 14% of matches were to a different entity of the same name in the same country. Matching was rebuilt on registration number, and the false-match rate fell to under 1%.

**Takeaway:** Treat each register as a data source with a documented quality profile. Match on registration numbers, never on names.', 5),
('Lesson 6 — Worked Case: A Twelve-Layer Structure', '### Lesson 6 — Worked Case: A Twelve-Layer Structure

**Scenario.** A commodity trading company applies for a EUR 30m trade finance facility. It is registered in the Netherlands. Onboarding must establish beneficial ownership.

**The disclosed chart.** NL OpCo is owned 100% by a Cyprus holding company, itself owned 45% / 45% / 10% by two BVI companies and a Swiss lawyer. Each BVI company is owned by a Liechtenstein foundation. The customer names the Swiss lawyer as the only identifiable individual and proposes the CEO as UBO under the senior-official fallback.

**Step 1 — Reject the fallback.** The ownership and control routes have not been exhausted. Request the foundation by-laws and the register of beneficiaries for both foundations.

**Step 2 — Read what arrives.** Foundation A''s by-laws name a founder resident in a CIS state and a protector with power to remove council members. Foundation B''s beneficiary class is "the descendants of the founder of Foundation A". Both foundations therefore trace to one family.

**Step 3 — Do the arithmetic.** Foundation A traces to 45% and Foundation B to 45%, both controlled by or benefiting the same family. Combined economic interest: 90%. The Swiss lawyer''s 10% is disclosed as held on nominee terms — the nominee agreement is provided on request.

**Step 4 — Test control.** The protector of Foundation A can remove council members of both foundations. He is the founder''s brother-in-law. Control sits with him and the founder jointly.

**Step 5 — Screen the individuals.** The founder appears in adverse media in Russian-language sources relating to a state procurement investigation. He is not designated. His brother-in-law holds a regional government advisory role — a PEP.

**Step 6 — Decide and evidence.** Outcome: accept as high risk with EDD — senior management approval, documented source of wealth reconciled to the trading business''s audited accounts, transaction-level trade document review for the first twelve months, six-monthly review, and immediate escalation on any designation change. Alternatively decline; either is defensible. What is not defensible is the CEO recorded as UBO.

**Takeaway:** Complexity is not itself suspicious — commodity trading structures are genuinely layered. The failure is stopping at the first opaque layer instead of asking for the documents that resolve it.', 6),
('Lesson 7 — Failure Modes and an Operational Checklist', '### Lesson 7 — Failure Modes and an Operational Checklist

**Failure modes**

1. **Fallback abuse.** Senior managing official recorded without evidence that ownership and control were exhausted.
2. **Threshold literalism.** Treating 24.9% holdings as out of scope when control is obvious.
3. **Register as verification.** Relying on self-declared, unverified filings.
4. **Name-based matching.** Register lookups matched on company name rather than registration number.
5. **UBOs not screened.** The entity is screened; the natural persons behind it are not.
6. **Static UBO records.** No event-driven refresh; ownership changes go unnoticed for years.
7. **Protectors and nominees ignored.** The parties who actually hold control are the ones most often omitted.
8. **Discrepancy reporting not operated**, or operated with no materiality definition.

**Ongoing monitoring triggers for UBO refresh**

- Change in shareholding, directors or registered address
- Adverse media or a sanctions designation touching any identified person
- Corporate restructuring, especially insertion of a new holding layer
- Transactions inconsistent with the declared ownership or business
- Register filing change detected by monitoring
- Periodic review falling due by risk tier

**Operational checklist**

- [ ] Dated, customer-attested structure chart to natural persons in every corporate file
- [ ] Ownership arithmetic recorded layer by layer
- [ ] Constitutive documents obtained where control is not evident from shareholding
- [ ] Trust and foundation parties captured in full: settlor/founder, trustee/council, protector, beneficiaries
- [ ] Each UBO identity-verified and screened for sanctions, PEP and adverse media
- [ ] Register corroboration matched on registration number, with a documented quality profile per jurisdiction
- [ ] Discrepancy reporting with a written materiality definition and a log
- [ ] Event-driven refresh triggers implemented, not just calendar reviews
- [ ] Fallback use monitored as a management metric — a rising rate is a warning sign
- [ ] Bearer instruments and circular ownership flagged automatically as high risk

**Takeaway:** Beneficial ownership work is documentary discipline. The firms that fail are rarely those that could not find the owner — they are those that never asked for the document that would have shown them.', 7)
) AS v(title, content, sort_order)
WHERE c.slug = 'beneficial-ownership-ubo-transparency';

UPDATE public.academy_courses SET duration_minutes = 20, cpd_hours = 0.5, estimated_words = 3200 WHERE slug = 'beneficial-ownership-ubo-transparency';

DELETE FROM public.academy_questions q USING public.academy_courses c WHERE q.course_id = c.id AND c.slug = 'beneficial-ownership-ubo-transparency';

INSERT INTO public.academy_questions (course_id, question, options, correct_index, explanation, sort_order)
SELECT c.id, v.question, v.options::jsonb, v.correct_index, v.explanation, v.sort_order
FROM public.academy_courses c,
(VALUES
('A beneficial owner must always be:', '["A holding company","A natural person","A registered trustee","A licensed director"]', 1, 'Beneficial ownership traces through every layer to natural persons only.', 1),
('Ms A owns 60% of HoldCo, which owns 50% of the customer. What is her indirect interest?', '["110%","50%","30%","25%"]', 2, 'Indirect ownership multiplies through the chain: 60% x 50% = 30%.', 2),
('When is the senior managing official recorded as UBO appropriate?', '["Whenever the chain is complex","Only after ownership and control routes are demonstrably exhausted","For all trusts","When the customer requests it"]', 1, 'The fallback requires documented evidence that the other routes were exhausted; otherwise it is a deficiency.', 3),
('What did the 2022 revision of FATF Recommendation 24 require?', '["Public access to all registers","Beneficial ownership held by a public authority or equivalent mechanism","Abolition of trusts","A 10% ownership threshold"]', 1, 'The company-only approach is no longer sufficient; a register or equivalent mechanism is required.', 4),
('What did the CJEU decide in the 2022 Luxembourg beneficial ownership case?', '["Registers are unlawful","General public access is a disproportionate interference with privacy","Obliged entities lose access","Trusts must be public"]', 1, 'Access is now limited to authorities, obliged entities and those with a legitimate interest.', 5),
('What is the UK register of beneficial owners of companies called?', '["PSC register","UBO index","Companies List","Control Registry"]', 0, 'The People with Significant Control register is maintained at Companies House.', 6),
('How should a beneficial ownership register be used?', '["As conclusive verification","As a corroboration source to challenge customer declarations","As a substitute for CDD","Only for high-risk customers"]', 1, 'Most registers are self-declared and unverified, so they corroborate rather than verify.', 7),
('For a trust, which party is most commonly omitted from UBO records?', '["The trustee","The protector","The settlor","The beneficiary"]', 1, 'The protector frequently holds real control and is the most often missed party.', 8),
('Five shareholders each hold 20%, but one can appoint the majority of the board. Who is the beneficial owner?', '["Nobody, no one exceeds 25%","The shareholder with board appointment rights, by control","The company secretary","All five equally"]', 1, 'Control by other means requires no ownership percentage.', 9),
('Ownership deliberately split into 24.9% slices indicates:', '["Tax efficiency","Threshold avoidance requiring control analysis","Standard equity practice","A reporting error"]', 1, 'Slicing just below the threshold is a recognised concealment pattern.', 10),
('Why are bearer shares a strong risk indicator?', '["They pay higher dividends","Ownership transfers by physical delivery with no record","They are always illegal","They cannot be screened"]', 1, 'No record of transfer exists, making ownership untraceable; most jurisdictions have abolished or immobilised them.', 11),
('Which artefact is essential in every corporate customer file?', '["A marketing plan","A dated, customer-attested structure chart to natural persons","A credit rating","An insurance certificate"]', 1, 'The structure chart is the base document from which ownership arithmetic is evidenced.', 12),
('A register extract matched on company name produced 14% wrong-entity matches. What is the fix?', '["Manual review of all matches","Match on registration number","Lower the match threshold","Use a different register"]', 1, 'Registration numbers are unique; company names are not.', 13),
('Which is a material discrepancy that should be reported?', '["A hyphen in a surname","A different person recorded as owner","An abbreviated street name","A formatting difference in a date"]', 1, 'Materiality should be defined so that identity, omission and percentage differences are reported, not typos.', 14),
('Which event should trigger a UBO refresh outside the periodic cycle?', '["A change of bank branch","Insertion of a new holding layer in the ownership chain","A new company logo","An auditor change of partner"]', 1, 'Restructuring, especially added layers, can change or conceal control and must trigger review.', 15),
('In the twelve-layer worked case, which document resolved the structure?', '["The audited accounts","The foundation by-laws and register of beneficiaries","The trade licence","The bank reference"]', 1, 'Constitutive documents identify the founder, council, protector and beneficiary class.', 16),
('A rising rate of senior-managing-official fallback usage should be treated as:', '["An efficiency gain","A management warning indicator","A neutral statistic","Evidence of good controls"]', 1, 'It signals that the firm increasingly does not know who its customers are.', 17),
('Under the US CDD Rule, banks must collect beneficial ownership at what ownership level, plus a control person?', '["10%","25%","50%","75%"]', 1, 'The CDD Rule requires each owner of 25% or more, plus one individual with significant control.', 18)
) AS v(question, options, correct_index, explanation, sort_order)
WHERE c.slug = 'beneficial-ownership-ubo-transparency';