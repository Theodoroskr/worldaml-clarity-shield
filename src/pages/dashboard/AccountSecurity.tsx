import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Loader2, KeyRound, Mail } from "lucide-react";
import { AppPageHeader } from "@/components/app-shell/AppShellLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import MarketingPreferences from "@/components/account/MarketingPreferences";

export default function AccountSecurity() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast({ title: "Password too short", description: "Use at least 8 characters.", variant: "destructive" });
      return;
    }
    if (password !== confirm) {
      toast({ title: "Passwords do not match", description: "Please retype your new password.", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSaving(false);
    if (error) {
      console.error("[account-security] update password", error);
      toast({ title: "Could not update password", description: "Please try again in a moment.", variant: "destructive" });
      return;
    }
    setPassword(""); setConfirm("");
    toast({ title: "Password updated", description: "Your new password is now active." });
  };

  const sendReset = async () => {
    if (!user?.email) return;
    setSending(true);
    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setSending(false);
    if (error) {
      console.error("[account-security] reset email", error);
      toast({ title: "Could not send email", description: "Please try again in a moment.", variant: "destructive" });
      return;
    }
    toast({ title: "Email sent", description: `We've sent a password reset link to ${user.email}.` });
  };

  return (
    <>
      <Helmet><title>Security | WorldAML Academy</title><meta name="robots" content="noindex" /></Helmet>
      <AppPageHeader title="Security" description="Manage your password and sign-in details." />

      <div className="grid gap-4 max-w-2xl">
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2"><KeyRound className="h-4 w-4 text-accent" /> Change password</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={changePassword} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="new-password">New password</Label>
                <Input id="new-password" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirm-password">Confirm new password</Label>
                <Input id="confirm-password" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
              </div>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Update password
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2"><Mail className="h-4 w-4 text-accent" /> Sign-in email</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>You sign in with <span className="text-foreground font-medium">{user?.email}</span>. Contact support if you need this changed.</p>
            <Button variant="outline" size="sm" onClick={sendReset} disabled={sending}>
              {sending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Send me a password reset link
            </Button>
          </CardContent>
        </Card>
        <MarketingPreferences />
      </div>
    </>
  );
}
