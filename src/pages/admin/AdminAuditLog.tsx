import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollText, Search, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";

interface AuditEntry {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
  user_email?: string;
}

const PAGE_SIZE = 25;

export default function AdminAuditLog() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [entityFilter, setEntityFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [actions, setActions] = useState<string[]>([]);
  const [entityTypes, setEntityTypes] = useState<string[]>([]);

  const fetchEntries = async () => {
    setLoading(true);
    let query = supabase
      .from("suite_audit_log")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (actionFilter !== "all") query = query.eq("action", actionFilter);
    if (entityFilter !== "all") query = query.eq("entity_type", entityFilter);
    if (dateFrom) query = query.gte("created_at", dateFrom);
    if (dateTo) query = query.lte("created_at", dateTo + "T23:59:59");

    const { data, count } = await query;
    const rows = (data ?? []) as AuditEntry[];

    // Resolve user emails
    const userIds = [...new Set(rows.map((r) => r.user_id))];
    if (userIds.length) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, email")
        .in("user_id", userIds);
      const emailMap = new Map((profiles ?? []).map((p) => [p.user_id, p.email]));
      rows.forEach((r) => (r.user_email = emailMap.get(r.user_id) ?? r.user_id));
    }

    setEntries(rows);
    setTotal(count ?? 0);
    setLoading(false);
  };

  const fetchFilters = async () => {
    const [{ data: a }, { data: e }] = await Promise.all([
      supabase.from("suite_audit_log").select("action").limit(500),
      supabase.from("suite_audit_log").select("entity_type").limit(500),
    ]);
    setActions([...new Set((a ?? []).map((r) => r.action))].sort());
    setEntityTypes([...new Set((e ?? []).map((r) => r.entity_type))].sort());
  };

  useEffect(() => { fetchFilters(); }, []);
  useEffect(() => { fetchEntries(); }, [page, actionFilter, entityFilter, dateFrom, dateTo]);

  const filtered = search
    ? entries.filter(
        (e) =>
          (e.user_email ?? "").toLowerCase().includes(search.toLowerCase()) ||
          e.action.toLowerCase().includes(search.toLowerCase()) ||
          e.entity_type.toLowerCase().includes(search.toLowerCase()) ||
          (e.entity_id ?? "").toLowerCase().includes(search.toLowerCase())
      )
    : entries;

  const severityColor = (action: string) => {
    if (action.includes("delete") || action.includes("revoke")) return "destructive";
    if (action.includes("create") || action.includes("grant")) return "default";
    return "secondary";
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ScrollText className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Audit Log</h1>
          <Badge variant="outline" className="ml-2">{total} events</Badge>
        </div>
        <Button variant="outline" size="sm" onClick={() => { setPage(0); fetchEntries(); }}>
          <RefreshCw className="w-4 h-4 mr-1" /> Refresh
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search user, action…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8" />
            </div>
            <Select value={actionFilter} onValueChange={(v) => { setActionFilter(v); setPage(0); }}>
              <SelectTrigger><SelectValue placeholder="Action" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All actions</SelectItem>
                {actions.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={entityFilter} onValueChange={(v) => { setEntityFilter(v); setPage(0); }}>
              <SelectTrigger><SelectValue placeholder="Entity" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All entities</SelectItem>
                {entityTypes.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(0); }} placeholder="From" />
            <Input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(0); }} placeholder="To" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Entity ID</TableHead>
                <TableHead>IP</TableHead>
                <TableHead>Details</TableHead>
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
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No audit events found</TableCell></TableRow>
              ) : (
                filtered.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="whitespace-nowrap text-xs">{format(new Date(e.created_at), "yyyy-MM-dd HH:mm:ss")}</TableCell>
                    <TableCell className="text-xs max-w-[160px] truncate" title={e.user_email}>{e.user_email}</TableCell>
                    <TableCell><Badge variant={severityColor(e.action)} className="text-xs">{e.action}</Badge></TableCell>
                    <TableCell className="text-xs">{e.entity_type}</TableCell>
                    <TableCell className="text-xs font-mono max-w-[100px] truncate" title={e.entity_id ?? ""}>{e.entity_id?.slice(0, 8) ?? "—"}</TableCell>
                    <TableCell className="text-xs">{e.ip_address ?? "—"}</TableCell>
                    <TableCell className="text-xs max-w-[200px] truncate" title={e.details ? JSON.stringify(e.details) : ""}>
                      {e.details ? JSON.stringify(e.details).slice(0, 60) : "—"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

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
