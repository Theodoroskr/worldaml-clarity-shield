import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft, Users, Plus, Trash2, Mail, Shield, UserCog, Loader2,
  Crown, Eye, AlertTriangle, CheckCircle2, X,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import ScreeningLayout from "@/components/screening/ScreeningLayout";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { useAuth } from "@/contexts/AuthContext";

interface TeamMember {
  user_id: string | null;
  email: string;
  full_name: string | null;
  job_title: string | null;
  role: string;
  is_invite: boolean;
  created_at: string;
  created_by: string | null;
}

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin / Manager",
  analyst: "Analyst",
  viewer: "Viewer",
  mlro_approver: "MLRO Approver",
};

const ROLE_DESCRIPTIONS: Record<string, string> = {
  admin: "Full access: manage team, billing and screening settings.",
  analyst: "Run screenings, review matches and record decisions on assigned cases.",
  viewer: "Read-only access to cases and screening history.",
  mlro_approver: "Can resolve escalated matches and approve high-risk decisions.",
};

export default function ScreeningTeam() {
  const {
    isLoading: accessLoading,
    hasAccess,
    isAdmin,
    seatQuota,
    seatsUsed,
  } = useScreeningAccess();
  const { profile } = useAuth();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<string>("analyst");
  const [inviteBusy, setInviteBusy] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<TeamMember | null>(null);
  const [removeBusy, setRemoveBusy] = useState(false);

  const activeSeats = members.length;
  const seatLimit = seatQuota ?? null;
  const seatsFull = seatLimit != null && activeSeats >= seatLimit;

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc("screening_team_members");
    if (error) {
      toast.error("Could not load team members: " + error.message);
    } else {
      setMembers((data as unknown as TeamMember[]) ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (hasAccess) load();
  }, [hasAccess, load]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setInviteBusy(true);
    const { error } = await supabase.rpc("invite_screening_member", {
      _email: inviteEmail.trim(),
      _role: inviteRole as any,
    });

    if (error) {
      setInviteBusy(false);
      toast.error(error.message);
      return;
    }

    // Notify the invited user by email (best-effort; don't block UI on failure)
    try {
      const existing = members.find((m) => m.email.toLowerCase() === inviteEmail.trim().toLowerCase());
      await supabase.functions.invoke("send-screening-invite-email", {
        body: {
          email: inviteEmail.trim(),
          inviter_name: profile?.full_name || profile?.email || "Your organisation",
          role: ROLE_LABELS[inviteRole] || inviteRole,
          is_new_user: !existing?.user_id,
        },
      });
    } catch (err: any) {
      console.warn("Failed to send screening invite email:", err);
    }

    setInviteBusy(false);
    toast.success("Invitation sent");
    setInviteEmail("");
    setInviteOpen(false);
    load();
  };

  const handleRoleChange = async (member: TeamMember, role: string) => {
    if (!member.user_id) {
      toast.error("Cannot change role for a pending email invite");
      return;
    }
    const { error } = await supabase.rpc("set_screening_member_role", {
      _user_id: member.user_id,
      _role: role as any,
    });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Role updated");
      load();
    }
  };

  const handleRemove = async () => {
    if (!removeTarget?.user_id) return;
    setRemoveBusy(true);
    const { error } = await supabase.rpc("remove_screening_member", {
      _user_id: removeTarget.user_id,
    });
    setRemoveBusy(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Member removed");
      setRemoveTarget(null);
      load();
    }
  };

  if (accessLoading || loading) {
    return (
  <ScreeningLayout
      head={
        <SEO title="Screening Team & Access" description="Manage Screening workspace members, roles and seat allocation." noindex />
      }
    >
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" /> Loading team…
        </div>
      </ScreeningLayout>
    );
  }

  if (!hasAccess) {
    return (
  <ScreeningLayout
      head={
        <SEO title="Screening Team & Access" description="Manage Screening workspace members, roles and seat allocation." noindex />
      }
    >
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="h-5 w-5 text-teal" /> Screening access required
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Team management is only available for active WorldAML Screening & Monitoring organisations.
              </p>
              <Button asChild variant="accent">
                <Link to="/screening-monitoring/pricing">View packages</Link>
              </Button>
            </CardContent>
        </Card>
      </ScreeningLayout>
    );
  }

  return (
    <ScreeningLayout
      head={
        <SEO title="Screening Team & Access" description="Manage Screening workspace members, roles and seat allocation." noindex />
      }
    >
        <div className="mb-6 flex items-center gap-3">
          <Button asChild variant="ghost" size="sm">
            <Link to="/screening">
              <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to Screening
            </Link>
          </Button>
        </div>

        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
              <Users className="h-6 w-6 text-teal" /> Team & Access
            </h1>
            <p className="text-sm text-muted-foreground max-w-2xl mt-1">
              Manage who can screen, review matches and approve escalations in your organisation.
            </p>
          </div>
          {isAdmin && (
            <Button onClick={() => setInviteOpen(true)} variant="accent" disabled={seatsFull}>
              <Plus className="mr-1.5 h-4 w-4" /> Invite member
            </Button>
          )}
        </header>

        {!isAdmin && (
          <Card className="mb-6 border-amber-200 bg-amber-50/50">
            <CardContent className="py-4 flex items-start gap-3 text-sm text-amber-800">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <p>Only Screening admins can invite or remove team members. Contact your organisation manager to request changes.</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Members</CardTitle>
            <CardDescription>
              {members.length} seat{members.length !== 1 ? "s" : ""} allocated
              {seatLimit != null && ` / ${seatLimit} included`}
              {seatsFull && (
                <span className="ml-2 text-amber-600">Seat quota reached</span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((m) => (
                  <TableRow key={m.user_id ?? m.email}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="rounded-full bg-primary/10 p-2 text-primary">
                          {m.role === "admin" ? <Crown className="h-4 w-4" /> : <UserCog className="h-4 w-4" />}
                        </div>
                        <div>
                          <div className="font-medium text-sm">
                            {m.full_name || m.email}
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Mail className="h-3 w-3" /> {m.email}
                            {m.job_title && <span className="text-slate-400">· {m.job_title}</span>}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {isAdmin ? (
                        <Select
                          value={m.role}
                          onValueChange={(v) => handleRoleChange(m, v)}
                        >
                          <SelectTrigger className="w-44">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(ROLE_LABELS).map(([key, label]) => (
                              <SelectItem key={key} value={key}>{label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge variant="secondary">{ROLE_LABELS[m.role] ?? m.role}</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {m.is_invite ? (
                        <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">
                          Pending invite
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50">
                          <CheckCircle2 className="mr-1 h-3 w-3" /> Active
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {isAdmin && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setRemoveTarget(m)}
                          title="Remove member"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {members.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      No team members found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Object.entries(ROLE_LABELS).map(([key, label]) => (
            <Card key={key} className="bg-muted/30">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-1">
                  {key === "admin" ? <Crown className="h-4 w-4 text-teal" /> :
                   key === "mlro_approver" ? <Shield className="h-4 w-4 text-teal" /> :
                   key === "viewer" ? <Eye className="h-4 w-4 text-teal" /> : <UserCog className="h-4 w-4 text-teal" />}
                  <span className="font-medium text-sm">{label}</span>
                </div>
                <p className="text-xs text-muted-foreground">{ROLE_DESCRIPTIONS[key]}</p>
              </CardContent>
            </Card>
          ))}
        </div>

      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleInvite}>
            <DialogHeader>
              <DialogTitle>Invite team member</DialogTitle>
              <DialogDescription>
                Add an analyst, approver or viewer to your Screening workspace.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="colleague@company.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={inviteRole} onValueChange={setInviteRole}>
                  <SelectTrigger id="role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ROLE_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">{ROLE_DESCRIPTIONS[inviteRole]}</p>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setInviteOpen(false)}>
                <X className="mr-1.5 h-4 w-4" /> Cancel
              </Button>
              <Button type="submit" disabled={inviteBusy || !inviteEmail.trim()}>
                {inviteBusy ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Mail className="mr-1.5 h-4 w-4" />}
                Send invite
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!removeTarget} onOpenChange={(open) => !open && setRemoveTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Remove team member?</DialogTitle>
            <DialogDescription>
              {removeTarget && (
                <>
                  This will remove <strong>{removeTarget.email}</strong> from your Screening workspace.
                  They will lose access immediately.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRemoveTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleRemove} disabled={removeBusy}>
              {removeBusy ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Trash2 className="mr-1.5 h-4 w-4" />}
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </ScreeningLayout>
  );
}
