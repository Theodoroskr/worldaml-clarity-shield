import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useOrganisation } from "@/hooks/useOrganisation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import {
  AlertTriangle, FileText, Plus, Sparkles, Trash2, Upload, CheckCircle2, XCircle, Clock, Loader2, CalendarClock, Info,
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { SofAuditTrail } from "@/components/suite/SofAuditTrail";
import { SofFlagDrillDown } from "@/components/suite/SofFlagDrillDown";
import { SofThresholdsDialog } from "@/components/suite/SofThresholdsDialog";
import { SofEvidenceChecklist } from "@/components/suite/SofEvidenceChecklist";
import { SofRulesEvaluated } from "@/components/suite/SofRulesEvaluated";

type Customer = {
  id: string; name: string; risk_level: string; type: string; country: string | null; pep_status: string | null;
};
type IncomeSource = { type: string; description: string; amount: number; percentage?: number };
type Declaration = {
  id: string;
  customer_id: string;
  declared_annual_income: number | null;
  declared_total_wealth: number | null;
  currency: string;
  source_country: string | null;
  income_sources: IncomeSource[];
  wealth_sources: IncomeSource[];
  status: string;
  reviewer_notes: string | null;
  ai_reconciliation: any;
  ai_risk_flag: boolean;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
};
type SofDoc = {
  id: string;
  declaration_id: string;
  document_type: string;
  file_name: string;
  file_path: string;
  verification_status: string;
  verifier_notes: string | null;
  created_at: string;
};

const INCOME_TYPES = ["salary", "business", "investments", "inheritance", "sale_of_asset", "gift", "savings", "pension", "other"];
const DOC_TYPES = ["payslip", "tax_return", "bank_statement", "sale_deed", "inheritance_cert", "dividend_statement", "business_financials", "other"];

const STATUS_BADGE: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  submitted: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  under_review: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  verified: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  partial: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  expired: "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
};

