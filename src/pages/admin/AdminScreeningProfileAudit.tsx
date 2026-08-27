import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileSearch, RefreshCw, Search, Database, Users, Clock } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

interface ProfileAuditRow {
  event_id: string;
  occurred_at: string;
  actor_id: string | null;
  actor_email: string | null;
  actor_name: string | null;
  organisation_id: string | null;
  organisation_name: string | null;
  match_id: string | null;
  matched_name: string | null;
  case_id: string | null;
  case_reference: string | null;
  description: string;
  metadata: Record<string, unknown> | null;
  profile_cached_at: string | null;
}

export default function AdminScreeningProfileAudit() {
  const [rows, setRows] = useState<ProfileAuditRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [applied, setApplied] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc("admin_screening_profile_audit", {
      _search: applied || null,
      _limit: 300,
    });
    if (error) toast.error("The enrichment audit trail could not be loaded");
    setRows((data as ProfileAuditRow[]) ?? []);
    setLoading(false);
  }, [applied]);

  useEffect(() => { load(); }, [load]);

  const stats = useMemo(() => {
    const analysts = new Set(rows.map((r) => r.actor_email ?? r.actor_id ?? "unknown"));
    const day = Date.now() - 24 * 60 * 60 * 1000;
    return {
      total: rows.length,
      analysts: analysts.size,
      last24h: rows.filter((r) => new Date(r.occurred_at).getTime() >= day).length,
    };
  }, [rows]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold text-foreground">
            <FileSearch className="h-6 w-6 text-primary" />
            Profile Enrichment Audit
          </h1>
          <p className="text-sm text-muted-foreground">
            Every full listed-profile fetch, who triggered it, and when the cached profile was stored.
          </p>
        </div>
        <Button variant="outline" onClick={load} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={<Database className="h-4 w-4" />} label="Fetches shown" value={stats.total} tone="primary" />
        <StatCard icon={<Users className="h-4 w-4" />} label="Distinct analysts" value={stats.analysts} tone="accent" />
        <StatCard icon={<Clock className="h-4 w-4" />} label="Last 24 hours" value={stats.last24h} tone="warning" />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Enrichment events</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form
            className="flex flex-wrap gap-2"
            onSubmit={(e) => { e.preventDefault(); setApplied(search.trim()); }}
          >
            <div className="relative min-w-[240px] flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Search analyst email, matched name or organisation"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button type="submit" variant="secondary">Search</Button>
            {applied && (
              <Button type="button" variant="ghost" onClick={() => { setSearch(""); setApplied(""); }}>
                Clear
              </Button>
            )}
          </form>

          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : rows.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No profile enrichment fetches recorded yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>When</TableHead>
                    <TableHead>Triggered by</TableHead>
                    <TableHead>Match</TableHead>
                    <TableHead>Organisation</TableHead>
                    <TableHead>Payload</TableHead>
                    <TableHead>Profile cached</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r) => {
                    const meta = (r.metadata ?? {}) as Record<string, number | boolean>;
                    return (
                      <TableRow key={r.event_id}>
                        <TableCell className="whitespace-nowrap text-sm">
                          <div>{format(new Date(r.occurred_at), "d MMM yyyy HH:mm")}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(r.occurred_at), { addSuffix: true })}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          <div className="font-medium">{r.actor_name || r.actor_email || "System"}</div>
                          {r.actor_email && r.actor_name && (
                            <div className="text-xs text-muted-foreground">{r.actor_email}</div>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">
                          <div className="font-medium">{r.matched_name || "—"}</div>
                          {r.case_reference && (
                            <div className="text-xs text-muted-foreground">Case {r.case_reference}</div>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">{r.organisation_name || "—"}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            <Badge variant="outline" className="border-primary/30 bg-primary/5 text-primary">
                              {Number(meta.listings ?? 0)} listings
                            </Badge>
                            <Badge variant="outline" className="border-accent/30 bg-accent/10 text-accent-foreground">
                              {Number(meta.associates ?? 0)} associates
                            </Badge>
                            {Number(meta.media ?? 0) > 0 && (
                              <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-700">
                                {Number(meta.media)} media
                              </Badge>
                            )}
                            {meta.refresh === true && (
                              <Badge variant="outline" className="border-sky-300 bg-sky-50 text-sky-700">
                                Manual refresh
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-sm">
                          {r.profile_cached_at
                            ? format(new Date(r.profile_cached_at), "d MMM yyyy HH:mm")
                            : <span className="text-muted-foreground">Not cached</span>}
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
    </div>
  );
}

function StatCard({
  icon, label, value, tone,
}: { icon: React.ReactNode; label: string; value: number; tone: "primary" | "accent" | "warning" }) {
  const tones: Record<string, string> = {
    primary: "border-primary/20 bg-primary/5 text-primary",
    accent: "border-accent/30 bg-accent/10 text-accent-foreground",
    warning: "border-amber-200 bg-amber-50 text-amber-700",
  };
  return (
    <Card className={tones[tone]}>
      <CardContent className="flex items-center justify-between p-4">
        <div>
          <p className="text-xs uppercase tracking-wide opacity-80">{label}</p>
          <p className="text-2xl font-semibold">{value}</p>
        </div>
        <span className="rounded-full bg-background/60 p-2">{icon}</span>
      </CardContent>
    </Card>
  );
}
