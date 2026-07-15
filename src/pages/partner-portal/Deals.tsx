import { useState } from "react";
import { usePartner } from "@/hooks/usePartner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const STATUS_COLOR: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  approved: "bg-blue-100 text-blue-800 border-blue-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
  won: "bg-green-100 text-green-800 border-green-200",
  lost: "bg-slate-100 text-slate-800 border-slate-200",
  expired: "bg-slate-100 text-slate-800 border-slate-200",
};

const EMPTY = {
  prospect_company: "",
  prospect_contact_name: "",
  prospect_email: "",
  prospect_country: "",
  estimated_arr_eur: "",
  notes: "",
};

export default function PartnerDeals() {
  const { partner, deals, refetch } = usePartner();
  const { user } = useAuth();
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);

  if (!partner) return null;

  const submit = async () => {
    if (!user) return;
    if (!form.prospect_company || !form.prospect_email) {
      toast.error("Company name and email are required");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("deal_registrations").insert({
      partner_id: partner.id,
      submitted_by: user.id,
      prospect_company: form.prospect_company,
      prospect_contact_name: form.prospect_contact_name || null,
      prospect_email: form.prospect_email,
      prospect_country: form.prospect_country || null,
      estimated_arr_eur: form.estimated_arr_eur ? Number(form.estimated_arr_eur) : null,
      notes: form.notes || null,
      status: "pending",
    } as any);
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Deal registered — our team will review shortly");
    setForm(EMPTY);
    await refetch();
  };

  return (
    <div className="max-w-5xl mx-auto grid lg:grid-cols-[1fr_1.3fr] gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Register a new deal</CardTitle>
          <CardDescription>Lock deal protection & priority commission.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Field label="Prospect company *">
            <Input value={form.prospect_company} onChange={(e) => setForm({ ...form, prospect_company: e.target.value })} />
          </Field>
          <Field label="Contact name">
            <Input value={form.prospect_contact_name} onChange={(e) => setForm({ ...form, prospect_contact_name: e.target.value })} />
          </Field>
          <Field label="Contact email *">
            <Input type="email" value={form.prospect_email} onChange={(e) => setForm({ ...form, prospect_email: e.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Country">
              <Input value={form.prospect_country} onChange={(e) => setForm({ ...form, prospect_country: e.target.value })} />
            </Field>
            <Field label="Est. ARR (EUR)">
              <Input type="number" value={form.estimated_arr_eur} onChange={(e) => setForm({ ...form, estimated_arr_eur: e.target.value })} />
            </Field>
          </div>
          <Field label="Notes">
            <Textarea rows={4} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </Field>
          <Button onClick={submit} disabled={submitting} className="w-full">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Register deal
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Your registered deals</CardTitle>
        </CardHeader>
        <CardContent>
          {deals.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No deals yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {deals.map((d: any) => (
                <li key={d.id} className="py-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-medium text-sm truncate">{d.prospect_company}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {d.prospect_contact_name || d.prospect_email}
                      {d.prospect_country ? ` · ${d.prospect_country}` : ""}
                    </div>
                    {d.estimated_arr_eur ? (
                      <div className="text-xs text-muted-foreground mt-1">
                        Est. ARR: €{Number(d.estimated_arr_eur).toLocaleString()}
                      </div>
                    ) : null}
                    {d.protection_expires_at ? (
                      <div className="text-xs text-muted-foreground">
                        Protected until {new Date(d.protection_expires_at).toLocaleDateString()}
                      </div>
                    ) : null}
                  </div>
                  <Badge variant="outline" className={STATUS_COLOR[d.status] || ""}>
                    {d.status}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
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
