import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { Building2, Loader2, Search, Users, Globe } from "lucide-react";

const FREE_DOMAINS = new Set([
  "gmail.com","googlemail.com","yahoo.com","yahoo.co.uk","yahoo.co.in",
  "outlook.com","hotmail.com","live.com","msn.com","icloud.com","me.com",
  "protonmail.com","proton.me","gmx.com","gmx.de","aol.com","mail.com",
  "yandex.com","yandex.ru","zoho.com","qq.com","163.com","126.com",
]);

interface Profile {
  user_id: string;
  email: string | null;
  full_name: string | null;
  subscription_tier: string | null;
  status: string | null;
  created_at: string;
}

interface Org {
  id: string;
  name: string;
  website: string | null;
  primary_contact_email: string | null;
  subscription_tier: string;
  regulator: string | null;
  industry: string | null;
  country: string | null;
}

interface DomainGroup {
  domain: string;
  users: Profile[];
  orgs: Org[];
  isFreeWebmail: boolean;
}

const domainOf = (email: string | null) => {
  if (!email || !email.includes("@")) return null;
  return email.toLowerCase().split("@")[1]?.trim() || null;
};

export default function AdminDomains() {
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [search, setSearch] = useState("");
  const [showFree, setShowFree] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [{ data: p }, { data: o }] = await Promise.all([
        supabase.from("profiles").select("user_id,email,full_name,subscription_tier,status,created_at"),
        supabase.from("suite_organizations").select("id,name,website,primary_contact_email,subscription_tier,regulator,industry,country"),
      ]);
      setProfiles((p as any[]) ?? []);
      setOrgs((o as any[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const groups = useMemo<DomainGroup[]>(() => {
    const map = new Map<string, DomainGroup>();
    for (const prof of profiles) {
      const d = domainOf(prof.email);
      if (!d) continue;
      if (!map.has(d)) {
        map.set(d, { domain: d, users: [], orgs: [], isFreeWebmail: FREE_DOMAINS.has(d) });
      }
      map.get(d)!.users.push(prof);
    }
    // attach orgs by website or contact email domain
    for (const org of orgs) {
      const candidates = [
        domainOf(org.primary_contact_email),
        org.website ? org.website.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0].toLowerCase() : null,
      ].filter(Boolean) as string[];
      for (const d of candidates) {
        if (map.has(d)) {
          const g = map.get(d)!;
          if (!g.orgs.find(x => x.id === org.id)) g.orgs.push(org);
        } else {
          map.set(d, { domain: d, users: [], orgs: [org], isFreeWebmail: FREE_DOMAINS.has(d) });
        }
      }
    }
    return Array.from(map.values()).sort((a, b) => b.users.length - a.users.length);
  }, [profiles, orgs]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return groups.filter(g => {
      if (!showFree && g.isFreeWebmail) return false;
      if (!q) return true;
      return g.domain.includes(q)
        || g.users.some(u => (u.email ?? "").toLowerCase().includes(q) || (u.full_name ?? "").toLowerCase().includes(q))
        || g.orgs.some(o => o.name.toLowerCase().includes(q));
    });
  }, [groups, search, showFree]);

  const stats = useMemo(() => {
    const corporate = groups.filter(g => !g.isFreeWebmail);
    return {
      totalDomains: groups.length,
      corporateDomains: corporate.length,
      withOrg: corporate.filter(g => g.orgs.length > 0).length,
      totalUsers: profiles.length,
    };
  }, [groups, profiles]);

  if (loading) {
    return <div className="p-6 flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Building2 className="w-6 h-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">Organisations &amp; Domains</h1>
          <p className="text-sm text-muted-foreground">Registered users grouped by email domain, linked to formal Suite organisations where they exist.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Total users" value={stats.totalUsers} />
        <StatCard label="Total domains" value={stats.totalDomains} />
        <StatCard label="Corporate domains" value={stats.corporateDomains} />
        <StatCard label="Linked to Suite org" value={stats.withOrg} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-navy flex items-center justify-between">
            <span>Domains</span>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-xs font-normal text-muted-foreground">
                <input type="checkbox" checked={showFree} onChange={e => setShowFree(e.target.checked)} />
                Show free webmail
              </label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-muted-foreground" />
                <Input
                  className="pl-8 h-9 w-64"
                  placeholder="Search domain, user, or org..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="w-full">
            {filtered.map(g => (
              <AccordionItem key={g.domain} value={g.domain}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3 flex-1 text-left">
                    <Globe className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="font-medium text-foreground">{g.domain}</span>
                    {g.isFreeWebmail && <Badge variant="outline" className="text-xs">free webmail</Badge>}
                    {g.orgs.length > 0 && (
                      <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                        {g.orgs.length} suite org{g.orgs.length > 1 ? "s" : ""}
                      </Badge>
                    )}
                    <div className="ml-auto mr-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Users className="w-3.5 h-3.5" /> {g.users.length} user{g.users.length === 1 ? "" : "s"}
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  {g.orgs.length > 0 && (
                    <div className="mb-3 space-y-1.5">
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Linked Suite Organisations</div>
                      {g.orgs.map(o => (
                        <div key={o.id} className="flex items-center gap-2 text-sm p-2 rounded bg-muted/40">
                          <Building2 className="w-3.5 h-3.5 text-primary" />
                          <span className="font-medium">{o.name}</span>
                          {o.regulator && <Badge variant="outline" className="text-[10px]">{o.regulator}</Badge>}
                          <Badge variant="outline" className="text-[10px]">{o.subscription_tier}</Badge>
                          {o.country && <span className="text-xs text-muted-foreground">{o.country}</span>}
                        </div>
                      ))}
                    </div>
                  )}
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Tier</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Joined</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {g.users
                        .sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""))
                        .map(u => (
                        <TableRow key={u.user_id}>
                          <TableCell className="font-medium">{u.full_name || <span className="text-muted-foreground">—</span>}</TableCell>
                          <TableCell className="text-sm">{u.email}</TableCell>
                          <TableCell><Badge variant="outline" className="text-xs">{u.subscription_tier ?? "free"}</Badge></TableCell>
                          <TableCell><Badge variant="outline" className="text-xs">{u.status ?? "—"}</Badge></TableCell>
                          <TableCell className="text-xs text-muted-foreground">{u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </AccordionContent>
              </AccordionItem>
            ))}
            {filtered.length === 0 && (
              <div className="py-12 text-center text-sm text-muted-foreground">No domains match your filters.</div>
            )}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-2xl font-bold text-foreground mt-1">{value.toLocaleString()}</div>
      </CardContent>
    </Card>
  );
}
