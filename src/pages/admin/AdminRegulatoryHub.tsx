import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Landmark, Search, RefreshCw, FileText, AlertTriangle, CheckCircle2,
  Clock, ChevronLeft, ChevronRight, Users, BarChart3
} from "lucide-react";
import { format, differenceInDays, parseISO } from "date-fns";

interface PeriodicReport {
  id: string;
  user_id: string;
  report_type: string;
  report_title: string;
  regulator: string;
  period_year: number;
  filing_status: string;
  filed_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  notes: string | null;
  user_email?: string;
  user_name?: string;
}

const PAGE_SIZE = 25;

const STATUS_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: typeof CheckCircle2 }> = {
  draft: { label: "Draft", variant: "secondary", icon: Clock },
  completed: { label: "Completed", variant: "outline", icon: CheckCircle2 },
  filed: { label: "Filed", variant: "default", icon: FileText },
};

export default function AdminRegulatoryHub() {
  const [reports, setReports] = useState<PeriodicReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [regulatorFilter, setRegulatorFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);

  // Derived filter options
  const [regulators, setRegulators] = useState<string[]>([]);
  const [years, setYears] = useState<number[]>([]);

  // Stats
  const [stats, setStats] = useState({ total: 0, draft: 0, completed: 0, filed: 0, overdue: 0, uniqueUsers: 0 });

  const fetchStats = async () => {
    const { data } = await supabase
      .from("periodic_reports")
      .select("filing_status, user_id, updated_at");

    if (!data) return;

    const uniqueUsers = new Set(data.map((r) => r.user_id)).size;
    const now = new Date();
    const overdue = data.filter((r) => {
      if (r.filing_status === "filed") return false;
      const updated = parseISO(r.updated_at);
      return differenceInDays(now, updated) > 30;
    }).length;

    setStats({
      total: data.length,
      draft: data.filter((r) => r.filing_status === "draft").length,
      completed: data.filter((r) => r.filing_status === "completed").length,
      filed: data.filter((r) => r.filing_status === "filed").length,
      overdue,
      uniqueUsers,
    });
  };

  const fetchFilterOptions = async () => {
    const [{ data: regData }, { data: yearData }] = await Promise.all([
      supabase.from("periodic_reports").select("regulator").limit(500),
      supabase.from("periodic_reports").select("period_year").limit(500),
    ]);
    setRegulators([...new Set((regData ?? []).map((r) => r.regulator))].sort());
    setYears([...new Set((yearData ?? []).map((r) => r.period_year))].sort((a, b) => b - a));
  };

  const fetchReports = async () => {
    setLoading(true);
    let query = supabase
      .from("periodic_reports")
      .select("*", { count: "exact" })
      .order("updated_at", { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (statusFilter !== "all") query = query.eq("filing_status", statusFilter);
    if (regulatorFilter !== "all") query = query.eq("regulator", regulatorFilter);
    if (yearFilter !== "all") query = query.eq("period_year", parseInt(yearFilter));

    const { data, count } = await query;
    const rows = (data ?? []) as PeriodicReport[];

    // Resolve user info
    const userIds = [...new Set(rows.map((r) => r.user_id))];
    if (userIds.length) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, email, full_name")
        .in("user_id", userIds);
      const profileMap = new Map((profiles ?? []).map((p) => [p.user_id, p]));
      rows.forEach((r) => {
        const profile = profileMap.get(r.user_id);
        r.user_email = profile?.email ?? r.user_id;
        r.user_name = profile?.full_name ?? "";
      });
    }

    setReports(rows);
    setTotal(count ?? 0);
    setLoading(false);
  };

  useEffect(() => {
    fetchFilterOptions();
    fetchStats();
  }, []);

  useEffect(() => {
    fetchReports();
  }, [page, statusFilter, regulatorFilter, yearFilter]);

  const filtered = search
    ? reports.filter(
        (r) =>
          (r.user_email ?? "").toLowerCase().includes(search.toLowerCase()) ||
          (r.user_name ?? "").toLowerCase().includes(search.toLowerCase()) ||
          r.report_title.toLowerCase().includes(search.toLowerCase()) ||
          r.regulator.toLowerCase().includes(search.toLowerCase()) ||
          r.report_type.toLowerCase().includes(search.toLowerCase())
      )
    : reports;

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const isOverdue = (r: PeriodicReport) => {
    if (r.filing_status === "filed") return false;
    return differenceInDays(new Date(), parseISO(r.updated_at)) > 30;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Landmark className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Regulatory Hub</h1>
        </div>
        <Button variant="outline" size="sm" onClick={() => { setPage(0); fetchReports(); fetchStats(); }}>
          <RefreshCw className="w-4 h-4 mr-1" /> Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: "Total Reports", value: stats.total, icon: FileText, color: "text-foreground" },
          { label: "Active Users", value: stats.uniqueUsers, icon: Users, color: "text-primary" },
          { label: "Drafts", value: stats.draft, icon: Clock, color: "text-yellow-500" },
          { label: "Completed", value: stats.completed, icon: CheckCircle2, color: "text-blue-500" },
          { label: "Filed", value: stats.filed, icon: BarChart3, color: "text-green-500" },
          { label: "Overdue (30d+)", value: stats.overdue, icon: AlertTriangle, color: "text-destructive" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 flex flex-col items-center text-center gap-1">
              <s.icon className={`w-5 h-5 ${s.color}`} />
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Filters</CardTitle>
          <CardDescription>Review periodic reports across all users and regulators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search user, title, regulator…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(0); }}>
              <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="filed">Filed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={regulatorFilter} onValueChange={(v) => { setRegulatorFilter(v); setPage(0); }}>
              <SelectTrigger><SelectValue placeholder="Regulator" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All regulators</SelectItem>
                {regulators.map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={yearFilter} onValueChange={(v) => { setYearFilter(v); setPage(0); }}>
              <SelectTrigger><SelectValue placeholder="Year" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All years</SelectItem>
                {years.map((y) => (
                  <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Report</TableHead>
                <TableHead>Regulator</TableHead>
                <TableHead>Year</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Filed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No periodic reports found
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((r) => {
                  const cfg = STATUS_CONFIG[r.filing_status] ?? STATUS_CONFIG.draft;
                  const overdue = isOverdue(r);
                  return (
                    <TableRow key={r.id} className={overdue ? "bg-destructive/5" : ""}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium truncate max-w-[160px]" title={r.user_email}>
                            {r.user_name || r.user_email}
                          </span>
                          {r.user_name && (
                            <span className="text-xs text-muted-foreground truncate max-w-[160px]">{r.user_email}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{r.report_title}</span>
                          <span className="text-xs text-muted-foreground">{r.report_type}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">{r.regulator}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">{r.period_year}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <Badge variant={cfg.variant} className="text-xs">
                            <cfg.icon className="w-3 h-3 mr-1" />
                            {cfg.label}
                          </Badge>
                          {overdue && (
                            <Badge variant="destructive" className="text-xs">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              Overdue
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {format(parseISO(r.updated_at), "yyyy-MM-dd HH:mm")}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {r.filed_at ? format(parseISO(r.filed_at), "yyyy-MM-dd") : "—"}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Page {page + 1} of {totalPages}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>
              <ChevronLeft className="w-4 h-4" /> Prev
            </Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
