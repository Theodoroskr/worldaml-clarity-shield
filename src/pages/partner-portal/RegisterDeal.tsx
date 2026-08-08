import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { usePartner } from "@/hooks/usePartner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { PARTNER_PRODUCTS } from "@/data/partnerProducts";
import { Card, CardContent } from "@/components/ui/card";
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
import { Loader2, CheckCircle2, ShieldCheck, ArrowRight, Clock } from "lucide-react";
import { eur, commissionEstimate } from "@/components/partner/dealUi";

const TIMING = [
  "Immediate",
  "Within 1 month",
  "1–3 months",
  "3–6 months",
  "6–12 months",
  "Unknown",
];

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

type Errors = Partial<Record<keyof typeof EMPTY, string>>;

export default function RegisterDeal() {
  const { partner, refetch } = usePartner();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [form, setForm] = useState({ ...EMPTY, product: params.get("product") ?? "" });
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  if (!partner) return null;

  const set = (k: keyof typeof EMPTY, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => (e[k] ? { ...e, [k]: undefined } : e));
  };

  const validate = (): Errors => {
    const e: Errors = {};
    if (!form.prospect_company.trim()) e.prospect_company = "Enter the prospect's company name.";
    if (!form.prospect_country.trim()) e.prospect_country = "Enter the prospect's country.";
    if (!form.product) e.product = "Select the solution they're interested in.";
    if (form.prospect_email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.prospect_email.trim()))
      e.prospect_email = "Enter a valid business email address.";
    if (form.website && !/^(https?:\/\/)?[\w-]+(\.[\w-]+)+/.test(form.website.trim()))
      e.website = "Enter a valid website, e.g. https://company.com";
    if (form.estimated_arr_eur && Number(form.estimated_arr_eur) < 0)
      e.estimated_arr_eur = "Enter a positive value.";
    return e;
  };

  const estCommission = commissionEstimate(form.estimated_arr_eur, partner.commission_rate);

  const submit = async () => {
    if (!user) return;
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) {
      toast.error("Please correct the highlighted fields.");
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
        .catch((err) => console.error("deal notification failed:", err));
    }
    setDone(true);
    toast.success("Opportunity registered");
    await refetch();
  };

  if (done) {
    return (
      <div className="max-w-[880px] mx-auto">
        <Card>
          <CardContent className="p-8 sm:p-10 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7 text-emerald-600" />
            </div>
            <h1 className="text-xl font-bold text-foreground mt-4">Opportunity registered</h1>
            <p className="text-base font-medium text-foreground mt-1">{form.prospect_company}</p>

            <div className="mt-5 mx-auto max-w-md rounded-lg border border-border bg-muted/30 p-4 text-left">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-muted-foreground">Status</span>
                <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-800">
                  Pending Review
                </span>
              </div>
              <div className="mt-3 pt-3 border-t border-border/70">
                <div className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground font-semibold">
                  Next step
                </div>
                <p className="text-sm text-foreground mt-1 leading-snug">
                  WorldAML Partnerships will review your registration and confirm deal protection.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 justify-center mt-6">
              <Button className="h-10" onClick={() => navigate("/partner/deals")}>
                View my deals <ArrowRight className="ml-1.5 w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                className="h-10"
                onClick={() => {
                  setForm(EMPTY);
                  setErrors({});
                  setDone(false);
                }}
              >
                Register another opportunity
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-[880px] mx-auto space-y-6 pb-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Register a deal</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Register an opportunity for review, deal protection and commission eligibility.
        </p>
        <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground mt-2">
          <Clock className="w-3.5 h-3.5" /> Takes about 2 minutes.
        </p>
      </div>

      <Section number={1} title="Prospect" description="Tell us about the prospective customer.">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Company name" required error={errors.prospect_company} htmlFor="company">
            <Input
              id="company"
              className="h-10"
              value={form.prospect_company}
              onChange={(e) => set("prospect_company", e.target.value)}
              placeholder="Acme Financial Services"
              aria-invalid={!!errors.prospect_company}
            />
          </Field>
          <Field label="Country" required error={errors.prospect_country} htmlFor="country">
            <Input
              id="country"
              className="h-10"
              value={form.prospect_country}
              onChange={(e) => set("prospect_country", e.target.value)}
              placeholder="Cyprus"
              aria-invalid={!!errors.prospect_country}
            />
          </Field>
          <Field label="Website" error={errors.website} htmlFor="website">
            <Input
              id="website"
              className="h-10"
              value={form.website}
              onChange={(e) => set("website", e.target.value)}
              placeholder="https://company.com"
              aria-invalid={!!errors.website}
            />
          </Field>
          <Field label="Industry" htmlFor="industry">
            <Input
              id="industry"
              className="h-10"
              value={form.industry}
              onChange={(e) => set("industry", e.target.value)}
              placeholder="Fintech, gaming, banking…"
            />
          </Field>
        </div>
      </Section>

      <Section number={2} title="Contact" description="Who should we speak with?">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="First name" htmlFor="first_name">
            <Input
              id="first_name"
              className="h-10"
              value={form.first_name}
              onChange={(e) => set("first_name", e.target.value)}
              placeholder="Maria"
            />
          </Field>
          <Field label="Last name" htmlFor="last_name">
            <Input
              id="last_name"
              className="h-10"
              value={form.last_name}
              onChange={(e) => set("last_name", e.target.value)}
              placeholder="Georgiou"
            />
          </Field>
          <Field label="Job title" htmlFor="job_title">
            <Input
              id="job_title"
              className="h-10"
              value={form.job_title}
              onChange={(e) => set("job_title", e.target.value)}
              placeholder="Head of Compliance"
            />
          </Field>
          <Field label="Business email" error={errors.prospect_email} htmlFor="email">
            <Input
              id="email"
              type="email"
              className="h-10"
              value={form.prospect_email}
              onChange={(e) => set("prospect_email", e.target.value)}
              placeholder="name@company.com"
              aria-invalid={!!errors.prospect_email}
            />
          </Field>
          <Field label="Phone" htmlFor="phone">
            <Input
              id="phone"
              type="tel"
              className="h-10"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="+357 22 000000"
            />
          </Field>
        </div>
      </Section>

      <Section number={3} title="Opportunity" description="Tell us about the commercial opportunity.">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Interested solution" required error={errors.product}>
            <Select value={form.product} onValueChange={(v) => set("product", v)}>
              <SelectTrigger className="h-10" aria-invalid={!!errors.product}>
                <SelectValue placeholder="Select solution" />
              </SelectTrigger>
              <SelectContent>
                {PARTNER_PRODUCTS.map((p) => (
                  <SelectItem key={p.id} value={p.name}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field
            label="Estimated annual deal value (€)"
            error={errors.estimated_arr_eur}
            htmlFor="value"
          >
            <Input
              id="value"
              type="number"
              min={0}
              className="h-10"
              value={form.estimated_arr_eur}
              onChange={(e) => set("estimated_arr_eur", e.target.value)}
              placeholder="20000"
              aria-invalid={!!errors.estimated_arr_eur}
            />
          </Field>
          <Field label="Expected timing">
            <Select value={form.timing} onValueChange={(v) => set("timing", v)}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Select timing" />
              </SelectTrigger>
              <SelectContent>
                {TIMING.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>

        <div className="mt-4">
          <Field label="Requirements / notes" htmlFor="notes">
            <Textarea
              id="notes"
              rows={4}
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Current pain points, regulator, timelines, incumbent vendor…"
            />
          </Field>
        </div>

        {estCommission !== null && (
          <div className="mt-4 rounded-lg border border-teal/30 bg-teal/[0.06] p-4">
            <div className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground font-semibold">
              Estimated commission
            </div>
            <div className="text-2xl font-bold text-teal mt-1 tabular-nums">{eur(estCommission)}</div>
            <p className="text-xs text-muted-foreground mt-1.5">
              Based on {eur(Number(form.estimated_arr_eur))} estimated annual deal value ×{" "}
              {partner.commission_rate}% partner commission.
            </p>
            <p className="text-[11px] text-muted-foreground/80 mt-1.5">
              Final commission is subject to approval and programme terms.
            </p>
          </div>
        )}
      </Section>

      <div className="rounded-lg border border-border bg-muted/30 p-4 flex items-start gap-3">
        <ShieldCheck className="w-4 h-4 text-teal shrink-0 mt-0.5" />
        <div>
          <div className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground font-semibold">
            Deal protection
          </div>
          <p className="text-xs text-muted-foreground mt-1 leading-snug">
            Approved registrations may qualify for partner deal protection under the WorldAML Partner
            Programme.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <Button onClick={submit} disabled={submitting} className="h-11 px-6 w-full sm:w-auto">
          {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          Register Opportunity
        </Button>
        <p className="text-xs text-muted-foreground">
          Your partner account and submission date are attached automatically.
        </p>
      </div>

      <p className="text-xs text-muted-foreground">
        Prefer to review existing opportunities?{" "}
        <Link to="/partner/deals" className="text-teal hover:underline">
          Go to My deals
        </Link>
        .
      </p>
    </div>
  );
}

function Section({
  number,
  title,
  description,
  children,
}: {
  number: number;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="p-5 sm:p-6">
        <div className="flex items-start gap-3 pb-4 mb-5 border-b border-border">
          <div className="w-7 h-7 rounded-full bg-navy/10 text-navy text-xs font-bold flex items-center justify-center shrink-0">
            {number}
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground leading-tight">{title}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
          </div>
        </div>
        {children}
      </CardContent>
    </Card>
  );
}

function Field({
  label,
  children,
  required,
  error,
  htmlFor,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  error?: string;
  htmlFor?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor} className="text-xs font-medium text-foreground">
        {label}
        {required ? <span className="text-rose-600 ml-0.5">*</span> : (
          <span className="text-muted-foreground font-normal ml-1">(optional)</span>
        )}
      </Label>
      {children}
      {error && <p className="text-xs text-rose-600">{error}</p>}
    </div>
  );
}
