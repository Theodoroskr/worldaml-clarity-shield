import { useEffect, useState } from "react";
import { usePartner } from "@/hooks/usePartner";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const PREF_KEYS = [
  { key: "deal_updates", label: "Deal status updates" },
  { key: "new_asset", label: "New marketing assets available" },
  { key: "payouts", label: "Payout notifications" },
  { key: "monthly_summary", label: "Monthly performance summary" },
];

export default function PartnerSettings() {
  const { partner, refetch } = usePartner();
  const [method, setMethod] = useState("");
  const [details, setDetails] = useState("");
  const [prefs, setPrefs] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!partner) return;
    setMethod(partner.payout_method ?? "");
    setDetails("");
    setPrefs((partner.notification_prefs as Record<string, boolean>) ?? {});
  }, [partner]);

  if (!partner) return null;

  const save = async () => {
    setSaving(true);
    const payload: any = {
      payout_method: method || null,
      notification_prefs: prefs,
    };
    if (details) {
      // NOTE: payout_details_encrypted is a placeholder for future server-side
      // encryption via edge function. For now we store as-is under a
      // partner-only RLS-protected column.
      payload.payout_details_encrypted = details;
    }
    const { error } = await supabase.from("partners").update(payload).eq("id", partner.id);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Settings saved");
    setDetails("");
    await refetch();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Payout method and notifications.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Payout details</CardTitle>
          <CardDescription>How we send your commissions.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Method</Label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm"
            >
              <option value="">Not set</option>
              <option value="sepa">SEPA bank transfer</option>
              <option value="wire">International wire</option>
              <option value="paypal">PayPal</option>
              <option value="wise">Wise</option>
            </select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">
              Payout details (IBAN / email / account info)
            </Label>
            <Input
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder={
                partner.payout_details_encrypted
                  ? "•••• update to change"
                  : "Enter details"
              }
            />
            <p className="text-[11px] text-muted-foreground">
              Only you and our finance team can see these details.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {PREF_KEYS.map((p) => (
            <div key={p.key} className="flex items-center justify-between">
              <div className="text-sm">{p.label}</div>
              <Switch
                checked={prefs[p.key] ?? true}
                onCheckedChange={(v) => setPrefs({ ...prefs, [p.key]: v })}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Button onClick={save} disabled={saving}>
        {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
        Save settings
      </Button>
    </div>
  );
}
