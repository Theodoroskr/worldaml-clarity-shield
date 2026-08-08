import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Loader2, ShieldCheck, UserPlus, Lock, MoreHorizontal, Search, Info,
  History, PauseCircle, PlayCircle, UserCog, Eye, ShieldOff,
} from "lucide-react";
import { toast } from "sonner";
import { format, formatDistanceToNowStrict } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";

/** Access profiles are governance labels stored against each staff member.
 *  They document why access was granted and drive review/reporting — the
 *  underlying entitlement is still a single admin role (see page footnote). */
export const ACCESS_ROLES: Record<string, string> = {
  super_admin: "Super Admin",
  full_admin: "Full Admin",
  management: "Management",
  marketing: "Marketing",
  sales: "Sales",
  finance: "Finance",
  compliance_ops: "Compliance / Operations",
  academy: "Academy",
  partner_management: "Partner Management",
  read_only: "Read Only",
};

const DEPARTMENTS = [
  "Executive",
  "Marketing",
  "Sales",
  "Finance",
  "Compliance",
  "Operations",
  "Academy",
  "Partnerships",
  "Technology",
];

interface InternalRow {
  email: string;
  user_id: string | null;
  full_name: string | null;
  company_name: string | null;
  phone: string | null;
  is_admin: boolean;
  access_role: string;
  department: string | null;
  status: "active" | "pending" | "suspended";
  account_created_at: string | null;
  admin_since: string | null;
  invited_at: string | null;
  accepted_at: string | null;
  suspended_at: string | null;
  last_sign_in_at: string | null;
  granted_by_email: string | null;
  note: string | null;
}

interface AuditRow {
  id: string;
  target_email: string;
  action: string;
  detail: string | null;
  previous_value: string | null;
  new_value: string | null;
  performed_by_email: string | null;
  created_at: string;
}

const STATUS_STYLES: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
  pending: "bg-amber-500/10 text-amber-600 border-amber-500/30",
  suspended: "bg-orange-500/10 text-orange-600 border-orange-500/30",
};

const STATUS_LABELS: Record<string, string> = {
  active: "Active",
  pending: "Pending invitation",
  suspended: "Suspended",
};

const ACTION_LABELS: Record<string, string> = {
  invitation_sent: "Invitation sent",
  access_granted: "Access granted",
  role_changed: "Access profile changed",
  access_suspended: "Access suspended",
  access_restored: "Access restored",
  access_removed: "Access removed",
};

