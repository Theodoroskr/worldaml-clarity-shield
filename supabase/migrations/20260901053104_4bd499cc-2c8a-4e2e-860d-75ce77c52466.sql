
-- =====================  CRYPTO AML  =====================
UPDATE public.academy_modules SET title = 'Lesson 1 — The virtual-asset regulatory landscape', content = $md$
### The definitions that drive everything

**FATF Recommendation 15** and its Interpretive Note brought virtual assets into the AML perimeter.

- A **virtual asset (VA)** is a digital representation of value that can be digitally traded or transferred and used for payment or investment. It excludes digital representations of fiat, securities and other financial assets already covered elsewhere.
- A **virtual asset service provider (VASP)** conducts, as a business, one or more of: exchange between VAs and fiat; exchange between VAs; **transfer** of VAs; safekeeping/administration of VAs or the instruments enabling control; and participation in/provision of financial services related to an issuer's offer or sale of a VA.

If you do any of those for someone else, you are a VASP — regardless of what your marketing calls you.

### The regimes you will meet

| Jurisdiction | Regime | Key features |
|---|---|---|
| **EU** | **MiCA** (market conduct/licensing) + **Transfer of Funds Regulation (TFR)** | CASP authorisation, passporting; TFR applies the Travel Rule with **no de minimis** for crypto transfers |
| **UK** | FCA cryptoasset registration under MLR 2017; UK Travel Rule since Sept 2023 | Registration is AML-only; financial-promotions rules apply separately |
| **US** | FinCEN money-transmitter rules; BSA obligations; state licensing (NYDFS BitLicense) | Travel Rule threshold US$3,000; OFAC obligations are strict-liability |
| **Singapore** | Payment Services Act — Digital Payment Token services, MAS | Travel Rule from S$1,500; strict custody rules |
| **UAE / GCC** | VARA (Dubai), SCA federal, ADGM | Rapidly evolving licensing plus AML rules |

### The Travel Rule

Originating VASPs must obtain, hold and transmit **originator** information (name, account/wallet reference, and address/ID number/DOB depending on regime) and **beneficiary** information (name, account/wallet reference) with the transfer. Receiving VASPs must obtain and hold it, and screen it.

The perennial problem is the **sunrise issue**: counterparties in jurisdictions that have not implemented the rule cannot exchange the data. Your policy must say what you do then — collect what you can, risk-assess the counterparty VASP, and decide whether to proceed, restrict or decline.

### Unhosted (self-hosted) wallets

Transfers to and from wallets not controlled by a VASP carry no counterparty institution to rely on. Regimes differ: the EU TFR requires **verification of ownership** for transfers above €1,000 to/from a customer's own unhosted wallet, and enhanced scrutiny generally. Common controls: satoshi-test / micro-deposit proof, signed message proving key control, and blockchain-analytics risk scoring of the address.

### Case study — the "we're just software" defence

A team launched a non-custodial-branded swap service that in fact pooled user funds in an operational wallet for up to 20 minutes during each swap, and set the exchange rate.

They held no registration anywhere, on the view that they were "**just software**". A supervisor found that temporary control of customer assets plus exchange between virtual assets met the VASP definition squarely. The service was ordered to cease pending registration, and the founders faced personal liability for unregistered money transmission.

**Takeaway:** VASP status is determined by **function, not by architecture or branding**. If you can move or price customers' assets, you are in scope.
$md$ WHERE id = '51267f1e-e651-40e7-ae08-5ec96daf68f3';

UPDATE public.academy_modules SET title = 'Lesson 2 — Typologies: how crypto is actually abused', content = $md$
### Obfuscation techniques

| Technique | What it does | Detection signal |
|---|---|---|
| **Mixers / tumblers** | Pool and redistribute funds to break the trail | Direct or one-hop exposure to a known mixer (Tornado Cash, historic Blender/Sinbad) — many are OFAC-designated |
| **Chain-hopping** | Convert BTC → XMR → ETH across services | Rapid multi-asset conversion with no economic purpose; use of no-KYC swap services |
| **Privacy coins** | Monero, Zcash shielded — opaque by design | Any exposure; many regulated VASPs delist entirely |
| **Peel chains** | Large balance moved in a long series of small hops, shaving amounts off | Long transaction chains with decreasing residual value |
| **Cross-chain bridges** | Move value between blockchains | Bridge exposure with no downstream economic activity |
| **Nested exchanges / instant exchangers** | A no-KYC service operating inside a compliant exchange account | One account with exchange-like flow patterns and thousands of counterparties |

### Predicate crime patterns

- **Ransomware** — payments to a designated wallet, consolidation, laundering via mixers and nested services, cash-out through under-regulated exchanges.
- **Darknet markets** — many small deposits, consolidation, structured withdrawals.
- **Investment fraud / "pig butchering"** — victim deposits from many retail accounts converging on a small set of addresses; USDT on Tron is the dominant rail.
- **Sanctions evasion** — state-linked actors using OTC brokers, non-compliant exchanges, and rapid asset conversion.
- **DPRK-linked exploit laundering** — protocol hacks followed by mixer use and cross-chain hops; extensively documented and heavily designated.
- **NFT wash trading and DeFi manipulation** — self-dealing to fabricate value or extract funds from a protocol.

