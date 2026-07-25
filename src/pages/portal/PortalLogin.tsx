import { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { ShieldCheck, Mail } from "lucide-react";

export default function PortalLogin() {
  const nav = useNavigate();
  const loc = useLocation() as { state?: { from?: string } };
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"password" | "magic">("magic");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) nav(loc.state?.from ?? "/portal", { replace: true });
    });
  }, [nav, loc.state?.from]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    try {
      if (mode === "magic") {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: `${window.location.origin}/portal` },
        });
        if (error) throw error;
        toast({ title: "Check your inbox", description: "We sent you a secure sign-in link." });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        nav(loc.state?.from ?? "/portal", { replace: true });
      }
    } catch (err) {
      toast({ title: "Sign-in failed", description: (err as Error).message, variant: "destructive" });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md p-6 space-y-5">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-accent" />
          <div>
            <h1 className="text-lg font-semibold">Compliance Portal</h1>
            <p className="text-xs text-muted-foreground">Sign in to refresh your documents</p>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-3">
          <div>
            <Label>Email</Label>
            <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
          </div>
          {mode === "password" && (
            <div>
              <Label>Password</Label>
              <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          )}
          <Button type="submit" className="w-full" disabled={sending}>
            <Mail className="w-4 h-4 mr-2" />
            {sending ? "Sending…" : mode === "magic" ? "Email me a sign-in link" : "Sign in"}
          </Button>
          <button
            type="button"
            onClick={() => setMode(mode === "magic" ? "password" : "magic")}
            className="text-xs text-muted-foreground underline w-full text-center"
          >
            {mode === "magic" ? "Use password instead" : "Use a magic link instead"}
          </button>
        </form>

        <p className="text-xs text-muted-foreground text-center">
          Not invited yet? Contact the team that requested your documents.{" "}
          <Link to="/" className="underline">Back to worldaml.com</Link>
        </p>
      </Card>
    </div>
  );
}
