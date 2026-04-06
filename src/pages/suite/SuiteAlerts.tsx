import { useState } from "react";
import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle, Clock, ChevronRight, Search } from "lucide-react";

type AlertStatus = "Open" | "In Review" | "Escalated" | "Closed";
type AlertSeverity = "Critical" | "High" | "Medium" | "Low";

interface Alert {
  id: string; customer: string; type: string; severity: AlertSeverity;
  status: AlertStatus; assignedTo: string; created: string; description: string;
}

const alerts: Alert[] = [
  { id: "ALT-0041", customer: "John Cameron", type: "PEP Match", severity: "Critical", status: "Open", assignedTo: "T. Kringou", created: "06/04/2026", description: "PEP Class 2 match detected — confidence 92%" },
  { id: "ALT-0040", customer: "Investco Holdings Ltd.", type: "Sanctions Hit", severity: "Critical", status: "In Review", assignedTo: "M. Nicolaou", created: "05/04/2026", description: "OFAC SDN match — partial name match 78%" },
  { id: "ALT-0039", customer: "Nikos Papadimitriou", type: "High-Value TXN", severity: "High", status: "Open", assignedTo: "Unassigned", created: "05/04/2026", description: "Wire transfer €47,200 to high-risk jurisdiction (PA)" },
  { id: "ALT-0038", customer: "Cameron Group", type: "Adverse Media", severity: "Medium", status: "In Review", assignedTo: "T. Kringou", created: "04/04/2026", description: "5 new adverse media articles detected" },
  { id: "ALT-0037", customer: "Elena Sotiriou", type: "Structuring", severity: "High", status: "Escalated", assignedTo: "A. Charalambous", created: "03/04/2026", description: "Multiple deposits under €10,000 threshold in 72h" },
  { id: "ALT-0036", customer: "Rania Khalil", type: "Expired KYC", severity: "Low", status: "Closed", assignedTo: "T. Kringou", created: "02/04/2026", description: "KYC documentation expired — renewal requested" },
  { id: "ALT-0035", customer: "Stavros Antoniadis", type: "Unusual Activity", severity: "Medium", status: "Open", assignedTo: "Unassigned", created: "01/04/2026", description: "Transaction pattern anomaly — dormant account reactivated" },
];

const severityStyle: Record<AlertSeverity, string> = {
  Critical: "bg-red-50 text-red-700 border-red-200",
  High: "bg-orange-50 text-orange-700 border-orange-200",
  Medium: "bg-amber-50 text-amber-700 border-amber-200",
  Low: "bg-slate-50 text-slate-600 border-slate-200",
};

const statusStyle: Record<AlertStatus, string> = {
  Open: "bg-blue-50 text-blue-700 border-blue-200",
  "In Review": "bg-amber-50 text-amber-700 border-amber-200",
  Escalated: "bg-red-50 text-red-700 border-red-200",
  Closed: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const statusIcon: Record<AlertStatus, React.ElementType> = {
  Open: AlertTriangle,
  "In Review": Clock,
  Escalated: AlertTriangle,
  Closed: CheckCircle,
};

export default function SuiteAlerts() {
  const [filter, setFilter] = useState<string>("All");
  const [search, setSearch] = useState("");

  const filtered = alerts.filter(a =>
    (filter === "All" || a.status === filter) &&
    (!search || a.customer.toLowerCase().includes(search.toLowerCase()) || a.id.toLowerCase().includes(search.toLowerCase()))
  );

  const stats = {
    open: alerts.filter(a => a.status === "Open").length,
    review: alerts.filter(a => a.status === "In Review").length,
    escalated: alerts.filter(a => a.status === "Escalated").length,
    closed: alerts.filter(a => a.status === "Closed").length,
  };

  return (
    <div className="p-6 space-y-5 h-full overflow-y-auto">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold text-foreground">Alert Management</h1><p className="text-xs text-muted-foreground mt-0.5">Review, assign, and resolve compliance alerts</p></div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Open", value: stats.open, color: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
          { label: "In Review", value: stats.review, color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
          { label: "Escalated", value: stats.escalated, color: "text-destructive", bg: "bg-destructive/5 border-destructive/20" },
          { label: "Closed", value: stats.closed, color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
        ].map(s => (
          <div key={s.label} className={cn("rounded-xl border p-4", s.bg)}>
            <div className={cn("text-2xl font-bold font-mono", s.color)}>{s.value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <div className="relative"><Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search alerts…" className="pl-7 py-1.5 text-xs rounded border border-border bg-background text-foreground w-48 focus:outline-none focus:ring-1 focus:ring-primary" /></div>
        <div className="flex gap-1">
          {["All", "Open", "In Review", "Escalated", "Closed"].map(s => <button key={s} onClick={() => setFilter(s)} className={cn("text-xs px-2.5 py-1 rounded-full border font-medium transition-colors", filter === s ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground border-border hover:border-primary hover:text-primary")}>{s}</button>)}
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border bg-muted/30">
            {["Alert ID", "Customer", "Type", "Severity", "Status", "Assigned", "Date", ""].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">{h}</th>)}
          </tr></thead>
          <tbody className="divide-y divide-border">
            {filtered.map(a => {
              const StatusIcon = statusIcon[a.status];
              return (
                <tr key={a.id} className={cn("hover:bg-muted/20 transition-colors group", a.severity === "Critical" && "bg-red-50/20")}>
                  <td className="px-4 py-3 font-mono text-xs font-bold text-primary">{a.id}</td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-foreground text-sm">{a.customer}</div>
                    <div className="text-xs text-muted-foreground mt-0.5 truncate max-w-[200px]">{a.description}</div>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{a.type}</td>
                  <td className="px-4 py-3"><span className={cn("text-xs px-2 py-0.5 rounded border font-semibold", severityStyle[a.severity])}>{a.severity}</span></td>
                  <td className="px-4 py-3">
                    <span className={cn("text-xs px-2 py-0.5 rounded border font-medium inline-flex items-center gap-1", statusStyle[a.status])}>
                      <StatusIcon className="w-3 h-3" />{a.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{a.assignedTo}</td>
                  <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{a.created}</td>
                  <td className="px-4 py-3"><button className="opacity-0 group-hover:opacity-100 text-xs text-primary hover:underline transition-opacity flex items-center gap-1">Review <ChevronRight className="w-3 h-3" /></button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
