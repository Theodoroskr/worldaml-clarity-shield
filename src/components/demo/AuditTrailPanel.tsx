import { Clock, FileSearch, UserCheck, AlertCircle, CalendarClock, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const auditEntries = [
  {
    timestamp: "2024-01-15 14:32:08 UTC",
    action: "Initial screening performed",
    details: "Automated screening against all watchlists completed",
    icon: FileSearch,
    status: "info",
  },
  {
    timestamp: "2024-01-15 14:32:09 UTC",
    action: "PEP match detected",
    details: "Tier 2 PEP association identified - Family member of PEP",
    icon: AlertCircle,
    status: "warning",
  },
  {
    timestamp: "2024-01-15 14:35:22 UTC",
    action: "Manual review assigned",
    details: "Case assigned to Compliance Officer: J. Williams",
    icon: UserCheck,
    status: "info",
  },
  {
    timestamp: "2024-01-15 15:12:47 UTC",
    action: "Decision: Approved with conditions",
    details: "Enhanced monitoring applied. Quarterly review scheduled.",
    icon: CheckCircle2,
    status: "success",
  },
  {
    timestamp: "2024-04-15",
    action: "Next scheduled review",
    details: "Automated re-screening and manual review due",
    icon: CalendarClock,
    status: "pending",
  },
];

const getStatusStyles = (status: string) => {
  switch (status) {
    case "warning":
      return "bg-amber-100 text-amber-600 border-amber-200";
    case "success":
      return "bg-emerald-100 text-emerald-600 border-emerald-200";
    case "pending":
      return "bg-slate-100 text-text-secondary border-divider";
    default:
      return "bg-surface-subtle text-text-secondary border-divider";
  }
};

export const AuditTrailPanel = () => {
  return (
    <section className="section-padding bg-surface-subtle">
      <div className="container-enterprise">
        <div className="mb-8">
          <h2 className="text-headline mb-2">Audit Trail & Explainability</h2>
          <p className="text-body text-text-secondary">
            Complete timestamped history of screening events, decisions, and scheduled reviews.
          </p>
        </div>

        <Card className="border border-divider shadow-none max-w-3xl">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-surface-subtle">
                <Clock className="h-5 w-5 text-text-secondary" />
              </div>
              <div>
                <CardTitle className="text-title">Screening Timeline</CardTitle>
                <p className="text-body-sm text-text-secondary">Entity: John Michael Smith (SCR-2024-00847)</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-5 top-0 bottom-0 w-px bg-divider" />

              <div className="space-y-6">
                {auditEntries.map((entry, index) => (
                  <div key={index} className="relative flex gap-4">
                    {/* Icon */}
                    <div className={`relative z-10 p-2 rounded-lg border ${getStatusStyles(entry.status)}`}>
                      <entry.icon className="h-4 w-4" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 pb-6">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-body-sm font-medium">{entry.action}</p>
                          <p className="text-body-sm text-text-secondary mt-1">{entry.details}</p>
                        </div>
                        <time className="text-caption text-text-tertiary whitespace-nowrap font-mono">
                          {entry.timestamp}
                        </time>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Explainability Note */}
            <div className="mt-6 p-4 bg-accent/5 border border-accent/20 rounded-lg">
              <p className="text-body-sm font-medium text-accent mb-2">Decision Rationale</p>
              <p className="text-body-sm text-text-secondary">
                Approval granted based on: (1) No active sanctions matches, (2) PEP association is indirect 
                (Tier 2 - spouse of former government official), (3) Adverse media relates to historical 
                business activities with no current legal proceedings. Enhanced monitoring applied as a 
                precautionary measure per internal risk policy.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default AuditTrailPanel;
