import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Plus, Trash2, Play, Pause, Settings2, CheckCircle, AlertCircle, Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Operator = ">" | ">=" | "<" | "<=" | "==" | "!=" | "IN" | "NOT IN" | "CONTAINS";
type LogicGate = "AND" | "OR";
type RuleAction = "Flag" | "Review" | "Block" | "Alert" | "Escalate";

interface Condition { id: string; field: string; operator: Operator; value: string; }
interface Rule { id: string; name: string; description: string; logic: LogicGate; conditions: Condition[]; action: RuleAction; priority: string; enabled: boolean; }

const FIELDS = ["transaction.amount", "transaction.currency", "transaction.country", "customer.riskScore", "customer.status", "customer.pepStatus", "screening.matchPct", "transaction.type", "account.totalDeposits30d", "alert.count", "customer.nationality", "transaction.frequency"];
const OPERATORS: Operator[] = [">", ">=", "<", "<=", "==", "!=", "IN", "NOT IN", "CONTAINS"];

const priorityStyle: Record<string, string> = { low: "bg-slate-50 text-slate-600 border-slate-200", medium: "bg-amber-50 text-amber-700 border-amber-200", high: "bg-orange-50 text-orange-700 border-orange-200", critical: "bg-red-50 text-red-700 border-red-200" };
const actionStyle: Record<RuleAction, string> = { Flag: "bg-amber-50 text-amber-700", Review: "bg-blue-50 text-blue-700", Block: "bg-red-50 text-red-700", Alert: "bg-purple-50 text-purple-700", Escalate: "bg-orange-50 text-orange-700" };

function uid() { return Math.random().toString(36).slice(2, 9); }

