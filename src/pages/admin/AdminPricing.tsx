import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Loader2, Plus, Save, Trash2, CreditCard, Users, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Tier {
  id: string;
  name: string;
  description: string | null;
  monthly_price_cents: number;
  stripe_price_id: string | null;
  max_customers: number;
  max_screenings_per_month: number;
  max_api_requests_per_day: number;
  features: string[];
  is_active: boolean;
  sort_order: number;
}

interface UserSub {
  id: string;
  user_id: string;
  tier_id: string;
  status: string;
  current_period_start: string | null;
  current_period_end: string | null;
}

interface Profile {
  user_id: string;
  email: string | null;
  full_name: string | null;
}

export default function AdminPricing() {
  const { user } = useAuth();
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [subs, setSubs] = useState<UserSub[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Tier | null>(null);
  const [saving, setSaving] = useState(false);
  const [featureInput, setFeatureInput] = useState("");

  const fetchAll = async () => {
    setLoading(true);
    const [{ data: t }, { data: s }, { data: p }] = await Promise.all([
      supabase.from("admin_subscription_tiers").select("*").order("sort_order"),
      supabase.from("admin_user_subscriptions").select("*"),
      supabase.from("profiles").select("user_id, email, full_name"),
    ]);
    setTiers((t || []).map((d: any) => ({ ...d, features: (d.features || []) as string[] })));
    setSubs((s || []) as UserSub[]);
    setProfiles((p || []) as Profile[]);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const createNew = () => {
    setEditing({
      id: "", name: "", description: "", monthly_price_cents: 0, stripe_price_id: null,
      max_customers: 100, max_screenings_per_month: 500, max_api_requests_per_day: 1000,
      features: [], is_active: true, sort_order: tiers.length,
    });
    setFeatureInput("");
  };

  const addFeature = () => {
    if (!editing || !featureInput.trim()) return;
    setEditing({ ...editing, features: [...editing.features, featureInput.trim()] });
    setFeatureInput("");
  };

  const removeFeature = (idx: number) => {
    if (!editing) return;
    setEditing({ ...editing, features: editing.features.filter((_, i) => i !== idx) });
  };

  const saveTier = async () => {
    if (!editing || !editing.name.trim()) { toast.error("Name required"); return; }
    setSaving(true);
    const payload = {
      name: editing.name,
      description: editing.description,
      monthly_price_cents: editing.monthly_price_cents,
      stripe_price_id: editing.stripe_price_id,
      max_customers: editing.max_customers,
      max_screenings_per_month: editing.max_screenings_per_month,
      max_api_requests_per_day: editing.max_api_requests_per_day,
      features: editing.features as any,
      is_active: editing.is_active,
      sort_order: editing.sort_order,
    };
    if (editing.id) {
      const { error } = await supabase.from("admin_subscription_tiers").update(payload).eq("id", editing.id);
      if (error) toast.error("Failed to save"); else toast.success("Tier saved");
    } else {
      const { error } = await supabase.from("admin_subscription_tiers").insert(payload);
      if (error) toast.error("Failed to create"); else toast.success("Tier created");
    }
    setSaving(false);
    setEditing(null);
    fetchAll();
  };

  const deleteTier = async (id: string) => {
    await supabase.from("admin_subscription_tiers").delete().eq("id", id);
    toast.success("Tier deleted");
    fetchAll();
  };

  const assignTier = async (userId: string, tierId: string) => {
    const existing = subs.find(s => s.user_id === userId);
    if (existing) {
      await supabase.from("admin_user_subscriptions").update({ tier_id: tierId } as any).eq("id", existing.id);
    } else {
      await supabase.from("admin_user_subscriptions").insert({ user_id: userId, tier_id: tierId } as any);
    }
    toast.success("Subscription updated");
    fetchAll();
  };

  const subsPerTier = (tierId: string) => subs.filter(s => s.tier_id === tierId).length;

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold text-foreground">Pricing & Limits</h1><p className="text-xs text-muted-foreground">Manage subscription tiers and usage quotas</p></div>
        <Button size="sm" onClick={createNew}><Plus className="w-3.5 h-3.5 mr-1" /> New Tier</Button>
      </div>

      <Tabs defaultValue="tiers">
        <TabsList><TabsTrigger value="tiers"><CreditCard className="w-3.5 h-3.5 mr-1" />Tiers</TabsTrigger><TabsTrigger value="users"><Users className="w-3.5 h-3.5 mr-1" />User Subscriptions</TabsTrigger></TabsList>

        <TabsContent value="tiers" className="mt-4">
          {loading ? <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div> : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tiers.map(t => (
                <div key={t.id} className="bg-card rounded-xl border border-border p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-foreground">{t.name}</h3>
                    <Badge variant={t.is_active ? "default" : "outline"} className="text-xs">{t.is_active ? "Active" : "Inactive"}</Badge>
                  </div>
                  <div className="text-2xl font-bold text-foreground">€{(t.monthly_price_cents / 100).toFixed(0)}<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>Max Customers: <strong>{t.max_customers}</strong></div>
                    <div>Screenings/mo: <strong>{t.max_screenings_per_month}</strong></div>
                    <div>API Reqs/day: <strong>{t.max_api_requests_per_day}</strong></div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {t.features.map((f, i) => <Badge key={i} variant="outline" className="text-xs">{f}</Badge>)}
                  </div>
                  <div className="text-xs text-muted-foreground">{subsPerTier(t.id)} subscribers</div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1 h-7 text-xs" onClick={() => { setEditing(t); setFeatureInput(""); }}>Edit</Button>
                    <Button size="sm" variant="ghost" className="h-7 text-xs text-destructive" onClick={() => deleteTier(t.id)}><Trash2 className="w-3 h-3" /></Button>
                  </div>
                </div>
              ))}
              {tiers.length === 0 && <div className="col-span-full text-center py-12 text-sm text-muted-foreground">No subscription tiers yet.</div>}
            </div>
          )}
        </TabsContent>

        <TabsContent value="users" className="mt-4">
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border bg-muted/30">
                {["User", "Current Tier", "Status", "Assign Tier"].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">{h}</th>)}
              </tr></thead>
              <tbody className="divide-y divide-border">
                {profiles.slice(0, 50).map(p => {
                  const sub = subs.find(s => s.user_id === p.user_id);
                  const tier = sub ? tiers.find(t => t.id === sub.tier_id) : null;
                  return (
                    <tr key={p.user_id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3"><div className="font-medium text-foreground text-sm">{p.full_name || "—"}</div><div className="text-xs text-muted-foreground">{p.email}</div></td>
                      <td className="px-4 py-3">{tier ? <Badge>{tier.name}</Badge> : <span className="text-xs text-muted-foreground">None</span>}</td>
                      <td className="px-4 py-3"><Badge variant="outline" className="text-xs">{sub?.status || "—"}</Badge></td>
                      <td className="px-4 py-3">
                        <select className="text-xs border border-border rounded px-2 py-1 bg-background" value={sub?.tier_id || ""} onChange={e => e.target.value && assignTier(p.user_id, e.target.value)}>
                          <option value="">Select tier…</option>
                          {tiers.filter(t => t.is_active).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Tier Editor */}
      <Dialog open={!!editing} onOpenChange={open => !open && setEditing(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editing?.id ? "Edit Tier" : "New Tier"}</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div><label className="text-xs font-medium text-muted-foreground">Name</label><Input value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} /></div>
              <div><label className="text-xs font-medium text-muted-foreground">Description</label><Input value={editing.description || ""} onChange={e => setEditing({ ...editing, description: e.target.value })} /></div>
              <div><label className="text-xs font-medium text-muted-foreground">Monthly Price (cents)</label><Input type="number" value={editing.monthly_price_cents} onChange={e => setEditing({ ...editing, monthly_price_cents: parseInt(e.target.value) || 0 })} /></div>
              <div><label className="text-xs font-medium text-muted-foreground">Stripe Price ID</label><Input value={editing.stripe_price_id || ""} onChange={e => setEditing({ ...editing, stripe_price_id: e.target.value || null })} placeholder="price_..." /></div>
              <div className="grid grid-cols-3 gap-2">
                <div><label className="text-xs font-medium text-muted-foreground">Max Customers</label><Input type="number" value={editing.max_customers} onChange={e => setEditing({ ...editing, max_customers: parseInt(e.target.value) || 0 })} /></div>
                <div><label className="text-xs font-medium text-muted-foreground">Screenings/mo</label><Input type="number" value={editing.max_screenings_per_month} onChange={e => setEditing({ ...editing, max_screenings_per_month: parseInt(e.target.value) || 0 })} /></div>
                <div><label className="text-xs font-medium text-muted-foreground">API Reqs/day</label><Input type="number" value={editing.max_api_requests_per_day} onChange={e => setEditing({ ...editing, max_api_requests_per_day: parseInt(e.target.value) || 0 })} /></div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Features</label>
                <div className="flex gap-1 flex-wrap mt-1 mb-2">{editing.features.map((f, i) => <Badge key={i} variant="outline" className="text-xs cursor-pointer" onClick={() => removeFeature(i)}>{f} ×</Badge>)}</div>
                <div className="flex gap-1"><Input className="flex-1 h-8 text-xs" value={featureInput} onChange={e => setFeatureInput(e.target.value)} placeholder="Add feature" onKeyDown={e => e.key === "Enter" && addFeature()} /><Button size="sm" variant="outline" className="h-8" onClick={addFeature}><Plus className="w-3 h-3" /></Button></div>
              </div>
              <div className="flex items-center gap-2"><Switch checked={editing.is_active} onCheckedChange={v => setEditing({ ...editing, is_active: v })} /><span className="text-sm text-muted-foreground">Active</span></div>
            </div>
          )}
          <DialogFooter><Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button><Button onClick={saveTier} disabled={saving}>{saving && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}<Save className="w-3.5 h-3.5 mr-1" />Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
