import { useState } from "react";
import { cn } from "@/lib/utils";
import { Search, Download, Filter } from "lucide-react";
import { Timeline, TimelineEvent } from "@/components/ui/timeline";

const auditEvents: TimelineEvent[] = [
  { id: "1", timestamp: "06/04/2026 14:32", actor: "System", action: "AML screening completed for John Cameron", type: "screening", detail: "No new matches found" },
  { id: "2", timestamp: "06/04/2026 13:15", actor: "T. Kringou", action: "Case #CSE-2341 escalated to SAR", type: "case", detail: "STR filed — amount threshold exceeded" },
  { id: "3", timestamp: "06/04/2026 12:02", actor: "System", action: "New customer onboarded — PEP match detected", type: "screening", detail: "PEP Class 2 — manual review required", after: "Pending Review" },
  { id: "4", timestamp: "06/04/2026 11:45", actor: "Maria P.", action: "Document verified for customer 96685261", type: "document", detail: "Passport — extraction confirmed" },
  { id: "5", timestamp: "06/04/2026 10:30", actor: "T. Kringou", action: "Risk status updated for Cameron Group", type: "status", before: "Medium", after: "High" },
  { id: "6", timestamp: "06/04/2026 09:10", actor: "System", action: "Scheduled re-screening batch completed", type: "system", detail: "247 profiles re-screened, 3 new hits" },
  { id: "7", timestamp: "05/04/2026 17:55", actor: "Maria P.", action: "Case #CSE-2340 resolved", type: "case", detail: "False positive — dismissed" },
  { id: "8", timestamp: "05/04/2026 16:22", actor: "System", action: "Sanctions list OFAC updated", type: "system", detail: "44 new entries" },
  { id: "9", timestamp: "05/04/2026 14:10", actor: "A. Charalambous", action: "Alert ALT-0037 escalated", type: "case", detail: "Structuring pattern — multiple sub-threshold deposits" },
  { id: "10", timestamp: "05/04/2026 11:00", actor: "System", action: "Daily compliance digest generated", type: "system", detail: "Report available for download" },
  { id: "11", timestamp: "04/04/2026 15:30", actor: "T. Kringou", action: "Customer Investco Holdings — EDD initiated", type: "review", detail: "High-risk corporate entity — BVI registered" },
  { id: "12", timestamp: "04/04/2026 10:00", actor: "System", action: "WorldID verification session completed", type: "document", detail: "IDV-8291 — Biometric liveness passed" },
];

export default function SuiteAudit() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");

  const types = ["All", "screening", "case", "document", "status", "review", "system"];
  const filtered = auditEvents.filter(e =>
    (typeFilter === "All" || e.type === typeFilter) &&
    (!search || e.action.toLowerCase().includes(search.toLowerCase()) || e.actor.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-6 space-y-5 h-full overflow-y-auto">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold text-foreground">Audit Trail</h1><p className="text-xs text-muted-foreground mt-0.5">Complete chronological log of all compliance actions</p></div>
        <button className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted transition-colors font-medium text-foreground"><Download className="w-3.5 h-3.5" /> Export CSV</button>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative"><Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search audit log…" className="pl-7 py-1.5 text-xs rounded border border-border bg-background text-foreground w-60 focus:outline-none focus:ring-1 focus:ring-primary" /></div>
        <div className="flex gap-1">
          {types.map(t => <button key={t} onClick={() => setTypeFilter(t)} className={cn("text-xs px-2.5 py-1 rounded-full border font-medium transition-colors capitalize", typeFilter === t ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground border-border hover:border-primary hover:text-primary")}>{t}</button>)}
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-6">
        <Timeline events={filtered} />
        {filtered.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No audit events match your filters.</p>}
      </div>
    </div>
  );
}
