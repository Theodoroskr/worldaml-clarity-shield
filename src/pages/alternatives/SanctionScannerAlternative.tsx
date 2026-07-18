import AlternativeLandingTemplate from "@/components/AlternativeLandingTemplate";

const SanctionScannerAlternative = () => (
  <AlternativeLandingTemplate
    competitorName="Sanction Scanner"
    competitorTrademark="Sanction Scanner® is a registered trademark of Sanction Scanner Ltd"
    eyebrow="Sanction Scanner Alternative"
    headline="A Sanction Scanner alternative with Tier-1 data, EU delivery and full case management"
    subhead="WorldAML matches Sanction Scanner on real-time sanctions, PEP and adverse media screening — but adds Tier-1 LexisNexis WorldCompliance data, EU hosting, four-eye case management and pre-built regulator report packs."
    seoTitle="Sanction Scanner Alternative | WorldAML"
    seoDescription="Compare WorldAML vs Sanction Scanner on data provenance, EU residency, case management, transaction monitoring and pricing. See why regulated teams switch."
    canonical="/alternatives/sanction-scanner"
    reasons={[
      { title: "Tier-1 data provenance", desc: "Powered by LexisNexis WorldCompliance and BridgerXG — analyst-benchmarked Tier-1 data, not aggregated open-source lists." },
      { title: "Full case management, not just alerts", desc: "Four-eye approval, reviewer workload, override rationale and immutable audit trail — regulator-defensible out of the box." },
      { title: "Transaction monitoring included", desc: "Configurable typologies for retail banking, EMI, iGaming, crypto and fintech — no separate TM contract." },
      { title: "Pre-built regulator reports", desc: "One-click SAR/STR packs for FinCEN, FINTRAC, MOKAS and goAML — no re-keying from spreadsheets." },
      { title: "EU-hosted and GDPR-native", desc: "Delivered from the EU by Infocredit Group with Article 28 DPAs, EU data residency and DPIA support." },
      { title: "Transparent regional pricing", desc: "Self-serve subscriptions in EUR, GBP, USD and AED — predictable, no per-search surprises." },
    ]}
    comparison={[
      { feature: "Real-time sanctions & PEP screening", worldaml: "yes", competitor: "yes" },
      { feature: "Adverse media screening", worldaml: "yes", competitor: "yes" },
      { feature: "Tier-1 data provider (LexisNexis / BridgerXG)", worldaml: "yes", competitor: "no", note: "Sanction Scanner relies on aggregated open-source and public lists." },
      { feature: "Full case management with four-eye approval", worldaml: "yes", competitor: "partial" },
      { feature: "Transaction monitoring included", worldaml: "yes", competitor: "partial" },
      { feature: "KYC/KYB onboarding included", worldaml: "yes", competitor: "partial" },
      { feature: "Pre-built regulator report packs (FinCEN, FINTRAC, MOKAS, goAML)", worldaml: "yes", competitor: "no" },
      { feature: "EU data residency & GDPR-native delivery", worldaml: "yes", competitor: "partial" },
      { feature: "Ownership & control analysis to 50% threshold", worldaml: "yes", competitor: "partial" },
      { feature: "Independent-testing evidence pack", worldaml: "yes", competitor: "no" },
    ]}
    procurement={[
      { title: "Regulator-grade data, one contract", desc: "Tier-1 LexisNexis data bundled — no separate list procurement, no cross-vendor reconciliation." },
      { title: "Predictable regional pricing", desc: "Transparent EUR/GBP/USD/AED subscriptions — no per-search overages or forced annual uplift." },
      { title: "EU DPA & sub-processor list", desc: "Article 28 DPA, EU data residency and DPIA support ship in the security packet." },
      { title: "SOC 2 / ISO 27001 evidence", desc: "Ready-to-share security posture — vendor risk assessments close in days, not weeks." },
      { title: "30-day exit clause", desc: "Contract terms designed for switchers — no punitive multi-year auto-renewals." },
      { title: "Regional invoicing", desc: "EU, UK, US and GCC billing entities with local VAT handling." },
    ]}
    compliance={[
      { title: "Data you can defend to a regulator", desc: "LexisNexis-sourced sanctions, PEP and adverse media with documented refresh cadence — the kind of provenance FCA, DNB and FinCEN examiners expect." },
      { title: "Ownership & control analysis", desc: "Automatic 50%-rule expansion for OFAC/EU sanctioned ownership — flagged before onboarding, not after enforcement." },
      { title: "Four-eye case workflow", desc: "Every hit, override and closure logged with reviewer, timestamp and rationale — inspection-ready audit trail." },
      { title: "Transaction monitoring on the same data model", desc: "Screening alerts and TM alerts share one case surface — no swivel-chair between systems." },
      { title: "Regulator report packs", desc: "One-click SAR/STR generation for FinCEN, FINTRAC, MOKAS and goAML — no manual re-keying." },
    ]}
    faqs={[
      { q: "Is WorldAML really a Sanction Scanner alternative?", a: "Yes. WorldAML covers the same real-time sanctions, PEP and adverse media use cases as Sanction Scanner — with Tier-1 LexisNexis WorldCompliance data, EU hosting, full four-eye case management and pre-built regulator report packs added in the same platform." },
      { q: "Why does data provenance matter?", a: "Regulators increasingly ask which data source you screened against and how often it refreshes. Aggregated open-source lists can be enough for early-stage screening, but FCA, DNB, FinCEN and DFSA examiners expect a documented Tier-1 provider (LexisNexis, Refinitiv, Dow Jones) for material-risk populations." },
      { q: "Can I migrate from Sanction Scanner without rebuilding integrations?", a: "Yes. WorldAML exposes a REST API with familiar request/response shapes and provides import templates for existing customer lists and prior alert history. Most teams migrate in 2–4 weeks." },
      { q: "Is WorldAML more expensive than Sanction Scanner?", a: "For similar volumes the pricing is comparable, and WorldAML avoids the extra cost of a separate Tier-1 data contract, case management tool and TM engine. Total cost of ownership is typically lower once those adjacent tools are included." },
      { q: "Is Sanction Scanner a trademark of WorldAML?", a: "No. Sanction Scanner® is a registered trademark of Sanction Scanner Ltd. WorldAML is an independent product from Infocredit Group, an EU-based compliance technology company. References on this page are used solely for lawful comparative purposes." },
    ]}
  />
);

export default SanctionScannerAlternative;
