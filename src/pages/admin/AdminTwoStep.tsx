// Admin self-service two-step sign-in (TOTP authenticator app).
// Each admin must enrol on their own account; the Suite go-live check
// flags admins without a verified factor.
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { KeyRound, Loader2, ShieldCheck, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

type Factor = { id: string; friendly_name?: string | null; status: string; created_at: string };

export default function AdminTwoStep() {
  const [factors, setFactors] = useState<Factor[]>([]);
  const [enrol, setEnrol] = useState<{ id: string; qr: string; secret: string } | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const { data } = await supabase.auth.mfa.listFactors();
    setFactors(((data?.totp ?? []) as Factor[]));
  };
  useEffect(() => { load(); }, []);

  const start = async () => {
    setBusy(true);
    // Clear abandoned unverified factors so enrolment can be retried.
    const { data: list } = await supabase.auth.mfa.listFactors();
    for (const f of (list?.all ?? []).filter((f) => f.status !== "verified")) {
      await supabase.auth.mfa.unenroll({ factorId: f.id });
    }
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: `Authenticator ${new Date().toISOString().slice(0, 10)}`,
    });
    setBusy(false);
    if (error || !data) return toast.error(error?.message ?? "Could not start set-up");
    setEnrol({ id: data.id, qr: data.totp.qr_code, secret: data.totp.secret });
  };

  const verify = async () => {
    if (!enrol) return;
    setBusy(true);
    const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId: enrol.id, code: code.trim() });
    setBusy(false);
    if (error) return toast.error("That code didn't match. Try the newest code in your app.");
    toast.success("Two-step sign-in is on");
    setEnrol(null); setCode(""); load();
  };

  const remove = async (id: string) => {
    if (!confirm("Remove this authenticator? The go-live check will turn this warning back on.")) return;
    const { error } = await supabase.auth.mfa.unenroll({ factorId: id });
    if (error) toast.error(error.message); else load();
  };

  const verified = factors.filter((f) => f.status === "verified");

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <KeyRound className="w-6 h-6 text-primary" /> Two-step sign-in
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Protect your admin account with an authenticator app (Google Authenticator, Microsoft Authenticator, 1Password, Authy).
          Every WorldAML admin must do this on their own account.
        </p>
      </div>

      <section className="rounded-lg border border-border p-5 space-y-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className={verified.length ? "w-5 h-5 text-primary" : "w-5 h-5 text-muted-foreground"} />
          <span className="font-medium text-foreground">
            {verified.length ? "Two-step sign-in is on" : "Two-step sign-in is off"}
          </span>
          <Badge variant={verified.length ? "default" : "destructive"}>{verified.length ? "Protected" : "Action needed"}</Badge>
        </div>
        {verified.map((f) => (
          <div key={f.id} className="flex items-center justify-between rounded border border-border p-2 text-sm">
            <span>{f.friendly_name || "Authenticator"} · added {new Date(f.created_at).toLocaleDateString()}</span>
            <Button size="sm" variant="ghost" onClick={() => remove(f.id)}><Trash2 className="w-4 h-4" /></Button>
          </div>
        ))}
        {!enrol && (
          <Button onClick={start} disabled={busy}>
            {busy && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {verified.length ? "Add another authenticator" : "Set up two-step sign-in"}
          </Button>
        )}
      </section>

      {enrol && (
        <section className="rounded-lg border border-border p-5 space-y-4">
          <p className="text-sm text-foreground">1. Scan this code with your authenticator app.</p>
          <img src={enrol.qr} alt="Authenticator set-up code" className="w-48 h-48 rounded bg-background p-2 border border-border" />
          <p className="text-xs text-muted-foreground">Can't scan? Enter this key: <code className="break-all">{enrol.secret}</code></p>
          <p className="text-sm text-foreground">2. Enter the 6-digit code it shows.</p>
          <div className="flex gap-2">
            <Input value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              inputMode="numeric" placeholder="123456" className="max-w-[10rem]" />
            <Button onClick={verify} disabled={busy || code.length !== 6}>
              {busy && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Confirm
            </Button>
            <Button variant="ghost" onClick={() => { setEnrol(null); setCode(""); }}>Cancel</Button>
          </div>
        </section>
      )}
    </div>
  );
}
