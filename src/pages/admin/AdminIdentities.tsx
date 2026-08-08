import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, GraduationCap, Handshake, Building2, Users, Search } from "lucide-react";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";

type ProfileKey = "academy" | "partner" | "business";

interface Identity {
  userId: string;
  name: string;
  email: string;
  createdAt: string | null;
  academy: boolean;
  partner: "none" | "pending" | "rejected" | "active" | "inactive";
  business: boolean;
  company: string | null;
  country: string | null;
}

const FILTERS: { key: "all" | ProfileKey | "multi"; label: string }[] = [
  { key: "all", label: "All identities" },
  { key: "academy", label: "Academy" },
  { key: "partner", label: "Partner" },
  { key: "business", label: "Business" },
  { key: "multi", label: "Multi-profile" },
];

export default function AdminIdentities() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | ProfileKey | "multi">("all");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-identities"],
    queryFn: async (): Promise<Identity[]> => {
      const [profiles, partners, applications, businesses] = await Promise.all([
        supabase.from("profiles").select("user_id, full_name, email, status, created_at, country"),
        supabase.from("partners").select("user_id, company_name, is_active"),
        supabase.from("partner_applications").select("user_id, company_name, status, created_at"),
        supabase.from("business_accounts").select("user_id, company_name, work_email, contact_name, country, created_at"),
      ]);

      const map = new Map<string, Identity>();
      const ensure = (userId: string): Identity => {
        if (!map.has(userId)) {
          map.set(userId, {
            userId, name: "—", email: "—", createdAt: null,
            academy: false, partner: "none", business: false, company: null, country: null,
          });
        }
        return map.get(userId)!;
      };

      (profiles.data || []).forEach((p: any) => {
        const row = ensure(p.user_id);
        row.name = p.full_name || row.name;
        row.email = p.email || row.email;
        row.createdAt = p.created_at || row.createdAt;
        row.country = p.country || row.country;
        row.academy = p.status !== "rejected";
      });

      (applications.data || []).forEach((a: any) => {
        const row = ensure(a.user_id);
        row.company = row.company || a.company_name;
        if (row.partner === "none") {
          row.partner = a.status === "approved" ? "inactive" : (a.status as Identity["partner"]);
        }
      });

      (partners.data || []).forEach((p: any) => {
        const row = ensure(p.user_id);
        row.company = row.company || p.company_name;
        row.partner = p.is_active ? "active" : "inactive";
      });

      (businesses.data || []).forEach((b: any) => {
        const row = ensure(b.user_id);
        row.business = true;
        row.company = row.company || b.company_name;
        row.country = row.country || b.country;
        if (row.email === "—") row.email = b.work_email;
        if (row.name === "—") row.name = b.contact_name || b.company_name;
      });

      return Array.from(map.values()).sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
    },
  });

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (data || []).filter((r) => {
      const profiles = [r.academy && "academy", r.partner !== "none" && "partner", r.business && "business"].filter(Boolean);
      if (filter === "multi" && profiles.length < 2) return false;
      if (filter === "academy" && !r.academy) return false;
      if (filter === "partner" && r.partner === "none") return false;
      if (filter === "business" && !r.business) return false;
      if (!term) return true;
      return [r.name, r.email, r.company, r.country].some((v) => (v || "").toLowerCase().includes(term));
    });
  }, [data, search, filter]);

  const stats = useMemo(() => {
    const all = data || [];
    return {
      total: all.length,
      academy: all.filter((r) => r.academy).length,
      partner: all.filter((r) => r.partner !== "none").length,
      business: all.filter((r) => r.business).length,
      multi: all.filter((r) => [r.academy, r.partner !== "none", r.business].filter(Boolean).length > 1).length,
      pendingPartners: all.filter((r) => r.partner === "pending").length,
    };
  }, [data]);

  const partnerBadge = (state: Identity["partner"]) => {
    if (state === "none") return <span className="text-muted-foreground">—</span>;
    const map: Record<string, string> = {
      active: "bg-teal/10 text-teal border-teal/30",
      pending: "bg-amber-500/10 text-amber-600 border-amber-500/30",
      rejected: "bg-destructive/10 text-destructive border-destructive/30",
      inactive: "bg-muted text-muted-foreground",
    };
    return <Badge variant="outline" className={map[state]}>{state}</Badge>;
  };

  return (
    <div className="space-y-6">
      <SEO title="Identities & Profiles" description="Connected view of Academy, Partner and Business profiles per WorldAML identity." noindex />
      <div>
        <h1 className="text-2xl font-bold text-navy">Identities & Profiles</h1>
        <p className="text-sm text-muted-foreground">
          One sign-in can hold up to three profiles. Each profile is registered separately and stored in its own record.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { label: "Identities", value: stats.total, icon: Users },
          { label: "Academy profiles", value: stats.academy, icon: GraduationCap },
          { label: "Partner profiles", value: stats.partner, icon: Handshake },
          { label: "Business profiles", value: stats.business, icon: Building2 },
          { label: "Multi-profile users", value: stats.multi, icon: Users },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-2xl font-bold text-navy">{s.value}</p>
                </div>
                <s.icon className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {stats.pendingPartners > 0 && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="pt-6 flex items-center justify-between gap-4">
            <p className="text-sm">
              <strong>{stats.pendingPartners}</strong> partner {stats.pendingPartners === 1 ? "application is" : "applications are"} waiting for approval before first sign-in.
            </p>
            <Button asChild size="sm"><Link to="/admin/partners">Review applications</Link></Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Connected profile view</CardTitle>
          <CardDescription>Search by person, company or country and filter by profile type.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9" placeholder="Search name, email, company…" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="flex flex-wrap gap-2">
              {FILTERS.map((f) => (
                <Button key={f.key} size="sm" variant={filter === f.key ? "default" : "outline"} onClick={() => setFilter(f.key)}>
                  {f.label}
                </Button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="py-12 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
          ) : rows.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">No identities match this view.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Person</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Academy</TableHead>
                    <TableHead>Partner</TableHead>
                    <TableHead>Business</TableHead>
                    <TableHead>Country</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.slice(0, 300).map((r) => (
                    <TableRow key={r.userId}>
                      <TableCell>
                        <div className="font-medium text-navy">{r.name}</div>
                        <div className="text-xs text-muted-foreground">{r.email}</div>
                      </TableCell>
                      <TableCell className="text-sm">{r.company || "—"}</TableCell>
                      <TableCell>
                        {r.academy ? <Badge variant="outline" className="bg-teal/10 text-teal border-teal/30">active</Badge> : <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell>{partnerBadge(r.partner)}</TableCell>
                      <TableCell>
                        {r.business ? <Badge variant="outline" className="bg-navy/10 text-navy border-navy/30">active</Badge> : <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell className="text-sm">{r.country || "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
