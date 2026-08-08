import { useEffect, useState } from "react";
import { Loader2, UserCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useBusinessWorkspace } from "@/hooks/useBusinessWorkspace";

export default function BusinessProfile() {
  const { user } = useAuth();
  const { account, members, refresh } = useBusinessWorkspace();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const self = members.find((m) => m.user_id === user?.id);
  const [form, setForm] = useState({ contact_name: "", phone: "", country: "", job_title: "" });

  useEffect(() => {
    setForm({
      contact_name: account?.contact_name ?? "",
      phone: account?.phone ?? "",
      country: account?.country ?? "",
      job_title: self?.job_title ?? "",
    });
  }, [account, self]);

  const save = async () => {
    if (!account) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("business_accounts").update({
        contact_name: form.contact_name || null,
        phone: form.phone || null,
        country: form.country || null,
      }).eq("id", account.id);
      if (error) throw error;
      if (self) await supabase.from("business_members").update({ job_title: form.job_title || null }).eq("id", self.id);
      toast({ title: "Profile updated" });
      refresh();
    } catch (e) {
      toast({ title: "Could not save", description: e instanceof Error ? e.message : "Try again", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
        <p className="text-muted-foreground">Your personal details within {account?.company_name}.</p>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2"><UserCircle className="w-4 h-4 text-teal" /> Personal details</CardTitle>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" value={form.contact_name} onChange={(e) => setForm({ ...form, contact_name: e.target.value })} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="mail">Email</Label>
            <Input id="mail" value={user?.email ?? ""} disabled />
            <p className="text-xs text-muted-foreground">Your sign-in email cannot be changed here — contact support@worldaml.com.</p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="title">Job title</Label>
            <Input id="title" value={form.job_title} onChange={(e) => setForm({ ...form, job_title: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="country">Country</Label>
            <Input id="country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <Button onClick={save} disabled={saving} variant="accent">
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save profile
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
