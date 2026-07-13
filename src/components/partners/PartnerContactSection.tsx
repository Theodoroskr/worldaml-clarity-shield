import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { getWebAttribution } from "@/lib/webAttribution";
import { supabase } from "@/integrations/supabase/client";

const partnerTypes = [
  { value: "referral", label: "Referral Partner (5%)" },
  { value: "affiliate", label: "Affiliate Partner (10%)" },
  { value: "reseller", label: "Reseller Partner (15%)" },
  { value: "technology", label: "Technology / Integration Partner" },
  { value: "not-sure", label: "Not sure yet — advise me" },
];

const PartnerContactSection = () => {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    website: "",
    jobTitle: "",
    partnerType: "referral",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.firstName.trim() || !form.lastName.trim()) {
      toast({ title: "Missing information", description: "Please enter your first and last name.", variant: "destructive" });
      return;
    }
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      toast({ title: "Invalid email", description: "Please enter a valid work email.", variant: "destructive" });
      return;
    }
    if (!form.company.trim()) {
      toast({ title: "Missing information", description: "Please enter your company name.", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/submit-form`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({
            form_type: "partner-contact",
            first_name: form.firstName,
            last_name: form.lastName,
            email: form.email,
            company: form.company,
            job_title: form.jobTitle,
            message: form.message,
            products: ["partnership"],
            metadata: {
              partner_type: form.partnerType,
              website: form.website,
              attribution: getWebAttribution(),
            },
          }),
        },
      );

      if (!response.ok) throw new Error("Submission failed");

      // Fire-and-forget partner invite email
      supabase.functions
        .invoke("send-partner-invite-email", {
          body: {
            to: form.email,
            name: `${form.firstName} ${form.lastName}`.trim(),
            context: `Thanks for your interest in the WorldAML Partner Program${
              form.company ? ` on behalf of ${form.company}` : ""
            }.`,
            source: "partners-page-form",
          },
        })
        .catch((err) => console.warn("Partner invite email failed (non-blocking):", err));

      toast({
        title: "Request submitted",
        description: "Our partnerships team will be in touch within 1–2 business days.",
      });

      setForm({
        firstName: "",
        lastName: "",
        email: "",
        company: "",
        website: "",
        jobTitle: "",
        partnerType: "referral",
        message: "",
      });
    } catch {
      toast({ title: "Error", description: "Something went wrong. Please try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="partner-contact" className="section-padding bg-surface-subtle">
      <div className="container-enterprise">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-navy text-3xl md:text-4xl font-bold mb-3">
              Talk to our Partnerships Team
            </h2>
            <p className="text-text-secondary text-lg">
              Tell us about your business and how you'd like to partner with WorldAML.
              We reply to every application within 48 business hours.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-6 bg-background border border-divider rounded-xl p-6 md:p-8 shadow-sm"
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="p-firstName">First Name <span className="text-red-500">*</span></Label>
                <Input id="p-firstName" name="firstName" value={form.firstName} onChange={handleChange} placeholder="John" maxLength={100} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="p-lastName">Last Name <span className="text-red-500">*</span></Label>
                <Input id="p-lastName" name="lastName" value={form.lastName} onChange={handleChange} placeholder="Smith" maxLength={100} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="p-email">Work Email <span className="text-red-500">*</span></Label>
              <Input id="p-email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="john@company.com" maxLength={255} />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="p-company">Company <span className="text-red-500">*</span></Label>
                <Input id="p-company" name="company" value={form.company} onChange={handleChange} placeholder="Acme Consulting" maxLength={200} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="p-website">Website</Label>
                <Input id="p-website" name="website" type="url" value={form.website} onChange={handleChange} placeholder="https://" maxLength={500} />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="p-jobTitle">Job Title</Label>
                <Input id="p-jobTitle" name="jobTitle" value={form.jobTitle} onChange={handleChange} placeholder="Managing Partner" maxLength={100} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="p-partnerType">Partner Type</Label>
                <Select
                  value={form.partnerType}
                  onValueChange={(v) => setForm((prev) => ({ ...prev, partnerType: v }))}
                >
                  <SelectTrigger id="p-partnerType"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {partnerTypes.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="p-message">How do you plan to refer clients?</Label>
              <Textarea
                id="p-message"
                name="message"
                value={form.message}
                onChange={handleChange}
                rows={4}
                maxLength={1000}
                placeholder="Tell us about your client base, target markets, and how you'd like to work with WorldAML."
              />
              <p className="text-caption text-text-tertiary">{form.message.length}/1000 characters</p>
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={submitting}>
              {submitting ? "Submitting..." : (<>Submit Partner Enquiry <Send className="ml-2 h-4 w-4" /></>)}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default PartnerContactSection;
