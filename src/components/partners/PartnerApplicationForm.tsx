import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { getWebAttribution } from "@/lib/webAttribution";

const PartnerApplicationForm = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsError, setTermsError] = useState<string | null>(null);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [form, setForm] = useState({
    company_name: "",
    website: "",
    partner_type: "referral" as "referral" | "affiliate" | "reseller" | "technology",
    description: "",
    contact_name: "",
    contact_email: "",
    contact_phone: "",
    country: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!form.company_name.trim()) { toast.error("Company name is required"); return; }
    if (!form.contact_name.trim()) { toast.error("Your name is required"); return; }
    if (!form.contact_email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contact_email.trim())) {
      toast.error("A valid contact email is required"); return;
    }
    if (!termsAccepted) {
      setTermsError(
        "You must accept the Terms & Conditions and Privacy Policy before submitting your application.",
      );
      toast.error("Please accept the Terms & Conditions and Privacy Policy to submit your application.");
      return;
    }
    setTermsError(null);
    const consentTimestamp = new Date().toISOString();


    setLoading(true);
    const { data: inserted, error } = await supabase.from("partner_applications").insert({
      user_id: user.id,
      company_name: form.company_name.trim(),
      website: form.website.trim() || null,
      partner_type: form.partner_type,
      description: form.description.trim() || null,
      contact_name: form.contact_name.trim() || null,
      contact_email: form.contact_email.trim().toLowerCase() || null,
      contact_phone: form.contact_phone.trim() || null,
      country: form.country.trim() || null,
    } as any).select("id").maybeSingle();

    if (error) {
      toast.error("Failed to submit application. Please try again.");
      console.error(error);
    } else {
      setSubmitted(true);
      toast.success("Application submitted!");
      // Fire-and-forget notifications (admin alert + applicant thank-you)
      if (inserted?.id) {
        supabase.functions
          .invoke("notify-partner-application", { body: { application_id: inserted.id } })
          .catch((e) => console.error("notify-partner-application failed:", e));
      }
      // Fire-and-forget CRM lead creation (Zoho: Form Type = Partner Request,
      // Topic = Partnership, plus lead-source & visit-summary attribution).
      const nameParts = form.contact_name.trim().split(/\s+/);
      supabase.functions
        .invoke("submit-form", {
          body: {
            form_type: "partner-application",
            first_name: nameParts[0] || form.company_name.trim(),
            last_name: nameParts.slice(1).join(" ") || "-",
            email: form.contact_email.trim().toLowerCase(),
            phone: form.contact_phone.trim() || undefined,
            company: form.company_name.trim(),
            country: form.country.trim() || undefined,
            message: form.description.trim() || undefined,
            products: ["partnership"],
            metadata: {
              partner_type: form.partner_type,
              website: form.website.trim() || undefined,
              application_id: inserted?.id,
              attribution: getWebAttribution(),
              terms_accepted: true,
              terms_accepted_at: consentTimestamp,
              marketing_consent: marketingConsent,
              marketing_consent_at: marketingConsent ? consentTimestamp : null,
              consent_timestamp: consentTimestamp,
              consent_text:
                "I accept the Terms & Conditions and the Privacy Policy." +
                (marketingConsent
                  ? " I'd like to receive marketing communications about WorldAML products, events and regulatory updates."
                  : ""),

            },
          },
        })
        .catch((e) => console.error("submit-form (partner) failed:", e));
    }
    setLoading(false);
  };

  if (submitted) {
    return (
      <Card className="max-w-lg mx-auto border-divider">
        <CardContent className="pt-12 pb-12 text-center">
          <CheckCircle className="h-12 w-12 text-teal mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-navy mb-2">Application Submitted</h3>
          <p className="text-text-secondary">We'll review your application and get back to you within 48 hours.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-lg mx-auto border-divider">
      <CardHeader>
        <CardTitle className="text-navy">Partner Application</CardTitle>
        <CardDescription>Tell us about your business and how you'd like to partner.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label htmlFor="company_name">Company Name *</Label>
            <Input id="company_name" value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} required maxLength={200} />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contact_name">Your Name *</Label>
              <Input id="contact_name" value={form.contact_name} onChange={(e) => setForm({ ...form, contact_name: e.target.value })} required maxLength={120} />
            </div>
            <div>
              <Label htmlFor="contact_email">Contact Email *</Label>
              <Input id="contact_email" type="email" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} required maxLength={255} />
            </div>
            <div>
              <Label htmlFor="contact_phone">Phone</Label>
              <Input id="contact_phone" type="tel" value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} maxLength={40} />
            </div>
            <div>
              <Label htmlFor="country">Country</Label>
              <Input id="country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} maxLength={80} />
            </div>
          </div>
          <div>
            <Label htmlFor="website">Website</Label>
            <Input id="website" type="url" placeholder="https://" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} maxLength={500} />
          </div>
          <div>
            <Label htmlFor="partner_type">Partner Type *</Label>
            <Select value={form.partner_type} onValueChange={(v) => setForm({ ...form, partner_type: v as any })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="referral">Referral Partner (5%)</SelectItem>
                <SelectItem value="affiliate">Affiliate Partner (10%)</SelectItem>
                <SelectItem value="reseller">Referral Partner (15%)</SelectItem>
                <SelectItem value="technology">Technology / Integration Partner</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="description">How do you plan to refer clients?</Label>
            <Textarea id="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} maxLength={2000} />
          </div>
          <div className="space-y-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <Checkbox
                checked={termsAccepted}
                onCheckedChange={(v) => {
                  setTermsAccepted(v === true);
                  if (v === true) setTermsError(null);
                }}
                aria-invalid={!!termsError}
                className="mt-0.5"
              />
              <span className="text-body-sm text-text-secondary">
                I accept the{" "}
                <Link to="/terms" className="text-teal hover:underline" target="_blank">Terms &amp; Conditions</Link>{" "}
                and the{" "}
                <Link to="/privacy" className="text-teal hover:underline" target="_blank">Privacy Policy</Link>
                . <span className="text-red-500">*</span>
              </span>
            </label>
            {termsError && (
              <p role="alert" className="text-body-sm text-destructive">{termsError}</p>
            )}
            <label className="flex items-start gap-3 cursor-pointer">
              <Checkbox
                checked={marketingConsent}
                onCheckedChange={(v) => setMarketingConsent(v === true)}
                className="mt-0.5"
              />
              <span className="text-body-sm text-text-secondary">
                I'd like to receive marketing communications about WorldAML products,
                events and regulatory updates. (Optional.)
              </span>
            </label>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>

            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Submit Application
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default PartnerApplicationForm;
