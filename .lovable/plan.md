# Remove the LexisNexis data lane

Delete the reseller lane (LexisNexis Risk Solutions, WorldCompliance®, Bridger Insight XG®) from the site entirely. WorldAML AML Screening becomes the only screening offer. Old URLs redirect to the closest surviving page so indexed traffic is kept.

## 1. Pages and routes removed

Delete these pages and their routes:

- `/data-sources`, `/data-sources/resources`
- `/data-sources/worldcompliance` (+ `/demo`, `/pricing`, `/eu-me`, `/uk-ie`, `/na`)
- `/data-sources/bridger-xg` (+ `/eu-me`, `/uk-ie`, `/na`)
- `/data-coverage`, `/data-coverage/:country`
- `/resources/comparison/world-check-vs-worldcompliance-vs-dow-jones`

## 2. Redirects (301-style client redirects)

```text
/data-sources*            -> /platform/aml-screening
/data-sources/worldcompliance/pricing -> /pricing
/data-coverage*           -> /platform/aml-screening
/resources/comparison/... -> /alternatives
```

## 3. Navigation, home and marketing copy

- Remove LexisNexis / Data Sources entries from `Header`, `Footer`, home hero, `DataSourceCTA`, related-guides links, AML screening sections, industry pages, About, Why WorldAML, Pricing, market/region pages, sanctions and best-practice content.
- Rewrite any "authorised partner / trademark of LexisNexis Risk Solutions" attributions out of the copy, and remove the LexisNexis logo usage.
- Rewrite competitor/alternatives pages (ComplyAdvantage, Dow Jones, Napier, Sanction Scanner, World-Check) so comparisons are against WorldAML Screening only.
- Update `chatbotKnowledge`, `blogPosts`, `bestPractices`, `amlRegulations`, `marketPages` entries that reference the lane.

## 4. Commerce and catalogue

- Remove the `lexisnexis` product (and its WorldCompliance / Bridger sub-SKUs) from `businessCatalogue`, including the `pairsWith` reference and the `checkoutDialog: "worldcompliance"` path.
- Delete `WorldComplianceBuyDialog`, `WorldCompliancePricingCalculator`, `FreeTrialForm`/`WorldComplianceDemoForm` LexisNexis variants.
- Remove the LexisNexis entries from `upsellCatalog` and `upsellRecommendation`; upsells point to WorldAML Screening instead.
- Retire the `create-worldcompliance-checkout` edge function and remove references from `submit-form` and `send-business-welcome`.

## 5. Screening service

- Drop the `WorldComplianceProvider` from `src/services/screeningProvider.ts` and the `worldcompliance` provider option; keep the WorldAML/mock providers.
- Remove `'data-source': 'Data Source: LexisNexis'` from `src/types/regions.ts` and any region gating that existed only for the LexisNexis lane.

## 6. SEO and static files

- Remove the deleted URLs from `public/sitemap.xml`, `public/llms.txt`, and any `rss.xml` items about the lane.
- Check remaining pages' titles/descriptions/JSON-LD for LexisNexis wording.

## 7. Data note

Existing rows in the database (past quotes, form submissions, purchases referencing WorldCompliance) are left untouched for audit history; admin views will simply stop offering the product going forward.

## Verification

- Full-text search returns zero `LexisNexis` / `WorldCompliance` / `Bridger` matches in `src/`, `public/`, `supabase/functions/`.
- Typecheck passes and every removed route redirects instead of 404ing.
- Project memory entries about the two-lane model and LexisNexis regional routing are updated to the single-lane model.
