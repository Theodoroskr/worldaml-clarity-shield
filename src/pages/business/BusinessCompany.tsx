import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Building } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useBusinessWorkspace } from "@/hooks/useBusinessWorkspace";

const FIELDS: { key: string; label: string; placeholder?: string }[] = [
  { key: "company_name", label: "Company name" },
  { key: "website", label: "Website", placeholder: "https://" },
  { key: "country", label: "Country" },
  { key: "industry", label: "Industry" },
  { key: "company_size", label: "Company size" },
  { key: "registration_number", label: "Registration number" },
  { key: "vat_number", label: "VAT number" },
  { key: "phone", label: "Company phone" },
  { key: "address_line1", label: "Address line 1" },
  { key: "address_line2", label: "Address line 2" },
  { key: "city", label: "City" },
  { key: "postal_code", label: "Postal code" },
];

export default function BusinessCompany() {
  const { account, isBusinessAdmin, refresh } = useBusinessWorkspace();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!account) return;
    const next: Record<string, string> = {};
    for (const f of FIELDS) next[f.key] = ((account as unknown as Record<string, string | null>)[f.key] ?? "") as string;
    setValues(next);
  }, [account]);

  const save = async () => {
    if (!account) return;
    setSaving(true);
    try {
      const { data, error } = await supabase.from("business_accounts").update({
        company_name: values.company_name,
        website: values.website || null,
        country: values.country || null,
        industry: values.industry || null,
        company_size: values.company_size || null,
        registration_number: values.registration_number || null,
        vat_number: values.vat_number || null,
        phone: values.phone || null,
        address_line1: values.address_line1 || null,
        address_line2: values.address_line2 || null,
        city: values.city || null,
        postal_code: values.postal_code || null,
      }).eq("id", account.id).select("id");
      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error("You don't have permission to edit this company profile.");
      }
      toast({ title: "Company profile updated" });
      await refresh();
      navigate("/business");
    } catch (e) {
      toast({ title: "Could not save", description: e instanceof Error ? e.message : "Try again", variant: "destructive" });
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Company Profile</h1>
        <p className="text-muted-foreground">Kept on file so checkout, invoicing and sales requests are pre-filled.</p>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2"><Building className="w-4 h-4 text-teal" /> Company details</CardTitle>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-4">
          {FIELDS.map((f) => (
            <div key={f.key} className="space-y-1.5">
              <Label htmlFor={f.key}>{f.label}</Label>
              <Input
                id={f.key}
                placeholder={f.placeholder}
                value={values[f.key] ?? ""}
                disabled={!isBusinessAdmin}
                onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
              />
            </div>
          ))}
          <div className="sm:col-span-2">
            <Button onClick={save} disabled={saving || !isBusinessAdmin} variant="accent">
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save changes
            </Button>
            {!isBusinessAdmin && (
              <p className="mt-2 text-xs text-muted-foreground">Only a Business Admin can edit company details.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