### Behavioural red flags at a VASP

- New account funded immediately from a high-risk address cluster, then withdrawn within minutes
- Deposits from dozens of unrelated unhosted wallets into one retail account
- Structuring around Travel Rule thresholds (repeated transfers just under the limit)
- Use of VPN/Tor combined with mismatched declared jurisdiction
- Customer's stated occupation and income wildly inconsistent with volume
- A "personal" account exhibiting business/exchange behaviour (nesting)
- Urgency, third-party instruction, or a customer reading from a script — a classic scam-victim indicator

### Case study — a peel chain in practice

An exchange received a 42 BTC deposit. Analytics showed the funds arrived via a **17-hop peel chain** originating in a darknet-market cluster: each hop moved most of the balance forward while peeling 0.3–1.2 BTC to fresh addresses.

The customer, a two-week-old verified retail account, requested immediate conversion to USDT and withdrawal to an unhosted wallet. Declared occupation: student.

The analyst froze the withdrawal, filed a SAR with the address chain and cluster attribution attached, and responded to a law-enforcement production order three weeks later. The tracing evidence — not the customer's KYC — was what made the report actionable.

**Takeaway:** in crypto, the **provenance of the funds** is often more informative than the identity of the customer. Screen the money as rigorously as the person.
$md$ WHERE id = '152f91f6-48b5-41c0-a5ac-d16d1448c03d';

INSERT INTO public.academy_modules (course_id, title, content, sort_order) VALUES
((SELECT id FROM public.academy_courses WHERE slug='crypto-aml'), 'Lesson 3 — Blockchain analytics: how tracing actually works', $md$
### The three techniques underneath every tool

**1. Clustering (common-input-ownership heuristic).** In UTXO chains like Bitcoin, if several addresses are used as inputs to a single transaction, they are almost certainly controlled by the same entity. Chaining this across millions of transactions produces **clusters** — wallets belonging to one actor.

**2. Attribution.** Clusters are labelled by linking them to real-world entities: known exchange deposit addresses, published designations (OFAC SDN list crypto addresses), darknet-market addresses harvested during test purchases, ransomware payment addresses from incident reports, and public disclosures.

**3. Flow analysis and risk scoring.** Exposure is measured by tracing value backwards (source) and forwards (destination) and weighting by **directness** (direct vs indirect hops) and by **counterparty category**.

### Direct vs indirect exposure

- **Direct exposure** — funds came straight from, or went straight to, a flagged cluster. High confidence.
- **Indirect exposure** — separated by hops. Confidence decays with distance; a five-hop link to a darknet market may be meaningless in a heavily reused chain.

Set policy thresholds: e.g. *any direct exposure to sanctioned addresses → block and report*; *direct exposure >5% to darknet/ransomware → freeze and investigate*; *indirect exposure beyond three hops → contextual review only*. Undocumented thresholds mean inconsistent decisions.

### Account-based chains are harder

Ethereum and similar chains have no common-input heuristic. Attribution relies on contract interaction patterns, known deposit-address generation, bridge and mixer contract identification, and token-flow analysis. **Smart-contract intermediation** (DEXs, lending protocols, bridges) legitimately breaks simple chains — treat protocol interaction as a fact to interpret, not automatically as obfuscation.

### The limits you must understand

- Clustering heuristics produce **false positives** — CoinJoin transactions deliberately break the assumption.
- Attribution is **probabilistic and vendor-dependent**; two tools can disagree on the same address.
- **Privacy coins are largely untraceable** with current public techniques.
- Exposure percentages depend on the tracing method (haircut vs FIFO vs poison). Know which your vendor uses and state it in policy.

### Case study — the same address, two verdicts

A compliance team ran a customer withdrawal address through two analytics vendors. Vendor A returned **12% indirect exposure to a sanctioned mixer**; Vendor B returned **0.4%**. The tools used different tracing methodologies (poison vs proportional haircut) and different hop limits.

Rather than pick the convenient answer, the firm documented both, applied the **more conservative** result, escalated for manual review, and recorded the methodological difference in its policy — which now specifies the vendor of record, the tracing method, the hop depth and the tie-break rule.

**Takeaway:** analytics output is **evidence to be interpreted**, not a verdict. Document the methodology or your decisions cannot be compared to each other.
$md$, 3),

