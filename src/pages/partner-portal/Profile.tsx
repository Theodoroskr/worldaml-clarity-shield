import { useEffect, useState } from "react";
import { usePartner } from "@/hooks/usePartner";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Copy, Check, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function PartnerProfile() {
  const { partner, refetch } = usePartner();
  const [form, setForm] = useState({
    display_name: "",
    tagline: "",
    bio: "",
    website_url: "",
    logo_url: "",
    verticals: "",
  });
  const [saving, setSaving] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (!partner) return;
    setForm({
      display_name: partner.display_name ?? "",
      tagline: partner.tagline ?? "",
      bio: partner.bio ?? "",
      website_url: partner.website_url ?? "",
      logo_url: partner.logo_url ?? "",
      verticals: (partner.verticals ?? []).join(", "),
    });
  }, [partner]);

  if (!partner) return null;

  const save = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("partners")
      .update({
        display_name: form.display_name || null,
        tagline: form.tagline || null,
        bio: form.bio || null,
        website_url: form.website_url || null,
        logo_url: form.logo_url || null,
        verticals: form.verticals
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean),
      } as any)
      .eq("id", partner.id);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Profile saved");
    await refetch();
  };

  const copy = (val: string, label: string) => {
    navigator.clipboard.writeText(val);
    setCopied(label);
    toast.success(`${label} copied`);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Partner profile</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Public information shown in the partner directory.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Company details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Field label="Display name">
            <Input value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} />
          </Field>
          <Field label="Tagline">
            <Input value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} />
          </Field>
          <Field label="Website">
            <Input value={form.website_url} onChange={(e) => setForm({ ...form, website_url: e.target.value })} placeholder="https://..." />
          </Field>
          <Field label="Logo URL">
            <Input value={form.logo_url} onChange={(e) => setForm({ ...form, logo_url: e.target.value })} placeholder="https://..." />
          </Field>
          <Field label="Verticals (comma-separated)">
            <Input value={form.verticals} onChange={(e) => setForm({ ...form, verticals: e.target.value })} placeholder="Fintech, Gaming, Banking" />
          </Field>
          <Field label="Bio">
            <Textarea rows={4} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
          </Field>
          <Button onClick={save} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Save profile
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sandbox API key</CardTitle>
          <CardDescription>
            Use this key to test WorldAML APIs in sandbox mode. Never share in production.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              readOnly
              value={showKey ? partner.sandbox_key || "" : "•".repeat(24)}
              className="font-mono text-xs"
            />
            <Button variant="outline" size="icon" onClick={() => setShowKey(!showKey)}>
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => partner.sandbox_key && copy(partner.sandbox_key, "Sandbox key")}
            >
              {copied === "Sandbox key" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
