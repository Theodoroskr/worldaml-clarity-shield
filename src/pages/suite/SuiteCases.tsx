import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { FileText, ChevronRight, Search, Plus, MessageSquare, Download, Flag, MapPin, AlertTriangle, Shield, CheckCircle2, XCircle, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { exportSAR } from "@/services/sarExport";
import { exportFINTRACStr, DEFAULT_MANUAL_FIELDS, type FINTRACManualFields } from "@/services/fintracStrExport";

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
  { fintracPart: "D", fintracField: "PEP Status", description: "Whether subject is a politically exposed person", sourceTable: "suite_customers", sourceColumn: "pep_status", required: true },
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
  const [manualFields, setManualFields] = useState<FINTRACManualFields>({ ...DEFAULT_MANUAL_FIELDS });
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const mf = manualFields;
  const setMF = (patch: Partial<FINTRACManualFields>) => {
    setManualFields(prev => ({ ...prev, ...patch }));
    // Clear validation errors for the changed fields
    if (validationErrors.length > 0) setValidationErrors([]);
  };

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
    setShowFieldMapping(false);
    setManualFields({ ...DEFAULT_MANUAL_FIELDS });
    setCaseCustomer(null);
    setCaseTransactions([]);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("suite_case_notes").select("*").eq("case_id", c.id).eq("user_id", user.id).order("created_at", { ascending: true });
    setNotes(data || []);

    // Fetch customer & transactions for field mapping
    if (c.customer_id) {
      const [custRes, txRes] = await Promise.all([
        supabase.from("suite_customers").select("*").eq("id", c.customer_id).single(),
        supabase.from("suite_transactions").select("*").eq("customer_id", c.customer_id).eq("user_id", user.id).order("created_at", { ascending: false }).limit(50),
      ]);
      setCaseCustomer(custRes.data);
      setCaseTransactions(txRes.data || []);
      // Auto-populate PEP status from customer record
      if (custRes.data?.pep_status && custRes.data.pep_status !== "no") {
        setManualFields(prev => ({ ...prev, isPEP: custRes.data.pep_status }));
      }
    }
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

  const validateFintracFields = (): string[] => {
    const errors: string[] = [];
    if (!mf.methodOfTransaction) errors.push("methodOfTransaction");
    if (!mf.sourceOfFunds) errors.push("sourceOfFunds");
    if (!mf.conductorName && !caseCustomer?.name) errors.push("conductorName");
    if (mf.thirdPartyIndicator === "third_party" && !mf.thirdPartyName) errors.push("thirdPartyName");
    if (!mf.dispositionOfFunds) errors.push("dispositionOfFunds");
    if (!mf.beneficiaryName) errors.push("beneficiaryName");
    if (!mf.suspicionType) errors.push("suspicionType");
    if (mf.selectedIndicators.length === 0) errors.push("selectedIndicators");
    if (!mf.camloName) errors.push("camloName");
    if (!mf.actionTaken) errors.push("actionTaken");
    if (notes.length === 0) errors.push("notes");
    return errors;
  };

  const handleExportFINTRAC = async () => {
    if (!selectedCase) return;

    // Validate mandatory fields
    const errors = validateFintracFields();
    if (errors.length > 0) {
      setValidationErrors(errors);
      const labels: Record<string, string> = {
        methodOfTransaction: "Method of Transaction",
        sourceOfFunds: "Source of Funds",
        conductorName: "Conductor Name",
        thirdPartyName: "Third Party Name",
        dispositionOfFunds: "Disposition of Funds",
        beneficiaryName: "Beneficiary Name",
        suspicionType: "Suspicion Type",
        selectedIndicators: "At least 1 ML/TF Indicator",
        camloName: "CAMLO Name",
        actionTaken: "Action Taken",
        notes: "Investigation Narrative (add case notes)",
      };
      const missing = errors.map(e => labels[e] || e).join(", ");
      toast.error(`Missing mandatory fields: ${missing}`, { duration: 6000 });
      return;
    }
    setValidationErrors([]);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error("Please log in to export"); return; }

      let customer = null;
      if (selectedCase.customer_id) {
        const { data } = await supabase.from("suite_customers").select("*").eq("id", selectedCase.customer_id).single();
        customer = data;
      }

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
        manualFields,
      });

      await supabase.from("suite_audit_log").insert({
        user_id: user.id,
        action: `FINTRAC ${fintracStrType.toUpperCase()} exported: ${selectedCase.title}`,
        entity_type: "case",
        entity_id: selectedCase.id,
        details: { report_type: fintracStrType, jurisdiction: "FINTRAC-Canada" },
      });

      toast.success(`FINTRAC ${fintracStrType.toUpperCase()} PDF downloaded`);
    } catch (err: any) {
      console.error("FINTRAC export error:", err);
      toast.error(`PDF export failed: ${err?.message || "Unknown error"}`);
    }
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

            {/* Validation Summary */}
            {validationErrors.length > 0 && (
              <div className="bg-red-50 border-2 border-red-400 rounded-xl p-3 flex items-start gap-2 animate-fade-in">
                <XCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-red-800">Missing mandatory fields — please complete before exporting</p>
                  <p className="text-[10px] text-red-600 mt-0.5">Fields highlighted in red below must be filled to comply with PCMLTFA/PCMLTFR requirements.</p>
                </div>
              </div>
            )}

            {/* ── Manual Entry Forms ── */}
            <div className="space-y-4 mt-4">
              {/* Section 1: Starting Action */}
              <div className="bg-white border border-red-200 rounded-xl p-4">
                <h3 className="text-xs font-bold text-red-900 mb-1 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" /> Starting Action — Conductor & Source
                </h3>
                <p className="text-[10px] text-red-600 mb-3">PCMLTFR s.132 — Identify who conducted the transaction and how the funds were obtained.</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-semibold text-red-800 mb-1 block">Method of Transaction *</label>
                    <select value={mf.methodOfTransaction} onChange={e => setMF({ methodOfTransaction: e.target.value })}
                      className={cn("w-full border rounded-lg px-2.5 py-1.5 text-xs bg-white text-foreground focus:ring-1 focus:outline-none",
                        validationErrors.includes("methodOfTransaction") ? "border-red-500 ring-2 ring-red-300 bg-red-50" : "border-red-200 focus:ring-red-300")}>
                      <option value="">Select method…</option>
                      <option value="In-person">In-person</option>
                      <option value="Online / Electronic">Online / Electronic</option>
                      <option value="Telephone">Telephone</option>
                      <option value="Mail / Courier">Mail / Courier</option>
                      <option value="ATM">ATM</option>
                      <option value="Mobile banking">Mobile banking</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-red-800 mb-1 block">Source of Funds *</label>
                    <select value={mf.sourceOfFunds} onChange={e => setMF({ sourceOfFunds: e.target.value })}
                      className={cn("w-full border rounded-lg px-2.5 py-1.5 text-xs bg-white text-foreground focus:ring-1 focus:outline-none",
                        validationErrors.includes("sourceOfFunds") ? "border-red-500 ring-2 ring-red-300 bg-red-50" : "border-red-200 focus:ring-red-300")}>
                      <option value="">Select source…</option>
                      <option value="Employment / Salary">Employment / Salary</option>
                      <option value="Business revenue">Business revenue</option>
                      <option value="Savings / Investments">Savings / Investments</option>
                      <option value="Loan proceeds">Loan proceeds</option>
                      <option value="Sale of property">Sale of property</option>
                      <option value="Inheritance / Gift">Inheritance / Gift</option>
                      <option value="Casino winnings">Casino winnings</option>
                      <option value="Unknown">Unknown</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-red-800 mb-1 block">Conductor Name *</label>
                    <input value={mf.conductorName} onChange={e => setMF({ conductorName: e.target.value })}
                      placeholder={caseCustomer?.name || "Person who conducted the transaction"}
                      className={cn("w-full border rounded-lg px-2.5 py-1.5 text-xs bg-white text-foreground focus:ring-1 focus:outline-none",
                        validationErrors.includes("conductorName") ? "border-red-500 ring-2 ring-red-300 bg-red-50" : "border-red-200 focus:ring-red-300")} />
                    <p className="text-[9px] text-red-500 mt-0.5">The individual who physically or electronically initiated the transaction</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-red-800 mb-1 block">Third Party Determination *</label>
                    <select value={mf.thirdPartyIndicator} onChange={e => setMF({ thirdPartyIndicator: e.target.value })}
                      className="w-full border border-red-200 rounded-lg px-2.5 py-1.5 text-xs bg-white text-foreground focus:ring-1 focus:ring-red-300 focus:outline-none">
                      <option value="own_behalf">On own behalf</option>
                      <option value="third_party">On behalf of a third party</option>
                    </select>
                  </div>
                  {mf.thirdPartyIndicator === "third_party" && (
                    <div className="col-span-2">
                      <label className="text-[10px] font-semibold text-red-800 mb-1 block">Third Party Name *</label>
                      <input value={mf.thirdPartyName} onChange={e => setMF({ thirdPartyName: e.target.value })}
                        placeholder="Full legal name of the third party"
                        className={cn("w-full border rounded-lg px-2.5 py-1.5 text-xs bg-white text-foreground focus:ring-1 focus:outline-none",
                          validationErrors.includes("thirdPartyName") ? "border-red-500 ring-2 ring-red-300 bg-red-50" : "border-red-200 focus:ring-red-300")} />
                    </div>
                  )}
                </div>
              </div>

              {/* Section 2: Completing Action */}
              <div className="bg-white border border-red-200 rounded-xl p-4">
                <h3 className="text-xs font-bold text-red-900 mb-1 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" /> Completing Action — Disposition & Beneficiary
                </h3>
                <p className="text-[10px] text-red-600 mb-3">PCMLTFR s.133 — How were the funds ultimately used and who benefited?</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-semibold text-red-800 mb-1 block">Disposition of Funds *</label>
                    <select value={mf.dispositionOfFunds} onChange={e => setMF({ dispositionOfFunds: e.target.value })}
                      className={cn("w-full border rounded-lg px-2.5 py-1.5 text-xs bg-white text-foreground focus:ring-1 focus:outline-none",
                        validationErrors.includes("dispositionOfFunds") ? "border-red-500 ring-2 ring-red-300 bg-red-50" : "border-red-200 focus:ring-red-300")}>
                      <option value="">Select disposition…</option>
                      <option value="Cash withdrawal">Cash withdrawal</option>
                      <option value="Wire transfer (domestic)">Wire transfer (domestic)</option>
                      <option value="Wire transfer (international)">Wire transfer (international)</option>
                      <option value="Bank draft / Cheque">Bank draft / Cheque</option>
                      <option value="Account credit">Account credit</option>
                      <option value="Virtual currency transfer">Virtual currency transfer</option>
                      <option value="Purchase of monetary instrument">Purchase of monetary instrument</option>
                      <option value="Foreign currency exchange">Foreign currency exchange</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-red-800 mb-1 block">Beneficiary Name *</label>
                    <input value={mf.beneficiaryName} onChange={e => setMF({ beneficiaryName: e.target.value })}
                      placeholder="Person or entity who benefited"
                      className={cn("w-full border rounded-lg px-2.5 py-1.5 text-xs bg-white text-foreground focus:ring-1 focus:outline-none",
                        validationErrors.includes("beneficiaryName") ? "border-red-500 ring-2 ring-red-300 bg-red-50" : "border-red-200 focus:ring-red-300")} />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-red-800 mb-1 block">Beneficiary Account</label>
                    <input value={mf.beneficiaryAccount} onChange={e => setMF({ beneficiaryAccount: e.target.value })}
                      placeholder="Account number or VC address"
                      className="w-full border border-red-200 rounded-lg px-2.5 py-1.5 text-xs bg-white text-foreground focus:ring-1 focus:ring-red-300 focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-red-800 mb-1 block">Beneficiary Country</label>
                    <input value={mf.beneficiaryCountry} onChange={e => setMF({ beneficiaryCountry: e.target.value })}
                      placeholder="e.g. Canada"
                      className="w-full border border-red-200 rounded-lg px-2.5 py-1.5 text-xs bg-white text-foreground focus:ring-1 focus:ring-red-300 focus:outline-none" />
                  </div>
                </div>
              </div>

              {/* Section 3: Grounds for Suspicion */}
              <div className="bg-white border border-red-200 rounded-xl p-4">
                <h3 className="text-xs font-bold text-red-900 mb-1 flex items-center gap-1.5">
                  <Flag className="w-3.5 h-3.5" /> Grounds for Suspicion — Part D
                </h3>
                <p className="text-[10px] text-red-600 mb-3">PCMLTFA s.7 — Select the suspicion type, PEP status, and applicable ML/TF indicators.</p>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="text-[10px] font-semibold text-red-800 mb-1 block">Suspicion Type *</label>
                    <select value={mf.suspicionType} onChange={e => setMF({ suspicionType: e.target.value })}
                      className="w-full border border-red-200 rounded-lg px-2.5 py-1.5 text-xs bg-white text-foreground focus:ring-1 focus:ring-red-300 focus:outline-none">
                      <option value="ml">Money Laundering (ML)</option>
                      <option value="tf">Terrorist Activity Financing (TF)</option>
                      <option value="sanctions">Sanctions Evasion</option>
                      <option value="ml_tf">ML and TF</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-red-800 mb-1 block">PEP Status *</label>
                    <select value={mf.isPEP} onChange={e => setMF({ isPEP: e.target.value })}
                      className="w-full border border-red-200 rounded-lg px-2.5 py-1.5 text-xs bg-white text-foreground focus:ring-1 focus:ring-red-300 focus:outline-none">
                      <option value="no">No — Not a PEP</option>
                      <option value="yes">Yes — PEP (unspecified)</option>
                      <option value="domestic_pep">Yes — Domestic PEP</option>
                      <option value="foreign_pep">Yes — Foreign PEP</option>
                    </select>
                    <p className="text-[9px] text-red-500 mt-0.5">Politically Exposed Person per PCMLTFR s.2</p>
                  </div>
                </div>
                <label className={cn("text-[10px] font-semibold mb-2 block",
                  validationErrors.includes("selectedIndicators") ? "text-red-600" : "text-red-800")}>
                  ML/TF Indicators (select at least 1) {validationErrors.includes("selectedIndicators") && <span className="text-red-500 font-bold">⚠ Required</span>}
                </label>
                <div className="space-y-1.5">
                  {[
                    "Transaction inconsistent with client's known business or occupation",
                    "Structured to avoid reporting thresholds (PCMLTFR s.12)",
                    "Involves high-risk jurisdiction (FATF grey/black list)",
                    "Rapid movement of funds with no apparent economic purpose",
                    "Client unwilling to provide identification or provides suspicious documents",
                    "Pattern of transactions below CAD 10,000 threshold",
                    "Funds received from or sent to a jurisdiction with weak AML controls",
                    "Unusual use of corporate structures or nominee arrangements",
                  ].map((ind, i) => (
                    <label key={i} className="flex items-start gap-2 cursor-pointer group">
                      <input type="checkbox" checked={mf.selectedIndicators.includes(i)}
                        onChange={e => {
                          const next = e.target.checked
                            ? [...mf.selectedIndicators, i]
                            : mf.selectedIndicators.filter(x => x !== i);
                          setMF({ selectedIndicators: next });
                        }}
                        className="mt-0.5 rounded border-red-300 text-red-600 focus:ring-red-300" />
                      <span className="text-[11px] text-foreground group-hover:text-red-800 transition-colors">{ind}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Section 4: Declaration & Action */}
              <div className="bg-white border border-red-200 rounded-xl p-4">
                <h3 className="text-xs font-bold text-red-900 mb-1 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" /> Declaration & Action Taken — Parts F/G
                </h3>
                <p className="text-[10px] text-red-600 mb-3">PCMLTFA s.7 — The CAMLO or delegate must sign the declaration. Document what action was taken.</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-semibold text-red-800 mb-1 block">CAMLO / Signing Officer Name *</label>
                    <input value={mf.camloName} onChange={e => setMF({ camloName: e.target.value })}
                      placeholder="Full name of the signing officer"
                      className={cn("w-full border rounded-lg px-2.5 py-1.5 text-xs bg-white text-foreground focus:ring-1 focus:outline-none",
                        validationErrors.includes("camloName") ? "border-red-500 ring-2 ring-red-300 bg-red-50" : "border-red-200 focus:ring-red-300")} />
                    <p className="text-[9px] text-red-500 mt-0.5">Chief Anti-Money Laundering Officer or authorised delegate</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-red-800 mb-1 block">Action Taken *</label>
                    <select value={mf.actionTaken} onChange={e => setMF({ actionTaken: e.target.value })}
                      className={cn("w-full border rounded-lg px-2.5 py-1.5 text-xs bg-white text-foreground focus:ring-1 focus:outline-none",
                        validationErrors.includes("actionTaken") ? "border-red-500 ring-2 ring-red-300 bg-red-50" : "border-red-200 focus:ring-red-300")}>
                      <option value="">Select action…</option>
                      <option value="Enhanced monitoring applied">Enhanced monitoring applied</option>
                      <option value="Account restricted / frozen">Account restricted / frozen</option>
                      <option value="Relationship terminated">Relationship terminated</option>
                      <option value="Additional identification requested">Additional identification requested</option>
                      <option value="Transaction blocked">Transaction blocked</option>
                      <option value="Law enforcement notified">Law enforcement notified</option>
                      <option value="No further action — monitoring continues">No further action — monitoring continues</option>
                      <option value="Multiple actions taken (see notes)">Multiple actions taken (see notes)</option>
                    </select>
                    <p className="text-[9px] text-red-500 mt-0.5">What action was or will be taken as a result of this filing</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <button onClick={handleExportFINTRAC}
                className="flex items-center gap-1.5 text-xs px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold">
                <Download className="w-3.5 h-3.5" /> Export {fintracStrType.toUpperCase()} PDF
              </button>
              <button onClick={() => setShowFieldMapping(!showFieldMapping)}
                className="flex items-center gap-1.5 text-xs px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-100 font-medium">
                <Info className="w-3.5 h-3.5" /> {showFieldMapping ? "Hide" : "Show"} Field Mapping
              </button>
              {validationErrors.includes("notes") && (
                <span className="text-[10px] text-red-600 font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Add investigation notes (Part E) before exporting
                </span>
              )}
              <span className="text-[10px] text-red-500">PCMLTFA s.7 · PCMLTFR Part 1</span>
            </div>

            {/* Field Mapping Panel */}
            {showFieldMapping && (() => {
              const parts = Object.keys(PART_LABELS);
              const grouped = parts.map(part => ({
                part,
                label: PART_LABELS[part],
                fields: FINTRAC_FIELD_MAP.filter(f => f.fintracPart === part),
              }));
              const allStatuses = FINTRAC_FIELD_MAP.map(f => getFieldStatus(f, caseCustomer, caseTransactions, notes));
              const mapped = allStatuses.filter(s => s === "mapped").length;
              const partial = allStatuses.filter(s => s === "partial").length;
              const missing = allStatuses.filter(s => s === "missing").length;
              const pct = Math.round((mapped / allStatuses.length) * 100);

              return (
                <div className="mt-4 bg-white border border-red-200 rounded-xl overflow-hidden">
                  {/* Coverage header */}
                  <div className="px-5 py-4 border-b border-red-100 bg-red-50/50">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-bold text-red-900">FINTRAC STR Field Mapping — Data Completeness</h3>
                      <span className={cn("text-xs font-bold px-2.5 py-1 rounded-full",
                        pct >= 80 ? "bg-emerald-100 text-emerald-700" : pct >= 50 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                      )}>{pct}% mapped</span>
                    </div>
                    <div className="w-full h-2 bg-red-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="flex gap-4 mt-2 text-[11px]">
                      <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-600" /> {mapped} mapped</span>
                      <span className="flex items-center gap-1"><AlertTriangle className="w-3 h-3 text-amber-500" /> {partial} partial</span>
                      <span className="flex items-center gap-1"><XCircle className="w-3 h-3 text-red-500" /> {missing} missing</span>
                    </div>
                  </div>

                  {/* Field table grouped by part */}
                  <div className="max-h-[400px] overflow-y-auto">
                    {grouped.map(g => (
                      <div key={g.part}>
                        <div className="px-5 py-2 bg-red-50 border-b border-red-100">
                          <span className="text-xs font-bold text-red-800">{g.label}</span>
                        </div>
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="border-b border-red-50 bg-red-25">
                              <th className="px-5 py-1.5 text-left text-[10px] font-semibold text-red-600 uppercase w-[200px]">FINTRAC Field</th>
                              <th className="px-3 py-1.5 text-left text-[10px] font-semibold text-red-600 uppercase">Description</th>
                              <th className="px-3 py-1.5 text-left text-[10px] font-semibold text-red-600 uppercase w-[170px]">Source</th>
                              <th className="px-3 py-1.5 text-center text-[10px] font-semibold text-red-600 uppercase w-[80px]">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-red-50">
                            {g.fields.map(f => {
                              const status = getFieldStatus(f, caseCustomer, caseTransactions, notes);
                              return (
                                <tr key={f.fintracField} className={cn("hover:bg-red-50/30", status === "missing" && f.required && "bg-red-50/40")}>
                                  <td className="px-5 py-2 font-medium text-foreground">
                                    {f.fintracField}
                                    {f.required && <span className="text-red-500 ml-0.5">*</span>}
                                  </td>
                                  <td className="px-3 py-2 text-muted-foreground">{f.description}</td>
                                  <td className="px-3 py-2 font-mono text-[10px]">
                                    {f.sourceColumn
                                      ? <span className="text-foreground">{f.sourceTable}.{f.sourceColumn}</span>
                                      : <span className="text-red-500 italic">Manual entry required</span>
                                    }
                                  </td>
                                  <td className="px-3 py-2 text-center">
                                    {status === "mapped" && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mx-auto" />}
                                    {status === "partial" && <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mx-auto" />}
                                    {status === "missing" && <XCircle className="w-3.5 h-3.5 text-red-400 mx-auto" />}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    ))}
                  </div>

                  {/* Legend */}
                  <div className="px-5 py-3 border-t border-red-100 bg-red-50/30 text-[10px] text-red-600 space-y-1">
                    <p><strong>*</strong> = Required by FINTRAC for STR submission (PCMLTFR)</p>
                    <p><strong>Manual entry required</strong> = Not stored in database; must be provided at filing time (signature, PEP status, etc.)</p>
                    <p><strong>Starting Action / Completing Action</strong> fields not yet in the transaction schema — consider adding method_of_transaction, source_of_funds, conductor_name, third_party_indicator, disposition, beneficiary_name columns.</p>
                  </div>
                </div>
              );
            })()}
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
