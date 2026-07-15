import { useEffect, useState } from "react";
import { usePartner } from "@/hooks/usePartner";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Pencil, Star, Bell } from "lucide-react";

type Contact = {
  id: string;
  partner_id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string | null;
  is_primary: boolean;
  notify_referral_new: boolean;
  notify_referral_converted: boolean;
  notify_deal_new: boolean;
  notify_deal_status_change: boolean;
  notify_deal_won: boolean;
  notify_payouts: boolean;
  notify_monthly_summary: boolean;
};

const NOTIFY_KEYS: { key: keyof Contact; label: string; group: "Referrals" | "Deals" | "Other" }[] = [
  { key: "notify_referral_new", label: "New referral signup", group: "Referrals" },
  { key: "notify_referral_converted", label: "Referral converted to customer", group: "Referrals" },
  { key: "notify_deal_new", label: "New deal registered", group: "Deals" },
  { key: "notify_deal_status_change", label: "Deal status change (approved / rejected)", group: "Deals" },
  { key: "notify_deal_won", label: "Deal marked as won", group: "Deals" },
  { key: "notify_payouts", label: "Payout processed", group: "Other" },
  { key: "notify_monthly_summary", label: "Monthly performance summary", group: "Other" },
];

const emptyDraft = (partnerId: string): Contact => ({
  id: "",
  partner_id: partnerId,
  name: "",
  email: "",
  phone: "",
  role: "",
  is_primary: false,
  notify_referral_new: true,
  notify_referral_converted: true,
  notify_deal_new: true,
  notify_deal_status_change: true,
  notify_deal_won: true,
  notify_payouts: true,
  notify_monthly_summary: true,
});

