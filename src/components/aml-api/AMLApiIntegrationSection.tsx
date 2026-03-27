import { CheckCircle } from "lucide-react";

const steps = [
  {
    step: "01",
    title: "Get API Credentials",
    description: "Sign up and receive sandbox API keys. Test in a risk-free environment before going live.",
  },
  {
    step: "02",
    title: "Integrate the Endpoint",
    description: "Send a POST request with entity data (name, DOB, country). Receive structured JSON results with match scores.",
  },
  {
    step: "03",
    title: "Configure Risk Rules",
    description: "Set match thresholds, choose data sources per jurisdiction, and define escalation workflows.",
  },
  {
    step: "04",
    title: "Go Live & Monitor",
    description: "Switch to production keys, enrol entities for ongoing monitoring, and receive real-time webhook alerts.",
  },
];

const integrationBenefits = [
  "RESTful JSON API — no SDK required",
  "Sandbox environment with test data",
  "99.9% uptime SLA",
  "Sub-200ms average response time",
  "Webhook support for async workflows",
  "Comprehensive API documentation on ReadMe",
];

export const AMLApiIntegrationSection = () => {
  return (
    <section className="section-padding bg-surface-subtle">
      <div className="container-enterprise">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 text-caption font-medium text-navy bg-navy/5 rounded-full">
              Integration
            </div>
            <h2 className="text-headline text-navy mb-4">Quick to Integrate, Built to Scale</h2>
            <p className="text-body-lg text-text-secondary mb-10">
              Go from first API call to production in days, not months. 
              WorldAML's AML API is designed for developer productivity.
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
              <h3 className="text-body font-semibold text-navy mb-6">Why Teams Choose WorldAML</h3>
              <ul className="space-y-4">
                {integrationBenefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-teal flex-shrink-0 mt-0.5" />
                    <span className="text-body-sm text-text-secondary">{benefit}</span>
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

export default AMLApiIntegrationSection;
