import { useState, useEffect, useRef, useMemo, Fragment } from "react";
import { cn } from "@/lib/utils";
import { AlertTriangle, TrendingUp, Globe, RefreshCw, Plus, Upload, FileText, Sparkles, X, Check, Loader2, ChevronDown, ChevronRight, Shield, Clock, Eye, Filter, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
  monitoring_status: string;
}

interface AlertRow {
  id: string;
  title: string;
  severity: string;
  status: string;
  created_at: string;
  rule_id: string | null;
  description: string | null;
  rule_name?: string;
}

interface RuleInfo { id: string; name: string; severity: string; }

interface Customer { id: string; name: string; risk_level?: string; country?: string; }

interface BulkRow {
  customer_name: string;
  amount: string;
  currency: string;
  direction: string;
  counterparty: string;
  counterparty_country: string;
  description: string;
  date: string;
}

interface AIAnalysis {
  summary: string;
  flagged_patterns: { pattern: string; severity: string; affected_count: number }[];
  suggested_rules: { name: string; severity: string; conditions: { field: string; operator: string; value: string }[]; rationale: string }[];
}

const HIGH_RISK = ["RU", "IR", "PA", "KP", "SY"];
const EMPTY_BULK: BulkRow = { customer_name: "", amount: "", currency: "EUR", direction: "inbound", counterparty: "", counterparty_country: "", description: "", date: "" };

const triggerMonitoring = async (userId: string, transactionId: string) => {
  try {
    await supabase.functions.invoke("evaluate-transactions", {
      body: { user_id: userId, transaction_ids: [transactionId] },
    });
  } catch { console.warn("Transaction monitoring evaluation deferred"); }
};

