
## Enhance Course Content Write-up

Seven paid courses are still thin (under ~2,000 characters with only 2 modules) and don't meet the 15+ minute reading standard. I'll bring them up to the same depth as the previously expanded regional AML courses (~5 lessons + 1 case study, ~12k chars, 18-22 min).

### Courses to expand

| Slug | Current | Target |
|---|---|---|
| sanctions-screening-essentials (free) | 2 mods / 1,366 chars / 5 min | 5 mods / ~12k / 18 min |
| adverse-media-intelligence | 2 mods / 1,446 chars / 20 min | 5 mods / ~12k / 20 min |
| pep-screening-edd | 2 mods / 1,560 chars / 20 min | 5 mods / ~12k / 20 min |
| beneficial-ownership | 2 mods / 1,685 chars / 20 min | 5 mods / ~12k / 20 min |
| crypto-aml | 2 mods / 1,838 chars / 20 min | 5 mods / ~12k / 22 min |
| risk-based-approach | 2 mods / 1,873 chars / 5 min | 5 mods / ~12k / 18 min |
| transaction-monitoring-sar | 8 mods / 4,902 chars / 60 min | 6 mods / ~14k / 25 min |
| international-sanctions-compliance | 4 mods / 6,984 chars / 20 min | 6 mods / ~13k / 22 min |

`crypto-aml-essentials` (36k chars) and `kyc-customer-due-diligence` (14k chars) are already at standard — leaving untouched.

### Lesson structure per course (5–6 modules)

1. **Foundations** — definitions, regulatory context (FATF, EU AMLD, FinCEN, MAS, etc.)
2. **Regulators & Frameworks** — supervisory bodies and key obligations
3. **Operational Practice** — workflows, controls, tooling, thresholds
4. **Red Flags & Typologies** — indicators, common evasion patterns
5. **Case Study** — realistic scenario with decision points and resolution
6. *(longer courses)* **Reporting & Escalation** — SAR/STR triggers, internal governance

Each lesson ~2,000–2,500 chars of substantive markdown with headings, bullet lists, examples, and citations to real regulations.

### Technical execution

1. **SQL migration #1** — `DELETE FROM academy_modules WHERE course_id IN (...) AND LENGTH(content) < 1500` to clear stub modules for the 8 target courses.
2. **SQL migration #2** — `INSERT INTO academy_modules` with new lesson rows (sequential `sort_order`, slug-based course lookup via subquery).
3. **SQL migration #3** — `UPDATE academy_courses SET duration_minutes = X` to align with the new content length.
4. Quizzes already exist on these courses (validated previously) — no changes needed; re-sequencing keeps the quiz module at the end.
5. No frontend changes required; `ModuleContent` and `ModuleTOC` already render markdown.

### Out of scope
- Stripe pricing IDs (separate admin task)
- Free-vs-paid gating logic (already shipped)
- `crypto-aml-essentials` and `kyc-customer-due-diligence` (already at standard)
