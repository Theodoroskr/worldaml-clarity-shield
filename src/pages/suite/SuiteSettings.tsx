import { useState, useEffect } from "react";
import { Settings, Users, Shield, Bell, Scale } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

const REGULATOR_OPTIONS = [
  { value: "fincen", label: "FinCEN", country: "United States" },
  { value: "fintrac", label: "FINTRAC", country: "Canada" },
  { value: "fca", label: "FCA", country: "United Kingdom" },
  { value: "cysec", label: "CySEC", country: "Cyprus" },
  { value: "icpac", label: "ICPAC", country: "Cyprus" },
  { value: "cbc", label: "Central Bank of Cyprus", country: "Cyprus" },
  { value: "dfsa", label: "DFSA", country: "UAE (DIFC)" },
  { value: "cbuae", label: "Central Bank of UAE", country: "UAE" },
  { value: "bog", label: "Bank of Greece", country: "Greece" },
  { value: "amld", label: "EU AMLD", country: "European Union" },
];

export default function SuiteSettings() {
  const { user } = useAuth();
  const [regulator, setRegulator] = useState<string>("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("regulator")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        setRegulator(data?.regulator ?? "");
      });
  }, [user]);

  const handleRegulatorChange = async (value: string) => {
    if (!user) return;
    setRegulator(value);
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ regulator: value || null })
      .eq("user_id", user.id);
    setSaving(false);
    if (error) {
      toast({ title: "Error", description: "Failed to update regulator.", variant: "destructive" });
    } else {
      toast({ title: "Regulator updated", description: `Set to ${REGULATOR_OPTIONS.find(r => r.value === value)?.label || "None"}.` });
    }
  };

  return (
    <div className="p-6 space-y-6 h-full overflow-y-auto">
      <div><h1 className="text-xl font-bold text-foreground">Settings</h1><p className="text-xs text-muted-foreground mt-0.5">System configuration and team management</p></div>

      {/* Regulator selector — full width at top */}
      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><Scale className="w-4 h-4 text-primary" /></div>
          <div>
            <h3 className="font-semibold text-foreground">Regulatory Jurisdiction</h3>
            <p className="text-xs text-muted-foreground">Select the regulator your entity is supervised by. This populates the Regulatory Hub, compliance calendar, alert rules, and available report types.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={regulator}
            onChange={(e) => handleRegulatorChange(e.target.value)}
            disabled={saving}
            className="flex-1 max-w-md h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">— Select regulator —</option>
            {REGULATOR_OPTIONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label} — {r.country}
              </option>
            ))}
          </select>
          {saving && <span className="text-xs text-muted-foreground">Saving…</span>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><Users className="w-4 h-4 text-primary" /></div>
            <div><h3 className="font-semibold text-foreground">Team Management</h3><p className="text-xs text-muted-foreground">Manage users, roles, and permissions</p></div>
          </div>
          <div className="space-y-3">
            {[
              { name: "Theodoros Kringou", role: "Admin", email: "t.kringou@worldaml.com" },
              { name: "Maria Nicolaou", role: "Compliance Officer", email: "m.nicolaou@worldaml.com" },
              { name: "Andreas Charalambous", role: "Analyst", email: "a.charalambous@worldaml.com" },
            ].map(u => (
              <div key={u.email} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <div className="text-sm font-medium text-foreground">{u.name}</div>
                  <div className="text-xs text-muted-foreground">{u.email}</div>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-muted border border-border font-medium text-muted-foreground">{u.role}</span>
              </div>
            ))}
          </div>
          <button className="mt-4 text-xs text-primary hover:underline font-medium">+ Invite team member</button>
        </div>

        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><Bell className="w-4 h-4 text-primary" /></div>
            <div><h3 className="font-semibold text-foreground">Notifications</h3><p className="text-xs text-muted-foreground">Configure alert and email preferences</p></div>
          </div>
          <div className="space-y-3">
            {["Critical alerts", "New customer onboarded", "Screening matches", "Case status changes", "Daily compliance digest"].map(n => (
              <div key={n} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <span className="text-sm text-foreground">{n}</span>
                <div className="w-8 h-4 rounded-full bg-emerald-500 flex items-center justify-end px-0.5 cursor-pointer"><div className="w-3 h-3 rounded-full bg-white shadow" /></div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><Shield className="w-4 h-4 text-primary" /></div>
            <div><h3 className="font-semibold text-foreground">Security</h3><p className="text-xs text-muted-foreground">Authentication and access controls</p></div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Two-Factor Auth</span><span className="text-emerald-600 font-medium">Enabled</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Session Timeout</span><span className="font-medium text-foreground">30 minutes</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">IP Whitelist</span><span className="text-muted-foreground">Not configured</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Audit Log Retention</span><span className="font-medium text-foreground">7 years</span></div>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><Settings className="w-4 h-4 text-primary" /></div>
            <div><h3 className="font-semibold text-foreground">API Access</h3><p className="text-xs text-muted-foreground">Manage API keys and integrations</p></div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">API Key</span><span className="font-mono text-xs text-foreground">wam_live_••••••••4f2a</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Rate Limit</span><span className="font-medium text-foreground">1,000 req/min</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Webhook URL</span><span className="text-muted-foreground">Not configured</span></div>
          </div>
          <button className="mt-4 text-xs text-primary hover:underline font-medium">View API documentation →</button>
        </div>
      </div>
    </div>
  );
}