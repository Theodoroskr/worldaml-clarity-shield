import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { AlertTriangle, TrendingUp, Globe, RefreshCw, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TxRow {
  id: string;
  customer_id: string;
  amount: number;
  currency: string;
  direction: string;
  counterparty: string | null;
  counterparty_country: string | null;
  risk_flag: boolean;
  description: string | null;
  created_at: string;
}

interface Customer {
  id: string;
  name: string;
}

const HIGH_RISK = ["RU", "IR", "PA", "KP", "SY"];

const triggerMonitoring = async (userId: string, transactionId: string) => {
  try {
    await supabase.functions.invoke("evaluate-transactions", {
      body: { user_id: userId, transaction_ids: [transactionId] },
    });
  } catch {
    console.warn("Transaction monitoring evaluation deferred");
  }
};

export default function SuiteTransactions() {
  const [txs, setTxs] = useState<TxRow[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"All" | "flagged" | "clean">("All");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ customer_id: "", amount: "", currency: "EUR", direction: "inbound", counterparty: "", counterparty_country: "", description: "" });

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const [tRes, cRes] = await Promise.all([
      supabase.from("suite_transactions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(100),
      supabase.from("suite_customers").select("id, name").eq("user_id", user.id),
    ]);
    setTxs(tRes.data || []);
    setCustomers(cRes.data || []);
    if (cRes.data && cRes.data.length > 0 && !form.customer_id) {
      setForm(f => ({ ...f, customer_id: cRes.data![0].id }));
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const addTransaction = async () => {
    if (!form.customer_id || !form.amount) { toast.error("Customer and amount required"); return; }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const isHighRisk = HIGH_RISK.includes((form.counterparty_country || "").toUpperCase());
    const amount = parseFloat(form.amount);
    const riskFlag = isHighRisk || amount > 10000;

    const { data, error } = await supabase.from("suite_transactions").insert({
      customer_id: form.customer_id,
      user_id: user.id,
      amount,
      currency: form.currency,
      direction: form.direction,
      counterparty: form.counterparty || null,
      counterparty_country: form.counterparty_country || null,
      risk_flag: riskFlag,
      description: form.description || null,
    }).select().single();

    if (error) { toast.error(error.message); return; }

    await supabase.from("suite_audit_log").insert({
      user_id: user.id,
      action: `Transaction recorded: ${form.currency} ${amount} ${form.direction}`,
      entity_type: "transaction",
      details: { detail: `Counterparty: ${form.counterparty || "N/A"}, Country: ${form.counterparty_country || "N/A"}` },
    });

    if (riskFlag) {
      await supabase.from("suite_alerts").insert({
        customer_id: form.customer_id,
        user_id: user.id,
        alert_type: "transaction",
        severity: amount > 30000 ? "critical" : "high",
        title: `Flagged transaction: ${form.currency} ${amount.toLocaleString()}`,
        description: `${form.direction} transaction${isHighRisk ? " to high-risk jurisdiction (" + form.counterparty_country + ")" : ""} exceeds threshold`,
      });
    }

    // Trigger server-side rule evaluation
    if (data) {
      triggerMonitoring(user.id, data.id);
    }

    toast.success("Transaction recorded");
    setForm({ customer_id: form.customer_id, amount: "", currency: "EUR", direction: "inbound", counterparty: "", counterparty_country: "", description: "" });
    setShowForm(false);
    fetchData();
  };

  const customerName = (id: string) => customers.find(c => c.id === id)?.name || "Unknown";
  const filtered = filter === "All" ? txs : filter === "flagged" ? txs.filter(t => t.risk_flag) : txs.filter(t => !t.risk_flag);
  const stats = { total: txs.length, flagged: txs.filter(t => t.risk_flag).length, volume: txs.reduce((s, t) => s + Number(t.amount), 0) };

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-foreground">Transaction Monitor</span>
          <span className="text-xs text-muted-foreground">{txs.length} records</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium"><Plus className="w-3 h-3" />Add Transaction</button>
          <button onClick={fetchData} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded border border-border hover:bg-muted transition-colors text-foreground"><RefreshCw className="w-3 h-3" />Refresh</button>
        </div>
      </div>

      {showForm && (
        <div className="px-5 py-4 border-b border-border bg-card animate-fade-in">
          <h3 className="font-semibold text-foreground text-sm mb-3">Record Transaction</h3>
          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Customer *</label>
              <select value={form.customer_id} onChange={e => setForm(f => ({ ...f, customer_id: e.target.value }))} className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground">
                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Amount *</label>
              <input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="10000" className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Currency</label>
              <select value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))} className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground">
                {["EUR", "USD", "GBP", "CHF"].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Direction</label>
              <select value={form.direction} onChange={e => setForm(f => ({ ...f, direction: e.target.value }))} className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground">
                <option value="inbound">Inbound</option>
                <option value="outbound">Outbound</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Counterparty</label>
              <input value={form.counterparty} onChange={e => setForm(f => ({ ...f, counterparty: e.target.value }))} className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Country Code</label>
              <input value={form.counterparty_country} onChange={e => setForm(f => ({ ...f, counterparty_country: e.target.value }))} placeholder="e.g. DE" className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground" />
            </div>
            <div className="col-span-2 flex items-end gap-2">
              <button onClick={() => setShowForm(false)} className="text-xs px-3 py-2 rounded-lg border border-border text-muted-foreground hover:bg-muted">Cancel</button>
              <button onClick={addTransaction} className="text-xs px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 font-medium">Save</button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-0 border-b border-border bg-card shrink-0">
        {[
          { label: "Total", value: stats.total, icon: TrendingUp, color: "text-primary" },
          { label: "Flagged", value: stats.flagged, icon: AlertTriangle, color: "text-destructive" },
          { label: "Volume", value: `€${stats.volume.toLocaleString()}`, icon: Globe, color: "text-foreground" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="flex items-center gap-3 px-5 py-3 border-r border-border last:border-r-0">
            <Icon className={cn("w-4 h-4 shrink-0", color)} />
            <div>
              <div className={cn("text-lg font-bold font-mono", color)}>{value}</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-1.5 px-5 py-2 border-b border-border bg-card shrink-0">
        {(["All", "flagged", "clean"] as const).map(s => (
          <button key={s} onClick={() => setFilter(s)} className={cn("text-xs px-3 py-1 rounded-full border font-medium transition-colors capitalize", filter === s ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground border-border hover:border-primary hover:text-primary")}>
            {s}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <p className="text-sm text-muted-foreground text-center py-8">Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No transactions yet. Add one above.</p>
        ) : (
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-card border-b border-border z-10">
              <tr>{["Date", "Customer", "Direction", "Amount", "Counterparty", "Country", "Risk", ""].map(h => <th key={h} className="px-3 py-2.5 text-left font-semibold text-muted-foreground uppercase tracking-wide text-[10px]">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(tx => (
                <tr key={tx.id} className={cn("hover:bg-muted/30 transition-colors", tx.risk_flag && "bg-red-50/40")}>
                  <td className="px-3 py-2.5 font-mono text-muted-foreground">{new Date(tx.created_at).toLocaleString("en-GB", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</td>
                  <td className="px-3 py-2.5 text-foreground font-medium">{customerName(tx.customer_id)}</td>
                  <td className="px-3 py-2.5 capitalize text-muted-foreground">{tx.direction}</td>
                  <td className="px-3 py-2.5 font-mono font-bold text-foreground">{tx.currency} {Number(tx.amount).toLocaleString()}</td>
                  <td className="px-3 py-2.5 text-muted-foreground">{tx.counterparty || "—"}</td>
                  <td className="px-3 py-2.5">
                    <span className={cn("text-muted-foreground", tx.counterparty_country && HIGH_RISK.includes(tx.counterparty_country.toUpperCase()) && "text-destructive font-semibold")}>
                      {tx.counterparty_country || "—"}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={cn("px-2 py-0.5 rounded border font-medium text-[10px]", tx.risk_flag ? "bg-red-50 text-red-700 border-red-200" : "bg-emerald-50 text-emerald-700 border-emerald-200")}>
                      {tx.risk_flag ? "Flagged" : "Clean"}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-[10px] text-muted-foreground">{tx.description || ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
