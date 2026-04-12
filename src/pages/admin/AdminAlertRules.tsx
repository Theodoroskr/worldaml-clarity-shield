import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Search, Plus, Trash2, ToggleLeft, ToggleRight, ChevronDown, ChevronRight, Save, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface RuleCondition {
  id: string;
  field: string;
  operator: string;
  value: string;
  logic: "AND" | "OR";
  action: string;
}

interface AlertRule {
  id: string;
  user_id: string;
  name: string;
  conditions: RuleCondition[];
  severity: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  owner_email?: string;
}

const FIELDS = [
  { value: "transaction.amount", label: "Transaction Amount" },
  { value: "transaction.currency", label: "Currency" },
  { value: "transaction.country", label: "Counterparty Country" },
  { value: "transaction.direction", label: "Direction" },
  { value: "customer.riskScore", label: "Customer Risk Score" },
  { value: "customer.nationality", label: "Customer Nationality" },
];

const OPERATORS = [
  { value: ">", label: ">" },
  { value: ">=", label: ">=" },
  { value: "<", label: "<" },
  { value: "<=", label: "<=" },
  { value: "==", label: "==" },
  { value: "!=", label: "!=" },
  { value: "IN", label: "IN" },
  { value: "NOT IN", label: "NOT IN" },
  { value: "CONTAINS", label: "CONTAINS" },
];

const SEVERITIES = ["low", "medium", "high", "critical"];
const ACTIONS = ["Alert", "Flag", "Review", "Block", "Escalate"];

