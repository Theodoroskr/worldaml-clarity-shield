import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { usePartner } from "@/hooks/usePartner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { PARTNER_PRODUCTS } from "@/data/partnerProducts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, CheckCircle2 } from "lucide-react";

const TIMING = ["This quarter", "Next quarter", "6–12 months", "Exploratory"];

const EMPTY = {
  prospect_company: "",
  prospect_country: "",
  website: "",
  industry: "",
  first_name: "",
  last_name: "",
  job_title: "",
  prospect_email: "",
  phone: "",
  product: "",
  estimated_arr_eur: "",
  timing: "",
  notes: "",
};

export default function RegisterDeal() {
  const { partner, refetch } = usePartner();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [form, setForm] = useState({ ...EMPTY, product: params.get("product") ?? "" });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  if (!partner) return null;

  const set = (k: keyof typeof EMPTY, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!user) return;
    if (!form.prospect_company || !form.prospect_country || !form.product) {
      toast.error("Company, country and interested solution are required");
      return;
    }
    setSubmitting(true);
    const contextLines = [
      form.website ? `Website: ${form.website}` : null,
      form.industry ? `Industry: ${form.industry}` : null,
      form.job_title ? `Job title: ${form.job_title}` : null,
      form.phone ? `Phone: ${form.phone}` : null,
      form.timing ? `Expected timing: ${form.timing}` : null,
      form.notes ? `\nRequirements:\n${form.notes}` : null,
    ].filter(Boolean);

    const { data: inserted, error } = await supabase
      .from("deal_registrations")
      .insert({
        partner_id: partner.id,
        submitted_by: user.id,
        prospect_company: form.prospect_company,
        prospect_contact_name: [form.first_name, form.last_name].filter(Boolean).join(" ") || null,
        prospect_email: form.prospect_email || null,
        prospect_country: form.prospect_country,
        product_interest: form.product ? [form.product] : null,
        estimated_arr_eur: form.estimated_arr_eur ? Number(form.estimated_arr_eur) : null,
        notes: contextLines.join("\n") || null,
        status: "pending",
      } as any)
      .select("id")
      .maybeSingle();
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (inserted?.id) {
      supabase.functions
        .invoke("notify-deal-registration", { body: { deal_id: inserted.id } })
        .catch((e) => console.error("deal notification failed:", e));
    }
    setDone(true);
    await refetch();
  };


  if (done) {
    return (
      <div className="max-w-xl mx-auto">
        <Card>
          <CardContent className="p-8 text-center">
            <CheckCircle2 className="w-10 h-10 text-teal mx-auto" />
            <h1 className="text-lg font-bold text-foreground mt-3">Deal submitted successfully.</h1>
            <p className="text-sm text-muted-foreground mt-2">
              Your registration for <span className="font-medium text-foreground">{form.prospect_company}</span>{" "}
              is now <span className="font-medium text-foreground">Pending Review</span>. The WorldAML
              partnerships team will review it and confirm deal protection.
            </p>
            <div className="flex gap-2 justify-center mt-5">
              <Button onClick={() => navigate("/partner/deals")}>View my deals</Button>
              <Button
                variant="outline"
                onClick={() => {
                  setForm(EMPTY);
                  setDone(false);
                }}
              >
                Register another
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-bold text-foreground">Register a deal</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Lock in deal protection and commission eligibility. Takes under two minutes.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Prospect</CardTitle>
          <CardDescription className="text-xs">Who is the opportunity with?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Company name *">
              <Input value={form.prospect_company} onChange={(e) => set("prospect_company", e.target.value)} />
            </Field>
            <Field label="Country *">
              <Input value={form.prospect_country} onChange={(e) => set("prospect_country", e.target.value)} />
            </Field>
            <Field label="Website">
              <Input value={form.website} onChange={(e) => set("website", e.target.value)} placeholder="https://" />
            </Field>
            <Field label="Industry">
              <Input value={form.industry} onChange={(e) => set("industry", e.target.value)} placeholder="Fintech, gaming…" />
            </Field>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Contact</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="First name">
              <Input value={form.first_name} onChange={(e) => set("first_name", e.target.value)} />
            </Field>
            <Field label="Last name">
              <Input value={form.last_name} onChange={(e) => set("last_name", e.target.value)} />
            </Field>
            <Field label="Job title">
              <Input value={form.job_title} onChange={(e) => set("job_title", e.target.value)} />
            </Field>
            <Field label="Business email">
              <Input type="email" value={form.prospect_email} onChange={(e) => set("prospect_email", e.target.value)} />
            </Field>
            <Field label="Phone">
              <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} />
            </Field>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Opportunity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Interested solution *">
              <Select value={form.product} onValueChange={(v) => set("product", v)}>
                <SelectTrigger><SelectValue placeholder="Select solution" /></SelectTrigger>
                <SelectContent>
                  {PARTNER_PRODUCTS.map((p) => (
                    <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Estimated deal value (EUR / year)">
              <Input type="number" value={form.estimated_arr_eur} onChange={(e) => set("estimated_arr_eur", e.target.value)} />
            </Field>
            <Field label="Expected timing">
              <Select value={form.timing} onValueChange={(v) => set("timing", v)}>
                <SelectTrigger><SelectValue placeholder="Select timing" /></SelectTrigger>
                <SelectContent>
                  {TIMING.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
          </div>
          <Field label="Requirements / notes">
            <Textarea rows={4} value={form.notes} onChange={(e) => set("notes", e.target.value)} />
          </Field>
          <p className="text-xs text-muted-foreground">
            Your partner account, user and submission date are attached automatically.
          </p>
          <Button onClick={submit} disabled={submitting} className="w-full sm:w-auto">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Register deal
          </Button>
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
