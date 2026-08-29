import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft, Radar, Loader2, Shield, Pause, Play, Search as SearchIcon,
  UserCog, CalendarClock, AlertTriangle, BellPlus,
} from "lucide-react";
import EntityDetailDrawer from "@/components/screening/EntityDetailDrawer";
import { deriveRiskLevel, RISK_LEVEL_META, RISK_LEVEL_ORDER, type RiskLevel } from "@/lib/riskLevels";

import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useScreeningAccess } from "@/hooks/useScreeningAccess";

type MonitoringStatus = "active" | "paused" | "stopped";

interface MonitoredRow {
  id: string;
  subject_id: string | null;
  case_id: string | null;
  status: MonitoringStatus;
  frequency: string;
  started_at: string;
  last_checked_at: string | null;
  last_change_at: string | null;
  risk_level: RiskLevel | null;
  assigned_to: string | null;
  categories: string[];
  subject: { full_name: string; subject_type: string; country_of_residence: string | null } | null;
  case: {
    case_reference: string;
    priority: string;
    status?: string;
    sanctions_matches: number;
    pep_matches: number;
    warning_matches: number;
    adverse_media_matches: number;
  } | null;
}


interface TeamMember {
  user_id: string | null;
  email: string;
  full_name: string | null;
  role: string;
}

const FREQUENCY_DAYS: Record<string, number> = { daily: 1, weekly: 7, monthly: 30 };

function nextRun(row: MonitoredRow): Date | null {
  if (row.status !== "active") return null;
  const base = row.last_checked_at ? new Date(row.last_checked_at) : new Date(row.started_at);
  const days = FREQUENCY_DAYS[row.frequency] ?? 1;
  return new Date(base.getTime() + days * 86400000);
}

function formatNextRun(d: Date | null): string {
  if (!d) return "—";
  const diff = d.getTime() - Date.now();
  if (diff <= 0) return "Due now";
  const hours = Math.round(diff / 3600000);
  if (hours < 24) return `In ${hours}h`;
  return `In ${Math.round(hours / 24)}d · ${d.toLocaleDateString()}`;
}