export default function AdminAlertRules() {
  const [rules, setRules] = useState<AlertRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expandedRule, setExpandedRule] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [editingRule, setEditingRule] = useState<AlertRule | null>(null);
  const [ownerFilter, setOwnerFilter] = useState("all");
  const [owners, setOwners] = useState<{ user_id: string; email: string }[]>([]);

  const fetchRules = async () => {
    setLoading(true);
    const [{ data: rulesData }, { data: profiles }] = await Promise.all([
      supabase.from("suite_alert_rules").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("user_id, email"),
    ]);

    const emailMap: Record<string, string> = {};
    (profiles || []).forEach((p: any) => { if (p.email) emailMap[p.user_id] = p.email; });

    const enriched = (rulesData || []).map((r: any) => ({
      ...r,
      conditions: Array.isArray(r.conditions) ? r.conditions : [],
      owner_email: emailMap[r.user_id] || r.user_id,
    }));

    setRules(enriched);
    const uniqueOwners = [...new Map(enriched.map((r: AlertRule) => [r.user_id, { user_id: r.user_id, email: r.owner_email || r.user_id }])).values()];
    setOwners(uniqueOwners);
    setLoading(false);
  };

  useEffect(() => { fetchRules(); }, []);

  const toggleActive = async (rule: AlertRule) => {
    setActionLoading(rule.id);
    const { error } = await supabase.from("suite_alert_rules").update({ is_active: !rule.is_active }).eq("id", rule.id);
    if (error) toast.error("Failed to toggle rule");
    else {
      toast.success(rule.is_active ? "Rule deactivated" : "Rule activated");
      setRules(prev => prev.map(r => r.id === rule.id ? { ...r, is_active: !r.is_active } : r));
    }
    setActionLoading(null);
  };

  const deleteRule = async (id: string) => {
    setActionLoading(id);
    const { error } = await supabase.from("suite_alert_rules").delete().eq("id", id);
    if (error) toast.error("Failed to delete rule");
    else {
      toast.success("Rule deleted");
      setRules(prev => prev.filter(r => r.id !== id));
    }
    setActionLoading(null);
  };

  const saveRule = async (rule: AlertRule) => {
    setActionLoading(rule.id);
    const { error } = await supabase.from("suite_alert_rules").update({
      name: rule.name,
      severity: rule.severity,
      conditions: rule.conditions as any,
    }).eq("id", rule.id);
    if (error) toast.error("Failed to save");
    else {
      toast.success("Rule saved");
      setRules(prev => prev.map(r => r.id === rule.id ? { ...r, ...rule } : r));
      setEditingRule(null);
    }
    setActionLoading(null);
  };

  const updateCondition = (condIdx: number, field: keyof RuleCondition, value: string) => {
    if (!editingRule) return;
    const updated = [...editingRule.conditions];
    updated[condIdx] = { ...updated[condIdx], [field]: value };
    setEditingRule({ ...editingRule, conditions: updated });
  };

  const addCondition = () => {
    if (!editingRule) return;
    setEditingRule({
      ...editingRule,
      conditions: [...editingRule.conditions, { id: crypto.randomUUID().slice(0, 8), field: "transaction.amount", operator: ">", value: "", logic: "AND", action: "Alert" }],
    });
  };

  const removeCondition = (idx: number) => {
    if (!editingRule) return;
    setEditingRule({ ...editingRule, conditions: editingRule.conditions.filter((_, i) => i !== idx) });
  };

  const filtered = rules.filter(r => {
    const matchOwner = ownerFilter === "all" || r.user_id === ownerFilter;
    const q = search.toLowerCase();
    const matchSearch = !q || r.name.toLowerCase().includes(q) || (r.owner_email || "").toLowerCase().includes(q);
    return matchOwner && matchSearch;
  });

  const severityBadge = (s: string) => {
    const colors: Record<string, string> = {
      critical: "bg-red-50 text-red-700 border-red-200",
      high: "bg-orange-50 text-orange-700 border-orange-200",
      medium: "bg-amber-50 text-amber-700 border-amber-200",
      low: "bg-emerald-50 text-emerald-700 border-emerald-200",
    };
    return <Badge className={colors[s] || ""}>{s}</Badge>;
  };

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-xl font-bold text-foreground">Alert Rules Management</h1>
        <p className="text-xs text-muted-foreground">{rules.length} rules across all users · {rules.filter(r => r.is_active).length} active</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search rules…" className="w-full pl-8 py-2 text-sm rounded-md border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>
        <Select value={ownerFilter} onValueChange={setOwnerFilter}>
          <SelectTrigger className="w-48 text-sm"><SelectValue placeholder="All owners" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All owners</SelectItem>
            {owners.map(o => <SelectItem key={o.user_id} value={o.user_id}>{o.email}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="space-y-3">
          {filtered.map(rule => {
            const isExpanded = expandedRule === rule.id;
            const isEditing = editingRule?.id === rule.id;
            const current = isEditing ? editingRule : rule;

            return (
              <div key={rule.id} className="bg-card rounded-xl border border-border overflow-hidden">
                {/* Header row */}
                <div className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/20 transition-colors" onClick={() => setExpandedRule(isExpanded ? null : rule.id)}>
                  {isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-foreground truncate">{rule.name}</span>
                      {severityBadge(rule.severity)}
                      {rule.is_active
                        ? <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">Active</Badge>
                        : <Badge variant="outline" className="text-xs text-muted-foreground">Inactive</Badge>}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Owner: {rule.owner_email} · {rule.conditions.length} condition{rule.conditions.length !== 1 ? "s" : ""} · Updated {new Date(rule.updated_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => toggleActive(rule)} disabled={actionLoading === rule.id}>
                      {rule.is_active ? <ToggleRight className="w-4 h-4 text-emerald-600" /> : <ToggleLeft className="w-4 h-4 text-muted-foreground" />}
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={() => deleteRule(rule.id)} disabled={actionLoading === rule.id}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="border-t border-border px-4 py-4 space-y-4 bg-muted/10">
                    <div className="flex items-center gap-3">
                      {isEditing ? (
                        <>
                          <Input value={current.name} onChange={e => setEditingRule({ ...editingRule!, name: e.target.value })} className="max-w-xs text-sm" />
                          <Select value={current.severity} onValueChange={v => setEditingRule({ ...editingRule!, severity: v })}>
                            <SelectTrigger className="w-28 text-sm"><SelectValue /></SelectTrigger>
                            <SelectContent>{SEVERITIES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                          </Select>
                        </>
                      ) : (
                        <span className="text-sm text-muted-foreground">Severity: <span className="font-medium text-foreground">{rule.severity}</span></span>
                      )}
                      <div className="ml-auto flex gap-1">
                        {isEditing ? (
                          <>
                            <Button size="sm" variant="default" className="h-7 text-xs" onClick={() => saveRule(editingRule!)} disabled={actionLoading === rule.id}>
                              <Save className="w-3.5 h-3.5 mr-1" />Save
                            </Button>
                            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setEditingRule(null)}>
                              <X className="w-3.5 h-3.5 mr-1" />Cancel
                            </Button>
                          </>
                        ) : (
                          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setEditingRule({ ...rule })}>
                            Edit conditions
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Conditions table */}
                    <div className="rounded-lg border border-border overflow-hidden">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-muted/30 border-b border-border">
                            {["Field", "Operator", "Value", "Logic", "Action", ...(isEditing ? [""] : [])].map(h => (
                              <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground uppercase">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {current.conditions.map((c, idx) => (
                            <tr key={c.id || idx} className="hover:bg-muted/10">
                              <td className="px-3 py-2">
                                {isEditing ? (
                                  <Select value={c.field} onValueChange={v => updateCondition(idx, "field", v)}>
                                    <SelectTrigger className="h-8 text-xs w-44"><SelectValue /></SelectTrigger>
                                    <SelectContent>{FIELDS.map(f => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}</SelectContent>
                                  </Select>
                                ) : <span className="text-xs font-mono">{c.field}</span>}
                              </td>
                              <td className="px-3 py-2">
                                {isEditing ? (
                                  <Select value={c.operator} onValueChange={v => updateCondition(idx, "operator", v)}>
                                    <SelectTrigger className="h-8 text-xs w-24"><SelectValue /></SelectTrigger>
                                    <SelectContent>{OPERATORS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                                  </Select>
                                ) : <Badge variant="outline" className="font-mono text-xs">{c.operator}</Badge>}
                              </td>
                              <td className="px-3 py-2">
                                {isEditing ? (
                                  <Input value={c.value} onChange={e => updateCondition(idx, "value", e.target.value)} className="h-8 text-xs w-40" />
                                ) : <span className="text-xs">{c.value}</span>}
                              </td>
                              <td className="px-3 py-2">
                                {isEditing ? (
                                  <Select value={c.logic} onValueChange={v => updateCondition(idx, "logic", v as "AND" | "OR")}>
                                    <SelectTrigger className="h-8 text-xs w-20"><SelectValue /></SelectTrigger>
                                    <SelectContent><SelectItem value="AND">AND</SelectItem><SelectItem value="OR">OR</SelectItem></SelectContent>
                                  </Select>
                                ) : <Badge variant="secondary" className="text-xs">{c.logic}</Badge>}
                              </td>
                              <td className="px-3 py-2">
                                {isEditing ? (
                                  <Select value={c.action} onValueChange={v => updateCondition(idx, "action", v)}>
                                    <SelectTrigger className="h-8 text-xs w-28"><SelectValue /></SelectTrigger>
                                    <SelectContent>{ACTIONS.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
                                  </Select>
                                ) : <span className="text-xs">{c.action}</span>}
                              </td>
                              {isEditing && (
                                <td className="px-3 py-2">
                                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={() => removeCondition(idx)}>
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {current.conditions.length === 0 && (
                        <div className="text-center py-4 text-xs text-muted-foreground">No conditions defined.</div>
                      )}
                    </div>

                    {isEditing && (
                      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={addCondition}>
                        <Plus className="w-3.5 h-3.5 mr-1" />Add condition
                      </Button>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="text-center py-12 text-sm text-muted-foreground">No alert rules found.</div>
          )}
        </div>
      )}
    </div>
  );
}
