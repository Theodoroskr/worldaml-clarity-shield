import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle, Clock, ChevronRight, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Alert {
  id: string;
  customer_id: string | null;
  alert_type: string;
  severity: string;
  status: string;
  title: string;
  description: string | null;
  created_at: string;
}

const severityStyle: Record<string, string> = {
  critical: "bg-red-50 text-red-700 border-red-200",
  high: "bg-orange-50 text-orange-700 border-orange-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  low: "bg-slate-50 text-slate-600 border-slate-200",
};

const statusStyle: Record<string, string> = {
  open: "bg-blue-50 text-blue-700 border-blue-200",
  reviewing: "bg-amber-50 text-amber-700 border-amber-200",
  escalated: "bg-red-50 text-red-700 border-red-200",
  closed: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const statusIcon: Record<string, React.ElementType> = {
  open: AlertTriangle,
  reviewing: Clock,
  escalated: AlertTriangle,
  closed: CheckCircle,
};

export default function SuiteAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const fetchAlerts = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("suite_alerts").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    setAlerts(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchAlerts(); }, []);

  const updateStatus = async (alertId: string, newStatus: string) => {
    const { error } = await supabase.from("suite_alerts").update({
      status: newStatus,
      ...(newStatus === "closed" ? { resolved_at: new Date().toISOString() } : {}),
    }).eq("id", alertId);

    if (error) { toast.error(error.message); return; }

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("suite_audit_log").insert({
        user_id: user.id,
        action: `Alert status changed to ${newStatus}`,
        entity_type: "alert",
        entity_id: alertId,
      });
    }

    toast.success(`Alert ${newStatus}`);
    fetchAlerts();
  };

  const filtered = alerts.filter(a =>
    (filter === "All" || a.status === filter) &&
    (!search || a.title.toLowerCase().includes(search.toLowerCase()))
  );

  const stats = {
    open: alerts.filter(a => a.status === "open").length,
    reviewing: alerts.filter(a => a.status === "reviewing").length,
    escalated: alerts.filter(a => a.status === "escalated").length,
    closed: alerts.filter(a => a.status === "closed").length,
  };

  return (
    <div className="p-6 space-y-5 h-full overflow-y-auto">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold text-foreground">Alert Management</h1><p className="text-xs text-muted-foreground mt-0.5">Review, assign, and resolve compliance alerts</p></div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Open", value: stats.open, color: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
          { label: "Reviewing", value: stats.reviewing, color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
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
          {["All", "open", "reviewing", "escalated", "closed"].map(s => <button key={s} onClick={() => setFilter(s)} className={cn("text-xs px-2.5 py-1 rounded-full border font-medium transition-colors capitalize", filter === s ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground border-border hover:border-primary hover:text-primary")}>{s}</button>)}
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {loading ? (
          <p className="text-sm text-muted-foreground text-center py-8">Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No alerts. They will appear automatically when screenings detect matches.</p>
        ) : (
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border bg-muted/30">
              {["Title", "Type", "Severity", "Status", "Date", "Actions"].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">{h}</th>)}
            </tr></thead>
            <tbody className="divide-y divide-border">
              {filtered.map(a => {
                const StatusIcon = statusIcon[a.status] || AlertTriangle;
                return (
                  <tr key={a.id} className={cn("hover:bg-muted/20 transition-colors", a.severity === "critical" && "bg-red-50/20")}>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-foreground text-sm">{a.title}</div>
                      {a.description && <div className="text-xs text-muted-foreground mt-0.5 truncate max-w-[250px]">{a.description}</div>}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground capitalize">{a.alert_type}</td>
                    <td className="px-4 py-3"><span className={cn("text-xs px-2 py-0.5 rounded border font-semibold capitalize", severityStyle[a.severity])}>{a.severity}</span></td>
                    <td className="px-4 py-3">
                      <span className={cn("text-xs px-2 py-0.5 rounded border font-medium inline-flex items-center gap-1 capitalize", statusStyle[a.status])}>
                        <StatusIcon className="w-3 h-3" />{a.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{new Date(a.created_at).toLocaleDateString("en-GB")}</td>
                    <td className="px-4 py-3">
                      {a.status !== "closed" && (
                        <div className="flex gap-1">
                          {a.status === "open" && <button onClick={() => updateStatus(a.id, "reviewing")} className="text-[10px] px-2 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded hover:bg-amber-100">Review</button>}
                          {(a.status === "open" || a.status === "reviewing") && <button onClick={() => updateStatus(a.id, "escalated")} className="text-[10px] px-2 py-1 bg-red-50 text-red-700 border border-red-200 rounded hover:bg-red-100">Escalate</button>}
                          <button onClick={() => updateStatus(a.id, "closed")} className="text-[10px] px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded hover:bg-emerald-100">Close</button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
