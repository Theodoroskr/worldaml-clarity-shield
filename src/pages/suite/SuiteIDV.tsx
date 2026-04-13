import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Plus, Search, ChevronRight, Fingerprint, Camera, Smartphone, UserCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useOrganisation } from "@/hooks/useOrganisation";
import { toast } from "sonner";

interface IDVSession {
  id: string;
  customer_id: string;
  status: string;
  document_type: string | null;
  liveness_result: string | null;
  reviewed_by: string | null;
  created_at: string;
}

interface Customer {
  id: string;
  name: string;
}

const statusStyle: Record<string, string> = {
  passed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  pending: "bg-blue-50 text-blue-700 border-blue-200",
  manual_check: "bg-amber-50 text-amber-700 border-amber-200",
  failed: "bg-red-50 text-red-700 border-red-200",
};

const statusLabel: Record<string, string> = {
  passed: "Verified",
  pending: "Pending",
  manual_check: "Manual Review",
  failed: "Failed",
};

export default function SuiteIDV() {
  const { orgId, userId } = useOrganisation();
  const [sessions, setSessions] = useState<IDVSession[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ customer_id: "", document_type: "passport", liveness_result: "" });

  const fetchData = async () => {
    if (!orgId || !userId) return;
    const [sRes, cRes] = await Promise.all([
      supabase.from("suite_idv_sessions").select("*").eq("organisation_id", orgId).order("created_at", { ascending: false }),
      supabase.from("suite_customers").select("id, name").eq("organisation_id", orgId),
    ]);
    setSessions(sRes.data || []);
    setCustomers(cRes.data || []);
    if (cRes.data && cRes.data.length > 0 && !form.customer_id) {
      setForm(f => ({ ...f, customer_id: cRes.data![0].id }));
    }
    setLoading(false);
  };

  useEffect(() => { if (orgId) fetchData(); }, [orgId]);

  const createSession = async () => {
    if (!form.customer_id) { toast.error("Select a customer"); return; }
    if (!orgId || !userId) return;

    const { error } = await supabase.from("suite_idv_sessions").insert({
      customer_id: form.customer_id,
      user_id: userId, organisation_id: orgId,
      document_type: form.document_type,
      liveness_result: form.liveness_result || null,
    });
    if (error) { toast.error(error.message); return; }

    await supabase.from("suite_audit_log").insert({
      user_id: userId, organisation_id: orgId,
      action: `IDV session created for ${customers.find(c => c.id === form.customer_id)?.name || "customer"}`,
      entity_type: "idv",
      details: { detail: `Document: ${form.document_type}` },
    });

    toast.success("IDV session created");
    setShowForm(false);
    fetchData();
  };

  const updateStatus = async (sessionId: string, newStatus: string) => {
    const { error } = await supabase.from("suite_idv_sessions").update({ status: newStatus }).eq("id", sessionId);
    if (error) { toast.error(error.message); return; }
    toast.success(`Session ${statusLabel[newStatus] || newStatus}`);
    fetchData();
  };

  const customerName = (id: string) => customers.find(c => c.id === id)?.name || "Unknown";
  const filtered = sessions.filter(s =>
    (filter === "All" || s.status === filter) &&
    (!search || customerName(s.customer_id).toLowerCase().includes(search.toLowerCase()))
  );

  const stats = {
    passed: sessions.filter(s => s.status === "passed").length,
    manual_check: sessions.filter(s => s.status === "manual_check").length,
    failed: sessions.filter(s => s.status === "failed").length,
    total: sessions.length,
  };

  return (
    <div className="p-6 space-y-5 h-full overflow-y-auto">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold text-foreground">Identity Verification</h1><p className="text-xs text-muted-foreground mt-0.5">Biometric · Document OCR · Liveness</p></div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 font-medium"><Plus className="w-3.5 h-3.5" /> New Session</button>
      </div>

      {showForm && (
        <div className="bg-card border border-border rounded-xl p-5 animate-fade-in">
          <h2 className="font-semibold text-foreground mb-3">Create IDV Session</h2>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Customer *</label>
              <select value={form.customer_id} onChange={e => setForm(f => ({ ...f, customer_id: e.target.value }))} className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground">
                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Document Type</label>
              <select value={form.document_type} onChange={e => setForm(f => ({ ...f, document_type: e.target.value }))} className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground">
                {["passport", "national_id", "drivers_license", "residence_permit"].map(d => <option key={d} value={d}>{d.replace("_", " ")}</option>)}
              </select>
            </div>
            <div className="flex items-end gap-2">
              <button onClick={() => setShowForm(false)} className="text-xs px-3 py-2 border border-border rounded-lg text-muted-foreground hover:bg-muted">Cancel</button>
              <button onClick={createSession} className="text-xs px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium">Create</button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Verified", value: stats.passed, color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
          { label: "Manual Review", value: stats.manual_check, color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
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
          {["All", "pending", "passed", "manual_check", "failed"].map(s => <button key={s} onClick={() => setFilter(s)} className={cn("text-xs px-2.5 py-1 rounded-full border font-medium transition-colors", filter === s ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground border-border hover:border-primary hover:text-primary")}>{statusLabel[s] || "All"}</button>)}
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {loading ? (
          <p className="text-sm text-muted-foreground text-center py-8">Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No IDV sessions yet. Create one to get started.</p>
        ) : (
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border bg-muted/30">
              {["Customer", "Document", "Liveness", "Status", "Date", "Actions"].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">{h}</th>)}
            </tr></thead>
            <tbody className="divide-y divide-border">
              {filtered.map(s => (
                <tr key={s.id} className="hover:bg-muted/20 transition-colors group">
                  <td className="px-4 py-3 font-semibold text-foreground text-sm">{customerName(s.customer_id)}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground capitalize">{(s.document_type || "—").replace("_", " ")}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{s.liveness_result || "—"}</td>
                  <td className="px-4 py-3"><span className={cn("text-xs px-2 py-0.5 rounded border font-medium", statusStyle[s.status])}>{statusLabel[s.status] || s.status}</span></td>
                  <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{new Date(s.created_at).toLocaleString("en-GB")}</td>
                  <td className="px-4 py-3">
                    {s.status === "pending" && (
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => updateStatus(s.id, "passed")} className="text-[10px] px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded hover:bg-emerald-100">Pass</button>
                        <button onClick={() => updateStatus(s.id, "manual_check")} className="text-[10px] px-2 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded hover:bg-amber-100">Review</button>
                        <button onClick={() => updateStatus(s.id, "failed")} className="text-[10px] px-2 py-1 bg-red-50 text-red-700 border border-red-200 rounded hover:bg-red-100">Fail</button>
                      </div>
                    )}
                    {s.status === "manual_check" && (
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => updateStatus(s.id, "passed")} className="text-[10px] px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded hover:bg-emerald-100">Approve</button>
                        <button onClick={() => updateStatus(s.id, "failed")} className="text-[10px] px-2 py-1 bg-red-50 text-red-700 border border-red-200 rounded hover:bg-red-100">Reject</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