((SELECT id FROM public.academy_courses WHERE slug='crypto-aml'), 'Lesson 4 — Sanctions, the Travel Rule and counterparty VASP due diligence', $md$
### Crypto sanctions are strict liability

OFAC and equivalent regimes designate **wallet addresses** as identifiers, alongside names and entities. Processing a transaction with a designated address is a violation regardless of intent or knowledge in most regimes. Designations have covered exchanges (Suex, Chatex, Garantex), mixers (Blender, Tornado Cash, Sinbad) and hundreds of individual addresses linked to ransomware and DPRK activity.

**Minimum controls:**
- Screen **every** deposit and withdrawal address against designated-address lists before execution
- Re-screen historic counterparty addresses when new designations are published — a wallet you paid last month can be designated today
- Screen names via Travel Rule data as well as addresses
- Block and report, do not simply reject and let the customer retry elsewhere

### Travel Rule operations

Implementing the rule requires a data channel to your counterparty. Practical steps:

1. **Determine whether the counterparty is a VASP** (address attribution) or an unhosted wallet.
2. **Identify the protocol** you and they support (TRP, OpenVASP, Shyft, IVMS101 message formats via a network).
3. **Validate the data received** — a beneficiary name that does not match the account holder is an alert, not a formality.
4. **Handle failures** — no response, partial data, or unsupported counterparty. Policy must define the outcome: proceed with enhanced scrutiny, restrict, or decline.
5. **Retain** the messages for the statutory period.

### Counterparty VASP due diligence

Before exchanging Travel Rule data or accepting flows, assess the counterparty institution:

| Check | What good looks like |
|---|---|
| Licensing | Named regulator, verified registration number and status |
| Ownership | UBOs identified and screened |
| AML programme | Named compliance officer, independent audit, policy summary |
| KYC standard | Verified identity at onboarding; no anonymous accounts |
| Jurisdiction | Not a high-risk or non-implementing jurisdiction |
| Analytics posture | Confirms it screens deposits/withdrawals |
| Sanctions history | No designations, enforcement actions, or exchange-hack history |

Treat **nested VASPs** — services operating inside another exchange's account — as the highest-risk category. They import an unknown customer base into your book.

### Case study — designated after the fact

An exchange processed 340 withdrawals to an OTC broker's cluster over five months. All screened clean at the time. The broker was then designated for laundering ransomware proceeds.

Firms that only screened at the moment of transaction discovered nothing. This firm ran a **retrospective re-screen against every new designation**, identified the 340 transactions and 61 affected customers within 48 hours, filed a voluntary self-disclosure, froze the related accounts and reported.

The regulator's response acknowledged the self-disclosure and the detective control as mitigating factors.

**Takeaway:** point-in-time address screening is necessary and insufficient. **Retrospective re-screening on every list update** is what turns a violation into a mitigated one.
$md$, 4),

((SELECT id FROM public.academy_courses WHERE slug='crypto-aml'), 'Lesson 5 — Building the crypto AML programme', $md$
### Onboarding

- **Identity verification** with liveness/biometric checks — remote onboarding is the norm and document-only checks are weak against synthetic identity.
- **Device and behavioural signals** — device fingerprint, IP/geolocation vs declared jurisdiction, VPN/Tor detection, account-creation velocity.
- **Purpose and expected activity** — declared volumes, source of funds, trading intent. Capture it; you will need it as the monitoring baseline.
- **Source of funds** at thresholds appropriate to risk, including for crypto-funded deposits (which wallet, whose, and how were the assets acquired).
- **Wallet ownership proof** for unhosted-wallet linkage above your threshold (signed message or micro-transfer).

### Risk scoring specific to crypto

Standard factors plus: asset mix (privacy coins, high-risk tokens), counterparty type distribution (VASP vs unhosted vs DeFi), analytics exposure score, jurisdiction of IP vs declared residence, funding rail (card, bank, crypto), and account tenure.

### Transaction monitoring scenarios worth building

1. Deposit from high-risk cluster followed by withdrawal within *n* minutes ("pass-through")
2. Structuring below Travel Rule thresholds
3. Sudden volume deviation from declared expectations
4. Many-to-one deposit concentration (fraud victim pattern)
5. One-to-many withdrawals to unhosted wallets (nesting/distribution)
6. Chain-hopping: multi-asset conversion with immediate withdrawal
7. Dormant account reactivation with large flow
8. Mixer or bridge exposure above policy threshold
9. Counterparty overlap across supposedly unrelated accounts (shared address usage)

### Fiat-crypto boundaries

The on-ramp and off-ramp are where crypto risk becomes bank risk. Reconcile the fiat leg to the on-chain leg; a mismatch between the fiat payer and the account holder is a third-party-funding red flag.

### Reporting

SAR narratives should include: **transaction hashes**, **addresses and cluster attributions**, the **analytics vendor and score**, the fiat equivalent at the time, the customer's declared purpose, and the specific typology observed. FIUs increasingly ask for hashes — a narrative without them is much less useful.

### Case study — the monitoring gap between two teams

A hybrid exchange ran fiat monitoring in its payments system and on-chain monitoring in its analytics tool. Neither team saw the other's alerts.

A customer deposited €480,000 by bank transfer over six weeks (fiat alerts: three, all cleared as "consistent with declared trading"), bought USDT, and withdrew to unhosted wallets that analytics scored as **high-risk pig-butchering infrastructure** (on-chain alerts: five, all cleared as "customer's own wallet").

Each side's explanation only made sense because it lacked the other half. A single case view would have shown a customer funding scam wallets. The firm rebuilt monitoring on a **unified customer case view** covering both legs.

**Takeaway:** crypto AML fails at the seam between fiat and on-chain. One customer, one case, both legs.
$md$, 5),

