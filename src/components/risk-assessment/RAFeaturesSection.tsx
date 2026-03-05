import { SlidersHorizontal, Calculator, Layers, RefreshCw, FileCheck, Archive } from "lucide-react";

const features = [
  {
    icon: SlidersHorizontal,
    title: "Configurable Risk Matrix",
    description: "Define your own risk criteria, weighting factors, and threshold bands. Configure Low / Medium / High tiers to match your institution's specific risk appetite and regulatory environment.",
  },
  {
    icon: Calculator,
    title: "Automated Risk Scoring",
    description: "Apply weighted scoring automatically at onboarding and on trigger events. Eliminate inconsistent manual scoring and ensure uniform application of your risk methodology.",
  },
  {
    icon: Layers,
    title: "Customer Risk Tiers",
    description: "Segment your customer base into risk tiers that drive downstream controls — CDD intensity, transaction monitoring thresholds, review frequency, and EDD escalation.",
  },
  {
    icon: RefreshCw,
    title: "Dynamic Re-assessment",
    description: "Automatically re-score customers when trigger events occur — new PEP match, sanctions hit, adverse media flag, unusual transaction pattern, or periodic review cycle.",
  },
  {
    icon: FileCheck,
    title: "Regulatory Alignment",
    description: "Built to satisfy FATF RBA requirements, EU AMLD Articles 8–9, FCA SYSC 6.3, and CySEC AML/CFT obligations — with jurisdiction-specific parameter sets available.",
  },
  {
    icon: Archive,
    title: "Decision Audit Trail",
    description: "Every risk score, scoring rationale, and reviewer decision is captured in an immutable audit log. Demonstrate your risk-based approach to regulators and internal audit.",
  },
];

const RAFeaturesSection = () => {
  return (
    <section className="section-padding bg-surface-subtle">
      <div className="container-enterprise">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-teal font-semibold text-body-sm uppercase tracking-wider mb-3">Features</p>
          <h2 className="text-navy mb-4">A Risk Framework Your Regulators Will Approve</h2>
          <p className="text-body text-text-secondary">
            Configurable, consistent, and fully auditable — from initial risk score to periodic review.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat) => (
            <div key={feat.title} className="bg-background border border-divider rounded-xl p-6">
              <div className="inline-flex items-center justify-center w-11 h-11 rounded-lg bg-navy/5 text-navy mb-5">
                <feat.icon className="w-5 h-5" />
              </div>
              <h3 className="text-navy font-semibold text-lg mb-2">{feat.title}</h3>
              <p className="text-body-sm text-text-secondary">{feat.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RAFeaturesSection;
