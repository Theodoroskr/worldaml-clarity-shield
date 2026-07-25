import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useOrganisation } from "@/hooks/useOrganisation";
import { runScreening } from "@/services/screeningProvider";
import { applyWhitelist } from "@/lib/suite/screeningWhitelist";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import {
  Building2, User, Plus, Loader2, ChevronRight, ChevronDown,
  Shield, AlertTriangle, Trash2, Pencil, Network, Search,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Customer { id: string; name: string; company_name: string | null; type: string | null; }
interface UboNode {
  id: string;
  customer_id: string;
  organisation_id: string | null;
  user_id: string;
  name: string;
  entity_type: string;
  parent_ubo_id: string | null;
  ownership_pct: number;
  control_pct: number | null;
  control_type: string;
  country: string | null;
  registration_number: string | null;
  dob: string | null;
  nationality: string | null;
  is_pep: boolean;
  is_verified: boolean;
  sanctions_status: string;
  notes: string | null;
  last_screened_at: string | null;
  last_screening_id: string | null;
}

const ENTITY_TYPES = ["individual", "company", "trust", "foundation", "other"];
const CONTROL_TYPES = ["ownership", "voting", "board", "beneficial", "signatory", "other"];
const SANCTIONS_STATUSES = [
  { v: "not_screened", label: "Not screened", tone: "muted" },
  { v: "clear", label: "Clear", tone: "emerald" },
  { v: "pep", label: "PEP", tone: "amber" },
  { v: "adverse_media", label: "Adverse media", tone: "amber" },
  { v: "potential_match", label: "Potential match", tone: "orange" },
  { v: "sanctions", label: "Sanctions hit", tone: "red" },
];

const statusBadge = (s: string) => {
  const tone = SANCTIONS_STATUSES.find(x => x.v === s)?.tone ?? "muted";
  const cls = {
    muted: "bg-muted text-muted-foreground",
    emerald: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
    amber: "bg-amber-500/15 text-amber-500 border-amber-500/30",
    orange: "bg-orange-500/15 text-orange-500 border-orange-500/30",
    red: "bg-red-500/15 text-red-500 border-red-500/30",
  }[tone];
  const label = SANCTIONS_STATUSES.find(x => x.v === s)?.label ?? s;
  return <Badge variant="outline" className={cn("text-[10px] border", cls)}>{label}</Badge>;
};

export default function SuiteUBO() {
  const { orgId, userId, canEdit, canManage, isLoading: orgLoading } = useOrganisation();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerId, setCustomerId] = useState<string>("");
  const [nodes, setNodes] = useState<UboNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<UboNode | null>(null);
  const [parentDefault, setParentDefault] = useState<string | null>(null);
  const [screeningId, setScreeningId] = useState<string | null>(null);

  useEffect(() => {
    if (!orgId) return;
    (async () => {
      const { data } = await supabase
        .from("suite_customers")
        .select("id,name,company_name,type")
        .eq("organisation_id", orgId)
        .order("name");
      setCustomers(data ?? []);
      if (data && data.length && !customerId) setCustomerId(data[0].id);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId]);

  const loadTree = async () => {
    if (!customerId) return;
    setLoading(true);
    const { data } = await supabase
      .from("suite_ubo")
      .select("*")
      .eq("customer_id", customerId)
      .order("created_at", { ascending: true });
    setNodes((data ?? []) as UboNode[]);
    setExpanded(new Set((data ?? []).map(d => d.id)));
    setLoading(false);
  };

  useEffect(() => { if (customerId) loadTree(); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId]);

  const roots = useMemo(() => nodes.filter(n => !n.parent_ubo_id), [nodes]);
  const childrenOf = (id: string) => nodes.filter(n => n.parent_ubo_id === id);

  // Aggregate effective ownership (chain multiplication)
  const effectiveOwnership = (nodeId: string): number => {
    let pct = 1;
    let cur = nodes.find(n => n.id === nodeId);
    while (cur) {
      pct *= (Number(cur.ownership_pct) || 0) / 100;
      if (!cur.parent_ubo_id) break;
      cur = nodes.find(n => n.id === cur!.parent_ubo_id);
    }
    return pct * 100;
  };

  const openCreate = (parentId: string | null) => {
    setEditing(null);
    setParentDefault(parentId);
    setDialogOpen(true);
  };
  const openEdit = (node: UboNode) => {
    setEditing(node);
    setParentDefault(node.parent_ubo_id);
    setDialogOpen(true);
  };

  const deleteNode = async (id: string) => {
    if (!confirm("Delete this ownership node and all descendants?")) return;
    const { error } = await supabase.from("suite_ubo").delete().eq("id", id);
    if (error) { toast({ title: "Delete failed", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Node deleted" });
    loadTree();
  };

  const screenNode = async (node: UboNode) => {
    setScreeningId(node.id);
    try {
      const res = await runScreening({ query: node.name, minConfidence: 40 });
      // Ignore hits already cleared as false positives for this customer
      const { live, suppressed } = await applyWhitelist(node.customer_id, res.results);
      const top = live[0];
      let newStatus = "clear";
      if (top) {
        if (top.confidence >= 85 && /OFAC|EU Sanctions|UN|HMT/.test(top.listType)) newStatus = "sanctions";
        else if (top.confidence >= 60 && /OFAC|EU|UN|HMT/.test(top.listType)) newStatus = "potential_match";
        else if (top.listType.startsWith("PEP")) newStatus = "pep";
        else if (top.listType === "Adverse Media") newStatus = "adverse_media";
      }
      if (suppressed.length > 0) {
        toast({ title: `${suppressed.length} known false positive(s) suppressed`, description: `Whitelisted matches for ${node.name} were ignored.` });
      }

      const { data: screening } = await supabase.from("suite_screenings").insert({
        user_id: userId!,
        organisation_id: orgId,
        customer_id: node.customer_id,
        screening_type: "ubo",
        result: newStatus === "clear" ? "no_match" : (newStatus === "sanctions" ? "confirmed_match" : "potential_match"),
        match_count: live.length,
      }).select("id").single();


      const { error } = await supabase.from("suite_ubo").update({
        sanctions_status: newStatus,
        last_screened_at: new Date().toISOString(),
        last_screening_id: screening?.id ?? null,
        is_pep: newStatus === "pep" ? true : node.is_pep,
      }).eq("id", node.id);
      if (error) throw error;

      toast({
        title: `Screening complete: ${newStatus}`,
        description: top ? `Top match: ${top.name} (${top.confidence}% · ${top.listType})` : "No matches found.",
        variant: newStatus === "sanctions" || newStatus === "potential_match" ? "destructive" : "default",
      });
      loadTree();
    } catch (e: any) {
      toast({ title: "Screening failed", description: e.message, variant: "destructive" });
    } finally {
      setScreeningId(null);
    }
  };

  const screenAll = async () => {
    for (const n of nodes) { await screenNode(n); }
  };

  const renderNode = (node: UboNode, depth: number): JSX.Element => {
    const kids = childrenOf(node.id);
    const isOpen = expanded.has(node.id);
    const eff = effectiveOwnership(node.id);
    return (
      <div key={node.id}>
        <div
          className={cn(
            "group flex items-center gap-2 py-2 pr-3 rounded-lg hover:bg-muted/40 transition-colors",
          )}
          style={{ paddingLeft: 8 + depth * 20 }}
        >
          <button
            onClick={() => {
              const s = new Set(expanded);
              s.has(node.id) ? s.delete(node.id) : s.add(node.id);
              setExpanded(s);
            }}
            className={cn("w-4 h-4 flex items-center justify-center text-muted-foreground", !kids.length && "invisible")}
          >
            {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>
          <div className={cn(
            "w-7 h-7 rounded-md flex items-center justify-center shrink-0",
            node.entity_type === "individual" ? "bg-primary/10 text-primary" : "bg-accent/15 text-accent-foreground",
          )}>
            {node.entity_type === "individual" ? <User className="w-3.5 h-3.5" /> : <Building2 className="w-3.5 h-3.5" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium truncate">{node.name}</span>
              {node.is_pep && <Badge variant="outline" className="text-[10px] bg-amber-500/15 text-amber-500 border-amber-500/30">PEP</Badge>}
              {statusBadge(node.sanctions_status)}
              {node.country && <span className="text-[10px] text-muted-foreground">{node.country}</span>}
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-3">
              <span>{node.ownership_pct}% {node.control_type}</span>
              {node.control_pct != null && <span>· {node.control_pct}% control</span>}
              {node.parent_ubo_id && <span>· {eff.toFixed(2)}% effective</span>}
              {node.registration_number && <span>· {node.registration_number}</span>}
            </div>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {canEdit && (
              <Button variant="ghost" size="sm" onClick={() => screenNode(node)} disabled={screeningId === node.id}>
                {screeningId === node.id
                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  : <Shield className="w-3.5 h-3.5" />}
              </Button>
            )}
            {canEdit && (
              <Button variant="ghost" size="sm" onClick={() => openCreate(node.id)} title="Add child">
                <Plus className="w-3.5 h-3.5" />
              </Button>
            )}
            {canEdit && (
              <Button variant="ghost" size="sm" onClick={() => openEdit(node)}>
                <Pencil className="w-3.5 h-3.5" />
              </Button>
            )}
            {canManage && (
              <Button variant="ghost" size="sm" onClick={() => deleteNode(node.id)}>
                <Trash2 className="w-3.5 h-3.5 text-destructive" />
              </Button>
            )}
          </div>
        </div>
        {isOpen && kids.map(k => renderNode(k, depth + 1))}
      </div>
    );
  };

  const stats = useMemo(() => {
    const total = nodes.length;
    const individuals = nodes.filter(n => n.entity_type === "individual").length;
    const companies = total - individuals;
    const flagged = nodes.filter(n => ["sanctions", "potential_match", "pep", "adverse_media"].includes(n.sanctions_status)).length;
    const beneficial = nodes.filter(n => !childrenOf(n.id).length && effectiveOwnership(n.id) >= 25).length;
    return { total, individuals, companies, flagged, beneficial };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes]);

  if (orgLoading) return <div className="p-8 text-sm text-muted-foreground">Loading…</div>;
  if (!orgId) return <div className="p-8 text-sm text-muted-foreground">No organisation.</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Network className="w-5 h-5 text-accent" />
            Ownership & Control
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Map UBOs, subsidiaries and control chains. Screen each node against sanctions & PEP lists.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={screenAll} disabled={!nodes.length || !!screeningId}>
            <Search className="w-3.5 h-3.5 mr-1" /> Screen all
          </Button>
          {canEdit && (
            <Button size="sm" onClick={() => openCreate(null)} disabled={!customerId}>
              <Plus className="w-3.5 h-3.5 mr-1" /> Add root
            </Button>
          )}
        </div>
      </div>

      <div className="flex items-end gap-3 mb-6">
        <div className="flex-1 max-w-md">
          <Label className="text-xs mb-1.5 block">Customer</Label>
          <Select value={customerId} onValueChange={setCustomerId}>
            <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
            <SelectContent>
              {customers.map(c => (
                <SelectItem key={c.id} value={c.id}>
                  {c.company_name || c.name} {c.type === "business" && "· Business"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {[
          { label: "Nodes", v: stats.total },
          { label: "Individuals", v: stats.individuals },
          { label: "Entities", v: stats.companies },
          { label: "≥25% beneficial", v: stats.beneficial, tone: "text-accent" },
          { label: "Flagged", v: stats.flagged, tone: stats.flagged ? "text-red-500" : "" },
        ].map(s => (
          <Card key={s.label} className="p-3">
            <div className="text-[11px] text-muted-foreground uppercase tracking-wider">{s.label}</div>
            <div className={cn("text-2xl font-bold mt-1", s.tone)}>{s.v}</div>
          </Card>
        ))}
      </div>

      <Card className="divide-y divide-border">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="text-sm font-semibold">Ownership tree</div>
          {loading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
        </div>
        <div className="py-2">
          {!nodes.length && !loading && (
            <div className="px-6 py-10 text-center text-sm text-muted-foreground">
              <AlertTriangle className="w-6 h-6 mx-auto mb-2 opacity-50" />
              No ownership nodes recorded for this customer yet.
              {canEdit && <div className="mt-3"><Button size="sm" onClick={() => openCreate(null)}>Add first UBO</Button></div>}
            </div>
          )}
          {roots.map(r => renderNode(r, 0))}
        </div>
      </Card>

      <UboDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editing={editing}
        parentId={parentDefault}
        customerId={customerId}
        orgId={orgId}
        userId={userId!}
        nodes={nodes}
        onSaved={() => { setDialogOpen(false); loadTree(); }}
      />
    </div>
  );
}

/* ─────────────────────────── Dialog ─────────────────────────── */

function UboDialog({
  open, onOpenChange, editing, parentId, customerId, orgId, userId, nodes, onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing: UboNode | null;
  parentId: string | null;
  customerId: string;
  orgId: string;
  userId: string;
  nodes: UboNode[];
  onSaved: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Partial<UboNode>>({});

  useEffect(() => {
    if (!open) return;
    setForm(editing ?? {
      name: "",
      entity_type: "individual",
      control_type: "ownership",
      ownership_pct: 0,
      control_pct: null,
      parent_ubo_id: parentId,
      country: "",
      registration_number: "",
      dob: null,
      nationality: "",
      is_pep: false,
      is_verified: false,
      sanctions_status: "not_screened",
      notes: "",
    });
  }, [open, editing, parentId]);

  const save = async () => {
    if (!form.name?.trim()) { toast({ title: "Name is required", variant: "destructive" }); return; }
    setSaving(true);
    const payload: any = {
      name: form.name!.trim(),
      entity_type: form.entity_type ?? "individual",
      control_type: form.control_type ?? "ownership",
      ownership_pct: Number(form.ownership_pct ?? 0),
      control_pct: form.control_pct === null || form.control_pct === undefined || (form.control_pct as any) === "" ? null : Number(form.control_pct),
      parent_ubo_id: form.parent_ubo_id ?? null,
      country: form.country || null,
      registration_number: form.registration_number || null,
      dob: form.dob || null,
      nationality: form.nationality || null,
      is_pep: !!form.is_pep,
      is_verified: !!form.is_verified,
      notes: form.notes || null,
    };
    let error;
    if (editing) {
      ({ error } = await supabase.from("suite_ubo").update(payload).eq("id", editing.id));
    } else {
      ({ error } = await supabase.from("suite_ubo").insert({
        ...payload,
        customer_id: customerId,
        organisation_id: orgId,
        user_id: userId,
      }));
    }
    setSaving(false);
    if (error) { toast({ title: "Save failed", description: error.message, variant: "destructive" }); return; }
    toast({ title: editing ? "Node updated" : "Node added" });
    onSaved();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit ownership node" : "Add ownership node"}</DialogTitle>
          <DialogDescription>
            Capture the person or entity, their ownership stake and how they exert control.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Type</Label>
              <Select value={form.entity_type ?? "individual"} onValueChange={v => setForm(f => ({ ...f, entity_type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ENTITY_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Parent node</Label>
              <Select
                value={form.parent_ubo_id ?? "__root__"}
                onValueChange={v => setForm(f => ({ ...f, parent_ubo_id: v === "__root__" ? null : v }))}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__root__">— Root (owns customer) —</SelectItem>
                  {nodes.filter(n => n.id !== editing?.id).map(n => (
                    <SelectItem key={n.id} value={n.id}>{n.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="text-xs">Name</Label>
            <Input value={form.name ?? ""} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-xs">Ownership %</Label>
              <Input type="number" min={0} max={100} step="0.01"
                value={form.ownership_pct ?? 0}
                onChange={e => setForm(f => ({ ...f, ownership_pct: Number(e.target.value) }))} />
            </div>
            <div>
              <Label className="text-xs">Control %</Label>
              <Input type="number" min={0} max={100} step="0.01"
                value={form.control_pct ?? ""}
                onChange={e => setForm(f => ({ ...f, control_pct: e.target.value as any }))} />
            </div>
            <div>
              <Label className="text-xs">Control type</Label>
              <Select value={form.control_type ?? "ownership"} onValueChange={v => setForm(f => ({ ...f, control_type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CONTROL_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Country / jurisdiction</Label>
              <Input maxLength={2} placeholder="ISO2 e.g. GB"
                value={form.country ?? ""}
                onChange={e => setForm(f => ({ ...f, country: e.target.value.toUpperCase() }))} />
            </div>
            <div>
              <Label className="text-xs">
                {form.entity_type === "individual" ? "Nationality" : "Registration #"}
              </Label>
              <Input
                value={(form.entity_type === "individual" ? form.nationality : form.registration_number) ?? ""}
                onChange={e => setForm(f => form.entity_type === "individual"
                  ? { ...f, nationality: e.target.value }
                  : { ...f, registration_number: e.target.value })}
              />
            </div>
          </div>
          {form.entity_type === "individual" && (
            <div>
              <Label className="text-xs">Date of birth</Label>
              <Input type="date" value={form.dob ?? ""} onChange={e => setForm(f => ({ ...f, dob: e.target.value }))} />
            </div>
          )}
          <div>
            <Label className="text-xs">Notes</Label>
            <Textarea rows={2} value={form.notes ?? ""} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          </div>
          <div className="flex gap-4 text-xs">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={!!form.is_pep} onChange={e => setForm(f => ({ ...f, is_pep: e.target.checked }))} />
              PEP
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={!!form.is_verified} onChange={e => setForm(f => ({ ...f, is_verified: e.target.checked }))} />
              Verified
            </label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save} disabled={saving}>
            {saving && <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />}
            {editing ? "Save" : "Add node"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
