import { useState, useEffect } from "react";
import { CheckCircle2, Circle, Clock, User, Building2, ChevronRight, FileCheck, Shield, Camera, Fingerprint, Globe, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Customer {
  id: string;
  name: string;
  type: string;
  email: string | null;
  country: string | null;
  risk_level: string;
  kyc_status: string;
  status: string;
  company_name: string | null;
  created_at: string;
}

const kycStatusLabel: Record<string, string> = {
  pending: "Lead Captured",
  in_review: "KYC Initiated",
  verified: "Verified",
  rejected: "Rejected",
};

const riskBadge = (r: string) => {
  const m: Record<string, string> = { low: "bg-emerald-50 text-emerald-700 border-emerald-200", medium: "bg-amber-50 text-amber-700 border-amber-200", high: "bg-red-50 text-red-700 border-red-200", critical: "bg-purple-50 text-purple-700 border-purple-200" };
  return m[r] ?? "bg-muted text-muted-foreground border-border";
};

const statusBadge = (s: string) => {
  const m: Record<string, string> = {
    pending: "bg-slate-100 text-slate-600 border-slate-200",
    in_review: "bg-blue-50 text-blue-700 border-blue-200",
    verified: "bg-emerald-50 text-emerald-700 border-emerald-200",
    rejected: "bg-red-50 text-red-700 border-red-200",
  };
  return m[s] ?? "bg-muted text-muted-foreground border-border";
};

export default function SuiteOnboarding() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", type: "individual", country: "", company_name: "" });

  const fetchCustomers = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("suite_customers").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    setCustomers(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchCustomers(); }, []);

  const addCustomer = async () => {
    if (!form.name.trim()) { toast.error("Name is required"); return; }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("suite_customers").insert({
      user_id: user.id,
      name: form.name.trim(),
      email: form.email.trim() || null,
      type: form.type,
      country: form.country.trim() || null,
      company_name: form.type === "business" ? form.company_name.trim() || null : null,
    });

    if (error) { toast.error(error.message); return; }

    // Log to audit
    await supabase.from("suite_audit_log").insert({
      user_id: user.id,
      action: `New ${form.type} customer onboarded: ${form.name}`,
      entity_type: "customer",
      entity_id: "",
      details: { detail: `Type: ${form.type}, Country: ${form.country || "N/A"}` },
    });

    toast.success("Customer added");
    setForm({ name: "", email: "", type: "individual", country: "", company_name: "" });
    setShowForm(false);
    fetchCustomers();
  };

  const filtered = filter === "All" ? customers : customers.filter(c => c.kyc_status === filter);
  const statuses = ["All", "pending", "in_review", "verified", "rejected"];

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-foreground">Client Onboarding</h1>
          <p className="text-xs text-muted-foreground mt-0.5">KYC/KYB pipeline · {customers.length} records</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 font-medium">
          <Plus className="w-3.5 h-3.5" /> New Customer
        </button>
      </div>

      {showForm && (
        <div className="bg-card border border-border rounded-xl p-5 mb-5 animate-fade-in">
          <h2 className="font-semibold text-foreground mb-4">Add Customer</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Full Name *</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Email</label>
              <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Type</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30">
                <option value="individual">Individual</option>
                <option value="business">Business</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Country</label>
              <input value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))} placeholder="e.g. CY" className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            {form.type === "business" && (
              <div className="col-span-2">
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Company Name</label>
                <input value={form.company_name} onChange={e => setForm(f => ({ ...f, company_name: e.target.value }))} className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button onClick={() => setShowForm(false)} className="text-xs px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:bg-muted">Cancel</button>
            <button onClick={addCustomer} className="text-xs px-4 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 font-medium">Save Customer</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-4 gap-4 mb-5">
        {[
          { label: "Total", value: customers.length, color: "text-foreground" },
          { label: "Pending", value: customers.filter(c => c.kyc_status === "pending").length, color: "text-amber-600" },
          { label: "In Review", value: customers.filter(c => c.kyc_status === "in_review").length, color: "text-blue-600" },
          { label: "Verified", value: customers.filter(c => c.kyc_status === "verified").length, color: "text-emerald-600" },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4">
            <div className={cn("text-2xl font-bold", s.color)}>{s.value}</div>
            <div className="text-xs font-medium text-foreground mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-1.5 flex-wrap mb-4">
        {statuses.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={cn("text-[10px] px-2.5 py-1 rounded-full font-medium border transition-colors capitalize",
              filter === s ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground hover:border-primary/50"
            )}>{s === "All" ? "All" : kycStatusLabel[s] || s}</button>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {loading ? (
          <p className="text-sm text-muted-foreground text-center py-8">Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No customers yet. Click "New Customer" to add one.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {["Customer", "Type", "Country", "Risk", "KYC Status", "Started"].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-[10px] font-semibold text-muted-foreground uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(c => (
                <tr key={c.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        {c.type === "individual" ? <User className="w-3 h-3 text-primary" /> : <Building2 className="w-3 h-3 text-primary" />}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-foreground">{c.name}</div>
                        {c.email && <div className="text-[10px] text-muted-foreground">{c.email}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground capitalize">{c.type}</td>
                  <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{c.country || "—"}</td>
                  <td className="px-4 py-3"><span className={cn("text-[10px] px-2 py-0.5 rounded-full border font-semibold capitalize", riskBadge(c.risk_level))}>{c.risk_level}</span></td>
                  <td className="px-4 py-3"><span className={cn("text-[10px] px-2 py-0.5 rounded-full border font-semibold", statusBadge(c.kyc_status))}>{kycStatusLabel[c.kyc_status] || c.kyc_status}</span></td>
                  <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{new Date(c.created_at).toLocaleDateString("en-GB")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
