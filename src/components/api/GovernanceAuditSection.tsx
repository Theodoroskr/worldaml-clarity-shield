import { Clock, FileText, Database, ClipboardList } from "lucide-react";

const auditFeatures = [
  {
    icon: Clock,
    title: "Timestamped Events",
    description: "Every screening event includes precise timestamps for regulatory records.",
  },
  {
    icon: FileText,
    title: "Request & Response Logs",
    description: "Full traceability of all API requests and responses for audit purposes.",
  },
  {
    icon: Database,
    title: "API Access Logs",
    description: "Comprehensive logging of API access and authentication events.",
  },
  {
    icon: ClipboardList,
    title: "Audit-Ready Records",
    description: "Structured records designed to support regulatory examinations.",
  },
];

export const GovernanceAuditSection = () => {
  return (
    <section className="section-padding bg-surface-subtle">
      <div className="container-enterprise">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 text-caption font-medium text-navy bg-navy/5 rounded-full">
              Governance & Audit
            </div>
            <h2 className="text-headline text-navy mb-4">
              Audit-Ready by Design
            </h2>
            <p className="text-body-lg text-text-secondary mb-8">
              WorldAML API maintains comprehensive audit trails for all screening 
              activities. Every request and response is logged with timestamps 
              and traceability data to support regulatory compliance and internal governance.
            </p>

            <div className="space-y-6">
              {auditFeatures.map((feature) => (
                <div key={feature.title} className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-md bg-navy/5 flex items-center justify-center">
                    <feature.icon className="w-5 h-5 text-navy" />
                  </div>
                  <div>
                    <h4 className="text-body font-semibold text-navy">{feature.title}</h4>
                    <p className="text-body-sm text-text-secondary">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-6 rounded-lg border border-divider bg-card">
              <h4 className="text-body font-semibold text-navy mb-4">Audit Log Entry Example</h4>
              <div className="bg-navy rounded-lg p-4 overflow-x-auto">
                <pre className="text-body-sm text-slate-light font-mono whitespace-pre">
{`{
  "event_id": "evt_abc123",
  "timestamp": "2024-01-15T14:30:22Z",
  "event_type": "screening_completed",
  "entity_id": "ent_xyz789",
  "request_hash": "sha256:...",
  "response_hash": "sha256:...",
  "user_id": "usr_123",
  "ip_address": "192.168.1.1"
}`}
                </pre>
              </div>
            </div>

            <div className="p-6 rounded-lg border border-divider bg-card">
              <h4 className="text-body font-semibold text-navy mb-3">Retention & Compliance</h4>
              <ul className="space-y-2">
                {[
                  "Configurable retention periods by data type",
                  "Export capabilities for regulatory requests",
                  "Immutable audit trail for screening events",
                  "Role-based access to audit data",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-body-sm text-text-secondary">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal" />
                    {item}
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

export default GovernanceAuditSection;