export default function AdminInternalAccess() {
  const qc = useQueryClient();
  const { user } = useAuth();

  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [accessRole, setAccessRole] = useState("full_admin");
  const [department, setDepartment] = useState<string>("none");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [deptFilter, setDeptFilter] = useState("all");

  const [confirmRemove, setConfirmRemove] = useState<InternalRow | null>(null);
  const [editRow, setEditRow] = useState<InternalRow | null>(null);
  const [editRole, setEditRole] = useState("full_admin");
  const [editDept, setEditDept] = useState("none");
  const [viewRow, setViewRow] = useState<InternalRow | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-internal-access"],
    queryFn: async (): Promise<InternalRow[]> => {
      const { data, error } = await supabase.rpc("admin_list_internal_access");
      if (error) throw error;
      return (data || []) as InternalRow[];
    },
  });

  const audit = useQuery({
    queryKey: ["admin-access-audit"],
    queryFn: async (): Promise<AuditRow[]> => {
      const { data, error } = await supabase
        .from("admin_access_audit")
        .select("id, target_email, action, detail, previous_value, new_value, performed_by_email, created_at")
        .order("created_at", { ascending: false })
        .limit(25);
      if (error) throw error;
      return (data || []) as AuditRow[];
    },
  });

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["admin-internal-access"] });
    qc.invalidateQueries({ queryKey: ["admin-access-audit"] });
  };

  const invite = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc("admin_invite_internal", {
        _email: email.trim(),
        _note: note.trim() || null,
        _access_role: accessRole,
        _department: department === "none" ? null : department,
      });
      if (error) throw error;
      return data as { status?: string };
    },
    onSuccess: (res) => {
      if (res?.status === "already_active") {
        toast.info("This user already has internal access.");
        return;
      }
      if (res?.status === "already_pending") {
        toast.info("An invitation has already been sent to this address.");
        return;
      }
      toast.success(
        res?.status === "granted"
          ? "Internal access granted — they can sign in at /admin/login"
          : "Invitation recorded — access activates when they create their account",
      );
      setEmail("");
      setNote("");
      setDepartment("none");
      setAccessRole("full_admin");
      refresh();
    },
    onError: (e: Error) => toast.error(e.message || "Could not send the invitation"),
  });

  const setRole = useMutation({
    mutationFn: async ({ target, role, dept }: { target: string; role: string; dept: string | null }) => {
      const { error } = await supabase.rpc("admin_set_internal_role", {
        _email: target, _access_role: role, _department: dept,
      });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Access profile updated"); setEditRow(null); refresh(); },
    onError: (e: Error) => toast.error(e.message || "Could not update the access profile"),
  });

  const suspend = useMutation({
    mutationFn: async ({ target, value }: { target: string; value: boolean }) => {
      const { error } = await supabase.rpc("admin_suspend_internal", { _email: target, _suspend: value });
      if (error) throw error;
    },
    onSuccess: (_d, v) => { toast.success(v.value ? "Access suspended" : "Access restored"); refresh(); },
    onError: (e: Error) => toast.error(e.message || "Could not change the access status"),
  });

  const revoke = useMutation({
    mutationFn: async (target: string) => {
      const { error } = await supabase.rpc("admin_revoke_internal", { _email: target });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Admin access removed — the WorldAML account is untouched"); setConfirmRemove(null); refresh(); },
    onError: (e: Error) => { toast.error(e.message || "Could not remove access"); setConfirmRemove(null); },
  });

  const rows = data || [];

  const departmentsPresent = useMemo(
    () => Array.from(new Set(rows.map((r) => r.department).filter(Boolean) as string[])).sort(),
    [rows],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (roleFilter !== "all" && r.access_role !== roleFilter) return false;
      if (deptFilter !== "all" && (r.department || "") !== deptFilter) return false;
      if (!q) return true;
      return (
        r.email.toLowerCase().includes(q) ||
        (r.full_name || "").toLowerCase().includes(q) ||
        (r.company_name || "").toLowerCase().includes(q) ||
        (r.department || "").toLowerCase().includes(q)
      );
    });
  }, [rows, search, statusFilter, roleFilter, deptFilter]);

  const counts = useMemo(() => ({
    active: rows.filter((r) => r.status === "active").length,
    pending: rows.filter((r) => r.status === "pending").length,
    suspended: rows.filter((r) => r.status === "suspended").length,
  }), [rows]);

  const isSelf = (r: InternalRow) => !!user && r.user_id === user.id;
  const lastAdmin = counts.active <= 1;

  const openEdit = (r: InternalRow) => {
    setEditRow(r);
    setEditRole(r.access_role || "full_admin");
    setEditDept(r.department || "none");
  };

  const dateLabel = (v: string | null) =>
    v ? format(new Date(v), "dd MMM yyyy") : "—";

  const lastLoginLabel = (r: InternalRow) => {
    if (!r.last_sign_in_at) return "Never";
    return `${format(new Date(r.last_sign_in_at), "dd MMM yyyy · HH:mm")}`;
  };

  return (
    <TooltipProvider>
      <div className="p-4 sm:p-6 space-y-6 max-w-6xl">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-primary" /> Internal Access
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage authorised WorldAML staff with access to the internal Admin Portal.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Admin access is invitation-only and should be granted according to role and business need.
            Staff sign in directly at <code className="text-foreground">/admin/login</code>; this portal is not linked publicly.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Card><CardContent className="p-3">
            <div className="text-xs text-muted-foreground">Active</div>
            <div className="text-xl font-semibold text-emerald-600">{counts.active}</div>
          </CardContent></Card>
          <Card><CardContent className="p-3">
            <div className="text-xs text-muted-foreground">Pending invitations</div>
            <div className="text-xl font-semibold text-amber-600">{counts.pending}</div>
          </CardContent></Card>
          <Card><CardContent className="p-3">
            <div className="text-xs text-muted-foreground">Suspended</div>
            <div className="text-xl font-semibold text-orange-600">{counts.suspended}</div>
          </CardContent></Card>
        </div>

        {/* Invite */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><UserPlus className="h-4 w-4" /> Invite a colleague</CardTitle>
            <CardDescription>
              If they already have a WorldAML account, internal access is granted immediately. Otherwise it activates
              automatically the first time they sign up with this email.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1.3fr_1fr_1fr_1.3fr_auto] xl:items-end"
              onSubmit={(e) => { e.preventDefault(); if (email.trim()) invite.mutate(); }}
            >
              <div className="space-y-1.5">
                <Label htmlFor="invite-email">Work email</Label>
                <Input id="invite-email" type="email" required placeholder="name@worldaml.com"
                  value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="invite-role" className="flex items-center gap-1">
                  Access profile
                  <Tooltip>
                    <TooltipTrigger asChild><Info className="h-3 w-3 text-muted-foreground" /></TooltipTrigger>
                    <TooltipContent className="max-w-xs text-xs">
                      Records the role this person was approved for. Portal navigation is still full-admin —
                      per-section restrictions require the permission work noted at the bottom of this page.
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <Select value={accessRole} onValueChange={setAccessRole}>
                  <SelectTrigger id="invite-role"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    {Object.entries(ACCESS_ROLES).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="invite-dept">Department</Label>
                <Select value={department} onValueChange={setDepartment}>
                  <SelectTrigger id="invite-dept"><SelectValue placeholder="Not set" /></SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    <SelectItem value="none">Not set</SelectItem>
                    {DEPARTMENTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="invite-note">Note (optional)</Label>
                <Input id="invite-note" placeholder="Responsible for Academy and campaign analytics"
                  value={note} onChange={(e) => setNote(e.target.value)} />
              </div>
              <Button type="submit" disabled={invite.isPending || !email.trim()}>
                {invite.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Invite
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Staff */}
        <Card>
          <CardHeader className="space-y-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Lock className="h-4 w-4" /> Internal staff &amp; pending invitations
            </CardTitle>
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input className="pl-8 h-9" placeholder="Search staff…" value={search}
                  onChange={(e) => setSearch(e.target.value)} />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-9"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending invitation</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="h-9"><SelectValue placeholder="Access profile" /></SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  <SelectItem value="all">All access profiles</SelectItem>
                  {Object.entries(ACCESS_ROLES).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={deptFilter} onValueChange={setDeptFilter}>
                <SelectTrigger className="h-9"><SelectValue placeholder="Department" /></SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  <SelectItem value="all">All departments</SelectItem>
                  {departmentsPresent.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
            ) : error ? (
              <p className="text-sm text-destructive">Could not load internal access list.</p>
            ) : filtered.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {rows.length === 0 ? "No internal users recorded yet." : "No staff match the current filters."}
              </p>
            ) : (
              <>
                {/* Desktop table */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-xs uppercase text-muted-foreground">
                        <th className="text-left py-2 pr-3">Staff member</th>
                        <th className="text-left py-2 pr-3">Access profile</th>
                        <th className="text-left py-2 pr-3">Department</th>
                        <th className="text-left py-2 pr-3">Status</th>
                        <th className="text-left py-2 pr-3">Admin since</th>
                        <th className="text-left py-2 pr-3">Last admin login</th>
                        <th className="text-left py-2 pr-3">Granted by</th>
                        <th className="text-right py-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filtered.map((r) => (
                        <tr key={r.email} className="hover:bg-muted/30">
                          <td className="py-2.5 pr-3">
                            <div className="font-medium text-foreground">{r.full_name || "—"}</div>
                            <div className="text-xs text-muted-foreground">{r.email}</div>
                            {(r.company_name || r.phone) && (
                              <div className="text-[11px] text-muted-foreground">
                                {[r.company_name, r.phone].filter(Boolean).join(" · ")}
                              </div>
                            )}
                          </td>
                          <td className="py-2.5 pr-3">
                            <Badge variant="outline" className="text-[10px]">{ACCESS_ROLES[r.access_role] || r.access_role}</Badge>
                          </td>
                          <td className="py-2.5 pr-3 text-muted-foreground">{r.department || "—"}</td>
                          <td className="py-2.5 pr-3">
                            <Badge variant="outline" className={`text-[10px] ${STATUS_STYLES[r.status] || ""}`}>
                              {STATUS_LABELS[r.status] || r.status}
                            </Badge>
                          </td>
                          <td className="py-2.5 pr-3 text-xs text-muted-foreground">{dateLabel(r.admin_since)}</td>
                          <td className="py-2.5 pr-3 text-xs text-muted-foreground">{lastLoginLabel(r)}</td>
                          <td className="py-2.5 pr-3 text-xs text-muted-foreground truncate max-w-[180px]">
                            {r.granted_by_email || "—"}
                          </td>
                          <td className="py-2.5 text-right">
                            <RowActions
                              row={r} self={isSelf(r)} lastAdmin={lastAdmin}
                              onView={() => setViewRow(r)}
                              onEdit={() => openEdit(r)}
                              onSuspend={(v) => suspend.mutate({ target: r.email, value: v })}
                              onRemove={() => setConfirmRemove(r)}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile cards */}
                <div className="lg:hidden divide-y divide-border">
                  {filtered.map((r) => (
                    <div key={r.email} className="py-3 flex items-start justify-between gap-3">
                      <div className="min-w-0 space-y-1">
                        <div className="text-sm font-medium text-foreground truncate">{r.full_name || r.email}</div>
                        <div className="text-xs text-muted-foreground truncate">{r.email}</div>
                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                          <Badge variant="outline" className={`text-[10px] ${STATUS_STYLES[r.status] || ""}`}>
                            {STATUS_LABELS[r.status] || r.status}
                          </Badge>
                          <Badge variant="outline" className="text-[10px]">{ACCESS_ROLES[r.access_role] || r.access_role}</Badge>
                          {r.department && <Badge variant="secondary" className="text-[10px]">{r.department}</Badge>}
                        </div>
                        <div className="text-[11px] text-muted-foreground">Last login: {lastLoginLabel(r)}</div>
                      </div>
                      <RowActions
                        row={r} self={isSelf(r)} lastAdmin={lastAdmin}
                        onView={() => setViewRow(r)}
                        onEdit={() => openEdit(r)}
                        onSuspend={(v) => suspend.mutate({ target: r.email, value: v })}
                        onRemove={() => setConfirmRemove(r)}
                      />
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Audit */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><History className="h-4 w-4" /> Internal access audit</CardTitle>
            <CardDescription>Every access change made from this page, newest first.</CardDescription>
          </CardHeader>
          <CardContent>
            {audit.isLoading ? (
              <div className="space-y-2">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-6 w-full" />)}</div>
            ) : !audit.data?.length ? (
              <p className="text-sm text-muted-foreground">
                No access changes recorded yet. Invitations, role changes, suspensions and removals appear here.
              </p>
            ) : (
              <div className="divide-y divide-border">
                {audit.data.map((a) => (
                  <div key={a.id} className="py-2 flex flex-wrap items-center justify-between gap-2 text-sm">
                    <div className="min-w-0">
                      <span className="text-foreground">{ACTION_LABELS[a.action] || a.action}</span>
                      <span className="text-muted-foreground"> · {a.target_email}</span>
                      {a.previous_value && a.new_value && (
                        <span className="text-xs text-muted-foreground">
                          {" "}({ACCESS_ROLES[a.previous_value] || a.previous_value} → {ACCESS_ROLES[a.new_value] || a.new_value})
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {a.performed_by_email || "system"} · {format(new Date(a.created_at), "dd MMM yyyy · HH:mm")}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <p className="text-[11px] text-muted-foreground">
          Access profiles and departments are recorded for governance and review. Today every internal user still
          receives the same full admin entitlement — enforcing per-team access (Marketing, Sales, Finance, Partner
          Management) at route and backend level requires a capability model on top of the current single admin role.
        </p>

        {/* View drawer */}
        <Dialog open={!!viewRow} onOpenChange={(o) => !o && setViewRow(null)}>
          <DialogContent className="bg-background">
            <DialogHeader><DialogTitle>Access details</DialogTitle></DialogHeader>
            {viewRow && (
              <div className="space-y-2 text-sm">
                <Detail label="Name" value={viewRow.full_name || "—"} />
                <Detail label="Email" value={viewRow.email} />
                <Detail label="Access profile" value={ACCESS_ROLES[viewRow.access_role] || viewRow.access_role} />
                <Detail label="Department" value={viewRow.department || "—"} />
                <Detail label="Status" value={STATUS_LABELS[viewRow.status] || viewRow.status} />
                <Detail label="Invited" value={viewRow.invited_at ? format(new Date(viewRow.invited_at), "dd MMM yyyy · HH:mm") : "Pre-existing admin"} />
                <Detail label="Access granted" value={viewRow.accepted_at ? format(new Date(viewRow.accepted_at), "dd MMM yyyy · HH:mm") : "Not yet"} />
                <Detail label="Last admin login" value={
                  viewRow.last_sign_in_at
                    ? `${format(new Date(viewRow.last_sign_in_at), "dd MMM yyyy · HH:mm")} (${formatDistanceToNowStrict(new Date(viewRow.last_sign_in_at))} ago)`
                    : "Never"
                } />
                <Detail label="Granted by" value={viewRow.granted_by_email || "—"} />
                <Detail label="Note" value={viewRow.note || "—"} />
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Change role */}
        <Dialog open={!!editRow} onOpenChange={(o) => !o && setEditRow(null)}>
          <DialogContent className="bg-background">
            <DialogHeader><DialogTitle>Change access profile</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">{editRow?.email}</p>
              <div className="space-y-1.5">
                <Label>Access profile</Label>
                <Select value={editRole} onValueChange={setEditRole}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    {Object.entries(ACCESS_ROLES).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Department</Label>
                <Select value={editDept} onValueChange={setEditDept}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    <SelectItem value="none">Not set</SelectItem>
                    {DEPARTMENTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditRow(null)}>Cancel</Button>
              <Button
                disabled={setRole.isPending}
                onClick={() => editRow && setRole.mutate({
                  target: editRow.email, role: editRole, dept: editDept === "none" ? null : editDept,
                })}
              >
                {setRole.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Remove confirmation */}
        <AlertDialog open={!!confirmRemove} onOpenChange={(o) => !o && setConfirmRemove(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove admin access for {confirmRemove?.email}?</AlertDialogTitle>
              <AlertDialogDescription>
                This user will no longer be able to access the WorldAML Admin Portal. Their WorldAML account,
                courses, certificates and history are kept — only the internal admin entitlement is revoked.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => confirmRemove && revoke.mutate(confirmRemove.email)}
              >
                Remove access
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border/60 py-1.5">
      <span className="text-muted-foreground text-xs uppercase tracking-wide">{label}</span>
      <span className="text-foreground text-right">{value}</span>
    </div>
  );
}

function RowActions({
  row, self, lastAdmin, onView, onEdit, onSuspend, onRemove,
}: {
  row: InternalRow;
  self: boolean;
  lastAdmin: boolean;
  onView: () => void;
  onEdit: () => void;
  onSuspend: (v: boolean) => void;
  onRemove: () => void;
}) {
  const protectedRow = self || (lastAdmin && row.status === "active");
  const protectionReason = self
    ? "You cannot change your own internal access"
    : "This is the last active admin — access is protected to prevent lockout";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="ghost" aria-label={`Actions for ${row.email}`}>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-popover z-50 w-52">
        <DropdownMenuItem onClick={onView}><Eye className="h-3.5 w-3.5 mr-2" /> View access</DropdownMenuItem>
        <DropdownMenuItem onClick={onEdit}><UserCog className="h-3.5 w-3.5 mr-2" /> Change role</DropdownMenuItem>
        <DropdownMenuSeparator />
        {row.status === "suspended" ? (
          <DropdownMenuItem onClick={() => onSuspend(false)}>
            <PlayCircle className="h-3.5 w-3.5 mr-2" /> Restore access
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem disabled={protectedRow} onClick={() => onSuspend(true)} title={protectedRow ? protectionReason : undefined}>
            <PauseCircle className="h-3.5 w-3.5 mr-2" /> Suspend access
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          disabled={protectedRow}
          onClick={onRemove}
          className="text-destructive focus:text-destructive"
          title={protectedRow ? protectionReason : undefined}
        >
          <ShieldOff className="h-3.5 w-3.5 mr-2" /> Remove access
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
