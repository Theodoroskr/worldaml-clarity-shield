
## Add IndustriesSection to Homepage

### Change
Insert the existing `IndustriesSection` component into `src/pages/Index.tsx` between `<StatsSection />` and `<HowItWorksSection />`.

### Technical Detail
- `src/components/home/IndustriesSection.tsx` already exists and is fully built — no new code needed.
- One import line added to `Index.tsx`.
- One JSX line added between the two existing section components.

### Updated homepage order
1. NewHeroSection
2. StatsSection
3. **IndustriesSection** ← inserted here
4. HowItWorksSection
5. GlobalReachSection
6. TrustedByLogos
7. HomeCTASection
