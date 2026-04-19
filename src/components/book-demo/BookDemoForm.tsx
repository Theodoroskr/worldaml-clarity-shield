import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { calculateLeadScore, isFreeEmail, type BookDemoLead } from "@/lib/leadScoring";
import { CheckCircle2, Loader2 } from "lucide-react";

const schema = z.object({
  first_name: z.string().trim().min(1, "Required").max(100),
  last_name: z.string().trim().min(1, "Required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  company: z.string().trim().min(1, "Required").max(200),
  jurisdiction: z.string().trim().min(1, "Required").max(100),
  message: z.string().trim().max(1000).optional(),
});

const USE_CASES = [
  { id: "aml", label: "AML Screening (Sanctions, PEP, Adverse Media)" },
  { id: "kyc", label: "KYC / KYB Onboarding" },
  { id: "tm", label: "Transaction Monitoring" },
  { id: "reporting", label: "Regulatory Reporting (SAR/STR/CTR)" },
];

const BookDemoForm = () => {
  const [searchParams] = useSearchParams();
  const sourcePage = searchParams.get("source") || "book-demo";
  const productPrefill = searchParams.get("product") || "";

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [emailWarning, setEmailWarning] = useState(false);

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    company: "",
    job_title: "",
    jurisdiction: "",
    industry: "fintech" as BookDemoLead["industry"],
    company_size: "11-50" as BookDemoLead["companySize"],
    role: "compliance" as BookDemoLead["role"],
    volume: "1k_10k" as BookDemoLead["volume"],
    use_cases: productPrefill ? [productPrefill] : (["aml"] as string[]),
    message: "",
  });

  const update = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const toggleUseCase = (id: string) => {
    setForm((f) => ({
      ...f,
      use_cases: f.use_cases.includes(id) ? f.use_cases.filter((x) => x !== id) : [...f.use_cases, id],
    }));
  };

  const onEmailBlur = () => {
    setEmailWarning(form.email.length > 0 && isFreeEmail(form.email));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check the form");
      return;
    }
    if (form.use_cases.length === 0) {
      toast.error("Pick at least one use case");
      return;
    }

    setSubmitting(true);

    const { score, tier, breakdown } = calculateLeadScore({
      email: form.email,
      company: form.company,
      companySize: form.company_size,
      industry: form.industry,
      jurisdiction: form.jurisdiction,
      role: form.role,
      useCases: form.use_cases,
      volume: form.volume,
    });

    try {
      const { error } = await supabase.functions.invoke("submit-form", {
        body: {
          form_type: "book_demo",
          first_name: form.first_name,
          last_name: form.last_name,
          email: form.email,
          phone: form.phone,
          company: form.company,
          job_title: form.job_title,
          country: form.jurisdiction,
          industry: form.industry,
          message: form.message,
          products: form.use_cases,
          metadata: {
            source_page: sourcePage,
            product_prefill: productPrefill,
            company_size: form.company_size,
            role: form.role,
            volume: form.volume,
            jurisdiction: form.jurisdiction,
            lead_score: score,
            lead_tier: tier,
            score_breakdown: breakdown,
          },
        },
      });

      if (error) throw error;

      setSubmitted(true);
      toast.success("Thanks! Our team will reach out within one business day.");
    } catch (err: any) {
      toast.error(err?.message ?? "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="rounded-xl border border-divider bg-white p-8 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-teal" />
        <h3 className="mt-4 text-2xl font-bold text-navy">You're on the list</h3>
        <p className="mt-2 text-text-secondary">
          A WorldAML specialist will reach out within one business day to schedule your demo.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="rounded-xl border border-divider bg-white p-6 md:p-8 space-y-5">
      <div>
        <h3 className="text-2xl font-bold text-navy">Book your Suite demo</h3>
        <p className="mt-1 text-sm text-text-secondary">
          A 30-minute walkthrough tailored to your stack and regulator.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="first_name">First name *</Label>
          <Input id="first_name" value={form.first_name} onChange={(e) => update("first_name", e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="last_name">Last name *</Label>
          <Input id="last_name" value={form.last_name} onChange={(e) => update("last_name", e.target.value)} required />
        </div>
      </div>

      <div>
        <Label htmlFor="email">Work email *</Label>
        <Input
          id="email"
          type="email"
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
          onBlur={onEmailBlur}
          required
        />
        {emailWarning && (
          <p className="mt-1 text-xs text-destructive">
            Please use a work email — we prioritize demos for company addresses.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="company">Company *</Label>
          <Input id="company" value={form.company} onChange={(e) => update("company", e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="job_title">Job title</Label>
          <Input id="job_title" value={form.job_title} onChange={(e) => update("job_title", e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label>Company size *</Label>
          <Select value={form.company_size} onValueChange={(v) => update("company_size", v as any)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="1-10">1–10 employees</SelectItem>
              <SelectItem value="11-50">11–50 employees</SelectItem>
              <SelectItem value="51-200">51–200 employees</SelectItem>
              <SelectItem value="200+">200+ employees</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Industry *</Label>
          <Select value={form.industry} onValueChange={(v) => update("industry", v as any)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="bank">Bank</SelectItem>
              <SelectItem value="fintech">Fintech</SelectItem>
              <SelectItem value="crypto">Crypto / VASP</SelectItem>
              <SelectItem value="igaming">iGaming</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="jurisdiction">Regulator / jurisdiction *</Label>
          <Input
            id="jurisdiction"
            placeholder="e.g. CySEC, MFSA, FCA, FinCEN"
            value={form.jurisdiction}
            onChange={(e) => update("jurisdiction", e.target.value)}
            required
          />
        </div>
        <div>
          <Label>Your role *</Label>
          <Select value={form.role} onValueChange={(v) => update("role", v as any)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="mlro">MLRO</SelectItem>
              <SelectItem value="compliance">Compliance Officer</SelectItem>
              <SelectItem value="cto">CTO / Head of Eng</SelectItem>
              <SelectItem value="founder">Founder / CEO</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label>Monthly screening volume *</Label>
        <Select value={form.volume} onValueChange={(v) => update("volume", v as any)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="lt_1k">Less than 1,000</SelectItem>
            <SelectItem value="1k_10k">1,000 – 10,000</SelectItem>
            <SelectItem value="10k_100k">10,000 – 100,000</SelectItem>
            <SelectItem value="gt_100k">100,000+</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="block mb-2">What do you want to see? *</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {USE_CASES.map((uc) => (
            <label key={uc.id} className="flex items-start gap-2 rounded-md border border-divider p-3 cursor-pointer hover:bg-secondary/40">
              <Checkbox
                checked={form.use_cases.includes(uc.id)}
                onCheckedChange={() => toggleUseCase(uc.id)}
                className="mt-0.5"
              />
              <span className="text-sm text-navy">{uc.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="message">Anything else? (optional)</Label>
        <Textarea
          id="message"
          value={form.message}
          onChange={(e) => update("message", e.target.value)}
          placeholder="Current pain points, integration timeline, etc."
          rows={3}
        />
      </div>

      <Button type="submit" variant="accent" size="lg" className="w-full" disabled={submitting}>
        {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting…</> : "Request my demo"}
      </Button>

      <p className="text-xs text-text-secondary text-center">
        No spam. We'll only contact you about your demo request.
      </p>
    </form>
  );
};

export default BookDemoForm;
