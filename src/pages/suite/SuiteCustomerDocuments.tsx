import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useOrganisation } from "@/hooks/useOrganisation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import {
  FileText, Upload, AlertTriangle, RefreshCcw, Download, Trash2, Send, CalendarClock, ShieldCheck,
  UserPlus, CheckCircle2, XCircle, Copy,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Doc {
  id: string;
  customer_id: string;
  organisation_id: string;
  document_type: string;
  document_label: string | null;
  file_path: string;
  file_name: string;
  mime_type: string | null;
  size_bytes: number | null;
  issued_on: string | null;
  expires_on: string | null;
  status: string;
  notes: string | null;
  rerequested_at: string | null;
  rerequest_reason: string | null;
  rerequest_due: string | null;
  rerequest_message: string | null;
  replaced_by_document_id: string | null;
  created_at: string;
}

interface Customer {
  id: string;
  name: string;
  company_name: string | null;
  email: string | null;
  organisation_id: string;
  user_id: string;
}

const DOC_TYPES = [
  { v: "passport", label: "Passport" },
  { v: "national_id", label: "National ID" },
  { v: "drivers_license", label: "Driver's Licence" },
  { v: "proof_of_address", label: "Proof of Address" },
  { v: "utility_bill", label: "Utility Bill" },
  { v: "bank_statement", label: "Bank Statement" },
  { v: "incorporation", label: "Certificate of Incorporation" },
  { v: "shareholder_register", label: "Shareholder Register" },
  { v: "board_resolution", label: "Board Resolution" },
  { v: "tax_certificate", label: "Tax Certificate" },
  { v: "licence", label: "Regulatory Licence" },
  { v: "other", label: "Other" },
];

const statusBadge = (s: string) => {
  switch (s) {
    case "valid":          return "bg-emerald-500/15 text-emerald-500 border-emerald-500/30";
    case "expiring_soon":  return "bg-amber-500/15 text-amber-500 border-amber-500/30";
    case "expired":        return "bg-red-500/15 text-red-500 border-red-500/30";
    case "rerequested":    return "bg-blue-500/15 text-blue-500 border-blue-500/30";
    case "pending_review": return "bg-purple-500/15 text-purple-400 border-purple-500/30";
    case "replaced":       return "bg-slate-500/15 text-slate-400 border-slate-500/30";
    case "archived":       return "bg-slate-500/15 text-slate-400 border-slate-500/30";
    default:               return "bg-muted text-muted-foreground";
  }
};

const statusLabel = (s: string) => s === "pending_review" ? "awaiting review" : s.replace("_", " ");


const daysUntil = (d?: string | null) => {
  if (!d) return null;
  const ms = new Date(d).getTime() - Date.now();
  return Math.ceil(ms / 86400000);
};

