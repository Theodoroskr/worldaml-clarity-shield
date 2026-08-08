import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, ShieldCheck, UserPlus, Trash2, Lock } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";

interface InternalRow {
  email: string;
  user_id: string | null;
  is_admin: boolean;
  invited_at: string | null;
  accepted_at: string | null;
  note: string | null;
}

export default function AdminInternalAccess() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-internal-access"],
    queryFn: async (): Promise<InternalRow[]> => {
      const { data, error } = await supabase.rpc("admin_list_internal_access");
      if (error) throw error;
      return (data || []) as InternalRow[];
    },
  });

  const invite = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc("admin_invite_internal", {
        _email: email.trim(),
        _note: note.trim() || null,
      });
      if (error) throw error;
      return data as { status?: string };
    },
    onSuccess: (res) => {
      toast.success(
        res?.status === "granted"
          ? "Internal access granted — they can sign in at /admin/login"
          : "Invitation recorded — access activates when they create their account"
      );
      setEmail("");
      setNote("");
      qc.invalidateQueries({ queryKey: ["admin-internal-access"] });
    },
    onError: (e: Error) => toast.error(e.message || "Could not send the invitation"),
  });

  const revoke = useMutation({
    mutationFn: async (target: string) => {
      const { error } = await supabase.rpc("admin_revoke_internal", { _email: target });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Internal access revoked");
      qc.invalidateQueries({ queryKey: ["admin-internal-access"] });
    },
    onError: (e: Error) => toast.error(e.message || "Could not revoke access"),
  });

  const rows = data || [];

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-primary" /> Internal Access
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          The admin portal is internal-only. It is not linked anywhere on the public site — staff sign in
          directly at <code className="text-foreground">/admin/login</code>. Access is granted here, by invitation only.
        </p>
      </div>

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
            className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
            onSubmit={(e) => { e.preventDefault(); if (email.trim()) invite.mutate(); }}
          >
            <div className="space-y-1.5">
              <Label htmlFor="invite-email">Work email</Label>
              <Input id="invite-email" type="email" required placeholder="name@worldaml.com"
                value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="invite-note">Note (optional)</Label>
              <Input id="invite-note" placeholder="Role or reason" value={note} onChange={(e) => setNote(e.target.value)} />
            </div>
            <Button type="submit" disabled={invite.isPending || !email.trim()}>
              {invite.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Invite
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Lock className="h-4 w-4" /> Internal staff & pending invitations</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
          ) : error ? (
            <p className="text-sm text-destructive">Could not load internal access list.</p>
          ) : rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">No internal users recorded yet.</p>
          ) : (
            <div className="divide-y divide-border">
              {rows.map((r) => (
                <div key={r.email} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-foreground truncate">{r.email}</div>
                    <div className="text-xs text-muted-foreground">
                      {r.note ? `${r.note} · ` : ""}
                      {r.invited_at ? `Invited ${format(new Date(r.invited_at), "d MMM yyyy")}` : "Existing admin"}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={r.is_admin ? "default" : "secondary"}>
                      {r.is_admin ? "Active admin" : "Pending sign-up"}
                    </Badge>
                    <Button
                      size="sm" variant="ghost"
                      disabled={revoke.isPending || (!!user && r.user_id === user.id)}
                      onClick={() => revoke.mutate(r.email)}
                      title={!!user && r.user_id === user.id ? "You cannot revoke your own access" : "Revoke access"}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
