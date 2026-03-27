import { Shield, UserCheck, AlertTriangle, Users, Building2, RefreshCw, Search, Bell } from "lucide-react";

const endpoints = [
  {
    icon: Shield,
    title: "Sanctions Screening",
    method: "POST",
    path: "/v1/aml/sanctions",
    description: "Check entities against OFAC, EU, UN, HMT, DFAT, and 200+ other global sanctions lists in real time.",
  },
  {
    icon: UserCheck,
    title: "PEP Screening",
    method: "POST",
    path: "/v1/aml/peps",
    description: "Identify Politically Exposed Persons across all tiers — heads of state, senior officials, and military leaders.",
  },
  {
    icon: Users,
    title: "RCA Detection",
    method: "POST",
    path: "/v1/aml/rca",
    description: "Map Relatives and Close Associates of PEPs to uncover indirect exposure in your customer base.",
  },
  {
    icon: AlertTriangle,
    title: "Adverse Media",
    method: "POST",
    path: "/v1/aml/media",
    description: "Screen against categorised adverse media sources covering financial crime, fraud, terrorism, and corruption.",
  },
  {
    icon: Building2,
    title: "Company Screening",
    method: "POST",
    path: "/v1/aml/company",
    description: "Screen corporate entities and identify beneficial owners, directors, and associated parties.",
  },
  {
    icon: Search,
    title: "Batch Screening",
    method: "POST",
    path: "/v1/aml/batch",
    description: "Submit bulk screening requests for portfolio-wide re-screening or large onboarding cohorts.",
  },
  {
    icon: RefreshCw,
    title: "Ongoing Monitoring",
    method: "PUT",
    path: "/v1/aml/monitor",
    description: "Enrol entities for continuous monitoring with automated change detection and alert delivery.",
  },
  {
    icon: Bell,
    title: "Webhooks & Alerts",
    method: "POST",
    path: "/v1/webhooks",
    description: "Receive real-time notifications when screening status changes, new matches surface, or lists update.",
  },
];

export const AMLApiEndpointsSection = () => {
  return (
    <section className="section-padding bg-background">
      <div className="container-enterprise">
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 text-caption font-medium text-navy bg-navy/5 rounded-full">
            Key Endpoints
          </div>
          <h2 className="text-headline text-navy mb-4">AML Screening Endpoints</h2>
          <p className="text-body-lg text-text-secondary">
            Every AML check — from individual sanctions lookups to batch portfolio 
            re-screening — is available through a consistent RESTful interface.
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

export default AMLApiEndpointsSection;
