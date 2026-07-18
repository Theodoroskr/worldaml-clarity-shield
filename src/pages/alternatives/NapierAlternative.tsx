import AlternativeLandingTemplate from "@/components/AlternativeLandingTemplate";

const NapierAlternative = () => (
  <AlternativeLandingTemplate
    competitorName="Napier"
    competitorTrademark="Napier® is a registered trademark of Napier Technologies Limited"
    eyebrow="Napier Alternative"
    headline="A Napier alternative for AML screening, monitoring and case management — with Tier-1 data included"
    subhead="WorldAML delivers the same screening, transaction monitoring and case management capabilities compliance teams evaluate Napier for — with Tier-1 LexisNexis WorldCompliance data included in the platform, not sold as a separate feed."
    seoTitle="Napier Alternative | WorldAML"
    seoDescription="Compare WorldAML vs Napier on sanctions and PEP screening, transaction monitoring, case management, pricing and Tier-1 data inclusion. See why teams switch."
    canonical="/alternatives/napier"
    reasons={[
      { title: "Tier-1 data included, not extra", desc: "LexisNexis WorldCompliance + BridgerXG ship inside the platform — no separate data feed to procure, contract or reconcile." },
      { title: "Same-day onboarding, not months", desc: "Pre-built rule packs for MLR 2017, AMLR, BSA and MOKAS — go live in days rather than a multi-quarter Napier implementation." },
      { title: "Transparent regional pricing", desc: "Self-serve subscriptions in EUR, GBP, USD and AED. No enterprise-only pricing model, no multi-year lock-in." },
      { title: "Regulator-ready reports", desc: "One-click SAR/STR packs for FinCEN, FINTRAC, MOKAS and goAML — not a services engagement." },
      { title: "Fewer moving parts", desc: "Screening, monitoring, case management and reporting on a single data model — no modular integration project." },
      { title: "EU-hosted, GDPR-native", desc: "Delivered from the EU by Infocredit Group with Article 28 DPAs, EU data residency and DPIA support." },
    ]}
    comparison={[
      { feature: "Sanctions, PEP & adverse media screening", worldaml: "yes", competitor: "yes" },
      { feature: "Transaction monitoring", worldaml: "yes", competitor: "yes" },
      { feature: "Case management & four-eye approval", worldaml: "yes", competitor: "yes" },
      { feature: "Tier-1 data included in the platform", worldaml: "yes", competitor: "no", note: "Napier is data-agnostic; you bring your own list provider." },
      { feature: "KYC/KYB onboarding included", worldaml: "yes", competitor: "partial" },
      { feature: "Pre-built regulator report packs (FinCEN, FINTRAC, MOKAS, goAML)", worldaml: "yes", competitor: "partial" },
      { feature: "Same-day self-serve onboarding", worldaml: "yes", competitor: "no" },
      { feature: "Transparent regional pricing", worldaml: "yes", competitor: "no" },
      { feature: "EU data residency", worldaml: "yes", competitor: "partial" },
      { feature: "Free ad-hoc sanctions check", worldaml: "yes", competitor: "no" },
    ]}
    procurement={[
      { title: "Bundled data + platform", desc: "One contract, one invoice — no separate LexisNexis, Refinitiv or Dow Jones list procurement running in parallel." },
      { title: "Implementation in weeks", desc: "Days-to-live for standard tiers vs multi-quarter Napier programmes — capex and consulting spend drop accordingly." },
      { title: "Predictable subscription", desc: "Seat- and volume-based pricing in your currency — no bespoke SOW for every use case." },
      { title: "Standard security packet", desc: "SOC 2 / ISO 27001 posture, EU DPA, sub-processor list and DPIA-ready documentation." },
      { title: "Regional invoicing", desc: "EUR, GBP, USD and AED billing entities with local VAT handling." },
      { title: "Switcher-friendly terms", desc: "30-day exit clause, contractually — no punitive multi-year auto-renewals if the tool underperforms." },
    ]}
    compliance={[
      { title: "Screening + monitoring on one data model", desc: "Alerts, cases and rescreen results share a single audit trail — no reconciliation between screening and TM systems." },
      { title: "Tunable rule library", desc: "Configurable thresholds, typologies and jurisdiction-specific rule packs — every change versioned and reviewable." },
      { title: "Immutable audit trail", desc: "Every hit, decision, override and four-eye approval logged with rationale — inspection-ready for FCA, FinCEN, DNB or MOKAS." },
      { title: "Regulator report packs", desc: "One-click SAR/STR generation for FinCEN, FINTRAC, MOKAS and goAML — no manual re-keying." },
      { title: "Model-risk documentation", desc: "Coverage reports, tuning history and independent-testing evidence for s.166 and equivalent skilled-person reviews." },
    ]}
    faqs={[
      { q: "Is WorldAML really a Napier alternative?", a: "Yes. WorldAML covers the same screening, transaction monitoring and case management use cases as Napier — with Tier-1 LexisNexis WorldCompliance data included in the platform, transparent regional pricing and same-day self-serve onboarding rather than a multi-quarter implementation." },
      { q: "Do I still need a separate data provider?", a: "No. WorldAML bundles LexisNexis WorldCompliance and BridgerXG in every subscription — 9.2M+ profiles across 240+ countries and 1,900+ sources. If you already have a Dow Jones or Refinitiv contract, you can layer it in via API." },
      { q: "How does WorldAML compare on transaction monitoring?", a: "WorldAML ships pre-built typology libraries for retail banking, fintech, iGaming, EMIs and crypto, with configurable thresholds, alert triage and SLA tracking. Rules are versioned, tunable and fully auditable — parity with Napier's Continuum TM for the vast majority of use cases." },
      { q: "Is WorldAML cheaper than Napier?", a: "Typically yes for SMB and mid-market firms. WorldAML uses transparent self-serve subscriptions in EUR, GBP, USD and AED with no bespoke SOW. Enterprise pricing is negotiable for larger volumes." },
      { q: "Is Napier a trademark of WorldAML?", a: "No. Napier® is a registered trademark of Napier Technologies Limited. WorldAML is an independent product from Infocredit Group, an EU-based compliance technology company. References on this page are used solely for lawful comparative purposes." },
    ]}
  />
);

export default NapierAlternative;
