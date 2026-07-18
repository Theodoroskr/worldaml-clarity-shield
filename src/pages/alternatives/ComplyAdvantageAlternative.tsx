import AlternativeLandingTemplate from "@/components/AlternativeLandingTemplate";

const ComplyAdvantageAlternative = () => (
  <AlternativeLandingTemplate
    competitorName="ComplyAdvantage"
    competitorTrademark="ComplyAdvantage® is a registered trademark of IVXS UK Limited"
    eyebrow="ComplyAdvantage Alternative"
    headline="A ComplyAdvantage alternative built on Tier-1 data — with case management, monitoring and reporting included"
    subhead="WorldAML matches ComplyAdvantage on real-time sanctions, PEP and adverse media screening — but adds the case management, transaction monitoring and regulator-ready reporting most fintechs end up buying separately."
    seoTitle="ComplyAdvantage Alternative | WorldAML"
    seoDescription="Compare WorldAML vs ComplyAdvantage: sanctions, PEP and adverse media coverage, case management, monitoring, pricing and EU data residency. See why teams switch."
    canonical="/alternatives/comply-advantage"
    reasons={[
      { title: "Tier-1 data, not proprietary black box", desc: "Powered by LexisNexis WorldCompliance + BridgerXG — 9.2M+ profiles across 1,900+ sources in 240+ countries, benchmarked as Tier-1 alongside ComplyAdvantage." },
      { title: "Full workflow included", desc: "Screening, case management, transaction monitoring and regulator reporting in one platform — no bolt-on case tool or separate TM vendor." },
      { title: "Transparent regional pricing", desc: "Self-serve subscriptions in EUR, GBP, USD and AED. No opaque per-search overages, no forced annual uplift." },
      { title: "EU-hosted and GDPR-native", desc: "Delivered from the EU by Infocredit Group with Article 28 DPAs, EU data residency and DPIA support — no US-only hosting workaround." },
      { title: "Fewer false positives out of the box", desc: "Configurable fuzzy matching, secondary identifiers and ownership analysis to the 50% control threshold — tuned per jurisdiction, not per demo." },
      { title: "Audit-ready by default", desc: "Every hit, decision, override and rule change is logged with four-eye approval and pre-formatted SAR/STR exports for FinCEN, FINTRAC, MOKAS and goAML." },
    ]}
    comparison={[
      { feature: "Real-time sanctions, PEP & adverse media screening", worldaml: "yes", competitor: "yes" },
      { feature: "1,900+ global watchlists & regulatory lists", worldaml: "yes", competitor: "yes" },
      { feature: "Built-in case management & four-eye approval", worldaml: "yes", competitor: "partial", note: "ComplyAdvantage case management is available but often billed as an add-on module." },
      { feature: "Transaction monitoring included", worldaml: "yes", competitor: "partial", note: "TM is a separate product line in ComplyAdvantage pricing." },
      { feature: "KYC/KYB onboarding included", worldaml: "yes", competitor: "partial" },
      { feature: "Pre-built regulator report packs (FinCEN, FINTRAC, MOKAS, goAML)", worldaml: "yes", competitor: "no" },
      { feature: "EU data residency & GDPR-native delivery", worldaml: "yes", competitor: "partial" },
      { feature: "Transparent regional pricing (EUR / GBP / USD / AED)", worldaml: "yes", competitor: "no" },
      { feature: "Free ad-hoc sanctions check", worldaml: "yes", competitor: "no" },
      { feature: "Powered by LexisNexis WorldCompliance & BridgerXG", worldaml: "yes", competitor: "no", note: "ComplyAdvantage uses its own proprietary risk database." },
      { feature: "SMB-friendly onboarding (days, not months)", worldaml: "yes", competitor: "partial" },
    ]}
    procurement={[
      { title: "One line item, not four", desc: "Screening + case management + monitoring + reporting on a single contract — no stacked SOWs from separate vendors." },
      { title: "Regional pricing in your currency", desc: "EUR, GBP, USD and AED subscriptions with no FX surprises at renewal." },
      { title: "No per-search meter", desc: "Predictable seat- and volume-based pricing so finance can forecast without a spreadsheet." },
      { title: "Standard DPA & Article 28", desc: "Signed EU DPA, sub-processor list and DPIA support ship in the security packet, not a legal round-trip." },
      { title: "SOC 2 / ISO 27001 evidence pack", desc: "Ready-to-share security posture — vendor risk assessments close in days, not weeks." },
      { title: "30-day exit clause", desc: "Contract terms designed for switchers — no multi-year auto-renewals to unpick if the tool underperforms." },
    ]}
    compliance={[
      { title: "Match quality you can defend", desc: "Transparent match logic, tunable thresholds and per-jurisdiction rule packs — every override is logged with rationale." },
      { title: "Ongoing monitoring, not just onboarding", desc: "Rescreen the entire book against every list update, with alert triage and SLA tracking built in." },
      { title: "MLRO-ready audit trail", desc: "Immutable log of every hit, decision, four-eye approval and rule change — export-ready for FCA, FinCEN or DNB inspections." },
      { title: "Regulator report packs", desc: "One-click SAR/STR generation for FinCEN, FINTRAC, MOKAS and goAML — no manual re-keying from spreadsheets." },
      { title: "Independent-testing evidence", desc: "Coverage reports, tuning history and model-risk documentation your s.166 skilled-person review will actually want." },
    ]}
    faqs={[
      { q: "Is WorldAML really a ComplyAdvantage alternative?", a: "Yes. WorldAML covers the same core use cases — real-time sanctions, PEP and adverse media screening plus ongoing monitoring — across 1,900+ global lists. The difference is workflow: WorldAML ships case management, transaction monitoring and regulator reporting in the same platform, so you don't need to buy or integrate additional tools." },
      { q: "How does WorldAML's data compare to ComplyAdvantage?", a: "WorldAML is powered by LexisNexis WorldCompliance and BridgerXG — 9.2M+ profiles across 240+ countries and 1,900+ sources. Independent analyst reviews rank LexisNexis as a Tier-1 equivalent to ComplyAdvantage for breadth, refresh frequency and adverse media depth." },
      { q: "Can I migrate from ComplyAdvantage without rebuilding integrations?", a: "Yes. WorldAML exposes a REST API with familiar request/response shapes, provides import templates for existing customer/entity lists, and mirrors ComplyAdvantage's risk categories (sanctions, PEP, RCA, SIE, adverse media). Most teams migrate in 2–4 weeks." },
      { q: "Is WorldAML cheaper than ComplyAdvantage?", a: "Usually yes for SMBs and mid-market fintechs. WorldAML offers transparent self-serve subscriptions in EUR, GBP, USD and AED without per-search meters or forced annual uplift. Enterprise pricing is negotiable for higher volumes." },
      { q: "Is ComplyAdvantage a trademark of WorldAML?", a: "No. ComplyAdvantage® is a registered trademark of IVXS UK Limited. WorldAML is an independent product from Infocredit Group, an EU-based compliance technology company. References on this page are used solely for lawful comparative purposes." },
    ]}
  />
);

export default ComplyAdvantageAlternative;
