import { Building2, CreditCard, Gamepad2 } from "lucide-react";

const useCases = [
  {
    icon: Building2,
    sector: "Banks & Financial Institutions",
    challenge: "High-volume retail and commercial onboarding demands fast, consistent CDD across both individual and business customers — with EDD for PEPs and high-risk entities.",
    solution: "Automated KYC/KYB workflows with per-segment risk thresholds. UBO mapping for corporate structures and integrated EDD escalation for regulatory examiner readiness.",
    metrics: ["CDD & EDD workflows", "UBO mapping built-in", "AMLD & FATF R.10 aligned"],
  },
  {
    icon: CreditCard,
    sector: "Payment Processors & EMIs",
    challenge: "E-money institutions must onboard merchants and end-users at scale while applying proportionate CDD. Business onboarding requires rapid entity verification without sacrificing compliance.",
    solution: "API-first KYB for merchant onboarding with configurable CDD depth by merchant risk category. Real-time registry lookups and sanctions screening reduce manual processing.",
    metrics: ["Merchant KYB via API", "Risk-tiered CDD", "PSD2 / EMD2 aligned"],
  },
  {
    icon: Gamepad2,
    sector: "iGaming & Online Gambling",
    challenge: "MGA and UKGC-licensed operators must apply CDD at player registration and Source of Funds checks for high-value players. UBO verification required for corporate account holders.",
    solution: "Player KYC with document verification and PEP/sanctions screening at registration. Corporate player KYB with UBO mapping for B2B operator relationships.",
    metrics: ["MGA & UKGC aligned", "Player CDD at registration", "Source of funds triggers"],
  },
];

const KYCUseCasesSection = () => {
  return (
    <section className="section-padding bg-background">
      <div className="container-enterprise">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-teal font-semibold text-body-sm uppercase tracking-wider mb-3">Use Cases</p>
          <h2 className="text-navy mb-4">KYC & KYB Across Regulated Sectors</h2>
          <p className="text-body text-text-secondary">Every regulated sector has distinct onboarding requirements. WorldAML adapts to each.</p>
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

export default KYCUseCasesSection;
