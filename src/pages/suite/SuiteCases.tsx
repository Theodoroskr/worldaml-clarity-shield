import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { FileText, ChevronRight, Search, Plus, MessageSquare, Download, Flag, MapPin, AlertTriangle, Shield, CheckCircle2, XCircle, Info, X, ClipboardCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { exportSAR } from "@/services/sarExport";
import { exportFINTRACStr, DEFAULT_MANUAL_FIELDS, type FINTRACManualFields } from "@/services/fintracStrExport";
import { exportMOKASStr, DEFAULT_MOKAS_FIELDS, type MOKASManualFields } from "@/services/mokasStrExport";
import { exportCTR, DEFAULT_CTR_FIELDS, type CTRManualFields } from "@/services/ctrExport";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

/* ── Regulator → Required Reports Mapping ── */
interface ReportObligation {
  id: string;
  name: string;
  regulator: string;
  description: string;
  deadline: string;
  threshold?: string;
  legalBasis: string;
  exportKey: "sar" | "fintrac" | "mokas";
}

const REGULATOR_REPORTS: Record<string, ReportObligation[]> = {
  FinCEN: [
    { id: "sar", name: "SAR", regulator: "FinCEN", description: "Suspicious Activity Report", deadline: "30 calendar days", legalBasis: "BSA 31 CFR §1020.320", exportKey: "sar" },
    { id: "ctr", name: "CTR", regulator: "FinCEN", description: "Currency Transaction Report (cash ≥ $10,000)", deadline: "15 calendar days", threshold: "$10,000 cash", legalBasis: "BSA 31 CFR §1010.311", exportKey: "sar" },
  ],
  FINTRAC: [
    { id: "str", name: "STR", regulator: "FINTRAC", description: "Suspicious Transaction Report", deadline: "3 business days", legalBasis: "PCMLTFA s.7", exportKey: "fintrac" },
    { id: "lctr", name: "LCTR", regulator: "FINTRAC", description: "Large Cash Transaction Report (≥ CAD 10,000)", deadline: "15 calendar days", threshold: "CAD 10,000", legalBasis: "PCMLTFR s.132", exportKey: "fintrac" },
    { id: "eftr", name: "EFTR", regulator: "FINTRAC", description: "Electronic Funds Transfer Report (≥ CAD 10,000)", deadline: "15 calendar days", threshold: "CAD 10,000", legalBasis: "PCMLTFR s.12", exportKey: "fintrac" },
    { id: "tpr", name: "TPR", regulator: "FINTRAC", description: "Terrorist Property Report", deadline: "Immediately", legalBasis: "PCMLTFA s.7.1 / Criminal Code s.83.08", exportKey: "fintrac" },
  ],
  FCA: [
    { id: "sar_uk", name: "SAR (NCA)", regulator: "FCA", description: "Suspicious Activity Report to NCA", deadline: "As soon as practicable", legalBasis: "POCA 2002 s.330-332", exportKey: "sar" },
    { id: "daml", name: "DAML", regulator: "FCA", description: "Defence Against Money Laundering", deadline: "Before proceeding with transaction", legalBasis: "POCA 2002 s.335", exportKey: "sar" },
  ],
  "EU AMLD": [
    { id: "str_eu", name: "STR", regulator: "EU AMLD", description: "Suspicious Transaction Report to FIU", deadline: "Without delay", legalBasis: "6AMLD Art. 33", exportKey: "sar" },
    { id: "threshold_eu", name: "Threshold Report", regulator: "EU AMLD", description: "Cash transactions ≥ €10,000", deadline: "Within reporting period", threshold: "€10,000", legalBasis: "6AMLD Art. 11", exportKey: "sar" },
  ],
  CySEC: [
    { id: "mokas_str", name: "STR (MOKAS)", regulator: "CySEC", description: "Suspicious Transaction Report to MOKAS", deadline: "3 working days", legalBasis: "AML Law 188(I)/2007 Art. 27", exportKey: "mokas" },
    { id: "mokas_threshold", name: "Threshold Report", regulator: "CySEC", description: "Cash transactions ≥ €10,000", deadline: "Within reporting period", threshold: "€10,000", legalBasis: "AML Law 188(I)/2007 Art. 58", exportKey: "mokas" },
  ],
  ICPAC: [
    { id: "mokas_str_icpac", name: "STR (MOKAS)", regulator: "ICPAC", description: "Suspicious Transaction Report to MOKAS", deadline: "3 working days", legalBasis: "AML Law 188(I)/2007 Art. 27", exportKey: "mokas" },
  ],
  "CBA Cyprus": [
    { id: "mokas_str_cba", name: "STR (MOKAS)", regulator: "CBA Cyprus", description: "Suspicious Transaction Report to MOKAS", deadline: "3 working days", legalBasis: "AML Law 188(I)/2007 Art. 27", exportKey: "mokas" },
  ],
};

// Which export buttons to show per regulator
function getAvailableExports(regulator: string | null): Set<string> {
  if (!regulator) return new Set(["sar", "fintrac", "mokas"]); // show all if unknown
  const reports = REGULATOR_REPORTS[regulator];
  if (!reports) return new Set(["sar", "fintrac", "mokas"]);
  return new Set(reports.map(r => r.exportKey));
}

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
  const [fintracStrType, setFintracStrType] = useState<"str" | "lctr" | "eftr" | "tpr">("str");
  const [caseCustomer, setCaseCustomer] = useState<any>(null);
  const [caseTransactions, setCaseTransactions] = useState<any[]>([]);
  const [selectedTxIds, setSelectedTxIds] = useState<Set<string>>(new Set());
  const [manualFields, setManualFields] = useState<FINTRACManualFields>({ ...DEFAULT_MANUAL_FIELDS });
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [pdfPreview, setPdfPreview] = useState<{ blobUrl: string; fileName: string } | null>(null);
  const mf = manualFields;
  const setMF = (patch: Partial<FINTRACManualFields>) => {
    setManualFields(prev => ({ ...prev, ...patch }));
    if (validationErrors.length > 0) setValidationErrors([]);
  };

  // MOKAS (Cyprus) state
  const [showMokasPanel, setShowMokasPanel] = useState(false);
  const [mokasFields, setMokasFields] = useState<MOKASManualFields>({ ...DEFAULT_MOKAS_FIELDS });
  const [mokasValidationErrors, setMokasValidationErrors] = useState<string[]>([]);
  const setMokasF = (patch: Partial<MOKASManualFields>) => {
    setMokasFields(prev => ({ ...prev, ...patch }));
    if (mokasValidationErrors.length > 0) setMokasValidationErrors([]);
  };

  // ── Regulator auto-detection ──
  const [userRegulator, setUserRegulator] = useState<string | null>(null);
  const [showChecklist, setShowChecklist] = useState(false);
  const [filedReports, setFiledReports] = useState<Set<string>>(new Set());
  const availableExports = getAvailableExports(userRegulator);
  const regulatorReports = userRegulator ? (REGULATOR_REPORTS[userRegulator] || []) : [];

  const fetchCases = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const [cRes, aRes, profileRes] = await Promise.all([
      supabase.from("suite_cases").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("suite_alerts").select("id, title").eq("user_id", user.id).eq("status", "open"),
      supabase.from("profiles").select("regulator").eq("user_id", user.id).maybeSingle(),
    ]);
    setCases(cRes.data || []);
    setAlerts(aRes.data || []);
    if (profileRes.data?.regulator) setUserRegulator(profileRes.data.regulator);
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
      const txs = txRes.data || [];
      setCaseTransactions(txs);
      setSelectedTxIds(new Set(txs.map((t: any) => t.id)));
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
    if (fintracStrType === "tpr") {
      // TPR-specific validation
      if (!mf.tprTerroristEntityName) errors.push("tprTerroristEntityName");
      if (!mf.tprListedUnder) errors.push("tprListedUnder");
      if (!mf.tprDateDiscovered) errors.push("tprDateDiscovered");
      if (!mf.tprPropertyType) errors.push("tprPropertyType");
      if (!mf.tprPropertyValue) errors.push("tprPropertyValue");
      if (!mf.tprPropertyDescription) errors.push("tprPropertyDescription");
      if (!mf.tprDispositionAction) errors.push("tprDispositionAction");
      if (!mf.camloName) errors.push("camloName");
      if (!mf.actionTaken) errors.push("actionTaken");
      if (notes.length === 0) errors.push("notes");
    } else {
      // STR/LCTR/EFTR validation
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
    }
    return errors;
  };

  const handleExportFINTRAC = async () => {
    if (!selectedCase) return;

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
        tprTerroristEntityName: "Listed Entity Name",
        tprListedUnder: "Listed Under (Regulation)",
        tprDateDiscovered: "Date Property Discovered",
        tprPropertyType: "Property Type",
        tprPropertyValue: "Property Value",
        tprPropertyDescription: "Property Description",
        tprDispositionAction: "Disposition Action",
      };
      const missing = errors.map(e => labels[e] || e).join(", ");
      toast.error(`Missing mandatory fields: ${missing}`, { duration: 6000 });
      return;
    }
    setValidationErrors([]);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please log in to export");
        return;
      }

      let customer = null;
      if (selectedCase.customer_id) {
        const { data } = await supabase.from("suite_customers").select("*").eq("id", selectedCase.customer_id).single();
        customer = data;
      }

      // Use only selected transactions
      const transactions = caseTransactions.filter(t => selectedTxIds.has(t.id));

      const result = await exportFINTRACStr({
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

      setPdfPreview(result);

      // Persist STR report to database
      const { data: strReport } = await supabase.from("str_reports").insert({
        user_id: user.id,
        case_id: selectedCase.id,
        customer_id: selectedCase.customer_id,
        filing_status: "draft",
        camlo_name: mf.camloName,
        action_taken: mf.actionTaken,
        grounds_for_suspicion: mf.suspicionType,
      }).select("id").single();

      // Link selected transactions to the STR report
      if (strReport && transactions.length > 0) {
        await supabase.from("str_report_transactions").insert(
          transactions.map(tx => ({ report_id: strReport.id, transaction_id: tx.id }))
        );
      }

      await supabase.from("suite_audit_log").insert({
        user_id: user.id,
        action: `FINTRAC ${fintracStrType.toUpperCase()} exported: ${selectedCase.title}`,
        entity_type: "case",
        entity_id: selectedCase.id,
        details: { report_type: fintracStrType, jurisdiction: "FINTRAC-Canada", str_report_id: strReport?.id, transactions_count: transactions.length },
      });
    } catch (err: any) {
      console.error("FINTRAC export error:", err);
      toast.error(`PDF export failed: ${err?.message || "Unknown error"}`);
    }
  };

  // ── MOKAS (Cyprus) Validation & Export ──
  const validateMokasFields = (): string[] => {
    const errors: string[] = [];
    if (!mokasFields.complianceOfficerName) errors.push("complianceOfficerName");
    if (!mokasFields.sourceOfFunds) errors.push("sourceOfFunds");
    if (!mokasFields.destinationOfFunds) errors.push("destinationOfFunds");
    if (!mokasFields.methodOfPayment) errors.push("methodOfPayment");
    if (!mokasFields.suspicionType) errors.push("suspicionType");
    if (mokasFields.selectedIndicators.length === 0) errors.push("selectedIndicators");
    if (!mokasFields.actionTaken) errors.push("actionTaken");
    if (notes.length === 0) errors.push("notes");
    return errors;
  };

  const handleExportMOKAS = async () => {
    if (!selectedCase) return;

    const errors = validateMokasFields();
    if (errors.length > 0) {
      setMokasValidationErrors(errors);
      const labels: Record<string, string> = {
        complianceOfficerName: "AMLCO Name",
        sourceOfFunds: "Source of Funds",
        destinationOfFunds: "Destination of Funds",
        methodOfPayment: "Method of Payment",
        suspicionType: "Suspicion Type",
        selectedIndicators: "At least 1 Indicator",
        actionTaken: "Action Taken",
        notes: "Investigation Narrative (add case notes)",
      };
      const missing = errors.map(e => labels[e] || e).join(", ");
      toast.error(`Missing mandatory fields: ${missing}`, { duration: 6000 });
      return;
    }
    setMokasValidationErrors([]);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error("Please log in to export"); return; }

      let customer = null;
      if (selectedCase.customer_id) {
        const { data } = await supabase.from("suite_customers").select("*").eq("id", selectedCase.customer_id).single();
        customer = data;
      }

      const transactions = caseTransactions.filter(t => selectedTxIds.has(t.id));

      const result = await exportMOKASStr({
        caseItem: selectedCase,
        notes,
        customer,
        transactions,
        submittedBy: user.email ?? "AMLCO",
        reportingEntity: "WorldAML Client",
        reportingEntityRef: `MOKAS-STR-${selectedCase.id.slice(0, 8).toUpperCase()}`,
        manualFields: mokasFields,
      });

      setPdfPreview(result);

      // Persist STR report
      const { data: strReport } = await supabase.from("str_reports").insert({
        user_id: user.id,
        case_id: selectedCase.id,
        customer_id: selectedCase.customer_id,
        filing_status: "draft",
        camlo_name: mokasFields.complianceOfficerName,
        action_taken: mokasFields.actionTaken,
        grounds_for_suspicion: mokasFields.suspicionType,
      }).select("id").single();

      if (strReport && transactions.length > 0) {
        await supabase.from("str_report_transactions").insert(
          transactions.map(tx => ({ report_id: strReport.id, transaction_id: tx.id }))
        );
      }

      await supabase.from("suite_audit_log").insert({
        user_id: user.id,
        action: `MOKAS STR exported: ${selectedCase.title}`,
        entity_type: "case",
        entity_id: selectedCase.id,
        details: { report_type: "mokas_str", jurisdiction: "CySEC-Cyprus", str_report_id: strReport?.id, transactions_count: transactions.length },
      });
    } catch (err: any) {
      console.error("MOKAS export error:", err);
      toast.error(`PDF export failed: ${err?.message || "Unknown error"}`);
    }
  };

  const handleDownloadPdf = () => {
    if (!pdfPreview) return;
    const link = document.createElement("a");
    link.href = pdfPreview.blobUrl;
    link.download = pdfPreview.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("PDF downloaded");
  };

  const closePdfPreview = useCallback(() => {
    if (pdfPreview) {
      URL.revokeObjectURL(pdfPreview.blobUrl);
      setPdfPreview(null);
    }
  }, [pdfPreview]);

  const filtered = cases.filter(c =>
    (filter === "All" || c.status === filter) &&
    (!search || c.title.toLowerCase().includes(search.toLowerCase()))
  );

  // ── Case Detail View ──
  if (selectedCase) {
    return (
      <>
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
            <button onClick={() => setShowChecklist(!showChecklist)}
              className={cn("flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors",
                showChecklist ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-foreground border-border hover:bg-muted/80")}>
              <ClipboardCheck className="w-3 h-3" /> Compliance Checklist
            </button>
            {selectedCase.status === "open" && (
              <button onClick={() => updateStatus(selectedCase.id, "investigating")}
                className="text-xs px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg hover:bg-amber-100">
                Investigate
              </button>
            )}
            {selectedCase.status === "investigating" && (
              <>
                {availableExports.has("sar") && (
                  <button onClick={() => updateStatus(selectedCase.id, "sar_filed")}
                    className="text-xs px-3 py-1.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg hover:bg-purple-100">
                    File SAR (FinCEN)
                  </button>
                )}
                {availableExports.has("fintrac") && (
                  <button onClick={() => updateStatus(selectedCase.id, "str_filed")}
                    className="text-xs px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100">
                    File STR (FINTRAC)
                  </button>
                )}
                {availableExports.has("mokas") && (
                  <button onClick={() => updateStatus(selectedCase.id, "str_filed")}
                    className="text-xs px-3 py-1.5 bg-teal-50 text-teal-700 border border-teal-200 rounded-lg hover:bg-teal-100">
                    File STR (MOKAS)
                  </button>
                )}
              </>
            )}
            {selectedCase.status !== "closed" && (
              <button onClick={() => updateStatus(selectedCase.id, "closed")}
                className="text-xs px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100">
                Close
              </button>
            )}
            {(selectedCase.status === "sar_filed" || selectedCase.status === "closed") && availableExports.has("sar") && (
              <button onClick={handleExportSAR}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium">
                <Download className="w-3 h-3" /> SAR PDF
              </button>
            )}
            {(selectedCase.status === "str_filed" || selectedCase.status === "sar_filed" || selectedCase.status === "closed") && (
              <>
                {availableExports.has("fintrac") && (
                  <button onClick={() => { setShowFintracPanel(!showFintracPanel); setShowMokasPanel(false); }}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium">
                    <Flag className="w-3 h-3" /> FINTRAC Report
                  </button>
                )}
                {availableExports.has("mokas") && (
                  <button onClick={() => { setShowMokasPanel(!showMokasPanel); setShowFintracPanel(false); }}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium">
                    <MapPin className="w-3 h-3" /> MOKAS Report
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Compliance Checklist Panel */}
        {showChecklist && (
          <div className="bg-card border border-border rounded-xl overflow-hidden animate-fade-in">
            <div className="px-5 py-4 border-b border-border bg-muted/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="w-4 h-4 text-primary" />
                <h2 className="font-semibold text-foreground text-sm">
                  Regulatory Reporting Obligations
                  {userRegulator && (
                    <span className="ml-2 text-xs font-normal px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                      {userRegulator}
                    </span>
                  )}
                </h2>
              </div>
              {!userRegulator && (
                <span className="text-[10px] text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full font-medium">
                  No regulator set — showing all obligations
                </span>
              )}
            </div>
            {regulatorReports.length > 0 ? (
              <div className="divide-y divide-border">
                {regulatorReports.map(report => {
                  const isFiled = filedReports.has(report.id) ||
                    (report.exportKey === "sar" && (selectedCase.status === "sar_filed" || selectedCase.status === "closed")) ||
                    (report.exportKey === "fintrac" && selectedCase.status === "str_filed") ||
                    (report.exportKey === "mokas" && selectedCase.status === "str_filed");
                  return (
                    <div key={report.id} className={cn("px-5 py-3 flex items-center gap-4", isFiled && "bg-emerald-50/30")}>
                      <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0",
                        isFiled ? "border-emerald-500 bg-emerald-100" : "border-muted-foreground/30 bg-background"
                      )}>
                        {isFiled && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-foreground">{report.name}</span>
                          <span className="text-[10px] text-muted-foreground">— {report.description}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="text-[10px] text-muted-foreground">
                            <strong>Deadline:</strong> {report.deadline}
                          </span>
                          {report.threshold && (
                            <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded font-medium">
                              Threshold: {report.threshold}
                            </span>
                          )}
                          <span className="text-[10px] text-muted-foreground font-mono">{report.legalBasis}</span>
                        </div>
                      </div>
                      <div>
                        {isFiled ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 font-semibold">
                            Filed
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200 font-semibold">
                            Pending
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="px-5 py-6">
                <p className="text-sm text-muted-foreground mb-3">All jurisdictions' reporting obligations are available:</p>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(REGULATOR_REPORTS).map(([reg, reports]) => (
                    <div key={reg} className="border border-border rounded-lg p-3">
                      <h4 className="text-xs font-bold text-foreground mb-1.5">{reg}</h4>
                      <div className="space-y-1">
                        {reports.map(r => (
                          <div key={r.id} className="flex items-center gap-2">
                            <span className="text-[10px] font-semibold text-primary">{r.name}</span>
                            <span className="text-[10px] text-muted-foreground">{r.description}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {regulatorReports.length > 0 && (() => {
              const filed = regulatorReports.filter(r =>
                filedReports.has(r.id) ||
                (r.exportKey === "sar" && (selectedCase.status === "sar_filed" || selectedCase.status === "closed")) ||
                (r.exportKey === "fintrac" && selectedCase.status === "str_filed") ||
                (r.exportKey === "mokas" && selectedCase.status === "str_filed")
              ).length;
              const total = regulatorReports.length;
              const pct = Math.round((filed / total) * 100);
              return (
                <div className="px-5 py-3 border-t border-border bg-muted/20 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                      <div className={cn("h-full rounded-full transition-all",
                        pct === 100 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-500" : "bg-red-400"
                      )} style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-[11px] font-semibold text-muted-foreground">{filed}/{total} obligations addressed</span>
                  </div>
                  <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full",
                    pct === 100 ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                  )}>
                    {pct === 100 ? "✓ Compliant" : `${pct}% Complete`}
                  </span>
                </div>
              );
            })()}
          </div>
        )}

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
            <div className="grid grid-cols-4 gap-3 mb-4">
              {([
                { value: "str" as const, label: "STR", desc: "Suspicious Transaction Report", icon: AlertTriangle, deadline: "3 business days" },
                { value: "lctr" as const, label: "LCTR", desc: "Large Cash Transaction (≥ CAD 10,000)", icon: FileText, deadline: "15 calendar days" },
                { value: "eftr" as const, label: "EFTR", desc: "Electronic Funds Transfer (≥ CAD 10,000)", icon: Shield, deadline: "15 calendar days" },
                { value: "tpr" as const, label: "TPR", desc: "Terrorist Property Report (s.7.1)", icon: Flag, deadline: "Immediately" },
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

            {/* Transaction Selection */}
            {caseTransactions.length > 0 && (
              <div className="bg-white border border-red-200 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold text-red-900 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" /> Select Transactions for Report
                  </h3>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setSelectedTxIds(new Set(caseTransactions.map(t => t.id)))}
                      className="text-[10px] text-red-600 hover:text-red-800 underline">Select all</button>
                    <button onClick={() => setSelectedTxIds(new Set())}
                      className="text-[10px] text-red-600 hover:text-red-800 underline">Clear</button>
                    <span className="text-[10px] font-semibold text-red-700">{selectedTxIds.size}/{caseTransactions.length} selected</span>
                  </div>
                </div>
                <div className="max-h-[200px] overflow-y-auto border border-red-100 rounded-lg divide-y divide-red-50">
                  {caseTransactions.map(tx => (
                    <label key={tx.id} className="flex items-center gap-3 px-3 py-2 hover:bg-red-50/50 cursor-pointer">
                      <input type="checkbox" checked={selectedTxIds.has(tx.id)}
                        onChange={e => {
                          const next = new Set(selectedTxIds);
                          e.target.checked ? next.add(tx.id) : next.delete(tx.id);
                          setSelectedTxIds(next);
                        }}
                        className="rounded border-red-300 text-red-600 focus:ring-red-300" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-semibold",
                            tx.direction === "inbound" ? "bg-emerald-100 text-emerald-700" : "bg-orange-100 text-orange-700"
                          )}>{tx.direction}</span>
                          <span className="text-xs font-semibold text-foreground">{tx.currency} {Number(tx.amount).toLocaleString()}</span>
                          {tx.counterparty && <span className="text-[11px] text-muted-foreground">→ {tx.counterparty}</span>}
                          {tx.risk_flag && <span className="text-[9px] bg-red-100 text-red-700 px-1 rounded font-bold">FLAGGED</span>}
                        </div>
                        <span className="text-[10px] text-muted-foreground">{new Date(tx.created_at).toLocaleDateString()}{tx.description ? ` · ${tx.description}` : ''}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

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

            {/* TPR-Specific Fields */}
            {fintracStrType === "tpr" && (
              <div className="space-y-4 mt-4">
                {/* Terrorist Entity */}
                <div className="bg-white border border-red-200 rounded-xl p-4">
                  <h3 className="text-xs font-bold text-red-900 mb-1 flex items-center gap-1.5">
                    <Flag className="w-3.5 h-3.5" /> Terrorist Entity / Listed Person
                  </h3>
                  <p className="text-[10px] text-red-600 mb-3">Criminal Code s.83.05 — Identify the listed entity or person whose property has been identified.</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-semibold text-red-800 mb-1 block">Listed Entity / Person Name *</label>
                      <input value={mf.tprTerroristEntityName} onChange={e => setMF({ tprTerroristEntityName: e.target.value })}
                        placeholder="Full name as listed"
                        className={cn("w-full border rounded-lg px-2.5 py-1.5 text-xs bg-white text-foreground focus:ring-1 focus:outline-none",
                          validationErrors.includes("tprTerroristEntityName") ? "border-red-500 ring-2 ring-red-300 bg-red-50" : "border-red-200 focus:ring-red-300")} />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-red-800 mb-1 block">Entity Type</label>
                      <select value={mf.tprTerroristEntityType} onChange={e => setMF({ tprTerroristEntityType: e.target.value })}
                        className="w-full border border-red-200 rounded-lg px-2.5 py-1.5 text-xs bg-white text-foreground focus:ring-1 focus:ring-red-300 focus:outline-none">
                        <option value="individual">Individual</option>
                        <option value="entity">Entity / Organisation</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-red-800 mb-1 block">Listed Under (Regulation) *</label>
                      <select value={mf.tprListedUnder} onChange={e => setMF({ tprListedUnder: e.target.value })}
                        className={cn("w-full border rounded-lg px-2.5 py-1.5 text-xs bg-white text-foreground focus:ring-1 focus:outline-none",
                          validationErrors.includes("tprListedUnder") ? "border-red-500 ring-2 ring-red-300 bg-red-50" : "border-red-200 focus:ring-red-300")}>
                        <option value="">Select regulation…</option>
                        <option value="Criminal Code s.83.05 — Listed Entity">Criminal Code s.83.05 — Listed Entity</option>
                        <option value="UNAQTR — UN Al-Qaida/Taliban Regulations">UNAQTR — UN Al-Qaida/Taliban Regulations</option>
                        <option value="SEMA — Special Economic Measures Act">SEMA — Special Economic Measures Act</option>
                        <option value="JVCFOA — Justice for Victims of Corrupt Foreign Officials">JVCFOA — Magnitsky Act</option>
                        <option value="Other — See Notes">Other — See Notes</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-red-800 mb-1 block">Date Property Discovered *</label>
                      <input type="date" value={mf.tprDateDiscovered} onChange={e => setMF({ tprDateDiscovered: e.target.value })}
                        className={cn("w-full border rounded-lg px-2.5 py-1.5 text-xs bg-white text-foreground focus:ring-1 focus:outline-none",
                          validationErrors.includes("tprDateDiscovered") ? "border-red-500 ring-2 ring-red-300 bg-red-50" : "border-red-200 focus:ring-red-300")} />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[10px] font-semibold text-red-800 mb-1 block">Relationship to Listed Entity</label>
                      <select value={mf.tprRelationshipToEntity} onChange={e => setMF({ tprRelationshipToEntity: e.target.value })}
                        className="w-full border border-red-200 rounded-lg px-2.5 py-1.5 text-xs bg-white text-foreground focus:ring-1 focus:ring-red-300 focus:outline-none">
                        <option value="">Select relationship…</option>
                        <option value="Account holder">Account holder</option>
                        <option value="Signatory / Authorised person">Signatory / Authorised person</option>
                        <option value="Beneficial owner">Beneficial owner</option>
                        <option value="Associate / Family member">Associate / Family member</option>
                        <option value="Director / Officer">Director / Officer</option>
                        <option value="Agent / Nominee">Agent / Nominee</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Property Details */}
                <div className="bg-white border border-red-200 rounded-xl p-4">
                  <h3 className="text-xs font-bold text-red-900 mb-1 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" /> Property Details (PCMLTFA s.7.1)
                  </h3>
                  <p className="text-[10px] text-red-600 mb-3">Describe the property owned or controlled by the listed entity that you have identified.</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-semibold text-red-800 mb-1 block">Property Type *</label>
                      <select value={mf.tprPropertyType} onChange={e => setMF({ tprPropertyType: e.target.value })}
                        className={cn("w-full border rounded-lg px-2.5 py-1.5 text-xs bg-white text-foreground focus:ring-1 focus:outline-none",
                          validationErrors.includes("tprPropertyType") ? "border-red-500 ring-2 ring-red-300 bg-red-50" : "border-red-200 focus:ring-red-300")}>
                        <option value="">Select type…</option>
                        <option value="bank_account">Bank Account / Deposit</option>
                        <option value="investment">Investment / Securities</option>
                        <option value="real_estate">Real Estate / Property</option>
                        <option value="vehicle">Vehicle / Vessel / Aircraft</option>
                        <option value="cash">Cash / Currency</option>
                        <option value="crypto">Virtual Currency / Crypto-asset</option>
                        <option value="insurance">Insurance Policy / Annuity</option>
                        <option value="precious">Precious Metals / Stones</option>
                        <option value="other">Other Property</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-red-800 mb-1 block">Estimated Value *</label>
                      <div className="flex gap-2">
                        <select value={mf.tprPropertyCurrency} onChange={e => setMF({ tprPropertyCurrency: e.target.value })}
                          className="w-20 border border-red-200 rounded-lg px-2 py-1.5 text-xs bg-white text-foreground focus:ring-1 focus:ring-red-300 focus:outline-none">
                          <option value="CAD">CAD</option>
                          <option value="USD">USD</option>
                          <option value="EUR">EUR</option>
                          <option value="GBP">GBP</option>
                        </select>
                        <input type="number" value={mf.tprPropertyValue} onChange={e => setMF({ tprPropertyValue: e.target.value })}
                          placeholder="0.00"
                          className={cn("flex-1 border rounded-lg px-2.5 py-1.5 text-xs bg-white text-foreground focus:ring-1 focus:outline-none",
                            validationErrors.includes("tprPropertyValue") ? "border-red-500 ring-2 ring-red-300 bg-red-50" : "border-red-200 focus:ring-red-300")} />
                      </div>
                    </div>
                    <div className="col-span-2">
                      <label className="text-[10px] font-semibold text-red-800 mb-1 block">Property Description *</label>
                      <textarea value={mf.tprPropertyDescription} onChange={e => setMF({ tprPropertyDescription: e.target.value })}
                        placeholder="Describe the property — account number, asset details, location, etc."
                        rows={2}
                        className={cn("w-full border rounded-lg px-2.5 py-1.5 text-xs bg-white text-foreground focus:ring-1 focus:outline-none resize-none",
                          validationErrors.includes("tprPropertyDescription") ? "border-red-500 ring-2 ring-red-300 bg-red-50" : "border-red-200 focus:ring-red-300")} />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[10px] font-semibold text-red-800 mb-1 block">Location of Property</label>
                      <input value={mf.tprPropertyLocation} onChange={e => setMF({ tprPropertyLocation: e.target.value })}
                        placeholder="Branch, address, jurisdiction, or account location"
                        className="w-full border border-red-200 rounded-lg px-2.5 py-1.5 text-xs bg-white text-foreground focus:ring-1 focus:ring-red-300 focus:outline-none" />
                    </div>
                  </div>
                </div>

                {/* Disposition Action */}
                <div className="bg-white border border-red-200 rounded-xl p-4">
                  <h3 className="text-xs font-bold text-red-900 mb-1 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5" /> Disposition & Action (Criminal Code s.83.08)
                  </h3>
                  <p className="text-[10px] text-red-600 mb-3">Under Criminal Code s.83.08, no person shall deal with property owned/controlled by a listed entity. Report what action has been taken.</p>
                  <div>
                    <label className="text-[10px] font-semibold text-red-800 mb-1 block">Disposition Action *</label>
                    <select value={mf.tprDispositionAction} onChange={e => setMF({ tprDispositionAction: e.target.value })}
                      className={cn("w-full border rounded-lg px-2.5 py-1.5 text-xs bg-white text-foreground focus:ring-1 focus:outline-none",
                        validationErrors.includes("tprDispositionAction") ? "border-red-500 ring-2 ring-red-300 bg-red-50" : "border-red-200 focus:ring-red-300")}>
                      <option value="">Select action…</option>
                      <option value="frozen">Property Frozen / Account Blocked</option>
                      <option value="seized">Property Seized by Law Enforcement</option>
                      <option value="reported_rcmp">Reported to RCMP / CSIS</option>
                      <option value="retained">Property Retained — Awaiting Direction</option>
                      <option value="released">Property Released (with FINTRAC/court order)</option>
                      <option value="other">Other — See Notes</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 flex-wrap mt-4">
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

        {/* MOKAS (Cyprus) Export Panel */}
        {showMokasPanel && (
          <div className="bg-teal-50 border border-teal-200 rounded-xl p-5 animate-fade-in">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4 text-teal-700" />
              <h2 className="font-semibold text-teal-900">MOKAS — Cyprus Suspicious Transaction Report</h2>
            </div>
            <p className="text-xs text-teal-700 mb-4">
              File STR to MOKAS (Unit for Combating Money Laundering) per AML Law 188(I)/2007. CySEC-regulated entities must file within 3 working days of forming suspicion (CySEC Directive DI144-2007-08, Para. 34).
            </p>

            {/* Transaction Selection */}
            {caseTransactions.length > 0 && (
              <div className="bg-white border border-teal-200 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold text-teal-900 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" /> Select Transactions for Report
                  </h3>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setSelectedTxIds(new Set(caseTransactions.map(t => t.id)))}
                      className="text-[10px] text-teal-600 hover:text-teal-800 underline">Select all</button>
                    <button onClick={() => setSelectedTxIds(new Set())}
                      className="text-[10px] text-teal-600 hover:text-teal-800 underline">Clear</button>
                    <span className="text-[10px] font-semibold text-teal-700">{selectedTxIds.size}/{caseTransactions.length} selected</span>
                  </div>
                </div>
                <div className="max-h-[200px] overflow-y-auto border border-teal-100 rounded-lg divide-y divide-teal-50">
                  {caseTransactions.map(tx => (
                    <label key={tx.id} className="flex items-center gap-3 px-3 py-2 hover:bg-teal-50/50 cursor-pointer">
                      <input type="checkbox" checked={selectedTxIds.has(tx.id)}
                        onChange={e => {
                          const next = new Set(selectedTxIds);
                          e.target.checked ? next.add(tx.id) : next.delete(tx.id);
                          setSelectedTxIds(next);
                        }}
                        className="rounded border-teal-300 text-teal-600 focus:ring-teal-300" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-semibold",
                            tx.direction === "inbound" ? "bg-emerald-100 text-emerald-700" : "bg-orange-100 text-orange-700"
                          )}>{tx.direction}</span>
                          <span className="text-xs font-semibold text-foreground">{tx.currency} {Number(tx.amount).toLocaleString()}</span>
                          {tx.counterparty && <span className="text-[11px] text-muted-foreground">→ {tx.counterparty}</span>}
                          {tx.risk_flag && <span className="text-[9px] bg-red-100 text-red-700 px-1 rounded font-bold">FLAGGED</span>}
                        </div>
                        <span className="text-[10px] text-muted-foreground">{new Date(tx.created_at).toLocaleDateString()}{tx.description ? ` · ${tx.description}` : ''}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Validation Summary */}
            {mokasValidationErrors.length > 0 && (
              <div className="bg-teal-50 border-2 border-teal-400 rounded-xl p-3 flex items-start gap-2 animate-fade-in mb-4">
                <XCircle className="w-4 h-4 text-teal-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-teal-800">Missing mandatory fields — please complete before exporting</p>
                  <p className="text-[10px] text-teal-600 mt-0.5">Fields highlighted below must be filled to comply with AML Law 188(I)/2007.</p>
                </div>
              </div>
            )}

            {/* ── Manual Entry Forms ── */}
            <div className="space-y-4 mt-4">
              {/* Section 1: Reporting Entity & AMLCO */}
              <div className="bg-white border border-teal-200 rounded-xl p-4">
                <h3 className="text-xs font-bold text-teal-900 mb-1 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" /> Reporting Entity & AMLCO
                </h3>
                <p className="text-[10px] text-teal-600 mb-3">AML Law Art. 69 — Identify the reporting entity and Anti-Money Laundering Compliance Officer (AMLCO).</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-semibold text-teal-800 mb-1 block">AMLCO Name *</label>
                    <input value={mokasFields.complianceOfficerName} onChange={e => setMokasF({ complianceOfficerName: e.target.value })}
                      placeholder="Full name of AMLCO"
                      className={cn("w-full border rounded-lg px-2.5 py-1.5 text-xs bg-white text-foreground focus:ring-1 focus:outline-none",
                        mokasValidationErrors.includes("complianceOfficerName") ? "border-red-500 ring-2 ring-red-300 bg-red-50" : "border-teal-200 focus:ring-teal-300")} />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-teal-800 mb-1 block">Position / Title</label>
                    <input value={mokasFields.complianceOfficerPosition} onChange={e => setMokasF({ complianceOfficerPosition: e.target.value })}
                      placeholder="e.g. AMLCO, Compliance Director"
                      className="w-full border border-teal-200 rounded-lg px-2.5 py-1.5 text-xs bg-white text-foreground focus:ring-1 focus:ring-teal-300 focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-teal-800 mb-1 block">CySEC License / CIF Number</label>
                    <input value={mokasFields.reportingEntityCIF} onChange={e => setMokasF({ reportingEntityCIF: e.target.value })}
                      placeholder="e.g. CIF 123/10"
                      className="w-full border border-teal-200 rounded-lg px-2.5 py-1.5 text-xs bg-white text-foreground focus:ring-1 focus:ring-teal-300 focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-teal-800 mb-1 block">DRCOR Registration No.</label>
                    <input value={mokasFields.reportingEntityDRCOR} onChange={e => setMokasF({ reportingEntityDRCOR: e.target.value })}
                      placeholder="Department of Registrar of Companies"
                      className="w-full border border-teal-200 rounded-lg px-2.5 py-1.5 text-xs bg-white text-foreground focus:ring-1 focus:ring-teal-300 focus:outline-none" />
                  </div>
                </div>
              </div>

              {/* Section 2: Subject Details */}
              <div className="bg-white border border-teal-200 rounded-xl p-4">
                <h3 className="text-xs font-bold text-teal-900 mb-1 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" /> Subject Details (Cyprus-Specific)
                </h3>
                <p className="text-[10px] text-teal-600 mb-3">AML Law Art. 58 — Additional identification details for the subject of suspicion.</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-semibold text-teal-800 mb-1 block">Passport / ID Number</label>
                    <input value={mokasFields.subjectPassportId} onChange={e => setMokasF({ subjectPassportId: e.target.value })}
                      placeholder="National ID or passport number"
                      className="w-full border border-teal-200 rounded-lg px-2.5 py-1.5 text-xs bg-white text-foreground focus:ring-1 focus:ring-teal-300 focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-teal-800 mb-1 block">Occupation / Business Activity</label>
                    <input value={mokasFields.subjectOccupation} onChange={e => setMokasF({ subjectOccupation: e.target.value })}
                      placeholder="e.g. Director, Real Estate Agent"
                      className="w-full border border-teal-200 rounded-lg px-2.5 py-1.5 text-xs bg-white text-foreground focus:ring-1 focus:ring-teal-300 focus:outline-none" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] font-semibold text-teal-800 mb-1 block">Address</label>
                    <input value={mokasFields.subjectAddress} onChange={e => setMokasF({ subjectAddress: e.target.value })}
                      placeholder="Full residential or registered address"
                      className="w-full border border-teal-200 rounded-lg px-2.5 py-1.5 text-xs bg-white text-foreground focus:ring-1 focus:ring-teal-300 focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-teal-800 mb-1 block">PEP Status (Art. 38)</label>
                    <select value={mokasFields.subjectPEP} onChange={e => setMokasF({ subjectPEP: e.target.value })}
                      className="w-full border border-teal-200 rounded-lg px-2.5 py-1.5 text-xs bg-white text-foreground focus:ring-1 focus:ring-teal-300 focus:outline-none">
                      <option value="no">No — Not a PEP</option>
                      <option value="yes">Yes — PEP</option>
                      <option value="domestic_pep">Yes — Domestic PEP</option>
                      <option value="foreign_pep">Yes — Foreign PEP (Art. 38)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-teal-800 mb-1 block">Beneficial Owner</label>
                    <input value={mokasFields.beneficialOwner} onChange={e => setMokasF({ beneficialOwner: e.target.value })}
                      placeholder="If different from subject"
                      className="w-full border border-teal-200 rounded-lg px-2.5 py-1.5 text-xs bg-white text-foreground focus:ring-1 focus:ring-teal-300 focus:outline-none" />
                  </div>
                </div>
              </div>

              {/* Section 3: Transaction Details */}
              <div className="bg-white border border-teal-200 rounded-xl p-4">
                <h3 className="text-xs font-bold text-teal-900 mb-1 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" /> Transaction Details (Art. 58)
                </h3>
                <p className="text-[10px] text-teal-600 mb-3">AML Law Art. 58 — Source and destination of funds and method of payment.</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-semibold text-teal-800 mb-1 block">Source of Funds *</label>
                    <select value={mokasFields.sourceOfFunds} onChange={e => setMokasF({ sourceOfFunds: e.target.value })}
                      className={cn("w-full border rounded-lg px-2.5 py-1.5 text-xs bg-white text-foreground focus:ring-1 focus:outline-none",
                        mokasValidationErrors.includes("sourceOfFunds") ? "border-red-500 ring-2 ring-red-300 bg-red-50" : "border-teal-200 focus:ring-teal-300")}>
                      <option value="">Select source…</option>
                      <option value="Employment / Salary">Employment / Salary</option>
                      <option value="Business revenue">Business revenue</option>
                      <option value="Savings / Investments">Savings / Investments</option>
                      <option value="Loan proceeds">Loan proceeds</option>
                      <option value="Sale of property">Sale of property</option>
                      <option value="Inheritance / Gift">Inheritance / Gift</option>
                      <option value="Rental income">Rental income</option>
                      <option value="Dividends / Capital gains">Dividends / Capital gains</option>
                      <option value="Unknown / Unable to verify">Unknown / Unable to verify</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-teal-800 mb-1 block">Destination of Funds *</label>
                    <select value={mokasFields.destinationOfFunds} onChange={e => setMokasF({ destinationOfFunds: e.target.value })}
                      className={cn("w-full border rounded-lg px-2.5 py-1.5 text-xs bg-white text-foreground focus:ring-1 focus:outline-none",
                        mokasValidationErrors.includes("destinationOfFunds") ? "border-red-500 ring-2 ring-red-300 bg-red-50" : "border-teal-200 focus:ring-teal-300")}>
                      <option value="">Select destination…</option>
                      <option value="Wire transfer (domestic)">Wire transfer (domestic)</option>
                      <option value="Wire transfer (international)">Wire transfer (international)</option>
                      <option value="Cash withdrawal">Cash withdrawal</option>
                      <option value="Account credit">Account credit</option>
                      <option value="Investment purchase">Investment purchase</option>
                      <option value="Real estate purchase">Real estate purchase</option>
                      <option value="Crypto / virtual currency">Crypto / virtual currency</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] font-semibold text-teal-800 mb-1 block">Method of Payment *</label>
                    <select value={mokasFields.methodOfPayment} onChange={e => setMokasF({ methodOfPayment: e.target.value })}
                      className={cn("w-full border rounded-lg px-2.5 py-1.5 text-xs bg-white text-foreground focus:ring-1 focus:outline-none",
                        mokasValidationErrors.includes("methodOfPayment") ? "border-red-500 ring-2 ring-red-300 bg-red-50" : "border-teal-200 focus:ring-teal-300")}>
                      <option value="">Select method…</option>
                      <option value="Bank transfer">Bank transfer</option>
                      <option value="Cash">Cash</option>
                      <option value="Cheque / Bank draft">Cheque / Bank draft</option>
                      <option value="Credit/Debit card">Credit/Debit card</option>
                      <option value="E-wallet / Online payment">E-wallet / Online payment</option>
                      <option value="Cryptocurrency">Cryptocurrency</option>
                      <option value="Mixed methods">Mixed methods</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 4: Grounds for Suspicion */}
              <div className="bg-white border border-teal-200 rounded-xl p-4">
                <h3 className="text-xs font-bold text-teal-900 mb-1 flex items-center gap-1.5">
                  <Flag className="w-3.5 h-3.5" /> Grounds for Suspicion (Art. 27)
                </h3>
                <p className="text-[10px] text-teal-600 mb-3">AML Law Art. 27 — Select suspicion type and applicable indicators from MOKAS/CySEC guidance.</p>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="text-[10px] font-semibold text-teal-800 mb-1 block">Suspicion Type *</label>
                    <select value={mokasFields.suspicionType} onChange={e => setMokasF({ suspicionType: e.target.value })}
                      className="w-full border border-teal-200 rounded-lg px-2.5 py-1.5 text-xs bg-white text-foreground focus:ring-1 focus:ring-teal-300 focus:outline-none">
                      <option value="ml">Money Laundering (ML)</option>
                      <option value="tf">Terrorist Financing (TF)</option>
                      <option value="sanctions">Sanctions Evasion</option>
                      <option value="ml_tf">ML and TF</option>
                      <option value="fraud">Fraud / Predicate Offence</option>
                    </select>
                  </div>
                </div>
                <label className={cn("text-[10px] font-semibold mb-2 block",
                  mokasValidationErrors.includes("selectedIndicators") ? "text-red-600" : "text-teal-800")}>
                  Suspicion Indicators (select at least 1) {mokasValidationErrors.includes("selectedIndicators") && <span className="text-red-500 font-bold">⚠ Required</span>}
                </label>
                <div className="space-y-1.5">
                  {[
                    "Transaction inconsistent with client's known business or economic profile",
                    "Structuring transactions to avoid €10,000 reporting threshold",
                    "Involvement of high-risk third country (EU Commission list)",
                    "Unusual use of shell companies, trusts, or nominee structures",
                    "Client unable or unwilling to provide source of funds/wealth",
                    "Rapid movement of funds with no apparent economic rationale",
                    "Transactions involving sanctioned jurisdictions or persons",
                    "Use of complex corporate structures disproportionate to business needs",
                    "Funds linked to jurisdictions with weak AML frameworks",
                    "Client is PEP or close associate / family member of PEP (Art. 38)",
                    "Adverse media linking client to financial crime or corruption",
                    "Dormant account suddenly reactivated with significant transactions",
                  ].map((ind, i) => (
                    <label key={i} className="flex items-start gap-2 cursor-pointer group">
                      <input type="checkbox" checked={mokasFields.selectedIndicators.includes(i)}
                        onChange={e => {
                          const next = e.target.checked
                            ? [...mokasFields.selectedIndicators, i]
                            : mokasFields.selectedIndicators.filter(x => x !== i);
                          setMokasF({ selectedIndicators: next });
                        }}
                        className="mt-0.5 rounded border-teal-300 text-teal-600 focus:ring-teal-300" />
                      <span className="text-[11px] text-foreground group-hover:text-teal-800 transition-colors">{ind}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Section 5: Action Taken */}
              <div className="bg-white border border-teal-200 rounded-xl p-4">
                <h3 className="text-xs font-bold text-teal-900 mb-1 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" /> Action Taken & Internal Measures (Art. 27(5))
                </h3>
                <p className="text-[10px] text-teal-600 mb-3">Document what action has been or will be taken, plus any internal measures applied.</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-semibold text-teal-800 mb-1 block">Action Taken *</label>
                    <select value={mokasFields.actionTaken} onChange={e => setMokasF({ actionTaken: e.target.value })}
                      className={cn("w-full border rounded-lg px-2.5 py-1.5 text-xs bg-white text-foreground focus:ring-1 focus:outline-none",
                        mokasValidationErrors.includes("actionTaken") ? "border-red-500 ring-2 ring-red-300 bg-red-50" : "border-teal-200 focus:ring-teal-300")}>
                      <option value="">Select action…</option>
                      <option value="Enhanced monitoring applied">Enhanced monitoring applied</option>
                      <option value="Account restricted / frozen">Account restricted / frozen</option>
                      <option value="Relationship terminated">Relationship terminated</option>
                      <option value="Additional due diligence requested">Additional due diligence requested</option>
                      <option value="Transaction blocked">Transaction blocked</option>
                      <option value="Police / law enforcement notified">Police / law enforcement notified</option>
                      <option value="No further action — monitoring continues">No further action — monitoring continues</option>
                      <option value="Multiple actions taken (see notes)">Multiple actions taken (see notes)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-teal-800 mb-1 block">Internal Measures</label>
                    <input value={mokasFields.internalMeasures} onChange={e => setMokasF({ internalMeasures: e.target.value })}
                      placeholder="e.g. Enhanced due diligence, staff training"
                      className="w-full border border-teal-200 rounded-lg px-2.5 py-1.5 text-xs bg-white text-foreground focus:ring-1 focus:ring-teal-300 focus:outline-none" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap mt-4">
              <button onClick={handleExportMOKAS}
                className="flex items-center gap-1.5 text-xs px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-semibold">
                <Download className="w-3.5 h-3.5" /> Export MOKAS STR PDF
              </button>
              {mokasValidationErrors.includes("notes") && (
                <span className="text-[10px] text-teal-600 font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Add investigation notes before exporting
                </span>
              )}
              <span className="text-[10px] text-teal-500">AML Law 188(I)/2007 · CySEC DI144-2007-08</span>
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

      {/* PDF Preview Modal */}
      <Dialog open={!!pdfPreview} onOpenChange={(open) => { if (!open) closePdfPreview(); }}>
        <DialogContent className="max-w-4xl w-[90vw] h-[85vh] flex flex-col p-0 gap-0">
          <DialogHeader className="px-6 py-4 border-b border-border flex-shrink-0">
            <DialogTitle className="flex items-center gap-2 text-sm font-semibold">
              <FileText className="w-4 h-4 text-destructive" />
              {pdfPreview?.fileName ?? "FINTRAC STR Preview"}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 min-h-0">
            {pdfPreview && (
              <iframe
                src={pdfPreview.blobUrl}
                className="w-full h-full border-0"
                title="FINTRAC PDF Preview"
              />
            )}
          </div>
          <DialogFooter className="px-6 py-3 border-t border-border flex-shrink-0">
            <button
              onClick={closePdfPreview}
              className="text-xs px-3 py-1.5 border border-border rounded-lg text-muted-foreground hover:bg-muted"
            >
              Close
            </button>
            <button
              onClick={handleDownloadPdf}
              className="text-xs px-4 py-1.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium flex items-center gap-1.5"
            >
              <Download className="w-3 h-3" />
              Download PDF
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </>
    );
  }

  // ── Case List View ──
  return (
    <div className="p-6 space-y-5 h-full overflow-y-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Case Management — SAR / STR Filing</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {userRegulator
              ? `${userRegulator} · ${(REGULATOR_REPORTS[userRegulator] || []).map(r => r.name).join(" · ")} · Auto-detected from profile`
              : "FinCEN SAR · FINTRAC STR/LCTR/EFTR/TPR · MOKAS STR (Cyprus) · Multi-jurisdiction reporting"
            }
          </p>
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

      {/* PDF Preview Modal */}
      <Dialog open={!!pdfPreview} onOpenChange={(open) => { if (!open) closePdfPreview(); }}>
        <DialogContent className="max-w-4xl w-[90vw] h-[85vh] flex flex-col p-0 gap-0">
          <DialogHeader className="px-6 py-4 border-b border-border flex-shrink-0">
            <DialogTitle className="flex items-center gap-2 text-sm font-semibold">
              <FileText className="w-4 h-4 text-destructive" />
              {pdfPreview?.fileName ?? "FINTRAC STR Preview"}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 min-h-0">
            {pdfPreview && (
              <iframe
                src={pdfPreview.blobUrl}
                className="w-full h-full border-0"
                title="FINTRAC PDF Preview"
              />
            )}
          </div>
          <DialogFooter className="px-6 py-3 border-t border-border flex-shrink-0">
            <button
              onClick={closePdfPreview}
              className="text-xs px-3 py-1.5 border border-border rounded-lg text-muted-foreground hover:bg-muted"
            >
              Close
            </button>
            <button
              onClick={handleDownloadPdf}
              className="text-xs px-4 py-1.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium flex items-center gap-1.5"
            >
              <Download className="w-3 h-3" />
              Download PDF
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
