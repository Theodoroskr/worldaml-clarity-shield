
## Answer: Yes — Transaction Monitoring would be a page under the Platform section

Looking at the current nav structure in `Header.tsx`, the **Platform** dropdown currently has:

```
Platform
├── Overview          → /platform
├── WorldAML Suite    → /platform/suite
├── WorldAML API      → /platform/api
└── Security          → /platform/security
```

Transaction Monitoring would be added as a **fifth item** in this same dropdown:

```
Platform
├── Overview                → /platform
├── WorldAML Suite          → /platform/suite
├── WorldAML API            → /platform/api
├── Security                → /platform/security
└── Transaction Monitoring  → /platform/transaction-monitoring  ← NEW
```

The URL pattern `/platform/transaction-monitoring` follows the exact same convention as the existing platform pages, and the route sits in the `{/* Platform (Lane 1) */}` block in `App.tsx` (lines 89–93).

The `/platform` overview page (`src/pages/Platform.tsx`) also currently shows two product cards (Suite and API). Transaction Monitoring would be added as a third card there.

---

## Plan: Build /platform/transaction-monitoring

### New files to create

- `src/pages/PlatformTransactionMonitoring.tsx` — page shell
- `src/components/transaction-monitoring/TMHeroSection.tsx`
- `src/components/transaction-monitoring/TMWhatIsSection.tsx`
- `src/components/transaction-monitoring/TMFeaturesSection.tsx`
- `src/components/transaction-monitoring/TMHowItWorksSection.tsx`
- `src/components/transaction-monitoring/TMRegulatorySection.tsx`
- `src/components/transaction-monitoring/TMUseCasesSection.tsx`
- `src/components/transaction-monitoring/TMCTASection.tsx`

### Files to edit

| File | Change |
|---|---|
| `src/App.tsx` | Add route at line 93 |
| `src/components/Header.tsx` | Add item to Platform dropdown (line 31) |
| `src/components/Footer.tsx` | Add link in Platform column |
| `public/sitemap.xml` | Add `<url>` entry |
| `src/pages/Platform.tsx` | Add third card alongside Suite + API |

### Page sections

1. **Hero** — H1: "Transaction Monitoring Software" + subheading targeting "real-time AML transaction screening"
2. **What Is** — Definition, why regulators require it (FATF Rec. 20), what triggers a transaction alert
3. **Features** — 6-card grid: Rule-Based Screening · Threshold Alerts · Typology Detection · Batch & Real-Time · SAR Workflow · Case Escalation
4. **How It Works** — 4-step flow: Ingest → Evaluate → Alert → Resolve
5. **Regulatory** — FATF, EU AMLD6, FinCEN/BSA, FCA — with brief description of each
6. **Use Cases** — Banks · Crypto/VASPs · Payment Processors
7. **CTA** — "Request Access" + "View Platform API"

### SEO baked in
- Title: `"Transaction Monitoring Software | AML Platform | WorldAML"`
- Meta description targeting "transaction monitoring", "AML transaction screening", "suspicious activity reporting"
- `canonical="/platform/transaction-monitoring"`
- BreadcrumbList JSON-LD: Home → Platform → Transaction Monitoring
