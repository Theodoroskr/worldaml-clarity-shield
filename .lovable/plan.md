

## Plan: Add 6 More AML Regulation Jurisdictions

Add Japan, South Korea, Switzerland, Luxembourg, Cayman Islands, and Jersey to the AML Regulations data file, bringing the total from 6 to 12.

### Changes

**`src/data/amlRegulations.ts`**

Add 6 new `AMLRegulation` entries (same structure as existing ones) before the `comparisonMatrix`:

| ID | Jurisdiction | Flag | Authority | Key Legislation |
|----|-------------|------|-----------|-----------------|
| `japan-aml` | Japan | 🇯🇵 | JAFIC / FSA Japan | Act on Prevention of Transfer of Criminal Proceeds |
| `south-korea-aml` | South Korea | 🇰🇷 | KoFIU / FSC | Act on Reporting and Using Specified Financial Transaction Information |
| `switzerland-aml` | Switzerland | 🇨🇭 | FINMA / MROS | AMLA (Anti-Money Laundering Act) |
| `luxembourg-aml` | Luxembourg | 🇱🇺 | CSSF / CRF | AML Law of 2004 (as amended) |
| `cayman-islands-aml` | Cayman Islands | 🇰🇾 | CIMA / FRA | Anti-Money Laundering Regulations (2020 Rev.) |
| `jersey-aml` | Jersey | 🇯🇪 | JFSC | Proceeds of Crime (Jersey) Law 1999 / Money Laundering Order |

Each entry includes: authority, status, effective date, scope, 6-8 key obligations, UBO threshold, PEP/sanctions requirements, penalty regime, timeline, and official URL.

**Update `comparisonMatrix`** — Add 6 new columns (`japan`, `southKorea`, `switzerland`, `luxembourg`, `cayman`, `jersey`) to each row with jurisdiction-specific values for UBO threshold, PEP EDD, SAR filing, sanctions screening, crypto coverage, record retention, and max penalty.

### Scope
- 1 file (`src/data/amlRegulations.ts`), ~400 lines added

