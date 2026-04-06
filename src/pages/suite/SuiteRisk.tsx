import { useState } from "react";
import { cn } from "@/lib/utils";
import { BarChart3, TrendingUp, TrendingDown, AlertTriangle, ChevronRight, Search, SlidersHorizontal } from "lucide-react";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

const customers = [
  { id: "96273547", name: "John Cameron", risk: 87, pep: "Class 2", jurisdiction: "CY/GR", transactions: 142, adverse: true, kyc: "EDD Required", change: +12, segment: "HNW" },
  { id: "96790142", name: "Nikos Papadimitriou", risk: 64, pep: "None", jurisdiction: "CY", transactions: 89, adverse: false, kyc: "Verified", change: +5, segment: "Corporate" },
  { id: "99118508", name: "Michael Stavros", risk: 71, pep: "None", jurisdiction: "CY/UK", transactions: 210, adverse: true, kyc: "EDD Required", change: +8, segment: "HNW" },
  { id: "97807621", name: "Robert Mueller", risk: 55, pep: "None", jurisdiction: "DE", transactions: 67, adverse: true, kyc: "Verified", change: -3, segment: "Retail" },
  { id: "96685261", name: "Cameron Andrews", risk: 48, pep: "Class 1", jurisdiction: "GB", transactions: 33, adverse: false, kyc: "Verified", change: 0, segment: "HNW" },
  { id: "96503465", name: "Dimitris Konstantinou", risk: 79, pep: "None", jurisdiction: "GR", transactions: 178, adverse: false, kyc: "Pending", change: +15, segment: "Corporate" },
  { id: "96209874", name: "Anna Kyriakou", risk: 43, pep: "None", jurisdiction: "CY", transactions: 55, adverse: false, kyc: "Verified", change: -2, segment: "Retail" },
  { id: "96790300", name: "Sofia Andreou", risk: 52, pep: "Class 3", jurisdiction: "CY", transactions: 91, adverse: false, kyc: "In Review", change: +4, segment: "Retail" },
];

const riskDrivers = [
  { label: "PEP Exposure", score: 80 }, { label: "Jurisdiction Risk", score: 70 },
  { label: "Transaction Behaviour", score: 65 }, { label: "Adverse Media", score: 55 },
  { label: "KYC Status", score: 90 }, { label: "Account Age", score: 30 },
];

const distributionData = [
  { range: "0-20", count: 2340 }, { range: "21-40", count: 4120 }, { range: "41-60", count: 2870 },
  { range: "61-80", count: 1290 }, { range: "81-100", count: 738 },
];

const riskColor = (r: number) => r >= 75 ? "text-destructive" : r >= 55 ? "text-amber-600" : r >= 35 ? "text-foreground" : "text-emerald-600";
const riskBg = (r: number) => r >= 75 ? "bg-destructive" : r >= 55 ? "bg-amber-400" : r >= 35 ? "bg-primary" : "bg-emerald-500";
const riskBadge = (r: number) => r >= 75 ? "bg-red-50 text-red-700 border-red-200" : r >= 55 ? "bg-amber-50 text-amber-700 border-amber-200" : r >= 35 ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-emerald-50 text-emerald-700 border-emerald-200";
const riskLabel = (r: number) => r >= 75 ? "High" : r >= 55 ? "Medium" : r >= 35 ? "Low" : "Minimal";

export default function SuiteRisk() {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"risk" | "name">("risk");
  const filtered = [...customers].filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase())).sort((a, b) => sort === "risk" ? b.risk - a.risk : a.name.localeCompare(b.name));

  return (
    <div className="p-6 space-y-5 h-full overflow-y-auto">
      <div><h1 className="text-xl font-bold text-foreground">Risk Scoring</h1><p className="text-xs text-muted-foreground mt-0.5">Composite customer risk profiles · Behavioural analysis</p></div>

      <div className="grid grid-cols-[1fr_260px] gap-5">
        <div className="bg-card rounded-xl border border-border">
          <div className="px-5 py-4 border-b border-border"><h2 className="font-semibold text-foreground">Score Distribution</h2></div>
          <div className="p-5">
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={distributionData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" />
                <XAxis dataKey="range" tick={{ fontSize: 11, fill: "hsl(220,9%,46%)" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(220,9%,46%)" }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "white", border: "1px solid hsl(220,13%,88%)", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="count" name="Customers" fill="hsl(221,83%,53%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border">
          <div className="px-5 py-4 border-b border-border"><h2 className="font-semibold text-foreground">Risk Drivers</h2></div>
          <div className="p-4">
            <ResponsiveContainer width="100%" height={160}>
              <RadarChart data={riskDrivers}>
                <PolarGrid stroke="hsl(220,13%,91%)" />
                <PolarAngleAxis dataKey="label" tick={{ fontSize: 9, fill: "hsl(220,9%,46%)" }} />
                <Radar name="Score" dataKey="score" stroke="hsl(221,83%,53%)" fill="hsl(221,83%,53%)" fillOpacity={0.2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <div><h2 className="font-semibold text-foreground">Customer Risk Scores</h2></div>
          <div className="flex items-center gap-2">
            <div className="relative"><Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…" className="pl-7 py-1.5 text-xs rounded border border-border bg-background text-foreground w-36 focus:outline-none focus:ring-1 focus:ring-primary" /></div>
            <button onClick={() => setSort(s => s === "risk" ? "name" : "risk")} className="flex items-center gap-1 text-xs px-2 py-1.5 rounded border border-border hover:bg-muted transition-colors text-muted-foreground"><SlidersHorizontal className="w-3 h-3" /> Sort: {sort === "risk" ? "Risk ↓" : "Name A-Z"}</button>
          </div>
        </div>
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border bg-muted/30">
            {["Customer", "Risk Score", "Level", "PEP", "Jurisdiction", "Txns", "Adverse Media", "KYC", "Change", ""].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">{h}</th>)}
          </tr></thead>
          <tbody className="divide-y divide-border">
            {filtered.map(c => (
              <tr key={c.id} className="hover:bg-muted/20 transition-colors group">
                <td className="px-4 py-3"><div className="font-semibold text-foreground text-sm">{c.name}</div><div className="text-xs text-muted-foreground font-mono">{c.id}</div></td>
                <td className="px-4 py-3"><div className="flex items-center gap-2"><div className="w-14 h-2 rounded-full bg-muted overflow-hidden"><div className={cn("h-full rounded-full", riskBg(c.risk))} style={{ width: `${c.risk}%` }} /></div><span className={cn("text-sm font-mono font-bold", riskColor(c.risk))}>{c.risk}</span></div></td>
                <td className="px-4 py-3"><span className={cn("text-xs px-2 py-0.5 rounded border font-semibold", riskBadge(c.risk))}>{riskLabel(c.risk)}</span></td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{c.pep}</td>
                <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{c.jurisdiction}</td>
                <td className="px-4 py-3 font-mono text-xs text-foreground">{c.transactions}</td>
                <td className="px-4 py-3">{c.adverse ? <AlertTriangle className="w-3.5 h-3.5 text-destructive" /> : <span className="text-xs text-muted-foreground">—</span>}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{c.kyc}</td>
                <td className="px-4 py-3"><div className={cn("flex items-center gap-1 text-xs font-medium", c.change > 0 ? "text-destructive" : c.change < 0 ? "text-emerald-600" : "text-muted-foreground")}>{c.change > 0 ? <TrendingUp className="w-3.5 h-3.5" /> : c.change < 0 ? <TrendingDown className="w-3.5 h-3.5" /> : null}{c.change !== 0 ? `${c.change > 0 ? "+" : ""}${c.change}` : "—"}</div></td>
                <td className="px-4 py-3"><button className="opacity-0 group-hover:opacity-100 text-xs text-primary hover:underline transition-opacity flex items-center gap-1">Profile <ChevronRight className="w-3 h-3" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