export default function PartnerContactsPage() {
  const { partner } = usePartner();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editor, setEditor] = useState<{ open: boolean; draft: Contact | null }>({ open: false, draft: null });

  const load = async () => {
    if (!partner) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("partner_contacts")
      .select("*")
      .eq("partner_id", partner.id)
      .order("is_primary", { ascending: false })
      .order("created_at", { ascending: true });
    if (error) toast.error(error.message);
    setContacts((data || []) as Contact[]);
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [partner?.id]);

  if (!partner) return null;

  const openNew = () => setEditor({ open: true, draft: emptyDraft(partner.id) });
  const openEdit = (c: Contact) => setEditor({ open: true, draft: { ...c } });

  const saveDraft = async () => {
    const d = editor.draft;
    if (!d) return;
    if (!d.name.trim() || !d.email.trim()) {
      toast.error("Name and email are required");
      return;
    }
    setSaving(true);
    const payload = {
      partner_id: partner.id,
      name: d.name.trim(),
      email: d.email.trim().toLowerCase(),
      phone: d.phone?.trim() || null,
      role: d.role?.trim() || null,
      is_primary: d.is_primary,
      notify_referral_new: d.notify_referral_new,
      notify_referral_converted: d.notify_referral_converted,
      notify_deal_new: d.notify_deal_new,
      notify_deal_status_change: d.notify_deal_status_change,
      notify_deal_won: d.notify_deal_won,
      notify_payouts: d.notify_payouts,
      notify_monthly_summary: d.notify_monthly_summary,
    };
    let error: any;
    if (d.id) {
      ({ error } = await supabase.from("partner_contacts").update(payload).eq("id", d.id));
    } else {
      ({ error } = await supabase.from("partner_contacts").insert(payload));
    }
    setSaving(false);
    if (error) return toast.error(error.message);

    // If marking primary, demote others.
    if (d.is_primary) {
      await supabase
        .from("partner_contacts")
        .update({ is_primary: false })
        .eq("partner_id", partner.id)
        .neq("email", payload.email);
    }

    toast.success("Contact saved");
    setEditor({ open: false, draft: null });
    load();
  };

  const removeContact = async (id: string) => {
    if (!confirm("Remove this contact?")) return;
    const { error } = await supabase.from("partner_contacts").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Contact removed");
    load();
  };

  const togglePref = async (c: Contact, key: keyof Contact, value: boolean) => {
    const { error } = await supabase
      .from("partner_contacts")
      .update({ [key]: value } as any)
      .eq("id", c.id);
    if (error) return toast.error(error.message);
    setContacts((prev) => prev.map((x) => (x.id === c.id ? { ...x, [key]: value } as Contact : x)));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Contacts & notifications</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Add people from your team who should receive referral and deal updates. Each contact
            controls their own notification preferences.
          </p>
        </div>
        <Button onClick={openNew}>
          <Plus className="w-4 h-4 mr-1.5" /> Add contact
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : contacts.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            <Bell className="w-6 h-6 mx-auto text-muted-foreground/60 mb-2" />
            No contacts yet. Add your first contact to start receiving notifications.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {contacts.map((c) => (
            <Card key={c.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      {c.name}
                      {c.is_primary && (
                        <Badge className="bg-teal/10 text-teal border-teal/20 gap-1">
                          <Star className="w-3 h-3" /> Primary
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {c.email}
                      {c.role && <span className="ml-2 text-xs">· {c.role}</span>}
                      {c.phone && <span className="ml-2 text-xs">· {c.phone}</span>}
                    </CardDescription>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(c)}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => removeContact(c.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-0">
                {(["Referrals", "Deals", "Other"] as const).map((group) => (
                  <div key={group} className="space-y-2">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {group}
                    </div>
                    {NOTIFY_KEYS.filter((k) => k.group === group).map((k) => (
                      <label key={k.key as string} className="flex items-center justify-between gap-2 text-xs">
                        <span className="text-foreground">{k.label}</span>
                        <Switch
                          checked={Boolean(c[k.key])}
                          onCheckedChange={(v) => togglePref(c, k.key, v)}
                        />
                      </label>
                    ))}
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog
        open={editor.open}
        onOpenChange={(open) => !open && setEditor({ open: false, draft: null })}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editor.draft?.id ? "Edit contact" : "Add contact"}</DialogTitle>
          </DialogHeader>
          {editor.draft && (
            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs">Full name</Label>
                <Input
                  value={editor.draft.name}
                  onChange={(e) => setEditor({ ...editor, draft: { ...editor.draft!, name: e.target.value } })}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Email</Label>
                <Input
                  type="email"
                  value={editor.draft.email}
                  onChange={(e) => setEditor({ ...editor, draft: { ...editor.draft!, email: e.target.value } })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Phone (optional)</Label>
                  <Input
                    value={editor.draft.phone ?? ""}
                    onChange={(e) => setEditor({ ...editor, draft: { ...editor.draft!, phone: e.target.value } })}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Role (optional)</Label>
                  <Input
                    placeholder="Sales, Finance…"
                    value={editor.draft.role ?? ""}
                    onChange={(e) => setEditor({ ...editor, draft: { ...editor.draft!, role: e.target.value } })}
                  />
                </div>
              </div>
              <label className="flex items-center justify-between gap-2 pt-1 text-sm">
                <span>Primary contact</span>
                <Switch
                  checked={editor.draft.is_primary}
                  onCheckedChange={(v) => setEditor({ ...editor, draft: { ...editor.draft!, is_primary: v } })}
                />
              </label>
              <div className="pt-2 space-y-2 border-t border-border">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Notifications
                </div>
                {NOTIFY_KEYS.map((k) => (
                  <label key={k.key as string} className="flex items-center justify-between gap-2 text-xs">
                    <span>{k.label}</span>
                    <Switch
                      checked={Boolean(editor.draft![k.key])}
                      onCheckedChange={(v) =>
                        setEditor({ ...editor, draft: { ...editor.draft!, [k.key]: v } as Contact })
                      }
                    />
                  </label>
                ))}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditor({ open: false, draft: null })}>
              Cancel
            </Button>
            <Button onClick={saveDraft} disabled={saving}>
              {saving && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
              Save contact
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