((SELECT id FROM public.academy_courses WHERE slug='crypto-aml'), 'Lesson 6 — Full worked case: tracing a suspicious deposit', $md$
### The alert

Customer *R.K.*, verified retail account, 4 months old, declared occupation "IT contractor", declared expected monthly volume €5,000.

**Trigger:** inbound deposit of **310,000 USDT (Tron)**, 62× declared expectation, followed 11 minutes later by an instruction to withdraw 305,000 USDT to a new unhosted address.

### Step 1 — Freeze and preserve

Withdrawal held under policy (pass-through scenario + volume deviation). Balance frozen. Screenshots, hashes and analytics reports preserved with timestamps.

### Step 2 — Trace the source

Analytics on the depositing address returned:

| Finding | Detail |
|---|---|
| Deposit source | A consolidation address receiving from **147 distinct addresses** over 9 days |
| Amounts | Individual inbounds of USDT 1,500–22,000; retail-scale |
| Upstream | 38% of inbounds traced directly to **two major exchanges' withdrawal clusters** |
| Attribution | Consolidation cluster tagged by the vendor as **"suspected investment-fraud infrastructure"**, medium confidence |
| Sanctions | No designated-address exposure |

This is the canonical **pig-butchering** shape: many retail victims → consolidation → single large movement → rapid off-ramp.

### Step 3 — Trace the destination

The proposed withdrawal address had no history (fresh). Its only prior sibling addresses in the vendor's cluster showed onward flow to a **no-KYC instant exchanger**, consistent with laundering rather than custody.

### Step 4 — Interview the customer

R.K. said the funds were "profit from a trading group" and provided a screenshot of a trading dashboard from a domain registered six weeks earlier. He could not explain why 147 individuals had sent him money, became agitated, and pressed repeatedly for the withdrawal to be released "today".

Two readings are possible: R.K. is a **money mule / launderer**, or R.K. is himself a **victim** being used to move funds. Both require the same immediate action; the SAR narrative should present both.

### Step 5 — Decision and reporting

- Withdrawal **declined**; funds retained pending the FIU response, in line with local law on transaction suspension.
- **SAR filed** including: all transaction hashes, the depositing and proposed destination addresses, cluster attribution and vendor confidence level, the 147-address inbound schedule, the customer's explanation and the domain registration date.
- Account **restricted**; exit decision deferred to the FIU timeline.
- **Tipping-off** controls applied — the customer was told only that the withdrawal was under review, with no reference to the report.
- **Network check** run: two other accounts had received funds from the same consolidation cluster. Both reviewed; one further SAR filed.

### Step 6 — What made this file strong

Speed of freeze; preservation of on-chain evidence with hashes; documented vendor confidence rather than assertion; explicit acknowledgement of the mule-vs-victim ambiguity; and the **network sweep** that turned one case into a typology check across the book.

**The lesson of the case:** the customer's KYC was perfect. Every decision-grade fact came from **tracing the money**.
$md$, 6),

((SELECT id FROM public.academy_courses WHERE slug='crypto-aml'), 'Lesson 7 — Governance, examination readiness and your checklist', $md$
### Governance essentials

- **Named, accountable compliance officer** with crypto-specific competence — supervisors probe this directly.
- **Board-approved risk appetite** naming prohibited assets (privacy coins?), prohibited counterparty categories (mixers, no-KYC exchanges, nested services) and jurisdiction limits.
- **Documented analytics policy**: vendor of record, tracing methodology, hop depth, exposure thresholds by action (monitor / review / freeze / block), and the tie-break rule where tools disagree.
- **Model governance** for scoring and monitoring: validation, tuning with below-the-line testing, and version control.
- **Incident and designation-response playbook** — what happens within 24 hours of a new sanctions designation.
- **Training** on typologies, refreshed at least annually; this space changes faster than any other AML domain.

### What examiners ask crypto firms

1. Show me your **VASP-status analysis** for each service you operate.
2. Show me a **Travel Rule transfer end to end** — outbound and inbound, including a failed counterparty case.
3. Show me your **unhosted-wallet controls** and an example of ownership proof.
4. Show me the **thresholds** at which analytics exposure triggers each action, and who approved them.
5. Show me a **retrospective re-screen** following a designation.
6. Show me **one SAR** and the on-chain evidence attached to it.

If any of these require a project to answer, you are not examination-ready.

### Your checklist

**Perimeter**
- VASP status assessed and documented per service and jurisdiction
- Licences/registrations current; passporting and cross-border exposure mapped

**Customer**
- Liveness-based identity verification; device, IP and VPN signals captured
- Declared purpose and expected volume recorded as a monitoring baseline
- Crypto-specific risk factors in the scoring model
- Wallet-ownership proof for unhosted linkage above threshold

**Transaction**
- Every deposit and withdrawal address screened pre-execution against designated addresses
- Retrospective re-screening on every list update, with an SLA
- Travel Rule data sent, validated on receipt, and retained; documented sunrise policy
- Counterparty VASP due diligence, with nested services treated as highest risk
- Unified case view across fiat and on-chain legs
- Crypto-specific monitoring scenarios, tuned and tested

**Assurance**
- Analytics policy with methodology and thresholds documented
- SARs including hashes, addresses and attribution confidence
- Network sweeps on confirmed typologies
- Annual independent testing and typology-refreshed training

### Three principles to carry away

1. **Function determines status** — architecture and branding do not decide whether you are a VASP.
2. **Trace the money, not just the person.** Clean KYC and dirty provenance is the standard crypto case.
3. **Screening is continuous, not point-in-time** — retrospective re-screening after designations is the control that saves firms.
$md$, 7);

