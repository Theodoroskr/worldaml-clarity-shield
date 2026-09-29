# Three New Academy Courses

Add three paid CPD-accredited specialisations to the Academy, chosen from search-demand research:

| Slug | Title | Category | Difficulty | Price |
|---|---|---|---|---|
| `tbml-export-controls` | Trade-Based Money Laundering & Export Controls | global-specialisation | advanced | €49 |
| `aml-fintechs-payments` | AML for Fintechs & Payment Providers | sector | intermediate | €29 |
| `source-of-funds-wealth` | Source of Funds & Source of Wealth | global-specialisation | intermediate | €29 |

Each follows the existing course pattern: ~7 lessons of 2,500–3,000 characters (expert-written, with a full worked case study and a closing regulator-expectations checklist, 15–20 min study), a lesson diagram, a cover image, 10 quiz questions with explanations, and SEO metadata.

## Course outlines

**TBML & Export Controls** (targets "trade based money laundering" ~210/mo, "trade compliance" ~1,000/mo, low difficulty):
1. What TBML is: over/under-invoicing, multiple invoicing, phantom shipments, FOB/CIF tricks
2. Red flags in trade documents and payment flows
3. Shell and front companies in trade chains
4. Export controls, dual-use goods and sanctions evasion (shadow fleet, price cap circumvention)
5. Detection & screening: cargo data, counterparties, dual-use lists
6. Worked case: letter-of-credit fraud through a trading network
7. Regulator expectations (FATF TBML guidance, FinCEN, EU) and checklist

**AML for Fintechs & Payment Providers**:
1. The fintech AML landscape: PSPs, EMIs, e-wallets, BaaS — who regulates whom
2. Building the compliance programme at scale (risk appetite, onboarding funnels)
3. Transaction monitoring for instant payments: thresholds, velocity, mule patterns
4. Sponsors, agent networks and third-party reliance
5. Crypto-on/off ramps and embedded finance risks
6. Worked case: money-mule network through a payment app
7. Regulator expectations (EBA guidelines, FCA, FinCEN innovation) and checklist

**Source of Funds & Source of Wealth**:
1. SOF vs SOW: definitions, why both matter, when each is required
2. Evidence standards: acceptable documents by source type (salary, business sale, inheritance, investments, crypto)
3. Verifying wealth claims: corroboration, plausibility, red flags
4. High-risk sources: PEP-linked wealth, third-party funding, high-risk jurisdictions
5. Deciding and recording: escalation, approvals, ongoing review
6. Worked case: real-estate purchase with a cross-border inheritance claim
7. Regulator expectations (FATF R.10/12, EBA, JMLSG) and checklist

## Build steps

1. **Content** — write all lesson content, learning outcomes, and 10 questions per course directly in the migration SQL (lesson length matched to existing courses).
2. **Database migration** — insert `academy_courses` rows (published, `role_track: all`, sort_order after existing specialisations), `academy_modules`, and `academy_questions`.
3. **Stripe** — create 3 products with EUR prices (€49 / €29 / €29) and add them with their product IDs to `ACADEMY_PRICING` in `src/data/academyPricing.ts` (required — checkout and paywall read from this map).
4. **Visuals** — generate 3 cover images and 3 lesson diagrams in the existing style; register them in `src/assets/academy/index.ts` (`COURSE_COVERS` / `COURSE_DIAGRAMS`).
5. **SEO** — add the 3 routes to `plugins/seo-prerender.ts` with keyword-targeted titles/descriptions/h1s (e.g. "Trade-Based Money Laundering (TBML) Training Course — CPD Accredited"); sitemap picks up new course slugs automatically; Academy listing, category filters and certificate flow are already data-driven, no page changes needed.
6. **Verify** — typecheck, prerender-plugin parse, sitemap regeneration, and a Playwright check that each new course page renders with lessons, quiz gating and pricing.

Live after your next publish.
