import { Building2, Bitcoin, CreditCard } from "lucide-react";

const useCases = [
  {
    icon: Building2,
    sector: "Banks & Credit Institutions",
    challenge: "Large retail portfolios require screening of millions of customers against continuously updated sanctions and PEP data — without generating unmanageable false-positive alert volumes.",
    solution: "Configurable fuzzy-matching thresholds and risk-weighted filtering reduce false positives. Batch overnight screening for the full portfolio with real-time checks at onboarding and transactions.",
    metrics: ["50+ risk categories", "Configurable match thresholds", "Batch & real-time modes"],
  },
  {
    icon: Bitcoin,
    sector: "Crypto & VASPs",
    challenge: "VASPs face FATF R.15 obligations and must screen customers and counterparties against sanctions before processing. On-chain and off-chain exposure requires comprehensive watchlist coverage.",
    solution: "Real-time sanctions screening for wallet addresses and account holders via API. OFAC, UN, EU, and OFSI coverage with sub-300ms response time for inline transaction checks.",
    metrics: ["FATF R.15 aligned", "Sub-300ms API response", "Travel Rule support"],
  },
  {
    icon: CreditCard,
    sector: "Payment Processors & EMIs",
    challenge: "Instant payment rails require sanctions screening at payment initiation — not after settlement. PEP exposure across large merchant and end-user portfolios requires ongoing monitoring at scale.",
    solution: "Inline real-time screening for payment processing with configurable block / review / pass workflows. Ongoing PEP and adverse media monitoring across the full merchant and end-user base.",
    metrics: ["Inline payment screening", "PSD2 / EMD2 aligned", "Ongoing portfolio monitoring"],
  },
];

const AMLUseCasesSection = () => {
  return (
    <section className="section-padding bg-background">
      <div className="container-enterprise">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-teal font-semibold text-body-sm uppercase tracking-wider mb-3">Use Cases</p>
          <h2 className="text-navy mb-4">AML Screening Across Financial Sectors</h2>
          <p className="text-body text-text-secondary">Every sector has distinct screening volumes, latency requirements, and risk profiles. WorldAML adapts to each.</p>
        </div>
        <div className="grid lg:grid-cols-3 gap-8">
          {useCases.map((uc) => (
            <div key={uc.sector} className="bg-surface-subtle border border-divider rounded-xl p-8">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-navy/5 text-navy mb-6">
                <uc.icon className="w-6 h-6" />
              </div>
              <h3 className="text-navy text-xl font-semibold mb-3">{uc.sector}</h3>
              <div className="mb-4">
                <p className="text-caption font-semibold text-text-tertiary uppercase tracking-wider mb-1">Challenge</p>
                <p className="text-body-sm text-text-secondary">{uc.challenge}</p>
              </div>
              <div className="mb-6">
                <p className="text-caption font-semibold text-text-tertiary uppercase tracking-wider mb-1">Solution</p>
                <p className="text-body-sm text-text-secondary">{uc.solution}</p>
              </div>
              <ul className="space-y-2 pt-4 border-t border-divider">
                {uc.metrics.map((m) => (
                  <li key={m} className="flex items-center gap-2 text-body-sm text-teal font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal shrink-0" />
                    {m}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AMLUseCasesSection;
