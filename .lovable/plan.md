
## Add iGaming Regulation to Transaction Monitoring Page

The user confirmed Transaction Monitoring is a module of WorldAML and wants iGaming regulation added to the page. Two targeted edits required.

### Files to edit

**`src/components/transaction-monitoring/TMRegulatorySection.tsx`**

Add 2 new framework objects to the `frameworks` array (currently 6 cards in `lg:grid-cols-3`):

- **MGA** — Malta Gaming Authority — `iGaming / EU` — mandates AML/CFT obligations for remote gaming operators, including automated transaction monitoring, player funds monitoring, and SAR filing under the MGA's AML/CFT Implementing Procedures, aligned with EU AMLD transposition in Malta.
- **UKGC** — UK Gambling Commission — `United Kingdom` — requires licensed gambling operators to implement transaction monitoring under the Gambling Act 2005 and LCCP Social Responsibility Code to detect unusual betting patterns, bonus abuse, and source of funds anomalies.

Grid goes from 6 → 8 cards, still clean in `lg:grid-cols-3` (2 full rows + 2-card partial row). Can optionally switch to `lg:grid-cols-4` if preferred — keeping 3-column is fine.

---

**`src/components/transaction-monitoring/TMUseCasesSection.tsx`**

Add a 4th use case card for **iGaming & Online Gambling Operators**:

- Import `Gamepad2` from `lucide-react` (already installed)
- Sector: `"iGaming & Online Gambling Operators"`
- Challenge: High-velocity micro-transactions, bonus abuse, player deposit/withdrawal cycling, and chip dumping create complex ML patterns unique to gaming accounts.
- Solution: MGA/UKGC-aligned rule sets for gaming typologies — chip dumping detection, deposit-withdrawal velocity, multi-account pattern detection, and automated source of funds verification triggers.
- Metrics: `["MGA & UKGC aligned", "Gaming typology rules", "SAR & STR workflow"]`

Grid changes from `lg:grid-cols-3` (3 cards) to `md:grid-cols-2` (4 cards in 2×2 grid) for a balanced layout.

---

No routing, SEO, nav, database, or other changes needed.
