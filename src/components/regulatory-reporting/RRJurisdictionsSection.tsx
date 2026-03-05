const jurisdictions = [
  {
    regime: "CRS",
    scope: "100+ Participating Jurisdictions",
    authority: "OECD Global Forum",
    keyRequirements: [
      "Annual AEOI reporting to local competent authority",
      "Due diligence on pre-existing and new accounts",
      "TIN collection and validation",
      "Entity classification (Active NFE, Passive NFE, FI)",
      "OECD CRS XML schema v2.0+",
    ],
    filingWindow: "Typically Jan–June for prior year",
    penalty: "Varies by jurisdiction — up to 5% of unreported assets in some jurisdictions",
  },
  {
    regime: "FATCA",
    scope: "Global — all FFIs with US account holders",
    authority: "US IRS / Local Competent Authorities (IGA)",
    keyRequirements: [
      "W-8BEN-E / W-9 self-certification collection",
      "US person identification and due diligence",
      "IRS Form 8966 / IDES XML submission",
      "Model 1 IGA: report via local tax authority",
      "Model 2 IGA: report directly to IRS",
    ],
    filingWindow: "Annual — March 31 (IRS direct), varies for Model 1",
    penalty: "30% withholding on US-source payments for non-compliant FFIs",
  },
  {
    regime: "FINTRAC",
    scope: "Canada",
    authority: "FINTRAC (Financial Transactions & Reports Analysis Centre of Canada)",
    keyRequirements: [
      "Large Cash Transaction Reports (LCTR) — CAD 10,000+",
      "Electronic Funds Transfer Reports (EFTR) — CAD 10,000+",
      "Suspicious Transaction Reports (STR) — no threshold",
      "Casino Disbursement Reports",
      "Third-party determination records",
    ],
    filingWindow: "LCTR/EFTR: within 15 days · STR: within 30 days",
    penalty: "Up to CAD 500,000 per violation; criminal liability for willful non-compliance",
  },
];

const RRJurisdictionsSection = () => {
  return (
    <section className="section-padding bg-background">
      <div className="container-enterprise">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-teal font-semibold text-body-sm uppercase tracking-wider mb-3">Jurisdictions</p>
          <h2 className="text-navy mb-4">Regulatory Coverage by Regime</h2>
          <p className="text-body text-text-secondary">
            Each regime has distinct filing windows, schemas, and authority structures. 
            WorldAML handles the complexity so your team doesn't have to.
          </p>
        </div>
        <div className="grid lg:grid-cols-3 gap-8">
          {jurisdictions.map((j) => (
            <div key={j.regime} className="bg-surface-subtle border border-divider rounded-xl overflow-hidden">
              <div className="bg-navy px-6 py-5">
                <span className="text-3xl font-black text-white tracking-tight">{j.regime}</span>
                <p className="text-white/70 text-body-sm mt-1">{j.scope}</p>
              </div>
              <div className="p-6 space-y-5">
                <div>
                  <p className="text-caption font-bold text-text-tertiary uppercase tracking-wider mb-2">Authority</p>
                  <p className="text-body-sm text-navy font-medium">{j.authority}</p>
                </div>
                <div>
                  <p className="text-caption font-bold text-text-tertiary uppercase tracking-wider mb-2">Key Requirements</p>
                  <ul className="space-y-1.5">
                    {j.keyRequirements.map((req) => (
                      <li key={req} className="flex items-start gap-2 text-body-sm text-text-secondary">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal shrink-0 mt-1.5" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="pt-4 border-t border-divider space-y-3">
                  <div>
                    <p className="text-caption font-bold text-text-tertiary uppercase tracking-wider mb-1">Filing Window</p>
                    <p className="text-body-sm text-text-secondary">{j.filingWindow}</p>
                  </div>
                  <div>
                    <p className="text-caption font-bold text-text-tertiary uppercase tracking-wider mb-1">Non-Compliance Risk</p>
                    <p className="text-body-sm text-amber-700">{j.penalty}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RRJurisdictionsSection;