UPDATE public.academy_courses SET duration_minutes = 20, cpd_hours = 0.5, estimated_words = 3200 WHERE slug = 'crypto-aml';


-- =====================  SANCTIONS SCREENING ESSENTIALS  =====================
UPDATE public.academy_modules SET title = 'Lesson 1 — What sanctions are, who imposes them, and who must comply', content = $md$
### The instrument

**Sanctions** are restrictive measures imposed by states and international bodies to achieve foreign-policy and national-security objectives — countering terrorism and proliferation, responding to aggression, and pressuring regimes over human-rights abuses.

Unlike most AML rules, sanctions are **absolute**. There is no risk-based tolerance: a prohibited transaction is prohibited at any value, and in the US and several other regimes liability is **strict** — intent and knowledge are irrelevant to whether a breach occurred.

### The main regimes

| Authority | Scope | Notes |
|---|---|---|
| **UN Security Council** | Global; members implement domestically | The common floor; consolidated list |
| **US OFAC** | US persons, US dollars, US-origin goods, and — under **secondary sanctions** — non-US persons dealing with certain targets | Broadest extraterritorial reach; SDN List + Sectoral lists |
| **EU** | EU persons and entities, conduct in EU territory, EU-flagged vessels/aircraft | Consolidated list; national competent authorities enforce |
| **UK OFSI / FCDO** | UK persons worldwide, and anyone in the UK | UK Sanctions List; OFSI enforces financial sanctions |
| **Others** | Switzerland (SECO), Canada, Australia, Japan, Singapore, UAE | Increasingly aligned but not identical |

### Types of measure

- **Targeted asset freezes** on designated persons and entities (the core financial-sanctions obligation)
- **Comprehensive territorial embargoes** (e.g. historically Iran, North Korea, Cuba, Syria, Crimea/DNR/LNR)
- **Sectoral sanctions** — restrictions on defined activities (debt/equity financing, energy technology) with named entities
- **Trade and export controls** — dual-use goods, military items, luxury goods
- **Price caps** and services bans (e.g. Russian oil-related shipping and insurance services)
- **Travel bans** and diplomatic measures

### The two obligations most firms understate

**1. Ownership and control ("the 50% rule").** An entity **not itself listed** is nonetheless subject to an asset freeze if it is owned 50% or more (aggregated across designated persons under OFAC, EU and UK guidance) or is **controlled** by a designated person. Screening names against a list will never catch these — you need ownership data.

**2. Facilitation and circumvention.** Assisting, enabling or structuring around sanctions is itself an offence in most regimes, as is providing funds or economic resources **indirectly** to a designated person.

### Case study — the 50% rule missed

A bank screened a corporate customer, *Novaline Trading*, daily against every major list. No hits, ever — the entity was never designated.

Its shareholders were two companies, each 30% owned by a designated oligarch (aggregate 60% through the chain). Under EU and UK ownership rules, Novaline's funds were **frozen assets** from the day of designation. The bank continued to operate the account for four months.

The failure was not screening. It was that the bank screened **names against lists** and never screened its **UBO records** against designations, or recomputed aggregated ownership when a designation was announced.

**Takeaway:** sanctions compliance requires **ownership analysis**, not just name matching. Re-run ownership aggregation on every designation event.
$md$ WHERE id = '9290e70d-2952-4a6d-9be1-450a614cdde0';

UPDATE public.academy_modules SET title = 'Lesson 2 — Screening mechanics: lists, matching and thresholds', content = $md$
### What you screen, and when

| Population | Timing |
|---|---|
| Customers and prospects | At onboarding, then **continuously** on every list update |
| UBOs, directors, authorised signatories | Same as customers |
| Payment parties (payer, payee, intermediaries, reference-field names) | **Real time, pre-execution** |
| Counterparties, suppliers, employees | Periodic, risk-based |
| Vessels, aircraft, goods, ports | Where trade or shipping exposure exists |

Payment screening is the hard case: it must be **real-time**, work on unstructured free-text fields, and handle incomplete data.

### List management

- Consume **official sources** or a vendor with a documented refresh SLA — measure your **list-latency** (time from official publication to live in production). Regulators ask. Anything beyond 24 hours needs justification.
- Screen against **all lists applicable to you** — determined by your currencies, entities, customers and correspondent relationships, not by convenience. USD clearing pulls OFAC into scope.
- Maintain **good-guy / whitelist** entries with expiry dates and periodic revalidation; a stale whitelist is a permanent hole.
- Keep an **audit trail of list versions** so you can prove what you screened against on any past date.

### Matching mechanics

