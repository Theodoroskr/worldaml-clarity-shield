import AlternativeLandingTemplate from "@/components/AlternativeLandingTemplate";

const DowJonesAlternative = () => (
  <AlternativeLandingTemplate
    competitorName="Dow Jones Risk Center"
    competitorTrademark="Dow Jones Risk & Compliance® and Risk Center® are trademarks of Dow Jones & Company, Inc."
    eyebrow="Dow Jones Risk Center Alternative"
    headline="A Dow Jones Risk Center alternative — Tier-1 sanctions and PEP data with the platform built around it"
    subhead="WorldAML delivers the same Tier-1 sanctions, PEP and adverse media coverage compliance teams expect from Dow Jones Risk & Compliance — plus the screening engine, case management, monitoring and regulator reporting Risk Center doesn't include."
    seoTitle="Dow Jones Risk Center Alternative | WorldAML"
    seoDescription="Compare WorldAML vs Dow Jones Risk Center on sanctions and PEP coverage, workflow, transaction monitoring, pricing and EU delivery. See why teams switch."
    canonical="/alternatives/dow-jones-risk-center"
    reasons={[
      { title: "Platform, not just a data feed", desc: "Dow Jones Risk Center is a database. WorldAML is the screening engine, case management, transaction monitoring and regulator reporting around Tier-1 data — one platform, one contract." },
      { title: "Equivalent Tier-1 data", desc: "Powered by LexisNexis WorldCompliance and BridgerXG — 9.2M+ profiles across 1,900+ global sanctions, PEP and adverse media sources in 240+ countries." },
      { title: "No enterprise-only lock-in", desc: "Self-serve subscriptions in EUR, GBP, USD and AED. No multi-year Dow Jones enterprise contracts just to switch on sanctions screening." },
      { title: "Onboarding in days", desc: "Pre-built AMLR, MLR 2017, BSA and MOKAS rule packs — go live in days, not months of solutions-engineering." },
      { title: "Audit-ready by default", desc: "Every hit, decision, override and rule change logged with four-eye approval and pre-formatted SAR/STR exports." },
      { title: "EU delivery, GDPR-native", desc: "EU-hosted by Infocredit Group with Article 28 DPAs, EU data residency and DPIA support — no cross-Atlantic data-transfer headaches." },
    ]}
    comparison={[
      { feature: "Sanctions, PEP & adverse media data", worldaml: "yes", competitor: "yes" },
      { feature: "1,900+ global watchlists coverage", worldaml: "yes", competitor: "yes" },
      { feature: "Built-in screening engine", worldaml: "yes", competitor: "partial", note: "Risk Center is delivered primarily as data + API; screening logic is your responsibility." },
      { feature: "Case management & workflow", worldaml: "yes", competitor: "no" },
      { feature: "Transaction monitoring included", worldaml: "yes", competitor: "no" },
      { feature: "KYC/KYB onboarding included", worldaml: "yes", competitor: "no" },
      { feature: "Pre-built regulator reports (FinCEN, FINTRAC, MOKAS, goAML)", worldaml: "yes", competitor: "no" },
      { feature: "Transparent self-serve pricing", worldaml: "yes", competitor: "no", note: "Dow Jones is enterprise-quote-only with multi-year commitments." },
      { feature: "Free ad-hoc sanctions check", worldaml: "yes", competitor: "no" },
      { feature: "EU data residency", worldaml: "yes", competitor: "partial" },
      { feature: "Powered by LexisNexis WorldCompliance & BridgerXG", worldaml: "yes", competitor: "no" },
    ]}
    procurement={[
      { title: "One vendor, not three", desc: "Replaces the Risk Center feed + a workflow tool + a TM engine with a single contract and single security review." },
      { title: "Predictable subscription pricing", desc: "Transparent EUR/GBP/USD/AED tiers — no volume surprises, no forced annual uplift, no minimum commitment traps." },
      { title: "Fast legal path", desc: "Standard MSA, EU DPA and sub-processor list ship in the security packet — legal turns days, not months." },
      { title: "Security evidence pack", desc: "SOC 2 / ISO 27001 posture, DPIA and pen-test summaries ready to share with vendor risk teams." },
      { title: "30-day exit clause", desc: "Contract terms designed for switchers — no punitive multi-year auto-renewals if the tool underperforms." },
      { title: "Regional invoicing", desc: "Invoices in your currency and VAT jurisdiction — EU, UK, US and GCC entities all supported." },
    ]}
    compliance={[
      { title: "Screening logic you control", desc: "Fuzzy matching, secondary identifiers and ownership analysis to the 50% control threshold — tunable per jurisdiction, fully documented." },
      { title: "Ongoing monitoring", desc: "Automatic rescreen against every list update, with alert triage, SLA tracking and reviewer workload analytics." },
      { title: "Immutable audit trail", desc: "Every hit, override, four-eye approval and rule change logged with rationale — export-ready for FCA, FinCEN, DNB or MOKAS." },
      { title: "Regulator report packs", desc: "One-click SAR/STR generation for FinCEN, FINTRAC, MOKAS and goAML — no re-keying from spreadsheets." },
      { title: "Model-risk documentation", desc: "Coverage reports, tuning history and independent-testing evidence ready for s.166 skilled-person reviews." },
    ]}
    faqs={[
      { q: "Is WorldAML really a Dow Jones Risk Center alternative?", a: "Yes — with a broader scope. Dow Jones Risk Center is primarily a data offering (sanctions, PEP, adverse media). WorldAML delivers equivalent Tier-1 data via LexisNexis WorldCompliance and BridgerXG, plus the screening engine, case management, transaction monitoring and regulator reporting Dow Jones doesn't include." },
      { q: "How does WorldAML's data compare to Dow Jones?", a: "WorldAML is powered by LexisNexis WorldCompliance and BridgerXG — 9.2M+ profiles across 240+ countries and 1,900+ sources. Independent analyst reviews consistently place LexisNexis alongside Dow Jones and Refinitiv World-Check as a Tier-1 provider for breadth, refresh frequency and adverse media depth." },
      { q: "Can I migrate from Dow Jones without rebuilding my stack?", a: "Yes. WorldAML provides import templates for existing customer/entity lists, mirrors Dow Jones risk categories (SAN, PEP, RCA, SIE, adverse media), and exposes a REST API with familiar request/response shapes. Most teams migrate in 2–4 weeks." },
      { q: "Is WorldAML cheaper than Dow Jones Risk Center?", a: "Typically yes for SMB and mid-market firms. WorldAML uses transparent self-serve subscriptions with regional pricing, while Dow Jones is enterprise-quote-only with multi-year commitments. Enterprise pricing is negotiable for larger volumes." },
      { q: "Is Dow Jones Risk Center a trademark of WorldAML?", a: "No. Dow Jones Risk & Compliance® and Risk Center® are trademarks of Dow Jones & Company, Inc. WorldAML is an independent product from Infocredit Group. References on this page are used solely for lawful comparative purposes." },
    ]}
  />
);

export default DowJonesAlternative;
