import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Search, ShieldCheck, ShieldOff, KeyRound, Users } from "lucide-react";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";

interface UserRow {
  id: string;
  user_id: string;
  email: string | null;
  full_name: string | null;
  company_name: string | null;
  subscription_tier: string;
  regulator: string | null;
  suite_access_granted_at: string | null;
  status: string;
}

const REGULATORS = ["FINTRAC", "FinCEN", "FCA", "CySEC", "BaFin", "AUSTRAC", "MAS", "JFSA", "CBB", "DFSA"];

export default function AdminSuiteAccess() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkRegulator, setBulkRegulator] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [singleLoading, setSingleLoading] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("id, user_id, email, full_name, company_name, subscription_tier, regulator, suite_access_granted_at, status")
      .order("created_at", { ascending: false });
    if (error) { toast.error("Failed to load users"); console.error(error); }
    else setUsers((data as UserRow[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchSearch = !q || (u.email || "").toLowerCase().includes(q) || (u.full_name || "").toLowerCase().includes(q) || (u.company_name || "").toLowerCase().includes(q);
    const matchTier = tierFilter === "all" || (tierFilter === "suite" ? u.subscription_tier === "suite" || u.subscription_tier === "enterprise" : u.subscription_tier === tierFilter);
    return matchSearch && matchTier;
  });

  const hasSuiteAccess = (u: UserRow) => u.subscription_tier === "suite" || u.subscription_tier === "enterprise";
  const suiteCount = users.filter(hasSuiteAccess).length;

  const toggleSelect = (userId: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((u) => u.user_id)));
  };

  const grantAccess = async (email: string, regulator?: string) => {
    setSingleLoading(email);
    const { error } = await supabase.rpc("admin_grant_suite_access", {
      target_email: email,
      target_regulator: regulator || null,
    });
    if (error) { toast.error(`Failed to grant access to ${email}`); console.error(error); }
    else { toast.success(`Suite access granted to ${email}`); }
    setSingleLoading(null);
    fetchUsers();
  };

  const revokeAccess = async (email: string) => {
    setSingleLoading(email);
    const { error } = await supabase.rpc("admin_revoke_suite_access", { target_email: email });
    if (error) { toast.error(`Failed to revoke access for ${email}`); console.error(error); }
    else { toast.success(`Suite access revoked for ${email}`); }
    setSingleLoading(null);
    fetchUsers();
  };

  const bulkGrant = async () => {
    if (selected.size === 0) { toast.error("No users selected"); return; }
    if (!bulkRegulator) { toast.error("Select a regulator for bulk grant"); return; }
    setActionLoading(true);
    const emails = users.filter((u) => selected.has(u.user_id) && u.email).map((u) => u.email!);
    let success = 0;
    for (const email of emails) {
      const { error } = await supabase.rpc("admin_grant_suite_access", { target_email: email, target_regulator: bulkRegulator });
      if (!error) success++;
    }
    toast.success(`Granted suite access to ${success}/${emails.length} users`);
    setSelected(new Set());
    setActionLoading(false);
    fetchUsers();
  };

  const bulkRevoke = async () => {
    if (selected.size === 0) { toast.error("No users selected"); return; }
    setActionLoading(true);
    const emails = users.filter((u) => selected.has(u.user_id) && u.email).map((u) => u.email!);
    let success = 0;
    for (const email of emails) {
      const { error } = await supabase.rpc("admin_revoke_suite_access", { target_email: email });
      if (!error) success++;
    }
    toast.success(`Revoked suite access for ${success}/${emails.length} users`);
    setSelected(new Set());
    setActionLoading(false);
    fetchUsers();
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Suite Access Management</h1>
        <p className="text-sm text-muted-foreground mt-1">Grant or revoke WorldAML Suite access for users</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card className="border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <Users className="h-5 w-5 text-blue-500" />
            <div>
              <p className="text-2xl font-bold text-foreground">{users.length}</p>
              <p className="text-muted-foreground text-xs">Total Users</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <KeyRound className="h-5 w-5 text-emerald-500" />
            <div>
              <p className="text-2xl font-bold text-foreground">{suiteCount}</p>
              <p className="text-muted-foreground text-xs">Suite Users</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-purple-500" />
            <div>
              <p className="text-2xl font-bold text-foreground">{selected.size}</p>
              <p className="text-muted-foreground text-xs">Selected</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Bulk Actions */}
      <div className="flex flex-wrap gap-3 items-end">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name, email, or company..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={tierFilter} onValueChange={setTierFilter}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Filter tier" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tiers</SelectItem>
            <SelectItem value="free">Free</SelectItem>
            <SelectItem value="academy">Academy</SelectItem>
            <SelectItem value="suite">Suite / Enterprise</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {selected.size > 0 && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-4 flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-foreground">{selected.size} user{selected.size > 1 ? "s" : ""} selected</span>
            <Select value={bulkRegulator} onValueChange={setBulkRegulator}>
              <SelectTrigger className="w-[150px] h-8 text-xs"><SelectValue placeholder="Regulator..." /></SelectTrigger>
              <SelectContent>
                {REGULATORS.map((r) => (<SelectItem key={r} value={r}>{r}</SelectItem>))}
              </SelectContent>
            </Select>
            <Button size="sm" onClick={bulkGrant} disabled={actionLoading} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {actionLoading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <ShieldCheck className="h-3 w-3 mr-1" />} Grant Suite Access
            </Button>
            <Button size="sm" variant="outline" onClick={bulkRevoke} disabled={actionLoading} className="text-destructive border-destructive/30 hover:bg-destructive/10">
              {actionLoading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <ShieldOff className="h-3 w-3 mr-1" />} Revoke Access
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())} className="text-muted-foreground">Clear</Button>
          </CardContent>
        </Card>
      )}

      {/* User Table */}
      <Card className="border-border">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : filtered.length === 0 ? (
            <p className="text-muted-foreground text-sm py-8 text-center">No users match your search.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left bg-muted/30">
                    <th className="p-3 w-10">
                      <Checkbox checked={selected.size === filtered.length && filtered.length > 0} onCheckedChange={toggleAll} />
                    </th>
                    <th className="p-3 font-semibold text-foreground">User</th>
                    <th className="p-3 font-semibold text-foreground">Company</th>
                    <th className="p-3 font-semibold text-foreground">Tier</th>
                    <th className="p-3 font-semibold text-foreground">Regulator</th>
                    <th className="p-3 font-semibold text-foreground">Suite Access</th>
                    <th className="p-3 font-semibold text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u) => {
                    const hasAccess = hasSuiteAccess(u);
                    return (
                      <tr key={u.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                        <td className="p-3">
                          <Checkbox checked={selected.has(u.user_id)} onCheckedChange={() => toggleSelect(u.user_id)} />
                        </td>
                        <td className="p-3">
                          <div className="font-medium text-foreground">{u.full_name || "—"}</div>
                          <div className="text-xs text-muted-foreground">{u.email || "—"}</div>
                        </td>
                        <td className="p-3 text-muted-foreground">{u.company_name || "—"}</td>
                        <td className="p-3">
                          <Badge variant={hasAccess ? "default" : "secondary"} className="text-[10px]">
                            {u.subscription_tier}
                          </Badge>
                        </td>
                        <td className="p-3 text-muted-foreground text-xs">{u.regulator || "—"}</td>
                        <td className="p-3">
                          {hasAccess ? (
                            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[10px]">Active</Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px] text-muted-foreground">No access</Badge>
                          )}
                        </td>
                        <td className="p-3">
                          {u.email && (
                            hasAccess ? (
                              <Button size="sm" variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10 h-7 text-xs"
                                disabled={singleLoading === u.email} onClick={() => revokeAccess(u.email!)}>
                                {singleLoading === u.email ? <Loader2 className="h-3 w-3 animate-spin" /> : <ShieldOff className="h-3 w-3 mr-1" />} Revoke
                              </Button>
                            ) : (
                              <Button size="sm" variant="outline" className="text-emerald-700 border-emerald-300 hover:bg-emerald-50 h-7 text-xs"
                                disabled={singleLoading === u.email} onClick={() => grantAccess(u.email!, u.regulator || "")}>
                                {singleLoading === u.email ? <Loader2 className="h-3 w-3 animate-spin" /> : <ShieldCheck className="h-3 w-3 mr-1" />} Grant
                              </Button>
                            )
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