Fuzzy matching handles transliteration, typos, name order and missing data. Key controls:

- **Threshold calibration by risk and by population.** Payment screening usually runs looser than customer screening because data quality is worse.
- **Secondary identifiers** — DOB, nationality, place of birth, passport number, address, entity registration number. These are how you *discount* safely.
- **Normalisation** — diacritics, particles (al-, bin, van der), name order, corporate suffixes (Ltd/GmbH/OOO).
- **Coverage of non-name identifiers** — vessels by IMO number, aircraft by tail number, addresses, and **crypto wallet addresses** where designated.

### Handling a hit

1. **Stop the transaction / hold the onboarding.** Never let it complete pending review.
2. **Escalate within defined SLAs** (payment hits typically require same-day resolution).
3. **Assess** against secondary identifiers; document the discriminating fact.
4. **True match** → freeze the funds or reject as required, **report to the competent authority** within the statutory deadline (e.g. OFSI, OFAC), and do **not** tip off.
5. **False positive** → discount with a recorded reason, and consider a whitelist entry with expiry.

Rejecting a payment and letting the customer retry through another route is, in several regimes, itself a breach — freezing may be mandatory.

### Case study — the free-text field

A bank's payment filter screened structured beneficiary fields only. A payment instruction carried the designated party's name in the **remittance-information free-text field** ("*ref: settlement for [designated entity] contract 2024/17*"), with an undesignated intermediary as the named beneficiary.

The filter passed it. Eleven similar payments followed. The breach was found by the correspondent bank, whose filter screened all fields.

**Takeaway:** screen **every field**, including free text and reference lines. Sanctions evaders know exactly which fields are checked.
$md$ WHERE id = '1e587717-2a1e-4eb1-9066-26d2a524686c';

INSERT INTO public.academy_modules (course_id, title, content, sort_order) VALUES
((SELECT id FROM public.academy_courses WHERE slug='sanctions-screening-essentials'), 'Lesson 3 — False positives, tuning and testing', $md$
### Why the noise is unavoidable

Sanctions lists contain thousands of common names, extensive alias sets, and sparse identifiers. Combine that with payment data written by humans in a hurry and you get **false-positive rates above 95%** in typical payment filters. The goal is not zero noise; it is **noise you have deliberately chosen and can defend**.

### Legitimate reduction techniques

| Technique | Use with care |
|---|---|
| **Good-guy lists** | Only for entities positively verified as not the designated party; expiry dates mandatory |
| **Secondary-identifier suppression** | Suppress where DOB/nationality demonstrably conflict — only where the data is reliable |
| **List scoping** | Screen only lists applicable to the entity/currency — must be documented and reviewed |
| **Deduplication** | Repeat customer-to-customer payments in a static relationship |
| **Data-quality improvement** | The highest-yield fix: better structured data at the source beats any tuning |

### What is not legitimate

- Raising the threshold simply to reduce volume, with no testing
- Removing lists that are inconvenient but applicable
- Blanket whitelisting by name string rather than by verified entity
- Auto-closing aged alerts

### Testing your filter

Regulators expect **evidence** that the filter works:

- **Above-the-line testing** — synthetic true positives injected to confirm they are caught, including transliteration and name-order variants.
- **Below-the-line testing** — sample what falls below the threshold to confirm nothing real is being missed. This is the test that catches over-tuning.
- **List-coverage testing** — confirm every applicable list is loaded and current.
- **Field-coverage testing** — confirm every field, including free text, is screened.
- **Latency testing** — measure publication-to-production time for a real designation.
- **Regression testing** after any rule, threshold or vendor change.

Document scope, sample sizes, results, defects and remediation, with second-line sign-off. Testing that is not documented did not happen.

### Case study — tuned into a breach

To cut a 60,000-alert monthly queue, a bank raised its payment-filter threshold from 80% to 92% and disabled screening of two reference fields. Alerts fell to 9,000. No testing accompanied the change and no second-line approval was recorded.

A below-the-line test eighteen months later found **four true matches** in the suppressed band, including two payments to an entity majority-owned by a designated person, and a name-order variant ("Kim Jong Chol" vs "Chol Kim Jong") that the higher threshold no longer caught.

Enforcement focused on the **absence of testing and governance around the change** rather than the threshold value itself.

**Takeaway:** every tuning change needs a documented rationale, below-the-line testing and independent approval. The number itself is rarely the finding.
$md$, 3),

