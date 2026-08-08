import { useState } from "react";
import { Loader2, ShieldCheck, KeyRound } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useBusinessWorkspace, BUSINESS_ROLE_LABEL } from "@/hooks/useBusinessWorkspace";
import MarketingPreferences from "@/components/account/MarketingPreferences";

export default function BusinessSecurity() {
  const { user } = useAuth();
  const { isOwner, members } = useBusinessWorkspace();
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);

  const self = members.find((m) => m.user_id === user?.id);
  const role = isOwner ? "business_admin" : self?.role ?? "user";

  const changePassword = async () => {
    if (password.length < 8) {
      toast({ title: "Password too short", description: "Use at least 8 characters.", variant: "destructive" });
      return;
    }
    if (password !== confirm) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSaving(false);
    if (error) toast({ title: "Could not update password", description: error.message, variant: "destructive" });
    else { toast({ title: "Password updated" }); setPassword(""); setConfirm(""); }
  };

  const sendReset = async () => {
    if (!user?.email) return;
    setSending(true);
    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setSending(false);
    if (error) toast({ title: "Could not send reset email", description: error.message, variant: "destructive" });
    else toast({ title: "Reset email sent", description: "Check your inbox to set a new password." });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Security</h1>
        <p className="text-muted-foreground">Manage how you sign in to your WorldAML business account.</p>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-teal" /> Account access</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p className="text-muted-foreground">Signed in as <span className="text-foreground">{user?.email}</span></p>
          <p className="text-muted-foreground">
            Organisation role: <span className="text-foreground">{BUSINESS_ROLE_LABEL[role] ?? role}</span>
          </p>
          <p className="text-xs text-muted-foreground">
            Business roles apply only to your own organisation. They never grant access to other customers or to WorldAML internal systems.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2"><KeyRound className="w-4 h-4 text-teal" /> Change password</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="pw">New password</Label>
            <Input id="pw" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pw2">Confirm new password</Label>
            <Input id="pw2" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <Button onClick={changePassword} disabled={saving} variant="accent">
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Update password
            </Button>
            <Button onClick={sendReset} disabled={sending} variant="outline">
              {sending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Email me a reset link
            </Button>
          </div>
        </CardContent>
      </Card>
        <MarketingPreferences />
    </div>
  );
}
