import { UserCheck, Building2, FileSearch, Users, ShieldCheck, GitBranch, Fingerprint, AlertTriangle } from "lucide-react";

const endpoints = [
  {
    icon: UserCheck,
    title: "Identity Verification",
    method: "POST",
    path: "/v1/kyc/verify",
    description: "Verify individual identity with document checks, liveness detection, and database cross-referencing.",
  },
  {
    icon: Building2,
    title: "Company Verification",
    method: "POST",
    path: "/v1/kyb/verify",
    description: "Verify corporate entities against company registries across 100+ jurisdictions.",
  },
  {
    icon: Users,
    title: "UBO Mapping",
    method: "POST",
    path: "/v1/kyb/ubo",
    description: "Identify and verify Ultimate Beneficial Owners through corporate structure traversal.",
  },
  {
    icon: FileSearch,
    title: "Document Verification",
    method: "POST",
    path: "/v1/kyc/documents",
    description: "Validate passports, national IDs, driver's licences, and proof-of-address documents.",
  },
  {
    icon: ShieldCheck,
    title: "AML Screening",
    method: "POST",
    path: "/v1/kyc/aml-check",
    description: "Integrated sanctions, PEP, and adverse media screening as part of the KYC/KYB flow.",
  },
  {
    icon: GitBranch,
    title: "Workflow Orchestration",
    method: "POST",
    path: "/v1/workflows",
    description: "Define multi-step verification workflows with conditional logic and parallel checks.",
  },
  {
    icon: Fingerprint,
    title: "Biometric Matching",
    method: "POST",
    path: "/v1/kyc/biometric",
    description: "Compare selfie photos against document photos for facial recognition verification.",
  },
  {
    icon: AlertTriangle,
    title: "EDD Triggers",
    method: "POST",
    path: "/v1/kyc/edd",
    description: "Automatically trigger Enhanced Due Diligence based on risk score thresholds or manual escalation.",
  },
];

export const KYCKYBApiEndpointsSection = () => {
  return (
    <section className="section-padding bg-background">
      <div className="container-enterprise">
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 text-caption font-medium text-navy bg-navy/5 rounded-full">
            Endpoints
          </div>
          <h2 className="text-headline text-navy mb-4">KYC & KYB API Endpoints</h2>
          <p className="text-body-lg text-text-secondary">
            From individual identity checks to full corporate structure analysis — 
            every verification step is available through a consistent API interface.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {endpoints.map((ep) => (
            <div key={ep.title} className="p-6 rounded-lg border border-divider bg-card">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-md bg-navy/5 text-navy mb-4">
                <ep.icon className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-mono font-bold text-teal bg-teal/10 px-1.5 py-0.5 rounded">
                  {ep.method}
                </span>
                <span className="text-xs font-mono text-text-secondary truncate">{ep.path}</span>
              </div>
              <h3 className="text-body font-semibold text-navy mb-2">{ep.title}</h3>
              <p className="text-body-sm text-text-secondary">{ep.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default KYCKYBApiEndpointsSection;
