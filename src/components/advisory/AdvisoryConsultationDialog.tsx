import { useState } from "react";
import { z } from "zod";
// Submits through the submit-form edge function (direct inserts blocked by RLS).
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";

export const ADVISORY_SERVICES = [
  "Enterprise-Wide Risk Assessment",
  "Policies & Procedures",
  "AMLCO Reports",
  "AML Questionnaires from Regulators",
  "AML Internal Audit",
  "Monitoring Visits — Inspection Preparation",
  "MLRO & VMLRO Support",
] as const;

const schema = z.object({
  first_name: z.string().trim().min(1, "Required").max(80),
  last_name: z.string().trim().min(1, "Required").max(80),
  email: z.string().trim().email("Invalid email").max(255),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  company: z.string().trim().max(150).optional().or(z.literal("")),
  job_title: z.string().trim().max(120).optional().or(z.literal("")),
  country: z.string().trim().max(80).optional().or(z.literal("")),
  message: z.string().trim().max(2000).optional().or(z.literal("")),
});

type Props = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  defaultService?: string;
};

const AdvisoryConsultationDialog = ({ open, onOpenChange, defaultService }: Props) => {
  const [submitting, setSubmitting] = useState(false);
  const [selected, setSelected] = useState<string[]>(
    defaultService ? [defaultService] : [],
  );
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    company: "",
    job_title: "",
    country: "",
    message: "",
  });

  const toggle = (svc: string) =>
    setSelected((prev) =>
      prev.includes(svc) ? prev.filter((s) => s !== svc) : [...prev, svc],
    );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast({
        title: "Please check the form",
        description: parsed.error.issues[0]?.message ?? "Invalid input",
        variant: "destructive",
      });
      return;
    }
    if (selected.length === 0) {
      toast({
        title: "Select at least one service",
        description: "Choose the advisory services you're interested in.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from("form_submissions").insert({
      form_type: "advisory_consultation",
      first_name: parsed.data.first_name,
      last_name: parsed.data.last_name,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      company: parsed.data.company || null,
      job_title: parsed.data.job_title || null,
      country: parsed.data.country || null,
      message: parsed.data.message || null,
      products: selected,
      metadata: { source: "advisory_page", services: selected },
    });
    setSubmitting(false);

    if (error) {
      toast({
        title: "Something went wrong",
        description: "Please try again or email hello@worldaml.com.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Request received",
      description: "Our MLRO team will be in touch within one business day.",
    });
    onOpenChange(false);
    setForm({
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      company: "",
      job_title: "",
      country: "",
      message: "",
    });
    setSelected(defaultService ? [defaultService] : []);
  };

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Request a Consultation Quote</DialogTitle>
          <DialogDescription>
            Tell us a bit about your business and which advisory services you're
            interested in. Our MLROs will respond within one business day.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="adv-first">First name *</Label>
              <Input id="adv-first" value={form.first_name} onChange={update("first_name")} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="adv-last">Last name *</Label>
              <Input id="adv-last" value={form.last_name} onChange={update("last_name")} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="adv-email">Work email *</Label>
              <Input id="adv-email" type="email" value={form.email} onChange={update("email")} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="adv-phone">Phone</Label>
              <Input id="adv-phone" value={form.phone} onChange={update("phone")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="adv-company">Company</Label>
              <Input id="adv-company" value={form.company} onChange={update("company")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="adv-title">Job title</Label>
              <Input id="adv-title" value={form.job_title} onChange={update("job_title")} />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="adv-country">Country / jurisdiction</Label>
              <Input id="adv-country" placeholder="e.g. Cyprus, UK, UAE" value={form.country} onChange={update("country")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Preferred services *</Label>
            <div className="grid gap-2 rounded-lg border border-border/60 bg-muted/20 p-3 md:grid-cols-2">
              {ADVISORY_SERVICES.map((svc) => (
                <label
                  key={svc}
                  className="flex cursor-pointer items-start gap-2 rounded-md p-2 text-sm hover:bg-accent/10"
                >
                  <Checkbox
                    checked={selected.includes(svc)}
                    onCheckedChange={() => toggle(svc)}
                    className="mt-0.5"
                  />
                  <span>{svc}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="adv-message">How can we help?</Label>
            <Textarea
              id="adv-message"
              rows={4}
              placeholder="Your regulator, current framework, timelines, and anything else useful."
              value={form.message}
              onChange={update("message")}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} className="bg-accent text-accent-foreground hover:bg-accent/90">
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Request
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AdvisoryConsultationDialog;
