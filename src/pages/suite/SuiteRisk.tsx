import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, AlertTriangle, ChevronRight, Search, SlidersHorizontal, Loader2 } from "lucide-react";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { supabase } from "@/integrations/supabase/client";

interface Customer {
  id: string;
  name: string;
  risk_level: string;
  kyc_status: string;
  country: string | null;
  type: string;
  email: string | null;
  created_at: string;
}

const riskScore = (level: string) => {
  switch (level) {
    case "critical": return 90;
    case "high": return 75;
    case "medium": return 55;
    case "low": return 30;
    default: return 20;
  }
};

const riskColor = (r: number) => r >= 75 ? "text-destructive" : r >= 55 ? "text-amber-600" : r >= 35 ? "text-foreground" : "text-emerald-600";
const riskBg = (r: number) => r >= 75 ? "bg-destructive" : r >= 55 ? "bg-amber-400" : r >= 35 ? "bg-primary" : "bg-emerald-500";
const riskBadge = (r: number) => r >= 75 ? "bg-red-50 text-red-700 border-red-200" : r >= 55 ? "bg-amber-50 text-amber-700 border-amber-200" : r >= 35 ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-emerald-50 text-emerald-700 border-emerald-200";
const riskLabel = (r: number) => r >= 75 ? "High" : r >= 55 ? "Medium" : r >= 35 ? "Low" : "Minimal";

export default function SuiteRisk() {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"risk" | "name">("risk");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("suite_customers").select("id, name, risk_level, kyc_status, country, type, email, created_at").order("created_at", { ascending: false });
      setCustomers(data || []);
      setLoading(false);
    };
    fetch();
  }, []);

  const scored = customers.map(c => ({ ...c, score: riskScore(c.risk_level) }));
  const filtered = scored
    .filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => sort === "risk" ? b.score - a.score : a.name.localeCompare(b.name));

  // Build distribution from real data
  const distributionData = [
    { range: "0-20", count: scored.filter(c => c.score <= 20).length },
    { range: "21-40", count: scored.filter(c => c.score > 20 && c.score <= 40).length },
    { range: "41-60", count: scored.filter(c => c.score > 40 && c.score <= 60).length },
    { range: "61-80", count: scored.filter(c => c.score > 60 && c.score <= 80).length },
    { range: "81-100", count: scored.filter(c => c.score > 80).length },
  ];

  // Risk drivers based on real aggregates
  const total = customers.length || 1;
  const riskDrivers = [
    { label: "High Risk", score: Math.round((customers.filter(c => c.risk_level === "high" || c.risk_level === "critical").length / total) * 100) },
    { label: "KYC Pending", score: Math.round((customers.filter(c => c.kyc_status === "pending").length / total) * 100) },
    { label: "KYC Rejected", score: Math.round((customers.filter(c => c.kyc_status === "rejected").length / total) * 100) },
    { label: "Individuals", score: Math.round((customers.filter(c => c.type === "individual").length / total) * 100) },
    { label: "Businesses", score: Math.round((customers.filter(c => c.type === "business").length / total) * 100) },
    { label: "Medium Risk", score: Math.round((customers.filter(c => c.risk_level === "medium").length / total) * 100) },
  ];

  return (
    <div className="p-6 space-y-5 h-full overflow-y-auto">
      <div><h1 className="text-xl font-bold text-foreground">Risk Scoring</h1><p className="text-xs text-muted-foreground mt-0.5">Composite customer risk profiles · Live data from your customer base</p></div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-5">
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
                <Radar name="%" dataKey="score" stroke="hsl(221,83%,53%)" fill="hsl(221,83%,53%)" fillOpacity={0.2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <div><h2 className="font-semibold text-foreground">Customer Risk Scores</h2><p className="text-xs text-muted-foreground">{customers.length} customers</p></div>
          <div className="flex items-center gap-2">
            <div className="relative"><Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…" className="pl-7 py-1.5 text-xs rounded border border-border bg-background text-foreground w-36 focus:outline-none focus:ring-1 focus:ring-primary" /></div>
            <button onClick={() => setSort(s => s === "risk" ? "name" : "risk")} className="flex items-center gap-1 text-xs px-2 py-1.5 rounded border border-border hover:bg-muted transition-colors text-muted-foreground"><SlidersHorizontal className="w-3 h-3" /> Sort: {sort === "risk" ? "Risk ↓" : "Name A-Z"}</button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-sm text-muted-foreground">No customers found. Add customers via Onboarding first.</div>
        ) : (
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border bg-muted/30">
              {["Customer", "Risk Score", "Level", "Type", "Country", "KYC Status", ""].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">{h}</th>)}
            </tr></thead>
            <tbody className="divide-y divide-border">
              {filtered.map(c => (
                <tr key={c.id} className="hover:bg-muted/20 transition-colors group">
                  <td className="px-4 py-3"><div className="font-semibold text-foreground text-sm">{c.name}</div><div className="text-xs text-muted-foreground">{c.email || "—"}</div></td>
                  <td className="px-4 py-3"><div className="flex items-center gap-2"><div className="w-14 h-2 rounded-full bg-muted overflow-hidden"><div className={cn("h-full rounded-full", riskBg(c.score))} style={{ width: `${c.score}%` }} /></div><span className={cn("text-sm font-mono font-bold", riskColor(c.score))}>{c.score}</span></div></td>
                  <td className="px-4 py-3"><span className={cn("text-xs px-2 py-0.5 rounded border font-semibold", riskBadge(c.score))}>{riskLabel(c.score)}</span></td>
                  <td className="px-4 py-3 text-xs text-muted-foreground capitalize">{c.type}</td>
                  <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{c.country || "—"}</td>
                  <td className="px-4 py-3"><span className="text-xs capitalize text-muted-foreground">{c.kyc_status}</span></td>
                  <td className="px-4 py-3"><button className="opacity-0 group-hover:opacity-100 text-xs text-primary hover:underline transition-opacity flex items-center gap-1">Profile <ChevronRight className="w-3 h-3" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