export default function SuiteAlertRules() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  const [showAiPanel, setShowAiPanel] = useState(false);

  const fetchRules = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("suite_alert_rules").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    const mapped: Rule[] = (data || []).map(r => ({
      id: r.id,
      name: r.name,
      description: "",
      logic: (Array.isArray(r.conditions) && (r.conditions as any)[0]?.logic) || "AND",
      conditions: Array.isArray(r.conditions) ? (r.conditions as any[]).filter(c => c.field) : [],
      action: (Array.isArray(r.conditions) && (r.conditions as any)[0]?.action) || "Flag",
      priority: r.severity,
      enabled: r.is_active,
    }));
    setRules(mapped);
    if (mapped.length > 0 && !selected) setSelected(mapped[0].id);
    setLoading(false);
  };

  useEffect(() => { fetchRules(); }, []);

  const activeRule = rules.find(r => r.id === selected);
  const updateRule = (update: Partial<Rule>) => { setRules(prev => prev.map(r => r.id === selected ? { ...r, ...update } : r)); };
  const addCondition = () => { updateRule({ conditions: [...(activeRule?.conditions ?? []), { id: uid(), field: "transaction.amount", operator: ">", value: "1000" }] }); };
  const removeCondition = (cid: string) => { updateRule({ conditions: activeRule?.conditions.filter(c => c.id !== cid) ?? [] }); };
  const updateCondition = (cid: string, patch: Partial<Condition>) => { updateRule({ conditions: activeRule?.conditions.map(c => c.id === cid ? { ...c, ...patch } : c) ?? [] }); };

  const addRule = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await supabase.from("suite_alert_rules").insert({
      user_id: user.id,
      name: "New Rule",
      conditions: [{ id: uid(), field: "transaction.amount", operator: ">", value: "0", logic: "AND", action: "Flag" }],
      severity: "medium",
      is_active: false,
    }).select().single();
    if (error) { toast.error(error.message); return; }
    fetchRules();
    if (data) setSelected(data.id);
  };

  const saveRule = async () => {
    if (!activeRule) return;
    setSaving(true);
    const conditions = activeRule.conditions.map(c => ({ ...c, logic: activeRule.logic, action: activeRule.action }));
    const { error } = await supabase.from("suite_alert_rules").update({
      name: activeRule.name,
      conditions,
      severity: activeRule.priority,
      is_active: activeRule.enabled,
    }).eq("id", activeRule.id);
    if (error) toast.error(error.message);
    else toast.success("Rule saved");
    setSaving(false);
  };

  const deleteRule = async (id: string) => {
    await supabase.from("suite_alert_rules").delete().eq("id", id);
    if (selected === id) setSelected(null);
    fetchRules();
    toast.success("Rule deleted");
  };

  const toggleRule = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const rule = rules.find(r => r.id === id);
    if (!rule) return;
    await supabase.from("suite_alert_rules").update({ is_active: !rule.enabled }).eq("id", id);
    setRules(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  };

  if (loading) return <div className="flex items-center justify-center h-full text-sm text-muted-foreground">Loading rules…</div>;

  return (
    <div className="flex h-full overflow-hidden bg-background">
      <div className="w-72 shrink-0 border-r border-border flex flex-col bg-card">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between shrink-0">
          <div><h2 className="font-semibold text-foreground text-sm">Alert Rules</h2><p className="text-xs text-muted-foreground">{rules.filter(r => r.enabled).length}/{rules.length} active</p></div>
          <button onClick={addRule} className="flex items-center gap-1 text-xs px-2.5 py-1.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"><Plus className="w-3 h-3" />New</button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
          {rules.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No rules yet. Click New to create one.</p>}
          {rules.map(r => (
            <button key={r.id} onClick={() => setSelected(r.id)} className={cn("w-full text-left p-3 rounded-xl border transition-colors", selected === r.id ? "bg-primary/5 border-primary/30" : "border-border hover:bg-muted/50")}>
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <span className="text-xs font-semibold text-foreground leading-tight">{r.name}</span>
                <button onClick={(e) => toggleRule(r.id, e)} className={cn("w-8 h-4 rounded-full flex items-center shrink-0 transition-colors px-0.5", r.enabled ? "bg-emerald-500 justify-end" : "bg-muted justify-start")}><div className="w-3 h-3 rounded-full bg-white shadow" /></button>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className={cn("text-[10px] px-1.5 py-0.5 rounded border font-medium capitalize", priorityStyle[r.priority])}>{r.priority}</span>
                <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium", actionStyle[r.action])}>{r.action}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {activeRule ? (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card shrink-0">
            <div className="flex items-center gap-3">
              <Settings2 className="w-4 h-4 text-muted-foreground" />
              <input value={activeRule.name} onChange={e => updateRule({ name: e.target.value })} className="font-semibold text-foreground text-sm bg-transparent border-0 outline-none focus:bg-muted/50 rounded px-1 py-0.5 w-72" />
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => deleteRule(activeRule.id)} className="text-xs px-3 py-1.5 rounded-lg border border-destructive/20 text-destructive hover:bg-destructive/10 transition-colors"><Trash2 className="w-3 h-3 inline mr-1" />Delete</button>
              <button onClick={saveRule} disabled={saving} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium">
                {saving ? "Saving…" : "Save Rule"}
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">Priority</label>
                <select value={activeRule.priority} onChange={e => updateRule({ priority: e.target.value })} className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-card text-foreground outline-none focus:border-primary">
                  {["low", "medium", "high", "critical"].map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">Action</label>
                <select value={activeRule.action} onChange={e => updateRule({ action: e.target.value as RuleAction })} className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-card text-foreground outline-none focus:border-primary">
                  {["Flag", "Review", "Block", "Alert", "Escalate"].map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">Logic Gate</label>
                <select value={activeRule.logic} onChange={e => updateRule({ logic: e.target.value as LogicGate })} className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-card text-foreground outline-none focus:border-primary">
                  {["AND", "OR"].map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <div><h3 className="font-semibold text-foreground text-sm">Conditions</h3><p className="text-xs text-muted-foreground mt-0.5">Linked by <span className="font-bold text-primary">{activeRule.logic}</span></p></div>
                <button onClick={addCondition} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-dashed border-primary/50 text-primary hover:bg-primary/5 transition-colors"><Plus className="w-3 h-3" />Add Condition</button>
              </div>
              <div className="space-y-3">
                {activeRule.conditions.map((cond, idx) => (
                  <div key={cond.id} className="flex items-center gap-3 p-4 rounded-xl border border-border bg-muted/30 group">
                    {idx > 0 && <span className={cn("text-xs font-bold px-2 py-1 rounded shrink-0", activeRule.logic === "AND" ? "bg-primary/10 text-primary" : "bg-amber-50 text-amber-700")}>{activeRule.logic}</span>}
                    {idx === 0 && <span className="text-xs font-bold text-muted-foreground shrink-0">IF</span>}
                    <select value={cond.field} onChange={e => updateCondition(cond.id, { field: e.target.value })} className="flex-1 text-xs border border-border rounded-lg px-2.5 py-2 bg-card text-foreground outline-none focus:border-primary font-mono">
                      {FIELDS.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                    <select value={cond.operator} onChange={e => updateCondition(cond.id, { operator: e.target.value as Operator })} className="w-24 text-xs border border-border rounded-lg px-2.5 py-2 bg-card text-foreground outline-none focus:border-primary font-mono">
                      {OPERATORS.map(op => <option key={op} value={op}>{op}</option>)}
                    </select>
                    <input value={cond.value} onChange={e => updateCondition(cond.id, { value: e.target.value })} className="flex-1 text-xs border border-border rounded-lg px-2.5 py-2 bg-card text-foreground outline-none focus:border-primary font-mono" />
                    <button onClick={() => removeCondition(cond.id)} className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-destructive/10 text-destructive transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-muted/50 rounded-xl border border-border p-4">
              <div className="flex items-center gap-2 mb-2"><AlertCircle className="w-3.5 h-3.5 text-muted-foreground" /><h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Rule Preview</h4></div>
              <p className="text-xs font-mono text-foreground leading-relaxed">
                IF {activeRule.conditions.map((c, i) => (
                  <span key={c.id}>
                    {i > 0 && <span className="text-primary font-bold"> {activeRule.logic} </span>}
                    <span className="text-amber-600">{c.field}</span>
                    <span className="text-muted-foreground"> {c.operator} </span>
                    <span className="text-emerald-600">"{c.value}"</span>
                  </span>
                ))}
                {" "}→ <span className="font-bold text-destructive">{activeRule.action}</span> with priority <span className="font-bold capitalize">{activeRule.priority}</span>
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
          {rules.length === 0 ? "Create your first alert rule" : "Select a rule to edit"}
        </div>
      )}
    </div>
  );
}
