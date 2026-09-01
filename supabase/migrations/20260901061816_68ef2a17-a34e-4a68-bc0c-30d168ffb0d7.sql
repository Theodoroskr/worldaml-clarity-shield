UPDATE public.academy_modules SET title = 'Lesson 1 — What Suspicion Actually Means', content = $md$### Lesson 1 — What Suspicion Actually Means

Transaction monitoring exists to convert raw activity into decisions. The legal trigger for reporting is **suspicion**, not proof. Suspicion is a possibility that is more than fanciful — a reasonable concern, supported by facts, that funds or activity may relate to criminal conduct or terrorist financing.

**Three standards you must distinguish**

| Standard | Test | Consequence |
|---|---|---|
| Unusual | Activity departs from the expected profile | Investigate, document |
| Suspicious | Reasonable grounds to think criminality may be involved | Report internally, then to the FIU |
| Proven | Established by a court | Never your job |

You do **not** need to identify the predicate offence, quantify the proceeds, or be certain. Waiting for certainty is the single most common cause of late reporting and personal liability.

**Objective vs subjective suspicion.** Most regimes apply an objective test: would a reasonable professional in your role, with your training and the same facts, have been suspicious? "I personally wasn't worried" is not a defence where the red flags were plain.

**Worked case study — the consultancy invoice.** A small IT consultancy with declared annual turnover of €180,000 receives a single €240,000 inbound payment from a newly incorporated company in a third country, referenced "advisory fees". Within four days, 92% is forwarded to two personal accounts. The client explains it as "a big new contract" but produces no engagement letter, no scope, no deliverables, and no prior correspondence.

There is no proof of a crime. But the amount exceeds full-year turnover, the funds pass straight through, documentation is absent, and the counterparty has no trading history. A reasonable analyst is suspicious. The report goes in — even if a legitimate explanation later emerges.

**Takeaway:** Suspicion is a low, evidence-informed threshold. Document the facts, apply the reasonable-professional test, and never delay a report while hunting for proof.$md$ WHERE id = '2715fb10-2af7-4516-bac0-dc0e361ef7eb';

UPDATE public.academy_modules SET title = 'Lesson 2 — Red Flags and Typologies', content = $md$### Lesson 2 — Red Flags and Typologies

A red flag is an indicator, not a verdict. Single flags are noise; **clusters** are signal. Effective monitoring looks for combinations that are hard to explain innocently.

**Transactional indicators**
- Structuring: repeated amounts just under a reporting or approval threshold
- Rapid pass-through: funds in and out within hours or days, leaving a token residue
- Round-sum and repetitive amounts inconsistent with commercial pricing
- Activity spikes with no change in the customer's stated business
- Payments to or from parties with no logical relationship to the customer

**Behavioural indicators**
- Reluctance to explain source of funds or provide routine documents
- Pressure to complete quickly, or attempts to bypass compliance staff
- Frequent unexplained changes of address, phone, or controlling persons
- Third parties who appear to direct the account holder's instructions

**Structural indicators**
- Ownership layered across multiple jurisdictions with no commercial rationale
- Nominee directors, bearer arrangements, or newly formed shells as counterparties
- Corporate accounts used for evident personal expenditure

**Worked case study — the takeaway restaurant.** A restaurant with card takings averaging €14,000 a month begins depositing €19,000–€22,000 in cash monthly while card receipts fall 20%. Supplier invoices are unchanged. Three flags cluster: cash disproportionate to declared trade, falling card volume that contradicts a "busier venue" claim, and static input costs that a genuine sales increase would move. This is a textbook cash-integration pattern and warrants an internal report.

**Beware defensive over-reporting.** Flagging everything degrades intelligence value and buries genuine cases. Each escalation should name the indicators, the profile they contradict, and what the customer's explanation failed to resolve.

**Takeaway:** Score clusters, not single events, and always test the flag against the customer's own expected profile.$md$ WHERE id = '1a9687e7-132e-4737-9769-1136c3d81e5c';

UPDATE public.academy_modules SET title = 'Lesson 3 — Building and Using the Customer Profile', content = $md$### Lesson 3 — Building and Using the Customer Profile

Monitoring is only meaningful against an expected pattern. Without a profile you cannot say activity is abnormal — you are just watching numbers.

**What a usable profile contains**
- Expected monthly volume and value, by product and channel
- Expected counterparties, sectors and corridors
- Source of funds and source of wealth, with evidence
- Purpose and intended nature of the relationship
- Risk rating and the drivers behind it

**The three risk dimensions**