export default function SuiteSourceOfFunds() {
  const { orgId, userId, canEdit, canManage, isLoading: orgLoading } = useOrganisation();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [declarations, setDeclarations] = useState<Declaration[]>([]);
  const [docsByDecl, setDocsByDecl] = useState<Record<string, SofDoc[]>>({});
  const [selectedCustomer, setSelectedCustomer] = useState<string>("");
  const [openDecl, setOpenDecl] = useState<Declaration | null>(null);
  const [thresholdsOpen, setThresholdsOpen] = useState(false);
  const [newOpen, setNewOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [aiBusy, setAiBusy] = useState<string | null>(null);
  const [auditRefresh, setAuditRefresh] = useState(0);
  const [sweepBusy, setSweepBusy] = useState(false);
  const bumpAudit = () => setAuditRefresh(k => k + 1);

  const runExpirySweep = async () => {
    setSweepBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("sof-expire-declarations", {
        body: { trigger: "manual" },
      });
      if (error) throw error;
      const expired = data?.expired_count ?? 0;
      const notified = data?.notified_orgs ?? 0;
      toast({
        title: expired > 0 ? "Expiry sweep complete" : "Nothing to expire",
        description: expired > 0
          ? `${expired} declaration(s) marked expired. ${notified} organisation(s) notified.`
          : "No verified declarations are past their term.",
      });
      await loadAll();
    } catch (e: any) {
      toast({ title: "Sweep failed", description: e?.message ?? String(e), variant: "destructive" });
    } finally {
      setSweepBusy(false);
    }
  };

  // New declaration form state
  const [form, setForm] = useState({
    customer_id: "",
    declared_annual_income: "",
    declared_total_wealth: "",
    currency: "EUR",
    source_country: "",
    income_sources: [] as IncomeSource[],
    wealth_sources: [] as IncomeSource[],
  });

  const loadAll = async () => {
    if (!orgId) return;
    setLoading(true);
    const [{ data: c }, { data: d }] = await Promise.all([
      supabase.from("suite_customers").select("id,name,risk_level,type,country,pep_status")
        .eq("organisation_id", orgId).in("risk_level", ["high", "critical"]).order("name"),
      supabase.from("suite_sof_declarations").select("*")
        .eq("organisation_id", orgId).order("updated_at", { ascending: false }),
    ]);
    setCustomers((c || []) as Customer[]);
    setDeclarations((d || []) as unknown as Declaration[]);

    if (d?.length) {
      const { data: docs } = await supabase.from("suite_sof_documents")
        .select("*").in("declaration_id", d.map((x: any) => x.id));
      const grouped: Record<string, SofDoc[]> = {};
      (docs || []).forEach((doc: any) => {
        grouped[doc.declaration_id] ||= [];
        grouped[doc.declaration_id].push(doc as SofDoc);
      });
      setDocsByDecl(grouped);
    }
    setLoading(false);
  };

  useEffect(() => { loadAll(); /* eslint-disable-next-line */ }, [orgId]);

  const filteredDecls = useMemo(
    () => selectedCustomer ? declarations.filter(d => d.customer_id === selectedCustomer) : declarations,
    [declarations, selectedCustomer],
  );

  const customerName = (id: string) => customers.find(c => c.id === id)?.name || "Unknown";

  const addIncomeRow = (kind: "income" | "wealth") => {
    const empty: IncomeSource = { type: "salary", description: "", amount: 0 };
    setForm(f => kind === "income"
      ? { ...f, income_sources: [...f.income_sources, empty] }
      : { ...f, wealth_sources: [...f.wealth_sources, empty] });
  };

  const updateRow = (kind: "income" | "wealth", i: number, patch: Partial<IncomeSource>) => {
    setForm(f => {
      const arr = (kind === "income" ? f.income_sources : f.wealth_sources).map((r, idx) => idx === i ? { ...r, ...patch } : r);
      return kind === "income" ? { ...f, income_sources: arr } : { ...f, wealth_sources: arr };
    });
  };

  const removeRow = (kind: "income" | "wealth", i: number) => {
    setForm(f => {
      const arr = (kind === "income" ? f.income_sources : f.wealth_sources).filter((_, idx) => idx !== i);
      return kind === "income" ? { ...f, income_sources: arr } : { ...f, wealth_sources: arr };
    });
  };

  const createDeclaration = async () => {
    if (!form.customer_id) { toast({ title: "Select a customer", variant: "destructive" }); return; }
    if (!userId) return;
    const { error } = await supabase.from("suite_sof_declarations").insert({
      customer_id: form.customer_id,
      organisation_id: orgId,
      user_id: userId,
      declared_annual_income: form.declared_annual_income ? Number(form.declared_annual_income) : null,
      declared_total_wealth: form.declared_total_wealth ? Number(form.declared_total_wealth) : null,
      currency: form.currency,
      source_country: form.source_country || null,
      income_sources: form.income_sources,
      wealth_sources: form.wealth_sources,
      status: "draft",
    });
    if (error) { toast({ title: "Failed to create", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Declaration created" });
    setNewOpen(false);
    setForm({ customer_id: "", declared_annual_income: "", declared_total_wealth: "", currency: "EUR", source_country: "", income_sources: [], wealth_sources: [] });
    loadAll();
  };

  const updateStatus = async (id: string, status: string, reviewer_notes?: string) => {
    if (!userId) return;
    const patch: any = { status };
    if (reviewer_notes !== undefined) patch.reviewer_notes = reviewer_notes;
    if (["verified", "partial", "rejected", "under_review"].includes(status)) patch.reviewer_id = userId;
    const { error } = await supabase.from("suite_sof_declarations").update(patch).eq("id", id);
    if (error) { toast({ title: "Update failed", description: error.message, variant: "destructive" }); return; }
    toast({ title: `Status set to ${status}` });
    loadAll();
    bumpAudit();
    if (openDecl?.id === id) setOpenDecl({ ...openDecl, status, reviewer_notes: reviewer_notes ?? openDecl.reviewer_notes });
  };

  const runReconciliation = async (id: string) => {
    setAiBusy(id);
    const { data: { session } } = await supabase.auth.getSession();
    const { data, error } = await supabase.functions.invoke("sof-reconcile", {
      body: { declaration_id: id },
      headers: session ? { Authorization: `Bearer ${session.access_token}` } : undefined,
    });
    setAiBusy(null);
    if (error) { toast({ title: "Reconciliation failed", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Reconciliation complete", description: `${data?.reconciliation?.flags?.length || 0} flag(s)` });
    loadAll();
    bumpAudit();
  };

  const uploadDoc = async (declId: string, file: File, type: string) => {
    if (!userId) return;
    // Path must start with sof/<userId>/... to satisfy storage RLS policy.
    const path = `sof/${userId}/${declId}/${Date.now()}-${file.name}`;
    const { error: upErr } = await supabase.storage.from("customer-documents").upload(path, file);
    if (upErr) { toast({ title: "Upload failed", description: upErr.message, variant: "destructive" }); return; }
    const { error: insErr } = await supabase.from("suite_sof_documents").insert({
      declaration_id: declId, organisation_id: orgId, user_id: userId,
      document_type: type, file_name: file.name, file_path: path, file_size_bytes: file.size, mime_type: file.type,
    });
    if (insErr) { toast({ title: "Save failed", description: insErr.message, variant: "destructive" }); return; }
    toast({ title: "Document uploaded" });
    loadAll();
    bumpAudit();
  };

  const verifyDoc = async (id: string, status: string) => {
    if (!userId) return;
    const { error } = await supabase.from("suite_sof_documents").update({
      verification_status: status, verifier_id: userId, verified_at: new Date().toISOString(),
    }).eq("id", id);
    if (error) { toast({ title: "Update failed", variant: "destructive" }); return; }
    loadAll();
    bumpAudit();
  };

  if (orgLoading || loading) {
    return <div className="p-8 flex items-center gap-2 text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /> Loading…</div>;
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Source of Funds & Wealth</h1>
          <p className="text-sm text-muted-foreground mt-1">Enhanced Due Diligence declarations for high-risk customers</p>
        </div>
        {canEdit && (
          <div className="flex items-center gap-2">
            {canManage && (
              <Button variant="outline" onClick={runExpirySweep} disabled={sweepBusy}>
                {sweepBusy ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CalendarClock className="w-4 h-4 mr-2" />}
                Run expiry sweep
              </Button>
            )}
            <Button onClick={() => setNewOpen(true)}><Plus className="w-4 h-4 mr-2" /> New Declaration</Button>
          </div>
        )}
      </div>

      {/* How this module works */}
      <Card className="border-accent/30 bg-accent/5">
        <Accordion type="single" collapsible defaultValue="how-it-works">
          <AccordionItem value="how-it-works" className="border-0">
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Info className="w-4 h-4 text-accent" />
                How Source of Funds &amp; Wealth (EDD) works
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="grid md:grid-cols-2 gap-6 text-sm text-muted-foreground">
                <div className="space-y-3">
                  <div>
                    <div className="font-semibold text-foreground mb-1">1. Trigger — High-risk customers only</div>
                    <p>Only customers flagged as <span className="font-medium text-foreground">High</span> or <span className="font-medium text-foreground">Critical</span> risk (PEPs, sanctioned-jurisdiction nexus, large cash flows, adverse media) appear here. Standard-risk customers are handled by ordinary KYC.</p>
                  </div>
                  <div>
                    <div className="font-semibold text-foreground mb-1">2. Customer declares income &amp; wealth</div>
                    <p>Compliance officers create a declaration capturing <span className="font-medium text-foreground">annual income</span>, <span className="font-medium text-foreground">total wealth</span>, source country, and a breakdown by type (salary, business, investments, inheritance, sale of asset, gift, pension, etc.) with amounts and percentages.</p>
                  </div>
                  <div>
                    <div className="font-semibold text-foreground mb-1">3. Supporting evidence</div>
                    <p>Upload documents per source: payslips, tax returns, bank statements, sale deeds, inheritance certificates, dividend statements, business financials. Each document is verified individually (verified / partial / rejected).</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="font-semibold text-foreground mb-1">4. AI reconciliation</div>
                    <p>The <span className="font-medium text-foreground">AI Reconciliation</span> action cross-checks declared figures against transactional activity, screening hits, and document evidence. It flags inconsistencies (e.g. declared €50k income but €500k throughput) and raises an <span className="font-medium text-foreground">AI risk flag</span> for reviewer attention.</p>
                  </div>
                  <div>
                    <div className="font-semibold text-foreground mb-1">5. Reviewer decision</div>
                    <p>A compliance reviewer marks the declaration <span className="font-medium text-foreground">Verified</span>, <span className="font-medium text-foreground">Partial</span>, or <span className="font-medium text-foreground">Rejected</span>, with notes. All actions are written to the audit trail with user, timestamp, and IP.</p>
                  </div>
                  <div>
                    <div className="font-semibold text-foreground mb-1">6. Periodic re-verification</div>
                    <p>Declarations carry an <span className="font-medium text-foreground">expiry date</span> (typically 12 months for high-risk, 6 months for critical). The <span className="font-medium text-foreground">Run expiry sweep</span> action auto-marks lapsed declarations as <span className="font-medium text-foreground">Expired</span> and raises an alert for refresh.</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-border/40 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">Regulatory basis:</span> EU 6AMLD Art. 18a (EDD for high-risk relationships), FATF Recommendation 10 &amp; 12 (PEPs), MGA/UKGC EDD obligations for iGaming. Full audit trail is retained for 5 years.
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </Card>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">

        {[
          { label: "Total", value: declarations.length, color: "text-foreground" },
          { label: "Draft", value: declarations.filter(d => d.status === "draft").length, color: "text-muted-foreground" },
          { label: "Under Review", value: declarations.filter(d => d.status === "under_review" || d.status === "submitted").length, color: "text-amber-600" },
          { label: "Verified", value: declarations.filter(d => d.status === "verified").length, color: "text-emerald-600" },
          { label: "AI Flagged", value: declarations.filter(d => d.ai_risk_flag).length, color: "text-red-600" },
        ].map(s => (
          <Card key={s.label} className="p-4">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</div>
            <div className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</div>
          </Card>
        ))}
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <Label className="text-sm">Customer:</Label>
        <Select value={selectedCustomer || "all"} onValueChange={(v) => setSelectedCustomer(v === "all" ? "" : v)}>
          <SelectTrigger className="w-[280px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All high-risk customers</SelectItem>
            {customers.map(c => (
              <SelectItem key={c.id} value={c.id}>{c.name} ({c.risk_level})</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Declarations list */}
      {filteredDecls.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground">
          <FileText className="w-10 h-10 mx-auto mb-3 opacity-40" />
          No declarations yet. {canEdit && "Create one to start an EDD review."}
          {customers.length === 0 && <div className="mt-2 text-xs">No high-risk customers in this organisation.</div>}
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredDecls.map(d => {
            const docs = docsByDecl[d.id] || [];
            return (
              <Card key={d.id} className="p-4 hover:border-primary/40 transition-colors cursor-pointer" onClick={() => setOpenDecl(d)}>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-[260px]">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold">{customerName(d.customer_id)}</h3>
                      <Badge className={STATUS_BADGE[d.status]}>{d.status.replace("_", " ")}</Badge>
                      {d.ai_risk_flag && (
                        <Badge variant="destructive" className="gap-1"><AlertTriangle className="w-3 h-3" /> AI flag</Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Declared income: {d.declared_annual_income ? `${d.currency} ${Number(d.declared_annual_income).toLocaleString()}` : "—"} ·
                      Wealth: {d.declared_total_wealth ? `${d.currency} ${Number(d.declared_total_wealth).toLocaleString()}` : "—"} ·
                      {docs.length} doc{docs.length === 1 ? "" : "s"}
                      {d.expires_at && ` · expires ${new Date(d.expires_at).toLocaleDateString()}`}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {canEdit && (
                      <Button size="sm" variant="outline" disabled={aiBusy === d.id}
                        onClick={(e) => { e.stopPropagation(); runReconciliation(d.id); }}>
                        {aiBusy === d.id ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Sparkles className="w-3 h-3 mr-1" />}
                        Run AI check
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* New declaration dialog */}
      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>New Source of Funds Declaration</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Customer *</Label>
              <Select value={form.customer_id} onValueChange={(v) => setForm({ ...form, customer_id: v })}>
                <SelectTrigger><SelectValue placeholder="Choose high-risk customer" /></SelectTrigger>
                <SelectContent>
                  {customers.map(c => <SelectItem key={c.id} value={c.id}>{c.name} ({c.risk_level})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Annual Income</Label>
                <Input type="number" value={form.declared_annual_income} onChange={(e) => setForm({ ...form, declared_annual_income: e.target.value })} />
              </div>
              <div>
                <Label>Total Wealth</Label>
                <Input type="number" value={form.declared_total_wealth} onChange={(e) => setForm({ ...form, declared_total_wealth: e.target.value })} />
              </div>
              <div>
                <Label>Currency</Label>
                <Input value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value.toUpperCase().slice(0, 3) })} />
              </div>
            </div>
            <div>
              <Label>Source Country (ISO-2)</Label>
              <Input value={form.source_country} maxLength={2} onChange={(e) => setForm({ ...form, source_country: e.target.value.toUpperCase() })} placeholder="e.g. CY" />
            </div>

            {/* Income sources */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Income Sources</Label>
                <Button size="sm" variant="outline" onClick={() => addIncomeRow("income")}><Plus className="w-3 h-3 mr-1" /> Add</Button>
              </div>
              {form.income_sources.map((row, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 mb-2">
                  <Select value={row.type} onValueChange={(v) => updateRow("income", i, { type: v })}>
                    <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                    <SelectContent>{INCOME_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                  <Input className="col-span-5" placeholder="Description" value={row.description} onChange={(e) => updateRow("income", i, { description: e.target.value })} />
                  <Input className="col-span-3" type="number" placeholder="Amount" value={row.amount || ""} onChange={(e) => updateRow("income", i, { amount: Number(e.target.value) })} />
                  <Button size="icon" variant="ghost" className="col-span-1" onClick={() => removeRow("income", i)}><Trash2 className="w-3 h-3" /></Button>
                </div>
              ))}
            </div>

            {/* Wealth sources */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Wealth Sources</Label>
                <Button size="sm" variant="outline" onClick={() => addIncomeRow("wealth")}><Plus className="w-3 h-3 mr-1" /> Add</Button>
              </div>
              {form.wealth_sources.map((row, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 mb-2">
                  <Select value={row.type} onValueChange={(v) => updateRow("wealth", i, { type: v })}>
                    <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                    <SelectContent>{INCOME_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                  <Input className="col-span-5" placeholder="Description" value={row.description} onChange={(e) => updateRow("wealth", i, { description: e.target.value })} />
                  <Input className="col-span-3" type="number" placeholder="Amount" value={row.amount || ""} onChange={(e) => updateRow("wealth", i, { amount: Number(e.target.value) })} />
                  <Button size="icon" variant="ghost" className="col-span-1" onClick={() => removeRow("wealth", i)}><Trash2 className="w-3 h-3" /></Button>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewOpen(false)}>Cancel</Button>
            <Button onClick={createDeclaration}>Create Declaration</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail dialog */}
      <Dialog open={!!openDecl} onOpenChange={(o) => !o && setOpenDecl(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {openDecl && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {customerName(openDecl.customer_id)}
                  <Badge className={STATUS_BADGE[openDecl.status]}>{openDecl.status.replace("_", " ")}</Badge>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {/* Summary */}
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <Card className="p-3">
                    <div className="text-xs text-muted-foreground">Annual Income</div>
                    <div className="font-semibold">{openDecl.declared_annual_income ? `${openDecl.currency} ${Number(openDecl.declared_annual_income).toLocaleString()}` : "—"}</div>
                  </Card>
                  <Card className="p-3">
                    <div className="text-xs text-muted-foreground">Total Wealth</div>
                    <div className="font-semibold">{openDecl.declared_total_wealth ? `${openDecl.currency} ${Number(openDecl.declared_total_wealth).toLocaleString()}` : "—"}</div>
                  </Card>
                  <Card className="p-3">
                    <div className="text-xs text-muted-foreground">Source Country</div>
                    <div className="font-semibold">{openDecl.source_country || "—"}</div>
                  </Card>
                </div>

                {/* Income & wealth breakdown */}
                {openDecl.income_sources?.length > 0 && (
                  <div>
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground">Income Sources</Label>
                    <div className="mt-1 space-y-1">
                      {openDecl.income_sources.map((s, i) => (
                        <div key={i} className="flex justify-between text-sm border-b py-1">
                          <span><Badge variant="outline" className="mr-2">{s.type}</Badge>{s.description}</span>
                          <span className="font-mono">{openDecl.currency} {Number(s.amount).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {openDecl.wealth_sources?.length > 0 && (
                  <div>
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground">Wealth Sources</Label>
                    <div className="mt-1 space-y-1">
                      {openDecl.wealth_sources.map((s, i) => (
                        <div key={i} className="flex justify-between text-sm border-b py-1">
                          <span><Badge variant="outline" className="mr-2">{s.type}</Badge>{s.description}</span>
                          <span className="font-mono">{openDecl.currency} {Number(s.amount).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Reconciliation — drill-down */}
                <SofFlagDrillDown
                  reconciliation={openDecl.ai_reconciliation}
                  customerId={openDecl.customer_id}
                  currency={openDecl.currency}
                  onRerun={() => runReconciliation(openDecl.id)}
                  busy={aiBusy === openDecl.id}
                  canRerun={canEdit}
                  canEditThresholds={canManage}
                  onEditThresholds={() => setThresholdsOpen(true)}
                />

                {/* Step-by-step evidence checklist */}
                <SofEvidenceChecklist
                  incomeSources={openDecl.income_sources || []}
                  wealthSources={openDecl.wealth_sources || []}
                  documents={(docsByDecl[openDecl.id] || []).map(d => ({
                    id: d.id,
                    document_type: d.document_type,
                    file_name: d.file_name,
                    verification_status: d.verification_status,
                  }))}
                  currency={openDecl.currency}
                  canEdit={canEdit}
                  onUpload={(docType) => {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.onchange = (e: any) => {
                      const f = e.target.files?.[0];
                      if (f) uploadDoc(openDecl.id, f, docType);
                    };
                    input.click();
                  }}
                />

                {/* Documents */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground">Supporting Documents</Label>
                    {canEdit && (
                      <div className="flex items-center gap-2">
                        <Select onValueChange={(type) => {
                          const input = document.createElement("input");
                          input.type = "file";
                          input.onchange = (e: any) => { const f = e.target.files?.[0]; if (f) uploadDoc(openDecl.id, f, type); };
                          input.click();
                        }}>
                          <SelectTrigger className="w-[200px] h-8"><Upload className="w-3 h-3 mr-1" /><SelectValue placeholder="Upload doc…" /></SelectTrigger>
                          <SelectContent>{DOC_TYPES.map(t => <SelectItem key={t} value={t}>{t.replace("_", " ")}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    {(docsByDecl[openDecl.id] || []).length === 0 ? (
                      <p className="text-xs text-muted-foreground">No documents uploaded.</p>
                    ) : (
                      (docsByDecl[openDecl.id] || []).map(doc => (
                        <div key={doc.id} className="flex items-center justify-between gap-2 text-sm border rounded px-3 py-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <FileText className="w-4 h-4 shrink-0 text-muted-foreground" />
                            <span className="truncate">{doc.file_name}</span>
                            <Badge variant="outline" className="text-[10px]">{doc.document_type}</Badge>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {doc.verification_status === "verified" && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                            {doc.verification_status === "rejected" && <XCircle className="w-4 h-4 text-red-600" />}
                            {doc.verification_status === "pending" && <Clock className="w-4 h-4 text-amber-600" />}
                            {canManage && doc.verification_status === "pending" && (
                              <>
                                <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => verifyDoc(doc.id, "verified")}>Verify</Button>
                                <Button size="sm" variant="ghost" className="h-7 px-2 text-red-600" onClick={() => verifyDoc(doc.id, "rejected")}>Reject</Button>
                              </>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Reviewer notes */}
                {canEdit && (
                  <div>
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground">Reviewer Notes</Label>
                    <Textarea value={openDecl.reviewer_notes || ""}
                      onChange={(e) => setOpenDecl({ ...openDecl, reviewer_notes: e.target.value })}
                      onBlur={() => updateStatus(openDecl.id, openDecl.status, openDecl.reviewer_notes || "")}
                      rows={3} placeholder="Add notes for audit trail…" />
                  </div>
                )}

                {/* Audit trail */}
                <div className="pt-2 border-t">
                  <SofAuditTrail declarationId={openDecl.id} refreshKey={auditRefresh} />
                </div>
              </div>

              <DialogFooter className="flex-wrap gap-2">
                {canEdit && openDecl.status === "draft" && (
                  <Button variant="outline" onClick={() => updateStatus(openDecl.id, "submitted")}>Submit for Review</Button>
                )}
                {canManage && ["submitted", "under_review", "partial"].includes(openDecl.status) && (
                  <>
                    <Button variant="outline" onClick={() => updateStatus(openDecl.id, "under_review")}>Mark Under Review</Button>
                    <Button variant="destructive" onClick={() => updateStatus(openDecl.id, "rejected")}>Reject</Button>
                    <Button onClick={() => updateStatus(openDecl.id, "verified")} className="bg-emerald-600 hover:bg-emerald-700">Verify</Button>
                  </>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <SofThresholdsDialog
        open={thresholdsOpen}
        onOpenChange={setThresholdsOpen}
        organisationId={orgId}
        userId={userId}
      />
    </div>
  );
}