export default function SuiteCustomerDocuments() {
  const { customerId } = useParams<{ customerId: string }>();
  const navigate = useNavigate();
  const { orgId } = useOrganisation();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(customerId ?? null);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [rerequestDoc, setRerequestDoc] = useState<Doc | null>(null);

  const selectedCustomer = useMemo(
    () => customers.find((c) => c.id === selectedId) ?? null,
    [customers, selectedId]
  );

  const loadCustomers = useCallback(async () => {
    const { data } = await supabase
      .from("suite_customers")
      .select("id, name, company_name, email, organisation_id, user_id")
      .order("name")
      .limit(500);
    setCustomers((data as Customer[]) ?? []);
  }, []);

  const loadDocs = useCallback(async (cid: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("suite_customer_documents")
      .select("*")
      .eq("customer_id", cid)
      .order("created_at", { ascending: false });
    if (error) toast({ title: "Failed to load documents", description: error.message, variant: "destructive" });
    setDocs((data as Doc[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { loadCustomers(); }, [loadCustomers]);
  useEffect(() => {
    if (selectedId) loadDocs(selectedId);
    else setDocs([]);
  }, [selectedId, loadDocs]);

  // Trigger the expiry sweep on mount so status/alerts are fresh
  useEffect(() => {
    supabase.rpc("sweep_customer_document_expiry" as never).then(() => {
      if (selectedId) loadDocs(selectedId);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const kpis = useMemo(() => {
    const total = docs.length;
    const expired = docs.filter((d) => d.status === "expired").length;
    const expiring = docs.filter((d) => d.status === "expiring_soon").length;
    const rerequested = docs.filter((d) => d.status === "rerequested").length;
    return { total, expired, expiring, rerequested };
  }, [docs]);

  async function handleDownload(d: Doc) {
    const { data, error } = await supabase.storage
      .from("customer-documents")
      .createSignedUrl(d.file_path, 60);
    if (error || !data?.signedUrl) {
      toast({ title: "Download failed", description: error?.message ?? "No URL", variant: "destructive" });
      return;
    }
    window.open(data.signedUrl, "_blank");
  }

  async function handleDelete(d: Doc) {
    if (!confirm(`Delete "${d.file_name}"? This cannot be undone.`)) return;
    await supabase.storage.from("customer-documents").remove([d.file_path]);
    const { error } = await supabase.from("suite_customer_documents").delete().eq("id", d.id);
    if (error) return toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    toast({ title: "Document deleted" });
    if (selectedId) loadDocs(selectedId);
  }

  async function handleRefresh() {
    await supabase.rpc("sweep_customer_document_expiry" as never);
    if (selectedId) loadDocs(selectedId);
    toast({ title: "Expiry status refreshed" });
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="w-6 h-6 text-accent" />
            Customer Documents
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track expiry dates, get automatic alerts, and re-request documents that approach expiration.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCcw className="w-4 h-4 mr-2" /> Refresh expiry
          </Button>
          <Button size="sm" onClick={() => setUploadOpen(true)} disabled={!selectedCustomer}>
            <Upload className="w-4 h-4 mr-2" /> Upload document
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Kpi label="Documents on file" value={kpis.total} icon={<FileText className="w-4 h-4" />} />
        <Kpi label="Expiring ≤ 30 days" value={kpis.expiring} tone="amber" icon={<CalendarClock className="w-4 h-4" />} />
        <Kpi label="Expired" value={kpis.expired} tone="red" icon={<AlertTriangle className="w-4 h-4" />} />
        <Kpi label="Re-request pending" value={kpis.rerequested} tone="blue" icon={<Send className="w-4 h-4" />} />
      </div>

      {/* Customer picker */}
      <Card className="p-4">
        <Label className="text-xs text-muted-foreground">Customer</Label>
        <Select value={selectedId ?? ""} onValueChange={(v) => { setSelectedId(v); navigate(`/suite/customer-documents/${v}`, { replace: true }); }}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select a customer…" />
          </SelectTrigger>
          <SelectContent>
            {customers.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name} {c.company_name ? `— ${c.company_name}` : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Card>

      {/* Docs list */}
      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="p-6 text-sm text-muted-foreground">Loading…</div>
        ) : !selectedCustomer ? (
          <div className="p-6 text-sm text-muted-foreground">Select a customer to view their documents.</div>
        ) : docs.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">
            No documents on file for {selectedCustomer.name}. Upload the first one to start tracking expiry.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/30 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="text-left p-3">Document</th>
                  <th className="text-left p-3">Type</th>
                  <th className="text-left p-3">Issued</th>
                  <th className="text-left p-3">Expires</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-right p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {docs.map((d) => {
                  const dLeft = daysUntil(d.expires_on);
                  return (
                    <tr key={d.id} className="border-t border-border/50 hover:bg-muted/20">
                      <td className="p-3">
                        <div className="font-medium">{d.document_label || d.file_name}</div>
                        <div className="text-xs text-muted-foreground">{d.file_name}</div>
                      </td>
                      <td className="p-3 text-xs">{DOC_TYPES.find((t) => t.v === d.document_type)?.label ?? d.document_type}</td>
                      <td className="p-3 text-xs">{d.issued_on ?? "—"}</td>
                      <td className="p-3 text-xs">
                        {d.expires_on ?? "—"}
                        {dLeft !== null && d.status !== "replaced" && d.status !== "archived" && (
                          <div className={cn("text-[11px] mt-0.5",
                            dLeft < 0 ? "text-red-500" : dLeft <= 30 ? "text-amber-500" : "text-muted-foreground"
                          )}>
                            {dLeft < 0 ? `${Math.abs(dLeft)}d overdue` : `in ${dLeft}d`}
                          </div>
                        )}
                      </td>
                      <td className="p-3">
                        <Badge variant="outline" className={cn("border", statusBadge(d.status))}>
                          {statusLabel(d.status)}
                        </Badge>
                        {d.status === "rerequested" && d.rerequest_due && (
                          <div className="text-[11px] text-muted-foreground mt-1">
                            due {d.rerequest_due}
                          </div>
                        )}
                        {d.status === "pending_review" && (
                          <div className="text-[11px] text-purple-400 mt-1">via portal</div>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="flex gap-1 justify-end">
                          <Button size="icon" variant="ghost" onClick={() => handleDownload(d)} title="Download">
                            <Download className="w-4 h-4" />
                          </Button>
                          {d.status === "pending_review" && (
                            <>
                              <Button size="icon" variant="ghost" title="Accept replacement" onClick={async () => {
                                const { error } = await supabase.rpc("portal_accept_document" as never, { _new_doc_id: d.id } as never);
                                if (error) return toast({ title: "Accept failed", description: error.message, variant: "destructive" });
                                toast({ title: "Replacement accepted" });
                                if (selectedId) loadDocs(selectedId);
                              }}>
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                              </Button>
                              <Button size="icon" variant="ghost" title="Reject" onClick={async () => {
                                const reason = prompt("Reason for rejection?") ?? "";
                                if (!reason) return;
                                const { error } = await supabase.rpc("portal_reject_document" as never, { _new_doc_id: d.id, _reason: reason } as never);
                                if (error) return toast({ title: "Reject failed", description: error.message, variant: "destructive" });
                                toast({ title: "Replacement rejected" });
                                if (selectedId) loadDocs(selectedId);
                              }}>
                                <XCircle className="w-4 h-4 text-red-500" />
                              </Button>
                            </>
                          )}
                          {["expired", "expiring_soon", "valid"].includes(d.status) && (
                            <Button size="icon" variant="ghost" onClick={() => setRerequestDoc(d)} title="Re-request">
                              <Send className="w-4 h-4" />
                            </Button>
                          )}
                          <Button size="icon" variant="ghost" onClick={() => handleDelete(d)} title="Delete">
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Upload dialog */}
      {selectedCustomer && (
        <UploadDialog
          open={uploadOpen}
          onClose={() => setUploadOpen(false)}
          customer={selectedCustomer}
          orgId={orgId ?? selectedCustomer.organisation_id}
          onUploaded={() => loadDocs(selectedCustomer.id)}
        />
      )}

      {/* Re-request dialog */}
      {rerequestDoc && selectedCustomer && (
        <RerequestDialog
          doc={rerequestDoc}
          customer={selectedCustomer}
          onClose={() => setRerequestDoc(null)}
          onDone={() => { setRerequestDoc(null); loadDocs(selectedCustomer.id); }}
        />
      )}
    </div>
  );
}

function Kpi({ label, value, tone, icon }: { label: string; value: number; tone?: "amber" | "red" | "blue"; icon: React.ReactNode }) {
  const cls = tone === "red" ? "text-red-500" : tone === "amber" ? "text-amber-500" : tone === "blue" ? "text-blue-500" : "text-foreground";
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-muted-foreground">{icon}</div>
      </div>
      <div className={cn("text-2xl font-bold mt-1", cls)}>{value}</div>
    </Card>
  );
}

function UploadDialog({
  open, onClose, customer, orgId, onUploaded,
}: {
  open: boolean; onClose: () => void; customer: Customer; orgId: string; onUploaded: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [type, setType] = useState("passport");
  const [label, setLabel] = useState("");
  const [issuedOn, setIssuedOn] = useState("");
  const [expiresOn, setExpiresOn] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit() {
    if (!file) return toast({ title: "Please select a file", variant: "destructive" });
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const ext = file.name.split(".").pop() ?? "bin";
      const path = `customers/${orgId}/${customer.id}/${Date.now()}-${Math.random().toString(16).slice(2, 10)}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from("customer-documents")
        .upload(path, file, { contentType: file.type, upsert: false });
      if (upErr) throw upErr;

      const status = expiresOn
        ? (new Date(expiresOn) < new Date() ? "expired"
          : (new Date(expiresOn).getTime() - Date.now() < 30 * 86400000 ? "expiring_soon" : "valid"))
        : "valid";

      const { error: insErr } = await supabase.from("suite_customer_documents").insert({
        customer_id: customer.id,
        organisation_id: orgId,
        user_id: customer.user_id,
        uploaded_by: user.id,
        document_type: type,
        document_label: label || null,
        file_path: path,
        file_name: file.name,
        mime_type: file.type,
        size_bytes: file.size,
        issued_on: issuedOn || null,
        expires_on: expiresOn || null,
        status,
        notes: notes || null,
      });
      if (insErr) throw insErr;

      toast({ title: "Document uploaded" });
      onUploaded();
      onClose();
      setFile(null); setLabel(""); setIssuedOn(""); setExpiresOn(""); setNotes("");
    } catch (e: any) {
      toast({ title: "Upload failed", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload document</DialogTitle>
          <DialogDescription>For {customer.name}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>File</Label>
            <Input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Document type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DOC_TYPES.map((t) => <SelectItem key={t.v} value={t.v}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Label (optional)</Label>
              <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Passport 2024" />
            </div>
            <div>
              <Label>Issued on</Label>
              <Input type="date" value={issuedOn} onChange={(e) => setIssuedOn(e.target.value)} />
            </div>
            <div>
              <Label>Expires on</Label>
              <Input type="date" value={expiresOn} onChange={(e) => setExpiresOn(e.target.value)} />
            </div>
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} disabled={saving}>
            <ShieldCheck className="w-4 h-4 mr-2" />
            {saving ? "Uploading…" : "Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RerequestDialog({
  doc, customer, onClose, onDone,
}: {
  doc: Doc; customer: Customer; onClose: () => void; onDone: () => void;
}) {
  const [reason, setReason] = useState(doc.status === "expired" ? "Document expired" : "Document is approaching expiry");
  const [due, setDue] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() + 14);
    return d.toISOString().slice(0, 10);
  });
  const [message, setMessage] = useState(
    `Hi ${customer.name.split(" ")[0]},\n\nPlease upload an updated ${doc.document_label || doc.document_type}. The version on file expires${doc.expires_on ? ` on ${doc.expires_on}` : " soon"}.\n\nThanks,\nCompliance Team`
  );
  const [saving, setSaving] = useState(false);

  async function submit() {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("suite_customer_documents").update({
      status: "rerequested",
      rerequested_at: new Date().toISOString(),
      rerequested_by: user?.id ?? null,
      rerequest_reason: reason,
      rerequest_due: due || null,
      rerequest_message: message,
    }).eq("id", doc.id);

    if (error) {
      toast({ title: "Failed to re-request", description: error.message, variant: "destructive" });
      setSaving(false);
      return;
    }

    // Create an in-app alert so the reviewer can track it
    await supabase.from("suite_alerts").insert({
      user_id: customer.user_id,
      organisation_id: customer.organisation_id,
      customer_id: customer.id,
      alert_type: "document",
      severity: "medium",
      title: "Document re-request sent",
      description: `Re-requested ${doc.document_label || doc.document_type} from ${customer.name}. Due ${due}.`,
      status: "open",
      metadata: { document_id: doc.id, due, reason, kind: "document_rerequest" },
    });

    toast({
      title: "Re-request logged",
      description: customer.email
        ? `Send the message to ${customer.email}.`
        : "Add an email to the customer to auto-send.",
    });
    setSaving(false);
    onDone();
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Re-request document</DialogTitle>
          <DialogDescription>{doc.document_label || doc.document_type} from {customer.name}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Reason</Label>
            <Input value={reason} onChange={(e) => setReason(e.target.value)} />
          </div>
          <div>
            <Label>Response due by</Label>
            <Input type="date" value={due} onChange={(e) => setDue(e.target.value)} />
          </div>
          <div>
            <Label>Message to customer</Label>
            <Textarea rows={6} value={message} onChange={(e) => setMessage(e.target.value)} />
            <p className="text-xs text-muted-foreground mt-1">
              Copy this into your outbound email — or connect an outreach workflow to send automatically.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} disabled={saving}>
            <Send className="w-4 h-4 mr-2" />
            {saving ? "Saving…" : "Mark as re-requested"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
