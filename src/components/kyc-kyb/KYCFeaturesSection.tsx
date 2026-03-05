import { UserCheck, Building2, FileSearch, Network, Eye, RefreshCw } from "lucide-react";

const features = [
  {
    icon: UserCheck,
    title: "Individual Identity Verification",
    description: "Verify individual identity against national ID, passport, and utility documents. Apply liveness checks and document authenticity validation for remote onboarding.",
  },
  {
    icon: Building2,
    title: "Business Entity Search",
    description: "Search company registries across 200+ jurisdictions. Retrieve registration details, directors, shareholders, and filing history for KYB due diligence.",
  },
  {
    icon: Network,
    title: "UBO & Beneficial Ownership Mapping",
    description: "Identify and map Ultimate Beneficial Owners above the 25% threshold (or configurable lower thresholds). Visualise ownership chains for complex structures.",
  },
  {
    icon: FileSearch,
    title: "Sanctions, PEP & Adverse Media",
    description: "Screen individuals and entities against global sanctions lists, PEP databases, and adverse media sources at onboarding and on an ongoing basis.",
  },
  {
    icon: Eye,
    title: "Enhanced Due Diligence Workflow",
    description: "Trigger EDD workflows automatically for high-risk customers — PEPs, high-risk jurisdictions, and complex ownership structures — with case management and approval flows.",
  },
  {
    icon: RefreshCw,
    title: "Ongoing Monitoring & Re-screening",
    description: "Continuously re-screen your existing customer base as sanctions lists and PEP data are updated. Alert compliance teams to status changes without manual review.",
  },
];

const KYCFeaturesSection = () => {
  return (
    <section className="section-padding bg-surface-subtle">
      <div className="container-enterprise">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-teal font-semibold text-body-sm uppercase tracking-wider mb-3">Features</p>
          <h2 className="text-navy mb-4">One Workflow for Individual and Entity Due Diligence</h2>
          <p className="text-body text-text-secondary">
            Every step from identity submission to ongoing monitoring — in a single, auditable platform.
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

export default KYCFeaturesSection;
