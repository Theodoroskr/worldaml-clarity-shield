import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Briefcase, Building2, CheckCircle2, ChevronDown, ChevronRight, Loader2,
  MoreHorizontal, RefreshCw, Search, ShieldCheck, Users, XCircle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const PRODUCTS = [
  { key: "screening", label: "Screening & Monitoring", colour: "bg-sky-500/70" },
  { key: "suite", label: "Compliance Suite", colour: "bg-violet-500/70" },
  { key: "academy", label: "WorldAML Academy", colour: "bg-emerald-500/70" },
] as const;

const PRODUCT_STATUS = [
  { value: "trial", label: "Trial" },
  { value: "active", label: "Active" },
  { value: "suspended", label: "Suspended" },
  { value: "cancelled", label: "Cancelled" },
];

const SUITE_MODULES = [
  { key: "kyc_kyb", label: "KYC / KYB Onboarding" },
  { key: "rcm", label: "Regulatory Change Management" },
];

type ProductRow = {
  product: string;
  plan: string | null;
  status: string;
  seats: number;
  seats_used: number;
  current_period_end: string | null;
};

type ModuleRow = {
  module: string;
  status: string;
  seats: number;
  seats_used: number;
};

type ClientRow = {
  organisation_id: string;
  organisation_name: string | null;
  country: string | null;
  industry: string | null;
  subscription_tier: string | null;
  products: ProductRow[];
  suite_modules: ModuleRow[];
  member_count: number;
  last_activity: string | null;
};

const fmtDate = (v: string | null | undefined) =>
  v ? new Date(v).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" }) : "—";

function StatusBadge({ status }: { status: string | null }) {
  const s = String(status ?? "unknown");
  const map: Record<string, string> = {
    active: "bg-emerald-50 text-emerald-700 border-emerald-200",
    trial: "bg-sky-50 text-sky-700 border-sky-200",
    suspended: "bg-amber-50 text-amber-700 border-amber-200",
    cancelled: "bg-slate-100 text-slate-600 border-slate-200",
  };
  return (
    <Badge variant="outline" className={map[s] ?? "bg-muted text-muted-foreground"}>
      {s.replace(/_/g, " ")}
    </Badge>
  );
}

function ProductBadge({ product }: { product: string }) {
  const p = PRODUCTS.find((x) => x.key === product);
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium">
      <span className={`w-2 h-2 rounded-full ${p?.colour ?? "bg-muted"}`} />
      {p?.label ?? product}
    </span>
  );
}

function Kpi({ icon: Icon, label, value, tone }: { icon: any; label: string; value: number; tone: string }) {
  return (
    <Card className="overflow-hidden">
      <div className={`h-1 ${tone}`} />
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Icon className="h-3.5 w-3.5" /> {label}
        </div>
        <div className="mt-1 text-2xl font-semibold">{value ?? 0}</div>
      </CardContent>
    </Card>
  );
}

