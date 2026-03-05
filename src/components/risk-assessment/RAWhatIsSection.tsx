const RAWhatIsSection = () => {
  return (
    <section className="section-padding bg-background">
      <div className="container-enterprise">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <p className="text-teal font-semibold text-body-sm uppercase tracking-wider mb-3">What Is It</p>
            <h2 className="text-navy mb-6">The Risk-Based Approach, Automated</h2>
            <p className="text-body text-text-secondary mb-4">
              The FATF Risk-Based Approach (RBA) requires regulated institutions to assess and
              understand the ML/TF risks they face, and to apply controls proportionate to those
              risks. Customer Risk Assessment (CRA) is the mechanism by which institutions categorise
              individual customers — assigning Low, Medium, or High risk designations that drive
              due diligence intensity, monitoring frequency, and escalation thresholds.
            </p>
            <p className="text-body text-text-secondary mb-4">
              Manual risk scoring via spreadsheets is error-prone, inconsistent, and fails under
              regulatory scrutiny. WorldAML automates the risk matrix, applies weighted criteria
              uniformly across your portfolio, and creates an auditable record of every risk decision.
            </p>
            <p className="text-body text-text-secondary">
              Required under FATF R.1, EU AMLD Articles 8–9, FCA SYSC 6.3, and all major national
              AML/CFT frameworks.
            </p>
          </div>
          <div className="space-y-4">
            <div className="bg-surface-subtle border border-divider rounded-xl p-6">
              <h3 className="text-navy font-semibold mb-4">Risk Criteria Considered</h3>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                {[
                  "Customer type (individual / entity)",
                  "Country of residence / incorporation",
                  "Industry / business activity",
                  "Product or service used",
                  "PEP or RCA status",
                  "Source of wealth / funds",
                  "Transaction volume & patterns",
                  "Adverse media flags",
                  "Sanctions / watchlist matches",
                  "Ownership structure complexity",
                ].map((c) => (
                  <div key={c} className="flex items-start gap-2 text-body-sm text-text-secondary">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal shrink-0 mt-1.5" />
                    {c}
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { tier: "Low", color: "bg-teal/10 text-teal border-teal/20" },
                { tier: "Medium", color: "bg-navy/10 text-navy border-navy/20" },
                { tier: "High", color: "bg-destructive/10 text-destructive border-destructive/20" },
              ].map((t) => (
                <div key={t.tier} className={`rounded-lg border p-4 text-center ${t.color}`}>
                  <p className="text-lg font-black">{t.tier}</p>
                  <p className="text-caption font-medium mt-0.5">Risk Tier</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RAWhatIsSection;
