import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useOrganisation } from "@/hooks/useOrganisation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import {
  ShieldAlert, FileText, Upload, CheckCircle2, XCircle, ArrowUpRight,
  Loader2, Search, ClipboardList, PenLine, Trash2, History,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Status = "draft" | "evidence_pending" | "mlro_review" | "approved" | "rejected" | "escalated";

interface EDDCase {
  id: string;
  organisation_id: string;
  customer_id: string | null;
  case_reference: string;
  trigger_reason: string;
  risk_factors: string[];
  questionnaire: Record<string, string>;
  status: Status;
  requested_by: string;
  mlro_id: string | null;
  mlro_decision: string | null;
  mlro_reason: string | null;
  mlro_signed_at: string | null;
  submitted_for_review_at: string | null;
  created_at: string;
  updated_at: string;
  customer?: { id: string; name: string; company_name: string | null; risk_level: string | null } | null;
}
interface Evidence {
  id: string; case_id: string; file_path: string; file_name: string;
  file_size: number | null; mime_type: string | null; evidence_type: string;
  description: string | null; uploaded_by: string; created_at: string;
}
interface AuditEntry {
  id: string; case_id: string; actor_id: string; action: string;
  details: Record<string, any>; created_at: string;
}

const RISK_FACTOR_OPTIONS = [
  "PEP / Close associate",
  "High-risk jurisdiction (FATF)",
  "Adverse media hit",
  "Unusual transaction pattern",
  "Cash-intensive business",
  "Complex ownership structure",
  "Sanctions proximity",
  "Non face-to-face onboarding",
  "Source of funds unclear",
  "Correspondent banking",
];

const QUESTIONNAIRE = [
  { id: "purpose", label: "Purpose and intended nature of business relationship" },
  { id: "sof", label: "Source of funds — detailed origin and evidence" },
  { id: "sow", label: "Source of wealth — how overall wealth was accumulated" },
  { id: "expected_activity", label: "Expected transaction volume, frequency, and counterparties" },
  { id: "ownership", label: "Ownership / control structure and any UBO verifications" },
  { id: "pep_details", label: "PEP status details (position, jurisdiction, dates, family/close associates)" },
  { id: "adverse_media", label: "Adverse media findings and mitigation" },
  { id: "geographic_risk", label: "Geographic risk exposure (residence, operations, counterparties)" },
  { id: "mitigation", label: "Controls and mitigating measures applied" },
  { id: "analyst_recommendation", label: "Analyst recommendation to MLRO" },
];

const statusTone = (s: Status) => ({
  draft: "bg-muted text-muted-foreground",
  evidence_pending: "bg-amber-500/15 text-amber-500 border-amber-500/30",
  mlro_review: "bg-blue-500/15 text-blue-500 border-blue-500/30",
  approved: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
  rejected: "bg-red-500/15 text-red-500 border-red-500/30",
  escalated: "bg-orange-500/15 text-orange-500 border-orange-500/30",
}[s]);

const statusLabel = (s: Status) => ({
  draft: "Draft",
  evidence_pending: "Evidence Pending",
  mlro_review: "MLRO Review",
  approved: "Approved",
  rejected: "Rejected",
  escalated: "Escalated",
}[s]);

