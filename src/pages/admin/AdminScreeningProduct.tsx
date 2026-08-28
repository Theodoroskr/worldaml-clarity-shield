import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Activity, AlertTriangle, Building2, CheckCircle2, Clock, Loader2, RefreshCw,
  Search, ShieldCheck, Sparkles, XCircle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { SCREENING_MODULES } from "@/lib/suite/screeningModules";

type ModuleRow = {
  id: string;
  organisation_id: string;
  organisation_name: string | null;
  module: string;
  status: string;
  monthly_price_eur: number | null;
  requested_at: string | null;
  activated_at: string | null;
  cancelled_at: string | null;
  current_period_end: string | null;
  notes: string | null;
  requested_by_email: string | null;
};

type SubscriptionRow = {
  id: string;
  organisation_id: string;
  organisation_name: string | null;
  plan: string;
  status: string;
  monitored_entity_quota: number | null;
  current_period_end: string | null;
  created_at: string;
  stripe_subscription_id: string | null;
};

type OrgRow = {
  organisation_id: string;
  organisation_name: string | null;
  country: string | null;
  members: number;
  searches_30d: number;
  searches_total: number;
  open_cases: number;
  monitored: number;
  subscription_status: string | null;
  plan: string | null;
};

type SearchRow = {
  id: string;
  reference: string;
  organisation_name: string | null;
  status: string;
  created_at: string;
  monitoring_requested: boolean;
};

type UserRow = {
  user_id: string;
  organisation_id: string;
  organisation_name: string | null;
  role: string | null;
  email: string | null;
  full_name: string | null;
  company_name: string | null;
  job_title: string | null;
  country: string | null;
  joined_at: string | null;
  last_activity_at: string | null;
  searches_total: number;
  searches_30d: number;
  decisions_total: number;
  last_search_at: string | null;
  subscription_status: string | null;
  plan: string | null;
};

type Overview = {
  totals: Record<string, number>;
  subscriptions: SubscriptionRow[];
  modules: ModuleRow[];
  organisations: OrgRow[];
  recent_searches: SearchRow[];
};

const fmtDate = (v: string | null | undefined) =>
  v ? new Date(v).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" }) : "—";

