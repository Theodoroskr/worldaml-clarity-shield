import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useOrganisation } from "@/hooks/useOrganisation";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Clock, User, MessageSquare, Link2, Plus, CheckCircle2, Activity } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

type CaseRow = {
  id: string;
  title: string;
  status: string;
  priority: string | null;
  assignee_user_id: string | null;
  assigned_to: string | null;
  customer_id: string | null;
  linked_entity_type: string | null;
  linked_entity_id: string | null;
  due_at: string | null;
  sla_hours: number | null;
  opened_at: string | null;
  closed_at: string | null;
  closure_reason: string | null;
  closure_notes: string | null;
  closed_by: string | null;
  organisation_id: string;
  user_id: string;
  created_at: string;
};

type Member = { user_id: string; role: string; email: string | null; full_name: string | null };
type Customer = { id: string; name: string; type: string | null; risk_level: string | null; country: string | null; kyc_status: string | null };
type Note = { id: string; content: string; user_id: string; created_at: string };
type Activity = { id: string; action: string; details: any; actor_id: string | null; created_at: string };

const PRIORITY_ORDER: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
const SLA_DEFAULT: Record<string, number> = { critical: 4, high: 24, medium: 72, low: 168 };

const CLOSURE_REASONS = [
  { value: "resolved_no_action", label: "Resolved — no action required" },
  { value: "false_positive", label: "False positive" },
  { value: "escalated_to_regulator", label: "Escalated to regulator" },
  { value: "sar_filed", label: "SAR / STR filed" },
  { value: "customer_offboarded", label: "Customer offboarded" },
  { value: "duplicate", label: "Duplicate case" },
  { value: "other", label: "Other (see notes)" },
];

function priorityBadge(p: string | null) {
  const map: Record<string, string> = {
    critical: "bg-red-500/15 text-red-400 border-red-500/30",
    high: "bg-orange-500/15 text-orange-400 border-orange-500/30",
    medium: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
    low: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  };
  return map[p || "medium"] || map.medium;
}

function slaState(c: CaseRow): { label: string; tone: string } {
  if (c.status === "closed" || c.status === "resolved") return { label: "Closed", tone: "text-muted-foreground" };
  if (!c.due_at) return { label: "No SLA", tone: "text-muted-foreground" };
  const due = new Date(c.due_at).getTime();
  const now = Date.now();
  if (due < now) return { label: `Overdue by ${formatDistanceToNow(new Date(c.due_at))}`, tone: "text-red-400" };
  const hoursLeft = (due - now) / 3_600_000;
  if (hoursLeft < 4) return { label: `Due in ${formatDistanceToNow(new Date(c.due_at))}`, tone: "text-orange-400" };
  return { label: `Due in ${formatDistanceToNow(new Date(c.due_at))}`, tone: "text-emerald-400" };
}

