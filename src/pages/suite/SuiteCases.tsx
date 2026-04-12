import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { FileText, ChevronRight, Search, Plus, MessageSquare, Download, Flag, MapPin, AlertTriangle, Shield, CheckCircle2, XCircle, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { exportSAR } from "@/services/sarExport";
import { exportFINTRACStr } from "@/services/fintracStrExport";

/* ── FINTRAC STR Field Mapping ── */
interface FieldMapping {
  fintracField: string;
  fintracPart: string;
  description: string;
  sourceTable: string;
  sourceColumn: string | null;
  required: boolean;
}

const FINTRAC_FIELD_MAP: FieldMapping[] = [
  // Part A — Report Identification
  { fintracPart: "A", fintracField: "Report Reference Number", description: "Unique identifier assigned by reporting entity", sourceTable: "suite_cases", sourceColumn: "id", required: true },
  { fintracPart: "A", fintracField: "Report Type", description: "STR, LCTR, or EFTR", sourceTable: "system", sourceColumn: "strType", required: true },
  { fintracPart: "A", fintracField: "Reporting Entity Name", description: "Legal name of the reporting entity", sourceTable: "profiles", sourceColumn: "company_name", required: true },
  { fintracPart: "A", fintracField: "CAMLO / Reporting Officer", description: "Name of the compliance officer filing", sourceTable: "auth.users", sourceColumn: "email", required: true },
  { fintracPart: "A", fintracField: "Report Date", description: "Date the report is generated", sourceTable: "system", sourceColumn: "now()", required: true },
  { fintracPart: "A", fintracField: "Filing Deadline", description: "3 business days (STR) or 15 calendar days (LCTR/EFTR)", sourceTable: "system", sourceColumn: "computed", required: true },
  // Part B — Subject Information
  { fintracPart: "B", fintracField: "Subject Full Legal Name", description: "Individual or entity name", sourceTable: "suite_customers", sourceColumn: "name", required: true },
  { fintracPart: "B", fintracField: "Subject Type", description: "Individual or legal entity", sourceTable: "suite_customers", sourceColumn: "type", required: true },
  { fintracPart: "B", fintracField: "Date of Birth", description: "For individuals only", sourceTable: "suite_customers", sourceColumn: "date_of_birth", required: false },
  { fintracPart: "B", fintracField: "Country of Residence", description: "Country of residence or incorporation", sourceTable: "suite_customers", sourceColumn: "country", required: true },
  { fintracPart: "B", fintracField: "Business Operating Name", description: "Trade name if different from legal name", sourceTable: "suite_customers", sourceColumn: "company_name", required: false },
  { fintracPart: "B", fintracField: "Business Registration No.", description: "Corporate registration number", sourceTable: "suite_customers", sourceColumn: "registration_number", required: false },
  { fintracPart: "B", fintracField: "Email / Contact", description: "Email address or phone", sourceTable: "suite_customers", sourceColumn: "email", required: false },
  { fintracPart: "B", fintracField: "Risk Classification", description: "Client risk level (low/medium/high/critical)", sourceTable: "suite_customers", sourceColumn: "risk_level", required: true },
  // Part C — Transaction Details (Starting Action)
  { fintracPart: "C", fintracField: "Transaction Date", description: "Date of each transaction", sourceTable: "suite_transactions", sourceColumn: "created_at", required: true },
  { fintracPart: "C", fintracField: "Transaction Amount", description: "Value of funds or virtual currency", sourceTable: "suite_transactions", sourceColumn: "amount", required: true },
  { fintracPart: "C", fintracField: "Currency", description: "Currency code (CAD, USD, EUR, etc.)", sourceTable: "suite_transactions", sourceColumn: "currency", required: true },
  { fintracPart: "C", fintracField: "Direction (In/Out)", description: "Whether funds flow inbound or outbound", sourceTable: "suite_transactions", sourceColumn: "direction", required: true },
  { fintracPart: "C", fintracField: "Counterparty Name", description: "Person or entity on the other side", sourceTable: "suite_transactions", sourceColumn: "counterparty", required: true },
  { fintracPart: "C", fintracField: "Counterparty Country", description: "Country of the counterparty", sourceTable: "suite_transactions", sourceColumn: "counterparty_country", required: true },
  { fintracPart: "C", fintracField: "Transaction Description", description: "Purpose or nature of the transaction", sourceTable: "suite_transactions", sourceColumn: "description", required: false },
  { fintracPart: "C", fintracField: "Monitoring Status", description: "Whether flagged by monitoring rules", sourceTable: "suite_transactions", sourceColumn: "monitoring_status", required: false },
  { fintracPart: "C", fintracField: "Risk Flag", description: "Whether the transaction was risk-flagged", sourceTable: "suite_transactions", sourceColumn: "risk_flag", required: false },
  // Part C — Starting Action (missing from DB)
  { fintracPart: "C-SA", fintracField: "Method of Transaction", description: "In-person, online, telephone, mail, etc.", sourceTable: "suite_transactions", sourceColumn: null, required: true },
  { fintracPart: "C-SA", fintracField: "Source of Funds", description: "How the conductor obtained the funds", sourceTable: "suite_transactions", sourceColumn: null, required: true },
  { fintracPart: "C-SA", fintracField: "Conductor Name", description: "Person who physically conducted the transaction", sourceTable: "suite_transactions", sourceColumn: null, required: true },
  { fintracPart: "C-SA", fintracField: "Third Party Indicator", description: "Whether transaction was on behalf of a third party", sourceTable: "suite_transactions", sourceColumn: null, required: true },
  // Part C — Completing Action (missing from DB)
  { fintracPart: "C-CA", fintracField: "Disposition Details", description: "How the funds were ultimately used", sourceTable: "suite_transactions", sourceColumn: null, required: true },
  { fintracPart: "C-CA", fintracField: "Beneficiary Name", description: "Person or entity who benefited from the transaction", sourceTable: "suite_transactions", sourceColumn: null, required: true },
  // Part D — Grounds for Suspicion
  { fintracPart: "D", fintracField: "Suspicion Type", description: "ML, TF, or sanctions evasion", sourceTable: "manual", sourceColumn: null, required: true },
  { fintracPart: "D", fintracField: "ML/TF Indicators", description: "Checkboxes from FINTRAC indicator guidance", sourceTable: "system", sourceColumn: "indicators_checklist", required: true },
  { fintracPart: "D", fintracField: "PEP Status", description: "Whether subject is a politically exposed person", sourceTable: "suite_customers", sourceColumn: null, required: true },
  // Part E — Narrative
  { fintracPart: "E", fintracField: "Investigation Narrative", description: "Facts + context + indicators = grounds", sourceTable: "suite_case_notes", sourceColumn: "content", required: true },
  // Part F — Declaration
  { fintracPart: "F", fintracField: "CAMLO Signature", description: "Physical or electronic signature", sourceTable: "manual", sourceColumn: null, required: true },
  { fintracPart: "F", fintracField: "Action Taken", description: "Steps taken: enhanced monitoring, account freeze, etc.", sourceTable: "manual", sourceColumn: null, required: true },
];

function getFieldStatus(field: FieldMapping, customer: any, transactions: any[], notes: any[]): "mapped" | "partial" | "missing" {
  if (field.sourceTable === "manual" || field.sourceTable === "system") {
    if (field.sourceColumn === "indicators_checklist") return "mapped"; // rendered in PDF
    if (field.sourceColumn === "computed" || field.sourceColumn === "now()" || field.sourceColumn === "strType") return "mapped";
    return "missing"; // manual entry needed
  }
  if (field.sourceColumn === null) return "missing";
  if (field.sourceTable === "suite_customers") {
    if (!customer) return "missing";
    const val = customer[field.sourceColumn];
    return val != null && val !== "" ? "mapped" : "partial";
  }
  if (field.sourceTable === "suite_transactions") {
    if (transactions.length === 0) return "missing";
    const filled = transactions.filter(t => t[field.sourceColumn!] != null && t[field.sourceColumn!] !== "").length;
    return filled === transactions.length ? "mapped" : filled > 0 ? "partial" : "missing";
  }
  if (field.sourceTable === "suite_case_notes") {
    return notes.length > 0 ? "mapped" : "missing";
  }
  if (field.sourceTable === "suite_cases") return "mapped";
  if (field.sourceTable === "profiles" || field.sourceTable === "auth.users") return "mapped";
  return "missing";
}

const PART_LABELS: Record<string, string> = {
  "A": "Part A — Report Identification",
  "B": "Part B — Subject Information",
  "C": "Part C — Transaction Details",
  "C-SA": "Part C — Starting Action (Conductor)",
  "C-CA": "Part C — Completing Action (Beneficiary)",
  "D": "Part D — Grounds for Suspicion",
  "E": "Part E — Investigation Narrative",
  "F": "Part F — Declaration & Action Taken",
};

interface CaseItem {
  id: string;
  alert_id: string | null;
  customer_id: string | null;
  title: string;
  status: string;
  priority: string;
  assigned_to: string | null;
  resolution: string | null;
  created_at: string;
}

interface CaseNote {
  id: string;
  content: string;
  created_at: string;
}

interface Alert {
  id: string;
  title: string;
}

const statusStyle: Record<string, string> = {
  open: "bg-blue-50 text-blue-700 border-blue-200",
  investigating: "bg-amber-50 text-amber-700 border-amber-200",
  str_filed: "bg-red-50 text-red-700 border-red-200",
  sar_filed: "bg-purple-50 text-purple-700 border-purple-200",
  closed: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const priorityStyle: Record<string, string> = {
  critical: "bg-red-50 text-red-700 border-red-200",
  high: "bg-orange-50 text-orange-700 border-orange-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  low: "bg-slate-50 text-slate-600 border-slate-200",
};

export default function SuiteCases() {
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", alert_id: "", priority: "medium" });
  const [selectedCase, setSelectedCase] = useState<CaseItem | null>(null);
  const [notes, setNotes] = useState<CaseNote[]>([]);
  const [newNote, setNewNote] = useState("");
  const [showFintracPanel, setShowFintracPanel] = useState(false);
  const [showFieldMapping, setShowFieldMapping] = useState(false);
  const [fintracStrType, setFintracStrType] = useState<"str" | "lctr" | "eftr">("str");
  const [caseCustomer, setCaseCustomer] = useState<any>(null);
  const [caseTransactions, setCaseTransactions] = useState<any[]>([]);

  const fetchCases = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const [cRes, aRes] = await Promise.all([
      supabase.from("suite_cases").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("suite_alerts").select("id, title").eq("user_id", user.id).eq("status", "open"),
    ]);
    setCases(cRes.data || []);
    setAlerts(aRes.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchCases(); }, []);

  const createCase = async () => {
    if (!form.title.trim()) { toast.error("Title required"); return; }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("suite_cases").insert({
      user_id: user.id,
      title: form.title.trim(),
      alert_id: form.alert_id || null,
      priority: form.priority,
    });
    if (error) { toast.error(error.message); return; }

    await supabase.from("suite_audit_log").insert({
      user_id: user.id,
      action: `Case created: ${form.title}`,
      entity_type: "case",
      details: { detail: `Priority: ${form.priority}` },
    });

    toast.success("Case created");
    setForm({ title: "", alert_id: "", priority: "medium" });
    setShowForm(false);
    fetchCases();
  };

  const updateStatus = async (caseId: string, newStatus: string) => {
    const { error } = await supabase.from("suite_cases").update({ status: newStatus }).eq("id", caseId);
    if (error) { toast.error(error.message); return; }

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("suite_audit_log").insert({
        user_id: user.id, action: `Case status → ${newStatus}`, entity_type: "case", entity_id: caseId,
      });
    }
    toast.success(`Case ${newStatus.replace("_", " ")}`);
    if (selectedCase?.id === caseId) setSelectedCase(c => c ? { ...c, status: newStatus } : null);
    fetchCases();
  };

  const openCase = async (c: CaseItem) => {
    setSelectedCase(c);
    setShowFintracPanel(false);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("suite_case_notes").select("*").eq("case_id", c.id).eq("user_id", user.id).order("created_at", { ascending: true });
    setNotes(data || []);
  };

  const addNote = async () => {
    if (!newNote.trim() || !selectedCase) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("suite_case_notes").insert({ case_id: selectedCase.id, user_id: user.id, content: newNote.trim() });
    if (error) { toast.error(error.message); return; }
    toast.success("Note added");
    setNewNote("");
    const { data } = await supabase.from("suite_case_notes").select("*").eq("case_id", selectedCase.id).eq("user_id", user.id).order("created_at", { ascending: true });
    setNotes(data || []);
  };

  const handleExportSAR = async () => {
    if (!selectedCase) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    let customer = null;
    if (selectedCase.customer_id) {
      const { data } = await supabase.from("suite_customers").select("*").eq("id", selectedCase.customer_id).single();
      customer = data;
    }

    await exportSAR({
      caseItem: selectedCase,
      notes,
      customer,
      submittedBy: user.email ?? "Reporting Officer",
      reportingEntity: "WorldAML Client",
      reportingEntityRef: `SAR-${selectedCase.id.slice(0, 8).toUpperCase()}`,
    });

    await supabase.from("suite_audit_log").insert({
      user_id: user.id,
      action: `SAR exported: ${selectedCase.title}`,
      entity_type: "case",
      entity_id: selectedCase.id,
    });

    toast.success("SAR PDF downloaded");
  };

  const handleExportFINTRAC = async () => {
    if (!selectedCase) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    let customer = null;
    if (selectedCase.customer_id) {
      const { data } = await supabase.from("suite_customers").select("*").eq("id", selectedCase.customer_id).single();
      customer = data;
    }

    // Fetch linked transactions
    let transactions: any[] = [];
    if (selectedCase.customer_id) {
      const { data } = await supabase
        .from("suite_transactions")
        .select("*")
        .eq("customer_id", selectedCase.customer_id)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);
      transactions = data || [];
    }

    await exportFINTRACStr({
      caseItem: selectedCase,
      notes,
      customer,
      transactions,
      submittedBy: user.email ?? "CAMLO",
      reportingEntity: "WorldAML Client",
      reportingEntityRef: `FINTRAC-${fintracStrType.toUpperCase()}-${selectedCase.id.slice(0, 8).toUpperCase()}`,
      strType: fintracStrType,
    });

    await supabase.from("suite_audit_log").insert({
      user_id: user.id,
      action: `FINTRAC ${fintracStrType.toUpperCase()} exported: ${selectedCase.title}`,
      entity_type: "case",
      entity_id: selectedCase.id,
      details: { report_type: fintracStrType, jurisdiction: "FINTRAC-Canada" },
    });

    toast.success(`FINTRAC ${fintracStrType.toUpperCase()} PDF downloaded`);
  };

  const filtered = cases.filter(c =>
    (filter === "All" || c.status === filter) &&
    (!search || c.title.toLowerCase().includes(search.toLowerCase()))
  );

  // ── Case Detail View ──
  if (selectedCase) {
    return (
      <div className="p-6 space-y-5 h-full overflow-y-auto animate-fade-in">
        <div className="flex items-center gap-4">
          <button onClick={() => setSelectedCase(null)} className="text-xs text-muted-foreground hover:text-foreground">← Back</button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground">{selectedCase.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={cn("text-xs px-2 py-0.5 rounded border font-semibold capitalize", priorityStyle[selectedCase.priority])}>{selectedCase.priority}</span>
              <span className={cn("text-xs px-2 py-0.5 rounded border font-medium capitalize", statusStyle[selectedCase.status])}>{selectedCase.status.replace("_", " ")}</span>
              <span className="text-xs text-muted-foreground font-mono">{new Date(selectedCase.created_at).toLocaleDateString("en-GB")}</span>
            </div>
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {selectedCase.status === "open" && (
              <button onClick={() => updateStatus(selectedCase.id, "investigating")}
                className="text-xs px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg hover:bg-amber-100">
                Investigate
              </button>
            )}
            {selectedCase.status === "investigating" && (
              <>
                <button onClick={() => updateStatus(selectedCase.id, "sar_filed")}
                  className="text-xs px-3 py-1.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg hover:bg-purple-100">
                  File SAR (FinCEN)
                </button>
                <button onClick={() => updateStatus(selectedCase.id, "str_filed")}
                  className="text-xs px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100">
                  File STR (FINTRAC)
                </button>
              </>
            )}
            {selectedCase.status !== "closed" && (
              <button onClick={() => updateStatus(selectedCase.id, "closed")}
                className="text-xs px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100">
                Close
              </button>
            )}
            {(selectedCase.status === "sar_filed" || selectedCase.status === "closed") && (
              <button onClick={handleExportSAR}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium">
                <Download className="w-3 h-3" /> SAR PDF
              </button>
            )}
            {(selectedCase.status === "str_filed" || selectedCase.status === "sar_filed" || selectedCase.status === "closed") && (
              <button onClick={() => setShowFintracPanel(!showFintracPanel)}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium">
                <Flag className="w-3 h-3" /> FINTRAC Report
              </button>
            )}
          </div>
        </div>

        {/* FINTRAC Export Panel */}
        {showFintracPanel && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-5 animate-fade-in">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4 text-red-700" />
              <h2 className="font-semibold text-red-900">FINTRAC — Canadian Regulatory Report</h2>
            </div>
            <p className="text-xs text-red-700 mb-4">
              Select the report type per PCMLTFA/PCMLTFR requirements. STR must be filed within 3 business days of determination. LCTR/EFTR within 15 calendar days.
            </p>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {([
                { value: "str" as const, label: "STR", desc: "Suspicious Transaction Report", icon: AlertTriangle, deadline: "3 business days" },
                { value: "lctr" as const, label: "LCTR", desc: "Large Cash Transaction (≥ CAD 10,000)", icon: FileText, deadline: "15 calendar days" },
                { value: "eftr" as const, label: "EFTR", desc: "Electronic Funds Transfer (≥ CAD 10,000)", icon: Shield, deadline: "15 calendar days" },
              ]).map(t => (
                <button key={t.value} onClick={() => setFintracStrType(t.value)}
                  className={cn(
                    "p-3 rounded-lg border text-left transition-all",
                    fintracStrType === t.value
                      ? "border-red-500 bg-white shadow-sm ring-1 ring-red-300"
                      : "border-red-200 bg-red-50/50 hover:bg-white"
                  )}>
                  <div className="flex items-center gap-2 mb-1">
                    <t.icon className="w-3.5 h-3.5 text-red-600" />
                    <span className="text-sm font-bold text-red-900">{t.label}</span>
                  </div>
                  <p className="text-[11px] text-red-700">{t.desc}</p>
                  <p className="text-[10px] text-red-500 mt-1">Deadline: {t.deadline}</p>
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <button onClick={handleExportFINTRAC}
                className="flex items-center gap-1.5 text-xs px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold">
                <Download className="w-3.5 h-3.5" /> Export {fintracStrType.toUpperCase()} PDF
              </button>
              <span className="text-[10px] text-red-500">PCMLTFA s.7 · PCMLTFR Part 1</span>
            </div>
          </div>
        )}

        {/* Case Notes */}
        <div className="bg-card rounded-xl border border-border">
          <div className="px-5 py-4 border-b border-border flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-muted-foreground" />
            <h2 className="font-semibold text-foreground">Case Notes</h2>
          </div>
          <div className="p-5 space-y-3">
            {notes.length === 0 && <p className="text-sm text-muted-foreground">No notes yet.</p>}
            {notes.map(n => (
              <div key={n.id} className="p-3 bg-muted/30 rounded-lg border border-border">
                <p className="text-sm text-foreground">{n.content}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{new Date(n.created_at).toLocaleString("en-GB")}</p>
              </div>
            ))}
            <div className="flex gap-2">
              <input value={newNote} onChange={e => setNewNote(e.target.value)} onKeyDown={e => e.key === "Enter" && addNote()} placeholder="Add a note…" className="flex-1 border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
              <button onClick={addNote} className="text-xs px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium">Add</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Case List View ──
  return (
    <div className="p-6 space-y-5 h-full overflow-y-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Case Management — SAR / STR Filing</h1>
          <p className="text-xs text-muted-foreground mt-0.5">FinCEN SAR · FINTRAC STR/LCTR/EFTR · Multi-jurisdiction reporting</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 font-medium"><Plus className="w-3.5 h-3.5" /> New Case</button>
      </div>

      {showForm && (
        <div className="bg-card border border-border rounded-xl p-5 animate-fade-in">
          <h2 className="font-semibold text-foreground mb-3">Create Case</h2>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Title *</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Link Alert</label>
              <select value={form.alert_id} onChange={e => setForm(f => ({ ...f, alert_id: e.target.value }))} className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground">
                <option value="">None</option>
                {alerts.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Priority</label>
              <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))} className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground">
                {["low", "medium", "high", "critical"].map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-3">
            <button onClick={() => setShowForm(false)} className="text-xs px-3 py-1.5 border border-border rounded-lg text-muted-foreground hover:bg-muted">Cancel</button>
            <button onClick={createCase} className="text-xs px-4 py-1.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium">Create</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-5 gap-4">
        {[
          { label: "Open", value: cases.filter(c => c.status === "open").length, color: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
          { label: "Investigating", value: cases.filter(c => c.status === "investigating").length, color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
          { label: "SAR Filed", value: cases.filter(c => c.status === "sar_filed").length, color: "text-purple-700", bg: "bg-purple-50 border-purple-200" },
          { label: "STR Filed", value: cases.filter(c => c.status === "str_filed").length, color: "text-red-700", bg: "bg-red-50 border-red-200" },
          { label: "Closed", value: cases.filter(c => c.status === "closed").length, color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
        ].map(s => (
          <div key={s.label} className={cn("rounded-xl border p-4", s.bg)}>
            <div className={cn("text-2xl font-bold font-mono", s.color)}>{s.value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <div className="relative"><Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search cases…" className="pl-7 py-1.5 text-xs rounded border border-border bg-background text-foreground w-48 focus:outline-none focus:ring-1 focus:ring-primary" /></div>
        <div className="flex gap-1 flex-wrap">
          {["All", "open", "investigating", "sar_filed", "str_filed", "closed"].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={cn(
                "text-xs px-2.5 py-1 rounded-full border font-medium transition-colors capitalize",
                filter === s ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground border-border hover:border-primary hover:text-primary"
              )}>
              {s === "sar_filed" ? "SAR Filed" : s === "str_filed" ? "STR Filed" : s}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {loading ? (
          <p className="text-sm text-muted-foreground text-center py-8">Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No cases yet. Create one to start an investigation.</p>
        ) : (
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border bg-muted/30">
              {["Title", "Priority", "Status", "Date", "Actions"].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">{h}</th>)}
            </tr></thead>
            <tbody className="divide-y divide-border">
              {filtered.map(c => (
                <tr key={c.id} className={cn("hover:bg-muted/20 transition-colors group", c.priority === "critical" && "bg-red-50/20")}>
                  <td className="px-4 py-3 font-semibold text-foreground text-sm">
                    <div className="flex items-center gap-2">
                      {c.title}
                      {c.status === "str_filed" && <span className="text-[9px] bg-red-100 text-red-700 border border-red-200 px-1.5 py-0.5 rounded font-bold">FINTRAC</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3"><span className={cn("text-xs px-2 py-0.5 rounded border font-semibold capitalize", priorityStyle[c.priority])}>{c.priority}</span></td>
                  <td className="px-4 py-3"><span className={cn("text-xs px-2 py-0.5 rounded border font-medium capitalize", statusStyle[c.status])}>{c.status.replace("_", " ")}</span></td>
                  <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{new Date(c.created_at).toLocaleDateString("en-GB")}</td>
                  <td className="px-4 py-3"><button onClick={() => openCase(c)} className="opacity-0 group-hover:opacity-100 text-xs text-primary hover:underline transition-opacity flex items-center gap-1">Open <ChevronRight className="w-3 h-3" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
