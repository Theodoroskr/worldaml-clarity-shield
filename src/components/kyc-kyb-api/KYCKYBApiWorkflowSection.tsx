import { CheckCircle } from "lucide-react";

const steps = [
  {
    step: "01",
    title: "Submit Verification Request",
    description: "Send customer or company data to the appropriate KYC or KYB endpoint with the checks you need.",
  },
  {
    step: "02",
    title: "Orchestrate Checks",
    description: "WorldAML routes the request to the relevant data sources — registries, ID verification providers, AML databases.",
  },
  {
    step: "03",
    title: "Receive Structured Results",
    description: "Get a unified JSON response with verification status, risk scores, matched records, and audit metadata.",
  },
  {
    step: "04",
    title: "Act on Risk Decisions",
    description: "Approve, reject, or escalate based on configurable rules. Trigger EDD workflows for high-risk entities automatically.",
  },
];

const workflowFeatures = [
  "Conditional step execution based on risk tier",
  "Parallel check processing for faster turnaround",
  "Customisable approval/rejection thresholds",
  "Webhook notifications at each workflow stage",
  "Full audit trail for every verification decision",
  "Re-verification scheduling based on risk policy",
];

export const KYCKYBApiWorkflowSection = () => {
  return (
    <section className="section-padding bg-surface-subtle">
      <div className="container-enterprise">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 text-caption font-medium text-navy bg-navy/5 rounded-full">
              Workflow
            </div>
            <h2 className="text-headline text-navy mb-4">Orchestrate Verification Workflows</h2>
            <p className="text-body-lg text-text-secondary mb-10">
              Define multi-step KYC and KYB workflows that adapt to your risk policy. 
              Run checks in parallel, apply conditional logic, and automate escalation 
              — all through the API.
            </p>

            <div className="space-y-8">
              {steps.map((s) => (
                <div key={s.step} className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-navy text-white flex items-center justify-center text-caption font-bold">
                    {s.step}
                  </div>
                  <div>
                    <h3 className="text-body font-semibold text-navy mb-1">{s.title}</h3>
                    <p className="text-body-sm text-text-secondary">{s.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center">
            <div className="w-full p-8 rounded-xl border border-divider bg-card">
              <h3 className="text-body font-semibold text-navy mb-6">Workflow Capabilities</h3>
              <ul className="space-y-4">
                {workflowFeatures.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-teal flex-shrink-0 mt-0.5" />
                    <span className="text-body-sm text-text-secondary">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default KYCKYBApiWorkflowSection;
