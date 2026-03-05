const steps = [
  {
    number: "01",
    title: "Ingest",
    description:
      "Transaction data flows in via real-time API or scheduled batch feed. Supports ISO 20022, MT103/MT202, and custom formats.",
    detail: "Payment data, account metadata, counterparty information",
  },
  {
    number: "02",
    title: "Evaluate",
    description:
      "Each transaction is scored against your configured rule engine — thresholds, typology patterns, and customer risk profiles.",
    detail: "Rule engine, ML scoring, typology library",
  },
  {
    number: "03",
    title: "Alert",
    description:
      "Transactions exceeding risk thresholds generate alerts routed to the appropriate compliance queue with context and evidence.",
    detail: "Alert triage, priority scoring, queue assignment",
  },
  {
    number: "04",
    title: "Resolve",
    description:
      "Analysts review, investigate, and either dismiss or escalate to SAR. All decisions are logged for full regulatory auditability.",
    detail: "Case management, SAR filing, audit trail",
  },
];

const TMHowItWorksSection = () => {
  return (
    <section className="section-padding bg-background">
      <div className="container-enterprise">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-teal font-semibold text-body-sm uppercase tracking-wider mb-3">How It Works</p>
          <h2 className="text-navy mb-4">From Transaction to Resolution in Four Steps</h2>
          <p className="text-body text-text-secondary">
            A closed-loop workflow that keeps your compliance team in control at every stage.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <div key={step.number} className="relative">
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-divider z-0 -translate-x-1/2" />
              )}
              <div className="relative z-10 bg-surface-subtle border border-divider rounded-xl p-6 h-full">
                <div className="text-4xl font-bold text-teal/20 mb-4 font-mono">{step.number}</div>
                <h3 className="text-navy text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-body-sm text-text-secondary mb-4">{step.description}</p>
                <div className="pt-4 border-t border-divider">
                  <p className="text-caption text-text-tertiary italic">{step.detail}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TMHowItWorksSection;
