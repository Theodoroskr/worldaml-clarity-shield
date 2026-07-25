import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { AlertTriangle, Shield, FileText, Clock, CheckCircle2, Play } from "lucide-react";
import { format } from "date-fns";

type Dsar = any;
type Policy = any;
type Erasure = any;

const KINDS = ["access", "erasure", "rectification", "portability", "restriction", "objection"];
const STATUSES = ["received", "verifying", "in_progress", "fulfilled", "rejected", "partially_fulfilled", "withdrawn"];
const RECORD_TYPES = ["customer","customer_document","transaction","screening","case","alert","sof_declaration","edd_case","ubo","audit_log","notification_log"];

export default function SuiteDsar() {
  const [tab, setTab] = useState("requests");
  const [dsars, setDsars] = useState<Dsar[]>([]);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [erasures, setErasures] = useState<Erasure[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newDsarOpen, setNewDsarOpen] = useState(false);
  const [sweeping, setSweeping] = useState(false);

  const [form, setForm] = useState({
    request_kind: "erasure",
    subject_name: "",
    subject_email: "",
    subject_phone: "",
    subject_customer_id: "",
    received_via: "email",
    description: "",
  });

  const loadAll = async () => {
    setLoading(true);
    const [d, p, e, c] = await Promise.all([
      supabase.from("suite_dsar_requests").select("*").order("created_at", { ascending: false }),
      supabase.from("suite_retention_policies").select("*").order("record_type"),
      supabase.from("suite_erasure_log").select("*").order("created_at", { ascending: false }).limit(200),
      supabase.from("suite_customers").select("id,name,email").order("name").limit(500),
    ]);
    setDsars(d.data || []);
    setPolicies(p.data || []);
    setErasures(e.data || []);
    setCustomers(c.data || []);
    setLoading(false);
  };

  useEffect(() => { loadAll(); }, []);

  const kpis = useMemo(() => {
    const open = dsars.filter(r => !["fulfilled","rejected","withdrawn"].includes(r.status)).length;
    const overdue = dsars.filter(r => !["fulfilled","rejected","withdrawn"].includes(r.status) && new Date(r.due_by) < new Date()).length;
    const fulfilled30d = dsars.filter(r => r.status === "fulfilled" && r.fulfilled_at && (Date.now() - new Date(r.fulfilled_at).getTime()) < 30*86400000).length;
    return { open, overdue, fulfilled30d, totalErasures: erasures.length };
  }, [dsars, erasures]);

  const createDsar = async () => {
    if (!form.subject_name.trim()) { toast.error("Subject name required"); return; }
    const { data: { user } } = await supabase.auth.getUser();
    const { data: orgId } = await supabase.rpc("current_user_org_id");
    if (!user || !orgId) { toast.error("No organisation context"); return; }

    const payload: any = {
      organisation_id: orgId,
      user_id: user.id,
      request_kind: form.request_kind,
      subject_name: form.subject_name,
      subject_email: form.subject_email || null,
      subject_phone: form.subject_phone || null,
      subject_customer_id: form.subject_customer_id || null,
      received_via: form.received_via,
      description: form.description || null,
    };
    const { error } = await supabase.from("suite_dsar_requests").insert(payload);
    if (error) { toast.error(error.message); return; }
    toast.success("DSAR request logged");
    setNewDsarOpen(false);
    setForm({ ...form, subject_name: "", subject_email: "", subject_phone: "", subject_customer_id: "", description: "" });
    loadAll();
  };

  const verifyIdentity = async (id: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("suite_dsar_requests").update({
      identity_verified: true,
      identity_verified_at: new Date().toISOString(),
      identity_verified_by: user?.id,
      status: "in_progress",
    }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Identity verified");
    loadAll();
  };

  const setStatus = async (id: string, status: string, extra: any = {}) => {
    const { error } = await supabase.from("suite_dsar_requests").update({ status, ...extra }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success(`Marked ${status}`);
    loadAll();
  };

  const executeErasure = async (dsar: Dsar) => {
    if (!dsar.subject_customer_id) { toast.error("Link a customer first"); return; }
    if (!dsar.identity_verified) { toast.error("Verify subject identity first"); return; }
    if (!confirm(`Permanently redact PII for the linked customer? This is logged and cannot be undone.`)) return;
    const { data, error } = await supabase.rpc("dsar_execute_erasure", {
      _customer_id: dsar.subject_customer_id,
      _reason: dsar.description || "GDPR Art. 17 right to erasure",
      _dsar_id: dsar.id,
    });
    if (error) { toast.error(error.message); return; }
    toast.success(`Erased — ${(data as any)?.redacted_records ?? 0} records redacted`);
    loadAll();
  };

  const runSweep = async () => {
    setSweeping(true);
    const { data, error } = await supabase.rpc("sweep_retention");
    setSweeping(false);
    if (error) { toast.error(error.message); return; }
    toast.success(`Sweep complete — ${(data as any)?.total ?? 0} records processed`);
    loadAll();
  };

  const updatePolicy = async (p: Policy, patch: Partial<Policy>) => {
    // if policy is global (organisation_id null), clone into org
    const { data: orgId } = await supabase.rpc("current_user_org_id");
    if (!p.organisation_id) {
      const { error } = await supabase.from("suite_retention_policies").insert({
        organisation_id: orgId, record_type: p.record_type,
        retention_days: patch.retention_days ?? p.retention_days,
        disposition: patch.disposition ?? p.disposition,
        legal_basis: p.legal_basis, description: p.description,
      });
      if (error) { toast.error(error.message); return; }
    } else {
      const { error } = await supabase.from("suite_retention_policies").update(patch as any).eq("id", p.id);
      if (error) { toast.error(error.message); return; }
    }
    toast.success("Policy updated");
    loadAll();
  };

  const statusBadge = (s: string) => {
    const map: Record<string, string> = {
      received: "bg-blue-500/15 text-blue-500",
      verifying: "bg-amber-500/15 text-amber-500",
      in_progress: "bg-purple-500/15 text-purple-500",
      fulfilled: "bg-emerald-500/15 text-emerald-500",
      rejected: "bg-red-500/15 text-red-500",
      partially_fulfilled: "bg-teal-500/15 text-teal-500",
      withdrawn: "bg-slate-500/15 text-slate-500",
    };
    return <Badge variant="outline" className={map[s] || ""}>{s.replace(/_/g," ")}</Badge>;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2"><Shield className="h-6 w-6 text-primary" /> DSAR & Retention</h1>
          <p className="text-sm text-muted-foreground">GDPR Art. 15–22 requests, retention policies, and proof-of-erasure log.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={runSweep} disabled={sweeping}>
            <Play className="h-4 w-4 mr-2" />{sweeping ? "Running…" : "Run retention sweep now"}
          </Button>
          <Dialog open={newDsarOpen} onOpenChange={setNewDsarOpen}>
            <DialogTrigger asChild><Button>New DSAR request</Button></DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Log a new DSAR request</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Kind</Label>
                    <Select value={form.request_kind} onValueChange={v => setForm({ ...form, request_kind: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{KINDS.map(k => <SelectItem key={k} value={k}>{k}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Received via</Label>
                    <Select value={form.received_via} onValueChange={v => setForm({ ...form, received_via: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["email","portal","phone","letter","agent"].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div><Label>Subject full name *</Label><Input value={form.subject_name} onChange={e => setForm({ ...form, subject_name: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Email</Label><Input value={form.subject_email} onChange={e => setForm({ ...form, subject_email: e.target.value })} /></div>
                  <div><Label>Phone</Label><Input value={form.subject_phone} onChange={e => setForm({ ...form, subject_phone: e.target.value })} /></div>
                </div>
                <div>
                  <Label>Linked customer (optional)</Label>
                  <Select value={form.subject_customer_id || "none"} onValueChange={v => setForm({ ...form, subject_customer_id: v === "none" ? "" : v })}>
                    <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">— none —</SelectItem>
                      {customers.map(c => <SelectItem key={c.id} value={c.id}>{c.name} {c.email ? `(${c.email})` : ""}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Description / scope</Label><Textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
              </div>
              <DialogFooter><Button onClick={createDsar}>Create request</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardContent className="p-4"><div className="text-xs text-muted-foreground">Open requests</div><div className="text-2xl font-semibold">{kpis.open}</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-xs text-muted-foreground flex items-center gap-1"><AlertTriangle className="h-3 w-3 text-red-500" />Overdue</div><div className="text-2xl font-semibold text-red-500">{kpis.overdue}</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-xs text-muted-foreground">Fulfilled (30d)</div><div className="text-2xl font-semibold">{kpis.fulfilled30d}</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-xs text-muted-foreground">Erasure log entries</div><div className="text-2xl font-semibold">{kpis.totalErasures}</div></CardContent></Card>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="requests">Requests</TabsTrigger>
          <TabsTrigger value="policies">Retention policies</TabsTrigger>
          <TabsTrigger value="erasure">Proof-of-erasure log</TabsTrigger>
        </TabsList>

        <TabsContent value="requests">
          <Card>
            <CardHeader><CardTitle className="text-base">DSAR queue</CardTitle></CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Kind</TableHead><TableHead>Subject</TableHead><TableHead>Status</TableHead>
                  <TableHead>ID verified</TableHead><TableHead>Due</TableHead><TableHead>Received</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {loading && <TableRow><TableCell colSpan={7}>Loading…</TableCell></TableRow>}
                  {!loading && dsars.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-6">No DSAR requests yet</TableCell></TableRow>}
                  {dsars.map(r => (
                    <TableRow key={r.id}>
                      <TableCell><Badge variant="outline">{r.request_kind}</Badge></TableCell>
                      <TableCell>
                        <div className="font-medium">{r.subject_name}</div>
                        <div className="text-xs text-muted-foreground">{r.subject_email || r.subject_phone || "—"}</div>
                      </TableCell>
                      <TableCell>{statusBadge(r.status)}</TableCell>
                      <TableCell>{r.identity_verified ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Clock className="h-4 w-4 text-amber-500" />}</TableCell>
                      <TableCell className={new Date(r.due_by) < new Date() && !["fulfilled","rejected","withdrawn"].includes(r.status) ? "text-red-500" : ""}>
                        {format(new Date(r.due_by), "d MMM yyyy")}
                      </TableCell>
                      <TableCell className="text-xs">{format(new Date(r.created_at), "d MMM yyyy")}</TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {!r.identity_verified && r.status !== "fulfilled" && (
                            <Button size="sm" variant="outline" onClick={() => verifyIdentity(r.id)}>Verify ID</Button>
                          )}
                          {r.request_kind === "erasure" && r.status !== "fulfilled" && (
                            <Button size="sm" variant="destructive" onClick={() => executeErasure(r)}>Execute erasure</Button>
                          )}
                          {r.status !== "fulfilled" && r.status !== "rejected" && (
                            <>
                              <Button size="sm" variant="ghost" onClick={() => setStatus(r.id, "fulfilled", { fulfilled_at: new Date().toISOString() })}>Mark fulfilled</Button>
                              <Button size="sm" variant="ghost" onClick={() => {
                                const reason = prompt("Rejection reason?"); if (reason) setStatus(r.id, "rejected", { rejection_reason: reason });
                              }}>Reject</Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="policies">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Retention policies</CardTitle>
              <p className="text-xs text-muted-foreground">Global defaults align with AMLD5 Art. 40 (5-year AML) and GDPR Art. 5(1)(e). Override per record type below to create an organisation-scoped policy.</p>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Record type</TableHead><TableHead>Retention (days)</TableHead>
                  <TableHead>Disposition</TableHead><TableHead>Legal basis</TableHead><TableHead>Scope</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {policies.map(p => (
                    <TableRow key={p.id}>
                      <TableCell className="font-mono text-xs">{p.record_type}</TableCell>
                      <TableCell>
                        <Input type="number" className="w-24" defaultValue={p.retention_days}
                          onBlur={e => {
                            const v = parseInt(e.target.value);
                            if (v && v !== p.retention_days) updatePolicy(p, { retention_days: v });
                          }} />
                      </TableCell>
                      <TableCell>
                        <Select defaultValue={p.disposition} onValueChange={v => updatePolicy(p, { disposition: v })}>
                          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="redact">redact</SelectItem>
                            <SelectItem value="delete">delete</SelectItem>
                            <SelectItem value="archive">archive</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-xs">{p.legal_basis}</TableCell>
                      <TableCell>{p.organisation_id ? <Badge>Org override</Badge> : <Badge variant="outline">Global default</Badge>}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="erasure">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><FileText className="h-4 w-4" /> Proof-of-erasure log</CardTitle>
              <p className="text-xs text-muted-foreground">Immutable audit trail of every DSAR erasure and retention sweep action. Last 200 entries.</p>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader><TableRow>
                  <TableHead>When</TableHead><TableHead>Record</TableHead><TableHead>Fields</TableHead>
                  <TableHead>Disposition</TableHead><TableHead>Trigger</TableHead><TableHead>Legal basis</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {erasures.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-6">No erasure entries yet</TableCell></TableRow>}
                  {erasures.map(e => (
                    <TableRow key={e.id}>
                      <TableCell className="text-xs">{format(new Date(e.created_at), "d MMM yyyy HH:mm")}</TableCell>
                      <TableCell className="text-xs font-mono">{e.record_type}<br /><span className="text-muted-foreground">{e.record_id.slice(0,8)}</span></TableCell>
                      <TableCell className="text-xs">{(e.fields_redacted || []).join(", ") || "—"}</TableCell>
                      <TableCell><Badge variant="outline">{e.disposition}</Badge></TableCell>
                      <TableCell className="text-xs">{e.triggered_by}</TableCell>
                      <TableCell className="text-xs">{e.legal_basis || "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
