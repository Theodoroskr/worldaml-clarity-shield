import { useState } from "react";
import { cn } from "@/lib/utils";
import { FileText, Clock, CheckCircle2, AlertTriangle, ChevronRight, Search, Send, Plus, Download, Flag } from "lucide-react";

type CaseStatus = "Open" | "Under Investigation" | "SAR Filed" | "Closed";
type CasePriority = "Critical" | "High" | "Medium" | "Low";

interface CaseItem {
  id: string; subject: string; type: "SAR" | "STR" | "Internal"; status: CaseStatus;
  priority: CasePriority; assignee: string; created: string; alerts: number; amount: string; description: string;
}

const cases: CaseItem[] = [
  { id: "CSE-2341", subject: "John Cameron", type: "SAR", status: "Under Investigation", priority: "Critical", assignee: "T. Kringou", created: "06/04/2026", alerts: 3, amount: "€142,500", description: "PEP match + high-value transactions to high-risk jurisdictions" },
  { id: "CSE-2340", subject: "Investco Holdings Ltd.", type: "SAR", status: "SAR Filed", priority: "High", assignee: "M. Nicolaou", created: "04/04/2026", alerts: 2, amount: "€87,000", description: "Sanctions hit — OFAC SDN partial match" },
  { id: "CSE-2339", subject: "Elena Sotiriou", type: "STR", status: "Open", priority: "High", assignee: "A. Charalambous", created: "03/04/2026", alerts: 1, amount: "€39,800", description: "Structuring pattern detected — multiple sub-threshold deposits" },
  { id: "CSE-2338", subject: "Cameron Group", type: "Internal", status: "Under Investigation", priority: "Medium", assignee: "T. Kringou", created: "01/04/2026", alerts: 5, amount: "€310,000", description: "Adverse media cluster — 5 articles flagged" },
  { id: "CSE-2337", subject: "Stavros Antoniadis", type: "Internal", status: "Closed", priority: "Low", assignee: "T. Kringou", created: "28/03/2026", alerts: 1, amount: "€12,400", description: "Dormant account reactivation — cleared after review" },
];

const statusStyle: Record<CaseStatus, string> = {
  Open: "bg-blue-50 text-blue-700 border-blue-200",
  "Under Investigation": "bg-amber-50 text-amber-700 border-amber-200",
  "SAR Filed": "bg-purple-50 text-purple-700 border-purple-200",
  Closed: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const priorityStyle: Record<CasePriority, string> = {
  Critical: "bg-red-50 text-red-700 border-red-200",
  High: "bg-orange-50 text-orange-700 border-orange-200",
  Medium: "bg-amber-50 text-amber-700 border-amber-200",
  Low: "bg-slate-50 text-slate-600 border-slate-200",
};

export default function SuiteCases() {
  const [filter, setFilter] = useState<string>("All");
  const [search, setSearch] = useState("");

  const filtered = cases.filter(c =>
    (filter === "All" || c.status === filter) &&
    (!search || c.subject.toLowerCase().includes(search.toLowerCase()) || c.id.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-6 space-y-5 h-full overflow-y-auto">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold text-foreground">Case Management & SAR Filing</h1><p className="text-xs text-muted-foreground mt-0.5">Link alerts to investigations · Draft and file SARs/STRs</p></div>
        <button className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 font-medium"><Plus className="w-3.5 h-3.5" /> New Case</button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Open", value: cases.filter(c => c.status === "Open").length, color: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
          { label: "Under Investigation", value: cases.filter(c => c.status === "Under Investigation").length, color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
          { label: "SAR Filed", value: cases.filter(c => c.status === "SAR Filed").length, color: "text-purple-700", bg: "bg-purple-50 border-purple-200" },
          { label: "Closed", value: cases.filter(c => c.status === "Closed").length, color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
        ].map(s => (
          <div key={s.label} className={cn("rounded-xl border p-4", s.bg)}>
            <div className={cn("text-2xl font-bold font-mono", s.color)}>{s.value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <div className="relative"><Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search cases…" className="pl-7 py-1.5 text-xs rounded border border-border bg-background text-foreground w-48 focus:outline-none focus:ring-1 focus:ring-primary" /></div>
        <div className="flex gap-1">
          {["All", "Open", "Under Investigation", "SAR Filed", "Closed"].map(s => <button key={s} onClick={() => setFilter(s)} className={cn("text-xs px-2.5 py-1 rounded-full border font-medium transition-colors", filter === s ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground border-border hover:border-primary hover:text-primary")}>{s}</button>)}
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border bg-muted/30">
            {["Case ID", "Subject", "Type", "Priority", "Status", "Alerts", "Amount", "Assigned", "Date", ""].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">{h}</th>)}
          </tr></thead>
          <tbody className="divide-y divide-border">
            {filtered.map(c => (
              <tr key={c.id} className={cn("hover:bg-muted/20 transition-colors group", c.priority === "Critical" && "bg-red-50/20")}>
                <td className="px-4 py-3 font-mono text-xs font-bold text-primary">{c.id}</td>
                <td className="px-4 py-3">
                  <div className="font-semibold text-foreground text-sm">{c.subject}</div>
                  <div className="text-xs text-muted-foreground mt-0.5 truncate max-w-[200px]">{c.description}</div>
                </td>
                <td className="px-4 py-3 text-xs font-medium text-muted-foreground">{c.type}</td>
                <td className="px-4 py-3"><span className={cn("text-xs px-2 py-0.5 rounded border font-semibold", priorityStyle[c.priority])}>{c.priority}</span></td>
                <td className="px-4 py-3"><span className={cn("text-xs px-2 py-0.5 rounded border font-medium", statusStyle[c.status])}>{c.status}</span></td>
                <td className="px-4 py-3 font-mono text-xs font-bold text-foreground">{c.alerts}</td>
                <td className="px-4 py-3 font-mono text-xs font-bold text-foreground">{c.amount}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{c.assignee}</td>
                <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{c.created}</td>
                <td className="px-4 py-3"><button className="opacity-0 group-hover:opacity-100 text-xs text-primary hover:underline transition-opacity flex items-center gap-1">Open <ChevronRight className="w-3 h-3" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