export default function SuiteEDD() {
  const { orgId, userId, isLoading: orgLoading } = useOrganisation();
  const [role, setRole] = useState<string | null>(null);
  const [cases, setCases] = useState<EDDCase[]>([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"all" | Status>("all");
  const [search, setSearch] = useState("");
  const [customers, setCustomers] = useState<any[]>([]);
  const [openNew, setOpenNew] = useState(false);
  const [selected, setSelected] = useState<EDDCase | null>(null);
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [audit, setAudit] = useState<AuditEntry[]>([]);
  const isMLRO = role === "mlro" || role === "admin";

  useEffect(() => {
    if (!orgId || !userId) return;
    supabase.from("suite_org_members").select("role")
      .eq("organization_id", orgId).eq("user_id", userId).maybeSingle()
      .then(({ data }) => setRole((data as any)?.role ?? null));
  }, [orgId, userId]);

  const load = async () => {
    if (!orgId) return;
    setLoading(true);
    const { data, error } = await supabase.from("suite_edd_cases")
      .select("*, customer:suite_customers(id,name,company_name,risk_level)")
      .eq("organisation_id", orgId).order("created_at", { ascending: false });
    if (error) toast({ title: "Failed to load cases", description: error.message, variant: "destructive" });
    setCases((data as any) || []);
    setLoading(false);
  };

  const loadCustomers = async () => {
    if (!orgId) return;
    const { data } = await supabase.from("suite_customers")
      .select("id,name,company_name,risk_level")
      .eq("organisation_id", orgId).order("name").limit(500);
    setCustomers(data || []);
  };

  useEffect(() => { if (!orgLoading && orgId) { load(); loadCustomers(); } }, [orgId, orgLoading]);

  const loadDetail = async (c: EDDCase) => {
    setSelected(c);
    const [{ data: e }, { data: a }] = await Promise.all([
      supabase.from("suite_edd_evidence").select("*").eq("case_id", c.id).order("created_at", { ascending: false }),
      supabase.from("suite_edd_audit").select("*").eq("case_id", c.id).order("created_at", { ascending: false }),
    ]);
    setEvidence((e as any) || []);
    setAudit((a as any) || []);
  };

  const writeAudit = async (caseId: string, action: string, details: Record<string, any> = {}) => {
    if (!orgId || !userId) return;
    await supabase.from("suite_edd_audit").insert({ case_id: caseId, organisation_id: orgId, actor_id: userId, action, details });
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return cases.filter(c => {
      if (tab !== "all" && c.status !== tab) return false;
      if (!q) return true;
      return c.case_reference.toLowerCase().includes(q)
        || c.trigger_reason.toLowerCase().includes(q)
        || (c.customer?.name || "").toLowerCase().includes(q)
        || (c.customer?.company_name || "").toLowerCase().includes(q);
    });
  }, [cases, tab, search]);

  const kpi = useMemo(() => ({
    open: cases.filter(c => ["draft","evidence_pending"].includes(c.status)).length,
    review: cases.filter(c => c.status === "mlro_review").length,
    approved: cases.filter(c => c.status === "approved").length,
    escalated: cases.filter(c => c.status === "escalated").length,
  }), [cases]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-primary" /> Enhanced Due Diligence
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            EDD questionnaire, evidence collection and MLRO sign-off with a full audit trail.
          </p>
        </div>
        <Button onClick={() => setOpenNew(true)}><ClipboardList className="h-4 w-4 mr-2" />New EDD Case</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Open", value: kpi.open, tone: "text-amber-500" },
          { label: "In MLRO Review", value: kpi.review, tone: "text-blue-500" },
          { label: "Approved", value: kpi.approved, tone: "text-emerald-500" },
          { label: "Escalated", value: kpi.escalated, tone: "text-orange-500" },
        ].map(k => (
          <Card key={k.label} className="p-4">
            <div className="text-xs text-muted-foreground">{k.label}</div>
            <div className={cn("text-2xl font-semibold mt-1", k.tone)}>{k.value}</div>
          </Card>
        ))}
      </div>

      <div className="flex gap-2 flex-wrap">
        {(["all","draft","evidence_pending","mlro_review","approved","rejected","escalated"] as const).map(t => (
          <Button key={t} size="sm" variant={tab === t ? "default" : "outline"} onClick={() => setTab(t)}>
            {t === "all" ? "All" : statusLabel(t)}
          </Button>
        ))}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search reference, customer, trigger..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin inline mr-2" />Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No EDD cases yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3">Reference</th>
                <th className="text-left px-4 py-3">Customer</th>
                <th className="text-left px-4 py-3">Trigger</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Opened</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} className="border-t hover:bg-muted/30">
                  <td className="px-4 py-3 font-mono text-xs">{c.case_reference}</td>
                  <td className="px-4 py-3">{c.customer?.company_name || c.customer?.name || <span className="text-muted-foreground">—</span>}</td>
                  <td className="px-4 py-3 max-w-[280px] truncate" title={c.trigger_reason}>{c.trigger_reason}</td>
                  <td className="px-4 py-3"><Badge variant="outline" className={statusTone(c.status)}>{statusLabel(c.status)}</Badge></td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{new Date(c.created_at).toLocaleDateString("en-GB")}</td>
                  <td className="px-4 py-3 text-right">
                    <Button size="sm" variant="ghost" onClick={() => loadDetail(c)}>Open <ArrowUpRight className="h-3 w-3 ml-1" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <NewCaseDialog
        open={openNew} onOpenChange={setOpenNew}
        orgId={orgId} userId={userId} customers={customers}
        onCreated={() => { setOpenNew(false); load(); }}
      />

      {selected && (
        <CaseDetailDialog
          open={!!selected} onOpenChange={(o) => !o && setSelected(null)}
          eddCase={selected} evidence={evidence} audit={audit}
          orgId={orgId!} userId={userId!} isMLRO={isMLRO}
          refresh={async () => {
            await load();
            const fresh = (await supabase.from("suite_edd_cases").select("*, customer:suite_customers(id,name,company_name,risk_level)").eq("id", selected.id).maybeSingle()).data as any;
            if (fresh) await loadDetail(fresh);
          }}
          writeAudit={writeAudit}
        />
      )}
    </div>
  );
}

