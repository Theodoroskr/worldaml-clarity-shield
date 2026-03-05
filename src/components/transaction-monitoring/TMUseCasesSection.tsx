import { Building2, Bitcoin, CreditCard, Gamepad2 } from "lucide-react";

const useCases = [
  {
    icon: Building2,
    sector: "Banks & Credit Institutions",
    challenge:
      "High transaction volumes across multiple channels — retail, corporate, correspondent banking — make manual monitoring impossible.",
    solution:
      "WorldAML's batch and real-time screening layers allow banks to monitor all channels under a single rule engine with per-segment thresholds and customer risk tiers.",
    metrics: ["10M+ transactions/day capacity", "Sub-300ms real-time API", "CTR & SAR workflow built-in"],
  },
  {
    icon: Bitcoin,
    sector: "Crypto & Virtual Asset Service Providers",
    challenge:
      "VASPs face heightened scrutiny under FATF's Travel Rule and must screen on-chain and off-chain transactions for ML typologies unique to crypto.",
    solution:
      "Configurable rule sets for VASP-specific typologies: chain-hopping, mixer usage, rapid cross-chain movement, and wallet clustering indicators.",
    metrics: ["Travel Rule compatible", "VASP-specific typologies", "FATF R.15 aligned"],
  },
  {
    icon: CreditCard,
    sector: "Payment Processors & EMIs",
    challenge:
      "E-money institutions process millions of small-value transactions where velocity and pattern anomalies are the primary ML indicators.",
    solution:
      "Velocity-based monitoring with dynamic thresholds per merchant category code (MCC), geography, and customer risk segment. Real-time inline screening for instant payment rails.",
    metrics: ["Velocity & frequency rules", "MCC-level controls", "PSD2 / EMD2 aligned"],
  },
  {
    icon: Gamepad2,
    sector: "iGaming & Online Gambling Operators",
    challenge:
      "High-velocity micro-transactions, bonus abuse, player deposit/withdrawal cycling, and chip dumping create complex ML patterns unique to gaming accounts.",
    solution:
      "MGA/UKGC-aligned rule sets for gaming typologies — chip dumping detection, deposit-withdrawal velocity, multi-account pattern detection, and automated source of funds verification triggers.",
    metrics: ["MGA & UKGC aligned", "Gaming typology rules", "SAR & STR workflow"],
  },
];

const TMUseCasesSection = () => {
  return (
    <section className="section-padding bg-background">
      <div className="container-enterprise">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-teal font-semibold text-body-sm uppercase tracking-wider mb-3">Use Cases</p>
          <h2 className="text-navy mb-4">Transaction Monitoring Across Financial Sectors</h2>
          <p className="text-body text-text-secondary">
            Every financial sector has distinct monitoring requirements. WorldAML adapts to each.
          </p>
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

export default TMUseCasesSection;
