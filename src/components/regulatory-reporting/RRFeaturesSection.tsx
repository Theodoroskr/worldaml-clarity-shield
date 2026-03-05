import { Database, FileCheck, ShieldCheck, Bell, GitBranch, Archive } from "lucide-react";

const features = [
  {
    icon: Database,
    title: "Automated Data Collection",
    description:
      "Ingest account holder data, transaction records, and entity classification attributes from core banking, CRM, or via API. Eliminate manual spreadsheet aggregation.",
  },
  {
    icon: GitBranch,
    title: "Account Classification Engine",
    description:
      "Automatically classify accounts as Reportable, Non-Reportable, Undocumented, or Excluded under CRS and FATCA rules. Apply TIN validation and self-certification logic.",
  },
  {
    icon: FileCheck,
    title: "XML Schema Generation",
    description:
      "Generate OECD CRS XML, IRS FATCA IDES-compliant XML, and FINTRAC-formatted reports ready for submission. Schema validation runs before every export.",
  },
  {
    icon: Bell,
    title: "Deadline & Obligation Tracking",
    description:
      "Built-in reporting calendar with jurisdiction-specific deadlines for CRS, FATCA, and FINTRAC. Automated reminders prevent missed filing windows.",
  },
  {
    icon: ShieldCheck,
    title: "Pre-Submission Validation",
    description:
      "Rule-based validation checks for missing TINs, mismatched entity types, threshold breaches, and schema errors — before you file, not after.",
  },
  {
    icon: Archive,
    title: "Audit Trail & Record Retention",
    description:
      "Full immutable audit log of every report generated, validated, and submitted. Supports 7-year record retention requirements for regulatory inspection.",
  },
];

const RRFeaturesSection = () => {
  return (
    <section className="section-padding bg-surface-subtle">
      <div className="container-enterprise">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-teal font-semibold text-body-sm uppercase tracking-wider mb-3">Features</p>
          <h2 className="text-navy mb-4">End-to-End Reporting Automation</h2>
          <p className="text-body text-text-secondary">
            From data ingestion to authority submission, every step of the regulatory reporting 
            lifecycle is automated, validated, and auditable.
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

export default RRFeaturesSection;