function riskLevel(row: MonitoredRow): { label: string; className: string; score: number } {
  const c = row.case;
  const sanctions = c?.sanctions_matches ?? 0;
  const pep = c?.pep_matches ?? 0;
  const warnings = c?.warning_matches ?? 0;
  const media = c?.adverse_media_matches ?? 0;
  if (sanctions > 0) return { label: "High", className: "bg-destructive/15 text-destructive border-destructive/30", score: 3 };
  if (pep > 0 || warnings > 0) return { label: "Medium", className: "bg-orange-500/15 text-orange-500 border-orange-500/30", score: 2 };
  if (media > 0) return { label: "Elevated", className: "bg-amber-500/15 text-amber-600 border-amber-500/30", score: 1 };
  return { label: "Low", className: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30", score: 0 };
}

const STATUS_STYLES: Record<MonitoringStatus, string> = {
  active: "bg-teal/15 text-teal border-teal/30",
  paused: "bg-muted text-muted-foreground border-border",
  stopped: "bg-destructive/10 text-destructive border-destructive/25",
};

export default function ScreeningMonitored() {
  const { isLoading: accessLoading, hasAccess, monitoredEntityQuota } = useScreeningAccess();
  const [rows, setRows] = useState<MonitoredRow[]>([]);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [transferTarget, setTransferTarget] = useState<MonitoredRow | null>(null);
  const [transferTo, setTransferTo] = useState<string>("");
  const [transferBusy, setTransferBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("monitoring_subjects")
      .select(
        "id,status,frequency,started_at,last_checked_at,last_change_at,assigned_to,categories," +
          "subject:screening_subjects(full_name,subject_type,country_of_residence)," +
          "case:screening_cases(case_reference,priority,sanctions_matches,pep_matches,warning_matches,adverse_media_matches)",
      )
      .order("started_at", { ascending: false });

    if (error) {
      toast.error("Could not load monitored entities: " + error.message);
    } else {
      setRows((data as unknown as MonitoredRow[]) ?? []);
    }
    setLoading(false);
  }, []);

  const loadMembers = useCallback(async () => {
    const { data } = await supabase.rpc("screening_team_members");
    setMembers(((data as unknown as TeamMember[]) ?? []).filter((m) => !!m.user_id));
  }, []);

  useEffect(() => {
    if (hasAccess) {
      void load();
      void loadMembers();
    }
  }, [hasAccess, load, loadMembers]);

  const setStatus = async (row: MonitoredRow, status: MonitoringStatus) => {
    setBusyId(row.id);
    const patch: { status: MonitoringStatus; stopped_at?: string } = { status };
    if (status === "stopped") patch.stopped_at = new Date().toISOString();
    const { error } = await supabase.from("monitoring_subjects").update(patch).eq("id", row.id);

    setBusyId(null);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(
      status === "paused" ? "Monitoring paused" : status === "active" ? "Monitoring resumed" : "Monitoring stopped",
    );
    void load();
  };

  const handleTransfer = async () => {
    if (!transferTarget || !transferTo) return;
    setTransferBusy(true);
    const { error } = await supabase
      .from("monitoring_subjects")
      .update({ assigned_to: transferTo })
      .eq("id", transferTarget.id);
    setTransferBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Access transferred");
    setTransferTarget(null);
    setTransferTo("");
    void load();
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (!q) return true;
      return (
        (r.subject?.full_name ?? "").toLowerCase().includes(q) ||
        (r.case?.case_reference ?? "").toLowerCase().includes(q)
      );
    });
  }, [rows, query, statusFilter]);

  const activeCount = rows.filter((r) => r.status === "active").length;
  const dueSoon = rows.filter((r) => {
    const n = nextRun(r);
    return n != null && n.getTime() - Date.now() < 86400000;
  }).length;
  const highRisk = rows.filter((r) => riskLevel(r).score >= 2 && r.status === "active").length;

  const memberName = (id: string | null) => {
    if (!id) return "Unassigned";
    const m = members.find((x) => x.user_id === id);
    return m?.full_name || m?.email || "Team member";
  };

  const shell = (children: React.ReactNode) => (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title="Monitored Entities | WorldAML Screening"
        description="Manage ongoing monitoring: active entities, next monitoring run, risk level and access."
        noindex
      />
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">{children}</main>
      <Footer />
    </div>
  );

  if (accessLoading || (hasAccess && loading)) {
    return shell(
      <div className="flex items-center gap-3 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" /> Loading monitored entities…
      </div>,
    );
  }

  if (!hasAccess) {
    return shell(
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="h-5 w-5 text-teal" /> Screening access required
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Ongoing monitoring is available on active WorldAML Screening & Monitoring packages.
          </p>
          <Button asChild variant="accent">
            <Link to="/screening-monitoring/pricing">View packages</Link>
          </Button>
        </CardContent>
      </Card>,
    );
  }

  return shell(
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Button asChild variant="ghost" size="sm" className="-ml-2 mb-1">
            <Link to="/screening">
              <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to workspace
            </Link>
          </Button>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <Radar className="h-6 w-6 text-teal" aria-hidden="true" /> Monitored entities
          </h1>
          <p className="text-sm text-muted-foreground">
            Ongoing screening of subjects across sanctions, PEP, warnings and adverse media.
          </p>
        </div>
        <Button asChild variant="accent">
          <Link to="/screening">Run a new screening</Link>
        </Button>
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active entities</CardDescription>
            <CardTitle className="text-2xl">
              {activeCount}
              {monitoredEntityQuota != null && (
                <span className="text-base font-normal text-muted-foreground"> / {monitoredEntityQuota}</span>
              )}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5">
              <CalendarClock className="h-3.5 w-3.5" /> Next run within 24h
            </CardDescription>
            <CardTitle className="text-2xl">{dueSoon}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5" /> Medium / high risk
            </CardDescription>
            <CardTitle className="text-2xl">{highRisk}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base">Entities under monitoring</CardTitle>
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <Input
                className="pl-8 w-56"
                placeholder="Search name or case"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search monitored entities"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36" aria-label="Filter by status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="stopped">Stopped</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
              No monitored entities yet. Enable “Ongoing monitoring” when running a screening to track a
              subject continuously.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Entity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Risk level</TableHead>
                    <TableHead>Next run</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((row) => {
                    const risk = riskLevel(row);
                    return (
                      <TableRow key={row.id}>
                        <TableCell>
                          <div className="font-medium">{row.subject?.full_name ?? "Unknown subject"}</div>
                          <div className="text-xs text-muted-foreground">
                            {row.case?.case_reference ?? "No case"} ·{" "}
                            {row.subject?.subject_type ?? "subject"} · {row.frequency}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={STATUS_STYLES[row.status]}>
                            {row.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={risk.className}>
                            {risk.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatNextRun(nextRun(row))}
                          <div className="text-xs text-muted-foreground">
                            {row.last_checked_at
                              ? `Last checked ${new Date(row.last_checked_at).toLocaleDateString()}`
                              : "Not yet checked"}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{memberName(row.assigned_to)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1.5">
                            {row.status === "active" ? (
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={busyId === row.id}
                                onClick={() => setStatus(row, "paused")}
                              >
                                <Pause className="mr-1.5 h-3.5 w-3.5" /> Pause
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={busyId === row.id}
                                onClick={() => setStatus(row, "active")}
                              >
                                <Play className="mr-1.5 h-3.5 w-3.5" /> Resume
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setTransferTarget(row);
                                setTransferTo(row.assigned_to ?? "");
                              }}
                            >
                              <UserCog className="mr-1.5 h-3.5 w-3.5" /> Transfer
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!transferTarget} onOpenChange={(o) => !o && setTransferTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transfer access</DialogTitle>
            <DialogDescription>
              Assign ongoing monitoring of{" "}
              <span className="font-medium text-foreground">
                {transferTarget?.subject?.full_name ?? "this entity"}
              </span>{" "}
              to another team member. They receive monitoring alerts for this subject.
            </DialogDescription>
          </DialogHeader>
          <Select value={transferTo} onValueChange={setTransferTo}>
            <SelectTrigger aria-label="Select team member">
              <SelectValue placeholder="Select a team member" />
            </SelectTrigger>
            <SelectContent>
              {members.map((m) => (
                <SelectItem key={m.user_id!} value={m.user_id!}>
                  {m.full_name || m.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTransferTarget(null)}>
              Cancel
            </Button>
            <Button variant="accent" disabled={!transferTo || transferBusy} onClick={handleTransfer}>
              {transferBusy && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />} Transfer
            </Button>
          </DialogFooter>
        </DialogContent>

      </Dialog>
    </div>,
  );
}