const fmtDateTime = (v: string | null | undefined) =>
  v ? new Date(v).toLocaleString(undefined, { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "—";

function StatusBadge({ status }: { status: string | null }) {
  const s = String(status ?? "unknown");
  const map: Record<string, string> = {
    active: "bg-emerald-50 text-emerald-700 border-emerald-200",
    requested: "bg-amber-50 text-amber-700 border-amber-200",
    cancelled: "bg-slate-100 text-slate-600 border-slate-200",
    expired: "bg-slate-100 text-slate-600 border-slate-200",
    trialing: "bg-sky-50 text-sky-700 border-sky-200",
    past_due: "bg-red-50 text-red-700 border-red-200",
  };
  return (
    <Badge variant="outline" className={map[s] ?? "bg-muted text-muted-foreground"}>
      {s.replace(/_/g, " ")}
    </Badge>
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

export default function AdminScreeningProduct() {
  const [data, setData] = useState<Overview | null>(null);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [q, setQ] = useState("");

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    const [{ data: res, error }, { data: usr, error: uErr }] = await Promise.all([
      supabase.rpc("admin_screening_overview" as never),
      supabase.rpc("admin_screening_users" as never),
    ]);
    if (error) toast.error(error.message);
    else setData(res as unknown as Overview);
    if (uErr) toast.error(uErr.message);
    else setUsers((usr as unknown as UserRow[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const setModule = async (row: ModuleRow, status: string) => {
    setBusy(row.id);
    const { error } = await supabase.rpc("admin_set_screening_module" as never, {
      _module_id: row.id,
      _status: status,
      _monthly_price_eur: row.monthly_price_eur,
      _current_period_end: null,
      _notes: null,
    } as never);
    setBusy(null);
    if (error) { toast.error(error.message); return; }
    toast.success(status === "active" ? "Module activated" : `Module ${status}`);
    void load(true);
  };

  const totals = data?.totals ?? {};
  const term = q.trim().toLowerCase();

  const orgs = useMemo(
    () => (data?.organisations ?? []).filter((o) =>
      !term || (o.organisation_name ?? "").toLowerCase().includes(term) || (o.country ?? "").toLowerCase().includes(term)),
    [data, term],
  );
  const subs = useMemo(
    () => (data?.subscriptions ?? []).filter((s) =>
      !term || (s.organisation_name ?? "").toLowerCase().includes(term) || s.plan.toLowerCase().includes(term)),
    [data, term],
  );
  const modules = useMemo(
    () => (data?.modules ?? []).filter((m) =>
      !term || (m.organisation_name ?? "").toLowerCase().includes(term) || m.module.toLowerCase().includes(term)),
    [data, term],
  );
  const people = useMemo(
    () => users.filter((u) =>
      !term
      || (u.email ?? "").toLowerCase().includes(term)
      || (u.full_name ?? "").toLowerCase().includes(term)
      || (u.organisation_name ?? "").toLowerCase().includes(term)
      || (u.role ?? "").toLowerCase().includes(term)),
    [users, term],
  );

  const moduleName = (key: string) =>
    SCREENING_MODULES.find((m) => m.key === key)?.name ?? key.replace(/_/g, " ");

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" /> Screening Product
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Subscriptions, add-on modules and usage across Screening &amp; Monitoring.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search organisation…"
              className="h-9 pl-8 w-56"
            />
          </div>
          <Button variant="outline" size="sm" className="h-9" onClick={() => load()} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </div>
      </div>

      {loading && !data ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading screening data…
        </div>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <Kpi icon={CheckCircle2} label="Active subscriptions" value={totals.active_subscriptions} tone="bg-emerald-500/70" />
            <Kpi icon={Activity} label="Searches (30 days)" value={totals.searches_30d} tone="bg-sky-500/70" />
            <Kpi icon={AlertTriangle} label="Open cases" value={totals.open_cases} tone="bg-amber-500/70" />
            <Kpi icon={ShieldCheck} label="Monitored subjects" value={totals.monitored_subjects} tone="bg-teal-500/70" />
            <Kpi icon={Sparkles} label="Module requests" value={totals.pending_modules} tone="bg-violet-500/70" />
          </div>

          <Tabs defaultValue="modules">
            <TabsList>
              <TabsTrigger value="modules">
                Add-on modules
                {(totals.pending_modules ?? 0) > 0 && (
                  <span className="ml-2 rounded-full bg-amber-500 px-1.5 text-[10px] font-semibold text-white">
                    {totals.pending_modules}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
              <TabsTrigger value="organisations">Organisations &amp; usage</TabsTrigger>
              <TabsTrigger value="users">Users &amp; clients</TabsTrigger>
              <TabsTrigger value="activity">Recent activity</TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="mt-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" /> People with screening access ({people.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Organisation</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Plan</TableHead>
                        <TableHead>Searches (30d)</TableHead>
                        <TableHead>Searches (all)</TableHead>
                        <TableHead>Decisions</TableHead>
                        <TableHead>Last search</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {people.length === 0 && (
                        <TableRow><TableCell colSpan={8} className="text-center text-sm text-muted-foreground py-8">
                          No screening users yet.
                        </TableCell></TableRow>
                      )}
                      {people.map((u) => (
                        <TableRow key={`${u.organisation_id}-${u.user_id}`}>
                          <TableCell className="font-medium">
                            {u.full_name ?? u.email ?? "Unknown"}
                            {u.email && <div className="text-xs text-muted-foreground">{u.email}</div>}
                            {u.job_title && <div className="text-xs text-muted-foreground">{u.job_title}</div>}
                          </TableCell>
                          <TableCell>
                            {u.organisation_name ?? "—"}
                            {u.country && <div className="text-xs text-muted-foreground">{u.country}</div>}
                          </TableCell>
                          <TableCell className="capitalize">{(u.role ?? "—").replace(/_/g, " ")}</TableCell>
                          <TableCell>
                            {u.plan ? <span className="capitalize">{u.plan}</span> : <span className="text-muted-foreground">—</span>}
                            {u.subscription_status && <div className="mt-1"><StatusBadge status={u.subscription_status} /></div>}
                          </TableCell>
                          <TableCell>{u.searches_30d}</TableCell>
                          <TableCell>{u.searches_total}</TableCell>
                          <TableCell>{u.decisions_total}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{fmtDateTime(u.last_search_at)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>


            <TabsContent value="modules" className="mt-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Add-on module requests</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Organisation</TableHead>
                        <TableHead>Module</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Requested</TableHead>
                        <TableHead>Renews</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {modules.length === 0 && (
                        <TableRow><TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-8">
                          No module requests yet.
                        </TableCell></TableRow>
                      )}
                      {modules.map((m) => (
                        <TableRow key={m.id}>
                          <TableCell className="font-medium">
                            {m.organisation_name ?? "Unknown"}
                            {m.requested_by_email && (
                              <div className="text-xs text-muted-foreground">{m.requested_by_email}</div>
                            )}
                          </TableCell>
                          <TableCell>{moduleName(m.module)}</TableCell>
                          <TableCell><StatusBadge status={m.status} /></TableCell>
                          <TableCell>{m.monthly_price_eur ? `€${m.monthly_price_eur}/mo` : "—"}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{fmtDate(m.requested_at)}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{fmtDate(m.current_period_end)}</TableCell>
                          <TableCell className="text-right space-x-2 whitespace-nowrap">
                            {m.status !== "active" && (
                              <Button size="sm" variant="accent" disabled={busy === m.id}
                                onClick={() => setModule(m, "active")}>
                                {busy === m.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <><CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Activate</>}
                              </Button>
                            )}
                            {m.status !== "cancelled" && (
                              <Button size="sm" variant="outline" disabled={busy === m.id}
                                onClick={() => setModule(m, "cancelled")}>
                                <XCircle className="mr-1 h-3.5 w-3.5" /> Cancel
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="subscriptions" className="mt-4">
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Organisation</TableHead>
                        <TableHead>Plan</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Monitoring quota</TableHead>
                        <TableHead>Renews</TableHead>
                        <TableHead>Started</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {subs.length === 0 && (
                        <TableRow><TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-8">
                          No subscriptions found.
                        </TableCell></TableRow>
                      )}
                      {subs.map((s) => (
                        <TableRow key={s.id}>
                          <TableCell className="font-medium">{s.organisation_name ?? "Unknown"}</TableCell>
                          <TableCell className="capitalize">{s.plan}</TableCell>
                          <TableCell><StatusBadge status={s.status} /></TableCell>
                          <TableCell>{s.monitored_entity_quota ?? "—"}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{fmtDate(s.current_period_end)}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{fmtDate(s.created_at)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="organisations" className="mt-4">
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Organisation</TableHead>
                        <TableHead>Plan</TableHead>
                        <TableHead>Members</TableHead>
                        <TableHead>Searches (30d)</TableHead>
                        <TableHead>Searches (all)</TableHead>
                        <TableHead>Open cases</TableHead>
                        <TableHead>Monitored</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orgs.length === 0 && (
                        <TableRow><TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-8">
                          No organisations found.
                        </TableCell></TableRow>
                      )}
                      {orgs.map((o) => (
                        <TableRow key={o.organisation_id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                              {o.organisation_name ?? "Unknown"}
                            </div>
                            {o.country && <div className="text-xs text-muted-foreground">{o.country}</div>}
                          </TableCell>
                          <TableCell>
                            {o.plan ? <span className="capitalize">{o.plan}</span> : <span className="text-muted-foreground">—</span>}
                            {o.subscription_status && <div className="mt-1"><StatusBadge status={o.subscription_status} /></div>}
                          </TableCell>
                          <TableCell>{o.members}</TableCell>
                          <TableCell>{o.searches_30d}</TableCell>
                          <TableCell>{o.searches_total}</TableCell>
                          <TableCell>
                            {o.open_cases > 0
                              ? <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">{o.open_cases}</Badge>
                              : "0"}
                          </TableCell>
                          <TableCell>{o.monitored}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="mt-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" /> Latest 25 screenings
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Reference</TableHead>
                        <TableHead>Organisation</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Monitoring</TableHead>
                        <TableHead>When</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(data?.recent_searches ?? []).length === 0 && (
                        <TableRow><TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-8">
                          No screenings recorded yet.
                        </TableCell></TableRow>
                      )}
                      {(data?.recent_searches ?? []).map((s) => (
                        <TableRow key={s.id}>
                          <TableCell className="font-mono text-xs">{s.reference}</TableCell>
                          <TableCell>{s.organisation_name ?? "Unknown"}</TableCell>
                          <TableCell><StatusBadge status={s.status} /></TableCell>
                          <TableCell>{s.monitoring_requested ? "Yes" : "No"}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{fmtDateTime(s.created_at)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