export default function SuiteTransactions() {
  const [txs, setTxs] = useState<TxRow[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"All" | "flagged" | "clean">("All");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ customer_id: "", amount: "", currency: "EUR", direction: "inbound", counterparty: "", counterparty_country: "", description: "" });

  // Import state
  const [showImport, setShowImport] = useState(false);
  const [importMode, setImportMode] = useState<"csv" | "manual">("csv");
  const [csvData, setCsvData] = useState<BulkRow[]>([]);
  const [bulkRows, setBulkRows] = useState<BulkRow[]>([{ ...EMPTY_BULK }]);
  const [importing, setImporting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // AI state
  const [showAI, setShowAI] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [savingRules, setSavingRules] = useState<Set<number>>(new Set());

  // Detail expand state
  const [expandedTx, setExpandedTx] = useState<string | null>(null);
  const [txAlerts, setTxAlerts] = useState<Record<string, AlertRow[]>>({});
  const [alertsLoading, setAlertsLoading] = useState<string | null>(null);
  const [rulesMap, setRulesMap] = useState<Record<string, RuleInfo>>({});
  const [ruleFilter, setRuleFilter] = useState<string>("all");
  const [ruleTxMap, setRuleTxMap] = useState<Record<string, Set<string>>>({});
  const [showRulesPanel, setShowRulesPanel] = useState(false);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const [tRes, cRes, rRes, aRes] = await Promise.all([
      supabase.from("suite_transactions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(500),
      supabase.from("suite_customers").select("id, name, risk_level, country").eq("user_id", user.id),
      supabase.from("suite_alert_rules").select("id, name, severity").eq("user_id", user.id),
      supabase.from("suite_alerts").select("rule_id, transaction_id").eq("user_id", user.id).not("rule_id", "is", null).not("transaction_id", "is", null),
    ]);
    setTxs(tRes.data || []);
    setCustomers(cRes.data || []);
    const rm: Record<string, RuleInfo> = {};
    (rRes.data || []).forEach((r: RuleInfo) => { rm[r.id] = r; });
    setRulesMap(rm);
    // Build rule → transaction_id set
    const rtm: Record<string, Set<string>> = {};
    (aRes.data || []).forEach((a: any) => {
      if (!rtm[a.rule_id]) rtm[a.rule_id] = new Set();
      rtm[a.rule_id].add(a.transaction_id);
    });
    setRuleTxMap(rtm);
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
      customer_id: form.customer_id, user_id: user.id, amount, currency: form.currency, direction: form.direction,
      counterparty: form.counterparty || null, counterparty_country: form.counterparty_country || null, risk_flag: riskFlag, description: form.description || null,
    }).select().single();

    if (error) { toast.error(error.message); return; }
    await supabase.from("suite_audit_log").insert({ user_id: user.id, action: `Transaction recorded: ${form.currency} ${amount} ${form.direction}`, entity_type: "transaction", details: { detail: `Counterparty: ${form.counterparty || "N/A"}, Country: ${form.counterparty_country || "N/A"}` } });
    if (riskFlag) {
      await supabase.from("suite_alerts").insert({ customer_id: form.customer_id, user_id: user.id, alert_type: "transaction", severity: amount > 30000 ? "critical" : "high", title: `Flagged transaction: ${form.currency} ${amount.toLocaleString()}`, description: `${form.direction} transaction${isHighRisk ? " to high-risk jurisdiction (" + form.counterparty_country + ")" : ""} exceeds threshold` });
    }
    if (data) triggerMonitoring(user.id, data.id);
    toast.success("Transaction recorded");
    setForm({ customer_id: form.customer_id, amount: "", currency: "EUR", direction: "inbound", counterparty: "", counterparty_country: "", description: "" });
    setShowForm(false);
    fetchData();
  };

  // CSV parsing
  const parseCSV = (text: string): BulkRow[] => {
    const lines = text.trim().split("\n");
    if (lines.length < 2) return [];
    const headers = lines[0].split(",").map(h => h.trim().toLowerCase().replace(/[^a-z_]/g, ""));
    const fieldMap: Record<string, keyof BulkRow> = {
      customer: "customer_name", customer_name: "customer_name", name: "customer_name",
      amount: "amount", currency: "currency", direction: "direction",
      counterparty: "counterparty", counterparty_country: "counterparty_country", country: "counterparty_country",
      description: "description", desc: "description",
      date: "date", transaction_date: "date", created_at: "date", executed_at: "date", execution_date: "date",
    };
    return lines.slice(1).filter(l => l.trim()).map(line => {
      const cols = line.split(",").map(c => c.trim().replace(/^["']|["']$/g, ""));
      const row: BulkRow = { ...EMPTY_BULK };
      headers.forEach((h, i) => {
        const key = fieldMap[h];
        if (key && cols[i]) (row as any)[key] = cols[i];
      });
      return row;
    }).filter(r => r.amount && r.customer_name);
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const rows = parseCSV(text);
      if (rows.length === 0) { toast.error("No valid rows found. Ensure CSV has headers: customer_name, amount, currency, direction, counterparty, counterparty_country, description"); return; }
      setCsvData(rows);
      toast.success(`${rows.length} rows parsed from CSV`);
    };
    reader.readAsText(file);
    if (fileRef.current) fileRef.current.value = "";
  };

  const importTransactions = async (rows: BulkRow[]) => {
    if (rows.length === 0) { toast.error("No rows to import"); return; }
    setImporting(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setImporting(false); return; }

    const customerMap = new Map(customers.map(c => [c.name.toLowerCase(), c.id]));
    let imported = 0, skipped = 0;

    for (const row of rows) {
      const custId = customerMap.get(row.customer_name.toLowerCase());
      if (!custId) { skipped++; continue; }
      const amount = parseFloat(row.amount);
      if (isNaN(amount)) { skipped++; continue; }
      const isHighRisk = HIGH_RISK.includes((row.counterparty_country || "").toUpperCase());
      const riskFlag = isHighRisk || amount > 10000;

      const parsedDate = row.date ? new Date(row.date) : null;
      const createdAt = parsedDate && !isNaN(parsedDate.getTime()) ? parsedDate.toISOString() : undefined;

      const { data, error } = await supabase.from("suite_transactions").insert({
        customer_id: custId, user_id: user.id, amount, currency: row.currency || "EUR",
        direction: row.direction || "inbound", counterparty: row.counterparty || null,
        counterparty_country: row.counterparty_country || null, risk_flag: riskFlag,
        description: row.description || null,
        ...(createdAt ? { created_at: createdAt } : {}),
      }).select("id").single();

      if (!error && data) {
        imported++;
        if (riskFlag) {
          await supabase.from("suite_alerts").insert({ customer_id: custId, user_id: user.id, alert_type: "transaction", severity: amount > 30000 ? "critical" : "high", title: `Flagged import: ${row.currency || "EUR"} ${amount.toLocaleString()}`, description: `Imported transaction flagged${isHighRisk ? " (high-risk jurisdiction)" : ""}` });
        }
      } else { skipped++; }
    }

    await supabase.from("suite_audit_log").insert({ user_id: user.id, action: `Bulk import: ${imported} transactions imported, ${skipped} skipped`, entity_type: "transaction", details: { imported, skipped, total: rows.length } });

    toast.success(`Imported ${imported} transactions${skipped > 0 ? `, ${skipped} skipped` : ""}`);
    setImporting(false);
    setShowImport(false);
    setCsvData([]);
    setBulkRows([{ ...EMPTY_BULK }]);
    fetchData();
  };

  // AI analysis
  const runAIAnalysis = async () => {
    setAiLoading(true);
    setAiAnalysis(null);
    try {
      const { data, error } = await supabase.functions.invoke("suggest-rules");
      if (error) throw error;
      if (data?.error) { toast.error(data.error); setAiLoading(false); return; }
      setAiAnalysis(data);
      setShowAI(true);
    } catch (err: any) {
      toast.error(err?.message || "AI analysis failed");
    }
    setAiLoading(false);
  };

  const saveRule = async (index: number) => {
    if (!aiAnalysis) return;
    const rule = aiAnalysis.suggested_rules[index];
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setSavingRules(prev => new Set(prev).add(index));

    const { error } = await supabase.from("suite_alert_rules").insert({
      user_id: user.id, name: rule.name, severity: rule.severity, conditions: rule.conditions as any, is_active: true,
    });

    if (error) toast.error(error.message);
    else toast.success(`Rule "${rule.name}" created`);
    setSavingRules(prev => { const s = new Set(prev); s.delete(index); return s; });
  };

  const customerName = (id: string) => customers.find(c => c.id === id)?.name || "Unknown";
  const customerInfo = (id: string) => customers.find(c => c.id === id);
  const filtered = useMemo(() => {
    let list = filter === "All" ? txs : filter === "flagged" ? txs.filter(t => t.risk_flag) : txs.filter(t => !t.risk_flag);
    if (ruleFilter !== "all" && ruleTxMap[ruleFilter]) {
      const txIds = ruleTxMap[ruleFilter];
      list = list.filter(t => txIds.has(t.id));
    }
    return list;
  }, [txs, filter, ruleFilter, ruleTxMap]);
  const stats = { total: txs.length, flagged: txs.filter(t => t.risk_flag).length, volume: txs.reduce((s, t) => s + Number(t.amount), 0) };

  const toggleExpand = async (txId: string) => {
    if (expandedTx === txId) { setExpandedTx(null); return; }
    setExpandedTx(txId);
    if (!txAlerts[txId]) {
      setAlertsLoading(txId);
      const { data } = await supabase.from("suite_alerts").select("id, title, severity, status, created_at, rule_id, description").eq("transaction_id", txId).order("created_at", { ascending: false });
      const enriched = (data || []).map((a: any) => ({
        ...a,
        rule_name: a.rule_id && rulesMap[a.rule_id] ? rulesMap[a.rule_id].name : null,
      }));
      setTxAlerts(prev => ({ ...prev, [txId]: enriched as AlertRow[] }));
      setAlertsLoading(null);
    }
  };

  const statusColor = (s: string) => {
    if (s === "flagged") return "bg-destructive/10 text-destructive border-destructive/20";
    if (s === "clear") return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (s === "reviewed") return "bg-blue-50 text-blue-700 border-blue-200";
    return "bg-muted text-muted-foreground border-border";
  };

  const riskColor = (r?: string) => {
    if (r === "critical") return "text-destructive font-bold";
    if (r === "high") return "text-orange-600 font-semibold";
    if (r === "medium") return "text-amber-600 font-medium";
    return "text-emerald-600";
  };

  const sevColor = (s: string) => s === "critical" ? "bg-red-100 text-red-800 border-red-200" : s === "high" ? "bg-orange-100 text-orange-800 border-orange-200" : s === "medium" ? "bg-yellow-100 text-yellow-800 border-yellow-200" : "bg-blue-100 text-blue-800 border-blue-200";

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-foreground">Transaction Monitor</span>
          <span className="text-xs text-muted-foreground">{txs.length} records</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="text-xs h-7 gap-1.5" onClick={() => { setShowImport(!showImport); setShowAI(false); }}>
            <Upload className="w-3 h-3" />Import
          </Button>
          <Button variant="outline" size="sm" className="text-xs h-7 gap-1.5" onClick={async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            toast.info("Running rule engine…");
            const { data, error } = await supabase.functions.invoke("evaluate-transactions", { body: { user_id: user.id, force: true } });
            if (error) { toast.error("Rule engine failed"); return; }
            toast.success(`Evaluated ${data?.evaluated || 0} transactions, ${data?.alerts_created || 0} alerts created`);
            fetchData();
          }} disabled={txs.length === 0}>
            <RefreshCw className="w-3 h-3" />Run Rules
          </Button>
          <Button variant="outline" size="sm" className="text-xs h-7 gap-1.5" onClick={() => { runAIAnalysis(); setShowImport(false); }} disabled={aiLoading || txs.length === 0}>
            {aiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
            AI Suggest Rules
          </Button>
          <Button size="sm" className="text-xs h-7 gap-1.5" onClick={() => { setShowForm(!showForm); setShowImport(false); setShowAI(false); }}>
            <Plus className="w-3 h-3" />Add Transaction
          </Button>
          <Button variant="ghost" size="sm" className="text-xs h-7" onClick={fetchData}><RefreshCw className="w-3 h-3" /></Button>
        </div>
      </div>

      {/* AI Analysis Panel */}
      {showAI && aiAnalysis && (
        <div className="px-5 py-4 border-b border-border bg-card animate-fade-in max-h-[400px] overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-foreground text-sm">AI Risk Analysis</h3>
            </div>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setShowAI(false)}><X className="w-3.5 h-3.5" /></Button>
          </div>

          {/* Summary */}
          <div className="bg-muted/50 rounded-lg p-3 mb-4">
            <p className="text-xs text-foreground leading-relaxed">{aiAnalysis.summary}</p>
          </div>

          {/* Flagged Patterns */}
          {aiAnalysis.flagged_patterns?.length > 0 && (
            <div className="mb-4">
              <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">Detected Patterns</h4>
              <div className="space-y-1.5">
                {aiAnalysis.flagged_patterns.map((p, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span className={cn("px-1.5 py-0.5 rounded border text-[10px] font-medium", sevColor(p.severity))}>{p.severity}</span>
                    <span className="text-foreground flex-1">{p.pattern}</span>
                    <span className="text-muted-foreground font-mono">{p.affected_count} txn{p.affected_count !== 1 ? "s" : ""}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Suggested Rules */}
          {aiAnalysis.suggested_rules?.length > 0 && (
            <div>
              <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">Suggested Alert Rules</h4>
              <div className="space-y-2">
                {aiAnalysis.suggested_rules.map((rule, i) => (
                  <div key={i} className="border border-border rounded-lg p-3 bg-background">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-foreground">{rule.name}</span>
                          <span className={cn("px-1.5 py-0.5 rounded border text-[10px] font-medium", sevColor(rule.severity))}>{rule.severity}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mb-1.5">{rule.rationale}</p>
                        <div className="flex flex-wrap gap-1">
                          {rule.conditions.map((c, ci) => (
                            <span key={ci} className="text-[10px] px-1.5 py-0.5 bg-muted rounded font-mono">{c.field} {c.operator} {typeof c.value === "object" ? JSON.stringify(c.value) : c.value}</span>
                          ))}
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="text-xs h-7 shrink-0 gap-1" onClick={() => saveRule(i)} disabled={savingRules.has(i)}>
                        {savingRules.has(i) ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                        Save Rule
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Import Panel */}
      {showImport && (
        <div className="px-5 py-4 border-b border-border bg-card animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-foreground text-sm">Import Transactions</h3>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => { setShowImport(false); setCsvData([]); }}><X className="w-3.5 h-3.5" /></Button>
          </div>

          {/* Mode toggle */}
          <div className="flex gap-1 mb-3">
            {(["csv", "manual"] as const).map(m => (
              <button key={m} onClick={() => setImportMode(m)} className={cn("text-xs px-3 py-1 rounded-full border font-medium capitalize", importMode === m ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground border-border")}>
                {m === "csv" ? "CSV Upload" : "Manual Entry"}
              </button>
            ))}
          </div>

          {importMode === "csv" ? (
            <div>
              {csvData.length === 0 ? (
                <div>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors" onClick={() => fileRef.current?.click()}>
                    <FileText className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground mb-1">Click to upload CSV file</p>
                    <p className="text-[10px] text-muted-foreground">Expected columns: customer_name, amount, currency, direction, counterparty, counterparty_country, description</p>
                  </div>
                  <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleCSVUpload} />
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">{csvData.length} rows ready to import</span>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => setCsvData([])}>Clear</Button>
                      <Button size="sm" className="text-xs h-7" onClick={() => importTransactions(csvData)} disabled={importing}>
                        {importing ? <><Loader2 className="w-3 h-3 animate-spin mr-1" />Importing…</> : `Import ${csvData.length} rows`}
                      </Button>
                    </div>
                  </div>
                  <div className="max-h-[200px] overflow-y-auto border border-border rounded-lg">
                    <table className="w-full text-[11px]">
                      <thead className="bg-muted sticky top-0">
                        <tr>{["Customer", "Amount", "Currency", "Dir", "Counterparty", "Country"].map(h => <th key={h} className="px-2 py-1.5 text-left font-semibold text-muted-foreground">{h}</th>)}</tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {csvData.slice(0, 50).map((r, i) => {
                          const matched = customers.some(c => c.name.toLowerCase() === r.customer_name.toLowerCase());
                          return (
                            <tr key={i} className={cn(!matched && "bg-red-50/30")}>
                              <td className="px-2 py-1">
                                <span className={cn(!matched && "text-destructive")}>{r.customer_name}</span>
                                {!matched && <span className="text-[9px] text-destructive ml-1">(not found)</span>}
                              </td>
                              <td className="px-2 py-1 font-mono">{r.amount}</td>
                              <td className="px-2 py-1">{r.currency}</td>
                              <td className="px-2 py-1">{r.direction}</td>
                              <td className="px-2 py-1">{r.counterparty}</td>
                              <td className="px-2 py-1">{r.counterparty_country}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    {csvData.length > 50 && <p className="text-[10px] text-center text-muted-foreground py-1">…and {csvData.length - 50} more</p>}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="max-h-[250px] overflow-y-auto space-y-2 mb-3">
                {bulkRows.map((row, i) => (
                  <div key={i} className="grid grid-cols-7 gap-2 items-end">
                    <div>
                      {i === 0 && <label className="text-[10px] font-medium text-muted-foreground mb-0.5 block">Customer *</label>}
                      <select value={row.customer_name} onChange={e => { const r = [...bulkRows]; r[i] = { ...r[i], customer_name: e.target.value }; setBulkRows(r); }} className="w-full border border-border rounded px-2 py-1.5 text-xs bg-background text-foreground">
                        <option value="">Select…</option>
                        {customers.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                      </select>
                    </div>
                    <div>
                      {i === 0 && <label className="text-[10px] font-medium text-muted-foreground mb-0.5 block">Amount *</label>}
                      <input type="number" value={row.amount} onChange={e => { const r = [...bulkRows]; r[i] = { ...r[i], amount: e.target.value }; setBulkRows(r); }} className="w-full border border-border rounded px-2 py-1.5 text-xs bg-background text-foreground" placeholder="0" />
                    </div>
                    <div>
                      {i === 0 && <label className="text-[10px] font-medium text-muted-foreground mb-0.5 block">Currency</label>}
                      <select value={row.currency} onChange={e => { const r = [...bulkRows]; r[i] = { ...r[i], currency: e.target.value }; setBulkRows(r); }} className="w-full border border-border rounded px-2 py-1.5 text-xs bg-background text-foreground">
                        {["EUR", "USD", "GBP", "CHF"].map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      {i === 0 && <label className="text-[10px] font-medium text-muted-foreground mb-0.5 block">Direction</label>}
                      <select value={row.direction} onChange={e => { const r = [...bulkRows]; r[i] = { ...r[i], direction: e.target.value }; setBulkRows(r); }} className="w-full border border-border rounded px-2 py-1.5 text-xs bg-background text-foreground">
                        <option value="inbound">Inbound</option><option value="outbound">Outbound</option>
                      </select>
                    </div>
                    <div>
                      {i === 0 && <label className="text-[10px] font-medium text-muted-foreground mb-0.5 block">Counterparty</label>}
                      <input value={row.counterparty} onChange={e => { const r = [...bulkRows]; r[i] = { ...r[i], counterparty: e.target.value }; setBulkRows(r); }} className="w-full border border-border rounded px-2 py-1.5 text-xs bg-background text-foreground" />
                    </div>
                    <div>
                      {i === 0 && <label className="text-[10px] font-medium text-muted-foreground mb-0.5 block">Country</label>}
                      <input value={row.counterparty_country} onChange={e => { const r = [...bulkRows]; r[i] = { ...r[i], counterparty_country: e.target.value }; setBulkRows(r); }} placeholder="DE" className="w-full border border-border rounded px-2 py-1.5 text-xs bg-background text-foreground" />
                    </div>
                    <div className="flex gap-1">
                      {bulkRows.length > 1 && <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive" onClick={() => setBulkRows(bulkRows.filter((_, j) => j !== i))}><X className="w-3 h-3" /></Button>}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between">
                <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => setBulkRows([...bulkRows, { ...EMPTY_BULK }])}>
                  <Plus className="w-3 h-3 mr-1" />Add Row
                </Button>
                <Button size="sm" className="text-xs h-7" onClick={() => importTransactions(bulkRows.filter(r => r.customer_name && r.amount))} disabled={importing}>
                  {importing ? <><Loader2 className="w-3 h-3 animate-spin mr-1" />Importing…</> : `Import ${bulkRows.filter(r => r.customer_name && r.amount).length} rows`}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Single add form */}
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
                <option value="inbound">Inbound</option><option value="outbound">Outbound</option>
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
              <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button size="sm" onClick={addTransaction}>Save</Button>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
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

      {/* Filters */}
      <div className="flex items-center gap-3 px-5 py-2 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-1.5">
          {(["All", "flagged", "clean"] as const).map(s => (
            <button key={s} onClick={() => setFilter(s)} className={cn("text-xs px-3 py-1 rounded-full border font-medium transition-colors capitalize", filter === s ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground border-border hover:border-primary hover:text-primary")}>
              {s}
            </button>
          ))}
        </div>
        <div className="h-4 w-px bg-border" />
        <div className="flex items-center gap-1.5">
          <Filter className="w-3 h-3 text-muted-foreground" />
          <select
            value={ruleFilter}
            onChange={e => setRuleFilter(e.target.value)}
            className={cn("text-xs border rounded-md px-2 py-1 bg-background text-foreground min-w-[180px]", ruleFilter !== "all" && "border-primary text-primary font-medium")}
          >
            <option value="all">All Rules</option>
            {Object.values(rulesMap).map(r => (
              <option key={r.id} value={r.id}>
                {r.name} ({ruleTxMap[r.id]?.size || 0})
              </option>
            ))}
          </select>
          {ruleFilter !== "all" && (
            <button onClick={() => setRuleFilter("all")} className="text-muted-foreground hover:text-foreground">
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
        <div className="h-4 w-px bg-border" />
        <button
          onClick={() => setShowRulesPanel(!showRulesPanel)}
          className={cn("flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border font-medium transition-colors", showRulesPanel ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground border-border hover:border-primary hover:text-primary")}
        >
          <BookOpen className="w-3 h-3" />
          Rules ({Object.keys(rulesMap).length})
          {showRulesPanel ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        </button>
      </div>

      {/* Expandable Rules Panel */}
      {showRulesPanel && (
        <div className="px-5 py-3 border-b border-border bg-card animate-fade-in max-h-[300px] overflow-y-auto shrink-0">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-primary" />
              Active Alert Rules ({Object.keys(rulesMap).length})
            </h3>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setShowRulesPanel(false)}>
              <X className="w-3.5 h-3.5" />
            </Button>
          </div>
          {Object.keys(rulesMap).length === 0 ? (
            <p className="text-xs text-muted-foreground py-2">No rules configured. Use "AI Suggest Rules" to get started.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {Object.values(rulesMap).map(rule => {
                const txCount = ruleTxMap[rule.id]?.size || 0;
                const isSelected = ruleFilter === rule.id;
                return (
                  <div
                    key={rule.id}
                    onClick={() => setRuleFilter(isSelected ? "all" : rule.id)}
                    className={cn(
                      "border rounded-lg p-2.5 cursor-pointer transition-all",
                      isSelected
                        ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                        : "border-border bg-background hover:border-primary/40 hover:bg-muted/30"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="text-[11px] font-semibold text-foreground leading-tight truncate flex-1">{rule.name}</span>
                      <span className={cn("px-1.5 py-0.5 rounded border text-[9px] font-medium shrink-0", sevColor(rule.severity))}>{rule.severity}</span>
                    </div>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-[10px] font-mono text-muted-foreground">ID: {rule.id.slice(0, 8)}…</span>
                      <span className={cn("text-[10px] font-semibold", txCount > 0 ? "text-destructive" : "text-emerald-600")}>
                        {txCount} hit{txCount !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <p className="text-sm text-muted-foreground text-center py-8">Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No transactions yet. Add one above.</p>
        ) : (
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-card border-b border-border z-10">
              <tr>
                <th className="px-2 py-2.5 w-6"></th>
                {["Date", "Customer", "Direction", "Amount", "Counterparty", "Country", "Status", "Risk"].map(h => (
                  <th key={h} className="px-3 py-2.5 text-left font-semibold text-muted-foreground uppercase tracking-wide text-[10px]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(tx => {
                const isExpanded = expandedTx === tx.id;
                const cust = customerInfo(tx.customer_id);
                const alerts = txAlerts[tx.id] || [];
                return (
                  <Fragment key={tx.id}>
                    <tr key={tx.id} className={cn("hover:bg-muted/30 transition-colors cursor-pointer", tx.risk_flag && "bg-destructive/5")} onClick={() => toggleExpand(tx.id)}>
                      <td className="px-2 py-2.5 text-muted-foreground">
                        {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                      </td>
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
                        <span className={cn("px-2 py-0.5 rounded border font-medium text-[10px] capitalize", statusColor(tx.monitoring_status))}>
                          {tx.monitoring_status}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className={cn("px-2 py-0.5 rounded border font-medium text-[10px]", tx.risk_flag ? "bg-destructive/10 text-destructive border-destructive/20" : "bg-emerald-50 text-emerald-700 border-emerald-200")}>
                          {tx.risk_flag ? "Flagged" : "Clean"}
                        </span>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr key={`${tx.id}-detail`} className="bg-muted/20">
                        <td colSpan={9} className="px-6 py-4">
                          <div className="grid grid-cols-3 gap-6">
                            {/* Transaction Details */}
                            <div>
                              <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
                                <Eye className="w-3 h-3" /> Transaction Details
                              </h4>
                              <div className="space-y-1.5 text-xs">
                                <div className="flex justify-between"><span className="text-muted-foreground">ID</span><span className="font-mono text-foreground text-[10px]">{tx.id.slice(0, 8)}…</span></div>
                                <div className="flex justify-between"><span className="text-muted-foreground">Amount</span><span className="font-mono font-bold text-foreground">{tx.currency} {Number(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
                                <div className="flex justify-between"><span className="text-muted-foreground">Direction</span><span className="capitalize text-foreground">{tx.direction}</span></div>
                                <div className="flex justify-between"><span className="text-muted-foreground">Counterparty</span><span className="text-foreground">{tx.counterparty || "—"}</span></div>
                                <div className="flex justify-between"><span className="text-muted-foreground">Country</span><span className={cn("text-foreground", tx.counterparty_country && HIGH_RISK.includes(tx.counterparty_country.toUpperCase()) && "text-destructive font-semibold")}>{tx.counterparty_country || "—"}</span></div>
                                <div className="flex justify-between"><span className="text-muted-foreground">Date</span><span className="font-mono text-foreground">{new Date(tx.created_at).toLocaleString("en-GB")}</span></div>
                                {tx.description && <div className="pt-1 border-t border-border"><span className="text-muted-foreground">Note:</span> <span className="text-foreground">{tx.description}</span></div>}
                              </div>
                            </div>

                            {/* Customer Info */}
                            <div>
                              <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
                                <Shield className="w-3 h-3" /> Customer Profile
                              </h4>
                              <div className="space-y-1.5 text-xs">
                                <div className="flex justify-between"><span className="text-muted-foreground">Name</span><span className="text-foreground font-medium">{cust?.name || "Unknown"}</span></div>
                                <div className="flex justify-between"><span className="text-muted-foreground">Risk Level</span><span className={riskColor(cust?.risk_level)}>{cust?.risk_level || "—"}</span></div>
                                <div className="flex justify-between"><span className="text-muted-foreground">Country</span><span className="text-foreground">{cust?.country || "—"}</span></div>
                              </div>
                            </div>

                            {/* Triggered Rules & Alerts */}
                            <div>
                              <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
                                <AlertTriangle className="w-3 h-3" /> Rules Triggered ({alertsLoading === tx.id ? "…" : alerts.length})
                              </h4>
                              {alertsLoading === tx.id ? (
                                <div className="flex items-center gap-2 text-xs text-muted-foreground"><Loader2 className="w-3 h-3 animate-spin" /> Loading…</div>
                              ) : alerts.length === 0 ? (
                                <p className="text-xs text-muted-foreground">No rules triggered for this transaction.</p>
                              ) : (
                                <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
                                  {alerts.map(a => (
                                    <div key={a.id} className="border border-border rounded p-2 bg-background">
                                      <div className="flex items-center gap-1.5 mb-0.5">
                                        <span className={cn("px-1.5 py-0.5 rounded border text-[9px] font-medium", sevColor(a.severity))}>{a.severity}</span>
                                        {a.rule_name ? (
                                          <span className="text-[11px] font-semibold text-foreground truncate">{a.rule_name}</span>
                                        ) : (
                                          <span className="text-[11px] font-medium text-foreground truncate">{a.title}</span>
                                        )}
                                      </div>
                                      {a.rule_id && (
                                        <div className="text-[9px] text-muted-foreground font-mono mt-0.5">Rule ID: {a.rule_id.slice(0, 8)}…</div>
                                      )}
                                      {a.description && <p className="text-[10px] text-muted-foreground mt-0.5">{a.description}</p>}
                                      <div className="flex items-center gap-2 mt-1">
                                        <span className={cn("px-1.5 py-0.5 rounded text-[9px] capitalize", a.status === "open" ? "bg-amber-50 text-amber-700" : "bg-muted text-muted-foreground")}>{a.status}</span>
                                        <span className="text-[9px] text-muted-foreground font-mono">{new Date(a.created_at).toLocaleString("en-GB", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
