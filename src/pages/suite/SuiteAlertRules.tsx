import { useState } from "react";
import { cn } from "@/lib/utils";
import { Plus, Trash2, Play, Pause, Settings2, CheckCircle, AlertCircle } from "lucide-react";

type Operator = ">" | ">=" | "<" | "<=" | "==" | "!=" | "IN" | "NOT IN" | "CONTAINS";
type LogicGate = "AND" | "OR";
type RulePriority = "Low" | "Medium" | "High" | "Critical";
type RuleAction = "Flag" | "Review" | "Block" | "Alert" | "Escalate";

interface Condition { id: string; field: string; operator: Operator; value: string; }
interface Rule { id: string; name: string; description: string; logic: LogicGate; conditions: Condition[]; action: RuleAction; priority: RulePriority; enabled: boolean; triggerCount: number; lastTriggered: string; }

const FIELDS = ["transaction.amount", "transaction.currency", "transaction.country", "customer.riskScore", "customer.status", "customer.pepStatus", "screening.matchPct", "transaction.type", "account.totalDeposits30d", "alert.count", "customer.nationality", "transaction.frequency"];
const OPERATORS: Operator[] = [">", ">=", "<", "<=", "==", "!=", "IN", "NOT IN", "CONTAINS"];

const INITIAL_RULES: Rule[] = [
  { id: "r1", name: "High-Value Transaction Threshold", description: "Flag transactions above €10,000 from high-risk jurisdictions", logic: "AND", enabled: true, action: "Flag", priority: "High", triggerCount: 142, lastTriggered: "2 min ago", conditions: [{ id: "c1", field: "transaction.amount", operator: ">=", value: "10000" }, { id: "c2", field: "transaction.country", operator: "IN", value: "RU, IR, PA, KP, SY" }] },
  { id: "r2", name: "PEP Enhanced Due Diligence", description: "Trigger review for all PEP-classified customers", logic: "AND", enabled: true, action: "Review", priority: "Critical", triggerCount: 28, lastTriggered: "15 min ago", conditions: [{ id: "c3", field: "customer.pepStatus", operator: "!=", value: "None" }, { id: "c4", field: "customer.riskScore", operator: ">=", value: "60" }] },
  { id: "r3", name: "Structuring Detection", description: "Detect possible smurfing: multiple small deposits", logic: "AND", enabled: false, action: "Alert", priority: "Medium", triggerCount: 7, lastTriggered: "3 days ago", conditions: [{ id: "c5", field: "transaction.frequency", operator: ">=", value: "5" }, { id: "c6", field: "transaction.amount", operator: "<=", value: "9999" }] },
  { id: "r4", name: "Sanctions Match Alert", description: "Immediate block on sanctions matches above 70%", logic: "OR", enabled: true, action: "Block", priority: "Critical", triggerCount: 3, lastTriggered: "1 day ago", conditions: [{ id: "c7", field: "screening.matchPct", operator: ">=", value: "70" }] },
];

const priorityStyle: Record<RulePriority, string> = { Low: "bg-slate-50 text-slate-600 border-slate-200", Medium: "bg-amber-50 text-amber-700 border-amber-200", High: "bg-orange-50 text-orange-700 border-orange-200", Critical: "bg-red-50 text-red-700 border-red-200" };
const actionStyle: Record<RuleAction, string> = { Flag: "bg-amber-50 text-amber-700", Review: "bg-blue-50 text-blue-700", Block: "bg-red-50 text-red-700", Alert: "bg-purple-50 text-purple-700", Escalate: "bg-orange-50 text-orange-700" };

function uid() { return Math.random().toString(36).slice(2, 9); }

