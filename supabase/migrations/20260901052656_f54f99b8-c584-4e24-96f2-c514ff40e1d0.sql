
-- =====================  BENEFICIAL OWNERSHIP  =====================
UPDATE public.academy_modules SET title = 'Lesson 1 — What a beneficial owner is, and why the definition matters', content = $md$
### The core idea

A **beneficial owner** is always a **natural person** — a human being — who ultimately owns or controls a customer, or on whose behalf a transaction is conducted. Companies, trusts and foundations are legal fictions; someone real stands behind every one of them.

The purpose of UBO identification is simple: **money laundering depends on distance between the criminal and the asset.** Layered corporate structures create that distance. UBO work removes it.

### The legal framework

- **FATF Recommendation 10** — identify the beneficial owner and take reasonable measures to verify identity.
- **FATF Recommendations 24 & 25** — countries must ensure adequate, accurate and **up-to-date** beneficial-ownership information on legal persons and arrangements, available to competent authorities in a timely way.
- **EU AMLR / AMLD** — 25% shareholding or voting rights as the indicative threshold, with a lower threshold for higher-risk cases; senior managing official as fallback.
- **UK** — the **PSC register** (persons with significant control), 25% threshold, plus the Register of Overseas Entities for UK property.
- **US** — the **FinCEN Corporate Transparency Act / BOI reporting** regime: 25% ownership *or* substantial control.

### Ownership is not the only route to control

The 25% figure gets all the attention, and it catches only the easy cases. Control also arises through:

| Control route | Example |
|---|---|
| **Voting rights** | Class B shares carrying 10 votes each on a 5% holding |
| **Right to appoint/remove** | A shareholder agreement giving one party the right to appoint a majority of the board |
| **Contractual control** | Loan covenants or management agreements that give a lender effective veto |
| **Nominee arrangements** | The registered holder acts on instruction from someone else |
| **Trust roles** | Settlor, trustee, protector, beneficiaries, and anyone with control over the trust |
| **Family/associate aggregation** | Four relatives holding 24% each |

### The senior managing official fallback

Where no natural person is identified through ownership or control **after exhausting all reasonable means**, the **senior managing official** may be recorded as the UBO. This is a last resort — and firms abuse it. If your UBO field says "senior managing official" for a customer with a five-layer offshore structure, you have not done UBO work; you have given up and documented it badly.

Record: what you searched, what you found, why ownership could not be established, and who approved use of the fallback.

### Case study — 25% is a floor, not a test

A bank onboarded *Northwind Logistics Ltd*. Shareholders: four unrelated companies at 25%, 25%, 25% and 25%. Each was owned by a different individual, none of whom exceeded the threshold **at group level** on the bank's arithmetic — so no UBO was recorded and the senior managing official was used.

A later law-enforcement request revealed that all four holding companies had the same registered office, the same sole director, and shareholder agreements naming one person with the right to appoint the entire board of Northwind.

The bank held every document needed to see this. It never read them: the analyst had checked percentages only.

**Takeaway:** compute ownership, but **read the constitutional documents** — control is where the real UBO usually hides.
$md$ WHERE id = '7ce515c0-b5ea-470e-8951-d249f859466a';

UPDATE public.academy_modules SET title = 'Lesson 2 — Tracing ownership through layers: the arithmetic and the method', content = $md$
### Multiplying through the chain

Indirect ownership is multiplied down the chain and summed across chains.

**Worked example**

*Customer:* Delta Trading Ltd (UK)
- Alpha Holdings BV owns **60%** of Delta
- Beta Invest Sàrl owns **40%** of Delta
- *Ms P.* owns **50%** of Alpha and **30%** of Beta
- *Mr Q.* owns **50%** of Alpha
- *Ms R.* owns **70%** of Beta

| Person | Chain 1 | Chain 2 | Total | UBO at 25%? |
|---|---|---|---|---|
| Ms P. | 0.60 × 0.50 = 30% | 0.40 × 0.30 = 12% | **42%** | Yes |
| Mr Q. | 0.60 × 0.50 = 30% | — | **30%** | Yes |
| Ms R. | — | 0.40 × 0.70 = 28% | **28%** | Yes |

Three UBOs. Note that Ms R. only qualifies because you multiplied correctly — a common shortcut ("she's only in a 40% branch") would have missed her.

### Where the arithmetic breaks

- **Control chains override percentages.** A 5% holder who appoints the board is a UBO; a 60% non-voting preference holder may not be.
- **Circular and reciprocal holdings** — A owns B, B owns A. Map it and look for the person outside the loop.
- **Treasury and unissued shares** — compute on issued voting share capital, and say which basis you used.
- **Bearer shares and share warrants** — ownership can change hands with no record. In most reputable jurisdictions these are now immobilised or abolished; their presence is itself a red flag.
- **Nominee shareholders and directors** — the register shows an agent. Ask for the nominee agreement, and identify the nominator.

### The method that works

1. **Obtain the structure chart from the customer** — signed and dated by a director.
2. **Verify it independently** — company registry extracts at every layer, not just the top.
3. **Read the documents** — articles, shareholder agreements, trust deeds, powers of attorney.
4. **Identify natural persons at the end of every branch**, then apply the threshold and the control tests.
5. **Screen every identified UBO** — sanctions, PEP, adverse media.
6. **Record the chart you verified**, with source and date for each layer.

Never accept a customer-drawn chart as verification of itself.

### Case study — the branch nobody followed

A trade-finance client presented a three-layer chart ending in two named individuals. Registry checks on layers one and two matched. Layer three was a Marshall Islands entity; the analyst noted "*no public registry available*" and closed the file with the two named individuals as UBOs.

The Marshall Islands entity held **35%**. Its owner — obtainable from the corporate service provider under the client's own instruction, had anyone asked — was a **sanctioned individual's brother**.

The failure was not the opaque jurisdiction. It was accepting "no public registry" as the end of the enquiry instead of demanding the information from the customer as a condition of the relationship.

**Takeaway:** when a registry cannot tell you, the **customer** must — and refusal to provide it is itself a decision-grade fact.
$md$ WHERE id = '42ae13fb-9acf-49a4-ae98-d295cd0e04df';

INSERT INTO public.academy_modules (course_id, title, content, sort_order) VALUES
((SELECT id FROM public.academy_courses WHERE slug='beneficial-ownership'), 'Lesson 3 — Trusts, foundations and other legal arrangements', $md$
### Why trusts are different

A company has owners. A **trust has no owner** — it is a relationship in which a trustee holds assets for beneficiaries. There is no percentage to compute, so the ownership arithmetic of the previous lesson does not apply. Instead, FATF Recommendation 25 requires you to identify **every party with a role**.

### The five roles you must capture

| Role | What they do | Why they matter |
|---|---|---|
| **Settlor** | Put the assets in | Source of wealth sits here; may retain control |
| **Trustee** | Legal owner, administers the trust | Professional or family; the decision-maker on paper |
| **Protector / enforcer** | Can often remove the trustee, veto distributions | Frequently the *real* controller |
| **Beneficiaries** | Receive benefit | Named, class-based, or discretionary |
| **Any other natural person with ultimate control** | Powers of appointment, letters of wishes | Catch-all — read the deed |

**All five categories are beneficial owners** for CDD purposes. Recording only the trustee is a standard audit finding.

### Discretionary trusts and classes of beneficiary

Where beneficiaries are a **class** ("the settlor's descendants"), identify the **class** and the individuals who have actually received or are likely to receive distributions. Ask for the distribution history. A discretionary trust that has paid 100% of distributions to one person for eight years has a de facto beneficial owner, whatever the deed says.

### Letters of wishes

Non-binding in law, decisive in practice. They tell the trustee what the settlor actually wants. If a customer will not provide one, note it — you are being asked to accept a structure whose real intent is withheld.

### Foundations and other arrangements

Civil-law **foundations** (Liechtenstein *Stiftung*, Panama, Netherlands *stichting*) blend company and trust features: founder, council members, beneficiaries, sometimes a protector. Treat them on the trust model — identify every role. Similar analysis applies to *fideicomiso*, *waqf*, *Treuhand* and partnership arrangements with silent partners.

### Red flags in arrangements

- Protector is a **relative or associate of the settlor** with removal powers over the trustee
- The settlor is also a beneficiary and effectively directs the trustee (a "**sham trust**" indicator)
- Frequent trustee changes, or trustees in multiple jurisdictions in a short period
- Assets contributed shortly before litigation, insolvency, divorce or an investigation
- Beneficiary classes drawn so widely they identify nobody

### Case study — the protector who was the point

A private bank onboarded a Jersey discretionary trust. Trustee: a licensed professional firm. Beneficiaries: "the children and remoter issue of the settlor". Settlor: a businessman in a high-risk jurisdiction, screened clean.

The bank recorded the trustee and settlor as UBOs and rated the relationship medium risk. Two years later, an FIU request revealed the **protector** — unrecorded in the file — was the settlor's business partner, a **sanctioned individual's nominee**, holding the power to remove the trustee and direct investment policy.

The trust deed naming him had been on file the whole time, unread beyond page one.

**Takeaway:** in trust structures the power sits in the deed, not in the ownership column. Read every role, and record every one.
$md$, 3),

((SELECT id FROM public.academy_courses WHERE slug='beneficial-ownership'), 'Lesson 4 — Registers: what they give you and what they do not', $md$
### The register landscape

| Register | Coverage | Access | Known limitations |
|---|---|---|---|
| **UK PSC** (Companies House) | UK companies and LLPs | Public | Self-declared; historically unverified — verification is being phased in under ECCTA |
| **UK Register of Overseas Entities** | Overseas owners of UK property | Public | Only property-holding entities |
| **EU central registers** | EU member-state companies and trusts | Restricted since the 2022 CJEU ruling — legitimate-interest access | Access varies sharply by member state |
| **US FinCEN BOI** | US and registered-foreign companies | **Not public** — authorities and, with consent, financial institutions | Access mechanics and exemptions are complex |
| **Offshore registries** | Varies | Often director-only, or paid search | Frequently no ownership data at all |

### The verification trap

A register entry is **information**, not automatically **verification**. Where the data is self-declared and unchecked by the registrar — as with the PSC register historically — it evidences what the customer told the state, which is exactly what your CDD form already tells you.

FATF's expectation is a **multi-pronged approach**: register data **plus** information from the customer **plus** information you hold or can obtain elsewhere. Discrepancies between those sources are the most valuable output of the whole exercise.

### Discrepancy reporting

Several regimes (EU AMLD5 as implemented, UK) impose a **duty to report discrepancies** between the register and what you determine. Build it into the workflow: if your verified chart differs from the PSC/central register entry, file the discrepancy report and record the reference. Firms routinely identify discrepancies and never report them.

### Practical sourcing beyond registers

- **Audited financial statements** — group structure notes, related-party disclosures
- **Regulatory filings** — prospectuses, licence applications, listing documents
- **Land and vessel/aircraft registries**
- **Litigation records** — pleadings often expose control arrangements
- **Corporate service provider confirmations** — signed, on letterhead
- **Leaked-document journalism** (Panama/Pandora/Paradise archives) — useful as a *lead*, never as verification on its own

### Case study — three sources, three answers

A corporate customer's UBO was recorded as *Mr S.* at 100%.

- The **PSC register** showed Mr S. as sole PSC.
- The **audited accounts** disclosed a related-party loan from a company controlled by *Mrs T.*, describing her as having "significant influence".
- The **shareholders' agreement** — obtained only because the analyst asked — gave Mrs T. the right to appoint two of three directors and veto any dividend.

Mrs T. held **zero shares** and appeared on no register. She controlled the company. The bank filed a PSC discrepancy report and recorded both individuals as UBOs.

**Takeaway:** registers are one input. Triangulating them against accounts and constitutional documents is what actually identifies control.
$md$, 4),

((SELECT id FROM public.academy_courses WHERE slug='beneficial-ownership'), 'Lesson 5 — Red flags, opacity and when to walk away', $md$
### Structural red flags

- **Complexity without commercial rationale** — five layers across four jurisdictions for a regional business with €2m turnover
- **Jurisdictions chosen for secrecy** rather than trade, tax treaty or market access
- **Nominee shareholders and directors**, especially mass-appointment directors holding hundreds of posts
- **Bearer shares or share warrants to bearer**
- **Recently incorporated entities** inserted into an otherwise stable structure
- **Shelf companies** bought off the peg with backdated incorporation
- **Circular ownership** or entities owning each other
- **Frequent structural changes** with no business event to explain them

### Behavioural red flags

- Reluctance or delay in providing the structure chart or constitutional documents
- The customer's explanation of the structure changes between conversations
- The person the bank actually deals with is **not** in the ownership chart
- Instructions arrive from someone with no documented role
- Requests to avoid documenting a particular individual
- The stated rationale is tax-driven and vague

### The rationale test

For any structure more complex than the business needs, ask the customer to explain **in writing** why it exists, and assess whether the explanation is commercially coherent. "Our advisers set it up" is not an explanation. Good faith customers with genuine reasons — investor protection, succession planning, regulatory ring-fencing, joint-venture governance — answer this easily and in detail.

### When you cannot identify the UBO

If, after exhausting reasonable means including asking the customer directly, you cannot identify the beneficial owner:

1. Do **not** default to the senior managing official as a convenience.
2. Do **not** onboard on the assumption you will find out later.
3. Consider whether the failure itself is suspicious and whether a **SAR** is required.
4. Where the relationship exists, consider termination — and remember that tipping-off rules constrain what you may tell the customer.

FATF and national rules are explicit: where CDD cannot be completed, the firm must not establish the relationship or carry out the transaction, and must consider reporting.

### Case study — the structure that answered itself

A payments firm received an application from a UK company with a Cyprus parent, a Belize grandparent, and a Seychelles great-grandparent. Turnover projection: £900,000, all domestic UK services.

Asked in writing to explain the rationale, the customer's adviser replied that the structure was "for confidentiality and asset protection". Pressed for the natural persons behind the Seychelles entity, the customer withdrew the application within 48 hours.

The firm filed a SAR based on the combination of unexplained complexity, secrecy jurisdictions with no commercial link to the business, and withdrawal on enquiry. The FIU later confirmed the structure appeared in an ongoing investigation.

**Takeaway:** the rationale question is cheap, fast, and one of the highest-yield controls in beneficial-ownership work.
$md$, 5),

((SELECT id FROM public.academy_courses WHERE slug='beneficial-ownership'), 'Lesson 6 — Full worked case: unpicking a five-layer structure', $md$
### The scenario

**Applicant:** *Kestrel Marine Services Ltd* (UK), ship-management, applying for banking facilities and a €4m working-capital line.
**Presented chart:** Kestrel (UK) ← *Kestrel Holdings Ltd* (Cyprus, 100%) ← *Ardent Maritime Inc* (BVI, 100%) ← a Liechtenstein foundation, *Aurelia Stiftung*.
**Declared UBO on the application form:** *Mr V.*, described as "founder".

### Step 1 — Verify each layer independently

| Layer | Source | Result |
|---|---|---|
| Kestrel Ltd (UK) | Companies House | Confirms Cyprus parent 100%. PSC register: "no individual with significant control identified" |
| Kestrel Holdings (Cyprus) | Cyprus registry extract | Confirms Ardent (BVI) 100%; two nominee directors from a local CSP |
| Ardent Maritime (BVI) | No public ownership data | **Requested from customer**: certificate of incumbency + register of members |
| Aurelia Stiftung (LI) | Not public | **Requested**: foundation deed, by-laws, council list |

Two layers required the customer to produce documents. The customer complied within a week — a positive signal in itself.

### Step 2 — Read the documents

The BVI **register of members** confirmed the foundation as sole shareholder. The **foundation deed** disclosed:

- **Founder:** Mr V.
- **Council members:** a Liechtenstein trust company (2 seats) and *Mrs V.* (1 seat)
- **Beneficiaries:** "the founder during his lifetime, thereafter his descendants"
- **Protector:** *Mr W.*, with power to remove and appoint council members
- **By-law clause 7.3:** investment and distribution decisions require the protector's written consent

### Step 3 — Identify every UBO

| Person | Basis | Recorded as UBO? |
|---|---|---|
| Mr V. | Founder + primary beneficiary | **Yes** |
| Mrs V. | Council member (management body) | **Yes** |
| Mr W. | Protector with removal power + consent veto | **Yes — the controlling party** |
| Descendants (class) | Contingent beneficiaries | Recorded as a class; named where distributions occur |
| Nominee directors (Cyprus) | Acting on instruction | Not UBOs; nominee agreements obtained and nominators identified |

### Step 4 — Screen and assess

Screening on all three named individuals returned: Mr V. clean; Mrs V. clean; **Mr W.** — a 0.94 PEP match, former deputy minister of transport in a CIS state, left office 2022, with 2023 adverse media referencing a state shipping-contract inquiry.

The company's business is **ship management**. The protector is a former transport minister linked to a **shipping-contract inquiry**. The structure exists to hold a ship-management business at four removes from him.

### Step 5 — Decision

Recorded as **high risk**. Escalated to committee. Required before any decision: full source-of-wealth on Mr W.'s contribution routes, the letter of wishes, the list of vessels and charterers, and screening of every charter counterparty.

Committee outcome: **decline**. Rationale: the controlling party is a foreign PEP with unresolved adverse media in the exact sector financed; the structure's only evident purpose is to obscure that connection; source of wealth could not be evidenced to the required standard.

### Step 6 — Follow-up actions

PSC discrepancy report filed against the UK entity (which had declared **no** identifiable individual with significant control, while three natural persons were identifiable). Internal record created. SAR considered and filed on the basis of the structure's evident purpose combined with the PEP linkage.

**The lesson of the case:** every fact that mattered came from **documents the customer supplied on request** — not from registers. Ask, read, and record.
$md$, 6),

((SELECT id FROM public.academy_courses WHERE slug='beneficial-ownership'), 'Lesson 7 — Ongoing obligations, documentation and your checklist', $md$
### UBO data decays

Ownership changes silently. Build refresh into the lifecycle:

- **Periodic review** by risk tier — 12 months high, 24–36 months standard.
- **Trigger events** — change of directors, share transfer, new registry filing, insolvency of a group entity, adverse media on any UBO, change of registered office or CSP, sanctions designation anywhere in the chain.
- **Continuous screening of all recorded UBOs**, not just the customer entity. This is the single most-missed control: firms screen the company daily and the humans behind it once, at onboarding.
- **Registry monitoring** where available — automated alerts on filings for material customers.

### Documenting the chart

Your file should contain a **verified ownership chart** that shows, for every node: entity name, jurisdiction, registration number, percentage held, the **source and date** of the evidence, and — at the terminal nodes — the identified natural persons with their verification method.

A chart without sources is a drawing. A chart with sources is evidence.

### Retention

Keep the chart, the underlying registry extracts, the constitutional documents, the nominee agreements, the trust/foundation deeds, screening results for every UBO, the discrepancy reports filed, and the approval record — for the statutory period after the relationship ends.

### Your checklist

**Identification**
- Obtain a signed, dated structure chart from the customer
- Verify **every** layer with independent registry or documentary evidence
- Compute indirect ownership by multiplying and summing across all chains
- Apply control tests as well as percentages: voting rights, appointment rights, contracts, nominees
- For trusts/foundations, capture **all five roles**
- Use the senior-managing-official fallback only after documented exhaustion, with approval

**Assessment**
- Ask for, and assess, the written rationale for any complex structure
- Screen every natural person identified — sanctions, PEP, adverse media
- Test for red flags: secrecy jurisdictions, nominees, bearer shares, recent insertions
- Where CDD cannot be completed: do not onboard; consider a SAR

**Maintenance**
- Continuous screening of all UBOs
- Trigger-event and periodic refresh with approval re-taken
- File register discrepancy reports where required and record the reference
- Retain the sourced chart and every supporting document

### Three principles to carry away

1. **Percentages find the obvious; documents find the controller.** Read the articles, the shareholder agreement and the deed.
2. **A register is an input, not a verification** — triangulate it against the accounts and the customer.
3. **Complexity must justify itself.** Ask why the structure exists, in writing, every time.
$md$, 7);

UPDATE public.academy_courses SET duration_minutes = 20, cpd_hours = 0.5, estimated_words = 3150 WHERE slug = 'beneficial-ownership';


-- =====================  RISK-BASED APPROACH  =====================
UPDATE public.academy_modules SET title = 'Lesson 1 — The Risk-Based Approach: principle, obligation and misuse', content = $md$
### The principle

The **Risk-Based Approach (RBA)** is the organising idea of the entire FATF framework. **FATF Recommendation 1** requires countries and firms to *identify, assess and understand* their money-laundering and terrorist-financing risks, and to apply measures **commensurate** with those risks — enhanced where risk is higher, simplified where it is demonstrably lower.

The alternative — a rules-based approach applying identical controls to everyone — wastes resource on low-risk customers and under-controls the dangerous ones. The RBA is not a licence to do less. It is an obligation to **allocate more where it matters and prove you knew where that was**.

### The two levels of assessment

**1. Business-Wide Risk Assessment (BWRA)** — the firm-level view. Required explicitly in most regimes (e.g. UK MLR 2017 reg.18, EU AMLD Art.8). It must cover, at minimum:

| Risk factor | What you assess |
|---|---|
| **Customer** | Types, sectors, PEP exposure, non-resident share, entity complexity |
| **Product / service** | Cash intensity, cross-border capability, anonymity, third-party payments |
| **Delivery channel** | Face-to-face, non-face-to-face, intermediated, agent networks |
| **Geographic** | Country exposure of customers, counterparties and flows |
| **Transaction** | Value, volume, velocity, patterns |

The BWRA must be **documented, approved by senior management, kept current, and updated on material change** (new product, new market, new channel, new typology, regulatory change).

**2. Customer Risk Assessment (CRA)** — the relationship-level view, applying the same factor families to one customer, producing a rating that drives CDD level, monitoring intensity and review frequency.

The link between them is what regulators test: your CRA factors and weights should be **derived from** the BWRA, not invented separately.

### Inherent, control, residual

- **Inherent risk** — the risk before controls.
- **Control effectiveness** — how well your mitigants actually work, evidenced by testing.
- **Residual risk** — what is left, and what the board accepts.

Firms commonly score inherent risk carefully and then assert control effectiveness with no evidence. Residual risk that has never been tested is an opinion.

### The two ways firms misuse the RBA

1. **Risk-based as an excuse to do less** — "we're risk-based" used to justify absent controls. Simplified due diligence requires **evidence** of lower risk, and is never permitted where suspicion exists or the customer is in a high-risk category.
2. **Wholesale de-risking** — exiting entire sectors or nationalities rather than assessing individuals. FATF has repeatedly warned this is the **opposite** of the RBA and drives activity into unregulated channels.

### Case study — the assessment that was never used

A payments firm produced a 60-page BWRA rating **agent-network cash-in** as its highest inherent risk. The document was board-approved and filed.

Its customer risk model, built two years earlier by a different team, contained **no agent-channel factor at all**. Every agent-onboarded customer scored as standard retail, and monitoring thresholds were identical to app-based customers.

The regulator's finding was not that the firm misunderstood its risk — the BWRA was rated "good". It was that the assessment had **no effect on any control**.

**Takeaway:** a risk assessment that does not change what you do is not a control. Trace every high-risk finding to a specific, testable mitigant.
$md$ WHERE id = '94e59f95-8e88-450d-afd1-a447f2eee2e2';

UPDATE public.academy_modules SET title = 'Lesson 2 — Building a customer risk-scoring model', content = $md$
### Design principles

A defensible model is **weighted, documented, evidence-driven and testable**. It should produce the same rating for the same facts regardless of who runs it, while leaving room for justified override.

### Factor families and typical weights

| Factor family | Weight | Example scoring inputs |
|---|---|---|
| **Geographic** | 25% | Country of incorporation, residence, operations, counterparties; FATF grey/black lists, CPI, Basel AML Index, sanctions exposure |
| **Customer type** | 25% | Individual vs entity, structure complexity, PEP/RCA status, sector (MSB, casino, precious metals, defence, crypto, charity), listed vs private |
| **Product / service** | 20% | Cash handling, correspondent banking, trade finance, private banking, third-party payments, crypto rails |
| **Channel** | 15% | Face-to-face, remote onboarding with liveness, intermediary/agent, introduced business |
| **Behaviour / transaction** | 15% | Expected value and volume, cross-border share, counterparty concentration, deviation from stated purpose |

Weights must be justified **from your BWRA**. A private bank and a domestic retail lender should not have the same weights.

### Scoring mechanics

Score each factor 1–5, multiply by weight, sum to a 1–5 composite, then band:

| Composite | Rating | Consequences |
|---|---|---|
| 1.0–1.9 | Low | SDD where permitted; review every 36 months |
| 2.0–3.4 | Standard | Full CDD; review every 24–36 months |
| 3.5–4.4 | High | EDD, senior approval, review every 12 months, tightened monitoring |
| 4.5–5.0 | Unacceptable | Prohibited category — decline or exit |

### Mandatory overrides

Certain facts must set the rating regardless of the arithmetic: sanctions nexus, foreign PEP, FATF **black-list** country nexus, prohibited sector under your risk appetite, or an existing SAR. Hard-code these as floors.

### Manual overrides — up and down

Allow analysts to override, but require: a **written rationale**, **second-line approval** for any downgrade, and **MI on override volumes**. Downgrade overrides are a classic pressure point where commercial interest meets the model. If 30% of your high-risk customers are manually downgraded, your model or your governance is broken.

### Testing the model

- **Back-test** — run it over customers who were later exited or SAR'd. Did they score high *before* the event?
- **Distribution test** — a book where 96% is "low" deserves scrutiny; so does one where 40% is "high" and the EDD team cannot cope.
- **Sensitivity test** — change one factor and confirm the rating moves as intended.
- **Annual recalibration**, documented and approved.

### Case study — the model that scored everyone the same

A mid-sized bank rated 94% of its customer base "low". Investigation showed the model gave geography a 5% weight and awarded a **fixed 1** for any customer with a domestic address — regardless of where their money came from.

A customer with a domestic flat, €18m in inbound transfers from three high-risk jurisdictions, and a shipping business in a sanctioned corridor scored **1.4 — low**. Annual review only, no EDD, standard thresholds.

The bank had a documented, approved, board-signed model. It was simply **calibrated to produce a comfortable answer**.

**Takeaway:** score the **money and the activity**, not just the address — and test the distribution your model produces.
$md$ WHERE id = 'ce166e92-0753-4677-92c4-4c2a5cbe525b';

INSERT INTO public.academy_modules (course_id, title, content, sort_order) VALUES
((SELECT id FROM public.academy_courses WHERE slug='risk-based-approach'), 'Lesson 3 — Country risk: building a defensible geographic model', $md$
### Why country risk is the most-cited and worst-built factor

Almost every model has a country factor. Very few can explain how the list was built, when it was last refreshed, or why two similar countries score differently.

### Sources to combine

| Source | What it tells you | Cadence |
|---|---|---|
| **FATF public statements** — black list (call for action) and grey list (increased monitoring) | Regulatory floor; black-list nexus is a mandatory high | Plenary, ~3×/year |
| **EU high-risk third-country list** | Binding EDD obligation in the EU | Periodic |
| **National high-risk lists** (e.g. HM Treasury advisory notices) | Local supervisory expectation | Periodic |
| **Sanctions programmes** (UN, OFAC, EU, UK OFSI) | Comprehensive vs targeted regimes | Continuous |
| **Transparency International CPI** | Corruption perception | Annual |
| **Basel AML Index** | Composite ML/TF risk | Annual |
| **FATF/FSRB mutual evaluation reports** | Actual effectiveness ratings, not just technical compliance | Rolling |
| **Tax-transparency and secrecy indices** | Opacity | Periodic |
| **Conflict / TF exposure indicators** | TF and proliferation risk | Continuous |

### Building the score

1. Normalise each source to a 1–5 scale.
2. Weight them — regulatory lists heaviest, perception indices lighter.
3. Apply **mandatory floors**: FATF black list → 5; FATF grey list / EU high-risk → minimum 4; comprehensive sanctions → prohibited.
4. Publish the resulting country table with **the date and the source versions used**.
5. **Refresh on every FATF plenary** and on any sanctions event — with a named owner and an SLA (e.g. within 10 business days).

### Apply it to more than the address

Country risk should be evaluated across **five dimensions** of the relationship, taking the highest (or a weighted blend you can justify):

- Country of **nationality / incorporation**
- Country of **residence / operations**
- Country of the **source of funds**
- Countries of **material counterparties**
- Countries the **transactions actually touch** (including correspondent routing)

A customer registered in a low-risk state whose entire counterparty book sits in a grey-listed jurisdiction is not low-risk, and a model that says otherwise is measuring the wrong thing.

### Case study — the plenary nobody actioned

A firm's country table was built in February and hard-coded into the onboarding engine. At the October plenary, FATF grey-listed a country in which the firm had 1,100 customers and roughly 8% of payment volume.

The compliance team noted the change in a monthly report. Nobody owned the table. It was updated **seven months later**, during an audit — by which time 260 further customers from that country had been onboarded at standard risk with no EDD.

Remediation cost far exceeded the cost of the control: full retrospective EDD on 1,360 relationships, and a supervisory finding on **change management**, not on risk understanding.

**Takeaway:** a country model needs a **named owner, a refresh SLA and an audit trail of versions** — the analysis is the easy half.
$md$, 3),

((SELECT id FROM public.academy_courses WHERE slug='risk-based-approach'), 'Lesson 4 — Matching controls to risk: SDD, CDD and EDD', $md$
### The control ladder

The rating is worthless unless it changes something. Map each band to a **specific, mandatory control set**.

| Control | Low (SDD) | Standard (CDD) | High (EDD) |
|---|---|---|---|
| Identity verification | Standard, may be simplified in scope | Full ID&V | Full ID&V + additional documents |
| UBO identification | Required (never waived) | Full, verified | Full chain verified, all roles |
| Purpose of relationship | Recorded | Recorded and assessed | Documented, evidenced, tested against activity |
| Source of funds | Not routinely | On trigger | **Always, evidenced** |
| Source of wealth | No | On trigger | **Always, evidenced** |
| Approval | Automated | First line | **Independent senior management** |
| Monitoring | Baseline thresholds | Standard scenarios | Tightened thresholds, dedicated scenarios |
| Review cycle | 36 months | 24–36 months | **12 months** |
| Screening | At onboarding + continuous | Continuous | Continuous + adverse media + counterparty screening |

### When simplified due diligence is permitted

SDD requires a **documented finding of lower risk**, and is typically restricted to categories such as regulated financial institutions in equivalent jurisdictions, listed companies subject to disclosure requirements, and certain public authorities and low-value products.

SDD is **never** available where: there is any suspicion; the customer is a PEP or RCA; there is a high-risk-country nexus; or the product allows anonymity or unrestricted third-party funding. SDD reduces the **extent and timing** of measures — it never removes the obligation to identify the customer and the UBO, or to monitor.

### When enhanced due diligence is mandatory

Regardless of your model's arithmetic: foreign PEPs and their RCAs; customers with a nexus to an EU/national high-risk third country; correspondent banking relationships; unusually complex or unusually large transactions with no apparent economic purpose; and any relationship the firm itself rates high.

### Ongoing monitoring must be risk-tiered too

Same rating, different thresholds: a high-risk customer should trip alerts at values a standard customer would not, and should be subject to scenarios written for their specific typology. If your monitoring rules are identical across all risk bands, you have a rules-based programme wearing a risk-based label.

### Case study — SDD applied to the wrong entity

A firm applied SDD to *all* regulated financial institutions, per policy. One customer was an **e-money institution licensed in an EEA state but operating an agent network in two grey-listed countries**, with 70% of flows outbound to those markets.

The SDD categorisation was applied on the single fact of the licence. No UBO verification of the agent operator, no counterparty screening, no source-of-funds work, three-yearly review.

When the agent network turned out to be a laundering conduit, the firm's defence — "the customer was a regulated FI" — failed immediately: the **licence tells you about the entity's supervision, not about the risk of the business it actually conducts**.

**Takeaway:** SDD eligibility is a conclusion you reach after assessing the relationship, not a category you assign on one attribute.
$md$, 4),

((SELECT id FROM public.academy_courses WHERE slug='risk-based-approach'), 'Lesson 5 — Governance, MI and proving effectiveness', $md$
### Who owns what

| Line | Owns |
|---|---|
| **Board / senior management** | Approves risk appetite and the BWRA; receives MI; accountable for effectiveness |
| **MLRO / Compliance (2nd line)** | Designs the model, sets policy, challenges 1st line, owns tuning and QA |
| **Business (1st line)** | Applies the model, collects evidence, dispositions alerts |
| **Internal audit (3rd line)** | Independently tests design **and** operating effectiveness |

### Risk appetite must be explicit

A usable appetite statement names: **prohibited** customer types, sectors and jurisdictions; **restricted** categories requiring committee approval; **exposure limits** (e.g. maximum % of book in high risk); and the **escalation route** for exceptions. "We have a low appetite for financial crime risk" is not an appetite statement — every firm can say it and none can be tested against it.

### MI that proves the RBA is working

- Customer distribution by risk band, and **movement** between bands over time
- High-risk onboardings approved vs declined, and by whom
- **Manual override volumes** — upgrades and downgrades, with reasons
- EDD file completion rates and ageing
- Periodic review backlog by risk band
- Alert volumes, clearance times and **true-positive counts** by band
- SARs by risk band — *if your high-risk cohort generates no SARs, the rating is not identifying risk*
- Country-table version and date of last refresh
- Training completion and competency-assessment results

### Testing effectiveness, not just existence

Regulators moved years ago from "*do you have a policy?*" to "*does it work?*". Evidence effectiveness with:

- **Back-testing** the model against known bad outcomes
- **Sample file reviews** — typically 5% of standard onboardings, 100% of high risk
- **Below-the-line testing** of suppressed alerts and low-risk classifications
- **Independent audit** with tracked remediation
- **Scenario walk-throughs** — take a real typology and prove the programme would catch it

### Case study — good design, no operation

An audit reviewed a firm with a well-built model: sensible weights, mandatory floors, clear EDD ladder.

Testing 40 high-risk files found: 22 had no source-of-wealth evidence; 15 had approval recorded by the relationship manager; 31 had review dates in the past, average overdue 14 months. The high-risk EDD team had two vacancies unfilled for a year, and no MI on the backlog had ever reached the board.

The finding was severe precisely **because the design was good** — the firm had documented what it knew it should do, and then not done it.

**Takeaway:** capacity is a control. If MI does not show whether high-risk work is actually being completed, the board is not overseeing anything.
$md$, 5),

