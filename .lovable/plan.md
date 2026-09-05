# Export: WorldAML Screening as .NET + Bootstrap 4 / jQuery

Produce a standalone, downloadable project that reproduces the core screening product on a classic Microsoft stack. Your Lovable app is not modified.

## What you get

A ZIP containing a solution you can open in Visual Studio and run:

```text
WorldAML.Screening/
  WorldAML.Screening.sln
  src/WorldAML.Screening.Api/        ASP.NET Core 8 Web API
  src/WorldAML.Screening.Core/       domain models, matching, provider client
  src/WorldAML.Screening.Data/       EF Core + SQL Server
  src/WorldAML.Screening.Web/        static HTML + Bootstrap 4 + jQuery UI
  db/schema.sql                      SQL Server schema + seed
  README.md                          setup, config, run instructions
```

## Scope (core screening only)

Carried across, feature for feature:

- Run a screening search on a subject (person / organisation / any entity type), with fuzziness threshold, source and list filters.
- "Match provider portal view" preset and the active-filters panel.
- Results list with photos, risk categories, match scores and the two-layer scoring (provider threshold gating, then local Jaro-Winkler ranking).
- "Group duplicate entities" consolidation, including the token-subset rule that merges extra middle names.
- Entity detail view (profile, aliases, dates of birth, countries, source listings, adverse media).
- Decisions: approve / escalate / reject with rationale, written to an audit trail.
- PDF export of the decision and the case report.
- Search history and case list.

Not included (per your choice): ongoing monitoring and alerts, team and role management, usage quotas, help/support tickets, admin screens. These can be added later as a second phase.

## Screening data

The ComplyAdvantage integration is ported as a typed C# client behind an interface. You supply the API key and base URL in `appsettings.json` / user secrets — no key is embedded in the export. Raw provider responses are persisted the same way they are today, so results stay auditable.

## Technical details

**Server (ASP.NET Core 8, C#)**
- REST controllers mirroring today's functions: `POST /api/screening/search`, `GET /api/screening/searches/{id}`, `GET /api/screening/entities/{id}`, `POST /api/screening/decisions`, `GET /api/screening/cases`.
- `ComplyAdvantageClient` (HttpClient + Polly retry) replacing `_shared/screening/complyadvantage.ts`.
- `NameMatchService` — Jaro-Winkler port of `nameMatch.ts`, plus `MatchConsolidationService` porting `consolidateMatches.ts` (including the token-subset merge rule).
- `EntityProfileService` porting `entityProfile.ts`.
- PDF generation with QuestPDF, porting `decisionPdf.ts` and `caseReportPdf.ts` layouts.
- ASP.NET Core Identity + JWT bearer for sign-in; organisation scoping enforced in a query filter, replacing today's row-level policies.
- xUnit test project porting the existing name-match, entity-type and consolidation test suites.

**Database (SQL Server, EF Core code-first + `db/schema.sql`)**
Tables translated from the current schema: `screening_subjects`, `screening_searches`, `screening_cases`, `screening_matches`, `match_attributes`, `screening_sources`, `adverse_media_items`, `provider_references`, `provider_raw_responses`, `analyst_decisions`, `screening_audit_events`, `screening_policies`, `screening_policy_versions`, plus `organisations` / `users` / `organisation_members`. `jsonb` columns become `nvarchar(max)` with JSON checks; `uuid` becomes `uniqueidentifier`.

**Client (Bootstrap 4.6 + jQuery 3.7)**
- Multi-page static site: `login.html`, `search.html`, `case.html`, `history.html`, shared `layout` partials injected by jQuery.
- `app.js` modules: `api.js` (AJAX wrapper with JWT header), `search.js`, `results.js`, `entityDrawer.js` (Bootstrap modal replacing the React drawer), `decisions.js`.
- Bootstrap 4 components map 1:1 onto the current UI: cards for matches, badges for risk categories, a modal for the entity profile, custom switches for the grouping and broad-search toggles, spinners for loading states.
- Navy / slate / teal palette carried over in a small `theme.css` layered on Bootstrap.

**Verification before delivery**
- `dotnet build` and `dotnet test` run clean in the sandbox.
- The static client is loaded headlessly against a stub API to confirm search, results grouping, entity modal and decision flows render without console errors; screenshots reviewed.
- The ZIP is then written to your documents area for download.

## Note

This is a translation, not a live migration: the exported app runs against its own SQL Server database and its own copy of the provider integration. Existing data would need a one-off import, which is out of scope here.
