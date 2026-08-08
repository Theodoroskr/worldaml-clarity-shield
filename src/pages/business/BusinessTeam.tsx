import { useState } from "react";
import { Users, Loader2, Trash2, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useBusinessWorkspace, BUSINESS_ROLE_LABEL } from "@/hooks/useBusinessWorkspace";
import { BUSINESS_SOLUTIONS } from "@/lib/businessCatalogue";

export default function BusinessTeam() {
  const { account, members, isBusinessAdmin, ownedKeys, refresh, isLoading } = useBusinessWorkspace();
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ email: "", full_name: "", job_title: "", role: "user" });

  const invite = async () => {
    if (!account || !user) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("business_members").insert({
        business_account_id: account.id,
        email: form.email.trim().toLowerCase(),
        full_name: form.full_name || null,
        job_title: form.job_title || null,
        role: form.role,
        status: "invited",
        invited_by: user.id,
      });
      if (error) throw error;
      toast({ title: "Invitation recorded", description: `${form.email} has been added to your team.` });
      setForm({ email: "", full_name: "", job_title: "", role: "user" });
      setOpen(false);
      refresh();
    } catch (e) {
      toast({ title: "Could not add member", description: e instanceof Error ? e.message : "Try again", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const update = async (id: string, patch: { role?: string; academy_seat?: boolean; products?: string[]; status?: string }) => {
    const { error } = await supabase.from("business_members").update(patch).eq("id", id);
    if (error) toast({ title: "Update failed", description: error.message, variant: "destructive" });
    else refresh();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("business_members").delete().eq("id", id);
    if (error) toast({ title: "Remove failed", description: error.message, variant: "destructive" });
    else { toast({ title: "Access removed" }); refresh(); }
  };

  const productOptions = BUSINESS_SOLUTIONS.filter((s) => ownedKeys.includes(s.key));

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Team</h1>
          <p className="text-muted-foreground">Manage who in {account?.company_name} can access your WorldAML products.</p>
        </div>
        {isBusinessAdmin && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button variant="accent"><Mail className="mr-2 h-4 w-4" /> Invite User</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Invite a colleague</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div className="space-y-1.5"><Label htmlFor="email">Work email</Label>
                  <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
                <div className="space-y-1.5"><Label htmlFor="name">Full name</Label>
                  <Input id="name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></div>
                <div className="space-y-1.5"><Label htmlFor="title">Job title</Label>
                  <Input id="title" value={form.job_title} onChange={(e) => setForm({ ...form, job_title: e.target.value })} /></div>
                <div className="space-y-1.5"><Label>Role</Label>
                  <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="billing_admin">Billing Admin</SelectItem>
                      <SelectItem value="business_admin">Business Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Business Admins manage your organisation only — never WorldAML internal systems.</p>
                </div>
                <Button className="w-full" onClick={invite} disabled={saving || !form.email}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Add to team
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Users className="w-4 h-4 text-teal" /> Team members</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-10 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
          ) : members.length === 0 ? (
            <p className="py-8 text-sm text-muted-foreground text-center">
              No colleagues added yet. Invite your team so they can use the products you activate.
            </p>
          ) : (
            <Table>
              <TableHeader><TableRow>
                <TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Role</TableHead>
                <TableHead>Products</TableHead><TableHead>Academy seat</TableHead><TableHead>Status</TableHead>
                {isBusinessAdmin && <TableHead className="text-right">Actions</TableHead>}
              </TableRow></TableHeader>
              <TableBody>
                {members.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">{m.full_name || "—"}<span className="block text-xs text-muted-foreground">{m.job_title || ""}</span></TableCell>
                    <TableCell className="text-sm">{m.email}</TableCell>
                    <TableCell>
                      {isBusinessAdmin ? (
                        <Select value={m.role} onValueChange={(v) => update(m.id, { role: v })}>
                          <SelectTrigger className="h-8 w-36 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="billing_admin">Billing Admin</SelectItem>
                            <SelectItem value="business_admin">Business Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : BUSINESS_ROLE_LABEL[m.role] ?? m.role}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {m.products.length ? m.products.join(", ") : productOptions.length ? "None assigned" : "—"}
                    </TableCell>
                    <TableCell>
                      <Switch checked={m.academy_seat} disabled={!isBusinessAdmin}
                        onCheckedChange={(v) => update(m.id, { academy_seat: v })} />
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={m.status === "active" ? "bg-teal/15 text-teal border-teal/30" : ""}>
                        {m.status}
                      </Badge>
                    </TableCell>
                    {isBusinessAdmin && (
                      <TableCell className="text-right">
                        <Button size="sm" variant="ghost" onClick={() => remove(m.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    )}
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
