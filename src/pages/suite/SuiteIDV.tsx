import { useState } from "react";
import { cn } from "@/lib/utils";
import { Plus, Search, ChevronRight, Fingerprint, Camera, Smartphone, UserCheck } from "lucide-react";

const sessions = [
  { id: "IDV-8291", customer: "Yianna Papadakis", code: "96509131", method: "Biometric + Liveness", status: "Verified", score: 98, date: "06/04/2026", time: "14:12", device: "Mobile iOS" },
  { id: "IDV-8290", customer: "Marcus Thielen", code: "96509132", method: "Document OCR", status: "Manual Review", score: 74, date: "06/04/2026", time: "13:55", device: "Desktop Chrome" },
  { id: "IDV-8289", customer: "Elena Sotiriou", code: "96509133", method: "Biometric + Liveness", status: "Failed", score: 41, date: "05/04/2026", time: "11:30", device: "Mobile Android" },
  { id: "IDV-8288", customer: "George Vassiliou", code: "96509134", method: "Document OCR", status: "Verified", score: 95, date: "05/04/2026", time: "10:18", device: "Mobile iOS" },
  { id: "IDV-8287", customer: "Nadia Bergmann", code: "96509135", method: "Biometric + Liveness", status: "Manual Review", score: 68, date: "04/04/2026", time: "16:44", device: "Desktop Safari" },
  { id: "IDV-8286", customer: "Kostas Andreou", code: "96509136", method: "Video KYC", status: "Verified", score: 92, date: "04/04/2026", time: "15:20", device: "Video Call" },
  { id: "IDV-8285", customer: "Sofia Demetriou", code: "96509137", method: "Document OCR", status: "Verified", score: 88, date: "03/04/2026", time: "14:05", device: "Mobile iOS" },
];

const statusStyle: Record<string, string> = {
  Verified: "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Manual Review": "bg-amber-50 text-amber-700 border-amber-200",
  Failed: "bg-red-50 text-red-700 border-red-200",
};

const methodIcon: Record<string, React.ElementType> = {
  "Biometric + Liveness": Fingerprint,
  "Document OCR": Camera,
  "Video KYC": Smartphone,
};

export default function SuiteIDV() {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const filtered = sessions.filter(s => (filter === "All" || s.status === filter) && (!search || s.customer.toLowerCase().includes(search.toLowerCase())));

  const stats = {
    verified: sessions.filter(s => s.status === "Verified").length,
    review: sessions.filter(s => s.status === "Manual Review").length,
    failed: sessions.filter(s => s.status === "Failed").length,
    total: sessions.length,
  };

  return (
    <div className="p-6 space-y-5 h-full overflow-y-auto">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold text-foreground">Identity Verification</h1><p className="text-xs text-muted-foreground mt-0.5">Biometric · Document OCR · Video KYC</p></div>
        <button className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 font-medium"><Plus className="w-3.5 h-3.5" /> New Session</button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Verified", value: stats.verified, color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
          { label: "Manual Review", value: stats.review, color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
          { label: "Failed", value: stats.failed, color: "text-destructive", bg: "bg-destructive/5 border-destructive/20" },
          { label: "Total Sessions", value: stats.total, color: "text-primary", bg: "bg-primary/5 border-primary/20" },
        ].map(s => (
          <div key={s.label} className={cn("rounded-xl border p-4", s.bg)}>
            <div className={cn("text-2xl font-bold font-mono", s.color)}>{s.value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <div className="relative"><Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search sessions…" className="pl-7 py-1.5 text-xs rounded border border-border bg-background text-foreground w-48 focus:outline-none focus:ring-1 focus:ring-primary" /></div>
        <div className="flex gap-1">
          {["All", "Verified", "Manual Review", "Failed"].map(s => <button key={s} onClick={() => setFilter(s)} className={cn("text-xs px-2.5 py-1 rounded-full border font-medium transition-colors", filter === s ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground border-border hover:border-primary hover:text-primary")}>{s}</button>)}
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border bg-muted/30">
            {["Session ID", "Customer", "Method", "Score", "Device", "Date/Time", "Status", ""].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">{h}</th>)}
          </tr></thead>
          <tbody className="divide-y divide-border">
            {filtered.map(s => {
              const MethodIcon = methodIcon[s.method] ?? UserCheck;
              return (
                <tr key={s.id} className="hover:bg-muted/20 transition-colors group">
                  <td className="px-4 py-3 font-mono text-xs font-bold text-primary">{s.id}</td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-foreground text-sm">{s.customer}</div>
                    <div className="text-xs text-muted-foreground font-mono">{s.code}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><MethodIcon className="w-3.5 h-3.5" />{s.method}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-1.5 rounded-full bg-muted overflow-hidden"><div className={cn("h-full rounded-full", s.score >= 80 ? "bg-emerald-500" : s.score >= 60 ? "bg-amber-400" : "bg-destructive")} style={{ width: `${s.score}%` }} /></div>
                      <span className={cn("text-xs font-mono font-bold", s.score >= 80 ? "text-emerald-600" : s.score >= 60 ? "text-amber-600" : "text-destructive")}>{s.score}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{s.device}</td>
                  <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{s.date} {s.time}</td>
                  <td className="px-4 py-3"><span className={cn("text-xs px-2 py-0.5 rounded border font-medium", statusStyle[s.status])}>{s.status}</span></td>
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
