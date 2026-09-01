DELETE FROM public.academy_modules m USING public.academy_courses c WHERE m.course_id = c.id AND c.slug = 'aml-real-estate';

INSERT INTO public.academy_modules (course_id, title, content, sort_order)
SELECT c.id, v.title, v.content, v.sort_order
FROM public.academy_courses c,
(VALUES
('Lesson 1 — Why Property Is the Preferred Laundering Asset', '### Lesson 1 — Why Property Is the Preferred Laundering Asset

Real estate absorbs more criminal proceeds than any other asset class outside cash itself. The reasons are structural rather than accidental.

| Property characteristic | Laundering advantage |
|---|---|
| High value per transaction | Large sums placed in a single legitimate-looking deal |
| Stable or appreciating value | The proceeds are preserved, not merely hidden |
| Subjective pricing | Over- and under-valuation is hard to disprove |
| Usable while held | Occupation, rental income, collateral for borrowing |
| Ownership can sit behind companies and trusts | The true owner need never appear on a public record |
| Multiple parties, each seeing part of the deal | No single participant sees the whole picture |

**The three-stage model applied to property.** Placement: cash or criminal proceeds enter through deposit, renovation payments, or an all-cash purchase. Layering: ownership passes through corporate vehicles, mortgages are taken and repaid early, the property is sold between connected parties. Integration: the property is sold at market value to an unconnected buyer, and the proceeds are indisputably clean.

**Scale.** Transparency International and national FIU studies have repeatedly identified billions in UK, EU and North American property held through offshore vehicles with unidentifiable owners. The UK''s Register of Overseas Entities was created for precisely this reason.

**Case study.** A four-property portfolio in a European capital was purchased over three years for EUR 18m by three companies registered in two offshore jurisdictions. Each purchase was funded by an intra-group loan from a fourth company. Each agent, lawyer and lender saw only their own transaction. It took a law enforcement request, not any firm''s monitoring, to establish that all four companies shared one beneficial owner — a former state official.

**Takeaway:** The fragmentation of the property transaction is itself the vulnerability. Each participant must assume nobody else is seeing the whole picture.', 1),
('Lesson 2 — Who Is Regulated and What They Must Do', '### Lesson 2 — Who Is Regulated and What They Must Do

Real estate professionals are obliged entities in most developed AML regimes, but scope differs and the differences matter.

**United Kingdom.** Estate agency businesses must register with HMRC, including **letting agency** businesses where the monthly rent is at or above EUR 10,000 equivalent. Crucially, an estate agent''s customer is **both** the seller and the buyer — due diligence on the purchaser must begin as soon as they are treated as a prospective buyer, not at exchange or completion. Conveyancers are supervised by their legal professional bodies.

**European Union.** Under AMLD and now the AMLR, estate agents are obliged entities, including for lettings above the rent threshold. Cash payment limits apply.

**United States.** Historically the largest gap. FinCEN''s Geographic Targeting Orders required title insurers to report all-cash purchases above thresholds in named metropolitan areas, and the Residential Real Estate Rule extends reporting obligations to non-financed transfers to legal entities and trusts nationally.

**Canada, Australia, UAE.** Canada and the UAE bring real estate agents fully into the regime; Australia legislated to extend AML obligations to "tranche two" professions including real estate agents after years of FATF criticism.

**Core obligations wherever you operate**

1. Register with, or be supervised by, the relevant authority
2. Written firm-wide risk assessment, kept current
3. Policies, controls and procedures, with a nominated officer
4. CDD on all parties before the relationship is established
5. Ongoing monitoring, staff training and record retention (typically five years)
6. Report suspicion promptly; never tip off

**Case study.** An agency conducted purchaser due diligence only at the point of offer acceptance. A buyer had by then viewed nine properties, negotiated on three, and disclosed a funding structure involving an offshore company. The supervisor''s finding was that the agency had been acting for the buyer for weeks with no CDD, and fined it for the timing failure — not for anything about the buyer.

**Takeaway:** Timing is a compliance requirement, not a commercial preference. In agency, the purchaser becomes your customer far earlier than most firms assume.', 2),
('Lesson 3 — Customer Due Diligence Through the Deal', '### Lesson 3 — Customer Due Diligence Through the Deal

**Individuals.** Verify identity from an independent source, establish source of funds for the specific purchase, and screen for sanctions, PEP status and adverse media. For joint purchasers, verify each.

**Corporate buyers.** Verify the entity, obtain the ownership chain to natural persons, verify each beneficial owner, and understand why a company is being used. Legitimate reasons exist — portfolio holding, tax structuring, liability. "No particular reason" is itself a finding.

**Trusts.** Settlor, trustee, protector, beneficiaries. A trustee purchasing property must evidence the authority to do so.

**Source of funds versus source of wealth**

| Concept | Question | Typical evidence |
|---|---|---|
| Source of funds | Where is the money for this purchase coming from? | Bank statements showing accumulation, sale contract for a prior property, mortgage offer, gift letter with donor evidence |
| Source of wealth | How was the buyer''s overall wealth generated? | Business accounts, employment history, inheritance documentation, investment records |

A mortgage offer evidences the lender''s decision, not the deposit. The deposit is where laundering concentrates, and it must be evidenced separately.

**Higher-risk indicators requiring EDD**

- Buyer or beneficial owner is a PEP, family member or close associate
- Funds originating from, or the buyer resident in, a high-risk third country
- Purchase through a corporate vehicle in a secrecy jurisdiction
- Third-party funding — money arriving from someone who is not the buyer
- Purchaser never viewed the property or shows no interest in its condition
- Price materially above or below market value

**Case study.** A buyer purchased a GBP 2.4m house with a GBP 900k deposit described as "family savings". The agent accepted a single bank statement showing the balance present. Enhanced review would have asked for six months of statements showing accumulation; the funds had arrived four days earlier in three transfers from a company in a third country. One question — how did the money get into the account? — was the entire difference.

**Takeaway:** A balance is not a source. Evidence how the money arrived and where it came from before it arrived.', 3),
('Lesson 4 — Red Flags Across the Transaction Lifecycle', '### Lesson 4 — Red Flags Across the Transaction Lifecycle

**At instruction or enquiry**

- Buyer indifferent to price, location, condition or rental yield
- Purchase in someone else''s name or through a company formed days earlier
- Unwillingness to meet, provide identification, or explain funding
- Insistence on extreme speed with no commercial reason

**During due diligence**

- Complex ownership with no economic rationale
- Beneficial owner resides in a different jurisdiction from every entity in the chain
- Buyer''s stated occupation cannot plausibly generate the purchase value
- Reluctance to identify the source of the deposit

**At funding**

- Funds from multiple accounts, multiple jurisdictions, or third parties
- Cash, or a request to accept part payment in cash
- Payment from a company account for a personal purchase
- A last-minute change of payer or of purchasing entity
- Overpayment followed by a request for a refund to a different account — a classic conversion technique

**After completion**

- Early mortgage redemption from an unexplained source, particularly within months
- Rapid resale ("flipping") at a materially different price between connected parties
- Property left vacant with no attempt to let it
- Renovation invoices grossly disproportionate to the works, paid to a related contractor

**Price anomaly testing.** Compare the agreed price to comparable sales and to any valuation. A 30% deviation without explanation is worth a documented question. Under-valuation moves value to the buyer off-record; over-valuation places excess funds into the property.

**Case study.** A property was bought for GBP 1.1m, resold nine months later to a connected company for GBP 2.8m, then mortgaged for GBP 2.1m against the inflated value. The mortgage proceeds were the laundering objective: criminal funds bought the property, an inflated resale created paper value, and a lender advanced clean money against it. The lender''s valuation had been instructed by the broker acting for both parties.

**Takeaway:** The strongest red flags are economic rather than documentary. Ask whether the transaction makes commercial sense; if not, document why you proceeded.', 4),
('Lesson 5 — Lettings, Developers and Professional Enablers', '### Lesson 5 — Lettings, Developers and Professional Enablers

**Lettings.** High-value lettings are captured where monthly rent reaches the EUR 10,000 threshold, and both landlord and tenant are customers. Risks: rent paid a year in advance in cash or from a third party; a tenant whose income cannot support the rent; a property used as a residence by someone other than the named tenant; and landlords using rental income to give criminal proceeds an apparently legitimate source.

**Developers and off-plan sales.** Long timelines, staged payments and pre-completion assignment of contracts create three specific risks: payments from parties who never become the owner, contract assignment to an unvetted final buyer, and deposit refunds routed to accounts other than the one that paid. The controls are straightforward — identify each payer, re-run CDD on assignment, and refund only to source.

**Professional enablers.** Lawyers, accountants, corporate service providers and brokers are the connective tissue of property laundering, whether complicit or merely incurious. Client accounts are a particular risk: money passing through a solicitor''s client account acquires a veneer of legitimacy. Professional bodies have been explicit that a client account must not be used as a banking facility — funds must relate to an underlying legal transaction.

**Deal-chain assurance.** Every participant should assume the others may have done nothing. Practical measures: confirm which firm is verifying which party, do not rely on another firm''s CDD without obtaining and reviewing the underlying evidence, and record any reliance arrangement in writing.

**Case study.** A conveyancing firm received GBP 3.2m into its client account for a purchase that then "fell through". The client instructed a refund to a different account in another jurisdiction. The firm complied. It had performed no source-of-funds work because, in its view, no transaction had completed. That is exactly the mechanism: the client account was used as a laundering conduit, and the aborted transaction was the point of the exercise.

**Takeaway:** Aborted transactions and refunds are high-risk events, not administrative ones. Refund only to the originating account, and complete source-of-funds work before accepting money at all.', 5),
('Lesson 6 — Worked Case: A PEP-Linked Corporate Purchase', '### Lesson 6 — Worked Case: A PEP-Linked Corporate Purchase

**Scenario.** You are the nominated officer at a London estate agency. A GBP 6.5m townhouse is under offer. The buyer is a company registered in Guernsey, owned by a discretionary trust. The named contact is a wealth manager.

**Step 1 — Establish the parties.** Request the trust deed, the identity of the settlor, trustee, protector and beneficiary class, and verified identification for each natural person. The trust deed shows the settlor is a former deputy minister of a central Asian state, in office until eighteen months ago. His two adult children are beneficiaries.

**Step 2 — Classify.** A former PEP within the risk-assessment period, plus family members as beneficiaries. EDD is mandatory: senior management approval, source of wealth, source of funds, enhanced ongoing monitoring.

**Step 3 — Source of wealth.** Stated as the sale of a logistics business in 2019 for USD 40m. Evidence requested: the sale and purchase agreement, audited accounts for three years before the sale, and evidence of receipt of proceeds. What arrives is a one-page summary and a lawyer''s letter. Adverse media in Russian identifies the logistics business as the recipient of state contracts awarded by the ministry the settlor headed.

**Step 4 — Source of funds.** Funds are to come from a Cyprus account in the name of a company that is not the buyer and is not in the trust structure. No explanation is offered beyond "group treasury".

**Step 5 — Assess.** Three defects: source of wealth not evidenced, a direct corruption nexus between the wealth and the settlor''s office, and third-party funding from outside the disclosed structure.

**Step 6 — Act.** Decline the transaction. Submit a SAR to the national FIU, seeking a defence against money laundering if the firm would otherwise be dealing with criminal property. Do not tell the buyer, the wealth manager or the seller why the transaction is not proceeding — tipping off is a criminal offence. Record the decision, the evidence, the analysis and the SAR reference.

**Step 7 — Manage the commercial pressure.** The seller and the negotiator will press for an explanation. Prepare an approved form of words that discloses nothing and involves senior management. This is where firms most often commit the tipping-off offence.

**Takeaway:** The hardest part of a property SAR is not the analysis. It is holding the line on tipping off while the deal collapses around you.', 6),
('Lesson 7 — Failure Modes and an Operational Checklist', '### Lesson 7 — Failure Modes and an Operational Checklist

**Failure modes in real estate AML**

1. **Late CDD.** Purchaser checks left until offer acceptance or completion.
2. **Seller-only due diligence.** Forgetting that in agency both parties are customers.
3. **Balance mistaken for source.** A statement showing money present is not evidence of where it came from.
4. **Reliance without evidence.** Assuming the conveyancer, lender or other agent has done the work.
5. **Client account as a banking facility.** Accepting and refunding funds with no underlying transaction.
6. **Tipping off during a collapsed deal.** Explaining too much under commercial pressure.
7. **No price-anomaly testing.** Over- and under-valuation passing unchallenged.
8. **No firm-wide risk assessment**, or one written once and never updated — among the most commonly penalised failings by HMRC.
9. **Registration lapses.** Trading while unregistered, or failing to notify changes.
10. **Training limited to the compliance team**, when the negotiator on the viewing sees the red flags first.

**Operational checklist**

- [ ] Firm-wide written risk assessment, reviewed at least annually and after any material change
- [ ] Registered with the correct supervisor, with all beneficial owners and officers fit-and-proper tested
- [ ] CDD on buyer and seller, started at the point each becomes a customer
- [ ] Source of funds evidenced for the deposit specifically, with accumulation history
- [ ] Corporate and trust buyers unwrapped to natural persons, each verified and screened
- [ ] Sanctions, PEP and adverse media screening on all parties, re-run before completion
- [ ] Price compared to comparables, with material deviation documented
- [ ] Third-party payments refused or fully evidenced; refunds only to the originating account
- [ ] Lettings above the rent threshold treated as in scope, with both landlord and tenant as customers
- [ ] Nominated officer with authority, an internal reporting route, and a SAR log
- [ ] Tipping-off protocol with approved wording for collapsed transactions
- [ ] Training for negotiators, viewing staff and administrators, not just compliance, with records retained

**Takeaway:** In real estate, the control that catches the most is also the simplest: verify who is paying, evidence where the money came from, and start early enough that you can still say no.', 7)
) AS v(title, content, sort_order)
WHERE c.slug = 'aml-real-estate';

UPDATE public.academy_courses SET duration_minutes = 20, cpd_hours = 0.5, estimated_words = 3200 WHERE slug = 'aml-real-estate';

DELETE FROM public.academy_questions q USING public.academy_courses c WHERE q.course_id = c.id AND c.slug = 'aml-real-estate';

INSERT INTO public.academy_questions (course_id, question, options, correct_index, explanation, sort_order)
SELECT c.id, v.question, v.options::jsonb, v.correct_index, v.explanation, v.sort_order
FROM public.academy_courses c,
(VALUES
('Why is real estate especially attractive for laundering?', '["Transactions are always cash","High value, stable worth, subjective pricing and ownership behind vehicles","Property cannot be seized","No records are kept"]', 1, 'These structural features let large sums be placed, preserved and obscured in one legitimate-looking asset.', 1),
('In UK estate agency, who is the agent''s customer?', '["The seller only","Both the seller and the buyer","The lender","The conveyancer"]', 1, 'Estate agency businesses must conduct due diligence on both parties to the transaction.', 2),
('When must purchaser due diligence begin?', '["At completion","At exchange of contracts","As soon as the person is treated as a prospective buyer","After the mortgage offer"]', 2, 'CDD must be in place before acting for the buyer; delaying to offer acceptance is a timing failure.', 3),
('Letting agency businesses fall in scope where monthly rent is at or above:', '["EUR 1,000","EUR 5,000","EUR 10,000","EUR 25,000"]', 2, 'High-value lettings at or above EUR 10,000 per month bring letting agents into scope.', 4),
('Which US measure requires reporting of all-cash property purchases in named metropolitan areas?', '["Geographic Targeting Orders","The Patriot Act pillar rule","FBAR","Form 8300 only"]', 0, 'FinCEN GTOs required title insurers to report qualifying all-cash purchases.', 5),
('A single bank statement showing the deposit balance present is:', '["Sufficient source of funds evidence","Evidence of a balance, not of where the money came from","Only needed for cash buyers","Required only for PEPs"]', 1, 'Source of funds requires accumulation history and origin, not a snapshot balance.', 6),
('A mortgage offer evidences:', '["The source of the deposit","The lender''s credit decision, not the deposit''s origin","The buyer''s source of wealth","That no CDD is needed"]', 1, 'The deposit is where laundering concentrates and must be evidenced separately.', 7),
('Which is a source of wealth question rather than a source of funds question?', '["Which account is paying the deposit?","How was the buyer''s overall wealth generated?","Which bank issued the transfer?","What is the completion date?"]', 1, 'Source of wealth concerns the origin of total wealth; source of funds concerns this transaction.', 8),
('A buyer never views the property and is indifferent to condition. This indicates:', '["A cash-rich investor, no concern","A red flag warranting enquiry and documentation","A standard off-plan purchase","A surveyor error"]', 1, 'Indifference to the asset suggests the purchase serves a purpose other than acquiring property.', 9),
('An overpayment followed by a refund request to a different account is:', '["An administrative matter","A classic conversion technique and a serious red flag","Normal in conveyancing","Only a tax issue"]', 1, 'This mechanism converts funds and changes their apparent origin; refunds must go to the originating account.', 10),
('A property bought for GBP 1.1m is resold to a connected company for GBP 2.8m and mortgaged for GBP 2.1m. What was the objective?', '["Capital gains planning","Extracting clean lender funds against an inflated value","Reducing stamp duty","Improving the yield"]', 1, 'The inflated resale creates paper value against which a lender advances legitimate money.', 11),
('What deviation from comparable market value merits a documented question?', '["Any deviation at all","Around 30% or more without explanation","Only above 200%","Deviation is irrelevant"]', 1, 'A material deviation, commonly taken as around 30%, should be challenged and recorded.', 12),
('What is the rule on solicitors'' client accounts?', '["They may be used as a banking facility","Funds must relate to an underlying legal transaction","They are outside AML scope","Only cash is prohibited"]', 1, 'Professional bodies prohibit use of the client account as a banking facility.', 13),
('In off-plan sales, what should happen when a contract is assigned to a new buyer?', '["Nothing, the developer is the customer","CDD is re-run on the new buyer","Only the deposit is checked","The agent is notified"]', 1, 'The final buyer must be identified and verified; assignment is a common vetting gap.', 14),
('An aborted transaction with a refund request should be treated as:', '["A routine administrative event","A high-risk event requiring source-of-funds work and consideration of a report","A reason to close the file","A matter for the seller only"]', 1, 'Aborted deals are a recognised laundering mechanism using client accounts as conduits.', 15),
('A former minister who left office 18 months ago whose children are trust beneficiaries requires:', '["No special treatment","Enhanced due diligence including source of wealth and senior approval","Automatic refusal","Simplified due diligence"]', 1, 'Former PEP status within the risk-assessment period and family beneficiaries both mandate EDD.', 16),
('After submitting a SAR on a collapsing property deal, what must you avoid?', '["Recording the decision","Disclosing to the buyer, agent or seller why it is not proceeding","Informing senior management","Retaining the evidence"]', 1, 'Tipping off is a criminal offence; use approved wording and involve senior management.', 17),
('Which failing is among the most commonly penalised by HMRC for estate agents?', '["Not advertising fees","No current firm-wide written risk assessment or unregistered trading","Slow email responses","Using a single valuer"]', 1, 'Missing or stale risk assessments and registration failures dominate published enforcement.', 18)
) AS v(question, options, correct_index, explanation, sort_order)
WHERE c.slug = 'aml-real-estate';