// WorldAML admin: grant modules to client companies, manage the Suite module
// catalogue, decide module requests and review the activity log.
// All writes go through admin-only RPCs that also write the audit trail.
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Boxes, Loader2, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type ModuleKey = "screening" | "kyc_kyb" | "rcm";
type Status = "active" | "trial" | "suspended" | "cancelled";
type Org = { id: string; name: string | null };
type Access = { organisation_id: string; module: ModuleKey; status: Status; enabled: boolean; ends_at: string | null };
type Catalog = {
  module: ModuleKey; name: string; description: string; status: "live" | "coming_soon" | "hidden";
  acquisition: "request" | "checkout"; price_label: string | null; stripe_price_id: string | null;
  default_trial_days: number; sort_order: number;
};
type Req = { id: string; organisation_id: string; module: ModuleKey; note: string | null; status: string; created_at: string; decision_note: string | null };
type Audit = { id: string; organisation_id: string | null; module: ModuleKey | null; action: string; before: any; after: any; created_at: string; actor_id: string };

const STATUS_VARIANT: Record<Status, "default" | "secondary" | "outline" | "destructive"> = {
  active: "default", trial: "secondary", suspended: "outline", cancelled: "destructive",
};
const ACTION_LABEL: Record<string, string> = {
  grant_change: "Grant changed", catalog_change: "Catalogue changed",
  request_approved: "Request approved", request_declined: "Request declined",
};
const DAY = 86400000;

export default function AdminSuiteModules() {
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [access, setAccess] = useState<Access[]>([]);
  const [catalog, setCatalog] = useState<Catalog[]>([]);
  const [requests, setRequests] = useState<Req[]>([]);
  const [audit, setAudit] = useState<Audit[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const [o, a, c, r, l] = await Promise.all([
      supabase.from("suite_organizations").select("id, name").order("name"),
      supabase.from("suite_module_access").select("organisation_id, module, status, enabled, ends_at"),
      supabase.from("suite_module_catalog").select("*").order("sort_order"),
      supabase.from("suite_module_requests").select("*").order("created_at", { ascending: false }).limit(200),
      supabase.from("admin_module_audit").select("*").order("created_at", { ascending: false }).limit(300),
    ]);
    if (o.error || a.error || c.error) toast.error("Could not load modules");
    setOrgs((o.data ?? []) as Org[]);
    setAccess((a.data ?? []) as Access[]);
    setCatalog((c.data ?? []) as Catalog[]);
    setRequests((r.data ?? []) as Req[]);
    setAudit((l.data ?? []) as Audit[]);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const orgName = (id: string | null) => (id ? orgs.find((o) => o.id === id)?.name || id.slice(0, 8) : "—");
  const modName = (k: string | null) => catalog.find((c) => c.module === k)?.name ?? k ?? "—";
  const pending = requests.filter((r) => r.status === "pending").length;

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-5 w-5 animate-spin" /></div>;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Boxes className="h-6 w-6" /> Suite Modules</h1>
        <p className="text-sm text-muted-foreground">
          Grant modules to client companies and manage which modules exist in the Suite. Each company's own Suite admin then switches them on and assigns them to team members.
        </p>
      </div>
      <Tabs defaultValue="companies">
        <TabsList>
          <TabsTrigger value="companies">Companies</TabsTrigger>
          <TabsTrigger value="catalogue">Catalogue</TabsTrigger>
          <TabsTrigger value="requests">Requests{pending > 0 && <Badge className="ml-2" variant="secondary">{pending}</Badge>}</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>
        <TabsContent value="companies">
          <Companies orgs={orgs} access={access} catalog={catalog} audit={audit} modName={modName} reload={load} />
        </TabsContent>
        <TabsContent value="catalogue"><CatalogueTab catalog={catalog} reload={load} /></TabsContent>
        <TabsContent value="requests"><RequestsTab requests={requests} orgName={orgName} modName={modName} catalog={catalog} reload={load} /></TabsContent>
        <TabsContent value="activity"><AuditTable rows={audit} orgName={orgName} modName={modName} /></TabsContent>
      </Tabs>
    </div>
  );
}