| Dimension | Examples | Monitoring effect |
|---|---|---|
| Client risk | PEPs, cash-intensive trades, complex ownership, nominee use | Tighter thresholds, shorter review cycles |
| Geographic risk | FATF-listed states, sanctions exposure, weak-supervision jurisdictions | Corridor rules, enhanced counterparty checks |
| Product / channel risk | Non-face-to-face onboarding, cross-border wires, crypto, private banking | Velocity and pass-through rules |

Risk is **dynamic**. A customer onboarded as low risk who adds a third-country subsidiary, changes beneficial owner, or triples turnover must be reassessed — event-driven review, not just calendar review.

**Worked case study — profile drift.** A logistics firm is onboarded with expected volume of €50,000 a month, all domestic. Eight months later it is moving €400,000 a month, 70% to a jurisdiction under enhanced monitoring, with a new 40% shareholder added by a filing nobody reviewed. Every individual payment cleared the rules because the thresholds were set at onboarding and never refreshed. The failure is not the payments — it is the stale profile.

**Tuning.** Thresholds should be calibrated per segment and reviewed at least annually against alert outcomes. Track your false-positive rate and your true-positive yield; a rule that has never produced an escalation in twelve months is either mis-tuned or redundant.

**Takeaway:** Monitoring quality equals profile quality. Refresh profiles on trigger events and tune rules with outcome data.$md$ WHERE id = '29cbe775-489c-4439-acef-81968a454c95';

UPDATE public.academy_modules SET title = 'Lesson 4 — Investigating and Escalating an Alert', content = $md$### Lesson 4 — Investigating and Escalating an Alert

An alert is a question, not an accusation. Your job is to answer it in a way a regulator or court could follow years later.

**A repeatable five-step method**
1. **Frame** — state precisely what triggered the alert and which rule fired.
2. **Reconstruct** — map the flow: origin, route, destination, timing, counterparties.
3. **Compare** — test the activity against the documented customer profile.
4. **Enquire** — where appropriate, seek information without revealing a suspicion.
5. **Conclude** — close with reasons, or escalate to the MLRO/AMLCO with reasons.

**Asking questions safely.** Ordinary commercial due diligence questions are permitted. "Please provide the contract supporting this payment" is fine. "We think this may be money laundering and are considering a report" is tipping off. Never tell the customer that a report has been made or is contemplated.

**Timing.** Escalate promptly — internal reporting is immediate on forming suspicion, not at the end of the month. Do not batch suspicions into a weekly cycle.

**Worked case study — the resolved alert.** A wealth client transfers €300,000 to an unfamiliar counterparty. The analyst obtains a signed property purchase contract, a notary reference, and a bank confirmation matching the amount, name and date. The activity is consistent with declared wealth and a plausible life event. The alert is **closed with rationale and evidence attached** — a documented close is as much a compliance output as a report, and it is the record that protects you if the account is later scrutinised.

**Continuing the transaction.** If you have reported and the transaction has not yet been executed, do not proceed without MLRO instruction; consent or moratorium rules may apply in your jurisdiction.

**Takeaway:** Investigate to a written conclusion. Whether you close or escalate, the reasoning — not the outcome — is what is judged.$md$ WHERE id = '36f9ff4c-5c66-4007-baca-d6d89fccf3c1';

UPDATE public.academy_modules SET title = 'Lesson 5 — Internal Reporting and the FIU Route', content = $md$### Lesson 5 — Internal Reporting and the FIU Route

Reporting is a two-stage pipeline. Staff report **internally** to the MLRO/AMLCO; only the MLRO/AMLCO decides whether to file externally with the Financial Intelligence Unit.

**Stage 1 — internal report.** Any employee who knows or suspects, or has reasonable grounds to suspect, must file an internal report without delay. You may not decide unilaterally that a suspicion is "not worth reporting" — that judgement belongs to the MLRO.

**Stage 2 — MLRO evaluation.** The MLRO reviews the internal report against all available records, may gather more information, and decides to file a SAR/STR or to record a reasoned decision not to file. **Both outcomes must be documented.** An undocumented decision not to file is indefensible.

**Stage 3 — external filing.** The SAR/STR goes to the national FIU by the prescribed channel — goAML in many jurisdictions, SAR Online in the UK, FINTRAC's web reporting in Canada, BSA E-Filing in the US. Filing deadlines and forms differ; the obligation to file promptly does not.

**Records to retain**
- The internal report and its date and time
- Evidence gathered and enquiries made
- The MLRO's decision and reasoning
- The filed report, its reference number, and any FIU correspondence
- Retention typically five years from the relationship's end or the transaction date

