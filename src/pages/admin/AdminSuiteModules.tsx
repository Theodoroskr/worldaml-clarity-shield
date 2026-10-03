// WorldAML admin: grant / pause / end Suite modules for each client company.
// Writes go through the admin_set_org_module RPC (platform admin only).
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Boxes, Loader2, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

const MODULES = [
  { key: "screening", label: "Screening" },
  { key: "kyc_kyb", label: "KYC / KYB" },
  { key: "rcm", label: "Regulatory Compliance" },
] as const;
type ModuleKey = (typeof MODULES)[number]["key"];
type Status = "active" | "trial" | "suspended" | "cancelled";

type Org = { id: string; name: string | null };
type Access = { organisation_id: string; module: ModuleKey; status: Status; enabled: boolean; ends_at: string | null };

const STATUS_VARIANT: Record<Status, "default" | "secondary" | "outline" | "destructive"> = {
  active: "default", trial: "secondary", suspended: "outline", cancelled: "destructive",
};

export default function AdminSuiteModules() {
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [access, setAccess] = useState<Access[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [saving, setSaving] = useState<string | null>(null);
  const [trialDays, setTrialDays] = useState("14");

  const load = async () => {
    setLoading(true);
    const [o, a] = await Promise.all([
      supabase.from("suite_organizations").select("id, name").order("name"),
      supabase.from("suite_module_access").select("organisation_id, module, status, enabled, ends_at"),
    ]);
    if (o.error || a.error) toast.error("Could not load companies");
    setOrgs((o.data ?? []) as Org[]);
    setAccess((a.data ?? []) as Access[]);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const byOrg = useMemo(() => {
    const m: Record<string, Partial<Record<ModuleKey, Access>>> = {};
    access.forEach((r) => { (m[r.organisation_id] ||= {})[r.module] = r; });
    return m;
  }, [access]);

  const filtered = orgs.filter((o) => (o.name ?? o.id).toLowerCase().includes(q.toLowerCase()));

  const setModule = async (orgId: string, module: ModuleKey, action: Status | "trial_days") => {
    const key = `${orgId}:${module}`;
    setSaving(key);
    const isTrial = action === "trial_days";
    const days = Math.max(1, Math.min(90, parseInt(trialDays) || 14));
    const { error } = await supabase.rpc("admin_set_org_module", {
      _org: orgId,
      _module: module as never,
      _status: (isTrial ? "trial" : action) as never,
      _ends_at: isTrial ? new Date(Date.now() + days * 86400000).toISOString() : null,
    });
    setSaving(null);
    if (error) toast.error(error.message);
    else { toast.success("Module updated"); load(); }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Boxes className="h-6 w-6" /> Suite Modules</h1>
        <p className="text-sm text-muted-foreground">
          Decide which modules each client company has. Their own Suite admin then switches them on and assigns them to team members.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
          <CardTitle className="text-base">Client companies ({filtered.length})</CardTitle>
          <div className="flex items-center gap-3">
            <label className="text-xs text-muted-foreground flex items-center gap-2">
              Trial length (days)
              <Input className="w-16 h-8" value={trialDays} onChange={(e) => setTrialDays(e.target.value.replace(/\D/g, ""))} />
            </label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input className="pl-8 w-64 h-9" placeholder="Search company" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="h-5 w-5 animate-spin" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  {MODULES.map((m) => <TableHead key={m.key}>{m.label}</TableHead>)}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-medium">{o.name || o.id.slice(0, 8)}</TableCell>
                    {MODULES.map((m) => {
                      const row = byOrg[o.id]?.[m.key];
                      const key = `${o.id}:${m.key}`;
                      return (
                        <TableCell key={m.key}>
                          <div className="flex flex-col gap-1.5 min-w-[150px]">
                            <div className="flex items-center gap-2">
                              {row ? <Badge variant={STATUS_VARIANT[row.status]}>{row.status}</Badge> : <span className="text-xs text-muted-foreground">Not granted</span>}
                              {row && !row.enabled && <span className="text-xs text-muted-foreground">off by client</span>}
                            </div>
                            {row?.ends_at && <span className="text-xs text-muted-foreground">ends {new Date(row.ends_at).toLocaleDateString()}</span>}
                            <Select disabled={saving === key} onValueChange={(v) => setModule(o.id, m.key, v as Status | "trial_days")}>
                              <SelectTrigger className="h-8 text-xs"><SelectValue placeholder={saving === key ? "Saving…" : "Change…"} /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="active">Grant (active)</SelectItem>
                                <SelectItem value="trial_days">Grant trial ({trialDays || 14} days)</SelectItem>
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
