import { Building2, LineChart, Landmark } from "lucide-react";

const useCases = [
  {
    icon: Building2,
    sector: "Banks & Financial Institutions",
    challenge: "Large retail and commercial banks must apply consistent, documented risk scoring across millions of customers — with EDD mandatory for High-risk designations and defensible methodology for regulators.",
    solution: "Automated risk matrix applied uniformly across the full customer base. Per-segment risk criteria for retail, SME, and corporate portfolios. Examiner-ready audit trail for every risk decision.",
    metrics: ["Uniform scoring across segments", "EDD trigger automation", "AMLD Articles 8–9 aligned"],
  },
  {
    icon: LineChart,
    sector: "Wealth Managers & Private Banks",
    challenge: "HNW and UHNW client portfolios often involve PEP exposure, complex ownership structures, and international wealth sources that require nuanced, individually documented risk assessments.",
    solution: "Weighted criteria for wealth source complexity, PEP status, controlling person links, and jurisdiction risk. Configurable EDD thresholds for High-risk clients with integrated case management.",
    metrics: ["PEP & RCA weighting", "EDD for HNW clients", "Source of wealth criteria"],
  },
  {
    icon: Landmark,
    sector: "MSBs & Non-Bank FIs",
    challenge: "Money Service Businesses, currency exchanges, and non-bank financial institutions are frequent targets for ML abuse and face proportionate — but still mandatory — risk-based programme requirements.",
    solution: "Simplified risk matrix suitable for MSB regulatory obligations. Geography and transaction type weighted scoring. Automated re-assessment triggers for periodic review cycles and SAR-linked re-scoring.",
    metrics: ["MSB-appropriate criteria", "Periodic review automation", "SAR-triggered re-assessment"],
  },
];

const RAUseCasesSection = () => {
  return (
    <section className="section-padding bg-background">
      <div className="container-enterprise">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-teal font-semibold text-body-sm uppercase tracking-wider mb-3">Use Cases</p>
          <h2 className="text-navy mb-4">Risk Assessment Across Regulated Sectors</h2>
          <p className="text-body text-text-secondary">Different institutions need different risk criteria. WorldAML's configurable matrix adapts to each.</p>
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

export default RAUseCasesSection;
