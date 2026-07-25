import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useOrganisation } from "@/hooks/useOrganisation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Inbox, Search, CheckCircle2, XCircle, Clock, FileText, User, Mail, Calendar, Download } from "lucide-react";
import { format } from "date-fns";

type Submission = {
  id: string;
  form_id: string;
  organisation_id: string;
  applicant_name: string | null;
  applicant_email: string | null;
  applicant_type: string;
  data: Record<string, any>;
  documents: any[];
  status: "pending" | "in_review" | "approved" | "rejected";
  reviewer_notes: string | null;
  reviewed_at: string | null;
  linked_customer_id: string | null;
  submitted_at: string;
};

type FormMeta = { id: string; name: string; slug: string; schema: any[] };

const STATUS_STYLES: Record<string, { badge: string; icon: any; label: string }> = {
  pending:   { badge: "bg-amber-500/15 text-amber-600 border-amber-500/30", icon: Clock,       label: "Pending" },
  in_review: { badge: "bg-blue-500/15 text-blue-600 border-blue-500/30",   icon: FileText,    label: "In Review" },
  approved:  { badge: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30", icon: CheckCircle2, label: "Approved" },
  rejected:  { badge: "bg-red-500/15 text-red-600 border-red-500/30",       icon: XCircle,     label: "Rejected" },
};

export default function SuiteOnboardingSubmissions() {
  const { orgId, canEdit, isLoading: orgLoading } = useOrganisation();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [forms, setForms] = useState<Record<string, FormMeta>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [formFilter, setFormFilter] = useState<string>("all");
  const [selected, setSelected] = useState<Submission | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (!orgId) return;
    setLoading(true);
    const [subsRes, formsRes] = await Promise.all([
      supabase
        .from("suite_onboarding_submissions")
        .select("*")
        .eq("organisation_id", orgId)
        .order("submitted_at", { ascending: false }),
      supabase
        .from("suite_onboarding_forms")
        .select("id,name,slug,schema")
        .eq("organisation_id", orgId),
    ]);
    if (subsRes.error) toast({ title: "Failed to load submissions", description: subsRes.error.message, variant: "destructive" });
    setSubmissions((subsRes.data as any) || []);
    const map: Record<string, FormMeta> = {};
    (formsRes.data || []).forEach((f: any) => { map[f.id] = f; });
    setForms(map);
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [orgId]);

  const filtered = useMemo(() => submissions.filter(s => {
    if (statusFilter !== "all" && s.status !== statusFilter) return false;
    if (formFilter !== "all" && s.form_id !== formFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const hay = `${s.applicant_name || ""} ${s.applicant_email || ""} ${JSON.stringify(s.data)}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  }), [submissions, search, statusFilter, formFilter]);

  const counts = useMemo(() => ({
    pending: submissions.filter(s => s.status === "pending").length,
    in_review: submissions.filter(s => s.status === "in_review").length,
    approved: submissions.filter(s => s.status === "approved").length,
    rejected: submissions.filter(s => s.status === "rejected").length,
  }), [submissions]);

  const openSubmission = (s: Submission) => {
    setSelected(s);
    setReviewNotes(s.reviewer_notes || "");
  };

  const updateStatus = async (status: "in_review" | "approved" | "rejected") => {
    if (!selected) return;
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    const patch: any = {
      status,
      reviewer_notes: reviewNotes || null,
      reviewed_by: user?.id,
      reviewed_at: new Date().toISOString(),
    };

    // On approve, create a suite_customers record if not linked yet
    let linkedId = selected.linked_customer_id;
    if (status === "approved" && !linkedId && user && orgId) {
      const { data: cust, error: custErr } = await supabase
        .from("suite_customers")
        .insert({
          user_id: user.id,
          organisation_id: orgId,
          name: selected.applicant_name || selected.applicant_email || "Onboarded customer",
          email: selected.applicant_email,
          type: selected.applicant_type || "individual",
          kyc_status: "verified",
          onboarding_data: selected.data,
        } as any)
        .select("id")
        .single();
      if (custErr) {
        toast({ title: "Approved but could not create customer", description: custErr.message, variant: "destructive" });
      } else if (cust) {
        linkedId = cust.id;
        patch.linked_customer_id = cust.id;
      }
    }

    const { error } = await supabase
      .from("suite_onboarding_submissions")
      .update(patch)
      .eq("id", selected.id);

    setSaving(false);
    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: `Submission ${status.replace("_", " ")}` });
    setSelected(null);
    load();
  };

  if (orgLoading) return <div className="p-8 text-sm text-muted-foreground">Loading…</div>;
  if (!orgId) return <div className="p-8 text-sm text-muted-foreground">No organisation.</div>;

  const selForm = selected ? forms[selected.form_id] : null;
  const selSchema: any[] = Array.isArray(selForm?.schema) ? (selForm!.schema as any[]) : [];

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Inbox className="w-6 h-6 text-primary" /> Onboarding Submissions
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Review client-submitted onboarding forms and approve or reject them.</p>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {(["pending","in_review","approved","rejected"] as const).map(k => {
          const S = STATUS_STYLES[k];
          const Icon = S.icon;
          return (
            <button key={k} onClick={() => setStatusFilter(k)}
              className={`text-left p-4 rounded-xl border bg-card hover:border-primary/50 transition ${statusFilter === k ? "border-primary" : "border-border"}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{S.label}</span>
                <Icon className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold mt-1">{counts[k]}</div>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, email, field values…" className="pl-9 h-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40 h-9"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_review">In review</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <Select value={formFilter} onValueChange={setFormFilter}>
          <SelectTrigger className="w-52 h-9"><SelectValue placeholder="All forms" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All forms</SelectItem>
            {Object.values(forms).map(f => (
              <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="border border-border rounded-xl overflow-hidden bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs text-muted-foreground uppercase">
            <tr>
              <th className="text-left p-3">Applicant</th>
              <th className="text-left p-3">Form</th>
              <th className="text-left p-3">Type</th>
              <th className="text-left p-3">Submitted</th>
              <th className="text-left p-3">Documents</th>
              <th className="text-left p-3">Status</th>
              <th className="text-right p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">Loading…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">
                No submissions yet. Share a live onboarding form with your clients to start collecting responses.
              </td></tr>
            ) : filtered.map(s => {
              const S = STATUS_STYLES[s.status] || STATUS_STYLES.pending;
              return (
                <tr key={s.id} className="border-t border-border hover:bg-muted/30 cursor-pointer" onClick={() => openSubmission(s)}>
                  <td className="p-3">
                    <div className="font-medium">{s.applicant_name || "—"}</div>
                    <div className="text-xs text-muted-foreground">{s.applicant_email || ""}</div>
                  </td>
                  <td className="p-3">{forms[s.form_id]?.name || <span className="text-muted-foreground">Deleted form</span>}</td>
                  <td className="p-3 capitalize">{s.applicant_type}</td>
                  <td className="p-3 text-muted-foreground">{format(new Date(s.submitted_at), "MMM d, yyyy HH:mm")}</td>
                  <td className="p-3">{Array.isArray(s.documents) ? s.documents.length : 0}</td>
                  <td className="p-3">
                    <Badge variant="outline" className={S.badge}>{S.label}</Badge>
                  </td>
                  <td className="p-3 text-right">
                    <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); openSubmission(s); }}>Review</Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Detail dialog */}
      <Dialog open={!!selected} onOpenChange={(o) => { if (!o) setSelected(null); }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Submission review</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 rounded-lg bg-muted/40">
                  <div className="text-xs text-muted-foreground flex items-center gap-1"><User className="w-3 h-3" /> Applicant</div>
                  <div className="font-medium mt-1">{selected.applicant_name || "—"}</div>
                </div>
                <div className="p-3 rounded-lg bg-muted/40">
                  <div className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="w-3 h-3" /> Email</div>
                  <div className="font-medium mt-1">{selected.applicant_email || "—"}</div>
                </div>
                <div className="p-3 rounded-lg bg-muted/40">
                  <div className="text-xs text-muted-foreground flex items-center gap-1"><FileText className="w-3 h-3" /> Form</div>
                  <div className="font-medium mt-1">{selForm?.name || "Deleted form"}</div>
                </div>
                <div className="p-3 rounded-lg bg-muted/40">
                  <div className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="w-3 h-3" /> Submitted</div>
                  <div className="font-medium mt-1">{format(new Date(selected.submitted_at), "MMM d, yyyy HH:mm")}</div>
                </div>
              </div>

              {/* Field-level data */}
              <div>
                <h3 className="text-sm font-semibold mb-2">Submitted fields</h3>
                <div className="border border-border rounded-lg divide-y divide-border">
                  {Object.keys(selected.data || {}).length === 0 && (
                    <div className="p-4 text-sm text-muted-foreground">No field data captured.</div>
                  )}
                  {Object.entries(selected.data || {}).map(([key, val]) => {
                    const field = selSchema.find((f: any) => f.key === key || f.id === key);
                    const label = field?.label || key;
                    return (
                      <div key={key} className="p-3 flex items-start gap-4">
                        <div className="w-1/3 text-xs text-muted-foreground uppercase tracking-wide">{label}</div>
                        <div className="flex-1 text-sm break-words whitespace-pre-wrap">
                          {typeof val === "object" ? JSON.stringify(val, null, 2) : String(val ?? "—")}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Documents */}
              {Array.isArray(selected.documents) && selected.documents.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-2">Uploaded documents</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selected.documents.map((d: any, i: number) => (
                      <a key={i} href={d.url || d.path || "#"} target="_blank" rel="noreferrer"
                        className="flex items-center justify-between p-3 border border-border rounded-lg text-sm hover:border-primary/50">
                        <span className="truncate">{d.name || d.file_name || `Document ${i + 1}`}</span>
                        <Download className="w-4 h-4 text-muted-foreground" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Review notes */}
              <div>
                <h3 className="text-sm font-semibold mb-2">Reviewer notes</h3>
                <Textarea value={reviewNotes} onChange={e => setReviewNotes(e.target.value)} rows={3}
                  placeholder="Add rationale for approval / rejection…" disabled={!canEdit} />
              </div>

              {selected.linked_customer_id && (
                <div className="text-xs text-muted-foreground">
                  Linked customer: <span className="font-mono">{selected.linked_customer_id}</span>
                </div>
              )}
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setSelected(null)}>Close</Button>
            {selected && canEdit && selected.status !== "in_review" && selected.status === "pending" && (
              <Button variant="secondary" onClick={() => updateStatus("in_review")} disabled={saving}>
                Mark in review
              </Button>
            )}
            {selected && canEdit && selected.status !== "rejected" && (
              <Button variant="destructive" onClick={() => updateStatus("rejected")} disabled={saving}>
                <XCircle className="w-4 h-4 mr-1" /> Reject
              </Button>
            )}
            {selected && canEdit && selected.status !== "approved" && (
              <Button onClick={() => updateStatus("approved")} disabled={saving}>
                <CheckCircle2 className="w-4 h-4 mr-1" /> Approve
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