export default function SuiteAlertRules() {
  const [rules, setRules] = useState<Rule[]>(INITIAL_RULES);
  const [selected, setSelected] = useState<string | null>("r1");
  const [saved, setSaved] = useState<string | null>(null);

  const activeRule = rules.find((r) => r.id === selected);
  const updateRule = (update: Partial<Rule>) => { setRules((prev) => prev.map((r) => r.id === selected ? { ...r, ...update } : r)); };
  const addCondition = () => { updateRule({ conditions: [...(activeRule?.conditions ?? []), { id: uid(), field: "transaction.amount", operator: ">", value: "1000" }] }); };
  const removeCondition = (cid: string) => { updateRule({ conditions: activeRule?.conditions.filter((c) => c.id !== cid) ?? [] }); };
  const updateCondition = (cid: string, patch: Partial<Condition>) => { updateRule({ conditions: activeRule?.conditions.map((c) => c.id === cid ? { ...c, ...patch } : c) ?? [] }); };
  const addRule = () => { const newRule: Rule = { id: uid(), name: "New Rule", description: "Describe this rule...", logic: "AND", conditions: [{ id: uid(), field: "transaction.amount", operator: ">", value: "0" }], action: "Flag", priority: "Medium", enabled: false, triggerCount: 0, lastTriggered: "Never" }; setRules([...rules, newRule]); setSelected(newRule.id); };
  const toggleRule = (id: string, e: React.MouseEvent) => { e.stopPropagation(); setRules((prev) => prev.map((r) => r.id === id ? { ...r, enabled: !r.enabled } : r)); };
  const saveRule = () => { setSaved(selected); setTimeout(() => setSaved(null), 2000); };

  return (
    <div className="flex h-full overflow-hidden bg-background">
      <div className="w-72 shrink-0 border-r border-border flex flex-col bg-card">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between shrink-0">
          <div><h2 className="font-semibold text-foreground text-sm">Alert Rules</h2><p className="text-xs text-muted-foreground">{rules.filter(r => r.enabled).length}/{rules.length} active</p></div>
          <button onClick={addRule} className="flex items-center gap-1 text-xs px-2.5 py-1.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"><Plus className="w-3 h-3" />New</button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
          {rules.map((r) => (
            <button key={r.id} onClick={() => setSelected(r.id)} className={cn("w-full text-left p-3 rounded-xl border transition-colors", selected === r.id ? "bg-primary/5 border-primary/30" : "border-border hover:bg-muted/50")}>
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <span className="text-xs font-semibold text-foreground leading-tight">{r.name}</span>
                <button onClick={(e) => toggleRule(r.id, e)} className={cn("w-8 h-4 rounded-full flex items-center shrink-0 transition-colors px-0.5", r.enabled ? "bg-emerald-500 justify-end" : "bg-muted justify-start")}><div className="w-3 h-3 rounded-full bg-white shadow" /></button>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className={cn("text-[10px] px-1.5 py-0.5 rounded border font-medium", priorityStyle[r.priority])}>{r.priority}</span>
                <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium", actionStyle[r.action])}>{r.action}</span>
              </div>
              <div className="mt-1.5 text-[10px] text-muted-foreground">{r.triggerCount} triggers · {r.lastTriggered}</div>
            </button>
          ))}
        </div>
      </div>

      {activeRule ? (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card shrink-0">
            <div className="flex items-center gap-3">
              <Settings2 className="w-4 h-4 text-muted-foreground" />
              <div>
                <input value={activeRule.name} onChange={(e) => updateRule({ name: e.target.value })} className="font-semibold text-foreground text-sm bg-transparent border-0 outline-none focus:bg-muted/50 rounded px-1 py-0.5 w-72" />
                <input value={activeRule.description} onChange={(e) => updateRule({ description: e.target.value })} className="text-xs text-muted-foreground bg-transparent border-0 outline-none focus:bg-muted/50 rounded px-1 py-0.5 block w-full" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => updateRule({ enabled: !activeRule.enabled })} className={cn("flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors", activeRule.enabled ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-border bg-muted text-muted-foreground")}>
                {activeRule.enabled ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}{activeRule.enabled ? "Active" : "Inactive"}
              </button>
              <button onClick={saveRule} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium">
                {saved === selected ? <><CheckCircle className="w-3 h-3" />Saved!</> : "Save Rule"}
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">Priority</label>
                <select value={activeRule.priority} onChange={(e) => updateRule({ priority: e.target.value as RulePriority })} className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-card text-foreground outline-none focus:border-primary">
                  {["Low", "Medium", "High", "Critical"].map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">Action</label>
                <select value={activeRule.action} onChange={(e) => updateRule({ action: e.target.value as RuleAction })} className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-card text-foreground outline-none focus:border-primary">
                  {["Flag", "Review", "Block", "Alert", "Escalate"].map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">Logic Gate</label>
                <select value={activeRule.logic} onChange={(e) => updateRule({ logic: e.target.value as LogicGate })} className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-card text-foreground outline-none focus:border-primary">
                  {["AND", "OR"].map((o) => <option key={o} value={o}>{o}</option>)}
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
                    <select value={cond.field} onChange={(e) => updateCondition(cond.id, { field: e.target.value })} className="flex-1 text-xs border border-border rounded-lg px-2.5 py-2 bg-card text-foreground outline-none focus:border-primary font-mono">
                      {FIELDS.map((f) => <option key={f} value={f}>{f}</option>)}
                    </select>
                    <select value={cond.operator} onChange={(e) => updateCondition(cond.id, { operator: e.target.value as Operator })} className="w-24 text-xs border border-border rounded-lg px-2.5 py-2 bg-card text-foreground outline-none focus:border-primary font-mono">
                      {OPERATORS.map((op) => <option key={op} value={op}>{op}</option>)}
                    </select>
                    <input value={cond.value} onChange={(e) => updateCondition(cond.id, { value: e.target.value })} className="flex-1 text-xs border border-border rounded-lg px-2.5 py-2 bg-card text-foreground outline-none focus:border-primary font-mono" />
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
                {" "}→ <span className="font-bold text-destructive">{activeRule.action}</span> with priority <span className="font-bold">{activeRule.priority}</span>
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">Select a rule to edit</div>
      )}
    </div>
  );
}
