const steps = [
  {
    number: "01",
    title: "Create a session",
    description: "Your server creates a verification session and receives a secure session token.",
  },
  {
    number: "02",
    title: "User completes verification",
    description: "The user uploads documents and completes biometric checks via a hosted or embedded flow.",
  },
  {
    number: "03",
    title: "Receive the result",
    description: "WorldID returns a deterministic result: APPROVED, REJECTED, MANUAL_CHECK, or IN_PROGRESS. Results can be retrieved via API or webhooks.",
  },
];

const WorldIDHowItWorksSection = () => {
  return (
    <section className="section-padding bg-secondary">
      <div className="container-enterprise">
        <div className="text-center mb-12">
          <h2 className="text-navy mb-4">How WorldID works</h2>
          <p className="text-text-secondary max-w-2xl mx-auto">
            A straightforward, API-first verification flow.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="text-6xl font-bold text-teal/10 mb-4">{step.number}</div>
              <h3 className="text-xl font-semibold text-navy mb-3">{step.title}</h3>
              <p className="text-text-secondary">{step.description}</p>
              
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 right-0 w-8 h-0.5 bg-divider translate-x-4" />
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-10 p-4 bg-navy/5 rounded-lg border border-divider">
          <p className="text-sm text-text-secondary text-center">
            <span className="font-medium text-navy">Note:</span> Sessions flagged for MANUAL_CHECK can be routed to human review.
          </p>
        </div>
      </div>
    </section>
  );
};

export default WorldIDHowItWorksSection;