**Worked case study — the swallowed report.** A branch employee emails a manager about an odd cash pattern. The manager decides it is "probably fine" and never forwards it. Nine months later the account features in a prosecution. The firm cannot show the suspicion ever reached the MLRO. The exposure is institutional and personal: obstructing the internal channel is itself a failure, and the manager's informal filtering removed the only decision point the law recognises.

**Takeaway:** Route every suspicion to the MLRO, in writing, immediately. Only the MLRO files externally — and every decision, either way, is recorded.$md$ WHERE id = '316ff4c8-2a0e-4583-9611-ac6f3a106667';

UPDATE public.academy_modules SET title = 'Lesson 6 — Tipping Off, Confidentiality and Protection', content = $md$### Lesson 6 — Tipping Off, Confidentiality and Protection

**Tipping off** is disclosing, to the subject or to a third party, that a suspicion has been raised, a report made, or an investigation is under way, where that disclosure is likely to prejudice the investigation. In most jurisdictions it is a criminal offence carrying imprisonment — and it applies to junior staff as much as to senior management.

**What counts as tipping off**
- Telling a customer their transaction is "under review by compliance"
- Hinting that a payment is delayed "because of a report"
- Warning a related party, a colleague outside the need-to-know circle, or a family member
- Careless behaviour: leaving a case file visible, discussing a name in an open-plan area, forwarding the alert email to the relationship manager who will speak to the client that afternoon

**What is permitted**
- Ordinary due diligence questions with no reference to suspicion or reporting
- Neutral service language: "we are completing standard checks on this payment"
- Sharing within the group or with the FIU, where the law allows it
- Discouraging a customer from engaging in illegal activity, in the prescribed terms

**Protection for the reporter.** A report made in good faith gives the reporter protection from liability for breach of confidentiality or contract, and whistleblower protection against retaliation. Good faith, not accuracy, is the test — a report that turns out to be unfounded is not a fault.

**Worked case study — the helpful relationship manager.** After a SAR is filed, an RM tells the client "there's a compliance hold, I'd move the balance elsewhere for now." The client empties the account within an hour. The investigation is prejudiced, the funds are gone, and the RM faces personal criminal exposure — regardless of a lack of dishonest intent.

**Takeaway:** Say nothing about a suspicion or report outside the need-to-know circle, and keep customer-facing language strictly neutral.$md$ WHERE id = 'f4adc08d-3145-4603-8705-9da9c26fe24f';

UPDATE public.academy_modules SET title = 'Lesson 7 — Writing the SAR and What Happens Next', content = $md$### Lesson 7 — Writing the SAR and What Happens Next

An FIU analyst has minutes per report. A vague narrative is discarded; a structured one is actioned.

**The five-part narrative**
1. **Who** — subject, identifiers, role, relationship history, related parties
2. **What** — the activity, with dates, amounts, currencies, accounts and counterparties
3. **Why suspicious** — the specific indicators and the profile they contradict
4. **What you did** — enquiries made, explanations received, why they were unconvincing
5. **What you want** — whether consent is sought, whether the account remains open

**Style rules**
- Facts before conclusions; never assert a crime you cannot evidence
- Plain language, no internal jargon or unexplained system codes
- One subject cluster per report, chronologically ordered
- Attach supporting documents where the channel allows
- State clearly what you do **not** know

**Weak vs strong**

| Weak | Strong |
|---|---|
| "Customer's account activity seemed unusual." | "Between 3 and 17 March 2026, eight inbound transfers totalling €412,000 were received from four newly incorporated counterparties, each 96–99% forwarded within 48 hours to a single account in a third country. Declared turnover is €90,000 p.a. No contracts were produced on request." |

**After filing.** The FIU acknowledges receipt and assigns a reference. It may request further information — respond promptly and completely. It may grant or refuse consent to proceed, or impose a moratorium. It may say nothing at all: **no feedback does not mean no value**; reports are intelligence that may be matched to other filings months later.

**Your ongoing duties.** Continue monitoring the customer, file supplementary reports on new suspicions, do not tip off, retain all records for the statutory period, and never close the account solely to make the problem disappear without MLRO instruction.

**Takeaway:** Write for the analyst who has never met your customer, then keep monitoring — a filed SAR ends the report, not the relationship risk.$md$ WHERE id = '068a8543-650e-4d1f-8062-89c8ac80ebb6';

DELETE FROM public.academy_modules WHERE id = 'f9b7d0c1-98a9-4bcf-8a18-0a63ee151866';

UPDATE public.academy_courses SET duration_minutes = 20, cpd_hours = 0.5, estimated_words = 3200 WHERE slug = 'transaction-monitoring-sar';