export default function AdminClientAccess() {
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [editRow, setEditRow] = useState<{ client: ClientRow; product: ProductRow } | null>(null);
  const [editStatus, setEditStatus] = useState("active");
  const [editPlan, setEditPlan] = useState("");
  const [editSeats, setEditSeats] = useState<number | "">("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    const { data, error } = await supabase.rpc("admin_client_access_overview" as never);
    if (error) toast.error(error.message);
    else setClients((data as unknown as ClientRow[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const term = q.trim().toLowerCase();
  const filtered = useMemo(
    () => clients.filter((c) =>
      !term
      || (c.organisation_name ?? "").toLowerCase().includes(term)
      || (c.country ?? "").toLowerCase().includes(term)
      || (c.industry ?? "").toLowerCase().includes(term)
      || c.products.some((p) => p.product.toLowerCase().includes(term) || (p.plan ?? "").toLowerCase().includes(term))),
    [clients, term]
  );

  const totals = useMemo(() => {
    const activeOrgs = clients.filter((c) => c.products.some((p) => p.status === "active" || p.status === "trial")).length;
    const screening = clients.filter((c) => c.products.some((p) => p.product === "screening" && (p.status === "active" || p.status === "trial"))).length;
    const suite = clients.filter((c) => c.products.some((p) => p.product === "suite" && (p.status === "active" || p.status === "trial"))).length;
    const academy = clients.filter((c) => c.products.some((p) => p.product === "academy" && (p.status === "active" || p.status === "trial"))).length;
    const totalMembers = clients.reduce((sum, c) => sum + (c.member_count ?? 0), 0);
    return { activeOrgs, screening, suite, academy, totalMembers };
  }, [clients]);

  const openEdit = (client: ClientRow, product: ProductRow) => {
    setEditRow({ client, product });
    setEditStatus(product.status);
    setEditPlan(product.plan ?? "");
    setEditSeats(product.seats ?? 1);
  };

  const saveEdit = async () => {
    if (!editRow) return;
    setSaving(true);
    const { error } = await supabase.rpc("admin_set_product_access" as never, {
      _organisation_id: editRow.client.organisation_id,
      _product: editRow.product.product,
      _status: editStatus,
      _plan: editPlan || null,
      _seats: typeof editSeats === "number" ? editSeats : null,
    } as never);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Product access updated");
    setEditRow(null);
    void load(true);
  };

  const toggleExpanded = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" /> Clients &amp; Access
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Unified view of product access, modules and seats across all client organisations.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search clients…"
              className="h-9 pl-8 w-56"
            />
          </div>
          <Button variant="outline" size="sm" className="h-9" onClick={() => load()} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Kpi icon={Building2} label="Active clients" value={totals.activeOrgs} tone="bg-primary/70" />
        <Kpi icon={ShieldCheck} label="Screening clients" value={totals.screening} tone="bg-sky-500/70" />
        <Kpi icon={CheckCircle2} label="Suite clients" value={totals.suite} tone="bg-violet-500/70" />
        <Kpi icon={Users} label="Academy clients" value={totals.academy} tone="bg-emerald-500/70" />
        <Kpi icon={Users} label="Total members" value={totals.totalMembers} tone="bg-amber-500/70" />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Client organisations</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8" />
                <TableHead>Organisation</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Suite modules</TableHead>
                <TableHead>Members</TableHead>
                <TableHead>Last activity</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && !clients.length ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    <Loader2 className="inline h-4 w-4 animate-spin mr-2" /> Loading clients…
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-8">
                    No client organisations found.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((c) => (
                  <>
                    <TableRow key={c.organisation_id} className="group">
                      <TableCell>
                        <button
                          onClick={() => toggleExpanded(c.organisation_id)}
                          className="p-1 rounded hover:bg-muted"
                        >
                          {expanded[c.organisation_id] ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          )}
                        </button>
                      </TableCell>
                      <TableCell className="font-medium">
                        {c.organisation_name ?? "Unknown"}
                        <div className="text-xs text-muted-foreground">
                          {[c.country, c.industry, c.subscription_tier].filter(Boolean).join(" · ")}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          {c.products.length === 0 && <span className="text-muted-foreground text-sm">—</span>}
                          {c.products.map((p) => (
                            <Badge key={p.product} variant="outline" className="font-normal">
                              <ProductBadge product={p.product} />
                              <span className="ml-1.5 capitalize">{p.status}</span>
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          {c.suite_modules.length === 0 && <span className="text-muted-foreground text-sm">—</span>}
                          {c.suite_modules.map((m) => (
                            <Badge key={m.module} variant="secondary" className="font-normal text-xs">
                              {SUITE_MODULES.find((x) => x.key === m.module)?.label ?? m.module}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>{c.member_count}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{fmtDate(c.last_activity)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {c.products.map((p) => (
                              <DropdownMenuItem key={p.product} onClick={() => openEdit(c, p)}>
                                Edit {PRODUCTS.find((x) => x.key === p.product)?.label ?? p.product}
                              </DropdownMenuItem>
                            ))}
                            {!c.products.some((p) => p.product === "screening") && (
                              <DropdownMenuItem onClick={() => openEdit(c, { product: "screening", status: "trial", plan: "", seats: 1, seats_used: 0, current_period_end: null })}>
                                Add Screening access
                              </DropdownMenuItem>
                            )}
                            {!c.products.some((p) => p.product === "suite") && (
                              <DropdownMenuItem onClick={() => openEdit(c, { product: "suite", status: "trial", plan: "", seats: 1, seats_used: 0, current_period_end: null })}>
                                Add Suite access
                              </DropdownMenuItem>
                            )}
                            {!c.products.some((p) => p.product === "academy") && (
                              <DropdownMenuItem onClick={() => openEdit(c, { product: "academy", status: "trial", plan: "", seats: 1, seats_used: 0, current_period_end: null })}>
                                Add Academy access
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>

                    {expanded[c.organisation_id] && (
                      <TableRow className="bg-muted/30">
                        <TableCell colSpan={7} className="py-3">
                          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {PRODUCTS.map((prod) => {
                              const p = c.products.find((x) => x.product === prod.key);
                              return (
                                <Card key={prod.key} className="overflow-hidden">
                                  <div className={`h-1 ${prod.colour}`} />
                                  <CardContent className="p-3 space-y-2">
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm font-medium">{prod.label}</span>
                                      {p ? <StatusBadge status={p.status} /> : <span className="text-xs text-muted-foreground">Not enabled</span>}
                                    </div>
                                    {p && (
                                      <>
                                        <div className="text-xs text-muted-foreground">
                                          Plan: <span className="text-foreground">{p.plan ?? "—"}</span>
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                          Seats: <span className="text-foreground">{p.seats_used} / {p.seats}</span>
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                          Renews: <span className="text-foreground">{fmtDate(p.current_period_end)}</span>
                                        </div>
                                      </>
                                    )}
                                  </CardContent>
                                </Card>
                              );
                            })}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!editRow} onOpenChange={(open) => !open && setEditRow(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit product access</DialogTitle>
            <DialogDescription>
              {editRow?.client.organisation_name} — {PRODUCTS.find((p) => p.key === editRow?.product.product)?.label}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="status">Status</Label>
              <Select value={editStatus} onValueChange={setEditStatus}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRODUCT_STATUS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="plan">Plan</Label>
              <Input id="plan" value={editPlan} onChange={(e) => setEditPlan(e.target.value)} placeholder="e.g. professional" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="seats">Seats</Label>
              <Input
                id="seats"
                type="number"
                min={1}
                value={editSeats}
                onChange={(e) => setEditSeats(e.target.value === "" ? "" : parseInt(e.target.value, 10))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditRow(null)} disabled={saving}>Cancel</Button>
            <Button onClick={saveEdit} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