((SELECT id FROM public.academy_courses WHERE slug='sanctions-screening-essentials'), 'Lesson 4 — Ownership, control and evasion typologies', $md$
### Aggregation rules in practice

- **OFAC 50% rule** — an entity owned 50% or more, **in aggregate, directly or indirectly**, by one or more blocked persons is itself blocked, whether or not it appears on the SDN List. OFAC also urges caution below 50% where control exists.
- **EU / UK** — an asset freeze extends to entities **owned (>50%) or controlled** by a designated person. **Control** is assessed on factors including the right to appoint or remove a majority of the board, dominant influence under a contract or articles, and the ability to direct the entity's affairs.

Control can exist at **0% ownership**. This is where evasion concentrates.

### Evasion typologies

1. **Ownership dilution** — restructure to 49.9%, or split across relatives and associates each below the threshold.
2. **Nominee and proxy ownership** — transfer to a spouse, adult child, long-standing business associate, or an employee acting on instruction, often days before or after designation.
3. **Trust and foundation wrappers** — assets settled into structures where the designated person is protector or holds a power of appointment.
4. **New intermediary entities** — freshly incorporated trading companies inserted into a supply chain to break the visible link.
5. **Transshipment** — goods routed through non-implementing jurisdictions; the paperwork shows a benign destination.
6. **Vessel tactics** — AIS switch-off ("dark activity"), ship-to-ship transfers, flag-hopping, falsified bills of lading.
7. **Price-cap circumvention** — attestation fraud on shipping and insurance services.
8. **Payment layering** — routing through non-sanctioning jurisdictions, changing currency to avoid clearing exposure, using crypto rails.

### Red flags

- Ownership change shortly before or after a designation, especially to a relative
- A newly incorporated counterparty with no trading history, sharing an address or director with a known designated network
- Sudden change of counterparty jurisdiction with unchanged goods, ports and volumes
- Payment routing that makes no commercial sense
- Refusal to identify UBOs, or ownership that stops at exactly 49%
- End-user certificates that do not match the shipment's plausible use
- Requests to remove references from payment fields

### Case study — 49% and a shareholders' agreement

Following the designation of a metals magnate, a European bank re-ran ownership across its book. One customer, *Verstahl GmbH*, showed the designated person at **49%** — below the freeze threshold on ownership alone.

The bank obtained the shareholders' agreement. It gave the 49% holder the right to appoint three of five supervisory board members and a veto over disposals — **dominant influence**. On the control limb, Verstahl was subject to the asset freeze.

Reported to the national competent authority; account frozen; licence application made for permitted wind-down payments.

**Takeaway:** stopping at the percentage is the mistake. **Control is a separate, document-based test** — and it is the one evaders design for.
$md$, 4),

((SELECT id FROM public.academy_courses WHERE slug='sanctions-screening-essentials'), 'Lesson 5 — Governance, reporting and breach handling', $md$
### Programme components regulators expect

1. **Sanctions risk assessment** — exposure by customer, product, geography, currency and channel; refreshed on material change and at least annually.
2. **Board-approved policy** — scope, lists screened, thresholds, escalation, freezing procedure, licensing, reporting, training.
3. **Clear ownership** — a named accountable executive; sanctions frequently sits with the MLRO but is a distinct discipline.
4. **Systems** — customer and payment screening, list management with version control, ownership data.
5. **Escalation with SLAs** — payment hits resolved same-day; freezes actioned immediately.
6. **Independent testing** — above/below-the-line, coverage, latency, regression.
7. **Training** — role-specific; payments and trade-finance staff need more than an annual e-learning.
8. **Record-keeping** — hits, dispositions, freezes, reports, licences, list versions.

### If you have a true match

1. **Freeze** the funds or economic resources — do not return them to the sender without authority approval.
2. **Report** to the competent authority within the statutory deadline (OFSI: without delay, and there are prescribed reporting forms; OFAC: blocked-property reports within 10 business days and an annual report).
3. **Do not tip off** the customer beyond what the law permits.
4. Consider whether a **SAR** is also required — sanctions reporting and AML reporting are separate obligations.
5. Apply for a **licence** if any payment (wind-down, legal fees, basic needs) is to be made.

### If you discover a breach

- **Stop** the activity immediately and preserve records.
- **Scope it** — how many transactions, what value, over what period, which counterparties.
- **Root-cause it** — list latency, field coverage, threshold, ownership data, human error.
- **Voluntary self-disclosure** — in most regimes a genuine, prompt, complete VSD is a substantial mitigating factor and can materially reduce penalties.
- **Remediate and evidence** — fix the control, test the fix, retrospectively re-screen the affected period.

### MI for the board

List latency; alert volumes and ageing by queue; **true-positive counts**; freezes in force and their value; licence applications and status; testing results and open defects; training completion; and the date of the last risk-assessment refresh.

### Case study — the disclosure that halved the penalty

A payments firm discovered, during an internal review, that a list-feed failure had left one sanctions list stale for **nine days**, during which 14 payments totalling €1.2m were processed to a party designated during that window.

The firm froze what remained, self-disclosed within five business days with a full transaction schedule and root-cause analysis, implemented feed-failure alerting with a four-hour SLA, and commissioned independent testing.

The authority's decision expressly cited the prompt, complete voluntary disclosure and the remediation in reducing the penalty, and imposed no business restriction.

**Takeaway:** breaches are survivable; **concealment and slow disclosure are not**. Monitor the plumbing — a silent feed failure is a live sanctions exposure.
$md$, 5),