/* ------------- New Case Dialog ------------- */
function NewCaseDialog({ open, onOpenChange, orgId, userId, customers, onCreated }: {
  open: boolean; onOpenChange: (v: boolean) => void;
  orgId: string | null; userId: string | null;
  customers: any[]; onCreated: () => void;
}) {
  const [ref, setRef] = useState("");
  const [customerId, setCustomerId] = useState<string>("");
  const [trigger, setTrigger] = useState("");
  const [factors, setFactors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setRef(`EDD-${new Date().toISOString().slice(0,10).replace(/-/g,"")}-${Math.random().toString(36).slice(2,6).toUpperCase()}`);
  }, [open]);

  const submit = async () => {
    if (!orgId || !userId) return;
    if (!trigger.trim()) { toast({ title: "Trigger reason required", variant: "destructive" }); return; }
    setSaving(true);
    const { error } = await supabase.from("suite_edd_cases").insert({
      organisation_id: orgId, requested_by: userId,
      customer_id: customerId || null, case_reference: ref,
      trigger_reason: trigger.trim(), risk_factors: factors,
      status: "draft",
    });
    setSaving(false);
    if (error) return toast({ title: "Failed to create case", description: error.message, variant: "destructive" });
    toast({ title: "EDD case opened", description: ref });
    setRef(""); setCustomerId(""); setTrigger(""); setFactors([]);
    onCreated();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Open new EDD case</DialogTitle>
          <DialogDescription>Record the trigger and risk factors. Questionnaire and evidence are completed in the case detail.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Reference</Label><Input value={ref} onChange={e => setRef(e.target.value)} /></div>
            <div>
              <Label>Customer</Label>
              <Select value={customerId} onValueChange={setCustomerId}>
                <SelectTrigger><SelectValue placeholder="Select customer (optional)" /></SelectTrigger>
                <SelectContent>
                  {customers.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.company_name || c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Trigger reason *</Label>
            <Textarea rows={3} value={trigger} onChange={e => setTrigger(e.target.value)}
              placeholder="e.g. PEP hit during periodic review; unusual €120k transfer to high-risk jurisdiction" />
          </div>
          <div>
            <Label>Risk factors</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {RISK_FACTOR_OPTIONS.map(f => (
                <label key={f} className="flex items-start gap-2 text-sm cursor-pointer">
                  <Checkbox checked={factors.includes(f)} onCheckedChange={(v) => {
                    setFactors(prev => v ? [...prev, f] : prev.filter(x => x !== f));
                  }} />
                  <span>{f}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={saving}>{saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Create case</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ------------- Case Detail Dialog ------------- */
function CaseDetailDialog({
  open, onOpenChange, eddCase, evidence, audit, orgId, userId, isMLRO, refresh, writeAudit,
}: {
  open: boolean; onOpenChange: (v: boolean) => void;
  eddCase: EDDCase; evidence: Evidence[]; audit: AuditEntry[];
  orgId: string; userId: string; isMLRO: boolean;
  refresh: () => Promise<void>;
  writeAudit: (caseId: string, action: string, details?: Record<string, any>) => Promise<void>;
}) {
  const [tab, setTab] = useState<"questionnaire" | "evidence" | "signoff" | "audit">("questionnaire");
  const [answers, setAnswers] = useState<Record<string, string>>(eddCase.questionnaire || {});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [evType, setEvType] = useState("SOF proof");
  const [evDesc, setEvDesc] = useState("");
  const [decision, setDecision] = useState<"approved" | "rejected" | "escalated">("approved");
  const [decisionReason, setDecisionReason] = useState("");
  const [signing, setSigning] = useState(false);

  useEffect(() => { setAnswers(eddCase.questionnaire || {}); }, [eddCase.id]);

  const locked = ["approved", "rejected"].includes(eddCase.status);
  const canEditQ = !locked;

  const saveQuestionnaire = async () => {
    setSaving(true);
    const { error } = await supabase.from("suite_edd_cases")
      .update({ questionnaire: answers }).eq("id", eddCase.id);
    setSaving(false);
    if (error) return toast({ title: "Save failed", description: error.message, variant: "destructive" });
    await writeAudit(eddCase.id, "questionnaire_updated", { fields: Object.keys(answers).length });
    toast({ title: "Questionnaire saved" });
    refresh();
  };

  const submitForReview = async () => {
    const answered = QUESTIONNAIRE.filter(q => (answers[q.id] || "").trim().length > 0).length;
    if (answered < 5) {
      return toast({ title: "Complete at least 5 questions", description: `Answered ${answered}/10`, variant: "destructive" });
    }
    if (evidence.length === 0) {
      return toast({ title: "Attach at least one evidence file before MLRO review", variant: "destructive" });
    }
    const { error } = await supabase.from("suite_edd_cases").update({
      questionnaire: answers, status: "mlro_review", submitted_for_review_at: new Date().toISOString(),
    }).eq("id", eddCase.id);
    if (error) return toast({ title: "Submit failed", description: error.message, variant: "destructive" });
    await writeAudit(eddCase.id, "submitted_for_mlro_review", { evidence_count: evidence.length });
    toast({ title: "Submitted to MLRO" });
    refresh();
  };

  const requestEvidence = async () => {
    const { error } = await supabase.from("suite_edd_cases").update({ status: "evidence_pending" }).eq("id", eddCase.id);
    if (error) return toast({ title: "Failed", description: error.message, variant: "destructive" });
    await writeAudit(eddCase.id, "evidence_requested");
    refresh();
  };

  const uploadEvidence = async (file: File) => {
    if (!file) return;
    if (file.size > 25 * 1024 * 1024) return toast({ title: "Max 25MB", variant: "destructive" });
    setUploading(true);
    const path = `${orgId}/${eddCase.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const up = await supabase.storage.from("edd-evidence").upload(path, file);
    if (up.error) { setUploading(false); return toast({ title: "Upload failed", description: up.error.message, variant: "destructive" }); }
    const { error } = await supabase.from("suite_edd_evidence").insert({
      case_id: eddCase.id, organisation_id: orgId, uploaded_by: userId,
      file_path: path, file_name: file.name, file_size: file.size, mime_type: file.type,
      evidence_type: evType, description: evDesc || null,
    });
    setUploading(false);
    if (error) return toast({ title: "Metadata failed", description: error.message, variant: "destructive" });
    await writeAudit(eddCase.id, "evidence_uploaded", { file: file.name, type: evType });
    setEvDesc("");
    toast({ title: "Evidence uploaded" });
    refresh();
  };

  const downloadEvidence = async (ev: Evidence) => {
    const { data, error } = await supabase.storage.from("edd-evidence").createSignedUrl(ev.file_path, 60);
    if (error) return toast({ title: "Download failed", description: error.message, variant: "destructive" });
    window.open(data.signedUrl, "_blank");
  };

  const deleteEvidence = async (ev: Evidence) => {
    if (!confirm(`Delete "${ev.file_name}"?`)) return;
    await supabase.storage.from("edd-evidence").remove([ev.file_path]);
    await supabase.from("suite_edd_evidence").delete().eq("id", ev.id);
    await writeAudit(eddCase.id, "evidence_deleted", { file: ev.file_name });
    refresh();
  };

  const signOff = async () => {
    if (!decisionReason.trim()) return toast({ title: "Sign-off rationale is required", variant: "destructive" });
    setSigning(true);
    const status: Status = decision;
    const { error } = await supabase.from("suite_edd_cases").update({
      mlro_id: userId, mlro_decision: decision, mlro_reason: decisionReason.trim(),
      mlro_signed_at: new Date().toISOString(), status,
    }).eq("id", eddCase.id);
    setSigning(false);
    if (error) return toast({ title: "Sign-off failed", description: error.message, variant: "destructive" });
    await writeAudit(eddCase.id, "mlro_signoff", { decision, reason: decisionReason.trim() });
    toast({ title: `Case ${decision}` });
    setDecisionReason("");
    refresh();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span className="font-mono text-sm">{eddCase.case_reference}</span>
            <Badge variant="outline" className={statusTone(eddCase.status)}>{statusLabel(eddCase.status)}</Badge>
          </DialogTitle>
          <DialogDescription>
            {eddCase.customer?.company_name || eddCase.customer?.name || "No customer linked"} · Opened {new Date(eddCase.created_at).toLocaleDateString("en-GB")}
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-md border p-3 bg-muted/30 text-sm">
          <div className="font-medium mb-1">Trigger</div>
          <div className="text-muted-foreground">{eddCase.trigger_reason}</div>
          {eddCase.risk_factors?.length > 0 && (
            <div className="flex gap-1 flex-wrap mt-2">
              {eddCase.risk_factors.map(f => <Badge key={f} variant="secondary" className="text-xs">{f}</Badge>)}
            </div>
          )}
        </div>

        <div className="flex gap-2 border-b">
          {[
            { v: "questionnaire", l: "Questionnaire", icon: PenLine },
            { v: "evidence", l: `Evidence (${evidence.length})`, icon: Upload },
            { v: "signoff", l: "MLRO Sign-off", icon: ShieldAlert },
            { v: "audit", l: `Audit (${audit.length})`, icon: History },
          ].map(t => (
            <button key={t.v} onClick={() => setTab(t.v as any)}
              className={cn("px-3 py-2 text-sm border-b-2 transition-colors flex items-center gap-2",
                tab === t.v ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}>
              <t.icon className="h-4 w-4" />{t.l}
            </button>
          ))}
        </div>

        {tab === "questionnaire" && (
          <div className="space-y-4">
            {QUESTIONNAIRE.map(q => (
              <div key={q.id}>
                <Label className="text-sm">{q.label}</Label>
                <Textarea rows={2} disabled={!canEditQ} value={answers[q.id] || ""}
                  onChange={e => setAnswers({ ...answers, [q.id]: e.target.value })} />
              </div>
            ))}
            {canEditQ && (
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={saveQuestionnaire} disabled={saving}>
                  {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Save draft
                </Button>
                <Button onClick={submitForReview}>Submit to MLRO</Button>
              </div>
            )}
          </div>
        )}

        {tab === "evidence" && (
          <div className="space-y-4">
            {!locked && (
              <Card className="p-4 space-y-3 bg-muted/20">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Type</Label>
                    <Select value={evType} onValueChange={setEvType}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["SOF proof","SOW proof","Bank statement","Corporate structure","ID document","Contract","Adverse media report","Other"].map(t =>
                          <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Input value={evDesc} onChange={e => setEvDesc(e.target.value)} placeholder="Short note" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Input type="file" onChange={(e) => { const f = e.target.files?.[0]; if (f) { uploadEvidence(f); e.target.value = ""; } }} disabled={uploading} />
                  {uploading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isMLRO && eddCase.status === "draft" && (
                    <Button variant="outline" size="sm" onClick={requestEvidence}>Mark evidence pending</Button>
                  )}
                </div>
              </Card>
            )}
            {evidence.length === 0 ? (
              <div className="text-sm text-muted-foreground py-6 text-center">No evidence uploaded.</div>
            ) : (
              <div className="space-y-2">
                {evidence.map(ev => (
                  <div key={ev.id} className="flex items-center justify-between border rounded-md p-3">
                    <div className="flex items-start gap-3">
                      <FileText className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <div className="text-sm font-medium">{ev.file_name}</div>
                        <div className="text-xs text-muted-foreground">
                          {ev.evidence_type} · {ev.file_size ? `${Math.round(ev.file_size / 1024)} KB` : "—"} · {new Date(ev.created_at).toLocaleString("en-GB")}
                        </div>
                        {ev.description && <div className="text-xs mt-1">{ev.description}</div>}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => downloadEvidence(ev)}>Download</Button>
                      {!locked && (ev.uploaded_by === userId || isMLRO) && (
                        <Button size="sm" variant="ghost" onClick={() => deleteEvidence(ev)}><Trash2 className="h-4 w-4" /></Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "signoff" && (
          <div className="space-y-4">
            {eddCase.mlro_signed_at ? (
              <Card className="p-4 space-y-2">
                <div className="flex items-center gap-2">
                  {eddCase.mlro_decision === "approved" && <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
                  {eddCase.mlro_decision === "rejected" && <XCircle className="h-5 w-5 text-red-500" />}
                  {eddCase.mlro_decision === "escalated" && <ShieldAlert className="h-5 w-5 text-orange-500" />}
                  <span className="font-semibold capitalize">{eddCase.mlro_decision}</span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    Signed {new Date(eddCase.mlro_signed_at).toLocaleString("en-GB")}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground whitespace-pre-wrap">{eddCase.mlro_reason}</div>
                <div className="text-xs text-muted-foreground">MLRO: {eddCase.mlro_id}</div>
              </Card>
            ) : !isMLRO ? (
              <div className="text-sm text-muted-foreground p-4 border rounded-md">
                Only users with the <strong>MLRO</strong> or <strong>Admin</strong> role can sign off. Current status: {statusLabel(eddCase.status)}.
              </div>
            ) : eddCase.status !== "mlro_review" ? (
              <div className="text-sm text-muted-foreground p-4 border rounded-md">
                Case must be submitted for MLRO review before sign-off. Current status: {statusLabel(eddCase.status)}.
              </div>
            ) : (
              <Card className="p-4 space-y-3">
                <div>
                  <Label>Decision</Label>
                  <Select value={decision} onValueChange={(v: any) => setDecision(v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="approved">Approve — proceed with relationship</SelectItem>
                      <SelectItem value="rejected">Reject — offboard / decline</SelectItem>
                      <SelectItem value="escalated">Escalate — further review needed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Rationale *</Label>
                  <Textarea rows={4} value={decisionReason} onChange={e => setDecisionReason(e.target.value)}
                    placeholder="Document the reasoning behind this decision. This is recorded permanently in the audit trail." />
                </div>
                <div className="flex justify-end">
                  <Button onClick={signOff} disabled={signing}>
                    {signing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    <PenLine className="h-4 w-4 mr-2" />Sign off
                  </Button>
                </div>
              </Card>
            )}
          </div>
        )}

        {tab === "audit" && (
          <div className="space-y-2">
            {audit.length === 0 ? (
              <div className="text-sm text-muted-foreground py-6 text-center">No activity.</div>
            ) : audit.map(a => (
              <div key={a.id} className="flex items-start gap-3 border-l-2 border-primary/30 pl-3 py-2">
                <div className="flex-1">
                  <div className="text-sm font-medium">{a.action.replace(/_/g, " ")}</div>
                  {Object.keys(a.details || {}).length > 0 && (
                    <pre className="text-xs text-muted-foreground mt-1 whitespace-pre-wrap">{JSON.stringify(a.details, null, 2)}</pre>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleString("en-GB")}</div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
