import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { runSubmission, getAdapter } from "@/lib/suite/regulatorAdapters";
import {
  Send, CheckCircle2, XCircle, AlertTriangle, Clock, RefreshCcw, Plus, ExternalLink, FileClock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface Adapter {
  key: string;
  label: string;
  regulator: string;
  jurisdiction: string | null;
  report_kinds: string[];
  transport: string;
  default_sla_hours: number;
  is_live: boolean;
  description: string | null;
}

interface Submission {
  id: string;
  report_kind: string;
  report_id: string | null;
  regulator: string;
  adapter: string;
  jurisdiction: string | null;
  status: string;
  external_reference: string | null;
  submitted_at: string | null;
  acknowledged_at: string | null;
  rejected_at: string | null;
  rejection_reason: string | null;
  sla_hours: number | null;
  sla_due_at: string | null;
  sla_breached: boolean;
  request_payload: Record<string, unknown>;
  response_payload: Record<string, unknown>;
  attempt_count: number;
  last_error: string | null;
  created_at: string;
}

interface SubmissionEvent {
  id: string;
  event_type: string;
  from_status: string | null;
  to_status: string | null;
  details: Record<string, unknown>;
  created_at: string;
}

const statusStyle = (s: string) => {
  switch (s) {
    case "acknowledged": return "bg-emerald-500/15 text-emerald-500 border-emerald-500/30";
    case "submitted":    return "bg-blue-500/15 text-blue-500 border-blue-500/30";
    case "submitting":   return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    case "queued":       return "bg-slate-500/15 text-slate-400 border-slate-500/30";
    case "rejected":     return "bg-red-500/15 text-red-500 border-red-500/30";
    case "failed":       return "bg-red-500/15 text-red-500 border-red-500/30";
    case "cancelled":    return "bg-muted text-muted-foreground";
    default:             return "bg-muted text-muted-foreground";
  }
};

export default function SuiteRegulatorSubmissions() {
  const [adapters, setAdapters] = useState<Adapter[]>([]);
  const [rows, setRows] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [regulatorFilter, setRegulatorFilter] = useState<string>("all");
  const [newOpen, setNewOpen] = useState(false);
  const [selected, setSelected] = useState<Submission | null>(null);
  const [events, setEvents] = useState<SubmissionEvent[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data: subs }, { data: ad }] = await Promise.all([
      supabase.from("suite_regulator_submissions" as never)
        .select("*").order("created_at", { ascending: false }).limit(200),
      supabase.from("suite_regulator_adapters" as never)
        .select("*").eq("is_active", true).order("label"),
    ]);
    setRows((subs as Submission[]) ?? []);
    setAdapters((ad as Adapter[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => rows.filter(r =>
    (statusFilter === "all" || r.status === statusFilter) &&
    (regulatorFilter === "all" || r.regulator === regulatorFilter)
  ), [rows, statusFilter, regulatorFilter]);

  const kpis = useMemo(() => ({
    total:       rows.length,
    open:        rows.filter(r => ["queued","submitting","submitted"].includes(r.status)).length,
    breached:    rows.filter(r => r.sla_breached && !["acknowledged","cancelled","rejected"].includes(r.status)).length,
    acknowledged: rows.filter(r => r.status === "acknowledged").length,
    rejected:    rows.filter(r => r.status === "rejected").length,
  }), [rows]);

  const regulators = useMemo(() => Array.from(new Set(rows.map(r => r.regulator))), [rows]);

  async function openDetail(row: Submission) {
    setSelected(row);
    const { data } = await supabase
      .from("suite_regulator_submission_events" as never)
      .select("*")
      .eq("submission_id", row.id)
      .order("created_at", { ascending: true });
    setEvents((data as SubmissionEvent[]) ?? []);
  }

  async function dispatch(row: Submission) {
    try {
      const adapter = getAdapter(row.adapter);
      const res = await runSubmission(row.id);
      const note = (res.responsePayload?.note as string) ?? undefined;
      if (adapter && !adapter.isLive) {
        toast({
          title: `${adapter.label} is not live yet`,
          description: note ?? "The report stays queued — file it through the regulator portal and mark it submitted here.",
        });
      } else {
        toast({ title: `Adapter ran: ${res.status}`, description: note });
      }
      load();
      if (selected?.id === row.id) openDetail(row);
    } catch (e) {
      toast({ title: "Adapter failed", description: (e as Error).message, variant: "destructive" });
    }
  }


  async function markAck(row: Submission, reference: string) {
    const { error } = await supabase
      .from("suite_regulator_submissions" as never)
      .update({ status: "acknowledged", external_reference: reference } as never)
      .eq("id", row.id);
    if (error) return toast({ title: "Update failed", description: error.message, variant: "destructive" });
    toast({ title: "Marked acknowledged" });
    load();
  }

  async function markReject(row: Submission, reason: string) {
    const { error } = await supabase
      .from("suite_regulator_submissions" as never)
      .update({ status: "rejected", rejection_reason: reason } as never)
      .eq("id", row.id);
    if (error) return toast({ title: "Update failed", description: error.message, variant: "destructive" });
    toast({ title: "Marked rejected" });
    load();
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <FileClock className="w-6 h-6 text-accent" /> Regulator Submissions
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track every filing sent to a regulator — SLA, adapter, external reference and full audit trail.
          </p>
        </div>
        <Button onClick={() => setNewOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> New submission
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Kpi label="Total" value={kpis.total} />
        <Kpi label="Open" value={kpis.open} tone="blue" />
        <Kpi label="SLA breached" value={kpis.breached} tone="red" icon={<AlertTriangle className="w-4 h-4" />} />
        <Kpi label="Acknowledged" value={kpis.acknowledged} tone="emerald" />
        <Kpi label="Rejected" value={kpis.rejected} tone="amber" />
      </div>

      {/* Filters */}
      <Card className="p-4 flex flex-wrap gap-3 items-end">
        <div>
          <Label className="text-xs text-muted-foreground">Status</Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {["queued","submitting","submitted","acknowledged","rejected","failed","cancelled"].map(s =>
                <SelectItem key={s} value={s}>{s}</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Regulator</Label>
          <Select value={regulatorFilter} onValueChange={setRegulatorFilter}>
            <SelectTrigger className="w-40 mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {regulators.map(r => <SelectItem key={r} value={r}>{r.toUpperCase()}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" size="sm" onClick={load} className="ml-auto">
          <RefreshCcw className="w-4 h-4 mr-2" /> Refresh
        </Button>
      </Card>

      {/* Table */}
      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="p-6 text-sm text-muted-foreground">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">
            No submissions yet. Click <b>New submission</b> to record one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="text-left p-3">Regulator</th>
                  <th className="text-left p-3">Report</th>
                  <th className="text-left p-3">Adapter</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">SLA</th>
                  <th className="text-left p-3">External ref</th>
                  <th className="text-left p-3">Created</th>
                  <th className="text-right p-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-muted/30 cursor-pointer" onClick={() => openDetail(r)}>
                    <td className="p-3 font-medium">{r.regulator.toUpperCase()}
                      {r.jurisdiction && <span className="text-xs text-muted-foreground ml-1">{r.jurisdiction}</span>}
                    </td>
                    <td className="p-3">
                      <Badge variant="outline" className="text-[10px] uppercase">{r.report_kind}</Badge>
                    </td>
                    <td className="p-3 text-xs text-muted-foreground">{r.adapter}</td>
                    <td className="p-3">
                      <Badge variant="outline" className={cn("border", statusStyle(r.status))}>{r.status}</Badge>
                    </td>
                    <td className="p-3">
                      {r.sla_due_at ? (
                        <div className={cn("flex items-center gap-1 text-xs",
                          r.sla_breached ? "text-red-500" : "text-muted-foreground")}>
                          {r.sla_breached ? <AlertTriangle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                          {formatDistanceToNow(new Date(r.sla_due_at), { addSuffix: true })}
                        </div>
                      ) : <span className="text-xs text-muted-foreground">—</span>}
                    </td>
                    <td className="p-3 text-xs">{r.external_reference ?? <span className="text-muted-foreground">—</span>}</td>
                    <td className="p-3 text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}
                    </td>
                    <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex gap-1 justify-end">
                        {["queued","failed"].includes(r.status) && (
                          <Button size="sm" variant="outline" onClick={() => dispatch(r)}>
                            <Send className="w-3 h-3 mr-1" /> Run
                          </Button>
                        )}
                        {r.status === "submitted" && (
                          <>
                            <Button size="sm" variant="ghost" onClick={() => {
                              const ref = prompt("Regulator acknowledgement reference?", r.external_reference ?? "");
                              if (ref) markAck(r, ref);
                            }}>
                              <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-500" /> Ack
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => {
                              const reason = prompt("Rejection reason?");
                              if (reason) markReject(r, reason);
                            }}>
                              <XCircle className="w-3 h-3 mr-1 text-red-500" /> Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* New submission dialog */}
      <NewSubmissionDialog
        open={newOpen}
        onClose={() => setNewOpen(false)}
        adapters={adapters}
        onCreated={load}
      />

      {/* Detail dialog */}
      <Dialog open={!!selected} onOpenChange={(v) => { if (!v) { setSelected(null); setEvents([]); } }}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {selected.regulator.toUpperCase()} · {selected.report_kind.toUpperCase()}
                  <Badge variant="outline" className={cn("border", statusStyle(selected.status))}>{selected.status}</Badge>
                </DialogTitle>
                <DialogDescription>Adapter: {selected.adapter}</DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <Field label="External reference" value={selected.external_reference ?? "—"} />
                <Field label="Attempts" value={String(selected.attempt_count)} />
                <Field label="Submitted at" value={selected.submitted_at ? new Date(selected.submitted_at).toLocaleString() : "—"} />
                <Field label="Acknowledged at" value={selected.acknowledged_at ? new Date(selected.acknowledged_at).toLocaleString() : "—"} />
                <Field label="SLA due" value={selected.sla_due_at ? new Date(selected.sla_due_at).toLocaleString() : "—"} />
                <Field label="SLA breached" value={selected.sla_breached ? "Yes" : "No"} />
              </div>

              {selected.last_error && (
                <div className="rounded border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
                  <b>Last error:</b> {selected.last_error}
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-xs">Request payload</Label>
                <pre className="text-[11px] bg-muted/40 rounded p-3 overflow-x-auto max-h-40">
                  {JSON.stringify(selected.request_payload, null, 2)}
                </pre>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Response payload</Label>
                <pre className="text-[11px] bg-muted/40 rounded p-3 overflow-x-auto max-h-40">
                  {JSON.stringify(selected.response_payload, null, 2)}
                </pre>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Event history</Label>
                <div className="space-y-1 text-xs">
                  {events.length === 0 ? (
                    <div className="text-muted-foreground">No events.</div>
                  ) : events.map(ev => (
                    <div key={ev.id} className="flex items-start gap-2 p-2 rounded bg-muted/30">
                      <ExternalLink className="w-3 h-3 mt-0.5 text-muted-foreground" />
                      <div className="flex-1">
                        <div>
                          <b>{ev.event_type}</b>
                          {ev.from_status && ev.to_status && <> · {ev.from_status} → {ev.to_status}</>}
                        </div>
                        <div className="text-muted-foreground">
                          {new Date(ev.created_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Kpi({ label, value, tone, icon }: { label: string; value: number; tone?: "blue"|"red"|"emerald"|"amber"; icon?: React.ReactNode }) {
  const tones: Record<string,string> = {
    blue: "text-blue-500", red: "text-red-500", emerald: "text-emerald-500", amber: "text-amber-500",
  };
  return (
    <Card className="p-4">
      <div className="text-xs text-muted-foreground flex items-center gap-1">{icon}{label}</div>
      <div className={cn("text-2xl font-semibold mt-1", tone && tones[tone])}>{value}</div>
    </Card>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-0.5">{value}</div>
    </div>
  );
}

function NewSubmissionDialog({
  open, onClose, adapters, onCreated,
}: {
  open: boolean; onClose: () => void; adapters: Adapter[]; onCreated: () => void;
}) {
  const [adapterKey, setAdapterKey] = useState("");
  const [reportKind, setReportKind] = useState("str");
  const [reportId, setReportId] = useState("");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const adapter = adapters.find(a => a.key === adapterKey);

  useEffect(() => {
    if (adapter && !adapter.report_kinds.includes(reportKind)) {
      setReportKind(adapter.report_kinds[0] ?? "str");
    }
  }, [adapter, reportKind]);

  async function submit() {
    if (!adapter) return toast({ title: "Choose an adapter", variant: "destructive" });
    setSaving(true);
    const { data: userRes } = await supabase.auth.getUser();
    const { data: orgId } = await supabase.rpc("current_user_org_id");
    if (!orgId || !userRes?.user) {
      setSaving(false);
      return toast({ title: "No organisation", description: "Complete Suite setup first.", variant: "destructive" });
    }

    const { error } = await supabase.from("suite_regulator_submissions" as never).insert({
      organisation_id: orgId,
      user_id: userRes.user.id,
      adapter: adapter.key,
      regulator: adapter.regulator,
      jurisdiction: adapter.jurisdiction,
      report_kind: reportKind,
      report_id: reportId || null,
      external_reference: reference || null,
      request_payload: { notes, reference: reference || null },
    } as never);
    setSaving(false);
    if (error) return toast({ title: "Create failed", description: error.message, variant: "destructive" });
    toast({ title: "Submission created" });
    setAdapterKey(""); setReportId(""); setReference(""); setNotes("");
    onCreated(); onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>New regulator submission</DialogTitle>
          <DialogDescription>Record a filing sent (or queued) to a regulator.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Adapter / channel</Label>
            <Select value={adapterKey} onValueChange={setAdapterKey}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Choose adapter…" /></SelectTrigger>
              <SelectContent>
                {adapters.map(a => (
                  <SelectItem key={a.key} value={a.key}>
                    {a.label} {a.is_live ? "" : "· stub"} — SLA {a.default_sla_hours}h
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {adapter?.description && (
              <p className="text-xs text-muted-foreground mt-1">{adapter.description}</p>
            )}
          </div>
          <div>
            <Label>Report kind</Label>
            <Select value={reportKind} onValueChange={setReportKind}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {(adapter?.report_kinds ?? ["str","ctr","sar","periodic","other"]).map(k =>
                  <SelectItem key={k} value={k}>{k.toUpperCase()}</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Internal report ID (optional)</Label>
            <Input value={reportId} onChange={(e) => setReportId(e.target.value)} placeholder="e.g. STR row UUID" />
          </div>
          <div>
            <Label>External reference (if known)</Label>
            <Input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="regulator receipt / portal ref" />
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} disabled={saving || !adapterKey}>
            {saving ? "Saving…" : "Create submission"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
