import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { AppPageHeader } from "@/components/app-shell/AppShellLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useEntitlements } from "@/hooks/useEntitlements";

type Form = {
  first_name: string; last_name: string; full_name: string; phone: string;
  job_title: string; department: string; company_name: string; industry: string;
  company_size: string; seniority: string; interest_area: string;
  country: string; city: string; billing_address: string; postal_code: string; vat_number: string;
  marketing_consent: boolean;
};

const EMPTY: Form = {
  first_name: "", last_name: "", full_name: "", phone: "", job_title: "", department: "",
  company_name: "", industry: "", company_size: "", seniority: "", interest_area: "",
  country: "", city: "", billing_address: "", postal_code: "", vat_number: "", marketing_consent: false,
};

/** Defined at module scope so inputs keep focus while typing. */
function Field({ id, label, value, onChange, placeholder }: {
  id: string; label: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

export default function AccountProfile() {
  const { user, profile, refreshProfile } = useAuth() as any;
  const { planLabel } = useEntitlements();
  const { toast } = useToast();
  const [form, setForm] = useState<Form>(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setForm({ ...EMPTY, ...Object.fromEntries(
      Object.keys(EMPTY).map((k) => [k, (profile as any)[k] ?? EMPTY[k as keyof Form]]),
    ) } as Form);
  }, [profile]);

  const set = (k: keyof Form) => (v: any) => setForm((f) => ({ ...f, [k]: v }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const derivedFullName =
      form.full_name.trim() || [form.first_name, form.last_name].filter(Boolean).join(" ").trim();
    const { error } = await supabase
      .from("profiles")
      .update({
        ...form,
        full_name: derivedFullName || null,
        marketing_consent_at: form.marketing_consent ? new Date().toISOString() : null,
      })
      .eq("user_id", user.id);
    setSaving(false);
    if (error) {
      console.error("[account-profile] save", error);
      toast({ title: "Could not save your profile", description: "Please try again in a moment.", variant: "destructive" });
      return;
    }
    toast({ title: "Profile updated" });
    refreshProfile?.();
  };

  return (
    <>
      <Helmet><title>My Profile | WorldAML Academy</title><meta name="robots" content="noindex" /></Helmet>
      <AppPageHeader title="My Profile" description="Your details, used on certificates and invoices." />

      <form onSubmit={save} className="grid gap-4 max-w-3xl">
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              Personal details <Badge variant="outline" className="text-[10px]">{planLabel}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user?.email ?? ""} disabled />
            </div>
            <Field id="first_name" label="First name" value={form.first_name} onChange={set("first_name")} />
            <Field id="last_name" label="Last name" value={form.last_name} onChange={set("last_name")} />
            <Field id="full_name" label="Name on certificates" value={form.full_name} onChange={set("full_name")} placeholder="Leave blank to use your first and last name" />
            <Field id="phone" label="Phone" value={form.phone} onChange={set("phone")} />
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-3"><CardTitle className="text-base">Professional details</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Field id="job_title" label="Job title" value={form.job_title} onChange={set("job_title")} />
            <Field id="department" label="Department" value={form.department} onChange={set("department")} />
            <Field id="company_name" label="Company" value={form.company_name} onChange={set("company_name")} />
            <Field id="industry" label="Industry" value={form.industry} onChange={set("industry")} />
            <Field id="company_size" label="Company size" value={form.company_size} onChange={set("company_size")} />
            <Field id="seniority" label="Seniority" value={form.seniority} onChange={set("seniority")} />
            <div className="sm:col-span-2">
              <Field id="interest_area" label="Main area of interest" value={form.interest_area} onChange={set("interest_area")} placeholder="e.g. Sanctions screening, KYC, transaction monitoring" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-3"><CardTitle className="text-base">Billing details</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Field id="country" label="Country" value={form.country} onChange={set("country")} />
            <Field id="city" label="City" value={form.city} onChange={set("city")} />
            <div className="sm:col-span-2">
              <Field id="billing_address" label="Billing address" value={form.billing_address} onChange={set("billing_address")} />
            </div>
            <Field id="postal_code" label="Postal code" value={form.postal_code} onChange={set("postal_code")} />
            <Field id="vat_number" label="VAT number" value={form.vat_number} onChange={set("vat_number")} />
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="py-4 flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-medium text-foreground">Course and compliance updates</div>
              <p className="text-xs text-muted-foreground">New courses, regulatory updates and Academy news. You can opt out any time.</p>
            </div>
            <Switch checked={form.marketing_consent} onCheckedChange={set("marketing_consent")} />
          </CardContent>
        </Card>

        <div>
          <Button type="submit" disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Save changes
          </Button>
        </div>
      </form>
    </>
  );
}
