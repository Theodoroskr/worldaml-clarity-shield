import { useState } from "react";
import { Search, Upload, Shield, X, Plus, ChevronDown, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

const sampleResults = [
  { id: "1", name: "John Timothy Cameron", confidence: 92, listType: "PEP Class 2", aliases: ["J.T. Cameron", "John T. Cameron"], countries: ["GR", "GB"], dob: "18/07/1975", position: "Member of Parliament — Greece" },
  { id: "2", name: "John H. Cameron", confidence: 54, listType: "OFAC SDN", aliases: ["J. Cameron"], countries: ["US", "RU"], dob: "ca. 1960", position: "Sanctioned entity — Financial Crime" },
  { id: "3", name: "Cameron, John Frederick", confidence: 31, listType: "EU Sanctions", aliases: [], countries: ["DE"], dob: "Unknown", position: "Former government official" },
];

const watchlist = [
  { id: "W-001", name: "Global Internal Blocklist", entries: 145, lastUpdated: "06/04/2026", status: "Active" },
  { id: "W-002", name: "High-Risk Jurisdictions", entries: 34, lastUpdated: "15/03/2026", status: "Active" },
  { id: "W-003", name: "Internal PEP Supplement", entries: 22, lastUpdated: "01/03/2026", status: "Draft" },
];

export default function SuiteScreening() {
  const [searchName, setSearchName] = useState("");
  const [searched, setSearched] = useState(false);
  const [expandedResult, setExpandedResult] = useState<string | null>(null);

  const runSearch = () => { if (searchName.trim()) setSearched(true); };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-foreground">AML Screening</h1><p className="text-sm text-muted-foreground mt-0.5">Search · Bulk Screen · Watchlist Management</p></div>
      </div>

      <div className="bg-card rounded-xl border border-border p-5">
        <h2 className="font-semibold text-foreground mb-4">Individual Search</h2>
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Full Name *</label>
            <input value={searchName} onChange={e => setSearchName(e.target.value)} onKeyDown={e => e.key === "Enter" && runSearch()} placeholder="e.g. John Cameron" className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <button onClick={runSearch} className="flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm">
            <Search className="w-4 h-4" />Search
          </button>
        </div>
        <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
          <span>Lists:</span>
          {["OFAC SDN", "EU Sanctions", "UN Consolidated", "PEP Class 1–4", "Adverse Media"].map(l => (
            <span key={l} className="px-2 py-0.5 bg-muted rounded-full border border-border">{l}</span>
          ))}
        </div>
      </div>

      {searched && (
        <div className="bg-card rounded-xl border border-border animate-fade-in">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div><h2 className="font-semibold text-foreground">Search Results</h2><p className="text-xs text-muted-foreground mt-0.5">{sampleResults.length} matches found for "{searchName}"</p></div>
            <button onClick={() => setSearched(false)} className="p-1 hover:bg-muted rounded"><X className="w-4 h-4 text-muted-foreground" /></button>
          </div>
          <div className="divide-y divide-border">
            {sampleResults.map((result) => (
              <div key={result.id} className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-semibold text-foreground">{result.name}</span>
                      <span className={cn("text-xs px-2 py-0.5 rounded border font-semibold",
                        result.listType.includes("PEP") ? "bg-purple-50 text-purple-700 border-purple-200" : "bg-red-50 text-red-700 border-red-200"
                      )}>{result.listType}</span>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground flex-wrap">
                      <span>DOB: {result.dob}</span><span>Countries: {result.countries.join(", ")}</span>
                      {result.aliases.length > 0 && <span>Aliases: {result.aliases.join(", ")}</span>}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{result.position}</div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-center">
                      <div className={cn("text-xl font-bold font-mono", result.confidence >= 70 ? "text-destructive" : result.confidence >= 40 ? "text-amber-600" : "text-emerald-600")}>{result.confidence}%</div>
                      <div className="text-xs text-muted-foreground">confidence</div>
                      <div className="w-16 h-1.5 rounded-full bg-muted mt-1 overflow-hidden">
                        <div className={cn("h-full rounded-full", result.confidence >= 70 ? "bg-destructive" : result.confidence >= 40 ? "bg-amber-400" : "bg-emerald-500")} style={{ width: `${result.confidence}%` }} />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <button className="text-xs px-3 py-1.5 bg-destructive/10 text-destructive border border-destructive/20 rounded-lg hover:bg-destructive/20 transition-colors font-medium">Escalate to Case</button>
                      <button className="text-xs px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors">Dismiss as FP</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-card rounded-xl border border-border">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div><h2 className="font-semibold text-foreground">Watchlist Management</h2><p className="text-xs text-muted-foreground mt-0.5">Internal blocklists and custom screening lists</p></div>
          <button className="flex items-center gap-1.5 text-sm px-3 py-1.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"><Plus className="w-3.5 h-3.5" />New Watchlist</button>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">ID</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Name</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Entries</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Last Updated</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Status</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {watchlist.map((wl) => (
              <tr key={wl.id} className="hover:bg-muted/20 transition-colors group">
                <td className="px-5 py-3 font-mono text-xs font-bold text-primary">{wl.id}</td>
                <td className="px-5 py-3 font-medium text-foreground">{wl.name}</td>
                <td className="px-5 py-3 font-mono text-foreground font-bold">{wl.entries}</td>
                <td className="px-5 py-3 text-muted-foreground text-xs font-mono">{wl.lastUpdated}</td>
                <td className="px-5 py-3">
                  <span className={cn("text-xs px-2 py-0.5 rounded-full border font-medium", wl.status === "Active" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-muted text-muted-foreground border-border")}>{wl.status}</span>
                </td>
                <td className="px-5 py-3"><button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-muted rounded transition-all"><MoreHorizontal className="w-3.5 h-3.5 text-muted-foreground" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