((SELECT id FROM public.academy_courses WHERE slug='risk-based-approach'), 'Lesson 6 — Full worked case: scoring and controlling one customer', $md$
### The customer

*Solaris Renewables SL* (Spain) — solar-project developer, applying for a €6m facility.

- **Incorporation/operations:** Spain; two project sites in a **grey-listed** North African country
- **UBOs:** *Mr A.* (55%, Spanish resident, clean screening), *Global Green Fund LP* (45%, Cayman, investors undisclosed)
- **Channel:** introduced by a corporate finance intermediary; documents received remotely
- **Expected flows:** inbound equity from Cayman; outbound EPC payments to contractors in the grey-listed country and to a Gulf equipment supplier
- **Sector:** renewables — subsidy- and permit-dependent, so **corruption-exposed** on procurement and licensing

### Step 1 — Score it

| Factor | Weight | Score | Reasoning | Weighted |
|---|---|---|---|---|
| Geographic | 25% | 4 | Operations and outbound payments in a grey-listed country; Cayman equity source | 1.00 |
| Customer type | 25% | 4 | Undisclosed LP investors behind 45%; permit-dependent sector | 1.00 |
| Product | 20% | 3 | Project finance with cross-border third-party payments | 0.60 |
| Channel | 15% | 3 | Introduced, non-face-to-face | 0.45 |
| Behaviour | 15% | 3 | High-value, low-frequency, concentrated counterparties | 0.45 |
| **Composite** | | | | **3.50 → High** |

No mandatory floor applies (no PEP, no black-list, no sanctions nexus), but the composite lands in **High** on its own.

### Step 2 — Apply the EDD ladder

- **UBO chain:** the 45% LP must be looked through. Obtain the LP register or, where confidentiality is asserted, a GP certification identifying any investor above the threshold, plus screening of the GP and its principals. **No look-through, no facility.**
- **Source of funds:** evidence the Cayman equity — capital calls, fund audited accounts, bank confirmations.
- **Source of wealth:** Mr A.'s 55% — prior project disposals, tax filings.
- **Purpose and rationale:** why a Cayman vehicle for a Spanish/North African project? Legitimate answers exist (multi-jurisdiction investor pooling); require it in writing.
- **Counterparty screening:** every EPC contractor, the Gulf supplier, and — given permit dependency — the **public officials and awarding authority** should be checked for PEP linkage to the contractors.
- **Approval:** independent senior management, before drawdown.
- **Monitoring:** scenarios for round-sum EPC payments, payments to newly added contractors, and any payment to a jurisdiction outside the project footprint. Review at 12 months.

### Step 3 — What changes the answer

- If the LP look-through reveals a **PEP investor** from the project country → mandatory floor, foreign PEP EDD, committee approval, likely decline.
- If contractor screening shows an EPC firm **owned by a relative of the permitting authority's director** → corruption typology; decline or restructure with independent payment controls.
- If the customer refuses the LP look-through → CDD cannot be completed; do not onboard; consider a SAR.

### Step 4 — The file

The scoring table with reasoning per factor; the verified UBO chart including the LP look-through evidence; SoW/SoF packs; the written structure rationale; counterparty screening results; the senior approval; and the monitoring configuration actually applied to the account.

**The lesson of the case:** the composite score was the *start* of the work. What made the file defensible was that each factor score pointed to a **named control that was then evidenced as performed**.
$md$, 6),

((SELECT id FROM public.academy_courses WHERE slug='risk-based-approach'), 'Lesson 7 — Common failures and your checklist', $md$
### The nine failures examiners keep finding

1. **BWRA disconnected from the customer model** — high inherent risks with no corresponding factor.
2. **Stale assessments** — BWRA or country table more than 12 months old, or not updated for a new product or market.
3. **Uncalibrated weights** with no documented rationale.
4. **Comfortable distributions** — an implausible share of the book rated low.
5. **Unchallenged manual downgrades** driven by commercial pressure.
6. **SDD applied by category** rather than by assessment.
7. **Identical monitoring** across all risk bands.
8. **Overdue periodic reviews** on the high-risk cohort, invisible to the board.
9. **Blanket de-risking** of sectors or nationalities instead of individual assessment.

### Your checklist

**Assess**
- BWRA covering customer, product, channel, geography and transaction risk
- Documented inherent → control → residual logic, with control effectiveness **evidenced**
- Senior-management approval and a defined update trigger list
- Country model built from named sources, with a version date and an owner

**Score**
- Weighted factor model traceable to the BWRA
- Mandatory floors for sanctions, foreign PEP, black-list nexus, prohibited sectors
- Country risk evaluated across nationality, residence, funds, counterparties and flows
- Override process with written rationale and second-line approval for downgrades

**Control**
- Explicit control ladder: SDD / CDD / EDD, with EDD triggers hard-coded
- Risk-tiered monitoring thresholds and typology-specific scenarios
- Review cycles by band, with capacity to actually complete them

**Prove**
- Back-testing against known bad outcomes
- Sample file reviews: 5% standard, 100% high risk
- Board MI on distribution, overrides, backlogs, true positives and SARs by band
- Annual recalibration and independent audit, with tracked remediation

### Three principles to carry away

1. **A risk assessment that changes nothing is not a control** — trace every finding to a testable mitigant.
2. **Risk-based means proportionate, not lenient.** SDD is a conclusion you evidence; EDD is an obligation you complete.
3. **Effectiveness is measured, not asserted.** If your high-risk cohort produces no SARs and no declines, your model is not finding risk.
$md$, 7);

UPDATE public.academy_courses SET duration_minutes = 20, cpd_hours = 0.5, estimated_words = 3200 WHERE slug = 'risk-based-approach';
