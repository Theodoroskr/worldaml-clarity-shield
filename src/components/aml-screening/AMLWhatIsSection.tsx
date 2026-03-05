const categories = [
  { label: "Sanctions", description: "OFAC, UN, EU, OFSI, and 50+ national watchlists — updated in real time" },
  { label: "PEP", description: "Politically Exposed Persons including domestic, foreign, and international PEPs" },
  { label: "Adverse Media", description: "Negative news from 10,000+ global sources across financial crime typologies" },
  { label: "Relatives & Close Associates", description: "RCAs of PEPs and sanctioned individuals — extending risk coverage beyond the subject" },
  { label: "SIE / SIP", description: "State-Owned Enterprises and State-Influenced Persons for enhanced due diligence triggers" },
  { label: "Ongoing Monitoring", description: "Continuous re-screening of your customer portfolio against updated lists — not just at onboarding" },
];

const AMLWhatIsSection = () => {
  return (
    <section className="section-padding bg-background">
      <div className="container-enterprise">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-teal font-semibold text-body-sm uppercase tracking-wider mb-3">What Is It</p>
          <h2 className="text-navy mb-4">Screening That Goes Beyond the Sanctions List</h2>
          <p className="text-body text-text-secondary">
            Effective AML screening covers six distinct risk categories. Screening only for sanctions
            leaves PEP exposure, adverse media signals, and close associates undetected.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((cat, i) => (
            <div key={cat.label} className="bg-surface-subtle border border-divider rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-navy text-white text-caption font-bold shrink-0">
                  {i + 1}
                </span>
                <h3 className="text-navy font-semibold">{cat.label}</h3>
              </div>
              <p className="text-body-sm text-text-secondary">{cat.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AMLWhatIsSection;