function endsAt(action: string, trialDays: number, endDate: string) {
  if (action === "trial") return new Date(Date.now() + trialDays * DAY).toISOString();
  if (action === "active" && endDate) return new Date(endDate + "T23:59:59").toISOString();
  return null;
}

function Companies({ orgs, access, catalog, audit, modName, reload }: {
  orgs: Org[]; access: Access[]; catalog: Catalog[]; audit: Audit[]; modName: (k: string | null) => string; reload: () => void;
}) {
  const [q, setQ] = useState("");
  const [fModule, setFModule] = useState<string>("all");
  const [fStatus, setFStatus] = useState<string>("all");
  const [trialDays, setTrialDays] = useState("14");
  const [endDate, setEndDate] = useState("");
  const [saving, setSaving] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [bulkModule, setBulkModule] = useState<ModuleKey>("screening");
  const [detail, setDetail] = useState<Org | null>(null);
  const days = Math.max(1, Math.min(90, parseInt(trialDays) || 14));

  const byOrg = useMemo(() => {
    const m: Record<string, Partial<Record<ModuleKey, Access>>> = {};
    access.forEach((r) => { (m[r.organisation_id] ||= {})[r.module] = r; });
    return m;
  }, [access]);

  const matchesStatus = (row: Access | undefined) => {
    if (fStatus === "all") return true;
    if (fStatus === "none") return !row;
    if (fStatus === "ending") return !!row?.ends_at && new Date(row.ends_at).getTime() - Date.now() < 14 * DAY && new Date(row.ends_at).getTime() > Date.now();
    return row?.status === fStatus;
  };
  const filtered = orgs.filter((o) => {
    if (!(o.name ?? o.id).toLowerCase().includes(q.toLowerCase())) return false;
    const mods = fModule === "all" ? catalog.map((c) => c.module) : [fModule as ModuleKey];
    return mods.some((m) => matchesStatus(byOrg[o.id]?.[m]));
  });

  const setModule = async (orgId: string, module: ModuleKey, action: string) => {
    const key = `${orgId}:${module}`;
    setSaving(key);
    const { error } = await supabase.rpc("admin_set_org_module", {
      _org: orgId, _module: module, _status: action as Status, _ends_at: endsAt(action, days, endDate),
    });
    setSaving(null);
    if (error) toast.error(error.message); else { toast.success("Module updated"); reload(); }
  };

  const bulk = async (action: string) => {
    if (!selected.length) return;
    setSaving("bulk");
    const { data, error } = await supabase.rpc("admin_bulk_set_org_module", {
      _orgs: selected, _module: bulkModule, _status: action as Status, _ends_at: endsAt(action, days, endDate),
    });
    setSaving(null);
    if (error) toast.error(error.message);
    else { toast.success(`Updated ${data} companies`); setSelected([]); reload(); }
  };

  const allChecked = filtered.length > 0 && filtered.every((o) => selected.includes(o.id));

  return (
    <Card>
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="text-base">Client companies ({filtered.length})</CardTitle>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input className="pl-8 w-64 h-9" placeholder="Search company" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <Select value={fModule} onValueChange={setFModule}>
            <SelectTrigger className="h-8 w-44 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All modules</SelectItem>
              {catalog.map((c) => <SelectItem key={c.module} value={c.module}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={fStatus} onValueChange={setFStatus}>
            <SelectTrigger className="h-8 w-40 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="trial">Trial</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
              <SelectItem value="cancelled">Ended</SelectItem>
              <SelectItem value="ending">Ending in 14 days</SelectItem>
              <SelectItem value="none">Not granted</SelectItem>
            </SelectContent>
          </Select>
          <label className="flex items-center gap-2">Trial length (days)
            <Input className="w-16 h-8" value={trialDays} onChange={(e) => setTrialDays(e.target.value.replace(/\D/g, ""))} />
          </label>
          <label className="flex items-center gap-2">End date for grants (optional)
            <Input type="date" className="w-40 h-8" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </label>
        </div>
        {selected.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-muted/40 p-2 text-sm">
            <span>{selected.length} selected</span>
            <Select value={bulkModule} onValueChange={(v) => setBulkModule(v as ModuleKey)}>
              <SelectTrigger className="h-8 w-48 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>{catalog.map((c) => <SelectItem key={c.module} value={c.module}>{c.name}</SelectItem>)}</SelectContent>
            </Select>
            <Button size="sm" disabled={saving === "bulk"} onClick={() => bulk("active")}>Grant</Button>
            <Button size="sm" variant="secondary" disabled={saving === "bulk"} onClick={() => bulk("trial")}>Trial {days} days</Button>
            <Button size="sm" variant="outline" disabled={saving === "bulk"} onClick={() => bulk("suspended")}>Suspend</Button>
            <Button size="sm" variant="ghost" onClick={() => setSelected([])}>Clear</Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8">
                <Checkbox checked={allChecked} onCheckedChange={(v) => setSelected(v ? filtered.map((o) => o.id) : [])} aria-label="Select all" />
              </TableHead>
              <TableHead>Company</TableHead>
              {catalog.map((m) => (
                <TableHead key={m.module}>{m.name}{m.status !== "live" && <span className="ml-1 text-xs text-muted-foreground">({m.status === "hidden" ? "hidden" : "coming soon"})</span>}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((o) => (
              <TableRow key={o.id}>
                <TableCell>
                  <Checkbox checked={selected.includes(o.id)} onCheckedChange={(v) => setSelected((s) => v ? [...s, o.id] : s.filter((x) => x !== o.id))} aria-label={`Select ${o.name}`} />
                </TableCell>
                <TableCell className="font-medium">
                  <button className="text-left hover:underline" onClick={() => setDetail(o)}>{o.name || o.id.slice(0, 8)}</button>
                </TableCell>
                {catalog.map((m) => {
                  const row = byOrg[o.id]?.[m.module];
                  const key = `${o.id}:${m.module}`;
                  return (
                    <TableCell key={m.module}>
                      <div className="flex flex-col gap-1.5 min-w-[150px]">
                        <div className="flex items-center gap-2">
                          {row ? <Badge variant={STATUS_VARIANT[row.status]}>{row.status}</Badge> : <span className="text-xs text-muted-foreground">Not granted</span>}
                          {row && !row.enabled && <span className="text-xs text-muted-foreground">off by client</span>}
                        </div>
                        {row?.ends_at && <span className="text-xs text-muted-foreground">ends {new Date(row.ends_at).toLocaleDateString()}</span>}
                        <Select value="" disabled={saving === key} onValueChange={(v) => setModule(o.id, m.module, v)}>
                          <SelectTrigger className="h-8 text-xs"><SelectValue placeholder={saving === key ? "Saving…" : "Change…"} /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Grant{endDate ? ` until ${endDate}` : " (active)"}</SelectItem>
                            <SelectItem value="trial">Grant trial ({days} days)</SelectItem>
                            <SelectItem value="suspended">Suspend</SelectItem>
                            <SelectItem value="cancelled">End access</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <Dialog open={!!detail} onOpenChange={(v) => !v && setDetail(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{detail?.name}</DialogTitle></DialogHeader>
          {detail && (
            <div className="space-y-4">
              <div className="space-y-2">
                {catalog.map((m) => {
                  const row = byOrg[detail.id]?.[m.module];
                  return (
                    <div key={m.module} className="flex items-center justify-between rounded border border-border p-2 text-sm">
                      <span>{m.name}</span>
                      <span className="flex items-center gap-2 text-xs text-muted-foreground">
                        {row ? <Badge variant={STATUS_VARIANT[row.status]}>{row.status}</Badge> : "Not granted"}
                        {row && (row.enabled ? "on" : "off by client")}
                        {row?.ends_at && `· ends ${new Date(row.ends_at).toLocaleDateString()}`}
                      </span>
                    </div>
                  );
                })}
              </div>
              <h3 className="text-sm font-semibold">History</h3>
              <AuditTable rows={audit.filter((a) => a.organisation_id === detail.id)} orgName={() => detail.name ?? ""} modName={modName} compact />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function CatalogueTab({ catalog, reload }: { catalog: Catalog[]; reload: () => void }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {catalog.map((c) => <CatalogCard key={c.module} item={c} reload={reload} />)}
    </div>
  );
}

function CatalogCard({ item, reload }: { item: Catalog; reload: () => void }) {
  const [f, setF] = useState(item);
  const [busy, setBusy] = useState(false);
  useEffect(() => setF(item), [item]);
  const save = async () => {
    if (!f.name.trim()) { toast.error("Name is required"); return; }
    setBusy(true);
    const { error } = await supabase.rpc("admin_update_module_catalog", {
      _module: f.module, _name: f.name.trim(), _description: f.description, _status: f.status,
      _acquisition: f.acquisition, _price_label: f.price_label ?? "", _stripe_price_id: f.stripe_price_id ?? "",
      _default_trial_days: Math.max(1, Math.min(90, Number(f.default_trial_days) || 14)),
    });
    setBusy(false);
    if (error) toast.error(error.message); else { toast.success("Catalogue saved"); reload(); }
  };
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">{item.name}</CardTitle></CardHeader>
      <CardContent className="space-y-3 text-sm">
        <label className="block space-y-1"><span className="text-xs text-muted-foreground">Name shown to clients</span>
          <Input value={f.name} maxLength={80} onChange={(e) => setF({ ...f, name: e.target.value })} /></label>
        <label className="block space-y-1"><span className="text-xs text-muted-foreground">Description</span>
          <Textarea value={f.description} maxLength={300} onChange={(e) => setF({ ...f, description: e.target.value })} /></label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block space-y-1"><span className="text-xs text-muted-foreground">Availability</span>
            <Select value={f.status} onValueChange={(v) => setF({ ...f, status: v as Catalog["status"] })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="live">Live</SelectItem>
                <SelectItem value="coming_soon">Coming soon</SelectItem>
                <SelectItem value="hidden">Hidden</SelectItem>
              </SelectContent>
            </Select></label>
          <label className="block space-y-1"><span className="text-xs text-muted-foreground">How clients get it</span>
            <Select value={f.acquisition} onValueChange={(v) => setF({ ...f, acquisition: v as Catalog["acquisition"] })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="request">Request access</SelectItem>
                <SelectItem value="checkout">Buy now</SelectItem>
              </SelectContent>
            </Select></label>
          <label className="block space-y-1"><span className="text-xs text-muted-foreground">Price shown (e.g. €149 / month)</span>
            <Input value={f.price_label ?? ""} maxLength={40} onChange={(e) => setF({ ...f, price_label: e.target.value })} /></label>
          <label className="block space-y-1"><span className="text-xs text-muted-foreground">Default trial (days)</span>
            <Input value={String(f.default_trial_days)} onChange={(e) => setF({ ...f, default_trial_days: Number(e.target.value.replace(/\D/g, "")) || 0 })} /></label>
        </div>
        {f.acquisition === "checkout" && (
          <label className="block space-y-1"><span className="text-xs text-muted-foreground">Stripe price ID</span>
            <Input value={f.stripe_price_id ?? ""} placeholder="price_…" onChange={(e) => setF({ ...f, stripe_price_id: e.target.value })} /></label>
        )}
        {f.status === "hidden" && <p className="text-xs text-muted-foreground">Hidden modules disappear from every client's menu and Settings, even where granted. Their data is kept.</p>}
        <Button size="sm" onClick={save} disabled={busy}>{busy ? "Saving…" : "Save"}</Button>
      </CardContent>
    </Card>
  );
}

function RequestsTab({ requests, orgName, modName, catalog, reload }: {
  requests: Req[]; orgName: (id: string | null) => string; modName: (k: string | null) => string; catalog: Catalog[]; reload: () => void;
}) {
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const decide = async (r: Req, approve: boolean, trial: boolean) => {
    setBusy(r.id);
    const days = catalog.find((c) => c.module === r.module)?.default_trial_days ?? 14;
    const { error } = await supabase.rpc("admin_decide_module_request", {
      _id: r.id, _approve: approve, _status: trial ? "trial" : "active",
      _ends_at: trial ? new Date(Date.now() + days * DAY).toISOString() : null, _note: notes[r.id] || null,
    });
    setBusy(null);
    if (error) toast.error(error.message); else { toast.success(approve ? "Request approved" : "Request declined"); reload(); }
  };
  if (!requests.length) return <p className="text-sm text-muted-foreground py-6">No module requests yet.</p>;
  return (
    <Card><CardContent className="pt-6">
      <Table>
        <TableHeader><TableRow>
          <TableHead>Company</TableHead><TableHead>Module</TableHead><TableHead>Note</TableHead><TableHead>Sent</TableHead><TableHead>Decision</TableHead>
        </TableRow></TableHeader>
        <TableBody>
          {requests.map((r) => (
            <TableRow key={r.id}>
              <TableCell className="font-medium">{orgName(r.organisation_id)}</TableCell>
              <TableCell>{modName(r.module)}</TableCell>
              <TableCell className="max-w-xs text-xs text-muted-foreground">{r.note || "—"}</TableCell>
              <TableCell className="text-xs">{new Date(r.created_at).toLocaleDateString()}</TableCell>
              <TableCell>
                {r.status === "pending" ? (
                  <div className="flex flex-col gap-2 min-w-[260px]">
                    <Input className="h-8 text-xs" placeholder="Note to client (optional)" value={notes[r.id] ?? ""} onChange={(e) => setNotes({ ...notes, [r.id]: e.target.value })} />
                    <div className="flex gap-2">
                      <Button size="sm" disabled={busy === r.id} onClick={() => decide(r, true, false)}>Approve</Button>
                      <Button size="sm" variant="secondary" disabled={busy === r.id} onClick={() => decide(r, true, true)}>Approve as trial</Button>
                      <Button size="sm" variant="outline" disabled={busy === r.id} onClick={() => decide(r, false, false)}>Decline</Button>
                    </div>
                  </div>
                ) : (
                  <span className="text-xs"><Badge variant={r.status === "approved" ? "default" : "outline"}>{r.status}</Badge> {r.decision_note}</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CardContent></Card>
  );
}

function describe(a: Audit) {
  const s = (v: any) => (v ? [v.status, v.ends_at ? `until ${new Date(v.ends_at).toLocaleDateString()}` : ""].filter(Boolean).join(" ") : "none");
  if (a.action === "grant_change") return `${s(a.before)} → ${s(a.after)}`;
  if (a.action === "catalog_change") return `availability ${a.before?.status ?? "—"} → ${a.after?.status ?? "—"}`;
  return a.after?.note ?? "";
}

function AuditTable({ rows, orgName, modName, compact }: {
  rows: Audit[]; orgName: (id: string | null) => string; modName: (k: string | null) => string; compact?: boolean;
}) {
  if (!rows.length) return <p className="text-sm text-muted-foreground py-6">No activity yet.</p>;
  const table = (
    <Table>
      <TableHeader><TableRow>
        <TableHead>When</TableHead>{!compact && <TableHead>Company</TableHead>}<TableHead>Module</TableHead><TableHead>Action</TableHead><TableHead>Change</TableHead>
      </TableRow></TableHeader>
      <TableBody>
        {rows.map((a) => (
          <TableRow key={a.id}>
            <TableCell className="text-xs whitespace-nowrap">{new Date(a.created_at).toLocaleString()}</TableCell>
            {!compact && <TableCell>{a.organisation_id ? orgName(a.organisation_id) : "All companies"}</TableCell>}
            <TableCell>{modName(a.module)}</TableCell>
            <TableCell>{ACTION_LABEL[a.action] ?? a.action}</TableCell>
            <TableCell className="text-xs text-muted-foreground">{describe(a)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
  return compact ? <div className="max-h-72 overflow-auto">{table}</div> : <Card><CardContent className="pt-6">{table}</CardContent></Card>;
}