((SELECT id FROM public.academy_courses WHERE slug='sanctions-screening-essentials'), 'Lesson 6 — Full worked case: from alert to freeze', $md$
### The alert

**08:14** — an outbound USD payment of **US$740,000** from customer *Baltic Marine Supplies OÜ* to *Orion Ship Services FZE* (UAE) hits the payment filter. Match score 87% on the beneficiary name against a designated entity, *Orion Shipping Services LLC* (different suffix, different emirate).

### Step 1 — Hold and triage (08:14–09:30)

Payment held, not rejected. Analyst compares identifiers:

| Field | Payment | Designated entity |
|---|---|---|
| Name | Orion Ship Services FZE | Orion Shipping Services LLC |
| Address | Free zone, Emirate A | Emirate B |
| Registration | Provided: 6 digits | Listed: different number |
| Bank | UAE bank, account in Emirate A | Listed account, different bank |

On the face of it: **different entity**. A weak analyst discounts here at 09:30 and releases.

### Step 2 — Look beyond the name (09:30–12:00)

Policy requires ownership and context checks on any beneficiary in a high-risk corridor. The analyst pulls registry data on Orion Ship Services FZE:

- Incorporated **six weeks ago**
- Sole shareholder: a Marshall Islands company
- Sole director: an individual who is **also director of the designated entity** (registry cross-reference)
- Registered address: a serviced office shared with two entities that appear in the designated party's network

Trade documents attached to the payment describe **bunkering services for a vessel** whose IMO number appears on the designating authority's vessel annex.

### Step 3 — Assess (12:00–14:00)

The beneficiary is not itself designated. But: shared director with the designated entity, incorporation immediately post-designation, network address overlap, and services provided to a **designated vessel**.

Two grounds arise: **control** by the designated person/entity, and **facilitation** — the payment provides an economic resource to a designated vessel's operation. Either is sufficient to prohibit the payment.

### Step 4 — Act (14:00–17:00)

- Payment **not released**; funds **frozen** as suspected economic resources of a designated party, pending authority guidance.
- Customer *Baltic Marine Supplies* reviewed: three earlier payments to the same beneficiary, pre-designation of the vessel, totalling US$1.9m — documented and included in the report.
- **Report filed** with the competent authority the same day, with the registry evidence, the IMO cross-reference and the payment schedule.
- **SAR** filed separately on possible sanctions-evasion facilitation by the customer.
- Customer told only that the payment is subject to a compliance review — **no tipping off**.
- Relationship restricted pending outcome; exit assessment diarised.

### Step 5 — Network sweep

Screening the shared director's name across the book returned **two further customers** paying newly incorporated UAE and Turkish entities with the same registered agent. Both escalated.

### What made this file strong

The alert would have been legitimately discounted on name comparison alone. What produced the right outcome was a **mandatory context check** — registry, directorship, vessel IMO — before any discount in a high-risk corridor, and a network sweep afterwards.

**The lesson of the case:** sanctions evasion is designed to survive name matching. Your procedure must require **more than the name** before a hit is closed.
$md$, 6),

((SELECT id FROM public.academy_courses WHERE slug='sanctions-screening-essentials'), 'Lesson 7 — Common failures and your checklist', $md$
### The nine failures that produce enforcement

1. **List latency** — feeds delayed or silently broken, with no alerting.
2. **Incomplete field coverage** — free-text and reference fields unscreened.
3. **Ownership blindness** — no aggregation, no control test, no re-run on designation events.
4. **Untested tuning** — thresholds raised or lists scoped out without below-the-line testing or approval.
5. **Stale whitelists** — good-guy entries with no expiry or revalidation.
6. **Rejecting instead of freezing** — returning funds that should have been blocked.
7. **Missed reporting deadlines** to the competent authority.
8. **No vessel, aircraft or crypto-address screening** despite relevant exposure.
9. **Slow or partial disclosure** after a discovered breach.

### Your checklist

**Coverage**
- All applicable lists identified from your currencies, entities, customers and correspondents
- Measured list latency with alerting on feed failure
- Every field screened, including free text and reference lines
- Non-name identifiers screened: IMO, tail numbers, addresses, registration numbers, crypto addresses
- UBOs, directors and signatories screened alongside the customer

**Ownership and control**
- Aggregated ownership computed across chains, not read off a single register
- Control test applied from constitutional documents and shareholder agreements
- Ownership re-run across the whole book on **every designation event**

**Alert handling**
- Hold, never release, pending resolution; defined same-day SLA for payments
- Mandatory context checks (registry, directorships, vessel, network) before discounting in high-risk corridors
- Discount reasons record the discriminating identifier
- Freeze, report within deadline, do not tip off; consider a parallel SAR

**Assurance**
- Above- and below-the-line testing, documented with sign-off
- Whitelist expiry and revalidation
- Regression testing after every change
- Role-specific training for payments and trade-finance staff
- Board MI: latency, ageing, true positives, freezes, licences, defects

### Three principles to carry away

1. **Sanctions are absolute.** There is no materiality threshold and, in several regimes, no intent requirement.
2. **Names are the easy half.** Ownership, control and context are where breaches actually happen.
3. **Test the filter, not just the policy** — and disclose fast when something slips through.
$md$, 7);

UPDATE public.academy_courses SET duration_minutes = 20, cpd_hours = 0.5, estimated_words = 3200 WHERE slug = 'sanctions-screening-essentials';
