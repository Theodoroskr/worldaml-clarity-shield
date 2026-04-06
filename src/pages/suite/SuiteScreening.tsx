import { useState, useEffect } from "react";
import { Search, X, Plus, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Screening {
  id: string;
  customer_id: string;
  screening_type: string;
  result: string;
  match_count: number;
  screened_at: string;
}

interface Customer {
  id: string;
  name: string;
}

const sampleResults = [
  { id: "1", name: "John Timothy Cameron", confidence: 92, listType: "PEP Class 2", aliases: ["J.T. Cameron", "John T. Cameron"], countries: ["GR", "GB"], dob: "18/07/1975", position: "Member of Parliament — Greece" },
  { id: "2", name: "John H. Cameron", confidence: 54, listType: "OFAC SDN", aliases: ["J. Cameron"], countries: ["US", "RU"], dob: "ca. 1960", position: "Sanctioned entity — Financial Crime" },
  { id: "3", name: "Cameron, John Frederick", confidence: 31, listType: "EU Sanctions", aliases: [], countries: ["DE"], dob: "Unknown", position: "Former government official" },
];

export default function SuiteScreening() {
  const [searchName, setSearchName] = useState("");
  const [searched, setSearched] = useState(false);
  const [screenings, setScreenings] = useState<Screening[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const [sRes, cRes] = await Promise.all([
        supabase.from("suite_screenings").select("*").eq("user_id", user.id).order("screened_at", { ascending: false }).limit(50),
        supabase.from("suite_customers").select("id, name").eq("user_id", user.id),
      ]);
      setScreenings(sRes.data || []);
      setCustomers(cRes.data || []);
      if (cRes.data && cRes.data.length > 0) setSelectedCustomerId(cRes.data[0].id);
    };
    load();
  }, []);

  const runSearch = async () => {
    if (!searchName.trim()) return;
    setSearched(true);

    if (!selectedCustomerId) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const matchCount = sampleResults.length;
    const result = matchCount > 0 ? "potential_match" : "clear";

    const { error } = await supabase.from("suite_screenings").insert({
      customer_id: selectedCustomerId,
      user_id: user.id,
      screening_type: "sanctions",
      result,
      match_count: matchCount,
    });

    if (!error) {
      await supabase.from("suite_audit_log").insert({
        user_id: user.id,
        action: `AML screening for "${searchName}" — ${matchCount} matches`,
        entity_type: "screening",
        details: { detail: `Query: ${searchName}, Result: ${result}` },
      });

      // If matches found, create an alert
      if (matchCount > 0) {
        await supabase.from("suite_alerts").insert({
          customer_id: selectedCustomerId,
          user_id: user.id,
          alert_type: "screening",
          severity: matchCount >= 2 ? "high" : "medium",
          title: `Screening match: ${searchName}`,
          description: `${matchCount} potential matches found across sanctions/PEP databases`,
        });
      }

      toast.success(`Screening complete — ${matchCount} matches`);
      // Refresh screenings
      const { data } = await supabase.from("suite_screenings").select("*").eq("user_id", user.id).order("screened_at", { ascending: false }).limit(50);
      setScreenings(data || []);
    }
  };

  const customerName = (id: string) => customers.find(c => c.id === id)?.name || "Unknown";

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-foreground">AML Screening</h1><p className="text-sm text-muted-foreground mt-0.5">Search · Results · History</p></div>
      </div>

      <div className="bg-card rounded-xl border border-border p-5">
        <h2 className="font-semibold text-foreground mb-4">Individual Search</h2>
        <div className="flex gap-3 items-end">
          {customers.length > 0 && (
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Link to Customer</label>
              <select value={selectedCustomerId} onChange={e => setSelectedCustomerId(e.target.value)} className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30">
                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          )}
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
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Screening History */}
      <div className="bg-card rounded-xl border border-border">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground">Screening History</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{screenings.length} screenings recorded</p>
        </div>
        {screenings.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No screenings yet. Run a search above.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {["Customer", "Type", "Result", "Matches", "Date"].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {screenings.map(s => (
                <tr key={s.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-3 font-medium text-foreground text-sm">{customerName(s.customer_id)}</td>
                  <td className="px-5 py-3 text-xs capitalize text-muted-foreground">{s.screening_type}</td>
                  <td className="px-5 py-3">
                    <span className={cn("text-xs px-2 py-0.5 rounded-full border font-medium",
                      s.result === "clear" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"
                    )}>{s.result.replace("_", " ")}</span>
                  </td>
                  <td className="px-5 py-3 font-mono font-bold text-foreground">{s.match_count}</td>
                  <td className="px-5 py-3 text-xs font-mono text-muted-foreground">{new Date(s.screened_at).toLocaleString("en-GB")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
