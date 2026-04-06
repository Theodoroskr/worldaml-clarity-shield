import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Loader2, Search, Shield, ShieldCheck, ShieldX, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface Profile {
  id: string;
  user_id: string;
  email: string | null;
  full_name: string | null;
  company_name: string | null;
  status: string;
  created_at: string;
}

export default function AdminUsers() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [userRoles, setUserRoles] = useState<Record<string, string[]>>({});

  const fetch = async () => {
    setLoading(true);
    const [{ data: p }, { data: r }] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("*"),
    ]);
    setProfiles((p || []) as Profile[]);
    const roleMap: Record<string, string[]> = {};
    (r || []).forEach((row: any) => {
      if (!roleMap[row.user_id]) roleMap[row.user_id] = [];
      roleMap[row.user_id].push(row.role);
    });
    setUserRoles(roleMap);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const updateStatus = async (profileId: string, newStatus: string) => {
    setActionLoading(profileId);
    const { error } = await supabase.from("profiles").update({ status: newStatus }).eq("id", profileId);
    if (error) toast.error("Failed to update");
    else { toast.success(`User ${newStatus}`); setProfiles(prev => prev.map(p => p.id === profileId ? { ...p, status: newStatus } : p)); }
    setActionLoading(null);
  };

  const toggleRole = async (userId: string, role: string) => {
    setActionLoading(userId);
    const hasRole = userRoles[userId]?.includes(role);
    if (hasRole) {
      await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", role as any);
      setUserRoles(prev => ({ ...prev, [userId]: (prev[userId] || []).filter(r => r !== role) }));
      toast.success(`Removed ${role} role`);
    } else {
      await supabase.from("user_roles").insert({ user_id: userId, role: role as any });
      setUserRoles(prev => ({ ...prev, [userId]: [...(prev[userId] || []), role] }));
      toast.success(`Added ${role} role`);
    }
    setActionLoading(null);
  };

  const filtered = profiles.filter(p => {
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    const q = search.toLowerCase();
    const matchSearch = !q || (p.full_name || "").toLowerCase().includes(q) || (p.email || "").toLowerCase().includes(q) || (p.company_name || "").toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const statusBadge = (s: string) => {
    if (s === "approved") return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">Approved</Badge>;
    if (s === "rejected") return <Badge className="bg-red-50 text-red-700 border-red-200">Rejected</Badge>;
    return <Badge className="bg-amber-50 text-amber-700 border-amber-200">Pending</Badge>;
  };

  return (
    <div className="p-6 space-y-5">
      <div><h1 className="text-xl font-bold text-foreground">User Management</h1><p className="text-xs text-muted-foreground">{profiles.length} registered users</p></div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs"><Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users…" className="w-full pl-8 py-2 text-sm rounded-md border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary" /></div>
        <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-32 text-sm"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All</SelectItem><SelectItem value="pending">Pending</SelectItem><SelectItem value="approved">Approved</SelectItem><SelectItem value="rejected">Rejected</SelectItem></SelectContent></Select>
      </div>

      {loading ? <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div> : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border bg-muted/30">
              {["User", "Company", "Status", "Roles", "Registered", "Actions"].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">{h}</th>)}
            </tr></thead>
            <tbody className="divide-y divide-border">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3"><div className="font-medium text-foreground">{p.full_name || "—"}</div><div className="text-xs text-muted-foreground">{p.email}</div></td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{p.company_name || "—"}</td>
                  <td className="px-4 py-3">{statusBadge(p.status)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {(userRoles[p.user_id] || []).map(r => <Badge key={r} variant="outline" className="text-xs">{r}</Badge>)}
                      {!(userRoles[p.user_id] || []).length && <span className="text-xs text-muted-foreground">user</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {p.status !== "approved" && <Button size="sm" variant="ghost" className="h-7 text-xs text-emerald-600" onClick={() => updateStatus(p.id, "approved")} disabled={actionLoading === p.id}><ShieldCheck className="w-3.5 h-3.5 mr-1" />Approve</Button>}
                      {p.status !== "rejected" && <Button size="sm" variant="ghost" className="h-7 text-xs text-destructive" onClick={() => updateStatus(p.id, "rejected")} disabled={actionLoading === p.id}><ShieldX className="w-3.5 h-3.5 mr-1" />Reject</Button>}
                      {p.user_id !== user?.id && (
                        <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => toggleRole(p.user_id, "admin")} disabled={actionLoading === p.user_id}>
                          <Shield className="w-3.5 h-3.5 mr-1" />{userRoles[p.user_id]?.includes("admin") ? "Remove Admin" : "Make Admin"}
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="text-center py-8 text-sm text-muted-foreground">No users found.</div>}
        </div>
      )}
    </div>
  );
}
