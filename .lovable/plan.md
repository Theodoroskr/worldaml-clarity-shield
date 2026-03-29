

# Add Greece, Cyprus, Malta, Romania Market Pages

## Summary
Add four new market landing pages by extending the existing `marketPages` data object and updating navigation/sitemap. No new components needed — the existing `MarketPage.tsx` handles rendering.

## Changes

### 1. `src/data/marketPages.ts` — Add 4 market entries
Add `greece`, `cyprus`, `malta`, `romania` keys with full data following the existing UK/UAE/USA pattern:

| Market | Flag | Regulators | Key Laws | Industry Focus |
|---|---|---|---|---|
| Greece 🇬🇷 | HCMC, Bank of Greece, Hellenic FIU | Law 4557/2018, EU AMLR | Banks, Fintechs, Crypto (MiCA), Shipping |
| Cyprus 🇨🇾 | CySEC, MOKAS, CBC | AML Law 188(I)/2007, CySEC Directives | CIFs, Forex Brokers, Crypto, Holding Cos |
| Malta 🇲🇹 | FIAU, MFSA | PMLFTR, FIAU Implementing Procedures | iGaming, Crypto/DLT, Payment Institutions |
| Romania 🇷🇴 | ONPCSB, NBR, ASF | Law 129/2019, Gov. Emergency Ordinance 111 | Banks, Fintechs, NBFIs, Payment Institutions |

Each entry includes: SEO metadata, hero, 4 challenges, 6 regulation rows, 6 platform modules, 4 industry verticals, 5 FAQs, and CTA.

### 2. `src/components/Header.tsx` — Add to Markets dropdown
Add the 4 new markets to the existing Markets navigation children array.

### 3. `src/components/Footer.tsx` — Add Markets column
Add a "Markets" link group listing all 7 markets.

### 4. `public/sitemap.xml` — Add 4 URLs
Add `/markets/greece`, `/markets/cyprus`, `/markets/malta`, `/markets/romania` with appropriate lastmod dates.

## No routing changes needed
The wildcard route `/markets/:market` in `App.tsx` already handles any market slug.

