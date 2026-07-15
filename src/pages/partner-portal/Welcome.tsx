import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePartner } from "@/hooks/usePartner";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle2, Circle, Copy, Loader2, PartyPopper, Sparkles } from "lucide-react";
import { toast } from "sonner";

const STEPS = ["Welcome", "Profile", "Notifications", "Sandbox", "Finish"] as const;

export default function PartnerWelcome() {
  const { partner, refetch, isLoading } = usePartner();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  const [profile, setProfile] = useState({
    display_name: "",
    tagline: "",
    website_url: "",
    verticals: "",
  });
  const [prefs, setPrefs] = useState({
    new_referrals: true,
    deal_updates: true,
    payouts: true,
    monthly_summary: true,
  });

  useEffect(() => {
    if (!partner) return;
    setProfile({
      display_name: partner.display_name ?? "",
      tagline: partner.tagline ?? "",
      website_url: partner.website_url ?? "",
      verticals: (partner.verticals ?? []).join(", "),
    });
    if (partner.notification_prefs) {
      setPrefs((p) => ({ ...p, ...(partner.notification_prefs as any) }));
    }
    if (partner.onboarding_completed_at) {
      navigate("/partner-portal", { replace: true });
    }
  }, [partner, navigate]);

  if (isLoading || !partner) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-teal" />
      </div>
    );
  }

  const saveProfile = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("partners")
      .update({
        display_name: profile.display_name || null,
        tagline: profile.tagline || null,
        website_url: profile.website_url || null,
        verticals: profile.verticals.split(",").map((v) => v.trim()).filter(Boolean),
      } as any)
      .eq("id", partner.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    await refetch();
    setStep(2);
  };

  const savePrefs = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("partners")
      .update({ notification_prefs: prefs } as any)
      .eq("id", partner.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    await refetch();
    setStep(3);
  };

  const finish = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("partners")
      .update({ onboarding_completed_at: new Date().toISOString() } as any)
      .eq("id", partner.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    await refetch();
    toast.success("You're all set!");
    navigate("/partner-portal", { replace: true });
  };

  const copy = (v: string, label: string) => {
    navigator.clipboard.writeText(v);
    toast.success(`${label} copied`);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Progress */}
      <div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
          Getting started · Step {step + 1} of {STEPS.length}
        </p>
        <div className="flex items-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className="flex items-center gap-2">
                {i < step ? (
                  <CheckCircle2 className="w-4 h-4 text-teal" />
                ) : i === step ? (
                  <Circle className="w-4 h-4 text-teal fill-teal/20" />
                ) : (
                  <Circle className="w-4 h-4 text-muted-foreground/40" />
                )}
                <span className={`text-xs ${i === step ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                  {s}
                </span>
              </div>
              {i < STEPS.length - 1 && <div className="flex-1 h-px bg-border" />}
            </div>
          ))}
        </div>
      </div>

      {step === 0 && (
        <Card>
          <CardHeader>
            <div className="w-10 h-10 rounded-full bg-teal/10 flex items-center justify-center mb-3">
              <PartyPopper className="w-5 h-5 text-teal" />
            </div>
            <CardTitle>Welcome to the WorldAML Partner Program</CardTitle>
            <CardDescription>
              Your application has been approved. This short setup takes about 2 minutes and unlocks referrals,
              deal registration and your sandbox API key.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2 text-sm">
              <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-teal mt-0.5" /> Build your public partner profile</li>
              <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-teal mt-0.5" /> Choose which alerts you want to receive</li>
              <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-teal mt-0.5" /> Grab your sandbox API key & referral link</li>
            </ul>
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="ghost" onClick={finish} disabled={saving}>Skip for now</Button>
              <Button onClick={() => setStep(1)}>Get started</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Your partner profile</CardTitle>
            <CardDescription>Shown on your listing and referral landing pages.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="display_name">Display name</Label>
              <Input id="display_name" value={profile.display_name} onChange={(e) => setProfile({ ...profile, display_name: e.target.value })} placeholder="e.g. Acme Consulting" />
            </div>
            <div>
              <Label htmlFor="tagline">Tagline</Label>
              <Input id="tagline" value={profile.tagline} onChange={(e) => setProfile({ ...profile, tagline: e.target.value })} placeholder="One-line pitch" maxLength={140} />
            </div>
            <div>
              <Label htmlFor="website_url">Website</Label>
              <Input id="website_url" type="url" value={profile.website_url} onChange={(e) => setProfile({ ...profile, website_url: e.target.value })} placeholder="https://" />
            </div>
            <div>
              <Label htmlFor="verticals">Verticals (comma separated)</Label>
              <Input id="verticals" value={profile.verticals} onChange={(e) => setProfile({ ...profile, verticals: e.target.value })} placeholder="Fintech, iGaming, Payments" />
            </div>
            <div className="flex gap-2 justify-between pt-2">
              <Button variant="ghost" onClick={() => setStep(2)}>Skip</Button>
              <Button onClick={saveProfile} disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Notification preferences</CardTitle>
            <CardDescription>You can fine-tune per-contact preferences later in Contacts.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { k: "new_referrals", label: "New referral sign-ups" },
              { k: "deal_updates", label: "Deal registration status changes" },
              { k: "payouts", label: "Payouts & commission statements" },
              { k: "monthly_summary", label: "Monthly performance summary" },
            ].map((row) => (
              <label key={row.k} className="flex items-center gap-3 p-3 rounded-md border border-border cursor-pointer">
                <Checkbox
                  checked={(prefs as any)[row.k]}
                  onCheckedChange={(v) => setPrefs({ ...prefs, [row.k]: !!v })}
                />
                <span className="text-sm">{row.label}</span>
              </label>
            ))}
            <div className="flex gap-2 justify-between pt-2">
              <Button variant="ghost" onClick={() => setStep(3)}>Skip</Button>
              <Button onClick={savePrefs} disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <CardHeader>
            <div className="w-10 h-10 rounded-full bg-teal/10 flex items-center justify-center mb-3">
              <Sparkles className="w-5 h-5 text-teal" />
            </div>
            <CardTitle>Your credentials</CardTitle>
            <CardDescription>Use these to start referring clients and testing the API.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Referral link</Label>
              <div className="flex gap-2">
                <Input readOnly value={`${window.location.origin}/?ref=${partner.referral_code}`} />
                <Button variant="outline" onClick={() => copy(`${window.location.origin}/?ref=${partner.referral_code}`, "Referral link")}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
            {partner.sandbox_key && (
              <div>
                <Label>Sandbox API key</Label>
                <div className="flex gap-2">
                  <Input readOnly value={partner.sandbox_key} className="font-mono text-xs" />
                  <Button variant="outline" onClick={() => copy(partner.sandbox_key!, "Sandbox key")}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Test-mode only. Rotate anytime from Profile.</p>
              </div>
            )}
            <div className="flex gap-2 justify-end pt-2">
              <Button onClick={() => setStep(4)}>Continue</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 4 && (
        <Card>
          <CardHeader>
            <div className="w-10 h-10 rounded-full bg-teal/10 flex items-center justify-center mb-3">
              <CheckCircle2 className="w-5 h-5 text-teal" />
            </div>
            <CardTitle>You're ready to go</CardTitle>
            <CardDescription>Jump into your portal to register your first deal or invite teammates.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2 text-sm">
              <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-teal mt-0.5" /> Register a deal for protection & higher commission</li>
              <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-teal mt-0.5" /> Add teammates in Contacts to route alerts</li>
              <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-teal mt-0.5" /> Grab marketing assets from the Assets library</li>
            </ul>
            <div className="flex gap-2 justify-end pt-2">
              <Button onClick={finish} disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Enter portal
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
