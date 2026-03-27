

## Create 3 New API-Focused SEO Landing Pages

### Overview
Create three standalone pages at `/aml-api`, `/sanctions-screening-api`, and `/kyc-kyb-api` with unique, API-angle content distinct from the existing `/platform/*` pages. Each page targets API-buyer search intent and links back to the broader platform modules.

### Pages to Create

**1. `/aml-api`** — AML API landing page
- Hero: "AML Screening API — Automate Compliance at Scale"
- Sections: What is an AML API, Key endpoints (sanctions, PEPs, adverse media, RCAs), Integration guide overview, Code sample preview, Use cases (fintechs, neobanks, crypto), CTA
- Internal links to `/platform/api`, `/platform/aml-screening`, `/pricing`

**2. `/sanctions-screening-api`** — Sanctions Screening API landing page
- Hero: "Sanctions Screening API — Real-Time Global List Coverage"
- Sections: What is sanctions screening via API, Supported lists (OFAC, EU, UN, DFAT, etc.), Matching & fuzzy logic, Batch vs real-time screening, Ongoing monitoring endpoint, Use cases, CTA
- Internal links to `/platform/aml-screening`, `/sanctions-check`, `/resources/sanctions-lists`

**3. `/kyc-kyb-api`** — KYC & KYB API landing page
- Hero: "KYC & KYB API — Programmatic Identity Verification"
- Sections: What is KYC/KYB via API, Endpoints (ID verification, UBO mapping, document checks, EDD triggers), Workflow orchestration, Use cases, CTA
- Internal links to `/platform/kyc-kyb`, `/platform/api`, `/pricing`

### File Changes

| File | Action |
|------|--------|
| `src/pages/AMLApi.tsx` | Create — full page with SEO, structured data, sections |
| `src/pages/SanctionsScreeningApi.tsx` | Create — full page |
| `src/pages/KYCKYBApi.tsx` | Create — full page |
| `src/components/aml-api/*` | Create — 5-6 section components per page |
| `src/components/sanctions-api/*` | Create — 5-6 section components |
| `src/components/kyc-kyb-api/*` | Create — 5-6 section components |
| `src/App.tsx` | Add 3 routes: `/aml-api`, `/sanctions-screening-api`, `/kyc-kyb-api` |

### Structure per Page
Each page follows the established pattern:
- `SEO` component with unique title, description, canonical, breadcrumbs, and FAQ structured data
- `Header` / `Footer`
- 5-6 content sections: Hero → What Is → Features/Endpoints → How It Works/Architecture → Use Cases → CTA
- Cross-links to related platform pages and resources

### Technical Details
- Lazy-loaded via `React.lazy()` in App.tsx, consistent with all other pages
- Each page includes `SoftwareApplication` + `FAQPage` JSON-LD structured data
- Section components use existing Tailwind utility classes (`section-padding`, `container-enterprise`, `text-headline`, etc.)
- All CTAs link to `/get-started` or `/contact-sales`