export default function SuiteCaseQueue() {
  const { orgId, userId, isLoading: orgLoading } = useOrganisation();
  const [cases, setCases] = useState<CaseRow[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [customersById, setCustomersById] = useState<Record<string, Customer>>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<{ status: string; priority: string; assignee: string; q: string }>({
    status: "open", priority: "all", assignee: "all", q: "",
  });
  const [selected, setSelected] = useState<CaseRow | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [newNote, setNewNote] = useState("");
  const [closeOpen, setCloseOpen] = useState(false);
  const [closeReason, setCloseReason] = useState<string>("resolved_no_action");
  const [closeNotes, setCloseNotes] = useState("");
  const [newOpen, setNewOpen] = useState(false);
  const [newCase, setNewCase] = useState({ title: "", priority: "medium", customer_id: "", assignee_user_id: "", sla_hours: 72 });

  const loadCases = useCallback(async () => {
    if (!orgId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("suite_cases")
      .select("*")
      .eq("organisation_id", orgId)
      .order("created_at", { ascending: false });
    if (error) { toast.error(error.message); setLoading(false); return; }
    const rows = (data || []) as CaseRow[];
    setCases(rows);

    const ids = Array.from(new Set(rows.map(r => r.customer_id).filter(Boolean))) as string[];
    if (ids.length) {
      const { data: custs } = await supabase.from("suite_customers")
        .select("id,name,type,risk_level,country,kyc_status")
        .in("id", ids);
      const map: Record<string, Customer> = {};
      (custs || []).forEach((c: any) => { map[c.id] = c; });
      setCustomersById(map);
    }
    setLoading(false);
  }, [orgId]);

  const loadMembers = useCallback(async () => {
    if (!orgId) return;
    const { data: mem } = await supabase.from("suite_org_members")
      .select("user_id,role").eq("organization_id", orgId);
    const uids = (mem || []).map((m: any) => m.user_id);
    if (!uids.length) { setMembers([]); return; }
    const { data: profs } = await supabase.from("profiles")
      .select("user_id,email,full_name").in("user_id", uids);
    const pmap: Record<string, any> = {};
    (profs || []).forEach((p: any) => { pmap[p.user_id] = p; });
    setMembers((mem || []).map((m: any) => ({
      user_id: m.user_id, role: m.role,
      email: pmap[m.user_id]?.email || null,
      full_name: pmap[m.user_id]?.full_name || null,
    })));
  }, [orgId]);

  useEffect(() => { if (!orgLoading) { loadCases(); loadMembers(); } }, [orgLoading, loadCases, loadMembers]);

  const loadDetail = useCallback(async (caseId: string) => {
    const [{ data: n }, { data: a }] = await Promise.all([
      supabase.from("suite_case_notes").select("*").eq("case_id", caseId).order("created_at", { ascending: true }),
      supabase.from("suite_case_activity").select("*").eq("case_id", caseId).order("created_at", { ascending: false }),
    ]);
    setNotes((n || []) as Note[]);
    setActivity((a || []) as Activity[]);
  }, []);

  useEffect(() => { if (selected) loadDetail(selected.id); }, [selected, loadDetail]);

  const memberLabel = (uid: string | null) => {
    if (!uid) return "Unassigned";
    const m = members.find(x => x.user_id === uid);
    return m?.full_name || m?.email || uid.slice(0, 8);
  };

  const filtered = useMemo(() => {
    const rows = cases.filter(c => {
      if (filter.status !== "all" && c.status !== filter.status) return false;
      if (filter.priority !== "all" && (c.priority || "medium") !== filter.priority) return false;
      if (filter.assignee === "me" && c.assignee_user_id !== userId) return false;
      if (filter.assignee === "unassigned" && c.assignee_user_id) return false;
      if (filter.q) {
        const q = filter.q.toLowerCase();
        const cust = c.customer_id ? customersById[c.customer_id]?.name?.toLowerCase() : "";
        if (!c.title.toLowerCase().includes(q) && !(cust || "").includes(q)) return false;
      }
      return true;
    });
    return rows.sort((a, b) => {
      const pa = PRIORITY_ORDER[a.priority || "medium"] ?? 2;
      const pb = PRIORITY_ORDER[b.priority || "medium"] ?? 2;
      if (pa !== pb) return pa - pb;
      const da = a.due_at ? new Date(a.due_at).getTime() : Infinity;
      const db = b.due_at ? new Date(b.due_at).getTime() : Infinity;
      return da - db;
    });
  }, [cases, filter, customersById, userId]);

  const kpi = useMemo(() => {
    const open = cases.filter(c => c.status === "open" || c.status === "in_progress");
    const overdue = open.filter(c => c.due_at && new Date(c.due_at) < new Date());
    const mine = open.filter(c => c.assignee_user_id === userId);
    const unassigned = open.filter(c => !c.assignee_user_id);
    return { open: open.length, overdue: overdue.length, mine: mine.length, unassigned: unassigned.length };
  }, [cases, userId]);

  async function updateCase(id: string, patch: Partial<CaseRow>) {
    const { error } = await supabase.from("suite_cases").update(patch).eq("id", id);
    if (error) { toast.error(error.message); return false; }
    await loadCases();
    if (selected?.id === id) {
      const updated = { ...selected, ...patch } as CaseRow;
      setSelected(updated);
      loadDetail(id);
    }
    return true;
  }

  async function addNote() {
    if (!selected || !newNote.trim() || !orgId || !userId) return;
    const { error } = await supabase.from("suite_case_notes").insert({
      case_id: selected.id, content: newNote.trim(),
      user_id: userId, organisation_id: orgId,
    });
    if (error) return toast.error(error.message);
    setNewNote("");
    loadDetail(selected.id);
    toast.success("Comment added");
  }

  async function closeCase() {
    if (!selected) return;
    if (!closeReason) return toast.error("Closure reason required");
    const ok = await updateCase(selected.id, {
      status: "closed",
      closure_reason: closeReason,
      closure_notes: closeNotes || null,
    } as any);
    if (ok) { setCloseOpen(false); setCloseNotes(""); toast.success("Case closed"); }
  }

  async function createCase() {
    if (!orgId || !userId) return;
    if (!newCase.title.trim()) return toast.error("Title required");
    const payload: any = {
      title: newCase.title.trim(),
      priority: newCase.priority,
      status: "open",
      sla_hours: Number(newCase.sla_hours) || SLA_DEFAULT[newCase.priority],
      customer_id: newCase.customer_id || null,
      assignee_user_id: newCase.assignee_user_id || null,
      organisation_id: orgId,
      user_id: userId,
    };
    const { error } = await supabase.from("suite_cases").insert(payload);
    if (error) return toast.error(error.message);
    toast.success("Case created");
    setNewOpen(false);
    setNewCase({ title: "", priority: "medium", customer_id: "", assignee_user_id: "", sla_hours: 72 });
    loadCases();
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Case Queue</h1>
          <p className="text-sm text-muted-foreground">Assignees, SLA priority, linked entities, comments and audit-ready closures.</p>
        </div>
        <Button onClick={() => setNewOpen(true)}><Plus className="h-4 w-4 mr-2" />New Case</Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Open", value: kpi.open, icon: Activity, tone: "text-primary" },
          { label: "Overdue SLA", value: kpi.overdue, icon: AlertTriangle, tone: "text-red-400" },
          { label: "Assigned to me", value: kpi.mine, icon: User, tone: "text-teal-400" },
          { label: "Unassigned", value: kpi.unassigned, icon: Clock, tone: "text-orange-400" },
        ].map(k => (
          <Card key={k.label}>
            <CardContent className="pt-5 flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground">{k.label}</div>
                <div className="text-2xl font-semibold">{k.value}</div>
              </div>
              <k.icon className={`h-8 w-8 ${k.tone}`} />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4 flex flex-wrap gap-3">
          <Input placeholder="Search title or customer…" value={filter.q}
            onChange={e => setFilter({ ...filter, q: e.target.value })} className="w-64" />
          <Select value={filter.status} onValueChange={v => setFilter({ ...filter, status: v })}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In progress</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filter.priority} onValueChange={v => setFilter({ ...filter, priority: v })}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All priorities</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filter.assignee} onValueChange={v => setFilter({ ...filter, assignee: v })}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All assignees</SelectItem>
              <SelectItem value="me">Assigned to me</SelectItem>
              <SelectItem value="unassigned">Unassigned</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Queue */}
      <Card>
        <CardHeader><CardTitle className="text-base">Queue ({filtered.length})</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {loading && <div className="p-6 text-sm text-muted-foreground">Loading…</div>}
            {!loading && filtered.length === 0 && <div className="p-6 text-sm text-muted-foreground">No cases match your filters.</div>}
            {filtered.map(c => {
              const sla = slaState(c);
              const cust = c.customer_id ? customersById[c.customer_id] : null;
              return (
                <button key={c.id} onClick={() => setSelected(c)}
                  className="w-full text-left p-4 hover:bg-muted/40 transition flex flex-wrap items-center gap-3">
                  <Badge variant="outline" className={priorityBadge(c.priority)}>{(c.priority || "medium").toUpperCase()}</Badge>
                  <div className="flex-1 min-w-[240px]">
                    <div className="font-medium">{c.title}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                      {cust && <><Link2 className="h-3 w-3" /> {cust.name}</>}
                      {!cust && c.linked_entity_type && <>Linked: {c.linked_entity_type}</>}
                      <span>·</span>
                      <span>Opened {formatDistanceToNow(new Date(c.opened_at || c.created_at))} ago</span>
                    </div>
                  </div>
                  <div className="text-xs flex items-center gap-1"><User className="h-3 w-3" />{memberLabel(c.assignee_user_id)}</div>
                  <div className={`text-xs flex items-center gap-1 ${sla.tone}`}><Clock className="h-3 w-3" />{sla.label}</div>
                  <Badge variant="secondary" className="capitalize">{c.status.replace("_", " ")}</Badge>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Detail dialog */}
      <Dialog open={!!selected} onOpenChange={o => { if (!o) setSelected(null); }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Badge variant="outline" className={priorityBadge(selected.priority)}>{(selected.priority || "medium").toUpperCase()}</Badge>
                  {selected.title}
                </DialogTitle>
                <DialogDescription>Case #{selected.id.slice(0, 8)} · {selected.status}</DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Left: management */}
                <div className="md:col-span-2 space-y-4">
                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm">Management</CardTitle></CardHeader>
                    <CardContent className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-muted-foreground">Assignee</label>
                        <Select value={selected.assignee_user_id || "unassigned"}
                          onValueChange={v => updateCase(selected.id, { assignee_user_id: v === "unassigned" ? null : v } as any)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="unassigned">Unassigned</SelectItem>
                            {members.map(m => (
                              <SelectItem key={m.user_id} value={m.user_id}>
                                {m.full_name || m.email || m.user_id.slice(0, 8)} · {m.role}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Priority</label>
                        <Select value={selected.priority || "medium"}
                          onValueChange={v => updateCase(selected.id, { priority: v, sla_hours: SLA_DEFAULT[v] } as any)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {["critical", "high", "medium", "low"].map(p =>
                              <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Status</label>
                        <Select value={selected.status}
                          onValueChange={v => {
                            if (v === "closed" || v === "resolved") { setCloseOpen(true); return; }
                            updateCase(selected.id, { status: v } as any);
                          }}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="open">Open</SelectItem>
                            <SelectItem value="in_progress">In progress</SelectItem>
                            <SelectItem value="closed">Close case…</SelectItem>
                            <SelectItem value="resolved">Resolve case…</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">SLA (hours)</label>
                        <Input type="number" min={1} defaultValue={selected.sla_hours ?? SLA_DEFAULT[selected.priority || "medium"]}
                          onBlur={e => {
                            const n = Number(e.target.value);
                            if (n && n !== selected.sla_hours) updateCase(selected.id, { sla_hours: n } as any);
                          }} />
                      </div>
                    </CardContent>
                  </Card>

                  {selected.status === "closed" && (
                    <Card className="border-emerald-500/30">
                      <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" />Closure</CardTitle></CardHeader>
                      <CardContent className="text-sm space-y-1">
                        <div><span className="text-muted-foreground">Reason:</span> {CLOSURE_REASONS.find(r => r.value === selected.closure_reason)?.label || selected.closure_reason}</div>
                        {selected.closure_notes && <div><span className="text-muted-foreground">Notes:</span> {selected.closure_notes}</div>}
                        {selected.closed_at && <div className="text-xs text-muted-foreground">Closed {formatDistanceToNow(new Date(selected.closed_at))} ago by {memberLabel(selected.closed_by as any)}</div>}
                      </CardContent>
                    </Card>
                  )}

                  {/* Comments */}
                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><MessageSquare className="h-4 w-4" />Comments ({notes.length})</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {notes.map(n => (
                          <div key={n.id} className="border rounded p-2 text-sm">
                            <div className="text-xs text-muted-foreground mb-1">{memberLabel(n.user_id)} · {formatDistanceToNow(new Date(n.created_at))} ago</div>
                            <div className="whitespace-pre-wrap">{n.content}</div>
                          </div>
                        ))}
                        {notes.length === 0 && <div className="text-sm text-muted-foreground">No comments yet.</div>}
                      </div>
                      <div className="flex gap-2">
                        <Textarea value={newNote} onChange={e => setNewNote(e.target.value)}
                          placeholder="Add a comment (visible to your organisation)…" rows={2} />
                        <Button onClick={addNote} disabled={!newNote.trim()}>Post</Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Activity */}
                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Activity className="h-4 w-4" />Activity</CardTitle></CardHeader>
                    <CardContent>
                      <div className="space-y-2 max-h-56 overflow-y-auto text-sm">
                        {activity.map(a => (
                          <div key={a.id} className="flex items-start gap-2 border-l-2 border-primary/40 pl-2">
                            <div>
                              <div className="text-xs">{a.action.replace(/_/g, " ")} · {memberLabel(a.actor_id)}</div>
                              <div className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(a.created_at))} ago</div>
                              {a.details && Object.keys(a.details).length > 0 && (
                                <div className="text-xs text-muted-foreground font-mono mt-0.5">
                                  {Object.entries(a.details).map(([k, v]) => `${k}: ${JSON.stringify(v)}`).join(" · ")}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                        {activity.length === 0 && <div className="text-muted-foreground">No activity recorded.</div>}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Right: linked entity */}
                <div className="space-y-4">
                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Link2 className="h-4 w-4" />Linked Customer</CardTitle></CardHeader>
                    <CardContent className="text-sm space-y-1">
                      {selected.customer_id && customersById[selected.customer_id] ? (
                        <>
                          <div className="font-medium">{customersById[selected.customer_id].name}</div>
                          <div className="text-muted-foreground text-xs capitalize">{customersById[selected.customer_id].type} · {customersById[selected.customer_id].country || "—"}</div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            <Badge variant="outline">Risk: {customersById[selected.customer_id].risk_level || "—"}</Badge>
                            <Badge variant="outline">KYC: {customersById[selected.customer_id].kyc_status || "—"}</Badge>
                          </div>
                          <a className="text-xs text-primary underline mt-3 inline-block"
                            href={`/suite/customers?id=${selected.customer_id}`}>Open customer →</a>
                        </>
                      ) : (
                        <div className="text-muted-foreground">No customer linked.</div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm">Timing</CardTitle></CardHeader>
                    <CardContent className="text-xs space-y-1">
                      <div><span className="text-muted-foreground">Opened:</span> {selected.opened_at ? new Date(selected.opened_at).toLocaleString() : "—"}</div>
                      <div><span className="text-muted-foreground">Due:</span> {selected.due_at ? new Date(selected.due_at).toLocaleString() : "No SLA"}</div>
                      <div><span className="text-muted-foreground">SLA:</span> {selected.sla_hours ?? "—"} hours</div>
                      <div className={slaState(selected).tone}>{slaState(selected).label}</div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Close dialog */}
      <Dialog open={closeOpen} onOpenChange={setCloseOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Close case</DialogTitle>
            <DialogDescription>A closure reason is required for audit trail.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground">Closure reason *</label>
              <Select value={closeReason} onValueChange={setCloseReason}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CLOSURE_REASONS.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Notes (optional)</label>
              <Textarea rows={3} value={closeNotes} onChange={e => setCloseNotes(e.target.value)} placeholder="Explain the resolution…" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCloseOpen(false)}>Cancel</Button>
            <Button onClick={closeCase}>Close case</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New case dialog */}
      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>New case</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground">Title *</label>
              <Input value={newCase.title} onChange={e => setNewCase({ ...newCase, title: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground">Priority</label>
                <Select value={newCase.priority} onValueChange={v => setNewCase({ ...newCase, priority: v, sla_hours: SLA_DEFAULT[v] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["critical", "high", "medium", "low"].map(p =>
                      <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">SLA (hours)</label>
                <Input type="number" min={1} value={newCase.sla_hours}
                  onChange={e => setNewCase({ ...newCase, sla_hours: Number(e.target.value) })} />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-muted-foreground">Assignee</label>
                <Select value={newCase.assignee_user_id || "unassigned"}
                  onValueChange={v => setNewCase({ ...newCase, assignee_user_id: v === "unassigned" ? "" : v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {members.map(m => (
                      <SelectItem key={m.user_id} value={m.user_id}>
                        {m.full_name || m.email || m.user_id.slice(0, 8)} · {m.role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <label className="text-xs text-muted-foreground">Linked customer ID (optional)</label>
                <Input value={newCase.customer_id} onChange={e => setNewCase({ ...newCase, customer_id: e.target.value })}
                  placeholder="UUID from Customers page" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewOpen(false)}>Cancel</Button>
            <Button onClick={createCase}>Create case</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
