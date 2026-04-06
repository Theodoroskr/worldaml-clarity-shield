import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Search, Download } from "lucide-react";
import { Timeline, TimelineEvent } from "@/components/ui/timeline";
import { supabase } from "@/integrations/supabase/client";

export default function SuiteAudit() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("suite_audit_log").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(100);
      setEvents((data || []).map(a => ({
        id: a.id,
        timestamp: new Date(a.created_at).toLocaleString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }),
        actor: "You",
        action: a.action,
        type: a.entity_type as any,
        detail: typeof a.details === "object" && a.details !== null ? (a.details as any).detail || "" : "",
      })));
      setLoading(false);
    };
    load();
  }, []);

  const types = ["All", ...Array.from(new Set(events.map(e => e.type)))];
  const filtered = events.filter(e =>
    (typeFilter === "All" || e.type === typeFilter) &&
    (!search || e.action.toLowerCase().includes(search.toLowerCase()))
  );

  const exportCSV = () => {
    const rows = filtered.map(e => `"${e.timestamp}","${e.actor}","${e.action}","${e.type}","${e.detail || ""}"`);
    const csv = `Timestamp,Actor,Action,Type,Detail\n${rows.join("\n")}`;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "audit-trail.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-5 h-full overflow-y-auto">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold text-foreground">Audit Trail</h1><p className="text-xs text-muted-foreground mt-0.5">Complete chronological log of all compliance actions</p></div>
        <button onClick={exportCSV} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted transition-colors font-medium text-foreground"><Download className="w-3.5 h-3.5" /> Export CSV</button>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative"><Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search audit log…" className="pl-7 py-1.5 text-xs rounded border border-border bg-background text-foreground w-60 focus:outline-none focus:ring-1 focus:ring-primary" /></div>
        <div className="flex gap-1">
          {types.map(t => <button key={t} onClick={() => setTypeFilter(t)} className={cn("text-xs px-2.5 py-1 rounded-full border font-medium transition-colors capitalize", typeFilter === t ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground border-border hover:border-primary hover:text-primary")}>{t}</button>)}
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-6">
        {loading ? (
          <p className="text-sm text-muted-foreground text-center py-8">Loading audit trail…</p>
        ) : filtered.length > 0 ? (
          <Timeline events={filtered} />
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">No audit events yet. Actions across the suite will be logged here automatically.</p>
        )}
      </div>
    </div>
  );
}
