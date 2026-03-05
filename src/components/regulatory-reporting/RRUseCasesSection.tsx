import { Building2, LineChart, Bitcoin } from "lucide-react";

const useCases = [
  {
    icon: Building2,
    sector: "Banks & Financial Institutions",
    challenge:
      "Large retail and commercial banks hold accounts for thousands of non-resident customers, requiring accurate CRS and FATCA classification across multiple jurisdictions and product lines.",
    solution:
      "WorldAML's classification engine handles multi-jurisdiction account portfolios, applies IGA Model 1/2 logic, generates OECD CRS XML, and manages FATCA GIIN registration linkage.",
    metrics: ["CRS XML v2.0 generation", "FATCA IDES-ready output", "IGA Model 1 & 2 support"],
  },
  {
    icon: LineChart,
    sector: "Wealth Managers & Private Banks",
    challenge:
      "High-net-worth client portfolios often involve complex structures — trusts, foundations, and holding companies — requiring nuanced entity classification and controlling person identification.",
    solution:
      "Passive NFE and Controlling Person logic built into the classification engine. Automated requests for self-certifications from trustees, settlors, and beneficial owners with CRS due diligence workflows.",
    metrics: ["Controlling person identification", "Trust & foundation logic", "Self-cert workflow automation"],
  },
  {
    icon: Bitcoin,
    sector: "Crypto & Virtual Asset Service Providers",
    challenge:
      "VASPs operating in CRS-adopting jurisdictions face growing AEOI obligations as crypto assets are brought into scope. FATCA obligations apply to US-person account holders on centralised exchanges.",
    solution:
      "VASP-adapted account classification with crypto asset valuation support, US person identification across CEX accounts, and OECD Crypto-Asset Reporting Framework (CARF) readiness.",
    metrics: ["CARF-ready architecture", "FATCA for CEX accounts", "OECD crypto asset scope"],
  },
];

const RRUseCasesSection = () => {
  return (
    <section className="section-padding bg-background">
      <div className="container-enterprise">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-teal font-semibold text-body-sm uppercase tracking-wider mb-3">Use Cases</p>
          <h2 className="text-navy mb-4">Regulatory Reporting Across Financial Sectors</h2>
          <p className="text-body text-text-secondary">
            Each sector faces distinct CRS, FATCA, and FINTRAC reporting challenges. WorldAML adapts to each.
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

export default RRUseCasesSection;
