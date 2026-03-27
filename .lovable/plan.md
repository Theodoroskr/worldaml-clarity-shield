

## Plan: Refine Homepage Copy for Conversion

The current homepage copy is technically accurate but reads more like product documentation than a conversion-focused B2B landing page. The changes below sharpen every section with commercially-driven language, stronger value propositions, and clearer calls to action — without changing layout, structure, or components.

### Changes by File

**1. `src/components/home/NewHeroSection.tsx`**
- Headline: "WorldAML — Financial Crime Screening Infrastructure" → **"AML, KYC & KYB Software for Regulated Businesses"**
- Subheadline: Replace generic "unified platform and API layer" copy with benefit-led messaging: **"Streamline onboarding, screening, and monitoring with a scalable compliance platform trusted by banks, fintechs, and payment institutions across 3 continents."**
- Add a second CTA button: **"Run a Free AML Check"** → `/free-aml-check`
- Attribution line: tighten to a single sentence
- Product cards: sharpen descriptions to emphasise outcomes over architecture
  - WorldAML Platform: "Manage KYC, KYB, sanctions screening, and ongoing monitoring from a single dashboard."
  - WorldID: "Verify identities in seconds with document authentication and biometric liveness checks."
  - Screening Solutions: "Access 1,900+ global watchlists via WorldCompliance and Bridger Insight XG."

**2. `src/components/home/BusinessImpactSection.tsx`**
- Rewrite labels to be benefit-first:
  - "80% Less Manual Review Time" → **"80% Reduction in Manual Review"** / desc: "Free your compliance analysts to focus on genuine risk, not repetitive checks."
  - "<30s Average Screening Result" → **"<30s Screening Turnaround"** / desc: "Onboard customers faster with real-time sanctions, PEP, and adverse media decisions."
  - "99.9% Uptime SLA" → keep label, new desc: **"Built for mission-critical compliance workflows that cannot afford downtime."**

**3. `src/components/home/StatsSection.tsx`**
- Header: "Global Data Coverage" → **"The Data Behind Every Decision"**
- Subheadline: "Comprehensive, constantly updated databases…" → **"Real-time access to the world's most comprehensive financial crime databases — so you can screen with confidence."**

**4. `src/components/home/HowItWorksSection.tsx`**
- Header: "How WorldAML Works" → **"From Onboarding to Ongoing Monitoring — in Four Steps"**
- Step descriptions: expand from terse fragments to outcome-focused sentences:
  - Step 1: "Verify individuals and businesses at onboarding with automated identity and entity checks."
  - Step 2: "Screen against global sanctions lists, PEP databases, and adverse media in real time."
  - Step 3: "Detect changes in risk status automatically — no manual re-screening required."
  - Step 4: "Apply configurable risk scoring to prioritise reviews and satisfy regulatory expectations."

**5. `src/components/home/IndustriesSection.tsx`**
- Header: "Built for Regulated Industries" → **"Compliance Infrastructure for Every Regulated Sector"**
- Subheadline: Replace with: **"From traditional banks to high-growth fintechs, WorldAML gives compliance teams the tools to onboard faster, screen smarter, and report with confidence."**

**6. `src/components/home/GlobalReachSection.tsx`**
- Header: "Global Coverage, Local Relevance" → **"Screen Globally. Comply Locally."**
- Body: Tighten and add commercial angle: **"WorldAML covers 1,900+ risk lists across sanctions, watchlists, PEPs, and adverse media — with deep regulatory intelligence for the UK, EU, US, and GCC. One platform, every jurisdiction."**

**7. `src/components/home/HomeCTASection.tsx`**
- Headline: "Ready to Strengthen Your Compliance Programme?" → **"Ready to Reduce Compliance Friction?"**
- Body: "Speak with our team to learn how WorldAML can support…" → **"Book a 30-minute walkthrough and see how WorldAML can cut onboarding time, reduce false positives, and keep your compliance programme audit-ready."**
- Add second CTA: **"Run a Free AML Check"** → `/free-aml-check`
- Footer text: "No commitment required…" → **"No commitment. No credit card. Response within 24 hours."**

### Scope
- 7 files, copy-only changes (no structural or layout modifications)
- Adds one extra CTA button in hero and bottom CTA sections linking to `/free-aml-check`

