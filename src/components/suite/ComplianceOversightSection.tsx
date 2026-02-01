import { LayoutDashboard, UserCog, ClipboardCheck, FileText } from "lucide-react";

const features = [
  {
    icon: LayoutDashboard,
    title: "Centralised Dashboard",
    description: "View customer and business risk across your entire portfolio.",
  },
  {
    icon: UserCog,
    title: "MLRO Oversight",
    description: "Designed for compliance officers and MLROs with role-based access.",
  },
  {
    icon: ClipboardCheck,
    title: "Audit Support",
    description: "Full audit trail and reporting for regulatory examinations.",
  },
  {
    icon: FileText,
    title: "Internal Governance",
    description: "Support for policies, procedures, and internal compliance governance.",
  },
];

export const ComplianceOversightSection = () => {
  return (
    <section className="section-padding bg-surface-subtle">
      <div className="container-enterprise">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 text-caption font-medium text-teal bg-teal/10 rounded-full">
            Governance & Oversight
          </div>
          <h2 className="text-headline text-navy mb-4">
            Compliance Oversight
          </h2>
          <p className="text-body-lg text-text-secondary">
            Maintain centralised visibility over customer and business risk. 
            WorldAML Suite is designed for MLRO oversight, audit readiness, 
            and internal compliance governance.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="p-6 rounded-lg border border-divider bg-card"
            >
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-md bg-teal/10 text-teal mb-4">
                <feature.icon className="w-5 h-5" />
              </div>
              <h3 className="text-body font-semibold text-navy mb-2">{feature.title}</h3>
              <p className="text-body-sm text-text-secondary">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ComplianceOversightSection;
